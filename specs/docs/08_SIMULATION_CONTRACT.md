# Simulation contract - single source of truth

## Purpose

The same transition kernel drives visible play, accelerated real practice, known-model planning fixtures, and automated tests. A learned internal model is deliberately different: it is estimated from experienced transitions and must not call the exact kernel to generate imagined outcomes.

## Canonical action IDs

```text
0 WAIT
1 NORTH
2 EAST
3 SOUTH
4 WEST
5 INTERACT
```

Movement sets facing even when blocked. `INTERACT` checks the actor's tile then its faced adjacent tile. If multiple interactables exist, sort by declared interaction priority then stable entity ID. Cargo has one slot. Pickup and delivery require INTERACT; no hidden proximity auto-pickup. Patch can push an adjacent crate with INTERACT if the next cell is clear. Echo cannot push. Facing is part of the state whenever it changes interaction outcomes.

A blocked movement remains a legal action because it can change facing and consume a turn. The default policy action space includes all six commands; do not mask movement just because its destination is blocked, unsafe, or unrewarding. A named task profile may mask a genuinely unavailable command only if its availability is observable and the same mask is applied consistently to sampling and bootstrap targets. WAIT remains available.

Required cargo (fuse/key/core) occupies the one cargo slot. Optional scrap is an immediate one-shot collectible, recorded in the ledger and cosmetic pocket, not an additional required-cargo slot. INTERACT collects it only once. No free-form drop action exists in v1. Levels needing recovery from an incorrect required-cargo choice must supply an explicit labeled return socket with declared semantics, or use a clear retry; they cannot assume a missing drop control.

## Pure API shape (JSDoc contract, not delivered implementation)

```js
createEpisode(levelDefinition, episodeSpec) -> EpisodeState
step(state, {patchAction, echoAction}) -> {state, transition, events}
observeEcho(state, observationProfile) -> Observation
encodeObservation(observation, encoderSpec) -> Float32Array | string
checkObjective(state, events, objectiveSpec) -> ObjectiveStatus
serializeEpisode(state) -> PlainEpisodeSnapshot
```

`step` does not read time, window, input devices, Phaser objects, or global random state. It returns a new state or uses a documented internal mutable kernel hidden behind copy-safe snapshots; tests must prove the public semantics. Never retain mutable array aliases across environment copies.

## Episode state

Include content/version IDs; tick; declared task horizon and remaining steps; actor cells/facing; cargo ownership; collected/delivered item IDs; gate/plate states; charger remaining uses; hazard/patrol phase; current task stage; mission outcome; reward-event ledger; deterministic RNG stream states; and the immutable initial configuration hash. Static geometry is referenced by a versioned level definition.

Echo's complete task observation contains every task variable needed for its declared fully observed state, not irrelevant visual particles or Patch decoration. Independent Patch-lane state is excluded only if it cannot affect Echo transitions. Intentional restricted observations use a named diagnostic profile. Static unknown transition parameters can remain unknown in a model-free task; do not leak the seed or RNG state to the learner.

## Fixed tick order

1. Validate/normalize both actor actions and reject stale episode commands.
2. Resolve voluntary movement against the pre-step occupancy map. Same-destination conflicts block both; occupied-tile moves and swaps are blocked. Level layouts should avoid relying on crowded actor swaps.
3. Apply interactions using post-movement positions, Patch then Echo, with stable object ownership checks.
4. Apply at most one conveyor displacement per affected actor, using the environment RNG. Never recursively chain conveyor movement within one tick.
5. Advance hazard/patrol phases according to authored rules and test collision/contact on occupied cells. Swept crossings, if a hazard can skip cells, must be declared and tested; v1 hazards move at most one cell per step.
6. Apply resource changes, one-shot event rewards, and task-stage latches.
7. Check fatal failure first; a caught actor cannot also win on the same tick. Otherwise check successful delivery/extraction. A delivery on the last permitted step counts before timeout; an unsuccessful attempt then terminates by timeout.
8. Increment tick/decrement horizon and emit the next observation plus reward and outcome flags.

This order must be identical headless and rendered. Projections never modify it. Invalid movement is a consumed turn with the same step cost, not a skipped observation.

## Rewards and objectives

Default starting reward: task delivery +10 once, caught/lost cargo -10 once, each step -0.02, optional scrap 0 except designated reward-design missions. Any one-shot reward uses `(episodeId, eventKind, entityId)` deduplication. No reward on merely standing on the same item/socket. Changes to rewards are versioned and recorded with the run; previous learning is not silently relabeled as trained under the new reward.

Mission objective example: `delivered(fuseA,socketA) AND at(Patch,exit) AND at(Echo,exit) AND notFailed`. A practice courier rollout may terminate upon fuse delivery; the visible cooperative mission then continues as a new explicit task stage. Do not bootstrap values across two unrelated stage MDPs. Reward is a learning signal; score and mission outcome remain independent.

## Termination versus truncation

`terminated` means a true task success/failure or an intrinsic finite horizon. The remaining time is observable when that horizon affects the task. `truncated` is an administrative stop outside the MDP, such as stopping a long sampling run. A worker yielding, pausing, or posting progress is neither.

TD/Q targets bootstrap from the last observation for administrative truncation, but not for true termination. Never bootstrap from the reset observation of the next episode. MC prediction uses completed episodes; canceled partial episodes are not treated as zero-return completions. See [S16](18_SOURCES_AND_VERIFICATION.md).

## Randomness and reproducibility

Use one documented integer PRNG algorithm with versioned state and known-answer tests. Derive separate streams for layout, environment transitions, policy exploration, learning initialization, and cosmetic effects from a root seed. Exact derivation and action order are serialized. Do not use Math.random in simulation, learning, or fixtures.

The same initial state plus actions and seeds must produce identical integer/environment traces in the tested JS runtimes. Neural floating-point learning may vary slightly across backends; record backend/version and use explicit numeric tolerances rather than promise cross-device bitwise weight equality.

## State-size constraints

Early task lanes target 4x4 to 8x6 traversable cells, a few state bits, short hazard cycles, and short routes. Known-model DP must enumerate only valid reachable task states and report state/transition counts. If a fixture exceeds 50,000 reachable states or fails its browser budget, simplify the task representation/layout; do not omit relevant state to force a smaller table.

## Required invariants

Unique object ownership; no wall crossing; no negative resources; no double delivery; terminal states absorb further actions; snapshot cloning isolates mutations; reward totals match the event ledger; model-free policy inputs exclude oracle data; state encoding distinguishes relevant cargo/facing/phase/time; rendering speed does not change outcomes. Include a differential test for visible tick advancement versus a headless action trace.
