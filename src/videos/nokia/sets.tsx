import { RoundedBoxGeometry } from "@react-three/drei";
import { InkMesh, LINE, PALETTE, ToonMesh } from "../../toon/toon";
import { useCurrentFrame } from "remotion";
import { Solid } from "../../toon/qa";
import { CandybarPhone, Laptop, Memo, MovingBox, Snow } from "./kit";

const L = LINE.background;
const P = LINE.prop;
type V3 = [number, number, number];

const C = {
  wall: "#e2d8c4",
  wainscot: "#7a5a43",
  floorWood: "#9c7b5a",
  table: "#6b4a35",
  tableTop: "#7d5a42",
  chair: "#3f4a52",
  winterSky: "#c9d6e0",
  pine: "#4d5e4a",
  snow: "#eef1f4",
  steel: "#5d6168",
  tile: "#cfc8ba",
};

/* ---------------- Shared pieces ---------------- */

const Pine: React.FC<{ position: V3; s?: number }> = ({ position, s = 1 }) => (
  <group position={position} scale={s}>
    {[0, 1, 2].map((i) => (
      <group key={i}>
        <ToonMesh color={C.pine} outline={L} position={[0, 0.9 + i * 0.7, 0]}>
          <coneGeometry args={[0.9 - i * 0.22, 1.2, 10]} />
        </ToonMesh>
        <ToonMesh color={C.snow} outline={0} position={[0, 1.25 + i * 0.7, 0]}>
          <coneGeometry args={[0.45 - i * 0.1, 0.45, 10]} />
        </ToonMesh>
      </group>
    ))}
    <ToonMesh color="#5a3f2e" outline={L} position={[0, 0.25, 0]}>
      <cylinderGeometry args={[0.12, 0.14, 0.5, 8]} />
    </ToonMesh>
  </group>
);

const Chair: React.FC<{ position: V3; rotY?: number }> = ({ position, rotY = 0 }) => (
  <group position={position} rotation={[0, rotY, 0]}>
    <ToonMesh color={C.chair} outline={L} position={[0, 0.55, 0]}>
      <boxGeometry args={[0.6, 0.12, 0.6]} />
    </ToonMesh>
    <ToonMesh color={C.chair} outline={L} position={[0, 1.05, -0.27]}>
      <RoundedBoxGeometry args={[0.6, 0.9, 0.1]} radius={0.04} />
    </ToonMesh>
    <ToonMesh color={C.steel} outline={L} position={[0, 0.27, 0]}>
      <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
    </ToonMesh>
  </group>
);

/* ---------------- Phone shop (scene 1) ---------------- */

