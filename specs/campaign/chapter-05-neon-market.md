# Chapter 05 - Neon Market

Proposed lecture focus: **Model-free control**. Alignment status: proposed; actual slide evidence not supplied.

## Atmosphere and story

Closed stalls, colored shutters, compact alleys, dangerous recycling channels. Echo learns its own routes.

## Chapter implementation profile

Tabular SARSA and Q-learning; epsilon-greedy practice and explicit frozen evaluation. The environment includes only small fully observed hazards.

**Initial budget:** Start with at most 6,000 real transitions per practice job. Calibrate matching budgets for comparisons; do not guarantee a particular ordering on every seed.

Read the [campaign defaults](README.md), [simulation contract](../docs/08_SIMULATION_CONTRACT.md), [RL contracts](../docs/09_RL_IMPLEMENTATION.md), [training/evaluation rules](../docs/10_TRAINING_EVALUATION.md), and [authoring guide](../docs/20_LEVEL_AUTHORING_GUIDE.md). Existing chapter artwork is not assumed.

## L21 - Unmarked Alley

**Learning focus:** Learning action values through interaction.
**Prerequisite:** Clear L20.

**Room and obstacle.** An unfamiliar compact alley has a required token and two possible routes. No blueprint planner is exposed.

**Patch's playable job.** Open the entrance, position the receiver, and traverse an independent shutter lane.

**Echo and the player's intervention.** Train real Q values from experienced transitions and deploy an immutable snapshot. The scanner may show a few actual action arrows at the dock, not a full analytics panel.

**Clear / failure contract.** Retrieve and deliver the access token, then escape. An untrained but lucky legitimate delivery can still count as a clear. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** Action values change by actual updates; model-free context contains no exact transition model or shortest-path oracle. Training can be canceled and resumed from a safe checkpoint.

**Implementation evidence to create.** `l21-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## L22 - Greedy Too Soon

**Learning focus:** Premature exploitation and exploration scheduling.
**Prerequisite:** Clear L21.

**Room and obstacle.** An early discovered route is viable but inefficient; a less-visited branch offers a better delivery path under the mission budget.

**Patch's playable job.** Choose preparation duration/exploration mode and operate the final gate.

**Echo and the player's intervention.** Expose constant-low versus gradual-decay exploration presets. They change epsilon according to recorded steps, not wall-clock time or hidden success flags.

**Clear / failure contract.** Complete the delivery within the real resource budget. Preset identity is not tested by the objective. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** Epsilon schedule is deterministic and resumes correctly from checkpoints. Matched runs use the same budget; no replay data is silently added when switching to the preferred preset.

**Implementation evidence to create.** `l22-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## L23 - Edge Runner

**Learning focus:** SARSA and on-policy consequences.
**Prerequisite:** Clear L22.

**Room and obstacle.** A short corridor hugs a recycling strip; a longer route leaves safety margin. Exploratory legal moves near the strip can cause falls.

**Patch's playable job.** Prepare the receiver and select an exploration setting before practicing with SARSA.

**Echo and the player's intervention.** The SARSA learner bootstraps from its actual sampled next action. Record practice falls separately from the final extraction outcome.

**Clear / failure contract.** Deliver the parcel and exit. Greedy evaluation is clearly distinct from continuing exploratory practice. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** F02 SARSA target passes; dangerous legal actions are not masked. Compare seeds/budgets to L24 without requiring one specific observed route in every run.

**Implementation evidence to create.** `l23-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## L24 - Perfect Plan, Imperfect Pilot

**Learning focus:** Q-learning targets versus behavior policy.
**Prerequisite:** Clear L23.

**Room and obstacle.** Reuse the same recycling-strip task definition and start distribution as L23 so the algorithm contrast is interpretable.

**Patch's playable job.** Prepare the same receiving setup, practice with the Q-learning cartridge, and decide when to deploy.

**Echo and the player's intervention.** Q-learning updates toward the maximum next-state action value while behavior may explore. Show actual practice mistakes and actual final-route behavior, not a safety badge assigned by algorithm name.

**Clear / failure contract.** Complete the same delivery objective as L23 under the declared deployment exploration setting. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** F02 maximum target passes. Layout/reward/initialization/budget are matched with L23; training versus evaluation counts are separate. No universal safety ranking is baked into text or tests.

**Implementation evidence to create.** `l24-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## L25 - Market Blackout

**Learning focus:** Integrated model-free control under new starts.
**Prerequisite:** Clear L24.

**Room and obstacle.** A market finale offers several allowed dock starts with the same fully observed gate/hazard rules. Darkened decorative signs do not hide essential task variables.

**Patch's playable job.** Latch shutters and meet Echo at the handoff; Patch cannot carry the core through its narrow route.

**Echo and the player's intervention.** Prepare the selected control cartridge on training starts; freeze it for the scored multi-stage extraction.

**Clear / failure contract.** Complete two sequential core-component deliveries from different authored starts and extract. Retry preserves the cartridge but restarts the failed stage. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** No learning during the frozen attempts. New starts are part of the declared evaluation distribution and do not change action semantics or observation length.

**Implementation evidence to create.** `l25-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## Chapter completion gate

All five definitions validate and can be played in order. Each has a distinct player decision and actual behavioral objective. The relevant numerical algorithm tests pass; reward/state/worker invariants hold; representative independent seeds have been audited. The fifth mission restores exactly this district, unlocks the next existing mission (or the ending for C11), and writes a recoverable save. No art-only reskin or placeholder handler counts as a completed mission.
