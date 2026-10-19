"""Tests for scripts/planet_images.py (stdlib unittest).

Run:  python -m unittest discover -s scripts/tests -v
"""

from __future__ import annotations

import contextlib
import importlib.util
import io
import json
import os
import shutil
import struct
import sys
import tempfile
import threading
import time
import unittest
import zlib
from pathlib import Path
from unittest import mock

HERE = Path(__file__).resolve().parent
REPO = HERE.parent.parent
sys.path.insert(0, str(HERE.parent))

import planet_images as pi  # noqa: E402

REAL_PROMPTS = REPO / "docs/plans/assets/planet/PROMPTS.md"


# ---------------------------------------------------------------------------
# PNG fixtures
# ---------------------------------------------------------------------------


def _chunk(ctype: bytes, body: bytes) -> bytes:
    return struct.pack(">I", len(body)) + ctype + body + struct.pack(">I", zlib.crc32(ctype + body) & 0xFFFFFFFF)


def _filter_row(ft: int, row: bytes, prev: bytes, bpp: int) -> bytes:
    out = bytearray(len(row))
    for i, v in enumerate(row):
        a = row[i - bpp] if i >= bpp else 0
        b = prev[i]
        c = prev[i - bpp] if i >= bpp else 0
        if ft == 0:
            pred = 0
        elif ft == 1:
            pred = a
        elif ft == 2:
            pred = b
        elif ft == 3:
            pred = (a + b) >> 1
        else:
            p = a + b - c
            pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
            pred = a if pa <= pb and pa <= pc else b if pb <= pc else c
        out[i] = (v - pred) & 0xFF
    return bytes(out)


