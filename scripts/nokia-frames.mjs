#!/usr/bin/env node
/**
 * Scene lengths for the Nokia v2 cut: measured voiceover (natural pauses kept)
 * + 0.3 s of air + dramatic holds after key beats. The user prefers these gaps:
 * they let facts and jokes land and carry emotion.
 */
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
const AIR = 0.3;
const HOLD = { 1: 0.6, 2: 1.0, 4: 1.5, 7: 0.6, 11: 1.0, 13: 1.0, 14: 1.4 };
const frames = [];
for (let i = 1; i <= 14; i++) {
  const f = `public/audio/voice/nokia2-${String(i).padStart(2, "0")}.wav`;
  const d = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]));
  frames.push(Math.round((d + AIR + (HOLD[i] ?? 0)) * 30));
}
writeFileSync("src/videos/nokia/frames2.json", JSON.stringify(frames) + "\n");
const total = frames.reduce((a, b) => a + b, 0);
console.log(frames.join(", "), `→ ${total} frames = ${(total / 30).toFixed(2)} s`);
