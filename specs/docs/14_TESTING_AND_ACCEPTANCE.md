# Testing and acceptance strategy

## Evidence rules

A requirement is complete only after an actual check. Record pass, fail, blocked, or not run. Application tests do not exist merely because their names appear here. Numerical reliability targets and playtest goals are not measured results. Test code must call the production simulation and learners rather than a reimplemented approximation that could agree with its own bugs.

## Test layers

| Layer | Minimum coverage |
|---|---|
| Unit | RNG vectors, collision/order, objectives, one-shot rewards, encoders, numerical algorithm updates, migrations, schema bounds. |
| Integration | Main/worker snapshot round trip, cancellation, stale results, save transactions, stage transitions, audio/scene ownership. |
| Content | 55 IDs/11 chapters, references, reachable variants, algorithm capabilities, fixed policies, asset manifests, calibration hashes. |
| RL audit | Real learning, fixed-budget recipes, initialization variability, unseen evaluation seeds, no oracle leakage. |
| Browser E2E | Landing to gameplay, controls, reset/Continue, keyboard menus, settings, import failure, pause/visibility, base-path assets/workers. |
| Visual/audio | All screen states, selected/pressed/focus buttons, district readability, sound activation/mute, no clipping or duplicate audio. |
| Human playtest | Comprehensibility, agency, fun, visible relationship between intervention and Echo behavior. |

Use Vitest for headless tests and Playwright for browser flows. Isolate browser storage per test, prefer role/label locators for DOM UI, use retrying assertions rather than arbitrary sleeps, and keep visual baselines in a controlled browser/environment. Sources: [S07, S22](18_SOURCES_AND_VERIFICATION.md).

## Mandatory correctness tests

- Identical seeds/actions produce the same environment trace at 30, 60, and 120 render fps; extra visual effects do not perturb RNG.
- Blocked moves consume a turn; cargo has one owner; conveyors cannot recursively move actors; collision/failure precedence matches the contract.
- Repeated collection/delivery cannot farm reward. Mission success cannot be set from algorithm ID, training duration, or UI labels.
- Terminated transitions do not bootstrap; administrative truncations bootstrap from the last valid observation, not reset state.
- First-visit MC handles repeated states correctly; prediction never changes the fixed policy.
- SARSA uses the behavior's actual next action; Q-learning uses its maximum target; training/evaluation exploration is distinct.
- Known-model API is absent from model-free agent context; learned-model samples come from observed counts only.
- TD(lambda) clears traces at actual boundaries; lambda=0 matches TD(0).
- Softmax is finite and normalized; actor advantage is detached; critic updates cannot backpropagate through its bootstrap target.
- DQN target parameters are unchanged between declared copies; replay contains all permitted outcomes; terminal targets and action masks are correct.
- JS inference agrees with backend inference within declared tolerance on random and extreme valid observations.
- Demonstrations use pre-action observations and split by episode; a shifted start requires observation-dependent actions, not a macro.
- Evaluation creates no optimizer updates, model-count changes, or replay insertions.

## Async and persistence tests

Start A, reconfigure to B, let A finish: A is ignored. Import a save during canceled practice: no stale checkpoint overwrites it. Pause mid-job and verify no further transitions/RNG consumption after acknowledgement. Scene exit unregisters listeners and disposes worker resources. Deliberately malformed/oversized/nonfinite save imports leave active progress unchanged. Quota failure gives a usable export path. A second tab cannot overwrite a newer generation silently.

## E2E matrix

Verify New Game confirmation, absent Continue state, first five missions, one representative mission from every later chapter, L55 ending, all 55 launch/return routes, settings persistence, keyboard map navigation, remapping, browser Back/Forward, unknown/locked deep links, missing asset recovery, muted first visit, reduced motion, hidden-tab pause, and `/echo-heist/` cold-cache production preview.

Canvas actions can use a test-only deterministic driver for precise fixtures. At least one full representative heist must still be completed through keyboard controls against real hit areas/physics. Do not treat directly setting an objective flag through a debug bridge as a gameplay test.

## Human playtest protocol

Invite a small mix of students/new players after the first chapter and again before release; do not fabricate participants. Observe without explaining the solution. Record where they stop, what they think Echo is doing, which control they choose, whether retries feel useful, and whether they voluntarily attempt another run. Ask after play what changed and why, without introducing a quiz into the game itself.

A useful starting review target is 3-5 participants, but the count is not a validation study. Separate usability/fun findings from evidence of learning outcomes. Keep notes de-identified and local unless explicit research consent/procedures apply. Unperformed human playtests remain open gates.

## Release checklist

All 55 missions reachable and implemented; no fake training/stubs; unit/integration/content/RL/browser checks pass; no blocking console errors/unhandled rejections; saves survive upgrades/import errors; no required off-origin requests; assets and credits are valid; keyboard/mute/reduced-motion paths work; performance on the declared laptop is recorded; actual production deployment is checked when authorized. Publication not authorized or inaccessible is reported separately from local readiness.
