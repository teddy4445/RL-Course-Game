# Audio system and media delivery

## Musical direction

Playful electronic music with mechanical percussion and a recurring two-robot motif. Calm exploration, stronger extraction pulse, warm restoration resolution. Prefer one base loop plus synchronized layers over 55 unrelated tracks. No required narration; Echo has short electronic vocalizations.

Create/obtain original or appropriately licensed loops. Placeholder generated tones can prove the mixer, but the release audio quality gate remains open until reviewed. Do not reuse commercial music or claim license clearance without evidence.

## Runtime behavior

A user activation (Play/unmute) initializes or resumes one shared AudioContext/Phaser audio owner. Catch blocked or unsupported playback; show a silent-mode state and allow retry. The game is fully playable muted. Choose one sound ownership layer; never initialize competing Phaser and custom mixers that double-play assets.

Separate music, effects, and UI gain buses under a master mute. Fade rather than cut on normal transitions, but respect immediate mute. Pause/visibility suspends ongoing playback; resume must not create duplicate loops. Limit simultaneous effects by category, debounce repeated UI sounds, and avoid sound per training step. Settings persist.

Use short tactile interaction SFX: switch, pickup, delivery, shutter, conveyor, caught, reset, success, core-restoration. Spatial panning can support readability but never be the only cue. Critical sounds also have visible text/icon or animation cues.

## Layer timing

Base/alert/extraction stems share tempo, length, and loop boundaries. Align against the audio clock, not simulation frames. Newly enabled layers join the next suitable beat. The simplified implementation may use one loop and crossfades if original multi-stem assets are unavailable; record that art-production decision rather than faking synchronization.

## File and loading policy

Deliver locally hosted compressed audio in browser-supported formats verified on the release matrix. Ogg plus MP3 fallback is a proposed pair, not a guarantee from filename extension. Retain source WAV only outside the public initial-load bundle. Preload a tiny UI cue set after activation; lazy-load district music and long effects. Revoke temporary object URLs and unload no-longer-used audio where safe.

Media manifests include `id`, relative path(s), category, duration, loop points where applicable, gain recommendation, rights record, and loading group. Never construct root-absolute `/assets/...` URLs that break project hosting.

## Audio tests

Muted first visit, blocked autoplay, first Play activation, rapid menu navigation, pause/resume, hidden tab, slider persistence, repeated retry, missing audio file, and scene teardown. Verify no doubling, no unbounded voice accumulation, and no loss of input while decoding. Listen on headphones and ordinary laptop speakers before final sign-off.

Reference: [S10 autoplay guidance](18_SOURCES_AND_VERIFICATION.md). Mix choices and asset budgets are project design decisions.
