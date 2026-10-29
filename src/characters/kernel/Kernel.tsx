import type { ThreeElements } from "@react-three/fiber";
import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { INK, InkMesh, LINE, ReceiveShadow, ToonMesh } from "../../toon/toon";

/** Shared Kernel proportions and signature colors (matches the character sheet). */
export const KERNEL = {
  skin: "#E8C9A0",
  dot: "#2EC4B6",
  headW: 0.82,
  headH: 1.0,
  headD: 0.78,
  /** Front face plane in head-local space. */
  faceZ: 0.39,
  /** Torso space: origin at the hips. */
  hipY: 1.35,
  torsoH: 1.05,
  torsoW: 0.86,
  torsoD: 0.5,
  shoulderX: 0.41,
  shoulderY: 0.89,
  upperArm: 0.52,
  forearm: 0.46,
  legX: 0.2,
} as const;

/**
 * Rounded-rect head: flat front face (so features sit flush), rounder at the
 * top than the bottom, soft beveled edges.
 */
const HEAD_GEOMETRY = (() => {
  const bevel = 0.09;
  const rTop = 0.26;
  const rBot = 0.17;
  const W = KERNEL.headW - 2 * bevel;
  const H = KERNEL.headH - 2 * bevel;
  const x0 = -W / 2;
  const y0 = -H / 2;
  const s = new THREE.Shape();
  s.moveTo(x0 + rBot, y0);
  s.lineTo(x0 + W - rBot, y0);
  s.absarc(x0 + W - rBot, y0 + rBot, rBot, -Math.PI / 2, 0, false);
  s.lineTo(x0 + W, y0 + H - rTop);
  s.absarc(x0 + W - rTop, y0 + H - rTop, rTop, 0, Math.PI / 2, false);
  s.lineTo(x0 + rTop, y0 + H);
  s.absarc(x0 + rTop, y0 + H - rTop, rTop, Math.PI / 2, Math.PI, false);
  s.lineTo(x0, y0 + rBot);
  s.absarc(x0 + rBot, y0 + rBot, rBot, Math.PI, Math.PI * 1.5, false);
  const depth = KERNEL.headD - 2 * bevel;
  const g = new THREE.ExtrudeGeometry(s, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 6,
    curveSegments: 20,
  });
  g.translate(0, 0, -depth / 2);
  // Weld the extrude seams so shading and outlines have no scratchy edges.
  g.deleteAttribute("uv");
  g.deleteAttribute("normal");
  const welded = mergeVertices(g, 1e-4);
  welded.computeVertexNormals();
  return welded;
})();

/** Torso is an elliptical cylinder: radius 0.43 (top) / 0.39 (hips), squashed front-to-back. */
export const TORSO_DEPTH = 0.62;
/** Torso radius at height y (torso space). */
export const torsoR = (y: number) => 0.39 + (0.04 * y) / KERNEL.torsoH;
/** Torso front surface z at height y (torso space). */
export const chestZ = (y: number) => torsoR(y) * TORSO_DEPTH + 0.004;

export type ArmPose = {
  /** Raise toward the camera (radians). */
  forward: number;
  /** Raise out to the side (radians). */
  out: number;
  /** Elbow bend, forearm folding forward (radians). */
  elbow: number;
  /** Forearm twist around its own axis, turns the palm (radians). */
  twist?: number;
  /** Wrist flex (radians). */
  wrist?: number;
  /** Swing the forearm inward across the body (radians). */
  inward?: number;
};

export type KernelPose = {
  /** Character's own right arm (screen left when facing camera). */
  right: ArmPose;
  left: ArmPose;
  /** Upper-body lean toward the camera (radians). */
  lean?: number;
  /** Upper-body roll (radians). */
  shoulderShift?: number;
  headTilt?: number;
  headTurn?: number;
  headNod?: number;
  /** Eyebrow raise, -1 (furrowed) .. 1 (raised). */
  browR?: number;
  browL?: number;
  /** Inner-end slant: positive = worried, negative = stern. */
  browSlant?: number;
  /** 0 open .. 1 closed. */
  blink?: number;
  /** Heavy-lidded deadpan eyes. */
  lids?: boolean;
  /** 0 closed .. 1 wide open. */
  mouth?: number;
};

export type KernelLook = {
  top: string;
  sleeve?: string;
  cuff?: string;
  bottom: string;
  shoes: string;
  /** Extra clothing in torso space (origin at hips, +y up, +z front). */
  torso?: React.ReactNode;
  /** Hair / hats / glasses in head space (origin at head center). */
  head?: React.ReactNode;
  /** Props held in torso space (laptop etc). */
  held?: React.ReactNode;
  /** Shoe details in foot space (origin at foot, on the ground). */
  shoe?: React.ReactNode;
};

