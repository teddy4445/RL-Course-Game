# Reference fixtures and numerical expected results

These are exact small fixtures to implement as tests. They are not claims that tests have already run, and test-only action scripts/oracles must not become hidden production learning policies.

## F01: L01 geometry and onboarding

Grid width 12, height 8. Origin upper-left, x right, y down, outer walls solid. The symbols below are annotations over floor; object IDs live in entity data.

```text
############
#P.B.......#
#..........#
#..S.......#
#..........#
#..E....X..#
#.......Y..#
############
```

Patch starts (1,1), facing east. Battery `batteryA` at (3,1). Socket `dockSocket` at (3,3). Echo at (3,5), asleep, facing east. Echo staging cell X=(8,5); Patch staging cell Y=(8,6). Horizon 160 steps; no hazards. Delivering batteryA to dockSocket wakes Echo and latches the powered state.

L01 is explicitly onboarding with an ordinary **fixed boot self-check policy**, not a claimed learned policy: asleep -> WAIT; awake and x<8 on row 5 -> EAST; at X -> WAIT. This visible baseline may be used only here and in non-learning cinematic behavior. Subsequent learning missions cannot reuse it to fake training.

Patch test action sequence: EAST, EAST, INTERACT, SOUTH, SOUTH, INTERACT, six EAST actions, three SOUTH actions, WEST. Echo starts its first movement on the tick after the battery delivery becomes observable. Expected: battery has exactly one delivery event; socket powered; Echo at (8,5); Patch at (8,6); objective true; no collision overlap. Patch routes via x=9 to avoid the occupied Echo staging cell. Repeated INTERACT at the socket cannot create another delivery reward.

The production level may decorate this geometry but cannot alter the test's semantic positions without updating the content version/fixture. It introduces state/action/consequence, not a false claim that a fully trained agent has already emerged.

## F02: one-step value updates

Given Q(s,a)=2, alpha=0.5, reward=1, gamma=0.9, next Q values [4,1]:

- Q-learning target 4.6, new value 3.3.
- SARSA with actual next action whose value is 1: target 1.9, new value 1.95.
- True terminal transition: target 1, new value 1.5.
- Administrative truncation with valid final next observation: same bootstrap target as the respective nonterminal algorithm, not 1.

Use a tolerance such as 1e-9 for pure number arithmetic; establish appropriate Float32 tolerances separately.

## F03: first-visit MC

Episode states A, A, terminal; rewards 1 then 4; gamma=0.5. Returns are G0=3 and G1=4. First-visit MC updates A once with 3, not twice and not with 4. With no prior samples V(A)=3 and N(A)=1. A canceled prefix does not count as a completed MC episode.

## F04: known-model planning

State S has action SAFE -> terminal reward 2; action RISKY -> terminal reward 5 with probability 0.4, reward -1 with probability 0.6. Expected return SAFE=2, RISKY=1.4. With policy choosing each action equally, V(S)=1.7. Policy improvement chooses SAFE. No discount ambiguity exists because both terminate immediately. Test probability normalization and fixed-policy evaluation separately from improvement.

## F05: delayed reward

Two deterministic alternatives: reward 2 on transition 1, or reward 10 only on transition 8. At gamma=0.95, the latter discounted return is `10*0.95^7`, greater than 2. At gamma=0.5 it is `10*0.5^7`, less than 2. Use this relationship to test that the future-priority setting changes the discounted-return preference, not the episode deadline, fixed mission objective, or an arbitrary speed stat. Learning discovery still needs its own tests.

## F06: DQN target

Reward 1, gamma 0.9, next online values [9,1], next target values [2,7], nonterminal. Standard DQN uses max target=7, so y=7.3. A Double DQN implementation would use online argmax and target value 2, giving 2.8; that is intentionally NOT this baseline. True terminal y=1. Verify no target gradient and no target parameter changes before the scheduled copy.

## F07: softmax and cloning

Equal logits over six legal actions yield probability 1/6 each. Masking one physically impossible action gives zero to it and 1/5 to the others. Large finite logits remain numerically stable. Cross-entropy training on two distinct fully observed states labeled with different actions must reduce the toy loss and produce observation-dependent choices. Validate with a shifted start, not the exact recorded action sequence.

## F08: worker cancellation and stale snapshots

Start job A at environmentRevision=1, then cancel and start B at revision=2. Deliver A's delayed CHECKPOINT/COMPLETED after B begins. They must not alter B's policy, save generation, UI status, or mission score. Repeat with a save import between jobs. No schema-correct but stale message can pass solely because its levelId matches.

## F09: behavioral differential test

Capture an initial episode plus a 50-action sequence. Advance headless and through the rendered coordinator at several frame schedules. Compare positions, cargo, gate bits, hazard phase, reward ledger, terminal outcome, and RNG state at every decision step. Cosmetic emissions/camera effects may differ; task outcomes may not.
