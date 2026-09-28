# File manifest and reading map

This inventory originated with the specification pack. The active repository now also contains playable Chapters 1-2, production assets, tests, and recorded evidence described by the root README and STATUS files.

## Recommended entry path

Begin with [README.md](README.md), then use the first prompt in [CODEX_START_HERE.md](CODEX_START_HERE.md). Keep [AGENTS.md](AGENTS.md) at repository root. Select later bounded stages through [specs/PLANS.md](specs/PLANS.md) and [PROMPTS.md](PROMPTS.md). Only load the subject documents relevant to that stage.

For design review, read the product brief, gameplay rules, course-alignment caveat, and campaign index. For implementation, the simulation, RL, worker, level-data, and verification contracts define the behavior. For visual work, use the screen-flow, art, audio, and asset manifests.

## Repository entry points and working state

| File | Contents |
|---|---|
| [AGENTS.md](AGENTS.md) | Repository instructions - Echo Heist |
| [CODEX_START_HERE.md](CODEX_START_HERE.md) | First Codex session |
| [specs/DESIGN_DECISIONS.md](specs/DESIGN_DECISIONS.md) | Historical design decisions |
| [specs/PLANS.md](specs/PLANS.md) | Original build plan and execution conventions |
| [PROMPTS.md](PROMPTS.md) | Copy-and-paste Codex prompts |
| [README.md](README.md) | Echo Heist - Codex development specification pack |
| [STATUS.md](STATUS.md) | Implementation status |

## Product, engineering, assets, verification, and release specifications

| File | Contents |
|---|---|
| [docs/01_PRODUCT_BRIEF.md](specs/docs/01_PRODUCT_BRIEF.md) | Product brief |
| [docs/02_GAMEPLAY_SYSTEMS.md](specs/docs/02_GAMEPLAY_SYSTEMS.md) | Gameplay systems and interaction rules |
| [docs/03_COURSE_ALIGNMENT.md](specs/docs/03_COURSE_ALIGNMENT.md) | Course alignment and pedagogical integrity |
| [docs/04_UX_SCREEN_FLOWS.md](specs/docs/04_UX_SCREEN_FLOWS.md) | Screen flows and interface specification |
| [docs/05_ART_DIRECTION.md](specs/docs/05_ART_DIRECTION.md) | Art direction and motion language |
| [docs/06_AUDIO_AND_ASSETS.md](specs/docs/06_AUDIO_AND_ASSETS.md) | Audio system and media delivery |
| [docs/07_TECHNICAL_ARCHITECTURE.md](specs/docs/07_TECHNICAL_ARCHITECTURE.md) | Technical architecture and repository layout |
| [docs/08_SIMULATION_CONTRACT.md](specs/docs/08_SIMULATION_CONTRACT.md) | Simulation contract - single source of truth |
| [docs/09_RL_IMPLEMENTATION.md](specs/docs/09_RL_IMPLEMENTATION.md) | RL implementation contracts |
| [docs/10_TRAINING_EVALUATION.md](specs/docs/10_TRAINING_EVALUATION.md) | Training, evaluation, worker protocol, and reproducibility |
| [docs/11_LEVEL_DATA_CONTRACT.md](specs/docs/11_LEVEL_DATA_CONTRACT.md) | Level data contract and validation |
| [docs/12_PROGRESS_SAVE_SECURITY.md](specs/docs/12_PROGRESS_SAVE_SECURITY.md) | Progress, persistence, privacy, and import safety |
| [docs/13_ACCESSIBILITY_PERFORMANCE.md](specs/docs/13_ACCESSIBILITY_PERFORMANCE.md) | Accessibility, browser support, and performance budgets |
| [docs/14_TESTING_AND_ACCEPTANCE.md](specs/docs/14_TESTING_AND_ACCEPTANCE.md) | Testing and acceptance strategy |
| [docs/15_DEPLOYMENT_GITHUB_PAGES.md](specs/docs/15_DEPLOYMENT_GITHUB_PAGES.md) | Static deployment on GitHub Pages |
| [docs/16_CONTENT_WRITING.md](specs/docs/16_CONTENT_WRITING.md) | Narrative, copy, feedback, and terminology |
| [docs/17_RISKS_AND_OPEN_DECISIONS.md](specs/docs/17_RISKS_AND_OPEN_DECISIONS.md) | Risk register and decisions that remain open |
| [docs/18_SOURCES_AND_VERIFICATION.md](specs/docs/18_SOURCES_AND_VERIFICATION.md) | Sources and verification record |
| [docs/19_ASSET_MANIFEST.md](specs/docs/19_ASSET_MANIFEST.md) | Asset inventory and production briefs |
| [docs/20_LEVEL_AUTHORING_GUIDE.md](specs/docs/20_LEVEL_AUTHORING_GUIDE.md) | Level authoring and calibration guide |
| [docs/21_REFERENCE_FIXTURES.md](specs/docs/21_REFERENCE_FIXTURES.md) | Reference fixtures and numerical expected results |

