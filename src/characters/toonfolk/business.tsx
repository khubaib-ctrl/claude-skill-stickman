import { InkMesh, LINE, ToonMesh } from "../../toon/toon";
import { BODY, frontZ, onHead, type ToonLook } from "./ToonPerson";

const P = LINE.prop;
const R = BODY.headR;

/* ---------- Reusable clothing + hair parts (torso / head space) ---------- */

/** Open-front suit jacket over a shirt, optional tie. */
export const SuitFront: React.FC<{ lapel: string; shirt: string; tie?: string }> = ({ lapel, shirt, tie }) => (
  <>
    <ToonMesh color={shirt} outline={P} position={[0, 0.76, frontZ(0.76) - 0.012]} rotation={[-0.12, 0, 0]}>
      <boxGeometry args={[0.22, 0.46, 0.03]} />
    </ToonMesh>
    {/* Shirt collar points */}
    {[-1, 1].map((s) => (
      <ToonMesh key={`c${s}`} color={shirt} outline={P} position={[s * 0.08, 1.0, frontZ(1.0) + 0.02]} rotation={[-0.35, 0, s * 0.6]}>
        <boxGeometry args={[0.12, 0.08, 0.025]} />
      </ToonMesh>
    ))}
    {tie ? (
      <>
        <ToonMesh color={tie} outline={P} position={[0, 0.98, frontZ(0.98) + 0.012]}>
          <boxGeometry args={[0.07, 0.06, 0.03]} />
        </ToonMesh>
        <ToonMesh color={tie} outline={P} position={[0, 0.76, frontZ(0.76) + 0.006]} rotation={[-0.12, 0, Math.PI]}>
          <coneGeometry args={[0.055, 0.4, 4]} />
        </ToonMesh>
      </>
    ) : null}
    {[-1, 1].map((s) => (
      <ToonMesh key={`l${s}`} color={lapel} outline={P} position={[s * 0.12, 0.7, frontZ(0.7) + 0.008]} rotation={[-0.08, 0, -s * 0.3]}>
        <boxGeometry args={[0.1, 0.62, 0.03]} />
      </ToonMesh>
    ))}
    <InkMesh position={[0, 0.4, frontZ(0.4) + 0.012]}>
      <sphereGeometry args={[0.024, 8, 6]} />
    </InkMesh>
    <InkMesh position={[0, 0.12, frontZ(0.12) + 0.004]}>
      <boxGeometry args={[0.014, 0.5, 0.01]} />
    </InkMesh>
    {[-1, 1].map((s) => (
      <InkMesh key={`p${s}`} position={[s * 0.24, 0.24, frontZ(0.24) - 0.01]}>
        <boxGeometry args={[0.16, 0.014, 0.01]} />
      </InkMesh>
    ))}
  </>
);

/** Thin round-ish glasses sitting on the eyes. */
export const Glasses: React.FC<{ color?: string }> = ({ color = "#2b1f1a" }) => (
  <>
    {([-1, 1] as const).map((s) => (
      <InkMesh key={s} color={color} {...onHead(0.03, s * 0.25, 0.035)}>
        <torusGeometry args={[0.085, 0.012, 8, 28]} />
      </InkMesh>
    ))}
    <InkMesh color={color} {...onHead(0.05, 0, 0.05)}>
      <boxGeometry args={[0.1, 0.014, 0.012]} />
    </InkMesh>
  </>
);

/** Hair cap covering the top and back of the head. */
export const HairCap: React.FC<{ color: string; tilt?: number; cover?: number }> = ({ color, tilt = -0.25, cover = 1.15 }) => (
  <ToonMesh color={color} position={[0, 0.03, -0.03]} rotation={[tilt, 0, 0]}>
    <sphereGeometry args={[R + 0.025, 36, 18, 0, Math.PI * 2, 0, cover]} />
  </ToonMesh>
);

/* ---------- Nokia story cast ---------- */

/** EXEC: composite "Nokia leadership". Navy suit, light-blue shirt, no tie, swept grey hair, thin glasses. */
export const execLook: ToonLook = {
  jacket: "#34405a",
  cuff: "#c9d6e3",
  pants: "#34405a",
  shoes: "#2a2522",
  torso: <SuitFront lapel="#2c3650" shirt="#c9d6e3" />,
  head: (
    <>
      <HairCap color="#9a958c" tilt={-0.3} />
      <ToonMesh color="#9a958c" position={[0.05, 0.5, 0.25]} rotation={[-0.5, 0, -0.25]} scale={[2.1, 0.6, 1.1]}>
        <sphereGeometry args={[0.18, 20, 14]} />
      </ToonMesh>
      <Glasses />
    </>
  ),
};

