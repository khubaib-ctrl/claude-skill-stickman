import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { useLayoutEffect } from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { buyerLook, ceoLook, execLook } from "../../characters/toonfolk/business";
import { ToonPerson } from "../../characters/toonfolk/ToonPerson";
import { PALETTE, ToonMesh } from "../../toon/toon";

const Cam: React.FC = () => {
  const camera = useThree((s) => s.camera);
  useLayoutEffect(() => {
    camera.position.set(0, 2.5, 5.2);
    camera.lookAt(0, 2.2, 0);
    camera.updateProjectionMatrix();
  }, [camera]);
  return null;
};

/** Close-up design still for reviewing faces, hands and clothing detail. */
export const CastCloseup: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill>
      <ThreeCanvas width={width} height={height} shadows="basic" flat gl={{ antialias: true }} camera={{ fov: 30 }}>
        <Cam />
        <color attach="background" args={[PALETTE.cream]} />
        <ambientLight intensity={1.1} />
        <hemisphereLight args={["#fbf8f2", "#8f8b82", 0.35]} />
        <directionalLight position={[-6, 10, 10]} intensity={2.3} color="#fffaf0" castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0006} shadow-normalBias={0.04} />
        <ToonMesh color={PALETTE.cream} outline={0} position={[0, 4, -2]}>
          <boxGeometry args={[30, 10, 0.2]} />
        </ToonMesh>
        <ToonPerson build="tall" look={execLook} position={[-1.7, 0, 0]} rotation={[0, 0.25, 0]} pose={{ right: { forward: 0.6, out: 0.15, elbow: 1.2 }, browL: 0.5 }} />
        <ToonPerson build="tall" look={ceoLook} position={[0, 0, 0]} pose={{ left: { forward: 0.5, out: 0.4, elbow: 0.6, twist: 1.2 }, browSlant: -0.3 }} />
        <ToonPerson build="tall" look={buyerLook} position={[1.7, 0, 0]} rotation={[0, -0.25, 0]} pose={{ browR: 0.4, blink: 0 }} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
