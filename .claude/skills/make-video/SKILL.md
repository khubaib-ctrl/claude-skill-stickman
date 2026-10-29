---
name: make-video
description: Plan and produce a tech/business explainer for this channel as a long-form horizontal video (16:9) or a vertical short/reel (9:16), from topic ideas through fact research, story structure, storyboard, approval, voiceover, render and final checks. Also cuts shorts from an existing long video and changes the aspect ratio of any video. Use when the user asks to make, plan, script or storyboard a video, short or reel, asks for topic ideas, or wants a video in another aspect ratio. Pass a title to skip the topic menu.
---

# Video Production Workflow

Use this for every new video. It covers **what to say and how to pace it**. How
it **looks and sounds** is fixed by `CLAUDE.md`:
- **Visual style:** the current finalized toon style in §2 (the `ToonTest` look,
  smooth `ToonPerson` characters, round pale heads). Kernel stays retired.
- **Voiceover:** §1.
- **Build steps:** §4.

Never change those rules from here.

Keep each video's planning files in `videos/<slug>/`:

| File | Contents |
| --- | --- |
| `sources.md` | Research brief, linked sources, verification notes |
| `storyboard.md` | Duration recommendation + storyboard table |
| `continuity.md` | Per-scene character state tracking |
| `checklist.md` | Final checklist results |

## Step 0: Pick the format (ask if the user didn't say)

| Format | Use for | Size (`format` prop) | Length | Notes |
|---|---|---|---|---|
| **Long-form** | YouTube videos | 1920×1080, `long` (16:9) | 1–10 min | The default. Full story structure (Step 3) |
| **Short / Reel** | YouTube Shorts, Instagram Reels, TikTok | 1080×1920, `short` (9:16) | 15–60 s (max 60) | Short-form rules below |
| Square / Portrait | Feed posts | `square` (1:1), `portrait` (4:5) | any | Same rules as shorts, less extreme |

Then follow one of three paths:

- **A. New long-form video:** Steps 1–10 as written.
- **B. New short / reel:** Steps 1–10 with the short-form rules.
- **C. Short from existing content:** see "Cutting shorts from a long video" below.
- **D. Change the aspect ratio of any video:** see "Changing aspect ratio" below.

### Short-form rules (9:16)

- **Hook in the first second.** The first frame must already be the
  surprising fact or the image. No title card first and no setup sentence.
- **One idea per short.** One twist, one number, one turning point. If it needs
  two, make two shorts.
- **15–60 s.** About 2.3 wps planned → **35–135 words**. Shorter performs better.
  Aim for 30–45 s.
- **Faster pacing:** a visual change every 1.5–2.5 s.
- **Framing:** subjects centered in the middle 60% of the width.
  - Titles go in the top band, captions sit above the bottom 20% (app UI),
    and stat pops go in the band under the title (all handled by `useLayout()`).
  - If a scene loses its subject in vertical, add a `cam.portrait` override.
- **Captions on, always** (most shorts are watched muted). They're bigger and
  wrap automatically in vertical.
- **End so it loops or lands on a punchline.** No "subscribe" outro.
- Every other rule in Steps 2–10 still applies: sources, approval, contact QA
  and the final checklist.

### Cutting shorts from a long video (path C)

1. Read the long video's `storyboard.md` and `sources.md`.
2. Propose **3–5 short candidates**, each built around one self-contained beat
   (a surprising number, the turning point, the punchline). For each give:
   - title
   - hook line (first second)
   - which long-video scenes it reuses
   - new narration (≤ 135 words)
   - length estimate

   Recommend the best one and wait for the pick.
3. Write the short's narration. Reuse the approved facts only; anything new
   gets researched and added to `sources.md` (Step 2). Keep the long video's
   characters, sets and props.
4. Storyboard it in `videos/<slug>/short-<n>/storyboard.md`. Most shorts reuse
   existing scene components with new timing, plus one stronger opening shot.
   Get approval (Step 8).
5. Produce it as a new composition registered with `defaultProps={{ format: "short" }}`:
   - new voiceover lines (`scripts/voiceover.mjs`)
   - score composed to the short's length
   - effects
   - contact QA
   - stills checked **in 9:16**
   - render

### Changing aspect ratio (path D)

- **Videos made in this project:** re-render natively with the `format` prop.
  This gives no cropping, and cameras widen or narrow and overlays reposition
  automatically:
  `npx remotion render <Id> out/<name>-short.mp4 --props='{"format":"short"}'`
  (or `"long"`, `"square"`, `"portrait"`).
  - Check stills in the new format first. Add a `cam.portrait` override to any
    scene whose subject gets cut off.
  - Pin labels ON objects with `Label3D`; never use fixed pixels.
  - Run `npm run qa -- <Id>` again.
