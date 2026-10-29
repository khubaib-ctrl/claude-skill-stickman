/**
 * Shared silence trimming for voice lines (used by voiceover.mjs and tighten-voice.mjs).
 * Keeps 40 ms before the first word and 80 ms after the last, so lines butt up
 * against each other with only a natural breath and no dead air.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LEAD_PAD = 0.04;
const TAIL_PAD = 0.08;

const duration = (f) =>
  Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString());

/** Speech start/end (seconds) from ffmpeg silencedetect. */
export const speechBounds = (wav) => {
  const d = duration(wav);
  const log = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", wav, "-af", "silencedetect=noise=-40dB:d=0.06", "-f", "null", "-"], {
    encoding: "utf8",
  }).stderr;
  const sil = [];
  let open = null;
  for (const m of log.matchAll(/silence_(start|end): ([0-9.]+)/g)) {
    if (m[1] === "start") open = Number(m[2]);
    else if (open !== null) {
      sil.push([open, Number(m[2])]);
      open = null;
    }
  }
  if (open !== null) sil.push([open, d]);
  let start = 0;
  let end = d;
  if (sil.length && sil[0][0] <= 0.01) start = sil[0][1];
  const last = sil[sil.length - 1];
  if (last && last[1] >= d - 0.01 && last[0] > start) end = last[0];
  return { start, end, duration: d };
};

/** Trim public/audio/voice/<name>.wav in place and shift its captions JSON (if present). */
export const trimVoice = (name) => {
  const wav = path.join(root, "public/audio/voice", `${name}.wav`);
  const cap = path.join(root, "public/captions", `${name}.json`);
  const { start, end, duration: before } = speechBounds(wav);
  const cutStart = Math.max(0, start - LEAD_PAD);
  const cutEnd = Math.min(before, end + TAIL_PAD);
  const tmp = wav.replace(/\.wav$/, ".trim.wav");
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", wav, "-ss", cutStart.toFixed(3), "-to", cutEnd.toFixed(3), "-c:a", "pcm_s16le", tmp]);
  renameSync(tmp, wav);
  if (existsSync(cap)) {
    const shift = Math.round(cutStart * 1000);
    const maxMs = Math.round((cutEnd - cutStart) * 1000);
    const words = JSON.parse(readFileSync(cap, "utf8")).map((w) => ({
      ...w,
      startMs: Math.max(0, Math.min(maxMs, w.startMs - shift)),
      endMs: Math.max(0, Math.min(maxMs, w.endMs - shift)),
      timestampMs: w.timestampMs == null ? null : Math.max(0, Math.min(maxMs, w.timestampMs - shift)),
    }));
    writeFileSync(cap, JSON.stringify(words, null, 2) + "\n");
  }
  return { before, after: cutEnd - cutStart, lead: cutStart, tail: before - cutEnd };
};
