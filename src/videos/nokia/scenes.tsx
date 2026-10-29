import { useCurrentFrame, useVideoConfig } from "remotion";
import { business } from "./cast";
import { founderLook } from "../../characters/toonfolk/founder";
import { audienceLook } from "../../characters/toonfolk/crowd";
import { ToonPerson } from "../../characters/toonfolk/ToonPerson";
import { TitleCard } from "../../components/TitleCard";
import { AUDIENCE, AudienceMember } from "../../scenes/keynote/KeynoteScene";
import { Hall } from "../../scenes/keynote/Hall";
import { onTwos } from "../../toon/toon";
import { Briefcase, CandybarPhone, lerp, Memo, Pen, SceneCanvas, SlabPhone, StatPop, useSnap, wordFrame } from "./kit";
import { Boardroom, MsOffice, PhoneShop, PodiumStage, SnowyHill } from "./sets";
import w01 from "../../../public/captions/nokia-01.json";
import w02 from "../../../public/captions/nokia-02.json";
import w03 from "../../../public/captions/nokia-03.json";
import w04 from "../../../public/captions/nokia-04.json";
import w05 from "../../../public/captions/nokia-05.json";
import w06 from "../../../public/captions/nokia-06.json";
import w07 from "../../../public/captions/nokia-07.json";
import w08 from "../../../public/captions/nokia-08.json";
import w09 from "../../../public/captions/nokia-09.json";
import w10 from "../../../public/captions/nokia-10.json";
import w11 from "../../../public/captions/nokia-11.json";

const { exec, execScarf, ceo, buyer, clerk, rival } = business;

/** Boardroom camera (scenes 2, 4, 5, 6, 8). */
const ROOM = { from: [0.4, 2.3, 9.5] as [number, number, number], lookFrom: [0.4, 1.75, -1] as [number, number, number] };
/** Characters stand behind the table at this depth. */
const BEHIND = -1.6;
const ROOM_BG = "#e2d8c4";

/** Small walk bob on twos for characters that move. */
const bob = (f: number, phase = 0) => 0.035 * Math.abs(Math.sin(onTwos(f) * 0.32 + phase));

/* ---------- 1: phone shop hook ---------- */
export const Scene01: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const four = wordFrame(w01, "four", fps);
  const blink = (f >= 30 && f < 34) || (f >= four + 26 && f < four + 30);
  return (
    <>
      <SceneCanvas mood="interior" bg="#d9cdb3" cam={{ from: [0.3, 2.1, 8.2], to: [-0.4, 1.8, 6.2], lookFrom: [0, 1.5, 0], lookTo: [-0.5, 1.45, 0], fov: 34 }}>
        <PhoneShop litCount={onTwos(f) >= four ? 4 : 0} />
        <ToonPerson build="tall" look={clerk} position={[2.3, 0, -1.0]} pose={{ blink: blink ? 1 : 0, browR: 0.1, headTilt: f > four + 6 ? 0.06 : 0 }} />
      </SceneCanvas>
      <TitleCard text="NOKIA, 2007" from={4} top={110} />
    </>
  );
};

/* ---------- 2: boardroom, biggest phone maker ---------- */
export const Scene02: React.FC = () => {
  const snap = useSnap();
  const { fps } = useVideoConfig();
  const tap = snap(wordFrame(w02, "biggest", fps)) - snap(wordFrame(w02, "biggest", fps) + 6) + snap(wordFrame(w02, "world.", fps) - 4) * 0.6;
  return (
    <SceneCanvas mood="interior" bg={ROOM_BG} cam={{ from: [2.0, 2.2, 6.6], lookFrom: [2.2, 1.8, -1.4], fov: 34 }}>
      <Boardroom chartLevel={1} />
      <ToonPerson build="tall"
        look={exec}
        position={[2.1, 0, -1.25]}
        rotation={[0, -0.55, 0]}
        pose={{
          left: { forward: 0.9 + 0.25 * tap, out: 0.55, elbow: 0.35, twist: 0.4 },
          browL: 0.5,
          headTilt: 0.07 * snap(10),
          headTurn: 0.25,
        }}
      />
    </SceneCanvas>
  );
};

