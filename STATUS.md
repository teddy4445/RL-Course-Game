# Current status - playable twelve-district campaign

## GitHub Pages release preparation - 2026-09-28

The repository now has an official GitHub Pages Actions workflow at `.github/workflows/pages.yml`. Pushes to `main` install the locked npm dependency on Node 22, run syntax/content/solution/Node validation, build the explicit static allowlist, verify `index.html`, `.nojekyll`, `CNAME` and development-path exclusions, upload `dist/`, and deploy through the `github-pages` environment. The workflow uses the current official `checkout@v7`, `setup-node@v7`, `configure-pages@v5`, `upload-pages-artifact@v4` and `deploy-pages@v4` contracts with only `contents: read`, `pages: write` and `id-token: write` permissions.

Root `CNAME` contains exactly `eh.teddylazebnik.com` and the build copies it into the artifact. GitHub's Actions-based Pages flow still requires the future custom domain to be entered in repository Pages settings; the intended DNS record is `eh` CNAME → `teddy4445.github.io`, without `/RL-Course-Game`. Until DNS and the Pages custom-domain setting are connected, the intended default site URL is `https://teddy4445.github.io/RL-Course-Game/`.

Observed release checks:

- `npm run build`: PASS - 172-file / 82.04 MiB static artifact including `index.html`, `.nojekyll` and the exact CNAME; `tests/`, `docs/` and `production/` remained absent.
- `npm run check`: the immediately preceding landing release passed all source/production matrices before the deployment-only workflow/CNAME change. It is not relabelled as a post-deployment pass.
- GitHub repository API: public repository `teddy4445/RL-Course-Game`, default branch `main`, Pages not yet enabled (`has_pages: false`, Pages endpoint 404 before publication).
- Local release commit: created successfully with the maintained source, runtime assets, tests, specifications and workflow. Duplicate raw audio, generated evidence and unused root collages are explicitly ignored rather than published.
- `git push origin main`: BLOCKED - GitHub returned HTTP 403 because the machine credential is authenticated as `TeddySkana`, which lacks write access to owner repository `teddy4445/RL-Course-Game`. The available browser session is signed out. No account, credential or permission was changed, and no online deployment is claimed.

Remaining gate: authenticate this machine/browser as an account with write/admin access to `teddy4445/RL-Course-Game` (or grant `TeddySkana` that access), then push `main`, select **Settings → Pages → Source: GitHub Actions**, rerun the workflow if its first push preceded enablement, and verify the default URL over HTTPS. Configure `eh.teddylazebnik.com` only after its DNS CNAME is ready.

## Cinematic public landing page - 2026-09-28

The root `#/` route is now a full, responsive public landing page rather than a single-screen splash. Its first viewport has direct Play/Enter actions, a cinematic heist hero, campaign scale, and keyboard-visible interactions. Optional smooth-scroll navigation leads to a game-first reinforcement-learning explanation and a story section covering Patch, Echo, the twelve districts and the Eclipse Warden; reduced-motion mode disables decorative movement. None of the explanatory content blocks entry into the game or becomes a quiz/tutorial gate.

Three coordinated, locally shipped AI-generated images were created with the built-in image generator using the existing finale art as a character/style reference: `public/assets/ui/landing/hero-heist-v1.png`, `learning-loop-v1.png`, and `story-journey-v1.png`. They contain no baked UI text, runtime calls or external dependencies. The build allowlist includes only these three final assets, increasing the static artifact from 168 files / 75.16 MiB to 171 files / 82.04 MiB. Package metadata advanced to 0.14.0 and entry CSS/main cache queries to 1.7.0; saves remain compatible.

Fresh observed verification on Windows, Node.js v22.18.0, npm 10.9.3, Playwright 1.62.1 and installed Chrome 153.0.8010.54:

- Manual in-app-browser inspection at `http://127.0.0.1:4173/?build=landing-v170#/`: PASS at 1280×720 for the hero, learning and story sections. The generated art cropped cleanly, text remained legible, scroll navigation worked and the game CTA remained immediate. This is local inspection, not a deployed-site or human-preference result.
- 375×812 real-Chrome inspection: PASS - hero copy/buttons remained visible, generated art retained Patch/Echo context and the document had no horizontal overflow.
- `npm run check`: PASS - 50 syntax checks, 19,348 content/asset/audio/animation checks, 5,955 executable-solution checks, 100/100 Node tests, a 171-file / 82.04 MiB allowlisted build, and all 14 reported real-Chrome source/production results. The browser section completed in 390.5 seconds. It covered landing headings/assets/scroll controls, focus/hover/pressed states, mobile overflow, Chapter 1 entry and the complete existing source/production campaign matrices below `/echo-heist/`.
- `npm run validate:handoff`: PASS after the documentation update - 1,171/1,171 structural checks, 155 audio cues, 11 supplied chapter briefs, 55 supplied mission IDs and 306 relative Markdown links. It remains structural validation only.

The first focused Chrome attempt failed an inherited focus-visible assertion because the new mouse-driven scroll check ran before keyboard focus was tested. The test order was corrected so keyboard focus, hover and pressed states are verified before mouse scroll navigation; no visual style was weakened to satisfy the test. No commit, push, publication, deployment, credential or account action occurred.

## Finale resume routing repair - 2026-09-28

After L60 was completed, the main-menu Continue action incorrectly restarted L60 because the bounded `currentLevel` value remains `L60` at the end of the campaign. Continue now checks the persisted L60 completion flag and routes to `#/finale`; incomplete campaigns still resume their exact saved mission. The main-module cache query and package version advanced to 1.6.1 and 0.13.1 respectively.

Fresh observed verification on Windows, Node.js v22.18.0, npm 10.9.3, Playwright 1.62.1 and installed Chrome 153.0.8010.54:

- `npm run lint`: PASS - 50 JavaScript syntax checks.
- `npm test`: PASS - 100/100 Node tests.
- `ECHO_BROWSER_ONLY='real DQN, player demonstrations, and the Eclipse Warden finale' npm run test:browser`: PASS - the focused real-Chrome scenario completed L41, L51 and all five L60 relays, displayed the finale, returned to the city and lift, pressed Continue, and displayed `A city wakes.` again. The selected scenario completed in 57.2 seconds; 12 unrelated browser scenarios were deliberately skipped, so this is not a new full-suite pass.
- The same command rebuilt the allowlisted static artifact: PASS - 168 files / 75.16 MiB, excluding authoring references and test tools.

This is a local Chrome regression pass, not a deployed-browser, cross-browser or novice-playtest result. No commit, push, publication, deployment, credential or account action occurred.

## Executable mission solutions and progressive Echo relays - 2026-09-28

All 60 missions now have a machine-readable winning program in `production/solutions/Lxx.json`, generated from the same canonical entities and relay definitions as the game. A program records the ordered Patch targets, carried Relay cell → Socket installations, required capability, district learner, fixed authored training batch, each frozen Echo run, opened portal and final extraction. `scripts/validate-solutions.mjs` executes the contracts as authoring state machines and rejects missing/unreachable targets, wrong carry order, absent capabilities, premature training, bypassable relay gates, route drift, missing extraction or a run count below the campaign band. The release build does not copy these solution files, and runtime code never consumes them as a policy.

The difficulty ramp is now explicit. Districts 4-6 retain at least two Echo runs per mission; L31-L39 require three; L40-L50 require four; and L51-L60 require five. Each added run has its own 20×20 Echo room, Patch power pair, real training pass, frozen deployment and Echo-powered Patch portal. Chapter 1 retains its focused Socket-capability onboarding. L05 again requires Home Beacon for the first run and Curiosity Coil for the second rather than silently reusing one capability.

R now opens a trainable Echo workbench before every later physical prerequisite, not only in L01-L06. A trained incomplete model can be run as a non-progressing rehearsal: Patch input pauses, the shared simulator executes the frozen snapshot, and the exact pre-run world is restored at delivery/failure/timeout. Missing Patch work therefore remains visible without granting a door, checkpoint or stage. Run stays disabled until one genuine training result exists, preventing empty advanced snapshots from being dispatched. The same pass closed a gameplay bypass: a lever marked `opensAfterEcho` no longer lets Patch press E on the portal and cross before Echo succeeds.

The first expanded finale browser run exposed a genuine L60 balance failure: relay 5 produced 0/12 frozen deliveries under the previous 10,000-transition DQN cap. The final mission's authored batch is now 650 requested episodes with a cumulative 16,000-real-transition maximum. No readiness threshold, outcome, policy or test was bypassed; the complete source finale rerun then cleared all five relays and the Warden normally.

Fresh observed verification on Windows, Node.js v22.18.0, npm 10.9.3, Playwright 1.62.1 and installed Chrome 153.0.8010.54:

- `npm run author:twin-grid`: PASS - generated/synchronized 60 canonical levels, production review mirrors and 60 solution programs.
- `npm run validate:content`: PASS - 19,348 level/asset/audio/animation checks plus 5,955 executable solution-program checks.
- `npm test`: PASS - 100/100 Node tests, including structural failure without EAST, non-bypassable Echo portals, pre-contract training availability and the 2/3/4/5-run progression.
- `npm run check`: PASS - 50 syntax checks, 19,348 content checks, 5,955 executable-solution checks, 100/100 Node tests, a 168-file / 75.16 MiB allowlisted build, and all 14 reported real-Chrome source/production results. Its browser section completed in 382.1 seconds. Source Chrome cleared Chapters 1-8, L41 with four DQN runs, L51 with five player-demonstration clone runs, and L60 with five bounded DQN runs; production passed native module workers, persistence and assets below `/echo-heist/`.
- `npm run test:rl`: PASS as execution. L01 and L02 timed out 8/8 without EAST and delivered 8/8 after Sunrise Tread; L06 remained 0/8 position-only versus 8/8 cargo-aware; the sampled L60 frozen DQN delivered in 20 actions after exactly 16,000 real training transitions. Recorded stochastic timeouts elsewhere remain evidence, not relabelled successes or universal mastery.
- `npm run validate:handoff`: PASS - 1,171/1,171 structural file/link/hash checks, 155 audio cues, 11 supplied chapter briefs, 55 supplied mission IDs and 306 relative Markdown links. This is structural validation only.

One intermediate full Chrome run is retained honestly: everything except L60 relay 5 passed, while that relay reported 0/12 frozen deliveries and remained locked. The authored DQN batch was increased and the complete unfiltered command was rerun from the start to the passing result above. This is local automated Chrome evidence, not a live deployment, cross-browser certification or human difficulty study. No commit, push, publication, deployment, credential, account or external-service action occurred.

### Remaining gates and next bounded task

Run a first-time-player study spanning L06, L31, L40, L51 and L60. Record whether the solution chain is discoverable without reading the development contracts, whether a failed early rehearsal explains the missing Patch capability, and whether three/four/five Echo runs feel progressively harder rather than repetitive. Tune individual stage geometry, hazards, copy or fixed batches only from that evidence; do not expose the solution files to the shipped runtime.

