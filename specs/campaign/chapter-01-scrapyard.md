# Chapter 01 - Scrapyard

Proposed lecture focus: **Introduction to reinforcement learning**. Alignment status: proposed; actual slide evidence not supplied.

## Atmosphere and story

Rusted metal, furnace amber, discarded parts; Echo wakes and begins to trust Patch.

## Chapter implementation profile

L01 uses a disclosed fixed boot self-check. L02-L05 use a real tabular Q-learning learner underneath a simple physical cartridge interface; formal algorithm selection is not yet exposed.

**Initial budget:** Start with jobs capped at 2,400 real transitions on short task lanes; stop early on player request. Calibrate before fixing this budget.

Read the [campaign defaults](README.md), [simulation contract](../docs/08_SIMULATION_CONTRACT.md), [RL contracts](../docs/09_RL_IMPLEMENTATION.md), [training/evaluation rules](../docs/10_TRAINING_EVALUATION.md), and [authoring guide](../docs/20_LEVEL_AUTHORING_GUIDE.md). Existing chapter artwork is not assumed.

## L01 - Cold Boot

**Learning focus:** Agent, environment, actions, observable consequences.
**Prerequisite:** None; campaign entry.

**Room and obstacle.** Use the exact 12x8 reference fixture F01. A battery powers the socket near the sleeping Echo; two distinct exit staging cells avoid shared occupancy. No hazards or random outcomes.

**Patch's playable job.** Carry the battery to the socket, then walk around Echo to the Patch exit pad. The first interactions teach movement and pickup without a separate tutorial screen.

**Echo and the player's intervention.** Activating the dock wakes Echo. Its explicitly fixed maintenance self-check moves it toward its staging cell. No training is claimed in this onboarding mission; the learner interface remains absent.

**Clear / failure contract.** Deliver batteryA once, power the socket, and place both robots on their assigned exit cells before 160 steps. Retry restores the initial room. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** Run the F01 exact action trace; verify one delivery event, no overlapping actors, no reward duplication, and keyboard completion without opening a theory panel.

**Implementation evidence to create.** `l01-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## L02 - Shiny Distractions

**Learning focus:** Training reward versus intended task.
**Prerequisite:** Clear L01.

**Room and obstacle.** A small Echo-only room contains one required fuse and three reachable scrap items on a longer detour. Both paths remain physically valid; scrap reward is initially overemphasized in the supplied damaged-cartridge preset.

**Patch's playable job.** Latch a heavy access gate, prepare the receiving socket, and deploy Echo. Patch cannot enter the narrow collection passage.

**Echo and the player's intervention.** Expose a bounded priority switch for scrap versus delivery reward. Practice performs real updates under the chosen reward version; a changed switch does not immediately overwrite the policy with a winning route.

**Clear / failure contract.** Echo delivers the fuse to its socket and both reach extraction. Scrap count cannot satisfy the objective. Scrap detours consume time but do not occupy the required-cargo slot or permanently block the fuse. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** Changing the control changes actual rewards; reward version/provenance is logged. A high-scrap-return run cannot win without delivery. Calibrate two presets to produce an observable contrast across runs without scripting one.

**Implementation evidence to create.** `l02-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## L03 - The Long Way Round

**Learning focus:** Delayed reward and discounting.
**Prerequisite:** Clear L02.

**Room and obstacle.** Two Echo corridors branch from the same dock: an immediate low-value scrap endpoint and a longer route to the required power cell. No stochastic hazards; isolate the time/reward distinction.

**Patch's playable job.** Open the long corridor and move a crate out of the later extraction lane while Echo prepares.

**Echo and the player's intervention.** Expose a physical Future priority switch mapped to gamma, initially near/far values such as 0.5 and 0.95. This changes discounting, not the episode deadline or the number of planning steps. Use a genuine learner or a bounded training preset, not a direct route toggle.

**Clear / failure contract.** Deliver the power cell and leave together; taking the easy scrap route alone does not clear. The longer route must remain within the declared finite horizon. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** F05 verifies the return ordering; learned behavior is separately tested. Reward timing and gamma appear in trace metadata, and no hidden speed/door change accompanies the switch.

**Implementation evidence to create.** `l03-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## L04 - Curious Circuit

**Learning focus:** Exploration versus exploitation.
**Prerequisite:** Clear L03.

**Room and obstacle.** A familiar corridor reaches a modest route reward; an unvisited side loop reaches the required token more efficiently. Geometry is simple enough that exploratory discovery is feasible within a short job.

**Patch's playable job.** Prepare the token receiver, scout visible safe machinery, and choose when to send Echo on the final run.

**Echo and the player's intervention.** Expose Try new routes with low/medium exploration settings. A labeled familiar-route cartridge contains limited prior experience, not secretly full knowledge. Practice samples epsilon-greedy actions; deployment uses the declared evaluation mode.

**Clear / failure contract.** Echo retrieves the token and the pair exit. No extra credit is awarded merely for exploration steps or toggling the setting. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** Practice exploration changes action distribution and discovery frequency; evaluation epsilon is separate. The prior is reproducibly generated/disclosed. One lucky early discovery is not forced to fail for narrative reasons.

**Implementation evidence to create.** `l04-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## L05 - Two Robots, One Exit

**Learning focus:** Integrated agent-task loop.
**Prerequisite:** Clear L04.

**Room and obstacle.** A compact two-lane scrapyard finale: Echo retrieves a relay fuse through the service lane; Patch opens a heavy shutter and reaches the cargo lift. One simple periodic hazard has its phase in observation.

**Patch's playable job.** Operate the shutter, position the receiving lift, and complete the parallel route without entering Echo-only cells.

**Echo and the player's intervention.** Use the already introduced priority/exploration controls, at most two. Practice and deployment use the same gate/hazard configuration at a fixed handoff.

**Clear / failure contract.** Deliver the relay fuse, recover the first core through the handoff, and stage both robots at extraction. A caught actor or missing core prevents success. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** No single robot can bypass the joint objective; retry preserves compatible learning; level clear lights only district C01 and unlocks L06. Verify the core pickup is not an algorithm-ID check.

**Implementation evidence to create.** `l05-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## Chapter completion gate

All five definitions validate and can be played in order. Each has a distinct player decision and actual behavioral objective. The relevant numerical algorithm tests pass; reward/state/worker invariants hold; representative independent seeds have been audited. The fifth mission restores exactly this district, unlocks the next existing mission (or the ending for C11), and writes a recoverable save. No art-only reskin or placeholder handler counts as a completed mission.
