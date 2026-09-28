# M09 - Chapter 11: demonstrations, corrections, and final rescue

**Prerequisites:** M08 campaign complete; M04 cloning pipeline verified.
**Specification state:** Original acceptance checklist; not a current progress report. Consult root STATUS.md and ROADMAP.md before starting or rebuilding anything.

## Observable outcome

All 55 missions are playable and the final rescue is caused by the trained imitation policy rather than a scripted ending.

## Read before work

Always read root AGENTS.md, README.md, STATUS.md, ROADMAP.md, and docs/IMPLEMENTATION_DECISIONS.md, then:

- [docs/09_RL_IMPLEMENTATION.md](../docs/09_RL_IMPLEMENTATION.md)
- [docs/10_TRAINING_EVALUATION.md](../docs/10_TRAINING_EVALUATION.md)
- [docs/16_CONTENT_WRITING.md](../docs/16_CONTENT_WRITING.md)
- [campaign/chapter-11-central-tower.md](../campaign/chapter-11-central-tower.md)

## Implementation scope

1. Implement the demonstration tether with current observation/action alignment, a clear player/Echo control handoff, and bounded WAIT handling.
2. Train behavioral cloning with episode-based splits; integrate compatible model saves and shifted-start evaluation.
3. Implement selective practice interventions and dataset aggregation, clearly labeled DAgger-inspired rather than theoretical equivalence.
4. Author L51-L55, including real autonomous final-stage rescue predicates, post-ending menu/replay behavior, and core-restoration credits.
5. Ensure no test-only expert, action macro, or prior incompatible model merging enters production. Record demonstration provenance and assistance separately from scored autonomous runs.

## Acceptance gates

- [ ] Pre-action labels, split integrity, correction-state handling, and observation-dependent behavior tests pass.
- [ ] No intervention or learning occurs in the frozen rescue stage.
- [ ] The ending cannot fire before actual release-core delivery and both actors reach extraction.
- [ ] Complete L01-L55 progression and save/reload after the ending pass.
- [ ] All 55 records are implemented; placeholder algorithm handlers and extra campaign IDs are absent.

## Explicit non-goals

No automatic omniscient demonstrator for players; no action replay advertised as imitation; no claim of guaranteed human-teacher quality.

## Handoff

Complete functional campaign, actual final-stage trace, and full content coverage ready for polish and human playtesting.

## Execution note - to be completed during implementation

Original unchecked checklist. Record current execution in root STATUS.md and the relevant task note; do not treat this historical paragraph as proof that existing code is absent. Record date/environment, actual files changed, commands/results, evidence paths, measured findings, unresolved issues, and the next bounded action. Do not mark a checkbox from reasoning alone. Build/browser/tooling limitations must remain visible in STATUS.
