import * as THREE from "three";
import { InkMesh, LINE, ToonMesh } from "../../toon/toon";
import { HairCap, SuitFront } from "./business";
import { HEAD_R, frontZ, onHead, torsoRadius, type Build, type ToonLook } from "./ToonPerson";

/**
 * The round-head cast: the standard character set for new videos (chibi build).
 * Orator, Tycoon, Knight, Astronomer. Identity comes only from props: hair,
 * facial hair, costume. Torso details use tall design space + frontZ(y).
 */

const P = LINE.prop;

/* ---------- Shared parts ---------- */

/** A tube swept along points, its radius shaped by `taper(t)`. Static geometry: build once at module level. */
export const sweptTube = (points: THREE.Vector3[], r: number, taper: (t: number) => number, segs = 48, radial = 14) => {
  const curve = new THREE.CatmullRomCurve3(points, false, "centripetal");
  const g = new THREE.TubeGeometry(curve, segs, r, radial, false);
  const pos = g.attributes.position;
  const v = new THREE.Vector3();
  const c = new THREE.Vector3();
  for (let i = 0; i <= segs; i++) {
    curve.getPointAt(i / segs, c);
    const s = taper(i / segs);
    for (let j = 0; j <= radial; j++) {
      const k = i * (radial + 1) + j;
      v.fromBufferAttribute(pos, k).sub(c).multiplyScalar(s).add(c);
      pos.setXYZ(k, v.x, v.y, v.z);
    }
  }
  g.computeVertexNormals();
  return g;
};

/** Points on the head surface from (latitude, longitude) pairs, lifted off the skin. */
const headPath = (pts: [number, number][], lift: number, side: 1 | -1) =>
  pts.map(([lat, lon]) => new THREE.Vector3(...onHead(lat, side * lon, lift).position));

/** Thick in the middle, thinner at the root, a blunt tip at the curl. */
const STACHE_TAPER = (t: number) => 0.28 + 0.72 * Math.sin(Math.PI * (0.15 + 0.85 * t));

const mustacheGeos = (pts: [number, number][], r: number, lift = 0.035) =>
  ([-1, 1] as const).map((s) => sweptTube(headPath(pts, lift, s), r, STACHE_TAPER));

/** Big curled handlebar (Orator). Sits above the mouth line so the mouth stays readable. */
const HANDLEBAR = mustacheGeos(
  [[-0.19, 0], [-0.24, 0.15], [-0.24, 0.31], [-0.17, 0.45], [-0.07, 0.52], [-0.01, 0.49], [-0.03, 0.42]],
  0.05,
);
/** Thin waxed handlebar with tight upturned tips (Tycoon). */
const WAXED = mustacheGeos([[-0.19, 0], [-0.23, 0.12], [-0.22, 0.26], [-0.16, 0.38], [-0.08, 0.44], [-0.03, 0.42]], 0.036);
/** Long drooping mustache that runs down into the beard (Astronomer). */
const WALRUS = mustacheGeos([[-0.15, 0], [-0.19, 0.14], [-0.27, 0.27], [-0.4, 0.34], [-0.52, 0.35]], 0.05, 0.11);

export const Mustache: React.FC<{ geos: THREE.BufferGeometry[]; color: string }> = ({ geos, color }) => (
  <>
    {geos.map((g, i) => (
      <ToonMesh key={i} color={color} outline={P} geometry={g} />
    ))}
  </>
);

/** One squashed sphere lying on the head surface (hair curls, tufts). */
const Puff: React.FC<{ lat: number; lon: number; lift?: number; r: number; scale?: [number, number, number]; color: string }> = ({
  lat,
  lon,
  lift = 0.03,
  r,
  scale = [1, 0.8, 0.62],
  color,
}) => (
  <ToonMesh color={color} outline={P} {...onHead(lat, lon, lift)} scale={scale}>
    <sphereGeometry args={[r, 18, 14]} />
  </ToonMesh>
);

/** Per-build geometry cache for `lower` parts (robes, skirts), so they aren't rebuilt every frame. */
const perBuild = <T,>(make: (b: Build) => T) => {
  const cache = new WeakMap<Build, T>();
  return (b: Build) => {
    let v = cache.get(b);
    if (!v) {
      v = make(b);
      cache.set(b, v);
    }
    return v;
  };
};
const lathe = (pts: [number, number][], depth: number) => {
  // Lathe normals face outward only when the profile runs bottom to top.
  const g = new THREE.LatheGeometry(
    pts
      .slice()
      .sort((p, q) => p[1] - q[1])
      .map(([r, y]) => new THREE.Vector2(r, y)),
    40,
  );
  g.scale(1, 1, depth);
  return g;
};