export const RELAXED: ArmPose = { forward: 0.02, out: 0.07, elbow: 0.1 };

const HAND_LINE = LINE.prop;

const Arm: React.FC<{ side: 1 | -1; pose: ArmPose; sleeve: string; cuff?: string }> = ({
  side,
  pose,
  sleeve,
  cuff,
}) => (
  <group position={[side * KERNEL.shoulderX, KERNEL.shoulderY, 0]} rotation={[-pose.forward, 0, side * pose.out]}>
    {/* Shoulder */}
    <ToonMesh color={sleeve}>
      <sphereGeometry args={[0.125, 20, 16]} />
    </ToonMesh>
    <ToonMesh color={sleeve} position={[0, -KERNEL.upperArm / 2, 0]}>
      <capsuleGeometry args={[0.11, KERNEL.upperArm - 0.12, 4, 14]} />
    </ToonMesh>
    {/* Elbow */}
    <group
      position={[0, -KERNEL.upperArm, 0]}
      rotation={[-pose.elbow, side * (pose.twist ?? 0), -side * (pose.inward ?? 0)]}
    >
      <ToonMesh color={sleeve} outline={LINE.prop}>
        <sphereGeometry args={[0.105, 16, 12]} />
      </ToonMesh>
      <ToonMesh color={sleeve} position={[0, -KERNEL.forearm / 2, 0]}>
        <capsuleGeometry args={[0.1, KERNEL.forearm - 0.12, 4, 14]} />
      </ToonMesh>
      {cuff ? (
        <ToonMesh color={cuff} outline={LINE.prop} position={[0, -KERNEL.forearm + 0.03, 0]}>
          <cylinderGeometry args={[0.108, 0.108, 0.08, 16]} />
        </ToonMesh>
      ) : null}
      {/* Wrist + mitten hand with a separate thumb (palm faces the body) */}
      <group position={[0, -KERNEL.forearm - 0.03, 0]} rotation={[-(pose.wrist ?? 0), 0, 0]}>
        <ToonMesh color={KERNEL.skin} outline={HAND_LINE}>
          <cylinderGeometry args={[0.065, 0.07, 0.08, 12]} />
        </ToonMesh>
        <ToonMesh color={KERNEL.skin} outline={HAND_LINE} position={[0, -0.13, 0]} scale={[0.55, 1.25, 0.95]}>
          <sphereGeometry args={[0.11, 18, 14]} />
        </ToonMesh>
        <ToonMesh
          color={KERNEL.skin}
          outline={HAND_LINE}
          position={[0, -0.09, 0.085]}
          rotation={[0.45, 0, 0]}
        >
          <capsuleGeometry args={[0.035, 0.07, 4, 10]} />
        </ToonMesh>
      </group>
    </group>
  </group>
);

/** Small glowing teal dot in the middle of the forehead. */
const ForeheadDot: React.FC = () => (
  <group position={[0, 0.22, KERNEL.faceZ + 0.006]}>
    {[
      [0.075, 0.16],
      [0.05, 0.32],
    ].map(([r, o]) => (
      <mesh key={r} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[r, r, 0.004, 32]} />
        <meshBasicMaterial color={KERNEL.dot} transparent opacity={o} depthWrite={false} toneMapped={false} />
      </mesh>
    ))}
    <InkMesh color={KERNEL.dot} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.006]}>
      <cylinderGeometry args={[0.028, 0.028, 0.01, 20]} />
    </InkMesh>
    <InkMesh color="#c8fff7" rotation={[Math.PI / 2, 0, 0]} position={[-0.008, 0.008, 0.012]}>
      <cylinderGeometry args={[0.008, 0.008, 0.004, 10]} />
    </InkMesh>
  </group>
);

