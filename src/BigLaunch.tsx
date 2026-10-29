import { Audio } from "@remotion/media";
import { AbsoluteFill, staticFile, useVideoConfig } from "remotion";
import { Captions } from "./components/Captions";
import { TitleCard } from "./components/TitleCard";
import { KeynoteScene } from "./scenes/keynote/KeynoteScene";

/** Keynote test with the cloned narrator voiceover and captions. */
export const BigLaunch: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill>
      <KeynoteScene width={width} height={height} />
      <TitleCard text="THE BIG LAUNCH" top={160} />
      <Captions src={staticFile("captions/big-launch.json")} />
      <Audio src={staticFile("audio/voice/big-launch.wav")} />
    </AbsoluteFill>
  );
};
