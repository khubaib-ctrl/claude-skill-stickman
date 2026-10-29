import { useMemo } from "react";
import * as THREE from "three";
import { InkMesh, LINE, PALETTE, ToonMesh } from "../../toon/toon";

const L = LINE.background;

export const HALL = {
  wood: "#6b5242",
  woodDark: "#58423a",
  slat: "#7d604c",
  curtain: "#74403a",
  carpet: "#4f4843",
  stage: "#7a5a43",
  stageFront: "#5f4535",
  seat: "#56616b",
  seatDark: "#48525b",
  screen: "#dcf3ee",
  steel: "#3a3836",
  lectern: "#c9b08a",
  sconce: "#ffe2a8",
} as const;

/** Stage curtain: a segmented thin box with vertical folds. */
const Curtain: React.FC<{ position: [number, number, number]; w: number; h: number }> = ({ position, w, h }) => {
  const geo = useMemo(() => {
    const g = new THREE.BoxGeometry(w, h, 0.08, 40, 4, 1);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      pos.setZ(i, pos.getZ(i) + Math.sin(x * 5.5) * 0.14 * (0.7 + 0.3 * (y / h)));
    }
    g.computeVertexNormals();
    return g;
  }, [w, h]);
  return <ToonMesh color={HALL.curtain} outline={LINE.prop} geometry={geo} position={position} />;
};

/** Theater seat facing the stage (-z), back toward the camera. */
export const Seat: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    <ToonMesh color={HALL.seatDark} outline={L} position={[0, 0.48, 0]}>
      <boxGeometry args={[0.82, 0.14, 0.7]} />
    </ToonMesh>
    <ToonMesh color={HALL.seat} outline={L} position={[0, 0.82, 0.36]} rotation={[0.08, 0, 0]}>
      <boxGeometry args={[0.82, 0.72, 0.14]} />
    </ToonMesh>
    {[-1, 1].map((s) => (
      <ToonMesh key={s} color={HALL.steel} outline={L} position={[s * 0.44, 0.4, 0.05]}>
        <boxGeometry args={[0.07, 0.8, 0.6]} />
      </ToonMesh>
    ))}
  </group>
);

const StageLight: React.FC<{ x: number }> = ({ x }) => (
  <group position={[x, 6.6, 2.2]}>
    <ToonMesh color={HALL.steel} outline={L} rotation={[0.6, 0, 0]}>
      <cylinderGeometry args={[0.22, 0.28, 0.55, 16]} />
    </ToonMesh>
    <InkMesh color="#fff1cf" position={[0, -0.2, -0.17]} rotation={[0.6, 0, 0]}>
      <cylinderGeometry args={[0.2, 0.2, 0.02, 16]} />
    </InkMesh>
  </group>
);

/** Soft, faint beam from a stage light down to the stage. */
const Beam: React.FC<{ x: number }> = ({ x }) => (
  <mesh position={[x * 0.85, 3.6, 1.2]} rotation={[0.32, 0, 0]}>
    <coneGeometry args={[1.1, 6, 24, 1, true]} />
    <meshBasicMaterial color="#fff2d6" transparent opacity={0.04} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
  </mesh>
);