/** Display counter with 10 phones on the front edge; `litCount` of them glow. */
export const PhoneShop: React.FC<{ litCount: number }> = ({ litCount }) => (
  <group>
    <ToonMesh color={C.tile} outline={0} position={[0, -0.05, 2]}>
      <boxGeometry args={[30, 0.1, 14]} />
    </ToonMesh>
    {Array.from({ length: 12 }, (_, i) => (
      <InkMesh key={i} color="#bdb5a6" position={[-6 + i, 0.002, 2]}>
        <boxGeometry args={[0.02, 0.002, 14]} />
      </InkMesh>
    ))}
    {/* Back wall + shelves of boxed phones */}
    <ToonMesh color="#d9cdb3" outline={0} position={[0, 4, -2.6]}>
      <boxGeometry args={[20, 8, 0.2]} />
    </ToonMesh>
    {[1.7, 2.6, 3.5].map((y) => (
      <group key={y}>
        <ToonMesh color={PALETTE.timberLight} outline={L} position={[0, y, -2.3]}>
          <boxGeometry args={[7, 0.08, 0.5]} />
        </ToonMesh>
        {Array.from({ length: 11 }, (_, i) => (
          <ToonMesh
            key={i}
            color={["#e9e3d6", "#c9d3d9", "#d8cbb4"][(i + Math.round(y)) % 3]}
            outline={L}
            position={[-3 + i * 0.6, y + 0.22, -2.3]}
          >
            <boxGeometry args={[0.42, 0.36, 0.3]} />
          </ToonMesh>
        ))}
      </group>
    ))}
    {/* Posters (blank, no text) */}
    {[-4.6, 4.6].map((x) => (
      <group key={x} position={[x, 2.8, -2.45]}>
        <ToonMesh color={PALETTE.timber} outline={L}>
          <boxGeometry args={[1.5, 2, 0.05]} />
        </ToonMesh>
        <ToonMesh color={x < 0 ? "#8fb0c4" : "#b9c79a"} outline={0} position={[0, 0, 0.03]}>
          <boxGeometry args={[1.3, 1.8, 0.02]} />
        </ToonMesh>
        <InkMesh color="#5f6670" position={[0, -0.1, 0.05]}>
          <boxGeometry args={[0.35, 0.8, 0.01]} />
        </InkMesh>
      </group>
    ))}
    {/* Display counter */}
    <Solid name="shop counter">
      <ToonMesh color={PALETTE.timber} outline={P} position={[0, 0.5, 0.2]}>
        <boxGeometry args={[6.4, 1, 1.1]} />
      </ToonMesh>
    </Solid>
    <ToonMesh color={PALETTE.timberLight} outline={P} position={[0, 1.03, 0.2]}>
      <boxGeometry args={[6.6, 0.07, 1.2]} />
    </ToonMesh>
    <ToonMesh color="#a9c2cc" outline={L} position={[0, 0.55, 0.77]}>
      <boxGeometry args={[6.0, 0.6, 0.02]} />
    </ToonMesh>
    {/* 10 phones on little stands along the front edge */}
    {Array.from({ length: 10 }, (_, i) => (
      <group key={i} position={[-2.7 + i * 0.6, 1.07, 0.55]}>
        <ToonMesh color="#3a3836" outline={L} position={[0, 0.03, 0]}>
          <boxGeometry args={[0.3, 0.06, 0.2]} />
        </ToonMesh>
        <CandybarPhone lit={i < litCount} position={[0, 0.34, 0]} rotation={[-0.15, 0, 0]} scale={1.05} />
      </group>
    ))}
  </group>
);

/* ---------------- Nokia boardroom (scenes 2, 4, 5, 6, 8, 9) ---------------- */

/** Bar chart on an easel: `level` = Nokia bar height 0..1, with a 25% line. */
export const ChartEasel: React.FC<{ level: number; position?: V3 }> = ({ level, position = [3.3, 0, -1.9] }) => (
  <group position={position} rotation={[0, -0.25, 0]}>
    {[-0.6, 0.6].map((x) => (
      <ToonMesh key={x} color={PALETTE.timber} outline={L} position={[x, 1.1, 0.1]} rotation={[0.08, 0, 0]}>
        <boxGeometry args={[0.07, 2.2, 0.07]} />
      </ToonMesh>
    ))}
    <Solid name="chart board">
      <ToonMesh color="#f4efe4" outline={P} position={[0, 1.75, 0.18]}>
        <boxGeometry args={[1.7, 1.9, 0.05]} />
      </ToonMesh>
    </Solid>
    {/* Axis */}
    <InkMesh position={[-0.7, 1.75, 0.21]}>
      <boxGeometry args={[0.02, 1.6, 0.01]} />
    </InkMesh>
    <InkMesh position={[0, 0.96, 0.21]}>
      <boxGeometry args={[1.42, 0.02, 0.01]} />
    </InkMesh>
    {/* 25% line (bar max height 1.5 = 40%; 25% sits at 0.94) */}
    {Array.from({ length: 7 }, (_, i) => (
      <InkMesh key={i} color="#9a5a44" position={[-0.6 + i * 0.2, 0.96 + 0.94, 0.215]}>
        <boxGeometry args={[0.11, 0.018, 0.01]} />
      </InkMesh>
    ))}
    {/* Nokia bar + three small rival bars */}
    <ToonMesh color="#3f6f8f" outline={L} position={[-0.45, 0.97 + (1.5 * level) / 2, 0.22]}>
      <boxGeometry args={[0.28, Math.max(0.02, 1.5 * level), 0.03]} />
    </ToonMesh>
    {[0.35, 0.22, 0.18].map((h, i) => (
      <ToonMesh key={i} color="#a39d90" outline={L} position={[-0.05 + i * 0.32, 0.97 + h / 2, 0.22]}>
        <boxGeometry args={[0.24, h, 0.03]} />
      </ToonMesh>
    ))}
  </group>
);

