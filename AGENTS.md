# Echo Heist - repository instructions

## Read and act
Read README.md, STATUS.md, ROADMAP.md, and the requested task before editing. This is an existing working Chapter 1 prototype plus the full design, not an empty repository. Inspect existing code and preserve unrelated changes. Implement and verify the requested work; do not respond with another plan alone.

## Product invariants
- A game-first, top-down robot heist adventure: player-controlled orange Patch and a smaller ground-moving autonomous Echo. No compulsory lecture screens, quizzes, permanent training dashboards, side-view platforming, or ghost/flying Echo.
- Final scope: 11 chapters / 55 levels, five per lecture. L01-L25 currently have runtime level definitions. Use specs/campaign/ for the rest; do not claim Chapters 6-11 exist.
- Final runtime is browser-only JavaScript for GitHub Pages. No backend, accounts, API keys, analytics, paid media APIs, runtime CDN or server-side learning. A local development server is not a runtime backend.
- L01 is a disclosed fixed boot check. L02-L05 genuinely learn with Q-learning; L06-L15 use declared known models; L16-L20 predict immutable behavior policies from real experience; L21-L25 genuinely learn with SARSA or Q-learning. Shared transition code in src/sim/core.js governs practice, evaluation, planning and visible play. Never inject oracle policies, hidden successful paths, fake training, algorithm-name unlocks, or selection-dependent victory.
- Training reward, mission completion and player score stay separate. Freeze learned policy snapshots during evaluated delivery; preserve compatible experience on retry and invalidate it when its reward/state contract changes.

## Sources of authority
1. The user's current request and this root AGENTS.md.
2. ROADMAP.md, STATUS.md, docs/IMPLEMENTATION_DECISIONS.md, production/ART_CONTRACT.md, and canonical runtime JSON.
3. The subject specifications and future campaign briefs under specs/. They record intended requirements, not proof of implementation. Historical Phaser/Vite and IndexedDB requirements are not met merely by the current Canvas2D/localStorage prototype.
4. production/references/AUTHORITATIVE_GAMEPLAY.png for camera/scale/readability; the early mood collage is inspiration ONLY. Never let its incorrect mechanics override the design.

## Current architecture and authoring
- Native Canvas2D + vanilla ES modules; dependency-free Node development/build scripts. Do not rewrite it into Phaser/Vite or another framework to satisfy an old plan without recording a justified separate migration decision and preserving tests/saves.
- Edit canonical maps in src/content/levels/Lxx.json and opening strings in production/scripts/opening.json. Run npm run sync:content, then validation. Production JSON mirrors are review copies; preview PNGs need regeneration after geometry changes.
- Use actual transparent frames/atlases in public/assets/. Full audio catalog: public/assets/audio/catalog.json. Existing src/audio/manifest.js intentionally exposes only the already-wired subset; integrate more cues deliberately through the existing single mixer.
- Use deployment-relative paths and lazy scene/chapter audio loading. Do not decode all 155 cues on startup. Preserve synchronized chapter stems, gesture unlock, independent volume controls and silent failure handling.
- Never run an old packaging generator that rewrites instructions. Runtime dependencies are not installed; add dev tools only as needed with compatible versions and a lockfile.

## Verification and finishing
Run npm run check and npm run validate:handoff. Run npm run test:rl after relevant learning/content changes. Check actual browser interactions and rendering; native HTTP module-worker loading, persisted reload, cancellation, audio and project-subpath hosting are first-session gates. The inherited offline browser harness does not establish those results.

Record commands, outcomes and limitations in STATUS.md and docs/QA.md. Preserve historical evidence and do not call it a new passing test. Mark unavailable checks as blocked/not run; never invent playtests, measured learning effects, browser support, package installs, or performance. Only authorize local code/build work: no commits, pushes, deployment, credentials or account changes unless separately requested. Stop at the requested verified milestone, leaving a runnable repository and an exact next task.
