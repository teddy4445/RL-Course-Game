> Consolidated repository note: use `public/assets/audio/catalog.json` for current file paths and IDs. The original audio-folder examples below describe the source pack. The existing Chapter 1 mixer remains the only runtime owner. All 155 cues are included, but only the existing subset is currently connected.

# Event-to-sound rules

The complete ID list, paths, loop points, cooldowns and volume suggestions are
in `audio_manifest.json`. The generated `ASSET_CATALOG.md` is the human-readable
inventory. A trailing `_01`, `_02`, etc. means actual alternate renderings.

| Game event | Sound or behavior |
|---|---|
| Hover / focus | `ui_hover_01` or `_02`; only after sound enabled, debounce. |
| Pointer/key press | `ui_press`; release or confirm plays at commitment. |
| Back / locked action | `ui_back` / `ui_locked`; visible equivalent. |
| Setting / slider | `ui_toggle_on`, `ui_toggle_off`, `ui_slider_tick`. |
| Mission/equipment map | `ui_confirm`, `stinger_equipment_unlocked`. |
| Patch walks | Surface-appropriate `patch_step_*` shuffle bag; actual foot contacts only. |
| Echo rolls | Optional low `echo_roll_loop`; stop when still. |
| Pickup / setdown | `patch_carry_pickup`, `patch_carry_setdown`, or item-specific cue; avoid playing all together. |
| Scrap / fuse / key / core | `item_scrap_*`, `item_fuse`, `item_key`, `item_core`. |
| Lever, button, pressure plate | `lever_pull`, `button_press`, `plate_on`, `plate_off`. |
| Door / conveyor | Corresponding start/loop/stop cues; one loop per active emitter. |
| Dock / charge | `echo_charge_start`, quiet `echo_charge_loop`, `echo_charge_end`. |
| Echo acknowledges / fails / celebrates | `echo_ack_*`, `echo_disappointed`, `echo_happy_*`; keep infrequent. |
| Actual autonomous delivery | `echo_delivery`; do not also stack every happy cue. |
| Hazard begins / team noticed | `hazard_warning` or `guard_detect`, then chapter alert layer. |
| Security beam catches a robot | `laser_caught` / `patch_stunned`; nonviolent. |
| Core retrieved | `item_core`, then extraction state on the existing chapter transport. |
| Practice starts / completes | `learning_launch`, `learning_session_complete`; once per session. |
| Save/reset policy | `learning_policy_saved` / `learning_reset`; never confuse attempt reset with memory reset. |
| Real/model mismatch | `learning_model_mismatch` with visible evidence. |
| Demonstration | `demo_start`, `demo_stop`, `demo_correction`. |
| Retry | `stinger_retry`, then `attempt_reset`; retain chapter transport. |
| Mission clear | `stinger_heist_clear`; reduce music briefly in game integration. |
| District restored | `stinger_district_restored`; switch to map only after game state commits. |
| End of final heist | `stinger_finale`, then credits cue. |

## Priorities

A mission result suppresses incidental chatter. Hazard cues take precedence over
footsteps. UI should be quiet. Ambience is deliberately below the score. Never
encode a necessary instruction solely through pitch, volume or stereo location.
A first-build mixer can omit rolling/conveyor loops; excessive continuous sound
is worse than selective silence.

## Stinger ducking

The reference player exposes music volume; full-game integration should apply a
short temporary music duck (approximately 4-6 dB) for major restoration/finale
stingers. Implement ducking as a separate multiplier, not by overwriting the
player's persisted volume slider. Restore smoothly. Do not repeatedly retrigger
a stinger on every render frame or every score update.
