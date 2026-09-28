# Chapter 08 - Skybridge

Proposed lecture focus: **Policy gradients and actor-critic methods**. Alignment status: proposed; actual slide evidence not supplied.

## Atmosphere and story

Glass tunnels, rooftop junctions, city lights far below. Echo learns action preferences directly.

## Chapter implementation profile

Stable softmax policy; complete-episode REINFORCE initially with gamma=1; baseline and one-step actor-critic added explicitly. Discrete action set remains unchanged.

**Initial budget:** Start with short episodes, batches of eight, and up to 6,400 transitions/job; calibrate variance and pacing.

Read the [campaign defaults](README.md), [simulation contract](../docs/08_SIMULATION_CONTRACT.md), [RL contracts](../docs/09_RL_IMPLEMENTATION.md), [training/evaluation rules](../docs/10_TRAINING_EVALUATION.md), and [authoring guide](../docs/20_LEVEL_AUTHORING_GUIDE.md). Existing chapter artwork is not assumed.

## L36 - Fork in the Sky

**Learning focus:** Parameterized stochastic policies.
**Prerequisite:** Clear L35.

**Room and obstacle.** A small bridge network has a few discrete junctions and a clear delivery objective. No continuous steering mechanic is introduced.

**Patch's playable job.** Open the receiving walkway and choose when to launch the prepared policy.

**Echo and the player's intervention.** Train softmax action preferences from experience; show actual sampled choices with a small action indicator when requested. Initial probabilities are not an intelligence meter.

**Clear / failure contract.** Deliver the component and reach extraction. A stochastic policy can clear through valid behavior without becoming perfectly deterministic. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** Softmax is finite/normalized and changes after gradient updates. Discrete actions and observation semantics match earlier chapters.

**Implementation evidence to create.** `l36-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## L37 - Credit at the Exit

**Learning focus:** REINFORCE with delayed outcome.
**Prerequisite:** Clear L36.

**Room and obstacle.** A short bridge sequence gives its main task reward only after the final handoff. Full episodes fit the practice budget.

**Patch's playable job.** Prepare the endpoint, start practice batches, and complete the parallel walkway.

**Echo and the player's intervention.** Use complete-episode REINFORCE with recorded rewards-to-go. Do not mix stale-policy episodes or DQN replay into this on-policy learner.

**Clear / failure contract.** Complete the actual endpoint delivery and escape. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** Gradient-sign toy tests pass; data provenance names the collecting policy; complete versus canceled episodes are handled correctly. Runtime policy is not a stored route macro.

**Implementation evidence to create.** `l37-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## L38 - Luck Is Not Skill

**Learning focus:** Value baseline and variance.
**Prerequisite:** Clear L37.

**Room and obstacle.** Easy and difficult starting platforms create different expected returns under the same policy family.

**Patch's playable job.** Choose rehearsal starts and equip the separate value-baseline module before launch.

**Echo and the player's intervention.** Train a value baseline from returns, then use detached advantages for policy updates. The module changes the update, not the environmental reward.

**Clear / failure contract.** Complete a delivery from the assigned platform. A baseline does not guarantee every individual update improves performance. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** Actor gradients cannot flow through baseline targets; reward totals stay unchanged. Repeated-run variance evidence is recorded rather than a scripted instant improvement.

**Implementation evidence to create.** `l38-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## L39 - Second Opinion

**Learning focus:** Actor and critic roles.
**Prerequisite:** Clear L38.

**Room and obstacle.** A longer but still compact bridge route provides intermediate state transitions that support TD-based value estimates.

**Patch's playable job.** Power the receiving gate and coordinate the handoff from an independent route.

**Echo and the player's intervention.** Use a critic for bootstrapped value estimates and the actor for action selection. Expose only a bounded actor/critic balance preset if needed; never call the critic an oracle.

**Clear / failure contract.** Echo completes the route and the pair extract. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** Actor and critic parameters/updates are distinct; critic bootstrap is detached; on-policy freshness and true-terminal masking are tested. No replay archive from Chapter 9 is reused here.

**Implementation evidence to create.** `l39-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## L40 - Skybridge Extraction

**Learning focus:** Integrated policy-based control.
**Prerequisite:** Clear L39.

**Room and obstacle.** Two bridge starts and a short observable hazard-phase cycle combine previous policy-based decisions in a rooftop finale.

**Patch's playable job.** Latch the walkway, operate the extraction crane, and meet Echo at the upper platform.

**Echo and the player's intervention.** Prepare the actor-critic cartridge on allowed starts and deploy the declared frozen policy mode for the final stages.

**Clear / failure contract.** Carry the district core through two bridge stages and reach extraction together. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** Evaluation mode is recorded; stochastic versus greedy choice is not silently changed between scoring trials. No updates occur during frozen deployment.

**Implementation evidence to create.** `l40-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## Chapter completion gate

All five definitions validate and can be played in order. Each has a distinct player decision and actual behavioral objective. The relevant numerical algorithm tests pass; reward/state/worker invariants hold; representative independent seeds have been audited. The fifth mission restores exactly this district, unlocks the next existing mission (or the ending for C11), and writes a recoverable save. No art-only reskin or placeholder handler counts as a completed mission.
