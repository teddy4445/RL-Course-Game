# M08 - Chapters 9-10: DQN and practical deep-RL challenges

**Prerequisites:** M07 campaign complete and M04 neural feasibility gates passed.
**Specification state:** Original acceptance checklist; not a current progress report. Consult root STATUS.md and ROADMAP.md before starting or rebuilding anything.

## Observable outcome

L41-L50 are playable using the validated small DQN backend; preparation and evaluation remain honest and responsive.

## Read before work

Always read root AGENTS.md, README.md, STATUS.md, ROADMAP.md, and docs/IMPLEMENTATION_DECISIONS.md, then:

- [docs/03_COURSE_ALIGNMENT.md](../docs/03_COURSE_ALIGNMENT.md)
- [docs/09_RL_IMPLEMENTATION.md](../docs/09_RL_IMPLEMENTATION.md)
- [docs/10_TRAINING_EVALUATION.md](../docs/10_TRAINING_EVALUATION.md)
- [docs/13_ACCESSIBILITY_PERFORMANCE.md](../docs/13_ACCESSIBILITY_PERFORMANCE.md)
- [campaign/chapter-09-neural-arcade.md](../campaign/chapter-09-neural-arcade.md)
- [campaign/chapter-10-storm-grid.md](../campaign/chapter-10-storm-grid.md)

## Implementation scope

1. Integrate the M04 DQN backend into production cartridges: replay cap, target-copy cadence, seeded sampling, optimizer checkpoint semantics, and inference-only deployment.
2. Author nonlinear fully observed combination tasks and explicit replay/target ablations; no full-screen pixel learning.
3. Implement coverage, sparse-reward versioning, curriculum staging, and bounded condition randomization for Chapter 10 while retaining proposed alignment flags.
4. Lazy-load neural code/media and record transfer/compute/memory budgets. Test CPU baseline on the release browser matrix available.
5. Calibrate all ten recipes, freeze them, and audit separate seeds. Resolve unreliable tasks through design/observation/training improvements rather than hidden winning policies.

## Acceptance gates

- [ ] Target weights/replay/evaluation invariants and JS/backend parity pass in production integration.
- [ ] No stale reward-version transitions contaminate sparse-reward comparisons.
- [ ] Final curriculum evaluations use the full intended task without training-only shortcuts.
- [ ] Training/cancel/navigation remains responsive and no tensor/resource leak appears in repeated use.
- [ ] Fifty-mission campaign and save migrations pass; Chapter 10 is not falsely labeled slide-verified.

## Explicit non-goals

No runtime cloud API, no raw-vision/GPU dependency, no invented benchmark results, no silent algorithm upgrade to Double DQN/PPO.

## Handoff

Fifty playable missions total, raw deep-RL audit evidence, and a measured browser workload.

## Execution note - to be completed during implementation

Original unchecked checklist. Record current execution in root STATUS.md and the relevant task note; do not treat this historical paragraph as proof that existing code is absent. Record date/environment, actual files changed, commands/results, evidence paths, measured findings, unresolved issues, and the next bounded action. Do not mark a checkbox from reasoning alone. Build/browser/tooling limitations must remain visible in STATUS.
