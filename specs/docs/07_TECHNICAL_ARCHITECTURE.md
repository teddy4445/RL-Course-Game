# Technical architecture and repository layout

## Stack decision

Application: JavaScript ES modules + JSDoc, HTML, CSS, Phaser, Vite. Static distribution only. Development: npm lockfile, ESLint, TypeScript `checkJs`/`noEmit`, Vitest, Playwright. A small schema validator such as Zod may be added if used consistently for imports, level data, and worker messages; do not add multiple overlapping validation libraries.

Late neural chapters: dynamically imported TensorFlow.js core/layers/CPU backend or an equivalently tested minimal supported subset. CPU training inside a worker is the portability baseline, not a performance claim. Do not import TFJS, Phaser, or browser globals into the pure environment kernel. No mandatory React, Redux, server framework, UI kit, Python runtime, WebGPU, or cloud trainer.

At preparation, the official Phaser stable page pointed to 4.2.1. M00 must confirm exact compatible versions, Node requirements, and matching documentation, write the version decision, install, and create the lockfile. Never blindly combine Phaser 3 example signatures with a Phaser 4 install. Keep the chosen major unless a tested migration is separately approved. Sources: [S04-S06, S14-S15](18_SOURCES_AND_VERIFICATION.md).

## Proposed tree to create during implementation

```text
src/
  main.js
  app/                 # hash router, application lifecycle, feature capability checks
  ui/                  # semantic DOM menus, dialogs, HUD and input focus ownership
  styles/              # tokens, layout, motion, reduced-motion overrides
  scenes/              # Phaser boot, elevator, district map, level presentation
  sim/                 # pure state, seeded RNG, step, collisions, rewards, objectives
  agents/              # tabular/planning/linear/neural/imitation implementations
  training/            # job protocol, worker entry, scheduling, evaluation, snapshots
  content/             # level definitions, chapter metadata, encoders, schema
  persistence/         # storage adapters, versions, migrations, validation
  audio/               # one audio owner and gain/loop lifecycle
  assets/              # imported tiny build-processed assets when appropriate
public/
  assets/              # manifest-driven district art/audio; base-path-safe URLs
  models/              # optional documented starter checkpoints, not secret winners
tests/
  unit/
  integration/
  e2e/
  fixtures/
  rl/
scripts/               # content/doc validation, budget reporting, fixed-seed audits
```

The tree is a proposal, not existing code. Prefer a small number of cohesive modules; do not create dozens of empty abstraction layers. The current Markdown pack stays at root plus `docs/`, `campaign/`, and `milestones/`.

## Dependency direction

UI/scenes -> application coordinator -> simulation + immutable policy snapshot.
Training worker -> simulation + agents + validation.
Persistence -> validated plain data; never live Phaser objects or tensors.
Content -> schema-checked constants; no executable code embedded in level JSON.
Simulation -> small shared types/RNG only.

The main thread owns visible world state and synchronous inference. The worker owns training environments, mutable learner parameters, and optimization. It periodically returns safe immutable inference snapshots. A reference JS forward pass for tiny MLPs must numerically match the training backend before deployment. Main-thread inference never performs optimizer updates.

## Authoritative ownership

One application coordinator owns navigation, active mission, session/job IDs, and teardown. One active level simulation, at most one learning worker, one audio owner, and one persistence service. Events are typed plain objects. UI subscribes to state/events but does not mutate agent weights or fabricate rewards. Scenes are disposable views; restarting a scene is not a global reset of learning.

## Required npm script contract

| Script | Intended behavior |
|---|---|
| `dev` | Vite development server. |
| `build` | Validate production content then produce static dist. |
| `preview` | Preview built dist; not a production server. |
| `lint` | ESLint application/scripts/tests; no ignored errors solely to pass. |
| `typecheck` | JS JSDoc checking without emitted code. |
| `test:unit` | Deterministic fast tests, once, not watch mode. |
| `test:integration` | Worker, persistence, schema, lifecycle integration tests. |
| `test:e2e` | Playwright browser behavior with isolated profiles. |
| `test:rl` | Fixed-fixture numerical tests plus bounded seed audits. |
| `validate:content` | IDs, schemas, references, objective reachability metadata. |
| `validate:docs` | Local links, mission/milestone coverage, required document references. |
| `check` | Lint, typecheck, unit, integration, content/docs, and build. |

E2E and heavier learning audits are separate explicit release gates even if not all run in `check`. M00 must not create green no-op scripts for tests that do not exist. Document a not-yet-implemented script and its future milestone instead; early build validation can cover only implemented content plus an explicit unfinished-campaign status.

## Error boundaries and diagnostics

Catch scene-load, asset-load, storage, worker-start, and unsupported-capability failures at the coordinator. Show a usable retry/back action. Log structured local errors without personal data. A developer-only diagnostic bridge may expose read-only state and deterministic tick controls for tests; build it out of production or gate it behind an explicit test build. Tests must still exercise public controls for acceptance flows.

Keep public assets free of secrets. Front-end minification is not access control. Self-host libraries, model files, and optional WASM; normal play must not require third-party availability.