export const Boardroom: React.FC<{
  chartLevel: number;
  memoOnTable?: boolean;
  /** The CEO's moving box, parked in the back-left corner (scenes 8–11). */
  boxInCorner?: boolean;
  /** Toppled phones scattered on the table (end of scene 5 / scene 6). */
  phonePile?: boolean;
  /** CEO desk in the front-left (scene 4). */
  ceoDesk?: boolean;
}> = ({ chartLevel, memoOnTable, boxInCorner, phonePile, ceoDesk }) => (
  <group>
    <ToonMesh color={C.floorWood} outline={0} position={[0, -0.05, 2]}>
      <boxGeometry args={[30, 0.1, 16]} />
    </ToonMesh>
    {/* Back wall with wainscot */}
    <ToonMesh color={C.wall} outline={0} position={[0, 4, -3.6]}>
      <boxGeometry args={[24, 8, 0.2]} />
    </ToonMesh>
    <ToonMesh color={C.wainscot} outline={L} position={[0, 0.6, -3.45]}>
      <boxGeometry args={[24, 1.2, 0.1]} />
    </ToonMesh>
    <ToonMesh color={PALETTE.timber} outline={L} position={[0, 1.22, -3.4]}>
      <boxGeometry args={[24, 0.08, 0.14]} />
    </ToonMesh>
    {/* Big window onto a snowy Finnish landscape */}
    <group position={[-0.6, 3.1, -3.5]}>
      <InkMesh color={C.winterSky} position={[0, 0, -0.05]}>
        <boxGeometry args={[5.2, 2.6, 0.02]} />
      </InkMesh>
      <InkMesh color={C.snow} position={[0, -1.0, -0.04]}>
        <boxGeometry args={[5.2, 0.6, 0.02]} />
      </InkMesh>
      {[-2, -1.2, 0.6, 1.7].map((x, i) => (
        <InkMesh key={x} color="#6d7b6a" position={[x, -0.55 + (i % 2) * 0.1, -0.03]}>
          <coneGeometry args={[0.3, 0.9, 6]} />
        </InkMesh>
      ))}
      <Snow count={45} box={{ x: [-2.5, 2.5], y: [-1.2, 1.2], z: [0.0, 0.02] }} size={0.03} seed="boardwin" />
      {/* Frame + mullions */}
      {[
        [0, 1.33, 5.4, 0.12],
        [0, -1.33, 5.4, 0.12],
        [-2.65, 0, 0.12, 2.8],
        [2.65, 0, 0.12, 2.8],
        [0, 0, 0.08, 2.6],
        [-1.3, 0, 0.06, 2.6],
        [1.3, 0, 0.06, 2.6],
        [0, 0.2, 5.2, 0.06],
      ].map(([x, y, w, h], i) => (
        <ToonMesh key={i} color="#f1ece2" outline={L} position={[x, y, 0.05]}>
          <boxGeometry args={[w, h, 0.1]} />
        </ToonMesh>
      ))}
    </group>
    {/* Framed picture + plant */}
    <group position={[-4.6, 3.0, -3.45]}>
      <ToonMesh color={PALETTE.timber} outline={L}>
        <boxGeometry args={[1.2, 0.9, 0.05]} />
      </ToonMesh>
      <ToonMesh color="#8fa3a8" outline={0} position={[0, 0, 0.03]}>
        <boxGeometry args={[1.0, 0.7, 0.02]} />
      </ToonMesh>
    </group>
    <group position={[-4.8, 0, -2.8]}>
      <ToonMesh color="#8a6a4a" outline={P} position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.32, 0.25, 0.7, 14]} />
      </ToonMesh>
      {[
        [0, 1.1, 0, 0.45],
        [-0.25, 0.9, 0.1, 0.32],
        [0.28, 0.95, 0, 0.34],
      ].map(([x, y, z, r], i) => (
        <ToonMesh key={i} color={PALETTE.olive} outline={L} position={[x, y, z]}>
          <sphereGeometry args={[r, 14, 10]} />
        </ToonMesh>
      ))}
    </group>
    {/* Long table (characters stand behind it, legs hidden) */}
    <Solid name="boardroom table">
      <ToonMesh color={C.tableTop} outline={P} position={[0, 1.0, -0.5]}>
        <RoundedBoxGeometry args={[5.2, 0.1, 1.5]} radius={0.04} />
      </ToonMesh>
      <ToonMesh color={C.table} outline={P} position={[0, 0.5, -0.5]}>
        <boxGeometry args={[4.8, 0.9, 1.2]} />
      </ToonMesh>
    </Solid>
    {/* Notepads + glasses */}
    {[-1.8, 1.6].map((x) => (
      <group key={x} position={[x, 1.06, -0.4]}>
        <ToonMesh color="#f1ece2" outline={L}>
          <boxGeometry args={[0.35, 0.02, 0.45]} />
        </ToonMesh>
        <ToonMesh color="#cfe3e6" outline={L} position={[0.4, 0.12, -0.1]}>
          <cylinderGeometry args={[0.07, 0.06, 0.22, 12]} />
        </ToonMesh>
      </group>
    ))}
    {memoOnTable ? <Memo position={[0.9, 1.07, -0.35]} rotation={[0, 0.3, 0]} /> : null}
    {boxInCorner ? <MovingBox position={BOX_CORNER} rotation={[0, 0.3, 0]} /> : null}
    {phonePile ? <PhonePile /> : null}
    {ceoDesk ? (
      <group position={CEO_DESK} rotation={[0, Math.PI, 0]}>
        <Desk position={[0, 0, 0]} monitor={false} chair={false} />
        <Laptop position={[0, 1.0, 0.05]} rotation={[0, Math.PI, 0]} />
      </group>
    ) : null}
    {/* Empty chairs at the ends */}
    <Chair position={[3.0, 0, 0.4]} rotY={-Math.PI / 2} />
    <ChartEasel level={chartLevel} />
  </group>
);