/** CEO: "Nokia's new CEO" (generic). Charcoal suit, white shirt, dark tie, short dark hair. */
export const ceoLook: ToonLook = {
  jacket: "#3d3d40",
  cuff: "#f1ede4",
  pants: "#3d3d40",
  shoes: "#231f1d",
  torso: <SuitFront lapel="#333336" shirt="#f1ede4" tie="#5a2f2f" />,
  head: (
    <>
      <HairCap color="#3b2e26" tilt={-0.2} cover={1.05} />
      <ToonMesh color="#3b2e26" position={[0, 0.56, 0.2]} rotation={[-0.6, 0, 0]} scale={[1.9, 0.7, 1.1]}>
        <sphereGeometry args={[0.17, 20, 14]} />
      </ToonMesh>
    </>
  ),
};

/** BUYER: generic Microsoft-side executive. Olive-grey suit, open collar, bald, short beard. */
export const buyerLook: ToonLook = {
  jacket: "#6a6b58",
  cuff: "#e8e2d4",
  pants: "#5a5b4a",
  shoes: "#3a2f28",
  torso: <SuitFront lapel="#5d5e4c" shirt="#e8e2d4" />,
  head: (
    <>
      {/* Short beard along the jaw, below the mouth */}
      {/* Jaw beard: tilted so its top edge rises along the jaw toward the ears */}
      <ToonMesh color="#5a4636" rotation={[0.32, 0, 0]}>
        <sphereGeometry args={[R + 0.018, 36, 14, Math.PI / 2 - 1.45, 2.9, Math.PI * 0.6, Math.PI * 0.28]} />
      </ToonMesh>
      {/* Short moustache above the mouth */}
      {[-1, 1].map((s) => (
        <ToonMesh key={`m${s}`} color="#5a4636" outline={LINE.prop} {...onHead(-0.2, s * 0.1, 0.012)} rotation={undefined} scale={[1.6, 0.6, 0.45]}>
          <sphereGeometry args={[0.055, 12, 10]} />
        </ToonMesh>
      ))}
    </>
  ),
};

/** CLERK: shop clerk. Rust polo shirt, short hair. */
export const clerkLook: ToonLook = {
  jacket: "#9a5a44",
  pants: "#4a4540",
  shoes: "#3a302b",
  torso: (
    <>
      {[-1, 1].map((s) => (
        <ToonMesh key={s} color="#9a5a44" outline={P} position={[s * 0.1, 1.0, frontZ(1.0) + 0.02]} rotation={[-0.4, 0, s * 0.55]}>
          <boxGeometry args={[0.16, 0.1, 0.025]} />
        </ToonMesh>
      ))}
      <ToonMesh color="#86493a" outline={P} position={[0, 0.88, frontZ(0.88)]}>
        <boxGeometry args={[0.07, 0.22, 0.02]} />
      </ToonMesh>
    </>
  ),
  head: (
    <>
      <HairCap color="#4a372b" tilt={-0.2} cover={1.2} />
      {/* Shop cap with a peak */}
      <ToonMesh color="#86493a" position={[0, 0.1, -0.02]} rotation={[-0.15, 0, 0]}>
        <sphereGeometry args={[R + 0.05, 36, 16, 0, Math.PI * 2, 0, 0.95]} />
      </ToonMesh>
      <ToonMesh color="#86493a" position={[0, 0.5, 0.42]} rotation={[0.25, 0, 0]} scale={[1, 0.18, 0.75]}>
        <cylinderGeometry args={[0.36, 0.36, 0.2, 28, 1, false, -Math.PI / 2 - 1.1, 2.2]} />
      </ToonMesh>
    </>
  ),
};

/** RIVAL: symbolic "Samsung" figure (no logo). Muted blue jacket, neat side part. */
export const rivalLook: ToonLook = {
  jacket: "#4f6f95",
  cuff: "#ece6d8",
  pants: "#3f4650",
  shoes: "#2a2522",
  torso: <SuitFront lapel="#44617f" shirt="#ece6d8" />,
  head: (
    <>
      <HairCap color="#2f2520" tilt={-0.18} cover={1.12} />
      <ToonMesh color="#2f2520" position={[0.1, 0.52, 0.22]} rotation={[-0.45, 0, -0.35]} scale={[2.4, 0.5, 1.2]}>
        <sphereGeometry args={[0.17, 20, 14]} />
      </ToonMesh>
      <InkMesh color="#1a1411" position={[-0.22, 0.56, 0.2]} rotation={[-0.55, 0.25, 0]}>
        <boxGeometry args={[0.02, 0.014, 0.34]} />
      </InkMesh>
    </>
  ),
};
