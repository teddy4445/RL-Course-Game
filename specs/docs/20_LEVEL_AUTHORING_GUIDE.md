# Level authoring and calibration guide

## Start from the decision, not the algorithm label

For every mission, complete this sentence: `The player notices ___, changes/chooses ___, and sees ___ happen differently.` A room that only changes its title from Q-learning to TD is not a distinct level. Use the individual campaign briefs as the authored premise, then implement its exact geometry and recipe.

## Authoring sequence

1. Create the smallest Echo task lane that demonstrates the intended distinction. Add the Patch route/handoff after the core task works.
2. Specify raw state, observation, encoder, actions, reward, terminal conditions, horizon, initial policy/model, and legal player controls.
3. Implement the level definition using the closed schema. Keep unknown probabilities unknown; preserve all relevant state unless deliberate restriction is the teaching point.
4. Prove objective reachability with a hand-checked/reference solver in tests. A solver can verify that a solution exists but cannot secretly act for the learner in production.
5. Run the actual learner and establish a bounded preparation recipe. Record observations, failures, and parameter changes; no assumed success based on formulas alone.
6. Add the player task, narrative cue, visual feedback, and reset loop. Ensure Patch cannot bypass the required autonomous task.
7. Freeze content/recipe, audit unseen seeds, and conduct a playtest. A change to reward/geometry/encoder invalidates relevant prior calibration evidence.

## Distinctness criteria

Within each chapter, vary the player decision, environment dependency, failure mode, and transfer demand. Reuse art/mechanics but not the same route with different colors. Keep novel-control count low. The fifth mission combines earlier ideas rather than introducing an unannounced new algorithm.

## Reference recipe record to create

Level/content hash; algorithm/version; observation/encoder version; reward; initialization source; seeds; exploration settings; transition/update/episode budget; training controls; evaluation policy; outcome counts; device/browser; elapsed compute; failures; and whether an original human demonstration or starter checkpoint was used. A reference recipe is engineering evidence, not an in-game answer sheet.

## Avoid these shortcuts

Do not enforce an algorithm through an exit condition. Do not alter a stochastic outcome to force a lesson. Do not classify a high training return as mission success. Do not reduce observations accidentally to create unexplained failure. Do not increase invisible training steps or use a pretrained winner without disclosure. Do not count retries as secure mastery assessment.

## Chapter 4 special rule

Prediction missions use frozen behavior. Player decisions are dispatch choice, start choice, or preparation based on estimates. Any alternative route policy is selected at the outer decision layer and then stays fixed while evaluated. Show this distinction through the dock behavior, not a theory screen.

## Chapter 6/9 representation rule

A bigger network cannot recover information missing from observation. If cargo/gate/phase is relevant, include it. To demonstrate nonlinear approximation, construct a fully observed combination problem; do not call inaccessible state a neural-network limitation.

## Release content checklist

One-line objective; meaningful Patch role; genuine Echo mechanism; actual win/fail predicates; quick retry; local asset coverage; prerequisite integrity; legal input on every state; replayable seed specification; fresh-evaluation recipe; optional help without secret policy replacement; and recorded evidence for all required gates.