- **Any other video file:**
  `node scripts/reframe.mjs <in.mp4> <out.mp4> --to 9:16 --mode crop --focus 0.5`
  - Use `--mode fit` to keep the whole picture on a blurred fill.
  - Crop mode cuts off burned-in captions and side content, so check the result
    and adjust `--focus`.

## Step 1: Topic ideas (only when no title is given)

If the user didn't give a title, suggest **8 specific story ideas**. Each one
should be a concrete story ("The 2008 night Netflix almost bought…"), not a
broad category ("streaming history"). Mix companies, eras, industries and
well-known vs. lesser-known stories. For each idea give:

- **Title**
- **One-line premise:** factual, one sentence
- **Opening visual:** what's on screen in the first 2 seconds, specific enough
  to imagine in our toon style
- **Recommended length**
- **Difficulty:** Easy / Medium / Hard, with the reason (sets, cast size,
  props, how much data needs explaining)

Then recommend the strongest idea in 1–2 sentences: why it has the best hook,
clearest turning point and most visual story. Ask only **"Which topic would you
like to make?"** and **wait**. If a title was given, skip this step.

## Step 2: Fact research (before writing any narration)

1. Research the topic with WebSearch and WebFetch. Prefer, in order:
   1. official company sources: press releases, investor relations, annual
      reports, SEC/EDGAR filings, earnings call transcripts
   2. reputable news: Reuters, AP, Bloomberg, FT, WSJ, NYT, The Verge, etc.
   3. books by credible authors, and court records
2. Write `videos/<slug>/sources.md`:
   - **Brief:** what happened, when, where, who, why it mattered (cause),
     the turning point and the outcome
   - **At least 2 linked sources**, each with what it supports
   - **Key claims table:** claim → source(s) → status (verified / single-source /
     disputed)
3. **Verify surprising claims separately.** Big numbers, dramatic moments and
   "nobody knows this" facts each need their own search and ideally a second
   independent source.
4. **Never invent** quotes, numbers, dates, motives, private conversations or
   decisive actions.
   - Narration carries the story by default. Characters don't speak invented
     lines.
   - Any staging that isn't documented (a composite character, a symbolic
     scene) is marked **dramatization** in the storyboard.
5. **If sources disagree,** note it briefly and write the conservative version:
   "about", "reportedly", or the smaller number.
6. **Real people and companies:** describe documented actions, not character
   judgments. Keep cartoon portrayals fair and don't imply wrongdoing the
   sources don't support.
7. **If browsing is unavailable,** say so, mark facts "verification pending" and
   don't present them as established.

## Step 3: Story structure

Write the story in this order. **Every scene must move the story:** it advances
events, clarifies cause and effect, or reveals the outcome. Cut any scene that
doesn't.

1. **Hook in the first 2 seconds:** a concrete visual problem or surprising
   fact. No greetings, no "in this video", no channel intro.
2. **Context:** only what the viewer needs to understand the stakes.
3. **Escalation:** pressure builds (competition, money running out, a bad bet).
4. **Turning point:** the decision or event that changes everything.
5. **Outcome:** the real consequence, or a memorable insight. End on it rather
   than a summary.

The tone is dry and deadpan, matching the house style. Let the facts be the joke.

## Step 4: Recommended duration

For **shorts** the length is 15–60 s (see Step 0). For long-form:

Recommend a length based on how much the story needs, and **explain why** in
2–3 sentences: number of beats, how much context, how many numbers need a hold.

- **Short (30–60 s):** one clear twist, almost no setup
- **Standard explainer (2–4 min):** a few escalation beats with context
- **Deep dive (6–10 min):** multiple turning points, a lot of necessary context

Word budget = seconds × **2.3 words/second**. For example, 60 s ≈ 138 words.
This is a planning rate. The previous narrator voice (The Documentarian) read at about
3.5 words/second, so measured audio comes in well under the plan. Always size shots from
the actual audio (Step 9).

## Step 5: Storyboard table

Write `videos/<slug>/storyboard.md` with one row per scene. Time ranges are
absolute (00:00–00:04). Narration is the exact words that will be spoken, at
~2.3 words/second for the time range.

| # | Time | Narration (exact) | Visual action | Characters | Location | Story purpose |
|---|------|-------------------|---------------|------------|----------|---------------|

- **Visual action** names the one main action, the camera move (if any), title
  text (if any), and any **dramatization** flag.
- **Story purpose** is one of: hook / context / escalation / turning point /
  outcome / insight, plus a few words on what it achieves.

## Step 6: Scene pacing rules (apply while storyboarding and animating)

- **Change something every 2–4 seconds:** a pose, a prop, or the framing. No
  static stretches longer than 4 s.
- **One main action per scene.** Split a scene that needs two.
- **At most one camera move per scene:** a slow push-in, gentle pan or a cut.
  Movement must have a reason.
