import { RoundedBoxGeometry } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { loadFont } from "@remotion/google-fonts/LuckiestGuy";
import { loadFont as loadTypewriter } from "@remotion/google-fonts/SpecialElite";
import { ThreeCanvas } from "@remotion/three";
import { useEffect, useLayoutEffect, useState } from "react";
import * as THREE from "three";
import { Audio } from "@remotion/media";
import { continueRender, delayRender, Easing, interpolate, random, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { fitFov, useLayout } from "../../formats";
import { ContactQA, Solid } from "../../toon/qa";
import { INK, InkMesh, LINE, onTwos, ToonMesh } from "../../toon/toon";

const { fontFamily, waitUntilDone } = loadFont("normal", { weights: ["400"], subsets: ["latin"] });
const fontReady = waitUntilDone();

type V3 = [number, number, number];

/** Frame (local to the scene) where a caption word starts. */
export const wordFrame = (
  words: { text: string; startMs: number }[],
  word: string,
  fps: number,
  nth = 0,
) => {
  const norm = (t: string) => t.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  const hits = words.filter((w) => norm(w.text) === norm(word));
  const w = hits[nth] ?? hits[0];
  if (!w) throw new Error(`word "${word}" not found in captions`);
  return Math.round((w.startMs / 1000) * fps);
};

/** Snappy cartoon spring, evaluated on twos. */
export const useSnap = () => {
  const f = onTwos(useCurrentFrame());
  const { fps } = useVideoConfig();
  return (at: number, stiffness = 300, damping = 15) => spring({ frame: f - at, fps, config: { stiffness, damping } });
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const lerp3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

/** Camera that eases from one framing to another over the whole scene (one move max). */
const CameraRig: React.FC<{ from: V3; to?: V3; lookFrom: V3; lookTo?: V3; fov: number }> = ({
  from,
  to = from,
  lookFrom,
  lookTo = lookFrom,
  fov,
}) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();
  // Stills (thumbnails) are 1 frame long: no camera move.
  const t = durationInFrames > 1 ? interpolate(frame, [0, durationInFrames - 1], [0, 1], { easing: Easing.inOut(Easing.sin) }) : 0;
  useLayoutEffect(() => {
    // Framed for 16:9; narrower formats keep the subject and show more above/below.
    camera.fov = fitFov(fov, width / height);
    camera.position.set(...lerp3(from, to, t));
    camera.lookAt(...lerp3(lookFrom, lookTo, t));
    camera.updateProjectionMatrix();
  }, [camera, t, from, to, lookFrom, lookTo, fov, width, height]);
  return null;
};

export type Mood = "interior" | "snow" | "stage";

const Lights: React.FC<{ mood: Mood; dim?: number }> = ({ mood, dim = 1 }) => {
  const key = { interior: "#fffaf0", snow: "#f4f8ff", stage: "#fff3df" }[mood];
  const amb = { interior: 1.1, snow: 1.15, stage: 0.75 }[mood] * dim;
  return (
    <>
      <ambientLight intensity={amb} />
      <hemisphereLight args={[mood === "snow" ? "#eef4fb" : "#fbf8f2", mood === "stage" ? "#3a3330" : "#8f8b82", 0.35]} />
      <directionalLight
        position={[-6, 11, 10]}
        intensity={2.3 * dim}
        color={key}
        castShadow
        shadow-mapSize={[4096, 4096]}
        shadow-bias={-0.0006}
        shadow-normalBias={0.08}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-camera-far={70}
      />
    </>
  );
};

/** One scene's 3D canvas: house render settings, lighting mood, camera rig. */
type Cam = { from: V3; to?: V3; lookFrom: V3; lookTo?: V3; fov?: number };

export const SceneCanvas: React.FC<{
  mood: Mood;
  bg: string;
  /** Camera framing; `portrait` optionally overrides it for vertical formats. */
  cam: Cam & { portrait?: Partial<Cam> };
  /** Light multiplier (e.g. 0.45 after a light switch). */
  dim?: number;
  /** Scene label for contact-QA reports. */
  qa?: string;
  children: React.ReactNode;
}> = ({ mood, bg, cam, dim, qa = "scene", children }) => {
  const { width, height } = useVideoConfig();
  const { portrait } = useLayout();
  const { portrait: p, ...base } = cam;
  const c = portrait && p ? { ...base, ...p } : base;
  return (
    <ThreeCanvas width={width} height={height} shadows="basic" flat gl={{ antialias: true }} camera={{ fov: 34, near: 0.1, far: 200 }}>
      <CameraRig fov={34} {...c} />
      <color attach="background" args={[bg]} />
      <Lights mood={mood} dim={dim} />
      {children}
      <ContactQA scene={qa} />
    </ThreeCanvas>
  );
};

/* ---------------- Props ---------------- */

/** Classic chunky candybar phone. `lit` turns the little screen on. */
export const CandybarPhone: React.FC<{ lit?: boolean } & { position?: V3; rotation?: V3; scale?: number }> = ({
  lit,
  ...props
}) => (
  <group {...props}>
    <ToonMesh color="#5f6670" outline={LINE.prop}>
      <RoundedBoxGeometry args={[0.24, 0.52, 0.1]} radius={0.05} />
    </ToonMesh>
    <InkMesh color={lit ? "#cfe9b8" : "#46523f"} position={[0, 0.11, 0.052]}>
      <boxGeometry args={[0.16, 0.13, 0.01]} />
    </InkMesh>
    {[0, 1, 2].flatMap((r) =>
      [-1, 0, 1].map((c) => (
        <InkMesh key={`${r}${c}`} color="#c9ccd1" position={[c * 0.055, -0.06 - r * 0.05, 0.052]}>
          <boxGeometry args={[0.035, 0.025, 0.01]} />
        </InkMesh>
      )),
    )}
  </group>
);

/** Glossy touchscreen slab phone. */
export const SlabPhone: React.FC<{ position?: V3; rotation?: V3; scale?: number }> = (props) => (
  <group {...props}>
    <ToonMesh color="#2c2b2e" outline={LINE.prop}>
      <RoundedBoxGeometry args={[0.3, 0.56, 0.05]} radius={0.04} />
    </ToonMesh>
    <InkMesh color="#cfeef0" position={[0, 0.01, 0.027]}>
      <boxGeometry args={[0.25, 0.46, 0.005]} />
    </InkMesh>
  </group>
);

export const Memo: React.FC<{ position?: V3; rotation?: V3 }> = (props) => (
  <group {...props}>
    <ToonMesh color="#f6f2e8" outline={LINE.prop}>
      <boxGeometry args={[0.32, 0.012, 0.42]} />
    </ToonMesh>
    {[0.12, 0.06, 0, -0.06, -0.12].map((z) => (
      <InkMesh key={z} color="#b9b2a4" position={[-0.02, 0.008, z]}>
        <boxGeometry args={[0.22, 0.002, 0.012]} />
      </InkMesh>
    ))}
  </group>
);

export const Briefcase: React.FC<{ position?: V3; rotation?: V3 }> = (props) => (
  <group {...props}>
    <ToonMesh color="#5b3f2e" outline={LINE.prop}>
      <RoundedBoxGeometry args={[0.6, 0.42, 0.14]} radius={0.04} />
    </ToonMesh>
    <ToonMesh color="#3c2a20" outline={LINE.background} position={[0, 0.25, 0]}>
      <torusGeometry args={[0.08, 0.02, 6, 14, Math.PI]} />
    </ToonMesh>
    {[-1, 1].map((s) => (
      <InkMesh key={s} color="#c8a35a" position={[s * 0.18, 0.12, 0.072]}>
        <boxGeometry args={[0.05, 0.04, 0.01]} />
      </InkMesh>
    ))}
  </group>
);

export const Pen: React.FC<{ position?: V3; rotation?: V3 }> = (props) => (
  <group {...props}>
    <ToonMesh color="#2b2b30" outline={LINE.background}>
      <cylinderGeometry args={[0.018, 0.018, 0.26, 8]} />
    </ToonMesh>
  </group>
);

/** Falling snow (deterministic). Place inside a window or outdoors. */
export const Snow: React.FC<{ count?: number; box: { x: [number, number]; y: [number, number]; z: [number, number] }; seed?: string; size?: number }> = ({
  count = 60,
  box,
  seed = "snow",
  size = 0.05,
}) => {
  const frame = useCurrentFrame();
  const h = box.y[1] - box.y[0];
  return (
    <group>
      {Array.from({ length: count }, (_, i) => {
        const x = lerp(box.x[0], box.x[1], random(`${seed}x${i}`));
        const z = lerp(box.z[0], box.z[1], random(`${seed}z${i}`));
        const speed = 0.012 + 0.012 * random(`${seed}s${i}`);
        const y = box.y[1] - ((random(`${seed}y${i}`) * h + frame * speed * h * 0.25) % h);
        const drift = Math.sin(frame * 0.05 + i) * 0.05;
        return (
          <InkMesh key={i} color="#ffffff" position={[x + drift, y, z]}>
            <sphereGeometry args={[size, 6, 4]} />
          </InkMesh>
        );
      })}
    </group>
  );
};

/* ---------------- 2D overlays ---------------- */

/** Big number/label that pops in (house title look), for facts that need to land. */
export const StatPop: React.FC<{
  text: string;
  at: number;
  /** Position in the 1920×1080 reference frame. */
  x: number;
  y: number;
  /** Optional vertical-format position as fractions of width/height (0..1). */
  portrait?: { x: number; y: number };
  size?: number;
  rotate?: number;
}> = ({ text, at, x, y, portrait: pp, size: baseSize = 120, rotate = -4 }) => {
  const frame = onTwos(useCurrentFrame());
  const { fps } = useVideoConfig();
  const L = useLayout();
  if (frame < at) return null;
  const pop = spring({ frame: frame - at, fps, config: { stiffness: 260, damping: 11 } });
  const pos = L.portrait && pp ? { x: pp.x * L.w, y: pp.y * L.h } : L.ref(x, y);
  const size = L.fit(baseSize * L.s * (L.portrait ? 1.15 : 1), text.length, L.textWidth);
  return (
    <div
      style={{
        position: "absolute",
        left: pos.x,
        top: pos.y,
        transform: `translate(-50%, -50%) rotate(${rotate}deg) scale(${pop})`,
        fontFamily,
        fontSize: size,
        color: "white",
        WebkitTextStroke: `${Math.round(size / 9)}px ${INK}`,
        paintOrder: "stroke fill",
        textShadow: `0 ${Math.round(size / 14)}px 0 ${INK}`,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
};

/** Cardboard moving box (the CEO's, scenes 7 → 12). */
export const MovingBox: React.FC<{ position?: V3; rotation?: V3 }> = (props) => (
  <group {...props}>
    <ToonMesh color="#c49a6c" outline={LINE.prop}>
      <boxGeometry args={[0.7, 0.5, 0.5]} />
    </ToonMesh>
    {[-1, 1].map((s) => (
      <ToonMesh key={s} color="#b58b5e" outline={LINE.background} position={[s * 0.2, 0.27, 0]} rotation={[0, 0, -s * 0.5]}>
        <boxGeometry args={[0.36, 0.02, 0.48]} />
      </ToonMesh>
    ))}
    <InkMesh color="#e3d3b4" position={[0, 0, 0.252]}>
      <boxGeometry args={[0.7, 0.07, 0.005]} />
    </InkMesh>
  </group>
);

const { fontFamily: typeFont } = loadTypewriter("normal", { weights: ["400"], subsets: ["latin"] });

/**
 * Typed note card that reveals a verbatim quote word by word, synced to the
 * caption words from `fromWord` onward.
 */
export const QuoteCard: React.FC<{
  words: { text: string; startMs: number }[];
  fromIndex: number;
  x: number;
  y: number;
  width?: number;
}> = ({ words, fromIndex, x, y, width = 760 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = useLayout();
  const ms = (frame / fps) * 1000;
  const quote = words.slice(fromIndex);
  // Vertical formats: full-width card in the upper band, above the subject.
  const box = L.portrait
    ? { left: L.safe.side, top: L.safe.top + L.h * 0.12, width: L.textWidth, font: 52 * L.s }
    : { left: (x / 1920) * L.w, top: (y / 1080) * L.h, width: (width / 1920) * L.w, font: 44 * L.s };
  const shown = quote.filter((w) => w.startMs <= ms);
  if (!shown.length) return null;
  const done = shown.length === quote.length;
  return (
    <div
      style={{
        position: "absolute",
        left: box.left,
        top: box.top,
        width: box.width,
        boxSizing: "border-box",
        padding: `${34 * L.s}px ${40 * L.s}px ${30 * L.s}px`,
        background: "#f6f2e8",
        border: `6px solid ${INK}`,
        borderRadius: 10,
        boxShadow: `10px 12px 0 ${INK}`,
        transform: "rotate(-1.5deg)",
        fontFamily: typeFont,
        fontSize: box.font,
        lineHeight: 1.3,
        color: "#2b1f1a",
      }}
    >
      <span style={{ fontSize: box.font * 0.68, opacity: 0.6 }}>MEMO, FEB 2011</span>
      <br />
      &ldquo;
      {shown.map((w, i) => (i === 0 ? w.text.trim().replace(/^./, (c) => c.toUpperCase()) : w.text.trim())).join(" ")}
      {done ? "\u201d" : <span style={{ opacity: Math.floor(frame / 8) % 2 ? 1 : 0 }}>|</span>}
    </div>
  );
};

/** One sound effect from public/audio/sfx, starting at a scene-local frame. */
export const Sfx: React.FC<{ name: string; at: number; volume?: number }> = ({ name, at, volume = 0.4 }) => (
  <Sequence from={Math.max(0, Math.round(at))} layout="none" name={`sfx:${name}`}>
    <Audio src={staticFile(`audio/sfx/${name}.wav`)} volume={volume} />
  </Sequence>
);

/** Small open laptop; the screen faces local -z (put the user on that side). */
export const Laptop: React.FC<{ position?: V3; rotation?: V3 }> = (props) => (
  <group {...props}>
    {/* Base and screen are separate solids: hands may rest ON the keys, never pass through either. */}
    <Solid name="laptop base">
      <ToonMesh color="#6e6a70" outline={LINE.prop}>
        <RoundedBoxGeometry args={[0.6, 0.03, 0.4]} radius={0.01} />
      </ToonMesh>
    </Solid>
    <InkMesh color="#3c3a3f" position={[0, 0.017, -0.02]}>
      <boxGeometry args={[0.5, 0.004, 0.22]} />
    </InkMesh>
    <group position={[0, 0.015, 0.2]} rotation={[0.25, 0, 0]}>
      <Solid name="laptop screen">
        <ToonMesh color="#6e6a70" outline={LINE.prop} position={[0, 0.19, 0]}>
          <RoundedBoxGeometry args={[0.6, 0.38, 0.02]} radius={0.01} />
        </ToonMesh>
      </Solid>
      <InkMesh color="#cfe3e6" position={[0, 0.19, -0.012]}>
        <boxGeometry args={[0.54, 0.32, 0.004]} />
      </InkMesh>
    </group>
  </group>
);

export { carry, handshake, reachBlend, restReach } from "../../toon/contact";

/**
 * Text label ON a 3D object (podium numbers, signs): the text is drawn to a
 * texture on a flat plane facing +z, so it renders inside the 3D image and stays
 * attached in every aspect ratio. `height` is in world units.
 */
export const Label3D: React.FC<{ text: string; position: V3; at?: number; height?: number; rotation?: V3 }> = ({
  text,
  position,
  at = 0,
  height = 0.3,
  rotation,
}) => {
  const frame = onTwos(useCurrentFrame());
  const advance = useThree((st) => st.advance);
  const [handle] = useState(() => delayRender(`label font ${text}`));
  const [tex, setTex] = useState<THREE.CanvasTexture | null>(null);
  const family = fontFamily.startsWith('"') ? fontFamily : `"${fontFamily}"`;
  useEffect(() => {
    let cancelled = false;
    fontReady.then(() => {
      if (cancelled) return;
      const c = document.createElement("canvas");
      const H = 256;
      const ctx = c.getContext("2d")!;
      ctx.font = `${H * 0.7}px ${family}`;
      const w = Math.ceil(ctx.measureText(text).width + H * 0.4);
      c.width = w;
      c.height = H;
      ctx.font = `${H * 0.7}px ${family}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineJoin = "round";
      ctx.lineWidth = H * 0.12;
      ctx.strokeStyle = INK;
      ctx.strokeText(text, w / 2, H * 0.55);
      ctx.fillStyle = "#ffffff";
      ctx.fillText(text, w / 2, H * 0.55);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      setTex(t);
    });
    return () => {
      cancelled = true;
    };
  }, [text, family]);
  // Once the texture is committed, redraw the canvas (frameloop is "never") and only then release the frame.
  useLayoutEffect(() => {
    if (!tex) return;
    advance(performance.now());
    continueRender(handle);
  }, [tex, advance, handle]);
  if (!tex || frame < at) return null;
  const aspect = (tex.image as HTMLCanvasElement).width / (tex.image as HTMLCanvasElement).height;
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[height * aspect, height]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
};
