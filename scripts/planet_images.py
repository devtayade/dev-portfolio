#!/usr/bin/env python3
"""Little Planet: human-in-the-loop image pipeline.

Source of truth: docs/plans/assets/planet/PROMPTS.md (parsed, never edited).

This script manages prompts, dependencies, filenames, validation, approvals
and QA checkpoints. It does NOT generate images: a human generates each image
by hand in ChatGPT. The `go` command assists: it copies the prompt, opens
ChatGPT, stages the attachments and imports the downloaded image. It never approves
anything on its own; approval and checkpoint sign-off are explicit human
commands.

Standard library only. Pillow is used to decode PNGs faster if it happens to
be installed; otherwise a built-in decoder is used.

Run `python scripts/planet_images.py --help` for the command list, and see
docs/plans/assets/planet/workflow/README.md for the full workflow.
"""

from __future__ import annotations

import argparse
import contextlib
import datetime as dt
import hashlib
import io
import json
import math
import os
import re
import shutil
import struct
import subprocess
import sys
import time
import zlib
from pathlib import Path

SCHEMA_VERSION = 1
BASE_REL = Path("docs/plans/assets/planet")
SCRIPT = "python scripts/planet_images.py"

STATUSES = (
    "blocked",
    "ready",
    "prompt_prepared",
    "awaiting_image",
    "received",
    "needs_review",
    "approved",
    "failed",
)
# Assets in these states are "in flight": only one image is worked on at a time.
ACTIVE = ("prompt_prepared", "awaiting_image", "received", "needs_review", "failed")

KEYS = {"magenta": (255, 0, 255), "green": (0, 255, 0)}
KEY_HEX = {"magenta": "#FF00FF", "green": "#00FF00"}

# Validation tolerances. Generated PNGs are never pixel-perfect: anti-aliased
# edges, faint noise and soft halos are expected, so every colour check uses a
# distance threshold and a coverage fraction instead of exact matches.
RATIO_TOLERANCE = 0.03  # relative difference still counted as the same ratio
KEY_MATCH_DIST = 90.0  # RGB distance at which a pixel still counts as the key colour
KEY_FLAT_DIST = 24.0  # RGB distance at which a key pixel counts as "flat"
BG_PASS = 0.90  # fraction of the background region that must be key colour
BG_FAIL = 0.50  # below this fraction the background is not the key colour at all
FLAT_PASS = 0.95  # fraction of key pixels that must be flat
KEY_MIN_PRESENT = 0.02  # fraction of the whole image that must be key colour
ART_MIN = 0.01  # fraction of the image that must be artwork (non-key)
FULLBLEED_KEY_MAX = 0.01  # full-bleed images: max fraction that looks like a key colour
BLANK_STD = 3.0  # luminance std-dev below which an image is considered blank


class CliError(Exception):
    """A user-facing error: printed without a traceback."""


class ParseError(CliError):
    pass


class PngError(Exception):
    pass


def now() -> str:
    return dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha256_file(path: Path) -> str:
    return sha256_bytes(path.read_bytes())


# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------


class Paths:
    def __init__(self, root: Path):
        self.root = Path(root).resolve()
        self.base = self.root / BASE_REL
        self.prompts = self.base / "PROMPTS.md"
        self.style = self.base / "style"
        self.incoming = self.base / "incoming"
        self.approved = self.base / "approved"
        self.rejected = self.base / "rejected"
        self.workflow = self.base / "workflow"
        self.manifest = self.workflow / "manifest.json"
        self.next_prompt = self.workflow / "next-prompt.md"
        self.audit = self.workflow / "audit.jsonl"
        self.exports = self.workflow / "exports"

    def rel(self, p: Path | str) -> str:
        p = Path(p)
        if not p.is_absolute():
            p = self.root / p
        try:
            return p.resolve().relative_to(self.root).as_posix()
        except ValueError:
            return p.as_posix()

    def abs(self, rel: str) -> Path:
        return self.root / rel

    def ensure_dirs(self) -> None:
        for d in (self.incoming, self.approved, self.rejected, self.workflow):
            d.mkdir(parents=True, exist_ok=True)


# ---------------------------------------------------------------------------
# PROMPTS.md parser
# ---------------------------------------------------------------------------

ID_PAT = r"[A-H]\d{1,2}"
HEADER_RE = re.compile(
    rf"^(?P<id>{ID_PAT}) — (?P<title>.*?)(?:\s+\(ATTACH: (?P<attach>[^)]*)\))?\s*$"
)
RANGE_RE = re.compile(rf"^(?P<start>{ID_PAT}) to (?P<end>{ID_PAT}) — (?P<title>.+?)\s*$")
STEP_RE = re.compile(r"^STEP (?P<letter>[A-Z]) — (?P<title>.+?)\s*$")
ATTACH_RE = re.compile(r"^ATTACH: (?P<attach>.+?)\s*$")
FROM_RE = re.compile(rf"\b({ID_PAT}) from ({ID_PAT})\b")
RATIO_RE = re.compile(r"\b(\d{1,2}):(\d{1,2})\b")
SAME_SIZE_RE = re.compile(r"\bsame (?:size|everything|shapes)\b", re.IGNORECASE)
HOWTO_ITEM_RE = re.compile(r"^(\d+)\. (.*)$")
BLOCK_MARK = "---8<---"


def id_key(asset_id: str) -> tuple[str, int]:
    return asset_id[0], int(asset_id[1:])


def expand_range(start: str, end: str) -> list[str]:
    if start[0] != end[0] or id_key(start)[1] > id_key(end)[1]:
        raise ParseError(f"invalid range {start} to {end}")
    return [f"{start[0]}{n}" for n in range(id_key(start)[1], id_key(end)[1] + 1)]


def parse_prompts(text: str) -> dict:
    """Parse PROMPTS.md into assets, checkpoints and reference notes.

    The parser is strict: anything it does not recognise in a structural
    position is an error, so a change to PROMPTS.md can never be silently
    misread. Prompt text is stored exactly as written between the ---8<---
    markers.
    """
    lines = text.split("\n")
    assets: list[dict] = []
    by_id: dict[str, dict] = {}
    checkpoints: list[dict] = []
    steps: dict[str, dict] = {}
    howto: dict[str, str] = {}
    preamble: dict[str, list[str]] = {"total": [], "key_colours": []}
    pending: list[dict] = []  # assets waiting for their prompt block
    group: dict | None = None  # an "X to Y" range header waiting for its ATTACH line
    collecting_map = False
    in_block = False
    block: list[str] = []
    block_start = 0
    step: str | None = None
    step_notes_open = False
    checklist: list[str] | None = None
    section = "intro"
    howto_last: str | None = None

    def add_asset(aid, title, line_no, attach=None, derived_from=None, group_title=None):
        if aid in by_id:
            raise ParseError(f"line {line_no}: duplicate asset ID {aid}")
        if step is None:
            raise ParseError(f"line {line_no}: asset {aid} appears before any STEP heading")
        a = {
            "id": aid,
            "title": title,
            "step": step,
            "source_line": line_no,
            "attach_line": attach,
            "derived_from": derived_from,
            "group_title": group_title,
            "prompt": None,
        }
        assets.append(a)
        by_id[aid] = a
        pending.append(a)
        return a

    for idx, line in enumerate(lines):
        line_no = idx + 1
        s = line.strip()

        if in_block:
            if s == BLOCK_MARK:
                in_block = False
                prompt = "\n".join(block).strip("\n")
                if not prompt:
                    raise ParseError(f"line {block_start}: empty prompt block")
                if not pending:
                    raise ParseError(f"line {block_start}: prompt block without an asset header")
                for a in pending:
                    if a["attach_line"] is None:
                        raise ParseError(f"line {a['source_line']}: {a['id']} has no ATTACH line")
                    a["prompt"] = prompt
                pending = []
                group = None
            else:
                block.append(line)
            continue

        if checklist is not None:
            checklist.append(line)
            continue

        if s == BLOCK_MARK:
            if collecting_map or (group is not None and not pending):
                raise ParseError(f"line {line_no}: prompt block before the group's ATTACH line")
            in_block = True
            block = []
            block_start = line_no
            continue

        if s == "CHECKLIST":
            checklist = []
            continue

        if s == "HOW TO USE THIS FILE":
            section = "howto"
            continue
        if s.startswith("KEY COLOURS"):
            section = "key_colours"
            continue
        if s.startswith("THE STYLE"):
            section = "style"
            continue

        m = STEP_RE.match(s)
        if m:
            step = m["letter"]
            steps[step] = {"title": m["title"], "notes": []}
            step_notes_open = True
            section = "steps"
            continue

        if section == "howto":
            hm = HOWTO_ITEM_RE.match(s)
            if hm:
                howto_last = hm[1]
                howto[howto_last] = hm[2]
            elif s.startswith("Total:"):
                preamble["total"].append(s)
                howto_last = None
            elif s and howto_last and line.startswith(" ") and not s.startswith("---"):
                howto[howto_last] += "\n" + s
            continue
        if section == "key_colours":
            if not s or s.startswith("---"):
                continue
            if s.startswith("- ") or not preamble["key_colours"]:
                preamble["key_colours"].append(s)
            else:
                if preamble["key_colours"][-1].startswith("- ") and line.startswith(" "):
                    preamble["key_colours"][-1] += " " + s  # wrapped bullet
                else:
                    preamble["key_colours"].append(s)
            continue
        if section != "steps":
            continue

        if s.startswith(">>> STOP"):
            text_lines = [s]
            j = idx + 1
            while j < len(lines) and lines[j].startswith(" ") and lines[j].strip():
                text_lines.append(lines[j].strip())
                j += 1
            full = " ".join(text_lines)
            sm = re.search(r"send (.+?) to Claude", full)
            if not sm or not assets:
                raise ParseError(f"line {line_no}: cannot read STOP point: {s}")
            listed = re.findall(rf"\b{ID_PAT}\b", sm.group(1))
            later = [x for x in re.findall(rf"\b{ID_PAT}\b", full[sm.end():]) if x not in listed]
            purpose = re.search(r"\(([^)]*)\)\s*\.?\s*$", s)
            after = assets[-1]["id"]
            checkpoints.append(
                {
                    "id": f"STOP-{after}",
                    "after": after,
                    "source_line": line_no,
                    "assets": listed,
                    "conditional_assets": later,
                    "purpose": purpose.group(1) if purpose else None,
                    "text": full,
                }
            )
            continue

        m = RANGE_RE.match(s)
        if m:
            if pending:
                raise ParseError(f"line {line_no}: new header while {pending[0]['id']} has no prompt")
            group = {
                "ids": expand_range(m["start"], m["end"]),
                "title": m["title"],
                "map_text": "",
                "line": line_no,
            }
            step_notes_open = False
            continue

        if s.startswith("For each"):
            if group is None:
                raise ParseError(f"line {line_no}: 'For each' outside a range header")
            collecting_map = True
            group["map_text"] = s
            continue

        m = ATTACH_RE.match(s)
        if m:
            if group is not None and collecting_map:
                collecting_map = False
                mapping = dict(FROM_RE.findall(group["map_text"]))
                if list(mapping) != group["ids"]:
                    raise ParseError(
                        f"line {group['line']}: 'For each' mapping {list(mapping)} does not "
                        f"match range {group['ids']}"
                    )
                for aid in group["ids"]:
                    add_asset(
                        aid,
                        f"{group['title']} — {aid} from {mapping[aid]}",
                        group["line"],
                        attach=m["attach"],
                        derived_from=mapping[aid],
                        group_title=group["title"],
                    )
            else:
                targets = [a for a in pending if a["attach_line"] is None]
                if not targets:
                    raise ParseError(f"line {line_no}: ATTACH line without an asset header")
                for a in targets:
                    a["attach_line"] = m["attach"]
            continue

        if collecting_map:
            if s:
                group["map_text"] += " " + s
            continue

        m = HEADER_RE.match(s)
        if m:
            if group is not None:
                raise ParseError(f"line {line_no}: header inside range group {group['ids']}")
            add_asset(m["id"], m["title"], line_no, attach=m["attach"])
            step_notes_open = False
            continue

        if step_notes_open and s and not s.startswith("====="):
            steps[step]["notes"].append(s)

    if in_block:
        raise ParseError(f"line {block_start}: unterminated prompt block")
    if pending:
        raise ParseError(f"{pending[0]['id']} has no prompt block")
    if checklist is None:
        raise ParseError("CHECKLIST section not found")

    checklist_text = "\n".join(checklist)
    checklist_ids = re.findall(rf"\b{ID_PAT}\b", checklist_text)
    optional_ids = set(re.findall(rf"\(({ID_PAT}) only if asked\)", checklist_text))
    parsed_ids = [a["id"] for a in assets]
    if sorted(checklist_ids, key=id_key) != sorted(parsed_ids, key=id_key):
        missing = sorted(set(checklist_ids) - set(parsed_ids), key=id_key)
        extra = sorted(set(parsed_ids) - set(checklist_ids), key=id_key)
        raise ParseError(f"CHECKLIST mismatch: missing prompts {missing}, not in checklist {extra}")

    for order, a in enumerate(assets):
        a["order"] = order
        a["optional"] = a["id"] in optional_ids or "only if Claude asks" in a["title"]
        _resolve_attachments(a, by_id)
        _derive_requirements(a)

    for cp in checkpoints:
        for aid in cp["assets"] + cp["conditional_assets"]:
            if aid not in by_id:
                raise ParseError(f"{cp['id']} names unknown asset {aid}")
        cp["position"] = by_id[cp["after"]]["order"]

    return {
        "assets": assets,
        "checkpoints": checkpoints,
        "steps": steps,
        "how_to_use": howto,
        "total_line": " ".join(preamble["total"]),
        "key_colours": preamble["key_colours"],
    }


