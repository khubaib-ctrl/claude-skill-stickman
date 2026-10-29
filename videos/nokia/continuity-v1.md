# Nokia: continuity

## Cast (toon style, `ToonPerson`)

New looks need design-still approval before animating (CLAUDE.md §4 step 2).
Code: `src/characters/toonfolk/business.tsx`. Design still: `NokiaCast` composition.

| ID | Who | Look (identity cues) |
|---|---|---|
| EXEC | Composite "Nokia leadership", **dramatization** (no real person) | Navy suit, light-blue shirt, no tie, swept grey hair, thin glasses |
| CEO | "Nokia's new CEO" (generic, no likeness) | Charcoal suit, white shirt, dark-red tie, short dark hair with a tidy quiff |
| BUYER | Generic Microsoft-side executive, **dramatization** | Olive-grey suit, open collar, bald, short jaw beard |
| PRESENTER | Generic rival presenter, **dramatization** | Reuses `founderLook` |
| CLERK | Shop clerk | Rust polo shirt, matching rust shop cap |
| RIVAL | Symbolic "Samsung" figure, no logo | Muted blue suit, black hair with a sharp side part |
| AUDIENCE / EMPLOYEES | Generic | `audienceLook` variants |

**Sets:**
- **Nokia boardroom:** long table centered, window at the back with snow, bar-chart easel screen-right.
- **Keynote hall:** reuses the BigLaunch set.
- **Phone shop, podium stage, Microsoft office, snowy hill:** new sets.

## State table (in → out)

"Left/right" is screen position. Hands are in the character's own orientation.

| Scene | Character | Position (frame + set) | Facing | Pose in → out | Props (which hand) | Outfit state | Notes |
|---|---|---|---|---|---|---|---|
| 1 | CLERK | Center, behind counter, phone shop | Camera | Hands on counter → blink, hands on counter | None. 4 of 10 shelf phones lit at out | Rust polo | Shop not revisited |
| 2 | EXEC | Screen-right, beside chart easel, boardroom | Camera, ¾ toward chart | Standing → right hand taps tall bar, head tilt | None | Navy suit, glasses | First appearance. Chart bar at full height (out) |
| 3 | PRESENTER | Center stage, keynote hall | Audience/camera | Arm down → right arm raises slab phone | Slab phone (right hand) | `founderLook` | Hard cut to a different location. Only appearance |
| 3 | AUDIENCE | Foreground rows, seen from behind | Stage | Still → 2 heads turn slightly | None | Varied | Only appearance |
| 4 | CEO | Screen-left, standing at table, boardroom | Screen-right (toward EXEC) | Holding memo → slides memo across table, hand returns | Memo (right hand → table → EXEC) | Charcoal suit | **Time jump** (title "FEB 2011"). Chart bar still full height from scene 2 |
| 4 | EXEC | Screen-right, at table (moved from easel) | Screen-left (toward CEO) | Neutral → picks up memo, eyebrows up | Memo (left hand) at out | Navy suit, glasses | The move from easel to table happens across the time-jump cut |
| 5 | CEO | Screen-left at table → turns center | Screen-right → BUYER | Hands down → handshake (right hand) → hold | None (memo is with EXEC) | Charcoal suit | Matches scene 4 out |
| 5 | BUYER | Enters center-right, other side of table | CEO | Hand out → handshake → hold | None | Olive-grey suit | First appearance |
| 5 | EXEC | Screen-right, background | Watching handshake | Holding memo → unchanged | Memo (left hand) | Navy suit, glasses | Matches scene 4 out |
| 6 | EXEC | Screen-right, at chart easel | Chart (¾) | Memo set down on table (visible) → head droops 3 notches | None (memo on table) | Navy suit, glasses | Memo placed on the table, not vanished. Bar steps full → below 25% |
| 7 | EXEC | Podium stage, starts on #1 block → steps to #2 (screen-right) | Camera | Standing tall → steps down, shoulders drop | None | Navy suit, glasses | **Symbolic set**, intentional cut |
| 7 | RIVAL | Screen-left → steps onto #1 (center) | Camera | Walks in → stands on #1 | None | Muted blue jacket | Only appearance |
| 8 | CEO | Screen-left, standing behind table, boardroom | BUYER | Pen → signs → receives briefcase | Pen (right hand), then briefcase (left hand) | Charcoal suit | **Time jump** (title "SEP 2013"). Chart bar still below 25% (from 6). Memo still on table (from 6) |
| 8 | BUYER | Screen-right, standing behind table | CEO | Signs → slides briefcase over | Pen → briefcase handed to CEO | Olive-grey suit | |
| 9 | CEO | Screen-left behind table → walks to end of line, exits screen-right | Screen-right | Standing → picks up briefcase, walks | Briefcase (left hand) | Charcoal suit | Matches scene 8 out. **Last appearance** (has left for Microsoft) |
| 9 | BUYER | Screen-right, standing by door | Watching line | Standing → small nod | None | Olive-grey suit | |
| 9 | EMPLOYEES | Line walking screen-left → screen-right, behind the table | Screen-right | Walking | None | `audienceLook` variants | Direction matches CEO's exit |
| 10 | BUYER | Standing behind center desk, Microsoft office | Chart → turns head to empty desks | Looking down at chart → head turns to the empty desks (camera pans) | None | Olive-grey suit | **Time jump** (title "JUL 2015"), new location. Rows of empty desks: respectful, no mockery |
| 11 | EXEC | Screen-left, snowy hill beside cell tower | Tower, then camera | Looking at tower → takes old phone from right pocket, looks, puts it back | Old candybar phone (right hand, back to pocket) | Navy suit **+ grey scarf** | **Time jump** to the present. The scarf is a motivated change (outdoors in snow). The phone is a new prop, introduced on screen from the pocket |

## Cut list (intentional changes)

| Cut | What changes | What stays fixed |
|---|---|---|
| 2 → 3 | Location (boardroom → keynote) | Story time 2007 |
| 3 → 4 | Time jump to Feb 2011 (title), back to boardroom | Boardroom layout. Chart bar full height |
| 6 → 7 | Symbolic podium set | EXEC outfit |
| 7 → 8 | Time jump to Sep 2013 (title), boardroom | Chart below 25%, memo on table |
| 9 → 10 | Time jump to Jul 2015 (title), Microsoft office | BUYER outfit |
| 10 → 11 | Time jump to the present, exterior | EXEC identity (adds scarf) |

## Build notes

- `ToonPerson` has no sitting pose, so scenes 8–10 use standing characters with
  the table or desk hiding their legs. This changes the staging only, not the
  story.
