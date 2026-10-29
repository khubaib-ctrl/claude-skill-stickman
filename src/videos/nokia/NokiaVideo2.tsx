import { Audio } from "@remotion/media";
import { AbsoluteFill, Series, staticFile } from "remotion";
import { Captions } from "../../components/Captions";
import FRAMES from "./frames2.json";
import { SCENES2, WORDS } from "./scenes2";

/** Measured scene lengths (frames @30fps); regenerate with scripts/nokia-frames.mjs. */
export const NOKIA2_FRAMES: number[] = FRAMES;
export const NOKIA2_TOTAL = NOKIA2_FRAMES.reduce((a, b) => a + b, 0);
const STARTS = NOKIA2_FRAMES.map((_, i) => NOKIA2_FRAMES.slice(0, i).reduce((a, b) => a + b, 0));
const FPS = 30;

/** Music level per frame: ducked under narration, out for the write-down (scene 13). */
const MUSIC_LEVEL = (() => {
  const BASE = 0.16;
  const DUCK = 0.075;
  const raw = new Float32Array(NOKIA2_TOTAL).fill(BASE);
  WORDS.forEach((words, i) => {
    for (const w of words) {
      const a = STARTS[i] + Math.floor((w.startMs / 1000) * FPS) - 3;
      const b = STARTS[i] + Math.ceil((w.endMs / 1000) * FPS) + 3;
      for (let f = Math.max(0, a); f < Math.min(NOKIA2_TOTAL, b); f++) raw[f] = DUCK;
    }
  });
  const s13 = STARTS[12];
  const e13 = s13 + NOKIA2_FRAMES[12];
  for (let f = s13; f < e13; f++) raw[f] = 0;
  // Smooth with a 12-frame moving average so ducking glides instead of clicking.
  const out = new Float32Array(NOKIA2_TOTAL);
  const W = 12;
  for (let f = 0; f < NOKIA2_TOTAL; f++) {
    let sum = 0;
    let n = 0;
    for (let k = f - W; k <= f + W; k++) {
      if (k >= 0 && k < NOKIA2_TOTAL) {
        sum += raw[k];
        n++;
      }
    }
    out[f] = sum / n;
  }
  return out;
})();

/** "How Nokia Lost the Phone Market in Under 6 Years" (v2: new script, score, sound effects). */
export const NokiaVideo2: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#2f2a27" }}>
    <Series>
      {SCENES2.map((Scene, i) => {
        const id = `nokia2-${String(i + 1).padStart(2, "0")}`;
        return (
          <Series.Sequence key={id} durationInFrames={NOKIA2_FRAMES[i]} name={`Scene ${i + 1}`}>
            <Scene />
            <Captions src={staticFile(`captions/${id}.json`)} />
            <Audio src={staticFile(`audio/voice/${id}.wav`)} />
          </Series.Sequence>
        );
      })}
    </Series>
    <Audio src={staticFile("audio/music/nokia-score.wav")} volume={(f) => MUSIC_LEVEL[Math.min(f, NOKIA2_TOTAL - 1)] ?? 0} />
  </AbsoluteFill>
);
