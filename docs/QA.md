# Verification and remaining gates

## GitHub Pages deployment preparation - 2026-09-28

```text
npm run build
  PASS - 172 files / 82.04 MiB; index.html, .nojekyll and CNAME present;
         tests/, docs/ and production/ absent from the artifact.

git commit -m "Build and deploy Echo Heist campaign"
  PASS - local release commit created from 1,207 maintained files.

git push origin main
  BLOCKED - HTTP 403. The system credential identifies as TeddySkana, which
            cannot write teddy4445/RL-Course-Game. No remote update occurred.

GitHub public API inspection
  OBSERVED - repository is public on main; Pages is not enabled; has_pages is
             false and the pre-deployment Pages endpoint returns 404.
```

The workflow uses official Pages actions, least-privilege deployment permissions, a locked Node/npm install, validation before packaging, an explicit allowlisted build and artifact assertions. `CNAME` contains only `eh.teddylazebnik.com`; GitHub Pages custom-workflow documentation requires the future hostname to be configured in repository settings as well, and DNS should point `eh` directly to `teddy4445.github.io` without a repository suffix.

No online URL is counted as passing yet. Resume only after the user authenticates an account with repository write/admin access or grants the current `TeddySkana` credential access. Then push, enable **GitHub Actions** as the Pages source, wait for the deployment workflow, and test `https://teddy4445.github.io/RL-Course-Game/` plus its module worker/assets before configuring the custom hostname.

## Public landing-page visual and browser pass - 2026-09-28

Environment: Windows; Node.js v22.18.0; npm 10.9.3; Playwright 1.62.1; installed Chrome 153.0.8010.54.

```text
npm run check
  PASS - 50 syntax checks; 19,348 content/asset/audio/animation checks;
         5,955 executable solution checks; 100/100 Node tests; 171-file /
         82.04 MiB allowlisted build; 14/14 reported real-Chrome results.
         Browser section: 390.5 seconds.

ECHO_BROWSER_ONLY='shell, settings, saves, all five missions' npm run test:browser
  PASS - focused source landing/Chapter 1 scenario after test-order repair;
         desktop and 375x812 landing checks, scroll navigation, button states,
         menu/settings/save flow and all five Chapter 1 missions.

ECHO_BROWSER_ONLY='lean production build: /echo-heist/ assets' npm run test:browser
  PASS - generated landing assets, native module worker, persistent play and
         relative resources loaded from the repository subpath.

npm run validate:handoff
  PASS - 1,171/1,171 structural checks; 155 audio cues; 11 supplied chapter
         briefs; 55 supplied mission IDs; 306 relative Markdown links.
```

The source landing assertions require all three major headings, both inline generated images, the CSS hero background through normal resource error tracking, smooth-scroll movement, keyboard focus, hover/pressed feedback and no horizontal overflow at 375×812. In-app inspection separately reviewed the 1280×720 hero, learning and story compositions. The first focused attempt failed only because its new mouse scroll check preceded the existing keyboard focus-visible assertion; reordering those independent checks produced the passing focused and later unfiltered runs.

Still open: real phone/touch review, Firefox/Safari/Edge, representative network throttling and image decode timing, screen-reader review, subjective marketing-copy/art preference, and an authorized deployed GitHub Pages pass. The three images are local runtime assets; no runtime image service or credential is involved.

## Finale Continue regression - 2026-09-28

Environment: Windows; Node.js v22.18.0; npm 10.9.3; Playwright 1.62.1; installed Chrome 153.0.8010.54.

```text
npm run lint
  PASS - 50 JavaScript syntax checks.

npm test
  PASS - 100/100 Node tests.

ECHO_BROWSER_ONLY='real DQN, player demonstrations, and the Eclipse Warden finale' npm run test:browser
  PASS - focused real-Chrome L41/L51/L60 scenario. After the five-stage L60
         completion opened the finale, the test returned to the city and lift,
         pressed Continue, and required #/finale plus the A city wakes heading.
         Selected scenario: 57.2 seconds. Twelve unrelated browser scenarios
         were intentionally skipped.

npm run build
  PASS as part of the focused browser command - 168 files / 75.16 MiB.
```

The defect was routing rather than save loss: campaign completion persisted `L60` in both `completed` and bounded `currentLevel`, while Continue unconditionally called `startLevel(currentLevel)`. Continue now routes completed campaigns to the finale and preserves ordinary in-progress resume behavior. This is focused local Chrome evidence, not a new unfiltered suite, deployment, cross-browser pass or human usability result.

## Executable solutions and progressive relay audit - 2026-09-28

Environment: Windows; Node.js v22.18.0; npm 10.9.3; Playwright 1.62.1; installed Chrome 153.0.8010.54.

```text
npm run author:twin-grid
  PASS - authored and synchronized 60 runtime levels plus 60 development-only
         production/solutions/Lxx.json winning programs.

npm run validate:content
  PASS - 19,348 content/asset/audio/animation checks and 5,955 executable
         solution checks.

npm test
  PASS - 100/100 Node tests.

npm run check
  PASS - 50 syntax checks; 19,348 content checks; 5,955 solution checks;
         100/100 Node tests; 168-file / 75.16 MiB allowlisted build; and
         14/14 reported real-Chrome results. The browser section completed in
         382.1 seconds; source and the
         168-file / 75.16 MiB build passed, including native module workers,
         persistence and relative assets below /echo-heist/.

npm run test:rl
  PASS as execution (exit 0) - L01/L02 timed out 8/8 without EAST and
         delivered 8/8 after Sunrise Tread; L06 remained 0/8 position-only
         versus 8/8 cargo-aware; sampled L60 delivered after exactly 16,000
         real training transitions. Other recorded stochastic timeouts remain
         evidence and are not relabelled as universal mastery.

npm run validate:handoff
  PASS - 1,171/1,171 structural checks; 155 audio cues; 11 supplied chapter
         briefs; 55 supplied mission IDs; 306 relative Markdown links.
```

The solution validator checks every referenced target and room, connected portal reachability, Relay cell carry order, matching Socket, installed capability, active switch/console requirements, district learning mode, Echo-run count, final extraction and exact equality with the canonical Patch route. Required runs progress from two to three, four at L40-L50 and five at L51-L60. Browser route automation loads these solution files rather than maintaining an unrelated guessed path, then still drives the real game controls, workers, frozen policies and objective evaluator. The build allowlist excludes `production/solutions/`, so the files cannot act as a runtime oracle.

R/Train is now available before Patch completes any learning mission's physical contract. Run requires a completed real snapshot. If Patch prerequisites or the required capability are missing, Run is a protected rehearsal using `launch(..., {preview:true})`; delivery, timeout or capture restores the pre-run episode before relay advancement. A new shared-kernel regression test activates an `opensAfterEcho` lever, stands on its portal, presses E and proves Patch remains in the same room until Echo opens that portal.

Retained development failure: the first expanded full-Chrome run passed every group except L60 relay 5. Its honest 10,000-transition DQN job returned 0/12 frozen deliveries and the UI correctly kept Run locked. Seeded local worker probes across all five L60 phases supported a bounded 16,000-transition contract; after authoring 650 requested episodes / 16,000 maximum real transitions, the full unfiltered Chrome run was repeated and passed the five-run finale. No test injected a policy or marked the stage prepared.

Still open: novice comprehension and completion time, Firefox/Safari/Edge, physical mobile/touch, low-end hardware, OS-driven hidden-tab interaction, zoom/high-DPI, screen-reader review, storage quota/multi-tab conflicts, long soak, subjective audio balance, an independently declared holdout and authorized live deployment. Automated contract execution proves an authored route exists; it does not prove that a new player will discover or enjoy it.

## Level 6 recovery run - 2026-09-28

Environment: Windows; Node.js v22.18.0; npm 10.9.3; Playwright 1.62.1; installed Chrome 153.0.8010.54.

