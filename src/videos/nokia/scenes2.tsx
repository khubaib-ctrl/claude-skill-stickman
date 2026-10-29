import { useCurrentFrame, useVideoConfig } from "remotion";
import { audienceLook } from "../../characters/toonfolk/crowd";
import { founderLook } from "../../characters/toonfolk/founder";
import { ToonPerson } from "../../characters/toonfolk/ToonPerson";
import { TitleCard } from "../../components/TitleCard";
import { AUDIENCE, AudienceMember } from "../../scenes/keynote/KeynoteScene";
import { Hall } from "../../scenes/keynote/Hall";
import { ExpectContact } from "../../toon/qa";
import { onTwos } from "../../toon/toon";
import { business } from "./cast";
import {
  CandybarPhone,
  carry,
  handshake,
  Label3D,
  reachBlend,
  restReach,
  lerp,
  Memo,
  MovingBox,
  Pen,
  QuoteCard,
  SceneCanvas,
  Sfx,
  SlabPhone,
  StatPop,
  useSnap,
  wordFrame,
} from "./kit";
import { Boardroom, BOX_CORNER, LAPTOP_KEYS, MsOffice, OilRig, PhoneShop, PodiumStage, SnowyHill } from "./sets";
import w01 from "../../../public/captions/nokia2-01.json";
import w02 from "../../../public/captions/nokia2-02.json";
import w03 from "../../../public/captions/nokia2-03.json";
import w04 from "../../../public/captions/nokia2-04.json";
import w05 from "../../../public/captions/nokia2-05.json";
import w06 from "../../../public/captions/nokia2-06.json";
import w07 from "../../../public/captions/nokia2-07.json";
import w08 from "../../../public/captions/nokia2-08.json";
import w09 from "../../../public/captions/nokia2-09.json";
import w10 from "../../../public/captions/nokia2-10.json";
import w11 from "../../../public/captions/nokia2-11.json";
import w12 from "../../../public/captions/nokia2-12.json";
import w13 from "../../../public/captions/nokia2-13.json";
import w14 from "../../../public/captions/nokia2-14.json";

/** Caption timings per scene, used for beat timing here and for music ducking. */
export const WORDS = [w01, w02, w03, w04, w05, w06, w07, w08, w09, w10, w11, w12, w13, w14];

const { platform, exec, execScarf, ceo, buyer, clerk, rival } = business;
type V3 = [number, number, number];
const ROOM = { from: [0.4, 2.3, 9.5] as V3, lookFrom: [0.4, 1.75, -1] as V3 };
const ROOM_BG = "#e2d8c4";
/** Characters behind the boardroom table stand here (clear of the tabletop). */
const BEHIND = -1.9;
/** EXEC's spot beside the table end, near the chart (clear of table and easel). */
/** EXEC stands to the RIGHT of the chart, facing it, so he never hides the bars (any format). */
const BY_CHART: V3 = [4.4, 0, -1.3];
const bob = (f: number, phase = 0) => 0.035 * Math.abs(Math.sin(onTwos(f) * 0.32 + phase));
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const RELAXED_R = { forward: 0.04, out: 0.12, elbow: 0.15 };
const MEMO_IN_HAND = <Memo position={[0, -0.16, 0.05]} rotation={[Math.PI / 2, 0, 0]} />;

/* ---------- 1: hook, 4 of 10 phones light up ---------- */
const S01: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const four = wordFrame(w01, "four", fps);
  const lit = onTwos(f) >= four ? Math.min(4, 1 + Math.floor((onTwos(f) - four) / 3)) : 0;
  return (
    <>
      <SceneCanvas qa="S01" mood="interior" bg="#d9cdb3" cam={{ from: [0.3, 2.1, 8.2], to: [-0.4, 1.8, 6.4], lookFrom: [0, 1.5, 0], lookTo: [-0.5, 1.45, 0], portrait: { from: [1.1, 2.0, 8.6], to: [0.9, 1.9, 7.6], lookFrom: [1.0, 1.55, 0], lookTo: [0.9, 1.5, 0] } }}>
        <PhoneShop litCount={lit} />
        <ToonPerson build="tall" name="CLERK" look={clerk} position={[2.3, 0, -1.0]} pose={{ blink: f >= 30 && f < 34 ? 1 : 0, browR: 0.1, headTilt: f > four + 12 ? 0.06 : 0 }} />
      </SceneCanvas>
      <Sfx name="shop-bell" at={0} volume={0.3} />
      {[0, 3, 6, 9].map((d) => (
        <Sfx key={d} name="blip" at={four + d} volume={0.22} />
      ))}
    </>
  );
};