def encode_png(w, h, pixel, color_type=2, filters=(0,), bit_depth=8, palette=None) -> bytes:
    """pixel(x, y) -> (r, g, b[, a]) (or a palette index for colour type 3)."""
    channels = {0: 1, 2: 3, 3: 1, 6: 4}[color_type]
    rows, prev = [], bytes(w * channels * bit_depth // 8)
    for y in range(h):
        row = bytearray()
        for x in range(w):
            p = pixel(x, y)
            if color_type == 3:
                vals = [p]
            elif color_type == 0:
                vals = [p[0]]
            else:
                vals = list(p[:3]) + ([p[3] if len(p) > 3 else 255] if color_type == 6 else [])
            for v in vals:
                row += bytes([v, v]) if bit_depth == 16 else bytes([v])
        bpp = max(1, channels * bit_depth // 8)
        ft = filters[y % len(filters)]
        rows.append(bytes([ft]) + _filter_row(ft, bytes(row), prev, bpp))
        prev = bytes(row)
    ihdr = struct.pack(">IIBBBBB", w, h, bit_depth, color_type, 0, 0, 0)
    out = pi.PNG_SIG + _chunk(b"IHDR", ihdr)
    if palette:
        out += _chunk(b"PLTE", b"".join(bytes(c) for c in palette))
    return out + _chunk(b"IDAT", zlib.compress(b"".join(rows))) + _chunk(b"IEND", b"")


def sky(w, h):
    return encode_png(w, h, lambda x, y: (20 + (x * 7) % 30, 30 + y * 100 // h, 90 + (x * y) % 60))


def keyed(w, h, key, art_box=(0.35, 0.35, 0.65, 0.65), noise=0, alpha_bg=255):
    """Flat key background (+/- noise) with a varied artwork rectangle (fractions of w/h)."""
    kr, kg, kb = key
    x0, y0, x1, y1 = (int(art_box[0] * w), int(art_box[1] * h), int(art_box[2] * w), int(art_box[3] * h))

    def px(x, y):
        if x0 <= x < x1 and y0 <= y < y1:
            return (120 + (x * 3) % 80, 90 + (y * 5) % 60, 70 + (x + y) % 50, 255)
        n = ((x * 31 + y * 17) % (2 * noise + 1)) - noise if noise else 0
        clamp = lambda v: max(0, min(255, v))  # noqa: E731
        return (clamp(kr - abs(n)), clamp(kg + n), clamp(kb - abs(n)), alpha_bg)

    return encode_png(w, h, px, color_type=6)


MAGENTA, GREEN = (255, 0, 255), (0, 255, 0)


# ---------------------------------------------------------------------------
# Harness
# ---------------------------------------------------------------------------


class Workspace(unittest.TestCase):
    """A temporary repository root with a verbatim copy of PROMPTS.md."""

    with_plates = True

    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp(prefix="planet-test-"))
        base = self.tmp / pi.BASE_REL
        base.mkdir(parents=True)
        shutil.copy(REAL_PROMPTS, base / "PROMPTS.md")
        self.paths = pi.Paths(self.tmp)
        if self.with_plates:
            self.add_plates()

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def add_plates(self):
        self.paths.style.mkdir(parents=True, exist_ok=True)
        for name in ("night.png", "day.png", "you.png"):
            (self.paths.style / name).write_bytes(sky(32, 18))

    def run_cli(self, *argv) -> tuple[int, str, str]:
        out, err = io.StringIO(), io.StringIO()
        with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
            rc = pi.main(["--root", str(self.tmp), *argv])
        return rc, out.getvalue(), err.getvalue()

    def ok(self, *argv) -> str:
        rc, out, err = self.run_cli(*argv)
        self.assertEqual(rc, 0, f"{argv} failed: {err}{out}")
        return out

    def fails(self, *argv, contains: str = "") -> str:
        rc, out, err = self.run_cli(*argv)
        self.assertEqual(rc, 2, f"{argv} should have failed: {out}")
        self.assertIn(contains, err)
        return err

    def manifest(self) -> dict:
        return json.loads(self.paths.manifest.read_text(encoding="utf-8"))

    def asset(self, aid) -> dict:
        return pi.assets_by_id(self.manifest())[aid]

    def drop(self, name: str, data: bytes) -> Path:
        self.paths.incoming.mkdir(parents=True, exist_ok=True)
        p = self.paths.incoming / name
        p.write_bytes(data)
        return p

    def produce(self, aid: str, data: bytes, *approve_flags: str):
        """Drive one asset from ready to approved through the real commands."""
        out = self.ok("next")
        self.assertIn(f"Prepared {aid}", out)
        self.drop(f"{aid}.png", data)
        rc, out, err = self.run_cli("validate")
        self.assertEqual(rc, 0, out + err)
        self.assertEqual(self.asset(aid)["status"], "needs_review", out)
        self.ok("approve", aid, "--yes", *approve_flags)
        self.assertEqual(self.asset(aid)["status"], "approved")


# ---------------------------------------------------------------------------
# Parsing
# ---------------------------------------------------------------------------


class TestParsePrompts(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.text = REAL_PROMPTS.read_text(encoding="utf-8")
        cls.parsed = pi.parse_prompts(cls.text)
        cls.by_id = {a["id"]: a for a in cls.parsed["assets"]}

    def test_asset_count_matches_checklist(self):
        ids = [a["id"] for a in self.parsed["assets"]]
        self.assertEqual(len(ids), 65)
        self.assertEqual(len(set(ids)), 65)
        self.assertEqual([a["id"] for a in self.parsed["assets"] if a["optional"]], ["H4"])
        self.assertEqual(ids[:3], ["B1", "B2", "B3"])
        self.assertEqual(ids[-1], "H4")

    def test_prompts_are_verbatim(self):
        for a in self.parsed["assets"]:
            self.assertIn(a["prompt"], self.text, a["id"])
            self.assertNotIn("---8<---", a["prompt"])

    def test_shared_and_group_prompts(self):
        b = self.by_id
        self.assertEqual(b["D2"]["prompt"], b["D3"]["prompt"])
        self.assertEqual(b["D2"]["dependencies"], ["D1"])
        self.assertEqual(b["D3"]["dependencies"], ["D2"])
        for day, night in zip(range(7, 13), range(1, 7)):
            self.assertEqual(b[f"C{day}"]["dependencies"], [f"C{night}"])
            self.assertEqual(b[f"C{day}"]["references"], ["docs/plans/assets/planet/style/day.png"])
        self.assertEqual(b["E12"]["dependencies"], ["E7"])
        self.assertEqual(b["E24"]["dependencies"], ["E12"])
        self.assertEqual(b["E18"]["dependencies"], ["E6"])
        self.assertTrue(b["G1"]["prompt"].startswith("In exactly the style of the attached illustrations"))
        self.assertIn("- on the left, a wooden desk", b["G1"]["prompt"])

    def test_attachment_order_preserved(self):
        self.assertEqual(self.by_id["B4"]["dependencies"], ["B2", "B3"])
        self.assertEqual([x["token"] for x in self.by_id["B3"]["attachments"]], ["B1.png", "style/day.png"])
        self.assertEqual([x["token"] for x in self.by_id["H1"]["attachments"]], ["style/you.png", "style/night.png"])
        self.assertEqual(self.by_id["G1"]["dependencies"], ["E7"])

    def test_requirements(self):
        b = self.by_id
        self.assertEqual(b["B1"]["ratio"], "21:9")
        self.assertIsNone(b["B1"]["key_color"])
        self.assertEqual(b["E7"]["ratio"], "3:4")
        self.assertEqual(b["G5"]["ratio"], "1:1")
        self.assertEqual(b["G5"]["key_region"], "corners")
        self.assertEqual(b["B3"]["size_rule"], {"same_as": "B1"})
        self.assertIsNone(b["H1"]["ratio"])
        self.assertIsNone(b["H1"]["size_rule"])
        self.assertEqual(b["B5"]["key_color"], "green")
        self.assertEqual(b["G4"]["key_color"], "green")
        self.assertEqual(b["C1"]["key_color"], "magenta")
        self.assertEqual(b["C2"]["continuation_of"], "C1")
        self.assertIsNone(b["G2"]["continuation_of"])

    def test_checkpoints(self):
        cps = {c["id"]: c for c in self.parsed["checkpoints"]}
        self.assertEqual(list(cps), ["STOP-B8", "STOP-C12", "STOP-D10", "STOP-E7", "STOP-G5", "STOP-H3"])
        self.assertEqual(cps["STOP-B8"]["assets"], ["B1", "B2", "B5", "B7"])
        self.assertEqual(cps["STOP-E7"]["assets"], ["E1", "E2", "E7"])
        self.assertEqual(cps["STOP-H3"]["assets"], ["H1"])
        self.assertEqual(cps["STOP-H3"]["conditional_assets"], ["H4"])

    def test_parser_rejects_checklist_mismatch(self):
        broken = self.text.replace("G1 G2 G3 G4 G5", "G1 G2 G3 G4 G5 G6")
        with self.assertRaises(pi.ParseError):
            pi.parse_prompts(broken)

    def test_parser_rejects_unknown_attachment(self):
        broken = self.text.replace("ATTACH: B1.png\n---8<---\nContinue the attached sky",
                                   "ATTACH: Z9.png\n---8<---\nContinue the attached sky")
        with self.assertRaises(pi.ParseError):
            pi.parse_prompts(broken)


# ---------------------------------------------------------------------------
# PNG decoding
# ---------------------------------------------------------------------------


class TestPngDecoder(unittest.TestCase):
    def check(self, data, w, h, expect):
        img = pi.decode_png(data)
        self.assertEqual((img.width, img.height), (w, h))
        for y in range(h):
            for x in range(w):
                self.assertEqual(img.pixel(x, y), expect(x, y), (x, y))

    def test_all_filters_rgb_and_rgba(self):
        f = lambda x, y: ((x * 40) % 256, (y * 70) % 256, (x * y * 13) % 256, (x + y) * 20 % 256)  # noqa: E731
        self.check(encode_png(9, 7, f, color_type=2, filters=(0, 1, 2, 3, 4)), 9, 7, lambda x, y: f(x, y)[:3] + (255,))
        self.check(encode_png(9, 7, f, color_type=6, filters=(4, 3, 2, 1, 0)), 9, 7, f)

    def test_palette_gray_and_16bit(self):
        pal = [(255, 0, 255), (10, 20, 30), (200, 100, 50)]
        self.check(encode_png(5, 4, lambda x, y: (x + y) % 3, color_type=3, palette=pal), 5, 4,
                   lambda x, y: pal[(x + y) % 3] + (255,))
        self.check(encode_png(5, 4, lambda x, y: (x * 50,), color_type=0), 5, 4, lambda x, y: (x * 50,) * 3 + (255,))
        self.check(encode_png(5, 4, lambda x, y: (x * 50, y * 60, 7), color_type=2, bit_depth=16, filters=(1, 4)),
                   5, 4, lambda x, y: (x * 50, y * 60, 7, 255))

    def test_corruption_detected(self):
        good = sky(20, 10)
        with self.assertRaisesRegex(pi.PngError, "signature"):
            pi.decode_png(b"\xff\xd8\xff\xe0JFIF" + good[10:])
        bad = bytearray(good)
        bad[40] ^= 0xFF
        with self.assertRaisesRegex(pi.PngError, "CRC|corrupt"):
            pi.decode_png(bytes(bad))
        with self.assertRaisesRegex(pi.PngError, "truncated|cut off|IEND"):
            pi.decode_png(good[: len(good) // 2])


# ---------------------------------------------------------------------------
# Validation checks
# ---------------------------------------------------------------------------


class TestValidation(Workspace):
    def setUp(self):
        super().setUp()
        self.ok("init")
        self.m = pi.load_manifest(self.paths)

    def validate(self, aid, name, data):
        f = self.drop(name, data)
        a = pi.assets_by_id(self.m)[aid]
        return {c["check"]: c for c in pi.validate_file(self.paths, self.m, a, f)["checks"]}, f

    def result(self, aid, data, name=None):
        f = self.drop(name or f"{aid}.png", data)
        return pi.validate_file(self.paths, self.m, pi.assets_by_id(self.m)[aid], f)

    def test_full_bleed_sky_passes(self):
        r = self.result("B1", sky(210, 90))
        self.assertEqual(r["result"], "pass", r["checks"])

    def test_ratio_mismatch_is_warning(self):
        r = self.result("B1", sky(150, 100))
        checks = {c["check"]: c for c in r["checks"]}
        self.assertEqual(checks["aspect_ratio"]["result"], "warn")
        self.assertEqual(r["result"], "warn")

    def test_not_png_and_wrong_extension(self):
        r = self.result("B1", b"\xff\xd8\xff\xe0 not really a png")
        self.assertEqual(r["result"], "fail")
        self.assertEqual({c["check"]: c["result"] for c in r["checks"]}["png_format"], "fail")
        r = self.result("B1", sky(210, 90), name="B1.jpg")
        self.assertEqual({c["check"]: c["result"] for c in r["checks"]}["filename"], "fail")

    def test_empty_and_blank_files_fail(self):
        self.assertEqual(self.result("B1", b"")["result"], "fail")
        blank = encode_png(210, 90, lambda x, y: (12, 20, 60))
        r = self.result("B1", blank)
        self.assertEqual({c["check"]: c["result"] for c in r["checks"]}["not_blank"], "fail")

    def test_green_key_with_antialias_noise_passes(self):
        r = self.result("B5", keyed(160, 90, GREEN, noise=6))
        self.assertEqual(r["result"], "pass", r["checks"])

    def test_wrong_key_colour_fails(self):
        r = self.result("B5", keyed(160, 90, MAGENTA))
        checks = {c["check"]: c for c in r["checks"]}
        self.assertEqual(checks["background_key"]["result"], "fail")
        self.assertEqual(checks["key_present"]["result"], "fail")
        self.assertIn("#FF", checks["background_key"]["detail"])

    def test_textured_background_warns(self):
        r = self.result("B5", keyed(160, 90, GREEN, noise=40))
        checks = {c["check"]: c for c in r["checks"]}
        self.assertEqual(checks["background_key"]["result"], "pass")
        self.assertEqual(checks["background_flat"]["result"], "warn")

    def test_transparent_background_fails(self):
        r = self.result("B5", keyed(160, 90, GREEN, alpha_bg=0))
        self.assertEqual(r["result"], "fail")

    def test_strip_only_needs_key_on_top(self):
        # C1: ridges fill the lower half and reach the bottom edge.
        r = self.result("C1", keyed(210, 90, MAGENTA, art_box=(0, 0.5, 1, 1)))
        self.assertEqual(r["result"], "pass", r["checks"])

    def test_same_size_rule_compares_with_approved_source(self):
        src = pi.assets_by_id(self.m)["B1"]
        src["approved_size"] = [210, 90]
        r = self.result("B3", sky(210, 90))
        self.assertEqual({c["check"]: c["result"] for c in r["checks"]}["same_size"], "pass")
        r = self.result("B3", sky(200, 90))
        self.assertEqual({c["check"]: c["result"] for c in r["checks"]}["same_size"], "warn")

    def test_stdlib_decoder_path_gives_same_result(self):
        with mock.patch.dict(os.environ, {"PLANET_IMAGES_NO_PIL": "1"}):
            r = self.result("B5", keyed(160, 90, GREEN, noise=6))
        self.assertEqual(r["result"], "pass", r["checks"])


# ---------------------------------------------------------------------------
# Workflow: dependencies, manifest updates, approval protection, checkpoints
# ---------------------------------------------------------------------------


class TestMissingReferences(Workspace):
    with_plates = False

    def test_everything_blocked_without_style_plates(self):
        out = self.ok("next")
        self.assertIn("missing reference file docs/plans/assets/planet/style/night.png", out)
        m = self.manifest()
        self.assertTrue(all(a["status"] == "blocked" for a in m["assets"]))
        self.add_plates()
        self.ok("status")
        self.assertEqual(self.asset("B1")["status"], "ready")


class TestWorkflow(Workspace):
    def test_initial_eligibility(self):
        self.ok("init")
        st = {a["id"]: a["status"] for a in self.manifest()["assets"]}
        self.assertEqual(st["B1"], "ready")
        self.assertEqual(st["B5"], "ready")
        self.assertEqual(st["B2"], "blocked")  # needs B1
        self.assertEqual(st["C1"], "blocked")  # behind checkpoint STOP-B8
        self.assertEqual(st["H4"], "blocked")  # optional, not requested
        self.assertIn("checkpoint STOP-B8 not passed", self.asset("C1")["blocked_reasons"])

    def test_next_prepares_one_prompt_and_is_idempotent(self):
        out = self.ok("next")
        self.assertIn("Prepared B1", out)
        doc = self.paths.next_prompt.read_text(encoding="utf-8")
        prompt = pi.assets_by_id(self.manifest())["B1"]["prompt"]
        self.assertIn(prompt, doc)
        self.assertIn("docs/plans/assets/planet/incoming/B1.png", doc)
        self.assertIn("docs/plans/assets/planet/style/night.png", doc)
        self.assertIn("21:9", doc)
        out = self.ok("next")
        self.assertIn("B1 is still waiting", out)
        a = self.asset("B1")
        self.assertEqual((a["status"], a["attempts"]), ("prompt_prepared", 1))
        self.assertEqual(sum(x["status"] in pi.ACTIVE for x in self.manifest()["assets"]), 1)

    def test_validate_without_image_moves_to_awaiting(self):
        self.ok("next")
        out = self.ok("validate")
        self.assertIn("no image yet", out)
        self.assertEqual(self.asset("B1")["status"], "awaiting_image")

    def test_dependency_unlocks_after_approval(self):
        self.produce("B1", sky(210, 90))
        self.assertTrue((self.paths.approved / "B1.png").is_file())
        self.assertFalse((self.paths.incoming / "B1.png").exists())
        self.assertEqual(self.asset("B2")["status"], "ready")
        self.ok("next")
        doc = self.paths.next_prompt.read_text(encoding="utf-8")
        self.assertIn("docs/plans/assets/planet/approved/B1.png", doc)
        self.assertIn("[present]", doc)

    def test_failed_validation_cannot_be_approved(self):
        self.ok("next")
        self.drop("B1.png", b"definitely not a png")
        rc, out, _ = self.run_cli("validate")
        self.assertEqual(rc, 1)
        self.assertEqual(self.asset("B1")["status"], "failed")
        self.fails("approve", "B1", "--yes", contains="status is failed")
        self.assertTrue((self.paths.incoming / "B1.png").exists())  # kept for inspection

    def test_approve_requires_validation(self):
        self.ok("next")
        self.drop("B1.png", sky(210, 90))
        self.fails("approve", "B1", "--yes", contains="needs_review")

    def test_approve_requires_human_confirmation(self):
        self.ok("next")
        self.drop("B1.png", sky(210, 90))
        self.ok("validate")
        with mock.patch.object(sys.stdin, "isatty", return_value=False):
            self.fails("approve", "B1", contains="interactive terminal")
        self.assertEqual(self.asset("B1")["status"], "needs_review")

    def test_warnings_need_explicit_acceptance(self):
        self.ok("next")
        self.drop("B1.png", sky(150, 100))
        self.ok("validate")
        self.fails("approve", "B1", "--yes", contains="--accept-warnings")
        self.ok("approve", "B1", "--yes", "--accept-warnings")
        self.assertEqual(self.asset("B1")["status"], "approved")

    def test_file_changed_after_validation_is_refused(self):
        self.ok("next")
        f = self.drop("B1.png", sky(210, 90))
        self.ok("validate")
        f.write_bytes(sky(211, 90))
        self.fails("approve", "B1", "--yes", contains="changed since it was validated")

    def test_approved_images_are_protected(self):
        self.produce("B1", sky(210, 90))
        approved = (self.paths.approved / "B1.png").read_bytes()
        self.fails("approve", "B1", "--yes", contains="already approved")
        self.fails("reject", "B1", "--reason", "x", contains="protected")
        self.fails("retry", "B1", contains="protected")
        self.drop("B1.png", sky(210, 90) + b"")  # a stray new file
        out = self.ok("status")
        self.assertIn("already approved", out)
        self.fails("validate", "B1", contains="protected")
        self.assertEqual((self.paths.approved / "B1.png").read_bytes(), approved)

    def test_existing_approved_file_is_never_overwritten(self):
        self.ok("next")
        self.drop("B1.png", sky(210, 90))
        self.ok("validate")
        self.paths.approved.mkdir(parents=True, exist_ok=True)
        (self.paths.approved / "B1.png").write_bytes(b"precious")
        self.fails("approve", "B1", "--yes", contains="refusing to overwrite")
        self.assertEqual((self.paths.approved / "B1.png").read_bytes(), b"precious")

    def test_multiple_tries_require_choice_and_keep_the_rest(self):
        self.ok("next")
        self.drop("B1-1.png", sky(210, 90))
        self.drop("B1-2.png", encode_png(210, 90, lambda x, y: (x % 50, y, 120)))
        self.ok("validate")
        self.fails("approve", "B1", "--yes", contains="--file")
        self.ok("approve", "B1", "--yes", "--file", "B1-2.png", "--note", "better stars")
        a = self.asset("B1")
        self.assertEqual(a["approval_note"], "better stars")
        self.assertTrue((self.paths.rejected / "B1" / "attempt-1" / "B1-1.png").is_file())
        self.assertEqual(a["rejections"][0]["file"], "B1-1.png")

    def test_reject_and_retry(self):
        self.ok("next")
        self.drop("B1.png", sky(210, 90))
        self.ok("validate")
        self.fails("reject", "B1", "--reason", "  ", contains="reason is required")
        self.ok("reject", "B1", "--reason", "has a watermark")
        a = self.asset("B1")
        self.assertEqual(a["status"], "failed")
        self.assertEqual(a["failure_reason"], "rejected: has a watermark")
        self.assertTrue((self.paths.rejected / "B1" / "attempt-1" / "B1.png").is_file())
        out = self.ok("next")
        self.assertIn("retry B1", out)
        self.ok("retry", "B1")
        a = self.asset("B1")
        self.assertEqual((a["status"], a["attempts"]), ("prompt_prepared", 2))
        self.fails("retry", "B1", contains="only failed or rejected")
        self.drop("B1.png", sky(210, 90))
        self.ok("validate")
        self.ok("approve", "B1", "--yes")
        events = [json.loads(x)["event"] for x in self.paths.audit.read_text().splitlines()]
        for e in ("prompt_prepared", "validate", "reject", "file_rejected", "retry", "approve"):
            self.assertIn(e, events)

    def test_invalid_ids_and_states(self):
        self.fails("approve", "Z1", "--yes", contains="unknown asset ID")
        self.fails("export-prompt", "B99", contains="unknown asset ID")
        self.fails("checkpoint", "STOP-Z", contains="unknown checkpoint")
        self.fails("reject", "B2", "--reason", "x", contains="no image to reject")
        self.fails("retry", "B2", contains="status is blocked")
        self.fails("validate", "B2", contains="blocked")
        self.fails("enable-optional", "B1", "--reason", "x", contains="not optional")

    def test_ids_are_case_insensitive(self):
        self.ok("export-prompt", "b1")
        self.assertTrue((self.paths.exports / "B1.md").is_file())

    def test_export_prompt_does_not_change_state(self):
        self.ok("init")
        before = self.asset("E7")
        out = self.ok("export-prompt", "E7")
        self.assertIn("not ready yet", out)
        doc = (self.paths.exports / "E7.md").read_text(encoding="utf-8")
        self.assertIn(before["prompt"], doc)
        self.assertIn("3:4", doc)
        self.assertEqual(self.asset("E7")["status"], before["status"])

    def test_prompts_change_is_detected(self):
        self.ok("init")
        self.paths.prompts.write_text(self.paths.prompts.read_text(encoding="utf-8") + "\n", encoding="utf-8")
        self.fails("status", contains="PROMPTS.md changed")
        self.ok("init", "--refresh")
        self.ok("status")

    def test_refresh_keeps_progress(self):
        self.produce("B1", sky(210, 90))
        self.ok("init", "--refresh")
        self.assertEqual(self.asset("B1")["status"], "approved")

    def test_resume(self):
        self.ok("next")
        out = self.ok("resume")
        self.assertIn("Resuming", out)
        self.assertIn("B1 is still waiting", out)

    def test_optional_asset(self):
        self.ok("enable-optional", "H4", "--reason", "walk frames inconsistent")
        a = self.asset("H4")
        self.assertTrue(a["requested"])
        self.assertNotIn("optional", " ".join(a["blocked_reasons"]))
        self.assertIn("checkpoint STOP-H3 not passed", a["blocked_reasons"])


class TestCheckpoint(Workspace):
    def test_checkpoint_stops_advancement_until_passed(self):
        self.ok("init")
        self.fails("checkpoint", "STOP-B8", "--pass", "--yes", contains="not approved yet")
        for aid in ("B1", "B2", "B3", "B4"):
            self.produce(aid, sky(210, 90))
        for aid in ("B5", "B6", "B7", "B8"):
            self.produce(aid, keyed(160, 90, GREEN, noise=4))
        self.assertEqual(self.asset("C1")["status"], "blocked")
        out = self.ok("next")
        self.assertIn("CHECKPOINT STOP-B8", out)
        self.assertNotIn("Prepared", out)
        self.assertIn("Checkpoint STOP-B8", self.paths.next_prompt.read_text(encoding="utf-8"))
        self.assertEqual(self.asset("C1")["status"], "blocked")
        report = self.ok("checkpoint", "STOP-B8")
        self.assertIn("B7", report)
        with mock.patch.object(sys.stdin, "isatty", return_value=False):
            self.fails("checkpoint", "STOP-B8", "--pass", contains="interactive terminal")
        out = self.ok("checkpoint", "B8", "--pass", "--yes", "--note", "seams ok")
        self.assertIn("Now ready: C1", out)
        cp = next(c for c in self.manifest()["checkpoints"] if c["id"] == "STOP-B8")
        self.assertEqual((cp["status"], cp["note"]), ("passed", "seams ok"))
        self.assertIn("Prepared C1", self.ok("next"))

    def test_rejected_checkpoint_asset_blocks_pass(self):
        self.ok("init")
        self.ok("next")
        self.drop("B1.png", sky(210, 90))
        self.ok("validate")
        self.ok("reject", "B1", "--reason", "seam visible")
        self.fails("checkpoint", "STOP-B8", "--pass", "--yes", contains="B1")


# ---------------------------------------------------------------------------
# Assisted mode (go)
# ---------------------------------------------------------------------------


class TestGo(Workspace):
    """`go` with the desktop side faked: each clipboard copy is followed by a 'browser download'."""

    def setUp(self):
        super().setUp()
        self.downloads = self.tmp / "Downloads"
        self.downloads.mkdir()
        self.queue: list[tuple[str, bytes]] = []  # downloads to deliver, one per generation
        self.clipboard: list[str] = []

        def fake_copy(text):
            self.clipboard.append(text)
            if self.queue:
                name, data = self.queue.pop(0)
                threading.Timer(0.15, lambda: (self.downloads / name).write_bytes(data)).start()
            return True

        patches = [
            mock.patch.object(pi, "copy_to_clipboard", side_effect=fake_copy),
            mock.patch.object(pi, "open_url", return_value=True),
            mock.patch.object(pi, "open_paths", return_value=True),
            mock.patch.object(sys.stdin, "isatty", return_value=True),
        ]
        for pt in patches:
            pt.start()
            self.addCleanup(pt.stop)

    def go(self, answers):
        with mock.patch("builtins.input", side_effect=list(answers)):
            return self.run_cli("go", "--downloads", str(self.downloads), "--timeout", "0.02", "--poll", "0.05")

    def test_full_cycle_imports_validates_and_moves_on(self):
        self.queue = [("ChatGPT Image Oct 19.png", sky(210, 90))]
        rc, out, err = self.go(["a"])
        self.assertEqual(rc, 0, err)
        self.assertEqual(self.asset("B1")["status"], "approved")
        self.assertTrue((self.paths.approved / "B1.png").is_file())
        self.assertFalse((self.downloads / "ChatGPT Image Oct 19.png").exists())
        # It went straight on to B2, with approved B1 staged as the attachment, then timed out waiting.
        self.assertEqual(self.asset("B2")["status"], "prompt_prepared")
        self.assertEqual(self.clipboard[-1], self.asset("B2")["prompt"])
        self.assertEqual(sorted(p.name for p in (self.paths.workflow / "attach").iterdir()), ["1-B1.png"])
        self.assertIn("No new image arrived", out)

    def test_existing_downloads_are_ignored(self):
        (self.downloads / "old.png").write_bytes(sky(210, 90))
        rc, out, _ = self.go([])
        self.assertIn("No new image arrived", out)
        self.assertEqual(self.asset("B1")["status"], "prompt_prepared")
        self.assertTrue((self.downloads / "old.png").exists())

    def test_reject_records_reason_and_starts_next_attempt(self):
        self.queue = [("one.png", sky(210, 90)), ("two.png", sky(210, 90))]
        rc, out, err = self.go(["r", "planets in the sky", "a"])
        self.assertEqual(rc, 0, err)
        a = self.asset("B1")
        self.assertEqual((a["status"], a["attempts"]), ("approved", 2))
        self.assertEqual(a["rejections"][0]["reason"], "planets in the sky")
        self.assertTrue((self.paths.rejected / "B1" / "attempt-1" / "B1.png").is_file())

    def test_try_again_keeps_both_and_asks_which(self):
        self.queue = [("one.png", sky(210, 90)), ("two.png", sky(210, 90))]
        rc, out, err = self.go(["t", "a", "2"])
        self.assertEqual(rc, 0, err)
        a = self.asset("B1")
        self.assertEqual(a["status"], "approved")
        self.assertEqual(a["validation"]["name"], "B1-1.png")
        self.assertTrue((self.paths.rejected / "B1" / "attempt-1" / "B1.png").is_file())

    def test_warnings_need_a_yes(self):
        self.queue = [("wide.png", sky(150, 100))]
        rc, out, err = self.go(["a", "n", "q"])
        self.assertEqual(self.asset("B1")["status"], "needs_review")
        self.assertIn("aspect_ratio", out)

    def test_failed_validation_offers_retry(self):
        self.queue = [("broken.png", b"not an image")]
        rc, out, err = self.go(["q"])
        self.assertEqual(self.asset("B1")["status"], "failed")
        self.assertIn("can't be approved", out)

    @unittest.skipUnless(importlib.util.find_spec("PIL"), "needs Pillow to make a WebP fixture")
    def test_webp_download_is_converted(self):
        from PIL import Image

        img = Image.open(io.BytesIO(sky(210, 90)))
        buf = io.BytesIO()
        img.save(buf, "WEBP", lossless=True)
        self.queue = [("image.webp", buf.getvalue())]
        rc, out, err = self.go(["q"])
        self.assertIn("converted from .webp to PNG", out)
        self.assertTrue((self.paths.incoming / "B1.png").is_file())
        self.assertEqual(self.asset("B1")["status"], "needs_review")

    def test_needs_a_terminal(self):
        with mock.patch.object(sys.stdin, "isatty", return_value=False):
            self.fails("go", "--downloads", str(self.downloads), contains="interactive")


class TestWaitForDownload(unittest.TestCase):
    def test_skips_partial_and_waits_for_stable_size(self):
        d = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, d, True)
        (d / "a.png").write_bytes(b"x" * 10)
        (d / "a.png.crdownload").write_bytes(b"")
        before = {}
        self.assertIsNone(pi.wait_for_download(d, before, timeout=0.2, poll=0.05))
        (d / "a.png.crdownload").unlink()
        self.assertEqual(pi.wait_for_download(d, before, timeout=0.5, poll=0.05).name, "a.png")
        self.assertIsNone(pi.wait_for_download(d, pi.snapshot_folder(d), timeout=0.2, poll=0.05))


if __name__ == "__main__":
    unittest.main()
