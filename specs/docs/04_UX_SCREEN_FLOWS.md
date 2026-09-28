# Screen flows and interface specification

## Route map

Use a single static entry with hash routes: `#/`, `#/menu`, `#/districts`, `#/settings`, `#/credits`, and `#/play/L01`. Root is the promotional landing. Hash navigation must work with a repository subpath and browser Back/Forward. Validate mission IDs and unlock status on direct entry; never crash or silently grant progress.

DOM owns semantic controls and navigation. Phaser owns the animated scene behind/within them. Full-viewport means filling the application window, not forcibly invoking the browser Fullscreen API. Fullscreen is an optional explicit control with a fallback if rejected.

## Landing

Desktop hero: 100svh minimum; readable title/tagline, animated city/robots or an honest captured gameplay preview, Play CTA, mute preference. Lower sections: story premise, three short gameplay highlights, district overview, course connection, credits/privacy note. No audio before intentional activation; no auto-playing trailer sound. Preserve useful content while the game chunk loads. Do not autoplay a claimed gameplay video that was fabricated or not recorded from the actual game.

## Elevator main menu

Full viewport with layered elevator frame, Patch/Echo idle animations, city visible behind. Primary buttons: Continue, New Game, Districts, Settings, Credits. Continue is disabled with an explanation if no valid save exists. New Game warns before replacing active progress and offers export first. Returning to menu must cancel or checkpoint active practice safely.

Buttons have idle, hover/focus, pressed, selected/transitioning, and disabled states. Proposed timings: hover 120 ms, press 70 ms, route transition 220-450 ms. Reduced motion substitutes instant state changes and short fades. Ignore duplicate activation during a transition but do not lose keyboard focus.

## District map

Eleven districts with five mission nodes each. A selected district shows its five nodes, title, restored/unrestored state, and compact mission preview. Locked nodes explain the prerequisite. The map has keyboard traversal and a semantic text/list alternative, not just clickable canvas coordinates. All mission launch controls are real buttons with names containing the mission ID/title.

## Settings

Music/SFX sliders; mute; remap movement/interact/gadget/retry/pause; reduced motion; reduced flashing; screen shake; interface scale; visual quality; export/import; reset progress. Detect remapping conflicts and provide restore-defaults. Esc closes the panel before affecting the underlying world. Destructive actions use a confirmation dialog with safe default focus.

## Gameplay layout

At 1280x720 logical presentation size: compact top-left objective, top-right resources/pause, bottom-left selected task/cartridge, contextual E prompt near the interactable, and bottom dock tray only when configuring. Reserve safe HUD margins; never cover essential pathways. Camera follows the authored room/character and clamps to bounds.

Dock tray: task name, at most two active configuration controls, Start practice/Stop, Deploy, optional reset-memory secondary action. Small formal labels can connect to course language, but no paragraph-sized explanations. The world stays visible. In low-height viewports the tray becomes a side panel or pauses the room; do not shrink text until unreadable.

## Result and pause overlays

Results: short outcome animation, objective outcome, at most two meaningful counts, Retry/Next/Menu. Failed trials do not display an invented accuracy percentage. Multi-trial medal results show the denominator and conditions, e.g. `4/5 deliveries, practice starts`, not `80% mastery`.

Pause freezes the world, input consumption, audio progression where appropriate, and training through a coordinated worker pause. A visibility change auto-pauses; returning does not run a catch-up burst. Resume is explicit. UI remains responsive even if the worker fails to acknowledge immediately.

## UI acceptance paths

First visit -> Play -> New Game -> L01 -> clear -> L02 -> menu -> reload -> Continue.
Settings -> mute -> reload -> muted menu. Remap -> play -> pause -> restore defaults.
Map -> keyboard-select district/node -> mission -> browser Back -> safe checkpoint/menu.
Import invalid save -> error -> old progress intact. Direct unknown hash -> not-found recovery.

Reference for interaction-test style: [source S07](18_SOURCES_AND_VERIFICATION.md). Numerical timings and layout dimensions are project targets, not standards.
