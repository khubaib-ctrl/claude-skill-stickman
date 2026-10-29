import { RoundedBoxGeometry } from "@react-three/drei";
import * as THREE from "three";
import { InkMesh, LINE, ToonMesh } from "../../toon/toon";
import { chestZ, KERNEL, type KernelLook, TORSO_DEPTH, torsoR } from "./Kernel";

const FZ = KERNEL.faceZ;
const P = LINE.prop;
const B = LINE.background;
const TOP = KERNEL.torsoH;

/** Ribbed band wrapped around the torso at height y. */
const Band: React.FC<{ y: number; h: number; color: string; grow?: number }> = ({ y, h, color, grow = 0.012 }) => (
  <ToonMesh color={color} outline={P} position={[0, y, 0]} scale={[1, 1, TORSO_DEPTH]}>
    <cylinderGeometry args={[torsoR(y + h / 2) + grow, torsoR(y - h / 2) + grow, h, 28]} />
  </ToonMesh>
);

/** Crew-neck collar ring. */
const CrewCollar: React.FC<{ color: string }> = ({ color }) => (
  <ToonMesh color={color} outline={P} position={[0, TOP + 0.01, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1.05, 0.8, 1]}>
    <torusGeometry args={[0.15, 0.045, 10, 26]} />
  </ToonMesh>
);

/** Spike of hair pointing along `dir` from `at` (head space). */
const Lock: React.FC<{ at: [number, number, number]; dir: [number, number, number]; r: number; len: number; color: string }> = ({
  at,
  dir,
  r,
  len,
  color,
}) => {
  const d = new THREE.Vector3(...dir).normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
  const pos = new THREE.Vector3(...at).addScaledVector(d, len / 2);
  return (
    <ToonMesh color={color} outline={P} position={pos.toArray()} quaternion={q}>
      <coneGeometry args={[r, len, 10]} />
    </ToonMesh>
  );
};

/* ---------------- Founder: shaggy hair, open black zip hoodie over a tee, canvas sneakers ---------------- */
const HOODIE = "#2f2b29";
const HOODIE_RIB = "#3b3734";
const SHAG = "#7f7668";

const SHAG_LOCKS: [[number, number, number], [number, number, number], number, number][] = [
  // soft shaggy tufts (at, dir, radius, length)
  [[0, 0.62, 0.05], [0.15, 1, 0.2], 0.13, 0.2],
  [[-0.2, 0.6, 0.1], [-0.5, 1, 0.3], 0.13, 0.2],
  [[0.22, 0.6, 0.08], [0.6, 1, 0.2], 0.13, 0.22],
  [[0.05, 0.62, -0.2], [0.1, 1, -0.5], 0.13, 0.2],
  [[-0.24, 0.58, -0.18], [-0.6, 0.9, -0.4], 0.12, 0.2],
  [[0.26, 0.58, -0.16], [0.6, 0.9, -0.4], 0.12, 0.2],
  [[-0.43, 0.42, 0.08], [-1, 0.35, 0.2], 0.12, 0.2],
  [[-0.44, 0.3, -0.12], [-1, -0.2, -0.2], 0.11, 0.18],
  [[0.44, 0.44, 0.04], [1, 0.45, 0.1], 0.12, 0.22],
  [[0.44, 0.3, -0.15], [1, -0.15, -0.3], 0.11, 0.18],
  [[-0.1, 0.42, -0.42], [-0.2, 0.1, -1], 0.13, 0.18],
  [[0.18, 0.42, -0.4], [0.3, 0.1, -1], 0.12, 0.18],
  // fringe falling over the forehead (the dot stays visible)
  [[-0.27, 0.47, 0.36], [-0.3, -1, 0.4], 0.1, 0.17],
  [[-0.08, 0.5, 0.38], [-0.1, -1, 0.45], 0.09, 0.14],
  [[0.17, 0.48, 0.37], [0.35, -1, 0.4], 0.1, 0.17],
  [[0.33, 0.45, 0.32], [0.6, -1, 0.3], 0.09, 0.18],
];

