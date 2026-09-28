# RL implementation contracts

This file specifies genuine baseline algorithms and project conventions, not proven gameplay tuning. Primary foundations are registered in [18_SOURCES_AND_VERIFICATION.md](18_SOURCES_AND_VERIFICATION.md), particularly S16-S20. Do not copy a large external training framework into the project. The small environments and mathematical update tests are intentional.

## Shared interfaces and capability boundaries

An agent has `initialize(spec, rng)`, `act(observation, mode)`, `observe(transition)` where permitted, `endEpisode(outcome)`, `exportSnapshot()`, and `dispose()`. A policy snapshot is immutable and inference-only. Separate learner objects from snapshots so evaluation cannot accidentally update weights through a shared reference.

A transition records raw observation/profile ID, encoded state/features, action, scalar training reward, next observation, terminated/truncated flags, episode/stage IDs, and any action mask derived only from observable physical legality. We do not mask dangerous but legal actions. Blocked movement also remains legal because it can change facing and consume time; the default profile retains all six actions. Only named profiles can mask genuinely unavailable observable commands, consistently in behavior and targets. WAIT is always legal. Planning agents receive an explicit KnownModel capability only in authorized chapters. Learned models receive transition samples; no true model handle.

Acting mode is `practice`, `evaluation`, or `demonstration`. Each configuration declares exploration and update policy for each mode. Fixed-policy prediction stores an immutable policy snapshot separately from its changing estimates. Agent/cartridge/encoder/action-schema/environment-reward compatibility is validated before reuse.

## Common notation

`s` is the complete task state or declared encoded observation; `a` an action; `r` the next reward; `gamma` the discount; `alpha` a step size. `b = 0` for a true terminal transition, otherwise `b = 1`. An administrative truncation retains `b=1` and the last non-reset next observation.

`G_t = sum_{k=t}^{T-1} gamma^(k-t) r_{k+1}` for a completed episode. Keep unnormalized mission reward totals separate from discounted returns. Use finite-value checks and reject NaN/Infinity snapshots.

## A. Known-model prediction and planning

Represent a transition distribution as a list of `{probability, nextState, reward, terminated}` records. Sum probabilities to one within tolerance; probabilities cannot be negative. Expected reward must be conditioned on the transition where relevant.

Policy evaluation:

```text
V_new(s) = sum_a pi(a|s) * sum_outcome p(outcome|s,a)
           * [r + gamma * (not terminated) * V_old(nextState)]
```

Default synchronous sweeps, with values from the previous sweep only. Use finite-horizon backward induction where a horizon is part of the state; otherwise require a discounted/proper episodic task. Stop by documented maximum sweeps/residual, not a fixed animation duration. Overlay shows the actual latest values and residual status, not a precomputed designer path.

Policy improvement picks an action maximizing the one-step expectation from V. Use deterministic lowest-ID tie-breaking in evaluation, and document it. Policy iteration alternates evaluation and improvement. Value iteration replaces the policy-weighted sum with `max_a`. One-step improvement can be explicitly player-selected in L11/L12, but route consequences must follow the actual updated policy.

## B. Monte Carlo prediction

Default first-visit MC for a fixed policy. Complete the episode, compute returns backward, and update only the first forward occurrence of each state with the appropriate return. Keep counts N(s) and sample-mean update `V(s) += (G - V(s))/N(s)`. Do not accidentally implement last-visit updates while calling them first-visit.

Allow a separately named constant-step variant only when a mission needs recency weighting. Canceled incomplete episodes do not enter completed-episode MC estimates. Policy bytes/hash must remain unchanged. L18 shows sample count and raw observed outcomes if needed, not an unsupported confidence interval.

## C. TD(0) and TD(lambda) prediction

```text
delta = r + gamma*b*V(s_next) - V(s)
V(s) += alpha*delta
```

TD(lambda) uses accumulating traces as the initial defined variant:

```text
e *= gamma*lambda
e[s] += 1
V += alpha*delta*e
```

