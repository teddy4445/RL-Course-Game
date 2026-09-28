# Chapter 04 - Courier Quarter

Proposed lecture focus: **Model-free prediction**. Alignment status: proposed; actual slide evidence not supplied.

## Atmosphere and story

Parcel rooms, pneumatic tubes, uncertain elevators. The useful blueprints are missing.

## Chapter implementation profile

Fixed behavior policies only. MC, TD(0), and accumulating-trace TD(lambda) update value estimates; no action-value control updates. The player makes outer dispatch/start decisions using those estimates.

**Initial budget:** Initial jobs up to 2,560 real transitions or a small fixed count of complete episodes. No MC update from a canceled prefix.

Read the [campaign defaults](README.md), [simulation contract](../docs/08_SIMULATION_CONTRACT.md), [RL contracts](../docs/09_RL_IMPLEMENTATION.md), [training/evaluation rules](../docs/10_TRAINING_EVALUATION.md), and [authoring guide](../docs/20_LEVEL_AUTHORING_GUIDE.md). Existing chapter artwork is not assumed.

## L16 - Return Receipt

**Learning focus:** First-visit Monte Carlo prediction.
**Prerequisite:** Clear L15.

**Room and obstacle.** Two launch depots feed a fixed delivery policy through differently costly routes. Complete delivery receipts reveal total outcomes.

**Patch's playable job.** Collect sample receipts at the dock, choose a launch depot, and prepare its receiving machinery.

**Echo and the player's intervention.** Equip the completed-run recorder. It updates first-visit value estimates only after full episodes; the movement policy itself remains immutable.

**Clear / failure contract.** Launch from a workable depot and complete a real parcel delivery. A forecast threshold is not a win condition. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** F03 repeated-state MC test passes. Estimate updates wait for full return data; policy hashes match before/after training and sampled trajectories use that fixed policy.

**Implementation evidence to create.** `l16-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## L17 - Midway Message

**Learning focus:** TD prediction and bootstrapping.
**Prerequisite:** Clear L16.

**Room and obstacle.** A longer route includes several observed intermediate states and a late receiver. The movement policy remains the same throughout a trial.

**Patch's playable job.** Use the current forecast to ready one of two receiving setups, with the selection occurring before it can affect the courier task.

**Echo and the player's intervention.** Equip the immediate-update recorder. Predictions update after transitions using TD(0); the player observes changes while a practice delivery is in progress.

**Clear / failure contract.** Correctly prepare and complete the actual handoff, then extract. Forecasts guide the player but do not create parcels or move Echo. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** Numerical TD fixture passes; an unfinished run can produce valid intermediate TD updates without being labeled a completed MC sample. Receiving configuration is frozen at the declared handoff.

**Implementation evidence to create.** `l17-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## L18 - One Lucky Delivery

**Learning focus:** Sampling variability and sample support.
**Prerequisite:** Clear L17.

**Room and obstacle.** A route occasionally produces a very favorable elevator outcome while another is more dependable. A first receipt may be misleading.

**Patch's playable job.** Choose whether to gather more receipts or commit the valuable parcel, then operate the receiving belt.

**Echo and the player's intervention.** Compare actual samples and counts from fixed policies. No artificial confidence bar or predetermined lucky first draw is required; an authored demonstration seed may be labeled as such in developer fixtures only.

**Clear / failure contract.** Deliver the valuable parcel. Optional repeatability medal uses additional independent starts and states its denominator. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** No outcome filtering; sample counts/returns match raw trajectories. More samples do not guarantee a better individual outcome, and the game does not force the student to wait for a scripted reversal.

**Implementation evidence to create.** `l18-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## L19 - Fading Footprints

**Learning focus:** Eligibility traces in prediction.
**Prerequisite:** Clear L18.

**Room and obstacle.** A delayed reward arrives after a sequence of visited states. Several launch depots need updated estimates before a dispatch decision.

**Patch's playable job.** Power the destination and choose a departure point after using the recorder.

**Echo and the player's intervention.** Switch between no trace and a bounded accumulating trace length via lambda. Earlier visited-state estimates update through actual eligibility traces; behavior remains fixed.

**Clear / failure contract.** Complete the delivery from a viable launch state and leave together. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** Lambda zero matches TD(0); trace decay and reset are tested. Do not label lambda=1 as exactly identical to arbitrary MC updates. Parameter changes do not create a direct route override.

**Implementation evidence to create.** `l19-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## L20 - Blind Delivery

**Learning focus:** Using model-free predictions under a sampling budget.
**Prerequisite:** Clear L19.

**Room and obstacle.** Three depots, a fixed courier policy, uncertain machinery, and limited practice receipts create a dispatch decision before carrying the core.

**Patch's playable job.** Allocate practice among depots, choose the final start, and prepare the extraction machinery.

**Echo and the player's intervention.** Use MC/TD/trace recorder options already available, at most two exposed decisions. Compare predicted returns from actual samples without querying an exact model.

**Clear / failure contract.** The fixed courier delivers the core from the chosen depot and Patch completes extraction. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** Prediction policies remain frozen; no exact-model capability is available. Training counts, chosen depot, predicted return, and realized outcome are separate evidence fields.

**Implementation evidence to create.** `l20-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## Chapter completion gate

All five definitions validate and can be played in order. Each has a distinct player decision and actual behavioral objective. The relevant numerical algorithm tests pass; reward/state/worker invariants hold; representative independent seeds have been audited. The fifth mission restores exactly this district, unlocks the next existing mission (or the ending for C11), and writes a recoverable save. No art-only reskin or placeholder handler counts as a completed mission.
