import { useMemo } from "react";
import * as THREE from "three";
import { InkMesh, LINE, PALETTE, ToonMesh } from "../../toon/toon";

/** Thin box cloth hung between two poles, sagging at the top with vertical folds. */
const useBackdropGeometry = (w: number, h: number) =>
  useMemo(() => {
    const g = new THREE.BoxGeometry(w, h, 0.06, 48, 24, 1);
    const pos = g.attributes.position;
    const hw = w / 2;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const t = (y + h / 2) / h; // 0 bottom, 1 top
      const sag = 1.4 * (1 - (x / hw) ** 2) * t;
      pos.setY(i, y - sag);
      pos.setZ(i, pos.getZ(i) + Math.sin(x * 2.4) * 0.12 * (0.4 + t) - (1 - (x / hw) ** 2) * 0.4 * t);
    }
    g.computeVertexNormals();
    return g;
  }, [w, h]);

export const Stage: React.FC = () => {
  const cloth = useBackdropGeometry(6.6, 5.2);
  return (
    <group>
      {/* Platform with planks */}
      <ToonMesh color={PALETTE.timberLight} outline={LINE.prop} position={[0, 0.5, -0.4]}>
        <boxGeometry args={[7.4, 1, 3.4]} />
      </ToonMesh>
      {[-2.4, -0.8, 0.8, 2.4].map((x) => (
        <InkMesh key={x} position={[x, 0.5, 1.31]}>
          <boxGeometry args={[0.04, 1, 0.01]} />
        </InkMesh>
      ))}

      {/* Poles + backdrop */}
      {[-1, 1].map((s) => (
        <ToonMesh key={s} color={PALETTE.timber} outline={LINE.prop} position={[s * 3.3, 3.8, -1.7]}>
          <cylinderGeometry args={[0.09, 0.11, 5.8, 12]} />
        </ToonMesh>
      ))}
      <ToonMesh color={PALETTE.cloth} outline={LINE.prop} geometry={cloth} position={[0, 4.0, -1.8]} />

      {/* Podium */}
      <group position={[0, 1, 0.55]}>
        <ToonMesh color="#6b4a35" outline={LINE.prop} position={[0, 0.68, 0]}>
          <boxGeometry args={[1.5, 1.36, 0.8]} />
        </ToonMesh>
        <ToonMesh color="#5c3f2d" outline={LINE.prop} position={[0, 0.66, 0.42]}>
          <boxGeometry args={[1.0, 0.85, 0.05]} />
        </ToonMesh>
        <ToonMesh color="#7a5741" outline={LINE.prop} position={[0, 1.42, 0.05]} rotation={[0.15, 0, 0]}>
          <boxGeometry args={[1.8, 0.12, 1.0]} />
        </ToonMesh>
      </group>
    </group>
  );
};
