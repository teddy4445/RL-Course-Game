# M02 - Landing, elevator menu, settings, and map shell

**Prerequisites:** M01 playable shared-simulation slice.
**Specification state:** Original acceptance checklist; not a current progress report. Consult root STATUS.md and ROADMAP.md before starting or rebuilding anything.

## Observable outcome

The application feels like the same game from its landing page through the full-viewport elevator menu and into L01.

## Read before work

Always read root AGENTS.md, README.md, STATUS.md, ROADMAP.md, and docs/IMPLEMENTATION_DECISIONS.md, then:

- [docs/04_UX_SCREEN_FLOWS.md](../docs/04_UX_SCREEN_FLOWS.md)
- [docs/05_ART_DIRECTION.md](../docs/05_ART_DIRECTION.md)
- [docs/06_AUDIO_AND_ASSETS.md](../docs/06_AUDIO_AND_ASSETS.md)
- [docs/13_ACCESSIBILITY_PERFORMANCE.md](../docs/13_ACCESSIBILITY_PERFORMANCE.md)
- [docs/16_CONTENT_WRITING.md](../docs/16_CONTENT_WRITING.md)
- [docs/19_ASSET_MANIFEST.md](../docs/19_ASSET_MANIFEST.md)

## Implementation scope

1. Implement the landing hero and story sections, responsive navigation, and progressive loading so heavy game/neural assets are not required to read the page.
2. Build the elevator scene with original local layered placeholder or finished art, Patch/Echo idle behavior, and semantic DOM buttons with focus/hover/press/selected/disabled states.
3. Add the eleven-district map shell with five named nodes per chapter, working keyboard navigation, accurate locked/unimplemented states, and a functional L01 launch path. Future nodes must not pretend to launch finished missions.
4. Implement settings for audio, motion, shake, UI scale, and remapping. Persist small settings; full game-save mechanics come next.
5. Implement one audio owner with user-activation gating, category gains, pause/visibility handling, and local SFX/music placeholders with provenance flags. Add credits and clear not-yet-final asset metadata.

## Acceptance gates

- [ ] First visit to L01, menu return, Back/Forward, and all implemented buttons work without dead handlers.
- [ ] Keyboard focus/selection and reduced-motion behavior are tested; UI remains readable at declared viewport sizes.
- [ ] Muted first visit, first Play audio activation, repeated menu transitions, and remapping work without duplicate audio/listeners.
- [ ] Capture real screenshots of landing/menu/settings/map/L01, inspect them, and fix overlap/clipping.
- [ ] No required off-origin media requests; project base-path preview passes.

## Explicit non-goals

No claiming final artwork/audio quality from placeholders; no fake gameplay trailer; no sprawling frontend framework migration.

## Handoff

Coherent screen shell, reusable UI/audio components, actual screenshots, asset inventory, and unchanged L01 playability.

## Execution note - to be completed during implementation

Original unchecked checklist. Record current execution in root STATUS.md and the relevant task note; do not treat this historical paragraph as proof that existing code is absent. Record date/environment, actual files changed, commands/results, evidence paths, measured findings, unresolved issues, and the next bounded action. Do not mark a checkbox from reasoning alone. Build/browser/tooling limitations must remain visible in STATUS.
