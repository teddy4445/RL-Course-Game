# C01 vector production contract v1

## Authority and style

Use `references/AUTHORITATIVE_GAMEPLAY.png` as the visual reference. Orthogonal top-down gameplay; slight visible front surfaces on objects and robots. No perspective transformation in collision logic. Dark slate metal, warm orange Patch, pale cyan/white Echo. Blue arrow-pattern floors mark the Echo-only lane; orange exit labeling belongs to Patch. Color is reinforced by pattern and labels.

Patch is a ground-moving orange maintenance robot with a wrench arm. Echo is smaller and moves on visible wheels; neither can fly over walls. No drawn scenery overrides the exact map. This is a coherent vector production pass, not a guarantee of matching every painted detail in previous concept images.

## Deliverables

Each robot: 136 transparent 128 x 128 PNG frames and 136 editable SVG frames. Seven animation families in four cardinal facings: idle (4), walk (6), interact (4), carry (6), caught (4), celebrate (6), charge (4). Atlas: 768 x 3584, 6 columns, 28 rows, untrimmed fixed cells. Combined: 272 animation frames across both characters, 56 named animation sequences.

Names: `{character}_{state}_{facing}_{frame:02d}`. Facings: south, west, east, north. Frames and timing are explicit in `public/assets/characters/{character}-atlas.json`. Do not infer animation order from arbitrary filesystem sorting.

Foot anchor: `(64,106)` pixels in each 128-square frame; normalized pivot `(0.5,0.828125)`. Default art tile source: 64-square. Object PNGs are 64-square and scaled inside a tile. Manifest collision footprint `(0.42,0.42)` is a future visual guide only; current simulation uses discrete cell occupancy, never alpha-based collision.

## Animation handling

Idle/walk/carry/charge may loop according to the JSON. Caught/interact/celebrate are bounded clips in the metadata. The prototype honors loop flags: looped clips use the render clock, while one-shot clips start on state entry and hold their final frame. Human animation polish and transition review remain necessary.

Transparency is actual PNG alpha, not a painted checkerboard. A sprite includes its own small grounded shadow; do not stack a second dense shadow. Use source SVG for large menu illustrations. Keep HUD text in HTML/canvas text rather than baked into the sprite.

## Asset scope

24 object kinds, seven tile kinds, eight UI icons, and a city background are included. The object catalog includes a few future-ready alternates (for example dock-on and laser-off). The prototype does not claim every object state or decorative asset is used in all rooms. Full enemy sets, weapon effects, diagonal locomotion, and later district environments are out of scope.

## Regeneration

`python scripts/make_assets.py` uses Python, Pillow and CairoSVG. It writes original vector geometry and rasterizes exact frames; it does not use or crop earlier AI concept artwork. `python scripts/make_layout_previews.py` uses the same object files to render coordinate-labelled review layouts. Runtime does not require Python. No font files or third-party image assets are bundled.