```text
ECHO_BROWSER_ONLY='Chapter 2 known-model' npm run test:browser
  PASS - stale L06 cartridge reset; immediate safe rehearsal; unchanged Patch,
         stage and portal state; both real L06 relays and L07-L10 cleared.

npm run check
  PASS - 49 syntax checks; 18,232 content/asset/audio/animation checks;
         98/98 Node tests; 168-file, 75.06 MiB allowlisted build;
         14/14 unfiltered real-Chrome source/production results.

npm run test:rl
  PASS as execution (exit 0) - L06 position-only timed out 8/8 at 0.0000;
         cargo-aware delivered 8/8 in 12 actions at 1.0000.

npm run validate:handoff
  PASS - 1,171/1,171 structural checks; 155 audio cues; 11 supplied
         chapter briefs; 55 supplied mission IDs; 306 Markdown links.
```

The L06 browser assertion opens R at the first decision, requires enabled Train and `Run safe rehearsal`, and requires the cargo-aware scanner button to remain disabled until Pocket Sensor is collected. It runs the real fixed position-only route through the same transition kernel, waits for the explanatory safe-rehearsal result, and confirms that Patch's exact coordinate, Echo stage and `patchPortal2` state are unchanged. It then follows the authored Patch route, installs Pocket Sensor, trains the real policy-evaluation worker, freezes its policy hash, completes relay 1, retrains relay 2, extracts Patch and continues through all five Chapter 2 missions.

The scenario seeds an incompatible old L06 cartridge containing `representation: cargo` and `sense-cargo`; level start must discard both the stale learned contract and those stale controls/capabilities. L06 content 5.3.0 also invalidates a user's older wrong-cartridge save. Current wrong physical-cartridge selections are recoverable with T/Retry rather than becoming a permanent per-level lock.

Interactive in-app inspection at `http://127.0.0.1:4173/` confirmed the repaired controls and the real-time weak rehearsal at 1280×720. This is local inspection only, not a deployment, human usability result, accessibility certification or cross-browser approval.

Retained intermediate failure: the first complete post-change run reached the production L02 worker test with its intentionally bad scrap reward and correctly produced timeouts. The browser test—not the game—was wrong to assume practice alone should override that decision. It now selects `The delivery` explicitly and allows bounded genuine retraining. A targeted production-subpath rerun passed, followed by the final unfiltered pass above.

Still open: novice L06 comprehension/difficulty, Firefox/Safari/Edge, physical mobile/touch, representative low-end hardware, OS-driven backgrounding, zoom/high-DPI, screen-reader review, storage quota/multi-tab conflicts, long resource soak, subjective audio balance, an independent holdout and authorized live deployment. No commit, push, publication, deployment, credential or account action occurred.

## Echo workbench decision/help pass - 2026-09-28

Environment: Windows; Node.js v22.18.0; npm 10.9.3; Playwright 1.62.1; installed Chrome 153.0.8010.54.

```text
npm run refine:echo-flow
  PASS - removed retired practice-budget choices from 34 canonical missions
         and synchronized all 60 production review JSON files.

npm run check
  PASS - 49 syntax checks; 18,232 content/asset/audio/animation checks;
         98/98 Node tests; 168-file, 75.06 MiB allowlisted build;
         14/14 unfiltered real-Chrome source/production results.

npm run test:rl
  PASS as execution (exit 0) - the full seeded development cohort ran.
  Stochastic misses remain recorded in evidence/rl-audit.json and are not
  relabelled as universal mastery.

npm run validate:handoff
  PASS - 1,171/1,171 structural file/link/hash checks; 155 audio cues;
         11 supplied chapter briefs; 55 supplied mission IDs; 306 Markdown links.

npm run typecheck
  NOT PASSED / unavailable - tsc is not installed or available in the pinned
  dependency set (`'tsc' is not recognized`).
```

New Node coverage asserts that practice episode/sweep batches are authored constants regardless of legacy budget values, retired budget data migrates without invalidating a save, and later capability forks contain only current meaningful choices. Existing suites continue to validate real shared transitions, capability-gated late relays, progressive Patch rooms, multi-run Echo stages, enemy observations, frozen delivery and all learner families.

The Chapter 1 source Chrome scenario now opens R at the start of L02, verifies Train and Run are enabled, inspects the algorithm only through `?`, checks that the main panel contains neither `Tabular Q-learning` nor Practice budget, opens per-run Help and requires `The delivery` as L02's exact recommended priority. It runs the weak model immediately, observes active Echo and the Patch-lock overlay, receives the safe Echo reset, trains with the module worker and later confirms Patch cannot move during deployment but can move again afterward. Advancing into L03 asserts that L02's Q table and deployed snapshot did not carry forward. The normal L03 mission route exercises its real lever and portal, and the dedicated L03 failure scenario still returns Echo only while preserving Patch.

The unfiltered browser command clears all 60 source missions and all five production matrices. Production is served below `/echo-heist/`; native module workers, validated reloads and relative game assets pass there. The output remains 168 allowlisted game files and excludes docs, specs, tests, evidence, production references, authoring scripts and the inspector.

Retained development failures: the first targeted browser run expected the previous C01 mechanic heading after its copy changed; the next focused run incorrectly expected an installed capability card before pickup. Both test assumptions were corrected. In-app visual review then found that the first L02 Help implementation repeated the intentionally wrong `Shiny things` default; Help was corrected to `The delivery` and the browser test now asserts that answer. None of those failed/intermediate runs is counted as the final pass.

In-app browser inspection at `http://127.0.0.1:4174/` reviewed the workbench, Help and algorithm inspector at 1280×720. It confirmed the final L02 answer, clear `× Close`, no budget selector and algorithm details isolated behind `?`. This is not a deployed-browser pass, cross-browser approval, human comprehension study or accessibility certification.

Still open: novice comprehension/difficulty, Firefox/Safari/Edge, physical touch/mobile, low-end hardware, OS-driven backgrounding, zoom/high-DPI, screen-reader/assistive-technology review, storage quota/multi-tab conflicts, long soak, subjective audio balance, a separately declared holdout cohort and authorized live deployment. No commit, push, publication, deployment, credential or account action occurred.

## Guided Chapter 1 capability run - 2026-09-28

Environment: Windows; Node.js v22.18.0; npm 10.9.3; Playwright 1.62.1; installed Chrome 153.0.8010.54.

```text
node scripts/refine-chapter-one.mjs
npm run sync:content
  PASS - authored and synchronized the focused L01-L05 Socket capability flow.

npm run check
  PASS - 48 syntax checks; 18,334 content/asset/audio/animation checks;
         96/96 Node tests; 168-file, 75.06 MiB allowlisted build;
         14/14 unfiltered real-Chrome browser results.

npm run test:rl
  PASS as execution (exit 0) - the complete seeded development cohort ran.
  L01 and L02 each timed out 8/8 without EAST and delivered 8/8 after the
  Socket-installed action under the final authored settings. Unrelated later
  stochastic misses remain in evidence/rl-audit.json.

npm run validate:handoff
  PASS - 1,171/1,171 structural file/link/hash checks; 155 audio cues;
         11 supplied chapter briefs; 55 supplied mission IDs; 306 Markdown links.

npm run typecheck
  NOT PASSED / unavailable - tsc is not installed in the pinned dependency set.
```

The Node suite now covers L01's genuine trained delivery, safe Chapter 1 early deployment, cell-to-Socket capability events, save-compatible multi-capability L05 state, honest L02-L05 trained lanes and the existing shared transition/objective/frozen-policy contracts. Content validation sees the synchronized canonical and production JSON; no test mutates mission completion or supplies an oracle policy.

The source Chrome scenario starts from a clean save, reads the prologue, confirms the `?` button and obsolete side status are absent, opens the remaining mechanic/icon reference, opens R before any repair, trains and runs L01's incomplete model, observes the intended safe failure, carries the Relay cell to the Socket, retrains with the real module worker and completes all five Chapter 1 missions. It also cancels a live worker, selects L02's delivery reward, verifies frozen Q-table immutability, persists across reload, imports/exports a save, checks muted audio and hidden-document pause behavior, and observes District 2 unlock. A separate browser case verifies failed L03 delivery resets Echo only while retaining Patch and compatible learning.