/* ---------- 2: phones go dark, light off, title slam ---------- */
const S02: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const snap = useSnap();
  const sold = wordFrame(w02, "sold", fps);
  const sw = wordFrame(w02, "this", fps);
  const lost = wordFrame(w02, "lost", fps);
  const lit = Math.max(0, 4 - Math.max(0, Math.floor((onTwos(f) - sold) / 4) + 1) * (onTwos(f) >= sold ? 1 : 0));
  const reach = snap(sw - 8) - snap(sw + 10);
  const dark = onTwos(f) >= sw;
  return (
    <>
      <SceneCanvas qa="S02" mood="interior" bg={dark ? "#8f8673" : "#d9cdb3"} dim={dark ? 0.45 : 1} cam={{ from: [-0.4, 1.8, 6.4], to: [-0.2, 1.9, 7.0], lookFrom: [-0.5, 1.45, 0], lookTo: [0, 1.5, 0], portrait: { from: [0.9, 1.9, 7.6], to: [1.0, 2.0, 8.2], lookFrom: [0.9, 1.5, 0], lookTo: [1.0, 1.55, 0] } }}>
        <PhoneShop litCount={lit} />
        <ToonPerson build="tall" name="CLERK" look={clerk}
          position={[2.3, 0, -1.0]}
          rotation={[0, -0.6 * reach, 0]}
          pose={{ left: { forward: 0.4 * reach, out: 1.2 * reach + 0.1, elbow: 0.2 }, headTurn: 0.4 * reach, browSlant: 0.2 }}
        />
      </SceneCanvas>
      <StatPop text="HOW NOKIA LOST" at={lost} x={960} y={420} size={150} rotate={-5} />
      <Sfx name="power-down" at={sold} volume={0.3} />
      <Sfx name="switch" at={sw} volume={0.5} />
      <Sfx name="title-thud" at={lost} volume={0.55} />
    </>
  );
};

/* ---------- 3: boardroom → keynote → boardroom ---------- */
const S03: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const snap = useSnap();
  const apple = wordFrame(w03, "apple", fps);
  const wrong = wordFrame(w03, "what", fps);
  const tap = snap(wordFrame(w03, "biggest", fps)) - snap(wordFrame(w03, "biggest", fps) + 6);
  const sip = snap(wrong + 4) - snap(wrong + 34);
  const part = f < apple ? "a" : f < wrong ? "b" : "c";
  const up = snap(apple + 6);
  return (
    <>
      {part === "b" ? (
        <SceneCanvas qa="S03" mood="stage" bg="#2f2a27" cam={{ from: [0.2, 1.7, 14.4], lookFrom: [0.1, 2.95, 0], fov: 31 }}>
          <pointLight position={[0, 4.5, -1.2]} intensity={6} distance={9} color="#cdeee8" />
          <Hall />
          <ToonPerson build="tall" name="PRESENTER" look={founderLook}
            position={[0, 0.6, -0.15]}
            pose={{
              right: { forward: lerp(0.1, 1.35, up), out: lerp(0.12, 0.35, up), elbow: lerp(0.2, 0.55, up), twist: lerp(0, -1.4, up) },
              lean: 0.04 * up,
              browL: 0.5 * up,
              browR: 0.3 * up,
            }}
            rightHand={<SlabPhone position={[0, -0.3, 0.02]} rotation={[0, 0, Math.PI]} scale={1.2} />}
          />
          {AUDIENCE.map((m, i) => (
            <AudienceMember key={i} m={m} />
          ))}
        </SceneCanvas>
      ) : (
        <SceneCanvas qa="S03" mood="interior" bg={ROOM_BG} cam={{ from: [2.4, 2.2, 6.8], lookFrom: [3.6, 1.8, -1.5], portrait: { from: [2.5, 2.25, 6.4], lookFrom: [3.75, 1.8, -1.6] } }}>
          <Boardroom chartLevel={1} />
<ToonPerson build="tall"
            name="EXEC"
            look={exec}
            position={BY_CHART}
            rotation={[0, part === "a" ? 0.6 : 0.25, 0]}
            pose={
              part === "a"
                ? { right: { forward: 0.9 + 0.25 * tap, out: 0.55, elbow: 0.35, twist: 0.4 }, browL: 0.5, headTurn: -0.25 }
                : {
                    right: { forward: lerp(0.3, 1.2, sip), out: 0.1, elbow: lerp(0.5, 2.0, sip), inward: lerp(0.2, 0.5, sip) },
                    left: { forward: 0.15, out: lerp(0.15, 0.55, snap(wrong)), elbow: 0.6, twist: 1.2 },
                    shoulderShift: 0.05 * (snap(wrong) - snap(wrong + 14)),
                    browL: 0.6,
                    browR: 0.2,
                  }
            }
            rightHand={
              part === "c" && sip > 0.2 ? (
                <mesh position={[0, -0.12, 0.06]}>
                  <cylinderGeometry args={[0.06, 0.05, 0.18, 12]} />
                  <meshToonMaterial color="#cfe3e6" />
                </mesh>
              ) : undefined
            }
          />
        </SceneCanvas>
      )}
      <TitleCard text="NOKIA, 2007" from={2} top={110} />
      <Sfx name="whoosh" at={apple - 3} volume={0.15} />
      <Sfx name="crowd" at={apple} volume={0.13} />
      <Sfx name="camera-click" at={apple + 10} volume={0.28} />
      <Sfx name="whoosh" at={wrong - 3} volume={0.15} />
    </>
  );
};

