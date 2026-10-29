import type { ThreeElements } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { qaRegisterHand, qaUnregisterHand } from "../../toon/qa";
import { InkMesh, LINE, PALETTE, ReceiveShadow, SKIN_GRADIENT, ToonMesh } from "../../toon/toon";

/** Head radius. The same in every build: builds change the body, never the head. */
export const HEAD_R = 0.62;

/**
 * Body proportions. Two builds share one rig:
 * - `chibi` (the standard for new videos): squat body, about 2.25 units tall,
 *   head roughly 55% of the height.
 * - `tall` (the Nokia videos, BigLaunch, FounderStill): about 3.2 units tall.
 *
 * Torso details in a look (`torso`) are authored once in the tall torso's design
 * space (use `frontZ(y)`); the chibi build squashes that whole group by
 * `torsoH` / `torsoW`, so the same look works on both builds.
 */
export type Build = {
  /** Hip pivot height above the feet. */
  hipY: number;
  /** Torso scale applied to the lathe and the look's torso details. */
  torsoW: number;
  torsoH: number;
  torsoDepth: number;
  /** Torso space (origin at hips), already scaled. */
  shoulderX: number;
  shoulderY: number;
  neckY: number;
  neckH: number;
  upperArm: number;
  forearm: number;
  /** Sleeve radius at the shoulder / wrist. */
  armR: [number, number];
  /** Leg radius at the hip / ankle, leg x offset, knee height. */
  legR: [number, number];
  legX: number;
  kneeY: number;
  headR: number;
  /** Default arm pose when none is given. */
  relaxed: FKArm;
  /** Defaults for the contact helpers in src/toon/contact.ts. */
  contact: { shakeY: number; carryY: number; carryForward: number; carryHalfWidth: number; restOut: number; restForward: number; restY: number };
};

export const BUILDS: Record<"tall" | "chibi", Build> = {
  tall: {
    hipY: 0.9,
    torsoW: 1,
    torsoH: 1,
    torsoDepth: 0.72,
    shoulderX: 0.3,
    shoulderY: 0.9,
    neckY: 1.08,
    neckH: 0.18,
    upperArm: 0.5,
    forearm: 0.46,
    armR: [0.13, 0.095],
    legR: [0.155, 0.115],
    legX: 0.17,
    kneeY: 0.52,
    headR: HEAD_R,
    relaxed: { forward: 0.04, out: 0.12, elbow: 0.15 },
    contact: { shakeY: 1.5, carryY: 1.42, carryForward: 0.5, carryHalfWidth: 0.38, restOut: 0.42, restForward: 0.1, restY: 0.8 },
  },
  chibi: {
    hipY: 0.42,
    torsoW: 1.12,
    torsoH: 0.56,
    torsoDepth: 0.72,
    shoulderX: 0.34,
    shoulderY: 0.5,
    neckY: 0.6,
    neckH: 0.1,
    upperArm: 0.27,
    forearm: 0.25,
    armR: [0.115, 0.088],
    legR: [0.15, 0.12],
    legX: 0.18,
    kneeY: 0.3,
    headR: HEAD_R,
    relaxed: { forward: 0.05, out: 0.3, elbow: 0.12 },
    contact: { shakeY: 0.76, carryY: 0.7, carryForward: 0.46, carryHalfWidth: 0.33, restOut: 0.5, restForward: 0.08, restY: 0.36 },
  },
};

export type BuildName = keyof typeof BUILDS;
/** The standard build for new work. */
export const DEFAULT_BUILD: BuildName = "chibi";

/** Tall-build proportions, kept for code written before builds existed. Prefer `BUILDS[build]`. */
export const BODY = BUILDS.tall;

/** Arm posed by joint angles (forward kinematics). Fine for free gestures. */
export type FKArm = {
  forward: number;
  out: number;
  elbow: number;
  twist?: number;
  wrist?: number;
  inward?: number;
};

/**
 * Arm posed by WHERE THE PALM SHOULD BE (inverse kinematics). Use this for every
 * contact: keyboards, handshakes, carried boxes, railings, tables. The rig
 * solves the elbow so the palm lands exactly on `reach`.
 */