The production matrix rebuilds `dist/`, serves it under `/echo-heist/`, verifies that development probes are absent, loads deployment-relative art/audio/modules, runs native module workers, and reloads validated snapshots. The allowlist excludes Markdown, docs, specs, tests, evidence, production references, authoring scripts and the asset inspector. Local source/production HTTP results are not a deployed GitHub Pages claim.

Retained failure: the first complete browser run reached L02 but its repaired α=0.4 Q table timed out on that deterministic visible seed. A focused 16-seed comparison showed the lower α plus a small real progress signal preserved 16/16 unrepaired failures and produced 16/16 repaired deliveries for L01 and L02. After authoring α=0.1/progress=0.4 for those two levels, the focused Chapter 1 Chrome scenario passed and the complete unfiltered 14-result suite was rerun to pass. This tuning changes sampled rewards and Q updates; it does not script actions or bypass the worker.

In-app browser inspection over `http://127.0.0.1:4173/` observed the L01 tutorial, the unified top-first workbench, disabled EAST before repair, native worker progress, 0% frozen checks for the weak model, and the safe-failure dialog. It also confirmed the requested briefing cards and `CAPABILITY MISSING` label were absent. This is local interactive inspection, not a novice study, cross-browser approval or deployed-site pass.

Still open: first-time player comprehension/difficulty for L01-L05, subjective audio review, Firefox/Safari/Edge, physical touch/mobile, representative low-end hardware, real OS-driven backgrounding, zoom/high-DPI, screen-reader/assistive-technology review, storage quota/multi-tab conflicts, long heap/resource soak, a separately declared holdout and authorized live deployment. No commit, push, publication, deployment, credential or account action occurred.

## Echo workbench, E affordance and Echo-hunter run - 2026-09-28

Environment: Windows; Node.js v22.18.0; npm 10.9.3; Playwright 1.62.1; installed Chrome 153.0.8010.54.

```text
npm run author:twin-grid
  PASS - authored and synchronized L01-L60 with the final 20x20 maps,
         rotating learning-contract focus, District 7+ Echo hunters and tuned batches.

npm run check
  PASS - 47 syntax checks; 18,418 content/asset/audio/animation checks;
         96/96 Node tests; 168-file, 75.07 MiB allowlisted build;
         14/14 unfiltered real-Chrome browser results.

npm run test:rl
  PASS as execution after the shared-kernel learning changes.
  Seed-level misses remain recorded and are not a mastery claim.

npm run validate:handoff
  PASS - 1,171/1,171 structural file/link/hash checks; 155 audio cues;
         11 supplied chapter briefs; 55 supplied mission IDs; 306 Markdown links.

npm run typecheck
  NOT PASSED / unavailable: the repository script invokes tsc, but TypeScript
  is not installed in this dependency set.
```

The Node suite now asserts shared E-affordance behavior, red locked interactions, disappearance after a used lever, pre-launch Patch movement not consuming Echo energy, District 7 hunter movement/observation/capture, rotating mission learning focus, real bounded transition budgets and frozen evaluations. The real-Chrome suite clicks the visible Interact control, opens R before collecting a cartridge, verifies the unified state/action/policy/algorithm/hyperparameter view, trains and cancels native workers, completes all 60 source missions, checks hidden-document behavior, and reloads saved advanced cartridges below `/echo-heist/`.

Retained failures: the first browser pass exposed tick-based pre-launch timeouts that made E appear unresponsive; a planning scenario searched for the removed `Compute blueprint` label; L35/L37/L38 relay phases exposed insufficient empirical/on-policy batches; and production reload exposed an oversized auxiliary Dyna model. A test also briefly observed the workbench during its intentional DOM refresh and was tightened to wait for a present, enabled Run control and completed Train state. None of those failed runs is counted as the final pass.

The build script reports no server, runtime CDN, authoring reference or test tool in `dist/`. Local Chrome/subpath results do not establish Firefox/Safari/Edge, deployed GitHub Pages, novice usability, physical touch, assistive technology, subjective audio, long soak, multi-tab/quota conflict or holdout-learning approval.



## Gated-exit and live-model run - 2026-09-28

This section records fresh evidence for the final Echo-gated Patch exit, district-scaled borders, all-floor connectivity, the anywhere-R model terminal, frozen-cohort readiness gate and complete icon glossary. It supersedes earlier counts only for commands rerun here. Environment: Windows; Node.js v22.18.0; npm 10.9.3; Playwright 1.62.1; installed Chrome 153.0.8010.54.

```text
npm run author:twin-grid
  PASS - authored and synchronized connected 20x20 rooms, district border widths,
         final exit gates and interaction-based extraction objectives for L01-L60.

npm run check
  PASS - 47 syntax checks; 18,208 content/asset/audio/animation checks;
         91/91 Node tests; 168-file, 75.04 MiB lean static build;
         14/14 real-Chrome results in the final complete run.

npm run test:rl
  PASS as execution (exit 0) - the complete seeded development cohort ran.

npm run validate:handoff
  PASS - 1,171/1,171 file/link/hash checks; 155 audio cues;
         11 supplied chapter briefs; 55 supplied mission IDs; 306 Markdown links.
```

The content validator now requires a five-tile closed border in C01, four in C02, three in C03 and one in C04-C12 for every Patch and Echo room. It flood-fills all `.` tiles and rejects any disconnected component. The Node integration suite independently starts at each actor spawn or inbound portal and requires its visited set to equal the room's complete floor set. It also requires every level to contain a blocking `exitGate`, an `exitActivated` objective, and an explicit Patch interaction after Echo's final delivery. Core regressions cover a locked pre-delivery exit, gate opening on real delivery, final-tick delivery precedence, post-delivery clock pause and explicit E completion.

The training worker now validates learned snapshots on 12 deterministic frozen runs and returns deliveries, trials, probability and individual outcomes. The UI enables dispatch only at or above 67% measured delivery; exact planners retain their exact computed probability. Repeat practice preserves compatible learner state. The saved-cartridge validator bounds and retains those statistics for tabular, prediction, planning and advanced snapshots. A Node contract test verifies that practice is unlocked by the physical capability without `activeDock`, while deployment still requires the real shutter/receiver/stage conditions.

The source Chrome matrix presses R before collecting L02's cartridge, verifies the live input-state, action-space, policy, algorithm and hyperparameter sections, and confirms practice is disabled. After physical setup it runs and cancels a real worker, trains until the measured threshold is crossed, freezes the snapshot and verifies visible delivery does not mutate it. The `?` screenshot verifies the scrollable shipped-art icon glossary. L01 and all later browser paths now wait for Echo's work, then move Patch through the opened door and press E; no mission is completed by test mutation.

The production matrix rebuilds `dist/`, verifies that the development probe is absent, uses actual keyboard timing, loads native module workers below `/echo-heist/`, persists and reloads tabular/planning/feature/Dyna/policy-gradient/DQN/cloning snapshots, and observes only project-subpath resources. An accessible screen-reader status announces `Echo relay N of M` as ready, running, trained or delivered; production tests use that player-facing state rather than hidden runtime access. The allowlist still excludes documentation, specs, tests, evidence, authoring tools, references and the asset inspector.

Retained development failures: final-tick delivery initially timed out; final delivery could enter an intermediate Echo portal; browser paths still assumed five touch buttons, automatic extraction and a dock-only model; production training clicks could cancel a worker before it finished; and next-room Patch text could be mistaken for Echo relay completion. Those defects were repaired at the shared-kernel, UI or public-status/test boundary and rerun. A targeted run also recorded transient `ERR_NO_BUFFER_SPACE`, and a host-suspension run recorded `ERR_NETWORK_IO_SUSPENDED`; neither is called a passing result. The final unfiltered `npm run check` passed all 14 browser results without failed requests.

Reviewed local evidence: `evidence/browser-phase1/source-icon-guide.png` and `source-echo-terminal.png`. These are 1280×720 local Chrome captures, not design approval, a novice playtest or a deployed-site check.

Still open: novice comprehension and balance, subjective audio, Firefox/Safari/Edge, physical mobile/touch, representative hardware, real OS-driven hidden-tab behavior, zoom/high-DPI, screen-reader and assistive-technology audit, quota/multi-tab conflicts, long resource/heap soak, a fresh declared holdout and authorized live GitHub Pages deployment. No commit, push, publication, deployment, credential or account action occurred.

