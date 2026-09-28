# Echo Heist - playable twelve-district campaign

This is the consolidated project folder: a playable 60-mission campaign across twelve districts, clean game assets, canonical maps, opening script, all 155 supplied audio cues, and the original 55-level course specifications. Districts 1-11 implement the supplied campaign; District 12 is an explicitly original five-mission finale built for this game.

## Place it in your project

Extract this ZIP directly into an empty project/repository root, so `AGENTS.md`, `package.json` and `index.html` are at the root. For a nonempty repository, review and merge files first; do not overwrite unrelated code or existing instructions blindly. No `.git` directory, credentials, installed dependencies or compiled `dist/` are included.

Open the root in Codex and use [STATUS.md](STATUS.md) and [ROADMAP.md](ROADMAP.md) for current verification results and remaining quality gates.

## Run the existing code

Requires Node.js 22.12 or newer. The game runtime has no packages or CDN dependencies. Install the pinned development dependency before running the complete browser-inclusive check:

```sh
npm ci
```

```sh
npm run dev
```

Open the local URL printed by the server, normally `http://127.0.0.1:4173/`. Do not double-click index.html. WASD/arrows move Patch; E interacts; R opens or closes Echo's controls from anywhere; T retries; Escape pauses. The `?` inside R opens the detailed model, and `Help for this run` explains the current physical capability and setting combination without applying it. While Echo runs its frozen policy, Patch pauses and resumes as soon as Echo returns. In L01-L05, Relay cells carried to Sockets install real state, action, reward or policy capabilities before Echo is trained and run. `asset-viewer.html` is an optional development-only animation inspector.

The root `#/` route is the public landing page. It introduces the heist, the real-learning premise and the campaign story with locally shipped artwork, then enters the existing elevator menu without changing save data. The explanation is optional: Play/Enter remains available in the first viewport.

```sh
npm run check
npm run validate:handoff
npm run test:rl
npm run test:browser
npm run build
npm run preview
```

Build output is generated locally under `dist/`. The release allowlist emits only runtime HTML/CSS/JavaScript, the used game art/audio, `CNAME`, and `.nojekyll`; it excludes the asset inspector, tests, tools, evidence, specifications, documentation, production references, and source sprite frames. `npm run test:browser` rebuilds and exercises both the HTTP source and the built game under `/echo-heist/` using pinned Playwright with an installed Chrome channel (override with `ECHO_BROWSER_CHANNEL`).

## GitHub Pages deployment

Pushes to `main` run `.github/workflows/pages.yml`. The workflow installs the locked development dependency, validates syntax/content/solution contracts and Node tests, builds the allowlisted artifact, checks its entry point and exclusions, and publishes through GitHub's official Pages actions. The default project URL is `https://teddy4445.github.io/RL-Course-Game/`.

`CNAME` records the intended future hostname `eh.teddylazebnik.com` and is copied into the static artifact. With an Actions-based Pages deployment, GitHub also requires this hostname to be entered under **Settings → Pages → Custom domain** when its DNS record is ready. At the DNS provider, point the `eh` CNAME directly to `teddy4445.github.io` without the repository path. Until then, leave the Pages custom-domain setting unset and use the default project URL.

## What lives where

| Path | Purpose |
|---|---|
| [AGENTS.md](AGENTS.md) | One active project instruction source. |
| [CODEX_START_HERE.md](CODEX_START_HERE.md) | The exact first prompt. |
| [ROADMAP.md](ROADMAP.md) | Current-to-full-game development order. |
| [STATUS.md](STATUS.md) | Actual implemented scope, handoff checks, remaining gates. |
| `src/`, `tests/`, `scripts/` | Existing game, test and local tooling code. |
| `public/assets/` | Usable character frames/atlases, objects, tiles, icons, background and audio. |
| `public/assets/audio/catalog.json` | Exact paths and metadata for every delivered audio cue. |
| [production/README.md](production/README.md) | Authoritative art/level/opening package and review references. |
| [specs/README.md](specs/README.md) | Full design, 55 mission briefs and original acceptance specifications. |
| [docs/QA.md](docs/QA.md) | Testing limits and how to collect fresh evidence. |

## Important distinctions

Sixty levels are implemented. L01-L05 use genuine Q-learning; the guided L01 run first exposes a deliberately incomplete action space, then Patch physically installs EAST before the player retrains. L06-L10 use declared fixed policies and exact policy evaluation; L11-L15 use genuine policy improvement/iteration and value iteration against the known model; L16-L20 perform Monte Carlo, TD(0), or TD(lambda) prediction without changing their fixed behavior policy; L21-L25 use real tabular Q-learning or SARSA; L26-L30 use linear semi-gradient SARSA; L31-L35 use empirical transition counts and Dyna-Q planning; L36-L40 use stable-softmax policy gradients; L41-L50 use compact DQN with real bounded replay and copied target networks; L51-L55 use behavioral cloning trained only from successful player demonstrations; and L56-L60 turn the neural courier into an original three-shield Eclipse Warden finale. Practice, prediction, planning and visible delivery share the same simulation kernel, and dispatch freezes the compatible snapshot. The runtime lazily connects only relevant chapter music through one mixer; it does not decode the full catalog on startup.

The front end uses original transparent title/logo artwork, a district-first mission selector, and chapter-aware lift-menu treatments from the Scrapyard through the Eclipse Citadel. Mission cards are text-first and do not spoil their maps. Gameplay uses two simultaneous top-down cameras: Patch's camera follows the current infiltration room while Echo's camera keeps the autonomous courier grid readable. L08-L30 require two honest Echo relay runs, L31-L39 require three, L40-L50 require four, and L51-L60 require five; each completed relay powers the next Patch portal. The compact opening L01-L07 remains the onboarding ramp. Credits and the old menu footer were removed from the playable shell.

Every mission has a generated, machine-readable winning contract under `production/solutions/Lxx.json`. Each contract names Patch interactions, the required physical capability, the real learning algorithm/batch, every Echo run and final extraction. `npm run validate:solutions` checks all 60 contracts against canonical entities, connected rooms, carried-cell/socket order, capability installation, relay prerequisites and portal gating. Browser tests use the same contract routes while driving the real controls and workers. These development-only solutions are deliberately excluded from `dist/`; the runtime never reads them as policies or progress.

The approved working stack remains Canvas2D and native ES modules, not the older proposed Phaser/Vite stack. The neural-value and behavioral-cloning backend is dependency-free and runs in native module workers with cancellable checkpoint batches. LocalStorage remains the persistence implementation. Full remapping, broader accessibility and browser coverage, final audio balance, holdout learning cohorts, representative-hardware checks and novice playtests remain quality gates. Do not treat automated implementation evidence as educational-effectiveness evidence.

No duplicate codecs, lossless audio masters, soundtrack samplers, original ZIPs, or redundant sprite concept collages are needed for this project. The existing artwork is a consistent vector production pass rather than a claim of fully matching the earlier painted art.
