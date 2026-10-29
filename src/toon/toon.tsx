import { Outlines } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";
import { createContext, useContext } from "react";
import * as THREE from "three";

/** Dark brown-black ink used for every outline (never pure black). */
export const INK = "#2b1f1a";

/** Outline thickness in pixels (drei Outlines, non-screenspace mode). */
export const LINE = {
  character: 6,
  prop: 4.5,
  background: 3,
} as const;

/** Muted, slightly desaturated palette. */
export const PALETTE = {
  sky: "#a9c9dc",
  cloud: "#f1ede0",
  skin: "#eceae6",
  cream: "#e6d9bc",
  creamDark: "#d6c6a3",
  plaster: "#ece4d2",
  timber: "#5a3f2e",
  timberLight: "#7a5a43",
  roof: "#7d4c38",
  roofDark: "#6a3f30",
  stone: "#a9a395",
  stoneDark: "#948d7f",
  glass: "#62798a",
  cloth: "#cbc3ae",
  awning: "#5f7b93",
  olive: "#7c8656",
  suit: "#4a3b31",
  shirt: "#f4f0e6",
  hair: "#6a4e39",
  feature: "#2b1f1a",
} as const;

/**
 * 3-step gradient map: shadow / base / highlight. NearestFilter keeps the
 * bands hard-edged, which is what gives the cel look.
 */
export const TOON_GRADIENT = (() => {
  const tex = new THREE.DataTexture(
    new Uint8Array([105, 185, 255]),
    3,
    1,
    THREE.RedFormat,
  );
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
})();

/**
 * Softer 3-step ramp for skin (faces, ears, hands): same hard cel bands, but a
 * lighter shadow step so faces don't fall into a muddy half-shadow.
 */
export const SKIN_GRADIENT = (() => {
  const tex = new THREE.DataTexture(new Uint8Array([175, 220, 255]), 3, 1, THREE.RedFormat);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
})();

/**
 * Characters set this to false: their cel bands come from the toon ramp, and
 * self-shadowing on round heads produces speckled shadow-map artifacts.
 */
export const ReceiveShadow = createContext(true);

type ToonMeshProps = ThreeElements["mesh"] & {
  color: string;
  /** Cel ramp; defaults to TOON_GRADIENT. Use SKIN_GRADIENT for skin. */
  gradient?: THREE.Texture;
  /** Outline thickness in px; 0 disables it (tiny face features). */
  outline?: number;
};

/** A mesh with cel shading, hard shadows and an ink outline. Pass the geometry as a child. */
export const ToonMesh: React.FC<ToonMeshProps> = ({
  color,
  outline = LINE.character,
  gradient = TOON_GRADIENT,
  children,
  ...props
}) => (
  <mesh castShadow receiveShadow={useContext(ReceiveShadow)} {...props}>
    {children}
    <meshToonMaterial color={color} gradientMap={gradient} />
    {outline > 0 ? (
      <Outlines thickness={outline} color={INK} toneMapped={false} />
    ) : null}
  </mesh>
);

/** Flat, unlit mesh for ink details (eyes, mouth, panel lines). */
export const InkMesh: React.FC<ThreeElements["mesh"] & { color?: string }> = ({
  color = INK,
  children,
  ...props
}) => (
  <mesh {...props}>
    {children}
    <meshBasicMaterial color={color} toneMapped={false} />
  </mesh>
);

/** Animate "on twos": hold each pose for `step` frames for snappy cartoon motion. */
export const onTwos = (frame: number, step = 2) =>
  Math.floor(frame / step) * step;