/* ---------- 3: keynote, iPhone ---------- */
export const Scene03: React.FC = () => {
  const snap = useSnap();
  const { fps } = useVideoConfig();
  const up = snap(wordFrame(w03, "iphone.", fps) - 4);
  return (
    <SceneCanvas mood="stage" bg="#2f2a27" cam={{ from: [0.35, 1.7, 15.2], to: [0, 1.7, 13.4], lookFrom: [0.15, 2.95, 0], lookTo: [0, 2.95, 0], fov: 31 }}>
      <pointLight position={[0, 4.5, -1.2]} intensity={6} distance={9} color="#cdeee8" />
      <Hall />
      <ToonPerson build="tall"
        look={founderLook}
        position={[0, 0.6, -0.15]}
        pose={{
          right: { forward: lerp(0.1, 1.35, up), out: lerp(0.12, 0.35, up), elbow: lerp(0.2, 0.55, up), twist: lerp(0, -1.4, up) },
          lean: 0.04 * up,
          browL: 0.5 * up,
          browR: 0.3 * up,
          mouth: 0,
        }}
        rightHand={<SlabPhone position={[0, -0.3, 0.02]} rotation={[0, 0, Math.PI]} scale={1.2} />}
      />
      {AUDIENCE.map((m, i) => (
        <AudienceMember key={i} m={m} />
      ))}
    </SceneCanvas>
  );
};

/* ---------- 4: the burning platform memo ---------- */
export const Scene04: React.FC = () => {
  const f = useCurrentFrame();
  const snap = useSnap();
  const { fps } = useVideoConfig();
  const slideAt = 16;
  const slide = snap(slideAt, 200, 20);
  const pickAt = slideAt + 26;
  const picked = onTwos(f) >= pickAt;
  const read = snap(pickAt);
  const burn = snap(wordFrame(w04, "burning", fps));
  return (
    <>
      <SceneCanvas mood="interior" bg={ROOM_BG} cam={{ ...ROOM, fov: 34 }}>
        <Boardroom chartLevel={1} />
        {!picked ? <Memo position={[lerp(-0.9, 0.85, slide), 1.07, -0.75]} rotation={[0, 0.2, 0]} /> : null}
        <ToonPerson build="tall"
          look={ceo}
          position={[-1.25, 0, BEHIND]}
          rotation={[0, 0.45, 0]}
          pose={{
            left: { forward: 0.75 + 0.35 * (slide - snap(slideAt + 14)), out: 0.1, elbow: 0.45, inward: 0.2 },
            browSlant: -0.3,
          }}
        />
        <ToonPerson build="tall"
          look={exec}
          position={[1.25, 0, BEHIND]}
          rotation={[0, -0.4, 0]}
          pose={{
            left: { forward: lerp(0.3, 1.05, read), out: 0.15, elbow: lerp(0.4, 1.25, read), inward: 0.35 },
            headNod: 0.12 * read - 0.1 * burn,
            browL: 0.95 * burn,
            browR: 0.95 * burn,
          }}
          leftHand={picked ? <Memo position={[0, -0.16, 0.05]} rotation={[Math.PI / 2, 0, 0]} /> : undefined}
        />
      </SceneCanvas>
      <TitleCard text="FEB 2011" from={2} top={110} />
    </>
  );
};

