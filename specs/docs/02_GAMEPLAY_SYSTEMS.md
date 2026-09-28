# Gameplay systems and interaction rules

## Stable controls

WASD/arrows move Patch; E interacts; Space uses the equipped gadget; R retries the active attempt; Esc pauses. Direction inputs do not create diagonal actions. Resolve simultaneous keys consistently using most-recent press, then a fixed priority on exact ties. Input is ignored by the world while a modal or editable field has focus. Releasing focus clears held keys.

Echo actions are `WAIT`, `NORTH`, `EAST`, `SOUTH`, `WEST`, `INTERACT`. Patch uses the same grid movement semantics; pushing is a Patch-only interaction. Echo does not have a hidden auto-route planner. An interaction targets the current tile, otherwise the faced adjacent tile, using an explicit entity-priority rule. There is no separate inventory menu in v1.

## Movement and cooperation

Simulation advances in 125 ms decisions by default (8 steps/s); rendering interpolates. One move occupies one tile; walls block movement without teleportation. Hold input to continue walking. Do not change learning outcomes with display frame rate or camera zoom.

Echo can fit through service passages. Patch can push a crate and operate heavy machinery. Each mission splits into safe preparation, an autonomous Echo task lane, and a handoff/extraction. Patch actions during a rollout either concern an independent lane or have fixed modeled effects declared in the level. Use latched pressure plates or defined synchronization windows rather than an arbitrary moving-player dependency hidden from Echo.

## Reusable objects

| Object | Rules | Learning connection |
|---|---|---|
| Fuse/key/core | One object ID, one carrier, explicit pickup/delivery, no duplicate reward from redelivery | State includes cargo; task differs before/after pickup. |
| Scrap | Optional one-shot collectible; recorded outside the required-cargo slot | Training reward may conflict with mission objective. |
| Door | Open/closed/locked; key consumption is authored and observed | Action consequences and state changes. |
| Pressure plate | Latched by default for Echo tasks; timer/phase explicitly represented if temporary | Sequential dependencies without hidden dynamics. |
| Conveyor | Authored outcome distribution, one displacement per step, bounded cells | Stochastic transitions. |
| Laser | Fixed short phase cycle visible in observation and animation | Relevant state and timing. |
| Security robot | Small deterministic patrol or declared transition model; no pursuit complexity in v1 | Route risk with modeled dynamics. |
| Charger | Explicit remaining charge/availability; no infinite battery/reward farming | Resource trade-offs and future return. |
| Dock | Task configuration, snapshot, practice launch, retry, explicit memory reset | Episodes, controlled experience, evaluation. |
| Exit | Tests task predicates and Patch/Echo arrival; never tests chosen algorithm | Behavioral completion. |

## Equipment: mechanics, not unlock quizzes

Priority cartridge changes bounded reward weights. Scanner reveals actual learned estimates or observed state, with unavailable data marked unknown. Blueprint lens is available only in known-model chapters. Recorder selects a genuine prediction update. Exploration dial changes training behavior, not a win flag. Pattern cartridge chooses a versioned encoder. Model projector uses learned counts. Actor/critic and neural cartridges expose only the current mission's meaningful setting. Tether records observation-action demonstrations, not timed movement macros.

A cartridge can be fixed by chapter to focus practice; a mission may require an equipment capability. However, a clear always depends on resulting world behavior. No `if algorithm == expected then unlockExit` logic.

## Dock state machine

`IDLE -> CONFIGURING -> PRACTICING -> READY -> DEPLOYED -> RESULT`.

Cancel practice returns to IDLE with the last valid checkpoint. Changing environment configuration increments its revision and invalidates in-flight results. Deploy uses an immutable snapshot. Retry restores the room and returns to READY with memory retained. Reset memory requires a separate confirmation and creates a fresh cartridge version.

During practice show at most two controls plus Launch/Stop. Each control has a short in-world label and optional formal term, for example `Try new routes (epsilon)`. A few real sample trajectories may be projected in the room. No full metrics dashboard is required.

## Failure, help, and consequences

Caught, exhausted, lost cargo, or missed task deadline ends the attempt. Show the immediate cause with a short animation and one readable cue. Restart should regain control quickly; target under one second after the player requests it, excluding unavoidable asset loading.

After repeated similar failures, offer an optional observation cue: highlight the wrong item, compare cargo-state icons, replay the first route divergence, or indicate that the model's prediction mismatched a real outcome. Do not select the winning algorithm automatically. Any assistance that alters gameplay is disclosed, stored, and excluded from independence medals; it must not contaminate algorithm comparison data.

## Tension without punishment

Movement timing matters, but avoid reflex-heavy precision as the gate to RL progress. No lives or permanent inventory loss. Story retries are rehearsal resets. Preserve the ability to pause at any time. Cosmetic restoration and character reactions provide progression; numerical stat inflation must not erase the decision-making challenge.