/* ---------- 4: the CEO types the memo; verbatim quote card ---------- */
const S04: React.FC = () => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const qi = w04.findIndex((w) => w.text.trim().toLowerCase().startsWith("writing")) + 1;
  const quoteEnd = Math.round((w04[w04.length - 1].endMs / 1000) * fps);
  const typing = f < quoteEnd;
  const tap = (phase: number) => (typing ? 0.02 * Math.abs(Math.sin(onTwos(f) * 1.1 + phase)) : 0);
  const [kx, ky, kz] = LAPTOP_KEYS;
  return (
    <>
      <SceneCanvas qa="S04" mood="interior" bg={ROOM_BG} cam={{ from: [-1.0, 2.3, 6.6], to: [-1.4, 2.25, 5.8], lookFrom: [-1.9, 1.75, 0.9], lookTo: [-2.0, 1.85, 0.9] }}>
        <Boardroom chartLevel={1} ceoDesk />
        <ToonPerson build="tall" name="CEO" look={ceo}
          position={[-2.6, 0, 1.05]}
          pose={{
            right: { reach: [kx - 0.13, ky + 0.05 + tap(0), kz], world: true, thumb: [1, 0, 0.3] },
            left: { reach: [kx + 0.13, ky + 0.05 + tap(1.7), kz], world: true, thumb: [-1, 0, 0.3] },
            headNod: 0.18,
            browSlant: 0.25,
            lean: f > quoteEnd ? -0.04 : 0.03,
          }}
        />
      </SceneCanvas>
      <TitleCard text="FEB 2011" from={2} top={110} />
      <QuoteCard words={w04} fromIndex={qi} x={1010} y={250} width={800} />
      <Sfx name="typing" at={4} volume={0.13} />
      <Sfx name="typing" at={Math.round((w04[qi].startMs / 1000) * fps)} volume={0.13} />
      <Sfx name="typing" at={Math.round((w04[qi].startMs / 1000) * fps) + 45} volume={0.13} />
      <Sfx name="ding" at={Math.min(quoteEnd + 2, durationInFrames - 20)} volume={0.35} />
    </>
  );
};

