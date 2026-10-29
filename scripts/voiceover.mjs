#!/usr/bin/env node
/**
 * Generate a voiceover line with the channel narrator voice (local VoiceStudio)
 * and write word-timed captions for Remotion.
 *
 *   node scripts/voiceover.mjs <name> "<text>" [--voice <profile-id>] [--trim]
 *
 * Writes:
 *   public/audio/voice/<name>.wav      (24 kHz mono)
 *   public/captions/<name>.json        (@remotion/captions Caption[])
 *
 * VoiceStudio's ASR returns no word timestamps, so word timing is estimated:
 * ffmpeg silencedetect finds the speech regions, words are split across those
 * regions at the split points with the most even speaking rate (bonus for
 * punctuation), then spread inside each region by syllable count.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { trimVoice } from "./voice-trim.mjs";

const API = process.env.VOICESTUDIO_URL ?? "http://localhost:3900";
const DEFAULT_VOICE = "beec786a"; // "The Storyteller" preset (male, elderly, low, British). Others: Documentarian 8b4d6add, old clone a84eb878

const args = process.argv.slice(2);
const voiceIdx = args.indexOf("--voice");
const voice = voiceIdx >= 0 ? args.splice(voiceIdx, 2)[1] : DEFAULT_VOICE;
const trimIdx = args.indexOf("--trim");
const trim = trimIdx >= 0 && Boolean(args.splice(trimIdx, 1));
const [name, text] = args;
if (!name || !text) {
  console.error('usage: node scripts/voiceover.mjs <name> "<text>" [--voice <profile-id>]');
  process.exit(1);
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const wavPath = path.join(root, "public/audio/voice", `${name}.wav`);
const capPath = path.join(root, "public/captions", `${name}.json`);
mkdirSync(path.dirname(wavPath), { recursive: true });
mkdirSync(path.dirname(capPath), { recursive: true });

// 1. Synthesize.
const health = await fetch(`${API}/health`).catch(() => null);
if (!health?.ok) {
  console.error(`VoiceStudio is not reachable at ${API}. Start it (see CLAUDE.md "Voiceover").`);
  process.exit(1);
}
const res = await fetch(`${API}/v1/audio/speech`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ model: "tts-1", voice, input: text, response_format: "wav" }),
});
if (!res.ok) {
  console.error(`TTS failed (${res.status}): ${await res.text()}`);
  process.exit(1);
}
writeFileSync(wavPath, Buffer.from(await res.arrayBuffer()));
// Natural pauses are kept by default (they carry emotion). Pass --trim to cut the engine's edge silence.
if (trim) trimVoice(name);

// 2. Speech regions from silencedetect.
const duration = Number(
  execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", wavPath]).toString(),
);
// silencedetect logs to stderr; spawnSync captures it.
const stderr = spawnSync(
  "ffmpeg",
  ["-hide_banner", "-nostats", "-i", wavPath, "-af", "silencedetect=noise=-40dB:d=0.12", "-f", "null", "-"],
  { encoding: "utf8" },
).stderr;
const silences = [];
let open = null;
for (const m of stderr.matchAll(/silence_(start|end): ([0-9.]+)/g)) {
  if (m[1] === "start") open = Number(m[2]);
  else if (open !== null) {
    silences.push([open, Number(m[2])]);
    open = null;
  }
}
if (open !== null) silences.push([open, duration]);
let regions = [];
let cursor = 0;
for (const [s, e] of silences) {
  if (s > cursor) regions.push([cursor, s]);
  cursor = e;
}
if (cursor < duration) regions.push([cursor, duration]);
regions = regions.filter(([s, e]) => e - s >= 0.15);

// 3. Words + syllable weights.
const words = text.split(/\s+/).filter(Boolean);
const syl = (w) => {
  const s = w.toLowerCase().replace(/[^a-z]/g, "");
  if (!s) return 1;
  const groups = s.replace(/e$/, "").match(/[aeiouy]+/g);
  return Math.max(1, groups ? groups.length : 1);
};
const weights = words.map(syl);
const punct = words.map((w) => /[,.;:!?]$/.test(w));

// Partition words into contiguous groups, one per region (DP on rate evenness).
const k = Math.min(regions.length, words.length);
regions = regions.slice(0, k);
const prefix = [0];
for (const w of weights) prefix.push(prefix[prefix.length - 1] + w);
const total = prefix[prefix.length - 1];
const speech = regions.reduce((a, [s, e]) => a + (e - s), 0);
const meanRate = total / speech;
const cost = (i, j, r) => {
  const rate = (prefix[j] - prefix[i]) / (regions[r][1] - regions[r][0]);
  return (rate - meanRate) ** 2;
};
const INF = 1e18;
const dp = Array.from({ length: k + 1 }, () => Array(words.length + 1).fill(INF));
const back = Array.from({ length: k + 1 }, () => Array(words.length + 1).fill(-1));
dp[0][0] = 0;
for (let r = 1; r <= k; r++) {
  for (let j = r; j <= words.length; j++) {
    for (let i = r - 1; i < j; i++) {
      if (dp[r - 1][i] === INF) continue;
      const bonus = r < k && punct[j - 1] ? -0.5 : 0;
      const c = dp[r - 1][i] + cost(i, j, r - 1) + bonus;
      if (c < dp[r][j]) {
        dp[r][j] = c;
        back[r][j] = i;
      }
    }
  }
}
const cuts = [];
for (let r = k, j = words.length; r > 0; r--) {
  cuts.unshift([back[r][j], j]);
  j = back[r][j];
}

// 4. Spread words inside each region by syllables.
const captions = [];
cuts.forEach(([i, j], r) => {
  const [s, e] = regions[r];
  const w = prefix[j] - prefix[i];
  let t = s;
  for (let n = i; n < j; n++) {
    const d = ((e - s) * weights[n]) / w;
    captions.push({
      text: (captions.length ? " " : "") + words[n],
      startMs: Math.round(t * 1000),
      endMs: Math.round((t + d) * 1000),
      timestampMs: Math.round((t + d / 2) * 1000),
      confidence: null,
      ...(punct[n] && /[.!?]$/.test(words[n]) ? { pageBreakAfter: true } : {}),
    });
    t += d;
  }
});
writeFileSync(capPath, JSON.stringify(captions, null, 2) + "\n");

console.log(`audio    ${path.relative(root, wavPath)}  (${duration.toFixed(2)}s, voice ${voice})`);
console.log(`captions ${path.relative(root, capPath)}  (${captions.length} words, ${regions.length} speech regions)`);
console.log(`frames   ${Math.ceil(duration * 30)} @30fps`);
