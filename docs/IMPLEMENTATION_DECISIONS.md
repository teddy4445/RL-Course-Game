# Implementation decisions and deviations

## D01 - initial playable scope

The project began with one chapter and five authored rooms. As of 2026-09-27, Chapters 1-5 provide 25 playable missions; the remaining 30 mission briefs are still a roadmap, not a completion claim. `specs/` contains the full design and campaign briefs; root ROADMAP.md controls task order.

## D02 - rendering stack

The prior plan selected Phaser + Vite. Registry access/package installation was unavailable in this environment. Rather than invent a successful install or depend on a CDN, this reference branch uses native Canvas2D and ES modules with a tiny Node static server/build copier. There are no runtime packages. The renderer is isolated in `src/ui/renderer.js`, so a later migration can preserve the pure simulation, data, learner and saves. No claim that Phaser/Vite is installed, tested or used is made.

## D03 - art

Generate original SVG geometry with deterministic frame placement, then export transparent PNGs and named atlases. Previous generated images are inspiration, not production atlases. The actual browser screenshot is the single gameplay reference for this kit. The vector look is deliberately simpler than painted concept art.

## D04 - shared simulation and handoff

L01 preserves the earlier exact 12 x 8 F01 fixture. L02-L05 use a physically separate Echo-only service lane and Patch-only machinery bay. Patch latches the gate and receiving console before practice; those conditions cannot change mid-trial. Excluding Patch's independent lane position from Echo's observation is therefore intentional, not hidden missing state. L03 adds a pushable crate, L05 adds a physical core retrieval.

After successful delivery on/facing the receiver, one adjacent-cell alignment places Echo exactly on its exit. This is a disclosed fixed post-task staging action, not a learned path or a hidden solution. The learning episode has ended, while the cooperative heist can continue until Patch reaches its exit.

## D05 - finite tasks and administrative cutoff

L01 has a 160-decision horizon. L02-L05 have no intrinsic clock (`horizonSteps: null`); the courier rollout is administratively capped at 128 actions. Truncated training bootstraps rather than treating the cutoff as a terminal reward. Hazard phase is represented; irrelevant joint decision time is not. This is an explicit C01 data-contract extension, not silent adherence to a stricter earlier finite-horizon-only schema.

## D06 - genuine but bounded learner

Q-learning underlies L02-L05; the first lecture teaches the agent/reward/delay/exploration relationship, not the later algorithm vocabulary. Alpha 0.4; discount 0.45 (near) or 0.96 (far). Curious exploration starts at 0.85 and decays to approximately 0.21 within each 100-episode worker batch, with a floor of 0.12. Familiar exploration is exactly zero. Each Practice click uses 18 batches, 1,800 actual episodes, deterministic seeded randomness. Batch epsilon restarts each batch; do not describe it as a single global annealing schedule.

The initial 0.62 exploratory setting sometimes remained stuck on easy scrap in L03/L04. It was changed to 0.85 after direct worker-protocol tests. This was an explicit coverage/balance change, not a successful policy injection or a picked winning seed. Evidence records eight training seeds per condition; a fresh holdout cohort is still needed before claims of general robustness.

L04's unhelpful prior is obtained from 35 real repetitions of a short scrap-collecting action sequence. It is openly disclosed. It contains no successful delivery. Reward/discount edits reset the cartridge; exploration edits preserve compatible experience. Inference uses a frozen table with epsilon zero and seeded tie-breaking.

## D07 - prototype learning outcomes

L02's scrap-heavy reward may still deliver after collecting all scrap. Such a run legitimately clears; the contrast is efficiency/behavior, not scripted refusal. L03 near/far and L04 familiar/curious alter learning configuration but never change the map or objective. Level completion tests actual delivery, both exits, prepared handoffs and (L05) the relay core.

## D08 - audio and scope

Reuse forty media files from the user's previously delivered original synthesized pack, plus its provenance references. Screen themes and three synchronized C01 stems are integrated with selected effects. The ambient loop and a few prepared screen cues are supplied for future integration; not every delivered file is used. No new audio generation or outside sample pack was used.

## D09 - verification environment

