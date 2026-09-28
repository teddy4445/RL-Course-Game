# Ten exact Chapter 1-2 layouts

Version 2.0.0. Canonical data: `src/content/levels/L01.json` through `L10.json`. Production JSONs are identical review copies. Zero-based coordinates; x grows east, y grows south. `#` blocks both; `.` is shared floor; `p` admits Patch only; `e` admits Echo only. The image previews include coordinate labels.

Movement uses cell occupancy. E checks the actor cell first, then the faced neighbor. Objects are ordered by stable ID. Facing therefore matters even when a move bumps a wall. One-shot pickups/rewards cannot be farmed by standing on the same cell.

## L01 - Cold Boot

Map: 12 x 8. Patch: `{'x': 1, 'y': 1, 'facing': 2}`; Echo: `{'x': 3, 'y': 5, 'facing': 2}`. Review [PNG](layouts/L01.png) / [JSON](layouts/L01.json).

```text
############
#..........#
#..........#
#..........#
#..........#
#..........#
#..........#
############
```

| ID | Kind | Position | Connection / behavior |
|---|---|---|---|
| batteryA | battery | (3,1) | {"required": true} |
| dockSocket | socket | (3,3) | {"accepts": "batteryA"} |
| echoExit | exit-echo | (8,5) | - |
| patchExit | exit-patch | (8,6) | - |

Objective: `{"op": "all", "children": [{"op": "delivered", "itemId": "batteryA"}, {"op": "atExit", "actor": "patch", "entityId": "patchExit"}, {"op": "atExit", "actor": "echo", "entityId": "echoExit"}, {"op": "notFailed"}]}`.

## L02 - Shiny Distractions

Map: 16 x 10. Patch: `{'x': 2, 'y': 7, 'facing': 1}`; Echo: `{'x': 8, 'y': 5, 'facing': 2}`. Review [PNG](layouts/L02.png) / [JSON](layouts/L02.json).

```text
################
#ppppp##########
#ppppp##########
#ppppp##eeeee###
#ppppp##e###e###
#ppppp##eeeee###
#ppppp##########
#ppppp##########
#pppppppppppppp#
################
```

| ID | Kind | Position | Connection / behavior |
|---|---|---|---|
| latch | lever | (3,2) | {"opens": "heavyGate"} |
| receiverControl | console | (3,4) | - |
| practiceDock | dock | (5,5) | - |
| heavyGate | gate | (6,8) | - |
| receiver | socket | (8,5) | {"accepts": "fuseA"} |
| fuseA | fuse | (12,5) | {"required": true} |
| echoExit | exit-echo | (8,5) | - |
| patchExit | exit-patch | (13,8) | - |
| scrap0 | scrap | (9,3) | {"terminal": false} |
| scrap1 | scrap | (10,3) | {"terminal": false} |
| scrap2 | scrap | (11,3) | {"terminal": false} |

Objective: `{"op": "all", "children": [{"op": "delivered", "itemId": "fuseA"}, {"op": "atExit", "actor": "patch", "entityId": "patchExit"}, {"op": "atExit", "actor": "echo", "entityId": "echoExit"}, {"op": "notFailed"}, {"op": "gateLatched", "entityId": "heavyGate"}, {"op": "stageComplete", "stage": "receiver-ready"}]}`.

## L03 - The Long Way Round

Map: 16 x 10. Patch: `{'x': 2, 'y': 7, 'facing': 1}`; Echo: `{'x': 8, 'y': 5, 'facing': 2}`. Review [PNG](layouts/L03.png) / [JSON](layouts/L03.json).

```text
################
#ppppp##########
#ppppp##########
#ppppp##e#######
#ppppp##e#######
#ppppp##eeeee###
#ppppp##########
#ppppp##########
#pppppppppppppp#
################
```

| ID | Kind | Position | Connection / behavior |
|---|---|---|---|
| latch | lever | (3,2) | {"opens": "heavyGate"} |
| receiverControl | console | (3,4) | - |
| practiceDock | dock | (5,5) | - |
| heavyGate | gate | (6,8) | - |
| receiver | socket | (8,5) | {"accepts": "powerCell"} |
| powerCell | power-cell | (12,5) | {"required": true} |
| echoExit | exit-echo | (8,5) | - |
| patchExit | exit-patch | (13,8) | - |
| easyScrap | scrap | (8,3) | {"terminal": true} |
| crateA | crate | (10,8) | - |

Objective: `{"op": "all", "children": [{"op": "delivered", "itemId": "powerCell"}, {"op": "atExit", "actor": "patch", "entityId": "patchExit"}, {"op": "atExit", "actor": "echo", "entityId": "echoExit"}, {"op": "notFailed"}, {"op": "gateLatched", "entityId": "heavyGate"}, {"op": "stageComplete", "stage": "receiver-ready"}]}`.

## L04 - Curious Circuit

Map: 16 x 10. Patch: `{'x': 2, 'y': 7, 'facing': 1}`; Echo: `{'x': 8, 'y': 5, 'facing': 2}`. Review [PNG](layouts/L04.png) / [JSON](layouts/L04.json).

```text
################
#ppppp##########
#ppppp##########
#ppppp##e#######
#ppppp##e#e#####
#ppppp##eee#####
#ppppp##########
#ppppp##########
#pppppppppppppp#
################
```

