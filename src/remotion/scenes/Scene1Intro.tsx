import React from 'react';
import { Easing, interpolate, useCurrentFrame } from 'remotion';
import { GeminiNarration } from '../types';
import { ThemeConfig, WrappedData } from '../../types';
import { Card3DWrapper } from '../components/3d/Card3DWrapper';
import { FloatingCube3D } from '../components/3d/FloatingCube3D';

interface Scene1IntroProps {
  data: WrappedData;
  theme: ThemeConfig;
  isPro: boolean;
  narration?: GeminiNarration | null;
}

export const Scene1Intro: React.FC<Scene1IntroProps> = ({
  data,
  isPro,
  narration,
}) => {
  const frame = useCurrentFrame();

  // 1. Kicker Pill Animation with 3D Perspective Tilt
  const pillY = interpolate(frame, [4, 24], [-60, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const pillRotX = interpolate(frame, [4, 24], [40, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const pillOpacity = interpolate(frame, [4, 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // 2. Staggered 3D Kinetic Typography
  const line1Y = interpolate(frame, [14, 34], [45, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const line1RotX = interpolate(frame, [14, 34], [-30, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const line1Opacity = interpolate(frame, [14, 28], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const line2Y = interpolate(frame, [22, 42], [45, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const line2RotX = interpolate(frame, [22, 42], [-30, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const line2Opacity = interpolate(frame, [22, 36], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Badge 3D Stamp & Pop
  const line3Scale = interpolate(frame, [30, 50], [0.8, 1.0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    output: 'perceptual-scale',
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const line3RotZ = interpolate(frame, [30, 50], [-8, -2], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const line3Opacity = interpolate(frame, [30, 44], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Typewriter text reveal
  const hookText =
    narration?.hook || `Stop scrolling! ${data.userName}'s 2026 dossier is officially live.`;
  const charCount = Math.floor(
    interpolate(frame, [54, 115], [0, hookText.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
  const visibleText = hookText.slice(0, charCount);

  return (
    <div
      style={{
        position: 'absolute',
        top: 180,
        bottom: 270,
        left: 88,
        right: 88,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        boxSizing: 'border-box',
        perspective: 1200,
      }}
    >
      {/* 3D Floating Cyber Cube Accent (Top Right) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          zIndex: 10,
        }}
      >
        <FloatingCube3D
          size={84}
          accentColor={isPro ? '#00F0FF' : '#FFE500'}
          frontText={data.category.toUpperCase().slice(0, 4)}
          speed={0.9}
        />
      </div>

      {/* Kicker Pill with 3D Tilt */}
      <div
        style={{
          transform: `translateY(${pillY}px) rotateX(${pillRotX}deg)`,
          opacity: pillOpacity,
          backgroundColor: '#000000',
          padding: '12px 28px',
          marginBottom: 36,
          boxShadow: '4px 4px 0px rgba(0,0,0,0.3)',
          transformOrigin: 'center top',
        }}
      >
        <span
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontWeight: 700,
            fontSize: 26,
            color: isPro ? '#00F0FF' : '#D2FF3A',
            letterSpacing: '1px',
            textTransform: 'uppercase',
          }}
        >
          DOMAIN: {data.category.toUpperCase()} // 2026
        </span>
      </div>

      {/* Kinetic Typography Lines with 3D Depth */}
      <div style={{ marginBottom: 40, width: '100%', perspective: 900 }}>
        <div
          style={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 900,
            fontSize: 88,
            lineHeight: 1.05,
            color: '#000000',
            transform: `translateY(${line1Y}px) rotateX(${line1RotX}deg)`,
            transformOrigin: 'center bottom',
            opacity: line1Opacity,
          }}
        >
          2026 WAS
        </div>

        <div
          style={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 900,
            fontSize: 88,
            lineHeight: 1.05,
            color: '#000000',
            transform: `translateY(${line2Y}px) rotateX(${line2RotX}deg)`,
            transformOrigin: 'center bottom',
            opacity: line2Opacity,
          }}
        >
          AN ABSOLUTE
        </div>

        <div
          style={{
            marginTop: 12,
            transform: `scale(${line3Scale}) rotate(${line3RotZ}deg)`,
            opacity: line3Opacity,
            transformOrigin: 'left center',
            display: 'inline-block',
          }}
        >
          <div
            style={{
              backgroundColor: '#000000',
              padding: '10px 32px',
              border: `4px solid ${isPro ? '#00F0FF' : '#000000'}`,
              boxShadow: '6px 6px 0px #000000',
            }}
          >
            <span
              style={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontWeight: 900,
                fontSize: 84,
                lineHeight: 1.1,
                color: isPro ? '#FFE500' : '#D2FF3A',
                letterSpacing: '-1px',
              }}
            >
              MASTERCLASS
            </span>
          </div>
        </div>
      </div>

      {/* Central Dossier Card with 3D Entrance & Ambient Wobble */}
      <Card3DWrapper
        entranceDelay={38}
        entranceDuration={28}
        entranceTiltX={-20}
        entranceTiltY={8}
        entranceZ={-150}
        ambientFloat={true}
        perspective={1200}
      >
        <div
          style={{
            width: '100%',
            backgroundColor: '#000000',
            borderRadius: isPro ? 24 : 12,
            padding: '40px 44px',
            border: `5px solid ${isPro ? '#00F0FF' : '#000000'}`,
            boxSizing: 'border-box',
          }}
        >
          {/* Card Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 24,
              borderBottom: '2px solid #333333',
              paddingBottom: 16,
            }}
          >
            <div
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontWeight: 700,
                fontSize: 24,
                color: '#FFE500',
                letterSpacing: '1px',
              }}
            >
              ⚡ GEMINI AI NARRATION // HOOK
            </div>
            <div
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontWeight: 700,
                fontSize: 20,
                color: isPro ? '#00F0FF' : '#D2FF3A',
              }}
            >
              CONFIDENTIAL 2026
            </div>
          </div>

          {/* Hook Body Text */}
          <div
            style={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 600,
              fontSize: 34,
              color: '#FFFFFF',
              lineHeight: 1.4,
              minHeight: 120,
              marginBottom: 28,
            }}
          >
            {visibleText}
            {charCount < hookText.length && (
              <span
                style={{
                  display: 'inline-block',
                  width: 12,
                  height: 28,
                  backgroundColor: isPro ? '#00F0FF' : '#FFE500',
                  marginLeft: 6,
                  verticalAlign: 'middle',
                }}
              />
            )}
          </div>

          {/* Footer info pills */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontWeight: 700,
                fontSize: 28,
                color: isPro ? '#00F0FF' : '#FFE500',
              }}
            >
              {data.handle.startsWith('@') ? data.handle : `@${data.handle}`}
            </div>

            <div
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontWeight: 700,
                fontSize: 20,
                color: '#D2FF3A',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: '#D2FF3A',
                }}
              />
              AUDIO SYNC ACTIVE ▶
            </div>
          </div>
        </div>
      </Card3DWrapper>
    </div>
  );
};
