# Product brief

## Identity

Echo Heist is a single-player top-down cooperative puzzle-action adventure. The player controls Patch, a capable maintenance robot. Echo is a smaller autonomous courier that learns. They recover eleven relay cores from WARDEN's locked-down city. Restoring a core lights up a district. In the finale, Echo opens the route that saves Patch.

Core promise: **You handle the heist. Echo learns how to help. Together, you escape.**

## Audience and scope

Students in an introductory RL course; ordinary laptop browser; keyboard and mouse. The campaign has 11 chapters and 55 missions. English UI initially. Touch-optimized gameplay, localization, multiplayer, user-generated code, a Python trainer, networked grading, a level editor, and mobile app packaging are out of scope unless separately requested.

Desktop play is the release target. On small/touch-only devices the landing page, menu, and settings remain usable; explain the keyboard requirement rather than presenting broken controls. Do not falsely advertise mobile gameplay support.

## Game loop

Enter a room, inspect the obstacle, make one meaningful preparation decision, run the heist with Echo, observe the consequence, and retry or extract. Patch manipulates machinery while Echo takes the autonomous route. Changes to Echo's task environment occur before launch or at explicit handoffs.

Typical attempt design target: 30-90 seconds. A mission may contain multiple attempts; a finale may contain several short stages. These are playtest targets, not promises or enforced timers. The game must support pausing and rapid retry.

## Product requirements

| ID | Requirement | Observable evidence |
|---|---|---|
| P01 | A real game, not a lesson viewer | A first-time player can complete L01 by interacting with the world; no mandatory lecture/quiz screen. |
| P02 | One coherent campaign | Patch/Echo, input scheme, objective vocabulary, and state semantics remain consistent across all chapters. |
| P03 | Real RL | Policy/estimate/model changes arise from implemented algorithms; tests prove updates, evaluation freezing, and no oracle leakage. |
| P04 | A useful human role | Every mission has a Patch task or consequential dispatch choice, not merely a Train button. |
| P05 | Polished presentation | Illustrated landing, full-viewport animated elevator menu, world map, feedback-rich buttons, music, SFX, and a playable HUD. |
| P06 | Front-end only | Production play makes no required request outside the deployment origin; no API keys or backend endpoints. |
| P07 | Persistent/recoverable progress | Continue works after reload; valid exports import; malformed files do not erase saves. |
| P08 | 55 distinct playable missions | All IDs present, authored mechanics differ meaningfully, every required objective is reachable and learnable. |
| P09 | Honest pedagogy | Performance evidence is not labeled mastery; provisional syllabus mapping remains documented. |
| P10 | Inclusive controls | Keyboard menus, remapping, mute, reduced motion/flashes, visible focus, and non-color-only signals. |

## Progress and scoring

A basic mission clear unlocks the next mission. Optional efficiency, repeatability, and independence medals are separate from required progression. Do not require a perfect training run or a perfect score to access the next lecture. Later heists can involve several distinct deliveries, but not an endless pass-rate grind.

Profiles retain completed missions, settings, collectibles, and cartridge snapshots. Retry resets world state, not learned parameters. A visible reset-cartridge action is separate and confirmed. Re-entering a comparison fixture may intentionally create a clean test copy, with provenance displayed briefly at the dock.

## Deliberate exclusions

No permanent charts or algorithm dashboard. No compulsory free-text answers, equation quizzes, lecture text walls, or coding tasks. No health/weapon upgrade economy, open-world traversal, multiple trainable allies, online chat, procedural campaign generation, or combat escalation. Security units and hazards follow ordinary authored logic, not another learning system.

## Release definition

All milestone gates pass, including learning verification, complete mission coverage, save safety, actual browser interaction tests, base-path deployment, asset provenance, and recorded human playtests. Passing a build alone does not establish an enjoyable or pedagogically successful product.