## Level 6 immediate rehearsal and recoverable completion - 2026-09-28

L06 now lets the player open R, train, and run Echo immediately. Before Patch completes the physical relay contract, Run is explicitly a safe rehearsal: it executes the current real fixed policy in the shared simulation, pauses Patch, and restores the exact pre-run world when Echo delivers, times out or fails. A rehearsal therefore cannot open `patchPortal2`, advance the Echo stage, or fabricate mission progress. The initial position-only run visibly demonstrates the authored state-aliasing problem. `Position + cargo` remains disabled until Patch physically installs Pocket Sensor, so the UI cannot bypass the cartridge puzzle.

The L06 Patch route is now readable and winnable without a circular scavenger hunt. Floor Counter and Pocket Sensor are both in the first orange room, the objective/help copy points to Pocket Sensor, and Relay cell 1 → Socket 1 precedes the first portal/switch sequence. The content version advanced to 5.3.0. An incompatible older L06 cartridge now resets both learned state and stale controls/capabilities; this repairs saves that had persisted the mutually exclusive wrong cartridge. Pressing T after a current wrong physical-cartridge choice also releases that choice and restores both alternatives.

The source Chrome Chapter 2 scenario now begins with an intentionally stale cargo-aware L06 save, verifies that it is reset to position-only, requires enabled Train and safe-rehearsal controls at spawn, confirms the cargo setting is physically locked, runs the weak rehearsal, asserts that Patch/stage/portal state did not change, and then clears both genuine L06 relays plus L07-L10. Cache queries advanced to `v=1.5.1`; package metadata is 0.12.1. The production artifact remains the same allowlisted 168 game files / 75.06 MiB.

Fresh observed verification on Windows, Node.js v22.18.0, npm 10.9.3, Playwright 1.62.1 and installed Chrome 153.0.8010.54:

- In-app browser at `http://127.0.0.1:4173/?test=1&build=l06-fix-151#/play/L06`: PASS for local interactive inspection. Train and `Run safe rehearsal` were enabled at spawn, `Position + cargo` was disabled with a Pocket Sensor explanation, and the real-time rehearsal ended at `The position-only route lost track of the job.` with Patch progress protected. This is not a deployed-site or cross-browser pass.
- `ECHO_BROWSER_ONLY='Chapter 2 known-model' npm run test:browser`: PASS - the targeted source-Chrome scenario reset a stale cartridge, exercised the non-progressing rehearsal, completed both L06 relays and cleared all five Chapter 2 missions.
- `npm run check`: PASS in the final unfiltered run - 49 JavaScript syntax checks, 18,232 content/asset/audio/animation checks, 98/98 Node tests, a 168-file / 75.06 MiB allowlisted build, and 14/14 real-Chrome source/production results.
- `npm run test:rl`: PASS as execution (exit 0). L06 position-only timed out 8/8 at 0.0000 exact-model delivery; cargo-aware delivered 8/8 in 12 actions at 1.0000. Later authored stochastic misses remain recorded and are not relabelled as universal mastery.
- `npm run validate:handoff`: PASS - 1,171/1,171 structural checks, 155 audio cues, 11 supplied chapter briefs, 55 supplied mission IDs and 306 relative Markdown links. This remains structural validation only.

An intermediate complete browser run exposed an old production test error: it trained L02 under the intentionally bad `Shiny things` reward and assumed that repeated practice must win. The test now explicitly selects `The delivery` and permits bounded honest retraining; the targeted production rerun and subsequent full run passed. No game policy, reward, worker result or completion flag was fabricated. No commit, push, deployment, publication, credential, account or external-service action occurred.

### Remaining gates and next bounded task

This is local HTTP Chrome and in-app-browser evidence, not a deployed GitHub Pages pass or a first-time human comprehension result. Firefox, Safari, Edge, physical touch/mobile, low-end hardware, real OS backgrounding, zoom/high-DPI, assistive-technology review, quota/multi-tab conflicts, long soak, subjective audio balance and an independently declared holdout remain open.

Next bounded task: have a first-time player complete L06 without test assistance, recording whether the safe rehearsal communicates state aliasing and whether Pocket Sensor → Relay cell/Socket → switch → train/run is discoverable; tune only copy or first-room placement from that evidence.

## Echo decision workbench and turn ownership - 2026-09-28

The Echo panel now opens as a compact decision surface instead of a model dashboard. Train, Run, Reset and the choices that affect the current worker stay in the main view. The learning algorithm, input state, action space, policy probabilities, hyperparameters and installed capability cards moved behind the small `?` control; `Tabular Q-learning` is not shown in the main panel. A clearly labelled `× Close` control replaces the ambiguous corner glyph, and pressing R a second time closes the panel and cancels an in-progress worker at its last completed checkpoint.

Every Echo run in L01-L60 now has a bottom `Help for this run` view. It names the physical capability Patch must find, gives the exact visible setting combination for that stage, reports whether each choice is currently matched, and explains why that state/action/reward/policy contract fits the puzzle. L02 explicitly connects Sunrise Tread with the `The delivery` reward choice instead of repeating its intentionally bad `Shiny things` default. Help is explanatory only: it neither applies the settings nor trains or deploys Echo.

The selectable Practice budget was removed. Train now performs the level's fixed authored batch, so practice volume is no longer presented as the puzzle answer. Thirty-four L06-L59 canonical missions had the `budget-brief` decoy removed from their physical cartridge forks; the authoring script cannot restore it. The old budget IDs remain inert only for safe migration, and save validation drops retired budget controls/capabilities rather than losing the entire local save. State, action, reward, policy, representation, memory, replay, target, robustness and imitation choices continue to alter the real worker/shared simulator.

Visible deployment now owns the turn: while Echo runs, Patch commands are replaced by WAIT, queued movement is cleared, touch movement is disabled and an `ECHO IS RUNNING / PATCH CONTROLS PAUSED` overlay appears over Patch's maze. Patch immediately regains control when delivery, safe reset or failure ends the autonomous run. This removes the concurrent-input race that made the L03 lever sequence appear stuck. General gate interaction now also displays a visible `Security door opened` confirmation. Starting a level clears deployed state, keys and queues and restores only that level's validated cartridge/settings, so a previous level's Echo configuration cannot leak forward.

L02 can be run immediately with its honest untrained/under-equipped model. The panel closes, Echo visibly starts, Patch pauses, and the weak run returns Echo safely rather than ignoring the command. L06-L60 retain their already-authored two-to-seven Patch rooms, two/three staged Echo activations, mutually exclusive capability forks, District-7+ hunters and learner progression; they now share the same compact workbench, model inspector, per-stage Help, fixed training-batch contract and turn ownership. Retiring the generic budget decoy leaves later forks focused on the capability that actually distinguishes each puzzle.

Fresh observed verification on Windows, Node.js v22.18.0, npm 10.9.3, Playwright 1.62.1 and installed Chrome 153.0.8010.54:

- `npm run refine:echo-flow`: PASS - retired practice-budget entities/options from 34 canonical L06-L59 missions and synchronized all 60 production review JSON files.
- `npm run check`: PASS - 49 JavaScript syntax checks, 18,232 level/asset/audio/animation checks, 98/98 Node tests, a 168-file / 75.06 MiB allowlisted build, and 14/14 unfiltered real-Chrome source/production results. Browser coverage includes an immediate weak L02 run, R-to-close, model/help navigation, the exact L02 solution hint, training cancellation, level-to-level model isolation, Patch freezing during Echo, L03 lever traversal, all 60 source missions, native production workers, persistence and assets below `/echo-heist/`.
- `npm run test:rl`: PASS as execution (exit 0). The seeded development cohort completed after the content/contract change. Authored stochastic misses—including some SARSA, linear, policy-gradient and DQN seeds—remain visible in `evidence/rl-audit.json`; they are not described as universal mastery.
- `npm run validate:handoff`: PASS - 1,171/1,171 structural file/link/hash checks, 155 audio cues, 11 supplied chapter briefs, 55 supplied mission IDs and 306 relative Markdown links. This is structural validation only.
- `npm run typecheck`: NOT PASSED / unavailable - `tsc` is not installed or available in the pinned development environment, so no typecheck result is claimed.
- In-app browser inspection on the separate local test origin `http://127.0.0.1:4174/` reviewed the compact 1280×720 workbench, three-column Help view and scrollable model inspector. It confirmed the final L02 help says `The delivery`, Practice budget is absent, and `Tabular Q-learning` appears only in the inspector. This is local inspection, not a novice study or deployed-site pass.

The first targeted Chrome rerun failed because one assertion still searched for the superseded C01 mechanic heading. After that was corrected, a second focused run exposed a test assumption that a capability card existed before Patch collected it; the assertion was removed rather than fabricating a capability. Visual review then caught the initially incorrect L02 Help recommendation and the exact-answer browser assertion was added. Only the later passing focused and complete unfiltered runs are counted above.

The static artifact remains game runtime/assets only and excludes documentation, specifications, tests, evidence, production references, authoring scripts, the asset inspector and development probes. No commit, push, publication, deployment, credential, account or external-service action occurred.

### Remaining gates and next bounded task

This remains automated local-HTTP Chrome plus in-app-browser inspection. First-time human comprehension, Firefox/Safari/Edge, physical touch/mobile, representative low-end hardware, real OS backgrounding, zoom/high-DPI, assistive-technology review, multi-tab/quota conflicts, long resource soak, subjective audio balance, a separately declared holdout and deployed GitHub Pages remain open.

Next bounded task: run a first-time-player study across L02, L06, L21, L31 and L41. Record whether players use Help before guessing, understand the physical capability/setting combination, notice Patch's turn lock, and perceive the later two/three-run missions as meaningfully harder; then tune only the hint copy, layouts or authored fixed batches supported by those observations.

## Guided Chapter 1 capability loop - 2026-09-28

L01-L05 now use the requested always-available Echo loop. R opens one visual workbench from any point in the mission; Train, Run and the player-facing settings sit first, followed by the live input state, legal actions, policy probabilities, learner and hyperparameters. An incomplete model can be trained and run and is allowed to fail safely. There is no `CAPABILITY MISSING` panel, separate lower action dock, `?` button, District-7-prefix copy, dual-role briefing, real-effect card stack, or explanatory connected-maze paragraph. The remaining mechanic control opens only the compact district change and icon reference; its Lever entry now reads exactly “Opens doors and portals.”

Chapter 1 physical progression is now cell-to-Socket capability installation. Relay cells no longer merely power a dock: delivering one to its matching Socket changes the real configuration used by the worker, validation cohort and visible frozen policy. L01 adds EAST; L02 adds the same action repair while its reward-priority choice remains visible; L03 restores long-horizon return; L04 restores curious exploration; and L05 installs delivery reward and exploration in two separate relay stages. Old decorative latch/receiver/practice-dock/heavy-gate objects and levers without a real door/portal effect were removed from L01-L05. The one remaining L03/L04 lever and L05 security lever each open an actual Patch portal.

