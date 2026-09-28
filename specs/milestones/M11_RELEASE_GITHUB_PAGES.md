# M11 - Release build and GitHub Pages verification

**Prerequisites:** M10 release gates; publication requires explicit owner authorization.
**Specification state:** Original acceptance checklist; not a current progress report. Consult root STATUS.md and ROADMAP.md before starting or rebuilding anything.

## Observable outcome

A reproducible static release artifact works under the real project base path; any authorized publication is verified at its actual URL.

## Read before work

Always read root AGENTS.md, README.md, STATUS.md, ROADMAP.md, and docs/IMPLEMENTATION_DECISIONS.md, then:

- [docs/15_DEPLOYMENT_GITHUB_PAGES.md](../docs/15_DEPLOYMENT_GITHUB_PAGES.md)
- [docs/12_PROGRESS_SAVE_SECURITY.md](../docs/12_PROGRESS_SAVE_SECURITY.md)
- [docs/14_TESTING_AND_ACCEPTANCE.md](../docs/14_TESTING_AND_ACCEPTANCE.md)
- [docs/18_SOURCES_AND_VERIFICATION.md](../docs/18_SOURCES_AND_VERIFICATION.md)

## Implementation scope

1. Confirm repository/site base path from the actual authorized repository, not assumptions. Produce a clean npm-ci build with pinned dependencies.
2. Create/review minimal-permission Pages workflow with verified action pins and separated test/deploy jobs. Do not change settings, push, or publish without explicit authorization.
3. Run cold-cache production smoke tests for landing, menu, L01, a neural level, saves, workers, media, and hash reload under the exact base path.
4. Audit dist for secrets, course passwords, unauthorized slides, dead external URLs, test-only oracles, and required third-party runtime requests.
5. Record release IDs/versions/evidence, create run/deploy/rollback documentation, and leave recoverable prior artifacts. If live deployment access is absent, deliver local dist/workflow and mark live verification blocked.

## Acceptance gates

- [ ] Fresh clean build and full release checks are reproducible.
- [ ] Exact-base-path production preview resolves every chunk/worker/media/model without root-path errors.
- [ ] Actual published URL is tested only if publication occurred and is authorized; otherwise no invented deployment claim.
- [ ] Save-version compatibility and rollback behavior are documented/tested.
- [ ] STATUS distinguishes implemented, locally verified, human-reviewed, deployed, and live-verified states.

## Explicit non-goals

No unauthorized commits/pushes/settings changes, no secure-grade claims, no hidden backend service, and no fake live URL.

## Handoff

Static build, workflow/runbook, versioned release record, and honest publication/verification status.

## Execution note - to be completed during implementation

Original unchecked checklist. Record current execution in root STATUS.md and the relevant task note; do not treat this historical paragraph as proof that existing code is absent. Record date/environment, actual files changed, commands/results, evidence paths, measured findings, unresolved issues, and the next bounded action. Do not mark a checkbox from reasoning alone. Build/browser/tooling limitations must remain visible in STATUS.