Localhost navigation is blocked by the managed Chromium environment. This policy was not changed. Browser UI checks therefore use actual source in isolated factories with local-byte asset injection and an in-memory storage adapter. A classic Blob Worker runs the same learner/worker code; module-worker loading from the opaque test page failed, and is not claimed tested. Actual ESM worker code is separately imported and exercised using Node worker_threads with a transport shim. Native HTTP-origin storage, browser ESM worker startup and GitHub Pages deployment remain explicit gates.

## D10 - course and release

Lecture mapping remains proposed until slides are inspected. Human playtesting, final audio balance and student-hardware performance are unperformed. This build starts development; it is not a production-ready 55-level release.

## D11 - consolidated Codex handoff

All 155 unique audio cues are now physically present, with one selected encoding per cue and a root-relative catalog at public/assets/audio/catalog.json. The existing forty-cue adapter and current game behavior are unchanged. Full campaign briefs live in specs/. One root AGENTS.md and CODEX_START_HERE.md replace the previously competing start documents. No later-level runtime implementation or new browser verification is implied by consolidation.

## D12 - Phase 1 routing, cartridge compatibility and release boundary

Keep the native Canvas2D/ES-module architecture. Use hash routes so a static project site can reload and traverse landing, menu, district selector, per-district mission selection, settings and unlocked missions without a server fallback. Credits were removed at the user’s request. The mission-selection previews are generated from the canonical runtime geometry instead of loading production review PNGs.

Visible deployment receives an isolated copy of the learned Q table and never trains that copy. Saved cartridges now record a compact contract derived from the tabular runtime version, level content version, observation/encoder IDs, reward ID, reward configuration and discount configuration. A missing contract from this known Chapter 1 handoff is accepted once and upgraded on the next save; an explicit mismatched contract discards only the incompatible learned table. Curiosity changes and ordinary retry preserve compatible experience, while priority/future changes retain the existing deliberate reset behavior.

The static build is an explicit allowlist rather than a recursive project copier. Runtime source, the renderer atlases/PNGs, three menu SVG frames, five UI SVGs and the selected runtime audio adapter are included. Authoring references, full source frames, the asset inspector, docs/specs/evidence and development probes are excluded. Playwright 1.62.1 is the only new development dependency; runtime dependency count remains zero.

## D13 - dependency-free M04 neural feasibility backend

The M04 risk spike uses a deliberately small pure-JavaScript dense network rather than adding TensorFlow.js or a runtime CDN. It implements explicit forward/backpropagation, Adam, Huber-loss DQN updates with replay and target-network separation, and softmax cross-entropy behavioral cloning. Snapshots contain numeric arrays and can be moved across the existing worker boundary. The browser probe measures responsiveness and cancellation on a tiny fixture; it does not establish performance on student hardware or authorize calling Chapter 2 a neural-learning chapter.

## D14 - Chapter 2 model boundary and progression

L06-L10 author fixed, disclosed blueprint policies so players can inspect state representation, stochastic transitions, fixed-policy values, future return and a finite deadline. `src/agents/policy-evaluation.js` enumerates exact stochastic branches and iterates Bellman expectations, while sampled visible delivery calls the same `src/sim/core.js` transition kernel. These blueprints are curriculum subjects, not injected learned winners or algorithm-selection victory conditions. Evaluation results and selected starts are frozen before delivery.

Chapter 2 keeps the established top-down camera and production sprite language, adding a Transit Depot palette, renderer labels, a train countdown and only the C02 stems selected from the supplied catalog. The original local-storage key is retained for backward compatibility while its validated schema expands through L10. Runtime module URLs carry the `0.2.0` query version so browsers that cached the pre-Chapter-2 module graph cannot combine new HTML with old JavaScript.

## D15 - Chapter 3-5 algorithm boundary

Chapter 3 is the only new slice allowed to optimize from an exact known transition model. `policy-evaluation.js` enumerates actions through the same pure transition branches as visible play, runs real policy/value iteration, and freezes a compact reachable action policy for dispatch. L11 compares explicit candidate policies; no hidden optimal route is injected. Chapter 4 never improves its behavior policy: MC, TD(0), and TD(lambda) consume sampled experience and update values only, guarded by an immutable policy hash. Chapter 5 uses actual sampled-action SARSA for L23 and ordinary off-policy Q-learning for the other missions. L23/L24 share geometry and reward so the update difference is not confounded by a different room.

