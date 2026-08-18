import React from 'react';
import { Composition } from 'remotion';
import { DynamicReel, DynamicReelProps } from './components/DynamicReel';

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="AutoReelComposition"
        component={DynamicReel as any}
        durationInFrames={210}
        fps={30}
        width={1080}
        height={1920}
        calculateMetadata={async ({ props }) => {
          const typedProps = props as any;
          return {
            durationInFrames: typedProps.durationInFrames || 210,
          };
        }}
        defaultProps={{
          videoUrl: 'clip2.mp4',
          audioUrl: 'sad.mp3',
          topSetupText: 'Her: "why is he taking so long to reply?"',
          transitionText: 'Meanwhile me:',
          pillText: 'me after accidentally skipping my soulmate on whispr 😭',
          durationInFrames: 210,
        }}
      />
    </>
  );
};
