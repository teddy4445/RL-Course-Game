# M01 - Shared simulation and first playable heist

**Prerequisites:** M00 foundation and browser render gate.
**Specification state:** Original acceptance checklist; not a current progress report. Consult root STATUS.md and ROADMAP.md before starting or rebuilding anything.

## Observable outcome

L01 is genuinely playable using the same deterministic kernel used by headless tests.

## Read before work

Always read root AGENTS.md, README.md, STATUS.md, ROADMAP.md, and docs/IMPLEMENTATION_DECISIONS.md, then:

- [docs/02_GAMEPLAY_SYSTEMS.md](../docs/02_GAMEPLAY_SYSTEMS.md)
- [docs/08_SIMULATION_CONTRACT.md](../docs/08_SIMULATION_CONTRACT.md)
- [docs/11_LEVEL_DATA_CONTRACT.md](../docs/11_LEVEL_DATA_CONTRACT.md)
- [docs/21_REFERENCE_FIXTURES.md](../docs/21_REFERENCE_FIXTURES.md)
- [campaign/chapter-01-scrapyard.md](../campaign/chapter-01-scrapyard.md)

## Implementation scope

1. Implement the versioned PRNG and stream derivation with known-answer tests. Add state creation, six actions, fixed-step order, occupancy, facing, cargo, socket delivery, terminal objectives, and cloning.
2. Implement F01 exact geometry and its disclosed fixed boot self-check policy. This is onboarding, not a claimed learner. The one-stage delivery/exit predicates must drive success.
3. Connect keyboard input and an interpolated Phaser view without using separate renderer physics to decide outcomes. Clear input on focus loss and handle pause/retry.
4. Build entity rendering with explicit local placeholders, a compact objective display, contextual interaction prompt, and a short result/retry overlay.
5. Add the headless-versus-rendered differential trace test and reward-ledger invariants before introducing more objects.

## Acceptance gates

- [ ] Complete F01 through public keyboard controls; both actors reach distinct staging cells.
- [ ] Identical actions/seeds produce matching headless and rendered decision traces at different frame schedules.
- [ ] No wall crossing, cargo duplication, repeated delivery reward, or terminal-state mutation.
- [ ] Pause/retry restores the correct world while maintaining a clear separation from future learner memory.
- [ ] Production base-path build still works.

## Explicit non-goals

No claim of real learning in L01, no 55-level placeholder generator, no neural model, and no global Phaser state driving rewards.

## Handoff

A runnable first heist, numerical/event-order tests, exact L01 level data, and a reusable simulation boundary.

## Execution note - to be completed during implementation

Original unchecked checklist. Record current execution in root STATUS.md and the relevant task note; do not treat this historical paragraph as proof that existing code is absent. Record date/environment, actual files changed, commands/results, evidence paths, measured findings, unresolved issues, and the next bounded action. Do not mark a checkbox from reasoning alone. Build/browser/tooling limitations must remain visible in STATUS.
