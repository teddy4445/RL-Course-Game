# M05 - Chapters 2-4: models, planning, and prediction

**Prerequisites:** M03 campaign infrastructure; M04 risk probe completed or its scope-specific blocker explicitly resolved.
**Specification state:** Original acceptance checklist; not a current progress report. Consult root STATUS.md and ROADMAP.md before starting or rebuilding anything.

## Observable outcome

L06-L20 are complete, with genuine known-model planning and fixed-policy model-free prediction.

## Read before work

Always read root AGENTS.md, README.md, STATUS.md, ROADMAP.md, and docs/IMPLEMENTATION_DECISIONS.md, then:

- [docs/03_COURSE_ALIGNMENT.md](../docs/03_COURSE_ALIGNMENT.md)
- [docs/08_SIMULATION_CONTRACT.md](../docs/08_SIMULATION_CONTRACT.md)
- [docs/09_RL_IMPLEMENTATION.md](../docs/09_RL_IMPLEMENTATION.md)
- [docs/20_LEVEL_AUTHORING_GUIDE.md](../docs/20_LEVEL_AUTHORING_GUIDE.md)
- [docs/21_REFERENCE_FIXTURES.md](../docs/21_REFERENCE_FIXTURES.md)
- [campaign/chapter-02-transit-depot.md](../campaign/chapter-02-transit-depot.md)
- [campaign/chapter-03-switchworks.md](../campaign/chapter-03-switchworks.md)
- [campaign/chapter-04-courier-quarter.md](../campaign/chapter-04-courier-quarter.md)

## Implementation scope

1. Implement sparse known-model enumeration, policy evaluation, policy improvement/iteration, and synchronous value iteration with explicit convergence/budget status.
2. Implement first-visit MC, TD(0), and accumulating TD(lambda) against immutable fixed policies. Keep recorder estimates separate from action control.
3. Add authentic on-world value/route projections and contextual controls without creating a permanent classroom dashboard.
4. Author all fifteen mission geometries/stages; preserve model availability boundaries, deliberate aliasing labels, and finite-horizon time observations.
5. Calibrate prediction missions around dispatch choices made by the player, not automatic policy improvements. Add chapter restoration/save flows and content validation.

## Acceptance gates

- [ ] F03/F04 and sweep/trace/terminal fixtures pass.
- [ ] Fixed policies do not change during prediction; model-free predictors cannot query exact transitions.
- [ ] All fifteen missions clear through actual events and do not count solver clicks as success.
- [ ] Known-model state counts and latency remain within measured budgets.
- [ ] Campaign L01-L20 progression, reload, accessible map navigation, and worker teardown remain correct.

## Explicit non-goals

No unverified slide-page claims, no deep RL substitution for a broken tabular task, no changes to prior chapter IDs.

## Handoff

Twenty playable missions total; planner/predictor evidence and exact content/recipe records for C02-C04.

## Execution note - to be completed during implementation

Original unchecked checklist. Record current execution in root STATUS.md and the relevant task note; do not treat this historical paragraph as proof that existing code is absent. Record date/environment, actual files changed, commands/results, evidence paths, measured findings, unresolved issues, and the next bounded action. Do not mark a checkbox from reasoning alone. Build/browser/tooling limitations must remain visible in STATUS.
