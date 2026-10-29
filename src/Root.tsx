import { Composition, Still } from "remotion";
import { formatMetadata, type FormatProps } from "./formats";
import { KernelLineup, KernelSpeaker } from "./characters/kernel/KernelStills";
import { DemoVideo, demoVideoSchema } from "./DemoVideo";
import { FounderStill } from "./characters/toonfolk/FounderStill";
import { BuildCompare, RoundHeadCast } from "./characters/toonfolk/CastStill";
import { ToonTest } from "./ToonTest";
import { BigLaunch } from "./BigLaunch";
import { NokiaCast } from "./videos/nokia/NokiaCast";
import { NokiaThumbnail } from "./videos/nokia/Thumbnail";
import { CastCloseup } from "./videos/nokia/CastCloseup";
import { NOKIA_TOTAL, NokiaVideo } from "./videos/nokia/NokiaVideo";
import { NOKIA2_TOTAL, NokiaVideo2 } from "./videos/nokia/NokiaVideo2";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="DemoVideo"
        component={DemoVideo}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
        schema={demoVideoSchema}
        defaultProps={{
          captionsFile: "captions/demo.json",
          audioFile: null,
        }}
      />
      <Composition
        id="ToonTest"
        component={ToonTest}
        durationInFrames={120}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ format: "long" } as FormatProps}
        calculateMetadata={formatMetadata}
      />
      <Composition
        id="BigLaunch"
        component={BigLaunch}
        durationInFrames={135}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ format: "long" } as FormatProps}
        calculateMetadata={formatMetadata}
      />
      <Composition
        id="Nokia"
        component={NokiaVideo}
        durationInFrames={NOKIA_TOTAL}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ format: "long" } as FormatProps}
        calculateMetadata={formatMetadata}
      />
      <Composition
        id="NokiaV2"
        component={NokiaVideo2}
        durationInFrames={NOKIA2_TOTAL}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ format: "long" } as FormatProps}
        calculateMetadata={formatMetadata}
      />
      <Composition
        id="NokiaV2Short"
        component={NokiaVideo2}
        durationInFrames={NOKIA2_TOTAL}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ format: "short" } as FormatProps}
        calculateMetadata={formatMetadata}
      />
      <Still id="CastCloseup" component={CastCloseup} width={1920} height={1080} />
      <Still id="NokiaThumbnail" component={NokiaThumbnail} width={1280} height={720} />
      <Still
        id="NokiaThumbnailVertical"
        component={NokiaThumbnail}
        width={1080}
        height={1920}
        defaultProps={{ format: "short" } as FormatProps}
        calculateMetadata={formatMetadata}
      />
      <Still id="NokiaCast" component={NokiaCast} width={1920} height={1080} />
      <Still id="RoundHeadCast" component={RoundHeadCast} width={1920} height={1080} />
      <Still id="BuildCompare" component={BuildCompare} width={1920} height={1080} />
      <Still id="FounderStill" component={FounderStill} width={1920} height={1080} />
      <Still id="KernelLineup" component={KernelLineup} width={1920} height={1080} />
      <Still id="KernelSpeaker" component={KernelSpeaker} width={1920} height={1080} />
    </>
  );
};