/** Where the CEO parks his moving box (by the plant, back-left). */
export const BOX_CORNER: V3 = [-3.6, 0.25, -1.9];
/** CEO's desk in the boardroom front-left (scene 4). The desk is rotated so its user faces the camera. */
export const CEO_DESK: V3 = [-2.6, 0, 1.6];
/** World position of the CEO desk laptop's keyboard center. */
export const LAPTOP_KEYS: V3 = [CEO_DESK[0], 1.03, CEO_DESK[2] - 0.07];

/** Phones knocked over on the table after the topple. */
const PhonePile: React.FC = () => (
  <group position={[0.4, 1.06, -0.6]}>
    {[
      [0, 0, 0.3, 1.4],
      [0.3, 0.02, -0.2, 0.2],
      [-0.35, 0.01, 0.1, -0.9],
      [0.55, 0.0, 0.25, 2.3],
      [-0.1, 0.03, -0.3, 0.7],
    ].map(([x, y, z, r], i) => (
      <CandybarPhone key={i} position={[x, y + 0.05, z]} rotation={[-Math.PI / 2, 0, r]} scale={0.9} />
    ))}
  </group>
);

/* ---------------- Oil rig at night (scene 6, symbolic) ---------------- */

const Flame: React.FC<{ position: V3; s?: number; phase?: number }> = ({ position, s = 1, phase = 0 }) => {
  const f = Math.floor(useCurrentFrame() / 2) * 2;
  const flick = 1 + 0.18 * Math.sin(f * 0.9 + phase) + 0.1 * Math.sin(f * 2.3 + phase * 2);
  return (
    <group position={position} scale={[s, s * flick, s]}>
      <ToonMesh color="#e0663a" outline={LINE.prop} position={[0, 0.6, 0]}>
        <coneGeometry args={[0.55, 1.4, 10]} />
      </ToonMesh>
      <InkMesh color="#f6b54a" position={[0, 0.45, 0.12]}>
        <coneGeometry args={[0.32, 0.9, 10]} />
      </InkMesh>
      <InkMesh color="#fde7a6" position={[0, 0.3, 0.2]}>
        <coneGeometry args={[0.14, 0.45, 8]} />
      </InkMesh>
    </group>
  );
};

