# Echo Heist production kit

This kit and the accompanying game agree on one camera, two characters, 25 exact rooms and a real opening interaction flow. The clean character/object atlases remain the authoritative visual kit; Chapters 2-5 extend them through renderer palettes, lighting and signage rather than claiming unreviewed replacement atlases.

| Deliverable | Source / review path | Use |
|---|---|---|
| Authoritative gameplay reference | references/AUTHORITATIVE_GAMEPLAY.png | Actual running L02 scene at 1600 x 960; not a speculative illustration. |
| Visual and animation contract | ART_CONTRACT.md | Scale, projection, anchors, naming, states, and collision separation. |
| Clean Patch / Echo assets | ../public/assets/characters/ | Transparent frames, editable SVGs, PNG atlases and named-frame metadata. |
| Basic scrapyard props | ../public/assets/objects/ and ../public/assets/tiles/ | Mechanisms, objects, floors and walls; actual engine-ready exports. |
| Art review board | art/asset-contact-sheet.png | Review only; do not load as a gameplay sprite sheet. |
| Animation inspector | ../asset-viewer.html | Interactive playback with anchor display, using the same delivered files. |
| Twenty-five exact layouts | layouts/L01.json through L25.json, corresponding PNGs | Coordinates and entity IDs; canonical runtime records in src/content/levels/. |
| Layout/object guide | LEVEL_LAYOUTS.md | Room intent, objective, links, coordinates and reproducible routes. |
| Opening script | scripts/OPENING_INTERACTION_SCRIPT.md and opening.json | Event-driven flow, text, input, feedback and failure behavior. |
| Original Chapter 1 audio subset | audio-subset.json | Forty selected files from the previously delivered original audio pack; the runtime manifest also selects the Chapter 2-5 stems directly from the full catalog. |

## Reference authority

The screenshot governs this production pass; the JSON governs walkability and outcomes. Decorative shadows, glows and illustrated protrusions never change collision. An attractive older concept sheet does not authorize a side-view platformer, ghost Echo, new combat system, or mandatory training dashboard.

## Ready versus provisional

Asset files are technically usable and have consistent atlas cells. The current code renders and animates them across Chapters 1-5. A human art review, novice playtest, audio listening pass, and deployed-browser validation are still required. Course alignment remains proposed because the slides were not verified in this work. No Chapter 6-11 completion is claimed.
