# Opening interaction script

Status: implemented first-session flow, not a proposed cinematic. Machine-readable beat list and exact copy: [opening.json](opening.json). `src/content/opening.js` supplies the L01 HUD strings. Other beats document actual screen/event transitions; there is no separate timeline engine.

| Beat | Scene / trigger | Player interaction | Feedback and exit |
|---|---|---|---|
| O01 | Landing | Enter the city | Audio activates after the gesture; elevator menu opens. |
| O02 | Elevator | Start the heist | L01 assets load; control goes to Patch. |
| O03 | Battery visible, Echo asleep | Move east and press E at/facing battery | Battery moves into Patch's hands; objective remains wake Echo. |
| O04 | Patch carrying battery | Bring it to socket; E | One-shot delivery, boot sound, Echo wakes. |
| O05 | Echo awake | Patch reaches orange pad | Echo completes a disclosed fixed eastward self-check; both pads required. |
| O06 | L01 clear | Next mission or Replay | Small celebration; local progress attempts to save. |
| O07 | L02 | Latch shutter; prepare receiver | Gate/console states change visibly. |
| O08 | Prepared dock | Select a priority, Practice, Send Echo | Real worker updates; actual frozen-policy route plays in the room. |

## Exact opening fixture

Coordinates are zero-based: Patch `(1,1)`, battery `(3,1)`, socket `(3,3)`, Echo `(3,5)`, Echo exit `(8,5)`, Patch exit `(8,6)`. One verified keyboard trace is:

`Right, Right, E, Down, Down, E, Right x6, Down x3, Left`.

Other valid routes are permitted. Do not bake this trace into the agent or force the player to follow it. It is a QA recipe, not an autoplay solution.

## Failure and interruption

Wall bumps do not open instruction panels. Missing E targets leave the world unchanged. Pause preserves the room. Retry resets dynamic room state. L01's 160-decision horizon is not a wall-clock timer; nothing fails while the player reads or takes a break. No learning is claimed in L01. In L02, a scrap-heavy policy can still deliver successfully after a wasteful detour; the game must not reject a legitimate delivery because the player chose a disfavored chip.

## Unverified design targets

The goal is that a new player understands the two-character relationship in the opening room. No human playtest, comprehension assessment, or measured first-session duration is included. Observe a real novice before expanding the tutorial.