const Face: React.FC<{ pose: KernelPose }> = ({ pose }) => {
  const z = KERNEL.faceZ + 0.006;
  const open = 1 - (pose.blink ?? 0);
  const eyeY = (pose.lids ? 0.6 : 1) * open + 0.08;
  const slant = pose.browSlant ?? 0;
  const mouth = pose.mouth ?? 0;
  return (
    <group>
      {/* Small dot eyes */}
      {([-1, 1] as const).map((s) => (
        <group key={`e${s}`} position={[s * 0.165, -0.04, z]}>
          <InkMesh rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, eyeY]}>
            <cylinderGeometry args={[0.036, 0.036, 0.01, 18]} />
          </InkMesh>
          {pose.lids ? (
            <InkMesh position={[0, 0.03, 0.003]}>
              <boxGeometry args={[0.1, 0.014, 0.008]} />
            </InkMesh>
          ) : null}
        </group>
      ))}
      {/* Eyebrows do most of the acting. s=+1 is the character's left. */}
      {([-1, 1] as const).map((s) => {
        const raise = s === 1 ? (pose.browL ?? 0) : (pose.browR ?? 0);
        return (
          <InkMesh
            key={`b${s}`}
            position={[s * 0.165, 0.075 + raise * 0.045, z + 0.003]}
            rotation={[0, 0, -s * slant * 0.3 + s * raise * 0.1]}
          >
            <boxGeometry args={[0.15, 0.03, 0.01]} />
          </InkMesh>
        );
      })}
      {/* Mouth: tiny flat frown, or an open oval when talking */}
      {mouth > 0.08 ? (
        <InkMesh position={[0, -0.24, z]} rotation={[Math.PI / 2, 0, 0]} scale={[1.2, 1, 0.3 + mouth * 0.7]}>
          <cylinderGeometry args={[0.045, 0.045, 0.01, 18]} />
        </InkMesh>
      ) : (
        <InkMesh position={[0, -0.25 - 0.14, z]} rotation={[0, 0, Math.PI / 2 - Math.PI * 0.11]}>
          <torusGeometry args={[0.14, 0.011, 6, 16, Math.PI * 0.22]} />
        </InkMesh>
      )}
      <ForeheadDot />
    </group>
  );
};

/** Flat contact shadow under the feet, like the character sheet. */
const ContactShadow: React.FC = () => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0.05]} scale={[1, 0.55, 1]}>
    <circleGeometry args={[0.75, 40]} />
    <meshBasicMaterial color={INK} transparent opacity={0.16} depthWrite={false} toneMapped={false} />
  </mesh>
);

/**
 * Kernel character: rounded-rect head, warm sand face, glowing teal forehead
 * dot, adult proportions (~3.5 heads). Feet at local y=0, faces +z.
 */
export const Kernel: React.FC<
  ThreeElements["group"] & { look: KernelLook; pose?: Partial<KernelPose>; shadow?: boolean }
> = ({ look, pose: p = {}, shadow = true, ...props }) => {
  const pose: KernelPose = { right: RELAXED, left: RELAXED, ...p };
  const sleeve = look.sleeve ?? look.top;
  return (
    <ReceiveShadow.Provider value={false}>
      <group {...props}>
        {shadow ? <ContactShadow /> : null}
        {/* Legs + shoes */}
        {[-1, 1].map((s) => (
          <group key={s} position={[s * KERNEL.legX, 0, 0]}>
            <ToonMesh color={look.bottom} position={[0, 0.74, 0]}>
              <capsuleGeometry args={[0.15, 1.08, 4, 14]} />
            </ToonMesh>
            <group position={[s * 0.02, 0, 0.07]}>
              <ToonMesh color={look.shoes} position={[0, 0.11, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1.05, 1, 0.85]}>
                <capsuleGeometry args={[0.12, 0.26, 4, 14]} />
              </ToonMesh>
              {look.shoe}
            </group>
          </group>
        ))}

        {/* Upper body pivots at the hips for lean / shoulder shift */}
        <group position={[0, KERNEL.hipY, 0]} rotation={[pose.lean ?? 0, 0, pose.shoulderShift ?? 0]}>
          {/* Pelvis in trouser color joins the legs */}
          <ToonMesh color={look.bottom} position={[0, -0.08, 0]} scale={[1, 1, TORSO_DEPTH]}>
            <cylinderGeometry args={[0.39, 0.36, 0.26, 28]} />
          </ToonMesh>
          {/* Torso */}
          <ToonMesh color={look.top} position={[0, KERNEL.torsoH / 2, 0]} scale={[1, 1, TORSO_DEPTH]}>
            <cylinderGeometry args={[0.43, 0.39, KERNEL.torsoH, 28]} />
          </ToonMesh>
          {look.torso}
          {look.held}

          <Arm side={-1} pose={pose.right} sleeve={sleeve} cuff={look.cuff} />
          <Arm side={1} pose={pose.left} sleeve={sleeve} cuff={look.cuff} />

          {/* Short neck so the head never floats */}
          <ToonMesh color={KERNEL.skin} position={[0, KERNEL.torsoH + 0.06, 0]} outline={LINE.prop}>
            <cylinderGeometry args={[0.11, 0.13, 0.2, 18]} />
          </ToonMesh>

          {/* Head pivots at the top of the neck */}
          <group
            position={[0, KERNEL.torsoH + 0.13, 0]}
            rotation={[pose.headNod ?? 0, pose.headTurn ?? 0, pose.headTilt ?? 0]}
          >
            <group position={[0, KERNEL.headH / 2 - 0.02, 0]}>
              <ToonMesh color={KERNEL.skin} geometry={HEAD_GEOMETRY} />
              <Face pose={pose} />
              {look.head}
            </group>
          </group>
        </group>
      </group>
    </ReceiveShadow.Provider>
  );
};
