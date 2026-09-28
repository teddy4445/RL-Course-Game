# Initial Codex prompt

Open this repository root in Codex, then paste the following. You do not need to paste the other files into chat.

```text
Develop Echo Heist from the files already in this repository. This is an
implementation task, not a request for another design document or a new scaffold.

First read AGENTS.md, README.md, STATUS.md, ROADMAP.md, production/README.md,
production/ART_CONTRACT.md, docs/IMPLEMENTATION_DECISIONS.md and docs/QA.md.
Inspect the existing code and the authoritative gameplay reference before editing.
Read additional specifications only when they are relevant to the current task.

The complete game is a browser-only JavaScript robot-heist adventure for GitHub
Pages: 11 chapters, five levels per chapter, aligned with the supplied RL briefs.
It must be a game first, with active player-controlled Patch, autonomous Echo,
real learning, attractive full-screen menus, music and sound, and no compulsory
teaching screens, quizzes, or permanent training dashboards.

Implement Phase 1 of ROADMAP.md end to end. Preserve and improve the existing
five-level Chapter 1 prototype; do not rebuild from scratch or implement the
remaining fifty missions in this first task.

1. Run npm run check and npm run validate:handoff to establish the actual baseline.
   Start the app on a normal local HTTP origin and add/run real browser tests.
2. Fix observed defects in landing/menu/settings/level selection and all five
   missions. Verify controls, objective feedback, real worker training, frozen
   delivery, retries, cancellation, save/reload/import/export, and chapter unlocks.
3. Improve visible presentation and interaction using the delivered clean art,
   exact maps, opening script and audio. Check button hover/focus/pressed states,
   smooth transitions, layout, sound unlocking, mute and volume controls. Preserve
   the top-down camera, grounded Echo, and minimal in-game interface.
4. Validate native module-worker loading, actual persistence across reloads,
   silent operation, hidden-tab behavior, and assets under /echo-heist/. Keep
   one mixer; load only relevant audio rather than the entire catalog at startup.
5. Keep simulation and learning logic shared and honest. No scripted winning
   policies, fake progress, algorithm-selection victory, or fabricated tests.
   Run the seeded learning audit when relevant behavior changes.
6. Produce a static build with game assets only: exclude development references,
   test tools, documentation and the asset inspector from the release artifact.
   Check that the built game still loads and works under the repository subpath.

Keep the existing Canvas2D/ES-module architecture for this phase. Do not silently
migrate to Phaser/Vite. Add compatible development tooling only when needed and
record its versions in the lockfile. Preserve unrelated existing work. Make and
record reasonable implementation decisions instead of stopping for minor details.

Do the coding, testing and repair now; do not stop after a plan. Update STATUS.md
and docs/QA.md with the exact changes, commands, observed results and remaining
gates. Do not call inherited offline test results a deployed-browser pass. Mark
unavailable checks honestly. Leave a runnable first chapter and identify the next
bounded task. Do not commit, push, publish, use credentials, or change accounts.
```
