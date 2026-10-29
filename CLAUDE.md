# YouTube videos: 3D cartoon animation project

Videos are 2D-comic-looking cartoons rendered in real 3D. The style is
**finalized**: follow this file exactly and don't reinvent the look.

---

## 1. Stack (always use exactly this)

| Job | Tool |
| --- | --- |
| 3D scenes | **Three.js** via React Three Fiber, inside `<ThreeCanvas>` from `@remotion/three` |
| 3D helpers | `@react-three/drei` (`Outlines`, `RoundedBoxGeometry`) |
| Timeline, render, video | **Remotion** 4 (`remotion`, `@remotion/cli`) |
| Captions | `@remotion/captions` (`Caption[]` JSON → `createTikTokStyleCaptions`) |
| Audio | `<Audio>` from `@remotion/media` (not the deprecated `Audio` from `remotion`) |
| Fonts | `@remotion/google-fonts` (`LuckiestGuy` for titles and captions) |
| Voiceover | **VoiceStudio** (local, `/Users/khubaib/Documents/starmilessol/VoiceStudio`), preset **"The Storyteller"** voice (`beec786a`), via `scripts/voiceover.mjs` |
| Music + SFX | **Original, synthesized in code** (`scripts/audio/compose.py`, `scripts/audio/sfx.py`, Python in `.venv`). No library tracks, so no licensing or Content ID claims |

Don't swap in other 3D engines, video tools, or caption/audio libraries.

`remotion.config.ts` must keep `setChromiumOpenGlRenderer("angle")` and
`setConcurrency(1)`. Headless WebGL needs both.

`esbuild`'s install script had to be approved (`npm approve-scripts esbuild`);
do this again after a fresh `npm install` if bundling fails.

### Determinism rules (Three.js inside Remotion)

- Drive **all** motion from `useCurrentFrame()` with `interpolate()` / `spring()`.
- **Never** use R3F `useFrame`, `requestAnimationFrame`, `THREE.Clock`, or
  unseeded `Math.random()`. Use `random(seed)` from `remotion` instead.
- Update the camera in a `useLayoutEffect` keyed on the frame (see `CameraRig` in
  `src/scenes/townsquare/TownSquareScene.tsx`). Child layout effects run before
  ThreeCanvas renders the frame.
- Pass `width` / `height` from `useVideoConfig()` to `<ThreeCanvas>`.
- Load async data with `delayRender` / `continueRender`. Put static files in
  `public/` and reference them with `staticFile()`.
- Geometry rebuilt every frame (limbs) must be `useMemo`'d and disposed in a
  `useEffect` cleanup.

### Voiceover (VoiceStudio, narrator voice)

- **Default voice:** VoiceStudio preset **"The Storyteller"**, profile
  **`beec786a`** (male, elderly, low pitch, British). The user chose it from 8
  previews (`out/voice-previews/`).
  - Alternatives: The Documentarian `8b4d6add`, or the old cloned narrator
    `a84eb878` (pass `--voice <id>`).
- **Other presets:** VoiceStudio has 60 archetypes (`GET /archetypes`).
  `POST /archetypes/<id>/use` turns one into a profile id usable as `voice`.
  To compare candidates, render the same lines in each and let the user pick
  by ear.
- **No emotion engine.** VoxCPM2 is installed in VoiceStudio but **not used**:
  the user dropped it, so don't propose it again unless asked. Delivery comes
  from the voice preset, punctuation and the pauses/holds between lines.
  - If it's ever revisited: VoxCPM2 reads its `(instruction)` aloud when the
    profile has a reference transcript (continuation mode). It needs a
    reference-audio-only profile.