Finite Chapter 5 practice jobs are capped by authored episode/horizon products below 6,000 transitions. Sequential courier items are part of the encoded observable state, and only the next declared item can be collected; this keeps the task Markov and the exact/control state spaces bounded without scripting the winning action. Visible dispatch always clones/freezes a compatible plan, value snapshot, or Q table. Retry retains it; a state/reward/model/control contract change invalidates it.

## D16 - district-first shell, generated branding and chapter treatments

Mission selection now has two explicit layers: five district cards, then five mission cards inside the chosen district. The current saved mission selects the lift-menu palette and copy, so returning from Switchworks, Courier Quarter or Neon Market changes the menu atmosphere without creating separate shells. Credits and the old footer were removed. The compact navigation logo and hero title are original transparent raster assets generated for this repository and stored under `public/assets/ui/`; they supplement rather than replace the supplied gameplay atlases.

The first five chapter stem groups are exposed through the existing one-mixer manifest and remain lazy: changing district does not decode the full 155-cue catalog. Module query versions and package metadata moved to `0.3.0`, while the old local-storage key and schema version stay compatible with Chapter 1-2 saves. The release allowlist includes only the two new brand images and runtime-required Chapter 3-5 modules/assets; authoring scripts, documentation, evidence, previews and the asset inspector remain excluded.

## D17 - Chapters 6-8 advanced learners

Chapter 6 uses linear semi-gradient SARSA over declared feature encoders, including one deliberate cargo-blind alias. Chapter 7's Dyna updates draw only from empirical transition/reward counts produced by real shared-kernel experience; machinery revisions explicitly retain, age or reset that learned model. Chapter 8 uses stable softmax policies with fresh on-policy trajectories, with actor and critic parameters kept separate where declared. These snapshots are frozen during visible delivery and bounded in saves. They do not call the true simulator as an invented learned model.

## D18 - compact campaign DQN and player-only cloning

Chapters 9, 10 and the original Chapter 12 reuse the dependency-free dense-network backend as actual campaign DQN. Replay contains only experienced shared-kernel transitions, the target network changes only on explicit copies, optimizer/replay/counter state is saved, and each job has a cumulative real-transition budget. The learner's Mulberry32 state is part of its validated checkpoint so cancellable 20-episode module-worker batches are bit-for-bit equivalent to one uninterrupted seeded job; the saved generator state influences practice sampling only and is never an observation or an inference input.

Chapter 11 behavioral cloning accepts only player-format pre-action observations and actions from successful runs. Failed demonstrations are discarded, multiple player lessons accumulate, and the frozen neural clone acts from current observations rather than replaying a recorded route. The audit uses clearly declared fixture lessons outside the runtime; no expert-route generator ships in the game.

## D19 - District 12 is an original game finale

The supplied curriculum ends at Chapter 11 / L55. At the user's request, L56-L60 form a separately labelled `original-extension` rather than being misrepresented as lecture-aligned content. The Eclipse Warden is rendered in Canvas2D from animated rings and shields so no unavailable boss asset is fabricated. Its shield count derives from real ordered deliveries in the shared objective evaluator; L60 additionally requires Patch to collect the city heart and physically reach the dawn gate. The phase-six final laser was balanced to active phase 3 after both Node and real-Chrome development-seed runs, while its phase remains observable and its transition logic remains unchanged.

## D20 - Progressive Patch rooms and recoverable patrol pressure

Preserve L01-L07 as the compact opening while expanding L08-L60 on the Patch side only. Room count increases at district-era boundaries from two through seven; alternating doors and obstacles change the physical route without rebuilding the autonomous Echo grid. Every security lever is an explicit deployment prerequisite and a Patch checkpoint. The final extraction corridor stays behind the original heavy shutter so preparing Echo and finishing the physical heist remain connected jobs.

Grounded patrols use deterministic shared-kernel movement on selected milestone maps. Contact increments a strike and returns Patch to the latest checkpoint while retaining opened doors, carried/delivered mission state, and the frozen Echo attempt; it does not set the mission failure flag or award progress. This creates recoverable action pressure instead of repeatedly discarding genuine learning work. Patrols and security gates are marked `patchOnly` and excluded from Echo observations. Expanded levels retain `learning.echoGeometry` so existing feature normalization follows the unchanged Echo domain rather than the larger presentation map.

