# Art direction and motion language

## Visual identity

Clean illustrated 2D, top-down readable orthogonal floors with shallow visible object sides. Rounded robots, sturdy industrial silhouettes, warm windows, restrained neon, soft shadows. Not photorealistic, not grim military art, not dense pixel noise, and not an isometric collision puzzle. Navigation tiles need no visible grid outside scanner mode.

Patch: larger orange maintenance shell, tool arm, repaired panels. Echo: small rounded wheeled courier, cyan face display, cargo slot. No hovering or wings that imply it can cross blocked tiles. WARDEN appears through architecture and security screens; do not turn the story into combat with humanoid opponents.

## Initial tokens

| Token | Value | Purpose |
|---|---|---|
| background | #0B1424 | Deep city backdrop |
| surface | #1C2B3D | Panels and machinery |
| surface-raised | #2B4056 | Active controls |
| patch | #F5A352 | Warm player identity |
| echo | #64D9E6 | Companion and projections |
| danger | #F36C83 | Hazards, with striped/shape cues |
| text | #F3EDE0 | Primary text |
| muted-text | #B8C3CD | Secondary text |

These colors are art choices, not automatically compliant contrast pairs. Check actual combinations at rendered sizes. Use system UI fonts initially; licensed local font files can replace them. Never fetch fonts from a CDN during play.

## Character animation set

Four facing directions minimum. Idle 4-6 frames, move 6-8, interact/pickup 4-6, carry 4-6, caught 4-6, celebrate 6-10. Frames are design guidance, not a requirement to draw hundreds before proving the game. Use shared body layers/cargo attachments where possible. Motion should communicate the same action IDs used by the simulation.

Eyes and posture show animation states such as waiting or carrying, not uncomputed statistical confidence. A surprised expression does not imply a numeric uncertainty model exists.

## District differentiation

Scrapyard: rust/furnace amber. Transit: platforms/route signs. Switchworks: junctions/circuit floors. Courier Quarter: tubes/parcels. Market: compact signage/shutters. Foundry: modular repeated shapes. Docks: cranes/loading lifts. Skybridge: open views/glass/height. Arcade: luminous cabinets/geometry. Storm Grid: wet metal/rain/breakers. Central Tower: precise architecture and restored-city panorama.

Reuse collision silhouettes and mechanics across district skins. Decoration cannot resemble a traversable door, collectible, or pressure plate unless it is one. Hazards remain visually consistent across skins. Rain, particles, and lighting are display-only.

## Composition and feedback

Logical viewport 1280x720, fit-with-letterbox as needed; UI uses responsive CSS and safe margins. Common rooms 12x8 to 20x12 tiles; Echo subrooms smaller. Tile art target 64 px and robot art target 96-128 px before display scaling. Camera shake subtle and optional. Layer order: floor, decals, solid objects, actors/cargo, low effects, projections, interface.

Button style: chunky beveled maintenance switches with edge lights and tactile movement. Focus is as intentional as hover. Selection causes the elevator to respond, not an unrelated ripple effect. Failure animation is brief; success has a cargo handoff, robot reaction, and district power pulse.

## Asset production rules

Use [19_ASSET_MANIFEST.md](19_ASSET_MANIFEST.md) as the inventory. Record source, author/tool, rights, dimensions, pivot, frames, and final/placeholder status. Atlas padding/extrusion should prevent edge bleeding at scale. Validate in the actual renderer. All hit areas and collision shapes are specified separately from decorative pixels.

Generated art prompts are briefs, not assets. No protected character lookalikes or unlicensed game screenshots. Illustrations must not bake UI labels into images; text stays selectable/localizable DOM text. Deliver source artwork only when rights permit. No external asset tool is mandatory for the functional build.
