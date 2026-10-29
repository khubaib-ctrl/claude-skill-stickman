import { BUILDS, DEFAULT_BUILD, type BuildName, type ReachArm } from "../characters/toonfolk/ToonPerson";

/**
 * Contact helpers: hands that must TOUCH something (another hand, a box, a
 * keyboard) are posed with reach targets, never guessed joint angles.
 * Pair every contact with <ExpectContact/> and every obstacle with <Solid/>
 * (src/toon/qa.tsx), then run `node scripts/qa-contacts.mjs <Comp>`.
 */
type V3 = [number, number, number];
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

/**
 * Handshake: both characters' right palms meet at one shared point, palm to
 * palm, thumbs up. Pass the two characters' world positions. Pair it with
 * <ExpectContact a="A.right" b="B.right" /> so QA verifies the clasp.
 */
export const handshake = (
  a: V3,
  b: V3,
  opts: { y?: number; forward?: number; pump?: number; build?: BuildName } = {},
): { a: ReachArm; b: ReachArm } => {
  const k = BUILDS[opts.build ?? DEFAULT_BUILD].contact;
  const ux = b[0] - a[0];
  const uz = b[2] - a[2];
  const len = Math.hypot(ux, uz) || 1;
  const u: V3 = [ux / len, 0, uz / len];
  // Shared point between them, nudged toward camera so the clasp reads.
  const mid: V3 = [(a[0] + b[0]) / 2, (opts.y ?? k.shakeY) + (opts.pump ?? 0), (a[2] + b[2]) / 2 + (opts.forward ?? 0.3)];
  const off = 0.035; // palms touch, so each palm sits just on its owner's side
  return {
    a: { reach: [mid[0] - u[0] * off, mid[1], mid[2] - u[2] * off], world: true, thumb: [0, 1, 0] },
    b: { reach: [mid[0] + u[0] * off, mid[1], mid[2] + u[2] * off], world: true, thumb: [0, 1, 0] },
  };
};


/** Character-relative directions for a character at rotation-y `facing`. */
const basis = (facing: number) => ({
  fwd: [Math.sin(facing), 0, Math.cos(facing)] as V3,
  /** The character's own right side. */
  right: [-Math.cos(facing), 0, Math.sin(facing)] as V3,
});

/**
 * Carry a box with both hands: returns the box center (in front of the chest,
 * in the direction the character FACES) and reach targets on its two sides.
 */
export const carry = (
  pos: V3,
  facing: number,
  opts: { height?: number; forward?: number; halfWidth?: number; build?: BuildName } = {},
) => {
  const k = BUILDS[opts.build ?? DEFAULT_BUILD].contact;
  const { fwd, right } = basis(facing);
  const fw = opts.forward ?? k.carryForward;
  const hw = opts.halfWidth ?? k.carryHalfWidth;
  const box: V3 = [pos[0] + fwd[0] * fw, pos[1] + (opts.height ?? k.carryY), pos[2] + fwd[2] * fw];
  const side = (s: number): ReachArm => ({
    reach: [box[0] + right[0] * hw * s, box[1], box[2] + right[2] * hw * s],
    world: true,
    thumb: [0, 1, 0],
  });
  return { box, right: side(1), left: side(-1) };
};

/** A relaxed hands-at-the-sides palm point (world), for blending a reach in and out. */
export const restReach = (pos: V3, facing: number, hand: "right" | "left", build: BuildName = DEFAULT_BUILD): V3 => {
  const k = BUILDS[build].contact;
  const { fwd, right } = basis(facing);
  const s = hand === "right" ? 1 : -1;
  const o = k.restOut;
  const f = k.restForward;
  return [pos[0] + right[0] * o * s + fwd[0] * f, pos[1] + k.restY, pos[2] + right[2] * o * s + fwd[2] * f];
};

/**
 * Blend a world reach target from rest to a goal (t: 0..1). t is clamped: a
 * spring's overshoot is fine for gestures but would push contacting hands
 * through each other or through a surface.
 */
export const reachBlend = (from: V3, goal: ReachArm, t: number): ReachArm => ({
  ...goal,
  reach: lerp3(from, goal.reach, Math.min(1, Math.max(0, t))),
});