export const OilRig: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <group>
      {/* Night sea with drifting wave ridges */}
      <ToonMesh color="#24384a" outline={0} position={[0, -0.05, -5]}>
        <boxGeometry args={[80, 0.1, 60]} />
      </ToonMesh>
      {Array.from({ length: 14 }, (_, i) => (
        <InkMesh key={i} color="#3c5a70" position={[((i * 3.7 + f * 0.01) % 26) - 13, 0.01, 4 - i * 1.4]}>
          <boxGeometry args={[2.2, 0.01, 0.06]} />
        </InkMesh>
      ))}
      {/* Moon */}
      <InkMesh color="#efe6c8" position={[-9, 9, -30]}>
        <sphereGeometry args={[1.4, 20, 14]} />
      </InkMesh>
      {/* Rig: legs, deck, derrick */}
      <group position={[1.5, 0, -4]}>
        {[-1.6, 1.6].flatMap((x) =>
          [-1.2, 1.2].map((z) => (
            <ToonMesh key={`${x}${z}`} color="#5d6168" outline={LINE.background} position={[x, 2, z]}>
              <cylinderGeometry args={[0.18, 0.22, 4, 10]} />
            </ToonMesh>
          )),
        )}
        <ToonMesh color="#6e6a62" outline={LINE.prop} position={[0, 4.1, 0]}>
          <boxGeometry args={[4.4, 0.3, 3.2]} />
        </ToonMesh>
        <ToonMesh color="#8a5a44" outline={LINE.prop} position={[-1.1, 4.8, 0.2]}>
          <boxGeometry args={[1.6, 1.1, 1.4]} />
        </ToonMesh>
        {/* Railing at the front edge */}
        <Solid name="rig railing">
          <ToonMesh color="#c9c1ad" outline={0} position={[0, 4.85, 1.55]}>
            <boxGeometry args={[4.2, 0.06, 0.06]} />
          </ToonMesh>
        </Solid>
        {Array.from({ length: 9 }, (_, i) => (
          <ToonMesh key={`r${i}`} color="#c9c1ad" outline={0} position={[-2 + i * 0.5, 4.55, 1.55]}>
            <boxGeometry args={[0.05, 0.6, 0.05]} />
          </ToonMesh>
        ))}
        <ToonMesh color="#c9c1ad" outline={LINE.background} position={[0, 4.85, 1.55]}>
          <boxGeometry args={[4.2, 0.06, 0.06]} />
        </ToonMesh>
        {/* Derrick tower */}
        {[-1, 1].flatMap((sx) =>
          [-1, 1].map((sz) => (
            <ToonMesh key={`d${sx}${sz}`} color="#5d6168" outline={LINE.background} position={[0.8 + sx * 0.35, 6.4, sz * 0.35]} rotation={[sz * 0.08, 0, -sx * 0.08]}>
              <boxGeometry args={[0.07, 4.5, 0.07]} />
            </ToonMesh>
          )),
        )}
        <Flame position={[-1.1, 5.3, 0.2]} s={1.8} />
        <Flame position={[1.2, 4.3, -0.6]} s={1.5} phase={1.7} />
        <Flame position={[-0.1, 4.3, 0.4]} s={1.0} phase={3.1} />
        <Flame position={[0.8, 7.4, 0]} s={0.9} phase={4.4} />
        {/* Warm glow on the water */}
        <mesh position={[0, 0.02, 1.5]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[3.5, 32]} />
          <meshBasicMaterial color="#e0663a" transparent opacity={0.22} depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
};

/* ---------------- Podium stage (scene 7) ---------------- */

export const PodiumStage: React.FC = () => (
  <group>
    <ToonMesh color="#4f4843" outline={0} position={[0, -0.05, 2]}>
      <boxGeometry args={[30, 0.1, 16]} />
    </ToonMesh>
    {/* Pleated backdrop */}
    {Array.from({ length: 24 }, (_, i) => (
      <ToonMesh key={i} color={i % 2 ? "#5d7a7c" : "#53706f"} outline={L} position={[-11.5 + i, 4, -3]}>
        <cylinderGeometry args={[0.55, 0.55, 8, 10, 1, false, 0, Math.PI]} />
      </ToonMesh>
    ))}
    {/* #1 (center) and #2 (screen-right) blocks */}
    <Solid name="podium #1">
      <ToonMesh color="#e6d9bc" outline={P} position={[0, 0.45, 0]}>
        <boxGeometry args={[1.6, 0.9, 1.4]} />
      </ToonMesh>
    </Solid>
    <Solid name="podium #2">
      <ToonMesh color="#d6c6a3" outline={P} position={[1.7, 0.28, 0]}>
        <boxGeometry args={[1.6, 0.56, 1.4]} />
      </ToonMesh>
    </Solid>
  </group>
);