/* ---------- 5: touchscreens topple Nokia's phone stack ---------- */
const S05: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const snap = useSnap();
  const android = wordFrame(w05, "android", fps);
  const taken = wordFrame(w05, "taken", fps);
  const slide = snap(android, 160, 20);
  const fall = clamp01((onTwos(f) - taken) / 12);
  const toppled = onTwos(f) >= taken + 12;
  const twitch = snap(wordFrame(w05, "lead", fps)) - snap(wordFrame(w05, "lead", fps) + 8);
  return (
    <>
      <SceneCanvas qa="S05" mood="interior" bg={ROOM_BG} cam={{ from: [0.6, 2.2, 6.4], lookFrom: [0.5, 1.55, -0.8] }}>
        <Boardroom chartLevel={1} phonePile={toppled} />
        {/* Nokia's stack of candybar phones */}
        {!toppled
          ? Array.from({ length: 6 }, (_, i) => (
              <CandybarPhone
                key={i}
                position={[0.5 + fall * (0.25 + 0.12 * i), 1.1 + i * 0.1 - fall * i * 0.08, -0.6]}
                rotation={[-Math.PI / 2, 0, -fall * (1.0 + 0.25 * i)]}
                scale={0.9}
              />
            ))
          : null}
        {/* The touchscreen stack slides in from the left */}
        {Array.from({ length: 5 }, (_, i) => (
          <SlabPhone key={i} position={[lerp(-2.6, -0.05, slide), 1.08 + i * 0.055, -0.6]} rotation={[-Math.PI / 2, 0, 0.1 * i]} scale={1.1} />
        ))}
        <ToonPerson build="tall" name="EXEC" look={exec} position={[0.9, 0, BEHIND]} rotation={[0, -0.25, 0]} pose={{ headNod: 0.2, browL: 0.15 + 0.7 * twitch, browR: 0.1 }} />
      </SceneCanvas>
      <Sfx name="whoosh" at={android} volume={0.15} />
      <Sfx name="clatter" at={taken} volume={0.5} />
    </>
  );
};

/* ---------- 6: the burning platform parable, then the memo read aloud ---------- */
const SlabPile: React.FC = () => (
  <>
    {Array.from({ length: 5 }, (_, i) => (
      <SlabPhone key={i} position={[-0.05, 1.08 + i * 0.055, -0.6]} rotation={[-Math.PI / 2, 0, 0.1 * i]} scale={1.1} />
    ))}
  </>
);

const S06: React.FC = () => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const snap = useSnap();
  const jumps = wordFrame(w06, "jumps", fps);
  const cut = wordFrame(w06, "wrote", fps) - 6;
  const burn = wordFrame(w06, "burning", fps, 1);
  const t = clamp01((onTwos(f) - jumps) / 22);
  const landed = onTwos(f) >= jumps + 22;
  const putDown = snap(durationInFrames - 22, 200, 20);
  const memoDown = onTwos(f) >= durationInFrames - 12;
  return (
    <>
      {f < cut ? (
        <SceneCanvas qa="S06" mood="stage" bg="#141d29" dim={0.7} cam={{ from: [0.2, 3.4, 8.0], to: [0.5, 3.6, 7.0], lookFrom: [1.2, 4.0, -3.2], lookTo: [1.2, 4.2, -3.2] }}>
          <pointLight position={[1.5, 6, -3]} intensity={30} distance={16} color="#ff9a5c" />
          <OilRig />
          <ToonPerson build="tall" name="PLATFORM" look={platform}
            scale={0.75}
            position={landed ? [1.0, -1.6, -1.2] : [1.0, 4.25 + Math.sin(Math.PI * t) * 1.2 - t * 4.25, -2.65 + t * 1.45]}
            rotation={[t * 0.6, 0, 0]}
            pose={{ right: { forward: 0, out: 0.3 + 2.2 * t, elbow: 0.2 }, left: { forward: 0, out: 0.3 + 2.2 * t, elbow: 0.2 }, browL: 0.8 * t, browR: 0.8 * t }}
          />
          {landed ? (
            <mesh position={[1.0, 0.05, -1.2]} rotation={[-Math.PI / 2, 0, 0]} scale={1 + (onTwos(f) - jumps - 22) * 0.06}>
              <ringGeometry args={[0.4, 0.55, 32]} />
              <meshBasicMaterial color="#e8f2f6" transparent opacity={Math.max(0, 0.8 - (f - jumps - 22) * 0.025)} toneMapped={false} />
            </mesh>
          ) : null}
        </SceneCanvas>
      ) : (
        <SceneCanvas qa="S06" mood="interior" bg={ROOM_BG} cam={{ ...ROOM, to: [0.3, 2.2, 8.4] }}>
          <Boardroom chartLevel={1} phonePile memoOnTable={memoDown} />
          <SlabPile />
          <ToonPerson build="tall" name="CEO" look={ceo}
            position={[-1.2, 0, BEHIND]}
            rotation={[0, 0.2, 0]}
            pose={{ right: { forward: lerp(1.0, 0.75, putDown), out: 0.05, elbow: lerp(1.25, 0.6, putDown), inward: 0.35 }, headNod: 0.15, browSlant: 0.2 }}
            rightHand={!memoDown ? MEMO_IN_HAND : undefined}
          />
          <ToonPerson build="tall" name="EXEC" look={exec} position={[1.6, 0, BEHIND]} rotation={[0, -0.45, 0]} pose={{ browL: 0.95 * snap(burn), browR: 0.95 * snap(burn) }} />
        </SceneCanvas>
      )}
      <Sfx name="wind" at={0} volume={0.15} />
      <Sfx name="fire" at={0} volume={0.15} />
      <Sfx name="whoosh" at={jumps} volume={0.15} />
      <Sfx name="splash" at={jumps + 22} volume={0.55} />
    </>
  );
};

