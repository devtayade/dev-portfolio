# Little Planet image workflow

This is a human-in-the-loop pipeline for producing every image listed in
[`../PROMPTS.md`](../PROMPTS.md). The work is split three ways:

| Who | Does what |
|---|---|
| **You, in ChatGPT** | Attach the reference images, paste the prompt, generate, save the PNG. |
| **`scripts/planet_images.py`** | Picks the next eligible asset, writes the prompt sheet, checks files, records approvals, enforces dependencies and STOP checkpoints. |
| **You, at the terminal** | Look at every image and decide: `approve` or `reject`. |

The script never generates images, calls no API, and never approves anything
by itself. Claude can only look at an image once you have saved it into this
repository.

`PROMPTS.md` is the source of truth and is never edited by the workflow. It was
written for Gemini; the prompt text is used **verbatim** in ChatGPT, and only
the surrounding instructions differ.

## Setup (once)

1. Python 3 (tested with 3.13; standard library only; if Pillow is installed it is used to
   decode PNGs faster, but it isn't required).
2. Put the three approved style plates in `docs/plans/assets/planet/style/`:
   `night.png`, `day.png`, `you.png`. **They aren't in the repository yet**, and
   every asset is blocked until they are.
3. `python scripts/planet_images.py init` builds `manifest.json` from
   `PROMPTS.md`. Any other command does this automatically if the manifest is
   missing.

## Quickest way: assisted mode

```
python3 scripts/planet_images.py go
```

Leave it running in a Terminal window. For each image it:

1. copies the prompt to your clipboard,
2. opens a new ChatGPT chat in your browser,
3. opens a folder (`workflow/attach/`) holding the files to attach, numbered in order (`1-night.png`, `2-B1.png`),
4. waits for you to drag those in, paste with Cmd+V, generate, and click **download**,
5. finds the new file in `~/Downloads`, renames it (`B1.png`, or `B1-1.png` for another try),
   moves it to `incoming/`, converts WebP/JPEG to PNG, validates it and opens it,
6. asks you: **[a]** approve, **[r]** reject (asks why, then starts a new attempt),
   **[t]** try again (keeps both tries so you can pick), **[q]** quit.

After an approval it goes straight on to the next image. It pauses at every STOP
checkpoint so Claude can check the images. Press Ctrl+C at any time; running `go`
again picks up where you left off. Options: `--downloads PATH` if your browser
saves elsewhere, `--timeout MINUTES` (default 30) for how long to wait for each
download, `--no-browser`.

Generation itself stays manual in ChatGPT: ChatGPT Go has no API, and scripting
the ChatGPT website isn't allowed by its terms.

## The loop step by step (what `go` does for you)

1. Run `python scripts/planet_images.py next`.
2. Open `docs/plans/assets/planet/workflow/next-prompt.md`.
3. In ChatGPT, attach the files listed in section 1, **in the listed order**. The
   prompts say "the first attached…" and "the second attached…", so order matters.
   Earlier results are attached from `approved/`, for example `approved/B1.png`.
4. Paste the prompt from section 2 exactly, and generate. Ask for the ratio
   given in the prompt. If ChatGPT can't make it, take the closest it offers
   (PROMPTS.md rule 6); `validate` will flag the difference for you to decide.
5. Download the image as PNG and save it as exactly
   `docs/plans/assets/planet/incoming/<ID>.png`, for example `incoming/B1.png`.
   Save extra tries as `B1-1.png`, `B1-2.png`, and so on.
6. Run `python scripts/planet_images.py validate`.
7. Run `python scripts/planet_images.py review <ID>`, look at the image, then:
   - `python scripts/planet_images.py approve <ID>` (add `--file B1-2.png` to choose a try), or
   - `python scripts/planet_images.py reject <ID> --reason "black outlines"`, then
     `python scripts/planet_images.py retry <ID>`.
8. Run `python scripts/planet_images.py next` for the next eligible asset.

`next` works on one asset at a time. While an asset is in flight (prompt
prepared, awaiting its image, waiting for review, or failed), `next` shows that
asset again instead of starting another one.

## Commands

| Command | What it does |
|---|---|
| `init [--refresh]` | Build the manifest from PROMPTS.md. `--refresh` re-reads PROMPTS.md after it changed and keeps all progress. |
| `go [--downloads PATH] [--timeout MIN]` | Assisted mode: clipboard, browser, attachments folder, download import, validation and the approve/reject prompt, image after image. |
| `next` | Prepare `next-prompt.md` for the next eligible asset (dependencies approved, references present, no unpassed checkpoint before it). If a checkpoint is due, writes the checkpoint report instead. |
| `status [--all] [--json]` | Progress counts, the asset in flight, pending reviews, checkpoints, missing reference files, and stray files in `incoming/`. |
| `validate [ID]` | Validate images in `incoming/` for assets that are waiting for one. |
| `review ID [--no-open]` | Print the validation results and open the image(s) in a viewer if one is available. |
| `approve ID [--file NAME] [--note ...] [--accept-warnings] [--yes]` | Approve after **your** visual review. Moves the file to `approved/ID.png`. |
| `reject ID --reason "..." [--file NAME]` | Reject and record why. Files move to `rejected/ID/attempt-N/`. |
| `retry ID` | Start a new attempt for a failed or rejected asset. |
| `resume` | Check the manifest, show status, and continue where you left off. |
| `export-prompt ID [--out PATH]` | Write any asset's prompt sheet to `exports/ID.md` without changing its state. |
| `checkpoint [ID] [--pass --note ... --yes]` | List the checkpoints, show one checkpoint's report, or sign one off. |
| `enable-optional ID --reason "..."` | Request an optional asset (H4, only if Claude asks for it at STOP-H3). |

Every command is safe to repeat. Bad IDs, wrong states, missing files and unmet
dependencies stop with an `error:` message and exit code 2. `validate` exits 1
if any image failed.

## Statuses

`blocked` → `ready` → `prompt_prepared` → `awaiting_image` → `received` → `needs_review` → `approved`

| Status | Meaning |
|---|---|
| `blocked` | A dependency isn't approved yet, a reference file is missing, an earlier checkpoint hasn't passed, or the asset is optional and not requested. `status --all` shows the reasons. |
| `ready` | Everything it needs is in place. |
| `prompt_prepared` | `next` or `retry` wrote its prompt sheet. |
| `awaiting_image` | `validate` ran and found no file yet. |
| `received` | A file with its name appeared in `incoming/`. |
| `needs_review` | The automatic checks passed (warnings possible). Waiting for your eyes. |
| `approved` | You approved it. The file sits in `approved/` and is never overwritten. |
| `failed` | Validation failed or you rejected it. Run `retry`. |

## What `validate` checks

The checks can catch technical problems. They can't judge whether the art
follows the style or composition; that part is always your decision.

| Check | Result if it doesn't hold |
|---|---|
| File name is `ID.png` / `ID-N.png` | fail (wrong extension) or warn (wrong case) |
| PNG signature, chunk CRCs, IHDR/IDAT/IEND present, pixel data decodes | fail |
| Aspect ratio matches the prompt (±3%) | warn: PROMPTS.md allows the closest ratio |
| Same size as the approved source, for repaint/day prompts that say "same size" | warn |
| Not a single flat colour | fail |
| Key colour (`#FF00FF` / `#00FF00`) present in the image | fail |
| Background region is the key colour (≥90% pass, 50–90% warn, <50% fail) | see thresholds |
| Background is opaque, not transparent | warn or fail |
| Key pixels are flat (no grain or gradient) | warn |
| Full-bleed images (skies, interior) have no key-coloured or transparent areas | warn |
| Continuation pieces: colour difference between the source's right quarter and this image's left quarter | info only |

The background region depends on the composition each prompt describes:

| Region | Applies to |
|---|---|
| All four edges | object sheets, clouds, sprite sheets |
| Top edge | ridges, hills, ground strips (these reach the bottom edge) |
| Top edge and upper sides | buildings (they stand on a path at the bottom) |
| Corners | the G5 eyepiece ring |

Colour matching tolerates anti-aliasing and slight noise. A pixel counts as key
colour within an RGB distance of 90, and as "flat" within 24. The thresholds are
constants at the top of the script.

Warnings never block approval, but you have to acknowledge them with
`--accept-warnings`. A failed file can't be approved. Approval is also refused if
the file changed after validation, or if `approved/ID.png` already exists.

## STOP checkpoints (from PROMPTS.md)

| Checkpoint | After | Review |
|---|---|---|
| STOP-B8 | B8 | B1, B2, B5, B7 (seam and green cut-out check) |
| STOP-C12 | C12 | C1, C2, C4, C7 (seam and day/night alignment check) |
| STOP-D10 | D10 | D1, D2, D4 |
| STOP-E7 | E7 | E1, E2, E7 (cut-out check, scale check against the character) |
| STOP-G5 | G5 | G1, G2 |
| STOP-H3 | H3 | H1 (if the walk frames don't match, Claude asks for H4) |

When `next` reaches a checkpoint, it stops and prints the listed assets with
their validation results. Nothing after the checkpoint becomes eligible until
every listed asset is approved and you sign off:

```
python scripts/planet_images.py checkpoint STOP-B8 --pass --note "seams OK"
```

At each STOP, ask Claude to look at the listed files in `approved/` for the
checks PROMPTS.md names (seams, cut-outs, alignment, scale).

## Files

```
docs/plans/assets/planet/
  PROMPTS.md            source of truth (verbatim copy, never edited)
  style/                night.png, day.png, you.png (style plates, add these)
  incoming/             new images awaiting validation
  approved/             approved images: these are the files you attach later
  rejected/<ID>/attempt-N/   rejected or unselected tries, kept for reference
  workflow/
    manifest.json       every asset: prompt, dependencies, references, status, attempts, validation, history
    next-prompt.md      the current instruction sheet
    audit.jsonl         append-only log of every state change and decision
    exports/            prompt sheets written by export-prompt
    attach/             attachments staged by `go` (temporary, git-ignored)
scripts/planet_images.py
scripts/tests/test_planet_images.py
```

Run the tests with `python -m unittest discover -s scripts/tests -v`.

## Notes and known gaps

- PROMPTS.md says "about 55 images". It actually defines **64 required assets
  plus H4 (optional)**.
- PROMPTS.md gives aspect ratios only, no pixel sizes, so no pixel size is
  enforced. Repaint/day prompts are compared with their approved source.
- ChatGPT may not offer 21:9 or 16:9. PROMPTS.md rule 6 permits the closest
  ratio, but wide panorama pieces may then need cropping or other handling in
  the cut-out pipeline. That's your decision at each warning.
- The design doc PROMPTS.md references
  (`docs/plans/2026-10-19-little-planet-design.md`) isn't in the repository.
- If PROMPTS.md changes, every command stops until you run `init --refresh`.
