import { ThreeCanvas } from "@remotion/three";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Example Three.js scene. All motion is derived from useCurrentFrame() —
 * never use useFrame() / requestAnimationFrame / clocks, or renders won't be
 * deterministic.
 */
export const SpinningCubeScene: React.FC<{ width: number; height: number }> = ({
  width,
  height,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({ frame, fps, config: { damping: 12 } });
  const rotation = interpolate(frame, [0, 180], [0, Math.PI * 2]);

  return (
    <ThreeCanvas
      width={width}
      height={height}
      camera={{ fov: 50, position: [0, 0, 6] }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <pointLight position={[-5, -3, 2]} intensity={30} color="#6a5cff" />
      <mesh rotation={[rotation * 0.6, rotation, 0]} scale={entrance * 1.6}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ff7a45" metalness={0.3} roughness={0.35} />
      </mesh>
    </ThreeCanvas>
  );
};