/* ---------- 7: flashback, the CEO arrives from Microsoft with a box ---------- */
const S07: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const snap = useSnap();
  const from = wordFrame(w07, "from", fps);
  const walk = snap(0, 70, 20);
  const setAt = Math.round(from * 0.55);
  const set = snap(setAt, 200, 20);
  const stare = snap(from - 2);
  const pos: V3 = [lerp(-6.5, -3.0, walk), walk < 0.97 ? bob(f) : 0, -1.95];
  const facing = lerp(Math.PI / 2, 0.15, Math.max(walk > 0.97 ? 1 : 0, stare));
  const holding = set < 0.5;
  const c = carry(pos, holding ? Math.PI / 2 : facing, { build: "tall" });
  return (
    <>
      <SceneCanvas qa="S07" mood="interior" bg={ROOM_BG} cam={{ from: [-1.4, 2.3, 8.6], lookFrom: [-1.6, 1.7, -1.2] }}>
        <Boardroom chartLevel={1} />
        <MovingBox position={holding ? c.box : BOX_CORNER} rotation={[0, holding ? Math.PI / 2 : 0.3, 0]} />
        <ToonPerson build="tall"
          name="CEO"
          look={ceo}
          position={pos}
          rotation={[0, holding ? Math.PI / 2 : facing, 0]}
          pose={{ right: holding ? c.right : RELAXED_R, left: holding ? c.left : RELAXED_R, browSlant: -0.15 }}
        />
        <ToonPerson build="tall" name="EXEC" look={exec} position={[1.6, 0, BEHIND]} rotation={[0, -0.45, 0]} pose={{ headNod: 0.1 * (snap(30) - snap(44)), browL: 0.3 }} />
      </SceneCanvas>
      <TitleCard text="SEP 2010" from={2} top={110} />
      <Sfx name="door" at={0} volume={0.16} />
      <Sfx name="footsteps" at={3} volume={0.15} />
      <Sfx name="thump" at={setAt + 6} volume={0.35} />
      <Sfx name="boop" at={from} volume={0.45} />
    </>
  );
};

/* ---------- 8: three days later, the Windows Phone handshake ---------- */
const S08: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const snap = useSnap();
  const walk = snap(0, 120, 20);
  const bet = wordFrame(w08, "bet", fps);
  const shake = snap(bet - 4);
  const pump = shake > 0.9 ? Math.sin(onTwos(f) * 0.6) * 0.04 : 0;
  const ceoPos: V3 = [-0.75, 0, BEHIND];
  const ceoFacing = 0.9;
  // BUYER enters behind the chart easel, then steps up to the table.
  const buyerPos: V3 = [lerp(4.8, 0.75, walk), walk < 0.97 ? bob(f) : 0, lerp(-2.9, BEHIND, walk)];
  const buyerFacing = -0.9;
  const hs = handshake(ceoPos, [0.75, 0, BEHIND], { y: 1.5, forward: 0.3, pump, build: "tall" });
  return (
    <>
      <SceneCanvas qa="S08" mood="interior" bg={ROOM_BG} cam={{ ...ROOM, to: [0.2, 2.2, 8.6] }}>
        <Boardroom chartLevel={1} memoOnTable boxInCorner />
        {shake > 0.995 ? <ExpectContact a="CEO.right" b="BUYER.right" /> : null}
        <ToonPerson build="tall" name="CEO" look={ceo} position={ceoPos} rotation={[0, ceoFacing, 0]} pose={{ right: reachBlend(restReach(ceoPos, ceoFacing, "right", "tall"), hs.a, shake), browR: 0.2 }} />
        <ToonPerson build="tall" name="BUYER" look={buyer} position={buyerPos} rotation={[0, buyerFacing, 0]} pose={{ right: reachBlend(restReach(buyerPos, buyerFacing, "right", "tall"), hs.b, shake), browL: 0.35 }} />
        <ToonPerson build="tall" name="EXEC" look={exec} position={[2.75, 0, -2.6]} rotation={[0, -0.5, 0]} pose={{ headTurn: 0.3, browL: 0.3 }} />
      </SceneCanvas>
      <Sfx name="footsteps" at={0} volume={0.15} />
      <Sfx name="handshake" at={bet + 4} volume={0.5} />
      <Sfx name="sting" at={bet + 8} volume={0.28} />
    </>
  );
};