/* ---------- 5: the Windows Phone handshake ---------- */
export const Scene05: React.FC = () => {
  const f = useCurrentFrame();
  const snap = useSnap();
  const { fps } = useVideoConfig();
  const walk = snap(0, 120, 20);
  const shake = snap(wordFrame(w05, "bet", fps) - 4);
  const pump = Math.sin(onTwos(f) * 0.6) * 0.06 * shake;
  return (
    <SceneCanvas mood="interior" bg={ROOM_BG} cam={{ ...ROOM, to: [0.2, 2.2, 8.6], fov: 34 }}>
      <Boardroom chartLevel={1} />
      <ToonPerson build="tall"
        look={ceo}
        position={[-0.95, 0, BEHIND]}
        rotation={[0, 0.9, 0]}
        pose={{ right: { forward: lerp(0.1, 1.2, shake) + pump, out: 0.05, elbow: lerp(0.2, 0.35, shake), inward: 0.15 }, browR: 0.2 }}
      />
      <ToonPerson build="tall"
        look={buyer}
        position={[lerp(4.6, 0.85, walk), walk < 0.97 ? bob(f) : 0, BEHIND]}
        rotation={[0, -0.9, 0]}
        pose={{ right: { forward: lerp(0.1, 1.2, shake) - pump, out: 0.05, elbow: lerp(0.2, 0.35, shake), inward: 0.15 }, browL: 0.35 }}
      />
      <ToonPerson build="tall"
        look={exec}
        position={[2.6, 0, -2.4]}
        rotation={[0, -0.5, 0]}
        pose={{ left: { forward: 1.05, out: 0.15, elbow: 1.25, inward: 0.35 }, headTurn: 0.3, browL: 0.3 }}
        leftHand={<Memo position={[0, -0.16, 0.05]} rotation={[Math.PI / 2, 0, 0]} />}
      />
    </SceneCanvas>
  );
};

/* ---------- 6: the numbers kept falling ---------- */
export const Scene06: React.FC = () => {
  const snap = useSnap();
  const { fps } = useVideoConfig();
  const s1 = snap(wordFrame(w06, "falling.", fps));
  const s2 = snap(wordFrame(w06, "falling.", fps) + 60);
  const s3 = snap(wordFrame(w06, "below", fps));
  const level = 1 - 0.13 * s1 - 0.13 * s2 - 0.14 * s3;
  const droop = s1 + s2 + s3;
  return (
    <>
      <SceneCanvas mood="interior" bg={ROOM_BG} cam={{ ...ROOM, fov: 34 }}>
        <Boardroom chartLevel={level} memoOnTable />
        <ToonPerson build="tall"
          look={exec}
          position={[2.25, 0, -1.25]}
          rotation={[0, -0.55, 0]}
          pose={{ headNod: 0.08 * droop, headTurn: 0.25, browSlant: 0.15 * droop, shoulderShift: 0.02 * droop }}
        />
      </SceneCanvas>
      <StatPop text="25%" at={wordFrame(w06, "quarter.", fps)} x={1640} y={300} size={80} />
    </>
  );
};

/* ---------- 7: losing #1 to Samsung (symbolic podium) ---------- */
export const Scene07: React.FC = () => {
  const f = useCurrentFrame();
  const snap = useSnap();
  const { fps } = useVideoConfig();
  const lost = wordFrame(w07, "lost", fps);
  const walkIn = snap(0, 120, 20);
  const down = snap(lost - 6, 220, 16);
  const up = snap(lost + 10, 220, 16);
  const hop = (t: number) => Math.sin(Math.PI * Math.min(1, Math.max(0, t))) * 0.35;
  return (
    <>
      <SceneCanvas mood="stage" bg="#3f4a4a" cam={{ from: [0.3, 2.5, 9.5], lookFrom: [0.5, 1.9, 0], fov: 34 }}>
        <pointLight position={[0.5, 6, 3]} intensity={18} distance={14} color="#fff1d6" />
        <PodiumStage />
        <ToonPerson build="tall"
          look={exec}
          position={[lerp(0, 1.7, down), lerp(0.9, 0.56, down) + hop(down), 0]}
          pose={{ headNod: 0.1 * down, browSlant: 0.4 * down, shoulderShift: -0.03 * down }}
        />
        <ToonPerson build="tall"
          look={rival}
          position={[lerp(lerp(-4.5, -1.3, walkIn), 0, up), lerp(0, 0.9, up) + hop(up) + (walkIn < 0.97 ? bob(f, 1) : 0), lerp(0.9, 0, up)]}
          pose={{ browL: 0.3, browR: 0.3, lean: 0.03 * up }}
        />
      </SceneCanvas>
      <StatPop text="#1" at={4} x={875} y={815} size={70} rotate={0} />
      <StatPop text="#2" at={4} x={1200} y={865} size={70} rotate={0} />
    </>
  );
};

