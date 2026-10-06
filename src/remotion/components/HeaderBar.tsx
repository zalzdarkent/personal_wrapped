import React from 'react';
import { useCurrentFrame } from 'remotion';
import { ThemeConfig, WrappedData } from '../../types';

interface HeaderBarProps {
  data: WrappedData;
  theme: ThemeConfig;
  isPro: boolean;
  totalDurationInFrames?: number;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  data,
  isPro,
  totalDurationInFrames = 600,
}) => {
  const frame = useCurrentFrame();

  // Progress percentage (0 to 1)
  const progress = Math.min(1, Math.max(0, frame / totalDurationInFrames));

  // Audio equalizer bars (36 bars)
  const barsCount = 36;
  const bars = Array.from({ length: barsCount }, (_, i) => {
    // Harmonic wave calculation
    const h =
      8 +
      Math.abs(Math.sin(frame * 0.15 + i * 0.38)) * 26 +
      Math.abs(Math.cos(frame * 0.08 + i * 0.7)) * 14;
    return Math.min(48, Math.max(6, h));
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: 48,
        left: 48,
        right: 48,
        height: 120,
        backgroundColor: '#000000',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Header Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 36px 0 36px',
        }}
      >
        {/* Left Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span
            style={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 900,
              fontSize: 34,
              letterSpacing: '-0.5px',
              color: isPro ? '#FFE500' : '#FFFFFF',
            }}
          >
            {isPro ? '👑 PRO VIP RECAP 2026' : '★ 2026 VIDEO RECAP'}
          </span>
        </div>

        {/* Right User Handle */}
        <div
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontWeight: 700,
            fontSize: 28,
            color: isPro ? '#00F0FF' : '#FFE500',
            letterSpacing: '0.5px',
          }}
        >
          {data.handle.toUpperCase()}
        </div>
      </div>

      {/* Audio Waveform Equalizer (Pro exclusive or subtle accent) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          height: 38,
          padding: '0 36px 8px 36px',
          gap: 4,
          opacity: isPro ? 1 : 0.65,
        }}
      >
        {bars.map((barHeight, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: barHeight,
              backgroundColor: isPro
                ? i % 3 === 0
                  ? '#00F0FF'
                  : i % 2 === 0
                  ? '#FFE500'
                  : '#FF007F'
                : '#FFE500',
              borderRadius: '2px 2px 0 0',
            }}
          />
        ))}
      </div>

      {/* Global Progress Bar Line */}
      <div
        style={{
          width: '100%',
          height: 8,
          backgroundColor: '#222222',
        }}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: '100%',
            backgroundColor: isPro ? '#D2FF3A' : '#FFE500',
          }}
        />
      </div>
    </div>
  );
};
