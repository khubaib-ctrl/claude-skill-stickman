import type { ThreeElements } from "@react-three/fiber";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { InkMesh, LINE, onTwos, PALETTE, ReceiveShadow, ToonMesh } from "../../toon/toon";

const HEAD_R = 0.62;

/** Position + orientation for a feature sitting on the head's surface. */
const onHead = (lat: number, lon: number, lift = 0) => {
  const dir = new THREE.Vector3(
    Math.sin(lon) * Math.cos(lat),
    Math.sin(lat),
    Math.cos(lon) * Math.cos(lat),
  );
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
  return {
    position: dir.multiplyScalar(HEAD_R + lift).toArray() as [number, number, number],
    quaternion: q.toArray() as [number, number, number, number],
  };
};

const Arm: React.FC<{ side: 1 | -1; raise: number; bend: number }> = ({ side, raise, bend }) => (
  <group position={[side * 0.4, 1.82, 0]} rotation={[0, 0, side * raise]}>
    <ToonMesh color={PALETTE.suit} position={[0, -0.22, 0]}>
      <capsuleGeometry args={[0.11, 0.32, 4, 12]} />
    </ToonMesh>
    <group position={[0, -0.46, 0]} rotation={[0, 0, side * bend]}>
      <ToonMesh color={PALETTE.suit} position={[0, -0.18, 0]}>
        <capsuleGeometry args={[0.1, 0.26, 4, 12]} />
      </ToonMesh>
      {/* Shirt cuff + mitten hand */}
      <ToonMesh color={PALETTE.shirt} outline={LINE.prop} position={[0, -0.38, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.07, 14]} />
      </ToonMesh>
      <ToonMesh color={PALETTE.skin} position={[0, -0.52, 0]} scale={[1, 1.15, 0.8]}>
        <sphereGeometry args={[0.13, 18, 14]} />
      </ToonMesh>
      <ToonMesh color={PALETTE.skin} position={[side * -0.11, -0.46, 0.02]}>
        <sphereGeometry args={[0.05, 12, 10]} />
      </ToonMesh>
    </group>
  </group>
);

