# Chapter 10 - Storm Grid

Proposed lecture focus: **Deep RL II - provisional practical emphasis**. Alignment status: proposed; actual slide evidence not supplied.

## Atmosphere and story

Wet metal, broken power lines, rain and storm barriers. The team tests whether rehearsal transfers.

## Chapter implementation profile

This entire topical emphasis remains particularly provisional. Reuse the validated DQN implementation; vary training coverage, reward density, curriculum, and conditions, not the action engine.

**Initial budget:** Initial cap 10,000 real transitions/job; all recipes calibrated on development seeds and frozen before release audits.

Read the [campaign defaults](README.md), [simulation contract](../docs/08_SIMULATION_CONTRACT.md), [RL contracts](../docs/09_RL_IMPLEMENTATION.md), [training/evaluation rules](../docs/10_TRAINING_EVALUATION.md), and [authoring guide](../docs/20_LEVEL_AUTHORING_GUIDE.md). Existing chapter artwork is not assumed.

## L46 - New Addresses

**Learning focus:** Training coverage and distribution shift.
**Prerequisite:** Clear L45.

**Room and obstacle.** The same delivery task begins at new allowed docks, exposing missing coverage in a narrowly rehearsed controller.

**Patch's playable job.** Choose which starting docks to rehearse and ready the final receiving platform.

**Echo and the player's intervention.** Broaden the real training-start distribution and retrain/continue from a compatible snapshot. The control changes data coverage, not a direct robustness statistic.

**Clear / failure contract.** Deliver from the assigned new start and extract. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** Train and evaluation starts are logged; outcomes are not artificially failed because a checkbox was not selected. Distinguish deliberate new conditions from unreachable random maps.

**Implementation evidence to create.** `l46-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## L47 - The Silent Corridor

**Learning focus:** Sparse reward and exploration.
**Prerequisite:** Clear L46.

**Room and obstacle.** Intermediate progress rewards are absent in a short delivery route, leaving the task reward at completion. The route must remain discoverable with the allowed budget.

**Patch's playable job.** Prepare the endpoint and select a practice exploration preset while handling a parallel breaker.

**Echo and the player's intervention.** Use the existing learner on the explicitly sparser reward version. Do not secretly retain old dense-reward transitions under the new reward label; recompute from stored events only if the pipeline supports it correctly.

**Clear / failure contract.** Complete the delivery. Lack of immediate training reward alone is not an in-game failure. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** Reward version and replay compatibility are checked. No hidden success demonstrations or shaping are added to make the run look successful without disclosure.

**Implementation evidence to create.** `l47-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## L48 - Training Wheels

**Learning focus:** Curriculum preparation.
**Prerequisite:** Clear L47.

**Room and obstacle.** The final corridor is fixed; easier practice variants shorten the route or simplify one obstacle without changing the final task definition.

**Patch's playable job.** Arrange a permitted easy-to-hard practice sequence and activate the final receiving machine.

**Echo and the player's intervention.** Train on curriculum stages with compatible observation/action semantics. Remove the easier conditions for the scored attempt.

**Clear / failure contract.** Complete the full unmodified final delivery and exit. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** Final evaluation restores the target geometry/reward, excludes curriculum-only shortcuts, and freezes updates. Curriculum stage IDs and transfer compatibility are recorded.

**Implementation evidence to create.** `l48-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## L49 - Storm Settings

**Learning focus:** Training over environmental variation.
**Prerequisite:** Clear L48.

**Room and obstacle.** Several observed machine settings and initial hazard phases are allowed. Their combinations vary between episodes, not unpredictably inside a stationary rollout.

**Patch's playable job.** Choose the rehearsal condition set and prepare a receiving route for the final extraction.

**Echo and the player's intervention.** Train over a bounded declared distribution, not random impossible rooms. Observation includes the setting/phase when it changes action consequences.

**Clear / failure contract.** Deliver under a different permitted combination and reach extraction. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** All variants pass reachability checks; evaluation combinations are distinct; claimed robustness is limited to tested conditions. No hidden-state memory problem is introduced by omission.

**Implementation evidence to create.** `l49-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## L50 - Eye of the Storm

**Learning focus:** Frozen evaluation after preparation.
**Prerequisite:** Clear L49.

**Room and obstacle.** A staged extraction uses three prevalidated unpractised start/condition configurations, with safe player handoffs between tasks.

**Patch's playable job.** Route power at each stage and meet Echo at the extraction lift.

**Echo and the player's intervention.** Commit a snapshot after preparation. No training or replay insertion occurs during the evaluation stages. A failed stage can be retried or the player can explicitly return to practice.

**Clear / failure contract.** Complete the core delivery stages and exit. Optional repeatability medal shows actual successes/trials rather than a mastery percentage. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** Learner/optimizer/replay/model hashes remain unchanged throughout evaluation. Returning to practice starts a new evaluation record, not a continuation of an unbiased audit.

**Implementation evidence to create.** `l50-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## Chapter completion gate

All five definitions validate and can be played in order. Each has a distinct player decision and actual behavioral objective. The relevant numerical algorithm tests pass; reward/state/worker invariants hold; representative independent seeds have been audited. The fifth mission restores exactly this district, unlocks the next existing mission (or the ending for C11), and writes a recoverable save. No art-only reskin or placeholder handler counts as a completed mission.
