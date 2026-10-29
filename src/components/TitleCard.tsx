import { loadFont } from "@remotion/google-fonts/LuckiestGuy";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useLayout } from "../formats";
import { INK, onTwos } from "../toon/toon";

const { fontFamily } = loadFont("normal", { weights: ["400"], subsets: ["latin"] });

/** Chunky white title with thick ink outline, tilted, popping in on twos. */
export const TitleCard: React.FC<{
  text: string;
  from?: number;
  top?: number;
  left?: number;
  rotate?: number;
}> = ({ text, from = 6, top = 150, left = 120, rotate = -7 }) => {
  const frame = onTwos(useCurrentFrame());
  const { fps } = useVideoConfig();
  const L = useLayout();
  const pop = spring({ frame: frame - from, fps, config: { stiffness: 260, damping: 11 } });
  if (frame < from) return null;
  // `top`/`left` are 1920×1080 reference positions; vertical formats center the title in the top safe band.
  const size = L.fit(130 * L.s * (L.portrait ? 1.1 : 1), text.length, L.textWidth * 0.95);
  const pos = L.portrait
    ? { top: L.safe.top + 20 * L.s, left: L.w / 2, origin: "center center", shift: "translateX(-50%) " }
    : { top: (top / 1080) * L.h, left: (left / 1920) * L.w, origin: "left center", shift: "" };
  return (
    <div
      style={{
        position: "absolute",
        top: pos.top,
        left: pos.left,
        transform: `${pos.shift}rotate(${rotate}deg) scale(${pop})`,
        transformOrigin: pos.origin,
        fontFamily,
        fontSize: size,
        lineHeight: 1,
        color: "white",
        WebkitTextStroke: `${16 * (size / 130)}px ${INK}`,
        paintOrder: "stroke fill",
        textShadow: `0 ${10 * (size / 130)}px 0 ${INK}, 0 ${12 * (size / 130)}px 0 ${INK}`,
        letterSpacing: 4,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
};