| ID | Kind | Position | Connection / behavior |
|---|---|---|---|
| latch | lever | (3,2) | {"opens": "heavyGate"} |
| receiverControl | console | (3,4) | - |
| practiceDock | dock | (5,5) | - |
| heavyGate | gate | (6,8) | - |
| receiver | socket | (8,5) | {"accepts": "accessToken"} |
| accessToken | token | (10,4) | {"required": true} |
| echoExit | exit-echo | (8,5) | - |
| patchExit | exit-patch | (13,8) | - |
| easyScrap | scrap | (8,3) | {"terminal": true} |

Objective: `{"op": "all", "children": [{"op": "delivered", "itemId": "accessToken"}, {"op": "atExit", "actor": "patch", "entityId": "patchExit"}, {"op": "atExit", "actor": "echo", "entityId": "echoExit"}, {"op": "notFailed"}, {"op": "gateLatched", "entityId": "heavyGate"}, {"op": "stageComplete", "stage": "receiver-ready"}]}`.

## L05 - Two Robots, One Exit

Map: 16 x 10. Patch: `{'x': 2, 'y': 7, 'facing': 1}`; Echo: `{'x': 8, 'y': 5, 'facing': 2}`. Review [PNG](layouts/L05.png) / [JSON](layouts/L05.json).

```text
################
#ppppp##########
#ppppp##########
#ppppp##########
#ppppp##e#######
#ppppp##eeeee###
#ppppp##########
#ppppp##########
#pppppppppppppp#
################
```

| ID | Kind | Position | Connection / behavior |
|---|---|---|---|
| latch | lever | (3,2) | {"opens": "heavyGate"} |
| receiverControl | console | (3,4) | - |
| practiceDock | dock | (5,5) | - |
| heavyGate | gate | (6,8) | - |
| receiver | socket | (8,5) | {"accepts": "fuseA"} |
| fuseA | fuse | (12,5) | {"required": true} |
| echoExit | exit-echo | (8,5) | - |
| patchExit | exit-patch | (14,8) | - |
| laserA | laser | (10,5) | {"period": 4, "activePhases": [0, 1]} |
| relayCore | core | (11,8) | {"requiresDelivery": true, "required": true} |

Objective: `{"op": "all", "children": [{"op": "delivered", "itemId": "fuseA"}, {"op": "atExit", "actor": "patch", "entityId": "patchExit"}, {"op": "atExit", "actor": "echo", "entityId": "echoExit"}, {"op": "notFailed"}, {"op": "gateLatched", "entityId": "heavyGate"}, {"op": "stageComplete", "stage": "receiver-ready"}, {"op": "itemOwned", "actor": "patch", "itemId": "relayCore"}]}`.

## Reproducible development traces

## Chapter 2 - Transit Depot

The exact Chapter 2 geometry and rules are recorded in the canonical and mirrored JSON; the generated coordinate previews are [L06](layouts/L06.png), [L07](layouts/L07.png), [L08](layouts/L08.png), [L09](layouts/L09.png), and [L10](layouts/L10.png). These rooms deliberately vary state representation, stochastic movement, policy choice, start state and finite horizon while retaining the same Patch preparation/extraction rhythm.

| Mission | Room | Runtime focus |
|---|---|---|
| L06 - Same Place, Different Job | 16 x 10 | Position-only aliasing versus cargo-aware state. |
| L07 - Slippery Service | 16 x 10 | Stochastic express corridor versus deterministic bypass. |
| L08 - Ghost Routes | 16 x 10 | Exact evaluation of two frozen policies. |
| L09 - What Lies Ahead | 16 x 10 | One fixed policy evaluated from three start states. |
| L10 - Last Train Out | 18 x 11 | Ticket gate, Echo-carried core and a finite dispatch deadline. |

Chapter 2 test traces drive the public controls and evaluated policies rather than embedding oracle action paths in the runtime.

## Chapter 1 reproducible development traces

Action IDs: 0 wait, 1 north, 2 east, 3 south, 4 west, 5 interact. The following traces control Patch only; never replace Echo's learner with these or with an oracle.

L01 fixture: `[2,2,5,3,3,5,2,2,2,2,2,2,3,3,3,4]`.

L02-L05 preparation from spawn: `[1,1,1,1,1,2,5,3,3,5,2,2,3,5]`: latch lever, prepare console, approach/open dock. Select the intended setting, run real Practice, then Send Echo. For L02 use delivery priority; L03 far; L04 curious; L05 defaults. These are test recipes, not a requirement that only one setting can win.

Once Echo really delivers, Patch from dock goes `[3,3,3,2,2,2,2]` to (9,8). L02/L04 continue four east moves. L03 alternates interact/east four times to push the crate to (14,8) while reaching (13,8). L05 moves east, interacts to pick the revealed core at (11,8), then moves east four times to (14,8).

## Reset and curriculum notes

Room retry resets actors/items/links and removes transient route traces, while compatible saved learning remains. L02 scrap detours are observable but not forcibly rejected. L03 uses a terminal cheap scrap branch, distant useful cargo, and a Patch crate. L04 uses an explicitly disclosed scrap prior and a short discovery branch. L05 adds a visible deterministic laser with observed phase and a core Patch must physically collect. The compact C01 rooms are an intentional first-playable scope; they do not implement a complete reusable obstacle library or later advanced concepts.