/* ---------- 1. The Orator ---------- */

const ORATOR_HAIR = "#5c4232";

/** Town-square speechmaker: brown frock coat, bow tie, curly hair, big curled handlebar. */
export const oratorLook: ToonLook = {
  jacket: "#4a3b31",
  cuff: "#f4f0e6",
  pants: "#3a2f28",
  shoes: "#2a2320",
  torso: (
    <>
      <SuitFront lapel="#3e3129" shirt="#f4f0e6" />
      {/* Bow tie */}
      {[-1, 1].map((s) => (
        <ToonMesh key={s} color="#2e2522" outline={P} position={[s * 0.065, 0.95, frontZ(0.95) + 0.04]} rotation={[0, 0, s * Math.PI / 2]}>
          <coneGeometry args={[0.05, 0.11, 10]} />
        </ToonMesh>
      ))}
      <InkMesh color="#2e2522" position={[0, 0.95, frontZ(0.95) + 0.045]}>
        <sphereGeometry args={[0.03, 10, 8]} />
      </InkMesh>
      {/* Second button: a frock coat closes higher */}
      <InkMesh position={[0, 0.55, frontZ(0.55) + 0.012]}>
        <sphereGeometry args={[0.024, 8, 6]} />
      </InkMesh>
    </>
  ),
  head: (
    <>
      <HairCap color={ORATOR_HAIR} tilt={-0.28} cover={1.05} />
      {/* Curls around the hairline and crown */}
      {[-1.3, -0.95, -0.6, -0.25, 0.1, 0.45, 0.8, 1.15].map((lon, i) => (
        <Puff key={`f${i}`} lat={0.62 + (i % 2) * 0.06} lon={lon} r={0.15} color={ORATOR_HAIR} />
      ))}
      {[1.55, 2.1, 2.65, 3.2, 3.75, 4.3, 4.75].map((lon, i) => (
        <Puff key={`b${i}`} lat={0.32 + (i % 2) * 0.1} lon={lon} r={0.16} color={ORATOR_HAIR} />
      ))}
      {[-1, 1].map((s) => (
        <Puff key={`s${s}`} lat={0.3} lon={s * 1.32} r={0.15} scale={[0.85, 1.15, 0.6]} color={ORATOR_HAIR} />
      ))}
      <Mustache geos={HANDLEBAR} color={ORATOR_HAIR} />
    </>
  ),
};

/* ---------- 2. The Tycoon ---------- */

const TYCOON_HAIR = "#3b2b22";
const GOLD = "#b39552";

/** Money man: tuxedo with satin lapels, bow tie, pocket square, watch chain, slicked hair, waxed mustache. */
export const tycoonLook: ToonLook = {
  jacket: "#2f2d33",
  cuff: "#f4f0e6",
  pants: "#2f2d33",
  shoes: "#1f1b1a",
  torso: (
    <>
      <SuitFront lapel="#46434c" shirt="#f4f0e6" />
      {[-1, 1].map((s) => (
        <ToonMesh key={s} color="#7a3a3a" outline={P} position={[s * 0.065, 0.95, frontZ(0.95) + 0.04]} rotation={[0, 0, s * Math.PI / 2]}>
          <coneGeometry args={[0.05, 0.11, 10]} />
        </ToonMesh>
      ))}
      <InkMesh color="#5e2b2c" position={[0, 0.95, frontZ(0.95) + 0.045]}>
        <sphereGeometry args={[0.03, 10, 8]} />
      </InkMesh>
      {/* Pocket square */}
      <ToonMesh color="#f4f0e6" outline={P} position={[0.24, 0.74, frontZ(0.74) + 0.01]} rotation={[0, 0, 0.15]}>
        <boxGeometry args={[0.1, 0.06, 0.02]} />
      </ToonMesh>
      {/* Gold watch chain across the waistcoat */}
      <InkMesh color={GOLD} position={[-0.13, 0.42, frontZ(0.42) + 0.016]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.11, 0.012, 6, 20, Math.PI]} />
      </InkMesh>
    </>
  ),
  head: (
    <>
      <HairCap color={TYCOON_HAIR} tilt={-0.32} cover={1.12} />
      {/* Slicked swoop over the forehead with a side part */}
      <ToonMesh color={TYCOON_HAIR} outline={P} position={[0.1, 0.5, 0.26]} rotation={[-0.5, 0, -0.25]} scale={[2.3, 0.6, 1.1]}>
        <sphereGeometry args={[0.18, 22, 16]} />
      </ToonMesh>
      <InkMesh color="#1f1714" {...onHead(0.78, -0.32, 0.04)} scale={[0.25, 1.6, 0.3]}>
        <sphereGeometry args={[0.08, 10, 8]} />
      </InkMesh>
      <Mustache geos={WAXED} color="#4a3628" />
    </>
  ),
};

