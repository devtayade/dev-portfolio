LITTLE PLANET — IMAGE PROMPTS FOR GEMINI
========================================

Design: docs/plans/2026-10-19-little-planet-design.md
Quality reference (match its qualities, never copy its assets): deepalipathe.com/village

HOW TO USE THIS FILE
--------------------
1. Gemini (gemini.google.com), image generation (Nano Banana). Always the largest size offered.
2. Work in ORDER, step by step. Later prompts attach earlier results to keep the style locked.
3. Each prompt has an ID (B1, C4, E7 ...). Save the result as that ID in
       docs/plans/assets/planet/incoming/B1.png
   Several tries: B1-1.png, B1-2.png ... (keep them all; tell Claude which one you like).
4. "ATTACH:" = upload those files with the prompt (paperclip / + button).
   The style plates are in docs/plans/assets/planet/style/:
       night.png  (the approved night scene)      day.png  (the approved day scene)
       you.png    (you in the suit)
5. Copy everything between the ---8<--- lines, exactly.
6. Ratio: use the ratio named in the prompt (16:9 or 21:9). If Gemini refuses it, take the closest.
7. Regenerate if you get: text, letters or numbers; black outlines; a glossy 3D or photo look;
   a watermark; a background that isn't perfectly flat (for cut-out pieces).
8. STOP POINTS (marked >>> STOP) — send those files to Claude before continuing. Claude runs them
   through the pipeline to check cut-outs, seams and alignment, so a problem is found on 2 images,
   not 20.

Total: about 55 images. Night first; each day version attaches its night version.

KEY COLOURS (backgrounds the pipeline cuts away)
-----------------------------------------------
- MAGENTA  #FF00FF  — buildings, ground, props, the character.
- GREEN    #00FF00  — clouds, planets, nebulae, sky objects (they contain lilac/purple, which a
                      magenta background would eat into).
The key colour must be perfectly flat: no texture, paper grain, shadow, glow or gradient on it.


THE STYLE (already inside every prompt below; here for reference)
-----------------------------------------------------------------
Cozy hand-painted storybook illustration, like gouache and coloured pencil on textured
watercolour paper, visible paper grain. No black outlines: each shape is edged with a slightly
darker shade of its own colour. Flat simple shading, two or three tones per shape, no glossy
highlights, no photorealism, no 3D render look. Slightly chunky, hand-cut, stepped edges on
leaves, clouds and rocks. Cozy little sci-fi: cream metal panels with seams and small rivets,
small teal light strips and warm-yellow lights as accents. Night palette: deep navy and indigo,
lilac, slate blue, sage and olive, terracotta, cream, warm yellow, small teal accents.
Flat side view like a 2D side-scrolling game, almost no perspective.


=================================================================
STEP A — STYLE PLATES  (done)
=================================================================
night.png, day.png, you.png in docs/plans/assets/planet/style/. Nothing to do.


=================================================================
STEP B — THE SKY
=================================================================

B1 — Night sky, left half
ATTACH: style/night.png
---8<---
Paint ONLY the sky as a very wide 21:9 panorama, in exactly the style of the attached illustration: deep navy at the top fading to indigo and a soft lilac glow near the bottom edge, thousands of small cream and pale-yellow stars of different sizes, a few brighter four-pointed sparkle stars, and a soft hand-painted Milky Way band crossing diagonally with faint lilac and violet nebula clouds along it. Hand-painted gouache on textured paper, visible paper grain. No planets, no moons, no clouds, no hills, no ground, no buildings, no objects, no text. Just the sky, filling the whole image edge to edge.
---8<---

B2 — Night sky, right half (continues B1)
ATTACH: B1.png
---8<---
Continue the attached sky panorama to the right as a new very wide 21:9 image. The left quarter of the new image must repeat the right quarter of the attached image as closely as possible (same stars, same Milky Way, same colours), and then the sky continues to the right with new stars, the Milky Way band slowly fading out and a faint lilac nebula patch. Exactly the same style, colours and paper grain. No planets, no moons, no clouds, no ground, no objects, no text.
---8<---