export type ReachArm = {
  /** Palm-center target. Torso space by default (origin at hips), world space with `world: true`. */
  reach: [number, number, number];
  world?: boolean;
  /** Direction the thumb should point (same space as `reach`). Default: forward. */
  thumb?: [number, number, number];
  /** Direction the elbow bends toward (torso space). Default: down, back and out. */
  pole?: [number, number, number];
};

export type ArmPose = FKArm | ReachArm;
export const isReach = (a: ArmPose): a is ReachArm => "reach" in a;

export type ToonPose = {
  right: ArmPose;
  left: ArmPose;
  lean?: number;
  shoulderShift?: number;
  headTilt?: number;
  headTurn?: number;
  headNod?: number;
  browR?: number;
  browL?: number;
  browSlant?: number;
  blink?: number;
  mouth?: number;
};

export type ToonLook = {
  jacket: string;
  sleeve?: string;
  cuff?: string;
  pants: string;
  shoes: string;
  sole?: string;
  /** Torso-space details (origin at hips). Use `frontZ(y)` to sit on the chest. */
  torso?: React.ReactNode;
  /** Head-space details (origin at head center). */
  head?: React.ReactNode;
  /**
   * Character-space details that hang from the hips and don't lean with the
   * body (feet at y=0): robes, armor skirts, long coats. Gets the build so it
   * can reach the floor.
   */
  lower?: (b: Build) => React.ReactNode;
};

/** Relaxed arm for the tall build. Each build has its own: `BUILDS[build].relaxed`. */
export const RELAXED: FKArm = { forward: 0.04, out: 0.12, elbow: 0.15 };

/* ---------- Torso: one smooth lathe, tapered, sloping into the shoulders ---------- */
const PROFILE = new THREE.SplineCurve(
  [
    [0.001, -0.14],
    [0.4, -0.14],
    [0.41, 0.06],
    [0.37, 0.42],
    [0.365, 0.7],
    [0.35, 0.86],
    [0.28, 0.98],
    [0.15, 1.05],
    [0.001, 1.07],
  ].map(([x, y]) => new THREE.Vector2(x, y)),
).getPoints(48);

const TORSO_GEOMETRY = new THREE.LatheGeometry(PROFILE, 40);

/** Torso radius at height y (torso space), read from the lathe profile. */
export const torsoRadius = (y: number) => {
  for (let i = 1; i < PROFILE.length; i++) {
    const a = PROFILE[i - 1];
    const b = PROFILE[i];
    if ((y - a.y) * (y - b.y) <= 0 && a.y !== b.y) {
      return a.x + ((y - a.y) / (b.y - a.y)) * (b.x - a.x);
    }
  }
  return 0.36;
};
/** Chest surface z at height y (torso space). */
export const frontZ = (y: number) => torsoRadius(y) * BUILDS.tall.torsoDepth + 0.004;

/* ---------- Limbs: a tapered tube along a smooth curve (no visible joints) ---------- */
const tubeGeometry = (points: THREE.Vector3[], r0: number, r1: number, radial = 16, segs = 28) => {
  const curve = new THREE.CatmullRomCurve3(points, false, "centripetal");
  const frames = curve.computeFrenetFrames(segs, false);
  const pos: number[] = [];
  const idx: number[] = [];
  const v = new THREE.Vector3();
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const p = curve.getPointAt(t);
    const r = r0 + (r1 - r0) * t;
    const n = frames.normals[i];
    const b = frames.binormals[i];
    for (let j = 0; j < radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      v.copy(p).addScaledVector(n, Math.cos(a) * r).addScaledVector(b, Math.sin(a) * r);
      pos.push(v.x, v.y, v.z);
    }
  }
  for (let i = 0; i < segs; i++) {
    for (let j = 0; j < radial; j++) {
      const a = i * radial + j;
      const bb = (i + 1) * radial + j;
      const c = (i + 1) * radial + ((j + 1) % radial);
      const d = i * radial + ((j + 1) % radial);
      idx.push(a, d, bb, bb, d, c);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
};

const Limb: React.FC<{ points: THREE.Vector3[]; r0: number; r1: number; color: string }> = ({
  points,
  r0,
  r1,
  color,
}) => {
  const key = points.map((p) => p.toArray().map((n) => n.toFixed(4)).join(",")).join("|");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const geo = useMemo(() => tubeGeometry(points, r0, r1), [key, r0, r1]);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <>
      <ToonMesh color={color} geometry={geo} />
      <ToonMesh color={color} outline={0} position={points[0]}>
        <sphereGeometry args={[r0, 16, 12]} />
      </ToonMesh>
      <ToonMesh color={color} outline={0} position={points[points.length - 1]}>
        <sphereGeometry args={[r1, 16, 12]} />
      </ToonMesh>
    </>
  );
};