/* ---------- 8: the sale ---------- */
export const Scene08: React.FC = () => {
  const f = useCurrentFrame();
  const snap = useSnap();
  const { fps } = useVideoConfig();
  const writing = onTwos(f) > 10 && onTwos(f) < 70 ? Math.sin(onTwos(f) * 0.9) * 0.05 : 0;
  const pass = snap(wordFrame(w08, "deal", fps) - 6, 200, 20);
  return (
    <>
      <SceneCanvas mood="interior" bg={ROOM_BG} cam={{ ...ROOM, to: [0.3, 2.2, 8.4], fov: 34 }}>
        <Boardroom chartLevel={0.6} memoOnTable />
        <Briefcase position={[lerp(0.75, -0.55, pass), 1.27, -0.75]} />
        <ToonPerson build="tall"
          look={ceo}
          position={[-1.0, 0, BEHIND]}
          rotation={[0, 0.35, 0]}
          pose={{ right: { forward: 0.95 + writing, out: 0.0, elbow: 0.75, inward: 0.25 }, headNod: 0.15, browSlant: -0.2 }}
          rightHand={<Pen position={[0, -0.12, 0.05]} rotation={[0.4, 0, 0]} />}
        />
        <ToonPerson build="tall"
          look={buyer}
          position={[1.0, 0, BEHIND]}
          rotation={[0, -0.35, 0]}
          pose={{ right: { forward: lerp(0.3, 1.0, pass - snap(wordFrame(w08, "deal", fps) + 14)), out: 0.05, elbow: 0.5, inward: 0.3 }, browL: 0.4 }}
        />
      </SceneCanvas>
      <TitleCard text="SEP 2013" from={2} top={110} />
      <StatPop text="€5.44B" at={wordFrame(w08, "five", fps)} x={1180} y={190} size={140} />
    </>
  );
};

/* ---------- 9: 32,000 employees move, including the CEO ---------- */
const WALKERS: [string, string, "short" | "bald" | "bun" | "curly" | "long" | "beanie", string][] = [
  ["w1", "#6b7451", "short", "#3d2c22"],
  ["w2", "#8a6a4a", "long", "#5a4232"],
  ["w3", "#55606a", "bald", ""],
  ["w4", "#7a5048", "curly", "#2f2520"],
  ["w5", "#4b5059", "bun", "#6a4e39"],
  ["w6", "#5f7b93", "short", "#6a4e39"],
  ["w7", "#a08458", "beanie", "#7c8656"],
];

export const Scene09: React.FC = () => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const snap = useSnap();
  const incl = wordFrame(w09, "including", fps);
  const grab = snap(incl);
  const go = Math.max(0, onTwos(f) - (incl + 12));
  const ceoX = -1.0 + go * 0.065;
  return (
    <SceneCanvas mood="interior" bg={ROOM_BG} cam={{ from: [0.3, 2.8, 12.5], lookFrom: [0.3, 1.8, -1], fov: 34 }}>
      <Boardroom chartLevel={0.6} memoOnTable />
      {grab < 0.5 ? <Briefcase position={[-0.55, 1.27, -0.75]} /> : null}
      {WALKERS.map(([id, jacket, hair, hc], i) => {
        const x = -7.5 + onTwos(f) * (14 / durationInFrames) - i * 1.25;
        return (
          <ToonPerson build="tall" key={id} look={audienceLook(jacket, hair, hc)} position={[x, bob(f, i), -2.6]} rotation={[0, Math.PI / 2, 0]} />
        );
      })}
      <ToonPerson build="tall"
        look={ceo}
        position={[ceoX, go > 0 ? bob(f) : 0, BEHIND]}
        rotation={[0, lerp(0.3, Math.PI / 2, Math.min(1, go / 6)), 0]}
        pose={{ right: { forward: lerp(0.9, 0.05, Math.min(1, go / 6)), out: 0.08, elbow: lerp(0.6, 0.15, Math.min(1, go / 6)), inward: 0.2 }, browR: 0.1 }}
        rightHand={grab >= 0.5 ? <Briefcase position={[0, -0.32, 0]} rotation={[0, Math.PI / 2, 0]} /> : undefined}
      />
      <ToonPerson build="tall" look={buyer} position={[4.2, 0, -1.2]} rotation={[0, -0.6, 0]} pose={{ headNod: 0.08 * snap(incl + 20), browL: 0.3 }} />
    </SceneCanvas>
  );
};

