import { AbsoluteFill, useVideoConfig } from "remotion";
import { TitleCard } from "./components/TitleCard";
import { TownSquareScene } from "./scenes/townsquare/TownSquareScene";

/** 4-second style test: cel-shaded town square speech. */
export const ToonTest: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill>
      <TownSquareScene width={width} height={height} />
      <TitleCard text="THE BIG SPEECH" />
    </AbsoluteFill>
  );
};
