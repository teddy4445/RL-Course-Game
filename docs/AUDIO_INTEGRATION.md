# Audio in the consolidated project

The project contains all 155 unique rendered cues: 38 music assets (five screen tracks and eleven synchronized base/alert/extraction groups), 12 ambience loops, 98 sound effects and seven stingers. Only one compatible encoded file per cue is included: MP3 for supplied music/ambience, WAV for supplied short effects/stingers. OGG alternatives, FLAC masters, samplers and audio-generation sources are not required here.

`public/assets/audio/catalog.json` is the complete current path/metadata source. Paths are application-root relative; resolve them against the deployment base URL, never blindly against `/` or the catalog directory. Each `files` record retains the selected file's hash and original verification metadata. Prior QA values are historical metadata, not new browser tests or listening approval.

`src/audio/manifest.js` contains the original forty-entry Chapter 1 adapter; `src/audio/mixer.js` is the sole runtime owner. The complete catalog adds files but does not automatically wire them, change cues, or introduce another mixer. Integrate more cues by ID only when the corresponding screen/mechanic/chapter exists. Keep the legacy adapter and `production/audio-subset.json` synchronized when changing them.

Use the chapter records to start base/alert/extraction at one audio-clock time and crossfade gains on real state transitions. Keep loop bounds and gain/cooldown/voice limits. Load/decode the current screen or chapter only; do not decode the full collection at startup. Music unlock requires a user gesture. Audio failure cannot block gameplay; preserve silent operation, independent buses, mute, pause/visibility handling, unload/cancel and saved settings.

Read [music guide](audio/MUSIC_GUIDE.md), [event map](audio/EVENT_MAP.md), and [provenance](audio/PROVENANCE.md) as source design. Their original folder examples are superseded by the root-relative catalog. Human listening, loop quality in actual browsers, balance with gameplay and repetition fatigue remain tests to perform.
