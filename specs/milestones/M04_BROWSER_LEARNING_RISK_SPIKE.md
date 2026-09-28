# M04 - Early neural and imitation feasibility probe

**Prerequisites:** M03 worker, snapshots, and save infrastructure.
**Specification state:** Original acceptance checklist; not a current progress report. Consult root STATUS.md and ROADMAP.md before starting or rebuilding anything.

## Observable outcome

Tiny DQN and behavioral-cloning examples actually train in the browser worker and export correct fast inference snapshots before later chapters are authored.

## Read before work

Always read root AGENTS.md, README.md, STATUS.md, ROADMAP.md, and docs/IMPLEMENTATION_DECISIONS.md, then:

- [docs/07_TECHNICAL_ARCHITECTURE.md](../docs/07_TECHNICAL_ARCHITECTURE.md)
- [docs/09_RL_IMPLEMENTATION.md](../docs/09_RL_IMPLEMENTATION.md)
- [docs/10_TRAINING_EVALUATION.md](../docs/10_TRAINING_EVALUATION.md)
- [docs/13_ACCESSIBILITY_PERFORMANCE.md](../docs/13_ACCESSIBILITY_PERFORMANCE.md)
- [docs/21_REFERENCE_FIXTURES.md](../docs/21_REFERENCE_FIXTURES.md)

## Implementation scope

1. Add a lazy-loaded, version-pinned TensorFlow.js CPU backend or the documented equivalent minimal subset. Probe the exact kernels needed for forward pass, gradients, Adam, Huber, and cross-entropy in a worker.
2. Implement small shared MLP parameter schema, disposal, snapshot export, and plain-JS inference. Compare numerical outputs on seeded test inputs.
3. Build test/developer fixtures for a small fully observed DQN task and a shifted-start imitation task using test demonstrations. These fixtures are not additional campaign levels or hidden production teachers.
4. Verify replay/target separation and cloning pre-action labels, episode-level splits, cancellation during optimization, and resource cleanup.
5. Measure train/update throughput, main-thread responsiveness, tensor counts, and cold-load size on an actual browser/device. If baseline is too slow, simplify the fixture/model or test a supported accelerator without assuming WASM gradient availability.

## Acceptance gates

- [ ] F06/F07 pass, gradients change real parameters, and test task behavior responds to observations.
- [ ] CPU-worker training succeeds without GPU/OffscreenCanvas/shared-memory requirements.
- [ ] JS/backend inference agrees within declared tolerance; no tensor growth over repeated fixture runs.
- [ ] Cancellation, navigation, and saves retain known-good snapshots during neural work.
- [ ] Actual feasibility/performance findings are recorded; an unresolved blocker prevents mass-authoring neural levels.

## Explicit non-goals

No Chapters 9-11 full content yet, no giant neural networks, no server trainer, and no faked winning checkpoint to bypass the probe.

## Handoff

A reusable verified neural backend and imitation pipeline, or a concrete documented blocker and remediation plan before expansion.

## Execution note - to be completed during implementation

Original unchecked checklist. Record current execution in root STATUS.md and the relevant task note; do not treat this historical paragraph as proof that existing code is absent. Record date/environment, actual files changed, commands/results, evidence paths, measured findings, unresolved issues, and the next bounded action. Do not mark a checkbox from reasoning alone. Build/browser/tooling limitations must remain visible in STATUS.
