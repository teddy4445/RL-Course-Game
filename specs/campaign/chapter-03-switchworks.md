# Chapter 03 - Switchworks

Proposed lecture focus: **MDP continuation and dynamic programming**. Alignment status: proposed; actual slide evidence not supplied.

## Atmosphere and story

Branching freight junctions, switchboards, circuit floors. The team now improves routes instead of only judging them.

## Chapter implementation profile

Known model; policy iteration and value iteration implemented exactly. Manual one-state policy edits are permitted in L11/L12 as transparent policy design.

**Initial budget:** Start with short models and bounded sweep batches. Overlay animation follows actual solver updates; no fixed-time pretend convergence.

Read the [campaign defaults](README.md), [simulation contract](../docs/08_SIMULATION_CONTRACT.md), [RL contracts](../docs/09_RL_IMPLEMENTATION.md), [training/evaluation rules](../docs/10_TRAINING_EVALUATION.md), and [authoring guide](../docs/20_LEVEL_AUTHORING_GUIDE.md). Existing chapter artwork is not assumed.

## L11 - Wrong Turn

**Learning focus:** One-step policy improvement.
**Prerequisite:** Clear L10.

**Room and obstacle.** A known courier policy contains one clearly wasteful turn. Its alternatives differ in expected return after accounting for the rest of the policy.

**Patch's playable job.** Operate a junction console and prepare the nearby receiver. Choose the candidate action at that junction.

**Echo and the player's intervention.** Use evaluated values to compare one-step action outcomes. Apply only the selected policy change, then launch and observe its consequences.

**Clear / failure contract.** Deliver the component with the bounded energy budget; a different but genuinely valid route may also clear. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** Only the chosen state policy entry changes. Values/action expectations follow the actual transition distribution, and changing a decorative arrow alone cannot change movement.

**Implementation evidence to create.** `l11-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## L12 - Chain Reaction

**Learning focus:** Policy iteration.
**Prerequisite:** Clear L11.

**Room and obstacle.** Two connected junctions interact: repairing the first reveals that the second should change once future values are recalculated.

**Patch's playable job.** Choose when to evaluate or improve at the console while arranging the physical extraction route.

**Echo and the player's intervention.** Alternate genuine fixed-policy evaluation and greedy improvement. Retain clearly identified policy/value versions so the projection cannot show estimates from another policy.

**Clear / failure contract.** Courier reaches the receiver and the pair recover a switch key. Insufficiently improved routes can fail by energy or time, not by a required number of button presses. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** Policy iteration reaches the small fixture reference solution; convergence status is computed. The objective never counts evaluation/improvement clicks.

**Implementation evidence to create.** `l12-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## L13 - Ripple Effect

**Learning focus:** Bellman optimality backups and value iteration.
**Prerequisite:** Clear L12.

**Room and obstacle.** A chain of small rooms separates the dock from a valuable exit. Initial values are uninformative away from the goal.

**Patch's playable job.** Power the planning console and release the physical route after checking the projected policy.

**Echo and the player's intervention.** Each planning pulse executes a documented number of synchronous value-iteration sweeps. Values propagate from real reward/transition structure; the player can launch before or after adequate propagation.

**Clear / failure contract.** Echo delivers the item through the chain. Successful behavior wins regardless of how many pulses were used. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** A one-sweep fixture confirms no in-place accidental Gauss-Seidel update when synchronous updates are specified. Projection snapshots match solver arrays.

**Implementation evidence to create.** `l13-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## L14 - One Door Closed

**Learning focus:** Replanning after a known model change.
**Prerequisite:** Clear L13.

**Room and obstacle.** The previous type of route is available, but a displayed machinery change locks one gate between stages and opens an alternate.

**Patch's playable job.** Latch the new corridor before launch and update the physical blueprint input at the console.

**Echo and the player's intervention.** Recompute values/policy under the new exact model. The old plan remains inspectable but is labeled stale; the world revision invalidates in-flight old results.

**Clear / failure contract.** Deliver via any valid route in the new configuration, then exit. A stale policy may legitimately succeed on some variation; do not force failure. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** Old worker/planner results cannot replace the new revision. Both old and new transition kernels are testable, and the update is known-model replanning, not invented model-free learning.

**Implementation evidence to create.** `l14-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## L15 - The Switchmaster

**Learning focus:** Integrated dynamic-programming planning.
**Prerequisite:** Clear L14.

**Room and obstacle.** Three short connected machine stages each have a different known junction configuration. A safe console separates stages.

**Patch's playable job.** Route power between machines and reach each handoff while Echo transports the relay components.

**Echo and the player's intervention.** Use evaluation/improvement/value-iteration tools already introduced. Replanning occurs at stage boundaries with explicit compatible state transfer or a fresh task snapshot.

**Clear / failure contract.** Complete all three deliveries and extract the district core. No new algorithm or unannounced control is introduced in the finale. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** Each stage has a reference model/solution and separate terminal semantics. All transitions match visible machinery, and the final objective requires all stage-complete events.

**Implementation evidence to create.** `l15-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## Chapter completion gate

All five definitions validate and can be played in order. Each has a distinct player decision and actual behavioral objective. The relevant numerical algorithm tests pass; reward/state/worker invariants hold; representative independent seeds have been audited. The fifth mission restores exactly this district, unlocks the next existing mission (or the ending for C11), and writes a recoverable save. No art-only reskin or placeholder handler counts as a completed mission.
