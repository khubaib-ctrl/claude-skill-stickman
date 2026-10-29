#!/usr/bin/env node
/**
 * Remove dead air from already-generated voice lines: trims leading/trailing
 * silence from public/audio/voice/<name>.wav and shifts public/captions/<name>.json
 * by the same amount (no re-synthesis, so verified wording is kept).
 *
 *   node scripts/tighten-voice.mjs <name> [<name> …]
 *   node scripts/tighten-voice.mjs nokia2-01 nokia2-02 …
 *
 * New lines from scripts/voiceover.mjs are already trimmed; this is for old ones.
 */
import { trimVoice } from "./voice-trim.mjs";

const names = process.argv.slice(2);
if (!names.length) {
  console.error("usage: node scripts/tighten-voice.mjs <name> [<name> …]");
  process.exit(2);
}
for (const n of names) {
  const r = trimVoice(n);
  console.log(`${n}: ${r.before.toFixed(2)}s → ${r.after.toFixed(2)}s (cut ${r.lead.toFixed(2)}s lead, ${r.tail.toFixed(2)}s tail)`);
}
