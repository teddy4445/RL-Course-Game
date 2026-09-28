# M10 - Full-campaign polish, accessibility, and playtests

**Prerequisites:** M09 complete functional campaign.
**Specification state:** Original acceptance checklist; not a current progress report. Consult root STATUS.md and ROADMAP.md before starting or rebuilding anything.

## Observable outcome

The complete game is visually/audio coherent, usable, measured, and ready for authorized release rather than just technically functional.

## Read before work

Always read root AGENTS.md, README.md, STATUS.md, ROADMAP.md, and docs/IMPLEMENTATION_DECISIONS.md, then:

- [docs/04_UX_SCREEN_FLOWS.md](../docs/04_UX_SCREEN_FLOWS.md)
- [docs/05_ART_DIRECTION.md](../docs/05_ART_DIRECTION.md)
- [docs/06_AUDIO_AND_ASSETS.md](../docs/06_AUDIO_AND_ASSETS.md)
- [docs/13_ACCESSIBILITY_PERFORMANCE.md](../docs/13_ACCESSIBILITY_PERFORMANCE.md)
- [docs/14_TESTING_AND_ACCEPTANCE.md](../docs/14_TESTING_AND_ACCEPTANCE.md)
- [docs/17_RISKS_AND_OPEN_DECISIONS.md](../docs/17_RISKS_AND_OPEN_DECISIONS.md)
- [docs/19_ASSET_MANIFEST.md](../docs/19_ASSET_MANIFEST.md)

## Implementation scope

1. Replace or explicitly approve all visible placeholder art/audio; verify atlas pivots, asset rights, local loading groups, and final credits.
2. Inspect every menu/settings/map/result state and representative room in each district at target viewports, zoom levels, reduced motion, and mute. Repair clipping/overlap/dead controls.
3. Run full numerical/content/learning regression, save corruption/quota/conflict tests, and repeated scene/training/audio lifecycle soak tests.
4. Measure real cold-load transfer, frame/input behavior, cancellation, and neural workload on the declared laptop/browser matrix. Reduce decorative costs before altering task semantics.
5. Conduct or obtain actual human playtest notes. Record confusion, agency, retry enjoyment, and observation-to-intervention reasoning. If human testing is unavailable, leave that gate open; do not fabricate a user study.

## Acceptance gates

- [ ] All implemented automated gates pass with raw evidence and no broad skips.
- [ ] Final visual/audio assets have provenance and actual review; accessibility paths work.
- [ ] All 55 levels are distinct enough to justify their place and no required level is a training-timer wait disguised as a game.
- [ ] Human playtest findings are recorded or explicitly blocked; pedagogical slide verification status remains honest.
- [ ] Open blocking defects have owners and reproducible descriptions; release is not declared ready while they remain.

## Explicit non-goals

No new systems, multiplayer, new algorithm families, or expanded campaign; fix and polish the agreed scope.

## Handoff

Release candidate, actual QA/playtest/asset records, and a clear list of any still-open gates.

## Execution note - to be completed during implementation

Original unchecked checklist. Record current execution in root STATUS.md and the relevant task note; do not treat this historical paragraph as proof that existing code is absent. Record date/environment, actual files changed, commands/results, evidence paths, measured findings, unresolved issues, and the next bounded action. Do not mark a checkbox from reasoning alone. Build/browser/tooling limitations must remain visible in STATUS.
