# M06 - Chapters 5-6: control and generalization

**Prerequisites:** M05 model/prediction campaign complete.
**Specification state:** Original acceptance checklist; not a current progress report. Consult root STATUS.md and ROADMAP.md before starting or rebuilding anything.

## Observable outcome

L21-L30 are complete, including interpretable SARSA/Q-learning contrasts and genuine feature-based transfer.

## Read before work

Always read root AGENTS.md, README.md, STATUS.md, ROADMAP.md, and docs/IMPLEMENTATION_DECISIONS.md, then:

- [docs/09_RL_IMPLEMENTATION.md](../docs/09_RL_IMPLEMENTATION.md)
- [docs/10_TRAINING_EVALUATION.md](../docs/10_TRAINING_EVALUATION.md)
- [docs/11_LEVEL_DATA_CONTRACT.md](../docs/11_LEVEL_DATA_CONTRACT.md)
- [docs/20_LEVEL_AUTHORING_GUIDE.md](../docs/20_LEVEL_AUTHORING_GUIDE.md)
- [campaign/chapter-05-neon-market.md](../campaign/chapter-05-neon-market.md)
- [campaign/chapter-06-modular-foundry.md](../campaign/chapter-06-modular-foundry.md)

## Implementation scope

1. Implement SARSA with sampled-next-action consistency and reuse tested Q-learning. Add separate practice/evaluation exploration settings and resumable schedules.
2. Build the matched L23/L24 strip fixture; record practice falls separately from final greedy results. Keep dangerous legal actions available.
3. Implement versioned normalized feature encoders, linear semi-gradient SARSA, and explicit incompatible-weight reset/migration behavior.
4. Author the ten missions and their transfer variants. Use missing-cargo/coarse profiles only where deliberately specified.
5. Run fixed-budget independent-seed audits and preserve raw results. Add settings/save/reload tests for feature-cartridge transitions.

## Acceptance gates

- [ ] SARSA/Q-learning numerical targets and behavior policy distinctions pass.
- [ ] No fixed algorithm ranking is required by tests or text.
- [ ] Relational transfer and encoder aliasing/resolution tests use actual observations and held-out variants.
- [ ] All ten objectives are reachable and learnable; no feature-name success flag.
- [ ] Thirty-mission progression and existing save compatibility remain intact.

## Explicit non-goals

No hidden shortest-path feature, no neural network as a silent fix for absent information, no scripted comparative failures.

## Handoff

Thirty playable missions total; matched-control comparisons and measured representation-transfer evidence.

## Execution note - to be completed during implementation

Original unchecked checklist. Record current execution in root STATUS.md and the relevant task note; do not treat this historical paragraph as proof that existing code is absent. Record date/environment, actual files changed, commands/results, evidence paths, measured findings, unresolved issues, and the next bounded action. Do not mark a checkbox from reasoning alone. Build/browser/tooling limitations must remain visible in STATUS.