## Twin-grid capability run - 2026-09-28

This section records fresh evidence for the independent equal-size 20x20 Patch/Echo fields, coordinate-preserving room portals, physical capability forks, dock lock feedback, level story gates and generated sprite strips. It supersedes earlier counts only for commands rerun here. Environment: Windows; Node.js v22.18.0; npm 10.9.3; Playwright 1.62.1; installed Chrome 153.0.8010.54.

```text
npm run author:twin-grid
  PASS - authored and synchronized independent 20x20 Patch/Echo room sets,
         same-coordinate portals and physical cartridge forks for L01-L60.

npm run check
  PASS - 47 syntax checks; 17,014 content/asset/audio/animation checks;
         88/88 Node tests; 168-file, 78,645,090-byte (75.00 MiB) lean build;
         14/14 reported real-Chrome results.

npm run test:rl
  FIRST RUN FAILED - L51's obsolete hard-coded pre-20x20 audit lesson did not deliver.
  FINAL PASS AS EXECUTION - 369 rows written to evidence/rl-audit.json after the
         development audit derived and transition-validated player-format routes.

npm run lint
node --test tests/deep-learning.test.js tests/integration.test.js
  PASS - 47 syntax checks and 26/26 focused tests after the audit repair.

npm run validate:handoff
  PASS - 1,171/1,171 file/link/hash checks; 155 audio cues;
         11 supplied chapter briefs; 55 supplied mission IDs; 306 Markdown links.
```

The Node suite requires every mission to expose two complete, independent 20x20 fields; verifies that Patch and Echo cannot cross field boundaries; checks same-coordinate Patch portals, Echo-powered gates, physical cartridge requirements, mutually exclusive sibling locks, save-compatible real control contracts and reachability through every authored room; and retains deterministic shared-kernel, frozen-policy and objective-separation checks. The Chapter 11 audit repair imports `walkable` and routes only to the next authored required entity, recording each pre-action feature vector before sending the action through `step`. It is development audit code, not a hidden runtime teacher or winning policy.

The source Chrome matrix passed shell/settings/save/import/export/audio/cancellation/reload coverage, all 60 mission flows, local Echo retry, district unlocks, the preview shortcut, advanced workers, player demonstration recording and the finale. The production matrix rebuilt the explicit allowlist and passed native ES-module worker, persistence and relative-asset cases below `/echo-heist/` for Chapters 1-9 plus behavioral cloning. The final run captured no console errors, page exceptions, failed requests or HTTP responses at 400 or above.

The 168-file release contains the ten district-specific story bitmaps under `public/assets/ui/story/` and four animated transparent strips under `public/assets/characters/generated/`. Build assertions continue to exclude Markdown, docs, specs, tests, evidence, production references, authoring scripts, the inspector and development probes. Assets are local and deployment-relative; no runtime image service, account, API key, CDN or backend is present.

In-app browser inspection used the normal `http://127.0.0.1:4173/` source server with a fresh build query. It observed the District 7 story gate and generated Clockwork Docks art, then the two unframed equal-size full-map canvases with the refreshed `v=1.1.0` module graph. This is a local interactive check, not a live GitHub Pages or cross-browser pass.

The final seeded audit is intentionally not labelled universal success. Its five map-derived Chapter 11 demonstrations and frozen clones delivered, while established weak training seeds and the L44 authored-seed DQN timeout remain in `evidence/rl-audit.json`. The 1,171 handoff checks are structural only. Still open: novice usability/difficulty, subjective listening, Firefox/Safari/Edge, physical touch/mobile and representative hardware, real OS backgrounding, zoom/high-DPI, assistive technology, storage quota/multi-tab conflicts, long heap/resource soak, a fresh declared holdout and an authorized deployed-site test. No commit, push, deployment, publication, credential or account action occurred.

## Adaptive-relay, prologue and finale run - 2026-09-28

This section records fresh evidence for the room-filling Patch camera, five-button HUD, real configurable cartridge properties, physical relay power gates, revised L03-L07 ramp, one-time prologue and completion-gated L60 epilogue. It supersedes earlier counts only for commands rerun here. Environment: Windows; Node.js v22.18.0; npm 10.9.3; Playwright 1.62.1; installed Chrome 153.0.8010.54.

```text
node scripts/expand-patch-campaign.mjs
node scripts/author-dual-room-flow.mjs
node scripts/author-relay-power-puzzles.mjs
npm run sync:content
  PASS - authored/synchronized the revised early room ramp, L02-L60 power cells/sockets
         and one/two/three-run staged relay requirements.

C:\Users\TeddyLazebni_mwmf8h4\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe scripts/make_layout_previews.py
  PASS - regenerated coordinate-labelled review JSON/PNGs for L01-L60.

npm run check
  PASS - 45 syntax checks; 5,809 content/asset/audio/animation checks;
         87/87 Node tests; 153-file, 50.02 MiB lean static build;
         14/14 reported real-Chrome results.

npm run test:rl
  PASS as execution - 369 seeded rows written to evidence/rl-audit.json.

npm run validate:handoff
  PASS - 1,171/1,171 file/link/hash checks; 155 audio cues;
         11 supplied chapter briefs; 55 supplied mission IDs; 306 Markdown links.
```

The Node suite verifies that a relay socket cannot power without Patch physically carrying the matching cell, that Patch-only power/security state does not leak into Echo's observation, and that sensor/reward selections alter the actual encoded or rewarded learner contract. Existing tests continue to cover deterministic shared transitions, real worker jobs and cancellation, frozen deployment, bounded replay/target copies, player-only cloning, save validation, objective separation, final boss shields and static reachability through every declared Patch route.

The source Chrome matrix asserts the one-time prologue, one logo, absent scan/status UI, exactly five centered touch buttons, multiple simultaneous cartridge-control rows, settings persistence, save export/import, hidden-document pausing, local Echo recovery, multi-stage relay preparation, all 60 mission clears and the final `#/finale` route. The finale scenario runs real DQN, a successful player-recorded cloning lesson and L60's three shield relays before checking the generated-art epilogue. The story contains 236 words and is not reachable from an incomplete save.

The lean production matrix rebuilds from the explicit allowlist and checks actual keyboard play, native module-worker loading, restored snapshots and relative resources below `/echo-heist/`. `dist/` contains 153 game files / 50.02 MiB, including the generated finale bitmap and the one sleeping-Echo prologue frame. It excludes Markdown, Python, docs, specs, evidence, tests, authoring scripts, the inspector and development probes. No runtime CDN, account, API key or network image service is present.

Retained failures from development runs: an exact-text assertion could not match the numbered cartridge label; the new prologue requested an Echo charge SVG omitted from the release allowlist and produced a real production 404; the old L06 paths attempted extraction after the first of two relays; and the finale driver read state after routing had intentionally cleared the completed mission. Each failure was fixed at the accessibility assertion, release boundary, multi-stage flow or route synchronization boundary and rerun. The final complete `npm run check` passed. These failed runs are not relabelled as passing evidence.

The in-app browser was refreshed at the normal loopback HTTP origin with a new cache query. Its observed L02 view showed Patch's current access bay filling the left panel, the autonomous Echo grid filling the right, no scanner or Echo status sidebar, and left/up/right/down/E controls centered underneath. Automated 1280×720 evidence also showed the finale story window readable over the generated dawn/citadel art. This is local inspection only; it is not a deployed-browser or novice-playtest claim.

Still open: first-time human comprehension and decision-load testing; subjective difficulty and audio balance; Firefox, Safari, Edge, physical mobile/touch and representative low-end hardware; real user-driven OS backgrounding; zoom/high-DPI and assistive technology; quota/multi-tab conflicts; long resource/heap soak; fresh holdout learning; and an authorized live GitHub Pages deployment. No commit, push, publication, credential or account action occurred.

## Dual-panel staged-relay run - 2026-09-27