/* ---------------- Microsoft office (scene 10) ---------------- */

export const Desk: React.FC<{ position: V3; screen?: React.ReactNode; monitor?: boolean; chair?: boolean }> = ({
  position,
  screen,
  monitor = true,
  chair = true,
}) => (
  <group position={position}>
    <Solid name="desk top">
      <ToonMesh color="#d9d2c3" outline={L} position={[0, 0.95, 0]}>
        <boxGeometry args={[1.6, 0.07, 0.8]} />
      </ToonMesh>
    </Solid>
    {[-0.72, 0.72].map((x) => (
      <ToonMesh key={x} color={C.steel} outline={L} position={[x, 0.47, 0]}>
        <boxGeometry args={[0.06, 0.94, 0.7]} />
      </ToonMesh>
    ))}
    {monitor ? (
      <Solid name="monitor">
        <ToonMesh color="#2f3033" outline={L} position={[0, 1.4, -0.22]}>
          <boxGeometry args={[0.8, 0.5, 0.05]} />
        </ToonMesh>
        <ToonMesh color="#2f3033" outline={L} position={[0, 1.08, -0.22]}>
          <boxGeometry args={[0.08, 0.2, 0.08]} />
        </ToonMesh>
        {screen ?? (
          <InkMesh color="#4a4d52" position={[0, 1.4, -0.19]}>
            <boxGeometry args={[0.72, 0.42, 0.01]} />
          </InkMesh>
        )}
      </Solid>
    ) : null}
    {chair ? <Chair position={[0, 0, 0.55]} rotY={Math.PI} /> : null}
  </group>
);

/** Line chart on the monitor; `drop` 0..1 pulls the right end down. */
const ChartScreen: React.FC<{ drop: number }> = ({ drop }) => {
  const pts = [0.12, 0.15, 0.1, 0.13 - 0.3 * drop, 0.1 - 0.42 * drop];
  return (
    <group position={[0, 1.4, -0.19]}>
      <InkMesh color="#e8f2f2">
        <boxGeometry args={[0.72, 0.42, 0.01]} />
      </InkMesh>
      {pts.slice(0, -1).map((y, i) => {
        const x0 = -0.3 + i * 0.15;
        const y1 = pts[i + 1];
        const dx = 0.15;
        const dy = y1 - y;
        return (
          <InkMesh key={i} color="#9a5a44" position={[x0 + dx / 2, (y + y1) / 2 - 0.05, 0.008]} rotation={[0, 0, Math.atan2(dy, dx)]}>
            <boxGeometry args={[Math.hypot(dx, dy), 0.018, 0.004]} />
          </InkMesh>
        );
      })}
    </group>
  );
};

export const MsOffice: React.FC<{ chartDrop: number }> = ({ chartDrop }) => (
  <group>
    <ToonMesh color="#8f8a82" outline={0} position={[0, -0.05, 0]}>
      <boxGeometry args={[40, 0.1, 30]} />
    </ToonMesh>
    <ToonMesh color="#d7d3cb" outline={0} position={[4, 4, -4]}>
      <boxGeometry args={[30, 8, 0.2]} />
    </ToonMesh>
    {/* Window band */}
    {Array.from({ length: 9 }, (_, i) => (
      <group key={i} position={[-3 + i * 2.2, 3.4, -3.85]}>
        <InkMesh color="#b9c9d4">
          <boxGeometry args={[1.9, 2.2, 0.02]} />
        </InkMesh>
        <ToonMesh color="#e9e6df" outline={L} position={[1.05, 0, 0.05]}>
          <boxGeometry args={[0.2, 2.4, 0.1]} />
        </ToonMesh>
      </group>
    ))}
    {/* BUYER's desk with the chart */}
    <Desk position={[0, 0, 0.6]} screen={<ChartScreen drop={chartDrop} />} />
    {/* Rows of empty desks receding to the right */}
    {[0, 1, 2].flatMap((r) =>
      Array.from({ length: 4 }, (_, c) => <Desk key={`${r}${c}`} position={[3.4 + c * 2.1, 0, -2.4 + r * 1.9]} />),
    )}
  </group>
);

