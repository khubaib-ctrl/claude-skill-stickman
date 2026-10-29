import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { useLayoutEffect } from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { LINE, PALETTE, ToonMesh } from "../../toon/toon";
import { founderLook } from "./founder";
import { astronomerLook, Globe, knightLook, MoneyBag, NoteStack, oratorLook, PlantedSword, tycoonLook } from "./roundhead";
import { ToonPerson } from "./ToonPerson";

const CameraRig: React.FC<{ pos: [number, number, number]; look: [number, number, number] }> = ({ pos, look }) => {
  const camera = useThree((s) => s.camera);
  useLayoutEffect(() => {
    camera.position.set(...pos);
    camera.lookAt(...look);
    camera.updateProjectionMatrix();
  }, [camera, pos, look]);
  return null;
};

/** Daylight preset + cream studio backdrop shared by the design stills. */
const Studio: React.FC = () => (
  <>
    <color attach="background" args={[PALETTE.cream]} />
    <ambientLight intensity={1.1} />
    <hemisphereLight args={["#fbf8f2", "#8f8b82", 0.35]} />
    <directionalLight
      position={[-6, 10, 10]}
      intensity={2.3}
      color="#fffaf0"
      castShadow
      shadow-mapSize={[4096, 4096]}
      shadow-bias={-0.0006}
      shadow-normalBias={0.08}
      shadow-camera-left={-10}
      shadow-camera-right={10}
      shadow-camera-top={10}
      shadow-camera-bottom={-10}
    />
    <ToonMesh color={PALETTE.cream} outline={0} position={[0, 5, -1.6]}>
      <boxGeometry args={[40, 10, 0.2]} />
    </ToonMesh>
    <ToonMesh color={PALETTE.timber} outline={LINE.background} position={[0, 0.15, -1.45]}>
      <boxGeometry args={[40, 0.3, 0.1]} />
    </ToonMesh>
    <ToonMesh color="#a58a68" outline={0} position={[0, -0.05, 5]}>
      <boxGeometry args={[40, 0.1, 14]} />
    </ToonMesh>
  </>
);

const X = { orator: -2.7, tycoon: -0.9, knight: 0.9, astronomer: 2.7 };

/** Design still: the round-head cast on the standard chibi build. */
export const RoundHeadCast: React.FC = () => {
  const { width, height } = useVideoConfig();
  const k = X.knight;
  const a = X.astronomer;
  const globeHand: [number, number, number] = [a - 0.66, 1.08, 0.45];
  return (
    <AbsoluteFill>
      <ThreeCanvas width={width} height={height} shadows="basic" flat gl={{ antialias: true }} camera={{ fov: 30 }}>
        <CameraRig pos={[0, 1.5, 8.6]} look={[0, 1.08, 0]} />
        <Studio />

        <ToonPerson
          name="ORATOR"
          look={oratorLook}
          position={[X.orator, 0, 0]}
          rotation={[0, 0.25, 0]}
          pose={{
            right: { forward: 0.2, out: 2.45, elbow: 0.45, twist: 1.5 },
            left: { forward: 0.2, out: 2.45, elbow: 0.45, twist: 1.5 },
            mouth: 0.7,
            browSlant: 0.5,
            headTilt: 0.06,
          }}
        />

        <ToonPerson
          name="TYCOON"
          look={tycoonLook}
          position={[X.tycoon, 0, 0]}
          rotation={[0, 0.1, 0]}
          pose={{
            left: { forward: 0.45, out: 0.75, elbow: 0.5, twist: 1.5 },
            right: { forward: 0.55, out: 0.05, elbow: 1.35, inward: 0.45 },
            blink: 0.45,
            browL: 0.65,
            browR: -0.1,
            headTilt: -0.08,
            lean: -0.05,
          }}
        />
        <MoneyBag position={[X.tycoon - 0.62, 0, 0.3]} rotation={0.3} scale={0.8} />
        <MoneyBag position={[X.tycoon + 0.66, 0, 0.15]} rotation={-0.4} scale={0.65} />
        <NoteStack position={[X.tycoon + 0.4, 0, 0.62]} rotation={0.5} />

        <PlantedSword position={[k, 0, 0.44]} />
        <ToonPerson
          name="KNIGHT"
          look={knightLook}
          position={[k, 0, 0]}
          pose={{
            right: { reach: [k - 0.03, 0.7, 0.44], world: true, thumb: [0, 1, 0] },
            left: { reach: [k + 0.03, 0.76, 0.44], world: true, thumb: [0, 1, 0] },
            browSlant: 0.35,
          }}
        />

        <ToonPerson
          name="ASTRONOMER"
          look={astronomerLook}
          position={[a, 0, 0]}
          rotation={[0, -0.25, 0]}
          pose={{
            right: { reach: globeHand, world: true, thumb: [0, 0, 1] },
            browL: 0.55,
            browR: 0.15,
            headTurn: -0.2,
            headTilt: -0.06,
          }}
        />
        <Globe position={[globeHand[0], globeHand[1] + 0.25, globeHand[2]]} spin={0.6} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

/** Design still: the same founder look on the tall build (Nokia era) and the standard chibi build. */
export const BuildCompare: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill>
      <ThreeCanvas width={width} height={height} shadows="basic" flat gl={{ antialias: true }} camera={{ fov: 30 }}>
        <CameraRig pos={[0, 1.9, 9.5]} look={[0, 1.55, 0]} />
        <Studio />
        <ToonPerson build="tall" look={founderLook} position={[-1.3, 0, 0]} rotation={[0, 0.2, 0]} pose={{ browR: 0.15 }} />
        <ToonPerson look={founderLook} position={[1.3, 0, 0]} rotation={[0, -0.2, 0]} pose={{ browR: 0.15 }} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