/** Orator in a suit with a handlebar mustache. Stands with feet at local y=0. */
export const Speaker: React.FC<ThreeElements["group"]> = (props) => {
  const real = useCurrentFrame();
  const frame = onTwos(real);
  const { fps } = useVideoConfig();
  const snap = (at: number) =>
    spring({ frame: frame - at, fps, config: { stiffness: 320, damping: 16 } });

  // Arms snap up into the big "people of this town" gesture, then pump once.
  const up = snap(16);
  const pump = snap(70) - snap(80);
  const raise = interpolate(up, [0, 1], [0.18, 2.35]) - pump * 0.4;
  const bend = interpolate(up, [0, 1], [0.05, 0.3]);

  // Deadpan head tilts, one eyebrow, blinks.
  const tilt = interpolate(snap(46), [0, 1], [0, 0.14]) - interpolate(snap(94), [0, 1], [0, 0.22]);
  const browUp = snap(56) - snap(100);
  const blinking = (real >= 38 && real < 42) || (real >= 104 && real < 108);
  const eyeScaleY = blinking ? 0.12 : 1;
  const talking = real > 18 && real < 112;
  const mouthOpen = talking && Math.floor(real / 4) % 2 === 0 ? 1 : 0.35;
  const bob = (Math.floor(real / 8) % 2) * 0.02 * up;

  const lid = (s: 1 | -1) => onHead(0.13, s * 0.27, 0.03);

  return (
    <ReceiveShadow.Provider value={false}>
    <group {...props}>
      <group position={[0, bob, 0]}>
        {/* Torso / jacket */}
        <ToonMesh color={PALETTE.suit} position={[0, 1.35, 0]}>
          <cylinderGeometry args={[0.36, 0.5, 1.2, 24]} />
        </ToonMesh>
        {/* Shirt front, lapels, bow tie, buttons */}
        <ToonMesh color={PALETTE.shirt} outline={LINE.prop} position={[0, 1.72, 0.32]} rotation={[-0.2, 0, 0]}>
          <boxGeometry args={[0.24, 0.42, 0.06]} />
        </ToonMesh>
        {[-1, 1].map((s) => (
          <ToonMesh key={s} color="#3e3129" outline={LINE.prop} position={[s * 0.15, 1.66, 0.36]} rotation={[-0.2, 0, s * 0.35]}>
            <boxGeometry args={[0.1, 0.5, 0.05]} />
          </ToonMesh>
        ))}
        {[-1, 1].map((s) => (
          <ToonMesh key={`bow${s}`} color={PALETTE.feature} outline={0} position={[s * 0.06, 1.9, 0.36]} rotation={[0, 0, s * -Math.PI / 2]}>
            <coneGeometry args={[0.06, 0.12, 3]} />
          </ToonMesh>
        ))}
        {[1.42, 1.25].map((y) => (
          <InkMesh key={y} position={[0, y, 0.43]}>
            <sphereGeometry args={[0.025, 8, 6]} />
          </InkMesh>
        ))}
        <ToonMesh color={PALETTE.shirt} outline={LINE.prop} position={[0, 1.97, 0]}>
          <cylinderGeometry args={[0.2, 0.24, 0.12, 20]} />
        </ToonMesh>

        <Arm side={1} raise={raise} bend={bend} />
        <Arm side={-1} raise={raise} bend={bend} />

        {/* Head: pivots at the neck for tilts */}
        <group position={[0, 2.0, 0]} rotation={[0.08, 0, tilt]}>
          <group position={[0, HEAD_R * 0.95, 0]}>
            <ToonMesh color={PALETTE.skin}>
              <sphereGeometry args={[HEAD_R, 40, 30]} />
            </ToonMesh>

            {/* Wavy hair: cap + tufts */}
            <ToonMesh color={PALETTE.hair} position={[0, 0.08, -0.06]} rotation={[-0.35, 0, 0]}>
              <sphereGeometry args={[HEAD_R + 0.04, 32, 16, 0, Math.PI * 2, 0, 1.05]} />
            </ToonMesh>
            {[
              [-0.42, 0.35, 0.22, 0.2],
              [0.4, 0.38, 0.2, 0.2],
              [-0.12, 0.55, 0.3, 0.2],
              [0.18, 0.55, 0.25, 0.19],
              [-0.55, 0.05, -0.05, 0.18],
              [0.56, 0.08, -0.05, 0.18],
            ].map(([x, y, z, r], i) => (
              <ToonMesh key={i} color={PALETTE.hair} position={[x, y, z]} scale={[1, 0.8, 1]}>
                <sphereGeometry args={[r, 16, 12]} />
              </ToonMesh>
            ))}

            {/* Eyes with heavy deadpan lids */}
            {([-1, 1] as const).map((s) => (
              <group key={`eye${s}`}>
                <InkMesh {...onHead(0.05, s * 0.27, 0.005)} scale={[1, eyeScaleY, 0.4]}>
                  <sphereGeometry args={[0.05, 12, 10]} />
                </InkMesh>
                <InkMesh {...lid(s)}>
                  <boxGeometry args={[0.15, 0.025, 0.02]} />
                </InkMesh>
              </group>
            ))}
            {/* Eyebrows (left one arches up for the dry look) */}
            {([-1, 1] as const).map((s) => {
              const extra = s === -1 ? browUp * 0.08 : 0;
              const p = onHead(0.3 + extra, s * 0.28, 0.02);
              return (
                <group key={`brow${s}`} position={p.position} quaternion={new THREE.Quaternion(...p.quaternion)}>
                  <InkMesh rotation={[0, 0, s * (0.22 - extra * 2)]}>
                    <boxGeometry args={[0.2, 0.045, 0.03]} />
                  </InkMesh>
                </group>
              );
            })}
            {/* Handlebar mustache */}
            {([-1, 1] as const).map((s) => (
              <group key={`stache${s}`} {...onHead(-0.2, s * 0.17, 0.05)}>
                <ToonMesh color={PALETTE.hair} outline={LINE.prop} rotation={[0, 0, s * 1.25]} scale={[1, 1, 0.6]}>
                  <capsuleGeometry args={[0.085, 0.22, 4, 12]} />
                </ToonMesh>
                <ToonMesh color={PALETTE.hair} outline={LINE.prop} position={[s * 0.2, 0.06, -0.02]} scale={[0.8, 1.2, 0.6]}>
                  <sphereGeometry args={[0.06, 12, 10]} />
                </ToonMesh>
              </group>
            ))}
            {/* Mouth */}
            <InkMesh {...onHead(-0.42, 0, 0.005)} scale={[1.2, mouthOpen, 0.4]}>
              <sphereGeometry args={[0.06, 12, 10]} />
            </InkMesh>
          </group>
        </group>
      </group>
    </group>
    </ReceiveShadow.Provider>
  );
};
