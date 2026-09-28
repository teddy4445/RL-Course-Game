# Asset inventory and production briefs

All entries are **required/proposed assets, not delivered assets**. M02 may use locally generated SVG/canvas art and synthesized sounds as clearly tracked placeholders. Final art/audio is an M10 gate. Runtime paths are relative to the configured base.

## Priority inventory

| ID family | Asset | Initial spec | Priority |
|---|---|---|---|
| brand-logo | Echo Heist wordmark/icon | SVG or transparent PNG; no external font dependency | Shell |
| hero-city | Landing city panorama | Layered wide composition; responsive crop; 1920x1080 source target | Shell |
| menu-elevator | Elevator frame/window/interior | Separate foreground/city layers; controls remain DOM | Shell |
| patch-atlas | Patch directions/animations | Four facings, idle/move/interact/carry/caught/celebrate | First heist |
| echo-atlas | Echo directions/animations | Same action family; eye expressions; cargo attachment | First heist |
| common-tiles | Floor, walls, corners, service passage | 64 px source tile target, consistent collision silhouette | First heist |
| mechanism-atlas | Door/plate/conveyor/laser/charger/dock/socket | Clear inactive/active/error states | First chapter |
| pickup-atlas | Fuse, key, core, scrap, battery | Distinct shape as well as color | First heist |
| ui-controls | Buttons, toggles, tabs, sliders, focus ring | All interaction states; nine-slice or CSS-friendly | Shell |
| ui-icons | Pause, sound, save, retry, cargo, settings, medals | Original consistent line weight; text alternatives | Shell |
| map-districts | Eleven district silhouettes/restoration layers | Five node anchors per district; accessible DOM overlay | Campaign |
| district-c01..c11 | Theme skins/backdrops | Shared geometry and collision logic | Campaign |
| projection-fx | Arrows, traces, scan lines, pulse rings | Display actual data; reduced-motion variant | Learning |
| outcome-fx | Caught/reset/delivery/restoration | Brief, readable, non-flashing alternative | Polish |
| music-menu | Elevator theme | Loopable original electronic cue | Shell |
| music-heist | Base/alert/extract layers or validated crossfade loops | Consistent tempo/loop length where layered | Campaign |
| music-restoration | Short district success cue | No long forced wait | Polish |
| sfx-ui | Hover, press, confirm, cancel | Quiet, capped voices | Shell |
| sfx-world | Pickup, delivery, gate, caught, reset, dock, core | Visible equivalent cue | First chapter |
| echo-chirps | Waiting, success, error, surprise | Short nonverbal original effects | Polish |

## Required metadata per actual file

Asset ID; relative path; type; dimensions/duration; atlas frame names; pivot/anchor; loop points; loading group; approximate transfer size; creator/source URL where relevant; license or permission evidence; modification notes; final/placeholder status; accessibility fallback; and checksum/version. A URL alone is not proof of redistribution rights.

Use names such as `echo/move/east/00` consistently. Pivots must not shift between frames. Atlas regions need appropriate padding/extrusion; verify that transparent edges do not bleed during camera scale. Do not pack all district media into the initial landing bundle.

## Original-art brief: characters

Create two original friendly maintenance robots for a readable top-down 2D game. Patch is compact orange industrial equipment with a tool arm and repaired panels. Echo is a smaller cyan-lit wheeled courier with expressive rectangular eyes and a cargo compartment. Rounded silhouettes, clean shapes, soft shadow, orthogonal game perspective, transparent background, consistent scale. No lettering in the image, no copied franchise design, no background baked into sprites.

## Original-art brief: menu

A cozy mechanical service elevator at night, viewed front-on for a full-screen game menu. Thick side rails and a broad rear window reveal a locked-down city with eleven visually distinct neighborhoods. Warm work lights, deep blue shadows, a small orange robot and cyan companion waiting together. Leave clear central-left control space. Supply layers rather than baked buttons/text.

## Audio brief

Original playful electronic heist music, light mechanical percussion, warm two-character motif, non-intrusive during repeated attempts, clean loop boundaries. Provide a calm loop and an extraction variation; if stems are produced, match tempo/length exactly. No recognizable copyrighted melody or artist imitation requirement.

## Placeholder policy

A complete local placeholder is preferable to a broken external URL or invisible asset. Placeholders must preserve silhouettes, hit areas, feedback, and loading behavior. Mark their state in metadata and status; do not claim a polished asset gate passed until a human reviews the actual look/sound. No image/audio generation service is a runtime dependency.
