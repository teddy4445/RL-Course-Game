# Development roadmap - consolidated project

This roadmap supersedes the original empty-repository starting point. Existing code is a starting asset, not proof that the production gates are satisfied. `specs/PLANS.md` and `specs/milestones/` retain detailed design acceptance criteria; read them as requirements, not current status or permission to replace correct existing work.

## Phase 1 - complete: verified, polished Chapter 1

Preserve the five implemented missions and remove observed defects. Establish a real HTTP-origin browser harness; verify native ES-module workers, real local-storage reload, cancel/retry/stale-message handling, muted play, controls, progression and project-subpath assets. Improve the existing landing, elevator menu, settings, mission map and in-game feedback without adding teaching screens or a second game loop. Use actual supplied character/prop/audio files and avoid full-catalog decoding.

Create a lean static release allowlist: runtime HTML/CSS/JS, level data, used art/audio and `.nojekyll`. Keep specifications, evidence, Python tooling, production reference screenshots, the asset inspector and authoring-only assets out of the release build. Do not publish. Test the actual resulting build, not only the development source.

Acceptance: all five missions complete through the real UI; no false training or victory; persisted saves survive reload; keyboard focus and settings work; worker/audio lifecycle is correct; no missing resources under /echo-heist/; source tests, content validation, seeded learning checks and production build have observed evidence. Unavailable human/browser/hardware checks remain open. Cross-reference original M00-M03, but do not claim original Phaser/IndexedDB gates passed.

## Phase 2 - complete: early later-course feasibility

Follow specs/milestones/M04_BROWSER_LEARNING_RISK_SPIKE.md. Prove a small neural value learner and behavioral-cloning agent in a worker using the same simulation/inference contract. Measure actual latency and cancellation; do not unlock unfinished chapters publicly. If new development dependencies are needed, pin compatible versions and verify installation. Decide any renderer/storage migration explicitly, with preservation of existing data and behavior.

Completed 2026-09-27 with a documented dependency-free pure-JavaScript neural backend, explicit forward/backpropagation and Adam updates, DQN replay/target separation, behavioral cloning, snapshot round trips, worker cancellation, and a real-Chrome responsiveness probe. It establishes feasibility only; no campaign level pretends to train these agents yet.

## Phase 3 - complete: known models and prediction

Implement chapters 2-4 (L06-L20) one chapter at a time: MDP representation, real policy evaluation/improvement/planning, and fixed-policy model-free prediction. Use specs/campaign/ and the M05 acceptance checklist. Keep the prediction/control distinction intact. Convert briefs to actual tested JSON layouts; do not duplicate L01 five times with different labels.

Chapters 2-4 (L06-L20) are complete and browser-verified. Chapter 3 computes policy improvement/iteration and value iteration from the declared model; Chapter 4 records MC, TD(0), and TD(lambda) values from an immutable behavior policy without turning prediction into control.

## Phase 4 - complete: control and generalization

Implement chapters 5-6 (L21-L30): model-free control, carefully conditioned SARSA/Q-learning comparisons, representations and function approximation. Follow M06. Record actual learning outcomes and generalization conditions rather than forcing preset results.

Chapters 5-6 (L21-L30) are complete and browser-verified. Chapter 6 uses real linear semi-gradient SARSA, explicit feature cartridges, bounded real transitions, shifted practice/evaluation starts and frozen weight snapshots; the cargo-blind diagnostic genuinely aliases cargo state.

## Phase 5 - complete: learned models and policy-based methods

Implement chapters 7-8 (L31-L40) with real learned dynamics, simulated experience, policy-gradient updates and a separate critic. Follow M07. A learned-model planner must not secretly call the true environment as its learned model.

Chapters 7-8 are complete and browser-verified. Chapter 7's planning updates sample only empirical outcome tables populated by real shared-kernel transitions, with explicit revision memory rules. Chapter 8 uses numerically stable softmax REINFORCE, optional learned baselines and separate actor/critic parameters from fresh on-policy trajectories. The seeded development audit retains weak frozen policies as reported robustness gates.

## Phase 6 - complete: deep RL

Chapters 9-10 (L41-L50) use the validated compact backend with real bounded replay, Adam updates, explicit target-network copies and frozen deployment. Training stays on structured state rather than expensive pixels. Chapter 10 remains marked proposed where the source slides are unavailable; implementation is not claimed as verified lecture alignment.

Worker checkpoints preserve the seeded random stream, making cancellable 20-episode batches exactly equivalent to a continuous run. Neural parameters, optimizer state, replay, counters and compatibility contracts persist through validated saves.

## Phase 7 - complete: imitation and original finale

Chapter 11 (L51-L55) follows M09 with successful player-controlled demonstrations stored as pre-action state/action labels. Echo performs from a trained frozen clone; the runtime contains no generated expert lesson or action recording playback.

District 12 (L56-L60) is an explicitly original extension beyond the supplied 11-chapter course. It culminates in a top-down Eclipse Warden battle whose three shields fall only through real sequential Echo deliveries, followed by Patch carrying the city heart to extraction. The ending is objective-driven, not a cutscene-only or algorithm-selection victory.

## Phase 8 - full-game quality and authorized release

Follow M10-M11: fresh novice playtests, audio listening/balance, final visuals for all districts, accessibility/remapping, browser matrix, holdout learning runs, performance on representative hardware, robust saves, static subpath deployment. Actual publication requires a separate user request. Creating a workflow file is not permission to push or deploy it.

Next bounded task: run a declared fresh multi-seed holdout for Chapters 9-12, tune only against a separate development cohort, then perform representative-hardware and cross-browser playtests without changing the released campaign scope.

## Working convention

Every task leaves a runnable game. Keep a short execution note with changed files, test commands, evidence, limitations and next task. Treat historical requirements, previous measurements and current observations distinctly. Do not claim all 55 levels because all 55 briefs exist. A bounded initial task does not abandon the full campaign: expand after the prior playable gate has been demonstrated.