This section records fresh evidence for the independent Patch/Echo cameras, portal room changes, repeated stage-specific Echo training, text-only mission cards and the removal of the two persistent screenshot-marked guidance blocks. It supersedes earlier counts only for commands rerun here. Environment: Windows; Node.js v22.18.0; npm 10.9.3; Playwright 1.62.1; installed Chrome 153.0.8010.54.

```text
node scripts/expand-patch-campaign.mjs
node scripts/author-dual-room-flow.mjs
npm run sync:content
  PASS - regenerated and synchronized L08-L60 progressive rooms and staged relays.

C:\Users\TeddyLazebni_mwmf8h4\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe scripts/make_layout_previews.py
  PASS - regenerated coordinate-labelled review JSON/PNGs for L01-L60.

npm run test:rl
  PASS as execution - 369 seeded audit rows written to evidence/rl-audit.json.

npm run check
  PASS - 43 syntax checks; 4,851 content/asset/audio/animation checks;
         85 Node tests; 150-file, 47.45 MiB lean build;
         14/14 reported real-Chrome results.

npm run validate:handoff
  PASS - 1,171/1,171 file/link/hash checks; 155 audio cues;
         11 supplied chapter briefs; 55 supplied mission IDs; 306 Markdown links.

# Post-check cache-coherence patch (0.8.1)
npm run lint && npm test && npm run build
  PASS - 43 syntax checks; 85 Node tests; 150-file, 47.45 MiB build.

$env:ECHO_BROWSER_ONLY='shell, settings'; node --test tests/browser.e2e.js
$env:ECHO_BROWSER_ONLY='/echo-heist/ assets'; node --test tests/browser.e2e.js
  PASS - refreshed source shell/Chapter 1 and production subpath worker/persistence scenarios.
```

The Node suite now verifies stage-gated deployment, Echo-powered portals, relay delivery without false final-receiver activation, prepared-stage save validation, post-delivery budget pausing, checkpoint patrol recovery and Patch-only state exclusion from Echo observations. Content/integration checks require L08-L30 to expose two real relay stages, L31-L60 three, and every declared Patch route and extraction corridor to remain reachable.

The Chrome source campaign uses real module workers and the public command path to clear all 60 missions. It asserts two canvases, no `.role-legend` or `.hint-strip`, an accessible on-demand mission briefing, text-only mission cards, staged dock availability, real practice before each new stage, frozen deployment, local relay reset, portal progression and physical Patch extraction. A shared-kernel patrol planner is used only by the test driver to time grounded enemies; it does not alter runtime state or fabricate completion. `ECHO_BROWSER_ONLY` and `ECHO_BROWSER_LEVEL` can select a bounded browser scenario during diagnosis; the final `npm run check` leaves them unset and runs the complete matrix.

The production cases rebuild the allowlisted game, load it below `/echo-heist/`, run native module workers, dispatch a persisted frozen cartridge after reload, train later relay stages, and confirm all observed same-origin resources stay under the repository subpath. The artifact excludes documentation, specifications, evidence, tests, authoring scripts, the inspector and development progress/probe code.

Retained failures from development runs: L10's deployment clock exhausted during Patch extraction; L44's generated patrol occupied a wall; L60's test driver over-blocked a dynamic patrol lane; and the production persistence scenario needlessly retrained an already prepared DQN snapshot to its lifetime cap. Each was repaired at the rule/authoring/test-contract boundary and rerun. These failures are not relabelled as passes.

Still open: novice playtesting, subjective puzzle variety and audio balance, Firefox/Safari/Edge/mobile, real touch, representative hardware, actual OS-driven hidden-tab behavior, zoom/high-DPI, assistive technology, storage quota/multi-tab conflict, long resource/heap soak, fresh holdout learning and an authorized live deployment. No commit, push, publication, credential or account action occurred.

## Progressive Patch infiltration run - 2026-09-27

This section records fresh evidence for the L08-L60 multi-room Patch routes, required security switches, checkpoint recovery, and deterministic patrol enemies. It supersedes earlier counts only for commands rerun here. Environment: Windows; Node.js v22.18.0; npm 10.9.3; Playwright 1.62.1; installed Chrome 153.0.8010.54.

```text
node scripts/expand-patch-campaign.mjs
  PASS - authored/idempotently normalized L08-L60 progressive Patch layouts.

npm run sync:content
  PASS - synchronized all 60 canonical levels and opening strings.

C:\Users\TeddyLazebni_mwmf8h4\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe scripts/make_layout_previews.py
  PASS - regenerated coordinate-labelled review JSON/PNGs for L01-L60.

npm run test:rl
  PASS as execution - 369 rows written to evidence/rl-audit.json.

npm run check
  PASS - 42 syntax checks; 4,602 content/asset/audio/animation checks;
         80 Node tests; 150-file, 47.34 MiB lean build;
         14/14 reported real-Chrome results.

npm run validate:handoff
  PASS - 1,171/1,171 file/link/hash checks; 155 audio cues;
         11 supplied chapter briefs; 55 supplied mission IDs; 306 Markdown links.
```

The content tests assert that the campaign grows from two to seven Patch rooms, selected milestones contain patrol escalation, and every declared switch/dock/core/exit remains reachable in order with the authored doors. Core tests require every room switch before deployment, verify that patrol contact returns Patch to the last checkpoint without mission failure, and verify that opening Patch-only doors does not alter the encoded Echo observation. The original Echo-map dimensions are retained separately for feature normalization, so increasing the visible Patch floor does not silently rescale neural or linear inputs.

The source Chrome flow cleared all 60 missions through the new route helper, real preparation requirements, native module workers, frozen deployment, and physical extraction. Production flows rebuilt the allowlisted game, loaded it under `/echo-heist/`, paced actual keyboard movement through representative expanded rooms, started native module workers, and reloaded persisted snapshots. The release still excludes documentation, evidence, tests, authoring scripts, the asset inspector, and development probes. No console error, page exception, failed request, or HTTP status failure was captured.

The first updated browser run was retained as a real test-harness failure: movement keys were enqueued faster than the 230 ms game loop and the helper overshot its expected coordinates. The helper now invokes the same game command entry point synchronously for source campaign throughput and deliberately waits between keyboard events when exercising the probe-free production build. The direct rerun and the final `npm run check` rerun both passed all 14 reported results.

The seeded learning audit completed after the geometry changes. The new Patch-only gates and patrols are absent from Echo observations/actions, and established outcome contrasts plus historical weak seeds remain in the 369-row evidence. This is not a claim that every unseen seed succeeds. In-app inspection at `http://127.0.0.1:4173/?build=patch-rooms-final-20260927#/play/L08` observed the new room/lock objective copy and checkpoint guidance on the running production build; no novice usability approval is inferred.

Still open: subjective difficulty and patrol fairness; final-map legibility at narrow sizes; real touch play; Firefox, Safari, Edge and physical mobile coverage; representative hardware; actual user-driven OS tab switching; zoom/high-DPI; assistive technology; quota/multi-tab conflicts; long resource/heap soak; subjective audio balance; a fresh holdout; and authorized live deployment. No commit, push, publication, credential or account action occurred.

## District identity and early-game recovery run - 2026-09-27

This section records fresh evidence for the district-art, split-playfield, L03-L07 maze, role-feedback, and L01-L07 Echo-recovery changes. It supersedes earlier counts only for commands rerun here. Environment: Windows; Node.js v22.18.0; npm 10.9.3; Playwright 1.62.1; installed Chrome 153.0.8010.54.

```text
node scripts/author-district-backdrops.mjs
  PASS - authored 12 local SVG district scenes.

npm run sync:content
  PASS - synchronized all 60 canonical levels and opening strings.

C:\Users\TeddyLazebni_mwmf8h4\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe scripts/make_layout_previews.py
  PASS - regenerated coordinate-labelled review JSON/PNGs for L01-L60.

npm run check
  PASS - 41 syntax checks; 2,897 content/asset/audio/animation checks;
         75 Node tests; 150-file, 47.17 MiB lean build;
         14/14 reported real-Chrome results.

npm run test:rl
  PASS as execution - 369 rows written to evidence/rl-audit.json.

npm run validate:handoff
  PASS - 1,171/1,171 file/link/hash checks; 155 audio cues;
         11 supplied chapter briefs; 55 supplied mission IDs; 306 Markdown links.
```