- **The engine is deterministic:** the same text gives the same audio. If a
  word comes out wrong, **reword** the line (e.g. "So when Apple…" → "That
  year, Apple…"). Retrying unchanged text won't help.
- **Start the backend** (if `curl -s localhost:3900/health` fails):
  `cd /Users/khubaib/Documents/starmilessol/VoiceStudio/backend && ../.venv/bin/python main.py`
  (it's ready when `/health` returns `"status":"ok"` on device `mps`).
  - Background jobs have a 2-hour limit, so start it per generation batch and
    stop it afterwards (`pkill -f "python main.py"`).
- **Make a line:** `node scripts/voiceover.mjs <name> "<text>"`. This writes
  `public/audio/voice/<name>.wav` and `public/captions/<name>.json` and prints
  the frame count at 30 fps. Set the composition's `durationInFrames` to at
  least that.
- **Pauses are wanted. They carry emotion.** Keep the engine's natural pauses
  (`voiceover.mjs` no longer trims by default; `--trim` is opt-in).
  - Size scenes as line + 0.3 s of air, plus dramatic holds of 0.6–1.5 s after
    key beats: the hook, the title, a quote, a punchline, a big number, the
    ending (`scripts/nokia-frames.mjs`).
  - `scripts/tighten-voice.mjs` exists only if a tighter cut is ever wanted.
- **Check the words:** transcribe the result
  (`curl -s localhost:3900/v1/audio/transcriptions -F file=@<wav> -F model=whisper-1 -F response_format=json`)
  and compare it to the script. Rephrase and regenerate if a word comes out
  wrong. Whisper heard "walked on stage" as "worked", so we switched to
  "stepped onto".
- **Word timing:** VoiceStudio's speech-to-text returns no word timestamps, so
  the script estimates them. It splits the speech regions found by ffmpeg
  silencedetect across words by syllable count. That's good enough for captions
  and mouth flaps.
- **Lip-sync:** import the caption JSON into the scene and open the speaker's
  mouth only while a word is active, toggling every 4 frames (see `Founder` in
  `src/scenes/keynote/KeynoteScene.tsx`).
- The usage notes from VoiceStudio are copied to `.claude/skills/omnivoice/`.

### Music and sound effects (original, no copyright risk)

- **Score:** `.venv/bin/python scripts/audio/compose.py public/audio/music/<name>.wav <seconds>`
  writes a deadpan pizzicato/marimba piece (D minor, 92 BPM) whose final chord
  lands at `<seconds>`. Pass the video length minus about 2.3 s. Use `--seed` for
  a different melody.
- **Mix:** add one `<Audio>` for the score at the composition root with a
  per-frame `volume`.
  - Level is about 0.16, ducked to about 0.075 under narration words, smoothed
    over 12 frames.
  - Mute it for heavy or respectful beats.
  - The pattern is in `src/videos/nokia/NokiaVideo2.tsx`.
- **SFX:** `.venv/bin/python scripts/audio/sfx.py` writes 29 short effects to
  `public/audio/sfx/` (bell, blip, power-down, switch, title-thud, crowd,
  camera-click, typing, ding, clatter, fire, wind, splash, door, footsteps,
  boop, handshake, sting, bonk, wah, thump, scribble, ka-ching, dun, hum,
  power-up, whoosh, box-rattle, door-close).
  - Place them inside scenes with `<Sfx name at volume />` (`src/videos/nokia/kit.tsx`).
  - Time them from caption words with `wordFrame()`.
  - Keep volumes at about 0.2–0.55, under the voice.
- Nobody has listened to the synthesized audio yet. Ask the user to listen to
  previews before relying on new sounds.

---

## 2. The finalized style

Approved reference: the `ToonTest` composition (`out/toon-test.mp4`).
Characters use the smooth body rig in `src/characters/toonfolk/` on the
**chibi build** (`RoundHeadCast` still, `style-reference/roundhead-cast.png`).

### Rendering (`src/toon/toon.tsx`, the single source of truth)

- **Cel shading:** `meshToonMaterial` with `TOON_GRADIENT`, a 3-step
  `DataTexture` `[105, 185, 255]` (`RedFormat`, `NearestFilter`, no mipmaps).
  This gives 3 flat tones per object (shadow, base, highlight) and no gradients.
- **Outlines:** drei `<Outlines>` (inverted hull) in ink `#2b1f1a`, never pure
  black, with `toneMapped={false}`. Thickness is in **pixels**: drei's default
  `screenspace={false}` is the pixel-constant mode, despite the name.
  - `LINE.character = 6`, `LINE.prop = 4.5`, `LINE.background = 3`
  - Tiny face features (eyes, mouth, brows): no outline, use `InkMesh`
- **Build everything from** `ToonMesh` (toon material + outline + shadows) and
  `InkMesh` (flat unlit ink details).
- **Canvas:** `<ThreeCanvas shadows="basic" flat gl={{ antialias: true }}>`.
  - `"basic"` gives hard-edged comic shadows.
  - `flat` turns off tone mapping, so palette hex values render as written.
- **Characters don't receive shadows:** wrap them in
  `<ReceiveShadow.Provider value={false}>`. They still cast shadows.

### Palette (`PALETTE` in toon.tsx)

Muted and slightly desaturated: earthy browns, olive greens, soft sky blue, warm
cream.

- Skin is pale neutral `#eceae6`, so characters pop against the background.
- Key colors: sky `#a9c9dc`, cream `#e6d9bc`, timber `#5a3f2e`, roof `#7d4c38`,
  stone `#a9a395`, olive `#7c8656`, glass `#62798a`.
- Add new scene colors to `PALETTE` in the same muted family. No saturated
  primaries.

### Lighting presets

**Daylight (what shipped):**
- `ambientLight` intensity 1.1
- `hemisphereLight` `["#fbf8f2", "#8f8b82", 0.35]`
- `directionalLight` color `#fffaf0`, intensity 2.4, `castShadow`, with:
  - `shadow-mapSize={[4096, 4096]}`
  - `shadow-bias={-0.0006}`, `shadow-normalBias={0.08}`
  - `shadow-camera-{left,right,top,bottom}` set to ±22 (cover the whole set)

Keep the light color near-neutral: a warm `#fff4dc` turned pale characters yellow.

**Other moods:** golden window light or a dark interior with warm candle glow.
Change the light color and intensity and add warm `pointLight`s, but keep the
same toon ramp.

### Characters

The base look comes from the town-square cast, and the body comes from the
smooth rig:
- **Head:** oversized round sphere (r ≈ 0.62) in pale skin.
- **Face:** tiny and deadpan.
  - Small dark dot eyes with heavy flat lids.
  - Thick expressive eyebrows: raise, slant, one up.
  - Small mouth: a flat line, or an oval when talking.
  - Expressions stay dry.
- **Body (`ToonPerson`, `src/characters/toonfolk/ToonPerson.tsx`):**
  - **Torso:** one smooth `LatheGeometry` that tapers and slopes into the
    shoulders.
  - **Arms and legs:** each a single tapered tube along a Catmull-Rom curve, so
    elbows and knees bend smoothly with no visible joints. Arms use shoulder →
    elbow → wrist forward kinematics (`armChain`).
  - **Hands:** small mittens with a separate thumb.
- **Identity comes only from props:** hair, facial hair, hats, clothing.
  - Clothing is more detailed than the body (lapels, cuffs, buttons, collars).
  - Place chest details with `frontZ(y)` so they sit on the torso surface.
- **Pose API (`ToonPose`):**
  - Arms: `right` / `left` with `forward`, `out`, `elbow`, `twist` (turns the
    palm), `wrist`, `inward`.
  - Body and head: `lean`, `shoulderShift`, `headTilt` / `headTurn` / `headNod`.
  - Face: `browL` / `browR` / `browSlant`, `blink`, `mouth`.
  - `left` / `right` are the character's own sides.
  - An open palm toward camera on an out-swept arm needs `twist ≈ 1.5`.
- **New character** = a new `ToonLook` (colors plus `torso` / `head` JSX), like
  `founderLook` in `src/characters/toonfolk/founder.tsx` or the round-head cast
  in `src/characters/toonfolk/roundhead.tsx`.

### Body build: chibi is the standard

- **Every new video uses the chibi build** (the user chose it on 2026-10-29):
  squat body about 2.25 units tall, head about 55% of the height, short stubby
  limbs, same head (r 0.62), face, toon ramp, outlines and palette as before.
  Compare the two builds in the `BuildCompare` still
  (`style-reference/chibi-vs-tall.png`).
- `ToonPerson`'s `build` prop defaults to `"chibi"`. Proportions live in
  `BUILDS` in `ToonPerson.tsx` (hip height, torso scale, arm and leg lengths,
  relaxed arm, contact-helper defaults). Don't hard-code body heights; read
  them from `BUILDS[build]`.
- **`"tall"` is legacy, kept only so finished work renders unchanged.** The
  Nokia videos, `BigLaunch`/keynote, `FounderStill`, `NokiaCast` and
  `CastCloseup` pass `build="tall"` explicitly. Don't remove those props or
  switch them to chibi unless the user asks.
- **Looks work on both builds.** Torso details (`torso`) are authored once in
  the tall torso's design space with `frontZ(y)`; the chibi build squashes that
  group (`torsoW` 1.12, `torsoH` 0.56). Head details never change between
  builds.
- **Robes, armor skirts, long coats** go in the look's `lower(b)` slot:
  character space (feet at y = 0), doesn't lean with the body, and gets the
  build so it can reach the floor. Cache per-build geometry (`perBuild` in
  `roundhead.tsx`).
- **Chibi reach:** shoulders sit at about y 0.92 and an arm reaches about 0.62,
  so hand contacts (desks, keyboards, handshakes, carried boxes) sit around
  y 0.6 to 0.8. Size tables and props for that height.

### Stock cast (`src/characters/toonfolk/roundhead.tsx`)

- `oratorLook`: brown frock coat, bow tie, curly hair, big curled handlebar.
- `tycoonLook`: tuxedo, burgundy bow tie, pocket square, gold watch chain,
  slicked hair with a side part, thin waxed mustache. Smug pose: `blink ≈ 0.45`.
- `knightLook`: plate armor, gorget rings, pauldrons, tabard with a cream cross,
  armor skirt (`lower`), blunt bob haircut.
- `astronomerLook`: plum robe to the floor (`lower`), pleated ruff, bald crown
  with side tufts, forked beard, drooping mustache.
- Props: `PlantedSword` (grip at y 0.72), `Globe`, `MoneyBag`, `NoteStack`.
- Mustaches are swept tubes laid on the head surface (`Mustache`,
  `sweptTube`). Keep them at latitude −0.06 or lower so they clear the eyes,
  and above the mouth line at −0.3.

### Formats and aspect ratios

- `src/formats.ts` defines `long` (1920×1080, 16:9), `short` (1080×1920, 9:16),
  `square` (1:1) and `portrait` (4:5). Every composition is registered with
  `calculateMetadata={formatMetadata}` and `defaultProps={{ format: "long" }}`,
  so `--props='{"format":"short"}'` re-renders any video in any shape.
- **3D:** `SceneCanvas` uses `fitFov()`. Narrower frames keep about 62% of the
  16:9 horizontal view and show more above and below.
  - Per-scene `cam.portrait` overrides the framing for vertical formats.
- **2D overlays must use `useLayout()`:** reference-frame mapping, text
  scaling, auto-fit and safe zones (vertical: top 11%, bottom 20%).
  - `TitleCard`, `StatPop`, `QuoteCard` and `Captions` already do.
  - Never hard-code pixel positions.
  - Labels that belong ON an object use `Label3D` (a texture in the 3D scene).
- **Don't use drei `<Html>`.** It doesn't render reliably in Remotion's
  frame-by-frame capture.
- **Other video files:** `node scripts/reframe.mjs in.mp4 out.mp4 --to 9:16
  --mode crop|fit`.
- The short-form rules and the long → short repurposing flow are in the
  `make-video` skill (Step 0).

### Hands, contacts and props (mandatory: this prevents visual errors)

Any hand that must **touch** something is posed by **where the palm goes**,
never by guessed joint angles.

- **Reach arms:** `{ reach: [x, y, z], world: true, thumb?, pole? }` on
  `ToonPose.right/left`. The rig's two-bone IK (`reachChain` in `ToonPerson.tsx`)
  solves the elbow so the palm lands exactly there. Use FK angles only for free
  gestures (waves, shrugs, pointing at nothing).
- **Helpers** (`src/toon/contact.ts`):
  - `handshake(aPos, bPos, { y, forward, pump })` puts both right palms on one
    shared point, palm to palm, thumbs up.
  - `carry(pos, facing)` places the box center in the direction the character
    **faces**, with palms on its sides.
  - All helpers default to the chibi build. For tall characters pass
    `{ build: "tall" }` (`handshake`, `carry`) or `"tall"` as `restReach`'s
    4th argument.
  - `restReach(pos, facing, hand)` plus `reachBlend(rest, goal, t)` glide a hand
    from rest into a contact. `t` is clamped, so spring overshoot can't push
    hands through each other.
- **Held props** go in the `rightHand` / `leftHand` slots (hand space) or are
  placed with `carry()`. Never position a held prop with world offsets that
  ignore which way the character faces.
- **Mark every obstacle a hand could pass through as solid:** wrap tables,
  desks, monitors, laptop screens and bases, counters, railings, boards,
  podiums and walls in `<Solid name>` (`src/toon/qa.tsx`). Mark parts
  separately, e.g. a laptop's base and screen, so resting ON a surface passes.
- **Declare every touch:** `<ExpectContact a="CEO.right" b="BUYER.right" />`.
  Name characters with the `name` prop; hands report as `NAME.right` /
  `NAME.left`.
- **Characters standing behind a table** must stand clear of the tabletop
  (z ≈ −1.9 for the boardroom). Turning toward each other swings the hands
  forward.
- **Before every final render:** `node scripts/qa-contacts.mjs <CompositionId>`
  must print `✓ contact QA passed`.
  - It renders headless with `inputProps {qa: true}` and lists every frame
    where a hand is inside a solid or a declared contact doesn't touch.
  - Fix and re-run until it passes.
  - Then look at close-up stills of each contact moment. QA proves positions,
    not looks.

### Environments

- Backgrounds are **more detailed than the characters**: buildings, furniture,
  curtains, landscapes. Same outlines (3 px) and flat shading. The contrast is
  the point.
- Build detail procedurally and in layers. Example: `Building.tsx` has timber
  frames, windows with mullions and sills, shutters, balconies, gable roofs,
  chimneys and awnings.
- Cloth: a thin `BoxGeometry` with many segments, vertices displaced for the sag
  and folds (see `Stage.tsx`).

### Camera

- Cinematic and centered.
- Low angle looking up at the speaker, with crowd heads in the foreground
  framing the bottom third and a clear gap in the middle for the subject.
- Slow push-in plus a gentle pan over the shot, eased with
  `Easing.inOut(Easing.sin)`.
- Shipped values:
  - FOV 36
  - Camera moves (0.5, 1.3, 12.5) → (−0.3, 1.3, 11.2)
  - Looks at (0.25 → 0, 3.3, 0)
- The camera moves smoothly. Only characters animate on twos.

### Title text (`src/components/TitleCard.tsx`)

- Luckiest Guy, 130 px, white fill.
- 16 px ink stroke with `paintOrder: "stroke fill"`, plus a 10–12 px ink drop
  shadow.
- Rotated −7°, placed in the sky area (top ≈ 150, left ≈ 120).
- Pops in with `spring` (stiffness 260, damping 11), stepped on twos.
- Use it occasionally, not every shot.

### Motion

- Limited, snappy cartoon motion: small gestures, head tilts, blinks, arm
  raises. Nothing fluid or realistic.
- Character animation runs **on twos**: `onTwos(frame)` holds each pose for 2
  frames.
- Gestures use `spring({ stiffness: ~300–320, damping: ~14–16 })` for
  ease-in/out with a small overshoot.
- Blinks last 4 frames (eye scale-y 0.12). Mouths toggle open/closed every 4
  frames while talking.
- Secondary motion: a small head bob, one eyebrow rising and falling, a slight
  shoulder shift.

---

## 3. Mistakes we hit (don't repeat)

- **Speckled shadows on round heads:** self-shadow acne. Fix: characters don't
  receive shadows, and `normalBias` is 0.08.
- **Warm key light** turned pale skin yellow. Use `#fffaf0`.
- **Outlines on single-sided planes** don't work with inverted hulls. Use thin
  boxes instead.
- **Box outlines with gaps at the corners:** keep drei's default
  `angle = Math.PI` so normals get smoothed for the hull.
- **Additive glow on light skin** washes out to a cream halo. Use normal-blend
  transparent discs.
- **Extrude seams** cause scratchy shading and outline lines. Weld the
  vertices with `mergeVertices` (after deleting uv and normal) before
  `computeVertexNormals`.
- **Capsules plus joint spheres** read as lumpy and bulbous. Use the smooth
  rig (lathe torso, tube limbs).
- **Lapels angled the wrong way** read as suspenders. Lapels go outward at the
  top and meet at the button.
- **Titles clipped at the top:** rotation around `left center` lifts the right
  end, so leave headroom.
- **Captions merging across a sentence:** set `pageBreakAfter: true` on the
  last word, or reduce `combineTokensWithinMilliseconds`.
- **Foreground crowd too big or high** hides the subject. Check the framing on
  stills before rendering.
- **Hair built from blocks** looks like a hat. Use soft overlapping squashed
  spheres or a partial sphere cap.
- **The torus-arc mouth** must be rotated to be symmetric about the top.
  Otherwise it reads as a hook.
- **`new URL(import.meta.url).pathname` keeps the space in this project's path
  encoded as `%20`.** It wrote files into a stray `youtube%20videos/` folder.
  Use `fileURLToPath`.
- **Guessing arm angles for contacts.** Hands went through a monitor, and a
  "handshake" left the hands side by side without touching. Use reach arms,
  the helpers, `<Solid>`, `<ExpectContact>` and the QA script (§2 "Hands,
  contacts and props").
- **Placing a carried box with a fixed +z offset.** It ended up behind the
  character's back when he walked sideways. Use `carry(pos, facing)`.
- **Quote cards copying caption casing** ("the first…"). Capitalize the first
  word of on-screen quotes.
- **Gaps between lines:** cutting them to 0.12 s made the delivery feel flat.
  The user prefers 0.3 s of air plus holds after key beats.
- **Staging a character directly in front of the prop the scene is about** (EXEC
  in front of the chart) hides it. Check that the key prop is visible in every
  format.
- **Lathe profiles listed top to bottom** render black (inward normals). List
  `LatheGeometry` points bottom to top (`lathe()` in `roundhead.tsx` sorts them).
- **Mustache curls at eye height** read as goggles. Keep them low (see Stock
  cast).
- **Before reporting, always look at the rendered stills.** Every one of these
  bugs was only visible in a render.

---

## 4. Making a new video from a script

Plan every new video with the `make-video` skill (`.claude/skills/make-video/SKILL.md`): topic ideas, fact research, story structure, duration, storyboard, continuity, an approval checkpoint, and a final checklist. Then build it with the steps below.

1. **Break the script into shots.** For each shot, note:
   - duration (30 fps)
   - setting and lighting mood
   - characters and their props/outfits
   - camera (angle, push or pan)
   - key gestures and expressions
   - title text, if any
   - the lines spoken
2. **Design new characters first** on the chibi build. Add a `ToonLook` per new character. Render
   a design still (like `FounderStill`) and **get the user's approval before
   animating**.
3. **Build each shot's set** in `src/scenes/<shot>/` from `ToonMesh` / `InkMesh`,
   using a lighting preset from §2. Keep backgrounds richer than characters.
4. **Animate** with `ToonPose` driven by `onTwos(frame)` and snappy springs.
   Add one camera rig per shot.
5. **Register a composition** per shot in `src/Root.tsx` (1920×1080, 30 fps),
   plus a master composition that strings the shots together with `<Sequence>`.
6. **Contact QA:** `node scripts/qa-contacts.mjs <Id>` must pass, with no hand
   in a solid and every declared contact touching. Then check close-up stills
   of every handshake, grab, typing and carry moment.
7. **Check before the full render:** `npx remotion still <Id> out/<id>-f<N>.png
   --frame=N` at the start, middle and end. Look at every still and fix framing
   and artifacts.
8. **Voiceover and captions:**
   - Generate each line with `node scripts/voiceover.mjs <name> "<text>"`
     (cloned Narrator voice, see §1).
   - Verify the words by transcribing the result.
   - Size the shot to the printed frame count.
   - Add `<Audio src={staticFile("audio/voice/<name>.wav")} />` and
     `<Captions src={staticFile("captions/<name>.json")} />`
     (`src/components/Captions.tsx`, house style) to the composition.
   - Drive mouth flaps from the same caption JSON.
   - Add the original score (ducked under the voice) and scene sound effects, as described in §1 "Music and sound effects".
9. **Render:** `npx remotion render <Id> out/<name>.mp4`, then check the
   duration with `ffprobe`.
10. **Save 2–3 approved frames to `style-reference/`** so future work matches.

---

## 5. Layout

- `src/toon/toon.tsx`: style kit (gradient, ink, line widths, palette,
  `ToonMesh`, `InkMesh`, `onTwos`, `ReceiveShadow`).
- `src/characters/toonfolk/`: smooth character rig (`ToonPerson`, with
  `BUILDS`), looks (`founder.tsx`, `business.tsx`, the round-head cast in
  `roundhead.tsx`), design stills (`FounderStill`, `RoundHeadCast` and
  `BuildCompare` in `CastStill.tsx`).
- `src/scenes/townsquare/`: approved reference scene (buildings, stage, crowd,
  speaker, sky, camera rig).
- `src/scenes/keynote/`: `BigLaunch` test (conference hall, lectern, seated
  audience from behind using `ToonPerson` + `audienceLook` from
  `src/characters/toonfolk/crowd.tsx`). Reuse it as the pattern for
  seated-audience shots.
- `style-reference/`: approved stills (founder design, keynote frames,
  town-square frame). Compare new work against these.
- `src/components/`: 2D overlays (`TitleCard.tsx`, `Captions.tsx`).
- `src/characters/kernel/`: **retired** alternative design (rounded-rect heads,
  teal dot). Don't use it unless asked.
- `public/audio/`, `public/captions/`: media. `out/`: renders (git-ignored).

## 6. Commands

- `npm run dev`: Remotion Studio (live preview).
- `npx remotion still <Id> out/frame.png --frame=N`: render one frame.
- `npx remotion render <Id> out/<name>.mp4`: render a video.
- `npm run typecheck`: TypeScript check (run after every edit batch).
- `npx remotion render <Id> out/x.mp4 --props='{"format":"short"}'`: render any composition vertical (also `long`, `square`, `portrait`).
- `node scripts/reframe.mjs in.mp4 out.mp4 --to 9:16 [--mode crop|fit]`: change the aspect ratio of any video file.
- `npm run qa -- <Id>`: contact QA (hands in solids, contacts that don't touch). Must pass before a final render.
