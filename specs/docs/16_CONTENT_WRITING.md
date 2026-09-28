# Narrative, copy, feedback, and terminology

## Voice

Brief, warm, capable, slightly mischievous. Patch speaks through compact contextual lines; Echo mostly communicates through movement and electronic chirps. WARDEN's signage is overly literal rather than cruel. No lengthy cutscenes, combat threats, real-world politics, or lecture narration.

Story arc: rescue Echo; become partners; restore districts; teach from personal experience; Echo rescues Patch. Each chapter's core restoration changes the world map and elevator panorama. Dialog never pauses the game for multiple paragraphs.

## Copy limits (initial design targets)

Mission name: usually 2-5 words. Objective: one short imperative, ideally under 12 words. Context cue: one line, ideally under 14 words. Failure explanation: one observable cause. Result: at most two metrics. Tool labels: physical name with an optional formal term, not a textbook definition. Do not truncate essential text just to meet a target.

## Example strings

Landing: `One city. Two robots. Every mistake makes you better.`
Primary action: `Play Echo Heist`.
L01 objective: `Power Echo's dock. Reach the exit together.`
L02 cue: `That is shiny. It is not the fuse.`
L03 cue: `The useful route starts with a detour.`
L06 cue: `Same junction. Different cargo.`
L18 cue: `One good delivery is only one delivery.`
L34 cue: `The projection worked. The conveyor did not.`
L52 cue: `New starting point. Same destination.`
L55 completion: `Your turn to follow me.`

Menu: Continue / New Game / Districts / Settings / Credits.
Dock: Prepare / Practice / Stop / Deploy / Reset cartridge.
Reset confirmation: `Erase this cartridge's training? Campaign progress stays.`
Save error: `Progress could not be saved. Export it before leaving.`
Worker error: `Practice stopped. Your last checkpoint is safe.` Use the last phrase only if a checkpoint actually exists; otherwise state that no checkpoint was saved.

## Pedagogical feedback without lecture screens

Use on-world route arrows, cargo icons, changing action choices, and actual repeated outcomes. A student can optionally inspect a formal label, but completing the game never requires reading a derivation. Equations remain in developer/instructor documentation, not mandatory gameplay panels.

Avoid `intelligence level`, `confidence` without a computed calibrated measure, `mastered RL`, and `the algorithm always finds the safest route`. Use precise outcome labels: successful deliveries, falls during practice, actions used, or prediction error where actually computed.

## Localization-ready organization

Keep strings in keyed data files even though English is the only required language. Do not bake words into artwork or concatenate translated fragments. UI tests reference roles/labels/IDs; exact copy changes should not break all tests. Preserve keyboard shortcut hints from actual bindings, not hardcoded letters.

## Copyright and attribution

Do not paste lecture slides or textbook paragraphs into the game. Original short explanations and ordinary algorithm labels are enough. Credits include libraries and assets with actual rights records. The course password is never a credit, public link parameter, or bundled metadata value.
