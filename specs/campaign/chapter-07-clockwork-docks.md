# Chapter 07 - Clockwork Docks

Proposed lecture focus: **Planning and learned models**. Alignment status: proposed; actual slide evidence not supplied.

## Atmosphere and story

Cargo cranes, loading lifts, mechanical tide gates. Echo begins rehearsing with an imperfect internal model.

## Chapter implementation profile

Empirical transition model plus Dyna-Q; exact-model capability unavailable. Unknown pairs remain unknown. Stale dynamics repair uses fresh real samples and a declared reset/window.

**Initial budget:** Start with 4,000 real transitions and nPlanning=5; count real and imagined updates separately.

Read the [campaign defaults](README.md), [simulation contract](../docs/08_SIMULATION_CONTRACT.md), [RL contracts](../docs/09_RL_IMPLEMENTATION.md), [training/evaluation rules](../docs/10_TRAINING_EVALUATION.md), and [authoring guide](../docs/20_LEVEL_AUTHORING_GUIDE.md). Existing chapter artwork is not assumed.

## L31 - Unknown Machine

**Learning focus:** Learning transition outcomes.
**Prerequisite:** Clear L30.

**Room and obstacle.** A cargo mechanism has repeatable stochastic outcomes not supplied as a blueprint. The surrounding route is simple.

**Patch's playable job.** Feed a test parcel into the safe practice route and prepare the receiving platform.

**Echo and the player's intervention.** Gather real transitions and inspect a compact model projection at the machine. Observed counts determine predicted branches; unseen outcomes are not labeled impossible solely from one sample.

**Clear / failure contract.** Deliver the actual parcel after sufficient useful preparation. A completed model table is not itself a victory condition. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** Model counts/reward estimates match raw experience. No true probabilities are copied into the learned model. Observation does not leak RNG state.

**Implementation evidence to create.** `l31-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## L32 - Ghost Shift

**Learning focus:** Planning with simulated experience.
**Prerequisite:** Clear L31.

**Room and obstacle.** The known-from-experience mechanism connects to a short branching delivery route. A projector can rehearse observed state-action pairs.

**Patch's playable job.** Power the projector, prepare the receiver, and decide when to launch the real delivery.

**Echo and the player's intervention.** Enable a bounded number of imagined updates from the learned model. Ghost traces are labeled projections and are sampled from the empirical model, not the environment kernel.

**Clear / failure contract.** Deliver the real component; a successful projected path alone cannot satisfy a task predicate. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** Capability tests deny kernel access for imagination. Real/model transition counters differ, and projection errors remain possible when the model is inaccurate.

**Implementation evidence to create.** `l32-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## L33 - Real or Rehearsed

**Learning focus:** Balancing model information and planning updates.
**Prerequisite:** Clear L32.

**Room and obstacle.** Two machines include one poorly observed branch. Rehearsing the incomplete model repeatedly may not reveal its missing behavior.

**Patch's playable job.** Allocate the next bounded practice batch to real runs or projected updates while preparing the freight lift.

**Echo and the player's intervention.** Choose real-experience versus model-update budget. More imagined trials do not create evidence about an unobserved transition.

**Clear / failure contract.** Complete the freight delivery under the actual machinery configuration. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** Model coverage changes only from real experience. Planning counts cannot be counted as environmental samples. Fair comparison records both kinds of work and resulting outcome.

**Implementation evidence to create.** `l33-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## L34 - Outdated Map

**Learning focus:** Model error after changed dynamics.
**Prerequisite:** Clear L33.

**Room and obstacle.** After an initial preparation stage, a conveyor visibly reverses its operating mode at a handoff. Echo retains an old empirical model unless updated.

**Patch's playable job.** Activate the changed machine and choose a repair strategy before redeployment.

**Echo and the player's intervention.** Use fresh real samples with a declared recency window or affected-model reset. Do not overwrite the model with the true new probabilities.

**Clear / failure contract.** Deliver through the changed machinery and recover the dock access key. A stale model is allowed to succeed if its actual action happens to remain valid. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** Environment revision invalidates old jobs; counts/history reflect the selected forgetting policy; projected versus real mismatch is derived from actual traces, not scripted failure.

**Implementation evidence to create.** `l34-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## L35 - Dockside Switch

**Learning focus:** Model-based adaptation across stages.
**Prerequisite:** Clear L34.

**Room and obstacle.** A three-stage dock extraction changes one machine between stages, with safe consoles for new preparation.

**Patch's playable job.** Route power and set the receiving lift at each handoff, then meet Echo for core extraction.

**Echo and the player's intervention.** Decide when to gather new samples and when to use the model projector. Each scored stage deploys a frozen snapshot after preparation.

**Clear / failure contract.** Complete all staged deliveries and extract the core. Retain useful compatible experience but never pretend a model fits changed rules automatically. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** Each stage has a declared environment/model version; learning is paused in scored trials; final success depends on actual component deliveries, not planning count.

**Implementation evidence to create.** `l35-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## Chapter completion gate

All five definitions validate and can be played in order. Each has a distinct player decision and actual behavioral objective. The relevant numerical algorithm tests pass; reward/state/worker invariants hold; representative independent seeds have been audited. The fifth mission restores exactly this district, unlocks the next existing mission (or the ending for C11), and writes a recoverable save. No art-only reskin or placeholder handler counts as a completed mission.
