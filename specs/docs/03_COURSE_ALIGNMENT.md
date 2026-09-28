# Course alignment and pedagogical integrity

## Verification status

This is the proposed mapping accepted in the design conversation, not a verified transcription of the lecture PDFs. The course landing page was attempted again during preparation but returned no extractable course content. Do not include the course password in source code, bundled metadata, logs, or a public website. The owner can supply authorized slide files later for an alignment review.

Every content record starts with `alignmentStatus: "proposed"` and `slideEvidence: []`. Only change to `verified` after checking the actual relevant slide pages and recording the source filename/version and page range. Chapter titles below are working topic labels, not claims of exact official wording.

| Chapter | Levels | Proposed lecture focus | Gameplay evidence |
|---|---|---|---|
| 01 Scrapyard | L01-L05 | Introduction | Reward/objective mismatch, delayed consequences, useful exploration. |
| 02 Transit Depot | L06-L10 | Tabular MDPs and policy evaluation | Cargo-aware state, known transition probabilities, fixed-policy estimates. |
| 03 Switchworks | L11-L15 | MDP continuation / dynamic programming | Policy improvement, iterative evaluation, Bellman backups. |
| 04 Courier Quarter | L16-L20 | Model-free prediction | MC, TD(0), sampling variability, TD(lambda), a fixed evaluated policy. |
| 05 Neon Market | L21-L25 | Model-free control | Q values, epsilon-greedy behavior, SARSA versus Q-learning. |
| 06 Modular Foundry | L26-L30 | Function approximation | Shared features, aliasing, resolution, transfer to unseen arrangements. |
| 07 Clockwork Docks | L31-L35 | Planning and learned models | Empirical models, simulated experience, Dyna-Q, model drift. |
| 08 Skybridge | L36-L40 | Policy gradients / actor-critic | Softmax preferences, REINFORCE, baselines, TD actor-critic. |
| 09 Neural Arcade | L41-L45 | Deep RL I | Small MLP, replay, target network, nonlinear combinations. |
| 10 Storm Grid | L46-L50 | Deep RL II - provisional practical emphasis | Coverage, sparse reward, curriculum, varied training, frozen evaluation. |
| 11 Central Tower | L51-L55 | Mimic / imitation learning | Behavioral cloning, covariate shift, corrective demonstrations. |

TD(lambda), the Chapter 10 topics, and the DAgger-inspired extension particularly need instructor confirmation. Preserve stable mission IDs when remapping. Do not insert PPO, inverse RL, recurrent policies, or multi-agent learning merely because they are fashionable.

## Design tests for every mission

1. The player encounters a behavior that depends on the intended concept.
2. The player has a meaningful action that can change or use that behavior.
3. The consequence is visible in the world, not only in a score/chart.
4. The mission can be won through resulting behavior, not matching terminology.
5. A negative control checks that a cosmetic change alone does not produce success.

## Essential distinctions

Prediction improves estimates while the policy stays fixed. Control improves action choice. Planning can use a known model; model-free learning cannot query it. A learned model can be wrong and may change; the environment renderer is not that model. Function approximation is not a synonym for neural networks. A critic estimates value rather than supplies ground-truth labels. An actor can be stochastic with a discrete action set. An imitation policy responds to observation, unlike a recorded action sequence.

Deliberately aliased observations in L06/L27 are labeled diagnostic restrictions. Outside these missions, do not inadvertently hide relevant cargo, hazard phase, or remaining task time and then describe the task as a fully observed MDP. A feature representation can still approximate imperfectly; do not promise that it is lossless.

## Performance is not mastery

A level clear is an in-game achievement. It does not prove conceptual understanding, a causal learning effect, or secure academic assessment. Local traces can support instructor discussion, but no learning-outcome claim is established until a separate educational evaluation is designed and conducted.

## Instructor remapping procedure

Compare actual lecture content with this table, record evidence and mismatches, change only affected learning goals/allowed cartridges and chapter labels, retain mission IDs and saves where possible, update tests and teaching cues, and record a content version. Recalibrate any changed mission. Never reclassify previously generated content as slide-verified merely because its topic sounds plausible.
