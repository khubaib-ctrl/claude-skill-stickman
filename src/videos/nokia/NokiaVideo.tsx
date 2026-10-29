import { Audio } from "@remotion/media";
import { AbsoluteFill, Series, staticFile } from "remotion";
import { Captions } from "../../components/Captions";
import { SCENES } from "./scenes";

/** Measured scene lengths (frames @30fps) from the voiceover. See videos/nokia/storyboard.md. */
export const NOKIA_FRAMES = [191, 97, 167, 254, 146, 190, 197, 283, 169, 302, 224];
export const NOKIA_TOTAL = NOKIA_FRAMES.reduce((a, b) => a + b, 0);

/** "How Nokia Lost the Phone Market in Under 6 Years" */
export const NokiaVideo: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#2f2a27" }}>
    <Series>
      {SCENES.map((Scene, i) => {
        const id = `nokia-${String(i + 1).padStart(2, "0")}`;
        return (
          <Series.Sequence key={id} durationInFrames={NOKIA_FRAMES[i]} name={`Scene ${i + 1}`}>
            <Scene />
            <Captions src={staticFile(`captions/${id}.json`)} />
            <Audio src={staticFile(`audio/voice/${id}.wav`)} />
          </Series.Sequence>
        );
      })}
    </Series>
  </AbsoluteFill>
);