export const founderLook: KernelLook = {
  top: HOODIE,
  cuff: HOODIE_RIB,
  bottom: "#3e4741",
  shoes: "#a39d90",
  shoe: (
    <>
      <ToonMesh color="#ece8df" outline={B} position={[0, 0.035, 0]}>
        <RoundedBoxGeometry args={[0.27, 0.07, 0.54]} radius={0.03} />
      </ToonMesh>
      {[0.03, 0.1].map((z) => (
        <InkMesh key={z} position={[0, 0.215, z]}>
          <boxGeometry args={[0.1, 0.012, 0.012]} />
        </InkMesh>
      ))}
    </>
  ),
  torso: (
    <>
      {/* Tee showing through the open zip */}
      <ToonMesh color="#cfc9be" outline={P} position={[0, 0.56, chestZ(0.56) - 0.008]}>
        <RoundedBoxGeometry args={[0.34, 0.98, 0.03]} radius={0.01} />
      </ToonMesh>
      {[-1, 1].map((s) => (
        <InkMesh key={`z${s}`} position={[s * 0.17, 0.53, chestZ(0.53) + 0.012]}>
          <boxGeometry args={[0.02, 0.98, 0.01]} />
        </InkMesh>
      ))}
      {/* Drawstrings */}
      {[-1, 1].map((s) => (
        <group key={`d${s}`} position={[s * 0.21, 0.82, chestZ(0.82) + 0.025]}>
          <ToonMesh color="#dcd7cd" outline={B}>
            <cylinderGeometry args={[0.014, 0.014, 0.36, 6]} />
          </ToonMesh>
          <ToonMesh color="#bfb9ad" outline={B} position={[0, -0.2, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.05, 8]} />
          </ToonMesh>
        </group>
      ))}
      {/* Hood bunched around the neck + over the shoulders */}
      <ToonMesh color={HOODIE} position={[0, TOP + 0.02, -0.06]} rotation={[Math.PI / 2 + 0.2, 0, 0]} scale={[1.25, 1.1, 1]}>
        <torusGeometry args={[0.22, 0.1, 12, 28]} />
      </ToonMesh>
      <ToonMesh color={HOODIE} position={[0, TOP - 0.05, -0.24]} scale={[1.3, 0.8, 0.6]}>
        <sphereGeometry args={[0.24, 18, 14]} />
      </ToonMesh>
      {/* Pocket seams + hem */}
      {[-1, 1].map((s) => (
        <InkMesh key={`p${s}`} position={[s * 0.28, 0.25, chestZ(0.25) + 0.004]} rotation={[0, 0, -s * 0.5]}>
          <boxGeometry args={[0.012, 0.2, 0.01]} />
        </InkMesh>
      ))}
      <Band y={0.04} h={0.1} color={HOODIE_RIB} />
    </>
  ),
  head: (
    <>
      <ToonMesh color={SHAG} position={[0, 0.42, -0.04]} scale={[1.02, 0.6, 1.0]}>
        <sphereGeometry args={[0.47, 28, 20]} />
      </ToonMesh>
      {[
        [-0.25, 0.55, 0.1],
        [0.25, 0.56, 0.06],
        [0, 0.6, -0.15],
        [-0.36, 0.38, -0.1],
        [0.37, 0.4, -0.08],
      ].map(([x, y, z], i) => (
        <ToonMesh key={`v${i}`} color={SHAG} position={[x, y, z]}>
          <sphereGeometry args={[0.18, 16, 12]} />
        </ToonMesh>
      ))}
      {SHAG_LOCKS.map(([at, dir, r, len], i) => (
        <Lock key={i} at={at} dir={dir} r={r} len={len} color={i % 3 === 0 ? "#736a5d" : SHAG} />
      ))}
    </>
  ),
};

/* ---------------- Engineer: bald, thin glasses, crewneck sweater, laptop ---------------- */
const SWEATER = "#8b8173";
const SWEATER_RIB = "#7a7164";

export const ThinGlasses: React.FC<{ color?: string }> = ({ color = "#2b1f1a" }) => (
  <group position={[0, -0.035, FZ + 0.025]}>
    {[-1, 1].map((s) => (
      <InkMesh key={s} color={color} position={[s * 0.165, 0, 0]} scale={[1.15, 0.92, 1]}>
        <torusGeometry args={[0.092, 0.012, 8, 32]} />
      </InkMesh>
    ))}
    <InkMesh color={color} position={[0, 0.015, 0]}>
      <boxGeometry args={[0.075, 0.014, 0.012]} />
    </InkMesh>
    {[-1, 1].map((s) => (
      <group key={`t${s}`}>
        <InkMesh color={color} position={[s * 0.34, 0.01, 0]}>
          <boxGeometry args={[0.1, 0.014, 0.012]} />
        </InkMesh>
        <InkMesh color={color} position={[s * 0.405, 0.01, -0.16]}>
          <boxGeometry args={[0.012, 0.014, 0.33]} />
        </InkMesh>
      </group>
    ))}
  </group>
);