/* ---------- Arm forward kinematics ---------- */
const ONE = new THREE.Vector3(1, 1, 1);
const compose = (p: THREE.Vector3, e: THREE.Euler) =>
  new THREE.Matrix4().compose(p, new THREE.Quaternion().setFromEuler(e), ONE);

const armChain = (side: 1 | -1, pose: FKArm, b: Build) => {
  const S = new THREE.Vector3(side * b.shoulderX, b.shoulderY, 0);
  const m1 = compose(S, new THREE.Euler(-pose.forward, 0, side * pose.out));
  const E = new THREE.Vector3(0, -b.upperArm, 0).applyMatrix4(m1);
  const m2 = m1
    .clone()
    .multiply(
      compose(
        new THREE.Vector3(0, -b.upperArm, 0),
        new THREE.Euler(-pose.elbow, side * (pose.twist ?? 0), -side * (pose.inward ?? 0)),
      ),
    );
  const W = new THREE.Vector3(0, -b.forearm, 0).applyMatrix4(m2);
  const m3 = m2.clone().multiply(compose(new THREE.Vector3(0, -b.forearm, 0), new THREE.Euler(-(pose.wrist ?? 0), 0, 0)));
  const hp = new THREE.Vector3();
  const hq = new THREE.Quaternion();
  m3.decompose(hp, hq, new THREE.Vector3());
  // Start the sleeve slightly inside the shoulder so it flows out of the torso.
  const S0 = new THREE.Vector3(side * (b.shoulderX - 0.1), b.shoulderY + 0.05, 0);
  return { points: [S0, S, E, W], handPos: hp, handQuat: hq };
};

/** Distance from wrist to palm center along the hand. */
const PALM = 0.1;

