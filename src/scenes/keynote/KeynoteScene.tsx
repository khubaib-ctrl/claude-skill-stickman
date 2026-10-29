import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { useLayoutEffect } from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { audienceLook, type HairStyle } from "../../characters/toonfolk/crowd";
import { founderLook } from "../../characters/toonfolk/founder";
import { ToonPerson } from "../../characters/toonfolk/ToonPerson";
import { InkMesh, LINE, onTwos, ToonMesh } from "../../toon/toon";
import { HALL, Hall, Seat } from "./Hall";
import voiceWords from "../../../public/captions/big-launch.json";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Low angle from behind the audience, slow push-in toward the speaker. */
const CameraRig: React.FC = () => {
  const camera = useThree((s) => s.camera);
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = interpolate(frame, [0, durationInFrames - 1], [0, 1], { easing: Easing.inOut(Easing.sin) });
  useLayoutEffect(() => {
    camera.position.set(lerp(0.35, 0, t), 1.7, lerp(15.2, 13.4, t));
    camera.lookAt(lerp(0.15, 0, t), 2.95, 0);
    camera.updateProjectionMatrix();
  }, [camera, t]);
  return null;
};

const Lectern: React.FC = () => (
  <group position={[-0.32, 0.6, 0.6]}>
    <ToonMesh color={HALL.steel} outline={LINE.prop} position={[0, 0.03, 0]}>
      <boxGeometry args={[0.7, 0.06, 0.5]} />
    </ToonMesh>
    <ToonMesh color={HALL.lectern} outline={LINE.prop} position={[0, 0.6, 0]}>
      <boxGeometry args={[0.36, 1.1, 0.3]} />
    </ToonMesh>
    <ToonMesh color={HALL.lectern} outline={LINE.prop} position={[0, 1.2, -0.02]} rotation={[0.25, 0, 0]}>
      <boxGeometry args={[0.8, 0.07, 0.52]} />
    </ToonMesh>
    {/* Small product mark */}
    <InkMesh color="#2EC4B6" position={[0, 0.85, 0.155]}>
      <boxGeometry args={[0.14, 0.03, 0.01]} />
    </InkMesh>
  </group>
);

/** Founder: one arm sweeps out palm-open, the other rests on the lectern. */
const Founder: React.FC = () => {
  const real = useCurrentFrame();
  const f = onTwos(real);
  const { fps } = useVideoConfig();
  const snap = (at: number, stiffness = 300, damping = 15) =>
    spring({ frame: f - at, fps, config: { stiffness, damping } });

  const sweep = snap(16) - 0.3 * snap(94, 220, 18);
  const raise = snap(20) - snap(84);
  const nod = 0.09 * (snap(30, 420, 18) - snap(36, 420, 18)) + 0.09 * (snap(66, 420, 18) - snap(72, 420, 18));
  const ms = (real / fps) * 1000;
  const talking = voiceWords.some((w) => ms >= w.startMs && ms < w.endMs);

  return (
    <ToonPerson build="tall"
      look={founderLook}
      position={[0, 0.6, -0.15]}
      pose={{
        left: {
          forward: lerp(0.1, 0.45, sweep),
          out: lerp(0.14, 1.05, sweep),
          elbow: lerp(0.4, 0.3, sweep),
          twist: lerp(0.2, 1.5, sweep),
          wrist: lerp(0, -0.25, sweep),
        },
        right: { forward: 0.75, out: 0.08, elbow: 0.65, inward: 0.2 },
        lean: 0.02 + 0.07 * snap(14, 200, 18),
        shoulderShift: 0.045 * (snap(56) - snap(100)),
        headNod: nod,
        headTilt: -0.05 * snap(18) + 0.07 * (snap(58) - snap(98)),
        browL: 0.1 + 0.75 * raise,
        browR: 0.05 + 0.45 * raise,
        blink: real >= 54 && real < 58 ? 1 : 0,
        mouth: talking && Math.floor(real / 4) % 2 === 0 ? 0.65 : 0,
      }}
    />
  );
};

// [x, z, scale, jacket, hair, hairColor, reaction]
export type Member = [number, number, number, string, HairStyle, string, "turn" | "shift" | null];
export const AUDIENCE: Member[] = [
  [-3.4, 7.9, 1.05, "#6b7451", "short", "#3d2c22", null],
  [-1.75, 8.1, 1.0, "#8a6a4a", "long", "#5a4232", "turn"],
  [1.7, 8.0, 1.08, "#55606a", "bald", "", null],
  [3.5, 7.8, 0.98, "#7a5048", "curly", "#2f2520", null],
  [5.2, 8.2, 1.02, "#4b5059", "beanie", "#7c8656", null],
  [-5.1, 8.2, 1.0, "#8b8173", "bun", "#6a4e39", null],
  [-4.3, 6.3, 0.95, "#5f7b93", "short", "#6a4e39", null],
  [-2.5, 6.4, 0.9, "#a08458", "curly", "#4a372b", null],
  [2.4, 6.3, 0.95, "#6e6656", "short", "#2f2520", "shift"],
  [4.2, 6.4, 0.92, "#704a40", "long", "#3d2c22", null],
];

export const AudienceMember: React.FC<{ m: Member }> = ({ m }) => {
  const [x, z, scale, jacket, hair, hairColor, reaction] = m;
  const f = onTwos(useCurrentFrame());
  const { fps } = useVideoConfig();
  const snap = (at: number) => spring({ frame: f - at, fps, config: { stiffness: 280, damping: 15 } });
  const turn = reaction === "turn" ? 0.45 * (snap(38) - snap(96)) : 0;
  const shift = reaction === "shift" ? snap(70) : 0;
  return (
    <group position={[x, 0, z]}>
      <Seat position={[0, 0, 0.05]} />
      <ToonPerson build="tall"
        look={audienceLook(jacket, hair, hairColor)}
        position={[0, -0.42, 0]}
        rotation={[0, Math.PI, 0]}
        scale={scale}
        pose={{
          right: { forward: 0.35, out: 0.08, elbow: 0.6 },
          left: { forward: 0.35, out: 0.08, elbow: 0.6 },
          headTurn: turn,
          headTilt: shift * 0.12,
          shoulderShift: shift * -0.06,
          lean: -0.06 + shift * 0.03,
        }}
      />
    </group>
  );
};

export const KeynoteScene: React.FC<{ width: number; height: number }> = ({ width, height }) => (
  <ThreeCanvas width={width} height={height} shadows="basic" flat gl={{ antialias: true }} camera={{ fov: 31, near: 0.1, far: 100 }}>
    <CameraRig />
    <color attach="background" args={["#2f2a27"]} />
    {/* Dim hall, warm stage key light, soft teal spill from the screen */}
    <ambientLight intensity={0.75} />
    <hemisphereLight args={["#fbf2e2", "#3a3330", 0.3]} />
    <directionalLight
      position={[-4, 10, 9]}
      intensity={2.3}
      color="#fff3df"
      castShadow
      shadow-mapSize={[4096, 4096]}
      shadow-bias={-0.0006}
      shadow-normalBias={0.08}
      shadow-camera-left={-14}
      shadow-camera-right={14}
      shadow-camera-top={14}
      shadow-camera-bottom={-14}
      shadow-camera-far={60}
    />
    <pointLight position={[0, 4.5, -1.2]} intensity={6} distance={9} color="#cdeee8" />
    <Hall />
    <Lectern />
    <Founder />
    {AUDIENCE.map((m, i) => (
      <AudienceMember key={i} m={m} />
    ))}
  </ThreeCanvas>
);
