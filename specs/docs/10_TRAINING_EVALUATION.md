# Training, evaluation, worker protocol, and reproducibility

## Worker responsibilities

A module worker owns mutable learners, real-practice environment copies, learned models, replay buffers, and neural optimization. The main thread owns navigation, visible world, input, audio, and synchronous snapshot inference. All messages contain plain schema-validated data and typed arrays, never class instances with behavior, DOM nodes, functions, or live tensors. Worker messaging uses structured clone/transfer semantics; transferred buffers are detached from their sender. Sources: [S08-S09](18_SOURCES_AND_VERIFICATION.md).

Create with a bundler-safe module URL relative to `import.meta.url`. Feature-detect Worker and handle startup failure. In an environment without required workers, keep landing/settings/saves usable and explain unsupported gameplay instead of silently running a blocking training loop.

## Envelope

Every message includes `protocolVersion`, `sessionId`, `jobId`, `levelId`, `environmentRevision`, `cartridgeId`, `snapshotVersion`, and `type`. Session/job IDs are opaque locally generated identifiers; their entropy does not affect simulation RNG.

Commands: `INIT`, `START`, `PAUSE`, `RESUME`, `CANCEL`, `REQUEST_CHECKPOINT`, `DISPOSE`.
Responses: `READY`, `PROGRESS`, `CHECKPOINT`, `PAUSED`, `CANCELLED`, `COMPLETED`, `ERROR`.

START includes algorithm, encoder/reward version, seed schedule, environment copy, budgets, learning settings, and optional compatible checkpoint. PROGRESS includes actual completed episodes, real transitions, optimizer/model updates, elapsed compute time, and a small sample trace. Do not invent a percent-done estimate if completion has no fixed denominator.

Main thread accepts messages only for the active session/job/environment/cartridge. An old completion cannot overwrite a newly configured or imported model. Validate lengths and finite numeric fields before installing a snapshot. Export snapshot only at a safe update boundary; preserve a known-good prior snapshot until validation succeeds.

## Responsive scheduling

Training runs in bounded chunks, targeting roughly 4-8 ms of worker work before yielding to its event loop, not merely an already-resolved Promise microtask. A minibatch kernel must itself be small enough to avoid long pauses. Check cancellation at episode/step/update boundaries. Send progress at most 5-10 times per second; traces are sampled and capped. These are initial responsiveness targets to benchmark.

PAUSE stops consuming transitions/RNG after the current atomic step/update. RESUME continues, not resets. CANCEL stops the job and returns the last safe checkpoint. If cancellation does not acknowledge within a measured tolerance, terminate/recreate the worker and keep the last acknowledged checkpoint. Navigation and input must never wait indefinitely for a worker.

Tab visibility pauses both world and training. On return, require explicit resume. Do not advance thousands of missed ticks to catch up with wall time. Limit one active job to avoid parallel training contention.

## Seed partitions

Use named domains rather than guessing unrelated numeric seeds:

`hash(rootSeed, contentVersion, levelId, domain, trialIndex)`.

Domains: `train`, `validation`, `audit`, `environment`, `policy`, `initializer`, and separate `cosmetic`. Final concrete hash/PRNG algorithms are chosen and known-answer-tested in M01. Train/validation/audit seed schedules must be disjoint and recorded. Same seed indices can pair algorithms for comparison but cannot remove all stochastic variance.

## Three evaluation contexts

**Visible mission attempt:** player launches a frozen snapshot into the actual room. Outcome comes from real events. Training during a staged adaptation section is explicitly separated before the next frozen attempt.

**Practice validation:** limited trials available to the player to choose a snapshot. These results are not an unbiased final benchmark once used repeatedly for selection.

**Release audit:** fixed recipe after development tuning, fresh seeds, recorded results, no learning or recipe changes during the audit. Public client-side audit seeds are not secret; this is a reproducibility check, not exam security.

## Proposed release calibration gate

For each learning-heavy level, run at least five independent training initializations and ten independent evaluation episodes per trained snapshot (50 trials) after freezing a bounded recipe. Initial design target: aggregate task success at least 80%, no training run below 50%, and no required single lucky trajectory. Treat these thresholds as product reliability targets subject to instructor/game-design review, not statistical guarantees. Deterministic puzzle levels can use a complete enumerated fixture instead.

Store raw outcomes and exact denominators, not only means. Do not assert that every algorithm shows a desired qualitative difference on every random seed. A failed reliability gate requires improving the task, training design, observation, or pacing and rerunning; never bypass the algorithm or choose only favorable trials.

## Training economy and fairness

Expose a bounded number of meaningful choices, not arbitrary hyperparameter search. Practice budgets use transitions/updates, not a fixed hardware-dependent wall-clock wait. Faster computers must not earn more score for the same simulated job. Wall-clock limits protect responsiveness and can offer smaller batches without changing the objective or secretly improving the model.

Starter checkpoints are optional, clearly labeled, and generated by a reproducible offline/local recipe using training seeds only. Default release must still verify a meaningful player-triggered update and an observable behavior change on the relevant task. Never mark starter data as the student's own learning. The simplest levels should start from scratch.

## Checkpoints and traces

Inference snapshot: algorithm family, action order, observation/feature normalization, dimensions, weights/table, tie rule, compatible content/reward version, provenance, and checksum. Exact-resume checkpoint additionally includes optimizer slots/step count, model counts, replay where applicable, learner RNG, exploration schedule, and current safe episode boundary. If a save omits these, label future learning as a restart from weights rather than exact continuation.

A trace contains the initial configuration/seed plus actions and resulting events; verify hashes against reconstruction. Full demo/replay archives are optional, capped, and excluded from normal saves by default. Training and evaluation metrics remain local; no analytics upload is authorized.
