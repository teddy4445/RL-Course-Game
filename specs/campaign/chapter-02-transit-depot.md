# Chapter 02 - Transit Depot

Proposed lecture focus: **Tabular MDPs and policy evaluation**. Alignment status: proposed; actual slide evidence not supplied.

## Atmosphere and story

Abandoned platforms, ticket gates, luggage conveyors, route signage. The team acquires a complete local blueprint.

## Chapter implementation profile

Known-model capability enabled. Policy evaluation and predefined fixed routes are available; no need to train unknown dynamics. Deliberate missing-cargo observation is limited to the diagnostic part of L06.

**Initial budget:** Small reachable models; cap synchronous planner sweeps and show actual intermediate results. Start with a 50,000-state absolute validation cap, ideally much smaller.

Read the [campaign defaults](README.md), [simulation contract](../docs/08_SIMULATION_CONTRACT.md), [RL contracts](../docs/09_RL_IMPLEMENTATION.md), [training/evaluation rules](../docs/10_TRAINING_EVALUATION.md), and [authoring guide](../docs/20_LEVEL_AUTHORING_GUIDE.md). Existing chapter artwork is not assumed.

## L06 - Same Place, Different Job

**Learning focus:** State representation and state aliasing.
**Prerequisite:** Clear L05.

**Room and obstacle.** Echo revisits one junction before and after collecting a key. The outward action should lead to the key; the return action should lead to its matching door.

**Patch's playable job.** Open a viewing shutter, choose the scanner cartridge, and operate the final heavy door after Echo returns.

**Echo and the player's intervention.** Compare a position-only diagnostic key with a cargo-aware state key. Re-evaluate/replan after changing the representation; the observation change is explicit and does not alter room geometry.

**Clear / failure contract.** Retrieve the key, open the corresponding door, and deliver the ticket token. An endless revisit loop times out normally. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** The full encoding distinguishes identical positions with different cargo; the restricted profile is marked aliased. Success requires the actual key/door sequence, not merely enabling a sensor flag.

**Implementation evidence to create.** `l06-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## L07 - Slippery Service

**Learning focus:** Stochastic transitions in a known model.
**Prerequisite:** Clear L06.

**Room and obstacle.** A short conveyor corridor has a declared sideways-slip probability and a deterministic longer bypass. Both are represented exactly on the depot blueprint.

**Patch's playable job.** Select a starting platform/route policy and power the extraction lift once the parcel arrives.

**Echo and the player's intervention.** Use the blueprint lens to inspect outcome branches and expected returns under a fixed policy. The player commits a dispatch choice; actual motion samples the environment probability.

**Clear / failure contract.** Deliver the parcel within its energy/horizon limit. A stochastic bad outcome is a real failure with a fast retry, not an automatic lesson penalty. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** Empirical transition frequencies match the configured model within an appropriate statistical tolerance over many test samples. Expected-value calculation and actual sampled outcomes remain distinct.

**Implementation evidence to create.** `l07-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## L08 - Ghost Routes

**Learning focus:** Fixed-policy evaluation.
**Prerequisite:** Clear L07.

**Room and obstacle.** Two existing courier policies cross the same room by different corridors, with different step costs and one uncertain elevator. Each policy is frozen while evaluated.

**Patch's playable job.** Choose which courier policy to dispatch, prepare its receiving station, and walk the independent service route.

**Echo and the player's intervention.** Evaluation pulses update the projected V values without changing policy actions. The player can compare the two policies and select one before launch.

**Clear / failure contract.** The dispatched courier completes delivery and Patch reaches the handoff. A numerically high predicted value alone does not unlock the exit. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** Policy hashes remain unchanged during every evaluation sweep. F04 expected-value results pass, and projection arrows correspond to the selected actual policy rather than a designer route.

**Implementation evidence to create.** `l08-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## L09 - What Lies Ahead

**Learning focus:** State value as future return.
**Prerequisite:** Clear L08.

**Room and obstacle.** Three allowed launch docks feed the same fixed courier policy. The visually closest dock leads to a costly later detour; another has a better sequence of outcomes.

**Patch's playable job.** Move the portable launch battery to one dock, then prepare the common receiver.

**Echo and the player's intervention.** Inspect state values from policy evaluation and choose a starting state. The policy is identical across choices; only the launch state changes.

**Clear / failure contract.** Complete the delivery with the available energy and extract. Dock proximity or a displayed value is not a completion predicate. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** All docks use the same frozen policy and reward semantics. Values are expected future returns, not Euclidean distance. Multiple viable docks can win if their actual runs satisfy the task.

**Implementation evidence to create.** `l09-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## L10 - Last Train Out

**Learning focus:** Combined MDP specification and evaluation.
**Prerequisite:** Clear L09.

**Room and obstacle.** A transit finale combines cargo-dependent ticket gates, one stochastic conveyor, and a visible train-departure countdown. The full known model includes cargo and remaining time.

**Patch's playable job.** Prepare the train platform and operate a latched luggage gate while Echo handles the core container route.

**Echo and the player's intervention.** Evaluate the available fixed route policies from permitted start states. Do not introduce policy iteration early merely to solve a too-hard fixture.

**Clear / failure contract.** Deliver the core container and board the extraction train with both robots before the intrinsic deadline. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** Time remaining appears in the full state; task timeout is true termination. Test a delivery on the final allowed tick and ensure the objective/timeout precedence matches the kernel.

**Implementation evidence to create.** `l10-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## Chapter completion gate

All five definitions validate and can be played in order. Each has a distinct player decision and actual behavioral objective. The relevant numerical algorithm tests pass; reward/state/worker invariants hold; representative independent seeds have been audited. The fifth mission restores exactly this district, unlocks the next existing mission (or the ending for C11), and writes a recoverable save. No art-only reskin or placeholder handler counts as a completed mission.