const Laptop: React.FC = () => (
  <group position={[0.2, 0.5, 0.52]} rotation={[0.12, -0.45, 0.12]}>
    <ToonMesh color="#6e6a70" outline={P}>
      <RoundedBoxGeometry args={[0.62, 0.035, 0.42]} radius={0.012} />
    </ToonMesh>
    {/* Screen hinged at the far edge, facing the engineer */}
    <group position={[0, 0.015, 0.2]} rotation={[-0.2, 0, 0]}>
      <ToonMesh color="#6e6a70" outline={P} position={[0, 0.21, 0]}>
        <RoundedBoxGeometry args={[0.62, 0.42, 0.025]} radius={0.012} />
      </ToonMesh>
      <InkMesh color="#b9b4bb" position={[0, 0.22, 0.014]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.004, 18]} />
      </InkMesh>
    </group>
  </group>
);

export const engineerLook: KernelLook = {
  top: SWEATER,
  cuff: SWEATER_RIB,
  bottom: "#7a756c",
  shoes: "#5a4a3d",
  torso: (
    <>
      <CrewCollar color={SWEATER_RIB} />
      <Band y={0.05} h={0.12} color={SWEATER_RIB} />
    </>
  ),
  held: <Laptop />,
  head: <ThinGlasses />,
};

/* ---------------- Investor: navy suit, open-collar shirt, side-parted hair ---------------- */
const NAVY = "#2e3954";
const NAVY_DARK = "#252e45";
const SHIRT = "#e3dccb";
const INV_HAIR = "#6e665b";

export const investorLook: KernelLook = {
  top: NAVY,
  cuff: SHIRT,
  bottom: NAVY,
  shoes: "#26221f",
  torso: (
    <>
      {/* Jacket skirt over the hips */}
      <ToonMesh color={NAVY} position={[0, -0.1, 0]} scale={[1, 1, TORSO_DEPTH]}>
        <cylinderGeometry args={[0.395, 0.41, 0.3, 28]} />
      </ToonMesh>
      <InkMesh position={[0.02, -0.08, chestZ(0) + 0.02]}>
        <boxGeometry args={[0.012, 0.3, 0.01]} />
      </InkMesh>
      {/* Open-collar shirt V */}
      <ToonMesh color={SHIRT} outline={P} position={[0, 0.83, chestZ(0.83) - 0.01]} rotation={[-0.06, 0, Math.PI]}>
        <coneGeometry args={[0.15, 0.48, 3]} />
      </ToonMesh>
      {[-1, 1].map((s) => (
        <ToonMesh key={`c${s}`} color={SHIRT} outline={P} position={[s * 0.1, TOP - 0.02, chestZ(TOP) + 0.02]} rotation={[-0.4, 0, s * 0.55]}>
          <boxGeometry args={[0.15, 0.1, 0.03]} />
        </ToonMesh>
      ))}
      {/* Lapels */}
      {[-1, 1].map((s) => (
        <ToonMesh key={`l${s}`} color={NAVY_DARK} outline={P} position={[s * 0.12, 0.7, chestZ(0.7) + 0.012]} rotation={[-0.04, 0, -s * 0.27]}>
          <boxGeometry args={[0.12, 0.64, 0.035]} />
        </ToonMesh>
      ))}
      {/* Button + pocket flaps */}
      <InkMesh position={[0.02, 0.36, chestZ(0.36) + 0.02]}>
        <sphereGeometry args={[0.022, 8, 6]} />
      </InkMesh>
      {[-1, 1].map((s) => (
        <InkMesh key={`p${s}`} position={[s * 0.25, 0.2, chestZ(0.2) + 0.006]}>
          <boxGeometry args={[0.18, 0.012, 0.01]} />
        </InkMesh>
      ))}
      <InkMesh position={[0.27, 0.8, chestZ(0.8) + 0.006]}>
        <boxGeometry args={[0.12, 0.012, 0.01]} />
      </InkMesh>
    </>
  ),
  head: (
    <>
      <ToonMesh color={INV_HAIR} position={[0, 0.44, -0.05]} scale={[0.93, 0.48, 0.9]}>
        <sphereGeometry args={[0.47, 28, 20]} />
      </ToonMesh>
      {/* Swept volume from a side part */}
      <ToonMesh color={INV_HAIR} position={[0.06, 0.55, 0.14]} rotation={[-0.2, 0, -0.2]} scale={[1.6, 0.55, 1]}>
        <sphereGeometry args={[0.24, 22, 16]} />
      </ToonMesh>
      <InkMesh color="#5c554b" position={[-0.17, 0.62, 0.08]} rotation={[-0.3, 0.1, 0]}>
        <boxGeometry args={[0.015, 0.012, 0.36]} />
      </InkMesh>
      {[-1, 1].map((s) => (
        <ToonMesh key={s} color={INV_HAIR} outline={P} position={[s * 0.405, 0.22, -0.06]}>
          <RoundedBoxGeometry args={[0.05, 0.26, 0.5]} radius={0.02} />
        </ToonMesh>
      ))}
    </>
  ),
};