/* ---------- 3. The Knight ---------- */

const STEEL = "#8f9299";
const STEEL_DARK = "#6f7279";
const STEEL_LIGHT = "#a9acb3";
const KNIGHT_HAIR = "#2e2724";

const tassets = perBuild((b) => {
  const w = b.torsoW;
  const top = b.hipY + 0.04;
  return lathe(
    [
      [0.001, top + 0.02],
      [0.4 * w, top + 0.02],
      [0.42 * w, top],
      [0.5 * w, top - 0.12],
      [0.55 * w, top - 0.24],
      [0.001, top - 0.24],
    ],
    b.torsoDepth + 0.08,
  );
});

/** Young knight: plate armor with a stacked gorget, pauldrons, a cloth tabard, blunt bob haircut. */
export const knightLook: ToonLook = {
  jacket: STEEL,
  sleeve: STEEL,
  cuff: STEEL_DARK,
  pants: STEEL_DARK,
  shoes: "#5b5e64",
  sole: "#3e4045",
  torso: (
    <>
      {/* Gorget rings */}
      {[0.96, 1.01, 1.06].map((y, i) => (
        <ToonMesh key={y} color={STEEL_LIGHT} outline={P} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.8, 1]}>
          <torusGeometry args={[0.2 - i * 0.025, 0.045, 10, 28]} />
        </ToonMesh>
      ))}
      {/* Pauldrons */}
      {[-1, 1].map((s) => (
        <ToonMesh key={s} color={STEEL_LIGHT} outline={P} position={[s * 0.33, 0.9, 0]} rotation={[0, 0, -s * 0.55]}>
          <sphereGeometry args={[0.2, 22, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </ToonMesh>
      ))}
      {/* Tabard with a cream cross */}
      <ToonMesh color="#7d4c38" outline={P} position={[0, 0.45, frontZ(0.45) + 0.004]} rotation={[-0.04, 0, 0]}>
        <boxGeometry args={[0.36, 0.78, 0.02]} />
      </ToonMesh>
      <ToonMesh color="#e6d9bc" outline={0} position={[0, 0.52, frontZ(0.52) + 0.018]}>
        <boxGeometry args={[0.07, 0.4, 0.01]} />
      </ToonMesh>
      <ToonMesh color="#e6d9bc" outline={0} position={[0, 0.6, frontZ(0.6) + 0.02]}>
        <boxGeometry args={[0.24, 0.07, 0.01]} />
      </ToonMesh>
      {/* Sword belt */}
      <ToonMesh color="#5a3f2e" outline={P} position={[0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.72, 1]}>
        <torusGeometry args={[torsoRadius(0.08) + 0.01, 0.035, 8, 36]} />
      </ToonMesh>
    </>
  ),
  lower: (b) => (
    <>
      <ToonMesh color={STEEL} outline={LINE.character} geometry={tassets(b)} />
      <ToonMesh color={STEEL_DARK} outline={P} position={[0, b.hipY - 0.12, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.8, 1]}>
        <torusGeometry args={[0.5 * b.torsoW, 0.022, 8, 40]} />
      </ToonMesh>
    </>
  ),
  head: (
    <>
      {/* Blunt bob: an open shell with the face cut out, plus a bangs cap */}
      <ToonMesh color={KNIGHT_HAIR} position={[0, 0.02, -0.01]}>
        <sphereGeometry args={[HEAD_R + 0.05, 40, 22, Math.PI / 2 + 0.95, Math.PI * 2 - 1.9, 0, 1.98]} />
      </ToonMesh>
      <ToonMesh color={KNIGHT_HAIR} position={[0, 0.01, 0]}>
        <sphereGeometry args={[HEAD_R + 0.04, 40, 14, 0, Math.PI * 2, 0, 1.02]} />
      </ToonMesh>
    </>
  ),
};