The Node/content checks now require every L01-L60 geometry to contain both Patch-only `p` and Echo-only `e` traversable tiles and require each actor to spawn on its own tile type. The unchanged L01 reference trace still completes after the shared floor was divided. Genuine L02-L05 Q-learning still produces completing policies for the delivery settings. Canonical L03-L07 Patch layouts are no longer identical, and the browser setup helper reaches each lever, console, and dock through real keyboard input using the authored collision map instead of assuming one fixed route.

The source Chrome flow asserted one `echo-heist-title-v1.png` brand in the menu, no secondary menu title, no top-right menu badge, the Scrapyard menu scene, twelve distinct computed district-card backgrounds, a Transit scene after the saved frontier moved from L05 to L06, the game district backdrop, and the Patch/Echo role surface. It then completed all revised Chapter 1 missions through public controls. A separate L03 case chose `Right now`, ran 1,800 real practice episodes, dispatched the resulting frozen Q-table, and observed the real terminal scrap outcome. The recovery dialog appeared with Echo reset to the dock; Patch's complete actor object and the trained Q-table matched their pre-dispatch values, `failed` was false, and the player could reopen the dock to change the choice. No state mutation or injected policy was used to produce the failure.

The complete source suite subsequently cleared all 60 missions and exercised tabular, exact-model, prediction, linear, Dyna, policy-gradient, DQN, and player-demonstration workers. The production suite rebuilt the allowlisted artifact, loaded it below `/echo-heist/`, started native module workers, persisted/reloaded snapshots, and confirmed observed same-origin resources stayed under the repository subpath. The twelve new backdrop SVGs are present in `dist/public/assets/ui/districts/`; the replaced `echo-heist-logo-v1.png` is absent from `dist/`; documentation, evidence, tests, authoring scripts, development probes, and the asset inspector remain excluded. No console error, page exception, failed request, or HTTP status failure was captured.

The fresh RL audit retains the designed early contrasts rather than interpreting every delivery as success: L03 `near` and L04 `familiar` ended at terminal scrap in 8/8 seeded evaluations, while L03 `far` and L04 `curious` delivered in 8/8. L06 position-only timed out 8/8 and cargo-aware delivered 8/8. Later weak-seed outcomes remain in the audit. The command completing successfully means the declared reproducibility cohort executed and was recorded; it is not a universal robustness, holdout, or educational-effectiveness pass.

Manual in-app inspection at `http://127.0.0.1:4173/` observed the revised Eclipse menu, the twelve visually distinct district cards, and L03's labelled split fields/new Patch maze/Scrapyard atmosphere. No human novice session, subjective audio approval, deployed GitHub Pages check, or non-Chrome browser run was performed.

Still open: novice comprehension and pacing for the compact role/choice copy; narrow-device occlusion with real touch; Firefox, Safari, Edge and physical mobile coverage; representative hardware; actual user-driven OS tab switching; zoom/high-DPI; assistive technology; quota/multi-tab conflicts; long resource/heap soak; subjective audio balance; fresh holdout learning; and authorized live deployment. No commit, push, publication, credential, or account action occurred.

## Chapters 9-12 and finale run - 2026-09-27

This section records fresh evidence for the 60-mission build and supersedes earlier scope statements only where commands were rerun. Environment: Windows; Node.js v22.18.0; npm 10.9.3; Playwright 1.62.1; installed Chrome 153.0.8010.54.

```text
node scripts/author-chapters-9-12.mjs
  PASS - authored 20 canonical levels, L41-L60.

npm run sync:content
  PASS - synchronized 60 canonical runtime levels and opening strings.

npm run check
  PASS - 40 syntax checks; 2,777 content/asset/audio/animation checks;
         74 Node tests; 139-file, 50,440,108-byte lean build;
         13/13 reported real-Chrome browser results.

npm run test:rl
  PASS as execution - 369 rows written to evidence/rl-audit.json;
         all 15 new DQN and five new cloning authored-seed evaluations delivered.

C:\Users\TeddyLazebni_mwmf8h4\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe scripts/make_layout_previews.py
  PASS - regenerated coordinate-labelled review JSON/PNGs for L01-L60.

npm run validate:handoff
  PASS - 1,171/1,171 file/link/hash checks; 155 audio cues;
         11 supplied chapter briefs; 55 supplied mission IDs; 306 Markdown links.
```

The source Chrome flow used public setup controls and native module workers to train L41 with bounded real replay and target copies, then dispatched and reloaded the frozen DQN snapshot. It recorded an eight-action successful L51 player demonstration, trained the behavioral clone, let Echo complete the delivery autonomously, and verified that the clone plus raw demonstration examples survived reload. The L60 flow trained the final network, delivered all three Warden charges through the shared transition kernel, visibly removed all three boss shields, required Patch to take the city heart, and reached the `Echoes at dawn` completion dialog. The test-only coordinator accelerated autonomous ticks only through the public `command(0)` game entry point; it did not mutate world state, inject policies, create demonstrations, bypass setup/extraction or force objectives true.

The production flow rebuilt the allowlisted game and loaded it below `/echo-heist/`. It verified native module-worker DQN training, a persisted/reloaded neural snapshot and player-demonstration cloning below the repository subpath. The build contains runtime game files only and excludes documentation, specifications, evidence, tests, authoring scripts, development probes, the asset inspector and the Backquote/Tilde preview shortcut. No console error, page exception, failed request or HTTP status failure was captured.

The first full browser run failed L60 honestly: its frozen courier was caught because checkpointed DQN batches restarted their random stream. The repair stores and validates the practice PRNG state and holds the root seed constant across cancellable batches. A new Node regression compares one 40-episode run with two 20-episode checkpoints and requires identical online parameters, generator state, real-transition count and optimizer-update count. The final beam's authored active phase was also balanced from 0 to 3 after development-seed runs in both Node and Chrome; it remains a live phase-six hazard using the same simulation and observation logic. The final full `npm run check` rerun passed all 13 browser results.

The new audit slice is intentionally narrow: one declared authored seed for each DQN mission and one explicit successful player-format fixture lesson for each cloning mission. L41-L50 and L56-L60 all delivered from frozen snapshots at or below their 10,000-real-transition caps; L51-L55 all delivered from clones trained only on those labelled examples. The audit fixture action lists exist only in `scripts/audit-rl.mjs`; no expert-route generator or scripted clone ships in the runtime. Existing weak results for L23, L24, L26, L30 and L38-L40 remain visible. None of this is a holdout, educational-effectiveness result or guarantee for arbitrary demonstrations.

Manual in-app checks additionally observed the twelve-district selector and themes, real L41 worker progress/reload, L51 recording feedback, and the Warden map. One pre-final 12-pass clone attempt failed autonomously; increasing the declared clone pass cap to 20 produced the verified final result. Subjective audio quality was not approved merely because silent/muted automation passed.

Still open: a fresh multi-seed Chapters 9-12 holdout, novel human demonstrations, representative hardware/performance, actual user-driven OS tab switching, subjective audio/music listening, Firefox/Safari/Edge/mobile coverage, zoom/high-DPI, full remapping and assistive-technology audit, quota/multi-tab conflict profiles, long resource/heap soak, novice playtesting, and an authorized live GitHub Pages deployment. No commit, push, publication, credential or account action occurred.

## Chapters 6-8 run - 2026-09-27

This section records fresh evidence for the 40-mission build and supersedes earlier scope statements only where commands were rerun. Environment: Windows; Node.js v22.18.0; npm 10.9.3; Playwright 1.62.1; installed Chrome 153.0.8010.54.