/* ---------------- Businessman: top hat, long double-breasted greatcoat ---------------- */
const COAT = "#6e5644";
const COAT_DARK = "#5e4838";
const HAT = "#43403d";

export const businessmanLook: KernelLook = {
  top: COAT,
  cuff: "#7d6452",
  bottom: "#6c6862",
  shoes: "#4a3b30",
  torso: (
    <>
      {/* Knee-length coat skirt */}
      <ToonMesh color={COAT} position={[0, -0.45, 0]} scale={[1, 1, TORSO_DEPTH + 0.06]}>
        <cylinderGeometry args={[0.4, 0.5, 0.9, 30]} />
      </ToonMesh>
      <InkMesh position={[0.06, 0.05, chestZ(0) + 0.03]}>
        <boxGeometry args={[0.014, 1.95, 0.01]} />
      </InkMesh>
      {/* Vest V, high shirt collar, cravat */}
      <ToonMesh color="#4b4c42" outline={P} position={[0, 0.86, chestZ(0.86) - 0.006]} rotation={[-0.05, 0, Math.PI]}>
        <coneGeometry args={[0.15, 0.4, 3]} />
      </ToonMesh>
      <ToonMesh color="#e8e2d4" outline={P} position={[0, TOP + 0.02, 0.02]} scale={[1, 1, 0.9]}>
        <cylinderGeometry args={[0.15, 0.17, 0.12, 18]} />
      </ToonMesh>
      <ToonMesh color="#3a3330" outline={P} position={[0, TOP - 0.06, chestZ(TOP) + 0.02]} scale={[1.2, 0.9, 0.6]}>
        <sphereGeometry args={[0.06, 12, 10]} />
      </ToonMesh>
      {/* Big lapels */}
      {[-1, 1].map((s) => (
        <ToonMesh key={`l${s}`} color={COAT_DARK} outline={P} position={[s * 0.17, 0.82, chestZ(0.82) + 0.012]} rotation={[-0.04, 0, -s * 0.4]}>
          <boxGeometry args={[0.17, 0.44, 0.04]} />
        </ToonMesh>
      ))}
      {/* Double-breasted buttons */}
      {[0.58, 0.4, 0.22].flatMap((y) =>
        [-1, 1].map((s) => (
          <ToonMesh key={`${y}${s}`} color="#3a2d24" outline={0} position={[s * 0.12 + 0.03, y, chestZ(y) + 0.02]}>
            <sphereGeometry args={[0.025, 10, 8]} />
          </ToonMesh>
        )),
      )}
    </>
  ),
  head: (
    <>
      {/* Top hat sits low, just above the dot */}
      <ToonMesh color={HAT} position={[0, 0.37, 0]}>
        <cylinderGeometry args={[0.56, 0.56, 0.04, 36]} />
      </ToonMesh>
      <ToonMesh color={HAT} outline={P} position={[0, 0.39, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.55, 0.03, 8, 40]} />
      </ToonMesh>
      <ToonMesh color={HAT} position={[0, 0.84, 0]}>
        <cylinderGeometry args={[0.44, 0.41, 0.92, 36]} />
      </ToonMesh>
      <ToonMesh color="#363331" outline={0} position={[0, 0.46, 0]}>
        <cylinderGeometry args={[0.415, 0.412, 0.12, 36]} />
      </ToonMesh>
    </>
  ),
};

/* ---------------- Generic crowd member: bald, plain crewneck ---------------- */
export const crowdLook = (top = "#8a847c", rib = "#7b756d"): KernelLook => ({
  top,
  cuff: rib,
  bottom: "#6d6862",
  shoes: "#584a3e",
  torso: <CrewCollar color={rib} />,
});