/* ---------- 4. The Astronomer ---------- */

const ROBE = "#3d3646";
const BEARD = "#7a5a40";

const robeSkirt = perBuild((b) => {
  const w = b.torsoW;
  const top = b.hipY + 0.1;
  return lathe(
    [
      [0.001, top],
      [0.4 * w, top],
      [0.43 * w, top - 0.15],
      [0.5, 0.06],
      [0.53, 0.0],
      [0.001, 0.0],
    ],
    0.85,
  );
});

/** Pleated ruff: a torus with its outer edge rippled. */
const RUFF = (() => {
  const g = new THREE.TorusGeometry(0.22, 0.075, 14, 120);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const z = p.getZ(i);
    const a = Math.atan2(y, x);
    const k = 1 + 0.08 * Math.sin(a * 28);
    p.setXYZ(i, x * k, y * k, z * (1 + 0.3 * Math.sin(a * 28)));
  }
  g.computeVertexNormals();
  return g;
})();

/** Scholar: plum robe to the floor, pleated ruff, bald crown with side tufts, forked beard, drooping mustache. */
export const astronomerLook: ToonLook = {
  jacket: ROBE,
  cuff: "#e6d9bc",
  pants: ROBE,
  shoes: "#5a3f2e",
  torso: (
    <>
      <ToonMesh color="#f1ede0" outline={P} geometry={RUFF} position={[0, 1.0, 0]} rotation={[Math.PI / 2, 0, 0]} />
      {[-1, 1].map((s) => (
        <ToonMesh key={s} color={GOLD} outline={0} position={[s * 0.09, 0.45, frontZ(0.45) + 0.004]}>
          <boxGeometry args={[0.035, 0.9, 0.02]} />
        </ToonMesh>
      ))}
    </>
  ),
  lower: (b) => (
    <>
      <ToonMesh color={ROBE} outline={LINE.character} geometry={robeSkirt(b)} />
      <ToonMesh color={GOLD} outline={P} position={[0, 0.07, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.85, 1]}>
        <torusGeometry args={[0.5, 0.02, 8, 40]} />
      </ToonMesh>
    </>
  ),
  head: (
    <>
      {/* Side tufts and back fringe on a bald crown */}
      {[-1, 1].map((s) => (
        <Puff key={s} lat={0.08} lon={s * 1.32} r={0.17} scale={[0.75, 1.2, 0.7]} color="#b49a7a" />
      ))}
      {[2.0, 2.6, 3.2, 3.8, 4.3].map((lon, i) => (
        <Puff key={`b${i}`} lat={0.05} lon={lon} r={0.17} scale={[1.1, 0.8, 0.6]} color="#b49a7a" />
      ))}
      {/* Full beard with two forks */}
      <ToonMesh color={BEARD} outline={P} position={[0, -0.3, 0.17]} scale={[1.18, 0.92, 0.95]}>
        <sphereGeometry args={[0.44, 28, 20]} />
      </ToonMesh>
      {[-1, 1].map((s) => (
        <ToonMesh key={s} color={BEARD} outline={P} position={[s * 0.12, -0.72, 0.36]} rotation={[Math.PI + 0.25, 0, s * 0.2]}>
          <coneGeometry args={[0.11, 0.32, 14]} />
        </ToonMesh>
      ))}
      <Mustache geos={WALRUS} color="#9a7656" />
    </>
  ),
};

/* ---------- Signature props (world space, posed by where the palm goes) ---------- */

