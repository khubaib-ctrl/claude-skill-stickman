import { loadFont } from "@remotion/google-fonts/LuckiestGuy";
import { AbsoluteFill } from "remotion";
import { ToonPerson } from "../../characters/toonfolk/ToonPerson";
import { useLayout } from "../../formats";
import { INK } from "../../toon/toon";
import { business } from "./cast";
import { CandybarPhone, SceneCanvas, SlabPhone } from "./kit";

const { fontFamily } = loadFont("normal", { weights: ["400"], subsets: ["latin"] });

const Text: React.FC<{ children: React.ReactNode; size: number; color?: string; rotate?: number; style?: React.CSSProperties }> = ({
  children,
  size,
  color = "white",
  rotate = -4,
  style,
}) => (
  <div
    style={{
      fontFamily,
      fontSize: size,
      lineHeight: 0.95,
      color,
      WebkitTextStroke: `${Math.round(size / 7)}px ${INK}`,
      paintOrder: "stroke fill",
      textShadow: `0 ${Math.round(size / 11)}px 0 ${INK}`,
      transform: `rotate(${rotate}deg)`,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);

/** Thumbnail: dismayed EXEC with his old phone, a giant touchscreen looming behind, "FROM #1 TO SOLD". */
export const NokiaThumbnail: React.FC = () => {
  const L = useLayout();
  const { exec } = business;
  return (
    <AbsoluteFill style={{ backgroundColor: "#2f3b45" }}>
      <SceneCanvas
        mood="stage"
        bg="#34505c"
        cam={{
          // Aim at a point right of EXEC's head so he fills the left third.
          from: [0.85, 2.25, 4.3],
          lookFrom: [0.7, 1.85, 0.6],
          fov: 34,
          portrait: { from: [0.15, 2.45, 4.6], lookFrom: [0.15, 2.0, 0] },
        }}
      >
        <pointLight position={[0.8, 3.2, -0.6]} intensity={20} distance={6} color="#bff3f0" />
        {/* The touchscreen that ended an era, looming behind (no logo) */}
        <group position={[L.portrait ? 0.15 : 1.9, 2.7, -1.8]} rotation={[0, -0.25, 0.08]}>
          <SlabPhone scale={9} />
          <mesh position={[0, 0, -0.1]}>
            <planeGeometry args={[4.6, 6.6]} />
            <meshBasicMaterial color="#bff3f0" transparent opacity={0.18} depthWrite={false} toneMapped={false} />
          </mesh>
        </group>
        <ToonPerson
          name="EXEC"
          look={exec}
          position={[L.portrait ? 0.15 : -0.45, 0, 0.6]}
          rotation={[0, 0.25, 0]}
          pose={{
            right: { forward: 1.05, out: 0.12, elbow: 1.35, inward: 0.45 },
            headNod: 0.16,
            headTilt: 0.08,
            browSlant: 0.85,
            browL: 0.4,
            browR: 0.4,
            mouth: 0.25,
          }}
          rightHand={<CandybarPhone position={[0, -0.2, 0.06]} rotation={[0, 0, Math.PI]} scale={0.9} lit />}
        />
      </SceneCanvas>
      {/* Falling red arrow */}
      <svg
        viewBox="0 0 100 100"
        style={{ position: "absolute", left: L.portrait ? L.w * 0.62 : L.w * 0.47, top: L.portrait ? L.h * 0.38 : L.h * 0.1, width: L.s * 300, height: L.s * 300 }}
      >
        <path d="M10 12 L55 52 L64 40 L88 86 L40 74 L52 64 L6 22 Z" fill="#d9452f" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
      </svg>
      {/* Title */}
      <div
        style={{
          position: "absolute",
          ...(L.portrait
            ? { left: 0, right: 0, top: L.safe.top, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 * L.s }
            : { right: L.w * 0.04, top: L.h * 0.33, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 * L.s }),
        }}
      >
        <Text size={(L.portrait ? 190 : 150) * L.s} color="#ffd84a">
          FROM #1
        </Text>
        <Text size={(L.portrait ? 210 : 170) * L.s} rotate={-5}>
          TO SOLD
        </Text>
      </div>
      <div
        style={{
          position: "absolute",
          ...(L.portrait
            ? { left: 0, right: 0, bottom: L.safe.bottom * 0.55, display: "flex", justifyContent: "center" }
            : { left: L.w * 0.03, top: L.h * 0.05 }),
        }}
      >
        <Text size={(L.portrait ? 92 : 62) * L.s} rotate={-3}>
          NOKIA, 2007–2013
        </Text>
      </div>
    </AbsoluteFill>
  );
};