def _resolve_attachments(a: dict, by_id: dict) -> None:
    tokens = [t.strip() for t in a["attach_line"].split(",")]
    tokens = [re.sub(r"^and\s+", "", t) for t in tokens if t]
    attachments = []
    for t in tokens:
        if t.startswith("style/") and t.endswith(".png"):
            attachments.append({"token": t, "kind": "style", "path": (BASE_REL / t).as_posix()})
            continue
        m = re.fullmatch(rf"({ID_PAT})\.png", t)
        if m:
            dep = m.group(1)
        elif t.startswith("the ") and a["derived_from"]:
            dep = a["derived_from"]  # "the night piece" / "the closed-door version" ...
        else:
            raise ParseError(f"{a['id']}: cannot resolve attachment {t!r}")
        if dep not in by_id:
            raise ParseError(f"{a['id']}: attachment {t!r} names unknown asset {dep}")
        if dep == a["id"] or "order" not in by_id[dep]:  # orders are assigned in document order
            raise ParseError(f"{a['id']}: depends on itself or on a later asset ({dep})")
        attachments.append(
            {"token": t, "kind": "asset", "id": dep, "path": (BASE_REL / "approved" / f"{dep}.png").as_posix()}
        )
    a["attachments"] = attachments
    a["dependencies"] = [x["id"] for x in attachments if x["kind"] == "asset"]
    a["references"] = [x["path"] for x in attachments if x["kind"] == "style"]


def _derive_requirements(a: dict) -> None:
    p = a["prompt"]
    ratios = sorted({f"{x}:{y}" for x, y in RATIO_RE.findall(p)})
    if len(ratios) > 1:
        raise ParseError(f"{a['id']}: several aspect ratios in prompt: {ratios}")
    a["ratio"] = ratios[0] if ratios else None
    a["ratio_source"] = "stated in prompt" if ratios else None
    a["size_rule"] = None
    if not ratios and a["dependencies"] and SAME_SIZE_RE.search(p):
        a["size_rule"] = {"same_as": a["dependencies"][0]}
        a["ratio_source"] = f"prompt asks for the same size as the first attachment ({a['dependencies'][0]})"
    if not ratios and not a["size_rule"]:
        a["ratio_source"] = "not specified in PROMPTS.md"

    has_m, has_g = "#FF00FF" in p, "#00FF00" in p
    if has_m and has_g:
        raise ParseError(f"{a['id']}: prompt names both key colours")
    a["key_color"] = "magenta" if has_m else "green" if has_g else None
    a["key_hex"] = KEY_HEX.get(a["key_color"]) if a["key_color"] else None

    if a["key_color"] is None:
        a["key_region"] = None
        a["key_region_rationale"] = "no chroma key in prompt: the image is full-bleed artwork"
    elif a["id"] == "G5":
        a["key_region"] = "corners"
        a["key_region_rationale"] = (
            "a perfect circle filling most of a square image: only the corners are guaranteed background"
        )
    elif a["step"] in ("C", "D"):
        a["key_region"] = "top"
        a["key_region_rationale"] = "the strip reaches the bottom edge; everything above it is key colour"
    elif a["step"] == "E":
        a["key_region"] = "top_and_upper_sides"
        a["key_region_rationale"] = (
            "the building stands on a strip of path at the bottom edge; everything else is key colour"
        )
    else:
        a["key_region"] = "all_edges"
        a["key_region_rationale"] = "separate objects or figures spaced apart on a flat key background"

    a["continuation_of"] = (
        a["dependencies"][0] if p.startswith("Continue the attached") and a["dependencies"] else None
    )
    a["prompt_sha256"] = sha256_bytes(p.encode("utf-8"))


# ---------------------------------------------------------------------------
# PNG reading (stdlib) and pixel access
# ---------------------------------------------------------------------------

PNG_SIG = b"\x89PNG\r\n\x1a\n"
_CHANNELS = {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}
_DEPTHS = {0: (1, 2, 4, 8, 16), 2: (8, 16), 3: (1, 2, 4, 8), 4: (8, 16), 6: (8, 16)}


def read_png_chunks(data: bytes) -> list[tuple[bytes, bytes]]:
    if data[:8] != PNG_SIG:
        raise PngError("not a PNG file (bad signature)")
    pos, chunks = 8, []
    while pos < len(data):
        if pos + 8 > len(data):
            raise PngError("truncated chunk header (file cut off)")
        length, ctype = struct.unpack(">I4s", data[pos:pos + 8])
        end = pos + 12 + length
        if end > len(data):
            raise PngError(f"truncated {ctype.decode('latin-1')} chunk (file cut off)")
        body = data[pos + 8:pos + 8 + length]
        (crc,) = struct.unpack(">I", data[pos + 8 + length:end])
        if zlib.crc32(ctype + body) & 0xFFFFFFFF != crc:
            raise PngError(f"CRC mismatch in {ctype.decode('latin-1')} chunk (file corrupted)")
        chunks.append((ctype, body))
        pos = end
        if ctype == b"IEND":
            break
    if not chunks or chunks[0][0] != b"IHDR":
        raise PngError("missing IHDR chunk")
    if chunks[-1][0] != b"IEND":
        raise PngError("missing IEND chunk (file truncated)")
    return chunks


def png_info(chunks: list[tuple[bytes, bytes]]) -> dict:
    ihdr = chunks[0][1]
    if len(ihdr) != 13:
        raise PngError("malformed IHDR chunk")
    w, h, bd, ct, comp, filt, interlace = struct.unpack(">IIBBBBB", ihdr)
    if w == 0 or h == 0:
        raise PngError(f"image has zero size ({w}x{h})")
    if ct not in _CHANNELS or bd not in _DEPTHS[ct]:
        raise PngError(f"unsupported colour type {ct} / bit depth {bd}")
    if comp != 0 or filt != 0 or interlace not in (0, 1):
        raise PngError("unsupported compression, filter or interlace method")
    if not any(t == b"IDAT" for t, _ in chunks):
        raise PngError("no image data (IDAT) in file")
    return {"width": w, "height": h, "bit_depth": bd, "color_type": ct, "interlace": interlace}


class RGBAImage:
    def __init__(self, width: int, height: int, rows: list[bytes]):
        self.width, self.height, self.rows = width, height, rows

    def pixel(self, x: int, y: int) -> tuple[int, int, int, int]:
        r, i = self.rows[y], 4 * x
        return r[i], r[i + 1], r[i + 2], r[i + 3]


class _PilImage:
    def __init__(self, im):
        self.width, self.height = im.size
        self._px = im.load()

    def pixel(self, x: int, y: int) -> tuple[int, int, int, int]:
        return self._px[x, y]


def _unfilter(ft: int, line: bytearray, prev: bytearray, bpp: int) -> None:
    n = len(line)
    if ft == 0:
        return
    if ft == 1:
        for i in range(bpp, n):
            line[i] = (line[i] + line[i - bpp]) & 0xFF
    elif ft == 2:
        for i in range(n):
            line[i] = (line[i] + prev[i]) & 0xFF
    elif ft == 3:
        for i in range(n):
            left = line[i - bpp] if i >= bpp else 0
            line[i] = (line[i] + ((left + prev[i]) >> 1)) & 0xFF
    elif ft == 4:
        for i in range(n):
            a = line[i - bpp] if i >= bpp else 0
            b = prev[i]
            c = prev[i - bpp] if i >= bpp else 0
            p = a + b - c
            pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
            pred = a if pa <= pb and pa <= pc else b if pb <= pc else c
            line[i] = (line[i] + pred) & 0xFF
    else:
        raise PngError(f"invalid row filter type {ft} (file corrupted)")


