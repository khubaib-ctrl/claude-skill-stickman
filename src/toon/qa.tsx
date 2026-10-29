import { useLayoutEffect, useRef } from "react";
import { getInputProps, useCurrentFrame } from "remotion";
import * as THREE from "three";

/**
 * Contact QA: catches hands passing through solid props and handshakes / grabs
 * where the hands don't actually meet. Always registers (cheap); only checks and
 * logs when the composition is rendered with inputProps { qa: true }
 * (see scripts/qa-contacts.mjs).
 */
const QA_ON = (() => {
  try {
    return Boolean((getInputProps() as { qa?: boolean }).qa);
  } catch {
    return false;
  }
})();

type Hand = { name: string; palm: THREE.Vector3 };
type Solid = { name: string; box: THREE.Box3 };
type Contact = { a: string; b: string; maxDist: number };

const hands = new Map<string, Hand>();
const solids = new Map<string, Solid>();
const contacts = new Map<string, Contact>();

/** Palm radius used for penetration tests (world units). */
const PALM_R = 0.045;
/** Solids are shrunk by this much so grazing contact (resting on a surface) passes. */
const TOLERANCE = 0.03;

export const qaRegisterHand = (id: string, name: string, palm: THREE.Vector3) => {
  hands.set(id, { name, palm: palm.clone() });
};
export const qaUnregisterHand = (id: string) => hands.delete(id);

/**
 * Marks its children as solid: no hand may enter their bounding box.
 * Wrap furniture, screens, railings, walls, anything a hand must not pass through.
 */
export const Solid: React.FC<{ name: string; children: React.ReactNode }> = ({ name, children }) => {
  const ref = useRef<THREE.Group>(null);
  const id = useRef(`solid-${Math.random().toString(36).slice(2)}`).current;
  const frame = useCurrentFrame();
  useLayoutEffect(() => {
    if (!ref.current) return;
    ref.current.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(ref.current);
    box.expandByScalar(-TOLERANCE);
    solids.set(id, { name, box });
    return () => {
      solids.delete(id);
    };
  }, [frame, id, name]);
  return <group ref={ref}>{children}</group>;
};

/** Declares that two hands (e.g. "CEO.right", "BUYER.right") must be touching. */
export const ExpectContact: React.FC<{ a: string; b: string; maxDist?: number }> = ({ a, b, maxDist = 0.14 }) => {
  const id = useRef(`contact-${Math.random().toString(36).slice(2)}`).current;
  useLayoutEffect(() => {
    contacts.set(id, { a, b, maxDist });
    return () => {
      contacts.delete(id);
    };
  }, [id, a, b, maxDist]);
  return null;
};

/** Runs the checks for this frame. Must be the LAST child of the canvas. */
export const ContactQA: React.FC<{ scene: string }> = ({ scene }) => {
  const frame = useCurrentFrame();
  useLayoutEffect(() => {
    if (!QA_ON) return;
    const sphere = new THREE.Sphere();
    for (const h of hands.values()) {
      sphere.set(h.palm, PALM_R);
      for (const s of solids.values()) {
        if (!s.box.isEmpty() && s.box.intersectsSphere(sphere)) {
          console.warn(`[QA] ${scene} f${frame} hand-in-solid: ${h.name} inside ${s.name}`);
        }
      }
    }
    const byName = new Map([...hands.values()].map((h) => [h.name, h]));
    for (const c of contacts.values()) {
      const a = byName.get(c.a);
      const b = byName.get(c.b);
      if (!a || !b) {
        console.warn(`[QA] ${scene} f${frame} contact-missing: ${c.a} / ${c.b} not found`);
        continue;
      }
      const d = a.palm.distanceTo(b.palm);
      if (d > c.maxDist) {
        console.warn(`[QA] ${scene} f${frame} no-contact: ${c.a} ↔ ${c.b} are ${d.toFixed(2)} apart`);
      }
    }
  });
  return null;
};
