import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { useLayoutEffect } from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { LINE, PALETTE, ToonMesh } from "../../toon/toon";
import { Building } from "./Building";
import { Crowd } from "./Crowd";
import { Sky } from "./Sky";
import { Speaker } from "./Speaker";
import { Stage } from "./Stage";

/** Low-angle camera with a slow push-in and gentle pan, driven by the frame. */
const CameraRig: React.FC = () => {
  const camera = useThree((s) => s.camera);
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = interpolate(frame, [0, durationInFrames - 1], [0, 1], {
    easing: Easing.inOut(Easing.sin),
  });
  useLayoutEffect(() => {
    camera.position.set(interpolate(t, [0, 1], [0.5, -0.3]), 1.3, interpolate(t, [0, 1], [12.5, 11.2]));
    camera.lookAt(interpolate(t, [0, 1], [0.25, 0]), 3.3, 0);
    camera.updateProjectionMatrix();
  }, [camera, t]);
  return null;
};

const Street: React.FC = () => (
  <group>
    <ToonMesh color={PALETTE.stone} outline={0} position={[0, -0.05, -10]}>
      <boxGeometry args={[60, 0.1, 60]} />
    </ToonMesh>
    {/* Curbs */}
    {[-1, 1].map((s) => (
      <ToonMesh key={s} color={PALETTE.stoneDark} outline={LINE.background} position={[s * 5.6, 0.08, -6]}>
        <boxGeometry args={[0.5, 0.18, 30]} />
      </ToonMesh>
    ))}
  </group>
);

export const TownSquareScene: React.FC<{ width: number; height: number }> = ({ width, height }) => (
  <ThreeCanvas
    width={width}
    height={height}
    shadows="basic"
    flat
    gl={{ antialias: true }}
    camera={{ fov: 36, near: 0.1, far: 200 }}
  >
    <CameraRig />
    <color attach="background" args={[PALETTE.sky]} />
    <ambientLight intensity={1.1} />
    <hemisphereLight args={["#fbf8f2", "#8f8b82", 0.35]} />
    <directionalLight
      position={[-8, 16, 10]}
      intensity={2.4}
      color="#fffaf0"
      castShadow
      shadow-mapSize={[4096, 4096]}
      shadow-bias={-0.0006}
      shadow-normalBias={0.08}
      shadow-camera-left={-22}
      shadow-camera-right={22}
      shadow-camera-top={22}
      shadow-camera-bottom={-22}
      shadow-camera-far={80}
    />

    <Sky />
    <Street />

    {/* Left side of the street, facades facing +x */}
    <Building w={5} h={7} floors={3} position={[-8.2, 0, 3]} rotation={[0, Math.PI / 2, 0]} awning={PALETTE.awning} />
    <Building w={6} h={8.5} floors={3} position={[-8.6, 0, -3]} rotation={[0, Math.PI / 2, 0]} balcony chimney wall={PALETTE.cream} />
    <Building w={5} h={7.5} floors={3} position={[-8.4, 0, -9]} rotation={[0, Math.PI / 2, 0]} roof={PALETTE.roofDark} />
    {/* Right side, facades facing -x */}
    <Building w={5.5} h={7.5} floors={3} position={[8.3, 0, 3]} rotation={[0, -Math.PI / 2, 0]} awning="#9a6b52" wall={PALETTE.cream} />
    <Building w={6} h={9} floors={3} position={[8.7, 0, -3.2]} rotation={[0, -Math.PI / 2, 0]} balcony chimney />
    <Building w={5} h={7} floors={3} position={[8.4, 0, -9]} rotation={[0, -Math.PI / 2, 0]} roof={PALETTE.roofDark} wall={PALETTE.cream} />
    {/* End of the street behind the stage */}
    <Building w={7} h={8} floors={3} position={[-4, 0, -15]} chimney wall={PALETTE.cream} />
    <Building w={6} h={9.5} floors={3} position={[4.2, 0, -16]} balcony roof={PALETTE.roofDark} />

    <Stage />
    <Speaker position={[0, 1, -0.2]} />
    <Crowd />
  </ThreeCanvas>
);
