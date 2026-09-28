# Static deployment on GitHub Pages

## Runtime contract

The production artifact is the contents of Vite's `dist/`: HTML, CSS, JavaScript, images, audio, level data, and optional local models. No Node/Python server runs for users. Build tools and GitHub Actions may use Node during build; that does not create a runtime backend. Sources: [S06, S13](18_SOURCES_AND_VERIFICATION.md).

Use one hash-routed entry page. Links, asset manifests, worker URLs, dynamically imported chunks, model shards, and optional WASM must resolve under the configured base path. Do not rely on a server fallback for `/play/L01` or hardcode domain-root `/assets` paths.

## Base-path decision

For a repository project site, use `/<repository-name>/`; for an owner site/custom root, use `/`. Until the actual name is known, use `/echo-heist/` only as a local test configuration. It is not the user's confirmed repository. Read base from one build-time setting and use `import.meta.env.BASE_URL` or equivalent version-supported path handling everywhere.

Examples to create during implementation:

```text
npm ci
npm run check
npm run test:e2e
npm run test:rl
npm run build -- --base=/echo-heist/
npm run preview -- --host 127.0.0.1
```

Verify the installed Vite CLI behavior and chosen preview configuration. Do not claim that passing a development-server test proves the production artifact works. CI/browser test setup must intentionally target the built project subpath.

## Workflow outline

After local validation, create a Pages build/deploy workflow with checkout, pinned supported Node, npm ci, relevant checks, build, upload Pages artifact, and deploy. Use minimum required token permissions and a deployment environment. Pin third-party actions to reviewed full commit SHAs with readable version comments and an update process; verify actual SHAs rather than inventing them. Do not put a PAT into frontend code. Source: [S23](18_SOURCES_AND_VERIFICATION.md).

Separate ordinary PR checks from authorized deployment. Do not deploy forked/untrusted pull-request code with elevated secrets. Concurrency should prevent obsolete releases deploying after newer ones. Enable Pages/GitHub Actions settings and publish only when the user authorizes account/repository changes.

## Production smoke test

Cold-load landing at the exact published project URL, enter menu, launch L01, hear sound only after activation, save/reload/Continue, load a later neural chapter, start/cancel worker training, import/export, refresh a hash deep link, and open an invalid hash. Inspect network for missing chunks, image/audio/model/worker errors, root-path mistakes, and required third-party requests.

Test entirely from local self-hosted assets after initial page loading; do not call this an offline/PWA feature. Service worker installation is out of scope for v1. Browser cache behavior does not guarantee complete offline replay.

## Release record and rollback

Record commit/build ID, dependency lock hash, content version, model/asset versions, tested URL, browsers, gate results, and known limitations. Keep a previous known-good deploy artifact or tagged source for rollback, and ensure save migration is compatible with the rollback story. Do not publish old builds that silently corrupt newer saves; reject unsupported versions with recovery guidance.

If the environment cannot publish or inspect the actual site, deliver the dist artifact/workflow and mark production verification blocked. Never invent a live URL or say the site was deployed without evidence.
