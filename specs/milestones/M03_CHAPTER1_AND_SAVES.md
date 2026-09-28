# M03 - First five missions, genuine learning, and saves

**Prerequisites:** M02 screen shell; M01 kernel invariants.
**Specification state:** Original acceptance checklist; not a current progress report. Consult root STATUS.md and ROADMAP.md before starting or rebuilding anything.

## Observable outcome

The complete first chapter is playable, Echo genuinely changes behavior through learning, and progress survives reload safely.

## Read before work

Always read root AGENTS.md, README.md, STATUS.md, ROADMAP.md, and docs/IMPLEMENTATION_DECISIONS.md, then:

- [docs/02_GAMEPLAY_SYSTEMS.md](../docs/02_GAMEPLAY_SYSTEMS.md)
- [docs/09_RL_IMPLEMENTATION.md](../docs/09_RL_IMPLEMENTATION.md)
- [docs/10_TRAINING_EVALUATION.md](../docs/10_TRAINING_EVALUATION.md)
- [docs/12_PROGRESS_SAVE_SECURITY.md](../docs/12_PROGRESS_SAVE_SECURITY.md)
- [docs/14_TESTING_AND_ACCEPTANCE.md](../docs/14_TESTING_AND_ACCEPTANCE.md)
- [campaign/chapter-01-scrapyard.md](../campaign/chapter-01-scrapyard.md)

## Implementation scope

1. Implement a real tabular Q-learning agent and inference snapshot. Verify F02 targets, exploration sampling, terminal handling, seeded initialization, and no updates during evaluation.
2. Implement module-worker protocol, bounded chunks, cancellation/pause, versioned snapshot installation, and stale-result rejection. Use the same kernel for real practice and visible play.
3. Add only the environmental objects required by L02-L05; author their exact geometry, reward versions, controls, and bounded reference recipes.
4. Implement dock interaction, practice projection samples, real reward/exploration controls, quick retry retaining memory, and explicit reset-memory confirmation.
5. Implement IndexedDB progress/checkpoints, export/import validation, migration scaffolding with real fixtures, last-good recovery, and quota/conflict handling. Light up C01 after L05.

## Acceptance gates

- [ ] L01-L05 complete in order without quizzes or hidden route scripts; Patch has a meaningful role.
- [ ] Real updates and behavior-dependent success are verified; high reward without fuse delivery cannot win.
- [ ] Worker remains cancelable, stale results are ignored, hidden-tab pause works, and UI remains responsive.
- [ ] New Game/Continue/reload/export/import/error paths preserve correct progress and cartridge provenance.
- [ ] Audit learning recipes on multiple seeds and record actual outcomes; do not force a desired failure.

## Explicit non-goals

No remaining 50-level expansion yet; no online account system; no background upload; no claims of measured educational learning outcomes.

## Handoff

A first-chapter vertical slice ready for human usability review, with real learning traces and recoverable saves.

## Execution note - to be completed during implementation

Original unchecked checklist. Record current execution in root STATUS.md and the relevant task note; do not treat this historical paragraph as proof that existing code is absent. Record date/environment, actual files changed, commands/results, evidence paths, measured findings, unresolved issues, and the next bounded action. Do not mark a checkbox from reasoning alone. Build/browser/tooling limitations must remain visible in STATUS.