def decode_png(data: bytes) -> RGBAImage:
    """Decode a non-interlaced PNG into 8-bit RGBA rows (stdlib only)."""
    chunks = read_png_chunks(data)
    info = png_info(chunks)
    w, h, bd, ct = info["width"], info["height"], info["bit_depth"], info["color_type"]
    if info["interlace"]:
        raise PngError("interlaced PNG: install Pillow or re-save the image without interlacing")
    plte = next((b for t, b in chunks if t == b"PLTE"), None)
    trns = next((b for t, b in chunks if t == b"tRNS"), None)
    if ct == 3 and plte is None:
        raise PngError("palette image without a PLTE chunk")
    try:
        raw = zlib.decompress(b"".join(b for t, b in chunks if t == b"IDAT"))
    except zlib.error as exc:
        raise PngError(f"image data corrupted ({exc})") from exc
    bits_pp = _CHANNELS[ct] * bd
    stride = (w * bits_pp + 7) // 8
    bpp = max(1, bits_pp // 8)
    if len(raw) < h * (stride + 1):
        raise PngError("image data truncated")

    if ct == 3:
        n = len(plte) // 3
        alpha = (trns or b"") + b"\xff" * 256
        tables = [bytes(plte[3 * i + c] if i < n else 0 for i in range(256)) for c in range(3)]
        tables.append(bytes(alpha[:256]))

    rows, prev, pos = [], bytearray(stride), 0
    for _ in range(h):
        ft = raw[pos]
        line = bytearray(raw[pos + 1:pos + 1 + stride])
        pos += stride + 1
        _unfilter(ft, line, prev, bpp)
        prev = line
        samples = line
        if bd == 16:
            samples = line[0::2]
        elif bd < 8:
            mask = (1 << bd) - 1
            vals = bytearray(w)
            for x in range(w):
                bit = x * bd
                vals[x] = (line[bit >> 3] >> (8 - bd - (bit & 7))) & mask
            samples = vals if ct == 3 else bytearray(v * 255 // mask for v in vals)
        out = bytearray(4 * w)
        if ct == 6:
            out[:] = samples
        elif ct == 2:
            out[0::4], out[1::4], out[2::4] = samples[0::3], samples[1::3], samples[2::3]
            out[3::4] = b"\xff" * w
            if trns and len(trns) == 6:
                key = bytes(trns[1::2]) if bd == 8 else bytes(trns[0::2])
                for x in range(w):
                    if bytes(out[4 * x:4 * x + 3]) == key:
                        out[4 * x + 3] = 0
        elif ct == 0:
            out[0::4] = out[1::4] = out[2::4] = samples
            out[3::4] = b"\xff" * w
        elif ct == 4:
            out[0::4] = out[1::4] = out[2::4] = samples[0::2]
            out[3::4] = samples[1::2]
        else:  # palette
            idx = bytes(samples)
            for c in range(4):
                out[c::4] = idx.translate(tables[c])
        rows.append(bytes(out))
    return RGBAImage(w, h, rows)


def load_rgba(data: bytes):
    if not os.environ.get("PLANET_IMAGES_NO_PIL"):
        try:
            from PIL import Image  # optional speed-up only
        except ImportError:
            Image = None
        if Image is not None:
            try:
                im = Image.open(io.BytesIO(data))
                im.load()
                return _PilImage(im.convert("RGBA"))
            except Exception as exc:  # Pillow raises many types for broken files
                raise PngError(f"could not decode image data ({exc})") from exc
    return decode_png(data)


# ---------------------------------------------------------------------------
# Image measurements
# ---------------------------------------------------------------------------


def _dist(p, key) -> float:
    return math.sqrt((p[0] - key[0]) ** 2 + (p[1] - key[1]) ** 2 + (p[2] - key[2]) ** 2)


def grid_points(w: int, h: int, n: int = 200) -> list[tuple[int, int]]:
    sx, sy = max(1, w // n), max(1, h // n)
    return [(x, y) for y in range(0, h, sy) for x in range(0, w, sx)]


def region_points(w: int, h: int, region: str) -> list[tuple[int, int]]:
    t = max(1, round(min(w, h) * 0.01))
    across = range(0, t, max(1, t // 3))
    sx, sy = max(1, w // 400), max(1, h // 400)
    pts: list[tuple[int, int]] = []
    if region in ("all_edges", "top", "top_and_upper_sides"):
        pts += [(x, d) for d in across for x in range(0, w, sx)]
    if region == "all_edges":
        pts += [(x, h - 1 - d) for d in across for x in range(0, w, sx)]
        pts += [(d, y) for d in across for y in range(0, h, sy)]
        pts += [(w - 1 - d, y) for d in across for y in range(0, h, sy)]
    if region == "top_and_upper_sides":
        pts += [(d, y) for d in across for y in range(0, h // 2, sy)]
        pts += [(w - 1 - d, y) for d in across for y in range(0, h // 2, sy)]
    if region == "corners":
        c = max(2, round(min(w, h) * 0.05))
        st = max(1, c // 20)
        for cx, cy in ((0, 0), (w - c, 0), (0, h - c), (w - c, h - c)):
            pts += [(cx + i, cy + j) for j in range(0, c, st) for i in range(0, c, st)]
    return pts


def dominant_colour(pixels) -> str:
    bins: dict[tuple, list] = {}
    for p in pixels:
        bins.setdefault((p[0] >> 5, p[1] >> 5, p[2] >> 5), []).append(p)
    if not bins:
        return "n/a"
    top = max(bins.values(), key=len)
    mean = tuple(round(sum(p[c] for p in top) / len(top)) for c in range(3))
    return "#%02X%02X%02X" % mean


def cell_means(img, x0: int, x1: int, gw: int = 8, gh: int = 8) -> list[tuple[float, float, float]]:
    out = []
    cw, ch = max(1, (x1 - x0) // gw), max(1, img.height // gh)
    for gy in range(gh):
        for gx in range(gw):
            acc, n = [0, 0, 0], 0
            for j in range(0, ch, max(1, ch // 6)):
                for i in range(0, cw, max(1, cw // 6)):
                    x, y = min(x0 + gx * cw + i, img.width - 1), min(gy * ch + j, img.height - 1)
                    p = img.pixel(x, y)
                    acc[0] += p[0]
                    acc[1] += p[1]
                    acc[2] += p[2]
                    n += 1
            out.append(tuple(v / n for v in acc))
    return out


def parse_ratio(r: str) -> float:
    x, y = r.split(":")
    return int(x) / int(y)


# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------


def candidate_files(paths: Paths, aid: str) -> list[Path]:
    if not paths.incoming.is_dir():
        return []
    pat = re.compile(rf"{aid}(?:-(\d+))?\.[A-Za-z0-9]+", re.IGNORECASE)
    found = [p for p in paths.incoming.iterdir() if p.is_file() and pat.fullmatch(p.name)]

    def sort_key(p: Path):
        m = pat.fullmatch(p.name)
        return (int(m.group(1)) if m.group(1) else 0, p.name)

    return sorted(found, key=sort_key)


def validate_file(paths: Paths, m: dict, a: dict, f: Path) -> dict:
    checks: list[dict] = []

    def add(name: str, result: str, detail: str) -> None:
        checks.append({"check": name, "result": result, "detail": detail})

    res = {
        "file": paths.rel(f),
        "name": f.name,
        "attempt": a["attempts"],
        "validated_at": now(),
        "checks": checks,
    }

    def finish() -> dict:
        res["errors"] = sum(c["result"] == "fail" for c in checks)
        res["warnings"] = sum(c["result"] == "warn" for c in checks)
        res["result"] = "fail" if res["errors"] else "warn" if res["warnings"] else "pass"
        return res

    aid = a["id"]
    if re.fullmatch(rf"{aid}(?:-\d+)?\.png", f.name):
        add("filename", "pass", f"{f.name} matches {aid}.png / {aid}-N.png")
    elif not f.name.lower().endswith(".png"):
        add("filename", "fail", f"{f.name} is not a .png file; save the image as PNG named {aid}.png")
    else:
        add("filename", "warn", f"{f.name}: expected exactly {aid}.png (or {aid}-N.png)")

    try:
        data = f.read_bytes()
    except OSError as exc:
        add("readable", "fail", f"cannot read file: {exc}")
        return finish()
    res["sha256"] = sha256_bytes(data)
    res["size_bytes"] = len(data)
    if not data:
        add("readable", "fail", "file is empty (0 bytes)")
        return finish()

    try:
        info = png_info(read_png_chunks(data))
    except PngError as exc:
        add("png_format", "fail", str(exc))
        return finish()
    add("png_format", "pass", f"valid PNG structure, colour type {info['color_type']}, {info['bit_depth']}-bit")

    try:
        img = load_rgba(data)
    except PngError as exc:
        add("decode", "fail", str(exc))
        return finish()
    w, h = img.width, img.height
    res["width"], res["height"] = w, h
    add("decode", "pass", f"decoded {w}x{h} px")

    by_id = {x["id"]: x for x in m["assets"]}
    actual = w / h
    if a["ratio"]:
        want = parse_ratio(a["ratio"])
        diff = abs(actual - want) / want
        if diff <= RATIO_TOLERANCE:
            add("aspect_ratio", "pass", f"{w}x{h} = {actual:.3f}, expected {a['ratio']} = {want:.3f}")
        else:
            add(
                "aspect_ratio",
                "warn",
                f"{w}x{h} = {actual:.3f}, expected {a['ratio']} = {want:.3f} ({diff:.0%} off). "
                "PROMPTS.md allows the closest ratio if the generator refuses; confirm this is acceptable",
            )
    elif a["size_rule"]:
        src = by_id[a["size_rule"]["same_as"]]
        sw, sh = (src.get("approved_size") or [None, None])
        if sw is None:
            add("same_size", "warn", f"cannot compare: {src['id']} has no approved image recorded")
        elif (sw, sh) == (w, h):
            add("same_size", "pass", f"{w}x{h} matches approved {src['id']} ({sw}x{sh})")
        else:
            add(
                "same_size",
                "warn",
                f"{w}x{h} differs from approved {src['id']} ({sw}x{sh}); the prompt asks for the same "
                "size, so day/night or continuation pieces may not line up",
            )
    else:
        add("aspect_ratio", "skip", "no ratio or size specified in PROMPTS.md for this asset")

    grid = [img.pixel(x, y) for x, y in grid_points(w, h)]
    lum = [0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2] for p in grid]
    mean = sum(lum) / len(lum)
    std = math.sqrt(sum((v - mean) ** 2 for v in lum) / len(lum))
    if std < BLANK_STD:
        add("not_blank", "fail", f"image is a single flat colour (luminance std-dev {std:.1f})")
    else:
        add("not_blank", "pass", f"luminance std-dev {std:.1f}")

    if a["key_color"]:
        key, hexv = KEYS[a["key_color"]], a["key_hex"]
        opaque = [p for p in grid if p[3] >= 128]
        present = sum(_dist(p, key) <= KEY_MATCH_DIST for p in opaque) / len(grid)
        if present >= KEY_MIN_PRESENT:
            add("key_present", "pass", f"{hexv} covers {present:.0%} of the image")
        else:
            add("key_present", "fail", f"{hexv} covers only {present:.1%} of the image; key colour missing")
        art = 1 - present
        if art < ART_MIN:
            add("artwork_present", "fail", f"image is {present:.1%} key colour: no artwork")
        region = [img.pixel(x, y) for x, y in region_points(w, h, a["key_region"])]
        transparent = sum(p[3] < 128 for p in region) / len(region)
        near = [p for p in region if p[3] >= 128 and _dist(p, key) <= KEY_MATCH_DIST]
        cover = len(near) / len(region)
        where = a["key_region"].replace("_", " ")
        if cover >= BG_PASS:
            add("background_key", "pass", f"{cover:.0%} of the {where} region is {hexv}")
        elif cover >= BG_FAIL:
            add(
                "background_key",
                "warn",
                f"only {cover:.0%} of the {where} region is {hexv} (expected >= {BG_PASS:.0%}); "
                f"dominant colour there {dominant_colour(region)}",
            )
        else:
            add(
                "background_key",
                "fail",
                f"only {cover:.0%} of the {where} region is {hexv}; dominant colour there "
                f"{dominant_colour(region)}. The background must be flat {hexv}",
            )
        if transparent > 0.01:
            add(
                "background_opaque",
                "warn" if cover >= BG_FAIL else "fail",
                f"{transparent:.0%} of the background region is transparent; it must be opaque {hexv}",
            )
        if near:
            dists = [_dist(p, key) for p in near]
            flat = sum(d <= KEY_FLAT_DIST for d in dists) / len(dists)
            avg = sum(dists) / len(dists)
            verdict = "pass" if flat >= FLAT_PASS else "warn"
            add(
                "background_flat",
                verdict,
                f"{flat:.0%} of key pixels within {KEY_FLAT_DIST:.0f} of {hexv} (mean distance {avg:.1f}); "
                + ("flat" if verdict == "pass" else "possible texture, grain, gradient or glow"),
            )
    else:
        opaque = [p for p in grid if p[3] >= 128]
        keyish = sum(min(_dist(p, KEYS["magenta"]), _dist(p, KEYS["green"])) <= KEY_MATCH_DIST / 2 for p in opaque)
        frac = keyish / len(grid)
        transparent = 1 - len(opaque) / len(grid)
        if frac <= FULLBLEED_KEY_MAX and transparent <= 0.01:
            add("full_bleed", "pass", "no key-colour background or transparency (artwork fills the image)")
        else:
            add(
                "full_bleed",
                "warn",
                f"{frac:.1%} key-coloured and {transparent:.1%} transparent pixels; this image should be "
                "artwork edge to edge",
            )

    if a["continuation_of"]:
        src = by_id[a["continuation_of"]]
        src_path = paths.abs(src["approved_file"]) if src.get("approved_file") else None
        if src_path and src_path.is_file():
            try:
                simg = load_rgba(src_path.read_bytes())
                left = cell_means(img, 0, w // 4)
                right = cell_means(simg, simg.width * 3 // 4, simg.width)
                d = sum(abs(p[c] - q[c]) for p, q in zip(left, right) for c in range(3)) / (3 * len(left))
                add(
                    "seam_similarity",
                    "info",
                    f"mean colour difference {d:.1f}/255 between {src['id']}'s right quarter and this "
                    "image's left quarter (lower = closer; informational only, judge the seam by eye)",
                )
            except PngError as exc:
                add("seam_similarity", "info", f"could not read {src['id']}: {exc}")
        else:
            add("seam_similarity", "info", f"skipped: approved {src['id']} not found")

    return finish()


# ---------------------------------------------------------------------------
# Manifest
# ---------------------------------------------------------------------------

DEFINITION_FIELDS = (
    "id", "order", "step", "title", "derived_from", "group_title", "optional", "source_line",
    "attach_line", "attachments", "dependencies", "references", "prompt", "prompt_sha256", "ratio",
    "ratio_source", "size_rule", "key_color", "key_hex", "key_region", "key_region_rationale",
    "continuation_of",
)


def _progress_defaults() -> dict:
    return {
        "status": "blocked",
        "attempts": 0,
        "requested": False,
        "blocked_reasons": [],
        "candidates": [],
        "validation": None,
        "validation_history": [],
        "approved_file": None,
        "approved_sha256": None,
        "approved_size": None,
        "approved_at": None,
        "approval_note": None,
        "failure_reason": None,
        "rejections": [],
        "notes": [],
        "history": [],
    }


def build_manifest(paths: Paths, old: dict | None = None) -> dict:
    if not paths.prompts.is_file():
        raise CliError(f"{paths.rel(paths.prompts)} not found. It is the source of truth for this workflow.")
    raw = paths.prompts.read_bytes()
    parsed = parse_prompts(raw.decode("utf-8"))
    old_assets = {a["id"]: a for a in (old or {}).get("assets", [])}
    old_cps = {c["id"]: c for c in (old or {}).get("checkpoints", [])}

    assets = []
    for d in parsed["assets"]:
        prev = old_assets.get(d["id"])
        a = {k: d[k] for k in DEFINITION_FIELDS}
        a["step_title"] = parsed["steps"][d["step"]]["title"]
        a["expected_filename"] = f"{d['id']}.png"
        a["incoming_path"] = (BASE_REL / "incoming" / f"{d['id']}.png").as_posix()
        a["approved_path"] = (BASE_REL / "approved" / f"{d['id']}.png").as_posix()
        progress = _progress_defaults()
        if prev:
            progress.update({k: prev[k] for k in progress if k in prev})
            if prev.get("prompt_sha256") != a["prompt_sha256"] and prev.get("status") not in ("blocked", "ready"):
                progress["notes"].append(f"{now()}: prompt text changed in PROMPTS.md after work started")
        a.update(progress)
        assets.append(a)

    checkpoints = []
    for c in parsed["checkpoints"]:
        prev = old_cps.get(c["id"], {})
        c = dict(c)
        c["status"] = prev.get("status", "pending")
        c["passed_at"] = prev.get("passed_at")
        c["note"] = prev.get("note")
        checkpoints.append(c)

    required = [a for a in assets if not a["optional"]]
    optional = [a["id"] for a in assets if a["optional"]]
    design_doc = "docs/plans/2026-10-19-little-planet-design.md"
    notes = [
        "PROMPTS.md was written for Gemini; this workflow generates images by hand in ChatGPT. "
        "Prompt text is used verbatim; only the surrounding instructions mention ChatGPT.",
        f"PROMPTS.md says '{parsed['total_line']}'. Parsing found {len(required)} required assets "
        f"plus {len(optional)} optional ({', '.join(optional) or 'none'}).",
        "PROMPTS.md specifies aspect ratios (21:9, 16:9, 3:4, 1:1) but no pixel dimensions; size "
        "checks compare ratios, and day/repaint versions are compared to their approved source.",
    ]
    if not paths.abs(design_doc).is_file():
        notes.append(f"Design doc referenced by PROMPTS.md ({design_doc}) is not in the repository.")

    m = {
        "schema_version": SCHEMA_VERSION,
        "generated_by": "scripts/planet_images.py",
        "source": {"path": paths.rel(paths.prompts), "sha256": sha256_bytes(raw)},
        "built_at": (old or {}).get("built_at", now()),
        "refreshed_at": now(),
        "notes": notes,
        "how_to_use": parsed["how_to_use"],
        "key_colours": parsed["key_colours"],
        "steps": parsed["steps"],
        "style_plates": sorted({r for a in assets for r in a["references"]}),
        "checkpoints": checkpoints,
        "assets": assets,
    }
    refresh(m, paths)
    return m


def load_manifest(paths: Paths) -> dict:
    if not paths.manifest.is_file():
        paths.ensure_dirs()
        m = build_manifest(paths)
        save_manifest(paths, m)
        audit(paths, {"event": "init", "detail": "manifest created from PROMPTS.md"})
        print(f"Created {paths.rel(paths.manifest)} from PROMPTS.md.")
        return m
    try:
        m = json.loads(paths.manifest.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise CliError(f"{paths.rel(paths.manifest)} is not valid JSON ({exc}); restore it from git") from exc
    if m.get("schema_version") != SCHEMA_VERSION:
        raise CliError(f"unsupported manifest schema version {m.get('schema_version')}")
    if not paths.prompts.is_file():
        raise CliError(f"{paths.rel(paths.prompts)} not found")
    if sha256_file(paths.prompts) != m["source"]["sha256"]:
        raise CliError(
            "PROMPTS.md changed since the manifest was built. Review the change, then run "
            f"`{SCRIPT} init --refresh` (progress is kept)."
        )
    refresh(m, paths)
    return m


def save_manifest(paths: Paths, m: dict) -> None:
    paths.workflow.mkdir(parents=True, exist_ok=True)
    tmp = paths.manifest.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(m, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    os.replace(tmp, paths.manifest)


def audit(paths: Paths, entry: dict) -> None:
    paths.workflow.mkdir(parents=True, exist_ok=True)
    entry = {"at": now(), **entry}
    with paths.audit.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(entry, ensure_ascii=False) + "\n")


def set_status(paths: Paths, a: dict, new: str, event: str, detail: str = "") -> None:
    assert new in STATUSES, new
    old = a["status"]
    a["status"] = new
    rec = {"at": now(), "event": event, "from": old, "to": new}
    if detail:
        rec["detail"] = detail
    a["history"].append(rec)
    audit(paths, {"event": event, "asset": a["id"], "from": old, "to": new, "detail": detail})


def assets_by_id(m: dict) -> dict:
    return {a["id"]: a for a in m["assets"]}


def get_asset(m: dict, raw_id: str) -> dict:
    aid = raw_id.strip().upper()
    a = assets_by_id(m).get(aid)
    if a is None:
        raise CliError(f"unknown asset ID {raw_id!r}. Valid IDs: {', '.join(x['id'] for x in m['assets'])}")
    return a


def get_checkpoint(m: dict, raw_id: str) -> dict:
    cid = raw_id.strip().upper()
    for c in m["checkpoints"]:
        if c["id"] == cid or c["after"] == cid:
            return c
    raise CliError(f"unknown checkpoint {raw_id!r}. Valid: {', '.join(c['id'] for c in m['checkpoints'])}")


def compute_blockers(m: dict, paths: Paths, a: dict) -> list[str]:
    by_id = assets_by_id(m)
    reasons = []
    if a["optional"] and not a["requested"]:
        reasons.append(f"optional: only made if Claude asks (`{SCRIPT} enable-optional {a['id']} --reason ...`)")
    for d in a["dependencies"]:
        dep = by_id[d]
        if dep["status"] != "approved":
            reasons.append(f"dependency {d} not approved (status: {dep['status']})")
        elif not dep["approved_file"] or not paths.abs(dep["approved_file"]).is_file():
            reasons.append(f"approved image for dependency {d} is missing from {dep['approved_path']}")
    for c in m["checkpoints"]:
        if c["position"] < a["order"] and c["status"] != "passed":
            reasons.append(f"checkpoint {c['id']} not passed")
    for r in a["references"]:
        if not paths.abs(r).is_file():
            reasons.append(f"missing reference file {r}")
    return reasons


def refresh(m: dict, paths: Paths) -> None:
    """Recompute blocked/ready for assets that are not in flight or approved."""
    for a in m["assets"]:
        a["blocked_reasons"] = compute_blockers(m, paths, a)
        if a["status"] in ("blocked", "ready"):
            want = "blocked" if a["blocked_reasons"] else "ready"
            if want != a["status"]:
                set_status(paths, a, want, "refresh", "; ".join(a["blocked_reasons"]) or "all prerequisites met")


def scan_incoming(m: dict, paths: Paths) -> None:
    """Mark in-flight assets whose image has arrived as received."""
    for a in m["assets"]:
        if a["status"] in ("prompt_prepared", "awaiting_image"):
            files = candidate_files(paths, a["id"])
            if files:
                set_status(paths, a, "received", "image_found", ", ".join(f.name for f in files))


def unexpected_incoming(m: dict, paths: Paths) -> list[str]:
    if not paths.incoming.is_dir():
        return []
    by_id = assets_by_id(m)
    out = []
    pat = re.compile(rf"({ID_PAT})(?:-\d+)?\.[A-Za-z0-9]+", re.IGNORECASE)
    for p in sorted(paths.incoming.iterdir()):
        if not p.is_file() or p.name.startswith("."):
            continue
        mm = pat.fullmatch(p.name)
        a = by_id.get(mm.group(1).upper()) if mm else None
        if a is None:
            out.append(f"{p.name}: does not match any asset ID (expected e.g. B1.png)")
        elif a["status"] == "approved":
            out.append(f"{p.name}: {a['id']} is already approved; approved images are never overwritten")
        elif a["status"] in ("blocked", "ready"):
            out.append(f"{p.name}: {a['id']} is {a['status']}, no prompt was prepared for it; not validated")
    return out


def in_flight(m: dict) -> list[dict]:
    return [a for a in m["assets"] if a["status"] in ACTIVE]


def move_to_rejected(paths: Paths, a: dict, f: Path, reason: str) -> str:
    dest_dir = paths.rejected / a["id"] / f"attempt-{a['attempts']}"
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest = dest_dir / f.name
    n = 1
    while dest.exists():
        dest = dest_dir / f"{f.stem}.{n}{f.suffix}"
        n += 1
    shutil.move(str(f), dest)
    rel = paths.rel(dest)
    a["rejections"].append(
        {"at": now(), "attempt": a["attempts"], "file": f.name, "moved_to": rel, "reason": reason}
    )
    audit(paths, {"event": "file_rejected", "asset": a["id"], "file": f.name, "moved_to": rel, "reason": reason})
    return rel


# ---------------------------------------------------------------------------
# Prompt documents
# ---------------------------------------------------------------------------


def upcoming_checkpoint(m: dict, a: dict) -> dict | None:
    for c in m["checkpoints"]:
        if a["id"] in c["assets"] or a["id"] in c["conditional_assets"]:
            return c
    return None


def render_prompt_doc(m: dict, paths: Paths, a: dict, generated_by: str) -> str:
    by_id = assets_by_id(m)
    L: list[str] = []
    L.append(f"# {a['id']} — {a['title']}")
    L.append("")
    L.append(
        f"Generated by `{generated_by}` at {now()}. The prompt in section 2 is copied verbatim from "
        f"`{m['source']['path']}` (line {a['source_line']}); do not edit it."
    )
    L.append("")
    if a["blocked_reasons"] and a["status"] in ("blocked", "ready"):
        L.append("> **Not ready yet.** Do not generate this image until these are resolved:")
        for r in a["blocked_reasons"]:
            L.append(f"> - {r}")
        L.append("")
    L.append("| | |")
    L.append("|---|---|")
    L.append(f"| Asset ID | **{a['id']}** |")
    L.append(f"| Step | {a['step']} — {a['step_title']} |")
    attempt = f"attempt {a['attempts']}" if a["attempts"] else "not started"
    L.append(f"| Status | {a['status']} ({attempt}) |")
    L.append(f"| Save as | `{a['incoming_path']}` |")
    L.append(f"| Extra tries | `{a['id']}-1.png`, `{a['id']}-2.png`, ... in the same folder |")
    if a["ratio"]:
        ratio = f"{a['ratio']} ({a['ratio_source']})"
    elif a["size_rule"]:
        src = by_id[a["size_rule"]["same_as"]]
        size = f", approved {src['id']} is {src['approved_size'][0]}x{src['approved_size'][1]} px" if src[
            "approved_size"] else ""
        ratio = f"same as {src['id']} ({a['ratio_source']}{size})"
    else:
        ratio = a["ratio_source"]
    L.append(f"| Aspect ratio | {ratio} |")
    if a["key_color"]:
        L.append(f"| Background | perfectly flat solid {a['key_color']} `{a['key_hex']}` |")
    else:
        L.append("| Background | none: artwork fills the image edge to edge |")
    if a["optional"]:
        L.append("| Optional | yes: PROMPTS.md says only if Claude asks |")
    L.append("")

    L.append("## 1. Attach these files in ChatGPT, in this order")
    L.append("")
    L.append(f"PROMPTS.md: `ATTACH: {a['attach_line']}`")
    L.append("")
    ordinals = ["first", "second", "third", "fourth"]
    for i, att in enumerate(a["attachments"]):
        p = paths.abs(att["path"])
        ok = "present" if p.is_file() else "MISSING"
        if att["kind"] == "style":
            what = f"style plate `{att['token']}`"
        else:
            dep = by_id[att["id"]]
            what = f"your approved {dep['id']} ({dep['title']})"
            if dep["status"] != "approved":
                ok = f"NOT APPROVED YET (status: {dep['status']})"
        L.append(f"{i + 1}. `{att['path']}`: {what} [{ok}]")
    if len(a["attachments"]) > 1:
        L.append("")
        L.append(
            "The prompt refers to the attachments by position (\"the first attached\", \"the second "
            "attached\"), so attach them in exactly this order."
        )
    L.append("")

    L.append("## 2. Paste this prompt")
    L.append("")
    L.append("Copy everything inside the block, exactly:")
    L.append("")
    L.append("````text")
    L.append(a["prompt"])
    L.append("````")
    L.append("")

    L.append("## 3. Settings and requirements")
    L.append("")
    how = m.get("how_to_use", {})
    L.append(
        "- PROMPTS.md was written for Gemini. In ChatGPT, use the same prompt and attachments; "
        "only the tool is different."
    )
    if "1" in how:
        L.append(f"- PROMPTS.md: \"{how['1']}\"")
    if "6" in how:
        L.append(f"- PROMPTS.md: \"{how['6']}\"")
    if a["ratio"]:
        L.append(
            f"- Ask for a {a['ratio']} image. If ChatGPT can't make that ratio, take the closest it "
            "offers. `validate` flags the mismatch as a warning, and you decide whether it's acceptable."
        )
    if a["key_color"]:
        for line in m.get("key_colours", []):
            if KEY_HEX[a["key_color"]] in line or line.startswith("The key colour"):
                L.append(f"- PROMPTS.md: \"{line}\"")
    for note in m["steps"][a["step"]]["notes"]:
        L.append(f"- Step {a['step']} note from PROMPTS.md: \"{note}\"")
    L.append("")

    L.append("## 4. Regenerate if you get")
    L.append("")
    if "7" in how:
        L.append("PROMPTS.md: \"" + how["7"].replace("\n", " ") + "\"")
    L.append("")
    L.append(
        "The automatic checks can't detect text, outlines, a 3D look, watermarks or wrong style. "
        "Check those yourself."
    )
    L.append("")

    cont = []
    if a["continuation_of"]:
        cont.append(
            f"- This piece continues {a['continuation_of']}: the prompt asks that the left quarter repeat the "
            f"right quarter of approved {a['continuation_of']}. `validate` reports a seam-similarity number "
            "(informational)."
        )
    if a["size_rule"]:
        cont.append(
            f"- The prompt asks for the same size and layout as {a['size_rule']['same_as']}; `validate` compares "
            "dimensions with the approved file."
        )
    if a["derived_from"] and not a["size_rule"]:
        cont.append(f"- Derived from {a['derived_from']}.")
    cp = upcoming_checkpoint(m, a)
    if cp:
        cont.append(f"- {a['id']} is reviewed at checkpoint {cp['id']}: \"{cp['text']}\"")
    if cont:
        L.append("## 5. Continuity")
        L.append("")
        L.extend(cont)
        L.append("")

    L.append(f"## {6 if cont else 5}. Save and validate")
    L.append("")
    L.append("1. Download the generated image from ChatGPT as a PNG.")
    L.append(f"2. Save it as exactly `{a['incoming_path']}`. Name extra tries `{a['id']}-1.png`, `{a['id']}-2.png`.")
    L.append(f"3. Run `{SCRIPT} validate`.")
    L.append(f"4. Run `{SCRIPT} review {a['id']}`, look at the image, then run either:")
    L.append(f"   - `{SCRIPT} approve {a['id']}` (add `--file {a['id']}-2.png` to pick one try), or")
    L.append(f"   - `{SCRIPT} reject {a['id']} --reason \"...\"`, then `{SCRIPT} retry {a['id']}`.")
    L.append(f"5. Run `{SCRIPT} next` for the next image.")
    L.append("")
    return "\n".join(L)


def render_checkpoint_doc(m: dict, cp: dict) -> str:
    by_id = assets_by_id(m)
    L = [f"# Checkpoint {cp['id']}: review required", ""]
    L.append(f"PROMPTS.md: \"{cp['text']}\"")
    L.append("")
    L.append("No new prompt is prepared until this checkpoint passes. Assets to review:")
    L.append("")
    for aid in cp["assets"]:
        a = by_id[aid]
        v = a["validation"]
        summary = f"validation {v['result']} ({v['errors']} errors, {v['warnings']} warnings)" if v else "not validated"
        L.append(f"- **{aid}** ({a['title']}): {a['status']}; {summary}")
        if v:
            for c in v["checks"]:
                if c["result"] in ("warn", "fail", "info"):
                    L.append(f"  - {c['check']}: {c['result']}: {c['detail']}")
    if cp["conditional_assets"]:
        L.append("")
        L.append(f"Conditional at this stop: {', '.join(cp['conditional_assets'])} (see the PROMPTS.md text above).")
    L.append("")
    L.append("To finish the checkpoint:")
    L.append("")
    L.append(f"1. Review each image: `{SCRIPT} review <ID>`.")
    L.append(f"2. Every listed asset must be approved. Run `approve <ID>` or `reject <ID> --reason \"...\"`.")
    L.append(f"3. Run `{SCRIPT} checkpoint {cp['id']} --pass --note \"...\"`.")
    L.append("")
    return "\n".join(L)


def write_next_prompt(paths: Paths, text: str) -> None:
    paths.workflow.mkdir(parents=True, exist_ok=True)
    paths.next_prompt.write_text(text, encoding="utf-8")


# ---------------------------------------------------------------------------
# Reports
# ---------------------------------------------------------------------------


def format_validation(v: dict | None, indent: str = "    ") -> list[str]:
    if not v:
        return [f"{indent}(not validated)"]
    out = [f"{indent}{v['name']}: {v['result'].upper()} ({v['errors']} errors, {v['warnings']} warnings)"]
    for c in v["checks"]:
        out.append(f"{indent}  [{c['result']:>4}] {c['check']}: {c['detail']}")
    return out


def print_checkpoint_report(m: dict, cp: dict) -> None:
    by_id = assets_by_id(m)
    print(f"CHECKPOINT {cp['id']}: automatic advancement stopped.")
    print(f"  PROMPTS.md: {cp['text']}")
    for aid in cp["assets"]:
        a = by_id[aid]
        print(f"  {aid} ({a['title']}): {a['status']}")
        if a["status"] == "approved":
            print(f"    approved file: {a['approved_file']}")
            if a["validation"]:
                print(f"    validation at approval: {a['validation']['result']}")
        else:
            for c in a["candidates"]:
                print("\n".join(format_validation(c)))
    if cp["conditional_assets"]:
        print(f"  Conditional: {', '.join(cp['conditional_assets'])} (enable with `enable-optional` if needed)")
    pending = [aid for aid in cp["assets"] if by_id[aid]["status"] != "approved"]
    if pending:
        print(f"  Waiting for your approval or rejection of: {', '.join(pending)}")
    else:
        print("  All listed assets are approved. After your visual check:")
    print(f"  Then run: {SCRIPT} checkpoint {cp['id']} --pass --note \"...\"")


def blocking_checkpoint(m: dict, a: dict) -> dict | None:
    for c in m["checkpoints"]:
        if c["position"] < a["order"] and c["status"] != "passed":
            return c
    return None


def counts(m: dict) -> dict:
    out = {s: 0 for s in STATUSES}
    for a in m["assets"]:
        out[a["status"]] += 1
    return out


# ---------------------------------------------------------------------------
# Commands
# ---------------------------------------------------------------------------


def cmd_init(paths: Paths, args) -> int:
    paths.ensure_dirs()
    if paths.manifest.is_file():
        if not args.refresh:
            print(f"{paths.rel(paths.manifest)} already exists; nothing changed.")
            print(f"Use `{SCRIPT} init --refresh` to re-read PROMPTS.md (progress is kept).")
            return 0
        old = json.loads(paths.manifest.read_text(encoding="utf-8"))
        m = build_manifest(paths, old)
        audit(paths, {"event": "init_refresh", "detail": f"PROMPTS.md sha256 {m['source']['sha256']}"})
        print("Manifest refreshed from PROMPTS.md; progress kept.")
    else:
        m = build_manifest(paths)
        audit(paths, {"event": "init", "detail": f"PROMPTS.md sha256 {m['source']['sha256']}"})
        print(f"Created {paths.rel(paths.manifest)}.")
    save_manifest(paths, m)
    print_summary(m, paths)
    return 0


def print_summary(m: dict, paths: Paths) -> None:
    req = [a for a in m["assets"] if not a["optional"]]
    opt = [a["id"] for a in m["assets"] if a["optional"]]
    print(f"Assets: {len(m['assets'])} ({len(req)} required, {len(opt)} optional: {', '.join(opt) or 'none'})")
    c = counts(m)
    print("  " + "  ".join(f"{s}={n}" for s, n in c.items()))


def cmd_status(paths: Paths, args) -> int:
    m = load_manifest(paths)
    scan_incoming(m, paths)
    save_manifest(paths, m)
    if args.json:
        print(json.dumps({"counts": counts(m), "assets": {a["id"]: a["status"] for a in m["assets"]}}, indent=2))
        return 0
    print_summary(m, paths)
    approved = sum(a["status"] == "approved" for a in m["assets"] if not a["optional"])
    total = sum(not a["optional"] for a in m["assets"])
    print(f"Progress: {approved}/{total} required assets approved")
    print()

    fl = in_flight(m)
    print("In progress:" if fl else "In progress: none")
    for a in fl:
        extra = f" ({a['failure_reason']})" if a["status"] == "failed" and a["failure_reason"] else ""
        print(f"  {a['id']} {a['status']}{extra} (attempt {a['attempts']})")
    reviews = [a for a in m["assets"] if a["status"] in ("received", "needs_review")]
    print("Pending reviews: " + (", ".join(a["id"] for a in reviews) if reviews else "none"))

    print("Checkpoints:")
    by_id = assets_by_id(m)
    for c in m["checkpoints"]:
        st = ", ".join(f"{x}:{by_id[x]['status']}" for x in c["assets"])
        print(f"  {c['id']:<10} {c['status']:<8} after {c['after']}; reviews {st}")

    missing = {}
    for a in m["assets"]:
        for r in a["references"]:
            if not paths.abs(r).is_file():
                missing.setdefault(r, []).append(a["id"])
    if missing:
        print("Missing reference files (put them in place before generating):")
        for r, ids in missing.items():
            print(f"  {r} (needed directly by {len(ids)} assets)")

    for a in m["assets"]:
        if a["status"] == "approved":
            f = paths.abs(a["approved_file"]) if a["approved_file"] else None
            if not f or not f.is_file():
                print(f"WARNING: approved image for {a['id']} is missing ({a['approved_file']})")
            elif sha256_file(f) != a["approved_sha256"]:
                print(f"WARNING: approved image for {a['id']} changed on disk since approval")

    for u in unexpected_incoming(m, paths):
        print(f"Note: incoming/{u}")

    ready = [a for a in m["assets"] if a["status"] == "ready"]
    print("Ready: " + (", ".join(a["id"] for a in ready) if ready else "none"))
    if args.all:
        print()
        for a in m["assets"]:
            why = f": {'; '.join(a['blocked_reasons'])}" if a["status"] == "blocked" else ""
            print(f"  {a['id']:<4} {a['status']:<15} att={a['attempts']} {a['title']}{why}")
    else:
        blocked = [a for a in m["assets"] if a["status"] == "blocked"]
        if blocked:
            first = blocked[0]
            print(f"Blocked: {len(blocked)} (first: {first['id']}: {'; '.join(first['blocked_reasons'])})")
            print(f"  (`{SCRIPT} status --all` lists every asset with its reasons)")
    return 0


def cmd_next(paths: Paths, args) -> int:
    m = load_manifest(paths)
    scan_incoming(m, paths)
    rc = _advance(m, paths)
    save_manifest(paths, m)
    return rc


def _advance(m: dict, paths: Paths) -> int:
    fl = in_flight(m)
    if fl:
        a = fl[0]
        if len(fl) > 1:
            print(f"Note: several assets are in flight ({', '.join(x['id'] for x in fl)}); handling {a['id']} first.")
        if a["status"] in ("prompt_prepared", "awaiting_image"):
            write_next_prompt(paths, render_prompt_doc(m, paths, a, f"{SCRIPT} next"))
            print(f"{a['id']} is still waiting for its image (attempt {a['attempts']}).")
            print(f"Prompt: {paths.rel(paths.next_prompt)} (rewritten, unchanged)")
            print(f"Save the image as {a['incoming_path']}, then run `{SCRIPT} validate`.")
        elif a["status"] == "received":
            print(f"An image for {a['id']} has arrived. Run `{SCRIPT} validate`.")
        elif a["status"] == "needs_review":
            print(f"{a['id']} passed the automatic checks and needs your visual review:")
            for c in a["candidates"]:
                print("\n".join(format_validation(c)))
            print(f"Run `{SCRIPT} review {a['id']}`, then `approve {a['id']}` or `reject {a['id']} --reason \"...\"`.")
        else:
            print(f"{a['id']} failed: {a['failure_reason']}")
            print(f"Run `{SCRIPT} retry {a['id']}` to prepare a new attempt.")
        return 0

    for a in m["assets"]:
        if a["status"] == "ready":
            a["attempts"] += 1
            a["candidates"] = []
            set_status(paths, a, "prompt_prepared", "prompt_prepared", f"attempt {a['attempts']}")
            write_next_prompt(paths, render_prompt_doc(m, paths, a, f"{SCRIPT} next"))
            print(f"Prepared {a['id']} — {a['title']} (attempt {a['attempts']}).")
            print(f"Open {paths.rel(paths.next_prompt)} and follow it. Attach in ChatGPT, in order:")
            for i, att in enumerate(a["attachments"]):
                print(f"  {i + 1}. {att['path']}")
            print(f"Save the result as {a['incoming_path']}, then run `{SCRIPT} validate`.")
            return 0

    remaining = [a for a in m["assets"] if a["status"] != "approved" and not (a["optional"] and not a["requested"])]
    if not remaining:
        print("All required assets are approved.")
        opt = [a["id"] for a in m["assets"] if a["optional"] and a["status"] != "approved"]
        if opt:
            print(f"Optional assets not requested: {', '.join(opt)}")
        open_cps = [c["id"] for c in m["checkpoints"] if c["status"] != "passed"]
        if open_cps:
            print(f"Checkpoints still to sign off: {', '.join(open_cps)}")
            cp = get_checkpoint(m, open_cps[0])
            print_checkpoint_report(m, cp)
            write_next_prompt(paths, render_checkpoint_doc(m, cp))
        else:
            write_next_prompt(paths, "# Nothing to generate\n\nAll required assets are approved.\n")
        return 0

    a = remaining[0]
    cp = blocking_checkpoint(m, a)
    if cp:
        print_checkpoint_report(m, cp)
        write_next_prompt(paths, render_checkpoint_doc(m, cp))
        return 0
    print(f"No asset is ready. The next one in order is {a['id']} ({a['status']}):")
    for r in a["blocked_reasons"]:
        print(f"  - {r}")
    write_next_prompt(
        paths,
        f"# No prompt ready\n\nNext in order: **{a['id']}**, blocked by:\n\n"
        + "\n".join(f"- {r}" for r in a["blocked_reasons"])
        + f"\n\nRun `{SCRIPT} status` for details.\n",
    )
    return 0


def cmd_resume(paths: Paths, args) -> int:
    m = load_manifest(paths)
    print(f"Resuming from {paths.rel(paths.manifest)} (PROMPTS.md sha256 {m['source']['sha256'][:12]}).")
    args.all = False
    args.json = False
    cmd_status(paths, args)
    print()
    m = load_manifest(paths)
    scan_incoming(m, paths)
    rc = _advance(m, paths)
    save_manifest(paths, m)
    return rc


def cmd_validate(paths: Paths, args) -> int:
    m = load_manifest(paths)
    scan_incoming(m, paths)
    validatable = ("prompt_prepared", "awaiting_image", "received", "needs_review")
    if args.id:
        a = get_asset(m, args.id)
        if a["status"] not in validatable:
            hint = {
                "approved": "it is approved; approved images are protected",
                "failed": f"it failed; run `{SCRIPT} retry {a['id']}` first",
                "blocked": "it is blocked: " + "; ".join(a["blocked_reasons"]),
                "ready": f"no prompt was prepared; run `{SCRIPT} next`",
            }[a["status"]]
            raise CliError(f"cannot validate {a['id']}: {hint}")
        targets = [a]
    else:
        targets = [a for a in m["assets"] if a["status"] in validatable]
    if not targets:
        print("Nothing to validate (no asset is waiting for an image).")
    any_fail = False
    for a in targets:
        files = candidate_files(paths, a["id"])
        if not files:
            if a["status"] == "prompt_prepared":
                set_status(paths, a, "awaiting_image", "validate", "no image found yet")
            print(f"{a['id']}: no image yet. Expected {a['incoming_path']}")
            continue
        results = [validate_file(paths, m, a, f) for f in files]
        a["candidates"] = results
        passing = [r for r in results if not r["errors"]]
        best = passing[0] if passing else results[0]
        prev = a["validation"]
        if prev and (prev.get("sha256"), prev["name"]) != (best.get("sha256"), best["name"]):
            a["validation_history"].append(prev)
        a["validation"] = best
        print(f"{a['id']} — {a['title']} (attempt {a['attempts']}):")
        for r in results:
            print("\n".join(format_validation(r)))
        if passing:
            if a["status"] != "needs_review":
                set_status(paths, a, "needs_review", "validate", f"{len(passing)}/{len(results)} file(s) passed")
            print(f"  -> needs_review. The checks can't judge style or composition: look at it with "
                  f"`{SCRIPT} review {a['id']}`, then approve or reject.")
        else:
            any_fail = True
            reason = "validation failed: " + "; ".join(
                f"{r['name']}: " + ", ".join(c["check"] for c in r["checks"] if c["result"] == "fail") for r in results
            )
            a["failure_reason"] = reason
            set_status(paths, a, "failed", "validate", reason)
            print(f"  -> failed. Files stay in incoming/ for inspection. Run `{SCRIPT} retry {a['id']}` "
                  "to move them to rejected/ and prepare a new attempt.")
    for u in unexpected_incoming(m, paths):
        print(f"Note: incoming/{u}")
    refresh(m, paths)
    save_manifest(paths, m)
    return 1 if any_fail else 0


def confirm(question: str, expected: str, assume_yes: bool) -> None:
    if assume_yes:
        return
    if not sys.stdin.isatty():
        raise CliError(
            "this needs your confirmation in an interactive terminal. If you have reviewed it yourself, "
            "re-run with --yes"
        )
    ans = input(f"{question} Type {expected} to confirm: ").strip().upper()
    if ans != expected:
        raise CliError("not confirmed; nothing changed")


def cmd_approve(paths: Paths, args) -> int:
    m = load_manifest(paths)
    a = get_asset(m, args.id)
    if a["status"] == "approved":
        raise CliError(f"{a['id']} is already approved ({a['approved_file']}); approved images are protected")
    if a["status"] != "needs_review":
        raise CliError(
            f"cannot approve {a['id']}: status is {a['status']}. Only images that passed `validate` "
            "(status needs_review) can be approved"
        )
    dest = paths.abs(a["approved_path"])
    if dest.exists():
        raise CliError(f"{a['approved_path']} already exists; refusing to overwrite an approved image")
    passing = [c for c in a["candidates"] if not c["errors"]]
    if args.file:
        chosen = next((c for c in a["candidates"] if c["name"] == args.file), None)
        if chosen is None:
            raise CliError(f"{args.file} is not a validated candidate for {a['id']}: "
                           + ", ".join(c["name"] for c in a["candidates"]))
        if chosen["errors"]:
            raise CliError(f"{args.file} failed validation and cannot be approved")
    elif len(passing) == 1:
        chosen = passing[0]
    else:
        raise CliError(f"{a['id']} has several valid candidates; pick one with --file: "
                       + ", ".join(c["name"] for c in passing))
    src = paths.abs(chosen["file"])
    if not src.is_file():
        raise CliError(f"{chosen['file']} no longer exists; run `{SCRIPT} validate` again")
    if sha256_file(src) != chosen.get("sha256"):
        raise CliError(f"{chosen['name']} changed since it was validated; run `{SCRIPT} validate` again")
    if chosen["warnings"] and not args.accept_warnings:
        warns = [f"{c['check']}: {c['detail']}" for c in chosen["checks"] if c["result"] == "warn"]
        raise CliError(
            f"{chosen['name']} has validation warnings:\n  - " + "\n  - ".join(warns)
            + "\nIf you reviewed them and accept them, re-run with --accept-warnings"
        )
    confirm(f"Approve {chosen['file']} as {a['id']}? You must have looked at it yourself.", a["id"], args.yes)

    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.move(str(src), dest)
    for f in candidate_files(paths, a["id"]):
        move_to_rejected(paths, a, f, f"not selected; {chosen['name']} was approved")
    a["approved_file"] = paths.rel(dest)
    a["approved_sha256"] = sha256_file(dest)
    a["approved_size"] = [chosen["width"], chosen["height"]]
    a["approved_at"] = now()
    a["approval_note"] = args.note
    a["validation"] = chosen
    a["failure_reason"] = None
    set_status(paths, a, "approved", "approve",
               f"{chosen['name']} -> {a['approved_file']}" + (f"; note: {args.note}" if args.note else "")
               + ("; warnings accepted" if chosen["warnings"] else ""))
    before = {x["id"] for x in m["assets"] if x["status"] == "ready"}
    refresh(m, paths)
    save_manifest(paths, m)
    print(f"Approved {a['id']}: {a['approved_file']}")
    unlocked = [x["id"] for x in m["assets"] if x["status"] == "ready" and x["id"] not in before]
    if unlocked:
        print(f"Now ready: {', '.join(unlocked)}")
    for c in m["checkpoints"]:
        if a["id"] in c["assets"] and c["status"] != "passed":
            left = [x for x in c["assets"] if assets_by_id(m)[x]["status"] != "approved"]
            print(f"Checkpoint {c['id']}: " + (f"still waiting for {', '.join(left)}" if left
                                                else f"all assets approved; sign off with `checkpoint {c['id']} --pass`"))
    if not getattr(args, "quiet_next", False):
        print(f"Next: `{SCRIPT} next`")
    return 0


def cmd_reject(paths: Paths, args) -> int:
    m = load_manifest(paths)
    a = get_asset(m, args.id)
    reason = (args.reason or "").strip()
    if not reason:
        raise CliError("a reason is required: --reason \"...\"")
    if a["status"] == "approved":
        raise CliError(f"{a['id']} is approved; approved images are protected and cannot be rejected here")
    if a["status"] not in ("received", "needs_review", "failed"):
        raise CliError(f"cannot reject {a['id']}: status is {a['status']} (no image to reject)")
    files = candidate_files(paths, a["id"])
    if args.file:
        files = [f for f in files if f.name == args.file]
        if not files:
            raise CliError(f"{args.file} not found in incoming/ for {a['id']}")
    rejected_names = {f.name for f in files}
    moved = [move_to_rejected(paths, a, f, reason) for f in files]
    a["candidates"] = [c for c in a["candidates"] if c["name"] not in rejected_names]
    remaining_ok = [c for c in a["candidates"] if not c["errors"] and paths.abs(c["file"]).is_file()]
    if args.file and remaining_ok:
        a["validation"] = remaining_ok[0]
        audit(paths, {"event": "reject_file", "asset": a["id"], "file": args.file, "reason": reason})
        print(f"Rejected {args.file} ({reason}); {a['id']} still has: {', '.join(c['name'] for c in remaining_ok)}")
    else:
        a["failure_reason"] = f"rejected: {reason}"
        if a["status"] != "failed":
            set_status(paths, a, "failed", "reject", reason)
        else:
            audit(paths, {"event": "reject", "asset": a["id"], "reason": reason})
            a["history"].append({"at": now(), "event": "reject", "from": "failed", "to": "failed", "detail": reason})
        print(f"Rejected {a['id']}: {reason}")
        for x in moved:
            print(f"  kept for reference: {x}")
        print(f"Run `{SCRIPT} retry {a['id']}` to prepare attempt {a['attempts'] + 1}.")
    save_manifest(paths, m)
    return 0


def cmd_retry(paths: Paths, args) -> int:
    m = load_manifest(paths)
    a = get_asset(m, args.id)
    if a["status"] == "approved":
        raise CliError(f"{a['id']} is approved; approved images are protected")
    if a["status"] != "failed":
        raise CliError(f"cannot retry {a['id']}: status is {a['status']}; only failed or rejected assets can be retried")
    others = [x["id"] for x in in_flight(m) if x["id"] != a["id"]]
    if others:
        raise CliError(f"finish {', '.join(others)} first (one image at a time)")
    hard = [r for r in a["blocked_reasons"] if not r.startswith("optional")]
    if hard:
        raise CliError(f"cannot retry {a['id']}: " + "; ".join(hard))
    for f in candidate_files(paths, a["id"]):
        move_to_rejected(paths, a, f, f"superseded by retry ({a['failure_reason']})")
    if a["validation"]:
        a["validation_history"].append(a["validation"])
    a["validation"] = None
    a["candidates"] = []
    a["attempts"] += 1
    set_status(paths, a, "prompt_prepared", "retry", f"attempt {a['attempts']}; previous: {a['failure_reason']}")
    write_next_prompt(paths, render_prompt_doc(m, paths, a, f"{SCRIPT} retry {a['id']}"))
    save_manifest(paths, m)
    print(f"Prepared attempt {a['attempts']} for {a['id']}. Previous failure: {a['failure_reason']}")
    print(f"Prompt: {paths.rel(paths.next_prompt)}. Save the image as {a['incoming_path']}, then run `{SCRIPT} validate`.")
    return 0


def cmd_export_prompt(paths: Paths, args) -> int:
    m = load_manifest(paths)
    a = get_asset(m, args.id)
    out = Path(args.out) if args.out else paths.exports / f"{a['id']}.md"
    if not out.is_absolute():
        out = paths.root / out
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(render_prompt_doc(m, paths, a, f"{SCRIPT} export-prompt {a['id']}"), encoding="utf-8")
    print(f"Exported {a['id']} prompt and reference checklist to {paths.rel(out)} (status unchanged: {a['status']})")
    for i, att in enumerate(a["attachments"]):
        state = "present" if paths.abs(att["path"]).is_file() else "MISSING"
        print(f"  attach {i + 1}: {att['path']} [{state}]")
    if a["blocked_reasons"] and a["status"] in ("blocked", "ready"):
        print("  not ready yet: " + "; ".join(a["blocked_reasons"]))
    return 0


# ---------------------------------------------------------------------------
# Desktop helpers for assisted mode (best effort: each one falls back to
# printed instructions when the platform does not support it)
# ---------------------------------------------------------------------------

CHATGPT_URL = "https://chatgpt.com/"
DOWNLOAD_EXTS = (".png", ".jpg", ".jpeg", ".webp")
PARTIAL_EXTS = (".crdownload", ".download", ".part", ".tmp")


def _opener():
    if sys.platform == "darwin":
        return ["open"]
    if os.name == "nt":
        return "startfile"
    if shutil.which("wslview"):
        return ["wslview"]
    if shutil.which("xdg-open") and (os.environ.get("DISPLAY") or os.environ.get("WAYLAND_DISPLAY")):
        return ["xdg-open"]
    return None


def open_paths(targets: list[Path]) -> bool:
    """Open files or folders with the system viewer. Returns False if that is not possible."""
    opener = _opener()
    if opener is None:
        return False
    for t in targets:
        try:
            if opener == "startfile":
                os.startfile(t)  # type: ignore[attr-defined]
            else:
                subprocess.Popen(opener + [str(t)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except OSError:
            return False
    return True


def copy_to_clipboard(text: str) -> bool:
    for cmd in (["pbcopy"], ["wl-copy"], ["xclip", "-selection", "clipboard"], ["clip"]):
        if shutil.which(cmd[0]):
            try:
                subprocess.run(cmd, input=text.encode("utf-8"), check=True, timeout=5,
                               stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                return True
            except (OSError, subprocess.SubprocessError):
                continue
    return False


def open_url(url: str) -> bool:
    import webbrowser

    try:
        return bool(webbrowser.open(url, new=2))
    except webbrowser.Error:
        return False


def stage_attachments(paths: Paths, a: dict) -> Path:
    """Copy the asset's attachments into workflow/attach/ as 1-night.png, 2-B1.png, ... (in prompt order)."""
    d = paths.workflow / "attach"
    if d.exists():
        shutil.rmtree(d)
    d.mkdir(parents=True)
    for i, att in enumerate(a["attachments"], 1):
        label = att["id"] if att["kind"] == "asset" else Path(att["token"]).stem
        shutil.copy2(paths.abs(att["path"]), d / f"{i}-{label}.png")
    return d


def snapshot_folder(folder: Path) -> dict:
    out = {}
    for p in folder.iterdir():
        if p.is_file():
            st = p.stat()
            out[p.name] = (st.st_mtime, st.st_size)
    return out


def wait_for_download(folder: Path, before: dict, timeout: float, poll: float = 1.0) -> Path | None:
    """Return the first new or changed image in `folder` once its size stops changing."""
    deadline = time.monotonic() + timeout
    sizes: dict[str, int] = {}
    while time.monotonic() < deadline:
        for p in sorted(folder.iterdir()):
            if not p.is_file() or p.name.startswith(".") or p.suffix.lower() not in DOWNLOAD_EXTS:
                continue
            st = p.stat()
            if before.get(p.name) == (st.st_mtime, st.st_size):
                continue
            if any((folder / (p.name + ext)).exists() for ext in PARTIAL_EXTS):
                continue
            if st.st_size > 0 and sizes.get(p.name) == st.st_size:
                return p
            sizes[p.name] = st.st_size
        time.sleep(poll)
    return None


def next_incoming_name(paths: Paths, aid: str) -> str:
    if not candidate_files(paths, aid):
        return f"{aid}.png"
    n = 1
    while any(paths.incoming.glob(f"{aid}-{n}.*")):
        n += 1
    return f"{aid}-{n}.png"


def import_download(src: Path, dest: Path) -> tuple[Path, str]:
    """Move a downloaded image to `dest` (a .png path), converting to PNG when needed."""
    if src.suffix.lower() == ".png":
        shutil.move(str(src), dest)
        return dest, ""
    try:
        from PIL import Image

        with Image.open(src) as im:
            im.save(dest, "PNG")
        src.unlink()
        return dest, f" (converted from {src.suffix} to PNG)"
    except ImportError:
        pass
    except Exception as exc:  # unreadable download: keep it as-is so validate reports it
        kept = dest.with_suffix(src.suffix.lower())
        shutil.move(str(src), kept)
        return kept, f" (could not convert: {exc})"
    if shutil.which("sips"):
        res = subprocess.run(["sips", "-s", "format", "png", str(src), "--out", str(dest)],
                             stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if res.returncode == 0 and dest.is_file():
            src.unlink()
            return dest, f" (converted from {src.suffix} to PNG)"
    kept = dest.with_suffix(src.suffix.lower())
    shutil.move(str(src), kept)
    return kept, f" (kept as {src.suffix}: no PNG converter available)"


def _drain_stdin() -> None:
    """Drop anything typed while `go` was waiting, so it isn't read as the next answer."""
    try:
        import termios

        termios.tcflush(sys.stdin, termios.TCIFLUSH)
    except Exception:  # not a real terminal (or not POSIX): nothing to drain
        pass


def _call(fn, paths: Paths, **kw) -> int:
    return fn(paths, argparse.Namespace(**kw))


def _go_generate(paths: Paths, a: dict, downloads: Path, args) -> bool:
    """Set up one generation in ChatGPT and import the image the user downloads."""
    m = load_manifest(paths)
    a = assets_by_id(m)[a["id"]]
    print(f"\n=== {a['id']} — {a['title']} (attempt {a['attempts']}) ===")
    missing = [att["path"] for att in a["attachments"] if not paths.abs(att["path"]).is_file()]
    if missing:
        print("Cannot start: missing " + ", ".join(missing))
        return False
    write_next_prompt(paths, render_prompt_doc(m, paths, a, f"{SCRIPT} go"))
    before = snapshot_folder(downloads)
    staged = stage_attachments(paths, a)
    names = sorted(p.name for p in staged.iterdir())

    if copy_to_clipboard(a["prompt"]):
        print("1. The prompt is on your clipboard.")
    else:
        print(f"1. Copy the prompt from {paths.rel(paths.next_prompt)} (section 2).")
    if not args.no_browser and open_url(CHATGPT_URL):
        print("2. A new ChatGPT chat is open in your browser.")
    else:
        print(f"2. Open a new chat at {CHATGPT_URL}")
    shown = open_paths([staged])
    print(f"3. Drag {'these' if len(names) > 1 else 'this'} into the chat"
          + (", in this order" if len(names) > 1 else "") + ": " + ", ".join(names)
          + ("" if shown else f"  (folder: {paths.rel(staged)})"))
    shape = f"{a['ratio']} ratio" if a["ratio"] else (
        f"same size as {a['size_rule']['same_as']}" if a["size_rule"] else "ratio not specified")
    print(f"4. Paste the prompt, send it, then download the image ({shape}).")
    print("   Regenerate first if you see text, black outlines, a 3D/photo look, a watermark"
          + (", or a background that isn't flat " + a["key_hex"] if a["key_hex"] else "") + ".")
    print(f"Waiting for the download in {downloads} ... (Ctrl+C to stop)")

    f = wait_for_download(downloads, before, args.timeout * 60, args.poll)
    if f is None:
        print(f"No new image arrived within {args.timeout:g} minutes. Run `go` again when you're ready.")
        return False
    paths.incoming.mkdir(parents=True, exist_ok=True)
    dest, note = import_download(f, paths.incoming / next_incoming_name(paths, a["id"]))
    audit(paths, {"event": "download_imported", "asset": a["id"], "from": f.name, "to": paths.rel(dest)})
    print(f"Got it: {f.name} -> {paths.rel(dest)}{note}")
    return True


def _go_review(paths: Paths, a: dict, downloads: Path, args) -> bool:
    m = load_manifest(paths)
    a = assets_by_id(m)[a["id"]]
    print(f"\n=== Review {a['id']} — {a['title']} ===")
    for c in a["candidates"]:
        print("\n".join(format_validation(c)))
    files = candidate_files(paths, a["id"])
    if files and open_paths(files):
        print("Opened in your image viewer. Compare it with the attachments and the prompt.")
    else:
        for f in files:
            print(f"Open and look at: {paths.rel(f)}")
    print("The checks can't see style, text, outlines or composition. That's your call.")
    passing = [c for c in a["candidates"] if not c["errors"]]
    _drain_stdin()
    while True:
        ans = input("[a] approve  [r] reject  [t] try again  [q] quit: ").strip().lower()
        if ans == "a":
            chosen = passing[0]
            if len(passing) > 1:
                for i, c in enumerate(passing, 1):
                    print(f"  {i}. {c['name']} ({c['result']})")
                pick = input("Which one? Number: ").strip()
                if not pick.isdigit() or not 1 <= int(pick) <= len(passing):
                    print("Pick one of the numbers above.")
                    continue
                chosen = passing[int(pick) - 1]
            accept = False
            if chosen["warnings"]:
                for c in chosen["checks"]:
                    if c["result"] == "warn":
                        print(f"  warning: {c['check']}: {c['detail']}")
                if input("Approve despite these warnings? [y/N]: ").strip().lower() != "y":
                    continue
                accept = True
            try:
                _call(cmd_approve, paths, id=a["id"], file=chosen["name"], note=None,
                      accept_warnings=accept, yes=True, quiet_next=True)
            except CliError as exc:
                print(f"error: {exc}")
                continue
            return True
        if ans == "r":
            reason = input("What's wrong with it? ").strip()
            if not reason:
                print("A reason is required, so it's recorded for the retry.")
                continue
            _call(cmd_reject, paths, id=a["id"], reason=reason, file=None)
            _call(cmd_retry, paths, id=a["id"])
            return True
        if ans == "t":
            if not _go_generate(paths, a, downloads, args):
                return False
            _call(cmd_validate, paths, id=a["id"])
            return True
        if ans == "q":
            return False
        print("Type a, r, t or q.")


def cmd_go(paths: Paths, args) -> int:
    if not sys.stdin.isatty():
        raise CliError("`go` is interactive: run it in a terminal")
    downloads = Path(args.downloads).expanduser()
    if not downloads.is_dir():
        raise CliError(f"downloads folder {downloads} not found; pass --downloads PATH")
    print("Assisted mode: one image at a time. Press Ctrl+C to stop; `go` resumes where you left off.")
    try:
        while True:
            m = load_manifest(paths)
            scan_incoming(m, paths)
            save_manifest(paths, m)
            fl = in_flight(m)
            if not fl:
                ready = any(x["status"] == "ready" for x in m["assets"])
                if ready:  # _go_generate prints its own instructions for the prepared asset
                    with contextlib.redirect_stdout(io.StringIO()):
                        _advance(m, paths)
                else:
                    _advance(m, paths)
                save_manifest(paths, m)
                if not ready:
                    cp = next((c for c in m["checkpoints"] if c["status"] != "passed"
                               and all(assets_by_id(m)[x]["status"] == "approved" for x in c["assets"])), None)
                    if cp:
                        print(f"\n`go` paused at {cp['id']}. Commit and push the approved images, ask Claude "
                              f"to check them, then run `{SCRIPT} checkpoint {cp['id']} --pass` and `go` again.")
                    return 0
                continue
            a = fl[0]
            if a["status"] in ("prompt_prepared", "awaiting_image"):
                _drain_stdin()
                if not _go_generate(paths, a, downloads, args):
                    return 0
            elif a["status"] == "received":
                _call(cmd_validate, paths, id=a["id"])
                m = load_manifest(paths)
                if assets_by_id(m)[a["id"]]["status"] == "failed":
                    print("The automatic checks failed, so this image can't be approved.")
            elif a["status"] == "needs_review":
                if not _go_review(paths, a, downloads, args):
                    return 0
            else:  # failed
                print(f"\n{a['id']} failed: {a['failure_reason']}")
                ans = input("[r] retry with a new attempt  [q] quit: ").strip().lower()
                if ans != "r":
                    return 0
                _call(cmd_retry, paths, id=a["id"])
    except KeyboardInterrupt:
        print("\nStopped. Nothing is lost; run `go` again to continue.")
        return 0


def cmd_review(paths: Paths, args) -> int:
    m = load_manifest(paths)
    a = get_asset(m, args.id)
    print(f"{a['id']} — {a['title']}: {a['status']} (attempt {a['attempts']})")
    files: list[Path] = []
    if a["status"] == "approved":
        print(f"  approved file: {a['approved_file']}")
        files = [paths.abs(a["approved_file"])]
        print("\n".join(format_validation(a["validation"])))
    else:
        for c in a["candidates"]:
            print("\n".join(format_validation(c)))
        files = candidate_files(paths, a["id"])
        if not files:
            print(f"  no image in incoming/ (expected {a['incoming_path']})")
    print("  Look for things the automatic checks can't see: text, black outlines, 3D/photo look, "
          "watermark, wrong style or composition, and continuity with the attached references.")
    for f in files:
        print(f"  file: {paths.rel(f)}")
    if files and not args.no_open and not open_paths(files):
        print("  (no image viewer available here; open the file(s) above yourself)")
    if a["status"] == "needs_review":
        print(f"  Decide: `{SCRIPT} approve {a['id']}` or `{SCRIPT} reject {a['id']} --reason \"...\"`")
    return 0


def cmd_checkpoint(paths: Paths, args) -> int:
    m = load_manifest(paths)
    if not args.id:
        by_id = assets_by_id(m)
        for c in m["checkpoints"]:
            st = ", ".join(f"{x}:{by_id[x]['status']}" for x in c["assets"])
            print(f"{c['id']:<10} {c['status']:<8} after {c['after']}; {st}")
            print(f"           {c['text']}")
        return 0
    cp = get_checkpoint(m, args.id)
    if not args.passed:
        print_checkpoint_report(m, cp)
        return 0
    if cp["status"] == "passed":
        print(f"{cp['id']} already passed at {cp['passed_at']}.")
        return 0
    by_id = assets_by_id(m)
    pending = [x for x in cp["assets"] if by_id[x]["status"] != "approved"]
    if pending:
        print_checkpoint_report(m, cp)
        raise CliError(f"cannot pass {cp['id']}: not approved yet: {', '.join(pending)}")
    confirm(f"Pass checkpoint {cp['id']} ({', '.join(cp['assets'])})?", cp["id"], args.yes)
    cp["status"] = "passed"
    cp["passed_at"] = now()
    cp["note"] = args.note
    audit(paths, {"event": "checkpoint_passed", "checkpoint": cp["id"], "note": args.note})
    before = {x["id"] for x in m["assets"] if x["status"] == "ready"}
    refresh(m, paths)
    save_manifest(paths, m)
    print(f"Checkpoint {cp['id']} passed.")
    unlocked = [x["id"] for x in m["assets"] if x["status"] == "ready" and x["id"] not in before]
    if unlocked:
        print(f"Now ready: {', '.join(unlocked)}")
    return 0


def cmd_enable_optional(paths: Paths, args) -> int:
    m = load_manifest(paths)
    a = get_asset(m, args.id)
    if not a["optional"]:
        raise CliError(f"{a['id']} is not optional")
    if not (args.reason or "").strip():
        raise CliError("a reason is required: --reason \"...\"")
    if a["requested"]:
        print(f"{a['id']} is already requested.")
        return 0
    a["requested"] = True
    a["notes"].append(f"{now()}: requested: {args.reason}")
    audit(paths, {"event": "enable_optional", "asset": a["id"], "reason": args.reason})
    refresh(m, paths)
    save_manifest(paths, m)
    print(f"{a['id']} requested ({args.reason}); status {a['status']}"
          + (f": {'; '.join(a['blocked_reasons'])}" if a["blocked_reasons"] else ""))
    return 0


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="planet_images.py",
        description="Little Planet human-in-the-loop image pipeline (no image generation, no auto-approval).",
    )
    p.add_argument("--root", default=str(Path(__file__).resolve().parent.parent), help="repository root")
    sub = p.add_subparsers(dest="command", required=True)

    s = sub.add_parser("init", help="build the manifest from PROMPTS.md")
    s.add_argument("--refresh", action="store_true", help="re-read PROMPTS.md, keep progress")
    s.set_defaults(func=cmd_init)

    s = sub.add_parser("go", help="assisted mode: walks you through every image, one at a time")
    s.add_argument("--downloads", default=str(Path.home() / "Downloads"), help="where your browser saves downloads")
    s.add_argument("--timeout", type=float, default=30, help="minutes to wait for each download (default 30)")
    s.add_argument("--poll", type=float, default=1.0, help=argparse.SUPPRESS)
    s.add_argument("--no-browser", action="store_true", help="don't open ChatGPT in the browser")
    s.set_defaults(func=cmd_go)

    s = sub.add_parser("next", help="prepare the next eligible image prompt")
    s.set_defaults(func=cmd_next)

    s = sub.add_parser("status", help="show progress, blocked assets and pending reviews")
    s.add_argument("--all", action="store_true", help="list every asset")
    s.add_argument("--json", action="store_true", help="machine-readable counts")
    s.set_defaults(func=cmd_status)

    s = sub.add_parser("validate", help="validate newly received images")
    s.add_argument("id", nargs="?", help="only this asset")
    s.set_defaults(func=cmd_validate)

    s = sub.add_parser("review", help="show validation results and open the image for visual review")
    s.add_argument("id")
    s.add_argument("--no-open", action="store_true", help="do not launch an image viewer")
    s.set_defaults(func=cmd_review)

    s = sub.add_parser("approve", help="approve a reviewed asset (human decision)")
    s.add_argument("id")
    s.add_argument("--file", help="which candidate to approve, e.g. B1-2.png")
    s.add_argument("--note", help="note recorded with the approval")
    s.add_argument("--accept-warnings", action="store_true", help="approve despite validation warnings")
    s.add_argument("--yes", action="store_true", help="skip the interactive confirmation")
    s.set_defaults(func=cmd_approve)

    s = sub.add_parser("reject", help="reject an asset and record why")
    s.add_argument("id")
    s.add_argument("--reason", required=True)
    s.add_argument("--file", help="reject only this candidate")
    s.set_defaults(func=cmd_reject)

    s = sub.add_parser("retry", help="prepare a new attempt for a rejected or failed asset")
    s.add_argument("id")
    s.set_defaults(func=cmd_retry)

    s = sub.add_parser("resume", help="resume from the saved manifest")
    s.set_defaults(func=cmd_resume)

    s = sub.add_parser("export-prompt", help="export one asset's prompt and reference checklist")
    s.add_argument("id")
    s.add_argument("--out", help="output path (default workflow/exports/<ID>.md)")
    s.set_defaults(func=cmd_export_prompt)

    s = sub.add_parser("checkpoint", help="list checkpoints, show one, or pass one (human decision)")
    s.add_argument("id", nargs="?")
    s.add_argument("--pass", dest="passed", action="store_true", help="record that the checkpoint passed")
    s.add_argument("--note", help="note recorded with the sign-off")
    s.add_argument("--yes", action="store_true", help="skip the interactive confirmation")
    s.set_defaults(func=cmd_checkpoint)

    s = sub.add_parser("enable-optional", help="request an optional asset (e.g. H4 when Claude asks)")
    s.add_argument("id")
    s.add_argument("--reason", required=True)
    s.set_defaults(func=cmd_enable_optional)
    return p


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    paths = Paths(Path(args.root))
    try:
        return args.func(paths, args)
    except CliError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
