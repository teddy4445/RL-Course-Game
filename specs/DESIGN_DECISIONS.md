> Design baseline, not current implementation status. Root `AGENTS.md`, `STATUS.md`, and `ROADMAP.md` control this consolidated repository. The working Canvas2D prototype is not to be replaced solely because the original plan proposed Phaser/Vite.

# Architectural and product decisions

These are initial design decisions, not implementation observations. Record later changes below with date, context, alternatives, chosen option, consequences, and affected files. Numerical tuning belongs in level data and calibration reports, not duplicated across this log.

| ID | Decision | Reason / consequence |
|---|---|---|
| ADR-001 | Static client-only deployment | GitHub Pages; no server-side state, secure leaderboard, authentication, or runtime AI API. |
| ADR-002 | JavaScript ES modules with JSDoc and checkJs | Preserves the requested JS stack while checking module contracts. Development tooling is not a runtime dependency. |
| ADR-003 | Phaser presentation plus DOM interface | Canvas provides the game world; semantic HTML provides accessible menus, settings, dialogs, and essential HUD controls. |
| ADR-004 | Pure fixed-step simulation is authoritative | Training, gameplay, route previews, and headless tests use the same transition rules. Renderer physics cannot create an alternate world. |
| ADR-005 | Grid decisions with interpolated motion | Six Echo actions keep learning small; visual motion stays smooth. No diagonal movement or free-physics driving in v1. |
| ADR-006 | One learning worker, CPU baseline for tiny neural models | Avoids depending on WebGL/OffscreenCanvas support inside workers or cross-origin isolation. Benchmark during M04; acceleration is optional, not assumed. |
| ADR-007 | All levels are data + reusable mechanics | Exactly 55 mission IDs; eleven chapter themes do not imply eleven game engines. |
| ADR-008 | Training reward is separate from objective and score | Exposes reward-design mistakes without allowing reward farming to win. |
| ADR-009 | Isolated Echo task lanes with explicit handoffs | Patch stays active without unpredictably changing a supposedly stationary learning task during a rollout. |
| ADR-010 | Hash-based application navigation | Reload and deep links work on GitHub Pages without server rewrites. |
| ADR-011 | Local persistence, versioned export/import | No accounts. Progress is convenient, not tamper-proof. |
| ADR-012 | No service worker in initial release | Avoid stale-bundle/save-schema complexity. Static hosting is not a promise of installed offline support. |
| ADR-013 | Provisional course mapping is explicit | No unverified slide-page claims; Chapter 10 can be remapped without breaking stable mission IDs. |
| ADR-014 | Persistent character, task-specific cartridges | Echo's identity and unlocks persist; incompatible model/state schemas do not share parameters accidentally. |
| ADR-015 | Content and training presets are initial hypotheses | Validate learnability and entertainment; never promise predetermined learning outcomes. |
| ADR-016 | No new mandatory third-party services | Local procedural placeholders allowed; external asset generation is optional and cannot block functional development. |

## Change record template

`ADR-NNN | date | proposed/accepted/superseded`

Context; alternatives; decision; consequences; migration; verification; owner approval required when scope changes. Never silently rewrite previous evidence when a decision changes.