```text
node scripts/author-chapters-6-8.mjs
  PASS - authored 15 canonical levels, L26-L40.

npm run sync:content
  PASS - synchronized 40 canonical runtime levels and opening strings.

npm run check
  PASS - 36 syntax checks; 1,852 content/asset/audio/animation checks;
         69 Node tests; 128-file, 40,780,031-byte lean build;
         11/11 reported real-Chrome browser results.

npm run test:rl
  PASS as execution - 349 rows written to evidence/rl-audit.json;
         120 are fresh Chapter 6-8 training/frozen-evaluation rows.

C:\Users\TeddyLazebni_mwmf8h4\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe scripts/make_layout_previews.py
  PASS - regenerated coordinate-labelled review JSON/PNGs for L01-L40.
  The system Python alias was unavailable; the bundled runtime was used.

npm run validate:handoff
  PASS - 1,171/1,171 file/link/hash checks; 155 audio cues;
         11 chapter briefs; 55 mission brief IDs; 306 Markdown links.
```

The source Chrome flow seeded completed Chapter 5 progress, confirmed district 06 unlocked while district 07 remained locked, and then cleared all L26-L40 through public setup controls, native module-worker practice, frozen dispatch and physical Patch extraction. It observed Foundry, Docks and Skybridge chapter-aware menus and the final eight-district clear state. The test-only coordinator accelerated autonomous decision ticks by repeatedly calling the same `command(0)` game entry point; it did not mutate world state, inject a policy, skip Patch setup/extraction or bypass objective checks. Production flows rebuilt the allowlisted game, loaded below `/echo-heist/`, ran representative linear-SARSA, Dyna-Q and policy-gradient workers, reloaded a persisted Dyna snapshot, and captured no console errors, page exceptions, failed requests or HTTP status failures. Browser screenshots are under `evidence/browser-chapters6-8/`.

The local source also has a development-only progress-preview shortcut: Backquote or Shift+Backquote marks the next consecutive mission complete, persists the frontier and refreshes navigation. A real-Chrome test pressed Backquote five times, observed L01-L05 plus the Transit Depot theme, reloaded the saved state, then used Shift+Backquote to complete L06 and advance to L07. `scripts/build.mjs` strips everything after the development marker and asserts `previewCompleteNextMission` is absent from `dist/src/main.js`; this shortcut is not a release victory path.

The Node suite checks that the deliberately cargo-blind encoder creates a real feature alias, linear SARSA changes finite weights through shared-kernel transitions, empirical Dyna probabilities derive only from observed counts, planning does not invent model pairs, machine revisions apply retain/recent/reset rules, stable softmax remains normalized at extreme logits, the REINFORCE gradient has the expected signs, actor and critic parameters remain separate, and frozen evaluation does not mutate snapshots. All 15 source recipes delivered within their declared budgets: Chapter 6 <=6,000 real transitions, Chapter 7 <=4,000 and Chapter 8 <=6,400.

The expanded audit is intentionally candid. Over eight seeds per new mission, L26 delivered 7/8 frozen evaluations and L30 3/8; L27-L29 delivered 8/8. All five Dyna missions delivered 8/8. L36-L37 delivered 8/8, L38 delivered 2/8, L39 7/8 and L40 3/8. The default authored seed used by the playable flow delivered in every mission. These are development-cohort results, not a holdout or mastery result; weak seeds remain visible in `evidence/rl-audit.json` and are a tuning gate.

Still open: actual user-driven OS tab switching, subjective audio/music listening, Firefox/Safari/Edge/mobile coverage, representative hardware, zoom/high-DPI, full remapping and assistive-technology audit, quota/multi-tab conflict profiles, long resource/heap soak, novice playtesting, fresh holdout learning, and an authorized live GitHub Pages deployment. No commit, push, publication, credential or account action occurred.

## Chapters 3-5 and navigation/branding run - 2026-09-27

This section records fresh evidence for the 25-mission build and supersedes earlier scope statements only where commands were rerun. Environment: Windows; Node.js v22.18.0; npm 10.9.3; Playwright 1.62.1; installed Chrome 153.0.8010.54.

```text
node scripts/author-chapters-3-5.mjs
  PASS - authored 15 canonical levels, L11-L25.

npm run sync:content
  PASS - synchronized 25 canonical runtime levels and opening strings.

npm run check
  PASS - 31 syntax checks; 1,198 content/asset/audio/animation checks;
         61 Node tests; 116-file, 29,201,900-byte lean build;
         8/8 reported real-Chrome browser test results.

npm run test:rl
  PASS - 229 rows written to evidence/rl-audit.json across Chapters 1-5.

C:\Users\TeddyLazebni_mwmf8h4\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe scripts/make_layout_previews.py
  PASS - regenerated coordinate-labelled review JSON/PNGs for L01-L25.

npm run validate:handoff
  PASS - 1,171/1,171 file/link/hash checks; 155 audio cues;
         11 chapter briefs; 55 mission brief IDs; 306 Markdown links.
```

The source browser suite used ordinary loopback HTTP and public controls for navigation, setup, worker actions, dispatch and extraction. It selected a district before a mission, confirmed sequential district locking, observed the Switchworks/Courier Quarter/Neon Market menu themes, and cleared all L11-L25 after the retained L01-L10 flows. The test-only coordinator accelerated autonomous decision ticks in the long Chapter 3-5 path by calling the same `command(0)` game entry point; it did not alter state directly, insert policies, skip physical Patch setup/extraction, or bypass mission completion checks. Production flows rebuilt the allowlisted game, loaded it below `/echo-heist/`, started native Chapter 3 planning, Chapter 4 prediction and Chapter 5 control workers, persisted a cartridge across reload, and captured no console errors, page exceptions, failed requests, or HTTP status failures.

The Node suite specifically checks the sampled next-action SARSA target, first-visit MC, TD(lambda=0) equivalence to TD(0), exact Chapter 3 policy computation/dispatch, immutable Chapter 4 policies, Chapter 5 transition budgets, and frozen evaluation. Browser evidence is under `evidence/browser-chapters3-5/`; it is generated verification evidence, not production art.

The learning audit is intentionally candid. L11-L15 exact plans converged and delivered. Chapter 4 samples retained one immutable policy hash; the default uncertain L18 policy produced seven deliveries and one timeout across eight audit samples, which is its designed stochastic lesson. Every Chapter 5 job used fewer than 6,000 real transitions. L21, L22 and L25 delivered 80/80 frozen evaluations; L23 and L24 each delivered 70/80 because one training seed per level produced a policy that failed all ten evaluations. This is acceptable implementation evidence but not a robustness/holdout pass; tuning must use a declared fresh cohort rather than deleting weak seeds.

Still open: actual user-driven OS tab switching, subjective audio/music listening, Firefox/Safari/Edge/mobile coverage, representative hardware, zoom/high-DPI, full remapping and assistive-technology audit, quota/multi-tab conflict profiles, long resource/heap soak, novice playtesting, fresh holdout learning, and an authorized live GitHub Pages deployment. No commit, push, publication, credential, or account action occurred.

## Chapter 2 and M04 run - 2026-09-27

This section records fresh evidence for the ten-mission build and supersedes Phase 1 scope statements only where a command was rerun. Environment: Windows; Node.js v22.18.0; npm 10.9.3; Playwright 1.62.1; installed Chrome 153.0.8010.54.

```text
npm run sync:content
  PASS - synchronized 10 canonical runtime levels and opening content.

npm run check
  PASS - 28 syntax checks; 534 content/asset/audio/animation checks;
         55 Node tests; 105-file, 17,693,214-byte lean build;
         6/6 reported real-Chrome browser test results.

npm run test:rl
  PASS - 144 rows written to evidence/rl-audit.json:
         56 Chapter 1 Q-learning/evaluation rows and
         88 Chapter 2 exact-policy/sample rows.

npm run validate:handoff
  PASS - 1,171 checks; 155 audio cues; 11 chapter briefs;
         55 mission brief IDs; 306 relative Markdown links.

C:\Users\TeddyLazebni_mwmf8h4\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe scripts/make_layout_previews.py
  PASS - regenerated coordinate previews for L01-L10.
```

The browser suite used ordinary loopback HTTP servers. Its source flows retained the Phase 1 routing, controls, audio, persistence, import/export, failure-recovery and Q-learning coverage; then unlocked and cleared L06-L10 through public UI actions. It observed exact fixed-policy evaluation, stochastic sampled delivery, L06 representation contrast, L08 policy comparison, L09 start-state comparison, L10 finite-deadline delivery and the ending. The production flows loaded both chapters below `/echo-heist/`; C02 started its native module policy worker there. No console errors, page exceptions, failed requests or HTTP status failures were captured.

