#!/usr/bin/env node
/**
 * Change the aspect ratio of ANY video file (made here or not) with ffmpeg.
 *
 *   node scripts/reframe.mjs <in.mp4> <out.mp4> --to 9:16 [--mode crop|fit] [--focus 0.5] [--focusY 0.5]
 *
 *   --to     9:16 | 16:9 | 1:1 | 4:5 | WIDTHxHEIGHT      (default 9:16)
 *   --mode   crop: fill the frame and crop (keep the subject at --focus)
 *            fit:  whole picture, centered on a blurred fill of itself (nothing lost)
 *   --focus  horizontal crop center 0..1 (0 = left edge, 0.5 = center)   (crop mode)
 *   --focusY vertical crop center 0..1                                   (crop mode)
 *
 * For videos made in THIS project, prefer a native re-render instead (no crop,
 * reframed cameras and responsive captions):
 *   npx remotion render <Id> out/x.mp4 --props='{"format":"short"}'
 */
import { execFileSync } from "node:child_process";

const a = process.argv.slice(2);
const [input, output] = a;
const opt = (k, d) => {
  const i = a.indexOf(`--${k}`);
  return i >= 0 ? a[i + 1] : d;
};
if (!input || !output) {
  console.error("usage: node scripts/reframe.mjs <in> <out> --to 9:16 [--mode crop|fit] [--focus 0.5] [--focusY 0.5]");
  process.exit(2);
}
const PRESETS = { "9:16": [1080, 1920], "16:9": [1920, 1080], "1:1": [1080, 1080], "4:5": [1080, 1350] };
const to = opt("to", "9:16");
const [W, H] = PRESETS[to] ?? to.split("x").map(Number);
if (!W || !H) throw new Error(`bad --to ${to}`);
const mode = opt("mode", "crop");
const fx = Number(opt("focus", 0.5));
const fy = Number(opt("focusY", 0.5));

const vf =
  mode === "fit"
    ? // Blurred cover background + contained foreground.
      `[0:v]split=2[bg][fg];` +
      `[bg]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},boxblur=30:3,eq=brightness=-0.06[b];` +
      `[fg]scale=${W}:${H}:force_original_aspect_ratio=decrease[f];` +
      `[b][f]overlay=(W-w)/2:(H-h)/2,setsar=1[v]`
    : // Cover + crop around the focus point.
      `[0:v]scale=${W}:${H}:force_original_aspect_ratio=increase,` +
      `crop=${W}:${H}:(in_w-${W})*${fx}:(in_h-${H})*${fy},setsar=1[v]`;

execFileSync(
  "ffmpeg",
  ["-v", "error", "-y", "-i", input, "-filter_complex", vf, "-map", "[v]", "-map", "0:a?", "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p", "-c:a", "copy", output],
  { stdio: "inherit" },
);
const dims = execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", output]).toString().trim();
console.log(`wrote ${output} (${dims.replace(",", "×")}, ${mode})`);
