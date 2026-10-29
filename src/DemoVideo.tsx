import { Audio } from "@remotion/media";
import { AbsoluteFill, staticFile, useVideoConfig } from "remotion";
import { z } from "zod";
import { Captions } from "./components/Captions";
import { SpinningCubeScene } from "./scenes/SpinningCubeScene";

export const demoVideoSchema = z.object({
  /** Path inside public/ to a Caption[] JSON file. */
  captionsFile: z.string().nullable(),
  /** Path inside public/ to an audio file (mp3/wav), or null for silence. */
  audioFile: z.string().nullable(),
});

export const DemoVideo: React.FC<z.infer<typeof demoVideoSchema>> = ({
  captionsFile,
  audioFile,
}) => {
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0d17" }}>
      {/* Layer 1: Three.js scene */}
      <SpinningCubeScene width={width} height={height} />

      {/* Layer 2: captions on top */}
      {captionsFile ? <Captions src={staticFile(captionsFile)} /> : null}

      {/* Audio track */}
      {audioFile ? <Audio src={staticFile(audioFile)} /> : null}
    </AbsoluteFill>
  );
};