## Campaign: 11 chapters and 55 missions

| File | Contents |
|---|---|
| [campaign/README.md](specs/campaign/README.md) | Campaign index - 55 missions |
| [campaign/chapter-01-scrapyard.md](specs/campaign/chapter-01-scrapyard.md) | Chapter 01 - Scrapyard |
| [campaign/chapter-02-transit-depot.md](specs/campaign/chapter-02-transit-depot.md) | Chapter 02 - Transit Depot |
| [campaign/chapter-03-switchworks.md](specs/campaign/chapter-03-switchworks.md) | Chapter 03 - Switchworks |
| [campaign/chapter-04-courier-quarter.md](specs/campaign/chapter-04-courier-quarter.md) | Chapter 04 - Courier Quarter |
| [campaign/chapter-05-neon-market.md](specs/campaign/chapter-05-neon-market.md) | Chapter 05 - Neon Market |
| [campaign/chapter-06-modular-foundry.md](specs/campaign/chapter-06-modular-foundry.md) | Chapter 06 - Modular Foundry |
| [campaign/chapter-07-clockwork-docks.md](specs/campaign/chapter-07-clockwork-docks.md) | Chapter 07 - Clockwork Docks |
| [campaign/chapter-08-skybridge.md](specs/campaign/chapter-08-skybridge.md) | Chapter 08 - Skybridge |
| [campaign/chapter-09-neural-arcade.md](specs/campaign/chapter-09-neural-arcade.md) | Chapter 09 - Neural Arcade |
| [campaign/chapter-10-storm-grid.md](specs/campaign/chapter-10-storm-grid.md) | Chapter 10 - Storm Grid |
| [campaign/chapter-11-central-tower.md](specs/campaign/chapter-11-central-tower.md) | Chapter 11 - Central Tower |

## Implementation milestones

| File | Contents |
|---|---|
| [milestones/M00_PREFLIGHT_FOUNDATION.md](specs/milestones/M00_PREFLIGHT_FOUNDATION.md) | M00 - Preflight and project foundation |
| [milestones/M01_SIMULATION_FIRST_HEIST.md](specs/milestones/M01_SIMULATION_FIRST_HEIST.md) | M01 - Shared simulation and first playable heist |
| [milestones/M02_PRESENTATION_SHELL.md](specs/milestones/M02_PRESENTATION_SHELL.md) | M02 - Landing, elevator menu, settings, and map shell |
| [milestones/M03_CHAPTER1_AND_SAVES.md](specs/milestones/M03_CHAPTER1_AND_SAVES.md) | M03 - First five missions, genuine learning, and saves |
| [milestones/M04_BROWSER_LEARNING_RISK_SPIKE.md](specs/milestones/M04_BROWSER_LEARNING_RISK_SPIKE.md) | M04 - Early neural and imitation feasibility probe |
| [milestones/M05_MDP_AND_PREDICTION.md](specs/milestones/M05_MDP_AND_PREDICTION.md) | M05 - Chapters 2-4: models, planning, and prediction |
| [milestones/M06_CONTROL_AND_APPROXIMATION.md](specs/milestones/M06_CONTROL_AND_APPROXIMATION.md) | M06 - Chapters 5-6: control and generalization |
| [milestones/M07_MODELS_AND_POLICY_GRADIENTS.md](specs/milestones/M07_MODELS_AND_POLICY_GRADIENTS.md) | M07 - Chapters 7-8: learned models and policy learning |
| [milestones/M08_DEEP_RL_CHAPTERS.md](specs/milestones/M08_DEEP_RL_CHAPTERS.md) | M08 - Chapters 9-10: DQN and practical deep-RL challenges |
| [milestones/M09_IMITATION_AND_FINALE.md](specs/milestones/M09_IMITATION_AND_FINALE.md) | M09 - Chapter 11: demonstrations, corrections, and final rescue |
| [milestones/M10_POLISH_PLAYTEST_RELEASE_GATES.md](specs/milestones/M10_POLISH_PLAYTEST_RELEASE_GATES.md) | M10 - Full-campaign polish, accessibility, and playtests |
| [milestones/M11_RELEASE_GITHUB_PAGES.md](specs/milestones/M11_RELEASE_GITHUB_PAGES.md) | M11 - Release build and GitHub Pages verification |

## Pack quality records

| File | Contents |
|---|---|
| [MANIFEST.md](MANIFEST.md) | This inventory and task-oriented reading path. |
| [evidence/handoff-validation.json](evidence/handoff-validation.json) | Latest generated file/link/hash validation record. |

## Inventory totals

54 Markdown files: 9 root entry/state/quality files, 21 subject specifications, 12 campaign files, and 12 milestone files. The campaign contains 55 unique level IDs, five per chapter. PROMPTS.md contains 12 ordered build prompts plus five recovery/review/publication prompts.

Future source/config/test paths mentioned inside backticks are implementation targets, not missing delivered files. Unchecked milestone gates and Not started states are intentional.