B3 — Day sky, left half
ATTACH: B1.png, style/day.png
---8<---
Repaint the first attached sky panorama exactly as it is laid out, but in daylight, in the style of the second attached illustration: soft periwinkle blue at the top fading to warm peach near the bottom edge, the Milky Way band becoming faint lilac and violet painted wisps, only a few small pale stars and sparkles left. Same size, same composition, same paper grain. No planets, no moons, no clouds, no ground, no objects, no text.
---8<---

B4 — Day sky, right half
ATTACH: B2.png, B3.png
---8<---
Repaint the first attached sky panorama exactly as it is laid out, but in daylight, matching the colours of the second attached image exactly: periwinkle at the top to warm peach at the bottom, faint lilac wisps, a few small pale stars. Same size, composition and paper grain. No planets, no moons, no clouds, no ground, no objects, no text.
---8<---

B5 — Ringed planet and moons, night
ATTACH: style/night.png
---8<---
In exactly the style of the attached illustration, paint three separate sky objects on a flat solid green (#00FF00) background, spaced well apart, not touching: (1) a large ringed planet like the one in the attached image, pale cream and lavender bands, its ring tilted, softly rim-lit in pale silver on its right side; (2) a medium round lilac moon with a few soft craters; (3) a small pale grey moon. Hand-painted gouache on paper, no black outlines, flat two-or-three-tone shading. The green background is perfectly flat with no texture, grain, shadow or glow. Wide 16:9. No text.
---8<---

B6 — Ringed planet and moons, day
ATTACH: B5.png, style/day.png
---8<---
Repaint the three objects in the first attached image exactly as they are (same shapes, sizes and positions) but lit in soft daylight, matching the second attached illustration: the ringed planet warm cream and butter-yellow with soft peach bands, the moons pale lilac and soft grey. Keep the background perfectly flat solid green (#00FF00). Same hand-painted style. No text.
---8<---

B7 — Clouds, night
ATTACH: style/night.png
---8<---
In exactly the style of the attached illustration, paint eight separate puffy clouds of different sizes and shapes (two large, three medium, three small), dusky lilac and slate-blue with soft peach-pink undersides, chunky, stepped, hand-cut edges, as in the attached image. Arrange them in a loose grid, well apart, NOT touching or overlapping. The background is perfectly flat solid green (#00FF00) with no texture, grain, shadow or gradient. Wide 16:9. No text.
---8<---

B8 — Clouds, day
ATTACH: B7.png, style/day.png
---8<---
Repaint the eight clouds in the first attached image exactly as they are (same shapes, sizes and positions) in daylight, matching the clouds in the second attached illustration: cream with soft peach and apricot undersides. Keep the background perfectly flat solid green (#00FF00). Same hand-painted style. No text.
---8<---

>>> STOP — send B1, B2, B5 and B7 to Claude (seam check and green cut-out check).


=================================================================
STEP C — FAR RIDGES AND HILLS  (three pieces each, joining left to right)
=================================================================

C1 — Far ridges, night, piece 1
ATTACH: style/night.png
---8<---
In exactly the style of the attached illustration, paint ONLY a long strip of distant mountain ridges as a very wide 21:9 image: soft rolling peaks and a few tall thin rock spires, in hazy slate-blue and indigo, lighter and hazier toward the top of each peak, as in the background of the attached image. The ridges fill the lower half of the image, their base reaching the bottom edge. Everything above the ridges is perfectly flat solid magenta (#FF00FF), with no texture, grain, shadow or glow. No sky, no stars, no trees, no buildings, no text.
---8<---

C2 — Far ridges, night, piece 2
ATTACH: C1.png
---8<---
Continue the attached strip of mountain ridges to the right as a new very wide 21:9 image. The left quarter must repeat the right quarter of the attached image as closely as possible, then the ridges continue with new peaks and one cluster of tall rock spires. Same height, style and colours; base at the bottom edge; everything above the ridges perfectly flat solid magenta (#FF00FF). No sky, no trees, no text.
---8<---

C3 — Far ridges, night, piece 3
ATTACH: C2.png
---8<---
Continue the attached strip of mountain ridges to the right as a new very wide 21:9 image. The left quarter must repeat the right quarter of the attached image as closely as possible, then the ridges continue with gentler, lower peaks. Same height, style and colours; base at the bottom edge; everything above the ridges perfectly flat solid magenta (#FF00FF). No sky, no trees, no text.
---8<---

C4 — Hills with trees, night, piece 1
ATTACH: style/night.png
---8<---
In exactly the style of the attached illustration, paint ONLY a long strip of rolling hills with alien trees as a very wide 21:9 image: soft rounded hills in dark sage and blue-green, dotted with round alien trees (bulbous trunks, round puffball canopies in dark olive and moss), tall slender cypress-like trees, a few small round moon-rocks and tiny warm-yellow fireflies, as in the middle of the attached image. Night lighting, cool and calm. The hills fill the lower two-thirds of the image and reach the bottom edge. Everything above the hills and trees is perfectly flat solid magenta (#FF00FF), with no texture, grain, shadow or glow. No sky, no mountains, no buildings, no path, no text.
---8<---

C5 — Hills with trees, night, piece 2
ATTACH: C4.png
---8<---
Continue the attached strip of hills and alien trees to the right as a new very wide 21:9 image. The left quarter must repeat the right quarter of the attached image as closely as possible, then the hills continue with new trees in a different arrangement and a small grove of tall trees. Same height, style and colours; reaching the bottom edge; everything above perfectly flat solid magenta (#FF00FF). No sky, no buildings, no text.
---8<---

C6 — Hills with trees, night, piece 3
ATTACH: C5.png
---8<---
Continue the attached strip of hills and alien trees to the right as a new very wide 21:9 image. The left quarter must repeat the right quarter of the attached image as closely as possible, then the hills rise gently toward the right with a few more trees. Same height, style and colours; reaching the bottom edge; everything above perfectly flat solid magenta (#FF00FF). No sky, no buildings, no text.
---8<---

C7 to C12 — Day versions of C1 to C6
For each: C7 from C1, C8 from C2, C9 from C3, C10 from C4, C11 from C5, C12 from C6.
ATTACH: the night piece, and style/day.png
---8<---
Repaint the first attached image exactly as it is (same shapes, same positions, same size) but in soft daylight, matching the colours of the second attached illustration: ridges in muted lavender-blue and lilac, hills in fresh sage and olive, tree canopies olive and mustard, no fireflies. Keep everything that is magenta perfectly flat solid magenta (#FF00FF). Same hand-painted style and paper grain. No text.
---8<---

>>> STOP — send C1, C2, C4 and C7 to Claude (seam and day/night alignment check).


=================================================================
STEP D — THE GROUND
=================================================================

D1 — Path, night, piece 1
ATTACH: style/night.png
---8<---
In exactly the style of the attached illustration, paint ONLY a long flat strip of ground as a very wide 21:9 image: at the back a thin edge of dark sage grass with a few small shrubs and pale glowing flowers, then a wide warm sandy-terracotta path running straight across the whole width, lit softly in places by warm light, with small pebbles and a few footprints. The ground occupies the bottom 40% of the image, its back edge a gently uneven line of grass. Everything above is perfectly flat solid magenta (#FF00FF), with no texture, grain, shadow or glow. No fence, no buildings, no lamps, no trees, no sky, no text.
---8<---

D2 — Path, night, piece 2   (ATTACH: D1.png)
D3 — Path, night, piece 3   (ATTACH: D2.png)
---8<---
Continue the attached strip of ground to the right as a new very wide 21:9 image. The left quarter must repeat the right quarter of the attached image as closely as possible, then the grass edge and the sandy path continue with small variations. Same height, style and colours; everything above perfectly flat solid magenta (#FF00FF). No fence, no buildings, no lamps, no text.
---8<---

D4 — Foreground, night, piece 1
ATTACH: style/night.png
---8<---
In exactly the style of the attached illustration, paint ONLY the foreground strip as a very wide 21:9 image, like the bottom of the attached image: a dense row of sage and dark-green alien shrubs and leafy plants, round grey-lilac moon-rocks with craters, small plants with glowing pale-blue bulb flowers, a few warm-yellow fireflies, and below them a cut-away of rich brown soil with roots and small stones down to the bottom edge. The strip fills the bottom third of the image. Everything above the plants is perfectly flat solid magenta (#FF00FF), with no texture, grain, shadow or glow. No path, no buildings, no sky, no text.
---8<---

D5 — Foreground, night, piece 2   (ATTACH: D4.png)
---8<---
Continue the attached foreground strip to the right as a new very wide 21:9 image. The left quarter must repeat the right quarter of the attached image as closely as possible, then the shrubs, moon-rocks, glowing flowers and soil continue with a different arrangement. Same height, style and colours; everything above perfectly flat solid magenta (#FF00FF). No text.
---8<---

D6 to D10 — Day versions of D1 to D5
For each: D6 from D1, D7 from D2, D8 from D3, D9 from D4, D10 from D5.
ATTACH: the night piece, and style/day.png
---8<---
Repaint the first attached image exactly as it is (same shapes, same positions, same size) but in soft daylight, matching the colours of the second attached illustration: fresh sage and olive greens, the path warm sand and terracotta, the moon-rocks soft grey, the bulb flowers pale cream, no glow and no fireflies. Keep everything that is magenta perfectly flat solid magenta (#FF00FF). Same hand-painted style and paper grain. No text.
---8<---

>>> STOP — send D1, D2, D4 to Claude.


=================================================================
STEP E — THE BUILDINGS
=================================================================
Every building: night with door closed first, then door open, then the day versions.
All on flat magenta, standing on a short strip of the same sandy path at the bottom.
Use this ending on every E prompt (already included below):
"Side view, almost no perspective, the building standing on a short strip of sandy path at the bottom edge. Everything else is perfectly flat solid magenta (#FF00FF), with no texture, grain, shadow or glow. Exactly the style of the attached illustration: hand-painted storybook gouache on paper, paper grain, no black outlines, flat two-or-three-tone shading, cozy little sci-fi. No people, no text, no letters, no numbers, no logos."

E1 — Lander and landing pad, night
ATTACH: style/night.png
---8<---
From the attached illustration, take ONLY the lander and its landing pad on the left, exactly as they look (same design, colours and style), and complete any hidden parts: a round cream-and-terracotta metal lander on three piston legs, a glowing teal ring around its porthole, its hatch open with warm light inside, a metal ramp down to a round stone landing pad with small glowing teal guide lights around its edge. Wide 16:9, the lander large and centred. Side view, almost no perspective, the pad standing on a short strip of sandy path at the bottom edge. Everything else is perfectly flat solid magenta (#FF00FF), with no texture, grain, shadow or glow. Exactly the style of the attached illustration: hand-painted storybook gouache on paper, paper grain, no black outlines, flat two-or-three-tone shading, cozy little sci-fi. No people, no text, no letters, no numbers, no logos.
---8<---

E2 — Trading dome (OPINEX), night, door closed
ATTACH: style/night.png
---8<---
In exactly the style of the attached illustration, paint one small sci-fi market dome, a little bigger than the dome in the attached image: a dome of cream metal panels with seams and rivets, a striped terracotta-and-cream fabric awning over a market counter on its front, two small glowing teal screens beside the counter showing only simple rising and falling line charts (no numbers), small crates of goods stacked by the counter, a round sliding hatch door with a porthole (closed), a thin teal light strip around the base, a small dish and a slim antenna with a warm light on top, a hanging lantern glowing warm yellow. Wide 16:9, the building large and centred. Side view, almost no perspective, the building standing on a short strip of sandy path at the bottom edge. Everything else is perfectly flat solid magenta (#FF00FF), with no texture, grain, shadow or glow. Exactly the style of the attached illustration: hand-painted storybook gouache on paper, paper grain, no black outlines, flat two-or-three-tone shading, cozy little sci-fi. No people, no text, no letters, no numbers, no logos.
---8<---

E3 — Compliance lab (EzyComp), night, door closed
ATTACH: style/night.png
---8<---
In exactly the style of the attached illustration, paint one small sci-fi compliance lab: a neat boxy two-storey module of cream metal panels with rounded corners, a wide window on the upper floor showing rows of tidy filing racks and folders lit warm inside, a large round emblem on its wall shaped like a shield with a check mark (no letters), a small terminal with a glowing teal screen and a clipboard holder beside the door, a sliding hatch door with a porthole (closed), a thin teal light strip under the roof edge, two small solar panels and a short antenna on the roof, a warm-yellow lamp by the door. Wide 16:9, the building large and centred. Side view, almost no perspective, the building standing on a short strip of sandy path at the bottom edge. Everything else is perfectly flat solid magenta (#FF00FF), with no texture, grain, shadow or glow. Exactly the style of the attached illustration: hand-painted storybook gouache on paper, paper grain, no black outlines, flat two-or-three-tone shading, cozy little sci-fi. No people, no text, no letters, no numbers, no logos.
---8<---

E4 — Academy hut (iDev certificates), night, door closed
ATTACH: style/night.png
---8<---
In exactly the style of the attached illustration, paint one small sci-fi academy hut: a rounded capsule-shaped hut of cream metal panels with a terracotta roof cap, a round window lit warm inside showing a small classroom desk, and on its side a big friendly certificate-printing machine with dials and a glowing teal panel, feeding out a long ribbon of blank cream certificate paper with a small round terracotta seal on each sheet, the ribbon curling into a basket. A sliding hatch door with a porthole (closed), a teal light strip around the base, a short antenna with a small star-shaped light on top, a warm lamp by the door. Wide 16:9, the building large and centred. Side view, almost no perspective, the building standing on a short strip of sandy path at the bottom edge. Everything else is perfectly flat solid magenta (#FF00FF), with no texture, grain, shadow or glow. Exactly the style of the attached illustration: hand-painted storybook gouache on paper, paper grain, no black outlines, flat two-or-three-tone shading, cozy little sci-fi. No people, no text, no letters, no numbers, no logos.
---8<---

E5 — Supply depot (InvoicePal), night, door closed
ATTACH: style/night.png
---8<---
In exactly the style of the attached illustration, paint one small sci-fi supply depot: a low half-cylinder hangar of cream ribbed metal with a terracotta stripe, a wide roller door (closed) with a small porthole door beside it, neat stacks of crates and parcels with simple terracotta straps outside, a little round delivery drone docked on a pad on the roof with a blinking light, a small kiosk window with a glowing teal ledger screen showing only simple horizontal lines (no numbers) and a short paper receipt curling out of a slot, a warm lamp over the door, a teal light strip along the base. Wide 16:9, the building large and centred. Side view, almost no perspective, the building standing on a short strip of sandy path at the bottom edge. Everything else is perfectly flat solid magenta (#FF00FF), with no texture, grain, shadow or glow. Exactly the style of the attached illustration: hand-painted storybook gouache on paper, paper grain, no black outlines, flat two-or-three-tone shading, cozy little sci-fi. No people, no text, no letters, no numbers, no logos.
---8<---

E6 — Construction site (Jombay design system, coming soon), night
ATTACH: style/night.png
---8<---
In exactly the style of the attached illustration, paint one small sci-fi construction site: a half-built module wrapped in simple wooden-and-metal scaffolding, its walls made of neat square modular panels in cream, sage and terracotta, some panels already fitted like tidy tiles and others stacked on the ground waiting, a small yellow crane arm lifting one square panel, a slowly turning orange beacon light glowing on top, two little traffic cones and a work lamp casting warm light. Wide 16:9, the site large and centred. Side view, almost no perspective, standing on a short strip of sandy path at the bottom edge. Everything else is perfectly flat solid magenta (#FF00FF), with no texture, grain, shadow or glow. Exactly the style of the attached illustration: hand-painted storybook gouache on paper, paper grain, no black outlines, flat two-or-three-tone shading, cozy little sci-fi. No people, no text, no letters, no numbers, no logos.
---8<---

E7 — Your observatory (home), night, door closed
ATTACH: style/night.png
---8<---
In exactly the style of the attached illustration, paint one sci-fi observatory, clearly the biggest and most special building of the village: a tall round tower of cream metal panels with rivets and a ring of round porthole windows glowing warm, topped by a large silver-white dome with its slit open and the tube of a brass-and-cream telescope pointing out at the sky, a thin railing walkway around the base of the dome, a round sliding hatch door with a porthole (closed) and a warm lamp above it, a small garden of glowing pale-blue flowers and a little bench by the door, string lights in warm yellow along the railing, a tall slim antenna with a blinking red tip, a teal light strip around the base. Tall 3:4 image, the observatory large and centred. Side view, almost no perspective, standing on a short strip of sandy path at the bottom edge. Everything else is perfectly flat solid magenta (#FF00FF), with no texture, grain, shadow or glow. Exactly the style of the attached illustration: hand-painted storybook gouache on paper, paper grain, no black outlines, flat two-or-three-tone shading, cozy little sci-fi. No people, no text, no letters, no numbers, no logos.
---8<---

>>> STOP — send E1, E2 and E7 to Claude (cut-out check, scale check against the character).

E8 to E12 — Door open (night)
For each: E8 from E2, E9 from E3, E10 from E4, E11 from E5, E12 from E7.
ATTACH: the closed-door version
---8<---
Repaint the attached building exactly as it is (same everything, same size and position), with only one change: its door is now open (the hatch slid aside into the wall, or the roller door rolled up), showing a warm golden-lit interior just inside the doorway, and a soft warm pool of light falling onto the sandy path in front of the door. Keep the background perfectly flat solid magenta (#FF00FF). Same style. No people, no text.
---8<---

E13 to E24 — Day versions
For each night image, its day version: E13 from E1, E14 from E2, E15 from E3, E16 from E4, E17 from E5,
E18 from E6, E19 from E7, E20 from E8, E21 from E9, E22 from E10, E23 from E11, E24 from E12.
ATTACH: the night version, and style/day.png
---8<---
Repaint the first attached building exactly as it is (same shapes, positions and size) in soft daylight, matching the colours and light of the second attached illustration: warm cream panels, terracotta, sage, soft shadows; lamps and windows switched off or only faintly lit; teal strips dim. If the door is open, the inside stays softly lit. Keep the background perfectly flat solid magenta (#FF00FF). Same hand-painted style and paper grain. No people, no text.
---8<---


=================================================================
STEP F — PROPS
=================================================================

F1 — Props sheet, night
ATTACH: style/night.png
---8<---
In exactly the style of the attached illustration, paint these separate objects on a flat solid magenta (#FF00FF) background, spaced well apart, not touching, all in side view and to the same scale as the attached scene: (1) a slim metal lamp post with a glowing round warm-yellow lamp orb; (2) a straight section of low metal-rail fence with three posts, each post with a small glowing teal cap; (3) a single fence post on its own; (4) a blank metal-framed sign panel on two posts with a soft glowing edge, wide and short, the panel plain cream and empty; (5) a smaller blank sign panel on one post; (6) a stack of three small crates; (7) a slim antenna with a dish; (8) a short pipe coming out of the ground with a valve. Wide 16:9. The magenta is perfectly flat with no texture, grain, shadow or glow. No text, letters or numbers anywhere, including on the signs.
---8<---

F2 — Props sheet, day
ATTACH: F1.png, style/day.png
---8<---
Repaint the objects in the first attached image exactly as they are (same shapes, sizes and positions) in soft daylight, matching the second attached illustration: lamps and teal caps switched off, warm cream and terracotta metal, soft shadows. Keep the background perfectly flat solid magenta (#FF00FF). Same style. No text, letters or numbers.
---8<---


=================================================================
STEP G — THE OBSERVATORY INSIDE AND THE TELESCOPE
=================================================================

G1 — Observatory interior
ATTACH: style/night.png, E7.png
---8<---
In exactly the style of the attached illustrations, paint the inside of this observatory as a very wide 21:9 image, a cosy round room seen straight from the front like a theatre stage set, almost no perspective. The curved cream-panelled walls rise to the inside of the dome; through the open slit in the dome, a strip of starry night sky. In the centre stands a large brass-and-cream telescope on a sturdy mount, angled up toward the slit. Around the room, spaced clearly apart so each is easy to see:
- on the left, a wooden desk with an open leather logbook, a warm desk lamp and a mug of chai;
- a wall rack of brass scientific instruments (a sextant, a compass, dials, a small orrery);
- a bookshelf of old books and rolled star charts;
- a cork pinboard with four empty cream photo cards pinned on it (the cards are blank);
- a framed certificate with a blank cream page and a small round terracotta seal (no writing);
- a small friendly printer on a side table;
- a vintage radio set with dials and a small glowing teal screen;
- on the right, a wall of five blank framed boards in a row, like mission patches, each a plain cream panel with a different simple coloured border (terracotta, sage, teal, mustard, lilac), empty inside.
A warm rug on the floor, a small plant, string lights along the dome's edge, warm lamplight mixed with cool starlight. Hand-painted storybook gouache on paper, paper grain, no black outlines, flat two-or-three-tone shading, cozy little sci-fi. No people. No text, no letters, no numbers, no logos anywhere.
---8<---

G2 — Telescope sky, piece 1
ATTACH: B1.png
---8<---
In exactly the style of the attached image, paint a deep starry sky as seen through a telescope, as a very wide 21:9 panorama: much darker and richer than the attached sky, deep navy and near-black indigo, densely filled with stars of every size (many tiny, some medium, a few bright four-pointed sparkles), soft painted nebulae in lilac, violet, teal and rose, a small sparkling star cluster, and a faint spiral galaxy. Hand-painted gouache on textured paper, visible paper grain. No planets, no comets, no satellites, no lines between stars, no ground, no frame, no text. Fill the whole image edge to edge.
---8<---

G3 — Telescope sky, piece 2   (ATTACH: G2.png)
---8<---
Continue the attached deep starry sky to the right as a new very wide 21:9 image. The left quarter must repeat the right quarter of the attached image as closely as possible, then the sky continues with new stars, a large soft nebula in rose and teal, and a second small star cluster. Same style, colours and paper grain. No planets, no comets, no satellites, no lines, no text.
---8<---

G4 — Sky objects sheet
ATTACH: G2.png
---8<---
In exactly the style of the attached image, paint these separate sky objects on a perfectly flat solid green (#00FF00) background, spaced well apart, not touching: (1) a bright comet with a glowing cream head and a long soft lilac-and-teal tail; (2) a small cute satellite with two solar-panel wings, a dish and a blinking light; (3) a floating radio beacon like a small buoy with an antenna, sending out three soft teal rings; (4) a small terracotta planet with a thin ring; (5) a small teal ocean planet; (6) a small lilac moon; (7) a bright four-pointed star with a soft halo. Hand-painted gouache, no black outlines, flat two-or-three-tone shading. The green is perfectly flat with no texture, grain, shadow or glow. Wide 16:9. No text.
---8<---

G5 — Eyepiece ring
ATTACH: style/night.png
---8<---
In exactly the style of the attached illustration, paint a single brass telescope eyepiece ring seen straight on, as a perfect circle filling most of a square 1:1 image: a thick round frame of warm brass with a knurled grip edge, a few small screws and a thin inner lip, softly lit. The inside of the ring and everything outside it are perfectly flat solid magenta (#FF00FF), with no texture, grain, shadow or glow. Hand-painted storybook gouache, no black outlines. No crosshair, no text, no numbers.
---8<---

>>> STOP — send G1 and G2 to Claude.


=================================================================
STEP H — YOU
=================================================================

H1 — Walk cycle sheet (helmet on)
ATTACH: style/you.png, style/night.png
---8<---
Using the first attached image as the exact character (same face, glasses, moustache, hair, cream spacesuit with terracotta trim, sage backpack with a light, round glass helmet) and the second attached image as the exact art style, draw a walk-cycle sprite sheet: eight frames of the same character walking, in strict side view facing right, arranged in two rows of four, every frame the same size and the same scale, the feet on the same baseline in every frame. The frames show one full step cycle: contact, down, passing, up, then the same with the other leg. Arms swing opposite the legs. Small cute chibi proportions, about 2.5 heads tall. Hand-painted storybook gouache, paper grain, no black outlines, flat two-or-three-tone shading. The background is perfectly flat solid magenta (#FF00FF) with no texture, grain, shadow or ground. The helmet glass is clear, so the magenta shows through it. No text, no numbers, no frame borders.
---8<---

H2 — Poses sheet (helmet on)
ATTACH: style/you.png, style/night.png
---8<---
Using the first attached image as the exact character and the second as the exact art style, draw four poses of the same character, same size and scale, side by side in a row, feet on the same baseline: (1) standing still, side view facing right, relaxed; (2) standing, side view facing right, head tilted back looking up at the sky in wonder; (3) facing us, waving with one hand, smiling; (4) facing us, standing relaxed, turning. Small cute chibi proportions, about 2.5 heads tall. Hand-painted storybook gouache, paper grain, no black outlines, flat two-or-three-tone shading. Perfectly flat solid magenta (#FF00FF) background with no texture, shadow or ground. The helmet glass is clear. No text.
---8<---

H3 — Indoor poses (helmet off)
ATTACH: style/you.png, style/night.png
---8<---
Using the first attached image as the exact character and the second as the exact art style, draw four poses of the same character WITHOUT the helmet (the spacesuit stays on, the helmet held under one arm or set aside, hair a little messy), same size and scale, side by side in a row, feet on the same baseline: (1) standing facing us, relaxed, smiling; (2) waving at us; (3) three-quarter view turned to the left, pointing at something; (4) three-quarter view turned to the right, pointing at something. Small cute chibi proportions, about 2.5 heads tall. Hand-painted storybook gouache, paper grain, no black outlines, flat two-or-three-tone shading. Perfectly flat solid magenta (#FF00FF) background with no texture, shadow or ground. No text.
---8<---

>>> STOP — send H1 to Claude. If the eight walk frames don't match each other closely
    (the face, suit or size changes between frames), Claude will ask for H4 instead:

H4 — Cut-out rig (only if Claude asks)
ATTACH: style/you.png, style/night.png
---8<---
Using the first attached image as the exact character and the second as the exact art style, draw the character in strict side view facing right, standing straight with arms hanging down, and next to it the same character taken apart into separate pieces laid out well apart, not touching: the head with helmet; the torso with backpack; the upper arm, lower arm with glove, for the near arm and the far arm; the thigh, the lower leg with boot, for the near leg and the far leg. Every piece complete (no missing parts where they joined), same scale. Hand-painted storybook gouache, paper grain, no black outlines, flat shading. Perfectly flat solid magenta (#FF00FF) background. No text.
---8<---


=================================================================
CHECKLIST
=================================================================
B1 B2 B3 B4 B5 B6 B7 B8
C1 C2 C3 C4 C5 C6 C7 C8 C9 C10 C11 C12
D1 D2 D3 D4 D5 D6 D7 D8 D9 D10
E1 E2 E3 E4 E5 E6 E7 E8 E9 E10 E11 E12
E13 E14 E15 E16 E17 E18 E19 E20 E21 E22 E23 E24
F1 F2
G1 G2 G3 G4 G5
H1 H2 H3 (H4 only if asked)