/** Two-bone IK: shoulder → elbow → wrist, palm landing on the target. */
const reachChain = (side: 1 | -1, pose: ReachArm, toTorso: THREE.Matrix4, b: Build) => {
  const S = new THREE.Vector3(side * b.shoulderX, b.shoulderY, 0);
  const T = new THREE.Vector3(...pose.reach);
  const toLocalDir = (v: [number, number, number]) => {
    const d = new THREE.Vector3(...v);
    if (pose.world) d.transformDirection(toTorso);
    return d.normalize();
  };
  if (pose.world) T.applyMatrix4(toTorso);
  const L1 = b.upperArm;
  const L2 = b.forearm + PALM;
  const toT = T.clone().sub(S);
  const dist = toT.length();
  const d = THREE.MathUtils.clamp(dist, Math.abs(L1 - L2) + 1e-3, L1 + L2 - 1e-3);
  const dir = dist > 1e-6 ? toT.divideScalar(dist) : new THREE.Vector3(0, -1, 0);
  const Tc = S.clone().addScaledVector(dir, d);
  const a = (L1 * L1 - L2 * L2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
  const pole = new THREE.Vector3(...(pose.pole ?? [side * 0.45, -0.6, -0.65])).normalize();
  let perp = pole.clone().addScaledVector(dir, -pole.dot(dir));
  if (perp.lengthSq() < 1e-6) perp = new THREE.Vector3(0, -1, 0).addScaledVector(dir, dir.y);
  perp.normalize();
  const E = S.clone().addScaledVector(dir, a).addScaledVector(perp, h);
  const W = E.clone().addScaledVector(Tc.clone().sub(E).normalize(), b.forearm);
  // Hand frame: +y points back up the forearm (fingers run along -y), +z is the thumb side.
  const y = E.clone().sub(W).normalize();
  const hint = pose.thumb ? toLocalDir(pose.thumb) : new THREE.Vector3(-side * 0.2, 0.3, 1).normalize();
  let z = hint.clone().addScaledVector(y, -hint.dot(y));
  if (z.lengthSq() < 1e-6) z = new THREE.Vector3(0, 0, 1);
  z.normalize();
  const x = new THREE.Vector3().crossVectors(y, z).normalize();
  const handQuat = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
  const S0 = new THREE.Vector3(side * (b.shoulderX - 0.1), b.shoulderY + 0.05, 0);
  return { points: [S0, S, E, W], handPos: W, handQuat };
};

const Arm: React.FC<{
  side: 1 | -1;
  pose: ArmPose;
  sleeve: string;
  cuff?: string;
  held?: React.ReactNode;
  toTorso: THREE.Matrix4;
  qaName: string;
  build: Build;
}> = ({ side, pose, sleeve, cuff, held, toTorso, qaName, build }) => {
  const { points, handPos, handQuat } = isReach(pose) ? reachChain(side, pose, toTorso, build) : armChain(side, pose, build);
  const handRef = useRef<THREE.Group>(null);
  const qaId = useRef(`hand-${Math.random().toString(36).slice(2)}`).current;
  // Report the palm position every render for contact QA.
  useLayoutEffect(() => {
    const g = handRef.current;
    if (!g) return;
    g.updateWorldMatrix(true, false);
    qaRegisterHand(qaId, `${qaName}.${side === -1 ? "right" : "left"}`, new THREE.Vector3(0, -PALM, 0).applyMatrix4(g.matrixWorld));
  });
  useLayoutEffect(() => () => void qaUnregisterHand(qaId), [qaId]);
  return (
    <group>
      <Limb points={points} r0={build.armR[0]} r1={build.armR[1]} color={sleeve} />
      <group ref={handRef} position={handPos} quaternion={handQuat}>
        {cuff ? (
          <ToonMesh color={cuff} outline={LINE.prop} position={[0, 0.01, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.05, 16]} />
          </ToonMesh>
        ) : null}
        {/* Small mitten hand with a thumb */}
        <ToonMesh color={PALETTE.skin} gradient={SKIN_GRADIENT} outline={LINE.prop} position={[0, -0.1, 0]} scale={[0.62, 1.15, 0.9]}>
          <sphereGeometry args={[0.1, 18, 14]} />
        </ToonMesh>
        <ToonMesh color={PALETTE.skin} gradient={SKIN_GRADIENT} outline={LINE.prop} position={[0, -0.075, 0.085]} rotation={[0.55, 0, 0]}>
          <capsuleGeometry args={[0.037, 0.07, 4, 10]} />
        </ToonMesh>
        {/* Held prop: hand space, -y runs from the wrist out past the fingers, +z is the thumb side */}
        {held}
      </group>
    </group>
  );
};

/* ---------- Head + face (same look as the town-square cast) ---------- */
export const onHead = (lat: number, lon: number, lift = 0) => {
  const dir = new THREE.Vector3(Math.sin(lon) * Math.cos(lat), Math.sin(lat), Math.cos(lon) * Math.cos(lat));
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
  return {
    position: dir.multiplyScalar(HEAD_R + lift).toArray() as [number, number, number],
    quaternion: q,
  };
};

const Face: React.FC<{ pose: ToonPose }> = ({ pose }) => {
  const open = 1 - (pose.blink ?? 0);
  const mouth = pose.mouth ?? 0;
  const slant = pose.browSlant ?? 0;
  return (
    <group>
      {/* Half-lidded eyes: dot with the top cut flat by a heavy lid line, plus a tiny catchlight */}
      {([-1, 1] as const).map((s) => {
        const e = onHead(0.03, s * 0.25, 0.004);
        return (
          <group key={`eye${s}`} position={e.position} quaternion={e.quaternion}>
            <group scale={[1, 1.15 * open + 0.06, 0.4]}>
              <InkMesh>
                <sphereGeometry args={[0.05, 16, 12, 0, Math.PI * 2, 0.95, Math.PI - 0.95]} />
              </InkMesh>
            </group>
            <InkMesh position={[0, 0.03 * open + 0.004, 0.014]}>
              <boxGeometry args={[0.13, 0.017, 0.012]} />
            </InkMesh>
            {open > 0.5 ? (
              <InkMesh color="#fffdf7" position={[s * 0.014, -0.006, 0.022]}>
                <sphereGeometry args={[0.011, 8, 6]} />
              </InkMesh>
            ) : null}
          </group>
        );
      })}
      {/* Tapered, rounded eyebrows */}
      {([-1, 1] as const).map((s) => {
        const raise = s === 1 ? (pose.browL ?? 0) : (pose.browR ?? 0);
        const p = onHead(0.25 + raise * 0.06, s * 0.26, 0.02);
        return (
          <group key={`brow${s}`} position={p.position} quaternion={p.quaternion}>
            <group rotation={[0, 0, -s * slant * 0.3 + s * raise * 0.12]}>
              <InkMesh rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.6]}>
                <capsuleGeometry args={[0.022, 0.14, 4, 10]} />
              </InkMesh>
              <InkMesh position={[s * -0.075, -0.003, 0]} scale={[1, 1, 0.6]}>
                <sphereGeometry args={[0.026, 10, 8]} />
              </InkMesh>
            </group>
          </group>
        );
      })}
      {mouth > 0.08 ? (
        <InkMesh {...onHead(-0.3, 0, 0.004)} scale={[1.2, 0.3 + mouth * 0.8, 0.4]}>
          <sphereGeometry args={[0.06, 12, 10]} />
        </InkMesh>
      ) : (
        /* Small, slightly downturned mouth line */
        <group {...onHead(-0.3, 0, 0.01)}>
          <InkMesh position={[0, -0.2, 0]} rotation={[0, 0, Math.PI / 2 - 0.28]}>
            <torusGeometry args={[0.2, 0.011, 6, 18, 0.56]} />
          </InkMesh>
        </group>
      )}
    </group>
  );
};