/* ---------- 9: the slide kept going ---------- */
const S09: React.FC = () => {
  const snap = useSnap();
  const { fps } = useVideoConfig();
  const a = wordFrame(w09, "going", fps);
  const b = a + Math.round((wordFrame(w09, "below", fps) - a) / 2);
  const c = wordFrame(w09, "below", fps);
  const s1 = snap(a);
  const s2 = snap(b);
  const s3 = snap(c);
  return (
    <>
      <SceneCanvas qa="S09" mood="interior" bg={ROOM_BG} cam={{ from: [2.4, 2.2, 6.8], lookFrom: [3.6, 1.8, -1.5], portrait: { from: [2.5, 2.25, 6.4], lookFrom: [3.75, 1.8, -1.6] } }}>
        <Boardroom chartLevel={1 - 0.13 * s1 - 0.13 * s2 - 0.14 * s3} memoOnTable boxInCorner />
        <ToonPerson build="tall"
          name="EXEC"
          look={exec}
          position={BY_CHART}
          rotation={[0, 0.6, 0]}
          pose={{ headNod: 0.08 * (s1 + s2 + s3), headTurn: -0.25, browSlant: 0.15 * (s1 + s2 + s3) }}
        />
      </SceneCanvas>
      <StatPop text="25%" at={wordFrame(w09, "quarter", fps)} x={1560} y={250} size={90} />
      {[a, b, c].map((at) => (
        <Sfx key={at} name="bonk" at={at} volume={0.42} />
      ))}
    </>
  );
};

/* ---------- 10: Samsung takes #1 (symbolic podium) ---------- */
const S10: React.FC = () => {
  const f = useCurrentFrame();
  const snap = useSnap();
  const { fps } = useVideoConfig();
  const sam = wordFrame(w10, "samsung", fps);
  const walkIn = snap(0, 120, 20);
  const down = snap(sam - 6, 220, 16);
  const up = snap(sam + 10, 220, 16);
  const hop = (t: number) => Math.sin(Math.PI * clamp01(t)) * 0.35;
  return (
    <>
      <SceneCanvas qa="S10" mood="stage" bg="#3f4a4a" cam={{ from: [0.3, 2.5, 9.5], lookFrom: [0.5, 1.9, 0], portrait: { from: [0.55, 2.0, 8.6], lookFrom: [0.6, 1.25, 0] } }}>
        <pointLight position={[0.5, 6, 3]} intensity={18} distance={14} color="#fff1d6" />
        <PodiumStage />
        <Label3D text="#1" position={[0, 0.48, 0.712]} at={4} height={0.34} />
        <Label3D text="#2" position={[1.7, 0.3, 0.712]} at={4} height={0.3} />
        <ToonPerson build="tall" name="EXEC" look={exec} position={[lerp(0, 1.7, down), lerp(0.9, 0.56, down) + hop(down), 0]} pose={{ headNod: 0.1 * down, browSlant: 0.4 * down, shoulderShift: -0.03 * down }} />
        <ToonPerson build="tall" name="RIVAL" look={rival}
          position={[lerp(lerp(-4.5, -1.3, walkIn), 0, up), lerp(0, 0.9, up) + hop(up) + (walkIn < 0.97 ? bob(f, 1) : 0), lerp(0.9, 0, up)]}
          pose={{ browL: 0.3, browR: 0.3, lean: 0.03 * up }}
        />
      </SceneCanvas>

      <Sfx name="footsteps" at={0} volume={0.15} />
      <Sfx name="thump" at={sam + 16} volume={0.4} />
      <Sfx name="wah" at={sam + 4} volume={0.32} />
    </>
  );
};

