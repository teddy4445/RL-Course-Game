# Progress, persistence, privacy, and import safety

## Storage layout

Use small localStorage entries for lightweight preferences and an active-save pointer. Use IndexedDB for versioned progress/checkpoints/model arrays. Browser storage can be cleared or evicted and writes can fail; local saving is not a backup guarantee. Offer export/import and a clear saved/not-saved indicator. Sources: [S11-S12](18_SOURCES_AND_VERIFICATION.md).

A save contains schema/game/content versions, profile ID (random local identifier, not personal identity), completed mission IDs, medals and assistance flags, unlocked cosmetics, settings, current district/mission, cartridge manifests, inference snapshots, and optional exact-resume state. No student name, email, course password, or remote analytics is required.

## Transactional behavior

Persist at safe boundaries: mission clear, return to menu, settings changes with debounce, and acknowledged checkpoint. Write a new generation atomically in IndexedDB and update the active pointer after success. Retain one previous valid generation. Avoid writing every frame or learning update. An interrupted write must not replace the last valid save with a half-written model.

On startup, validate the active generation, fall back to the previous valid one if needed, and explain recovery. Never silently reset a corrupt save. Provide export of raw recoverable data only as an explicit recovery action, with no execution of its contents.

## Import format and bounds

Use a documented JSON envelope with finite numeric arrays and a checksum for accidental corruption, not authenticity. Initial caps: 16 MiB input, 64 cartridge snapshots, 50,000 parameters per neural model, 55 unique mission IDs, bounded tables/rows, maximum nesting depth, and bounded string lengths. Validate exact tensor shapes and parameter counts before allocating backend tensors. Profile display names, if later added, are rendered as textContent only.

Reject unknown future save versions gracefully. Reject prototype-related keys, code/script URLs, HTML payloads, non-finite values, impossible dimensions, invalid IDs, and incompatible encoders/actions. Do not merge arbitrary imported objects into prototypes/config. No eval, Function constructor, dynamic script loading, arbitrary serialized model topology, or automatic URL fetching from an import.

Parse and validate a candidate without changing current storage. Show what will be replaced and offer export first. Commit the complete candidate only after validation and confirmation. A failure leaves the active save untouched. Revoke temporary download URLs.

## Capacity and retention

Campaign achievements and cartridge metadata cover all 55 missions. The initial 64-snapshot limit permits one retained inference snapshot per mission plus bounded working slots; it does not authorize 64 unbounded replay buffers or optimizer histories. Enforce the total 16 MiB serialized import/export limit in addition to per-model bounds. Store optional exact-resume data separately from the compact portable save and label which is being exported.

Never silently evict a player's only learned policy. At capacity, offer export and explicit removal of optional historical checkpoints/traces while keeping achievements and the last valid active policy. If measured campaign saves cannot fit the proposed limits, version and document a revised bound with allocation and quota tests rather than silently truncating models. Exact continuation of training is optional; retained inference behavior and compatible campaign progress are the baseline.

## Migrations

Each migration is a pure function from version N to N+1 with fixtures for success, malformed input, and unchanged original data. Model migration is separate from progress migration. If weights cannot be migrated, preserve campaign achievements and label the cartridge as needing fresh training; do not silently reinterpret incompatible arrays. Source provenance stays intact.

## Multi-tab and quota behavior

Use a per-session writer token/lease and BroadcastChannel where available to notify competing tabs. Do not let older tabs overwrite newer generation numbers. Where coordination is unavailable, detect generation conflicts and show a save-conflict action. Quota errors produce a visible warning, retain the in-memory run, and permit export or deletion of optional old traces. Do not delete the only valid save to free space.

## Security and deployment boundaries

No secrets exist in client bundles. Treat local scores and progress as editable and unsuitable for secure grading. Credit all assets. Publish no course password or unauthorized slides. External links in credits are ordinary opt-in navigation, not runtime dependencies. Do not add analytics, cookies for tracking, accounts, or remote crash reporting without an explicit scope change.

A Content Security Policy may be added using supported static mechanisms, but must be tested with local module workers and the actual build; do not claim response headers unsupported by the hosting configuration are installed. Avoid unsafe HTML insertion and unnecessary third-party scripts regardless of CSP.