export const Hall: React.FC = () => (
  <group>
    {/* Floor + ceiling */}
    <ToonMesh color={HALL.carpet} outline={0} position={[0, -0.05, 4]}>
      <boxGeometry args={[30, 0.1, 30]} />
    </ToonMesh>
    <ToonMesh color="#2f2a27" outline={0} position={[0, 9, 4]}>
      <boxGeometry args={[30, 0.1, 30]} />
    </ToonMesh>

    {/* Back panel wall with vertical slats */}
    <ToonMesh color={HALL.wood} outline={0} position={[0, 4.5, -2.8]}>
      <boxGeometry args={[18, 9, 0.2]} />
    </ToonMesh>
    {Array.from({ length: 29 }, (_, i) => (
      <ToonMesh key={i} color={i % 2 ? HALL.slat : HALL.woodDark} outline={L} position={[-7 + i * 0.5, 4.5, -2.65]}>
        <boxGeometry args={[0.18, 9, 0.12]} />
      </ToonMesh>
    ))}

    {/* Side walls with warm sconces */}
    {[-1, 1].map((s) => (
      <group key={s}>
        <ToonMesh color={HALL.woodDark} outline={0} position={[s * 8, 4.5, 4]} rotation={[0, s * -0.15, 0]}>
          <boxGeometry args={[0.2, 9, 16]} />
        </ToonMesh>
        {[0.5, 4.5].map((z) => (
          <group key={z} position={[s * 7.75, 3.4, z]}>
            <ToonMesh color={HALL.steel} outline={L}>
              <boxGeometry args={[0.15, 0.5, 0.3]} />
            </ToonMesh>
            <InkMesh color={HALL.sconce} position={[-s * 0.12, 0.2, 0]}>
              <sphereGeometry args={[0.16, 12, 10]} />
            </InkMesh>
            <mesh position={[-s * 0.15, 0.2, 0]}>
              <sphereGeometry args={[0.45, 16, 12]} />
              <meshBasicMaterial color={HALL.sconce} transparent opacity={0.12} depthWrite={false} toneMapped={false} />
            </mesh>
          </group>
        ))}
      </group>
    ))}

    {/* Curtains framing the stage */}
    <Curtain position={[-6.1, 4.3, -2.2]} w={3} h={8.6} />
    <Curtain position={[6.1, 4.3, -2.2]} w={3} h={8.6} />
    <ToonMesh color={HALL.curtain} outline={LINE.prop} position={[0, 8.4, -2.0]}>
      <boxGeometry args={[15, 1, 0.3]} />
    </ToonMesh>

    {/* Presentation screen glowing soft teal-white */}
    <group position={[0, 4.7, -2.4]}>
      <ToonMesh color={HALL.steel} outline={LINE.prop}>
        <boxGeometry args={[8.0, 4.4, 0.14]} />
      </ToonMesh>
      <InkMesh color={HALL.screen} position={[0, 0, 0.08]}>
        <boxGeometry args={[7.7, 4.1, 0.02]} />
      </InkMesh>
      <mesh position={[0, 0, 0.1]}>
        <boxGeometry args={[8.6, 5.0, 0.01]} />
        <meshBasicMaterial color="#bfeee6" transparent opacity={0.18} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>

    {/* Stage */}
    <ToonMesh color={HALL.stage} outline={LINE.prop} position={[0, 0.3, -0.6]}>
      <boxGeometry args={[12, 0.6, 4.4]} />
    </ToonMesh>
    <ToonMesh color={HALL.stageFront} outline={LINE.prop} position={[0, 0.3, 1.62]}>
      <boxGeometry args={[12, 0.6, 0.04]} />
    </ToonMesh>
    {Array.from({ length: 11 }, (_, i) => (
      <InkMesh key={i} position={[-5 + i, 0.3, 1.65]}>
        <boxGeometry args={[0.03, 0.6, 0.01]} />
      </InkMesh>
    ))}

    {/* Lighting truss + cans + faint beams */}
    <ToonMesh color={HALL.steel} outline={L} position={[0, 6.95, 2.2]}>
      <boxGeometry args={[12, 0.14, 0.14]} />
    </ToonMesh>
    {[-4, -1.5, 1.5, 4].map((x) => (
      <StageLight key={x} x={x} />
    ))}
    {[-1.5, 1.5].map((x) => (
      <Beam key={x} x={x} />
    ))}

    {/* Empty seat rows between audience and stage */}
    {[3.2, 4.6].flatMap((z) =>
      Array.from({ length: 12 }, (_, i) => <Seat key={`${z}-${i}`} position={[-5.5 + i, 0, z]} />),
    )}
  </group>
);

export { PALETTE };
