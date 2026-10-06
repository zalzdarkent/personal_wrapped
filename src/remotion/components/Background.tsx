import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThemeConfig } from '../../types';

interface BackgroundProps {
  theme: ThemeConfig;
  isPro: boolean;
}

export const Background: React.FC<BackgroundProps> = ({ theme, isPro }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Subtle rhythmic pulse (120 BPM: 1 beat every 15 frames at 30fps)
  const beatProgress = (frame % (fps / 2)) / (fps / 2);
  const beatImpulse = Math.pow(1 - beatProgress, 3);
  const ambientScale = 1 + beatImpulse * 0.015;

  // Background grid offset
  const gridOffset = (frame * 1.5) % 80;

  // Rotation for Pro 3D wireframe cube
  const rot = frame * 0.02;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: theme.cardBg,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {/* Dynamic Cyber Grid */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: isPro ? 0.12 : 0.06,
        }}
      >
        <defs>
          <pattern
            id="cyberGrid"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(0, ${gridOffset})`}
          >
            <path
              d="M 80 0 L 0 0 0 80"
              fill="none"
              stroke="#000000"
              strokeWidth="2"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cyberGrid)" />
      </svg>

      {/* Ambient Organic Aura Blob */}
      <div
        style={{
          position: 'absolute',
          top: '38%',
          left: '50%',
          width: isPro ? 700 : 540,
          height: isPro ? 700 : 540,
          borderRadius: '50%',
          background: isPro
            ? 'radial-gradient(circle, rgba(255, 229, 0, 0.28) 0%, rgba(0, 240, 255, 0.18) 50%, rgba(255, 0, 127, 0) 70%)'
            : 'radial-gradient(circle, rgba(0, 0, 0, 0.06) 0%, rgba(0, 0, 0, 0) 70%)',
          filter: 'blur(60px)',
          transform: `translate(-50%, -50%) scale(${ambientScale})`,
        }}
      />

      {/* Pro Mode: Subtle 3D Wireframe Polyhedron */}
      {isPro && (
        <svg
          viewBox="-200 -200 400 400"
          style={{
            position: 'absolute',
            top: '40%',
            left: '50%',
            width: 500,
            height: 500,
            transform: 'translate(-50%, -50%)',
            opacity: 0.14,
          }}
        >
          <g transform={`rotate(${rot * 40})`}>
            <polygon
              points="0,-160 140,-50 90,120 -90,120 -140,-50"
              fill="none"
              stroke="#00F0FF"
              strokeWidth="4"
            />
            <polygon
              points="0,160 -140,50 -90,-120 90,-120 140,50"
              fill="none"
              stroke="#FFE500"
              strokeWidth="3"
            />
            <line x1="0" y1="-160" x2="0" y2="160" stroke="#000" strokeWidth="2" strokeDasharray="6,6" />
            <line x1="-140" y1="-50" x2="140" y2="50" stroke="#000" strokeWidth="2" strokeDasharray="6,6" />
            <line x1="140" y1="-50" x2="-140" y2="50" stroke="#000" strokeWidth="2" strokeDasharray="6,6" />
          </g>
        </svg>
      )}

      {/* Neo-brutalist Outer Hard Border Frame */}
      <div
        style={{
          position: 'absolute',
          top: 48,
          left: 48,
          right: 48,
          bottom: 48,
          border: '8px solid #000000',
          boxShadow: '12px 12px 0px #000000',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};