/* ---------- 10: the write-down ---------- */
export const Scene10: React.FC = () => {
  const snap = useSnap();
  const { fps } = useVideoConfig();
  const seven = wordFrame(w10, "seven", fps);
  const drop = 0.5 * snap(seven) + 0.5 * snap(wordFrame(w10, "charge", fps));
  const look = snap(wordFrame(w10, "jobs.", fps) - 30, 200, 20);
  return (
    <>
      <SceneCanvas mood="interior" bg="#d7d3cb" cam={{ from: [0.3, 2.4, 6.6], to: [3.4, 2.5, 7.4], lookFrom: [0.1, 1.55, 0], lookTo: [4.2, 1.35, -1.2], fov: 34 }}>
        <MsOffice chartDrop={drop} />
        <ToonPerson build="tall"
          look={buyer}
          position={[0, 0, -0.15]}
          pose={{
            headNod: 0.18 * (1 - look) + 0.04,
            headTurn: 0.7 * look,
            browSlant: 0.3 * drop,
            right: { forward: 0.6, out: 0.05, elbow: 0.7, inward: 0.3 },
            left: { forward: 0.6, out: 0.05, elbow: 0.7, inward: 0.3 },
          }}
        />
      </SceneCanvas>
      <TitleCard text="JUL 2015" from={2} top={110} />
      <StatPop text="$7.6B" at={seven} x={960} y={300} size={150} />
    </>
  );
};

/* ---------- 11: Nokia survived ---------- */
export const Scene11: React.FC = () => {
  const f = useCurrentFrame();
  const snap = useSnap();
  const { fps } = useVideoConfig();
  const lightsOn = onTwos(f) >= wordFrame(w11, "builds", fps);
  const phoneAt = wordFrame(w11, "doesn't", fps);
  const out = snap(phoneAt - 4) - snap(phoneAt + 44);
  const holding = onTwos(f) >= phoneAt && onTwos(f) < phoneAt + 50;
  return (
    <SceneCanvas mood="snow" bg="#c9d6e0" cam={{ from: [0.2, 2.3, 10.5], to: [-0.4, 2.0, 8.4], lookFrom: [0.2, 2.4, -1], lookTo: [-0.2, 2.1, -1], fov: 34 }}>
      <SnowyHill lightsOn={lightsOn} />
      <ToonPerson build="tall"
        look={execScarf}
        position={[-1.7, 0.2, 0.6]}
        rotation={[0, lerp(0.55, 0.15, snap(phoneAt - 10)), 0]}
        pose={{
          right: { forward: lerp(0.05, 1.15, out), out: 0.1, elbow: lerp(0.15, 1.2, out), inward: lerp(0, 0.4, out) },
          headNod: 0.22 * out,
          headTurn: lerp(0.35, 0, snap(phoneAt - 10)),
          browL: 0.2,
          browSlant: 0.25 * out,
        }}
        rightHand={holding ? <CandybarPhone position={[0, -0.2, 0.06]} rotation={[0, 0, Math.PI]} scale={0.8} /> : undefined}
      />
    </SceneCanvas>
  );
};

export const SCENES = [Scene01, Scene02, Scene03, Scene04, Scene05, Scene06, Scene07, Scene08, Scene09, Scene10, Scene11];