/* ---------- 11: the sale. "The buyer? Microsoft." ---------- */
const S11: React.FC = () => {
  const f = useCurrentFrame();
  const snap = useSnap();
  const { fps } = useVideoConfig();
  const buyerAt = wordFrame(w11, "buyer", fps);
  const priceAt = wordFrame(w11, "price", fps);
  const five = wordFrame(w11, "five", fps);
  const close = f >= buyerAt && f < priceAt;
  const wave = snap(buyerAt + 4) - snap(priceAt - 6);
  const writing = onTwos(f) > 6 && onTwos(f) < buyerAt ? Math.sin(onTwos(f) * 0.9) * 0.05 : 0;
  return (
    <>
      <SceneCanvas qa="S11"
        mood="interior"
        bg={ROOM_BG}
        cam={close ? { from: [1.4, 2.4, 4.6], lookFrom: [1.0, 2.3, -1.6] } : { ...ROOM, to: [0.3, 2.2, 8.4] }}
      >
        <Boardroom chartLevel={0.6} memoOnTable boxInCorner />
        <ToonPerson build="tall" name="CEO" look={ceo}
          position={[-1.0, 0, BEHIND]}
          rotation={[0, 0.35, 0]}
          pose={{ right: { forward: 0.95 + writing, out: 0, elbow: 0.75, inward: 0.25 }, headNod: 0.15, browSlant: -0.2 }}
          rightHand={<Pen position={[0, -0.12, 0.05]} rotation={[0.4, 0, 0]} />}
        />
        <ToonPerson build="tall" name="BUYER" look={buyer}
          position={[1.0, 0, BEHIND]}
          rotation={[0, close ? -0.1 : -0.35, 0]}
          pose={{ left: { forward: 0.3, out: lerp(0.1, 2.2, wave), elbow: lerp(0.2, 1.2, wave) + Math.sin(onTwos(f) * 0.8) * 0.2 * wave, twist: 1.3 }, browL: 0.4 + 0.3 * wave }}
        />
      </SceneCanvas>
      <TitleCard text="SEP 2013" from={2} top={110} />
      <StatPop text="€5.44B" at={five} x={1180} y={190} size={140} />
      <Sfx name="scribble" at={6} volume={0.13} />
      <Sfx name="whoosh" at={buyerAt - 2} volume={0.15} />
      <Sfx name="ka-ching" at={five} volume={0.45} />
    </>
  );
};

/* ---------- 12: everyone moves to Microsoft, including the CEO and his box ---------- */
const WALKERS: [string, string, "short" | "bald" | "bun" | "curly" | "long" | "beanie", string][] = [
  ["w1", "#6b7451", "short", "#3d2c22"],
  ["w2", "#8a6a4a", "long", "#5a4232"],
  ["w3", "#55606a", "bald", ""],
  ["w4", "#7a5048", "curly", "#2f2520"],
  ["w5", "#4b5059", "bun", "#6a4e39"],
  ["w6", "#5f7b93", "short", "#6a4e39"],
  ["w7", "#a08458", "beanie", "#7c8656"],
];

