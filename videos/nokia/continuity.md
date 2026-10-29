# Nokia: continuity v2

Version 1 is in `continuity-v1.md`. The cast and looks are the same as v1, now
refined (see the cast design still). New in v2: PLATFORM MAN (generic, a symbolic
figure from the memo's parable) and the **moving box** prop, which replaces v1's
briefcase.

Code: `src/characters/toonfolk/business.tsx`, `src/videos/nokia/`.

## Props that persist across scenes

| Prop | Introduced | Path |
|---|---|---|
| Lit shelf phones | Scene 1 (4 light up) | All go dark in scene 2. The shop isn't revisited |
| Chart bar | Scene 3, full height | Unchanged in 5 and 7. Drops below 25% in 9 and stays down in 11–12 |
| Moving box | Scene 7 (Sep 2010, CEO carries it in) | Set down in the boardroom's back-left corner by the plant at the end of 7. Visible in that corner in 8, 9, 11. The CEO picks it up in 12 and carries it out |
| Memo (paper) | Scene 6 (CEO holds it, reading aloud) | Left on the table at the end of 6. On the table in 9 and 11 |
| Phone stacks | Scene 5 | Toppled phones stay scattered on the table at the end of 5. Gone in 7, which is a flashback, and 8+, three days later (cleaned up) |
| Old candybar phone | Scene 14 (from EXEC's right pocket) | Back in the pocket at the end |

## State table (in → out)

"Left/right" is screen position. Hands are in the character's own orientation.

| Scene | Character | Position (frame + set) | Facing | Pose in → out | Props (which hand) | Outfit | Notes |
|---|---|---|---|---|---|---|---|
| 1 | CLERK | Behind counter, screen-right, phone shop | Camera | Hands at sides → blink, small head tilt | None | Rust polo + cap | 4 phones lit at out |
| 2 | CLERK | Same | Camera → turns to wall switch | Neutral → reaches, light off | None | Same | Continuous from 1. Phones go dark |
| 3a | EXEC | Screen-right at the chart easel, boardroom | ¾ toward chart | Taps bar | None | Navy suit, glasses | Chart full height |
| 3b | PRESENTER | Center stage, keynote | Camera | Raises slab phone | Slab phone (right) | `founderLook` | Hard cut. Only appearance |
| 3c | EXEC | Same as 3a | Camera | Shrug → sips water | Glass (right) → back on table | Same | Cut back, same state as 3a |
| 4 | CEO | At a desk in the boardroom corner | Camera, ¾ | Typing → stops, leans back | None (keyboard) | Charcoal suit, dark-red tie | Title FEB 2011. Quote card overlay |
| 5 | EXEC | Behind table, center-right | Camera | Neutral → eyebrow twitch | None | Navy suit | His phone stack is toppled by slab stack (props on table) |
| 6a | PLATFORM MAN | Rig railing → jumps into the sea | Sea | Standing → jump → splash | None | Generic orange work suit | **Symbolic set**, intentional cut |
| 6b | CEO | Behind table, screen-left, reading aloud | Camera | Holding memo → lowers memo, puts it on table | Memo (both hands → table) | Charcoal suit | EXEC listens screen-right |
| 6b | EXEC | Behind table, screen-right | CEO | Listening → brows up on "burning platform" | None | Navy suit | |
| 7 | CEO | Enters at screen-left door → back-left corner | Screen-right | Walking with box → sets box down by the plant | Moving box (both hands → floor) | Charcoal suit | **Flashback** (title SEP 2010), before scenes 4–6 in story time. EXEC greets |
| 7 | EXEC | Behind table, screen-right | CEO | Small nod | None | Navy suit | |
| 8 | CEO | Behind table, screen-left | Screen-right → BUYER | Handshake (right) | None | Charcoal suit | Box visible in corner. Memo on table |
| 8 | BUYER | Enters from screen-right → center-right | CEO | Walks in → handshake | None | Olive-grey suit | First appearance |
| 8 | EXEC | Background, screen-right | Watching | Unchanged | None | Navy suit | |
| 9 | EXEC | At the chart easel, screen-right | Chart (¾) | Head droops 3 notches | None | Navy suit | Bar drops below 25%. Box in corner, memo on table |
| 10 | EXEC | On #1 → steps to #2 (screen-right) | Camera | Shoulders drop | None | Navy suit | **Symbolic set** |
| 10 | RIVAL | Walks in from screen-left → onto #1 | Camera | Hop up | None | Blue suit | Only appearance |
| 11 | CEO | Behind table, screen-left | BUYER | Signing | Pen (right) → on table | Charcoal suit | Title SEP 2013. Box in corner. Chart below 25% |
| 11 | BUYER | Behind table, screen-right | Camera on "The buyer?" | Small wave (left hand) | None | Olive-grey suit | |
| 12 | CEO | Behind table → corner → walks out screen-right | Screen-right | Picks up box, joins line | Moving box (both hands) | Charcoal suit | **Last appearance.** Same box as scene 7 |
| 12 | EMPLOYEES | Line walking left → right behind the table | Screen-right | Walking | None | Crowd looks | |
| 12 | BUYER | By the door, screen-right | Line | Nod | None | Olive-grey suit | |
| 13 | BUYER | Standing behind center desk, Microsoft office | Chart → head turns to empty desks | Looking down → turns | None | Olive-grey suit | Title JUL 2015. New location |
| 14 | EXEC | Snowy hill, screen-left | Tower → camera | Phone out of right pocket → look → back | Old phone (right) | Navy suit **+ grey scarf** | Time jump to the present. Scarf is a motivated outdoor change |

## Cut list

| Cut | What changes | What stays fixed |
|---|---|---|
| 2 → 3 | Shop → boardroom | 2007 |
| 3a → 3b → 3c | Boardroom ↔ keynote (setup/punchline cuts) | EXEC state identical either side |
| 3 → 4 | Time jump to Feb 2011 | Boardroom layout, chart full height |
| 5 → 6a → 6b | Symbolic sea parable → boardroom | Phone pile on table from 5 |
| 6 → 7 | **Flashback** to Sep 2010 | Boardroom layout. No memo, no phone pile (they don't exist yet) |
| 7 → 8 | Forward to Feb 2011, three days after the memo | Box in corner. Table cleaned of phone pile; memo on table |
| 9 → 10 | Symbolic podium | EXEC outfit |
| 10 → 11 | Sep 2013 | Box in corner, chart below 25%, memo on table |
| 12 → 13 | Jul 2015, Microsoft office | BUYER outfit |
| 13 → 14 | The present, exterior | EXEC identity + scarf |

## Build notes

- `ToonPerson` has no sitting pose, so standing characters stand behind tables
  and desks.
