# Full game design and acceptance specifications

This directory contains the 21 subject specifications, 55 mission briefs in 11 chapter files, and 12 original milestone checklists from the earlier design pack. It is reference material, not a second executable project. Root AGENTS.md, ROADMAP.md and STATUS.md define current instructions, task order and implementation status.

## Read by task

- Game/story: [product brief](docs/01_PRODUCT_BRIEF.md), [gameplay systems](docs/02_GAMEPLAY_SYSTEMS.md), [campaign index](campaign/README.md).
- Curriculum: [alignment qualifications](docs/03_COURSE_ALIGNMENT.md); the actual lecture slides are not included or verified.
- Screens/art/audio: [screen flows](docs/04_UX_SCREEN_FLOWS.md), [art direction](docs/05_ART_DIRECTION.md), [original asset briefs](docs/19_ASSET_MANIFEST.md). Current usable art and its authority are in ../production/; audio paths are in ../public/assets/audio/catalog.json.
- Simulation/agents: [simulation](docs/08_SIMULATION_CONTRACT.md), [RL algorithms](docs/09_RL_IMPLEMENTATION.md), [worker/evaluation](docs/10_TRAINING_EVALUATION.md), [fixtures](docs/21_REFERENCE_FIXTURES.md).
- Content/persistence/testing: [level contract](docs/11_LEVEL_DATA_CONTRACT.md), [saves](docs/12_PROGRESS_SAVE_SECURITY.md), [testing](docs/14_TESTING_AND_ACCEPTANCE.md), [authoring](docs/20_LEVEL_AUTHORING_GUIDE.md).
- Later tasks: [original milestone map](PLANS.md), [original design decisions](DESIGN_DECISIONS.md), and the corresponding file in milestones/.

The previous empty-repository prompts and old status sheet were intentionally omitted. Older Phaser/Vite, storage and finite-horizon assumptions must be reconciled with ../docs/IMPLEMENTATION_DECISIONS.md, not silently imposed on the existing implementation. Original milestone checkboxes are acceptance templates, not live evidence.
