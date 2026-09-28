# M07 - Chapters 7-8: learned models and policy learning

**Prerequisites:** M06 campaign complete; M04 backend available as needed.
**Specification state:** Original acceptance checklist; not a current progress report. Consult root STATUS.md and ROADMAP.md before starting or rebuilding anything.

## Observable outcome

L31-L40 are complete with actual learned-model planning, stochastic policy updates, and a separate critic.

## Read before work

Always read root AGENTS.md, README.md, STATUS.md, ROADMAP.md, and docs/IMPLEMENTATION_DECISIONS.md, then:

- [docs/08_SIMULATION_CONTRACT.md](../docs/08_SIMULATION_CONTRACT.md)
- [docs/09_RL_IMPLEMENTATION.md](../docs/09_RL_IMPLEMENTATION.md)
- [docs/10_TRAINING_EVALUATION.md](../docs/10_TRAINING_EVALUATION.md)
- [campaign/chapter-07-clockwork-docks.md](../campaign/chapter-07-clockwork-docks.md)
- [campaign/chapter-08-skybridge.md](../campaign/chapter-08-skybridge.md)

## Implementation scope

1. Implement empirical transition/reward models, Dyna-Q sampling over observed pairs, and explicit forgetting/reset behavior for changed machinery.
2. Keep real and imagined traces/counters distinct and enforce capability boundaries that prevent model imagination using the exact kernel.
3. Implement stable softmax REINFORCE, value baseline, and one-step actor-critic with detached targets/advantages and fresh on-policy data.
4. Author ten missions with stage-wise configuration changes and meaningful Patch handoffs. Keep discrete actions; do not introduce continuous steering.
5. Calibrate model-drift and policy-gradient tasks across seeds; log actual variance and baseline effects without promising every run improves.

## Acceptance gates

- [ ] Learned model equals empirical counts, not true parameters; stale environment jobs are rejected.
- [ ] Ghost projections cannot set real-delivery objectives.
- [ ] Policy/baseline/critic gradient and numerical-stability fixtures pass; no stale replay contamination.
- [ ] Frozen stage evaluations do not update any learner state.
- [ ] Forty-mission campaign progression and save recovery pass regression tests.

## Explicit non-goals

No oracle critic, no forced model-failure cutscene, no PPO/continuous-action scope expansion.

## Handoff

Forty playable missions total with real model-based and policy-based mechanisms and checked stage transitions.

## Execution note - to be completed during implementation

Original unchecked checklist. Record current execution in root STATUS.md and the relevant task note; do not treat this historical paragraph as proof that existing code is absent. Record date/environment, actual files changed, commands/results, evidence paths, measured findings, unresolved issues, and the next bounded action. Do not mark a checkbox from reasoning alone. Build/browser/tooling limitations must remain visible in STATUS.