## D21 - Independent cameras and stage-specific relay learning

Use two simultaneous Canvas2D cameras rather than fitting both actors and every Patch room into one shrinking world view. Patch's camera follows only the authored current room; Echo's camera fits the unchanged cyan learning domain. Portals are physical Patch-only gates that open only after the corresponding genuine Echo relay delivery. L08-L30 use two deployments and L31-L60 use three; L01-L07 stay a compact onboarding ramp while still using the two-panel presentation.

Each relay stage declares its required Patch switches, dock, launch state and hazard phase. Practice, validation and visible deployment continue through the shared transition kernel. Retries preserve compatible experience for the same stage, but advancing to a new launch/phase contract clears the active learner and requires a fresh bounded run. Non-final delivery may use the real receiver as a test receiver without setting `receiverReady`; only Patch's final console arms the actual mission delivery. The deployment horizon counts active Echo decisions only, never Patch traversal between relays or post-delivery extraction.

The persistent role legend and large route banner were removed. Their useful information moved into the changing objective, the dock's `CHOOSE → TRAIN → DEPLOY` display and an optional compact mission briefing. District mission cards deliberately omit map previews so room geometry remains a discovery rather than selector chrome. Patrol placement is derived only from contiguous authored floor runs, and the browser driver models patrol state with the same pure transition function when verifying dynamic reachability.

## D22 - Adaptive cartridges, physical relay power and the dawn epilogue

Every learning mission now layers player-chosen cartridge properties onto its authored district control. Sensor-suite choices genuinely change Echo's encoded observation, reward profiles change only the real practice reward, and practice-budget choices scale the bounded number of episodes or exact-model sweeps. The default `Mission telemetry / Balanced signals / Standard` combination preserves the prior learning contract. Observation or reward changes invalidate incompatible learned values; a budget change preserves compatible experience but requires a fresh completed relay preparation. Fixed-policy districts omit sensor selection where it would not affect the disclosed model, and behavioral cloning remains driven only by successful player demonstrations. These controls are part of the saved cartridge contract and are consumed by the same simulation, workers and visible frozen delivery.

From L02 onward, Patch must physically collect a room-specific relay cell and install it in a socket before the associated Echo dock can activate. Multi-stage levels require one cell per relay. These `patchOnly` entities use the existing shared pickup/delivery transitions, are explicit stage requirements, and never enter Echo's observation or reward. The early difficulty ramp now grows from one compact relay at L02 through two Patch rooms at L03-L04 and three rooms with two separately prepared Echo relays at L05-L07; the established later two-to-seven-room campaign then continues. Closed portals are camera boundaries, so the Patch panel spends its space on the current accessible room instead of reserving an obsolete Echo lane.

A one-time, saved prologue appears before L01 and combines the opening story with direct controls and the recurring `find power → configure/train → deploy Echo → continue` rhythm. It is skippable by immediately entering the heist and never becomes a compulsory quiz or training dashboard. Each district's first mission announces its cumulative mechanic through a compact, optional system control in the game header.

After genuine L60 completion, the game routes to a dedicated static epilogue with a locally shipped, AI-generated dawn background and an approximately 240-word animated story. The animation pauses on hover/focus and becomes a static readable scroll under reduced-motion preferences. The generated bitmap has no runtime network dependency, and direct access to the ending remains completion-gated. The ending does not award or simulate progress; it is presentation after the shared objective evaluator has already recorded the final clear.


## D23 - unified workbench, interaction affordance and bounded empirical persistence

R is the canonical access path for Echo preparation and remains available at every mission state. Physical relay markers may retain simulation compatibility, but they no longer own a second training UI. The workbench puts actions/settings before model detail and derives missing-capability readiness from the same physical cartridge state used by `canTrain` and `canDeploy`.

Renderer E prompts call the shared `patchInteractionHint` rule. Impossible but discoverable interactions are red; completed one-shot interactions disappear. Rollout horizons default to Echo-action time, with only explicitly mission-wide clocks consuming time during concurrent play.

