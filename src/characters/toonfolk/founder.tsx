import { InkMesh, LINE, ToonMesh } from "../../toon/toon";
import { BODY, frontZ, type ToonLook } from "./ToonPerson";

const BLAZER = "#4b5059";
const LAPEL = "#40454d";
const TEE = "#ece6d8";
const HAIR = "#3d2c22";
const P = LINE.prop;

/** Startup founder: slate blazer over a tee, swept hair tied in a small bun. */
export const founderLook: ToonLook = {
  jacket: BLAZER,
  cuff: TEE,
  pants: "#3f4650",
  shoes: "#ece8df",
  sole: "#f7f4ee",
  torso: (
    <>
      {/* Tee showing through the open blazer */}
      <ToonMesh color={TEE} outline={P} position={[0, 0.74, frontZ(0.74) - 0.012]} rotation={[-0.12, 0, 0]}>
        <boxGeometry args={[0.24, 0.5, 0.03]} />
      </ToonMesh>
      <ToonMesh color={TEE} outline={P} position={[0, 1.02, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.85, 1]}>
        <torusGeometry args={[0.14, 0.03, 8, 22]} />
      </ToonMesh>
      {/* Lapels meeting at the button */}
      {[-1, 1].map((s) => (
        <ToonMesh key={s} color={LAPEL} outline={P} position={[s * 0.12, 0.7, frontZ(0.7) + 0.008]} rotation={[-0.08, 0, -s * 0.3]}>
          <boxGeometry args={[0.1, 0.62, 0.03]} />
        </ToonMesh>
      ))}
      <InkMesh position={[0, 0.4, frontZ(0.4) + 0.012]}>
        <sphereGeometry args={[0.024, 8, 6]} />
      </InkMesh>
      {/* Front opening below the button + pocket flaps */}
      <InkMesh position={[0, 0.12, frontZ(0.12) + 0.004]}>
        <boxGeometry args={[0.014, 0.5, 0.01]} />
      </InkMesh>
      {[-1, 1].map((s) => (
        <InkMesh key={`p${s}`} position={[s * 0.24, 0.24, frontZ(0.24) - 0.01]}>
          <boxGeometry args={[0.16, 0.014, 0.01]} />
        </InkMesh>
      ))}
    </>
  ),
  head: (
    <>
      {/* Swept-back cap of hair */}
      <ToonMesh color={HAIR} position={[0, 0.04, -0.03]} rotation={[-0.22, 0, 0]}>
        <sphereGeometry args={[BODY.headR + 0.03, 36, 18, 0, Math.PI * 2, 0, 1.1]} />
      </ToonMesh>
      {/* Swept volume over the forehead, rising to one side */}
      <ToonMesh color={HAIR} position={[0.1, 0.52, 0.24]} rotation={[-0.45, 0, -0.3]} scale={[2.2, 0.75, 1.15]}>
        <sphereGeometry args={[0.19, 22, 16]} />
      </ToonMesh>
      <ToonMesh color={HAIR} position={[-0.22, 0.5, 0.2]} rotation={[-0.4, 0, 0.3]} scale={[1.4, 0.65, 1]}>
        <sphereGeometry args={[0.16, 18, 14]} />
      </ToonMesh>
      <InkMesh color="#2c1f18" position={[0.16, 0.6, 0.33]} rotation={[-0.45, 0, -0.3]} scale={[1.6, 0.2, 0.5]}>
        <sphereGeometry args={[0.12, 12, 8]} />
      </InkMesh>
      {/* Small bun + hair tie */}
      <ToonMesh color={HAIR} position={[0, 0.5, -0.45]}>
        <sphereGeometry args={[0.17, 18, 14]} />
      </ToonMesh>
      <ToonMesh color="#2e2a27" outline={0} position={[0, 0.44, -0.37]} rotation={[0.9, 0, 0]}>
        <torusGeometry args={[0.1, 0.03, 8, 18]} />
      </ToonMesh>
      {/* Short sides */}
      {[-1, 1].map((s) => (
        <ToonMesh key={s} color={HAIR} position={[s * 0.56, 0.12, -0.12]} scale={[0.35, 1, 1.1]}>
          <sphereGeometry args={[0.24, 16, 12]} />
        </ToonMesh>
      ))}
    </>
  ),
};
