import React from 'react';
import { TransitionSeries, springTiming } from '@remotion/transitions';
import { useVideoConfig } from 'remotion';
import { Background } from './components/Background';
import { HeaderBar } from './components/HeaderBar';
import { SubtitleBanner } from './components/SubtitleBanner';
import { WatermarkFooter } from './components/WatermarkFooter';
import { ProVipLayer } from './components/ProVipLayer';
import { Scene1Intro } from './scenes/Scene1Intro';
import { Scene2Keystone } from './scenes/Scene2Keystone';
import { Scene3TopItems } from './scenes/Scene3TopItems';
import { Scene4Archetype } from './scenes/Scene4Archetype';
import { cube3D, depthDeck3D, flip3D } from './transitions/threeDTransitions';
import { PersonalWrappedCompositionProps } from './types';

export const PersonalWrappedVideo: React.FC<PersonalWrappedCompositionProps> = ({
  data,
  theme,
  isPro,
  narration,
}) => {
  const { fps } = useVideoConfig();

  // Each scene lasts 165 frames with 20 frames transition overlap
  // 165 * 4 - 3 * 20 = 600 frames (20 seconds at 30 fps)
  const sceneDuration = 165;
  const transitionDuration = 20;

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: theme.cardBg,
      }}
    >
      {/* 1. Base Brutalist Canvas Background */}
      <Background theme={theme} isPro={isPro} />

      {/* 2. Top Header with Identity & Audio Equalizer */}
      <HeaderBar data={data} theme={theme} isPro={isPro} totalDurationInFrames={600} />

      {/* 3. Main Multi-Scene Timeline with Varied 3D Transitions */}
      <TransitionSeries>
        {/* Scene 1: Intro Hook */}
        <TransitionSeries.Sequence
          name="Scene 1: Intro Hook"
          durationInFrames={sceneDuration}
          premountFor={fps}
        >
          <Scene1Intro data={data} theme={theme} isPro={isPro} narration={narration} />
        </TransitionSeries.Sequence>

        {/* Transition 1: 3D Cube Rotation (Scene 1 -> Scene 2) */}
        <TransitionSeries.Transition
          presentation={cube3D({
            direction: 'from-right',
            perspective: 1300,
            depthShadow: true,
          })}
          timing={springTiming({
            config: { damping: 14, stiffness: 120, mass: 0.8 },
            durationInFrames: transitionDuration,
          })}
        />

        {/* Scene 2: Keystone Metrics */}
        <TransitionSeries.Sequence
          name="Scene 2: Keystone Metrics"
          durationInFrames={sceneDuration}
          premountFor={fps}
        >
          <Scene2Keystone data={data} theme={theme} isPro={isPro} />
        </TransitionSeries.Sequence>

        {/* Transition 2: 3D Depth Deck Slide & Tilt (Scene 2 -> Scene 3) */}
        <TransitionSeries.Transition
          presentation={depthDeck3D({
            perspective: 1400,
            recedeDepth: 650,
            tiltAngle: 20,
          })}
          timing={springTiming({
            config: { damping: 15, stiffness: 110, mass: 0.9 },
            durationInFrames: transitionDuration,
          })}
        />

        {/* Scene 3: Top Obsessions */}
        <TransitionSeries.Sequence
          name="Scene 3: Top Obsessions"
          durationInFrames={sceneDuration}
          premountFor={fps}
        >
          <Scene3TopItems data={data} theme={theme} isPro={isPro} />
        </TransitionSeries.Sequence>

        {/* Transition 3: 3D Vertical Flip with Specular Light Flash (Scene 3 -> Scene 4) */}
        <TransitionSeries.Transition
          presentation={flip3D({
            direction: 'from-bottom',
            perspective: 1200,
            withFlash: true,
          })}
          timing={springTiming({
            config: { damping: 13, stiffness: 130, mass: 0.75 },
            durationInFrames: transitionDuration,
          })}
        />

        {/* Scene 4: Archetype Crown */}
        <TransitionSeries.Sequence
          name="Scene 4: Archetype Crown"
          durationInFrames={sceneDuration}
          premountFor={fps}
        >
          <Scene4Archetype data={data} theme={theme} isPro={isPro} />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* 4. Subtitle Captions synchronized with scenes */}
      <SubtitleBanner data={data} isPro={isPro} narration={narration} />

      {/* 5. Pro VIP Overlay Elements (Specular Sweep, Stars, Seal) */}
      <ProVipLayer isPro={isPro} />

      {/* 6. Watermark Footer */}
      <WatermarkFooter data={data} theme={theme} isPro={isPro} />
    </div>
  );
};
