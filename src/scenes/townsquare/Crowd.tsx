import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { InkMesh, LINE, onTwos, PALETTE, ReceiveShadow, ToonMesh } from "../../toon/toon";

// [x, y, z, headRadius, turn] — backs of heads facing the camera.
const MEMBERS: [number, number, number, number, number][] = [
  [-4.0, 0.75, 7.6, 0.85, 0],
  [-2.2, 0.5, 8.4, 0.9, 0],
  [2.3, 0.55, 8.2, 0.9, 0],
  [4.4, 0.75, 7.4, 0.85, 0],
  [6.0, 0.6, 8.4, 0.95, 0.9],
  [-6.1, 0.6, 8.3, 0.9, 0],
  [-3.1, 0.75, 5.4, 0.6, 0],
  [3.0, 0.8, 5.2, 0.6, 0],
  [-1.2, 0.85, 4.4, 0.5, 0],
  [1.3, 0.85, 4.2, 0.5, 0],
  [-4.6, 0.85, 4.0, 0.5, 0],
  [4.7, 0.9, 3.8, 0.5, 0],
];

const Person: React.FC<{ m: (typeof MEMBERS)[number]; index: number }> = ({ m, index }) => {
  const [x, y, z, r, turn] = m;
  const frame = onTwos(useCurrentFrame());
  const { fps } = useVideoConfig();
  // A couple of people react with a small snappy head shift.
  const react =
    index === 8 || index === 4
      ? spring({ frame: frame - (index === 8 ? 30 : 64), fps, config: { stiffness: 300, damping: 14 } })
      : 0;
  return (
    <group position={[x, y, z]}>
      <ToonMesh color={PALETTE.skin} position={[0, -r * 1.2, 0]} scale={[1, 0.9, 0.8]}>
        <capsuleGeometry args={[r * 0.75, r * 0.9, 4, 16]} />
      </ToonMesh>
      <group rotation={[0, turn + react * 0.25, react * 0.08]}>
        <ToonMesh color={PALETTE.skin} outline={LINE.character + 1}>
          <sphereGeometry args={[r, 36, 28]} />
        </ToonMesh>
        {turn ? (
          <InkMesh position={[-r * 0.55, r * 0.05, r * 0.82]} scale={[0.8, 1.1, 0.4]}>
            <sphereGeometry args={[r * 0.09, 12, 10]} />
          </InkMesh>
        ) : null}
      </group>
    </group>
  );
};

export const Crowd: React.FC = () => (
  <ReceiveShadow.Provider value={false}>
    {MEMBERS.map((m, i) => (
      <Person key={i} m={m} index={i} />
    ))}
  </ReceiveShadow.Provider>
);