`evidence/browser-chapter2/neural-probe.json` records the fresh M04 browser fixture. DQN: 1,200 updates, 220.6 ms worker / 304.2 ms wall, 44 animation frames, 2/2 tiny cases. Behavioral cloning: 500 updates, 71.8 ms / 83.1 ms, 12 frames, 2/2 tiny cases. A separate long worker job was cancelled without completing. The runtime backend is 9,786 bytes of dependency-free JavaScript arrays. This proves the compact implementation can run responsively in the tested browser fixture; it does not prove campaign learning quality or performance on representative student hardware.

The seeded Chapter 2 audit deliberately includes contrasts rather than universal success: position-only L06 timed out in all eight seeds while cargo-aware state delivered in all eight. All sampled L07-L10 runs delivered; exact probabilities and returns are stored beside each sample. Chapter 1 results retain the original near/far and familiar/curious contrasts. This is the specified development cohort, not a hidden policy, a holdout or evidence of student learning.

Still open: real user-driven OS tab hiding, subjective music/effects listening, Firefox/Safari/Edge/mobile coverage, representative hardware, zoom/high-DPI, full keyboard remapping and assistive-technology audit, quota/multi-tab conflict profiles, long resource/heap soak, novice playtesting, holdout evaluation, and an authorized live GitHub Pages deployment. No commit, push, publication, credential or account action occurred.

## Reproduce the dependency-free baseline

```sh
npm run check
npm run validate:handoff
npm run test:rl
```

`check` runs syntax validation, content validation, Node tests and the static build. `lint` is syntax checking, not ESLint. `validate:handoff` verifies the complete audio catalog, delivered paths/hashes, single-instruction-root constraint, local Markdown links and required files. `test:rl` runs actual seeded learning; interpret it as the specified cohort, not proof of general mastery.

## Historical evidence

The inherited evidence/ reports concern the earlier five-level reference build. They include Node/worker checks, content and atlas consistency, the 56-run learning audit, and an offline UI harness. Historical numerical results must not be represented as freshly run. Read the reports for exact conditions.

The offline browser harness loads real source into module factories with local-byte assets, an in-memory storage adapter and a classic Blob Worker. It does not establish HTTP-origin ES-module worker loading, real reload persistence or deployed browser support. `npm run test:e2e:offline` retains that harness by its explicit name; it needs optional Python Playwright and Chromium. The optional TypeScript compiler/Pillow/CairoSVG tools are not shipped runtime dependencies.

## Historical required gates (Phase 1)

- A real browser navigating the actual local HTTP source and built site; normal ES-module worker startup.
- All five missions cleared through normal interactions; no direct success mutation or policy injection.
- Real save/reload/continue, good and bad import, safe reset, storage failure, and compatible experience retention.
- Pause/retry/cancel/stale-job handling and hidden-tab lifecycle.
- Keyboard/pointer focus, settings, navigation, narrow-layout usability, and sensible failure feedback.
- User-gesture audio activation, silent play, independent volume/mute and synchronized chapter stems; subjective listening remains a human review.
- Assets and workers under /echo-heist/ with no broken root-relative URLs; lean release excludes documentation, source tooling and reference media.
- Fresh test commands and observed results recorded without relabeling previous evidence.

## Not established by packaging or automated tests

The educational effectiveness, novice enjoyment, soundtrack fatigue, cross-browser/device coverage, deployed GitHub Pages operation, final accessibility compliance, remaining 15 levels, Chapter 9-11 neural/imitation campaign integration, and neural performance on student laptops remain unverified or unimplemented. No site is published by this task.

## Consolidation run

See evidence/handoff-check.log and evidence/handoff-validation.json for checks actually run on this packaged project. STATUS.md records the observed result. No fresh human playtest or normal-origin browser run was performed as part of this file-consolidation task.

## Phase 1 run - 2026-09-27

This section supersedes the earlier statement only for the checks explicitly rerun here. It does not relabel the offline harness or historical consolidation evidence.

Environment: Windows; Node.js v22.18.0; npm 10.9.3; Playwright 1.62.1; installed Chrome 153.0.8010.54. Playwright is a pinned development dependency and the browser suite defaults to the installed `chrome` channel; set `ECHO_BROWSER_CHANNEL` to another installed Playwright channel when deliberately extending the matrix.

Commands and observed results:

```text
npm run check
  PASS - 23 syntax checks; 311 content checks; 37 Node tests;
         lean build; 4/4 real-Chrome browser test results.

npm run test:rl
  PASS - 56 seeded training/evaluation cases completed.

npm run validate:handoff
  PASS - 1,165 checks; 155 audio cues; 11 chapter briefs;
         55 mission brief IDs; 300 relative Markdown links.

node --check scripts/serve.mjs
  PASS - local server syntax after the cache-header repair.

Invoke-WebRequest http://127.0.0.1:4173/?header-check=1
  PASS - observed Cache-Control: no-store, max-age=0 and Pragma: no-cache.
```

The initial untouched `npm run validate:handoff` failed at `MANIFEST.md -> PLANS.md`; Phase 1 repaired the stale relocated links, after which the final command passed. The initial `npm run check` passed the inherited Node checks but did not yet contain the new real-browser suite or lean build.

`tests/browser.e2e.js` starts ordinary local HTTP servers on free loopback ports and uses the production Playwright API rather than the offline module-factory harness. The source flow observed:

- focus, hover, active/pressed, selected, disabled, Back/Forward, unknown-route, locked-route, desktop, and 375x812 responsive states;
- first-gesture AudioContext activation, lazy screen/chapter loop loading, mute/volume persistence, muted gains, unmute, and no recorded decode/network errors;
- L01-L05 completed in order with public keyboard actions and UI buttons; Patch performed the authored setup/extraction work and Echo used the shared simulation;
- real module-worker training in L02-L05, explicit cancel without checkpoint commit, stale-result guards, contract-bearing compatible retry retention, isolated frozen delivery snapshots, and unchanged Q data after visible evaluation;
- localStorage reload/Continue, export, invalid import leaving progress intact, New Game, valid import, write failure with a usable in-memory game, and final chapter unlock;
- no captured console errors, page exceptions, failed requests, or HTTP responses at status 400 or above.

The production flow rebuilt `dist/`, loaded it at `/echo-heist/`, verified the development probe was absent, completed L01, started native module-worker learning in L02, reloaded persisted progress, and checked that observed same-origin resources remained under the project subpath. The build contained 98 files / 13.29 MiB and the allowlist excluded `production/`, docs, specs, evidence, scripts, tests, Python, the asset inspector, editable sprite sources, and unused frame exports.

Reviewed screenshots are in `evidence/browser-phase1/`: landing, lift, settings, map, L01, restored chapter, narrow map, and the production-subpath L01 view. They are fresh test output, not approved production references.

During the subsequent live in-app check, the unchanged root URL initially reused an older cached page titled `FleetRL` and rendered blank. Loading the same server with a fresh query produced `Echo Heist - Small Sparks` with the complete landing DOM; clicking Enter transitioned to the lift menu. `scripts/serve.mjs` now disables storage of local source and preview responses. This is a local browser recovery check, not a deployed-browser pass.

### Phase 1 checks still open

- Automation-controlled pages remain reported as visible even when another automation tab is opened. The actual visibility handler was therefore exercised in Chrome by deterministically setting `document.hidden` and dispatching `visibilitychange`; a user-driven OS tab switch remains a manual check.
- Audio graph state, loading, mute/gains, lifecycle, and error handling passed automation. No human listening/balance or speaker/headphone/device check was performed.
- Only installed Chrome was run. Edge, Firefox, Safari, mobile browsers, zoom/high-DPI, private browsing, and representative student hardware were not run.
- No quota-exhaustion profile, real multi-tab save conflict, IndexedDB migration, full remapping/accessibility audit, screen-reader pass, or long resource/heap soak was performed.
- No novice/human playtest, holdout learning cohort, educational-effectiveness study, live GitHub Pages URL, deployment, commit, or publication was performed.
