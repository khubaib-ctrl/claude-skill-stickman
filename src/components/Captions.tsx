import { type Caption, createTikTokStyleCaptions } from "@remotion/captions";
import { loadFont } from "@remotion/google-fonts/LuckiestGuy";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AbsoluteFill,
  Sequence,
  continueRender,
  delayRender,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { useLayout } from "../formats";
import { INK } from "../toon/toon";

const { fontFamily } = loadFont("normal", { weights: ["400"], subsets: ["latin"] });

// How many ms of words get grouped onto one caption page.
const COMBINE_MS = 1200;

export const Captions: React.FC<{ src: string }> = ({ src }) => {
  const [captions, setCaptions] = useState<Caption[] | null>(null);
  const [handle] = useState(() => delayRender("Loading captions"));
  const { fps } = useVideoConfig();

  const load = useCallback(async () => {
    const res = await fetch(src);
    setCaptions((await res.json()) as Caption[]);
    continueRender(handle);
  }, [src, handle]);

  useEffect(() => {
    load();
  }, [load]);

  const pages = useMemo(
    () =>
      captions
        ? createTikTokStyleCaptions({
            captions,
            combineTokensWithinMilliseconds: COMBINE_MS,
          }).pages
        : [],
    [captions],
  );

  return (
    <AbsoluteFill>
      {pages.map((page, i) => {
        const next = pages[i + 1];
        const from = Math.round((page.startMs / 1000) * fps);
        const endMs = next ? next.startMs : page.startMs + page.durationMs;
        const duration = Math.max(1, Math.round((endMs / 1000) * fps) - from);
        return (
          <Sequence key={i} from={from} durationInFrames={duration}>
            <CaptionPage page={page} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const CaptionPage: React.FC<{
  page: ReturnType<typeof createTikTokStyleCaptions>["pages"][number];
}> = ({ page }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = useLayout();
  // Absolute time in ms, since this component sits inside a Sequence.
  const nowMs = page.startMs + (frame / fps) * 1000;

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: L.portrait ? L.safe.bottom : 80 * L.s }}>
      <div
        style={{
          fontFamily,
          fontSize: 76 * L.s * (L.portrait ? 1.15 : 1),
          maxWidth: L.textWidth,
          color: "white",
          textAlign: "center",
          whiteSpace: "pre-wrap",
          WebkitTextStroke: `${12 * L.s}px ${INK}`,
          paintOrder: "stroke fill",
          textShadow: `0 ${7 * L.s}px 0 ${INK}`,
          letterSpacing: 2,
        }}
      >
        {page.tokens.map((t) => {
          const active = t.fromMs <= nowMs && nowMs < t.toMs;
          return (
            <span key={t.fromMs} style={{ color: active ? "#f6d36b" : "white" }}>
              {t.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