L01 is no longer a fixed boot animation. A staged, dismissible tutorial explains Echo's state, actions, reward, policy and practice; asks the player to train and run the incomplete model; observes a safe failure because EAST is genuinely absent; highlights Patch's Relay cell and Socket repair; then asks for a fresh worker training run. The repaired frozen policy performs the real Echo delivery, which opens Patch's exit gate through the shared objective evaluator. L02-L05 repeat the same causal structure with their own capability dimension and retain real Q-learning. The L01/L02 authored α of 0.1 and small distance-progress reward were chosen after the first complete Chrome run exposed an unstable α=0.4 seed, not to inject an action: the final eight-seed audit records 8/8 timeouts without the required action and 8/8 deliveries after the repair for both levels.

Fresh observed verification on Windows, Node.js v22.18.0, npm 10.9.3, Playwright 1.62.1 and installed Chrome 153.0.8010.54:

- `node scripts/refine-chapter-one.mjs` plus `npm run sync:content`: PASS - idempotently authored and synchronized the L01-L05 Socket/capability layouts and current learning contracts.
- `npm run check`: PASS - 48 JavaScript syntax checks, 18,334 level/asset/audio/animation checks, 96/96 Node tests, a 168-file / 75.06 MiB lean build, and 14/14 unfiltered real-Chrome results. The source scenario clears L01-L05 through the real UI, deliberately observes L01's weak-model failure, changes L02's reward choice, cancels/restarts a native module worker, reloads persisted learning, imports/exports a save, checks hidden-document pausing and unlocks District 2. Production scenarios exercise native workers, saved snapshots and deployment-relative assets below `/echo-heist/`.
- `npm run test:rl`: PASS as execution (exit 0). The final audit includes the new early capability contrast; established later stochastic misses remain in `evidence/rl-audit.json` and are not called universal mastery.
- `npm run validate:handoff`: PASS - 1,171/1,171 structural file/link/hash checks, 155 audio cues, 11 supplied chapter briefs, 55 supplied mission IDs and 306 relative Markdown links. This remains structural validation only.
- `npm run typecheck`: NOT PASSED / unavailable - the script invokes `tsc`, but TypeScript is not installed in the pinned dependency set. No compiler result is claimed.
- The first unfiltered browser run failed at the newly lengthened L02 delivery because the repaired α=0.4 policy timed out on the browser seed. The learning contract was audited and tuned, the focused Chapter 1 browser scenario passed, and then the complete unfiltered 14-result command passed. The failed run is not counted as evidence.

The static artifact contains runtime game code and referenced local assets only; documentation, specifications, tests, evidence, production references, authoring scripts, the asset inspector and development probes remain excluded. No commit, push, deployment, publication, credential, account or external-service action occurred.

### Remaining gates and next bounded task

This is automated local-HTTP Chrome and in-app-browser inspection, not a first-time human comprehension result or deployed GitHub Pages pass. Firefox, Safari, Edge, physical touch/mobile, representative low-end hardware, user-driven OS backgrounding, zoom/high-DPI, assistive-technology review, quota/multi-tab conflicts, long resource soak, subjective audio balance and a separately declared holdout remain open.

Next bounded task: put L01-L05 in front of first-time players and record whether they find R, understand the weak-model failure, connect Relay cell → Socket → changed model, choose L02's delivery reward, and recognize the L03-L05 capability changes. Tune only the Chapter 1 guidance, geometry and development budgets from that evidence; after the five-level pattern is proven, apply the successful interaction language to L06-L60 as a separate task.

## Always-available Echo workbench, repaired E interactions and observed patrols - 2026-09-28

The latest interaction/learning pass is implemented in the existing Canvas2D/ES-module campaign. R opens one unified Echo workbench from anywhere in every mission, even before Patch has found the required cartridge. Train, Run, Reset and the settings that change the real worker are at the top; the same view shows the current state inputs, legal actions, reward/practice/policy contract, policy preferences, algorithm, hyperparameters and installed or missing physical capability. A missing capability disables training without hiding the model. The old lower action dock and duplicate terminal presentation are no longer emitted.

Patch E feedback now comes from the same shared interaction rules as the simulation. A usable target shows gold E, an adjacent but currently impossible socket/portal/exit shows red E, and a used lever/console/extraction target shows neither an E nor a leftover label. A real browser click on the touch Interact button activates the L02 latch. The autonomous clock now counts Echo actions unless a mission explicitly declares a mission-wide clock, so Patch can explore, install relay cells and choose a cartridge before deployment without silently timing Echo out and opening a blocking retry dialog.

Every mission presents a visible learning contract whose emphasized dimension rotates through state, actions, reward, practice and policy within its district. Physical cartridges still modify the real configuration consumed by worker practice and visible play. Districts 7-12 add grounded Echo hunters rendered from the shipped sentry strip. Their position, direction, range and active phase enter the declared late-game observation; movement, collision and capture occur in `src/sim/core.js`, so practice, frozen evaluation and play see the same patrol rather than a cosmetic enemy. Policy-gradient entropy/step sizes and authored batch sizes were balanced against all relay phases without inserting winning actions or oracle routes.

Advanced persistence now stores every learned Dyna action value and a bounded recent set of 512 genuinely observed empirical model pairs. The complete in-memory empirical table remains available during the current session; after reload, deployment uses the unchanged learned values and continued practice rebuilds older observed pairs normally. This keeps late-district cartridges below browser storage limits while preserving honest inference. The save validator accepts the authored Dyna value-table bound, and real Chrome verified a trained L31 module-worker snapshot across a production-subpath reload.

Fresh observed verification on Windows, Node.js v22.18.0, npm 10.9.3, Playwright 1.62.1 and installed Chrome 153.0.8010.54:

- `npm run author:twin-grid`: PASS - re-authored/synchronized 60 connected twin-grid levels, rotating learning focus, district-7+ Echo hunters and final tuned learning budgets.
- `npm run check`: PASS - 47 JavaScript syntax checks, 18,418 level/asset/audio/animation checks, 96/96 Node tests, a 168-file / 75.07 MiB lean build, and 14/14 unfiltered real-Chrome browser results. Source coverage includes all 60 missions; production coverage includes native module workers, persistence/reload and deployment-relative assets below `/echo-heist/`.
- `npm run test:rl`: rerun after the shared-kernel enemy work; PASS as execution. Seed-level timeouts/captures remain visible in `evidence/rl-audit.json` and are not relabelled as universal mastery.
- `npm run validate:handoff`: PASS - 1,171/1,171 structural file/link/hash checks, 155 audio cues, 11 supplied chapter briefs, 55 supplied mission IDs and 306 relative Markdown links. This is structural validation, not browser, learning, listening or playtest approval.
- `npm run typecheck`: NOT RUN TO PASS - the existing script calls `tsc`, but TypeScript is not an installed development dependency. No compiler result is claimed and no unrelated dependency was added.
- The first full browser run failed honestly because pre-launch Patch walking spent the old tick-based budget, planning tests still searched for an obsolete button label, district-7 policy batches were brittle in later relay phases, and the unbounded Dyna rehearsal table could not survive validated browser reload. Each defect was repaired and the complete unfiltered command was rerun to 14/14.
- The static release remains allowlisted game runtime/assets only. It excludes docs, specs, tests, evidence, production references, authoring scripts, the inspector and development probes. No deployment, commit, push, credential, account or external-service action occurred.

### Remaining gates and next bounded task

This is local HTTP and automated Chrome evidence, not a deployed GitHub Pages pass or a human difficulty/comprehension result. Firefox, Safari, Edge, physical mobile/touch, low-end hardware, real user-driven OS backgrounding, zoom/high-DPI, screen-reader review, multi-tab/quota conflict testing, long memory/resource soak, subjective audio balance, a separately declared holdout cohort and authorized deployment remain open.

Next bounded task: run first-time human playtests on L02, L31, L37 and L51, measuring E-prompt comprehension, time to find the required cartridge, workbench comprehension, training attempts, hunter readability and wrong-capability recovery; tune copy/geometry/budgets from those observations without changing the shared transition contract.



## Gated extraction, connected district floors and live Echo model - 2026-09-28

