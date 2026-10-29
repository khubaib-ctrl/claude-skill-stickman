import { InkMesh, LINE, ToonMesh } from "../../toon/toon";
import { BODY, type ToonLook } from "./ToonPerson";

export type HairStyle = "short" | "bald" | "bun" | "curly" | "long" | "beanie";

const R = BODY.headR;

const Hair: React.FC<{ style: HairStyle; color: string }> = ({ style, color }) => {
  switch (style) {
    case "bald":
      return null;
    case "short":
      return (
        <ToonMesh color={color} position={[0, 0.02, -0.03]} rotation={[-0.55, 0, 0]}>
          <sphereGeometry args={[R + 0.025, 32, 16, 0, Math.PI * 2, 0, 1.45]} />
        </ToonMesh>
      );
    case "bun":
      return (
        <>
          <ToonMesh color={color} position={[0, 0.02, -0.03]} rotation={[-0.55, 0, 0]}>
            <sphereGeometry args={[R + 0.025, 32, 16, 0, Math.PI * 2, 0, 1.5]} />
          </ToonMesh>
          <ToonMesh color={color} position={[0, 0.48, -0.45]}>
            <sphereGeometry args={[0.2, 16, 12]} />
          </ToonMesh>
        </>
      );
    case "curly":
      return (
        <>
          {[
            [0, 0.5, 0, 0.26],
            [-0.3, 0.42, -0.05, 0.22],
            [0.3, 0.42, -0.05, 0.22],
            [0, 0.38, -0.36, 0.25],
            [-0.32, 0.18, -0.3, 0.2],
            [0.32, 0.18, -0.3, 0.2],
            [-0.18, 0.3, -0.45, 0.2],
            [0.18, 0.3, -0.45, 0.2],
            [0, 0.05, -0.55, 0.2],
            [-0.28, -0.05, -0.48, 0.2],
            [0.28, -0.05, -0.48, 0.2],
            [-0.42, 0.1, -0.22, 0.18],
            [0.42, 0.1, -0.22, 0.18],
          ].map(([x, y, z, r], i) => (
            <ToonMesh key={i} color={color} position={[x, y, z]}>
              <sphereGeometry args={[r, 16, 12]} />
            </ToonMesh>
          ))}
        </>
      );
    case "long":
      return (
        <>
          <ToonMesh color={color} position={[0, 0.02, -0.03]} rotation={[-0.6, 0, 0]}>
            <sphereGeometry args={[R + 0.03, 32, 16, 0, Math.PI * 2, 0, 1.75]} />
          </ToonMesh>
          {/* Hair falling down the back */}
          <ToonMesh color={color} position={[0, -0.3, -0.4]} rotation={[0.2, 0, 0]} scale={[1, 1, 0.5]}>
            <capsuleGeometry args={[0.46, 0.55, 4, 16]} />
          </ToonMesh>
        </>
      );
    case "beanie":
      return (
        <>
          <ToonMesh color={color} position={[0, 0.08, 0]} rotation={[-0.1, 0, 0]}>
            <sphereGeometry args={[R + 0.04, 32, 16, 0, Math.PI * 2, 0, 1.2]} />
          </ToonMesh>
          <ToonMesh color={color} outline={LINE.prop} position={[0, 0.3, -0.04]} rotation={[-0.1, 0, 0]}>
            <torusGeometry args={[0.56, 0.06, 10, 32]} />
          </ToonMesh>
        </>
      );
  }
};

/** Audience member look: plain jacket/sweater + a hairstyle. */
export const audienceLook = (jacket: string, hair: HairStyle, hairColor: string, pants = "#3f4247"): ToonLook => ({
  jacket,
  pants,
  shoes: "#3a302b",
  torso: (
    <ToonMesh color={jacket} outline={LINE.prop} position={[0, 1.02, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.85, 1]}>
      <torusGeometry args={[0.15, 0.035, 8, 22]} />
    </ToonMesh>
  ),
  head: <Hair style={hair} color={hairColor} />,
});