const S12: React.FC = () => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const snap = useSnap();
  const so = wordFrame(w12, "so", fps);
  const back = wordFrame(w12, "back", fps);
  const toBox = snap(6, 90, 20);
  const holding = onTwos(f) >= so;
  const go = Math.max(0, onTwos(f) - (so + 8));
  // Walk from the table to the box in the corner, pick it up, then walk out screen-right.
  const pickSpot: V3 = [BOX_CORNER[0] + 0.55, 0, BOX_CORNER[2] + 0.05];
  const pos: V3 = holding
    ? [pickSpot[0] + go * 0.075, go > 0 ? bob(f) : 0, lerp(pickSpot[2], -2.4, clamp01(go / 20))]
    : [lerp(-1.0, pickSpot[0], toBox), toBox < 0.97 ? bob(f) : 0, lerp(BEHIND, pickSpot[2], toBox)];
  const facing = holding ? Math.PI / 2 : toBox < 0.97 ? -Math.PI / 2 : -Math.PI / 2 + 0.2;
  const c = carry(pos, facing, { build: "tall" });
  return (
    <>
      <SceneCanvas qa="S12" mood="interior" bg={ROOM_BG} cam={{ from: [0.0, 2.8, 12.5], lookFrom: [0.0, 1.8, -1] }}>
        <Boardroom chartLevel={0.6} memoOnTable boxInCorner={!holding} />
        {WALKERS.map(([id, jacket, hair, hc], i) => (
          <ToonPerson build="tall" key={id} name={`EMP-${id}`} look={audienceLook(jacket, hair, hc)} position={[-7.5 + onTwos(f) * (14 / durationInFrames) - i * 1.25, bob(f, i), -2.95]} rotation={[0, Math.PI / 2, 0]} />
        ))}
        <ToonPerson build="tall" name="CEO" look={ceo} position={pos} rotation={[0, facing, 0]} pose={{ right: holding ? c.right : RELAXED_R, left: holding ? c.left : RELAXED_R, browR: 0.1 }} />
        {holding ? <MovingBox position={c.box} rotation={[0, facing, 0]} /> : null}
        <ToonPerson build="tall" name="BUYER" look={buyer} position={[4.4, 0, -1.4]} rotation={[0, -0.6, 0]} pose={{ headNod: 0.08 * snap(so + 20), browL: 0.3 }} />
      </SceneCanvas>
      <Sfx name="footsteps" at={0} volume={0.15} />
      <Sfx name="box-rattle" at={so} volume={0.42} />
      <Sfx name="door-close" at={back + 6} volume={0.45} />
    </>
  );
};

/* ---------- 13: the write-down (music drops out) ---------- */
const S13: React.FC = () => {
  const snap = useSnap();
  const { fps } = useVideoConfig();
  const seven = wordFrame(w13, "seven", fps);
  const charge = wordFrame(w13, "charge", fps);
  const drop = 0.5 * snap(seven) + 0.5 * snap(charge);
  const look = snap(wordFrame(w13, "jobs", fps) - 30, 200, 20);
  return (
    <>
      <SceneCanvas qa="S13" mood="interior" bg="#d7d3cb" cam={{ from: [0.3, 2.4, 6.6], to: [3.4, 2.5, 7.4], lookFrom: [0.1, 1.55, 0], lookTo: [4.2, 1.35, -1.2] }}>
        <MsOffice chartDrop={drop} />
        <ToonPerson build="tall" name="BUYER" look={buyer}
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
      <Sfx name="hum" at={0} volume={0.1} />
      <Sfx name="dun" at={seven} volume={0.55} />
      <Sfx name="dun" at={charge} volume={0.5} />
    </>
  );
};

/* ---------- 14: Nokia survived ---------- */
const S14: React.FC = () => {
  const f = useCurrentFrame();
  const snap = useSnap();
  const { fps } = useVideoConfig();
  const builds = wordFrame(w14, "builds", fps);
  const phoneAt = wordFrame(w14, "doesn't", fps);
  const out = snap(phoneAt - 4) - snap(phoneAt + 44);
  const holding = onTwos(f) >= phoneAt && onTwos(f) < phoneAt + 50;
  return (
    <>
      <SceneCanvas qa="S14" mood="snow" bg="#c9d6e0" cam={{ from: [0.2, 2.3, 10.5], to: [-0.4, 2.0, 8.4], lookFrom: [0.2, 2.4, -1], lookTo: [-0.2, 2.1, -1] }}>
        <SnowyHill lightsOn={onTwos(f) >= builds} />
        <ToonPerson build="tall" name="EXEC" look={execScarf}
          position={[-1.7, 0.2, 0.6]}
          rotation={[0, lerp(0.55, 0.15, snap(phoneAt - 10)), 0]}
          pose={{
            right: { forward: lerp(0.05, 1.15, out), out: 0.1, elbow: lerp(0.15, 1.2, out), inward: lerp(0, 0.4, out) },
            headNod: 0.22 * out,
            headTurn: lerp(0.35, 0, snap(phoneAt - 10)),
            browL: 0.2,
            browSlant: 0.25 * out,
          }}
          rightHand={holding ? <CandybarPhone position={[0, -0.2, 0.06]} rotation={[0, 0, Math.PI]} scale={0.8} lit /> : undefined}
        />
      </SceneCanvas>
      <Sfx name="wind" at={0} volume={0.15} />
      <Sfx name="power-up" at={builds} volume={0.32} />
      <Sfx name="blip" at={phoneAt + 8} volume={0.25} />
    </>
  );
};

export const SCENES2 = [S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S12, S13, S14];