/** Arming sword standing on its tip. Origin at the floor under the blade. Grip center at y = 0.72. */
export const PlantedSword: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    <ToonMesh color="#d9d9d4" outline={P} position={[0, 0.31, 0]}>
      <boxGeometry args={[0.07, 0.62, 0.02]} />
    </ToonMesh>
    <ToonMesh color={GOLD} outline={P} position={[0, 0.64, 0]}>
      <boxGeometry args={[0.32, 0.045, 0.06]} />
    </ToonMesh>
    <ToonMesh color="#5a3f2e" outline={P} position={[0, 0.72, 0]}>
      <cylinderGeometry args={[0.028, 0.028, 0.14, 10]} />
    </ToonMesh>
    <ToonMesh color={GOLD} outline={P} position={[0, 0.82, 0]}>
      <sphereGeometry args={[0.045, 12, 10]} />
    </ToonMesh>
  </group>
);

/** Small hand-held globe with olive continents and a brass meridian. */
export const Globe: React.FC<{ position: [number, number, number]; spin?: number; r?: number }> = ({ position, spin = 0, r = 0.16 }) => (
  <group position={position} rotation={[0, 0, 0.4]}>
    <group rotation={[0, spin, 0]}>
      <ToonMesh color="#62798a" outline={P}>
        <sphereGeometry args={[r, 28, 20]} />
      </ToonMesh>
      {[
        [0.4, 0.3, 1.2],
        [-0.2, 1.4, 1.0],
        [0.1, 2.6, 1.4],
        [-0.5, 3.9, 0.9],
        [0.6, 4.8, 0.8],
      ].map(([lat, lon, s], i) => (
        <ToonMesh
          key={i}
          color="#7c8656"
          outline={0}
          position={[Math.sin(lon) * Math.cos(lat) * r * 0.93, Math.sin(lat) * r * 0.93, Math.cos(lon) * Math.cos(lat) * r * 0.93]}
          scale={[s, s * 0.8, s]}
        >
          <sphereGeometry args={[r * 0.38, 12, 10]} />
        </ToonMesh>
      ))}
    </group>
    <ToonMesh color={GOLD} outline={0} rotation={[0, Math.PI / 2, 0]}>
      <torusGeometry args={[r + 0.03, 0.01, 6, 36]} />
    </ToonMesh>
  </group>
);

/** Cinched money bag. Origin on the floor. */
export const MoneyBag: React.FC<{ position: [number, number, number]; scale?: number; rotation?: number }> = ({
  position,
  scale = 1,
  rotation = 0,
}) => (
  <group position={position} scale={scale} rotation={[0, rotation, 0]}>
    <ToonMesh color="#e6d9bc" outline={P} position={[0, 0.25, 0]} scale={[1, 0.85, 0.95]}>
      <sphereGeometry args={[0.3, 24, 18]} />
    </ToonMesh>
    <ToonMesh color="#e6d9bc" outline={P} position={[0, 0.54, 0]}>
      <cylinderGeometry args={[0.05, 0.1, 0.12, 14]} />
    </ToonMesh>
    <ToonMesh color="#5a3f2e" outline={0} position={[0, 0.55, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.06, 0.018, 8, 20]} />
    </ToonMesh>
    <ToonMesh color="#e6d9bc" outline={P} position={[0, 0.65, 0]} rotation={[Math.PI, 0, 0]}>
      <coneGeometry args={[0.09, 0.1, 12]} />
    </ToonMesh>
    {/* Ink dollar sign: an S of two arcs and a bar */}
    <group position={[0, 0.27, 0.27]}>
      <InkMesh color="#a8946c" position={[0, 0.045, 0]}>
        <torusGeometry args={[0.045, 0.012, 6, 16, Math.PI * 1.4]} />
      </InkMesh>
      <InkMesh color="#a8946c" position={[0, -0.045, 0]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.045, 0.012, 6, 16, Math.PI * 1.4]} />
      </InkMesh>
      <InkMesh color="#a8946c">
        <boxGeometry args={[0.012, 0.24, 0.01]} />
      </InkMesh>
    </group>
  </group>
);

/** Stack of banknotes with a paper band. Origin on the floor. */
export const NoteStack: React.FC<{ position: [number, number, number]; rotation?: number }> = ({ position, rotation = 0 }) => (
  <group position={position} rotation={[0, rotation, 0]}>
    <ToonMesh color="#7c8656" outline={P} position={[0, 0.05, 0]}>
      <boxGeometry args={[0.3, 0.1, 0.15]} />
    </ToonMesh>
    <ToonMesh color="#e6d9bc" outline={0} position={[0, 0.05, 0]}>
      <boxGeometry args={[0.07, 0.104, 0.154]} />
    </ToonMesh>
  </group>
);
