# Accessibility, browser support, and performance budgets

These are product acceptance targets to measure, not claims already achieved. Performance reports must name hardware, browser, build, viewport, workload, and sample method.

## Input and access

Keyboard-operable landing/menu/map/settings/dialogs with visible focus, logical tab order, and Escape behavior. DOM buttons have accessible names; controls have labels and current values. Do not implement all menus as unlabeled canvas hit areas. Give the canvas an accessible description and provide text versions of objectives/status, but do not claim complete nonvisual gameplay accessibility without testing it.

Remappable movement/interact/gadget/retry/pause; prevent conflicting bindings or explain them. Pause works during play and practice. Reduced motion disables camera shake, parallax, large transitions, and flashing effects. Critical events have a static icon/text or shape cue; sound and color are never the only signals. Text/interface scale must not cover mandatory route geometry.

Target readable contrast based on WCAG guidance; check actual text/background combinations rather than assume the palette is compliant. Focus order, names, and form semantics need keyboard/screen-reader spot checks. No certification is implied. See [S21](18_SOURCES_AND_VERIFICATION.md).

## Browser release matrix

Test current stable Chrome/Edge and Firefox on desktop plus Safari on macOS when available. Record actual versions at release, not guessed future compatibility. Minimum rendering support follows the chosen Phaser major; detect unsupported rendering contexts and show a useful message. Windows keyboard paths are important for the intended use. Mobile gameplay is not a v1 promise.

Test 1280x720, 1366x768, 1920x1080, and a narrower 1024x768 window; landing/settings also at a phone-sized viewport. Browser zoom 125% and 150%, high-DPI scaling, reduced-motion preference, muted audio, private/restricted storage, and repeated tab hiding.

## Initial budgets

| Item | Proposed budget / gate |
|---|---|
| Landing JS, excluding deferred game | Under 150 KiB gzip when feasible; report actual size. |
| First playable district transfer | Under 8 MiB compressed initial media + code; measure cold cache. |
| Neural library | Lazy-loaded only when needed, not landing/menu. |
| Whole deployment assets | Aim under 100 MiB; no oversized source WAV/art in public dist. |
| Gameplay frame target | 60 fps typical; reduced effects mode should sustain a usable 30 fps on the declared test laptop. |
| Main-thread blocking | No training optimization; investigate repeated tasks over 50 ms during normal play. |
| Input feedback and movement | Aim under 100 ms for immediate visual acknowledgement. Logical movement starts at the next 125 ms decision boundary; measure this separately, plus rendering latency. |
| Snapshot installation | Bounded copy/validation; do not serialize a huge model every frame. |
| Worker progress | At most 5-10 messages/s; cancellation acknowledged promptly at a safe boundary. |
| Replay / neural model | 4096 transitions baseline; under 50,000 parameters. |
| Resource lifecycle | No monotonically increasing tensors, scene listeners, workers, or audio voices after repeated retries. |

Immediate press feedback is not completed movement. Do not report the acknowledgement budget as a guarantee of sub-100 ms movement onset. Tune decision duration only after measuring responsiveness and learning/pacing effects; coordinate any change across simulation, learning, animation, and recorded content versions.

## Degradation order

Reduce particles, decorative lights, background resolution, and parallax first. Then reduce worker batch/chunk size or sampling frequency. Preserve simulation outcomes, action responsiveness, readable cues, and learning correctness. Never substitute a winning script for a slow learner. A paused or smaller-budget training mode is acceptable if disclosed and tested.

## Resource/soak tests

Cycle menu -> level -> practice -> cancel -> retry -> menu at least 50 times; monitor active workers/listeners/tensors and heap trends. Hide/show the tab repeatedly and verify no catch-up simulation. Exhaust storage in a test profile, reload a save, mute/unmute, switch districts, and cancel during a neural update. Performance is a measured gate, not merely an assertion that the code uses a worker.
