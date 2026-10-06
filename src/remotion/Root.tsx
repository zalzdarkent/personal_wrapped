import React from 'react';
import { Composition, Folder } from 'remotion';
import { PersonalWrappedVideo } from './PersonalWrappedVideo';
import { Scene1Intro } from './scenes/Scene1Intro';
import { Scene2Keystone } from './scenes/Scene2Keystone';
import { Scene3TopItems } from './scenes/Scene3TopItems';
import { Scene4Archetype } from './scenes/Scene4Archetype';
import { SAMPLE_PRESETS } from '../data/samplePresets';
import { THEMES } from '../data/themes';
import { PersonalWrappedCompositionProps } from './types';
import { WrappedData } from '../types';

const defaultData: WrappedData = {
  ...SAMPLE_PRESETS.github,
  userName: 'Alif Fadillah Ummar',
  handle: '@zalzdarkent',
};
const defaultTheme = THEMES[0];

const defaultProps: PersonalWrappedCompositionProps = {
  data: defaultData,
  theme: defaultTheme,
  isPro: true,
  narration: {
    title: 'Alif Fadillah Ummar 2026 Code Wrapped',
    hook: "Stop scrolling! Alif Fadillah Ummar's 2026 dossier is officially live.",
    scenes: [
      {
        time: '0:00 - 0:05',
        title: 'THE INTRO',
        voiceover: "2026 was unprecedented for Alif Fadillah Ummar. Let's break down the year.",
        visualDescription: 'Kinetic title card pulse',
      },
      {
        time: '0:05 - 0:10',
        title: 'KEYSTONE STAT',
        voiceover: 'Logging 2,847 commits pushed! Ranked in the Top 1% globally.',
        visualDescription: 'Counter count-up',
      },
      {
        time: '0:10 - 0:15',
        title: 'TOP OBSESSIONS',
        voiceover: 'Dominating the year: TypeScript with 54% of all codebase commits.',
        visualDescription: 'Highlights showcase',
      },
      {
        time: '0:15 - 0:20',
        title: 'ARCHETYPE CROWN',
        voiceover: 'Officially certified as Midnight Code Alchemist. See you in 2027!',
        visualDescription: 'Archetype stamp and final badge',
      },
    ],
    punchline: 'Officially certified as Midnight Code Alchemist.',
    fullScript:
      '2026 was unprecedented for Alif Fadillah Ummar. With 2,847 commits, officially crowned as Midnight Code Alchemist.',
  },
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Main Full 20-Second Vertical Story Video */}
      <Composition<any, PersonalWrappedCompositionProps>
        id="PersonalWrapped"
        component={PersonalWrappedVideo}
        durationInFrames={600}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={defaultProps}
      />

      {/* Connected Compositions for Individual Scene Timelines */}
      <Folder name="Scenes">
        <Composition<any, PersonalWrappedCompositionProps>
          id="Scene1Intro"
          component={Scene1Intro}
          durationInFrames={165}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={defaultProps}
        />
        <Composition<any, PersonalWrappedCompositionProps>
          id="Scene2Keystone"
          component={Scene2Keystone}
          durationInFrames={165}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={defaultProps}
        />
        <Composition<any, PersonalWrappedCompositionProps>
          id="Scene3TopItems"
          component={Scene3TopItems}
          durationInFrames={165}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={defaultProps}
        />
        <Composition<any, PersonalWrappedCompositionProps>
          id="Scene4Archetype"
          component={Scene4Archetype}
          durationInFrames={165}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={defaultProps}
        />
      </Folder>
    </>
  );
};
