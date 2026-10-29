import { useThree } from "@react-three/fiber";
import { loadFont } from "@remotion/google-fonts/LuckiestGuy";
import { ThreeCanvas } from "@remotion/three";
import { useLayoutEffect } from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { buyerLook, ceoLook, clerkLook, execLook, rivalLook } from "../../characters/toonfolk/business";
import { ToonPerson, type ToonLook, type ToonPose } from "../../characters/toonfolk/ToonPerson";
import { INK, LINE, PALETTE, ToonMesh } from "../../toon/toon";

const { fontFamily } = loadFont("normal", { weights: ["400"], subsets: ["latin"] });

const CAST: { id: string; look: ToonLook; pose: Partial<ToonPose> }[] = [
  { id: "CLERK", look: clerkLook, pose: { browR: 0.1 } },
  { id: "EXEC", look: execLook, pose: { browL: 0.5, headTilt: 0.05 } },
  { id: "CEO", look: ceoLook, pose: { browSlant: -0.3 } },
  { id: "BUYER", look: buyerLook, pose: { browR: 0.4, headTilt: -0.05 } },
  { id: "RIVAL", look: rivalLook, pose: { browL: 0.2, browR: 0.2 } },
];

const SPACING = 1.9;
const CAM_Z = 13;
const FOV = 30;

const CameraRig: React.FC = () => {
  const camera = useThree((s) => s.camera);
  useLayoutEffect(() => {
    camera.position.set(0, 1.9, CAM_Z);
    camera.lookAt(0, 1.6, 0);
    camera.updateProjectionMatrix();
  }, [camera]);
  return null;
};

/** Design still: the Nokia story's new cast. */
export const NokiaCast: React.FC = () => {
  const { width, height } = useVideoConfig();
  const halfW = CAM_Z * Math.tan(((FOV / 2) * Math.PI) / 180) * (width / height);
  return (
    <AbsoluteFill>
      <ThreeCanvas width={width} height={height} shadows="basic" flat gl={{ antialias: true }} camera={{ fov: FOV }}>
        <CameraRig />
        <color attach="background" args={[PALETTE.cream]} />
        <ambientLight intensity={1.1} />
        <hemisphereLight args={["#fbf8f2", "#8f8b82", 0.35]} />
        <directionalLight
          position={[-6, 10, 10]}
          intensity={2.3}
          color="#fffaf0"
          castShadow
          shadow-mapSize={[4096, 4096]}
          shadow-bias={-0.0006}
          shadow-normalBias={0.04}
          shadow-camera-left={-12}
          shadow-camera-right={12}
          shadow-camera-top={12}
          shadow-camera-bottom={-12}
        />
        <ToonMesh color={PALETTE.cream} outline={0} position={[0, 5, -1.6]}>
          <boxGeometry args={[40, 10, 0.2]} />
        </ToonMesh>
        <ToonMesh color={PALETTE.timber} outline={LINE.background} position={[0, 0.15, -1.45]}>
          <boxGeometry args={[40, 0.3, 0.1]} />
        </ToonMesh>
        <ToonMesh color="#a58a68" outline={0} position={[0, -0.05, 5]}>
          <boxGeometry args={[40, 0.1, 14]} />
        </ToonMesh>
        {CAST.map((c, i) => (
          <ToonPerson build="tall" key={c.id} look={c.look} pose={c.pose} position={[(i - 2) * SPACING, 0, 0]} />
        ))}
      </ThreeCanvas>
      {CAST.map((c, i) => (
        <div
          key={c.id}
          style={{
            position: "absolute",
            bottom: 60,
            left: width / 2 + (((i - 2) * SPACING) / halfW) * (width / 2),
            transform: "translateX(-50%) rotate(-3deg)",
            fontFamily,
            fontSize: 54,
            color: "white",
            WebkitTextStroke: `10px ${INK}`,
            paintOrder: "stroke fill",
          }}
        >
          {c.id}
        </div>
      ))}
    </AbsoluteFill>
  );
};