District 7 onward uses shared-kernel grounded Echo hunters. Their motion and active phase are observable late-game state, and capture is a real negative terminal event during practice, evaluation and deployment. Dyna persistence retains the entire learned Q policy but bounds the auxiliary saved empirical model to the 512 most recent actually observed state-action pairs. No synthetic transitions are introduced; continued practice repopulates older experience through real simulation samples.

## D24 - Chapter 1 capability tutorial and always-runnable weak models

L01-L05 deliberately replace presentation-only readiness locks with inspectable, runnable model states. R opens the same workbench at every point, Train and Run remain available, and an incomplete model is allowed to fail safely instead of being hidden behind a `CAPABILITY MISSING` gate. Physical Relay cells now become capabilities only when Patch carries them to matching Sockets. The installed capability changes the configuration consumed by practice, frozen checks and visible delivery; it is not an inventory label or a victory switch.

L01 supersedes the old fixed boot check with real Q-learning. Its initial action space omits EAST while the required cargo lies east of Echo, making the first frozen attempt structurally incapable of delivery without scripting a failed route. The guided sequence asks the player to inspect, train and run that honest weak model, install Sunrise Tread through the Patch-side Socket, then retrain. The worker learns the repaired action space and the successful frozen delivery opens Patch's extraction gate through the shared objective evaluator. L02-L05 apply the same physical cause-and-effect to action, future-return, exploration and reward/practice capabilities, while retaining only levers that open an actual portal.

The Chapter 1 exception is scoped to L01-L05. Later districts retain their authored cartridge forks and learner-specific readiness rules. Save validation allows the two sequential L05 Socket capabilities, invalidates incompatible learned snapshots when a state/action/reward contract changes, and continues to retain compatible experience. This decision supersedes the L01 fixed-check portions of D04-D07 and the missing-capability training lock described in D23; it does not alter the single shared simulation boundary or authorize oracle policies.

## D25 - fixed practice batches, contextual help and exclusive Echo turns

Practice volume is no longer a player-selectable property. Every Train action runs the level's fixed authored episode/sweep batch; repeated training remains genuine accumulated experience, but a larger budget is not presented as the puzzle solution. Retire `budget-brief` and `budget-deep` from all current maps/forks and from future campaign authoring. Keep their capability IDs inert only long enough to migrate old local saves by dropping those fields. This supersedes D22's selectable practice-budget contract while preserving its state and reward choices.

Keep the main R surface focused on choices and actions. Put the algorithm, raw observation, legal actions, policy visualization, hyperparameters and installed-capability history behind a `?` inspector. Add a per-level, per-stage Help view that derives the required capability and recommended visible controls from canonical level data, explains why they solve that learning problem, and never applies the answer or alters the worker. L02 has one explicit override because its authored bad reward default is itself the lesson: Help must recommend delivery priority after explaining the missing EAST action.

Visible Echo deployment is an exclusive autonomous turn. The UI clears queued Patch input at launch, sends WAIT as the Patch action while Echo is active, disables touch movement and exposes the pause visually/accessibly. Shared transition logic is unchanged—practice, evaluation and visible play remain honest—but the browser control layer prevents concurrent Patch interaction races. Level start restores only that level's validated cartridge, clears deployed snapshots and input queues, and advancing an Echo relay continues to clear stage-specific learned state as established in D21.

Apply this interaction contract to L01-L60. Later missions retain their existing progressive two-to-seven Patch rooms, two/three Echo relays, capability forks, hunters and algorithm progression; removing generic budget decoys makes those decisions more specific rather than flattening their difficulty.

## D26 - Level 6 uses a non-progressing weak-model rehearsal

Extend the Chapter 1 inspect/train/run principle to the first decision of L06 without removing the physical relay contract. Before L06 satisfies `canDeploy`, Run launches the current fixed policy as a preview in the shared simulator and freezes Patch input exactly like a real deployment. The browser controller snapshots and restores the complete episode at the end, before relay advancement is evaluated, so even a successful preview cannot open a door, mark a stage delivered or alter Patch progress. Normal `launch` remains physically gated; the bypass is explicit through `launch(state, {preview: true})` and is covered separately.

