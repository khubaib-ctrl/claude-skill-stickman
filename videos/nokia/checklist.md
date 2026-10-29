# Nokia v2: final checklist

**Video:** `out/how-nokia-lost-the-phone-market-v2.mp4`
- 1920×1080, 30 fps, 1:46.8
- 31 MB, H.264 video + AAC audio
- Video and audio tracks match (106.800 / 106.816 s)

**Title:** "How Nokia Lost the Phone Market in Under 6 Years"

The v1 checklist is in `checklist-v1.md`.

**User feedback addressed in v2:**
1. Background music: an original score, ducked under the voice.
2. A more engaging script: cold open, real memo quotes, the oil-platform set
   piece, and the "from/back to Microsoft" running joke.
3. Sound effects: 29 original effects, cued per scene.
4. Refined characters: eyes, brows, mouth, ears, softer skin shading, shoes,
   hems, beard.

- [x] **Every factual claim is backed by `sources.md`.**
  - v2 adds Nokia's SEC 6-K (the CEO came from Microsoft) and the full memo
    text (verbatim quotes).
  - The quote on screen and in the narration matches the published memo word
    for word.
  - Dramatization is flagged: the oil-rig parable scene, the generic presenter,
    the handshake and signing staging, and the symbolic podium.
- [x] **The hook lands in the first 2 seconds.** It opens on the "4 in 10"
  fact, and "This is how Nokia lost" plus the title slam come at about 0:12.
  No greeting.
- [x] **The story has a turning point and a clear outcome.**
  - The memo, then the Windows Phone bet, lead to the slide, the sale and the
    write-down.
  - The insight: Nokia survived, but not as a phone maker.
  - The running joke pays off in scene 12.
- [x] **Narration matches the audio.**
  - All 14 lines were transcribed and checked one by one.
  - The finished video's audio was transcribed again, and every line plays in
    order.
  - Three spots misheard in long-chunk transcription were re-checked in short
    windows. The full mix matches the clean voice track word for word.
  - Scene lengths come from the measured audio plus air and holds
    (`scripts/nokia-frames.mjs`).
- [x] **Audio mix.**
  - The voice leads.
  - The score sits about 23 dB under the voice, ducks during words, mutes for
    the write-down (scene 13) and resolves at the end.
  - The 19 effects that play under speech were lowered after the first mix to
    keep the words clear.
  - Overall level: −18.6 dB mean, −0.4 dB peak.
- [x] **Pacing.**
  - Something changes every 2–4 s, and each scene has one main action and at
    most one camera move.
  - Scenes 3, 6 and 11 use deliberate setup/punchline cuts.
  - Holds on: the lit phones, the title slam, the typed quote, "From
    Microsoft", €5.44B, $7.6B and the ending.
- [x] **Continuity** (checked on the contact sheet and spot frames).
  - The moving box arrives in scene 7, is visible by the plant in 8 and 11, and
    leaves with the CEO in 12.
  - The memo stays on the table from scene 6 onward.
  - The chart stays below 25% after scene 9.
  - The phone pile carries from scene 5 into scene 6.
  - The scarf appears only at the scene 14 time jump.
  - In scene 9 the camera is framed on the chart, so the box is out of shot
    there. That's not a reset.
- [x] **Nothing is missing.** All 14 scenes are rendered, the titles are
  correct (NOKIA 2007 / FEB 2011 / SEP 2010 / SEP 2013 / JUL 2015 / HOW NOKIA
  LOST), the stat pops show, voice, captions, music and effects are present,
  and the file exists.

## Uncertain items

1. **Nobody has heard the synthesized music and effects.** They were checked by
   waveform, level and intelligibility tests only. Please listen, especially to
   the score's tone and the "wah", "boop" and fire sounds.
2. **Pronunciations to confirm by ear:**
   - Line 6 is generated as "The memo **opens**" (script says "opened"). It's
     still accurate.
   - Line 12, "move to Microsoft": one isolated pass heard "move the".
3. **Word timings are estimated** by syllable within speech regions, so the
   caption highlight and beat timing can drift slightly within a line.
4. **Single-analyst figures:** Gartner Q3 2011 (23.9%). The 2012 unit count
   varies by 1M across reports (the narration says "almost ninety million
   fewer").
5. **Nokia's present-day status** ("builds mobile networks") is backed by its
   2016 acquisition. It wasn't re-checked for 2026.
6. **"Five months earlier"** rounds 4.6 months (21 Sep 2010 → 8 Feb 2011).
