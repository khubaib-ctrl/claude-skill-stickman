import { buyerLook, ceoLook, clerkLook, execLook, rivalLook } from "../../characters/toonfolk/business";
import { frontZ, type ToonLook } from "../../characters/toonfolk/ToonPerson";
import { LINE, ToonMesh } from "../../toon/toon";

const SCARF = "#8f9497";

/** EXEC outdoors in scene 11: same suit, plus a grey scarf (motivated by the snow). */
const execScarf: ToonLook = {
  ...execLook,
  torso: (
    <>
      {execLook.torso}
      <ToonMesh color={SCARF} position={[0, 1.02, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1.15, 0.85, 1]}>
        <torusGeometry args={[0.17, 0.07, 10, 26]} />
      </ToonMesh>
      <ToonMesh color={SCARF} outline={LINE.prop} position={[0.1, 0.78, frontZ(0.78) + 0.05]} rotation={[-0.1, 0, 0.08]}>
        <boxGeometry args={[0.13, 0.42, 0.05]} />
      </ToonMesh>
    </>
  ),
};

/** PLATFORM MAN: generic figure from the memo's parable (scene 6). Orange coveralls, yellow hard hat. */
const platform: ToonLook = {
  jacket: "#c9692f",
  pants: "#b85e2a",
  shoes: "#3a302b",
  head: (
    <>
      <ToonMesh color="#e2b33c" position={[0, 0.12, 0]}>
        <sphereGeometry args={[0.66, 32, 16, 0, Math.PI * 2, 0, 1.25]} />
      </ToonMesh>
      <ToonMesh color="#e2b33c" outline={LINE.prop} position={[0, 0.36, 0.1]} rotation={[-0.15, 0, 0]}>
        <cylinderGeometry args={[0.72, 0.72, 0.04, 28]} />
      </ToonMesh>
    </>
  ),
};

export const business = { platform, exec: execLook, execScarf, ceo: ceoLook, buyer: buyerLook, clerk: clerkLook, rival: rivalLook };