The cargo-aware representation is an effect of Pocket Sensor and cannot be selected from the workbench before that physical capability is installed. Put both mutually exclusive L06 scanner cartridges in Patch's first room and order the first route as cartridge choice, Relay cell → Socket, portal lever, workshop switch, then Echo relay. A wrong physical cartridge remains consequential for the current attempt, but T/Retry clears that per-level saved fork so the mission cannot become permanently unwinnable.

Bump the L06 content contract and reset controls as well as learned state/capabilities when any saved contract is incompatible. This prevents a stale saved cargo representation from bypassing the repaired physical fork. Cache queries advance together to 1.5.1 so the local browser and module worker cannot mix the repaired controller with older cached simulation modules.

## D27 - executable mission contracts and late-game relay ramp

Author each mission from an explicit development-only solution program rather than treating `patchRoute` as informal documentation. A program contains ordered Patch interactions, physical capability acquisition, the level's actual learning mode and authored batch, one Train/Run pair per Echo stage, the portal affected by that run and final Patch extraction. Generate the programs beside review material under `production/solutions/`, validate them against canonical runtime JSON, and make browser automation consume their route. Do not copy them into `dist/` or let runtime code read them; they prove and test authoring but never provide Echo actions, a learned snapshot, mission progress or an oracle policy.

Make run count part of the authored difficulty contract: two relays through L30, three at L31-L39, four at L40-L50, and five at L51-L60. A relay is not just an extra button press: it owns an Echo room, Patch cell/socket pair, stage prerequisites, bounded training result, frozen visible run and the Patch portal that run opens. Keep the Chapter 1 Socket tutorial custom. Preserve the current district learner and capability in every later stage so the new physical length exercises the mechanic already introduced by that district.

R and Train remain available before Patch completes a later relay. A Run button still requires a real compatible snapshot; when the physical/capability contract is incomplete, that snapshot can run only as a protected rehearsal and the controller restores the episode before stage advancement. This extends D26 to all learning missions and supersedes D23's missing-capability training lock. A lever with `opensAfterEcho` must not satisfy the portal's own E fallback: the shared interaction rule checks that flag, preventing Patch from bypassing the required autonomous delivery.

Treat readiness failures found by the executable/browser contract as balance evidence. L60's fifth DQN stage produced 0/12 frozen deliveries under 10,000 real transitions, so its authored batch increases to 650 requested episodes with a cumulative 16,000-transition cap. The worker, replay, target copies, readiness threshold and frozen evaluation remain unchanged; this is more bounded genuine experience, not a forced success. Cache queries advance to 1.6.0 and package metadata to 0.13.0 while the save schema/key remain compatible.

## D28 - The root route is an optional cinematic landing page

Use `#/` as a scrollable public-facing landing page while preserving `#/menu` as the saved-game elevator menu. The hero must offer immediate entry into the game; the reinforcement-learning motive and story sections are optional navigation, not compulsory teaching screens, quizzes or a second progression system. Describe the actual runtime contract plainly: Patch changes physical capabilities and visible settings, a genuine local learner practices against the shared simulation, and visible deployment freezes that result.

Ship three final raster scenes locally: an opening rooftop heist, a visual learning loop and a twelve-district story journey. Generate them from the established Patch/Echo finale identity, keep all interface text in semantic HTML, provide useful alt text, disable decorative motion under reduced-motion preferences, and include the assets explicitly in the static allowlist. Do not add an image CDN, runtime generation, analytics or a new framework. The package advances to 0.14.0 and entry cache queries to 1.7.0 without changing the save schema.

## D29 - Pages deploys the allowlisted build through GitHub Actions

Do not commit `dist/` or publish the repository root. A `main` push runs locked source/content/solution/Node validation, creates `dist/` with the existing build script, asserts that the entry point, `.nojekyll` and intended CNAME exist and development paths do not, then uploads that directory with GitHub's official Pages artifact/deployment actions. Use a single `github-pages` concurrency group and the minimum contents/pages/OIDC permissions.

Keep `CNAME` as the exact future hostname `eh.teddylazebnik.com` and copy it into the artifact, but do not claim that file alone configures an Actions-based Pages custom domain. Repository Pages settings and the external DNS CNAME to `teddy4445.github.io` remain explicit later steps. A failed push under an unrelated cached GitHub identity is an authentication blocker, not a deployment pass and not permission to switch accounts silently.
