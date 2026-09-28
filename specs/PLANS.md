> Design baseline, not current implementation status. Root `AGENTS.md`, `STATUS.md`, and `ROADMAP.md` control this consolidated repository. The working Canvas2D prototype is not to be replaced solely because the original plan proposed Phaser/Vite.

# Build plan and execution conventions

This plan divides the game into bounded vertical milestones. It is a project convention inspired by current agent-development guidance, not a Codex-only API or required special file format. See [sources S01-S03](docs/18_SOURCES_AND_VERIFICATION.md).

## Required execution loop

Read the current status and the requested milestone; inspect the actual tree and applicable instructions; create a short living execution note inside the milestone file; implement only its scope; run numerical/unit/integration/browser checks as applicable; inspect visual/audio behavior; repair; record exact evidence; update STATUS and decisions; stop at the requested boundary. Do not feed every file into every task or claim a later stage passed because it is documented.

For a substantial change, keep an execution note with purpose, current state, concrete next steps, tests, observations, decisions, and recovery notes. A new session must be able to resume from repository files alone. Preserve original acceptance requirements when recording execution; do not rewrite them to match unfinished work.

## Ordered milestones

| ID | Milestone | Main output |
|---|---|---|
| M00 | [Preflight and project foundation](milestones/M00_PREFLIGHT_FOUNDATION.md) | A real JavaScript/Vite/Phaser project starts, builds, and renders a minimal scene through a hash-routed shell under a project base path. |
| M01 | [Shared simulation and first playable heist](milestones/M01_SIMULATION_FIRST_HEIST.md) | L01 is genuinely playable using the same deterministic kernel used by headless tests. |
| M02 | [Landing, elevator menu, settings, and map shell](milestones/M02_PRESENTATION_SHELL.md) | The application feels like the same game from its landing page through the full-viewport elevator menu and into L01. |
| M03 | [First five missions, genuine learning, and saves](milestones/M03_CHAPTER1_AND_SAVES.md) | The complete first chapter is playable, Echo genuinely changes behavior through learning, and progress survives reload safely. |
| M04 | [Early neural and imitation feasibility probe](milestones/M04_BROWSER_LEARNING_RISK_SPIKE.md) | Tiny DQN and behavioral-cloning examples actually train in the browser worker and export correct fast inference snapshots before later chapters are authored. |
| M05 | [Chapters 2-4: models, planning, and prediction](milestones/M05_MDP_AND_PREDICTION.md) | L06-L20 are complete, with genuine known-model planning and fixed-policy model-free prediction. |
| M06 | [Chapters 5-6: control and generalization](milestones/M06_CONTROL_AND_APPROXIMATION.md) | L21-L30 are complete, including interpretable SARSA/Q-learning contrasts and genuine feature-based transfer. |
| M07 | [Chapters 7-8: learned models and policy learning](milestones/M07_MODELS_AND_POLICY_GRADIENTS.md) | L31-L40 are complete with actual learned-model planning, stochastic policy updates, and a separate critic. |
| M08 | [Chapters 9-10: DQN and practical deep-RL challenges](milestones/M08_DEEP_RL_CHAPTERS.md) | L41-L50 are playable using the validated small DQN backend; preparation and evaluation remain honest and responsive. |
| M09 | [Chapter 11: demonstrations, corrections, and final rescue](milestones/M09_IMITATION_AND_FINALE.md) | All 55 missions are playable and the final rescue is caused by the trained imitation policy rather than a scripted ending. |
| M10 | [Full-campaign polish, accessibility, and playtests](milestones/M10_POLISH_PLAYTEST_RELEASE_GATES.md) | The complete game is visually/audio coherent, usable, measured, and ready for authorized release rather than just technically functional. |
| M11 | [Release build and GitHub Pages verification](milestones/M11_RELEASE_GITHUB_PAGES.md) | A reproducible static release artifact works under the real project base path; any authorized publication is verified at its actual URL. |

## Subtasks inside a large milestone

M05-M09 contain several chapters or algorithm families. Implement and verify one small task lane/algorithm first, then expand one chapter at a time. Maintain a per-chapter checklist in the milestone execution note. A session may stop at a verified subtask boundary with the milestone still In progress; use the resume prompt to continue. Do not force an entire multi-chapter milestone into one response, mark unimplemented chapters complete, or skip the shared numerical/behavioral gate to save context.

## Progress and parallelism

Use STATUS.md as the current summary and each milestone execution note for evidence. Do not infer completion from file existence. Parallel work is optional: partition UI/assets/tests into disjoint files after contracts stabilize, but keep one integration owner. Never let parallel sessions edit shared schemas, dependencies, and the simulation kernel without explicit ownership. Do not require a particular Codex product surface, paid mode, or model name.

## Recovery and change control

On a failed gate, reproduce it, narrow the cause, fix the smallest coherent unit, and rerun the affected regression tests. Do not delete tests, loosen thresholds, or replace algorithms merely to advance. If a design threshold is genuinely unsuitable, document the evidence and revise it through a recorded decision before a fresh audit. If user steering changes scope, update affected briefs/tests and content versions without discarding prior evidence.

## Final definition of complete

The application, all 55 missions, genuine learning, assets, recoverable saves, keyboard/audio/accessibility paths, browser budgets, and release build are implemented and verified. Human playtest and actual deployment status are recorded separately. A repository with 55 menu buttons, a training animation, and one working room is not this game.