Clear traces at episode boundaries, on discarded task changes, and after an administrative truncation that starts a new rollout. A temporary worker yield/pause is not a boundary. `lambda=0` must match TD(0). Do not promise numerical equality with MC at lambda=1 under arbitrary online updates/step sizes.

## D. Tabular control

Epsilon-greedy: with probability epsilon, choose uniformly from physically legal actions; otherwise choose among maximizing actions using the declared tie policy. Do not remove dangerous actions to make a learner look safe. Set practice/evaluation epsilon independently and record both.

SARSA target:

```text
r + gamma*b*Q(s_next, a_next)
```

The next action is sampled from the current behavior policy and is the action actually used next, except when a stopped administrative rollout requires a sampled bootstrap action without executing it. No next action is required after true termination.

Q-learning target:

```text
r + gamma*b*max_a Q(s_next,a)
Q(s,a) += alpha*(target - Q(s,a))
```

Expected SARSA, double Q-learning, prioritized replay, and other variants are outside the required baseline. Never call one algorithm another merely to fit a chapter label.

L23/L24 use matched environment definitions, training budgets, seed schedules, initializations, and exploration settings. Report training falls separately from greedy evaluation falls. Do not hardcode which algorithm must win in each individual run or promise a universal ranking.

## E. Linear function approximation

Use a small declared feature vector `phi(s)` and action-specific weights: `Q(s,a)=w_a dot phi(s)`. Semi-gradient SARSA is the default Chapter 6 control method to avoid silently adding off-policy instability as an unrelated lesson.

```text
target = r + gamma*b*Q(s_next,a_next)
w_a += alpha*(target-Q(s,a))*phi(s)
```

Normalize feature scales and include bias. Feature schema is versioned. Possible inputs: normalized position/relative goal, cargo one-hot, facing, observable gate state, neighboring blockage, hazard phase, remaining steps, and task stage. Select a compact sufficient set for the actual task; do not include a hidden shortest-path oracle as a feature. Diagnostic missing-cargo profiles intentionally restrict it.

Tile coding/resolution changes in L29 must be implemented as a real encoder change with separately initialized or explicitly migrated weights. A denser feature set is not automatically better; test actual transfer. Observation arrays have a fixed length per compatible model; pad task object slots with masks rather than changing length silently.

## F. Learned model and Dyna-Q

For each experienced `(s,a)`, keep counts of next states/outcomes, reward means conditioned on outcome where needed, and terminal outcomes. Model sampling chooses according to learned frequencies. Imagined updates use only observed state-action pairs in the baseline; unknown pairs remain unknown.

A Dyna-Q real step performs the real Q-learning update, updates model counts, then performs `nPlanning` sampled model updates. Count real environment transitions and model updates separately. A model projector identifies imagined trajectories clearly; it cannot display them as actual successful trials.

For changed dynamics in L34/L35, offer a bounded recency window or explicit model reset for affected machinery, with a recorded operation. Stationary-baseline cumulative counts do not instantly forget old behavior. Config changes increment environment revision and invalidate in-flight jobs. Relearning must occur through fresh real observations, not copying the corrected true kernel into the model.

## G. REINFORCE and actor-critic

Use stable softmax over linear preferences or a tiny declared MLP. Subtract maximum logit before exponentiation. Action probabilities sum to one, invalid physical actions have zero probability, and valid action probabilities remain finite.

For the simplest complete-episode REINFORCE fixture, use gamma=1 with finite horizons and rewards-to-go:

```text
actor loss = -mean_episodes sum_t log(pi_theta(a_t|s_t)) * stopGradient(G_t)
```

If implementing a discounted start-state objective, include the appropriate gamma^t weighting and document the objective; do not silently mix conventions. The optional value baseline replaces `G_t` with `G_t - V_psi(s_t)` and trains V to returns with MSE. Detach advantages from the actor gradient. A baseline changes variance, not environmental rewards or labels.

One-step actor-critic:

```text
delta = r + gamma*b*V_psi(s_next) - V_psi(s)
actor loss = -log(pi_theta(a|s))*stopGradient(delta)
critic loss = 0.5*(stopGradient(r + gamma*b*V_psi(s_next)) - V_psi(s))^2
```

