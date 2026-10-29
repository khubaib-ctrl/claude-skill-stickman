import { LINE, PALETTE, ToonMesh } from "../../toon/toon";

const Cloud: React.FC<{ position: [number, number, number]; scale: number }> = ({ position, scale }) => (
  <group position={position} scale={[scale, scale * 0.75, scale * 0.4]}>
    {[
      [0, 0, 1],
      [1.1, -0.2, 0.8],
      [-1.1, -0.25, 0.75],
      [0.5, 0.45, 0.7],
      [-0.5, 0.35, 0.65],
    ].map(([x, y, r], i) => (
      <ToonMesh key={i} color={PALETTE.cloud} outline={LINE.background} position={[x, y, 0]}>
        <sphereGeometry args={[r, 24, 16]} />
      </ToonMesh>
    ))}
  </group>
);

export const Sky: React.FC = () => (
  <group>
    <Cloud position={[-9, 15, -40]} scale={3.2} />
    <Cloud position={[10, 18, -45]} scale={3.6} />
    <Cloud position={[1, 22, -50]} scale={2.6} />
  </group>
);
