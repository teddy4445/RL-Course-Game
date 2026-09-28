# Developer tools

Core runtime/build checks need only Node.js: `npm run check`, `npm run validate:handoff`, and `npm run test:rl`. `npm run lint` checks JavaScript syntax, not a fully configured ESLint rule set. Optional `npm run typecheck` needs a locally available TypeScript compiler; it is not installed by this pack.

Edit canonical level JSON or `production/scripts/opening.json`, then run `npm run sync:content`. This refreshes JS exports and production JSON mirrors without rewriting instructions or reseeding layouts. There is no destructive all-in-one packaging generator in this handoff.

Optional asset regeneration: `python scripts/make_assets.py` requires Pillow and CairoSVG; `python scripts/make_layout_previews.py` requires Pillow. The latter uses ECHO_FONT when provided, then a system font/default; no font binaries are included. These tools are unnecessary to run the already-exported game.

`npm run test:e2e:offline` and `python scripts/test-viewer.py` are inherited environment-specific offline harnesses, requiring Python Playwright and a suitable Chromium path. They use module factories/classic worker adaptation and in-memory storage. They do NOT replace normal HTTP-origin browser tests. Phase 1 must add real-origin tests; no command named test:e2e is presented as if that gate already existed.

`python scripts/test-assets.py` checks atlas/frame consistency with Pillow. Results go to evidence/. Preserve approved production reference images; test screenshots now write to evidence/.
