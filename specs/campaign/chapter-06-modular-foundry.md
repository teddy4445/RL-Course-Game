# Chapter 06 - Modular Foundry

Proposed lecture focus: **Function approximation**. Alignment status: proposed; actual slide evidence not supplied.

## Atmosphere and story

Repeated workstations, stamped panels, moving room modules. Similar situations recur in different places.

## Chapter implementation profile

Linear semi-gradient SARSA with explicit feature encoders. Missing-cargo or coarse encoders are deliberate diagnostic conditions, not undocumented POMDPs.

**Initial budget:** Start with up to 6,000 real transitions per job on small templates. Use compatible feature versions and fresh copies for encoder comparisons.

Read the [campaign defaults](README.md), [simulation contract](../docs/08_SIMULATION_CONTRACT.md), [RL contracts](../docs/09_RL_IMPLEMENTATION.md), [training/evaluation rules](../docs/10_TRAINING_EVALUATION.md), and [authoring guide](../docs/20_LEVEL_AUTHORING_GUIDE.md). Existing chapter artwork is not assumed.

## L26 - Familiar Shape

**Learning focus:** Shared features and transfer.
**Prerequisite:** Clear L25.

**Room and obstacle.** Two delivery rooms share spatial relationships but occupy different coordinates. Evaluation shifts the room or dock while preserving task rules.

**Patch's playable job.** Position the modular receiver and open the new bay.

**Echo and the player's intervention.** Train with relational features such as observable direction to goal, local blockage, and cargo. Compare behavior in the shifted room without memorizing independent absolute cells.

**Clear / failure contract.** Deliver a component in the shifted arrangement and reach extraction. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** The shifted configuration is not an identical training trajectory; features derive from observations, not a computed optimal path. Training/evaluation coordinates are logged.

**Implementation evidence to create.** `l26-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## L27 - The Missing Detail

**Learning focus:** Relevant features and aliasing.
**Prerequisite:** Clear L26.

**Room and obstacle.** A junction requires different actions when empty versus carrying the required item. A restricted encoder removes the cargo feature.

**Patch's playable job.** Choose the scanner feature cartridge and operate the receiver after Echo returns.

**Echo and the player's intervention.** Compare restricted and cargo-aware encoders using explicit fresh compatible copies or documented migration. The network/linear learner cannot infer genuinely absent information magically.

**Clear / failure contract.** Complete pickup and delivery in the same episode. Simply switching on the feature does not open the exit. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** The paired observations collide only under the diagnostic encoder and differ under the full one. No larger model is presented as a fix for information that is not observed.

**Implementation evidence to create.** `l27-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## L28 - Every Tile Is Not Special

**Learning focus:** Representation choice versus memorization.
**Prerequisite:** Clear L27.

**Room and obstacle.** The task repeats in multiple small bays whose decorative tile IDs differ while route relationships remain meaningful.

**Patch's playable job.** Choose which bays to rehearse in and prepare the final delivery platform.

**Echo and the player's intervention.** Compare an absolute-location-heavy encoding with a suitable relational encoding under controlled budgets. Decorative IDs should not secretly control hazards.

**Clear / failure contract.** Deliver in a new permitted bay. Different valid feature sets may succeed; no encoding-name gate. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** Use the same underlying task family and clear dimension/normalization metadata. Do not claim that fewer features always generalize better; record observed transfer.

**Implementation evidence to create.** `l28-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## L29 - Tight Corners

**Learning focus:** Approximation resolution.
**Prerequisite:** Clear L28.

**Room and obstacle.** A narrow doorway creates nearby positions where different actions matter. A coarse positional encoding aliases them; a finer/tile-coded variant distinguishes them.

**Patch's playable job.** Adjust the precision cartridge and latch the door before launch.

**Echo and the player's intervention.** Use a genuinely different versioned encoder and retune step size according to active features. Reset or migrate weights explicitly; do not reinterpret old arrays under a new dimension.

**Clear / failure contract.** Carry the component through the doorway without repeated collision timeout, then extract. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** Feature vectors differ on the critical neighboring cells only as specified. Resolution changes do not widen the physical doorway or change collision rules.

**Implementation evidence to create.** `l29-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## L30 - The Moving Warehouse

**Learning focus:** Generalization audit across arrangements.
**Prerequisite:** Clear L29.

**Room and obstacle.** Three hand-authored modular layouts rearrange familiar doors, cargo, and starts while keeping observations compatible.

**Patch's playable job.** Configure the receiving machinery for each handoff and traverse the independent service route.

**Echo and the player's intervention.** Prepare on the training template set, choose a feature cartridge, and freeze it for the warehouse finale.

**Clear / failure contract.** Complete deliveries in two distinct unpractised configurations and recover the district core. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** No parameter updates on the frozen trials; evaluate all declared variants rather than cherry-pick one. Audit failures distinguish unreachable geometry from approximation/training failure.

**Implementation evidence to create.** `l30-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## Chapter completion gate

All five definitions validate and can be played in order. Each has a distinct player decision and actual behavioral objective. The relevant numerical algorithm tests pass; reward/state/worker invariants hold; representative independent seeds have been audited. The fifth mission restores exactly this district, unlocks the next existing mission (or the ending for C11), and writes a recoverable save. No art-only reskin or placeholder handler counts as a completed mission.
