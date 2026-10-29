import { useThree } from "@react-three/fiber";
import { loadFont } from "@remotion/google-fonts/PatrickHand";
import { ThreeCanvas } from "@remotion/three";
import { useLayoutEffect } from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { INK } from "../../toon/toon";
import { Kernel, type KernelLook, type KernelPose } from "./Kernel";
import { businessmanLook, crowdLook, engineerLook, founderLook, investorLook } from "./looks";

const { fontFamily } = loadFont("normal", { weights: ["400"], subsets: ["latin"] });

/** Plain warm-gray sheet background, like a character model sheet. */
const SHEET_BG = "#e4ddd8";

const Camera: React.FC<{ position: [number, number, number]; target: [number, number, number] }> = ({
  position,
  target,
}) => {
  const camera = useThree((s) => s.camera);
  useLayoutEffect(() => {
    camera.position.set(...position);
    camera.lookAt(...target);
    camera.updateProjectionMatrix();
  }, [camera, position, target]);
  return null;
};

const Lights: React.FC = () => (
  <>
    <ambientLight intensity={1.15} />
    <hemisphereLight args={["#fbf8f2", "#8f8b82", 0.35]} />
    <directionalLight position={[-3, 9, 9]} intensity={2.1} color="#fffaf0" />
  </>
);

export const LINEUP: { name: string; look: KernelLook; pose: Partial<KernelPose> }[] = [
  { name: "Founder", look: founderLook, pose: { browR: 0.1, browL: 0.1 } },
  {
    name: "Engineer",
    look: engineerLook,
    pose: {
      right: { forward: 0.75, out: 0.05, elbow: 1.05, inward: 0.75, wrist: 0.2 },
      left: { forward: 0.25, out: 0.12, elbow: 1.35, inward: 0.15, wrist: -0.2 },
    },
  },
  { name: "Investor", look: investorLook, pose: {} },
  { name: "Businessman", look: businessmanLook, pose: { browSlant: -0.5, browL: -0.2, browR: -0.2 } },
  { name: "Crowd", look: crowdLook(), pose: { lids: true, browR: 0.6, browSlant: -0.2 } },
];

const SPACING = 2.15;
const CAM_Z = 14;
const FOV = 25;

export const KernelLineup: React.FC = () => {
  const { width, height } = useVideoConfig();
  const halfW = CAM_Z * Math.tan(((FOV / 2) * Math.PI) / 180) * (width / height);
  return (
    <AbsoluteFill style={{ backgroundColor: SHEET_BG }}>
      <ThreeCanvas width={width} height={height} flat gl={{ antialias: true }} camera={{ fov: FOV }}>
        <Camera position={[0, 2.25, CAM_Z]} target={[0, 2.05, 0]} />
        <color attach="background" args={[SHEET_BG]} />
        <Lights />
        {LINEUP.map((c, i) => (
          <Kernel key={c.name} look={c.look} pose={c.pose} position={[(i - 2) * SPACING, 0, 0]} />
        ))}
      </ThreeCanvas>
      {LINEUP.map((c, i) => (
        <div
          key={c.name}
          style={{
            position: "absolute",
            bottom: 40,
            left: width / 2 + (((i - 2) * SPACING) / halfW) * (width / 2),
            transform: "translateX(-50%)",
            fontFamily,
            fontSize: 72,
            color: INK,
          }}
        >
          {c.name}
        </div>
      ))}
    </AbsoluteFill>
  );
};

export const SPEAKER_POSE: Partial<KernelPose> = {
  left: { forward: 0.45, out: 1.0, elbow: 0.35, twist: 1.5, wrist: -0.3 },
  right: { forward: 0.7, out: 0.1, elbow: 0.85, inward: 0.2 },
  lean: 0.07,
  browL: 0.8,
  browR: 0.5,
  mouth: 0.55,
  headTilt: -0.06,
  headTurn: 0.12,
};

export const KernelSpeaker: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: SHEET_BG }}>
      <ThreeCanvas width={width} height={height} flat gl={{ antialias: true }} camera={{ fov: 28 }}>
        <Camera position={[2.45, 1.95, 7.8]} target={[0.3, 1.95, 0]} />
        <color attach="background" args={[SHEET_BG]} />
        <Lights />
        <Kernel look={founderLook} pose={SPEAKER_POSE} rotation={[0, 0.25, 0]} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
