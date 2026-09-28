# Chapter 09 - Neural Arcade

Proposed lecture focus: **Deep RL I**. Alignment status: proposed; actual slide evidence not supplied.

## Atmosphere and story

Abandoned arcades, luminous panels, geometric doors. Echo uses richer observed combinations.

## Chapter implementation profile

Small DQN with versioned structured observations; CPU-worker training baseline. Replay and target-network ablations are named and scoped; no full-screen image learning.

**Initial budget:** Initial cap 10,000 real transitions/job, replay 4096, batch 32; performance/learnability must pass the early M04 probe before chapter expansion.

Read the [campaign defaults](README.md), [simulation contract](../docs/08_SIMULATION_CONTRACT.md), [RL contracts](../docs/09_RL_IMPLEMENTATION.md), [training/evaluation rules](../docs/10_TRAINING_EVALUATION.md), and [authoring guide](../docs/20_LEVEL_AUTHORING_GUIDE.md). Existing chapter artwork is not assumed.

## L41 - Neural Upgrade

**Learning focus:** Nonlinear action-value approximation.
**Prerequisite:** Clear L40.

**Room and obstacle.** A fully observed combination of cargo type and gate signal changes the correct route. All decisive variables are available to the model.

**Patch's playable job.** Set the receiving socket and choose the training configuration for the neural cartridge.

**Echo and the player's intervention.** Train a small MLP on the compact observation vector. Use known compatible action ordering and normalizers; no hidden vision or arbitrary huge model.

**Clear / failure contract.** Deliver the correct object through the currently valid route. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** A toy combination fixture demonstrates nonlinear capacity without missing state. Worker/backend inference and main-thread exported-weight inference agree within tolerance.

**Implementation evidence to create.** `l41-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## L42 - Memory Carousel

**Learning focus:** Experience replay.
**Prerequisite:** Clear L41.

**Room and obstacle.** Different practice starts yield different useful transitions; the most recent run alone is not the whole task distribution.

**Patch's playable job.** Choose a bounded rehearsal-start set and prepare the real receiver.

**Echo and the player's intervention.** Use a replay archive that samples stored real transitions, including failures, uniformly. A comparison mode without replay is explicit, not secretly a different algorithm.

**Clear / failure contract.** Complete the real delivery from the assigned start. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** Buffer cap/wraparound/sampling are tested; terminal and next-observation fields survive storage. Replay is not a video loop or success-only dataset.

**Implementation evidence to create.** `l42-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## L43 - Frozen Twin

**Learning focus:** Target-network stabilization.
**Prerequisite:** Clear L42.

**Room and obstacle.** A compact arcade delivery route exposes repeated updates while retaining the same task/reward semantics as its practice fixture.

**Patch's playable job.** Power the target-reference module and choose a bounded synchronization preset before deploying.

**Echo and the player's intervention.** Train online values while a separately copied target network provides targets. Copy intervals count optimizer updates, not rendered frames.

**Clear / failure contract.** Complete delivery with the prepared controller; equipping the module alone does not unlock a door. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** F06 target calculation passes; target arrays do not alias online arrays; they remain unchanged until scheduled copy. No claim of guaranteed stabilization on every run.

**Implementation evidence to create.** `l43-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## L44 - Signal Combination

**Learning focus:** Rich observed feature combinations.
**Prerequisite:** Clear L43.

**Room and obstacle.** Three visible signals combine with cargo state to determine the useful path. Evaluation uses held-out combinations within a defined feasible template family.

**Patch's playable job.** Prepare the receiving machinery and choose the permitted training combinations.

**Echo and the player's intervention.** Use the neural controller/replay/target modules already introduced. The full observation includes every relevant signal; no recurrent memory is needed.

**Clear / failure contract.** Deliver the required cargo under the assigned signal combination. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** Encoder length remains fixed; held-out combination policy actions are based on observation, not scenario ID leakage. Unseen tests remain outside training buffers.

**Implementation evidence to create.** `l44-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## L45 - The Arcade Vault

**Learning focus:** Integrated DQN.
**Prerequisite:** Clear L44.

**Room and obstacle.** A two-stage vault uses familiar signal combinations, cargo-dependent doors, and a small observable conveyor mechanism.

**Patch's playable job.** Open heavy vault shutters, prepare the core receiver, and complete the parallel passage.

**Echo and the player's intervention.** Prepare a DQN snapshot with the actual replay and target-network mechanisms. Budget and configuration are explicit and device-independent.

**Clear / failure contract.** Deliver the core container through both stages and extract the ninth core. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** Run content-wide and independent-seed learning gates, verify cancellation/reload checkpoint behavior, and ensure the neural runtime chunk was not loaded on the landing page unnecessarily.

**Implementation evidence to create.** `l45-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## Chapter completion gate

All five definitions validate and can be played in order. Each has a distinct player decision and actual behavioral objective. The relevant numerical algorithm tests pass; reward/state/worker invariants hold; representative independent seeds have been audited. The fifth mission restores exactly this district, unlocks the next existing mission (or the ending for C11), and writes a recoverable save. No art-only reskin or placeholder handler counts as a completed mission.
