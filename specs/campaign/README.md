# Campaign index - 55 missions

All eleven chapter-to-lecture mappings are proposed pending actual slide verification. Every chapter contains five mission briefs. The briefs define behavior and acceptance checks; exact later-room tile coordinates and calibrated training recipes are implementation deliverables, not existing tested content. L01 has an exact starting fixture.

## Shared authoring defaults

Use the six actions, event ordering, reward ledger, stage semantics, and seed partitions from the core contracts. Overall rooms target 12x8 to 20x12 tiles; Echo learning lanes target 4x4 to 8x6 unless a tested exception is needed. Per-task horizons begin around 120-200 decisions; L01 uses its exact 160-step fixture. Remaining intrinsic time is observed. Each task must have a meaningful Patch role, a behavioral objective, quick retry, and at most two contextual preparation controls.

All numerical budgets below are uncalibrated starting points. A practice job may be stopped/restarted; do not permanently lock out learning after its cap. Calibrate pacing/learnability, record a bounded reference recipe, and audit unseen seeds. Default reward and compatibility rules are in the simulation/RL contracts; override them explicitly for reward-design/sparse-reward missions.

## Mission directory

| Chapter / proposed lecture | Mission | Learning focus |
|---|---|---|
| C01 - Introduction to reinforcement learning | [L01: Cold Boot](chapter-01-scrapyard.md) | Agent, environment, actions, observable consequences. |
| C01 - Introduction to reinforcement learning | [L02: Shiny Distractions](chapter-01-scrapyard.md) | Training reward versus intended task. |
| C01 - Introduction to reinforcement learning | [L03: The Long Way Round](chapter-01-scrapyard.md) | Delayed reward and discounting. |
| C01 - Introduction to reinforcement learning | [L04: Curious Circuit](chapter-01-scrapyard.md) | Exploration versus exploitation. |
| C01 - Introduction to reinforcement learning | [L05: Two Robots, One Exit](chapter-01-scrapyard.md) | Integrated agent-task loop. |
| C02 - Tabular MDPs and policy evaluation | [L06: Same Place, Different Job](chapter-02-transit-depot.md) | State representation and state aliasing. |
| C02 - Tabular MDPs and policy evaluation | [L07: Slippery Service](chapter-02-transit-depot.md) | Stochastic transitions in a known model. |
| C02 - Tabular MDPs and policy evaluation | [L08: Ghost Routes](chapter-02-transit-depot.md) | Fixed-policy evaluation. |
| C02 - Tabular MDPs and policy evaluation | [L09: What Lies Ahead](chapter-02-transit-depot.md) | State value as future return. |
| C02 - Tabular MDPs and policy evaluation | [L10: Last Train Out](chapter-02-transit-depot.md) | Combined MDP specification and evaluation. |
| C03 - MDP continuation and dynamic programming | [L11: Wrong Turn](chapter-03-switchworks.md) | One-step policy improvement. |
| C03 - MDP continuation and dynamic programming | [L12: Chain Reaction](chapter-03-switchworks.md) | Policy iteration. |
| C03 - MDP continuation and dynamic programming | [L13: Ripple Effect](chapter-03-switchworks.md) | Bellman optimality backups and value iteration. |
| C03 - MDP continuation and dynamic programming | [L14: One Door Closed](chapter-03-switchworks.md) | Replanning after a known model change. |
| C03 - MDP continuation and dynamic programming | [L15: The Switchmaster](chapter-03-switchworks.md) | Integrated dynamic-programming planning. |
| C04 - Model-free prediction | [L16: Return Receipt](chapter-04-courier-quarter.md) | First-visit Monte Carlo prediction. |
| C04 - Model-free prediction | [L17: Midway Message](chapter-04-courier-quarter.md) | TD prediction and bootstrapping. |
| C04 - Model-free prediction | [L18: One Lucky Delivery](chapter-04-courier-quarter.md) | Sampling variability and sample support. |
| C04 - Model-free prediction | [L19: Fading Footprints](chapter-04-courier-quarter.md) | Eligibility traces in prediction. |
| C04 - Model-free prediction | [L20: Blind Delivery](chapter-04-courier-quarter.md) | Using model-free predictions under a sampling budget. |
| C05 - Model-free control | [L21: Unmarked Alley](chapter-05-neon-market.md) | Learning action values through interaction. |
| C05 - Model-free control | [L22: Greedy Too Soon](chapter-05-neon-market.md) | Premature exploitation and exploration scheduling. |
| C05 - Model-free control | [L23: Edge Runner](chapter-05-neon-market.md) | SARSA and on-policy consequences. |
| C05 - Model-free control | [L24: Perfect Plan, Imperfect Pilot](chapter-05-neon-market.md) | Q-learning targets versus behavior policy. |
| C05 - Model-free control | [L25: Market Blackout](chapter-05-neon-market.md) | Integrated model-free control under new starts. |
| C06 - Function approximation | [L26: Familiar Shape](chapter-06-modular-foundry.md) | Shared features and transfer. |
| C06 - Function approximation | [L27: The Missing Detail](chapter-06-modular-foundry.md) | Relevant features and aliasing. |
| C06 - Function approximation | [L28: Every Tile Is Not Special](chapter-06-modular-foundry.md) | Representation choice versus memorization. |
| C06 - Function approximation | [L29: Tight Corners](chapter-06-modular-foundry.md) | Approximation resolution. |
| C06 - Function approximation | [L30: The Moving Warehouse](chapter-06-modular-foundry.md) | Generalization audit across arrangements. |
| C07 - Planning and learned models | [L31: Unknown Machine](chapter-07-clockwork-docks.md) | Learning transition outcomes. |
| C07 - Planning and learned models | [L32: Ghost Shift](chapter-07-clockwork-docks.md) | Planning with simulated experience. |
| C07 - Planning and learned models | [L33: Real or Rehearsed](chapter-07-clockwork-docks.md) | Balancing model information and planning updates. |
| C07 - Planning and learned models | [L34: Outdated Map](chapter-07-clockwork-docks.md) | Model error after changed dynamics. |
| C07 - Planning and learned models | [L35: Dockside Switch](chapter-07-clockwork-docks.md) | Model-based adaptation across stages. |
| C08 - Policy gradients and actor-critic methods | [L36: Fork in the Sky](chapter-08-skybridge.md) | Parameterized stochastic policies. |
| C08 - Policy gradients and actor-critic methods | [L37: Credit at the Exit](chapter-08-skybridge.md) | REINFORCE with delayed outcome. |
| C08 - Policy gradients and actor-critic methods | [L38: Luck Is Not Skill](chapter-08-skybridge.md) | Value baseline and variance. |
| C08 - Policy gradients and actor-critic methods | [L39: Second Opinion](chapter-08-skybridge.md) | Actor and critic roles. |
| C08 - Policy gradients and actor-critic methods | [L40: Skybridge Extraction](chapter-08-skybridge.md) | Integrated policy-based control. |
| C09 - Deep RL I | [L41: Neural Upgrade](chapter-09-neural-arcade.md) | Nonlinear action-value approximation. |
| C09 - Deep RL I | [L42: Memory Carousel](chapter-09-neural-arcade.md) | Experience replay. |
| C09 - Deep RL I | [L43: Frozen Twin](chapter-09-neural-arcade.md) | Target-network stabilization. |
| C09 - Deep RL I | [L44: Signal Combination](chapter-09-neural-arcade.md) | Rich observed feature combinations. |
| C09 - Deep RL I | [L45: The Arcade Vault](chapter-09-neural-arcade.md) | Integrated DQN. |
| C10 - Deep RL II - provisional practical emphasis | [L46: New Addresses](chapter-10-storm-grid.md) | Training coverage and distribution shift. |
| C10 - Deep RL II - provisional practical emphasis | [L47: The Silent Corridor](chapter-10-storm-grid.md) | Sparse reward and exploration. |
| C10 - Deep RL II - provisional practical emphasis | [L48: Training Wheels](chapter-10-storm-grid.md) | Curriculum preparation. |
| C10 - Deep RL II - provisional practical emphasis | [L49: Storm Settings](chapter-10-storm-grid.md) | Training over environmental variation. |
| C10 - Deep RL II - provisional practical emphasis | [L50: Eye of the Storm](chapter-10-storm-grid.md) | Frozen evaluation after preparation. |
| C11 - Mimic / imitation learning | [L51: Follow My Lead](chapter-11-central-tower.md) | Behavioral cloning from demonstrations. |
| C11 - Mimic / imitation learning | [L52: Not a Recording](chapter-11-central-tower.md) | Observation-dependent behavior versus a macro. |
| C11 - Mimic / imitation learning | [L53: Off the Beaten Path](chapter-11-central-tower.md) | Learner-induced distribution mismatch. |
| C11 - Mimic / imitation learning | [L54: Catch Me Learning](chapter-11-central-tower.md) | DAgger-inspired corrective imitation. |
| C11 - Mimic / imitation learning | [L55: The Last Heist](chapter-11-central-tower.md) | Integrated autonomous behavior after demonstration. |