The requested mission contract is implemented across L01-L60. Every Patch exit now has a blocking `exitGate` on the extraction tile. It opens only after the final authored Echo task reports a real delivery (or L01's disclosed boot route reaches its exit), and mission completion now requires Patch to stand at the opened exit and press E. A delivery made on Echo's final allowed tick wins before timeout; the autonomous clock then stops while Patch extracts. Intermediate Echo deliveries continue to power only their declared room portal and do not open the final exit.

All Patch and Echo rooms were re-authored as connected floor graphs rather than closed inner chambers. Both sides remain independent 20x20 maps with full-map framing and coordinate-preserving portals. District 1 reserves a five-tile wall border, District 2 four tiles, District 3 three tiles, and Districts 4-12 one tile. The authoring script preserves a candidate wall only when a flood fill still reaches every floor tile; content validation and integration tests independently repeat that DFS/BFS connectivity check from each spawn or inbound portal. The former boxed Echo practice area is gone.

R now opens Echo's model from anywhere in a mission; a physical relay terminal is not required. Before Patch installs the required cartridge, the model remains inspectable but practice is disabled. The terminal shows the current raw observation and named state inputs, enabled/disabled actions, the frozen policy's current action preferences, the actual district learner, previously recovered learner cores, real hyperparameters, installed physical capabilities, worker progress and measured readiness. Tabular, prediction, feature, model-based, policy-gradient, DQN and cloning workers now evaluate every completed snapshot on a deterministic 12-run frozen cohort. Dispatch remains locked below 67% measured delivery, compatible repeat practice accumulates real experience, and the frozen snapshot used for visible Echo play is unchanged during delivery. Exact-model districts report their computed probability rather than inventing cohort counts. Validation statistics persist through save/reload/export/import.

The optional `?` briefing now contains a shipped-art glossary for Patch, Echo, both floor types, levers, cells, sockets, cartridges, portals, relay markers, receiver consoles, cargo, scrap, lasers, sentries and the final exit lock. The compact in-game interface adds R beside the movement/E controls, keeps the two unboxed canvases, and announces each real Echo relay phase through the screen-reader status node. Cache queries advanced to `v=1.2.0` so the running no-store development server does not retain the earlier worker graph.

Fresh observed verification on Windows, Node.js v22.18.0, npm 10.9.3, Playwright 1.62.1 and installed Chrome 153.0.8010.54:

- `npm run author:twin-grid`: PASS - authored and synchronized connected district-scaled 20x20 Patch/Echo rooms, gated extraction entities and `exitActivated` objectives for L01-L60.
- `npm run check`: PASS - 47 JavaScript syntax checks, 18,208 content/asset/audio/animation checks, 91/91 Node tests, a 168-file / 75.04 MiB allowlisted static build, and 14/14 real-Chrome results in the final unfiltered run. The source matrix covered all 60 missions and the production matrix used native module workers, persisted snapshots, real keyboard timing and deployment-relative assets below `/echo-heist/`. The passing run captured no console error, page exception, failed request or HTTP response at 400 or above.
- `npm run test:rl`: PASS as execution (`EXIT_CODE=0`) - the seeded audit completed through tabular, exact-model, prediction, feature, Dyna, policy-gradient, DQN and player-demonstration cases. Authored stochastic misses remain visible in the output; this is the declared development cohort, not a universal or holdout mastery claim.
- `npm run validate:handoff`: PASS - 1,171/1,171 structural file/link/hash checks, 155 audio cues, 11 supplied chapter briefs, 55 supplied mission IDs and 306 relative Markdown links. Its scope remains structural, not a browser, learning, listening or playtest approval.
- Real-Chrome 1280×720 screenshots `evidence/browser-phase1/source-icon-guide.png` and `source-echo-terminal.png` were reviewed after the final cache bump. They show the scrollable icon glossary and the live untrained Q-learning observation/action/policy/hyperparameter view. This is local HTTP evidence, not deployed GitHub Pages evidence.

Development failures were retained rather than relabelled. The first Node rerun found that final-tick delivery could still become a timeout and that final delivery could enter an intermediate portal; both shared-kernel ordering defects were fixed and regression-tested. Early browser reruns exposed stale assumptions about five touch buttons, automatic extraction, one heading per dock and one practice batch. Production reruns exposed test-driver timing that cancelled workers and mistook Patch's next-room text for Echo stage completion; the driver now waits on visible practice completion and the accessible relay-phase announcement. One targeted production run recorded transient Windows `ERR_NO_BUFFER_SPACE`, and a suspended-host run recorded `ERR_NETWORK_IO_SUSPENDED`; neither was counted as a pass. The final complete `npm run check` subsequently passed all 14 browser results without either error.

The lean artifact contains game runtime code and referenced local assets only. It excludes Markdown, docs, specs, tests, evidence, production references, authoring scripts, the asset inspector and the test probe. No commit, push, deployment, publication, credential, account or external-service action occurred.

### Remaining gates and next bounded task

First-time human playtesting is still required for whether the border ramp reduces early confusion, whether cartridge consequences and the 67% readiness threshold are understood without instruction, and whether repeated training feels informative rather than slow. Firefox, Safari, Edge, physical mobile/touch, representative low-end hardware, user-driven OS backgrounding, zoom/high-DPI, screen-reader/assistive-technology review, quota and multi-tab conflicts, long resource/heap soak, subjective audio balance, a separately declared holdout cohort and an authorized live GitHub Pages deployment remain unchecked.

Next bounded task: run a five-mission novice study on L02, L06, L21, L36 and L51, recording time to find the required cartridge, terminal comprehension, practice batches to readiness, wrong-fork recovery and exit-door discoverability; then tune copy, thresholds or geometry without changing the shared transition kernel or inserting winning policies.

## Twin 20x20 mazes, physical Echo capabilities and district stories - 2026-09-28

Every mission now presents two genuinely separate, equal-size 20x20 playfields: Patch never appears in Echo's field and Echo never occupies Patch's. Each canvas shows its complete current room. Patch changes rooms by standing on a portal and pressing E; Echo crosses its own portals autonomously. Room changes preserve the actor and portal coordinates, allowing two-to-seven-room infiltrations without shrinking either board. The former camera boxes, level-out-of-level counter and persistent objective subtitle were removed; a screen-reader-only mission-state node retains objective feedback for assistive technology and browser verification.

Echo preparation is now grounded in physical capability cartridges. Patch must reach and collect a cartridge before the dock's E prompt becomes available; the prompt is visibly red while locked. Collected cartridges alter the real observation, action, policy, reward/practice or learner contract passed to the shared simulator and worker. Later districts offer mutually exclusive forks: taking one cartridge permanently locks its siblings for that attempt, so Patch's route and choice matter rather than merely collecting every item. The dock describes the resulting STATE, ACTIONS, POLICY, SIGNAL and PRACTICE contract in compact language, while abstract settings chips and the old Scan/status surfaces remain absent. Capability choices, prepared stages and compatible learned state survive retry, export/import and reload.

All 60 runtime missions were re-authored with independent, varied 20x20 Patch and Echo layouts, same-coordinate room portals, distinct starts/goals/elements, and a two-to-seven-room Patch difficulty ramp. Intermediate relays continue to require real repeated Echo preparation and delivery. `src/content/capabilities.js` is the canonical physical-to-learning mapping, and practice, evaluation and visible play continue through `src/sim/core.js`. No oracle route, scripted winning policy, algorithm-name victory or fabricated progress was added.

A story gate now precedes each level. Districts 2-11 use ten locally shipped AI-generated cinematic backgrounds that introduce the district's new fiction and capability without calling it a lesson; District 1 keeps the opening and District 12 keeps the finale treatment. Four locally generated transparent animation strips replace simple shapes for sentries, the Warden, room portals and capability cartridges. Generation was development-only: the browser has no image API, credential or runtime network dependency. The cache-query graph was advanced to `v=1.1.0` after local in-app inspection exposed an older cached module graph.

Fresh observed verification on Windows, Node.js v22.18.0, npm 10.9.3, Playwright 1.62.1 and installed Chrome 153.0.8010.54:

- `npm run author:twin-grid`: PASS - authored and synchronized independent 20x20 room sets and cartridge forks for L01-L60; the final normalization also rejects duplicate entity IDs.
- `npm run check`: PASS - 47 JavaScript syntax checks, 17,014 level/asset/audio/animation checks, 88/88 Node tests, a 168-file / 75.00 MiB allowlisted static build, and 14/14 reported real-Chrome results. Source flows covered all districts, failure recovery, progress preview, DQN, player demonstrations and the Warden. Production flows loaded below `/echo-heist/`, started native module workers and reloaded persisted tabular, planning, advanced, DQN and cloning state. No captured console error, page exception, failed request or HTTP status failure remained in the passing run.
- First `npm run test:rl`: FAIL honestly at L51 because the development audit still replayed a pre-20x20 hard-coded lesson. The audit was changed to derive a player-format route through `walkable` and verify every action through `step`; no generator was added to the shipped runtime. Final `npm run test:rl`: PASS as execution - 369 rows written, including five map-derived Chapter 11 lessons whose trained frozen clones delivered. Historical weak seeds and the authored L44 DQN timeout remain visible; this is reproducibility evidence, not universal mastery or a holdout pass.
- Post-audit `npm run lint` plus `node --test tests/deep-learning.test.js tests/integration.test.js`: PASS - 47 syntax checks and 26/26 targeted learning, persistence, 20x20-field, portal, capability-fork and route tests.
- `npm run validate:handoff`: PASS - 1,171/1,171 structural file/link/hash checks, 155 audio cues, 11 supplied chapter briefs, 55 supplied mission IDs and 306 relative Markdown links. Its scope remains structural, not browser, learning, listening or playtest approval.
- In-app browser inspection on the normal loopback HTTP origin observed two equal complete maps with no panel boxes or top mission counter, the red locked dock E, the generated Clockwork Docks story art, and the refreshed `v=1.1.0` module graph. This is local HTTP evidence, not a deployed GitHub Pages pass.

The lean release contains only game runtime files and referenced assets, including the ten district story images and four animated sprite strips. It excludes documentation, specifications, tests, evidence, authoring scripts, production references and the asset inspector. No commit, push, publication, deployment, credential, account or external-service action occurred.

### Remaining gates and next bounded task

The new capability decisions and larger boards need novice human playtesting for route readability, cartridge-choice comprehension, story pacing and late-district difficulty. Firefox, Safari, Edge, physical mobile/touch, representative low-end hardware, user-driven OS backgrounding, zoom/high-DPI, assistive technology, quota/multi-tab conflicts, long resource/heap soak, subjective audio balance, a separately declared learning holdout and an authorized live GitHub Pages deployment remain unchecked.

Next bounded task: conduct a focused first-time-player balance pass on L06, L21, L36, L51 and L60, recording wrong-cartridge choices, time-to-dock, portal confusion, retraining attempts and completion time; then tune geometry/copy and capability placement without changing the shared learning or objective contracts.

## Adaptive relay campaign, opening and dawn finale - 2026-09-28

The requested interaction and progression pass is implemented in the existing Canvas2D game. Patch and Echo retain independent side-by-side cameras; Patch's implicit camera now flood-fills only the accessible orange room and treats every closed portal as a boundary, so the left panel no longer reserves the former Echo lane or exposes later rooms. The persistent scanner and right-hand Echo status block are gone. Five touch controls are centered below the panels in left/up/right/down/E order, with E immediately beside the down control. The optional `?` briefing and compact district-system button carry nonessential explanation without returning permanent teaching panels to play.

Every learning mission now combines its authored district decision with player-chosen, real cartridge properties. Depending on the learning mode, the dock exposes three to six simultaneous settings: four observation contracts (`Position only`, mission telemetry, beacon telemetry, or local lidar), four reward profiles, five bounded practice budgets, and the district-specific choice. These selections change actual encoded inputs, reward values, episode counts or exact-model sweeps used by the shared simulation and module workers. Sensor/reward contract changes invalidate incompatible work; a budget change retains compatible experience but requires another completed preparation. Frozen deployment, retry preservation and saved cartridge contracts include the selected properties. Districts 01-12 now identify their cumulative mechanic in the first mission and keep using it through the remaining missions.

Patch's route now gates Echo with a physical power puzzle in every L02-L60 mission: collect a room-specific relay cell and install it in its socket before the dock can activate. Multi-stage missions require a separate cell and genuine frozen Echo delivery for each portal. The early ramp is no longer one repeated compact room: L03-L04 have two Patch rooms; L05-L07 have three Patch rooms and two separately trained Echo relay runs; L08-L30 retain two runs; L31-L60 retain three. The established later campaign still expands to seven rooms with security locks, machinery islands, patrol checkpoints, cargo and boss shields. All power cells/sockets are shared-kernel `patchOnly` entities and are excluded from Echo's observations.

A saved, one-time prologue now appears before the first L01 attempt, combining the opening story with direct controls and the recurring `find power → configure/train → deploy → continue` rhythm. It is a story/start screen rather than a quiz. Genuine L60 completion now routes to a completion-gated epilogue with the locally shipped AI-generated `finale-dawn-v1.png`, Patch and Echo leaving the Citadel, and a 236-word emotional story roll. Hover/focus pauses the roll; reduced-motion mode presents a static readable scroll. No network generation or service exists at runtime.

Fresh observed verification on Windows, Node.js v22.18.0, npm 10.9.3, Playwright 1.62.1 and installed Chrome 153.0.8010.54:

- `node scripts/expand-patch-campaign.mjs`, `node scripts/author-dual-room-flow.mjs`, `node scripts/author-relay-power-puzzles.mjs`, and `npm run sync:content`: PASS - authored and synchronized L02-L60 relay-power gates, the revised L03-L07 room ramp and the complete staged campaign.
- Bundled Python `scripts/make_layout_previews.py`: PASS - regenerated coordinate-labelled JSON/PNG review copies for all 60 canonical maps.
- `npm run check`: PASS - 45 JavaScript syntax checks, 5,809 level/asset/audio/animation checks, all 87 Node tests, a 153-file / 50.02 MiB allowlisted static build, and all 14 reported real-Chrome results. The source matrix clears all 60 missions and the L60 epilogue; production cases use native module workers, actual keyboard input, persisted snapshots and game assets below `/echo-heist/`. No observed console error, page exception, failed request or HTTP status failure remained in the passing run.
- `npm run test:rl`: PASS as execution - 369 seeded audit rows were freshly written to `evidence/rl-audit.json`. Existing weak seeds remain visible (including L23/L24, L26/L30 and policy-gradient misses); this is reproducibility evidence, not a claim that every seed or unseen distribution wins.
- `npm run validate:handoff`: PASS - 1,171/1,171 structural file/link/hash checks, 155 audio cues, 11 supplied chapter briefs, 55 supplied mission IDs and 306 relative Markdown links. This remains structural validation, not a deployed-browser, subjective listening or human-playtest result.
- In-app browser inspection at `http://127.0.0.1:4173/?build=adaptive-relays-091-20260927#/play/L02` observed the cropped Patch access bay, separate full Echo grid, absent scanner/status panel and centered five-button controls. A captured real-Chrome 1280×720 finale showed the story readable over the generated dawn art. Both are local HTTP observations, not deployment evidence.

The complete browser run exposed and repaired three real integration defects: the release initially omitted the prologue's sleeping-Echo frame; an old Chapter 2 browser path assumed only one relay after L05-L07 gained multiple stages; and L60 navigation cleared runtime state before the test driver observed its final extraction coordinate. The lean allowlist, multi-stage drivers and finale synchronization were corrected and then rerun to passing results. No scripted policy, fake training progress, fabricated completion, commit, push, publication, credential, account or external-service action was used.

### Remaining gates and next bounded task

The new control space and longer early missions need novice human playtesting for discoverability, decision overload, room pacing and whether the visible “real effect” explanations are sufficient without a tutorial dashboard. Firefox, Safari, Edge, physical mobile/touch, representative low-end hardware, user-driven OS tab hiding, zoom/high-DPI, assistive technology, quota/multi-tab conflicts, long resource/heap soak, subjective audio balance, fresh holdout learning and an authorized live GitHub Pages deployment remain unchecked.

Next bounded task: human-playtest L02, L06, L29 and L60 with first-time keyboard and touch players; record time-to-find each relay cell, time-to-understand the sensor/reward/budget choice, retries per relay and finale readability, then tune copy, room geometry and default budgets without changing the shared transition or objective contracts.

## Dual-panel rooms and staged Echo relays - 2026-09-27

The requested playfield and mission-flow revision is implemented. Every game screen now has two large side-by-side top-down Canvas2D views with independent cameras: the left view follows Patch's current infiltration room at readable actor scale, while the right view shows Echo's autonomous courier grid. Crossing a powered portal changes the Patch room instead of shrinking the whole multi-room map into one canvas. The two screenshot-marked explanatory blocks were removed from the persistent HUD. A compact optional `?` briefing retains the requested role/dynamics explanation without occupying play space.

L08-L30 now contain two staged Echo activations and L31-L60 contain three. Patch must reach the correct relay dock, choose the level's exposed learning setting, run real bounded practice/evaluation, and dispatch a frozen policy. A successful non-final delivery powers the corresponding portal, preserves Patch's position, switches, checkpoints and opened rooms, then advances to a separately trained mini-puzzle. Compatible experience is retained on retry within a stage; a new stage starts a fresh learner because its launch/phase contract changes. Relay test delivery uses the real receiver transition without falsely arming the final mission receiver. Echo failure resets only the active relay attempt, and the deployment budget now advances only while Echo is active, so it cannot expire while Patch crosses rooms or extracts after delivery.

Mission cards inside a district now show mission order, global number, title and status only; geometry previews were removed. The dock presents a visible `CHOOSE → TRAIN → DEPLOY` loop, current run number, launch, hazard phase, selected setting, a plain-language setting effect and actual learner counters. Authored Patch escalation remains two rooms at L08-L10 through seven rooms at L51-L60, with distinct machine-island patterns and checkpointed grounded patrols on milestone missions. Patrol authoring now selects only verified contiguous floor runs, avoiding machine islands and unfair invalid placements.

Fresh observed verification on Windows, Node.js v22.18.0, npm 10.9.3, Playwright 1.62.1 and installed Chrome 153.0.8010.54:

- `node scripts/expand-patch-campaign.mjs`, `node scripts/author-dual-room-flow.mjs`, and `npm run sync:content`: PASS - authored/synchronized L08-L60 progressive rooms, two/three-stage relay definitions, Echo-powered portals and valid patrol lanes.
- Bundled Python `scripts/make_layout_previews.py`: PASS - regenerated coordinate-labelled JSON/PNG review copies for L01-L60. System Python was unavailable; the recorded bundled executable was used.
- `npm run test:rl`: PASS as execution - 369 seeded rows were freshly written to `evidence/rl-audit.json`; established weak seeds remain visible, so this is reproducibility evidence rather than a universal learning pass.
- `npm run check`: PASS - 43 JavaScript syntax checks, 4,851 content/asset/audio/animation checks, all 85 Node tests, a 150-file / 47.45 MiB lean build, and all 14 reported real-Chrome results (13 subflows plus the parent). Source coverage cleared all 60 missions; production coverage used native module workers, restored frozen cartridges, and assets below `/echo-heist/`. No captured console error, page exception, failed request or HTTP status failure occurred. After this complete pass, only cache-query/package metadata moved from `0.8.0` to `0.8.1`; fresh `npm run lint`, `npm test`, `npm run build`, the source shell/Chapter 1 browser scenario and the `/echo-heist/` production asset/worker/persistence scenario all passed again.
- `npm run validate:handoff`: PASS - 1,171/1,171 structural file/link/hash checks, 155 audio cues, 11 supplied chapter briefs, 55 supplied mission IDs and 306 relative Markdown links. This is structural validation, not a deployed-browser or human-playtest claim.

The full browser work found and repaired real defects: relay probes initially required the final receiver flag; the Echo clock continued while Patch walked between rooms and after delivery; DQN setting changes could incorrectly reuse incompatible stage learning; one patrol could be authored on a machine island; and the browser route driver treated a moving patrol's future tile as a permanent wall. Production persistence now explicitly dispatches the restored frozen snapshot after reload before training later relay stages. In-app inspection at `http://127.0.0.1:4173/?build=dual-relay-20260927#/play/L11` observed the two framed cameras, large actors, text-only HUD and map-free mission cards. This is a local inspection, not deployment.

No commit, push, publication, deployment, credential, account or external-service action occurred.

### Remaining gates and next bounded task

The new structure needs novice human playtesting for room-transition comprehension, RL-setting clarity, patrol timing and whether two activations in L08-L30 feel sufficiently different. Firefox, Safari, Edge, physical mobile/touch, representative hardware, real user-driven tab hiding, zoom/high-DPI, assistive technology, quota/multi-tab conflicts, long resource/heap soak, subjective audio balance, fresh holdout learning and a live GitHub Pages deployment remain unchecked.

Next bounded task: human-playtest L08, L29, L41 and L60 on keyboard and touch, record time-to-understand each `CHOOSE → TRAIN → DEPLOY` relay and portal transition, then tune stage copy, patrol cadence and Patch-side geometry without changing Echo's state/reward/learning contracts.

## Progressive Patch infiltrations and patrols - 2026-09-27

Patch's later-game route is no longer the repeated lever/console/dock walk. All 53 canonical missions from L08-L60 now extend the existing separated playfield with linked Patch-only rooms, alternating security doors, machinery islands, a final extraction corridor, and room-specific objectives. The escalation is explicit: L08-L10 have two rooms, L11-L20 three, L21-L30 four, L31-L40 five, L41-L50 six, and L51-L60 seven. The existing L01-L07 layouts and early-game pacing remain intact.

Every intermediate security switch is a real required preparation step. Echo cannot be deployed until Patch has opened every declared room door as well as the original shutter and receiver. The HUD names the current room and next physical task; the renderer labels rooms and `SECURITY` gates. District finales and selected late missions add deterministic grounded red patrol robots: 25 patrols across 15 missions. Touching one returns Patch to the latest activated security checkpoint and increments a strike count without failing the mission, discarding Echo progress, closing opened rooms, or fabricating success.

The learning boundary remains unchanged. New doors and patrols are `patchOnly`, are excluded from Echo observations, and never participate in training actions. Each expanded level records its original Echo geometry so feature scaling is identical to the pre-expansion contract. Practice, evaluation, and visible Echo play still use `src/sim/core.js`; no policy, objective, reward, or terminal result was injected. The build/cache version is now `0.7.0` while the existing save schema/key remains compatible.

Fresh observed verification on Windows, Node.js v22.18.0, npm 10.9.3, Playwright 1.62.1 and installed Chrome 153.0.8010.54:

- `node scripts/expand-patch-campaign.mjs`: PASS - authored/idempotently normalized progressive Patch layouts for L08-L60.
- `npm run sync:content`: PASS - synchronized all 60 canonical levels and review copies.
- `C:\Users\TeddyLazebni_mwmf8h4\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe scripts/make_layout_previews.py`: PASS - regenerated coordinate-labelled JSON/PNG previews for L01-L60, including procedural patrol markers.
- `npm run check`: PASS - 42 JavaScript syntax checks, 4,602 content/asset/audio/animation checks, all 80 Node tests, a 150-file / 47.34 MiB lean static build, and all 14 reported real-Chrome results (13 subflows plus the parent). Source coverage cleared all 60 missions with the new ordered routes. Production coverage loaded below `/echo-heist/`, ran native module workers, and reloaded persisted tabular, planning, advanced, DQN, and cloning snapshots. No captured console error, page exception, failed request, or HTTP status failure occurred.
- `npm run test:rl`: PASS as execution - 369 rows were freshly written to `evidence/rl-audit.json`. The established weak-seed outcomes remain visible; the command is reproducibility evidence, not a holdout or universal robustness claim.
- `npm run validate:handoff`: PASS - 1,171/1,171 structural file/link/hash checks, 155 audio cues, 11 supplied chapter briefs, 55 supplied mission IDs, and 306 relative Markdown links. This remains structural validation rather than browser or playtest approval.

The first updated browser run failed honestly because the new route helper queued keyboard events faster than the game's 230 ms input loop. The helper was repaired to drive source missions synchronously through the same public game-command path and to pace real keyboard events in the production build. Two complete subsequent browser runs passed. The in-app browser was refreshed to `?build=patch-rooms-final-20260927#/play/L08` and observed the new `ROOM 1`, two-room/one-lock role copy, checkpoint guidance, and responsive game surface at the normal local origin.

No commit, push, publication, deployment, credential, account, or external-service action occurred.

### Remaining gates and next bounded task

The new layouts have automated reachability and full-campaign completion evidence, but difficulty, patrol readability, room pacing, and the final 28x20 map's legibility still need a novice human pass. Firefox, Safari, Edge, physical mobile browsers, representative hardware, real touch play, user-driven OS tab switching, zoom/high-DPI, assistive technology, long resource/heap soak, localStorage quota/multi-tab conflicts, subjective audio balance, fresh holdout learning, and a live GitHub Pages deployment remain unchecked.

Next bounded task: human-playtest L08, L20, L40 and L60 on desktop and a narrow touch viewport, record route confusion/collision fairness, then tune only Patch-side obstacles, checkpoint placement and patrol timing without changing Echo's state, reward, or learning contracts.

## District identity, split playfields, and early Echo recovery - 2026-09-27

The requested presentation and early-game interaction pass is complete. `echo-heist-title-v1.png` is now the single top-left brand on the lift menu; the duplicate center title and top-right lift-status badge are gone. Twelve small, local SVG district scenes now give every lift menu, district card, and in-game screen a distinct backdrop. The in-game district scene is rendered at 0.75 CSS opacity behind the translucent Canvas2D surround, while the map and actors remain readable. The release allowlist includes those twelve scenes and no longer copies the unused older logo.

Every L01-L60 map now declares separate `p` Patch tiles and `e` Echo tiles, and validation requires both actors to spawn in their own field. The renderer gives those zones orange/cyan treatment, borders, and explicit `PATCH FIELD / YOU` and `ECHO GRID / AUTONOMOUS` labels. L01 was converted from shared floor to a separated boot corridor without changing its authoritative action trace. L03-L07 now use five different Patch-side mazes and relocated shutter/receiver controls rather than repeating the L02 setup floor; canonical JSON, runtime mirrors, production review copies, and coordinate PNGs were synchronized.

The minimal game HUD now states Patch's direct physical job and Echo's autonomous job for the current mission. Clicking either role opens a short mission-dynamics briefing. L02-L07 dock choices explain their actual effect on reward, discounting, exploration, state representation, or stochastic route choice. These descriptions report the real configuration passed to the existing shared simulation and learners; they do not alter outcomes or add a scripted policy.

In L01-L07, an Echo scrap ending, capture, timeout, or administrative action-budget stop now resets only Echo-side attempt state. Patch's location/cargo, prepared shutter and receiver, moved crates, compatible learned/evaluated cartridge, and frozen snapshot remain intact. The player can immediately retry the same frozen route, reopen the dock to change a meaningful choice, or explicitly restart the whole mission. Later districts retain their existing whole-attempt setback treatment. A real-Chrome regression deliberately trains L03 with the short-horizon choice, observes the genuine terminal scrap result, and verifies that Patch position and the Q-table are byte-for-byte unchanged after the local Echo reset.

Fresh observed verification on Windows, Node.js v22.18.0, npm 10.9.3, Playwright 1.62.1 and installed Chrome 153.0.8010.54:

- `node scripts/author-district-backdrops.mjs`: PASS - authored twelve local 1600x1000 SVG district scenes with no runtime network dependency.
- `npm run sync:content`: PASS - synchronized all 60 canonical levels and opening strings after the L01/L03-L07 geometry changes.
- `C:\Users\TeddyLazebni_mwmf8h4\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe scripts/make_layout_previews.py`: PASS - regenerated coordinate-labelled JSON/PNG review copies for L01-L60.
- `npm run check`: PASS - 41 JavaScript syntax checks, 2,897 content/asset/audio/animation checks, all 75 Node tests, a 150-file / 47.17 MiB lean static build, and all 14 reported real-Chrome results (13 subflows plus the parent). The browser checks cover the single menu logo, absent duplicate/status badge, twelve distinct district-card backgrounds, current-district menu switching, split-role UI, all revised Chapter 1 routes, local L03 Echo recovery, all 60 source missions, and native module workers/persisted snapshots below `/echo-heist/`. No captured console error, page exception, failed request, or HTTP status failure occurred.
- `npm run test:rl`: PASS as execution - 369 rows were freshly written to `evidence/rl-audit.json`. The intended early contrasts remain visible: all eight L03 near runs and L04 familiar runs ended at scrap, while all eight L03 far and L04 curious runs delivered; all L06 position-only runs timed out while cargo-aware runs delivered. Historical weak seeds in later chapters remain recorded and are not relabelled as passes. This is seeded implementation evidence, not a holdout or learning-effectiveness claim.
- `npm run validate:handoff`: PASS - 1,171/1,171 structural file/link/hash checks, 155 audio cues, 11 supplied chapter briefs, 55 supplied mission IDs, and 306 relative Markdown links. This remains structural validation, not browser, listening, or human-playtest approval.

The in-app browser was also used to inspect the Eclipse menu, twelve district cards, and revised L03 at the normal loopback origin. The observed menu had one top-left title mark and no status badge; the cards showed visibly different scene motifs; L03 showed the separated labelled fields, new bent Patch maze, per-mission roles, and Scrapyard backdrop. This visual inspection supplements rather than replaces the automated browser checks.

No commit, push, publication, deployment, credential, account, or external-service action occurred.

### Remaining gates and next bounded task

Subjective legibility and pacing still need a novice human pass, especially the compact role briefing at narrow desktop/mobile widths and whether the L02-L07 choice explanations are understandable without feeling instructional. Firefox, Safari, Edge, physical mobile browsers, representative hardware, user-driven OS tab switching, zoom/high-DPI, assistive technology, long resource/heap soak, localStorage quota/multi-tab conflicts, subjective audio balance, fresh holdout learning, and a live GitHub Pages deployment remain unchecked.

Next bounded task: run a focused human/browser matrix on L01-L07 (desktop, narrow mobile, keyboard, touch, mute/unmute), record confusion and occlusion without changing the learning contracts, then make only evidence-backed presentation adjustments.

## Chapters 9-12 and Eclipse Warden finale - 2026-09-27

Echo Heist now contains 60 sequential playable missions across twelve progressively unlocked districts. L41-L50 implement compact DQN with real shared-kernel transitions, bounded uniform replay or latest-transition training, Adam updates, explicit target-network copies, structured observations and frozen deployment. L51-L55 record successful player-controlled runs as pre-action state/action examples, train behavioral-cloning networks only from those examples, discard failed lessons and deploy observation-driven frozen clones. L56-L60 are clearly labelled as an original extension beyond the supplied 11-chapter course and culminate in the Eclipse Warden: three ordered Echo deliveries break three visible shields before Patch carries the city heart to the dawn gate.

Twenty distinct canonical 16x10 maps, synchronized review copies and coordinate previews were added for Neural Arcade, Storm Grid, Central Tower and Eclipse Citadel. The district-first lift, menu atmosphere, renderer palette, feedback, progress counts and routes now cover all twelve districts. The Warden is an animated Canvas2D boss with no fake asset dependency. Chapters 9-11 connect delivered synchronized audio stems through the existing lazy single mixer; District 12 deliberately reuses the finale-compatible group instead of loading more catalog audio at startup.

Neural cartridges persist online/target parameters, optimizer state, bounded real replay, counters and their practice PRNG state. Saving that generator state fixed a real browser defect where cancellable 20-episode worker checkpoints diverged from uninterrupted seeded training; a regression test now requires identical final parameters and counts. Saves/imports accept the larger validated neural payload up to 6 MiB, retain compatible demonstrations and experience, and reject stale state/reward/runtime contracts. The development-only Backquote/Tilde preview shortcut now advances sequentially through L60 and remains stripped and asserted absent from `dist/`.

Fresh observed verification on Windows, Node.js v22.18.0, npm 10.9.3, Playwright 1.62.1 and installed Chrome 153.0.8010.54:

- `node scripts/author-chapters-9-12.mjs` and `npm run sync:content`: PASS - authored and synchronized L41-L60 into the 60-level runtime and production review mirrors. District 12 carries `original-extension` alignment metadata rather than a fabricated lecture mapping.
- `npm run check`: PASS - 40 JavaScript syntax checks, 2,777 content/asset/audio/animation checks, all 74 Node tests, a 139-file / 50,440,108-byte (48.10 MiB) lean static build, and all 13 reported real-Chrome results. The source flow ran genuine L41 DQN training, recorded and trained an L51 player lesson, completed L60's autonomous three-shield delivery and physical Patch extraction, and observed the restored-city ending. Production flows loaded below `/echo-heist/`, started native module workers and reloaded persisted DQN and cloning snapshots. No captured console error, page exception, failed request or HTTP status failure occurred.
- `npm run test:rl`: PASS as execution - 369 rows written to `evidence/rl-audit.json`. The 15 new DQN authored-seed evaluations for L41-L50 and L56-L60 all delivered from frozen snapshots at or below 10,000 real transitions; the five declared player-format Chapter 11 audit lessons all trained clones that delivered. Historical weak seeds in Chapters 5, 6 and 8 remain in the file and are not relabelled as passes. This one-seed-per-new-mission development cohort is not a holdout or mastery claim.
- `C:\Users\TeddyLazebni_mwmf8h4\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe scripts/make_layout_previews.py`: PASS - regenerated coordinate-labelled JSON/PNG previews for all L01-L60. The later L60 balance edit changed only the laser's active phase, not preview geometry.
- `npm run validate:handoff`: PASS - 1,171/1,171 structural file/link/hash checks, 155 audio cues, 11 supplied chapter briefs, all 55 supplied campaign brief IDs and 306 relative Markdown links. District 12 is runtime-original, so it intentionally does not invent a twelfth supplied brief. This validator is not browser, learning, listening or playtest evidence.

The first full browser run exposed and retained a genuine failure: L60's DQN checkpoint batches restarted training randomness and the frozen courier was caught by the final beam. The checkpoint PRNG state and worker seeding were repaired, exact batch equivalence was added to the Node suite, and the phase-six beam was balanced to authored active phase 3 after both Node and Chrome development-seed runs. The final full browser rerun passed. This is defect/tuning evidence, not a claim that all unseen seeds are robust.

No commit, push, publication, deployment, credential, account or external-service action occurred.

## Current remaining gates and next bounded task

Only installed Chrome was automated. Firefox, Safari, Edge, mobile browsers, representative student hardware, actual user-driven OS tab hiding, zoom/high-DPI, assistive technology and full remapping, localStorage quota/multi-tab conflicts, long heap/resource soak, subjective audio balance, novice playtesting, and a live GitHub Pages deployment remain unchecked. The new neural missions have authored-seed development evidence only; they still need a declared fresh multi-seed holdout that is not used for tuning. LocalStorage remains the persistence implementation.

Next bounded task: run the Chapters 9-12 neural holdout and representative-hardware/browser matrix, record failures without seed selection, and tune only against a separately declared development cohort before any authorized publication.

## Chapters 6-8 outcome - 2026-09-27

Echo Heist now contains 40 sequential playable missions across eight progressively unlocked districts. L26-L30 implement linear semi-gradient SARSA with relational, absolute, coarse, fine and deliberately cargo-blind feature cartridges. L31-L35 build empirical transition/reward tables from real experience and run Dyna-Q planning only against those learned tables, with separately counted real transitions/model updates and explicit retain/recent/reset behavior after machine revisions. L36-L40 implement stable-softmax REINFORCE, an optional learned value baseline and actor-critic with separate actor/critic parameters and fresh on-policy trajectories. Every visible dispatch freezes a compatible snapshot and continues through the shared `src/sim/core.js` transition kernel.

Fifteen distinct canonical 16x10 maps, review copies and coordinate-labelled previews were added for Modular Foundry, Clockwork Docks and Skybridge. The district-first lift now exposes eight chapter-aware menu themes; the renderer has matching top-down palettes and algorithm contracts. Three synchronized music stem groups were added to the existing single mixer and remain lazy by active chapter. Advanced cartridges are bounded and validated on import, survive reload, preserve compatible retry experience, and reject stale feature/reward/environment contracts. The lean static allowlist now includes the three advanced learner modules and only their referenced runtime art/audio.

For local campaign review, Backquote/Tilde now marks exactly the next sequential mission complete, persists the updated frontier, and refreshes the current menu/map or advances an active mission. It reports each preview completion visibly and stops after L40. This developer shortcut is placed below the production-strip marker and is explicitly asserted absent from `dist/`; the released game retains no fake-victory key.

Fresh observed verification on Windows, Node.js v22.18.0, npm 10.9.3, Playwright 1.62.1 and installed Chrome 153.0.8010.54:

- `node scripts/author-chapters-6-8.mjs` and `npm run sync:content`: PASS - authored and synchronized L26-L40 into the 40-level runtime and production review mirrors.
- `npm run lint`, `npm run validate:content`, and `npm test`: PASS - 36 JavaScript syntax checks, 1,852 content/asset/audio/animation checks, and all 69 Node tests. The new tests cover genuine feature aliasing, linear weight updates, empirical-only model outcomes, revision memory, normalized softmax/gradient signs, actor/critic separation, frozen evaluation, source recipes and actual ESM workers.
- `npm run test:browser`: PASS - all 11 reported results (ten subflows plus the parent) in real Chrome. Source UI flows cleared L01-L40 through public controls and real module workers, verified district locks and all eight themes, and captured no console, page, request or HTTP failures. The new shortcut check completed L01-L05, observed the Transit Depot menu, reloaded persisted progress, and advanced L06 with Shift+Backquote. Production flows loaded below `/echo-heist/`, ran Chapter 6 linear, Chapter 7 Dyna and Chapter 8 policy-gradient module workers, and reloaded a real persisted Chapter 7 snapshot. The final build contained 128 files / 40,780,031 bytes (38.89 MiB), with the shortcut absent.
- `npm run test:rl`: PASS as execution - 349 rows written to `evidence/rl-audit.json` (the prior 229 plus 120 Chapter 6-8 seeded rows). Every default/source recipe stayed within its real-transition cap and delivered: Chapter 6 at or below 6,000, Chapter 7 below 4,000, and Chapter 8 at or below 6,400. The broader eight-seed cohort was not universally robust: L26 delivered 7/8, L30 3/8, L38 2/8, L39 7/8 and L40 3/8 frozen evaluations; L27-L29, L31-L37 all delivered 8/8. These failures remain in the evidence and are not discarded or called mastery.
- `C:\Users\TeddyLazebni_mwmf8h4\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe scripts/make_layout_previews.py`: PASS - regenerated coordinate-labelled JSON/PNG previews for all L01-L40. The system `python` alias was unavailable, so the bundled runtime was used.
- `npm run validate:handoff`: PASS - 1,171/1,171 structural file/link/hash checks, 155 audio cues, 11 chapter briefs, all 55 campaign brief IDs and 306 relative Markdown links. This validator is not browser, learning, listening or playtest evidence.

Evidence screenshots under `evidence/browser-chapters6-8/` show the Foundry, Docks and Skybridge lift treatments and the eight-district clear state. No commit, push, publication, deployment, credential, account or external-service action occurred.

## Current remaining gates and next task

The weak L26/L30/L38-L40 seeded policies require declared fresh tuning/holdout cohorts; the current evidence is reproducibility data, not student mastery or educational-effectiveness evidence. Only installed Chrome was automated. Firefox, Safari, Edge, mobile browsers, representative hardware, actual user-driven OS tab hiding, zoom/high-DPI, assistive technology and remapping, localStorage quota/multi-tab conflicts, long heap/resource soak, subjective audio balance, novice playtesting, and a live GitHub Pages deployment remain unchecked. LocalStorage remains the persistence implementation.

Next bounded task: implement Chapter 9, L41-L45, from M08 using the existing compact neural backend with real replay and target-network separation. Preserve the shared worker/simulation contract and browser-verify one chapter before expanding into Chapter 10.

## Historical Chapters 3-5 and menu redesign outcome - 2026-09-27

Echo Heist now contains 25 sequential playable missions across five districts. The main menu uses new transparent Echo Heist logo/title artwork, no credits route or footer, and a visual treatment keyed to the player’s current district. Mission selection is district-first: choose one of five progressively unlocked districts, then choose among its five missions.

L11-L15 implement the known-model planning brief with real policy improvement, policy iteration, and synchronous value iteration. L16-L20 implement model-free prediction from immutable fixed behavior policies using first-visit Monte Carlo, TD(0), and TD(lambda). L21-L25 implement bounded tabular Q-learning and SARSA; L23/L24 deliberately keep matched geometry/reward while changing the update rule. All three chapters use the shared transition kernel for computation/experience and visible delivery, compatible snapshots are frozen on dispatch, retry preserves compatible work, and contract changes invalidate stale cartridges.

Fifteen distinct canonical JSON maps and coordinate-labelled review previews were added for Switchworks, Courier Quarter, and Neon Market. Their renderer palettes, signage, five synchronized chapter stem groups, level feedback, sequential multi-item deliveries, save/import/export validation, chapter unlocks, and lazy single-mixer loading are connected. The release remains an allowlisted static game with no runtime dependency, backend, account, CDN, analytics, or credential use.

Fresh observed verification on Windows, Node.js v22.18.0, npm 10.9.3, Playwright 1.62.1 and installed Chrome 153.0.8010.54:

- `npm run check`: PASS - 31 JavaScript syntax checks, 1,198 content/asset/audio/animation checks, all 61 Node tests, a 116-file / 29,201,900-byte (27.85 MiB) static build, and all eight reported browser results. The source browser flow cleared L01-L25 through the game UI, exercised real module workers, district unlocks, save recovery, and chapter-aware menus. Production flows ran Chapter 3 planning, Chapter 4 prediction and Chapter 5 control workers below `/echo-heist/` with no captured console, page, request, or HTTP failures.
- `npm run test:rl`: PASS - 229 rows written to `evidence/rl-audit.json`: 56 Chapter 1 control rows, 88 Chapter 2 fixed-policy rows, five Chapter 3 exact plans, 40 Chapter 4 prediction rows, and 40 Chapter 5 training-seed rows with ten frozen evaluations each. L11-L15 plans converged and delivered. Chapter 5 jobs stayed below 6,000 transitions; L21, L22 and L25 delivered 80/80 evaluations, while L23 and L24 each delivered 70/80 because one of eight training seeds learned a failing frozen policy. Those weak seeds remain a tuning/holdout gate rather than being discarded.
- `node scripts/author-chapters-3-5.mjs` and `npm run sync:content`: PASS - authored and synchronized L11-L25 into the 25-level runtime and review mirrors.
- `scripts/make_layout_previews.py`: PASS with the bundled Python runtime - regenerated coordinate-labelled JSON/PNG review copies for L01-L25.
- `npm run validate:handoff`: PASS - 1,171/1,171 file/link/hash checks, 155 audio cues, 11 chapter briefs, all 55 brief IDs, and 306 relative Markdown links. This is structural validation, not browser, learning, listening, or playtest evidence.

Evidence screenshots under `evidence/browser-chapters3-5/` show the Switchworks, Courier Quarter and Neon Market lift treatments and all five districts cleared. The two new logo assets are `public/assets/ui/echo-heist-logo-v1.png` and `public/assets/ui/echo-heist-title-v1.png`. The old credits surface and its runtime music entry are removed; the full source audio catalog remains intact.

## Historical Chapters 3-5 remaining gates and then-next task

The Chapter 5 audit is a seeded development cohort, not a holdout or educational-effectiveness result. L23/L24 robustness should be tuned against fresh seeds without choosing winners or changing objectives. Only installed Chrome was automated. Firefox, Safari, Edge, mobile browsers, representative hardware, actual OS-driven tab hiding, zoom/high-DPI, assistive technology and remapping, quota/multi-tab conflicts, long heap/resource soak, subjective audio balance, novice playtesting, live GitHub Pages deployment, and a fresh holdout remain unchecked. LocalStorage remains the persistence implementation. No commit, push, publication, deployment, credential, or account action occurred.

Next bounded task: implement Chapter 6, L26-L30, from M06 with honest representation/function-approximation comparisons and the existing shared worker/simulation boundary. Do not expand into Chapter 7 in that slice.

## Historical Chapter 2 outcome - 2026-09-27

The browser game now contains ten sequential missions across Scrapyard and Transit Depot. L01 remains the disclosed fixed boot check; L02-L05 retain genuine worker-based Q-learning; L06-L10 implement the Chapter 2 known-model curriculum with real fixed-policy evaluation, exact stochastic branches and sampled visible delivery through the same transition kernel. Clearing L05 unlocks L06 and clearing L10 produces the current campaign ending. Chapters 3-11 (L11-L55) are not implemented.

Visible Chapter 2 work includes five distinct canonical maps and coordinate previews, a two-district mission map, Transit Depot scene treatment, synchronized C02 music stems selected through the existing single mixer, scanner/value feedback, train-departure pressure in L10, expanded save/import/export validation, and responsive mission cards. The UI remains a top-down heist with player-controlled Patch, grounded autonomous Echo and a minimal in-level interface.

The M04 risk spike is also complete. `src/agents/neural.js` and `src/training/neural-worker.js` provide a small dependency-free pure-JavaScript backend with explicit dense-network forward/backpropagation, Adam updates, Huber DQN replay/target separation, softmax behavioral cloning, snapshots and cancellation. It is feasibility infrastructure and is not presented as a campaign-trained neural policy.

Fresh observed verification on Windows, Node.js v22.18.0, npm 10.9.3, Playwright 1.62.1 and installed Chrome 153.0.8010.54:

- `npm run check`: PASS - 28 JavaScript syntax checks, 534 content/asset/audio/animation checks, all 55 Node tests, a 105-file / 17,693,214-byte (16.87 MiB) static build, and all six reported browser test results. The browser suite cleared L01-L10 through public controls, exercised native module workers, persistence and recovery, and tested production C01 and C02 under `/echo-heist/` with no captured console, page, request or HTTP failures.
- `npm run test:rl`: PASS - 144 freshly generated rows: 56 Chapter 1 Q-learning/evaluation cases and 88 Chapter 2 exact-policy/sample cases. All cargo-aware L06 runs delivered while all position-only contrast runs timed out; all L07-L10 sampled deliveries completed. L09's near state retained a modelled delivery probability of about 0.99 while producing variable sampled route lengths. This remains a seeded development cohort, not a holdout or educational-effectiveness claim.
- Final `npm run validate:handoff`: PASS - 1,171 file/link/hash checks, 155 audio cues, 11 chapter briefs, all 55 brief IDs and 306 relative Markdown links. This validator is not browser or playtest evidence.
- M04 real-Chrome probe: the 1,200-update DQN fixture completed in 220.6 ms worker time / 304.2 ms wall time with 44 animation frames; the 500-update cloning fixture completed in 71.8 ms / 83.1 ms with 12 frames; both classified 2/2 tiny fixture cases and a separate long job cancelled without completion. The runtime module measured 9,786 bytes. These are feasibility-fixture observations on this machine, not student-hardware benchmarks.
- Reviewed browser evidence is under `evidence/browser-chapter2/`: source L06 before/after evaluation, the ten-mission cleared district map, and the neural probe record. The production browser flow directly loaded C02 at the repository subpath and ran its policy-evaluation worker.

The release remains an allowlisted static game: no documentation, specifications, tests, evidence, scripts, production references or asset inspector are copied to `dist/`. No backend, CDN, account, credentials, deployment, commit, push or publication was used.

## Historical Chapter 2 remaining gates and then-next task

Only installed Chrome was automated. Firefox, Safari, Edge, mobile browsers, representative student hardware, real OS-driven hidden-tab switching, browser zoom/high-DPI, a screen-reader/remapping audit, quota and multi-tab conflict profiles, a long resource/heap soak, subjective audio balance, novice playtesting, a fresh holdout cohort and a live GitHub Pages URL remain unchecked. LocalStorage remains the persistence implementation; an IndexedDB migration is not claimed. Chapter 2 reuses the clean production atlas language with a renderer palette rather than claiming newly reviewed district art.

Next bounded task: implement Chapter 3, L11-L15, from M05 with honest policy improvement, policy iteration and value iteration; author distinct maps and preserve the exact known-model boundary. Do not expand into Chapter 4 in the same slice.

## Historical Phase 1 record

## Phase 1 outcome - 2026-09-27

The five-mission Chapter 1 slice is runnable from source and from the lean static build. A fresh Playwright 1.62.1 suite drove installed Chrome 153.0.8010.54 over normal `http://127.0.0.1` origins, cleared L01-L05 in order through keyboard and semantic UI controls, ran the real ES-module learning worker for L02-L05, and exercised the built game under `/echo-heist/`. No backend, CDN, account, analytics, deployment, later mission, scripted winning policy, or direct success mutation was added.

Implemented and repaired in this phase:

- Added hash routes for landing, lift, district map, settings, credits, and validated mission deep links. Reload, Back/Forward, unknown routes, and locked routes now recover coherently.
- Replaced authoring-only `production/layouts/` mission-card dependencies with compact SVG previews generated from the exact runtime geometry. Improved focus/hover/pressed/selected states, short reduced-motion-aware screen/dialog transitions, volume readouts, mute state, responsive map cards, and stale-toast cleanup.
- Kept the shared `src/sim/core.js` transition boundary unchanged. L01 remains the disclosed boot check; L02-L05 still use real Q-learning. Deploy now snapshots an isolated deep copy of the Q table for the visible attempt. Cartridge records include a content/observation/reward contract and reset only incompatible learned data; curiosity edits and retry retain compatible experience.
- Hardened worker cancellation with cancel-plus-terminate, message-error handling, job/revision stale-result guards, visibility/freeze lifecycle cleanup, and no partial checkpoint commit. Audio remains one mixer, starts correctly after the first gesture even when a screen theme was selected before unlock, caps recorded errors, drops delayed effects from obsolete scenes, and lazily fetches only named runtime cues.
- Added bounded hash-safe local-save browser coverage for reload/Continue, export, invalid import, New Game, valid import, storage write failure, mute/volume persistence, and cartridge retention. The existing localStorage save architecture remains; this phase does not claim the original IndexedDB requirement.
- Replaced the broad copier with a release allowlist. `dist/` contains 98 files / 13.29 MiB: runtime code, selected art/audio, and `.nojekyll`. It excludes `production/`, specifications, docs, evidence, scripts, tests, the asset inspector, editable art, and development browser probes.
- Added `tests/browser.e2e.js`, pinned `playwright` 1.62.1 in the lockfile, and made `npm run check` include the real browser suite. Captured reviewed screens are under `evidence/browser-phase1/`.
- After an in-app browser reused the pre-Phase-1 `FleetRL` shell at the unchanged loopback URL and showed a blank page, the local source/preview server was changed to return `Cache-Control: no-store, max-age=0` plus legacy no-cache headers. A cache-busted live reload showed the current landing screen, and the Enter control opened the lift menu normally.

## Fresh Phase 1 verification

Environment: Windows, Node.js v22.18.0, npm 10.9.3, Playwright 1.62.1, installed Chrome 153.0.8010.54.

- Initial untouched baseline: `npm run check` passed its inherited 35 Node tests and broad build; `npm run validate:handoff` failed on the stale `MANIFEST.md -> PLANS.md` link. The manifest paths were repaired rather than hiding the failure.
- Final `npm run check`: passed 23 JavaScript syntax checks, 311 content/asset/audio/animation checks, all 37 Node tests, the 98-file lean build, and all 4 Chrome test results (three Phase 1 subflows plus their parent test). The browser run took about 52 seconds.
- `npm run test:rl`: all 56 seeded training/evaluation cases completed. L02 delivery-priority, L03 far, L04 curious, and all L05 runs delivered; deliberately contrasting L03 near and L04 familiar runs collected scrap as recorded. This is the specified cohort, not a holdout or learning-effect study.
- Final `npm run validate:handoff`: 1,165 file/link/hash checks passed, covering 155 audio cues, 11 chapter briefs, all 55 brief IDs, and 300 relative Markdown links. This validator is not browser or playtest evidence.
- Browser source flow: checked focus/hover/pressed controls; settings persistence; mute and volume; hash Back/Forward; L01 reload persistence; good/bad import and export; safe New Game; storage failure; explicit practice cancel; retry retention; frozen deployment; all five clears; chapter restoration; 1280x720 and 375x812 layouts; and zero captured console, page, request, or HTTP errors.
- Browser production flow: loaded `/echo-heist/`, confirmed the development probe is absent, completed L01, started native module-worker practice in L02, reloaded persisted progress, and observed all same-origin resources below `/echo-heist/` with no captured failures.

The visibility lifecycle listener was exercised in real Chrome with a deterministic `document.hidden`/`visibilitychange` browser test; automated tabs remain reported as visible, so an actual user-driven OS tab switch is still a manual gate. Audio graph creation, lazy fetch/decode, mute/gain behavior, and error-free transitions were automated; subjective listening/balance was not performed.

## Starting point retained

Five runtime missions (L01-L05), landing/elevator-menu/settings/mission selection, top-down Canvas2D rendering, grounded Patch/Echo assets, exact maps, opening interactions, Q-learning in a worker for L02-L05, fixed L01 boot check, frozen delivery, cooperative objectives, retry/pause, saved progress/import/export, and a wired Chapter 1 audio subset.

## Supplied development material

Full specifications for all 55 missions, the original algorithm/testing contracts, one authoritative visual reference and the exact Chapter 1 art/layout/script package. All 155 unique audio cues are present with one selected runtime encoding each; the runtime adapter deliberately exposes only the Chapter 1-2 selections. Additional chapter visuals are not production-ready assets.

## Consolidation changes

Unified the repository and active instructions; added the full design and remaining audio; removed duplicate audio formats, samplers, master files, original ZIPs, obsolete packaging writers and competing instruction roots. Added safe content synchronization and a handoff validator; made the optional map-font selection portable; redirected legacy browser screenshots away from approved production references. Game/simulation/learning behavior was not expanded in this task.

## Pre-Phase1 consolidation evidence (historical)

Executed on the consolidated project using Node.js v22.16.0 and npm 10.9.2:

- `npm run sync:content`: refreshed the five runtime exports/review JSONs and opening strings; canonical game data unchanged.
- `npm run check`: 22 JavaScript syntax checks, 311 content/asset/audio/animation checks, all 35 Node tests passed, and the existing static build completed.
- `npm run validate:handoff`: 1,106 checks passed, including 155 media hashes, 11 chapter stem groups, all 55 brief IDs and 241 relative Markdown file links.
- `npm run test:rl`: 56 seeded training/evaluation runs completed, with actual outcomes in evidence/rl-audit.json and the new run log. This repeats the inherited cohort, not an independent holdout or new evidence of student learning.

Only generated content-export comments/formatting changed under src/; simulation, learning, worker, renderer, UI and mixer logic were preserved. `evidence/handoff-check.log` and `evidence/handoff-validation.json` report new checks; legacy reports retain their prior limitations. No normal-origin browser test or subjective listening check was rerun in this consolidation task.

## Historical Phase 1 limitations and then-next task

Native Canvas2D/ES modules remain the approved implementation; Phaser/Vite and a full IndexedDB checkpoint system are not claimed complete. Fifty later missions and neural/imitation learners are not implemented. Firefox/Edge/Safari, representative student hardware, actual OS tab switching, full remapping/accessibility, browser zoom/high-DPI, subjective audio balance, quota/multi-tab conflicts, fresh holdout learning, and novice playtesting remain open. No publishing occurred.

Next bounded task: Phase 2, the M04 browser-learning risk spike. Prototype a small neural value learner and behavioral-cloning agent behind the existing worker/simulation contract, measure actual latency and cancellation, and keep unfinished chapters locked. Do not expand the public campaign until that feasibility result is recorded.