A small optional entropy bonus has an explicit coefficient and label; it is not required for the baseline. Actor-critic uses fresh on-policy data, not the DQN replay buffer. Snapshot/evaluation mode uses the declared stochastic or greedy policy; neither should be switched silently to make results look better.

## H. DQN

Initial architecture target: fixed observation vector -> Dense(32, ReLU) -> Dense(32, ReLU) -> six linear action values. This is a starting point, not a measured optimal size. Keep under 50,000 trainable parameters for the required baseline. No raw full-screen vision, recurrent network, or GPU requirement.

Keep online and separately copied target parameters. Experience replay stores real transitions with terminal flags and next observations, not DOM state or only successful runs. Sample uniform minibatches with a seeded generator. Use a ring buffer with a fixed cap.

```text
y = r + gamma*b*max_a Q_target(s_next,a)
loss = mean(Huber(stopGradient(y) - Q_online(s,a)))
```

Use a declared Huber delta (initially 1), global gradient norm cap (initially 5), and tested Adam optimizer. Target network updates every declared number of optimizer steps, not rendering frames. Evaluation has no updates or replay insertion. Cold-start collection warm-up and epsilon schedule are explicit.

Replay-only and target-network ablations are permitted in their designated missions, but must not be scripted to fail; observed differences can vary. Implementing Double DQN later requires explicitly renaming the algorithm and using online argmax/target evaluation correctly.

CPU TensorFlow.js training runs inside the worker; call `await tf.setBackend('cpu')` then `await tf.ready()` using the installed supported API. Dispose temporary tensors, optimizers, old models, and superseded snapshots. `tf.tidy` must not enclose an async function. Do not assume a WASM backend implements every gradient kernel: an optional accelerated backend must pass the complete training kernel probe and fall back cleanly. See S14.

## I. Behavioral cloning and corrective demonstrations

Record `observation BEFORE action`, physically valid human action, task/encoder versions, episode ID, and whether the label was an intervention. Use the same quantized six-action interface; sample once per decision tick, not every render frame. Long WAIT runs must be handled with an explicit weighting/sampling policy rather than drowning out other actions.

Train a softmax classifier with cross-entropy on observation-action pairs. Use episode-level training/validation splits; adjacent frames from one demonstration must not straddle those splits. Do not use mission evaluation episodes as labeled training data. Runtime behavior uses current observations and model probabilities/argmax, not playback of the recorded sequence.

For corrective imitation, roll out the current policy in practice; when the player intervenes, record the observation at that actual visited state and the corrective action. Aggregate those labeled samples with previous demonstrations, retrain, and repeat. Call this **DAgger-inspired interactive imitation**, not a full reproduction of the original guarantees: the human only labels selected states and may be inconsistent.

No hidden omniscient planner supplies labels in production. A test-only oracle may verify fixtures but cannot be bundled as an automatic teacher. The final mission uses an explicit compatible imitation cartridge; it does not average incompatible previous models.

## Numerical defaults requiring calibration

| Family | Starting point |
|---|---|
| Tabular TD/control | alpha 0.15, gamma 0.95, practice epsilon 0.20, greedy evaluation epsilon 0 |
| TD(lambda) | lambda 0.8, alpha 0.10 |
| Linear SARSA | alpha 0.02 with normalized features; tune by active feature count |
| Dyna-Q | nPlanning 5; model memory capped by task reachable states |
| REINFORCE | complete episodes, gamma 1, batch 8 episodes, learning rate 0.001 |
| Actor-critic | gamma 0.95, separate actor/critic step sizes calibrated on a fixture |
| DQN | replay 4096, batch 32, warm-up 256 real transitions, target copy each 100 updates, Adam 0.001 |
| Cloning | batch up to 32, Adam 0.001, max 20 epochs per requested training job |

No default is a promised result. Reward scaling, horizon, map size, model capacity, and exploration interact. Tune on development seeds, then freeze the recipe before auditing unseen seeds. Record all changes and do not claim a universally superior algorithm.
