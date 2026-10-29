import type { ThreeElements } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import { LINE, PALETTE, ToonMesh } from "../../toon/toon";

type BuildingProps = ThreeElements["group"] & {
  w: number;
  h: number;
  floors: number;
  d?: number;
  wall?: string;
  roof?: string;
  balcony?: boolean;
  awning?: string;
  chimney?: boolean;
};

const L = LINE.background;

const Window: React.FC<{ x: number; y: number; z: number; shutters?: boolean }> = ({
  x,
  y,
  z,
  shutters,
}) => (
  <group position={[x, y, z]}>
    <ToonMesh color={PALETTE.timber} outline={L}>
      <boxGeometry args={[0.95, 1.2, 0.1]} />
    </ToonMesh>
    <ToonMesh color={PALETTE.glass} outline={0} position={[0, 0, 0.04]}>
      <boxGeometry args={[0.72, 0.97, 0.06]} />
    </ToonMesh>
    <ToonMesh color={PALETTE.timber} outline={0} position={[0, 0, 0.08]}>
      <boxGeometry args={[0.06, 0.97, 0.04]} />
    </ToonMesh>
    <ToonMesh color={PALETTE.timber} outline={0} position={[0, 0.1, 0.08]}>
      <boxGeometry args={[0.72, 0.06, 0.04]} />
    </ToonMesh>
    <ToonMesh color={PALETTE.timberLight} outline={L} position={[0, -0.66, 0.08]}>
      <boxGeometry args={[1.1, 0.1, 0.22]} />
    </ToonMesh>
    {shutters
      ? [-1, 1].map((s) => (
          <ToonMesh key={s} color={PALETTE.olive} outline={L} position={[s * 0.68, 0, 0.02]}>
            <boxGeometry args={[0.38, 1.15, 0.06]} />
          </ToonMesh>
        ))
      : null}
  </group>
);

/** Half-timbered townhouse. The facade faces local +z. */
export const Building: React.FC<BuildingProps> = ({
  w,
  h,
  floors,
  d = 4,
  wall = PALETTE.plaster,
  roof = PALETTE.roof,
  balcony,
  awning,
  chimney,
  ...props
}) => {
  const fh = h / floors;
  const fz = d / 2;
  const cols = Math.max(1, Math.floor((w - 0.4) / 1.6));
  const colW = w / cols;
  const colX = (i: number) => -w / 2 + colW * (i + 0.5);

  const roofGeo = useMemo(() => {
    const rh = Math.min(2.2, w * 0.45);
    const shape = new THREE.Shape();
    shape.moveTo(-w / 2 - 0.4, 0);
    shape.lineTo(w / 2 + 0.4, 0);
    shape.lineTo(0, rh);
    shape.closePath();
    const g = new THREE.ExtrudeGeometry(shape, { depth: d + 0.8, bevelEnabled: false });
    g.translate(0, 0, -(d + 0.8) / 2);
    return g;
  }, [w, d]);

  return (
    <group {...props}>
      <ToonMesh color={wall} outline={L} position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
      </ToonMesh>

      {/* Timber frame */}
      {Array.from({ length: floors - 1 }, (_, i) => (
        <ToonMesh key={`beam${i}`} color={PALETTE.timber} outline={L} position={[0, (i + 1) * fh, fz + 0.05]}>
          <boxGeometry args={[w + 0.04, 0.18, 0.12]} />
        </ToonMesh>
      ))}
      {Array.from({ length: cols + 1 }, (_, i) => (
        <ToonMesh key={`post${i}`} color={PALETTE.timber} outline={L} position={[-w / 2 + colW * i, h / 2, fz + 0.06]}>
          <boxGeometry args={[0.18, h, 0.12]} />
        </ToonMesh>
      ))}
      {/* Diagonal braces on the top floor */}
      {Array.from({ length: cols }, (_, i) => (
        <ToonMesh
          key={`brace${i}`}
          color={PALETTE.timber}
          outline={0}
          position={[colX(i) + (i % 2 ? 0.45 : -0.45), h - fh * 0.5, fz + 0.04]}
          rotation={[0, 0, i % 2 ? 0.7 : -0.7]}
        >
          <boxGeometry args={[0.1, fh * 0.75, 0.06]} />
        </ToonMesh>
      ))}

      {/* Windows (ground floor gets a door in the first column) */}
      {Array.from({ length: floors }, (_, f) =>
        Array.from({ length: cols }, (_, c) => {
          if (f === 0 && c === 0) {
            return (
              <group key={`door${c}`} position={[colX(c), 0.95, fz + 0.06]}>
                <ToonMesh color={PALETTE.timber} outline={L}>
                  <boxGeometry args={[1.05, 1.9, 0.1]} />
                </ToonMesh>
                <ToonMesh color={PALETTE.timberLight} outline={0} position={[0, -0.05, 0.04]}>
                  <boxGeometry args={[0.8, 1.7, 0.06]} />
                </ToonMesh>
              </group>
            );
          }
          return (
            <Window
              key={`win${f}-${c}`}
              x={colX(c)}
              y={f * fh + fh * 0.55}
              z={fz + 0.07}
              shutters={(f + c) % 3 === 1}
            />
          );
        }),
      )}

      {awning ? (
        <ToonMesh color={awning} outline={LINE.prop} position={[0, fh * 0.95, fz + 0.7]} rotation={[0.45, 0, 0]}>
          <boxGeometry args={[w * 0.8, 0.08, 1.5]} />
        </ToonMesh>
      ) : null}

      {balcony ? (
        <group position={[0, fh, fz]}>
          <ToonMesh color={PALETTE.timberLight} outline={L} position={[0, 0.05, 0.5]}>
            <boxGeometry args={[w * 0.75, 0.14, 1]} />
          </ToonMesh>
          {Array.from({ length: 11 }, (_, i) => (
            <ToonMesh key={i} color={PALETTE.timber} outline={0} position={[-w * 0.36 + (w * 0.72 * i) / 10, 0.5, 0.95]}>
              <boxGeometry args={[0.06, 0.8, 0.06]} />
            </ToonMesh>
          ))}
          <ToonMesh color={PALETTE.timber} outline={L} position={[0, 0.92, 0.95]}>
            <boxGeometry args={[w * 0.76, 0.1, 0.12]} />
          </ToonMesh>
          {[-1, 1].map((s) => (
            <ToonMesh key={s} color={PALETTE.timber} outline={L} position={[s * w * 0.3, -0.3, 0.3]} rotation={[0.8, 0, 0]}>
              <boxGeometry args={[0.12, 0.7, 0.12]} />
            </ToonMesh>
          ))}
        </group>
      ) : null}

      {/* Roof */}
      <ToonMesh color={roof} outline={L} geometry={roofGeo} position={[0, h, 0]} />
      <ToonMesh color={PALETTE.timber} outline={L} position={[0, h + 0.05, fz + 0.35]}>
        <boxGeometry args={[w + 0.8, 0.14, 0.14]} />
      </ToonMesh>
      {chimney ? (
        <group position={[w * 0.22, h + 1.1, -0.3]}>
          <ToonMesh color={PALETTE.cream} outline={L}>
            <boxGeometry args={[0.5, 1.6, 0.5]} />
          </ToonMesh>
          <ToonMesh color={PALETTE.creamDark} outline={L} position={[0, 0.85, 0]}>
            <boxGeometry args={[0.66, 0.16, 0.66]} />
          </ToonMesh>
        </group>
      ) : null}
    </group>
  );
};
