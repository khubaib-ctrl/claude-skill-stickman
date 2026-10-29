import type { CalculateMetadataFunction } from "remotion";
import { useVideoConfig } from "remotion";

/**
 * Output formats. Every composition takes a `format` prop and sizes itself from
 * it, so any video can be re-rendered in any aspect ratio:
 *
 *   npx remotion render NokiaV2 out/x.mp4 --props='{"format":"short"}'
 */
export const FORMATS = {
  /** YouTube long-form, horizontal. */
  long: { width: 1920, height: 1080, ratio: "16:9" },
  /** YouTube Shorts / Reels / TikTok, vertical. */
  short: { width: 1080, height: 1920, ratio: "9:16" },
  /** Feed square. */
  square: { width: 1080, height: 1080, ratio: "1:1" },
  /** Instagram feed portrait. */
  portrait: { width: 1080, height: 1350, ratio: "4:5" },
} as const;

export type FormatId = keyof typeof FORMATS;
export type FormatProps = { format?: FormatId };

/** Use as a composition's `calculateMetadata` so `format` sets width/height. */
export const formatMetadata: CalculateMetadataFunction<FormatProps> = ({ props }) => {
  const f = FORMATS[props.format ?? "long"] ?? FORMATS.long;
  return { width: f.width, height: f.height };
};

/**
 * Responsive layout for 2D overlays. Design overlays against a 1920×1080
 * reference; `layout` maps them to the current frame and gives the platform
 * safe zones (vertical apps cover the top ~10% and bottom ~20% with UI).
 */
export const useLayout = () => {
  const { width: w, height: h } = useVideoConfig();
  const portrait = h > w * 1.05;
  /** Scale for text and UI: 1 at 1080 on the short side. */
  const s = Math.min(w, h) / 1080;
  const safe = portrait
    ? { top: h * 0.11, bottom: h * 0.2, side: w * 0.06 }
    : { top: h * 0.06, bottom: h * 0.07, side: w * 0.04 };
  return {
    w,
    h,
    portrait,
    s,
    safe,
    /** Max text width inside the side safe margins. */
    textWidth: w - 2 * safe.side,
    /**
     * Map a 1920×1080 reference point. Portrait packs it into the band BELOW the
     * title (titles own the top ~13%), horizontally centered.
     */
    ref: (x: number, y: number) =>
      portrait
        ? { x: w / 2 + (x - 960) * (w / 1920) * 1.2, y: safe.top + h * 0.13 + (y / 1080) * (h * 0.36) }
        : { x: (x / 1920) * w, y: (y / 1080) * h },
    /** Shrink a font size so `chars` characters fit in `maxWidth` (heavy display fonts ≈ 0.62 em per glyph). */
    fit: (size: number, chars: number, maxWidth: number, em = 0.62) => Math.min(size, maxWidth / Math.max(1, chars * em)),
  };
};

/**
 * Aspect-aware camera FOV. Scenes are framed for 16:9; on narrower frames keep
 * `keep` of the original horizontal view (the subject stays in frame) and let
 * the frame show more above and below.
 */
export const fitFov = (fov: number, aspect: number, keep = 0.62, refAspect = 16 / 9) => {
  if (aspect >= refAspect * 0.98) return fov;
  const rad = (d: number) => (d * Math.PI) / 180;
  const hRef = 2 * Math.atan(Math.tan(rad(fov) / 2) * refAspect);
  const hTarget = Math.max(hRef * keep, 2 * Math.atan(Math.tan(rad(fov) / 2) * aspect));
  return (2 * Math.atan(Math.tan(hTarget / 2) / aspect) * 180) / Math.PI;
};
