import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { useLayoutEffect } from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { LINE, PALETTE, ToonMesh } from "../../toon/toon";
import { founderLook } from "./founder";
import { ToonPerson, type ToonPose } from "./ToonPerson";

/** Keynote gesture: one arm sweeps out palm-open, the other rests forward on the lectern. */
export const KEYNOTE_POSE: Partial<ToonPose> = {
  left: { forward: 0.45, out: 1.05, elbow: 0.3, twist: 1.5, wrist: -0.25 },
  right: { forward: 0.75, out: 0.08, elbow: 0.65, inward: 0.25 },
  lean: 0.07,
  browL: 0.8,
  browR: 0.45,
  mouth: 0.6,
  headTilt: -0.07,
};

const CameraRig: React.FC = () => {
  const camera = useThree((s) => s.camera);
  useLayoutEffect(() => {
    camera.position.set(0.4, 1.9, 9.5);
    camera.lookAt(0, 1.7, 0);
    camera.updateProjectionMatrix();
  }, [camera]);
  return null;
};

/** Design still: founder neutral (left) and in the keynote gesture (right). */
export const FounderStill: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill>
      <ThreeCanvas width={width} height={height} shadows="basic" flat gl={{ antialias: true }} camera={{ fov: 30 }}>
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
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
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
        <ToonPerson build="tall" look={founderLook} position={[-1.7, 0, 0]} rotation={[0, 0.45, 0]} pose={{ browR: 0.15, browL: -0.1 }} />
        <ToonPerson build="tall" look={founderLook} position={[1.5, 0, 0]} rotation={[0, -0.2, 0]} pose={KEYNOTE_POSE} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
