import { ThemeConfig, WrappedData } from '../types';

export interface GeminiNarration {
  title: string;
  hook: string;
  scenes: Array<{
    time: string;
    title: string;
    voiceover: string;
    visualDescription: string;
  }>;
  punchline: string;
  fullScript: string;
}

export type PersonalWrappedCompositionProps = {
  data: WrappedData;
  theme: ThemeConfig;
  isPro: boolean;
  narration?: GeminiNarration | null;
  [key: string]: unknown;
};