- **Let it breathe.** Keep 0.3 s of air between narration lines, and hold
  0.6–1.5 s after key beats (hook, title, quote, punchline, big number,
  ending). Pauses carry emotion, so don't trim them away.
- Use anticipation → action → reaction for gestures. Use readable poses, not
  constant motion.
- Don't pack unrelated locations or big time jumps into one scene. Make those
  a cut and say so in the storyboard.

## Step 7: Continuity tracking

Write `videos/<slug>/continuity.md` with one row per character per scene,
recording the state **in → out**:

| Scene | Character | Position (frame + set) | Facing | Pose in → out | Props (which hand) | Outfit state | Notes |
|-------|-----------|------------------------|--------|---------------|--------------------|--------------|-------|

- Each scene's outgoing state must equal the next scene's incoming state.
- **No silent resets.** A dropped prop stays dropped, a removed jacket stays
  off, a character who walked left is still on the left.
- At an intentional cut or time jump, write what changes and what stays fixed.
- Left and right are in the character's own orientation (as in `ToonPose`).
- Check the rendered stills against this table (CLAUDE.md §4 step 6).

## Step 8: Approval checkpoint (hard stop)

Show the user:
1. the research brief and sources (`sources.md`)
2. the recommended duration and why
3. the storyboard table
4. the continuity table

Then **wait for explicit approval**. Do **not** generate voiceover, build scenes
or render before the user approves. Apply requested changes and re-show the
changed parts. After approval, continue with CLAUDE.md §4 (new characters still
need their own design-still approval).

## Step 9: Production (after approval)

Follow CLAUDE.md §4 and the voiceover setup in §1:

1. Generate narration per scene with `scripts/voiceover.mjs`.
2. Transcribe it back and compare it to the storyboard narration word for word.
3. Set each scene's `durationInFrames` from the measured audio, not the
   2.3 words/second estimate. Use line length + 0.3 s of air, plus holds on key
   beats (see `scripts/nokia-frames.mjs`).
4. Update the storyboard time ranges to the real timings.
5. Pose every touch (handshakes, typing, carrying, leaning on a table) with
   reach arms and the helpers in `src/toon/contact.ts`.
   - Wrap obstacles in `<Solid>` and declare touches with `<ExpectContact>`.
   - Run `node scripts/qa-contacts.mjs <Comp>` until it passes, then check
     close-up stills of each contact moment (CLAUDE.md §2 "Hands, contacts and
     props").

## Step 9b: Publish package (after the final render)

Write `videos/<slug>/youtube-metadata.md` with:
- **Title**
- **Description**
  - a 2-sentence hook
  - what the video covers
  - chapters (long-form only: first at 0:00, each ≥ 10 s, from measured scene
    starts)
  - linked sources from `sources.md`
  - a dramatization note
  - "music and sound effects are original"
  - 2–3 hashtags (`#Shorts` for vertical)
- A **separate short description** for 9:16 (no chapters)
- **Tags:** ≤ 500 characters, comma-separated, search phrases first.

Render a **thumbnail** for each format as a `Still`, following
`src/videos/nokia/Thumbnail.tsx`:
- one character with a strong expression, filling about a third of the frame
- one big symbolic prop
- 2–4 words of chunky title text that are **accurate**
- an arrow or contrast accent

Register it at 1280×720 and as a 9:16 variant with `format: "short"`, then
look at both renders and fix the framing before delivering.

## Step 10: Final checklist (before delivering)

Write `videos/<slug>/checklist.md` and report it:

- [ ] Every factual claim in the narration is backed by `sources.md`. Surprising
      claims are verified separately and dramatization is flagged.
- [ ] The hook lands in the first 2 seconds with no greeting.
- [ ] Format is right: long-form is 16:9, shorts are 9:16 and ≤ 60 s with the
      hook in the first second. Stills were checked in the delivered format.
- [ ] The story has a turning point and a clear outcome or insight. Every scene
      moves it.
- [ ] Narration matches the audio:
  - transcription matches the script
  - total audio length matches the video length (`ffprobe`)
  - captions are in sync
- [ ] Pacing: a change every 2–4 s, one main action and at most one camera move
      per scene. Narration breathes: about 0.3 s between lines, with holds on
      key beats.
- [ ] Continuity holds: in/out states agree and there are no silent resets
      (checked on stills).
- [ ] Contact QA passes (`scripts/qa-contacts.mjs`): no hand inside a solid,
      every declared contact touches. Close-ups of each contact moment look
      right.
- [ ] Nothing is missing: every storyboard scene is rendered, title text is
      correct, audio and captions are present, and the final file exists.
- [ ] **Uncertain items:** list anything single-sourced, disputed, estimated
      (e.g. word timings) or unverified. If there are none, say so explicitly.