/** Small ears on the sides of the head. */
const Ears: React.FC = () => (
  <>
    {([-1, 1] as const).map((s) => (
      <ToonMesh key={s} color={PALETTE.skin} gradient={SKIN_GRADIENT} outline={LINE.prop} {...onHead(-0.02, s * 1.5, 0.025)} scale={[0.7, 1, 0.5]}>
        <sphereGeometry args={[0.1, 16, 12]} />
      </ToonMesh>
    ))}
  </>
);

/**
 * Smooth-bodied toon character: round pale head, tapered lathe torso,
 * one-piece tube limbs. Feet at local y=0, faces +z.
 */
export const ToonPerson: React.FC<
  ThreeElements["group"] & {
    look: ToonLook;
    pose?: Partial<ToonPose>;
    /** Props held in the character's own right / left hand (hand space). */
    rightHand?: React.ReactNode;
    leftHand?: React.ReactNode;
    /** Body proportions. Defaults to the standard chibi build; the Nokia videos pin "tall". */
    build?: BuildName;
  }
> = ({ look, pose: p = {}, rightHand, leftHand, build = DEFAULT_BUILD, ...props }) => {
  const b = BUILDS[build];
  const pose: ToonPose = { right: b.relaxed, left: b.relaxed, ...p };
  const sleeve = look.sleeve ?? look.jacket;
  const qaName = (props.name as string | undefined) ?? "character";
  // World → torso transform, so reach targets can be given in world space.
  const toTorso = (() => {
    const pos = new THREE.Vector3(...((props.position as [number, number, number] | undefined) ?? [0, 0, 0]));
    const rot = (props.rotation as [number, number, number] | undefined) ?? [0, 0, 0];
    const sc = props.scale;
    const scale = typeof sc === "number" ? new THREE.Vector3(sc, sc, sc) : new THREE.Vector3(...((sc as [number, number, number] | undefined) ?? [1, 1, 1]));
    const person = new THREE.Matrix4().compose(pos, new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot)), scale);
    const hip = new THREE.Matrix4().compose(
      new THREE.Vector3(0, b.hipY, 0),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(pose.lean ?? 0, 0, pose.shoulderShift ?? 0)),
      new THREE.Vector3(1, 1, 1),
    );
    return person.multiply(hip).invert();
  })();
  return (
    <ReceiveShadow.Provider value={false}>
      <group {...props}>
        {/* Legs + shoes */}
        {([-1, 1] as const).map((s) => (
          <group key={s}>
            <Limb
              points={[
                new THREE.Vector3(s * b.legX, b.hipY + 0.05, 0),
                new THREE.Vector3(s * b.legX, b.kneeY, 0.015),
                new THREE.Vector3(s * b.legX, 0.14, 0),
              ]}
              r0={b.legR[0]}
              r1={b.legR[1]}
              color={look.pants}
            />
            {/* Trouser hem */}
            <ToonMesh color={look.pants} outline={LINE.prop} position={[s * b.legX, 0.2, 0]}>
              <cylinderGeometry args={[b.legR[1] + 0.013, b.legR[1] + 0.017, 0.06, 16]} />
            </ToonMesh>
            {/* Shoe: rounded upper, flat sole, small heel */}
            <group position={[s * (b.legX + 0.01), 0, 0.08]}>
              <ToonMesh color={look.shoes} position={[0, 0.12, 0.02]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.72]}>
                <capsuleGeometry args={[0.115, 0.22, 4, 14]} />
              </ToonMesh>
              <ToonMesh color={look.sole ?? "#2a2320"} outline={LINE.background} position={[0, 0.03, 0.02]} scale={[1, 0.3, 1]}>
                <capsuleGeometry args={[0.122, 0.26, 4, 14]} />
              </ToonMesh>
              <ToonMesh color={look.sole ?? "#2a2320"} outline={LINE.background} position={[0, 0.06, -0.17]}>
                <boxGeometry args={[0.2, 0.08, 0.12]} />
              </ToonMesh>
            </group>
          </group>
        ))}

        {look.lower ? look.lower(b) : null}

        {/* Upper body pivots at the hips */}
        <group position={[0, b.hipY, 0]} rotation={[pose.lean ?? 0, 0, pose.shoulderShift ?? 0]}>
          {/* Torso + the look's torso details, authored in tall design space and scaled per build */}
          <group scale={[b.torsoW, b.torsoH, b.torsoW]}>
            <ToonMesh color={look.jacket} geometry={TORSO_GEOMETRY} scale={[1, 1, b.torsoDepth]} />
            {look.torso}
          </group>
          <Arm side={-1} pose={pose.right} sleeve={sleeve} cuff={look.cuff} held={rightHand} toTorso={toTorso} qaName={qaName} build={b} />
          <Arm side={1} pose={pose.left} sleeve={sleeve} cuff={look.cuff} held={leftHand} toTorso={toTorso} qaName={qaName} build={b} />
          <ToonMesh color={PALETTE.skin} gradient={SKIN_GRADIENT} outline={LINE.prop} position={[0, b.neckY, 0]}>
            <cylinderGeometry args={[0.12, 0.14, b.neckH, 18]} />
          </ToonMesh>
          <group position={[0, b.neckY + 0.04, 0]} rotation={[pose.headNod ?? 0, pose.headTurn ?? 0, pose.headTilt ?? 0]}>
            <group position={[0, b.headR * 0.9, 0]}>
              <ToonMesh color={PALETTE.skin} gradient={SKIN_GRADIENT}>
                <sphereGeometry args={[b.headR, 40, 30]} />
              </ToonMesh>
              <Ears />
              <Face pose={pose} />
              {look.head}
            </group>
          </group>
        </group>
      </group>
    </ReceiveShadow.Provider>
  );
};