/* ---------------- Snowy hill with a cell tower (scene 11) ---------------- */

const CellTower: React.FC<{ lightsOn: boolean; position: V3 }> = ({ lightsOn, position }) => {
  const H = 7;
  const leg = (sx: number, sz: number) => (
    <ToonMesh key={`${sx}${sz}`} color={C.steel} outline={L} position={[sx * 0.35, H / 2, sz * 0.35]} rotation={[sz * 0.07, 0, -sx * 0.07]}>
      <boxGeometry args={[0.08, H, 0.08]} />
    </ToonMesh>
  );
  return (
    <group position={position}>
      {[-1, 1].flatMap((sx) => [-1, 1].map((sz) => leg(sx, sz)))}
      {Array.from({ length: 7 }, (_, i) => {
        const y = 0.6 + i * 0.95;
        const w = 1.25 - (y / H) * 0.9;
        return (
          <group key={i} position={[0, y, 0]}>
            <ToonMesh color={C.steel} outline={0} position={[0, 0, w / 2]}>
              <boxGeometry args={[w, 0.05, 0.05]} />
            </ToonMesh>
            <ToonMesh color={C.steel} outline={0} position={[0, 0.45, w / 2]} rotation={[0, 0, 0.75]}>
              <boxGeometry args={[w * 1.25, 0.04, 0.04]} />
            </ToonMesh>
          </group>
        );
      })}
      {/* Antenna panels */}
      {[0, 1, 2].map((i) => (
        <ToonMesh key={i} color="#e9e6df" outline={P} position={[Math.sin((i * 2 * Math.PI) / 3) * 0.32, H - 0.3, Math.cos((i * 2 * Math.PI) / 3) * 0.32]} rotation={[0, (i * 2 * Math.PI) / 3, 0]}>
          <boxGeometry args={[0.22, 0.9, 0.08]} />
        </ToonMesh>
      ))}
      {/* Warning lights */}
      {[H + 0.2, H - 2.6].map((y) => (
        <group key={y} position={[0, y, 0.4]}>
          <InkMesh color={lightsOn ? "#ff8a5c" : "#7a4a3a"}>
            <sphereGeometry args={[0.1, 10, 8]} />
          </InkMesh>
          {lightsOn ? (
            <mesh>
              <sphereGeometry args={[0.32, 12, 8]} />
              <meshBasicMaterial color="#ff9a6c" transparent opacity={0.22} depthWrite={false} toneMapped={false} />
            </mesh>
          ) : null}
        </group>
      ))}
    </group>
  );
};

export const SnowyHill: React.FC<{ lightsOn: boolean }> = ({ lightsOn }) => (
  <group>
    <ToonMesh color={C.snow} outline={0} position={[0, -6.2, -2]} scale={[3, 1, 1.6]}>
      <sphereGeometry args={[6.5, 40, 24]} />
    </ToonMesh>
    {/* Distant hills */}
    {[
      [-12, -25, 9],
      [6, -30, 12],
      [20, -26, 8],
    ].map(([x, z, r], i) => (
      <ToonMesh key={i} color="#dfe5ea" outline={L} position={[x, -r * 0.55, z]} scale={[1.6, 1, 1]}>
        <sphereGeometry args={[r, 28, 16]} />
      </ToonMesh>
    ))}
    {[
      [-6.5, -4, 1.1],
      [-4.8, -6, 0.9],
      [5.8, -3.5, 1.2],
      [7.4, -6.5, 1],
      [-8.5, -8, 1.3],
    ].map(([x, z, s], i) => (
      <Pine key={i} position={[x, -0.15, z]} s={s} />
    ))}
    <CellTower lightsOn={lightsOn} position={[1.6, 0.1, -2.2]} />
    <Snow count={90} box={{ x: [-9, 9], y: [-0.5, 9], z: [-6, 4] }} size={0.05} seed="hill" />
  </group>
);
