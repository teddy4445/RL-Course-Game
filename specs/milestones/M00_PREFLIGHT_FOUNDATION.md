# M00 - Preflight and project foundation

**Prerequisites:** None; specification-only starting state.
**Specification state:** Original acceptance checklist; not a current progress report. Consult root STATUS.md and ROADMAP.md before starting or rebuilding anything.

## Observable outcome

A real JavaScript/Vite/Phaser project starts, builds, and renders a minimal scene through a hash-routed shell under a project base path.

## Read before work

Always read root AGENTS.md, README.md, STATUS.md, ROADMAP.md, and docs/IMPLEMENTATION_DECISIONS.md, then:

- [docs/01_PRODUCT_BRIEF.md](../docs/01_PRODUCT_BRIEF.md)
- [docs/07_TECHNICAL_ARCHITECTURE.md](../docs/07_TECHNICAL_ARCHITECTURE.md)
- [docs/15_DEPLOYMENT_GITHUB_PAGES.md](../docs/15_DEPLOYMENT_GITHUB_PAGES.md)
- [docs/18_SOURCES_AND_VERIFICATION.md](../docs/18_SOURCES_AND_VERIFICATION.md)

## Implementation scope

1. Inspect the existing repository and instructions; preserve work. Record compatible Node/npm/Vite/Phaser/test-tool versions with matching API documentation. Install only the foundation dependencies and generate the lockfile.
2. Create JavaScript ES-module entry, JSDoc/checkJs setup, linting, initial Vitest tests, and the initial Playwright configuration. Add an application coordinator and semantic Play button leading to one minimal Phaser scene.
3. Implement hash route parsing, unknown-route recovery, BASE_URL-safe asset resolution, and a tiny local asset fixture. Do not build the entire UI yet.
4. Create non-no-op script contracts for implemented checks. Add document/initial-content validation; explicitly mark the incomplete campaign in development instead of creating fake level success handlers.
5. Record an execution note for this milestone and actual environment constraints. Do not make Git commits, push, or publish unless separately authorized.

## Acceptance gates

- [ ] Install/build/typecheck/lint complete without ignored defects.
- [ ] A browser opens the built app under /echo-heist/ and renders a local asset and the minimal Phaser scene after Play.
- [ ] Hash reload, unknown hash, keyboard Play, and missing-asset recovery have basic tests.
- [ ] STATUS records actual versions, commands, results, and any unavailable browser checks.

## Explicit non-goals

No RL implementation, full campaign, final artwork, cloud services, deployment publication, or mocked passing tests for later milestones.

## Handoff

Run instructions, version decisions, initial test evidence, and a stable application skeleton ready for the shared simulation.

## Execution note - to be completed during implementation

Original unchecked checklist. Record current execution in root STATUS.md and the relevant task note; do not treat this historical paragraph as proof that existing code is absent. Record date/environment, actual files changed, commands/results, evidence paths, measured findings, unresolved issues, and the next bounded action. Do not mark a checkbox from reasoning alone. Build/browser/tooling limitations must remain visible in STATUS.
