import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { GeminiNarration } from '../types';
import { WrappedData } from '../../types';

interface SubtitleBannerProps {
  data: WrappedData;
  isPro: boolean;
  narration?: GeminiNarration | null;
}

export const SubtitleBanner: React.FC<SubtitleBannerProps> = ({
  data,
  isPro,
  narration,
}) => {
  const frame = useCurrentFrame();

  // Determine current subtitle text and local fade
  let text = narration?.hook || `Inspecting ${data.userName}'s 2026 Wrapped dossier...`;
  let localFrame = frame % 150;

  if (frame >= 150 && frame < 300) {
    text =
      narration?.scenes?.[1]?.voiceover ||
      `Clocking in at ${data.primaryMetric.value.toLocaleString()} ${data.primaryMetric.unit}!`;
  } else if (frame >= 300 && frame < 450) {
    text =
      narration?.scenes?.[2]?.voiceover ||
      `Dominating the heavy rotation playlist all year long.`;
  } else if (frame >= 450) {
    text =
      narration?.scenes?.[3]?.voiceover ||
      `Officially certified as ${data.archetype.title}.`;
  }

  // Smooth fade-in at scene starts (15 frames) and fade-out at scene ends
  const opacity = interpolate(
    localFrame,
    [0, 15, 135, 150],
    [0, 1, 1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 150,
        left: 88,
        right: 88,
        height: 110,
        backgroundColor: '#000000',
        border: `4px solid ${isPro ? '#00F0FF' : '#FFE500'}`,
        boxShadow: '6px 6px 0px #000000',
        padding: '16px 24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        zIndex: 50,
        opacity,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontWeight: 700,
          fontSize: 18,
          color: isPro ? '#00F0FF' : '#FFE500',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: 4,
        }}
      >
        {isPro ? '▶ GEMINI AI DIRECTOR // VIP NARRATION' : '▶ GEMINI AI DIRECTOR // CAPTION'}
      </div>
      <div
        style={{
          fontFamily: '"Space Grotesk", sans-serif',
          fontWeight: 600,
          fontSize: 24,
          color: '#FFFFFF',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </div>
    </div>
  );
};
