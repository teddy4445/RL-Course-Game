# Level data contract and validation

## Principles

Exactly 55 stable level IDs: L01 through L55. IDs survive title changes. Chapter IDs C01-C11; `chapterNumber = floor((levelNumber-1)/5)+1`. Each mission is a data definition referencing reusable systems, not a separate game implementation. Production level data must not contain executable expressions, functions, script URLs, eval strings, or arbitrary plugin names.

## Required record sections

```js
{
  schemaVersion: 1,
  id: "L01",
  chapterId: "C01",
  contentVersion: "1.0.0",
  title: "Cold Boot",
  alignment: { status: "proposed", concepts: ["agent-environment"], slideEvidence: [] },
  prerequisites: [],
  scene: { theme: "scrapyard", layoutId: "l01-room-v1", assetGroup: "c01" },
  geometry: { width: 12, height: 8, tiles: [], entities: [] },
  actors: { patchSpawn: {}, echoSpawn: {} },
  task: { stages: [], horizonSteps: 160, objective: {} },
  observation: { profileId: "task-full-v1", encoderId: "tabular-v1" },
  learning: { mode: "none", allowedAlgorithms: [], exposedControls: [], defaults: {} },
  reward: { id: "delivery-v1", weights: {}, oneShotEvents: [] },
  seeds: { root: 41001, domains: ["train", "validation", "audit"] },
  evaluation: { snapshotMode: "frozen", protocolId: "single-clear-v1" },
  medals: [],
  cues: [],
  validation: { referenceRecipeId: "l01-reference-v1", testedContentHash: null }
}
```

This is a shape illustration, not a complete executable L01 definition: placeholders/empty required collections must fail final content validation. The exact authored L01 fixture is specified separately in [21_REFERENCE_FIXTURES.md](21_REFERENCE_FIXTURES.md). M00-M03 may build a partial campaign only while clearly marked development; a release build requires all 55 implemented definitions.

## Objective expression grammar

Use a closed tagged AST with allowed predicates: `all`, `any`, `atExit`, `delivered`, `gateLatched`, `itemOwned`, `stageComplete`, `notFailed`. Children are bounded and validated. No arbitrary string evaluation. There is deliberately no `algorithmEquals`, `trainedForSeconds`, or `sliderEquals` predicate. Environment tasks can require a delivery and both actors at a staging area, not a learner brand.

Failure rules similarly use a closed set: caught, lostRequiredCargo, depletedRequiredEnergy, intrinsicTimeout, authoredIrrecoverableState. Detection of irrecoverability must be validated and not falsely reject an alternative solution.

## Entity constraints

Entity IDs unique within a level; referenced sockets/doors/items/spawns exist; grid rows have equal length; cells in bounds; no actor spawns inside solids; geometry does not put required items beyond all reachable Echo/Patch routes. Carry/door/plate links are validated. Static shortest-path reachability is necessary but not sufficient when keys, hazards, or stages matter; use state-space fixtures or bounded solvers for those.

A known-model level must enumerate valid transition distributions and include all relevant state. A model-free level cannot expose the exact-model capability. A prediction level requires an immutable `fixedPolicyId`. A feature/neural mission declares encoder dimensions. Every stage has explicit start/end/learning permissions and snapshot-transfer compatibility.

## Variation specification

Variations list allowed spawn sets, machinery parameters, layout templates, and hazard phases. The generator uses a supplied seed, enforces playability constraints, and rejects invalid variants before launch. Do not generate a random labyrinth and hope it is learnable. Training and evaluation distributions are explicit; intentional distribution shift is named and documented.

Stable layouts are hand-authored. Generated variants only recombine prevalidated patterns. Changing geometry cannot silently alter observation length, action semantics, or cargo identities.

## Training profiles

Control definitions have ID, label, formalTerm, type, allowed values/range, default, and which configuration field changes. Sliders are bounded; discrete 2-3 option switches are preferred initially. Never expose a UI control that does not affect the actual learner. Retaining memory after an encoder/reward change requires explicit compatible continuation or a visible fresh test copy.

## Content tests

Validate exactly 11 chapters and five missions each; no duplicate/missing IDs; prerequisites form an acyclic reachable chain; every link/assets/recipe exists; critical paths remain possible under specified variations; terminal/objective semantics agree with simulation; controls map to actual settings; all proposed alignment flags are honest; final build contains no placeholder IDs or unimplemented algorithms. Calibration evidence includes content and recipe hashes so it is invalidated by relevant changes.
