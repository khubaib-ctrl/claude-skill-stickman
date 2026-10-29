#!/usr/bin/env node
/**
 * Contact QA: renders a composition headless with inputProps { qa: true } and
 * reports every frame where a hand is inside a <Solid> prop, or where an
 * <ExpectContact> pair (handshake, grab) doesn't actually touch.
 *
 *   node scripts/qa-contacts.mjs <CompositionId> [--every 2] [--scale 0.25]
 *
 * Exit code 1 if any violation is found. Run before every final render.
 */
import { bundle } from "@remotion/bundler";
import { renderFrames, selectComposition } from "@remotion/renderer";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const id = args[0];
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? Number(args[i + 1]) : def;
};
const every = opt("every", 2);
const scale = opt("scale", 0.25);
if (!id) {
  console.error("usage: node scripts/qa-contacts.mjs <CompositionId> [--every 2] [--scale 0.25]");
  process.exit(2);
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const inputProps = { qa: true };
console.log(`bundling…`);
const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts") });
const composition = await selectComposition({ serveUrl, id, inputProps });
const outputDir = mkdtempSync(path.join(os.tmpdir(), "qa-"));

const hits = [];
await renderFrames({
  serveUrl,
  composition,
  inputProps,
  outputDir,
  imageFormat: "jpeg",
  jpegQuality: 30,
  scale,
  everyNthFrame: every,
  concurrency: 1,
  chromiumOptions: { gl: "angle" },
  onStart: () => console.log(`checking ${composition.durationInFrames} frames (every ${every})…`),
  onFrameUpdate: () => {},
  onBrowserLog: (log) => {
    if (log.text.includes("[QA]")) hits.push(log.text);
  },
});
rmSync(outputDir, { recursive: true, force: true });

// Group "scene fN kind: detail" lines into frame ranges per (scene, kind, detail).
const groups = new Map();
for (const h of hits) {
  const m = h.match(/\[QA\] (\S+) f(\d+) ([\w-]+): (.*)$/);
  if (!m) continue;
  const [, scene, f, kind, detailRaw] = m;
  const detail = detailRaw.replace(/ are [\d.]+ apart/, " apart");
  const key = `${scene} | ${kind} | ${detail}`;
  const g = groups.get(key) ?? [];
  g.push(Number(f));
  groups.set(key, g);
}
if (!groups.size) {
  console.log("✓ contact QA passed: no hands in solids, all expected contacts touch.");
  process.exit(0);
}
console.log(`✗ contact QA found ${groups.size} problem(s) (scene-local frames):`);
for (const [key, frames] of groups) {
  frames.sort((a, b) => a - b);
  console.log(`  ${key}   frames ${frames[0]}–${frames[frames.length - 1]} (${frames.length} checked)`);
}
process.exit(1);
