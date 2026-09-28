# Chapter 11 - Central Tower

Proposed lecture focus: **Mimic / imitation learning**. Alignment status: proposed; actual slide evidence not supplied.

## Atmosphere and story

Quiet precision machinery, broad city windows, the restored districts below. Patch teaches; Echo ultimately rescues Patch.

## Chapter implementation profile

Behavioral cloning followed by explicitly DAgger-inspired selective corrections. No hidden expert solver in production, no timed action playback. Final cartridge is compatible with its own task family.

**Initial budget:** Start with a few short human demonstrations, at most 20 epochs/job, episode-based splits, and measured small-model training. No requirement for hundreds of human demonstrations.

Read the [campaign defaults](README.md), [simulation contract](../docs/08_SIMULATION_CONTRACT.md), [RL contracts](../docs/09_RL_IMPLEMENTATION.md), [training/evaluation rules](../docs/10_TRAINING_EVALUATION.md), and [authoring guide](../docs/20_LEVEL_AUTHORING_GUIDE.md). Existing chapter artwork is not assumed.

## L51 - Follow My Lead

**Learning focus:** Behavioral cloning from demonstrations.
**Prerequisite:** Clear L50.

**Room and obstacle.** A short safe service corridor contains a pickup and delivery. The same six actions can be controlled through a tether.

**Patch's playable job.** Activate the tether and temporarily demonstrate as Echo using the normal controls; prepare the receiver as Patch before the recording stage.

**Echo and the player's intervention.** Record pre-action observations and actions, then train the imitation policy with cross-entropy. Keep waiting samples bounded or weighted transparently.

**Clear / failure contract.** Detach the tether and let Echo perform a real autonomous delivery. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** Examples pair the correct observation/action tick; training/validation split by demonstration episode. Completion after detachment is not accomplished by replaying the action array.

**Implementation evidence to create.** `l51-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## L52 - Not a Recording

**Learning focus:** Observation-dependent behavior versus a macro.
**Prerequisite:** Clear L51.

**Room and obstacle.** The same corridor task starts from a shifted dock or changed facing; copying the prior timed movement sequence would miss the destination.

**Patch's playable job.** Prepare the receiving station and decide whether another demonstration is useful.

**Echo and the player's intervention.** Deploy the learned policy on current observations. Additional demonstrations can expand training, but the final start remains a separate frozen test.

**Clear / failure contract.** Deliver from the new initial condition and reach the handoff. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** A deliberate test-only macro baseline diverges while a suitable observation-based reference policy can adapt. Runtime contains no route-by-level-ID imitation shortcut.

**Implementation evidence to create.** `l52-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## L53 - Off the Beaten Path

**Learning focus:** Learner-induced distribution mismatch.
**Prerequisite:** Clear L52.

**Room and obstacle.** A minor initial variation can lead Echo into a recovery position absent from the first demonstrations.

**Patch's playable job.** Observe the first divergence and provide another practice example of recovering from that situation.

**Echo and the player's intervention.** Collect relevant labeled state-action examples rather than merely repeating the original perfect route. Do not force an error if the current policy already handles the state.

**Clear / failure contract.** Complete the pickup/delivery after preparation; a policy already capable of recovery may clear immediately. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** New demonstration states differ from the original data and are not evaluation leakage. Failures and recovery traces are authentic; no random mistake is injected to manufacture the lesson.

**Implementation evidence to create.** `l53-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## L54 - Catch Me Learning

**Learning focus:** DAgger-inspired corrective imitation.
**Prerequisite:** Clear L53.

**Room and obstacle.** Echo's current policy runs a practice route with several possible off-route states. The tether permits brief selective intervention.

**Patch's playable job.** Let Echo act, intervene with a corrective action where needed, then return control to it.

**Echo and the player's intervention.** Label the actual visited observation, aggregate it with earlier demonstrations, and retrain at a safe boundary. Call this selective interactive imitation, not a full theoretical DAgger reproduction.

**Clear / failure contract.** After preparation, complete an autonomous delivery with interventions disabled for the scored attempt. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** Correction labels use pre-intervention observations; old examples remain unless an explicit capped sampling policy removes them. No test oracle labels production observations.

**Implementation evidence to create.** `l54-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## L55 - The Last Heist

**Learning focus:** Integrated autonomous behavior after demonstration.
**Prerequisite:** Clear L54.

**Room and obstacle.** Three compact tower stages combine familiar observed cargo/gate patterns. In the final stage Patch is trapped behind a heavy shutter and Echo must deliver the release core.

**Patch's playable job.** Prepare and demonstrate the tower-compatible task family, then handle the first two machinery stages. During the final rescue Patch cannot solve Echo's lane directly.

**Echo and the player's intervention.** Use the imitation/correction tools already introduced, then freeze the final compatible snapshot. Do not merge unrelated weights from all previous algorithm families. The rescue outcome is actual autonomous play, not a cutscene claiming learning.

**Clear / failure contract.** Deliver the release core, open Patch's shutter, and reach the final elevator together. Only after those predicates succeed does the ending animation play. Unless specifically overridden, caught, lost required cargo, or intrinsic timeout fails the current attempt; no permanent life loss.

**Required verification.** Run the final-stage autonomous trace with no intervention, verify all mission/core flags exactly once, preserve the completed save, and make replay/credits/menu navigation functional after the ending.

**Implementation evidence to create.** `l55-reference-v1`: exact layout and task stages, reward/encoder/algorithm versions, seed schedule, preparation recipe, actual outcome traces, and browser playtest notes. Do not mark this brief as implemented until that evidence exists.

## Chapter completion gate

All five definitions validate and can be played in order. Each has a distinct player decision and actual behavioral objective. The relevant numerical algorithm tests pass; reward/state/worker invariants hold; representative independent seeds have been audited. The fifth mission restores exactly this district, unlocks the next existing mission (or the ending for C11), and writes a recoverable save. No art-only reskin or placeholder handler counts as a completed mission.
