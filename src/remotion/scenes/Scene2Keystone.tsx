import React from 'react';
import { Easing, interpolate, useCurrentFrame } from 'remotion';
import { ThemeConfig, WrappedData } from '../../types';
import { Card3DWrapper } from '../components/3d/Card3DWrapper';
import { CoinBadge3D } from '../components/3d/CoinBadge3D';

interface Scene2KeystoneProps {
  data: WrappedData;
  theme: ThemeConfig;
  isPro: boolean;
}

export const Scene2Keystone: React.FC<Scene2KeystoneProps> = ({
  data,
  isPro,
}) => {
  const frame = useCurrentFrame();

  // 1. Tag & Header Entrance
  const tagY = interpolate(frame, [0, 20], [30, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const tagRotX = interpolate(frame, [0, 20], [30, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const tagOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // 2. Counter Animation (Frames 15 to 70)
  const targetVal = data.primaryMetric.value;
  const countVal = Math.round(
    interpolate(frame, [15, 70], [0, targetVal], {
      easing: Easing.out(Easing.cubic),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );

  // Lock-in Accent (Frames 70 to 90)
  const lockInScale = interpolate(frame, [70, 78, 88], [1.0, 1.05, 1.0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // 3D Concentric Shockwave ring on ground plane
  const ringScale = interpolate(frame, [70, 92], [0.3, 1.4], {
    easing: Easing.out(Easing.quad),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const ringOpacity = interpolate(frame, [70, 76, 92], [0, 0.75, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Global Percentile Banner (Frames 38 to 62)
  const rankY = interpolate(frame, [38, 62], [40, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const rankOpacity = interpolate(frame, [38, 52], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // 3D Folding-Door Secondary Cards Entrance (Frames 50 to 76)
  const sub1RotY = interpolate(frame, [50, 74], [-45, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const sub1Opacity = interpolate(frame, [50, 64], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const sub2RotY = interpolate(frame, [58, 82], [45, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const sub2Opacity = interpolate(frame, [58, 72], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const secondary = data.secondaryMetrics.slice(0, 2);

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
        gap: 28,
        perspective: 1200,
      }}
    >
      {/* Section Header Tag */}
      <div
        style={{
          transform: `translateY(${tagY}px) rotateX(${tagRotX}deg)`,
          opacity: tagOpacity,
          fontFamily: '"JetBrains Mono", monospace',
          fontWeight: 700,
          fontSize: 32,
          color: '#000000',
          letterSpacing: '1px',
          transformOrigin: 'center bottom',
        }}
      >
        [ 01 // KEYSTONE MILESTONES ]
      </div>

      {/* Monolith Keystone Card with 3D Entrance & Ambient Float */}
      <Card3DWrapper
        entranceDelay={6}
        entranceDuration={28}
        entranceTiltX={-22}
        entranceTiltY={-8}
        entranceZ={-160}
        ambientFloat={true}
        perspective={1200}
      >
        <div
          style={{
            width: '100%',
            backgroundColor: '#000000',
            borderRadius: isPro ? 24 : 12,
            padding: '44px 48px',
            border: `5px solid ${isPro ? '#00F0FF' : '#000000'}`,
            boxSizing: 'border-box',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top Label & 3D Coin Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}
          >
            <div
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontWeight: 700,
                fontSize: 28,
                color: isPro ? '#00F0FF' : '#FFE500',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              {data.primaryMetric.label}
            </div>

            {/* 3D Spinning Milestone Coin */}
            <CoinBadge3D
              size={76}
              label="★"
              subLabel="2026"
              color={isPro ? '#00F0FF' : '#FFE500'}
              accentColor="#000000"
              speed={1.5}
            />
          </div>

          {/* Counter Number & Unit Container */}
          <div
            style={{
              position: 'relative',
              display: 'inline-block',
              transform: `scale(${lockInScale})`,
              transformOrigin: 'left center',
            }}
          >
            <div
              style={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontWeight: 900,
                fontSize: 140,
                lineHeight: 0.95,
                color: '#FFFFFF',
                letterSpacing: '-2px',
              }}
            >
              {countVal.toLocaleString()}
            </div>

            <div
              style={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontWeight: 700,
                fontSize: 42,
                color: isPro ? '#FFE500' : '#D2FF3A',
                textTransform: 'uppercase',
                marginTop: 12,
              }}
            >
              {data.primaryMetric.unit}
            </div>

            {/* 3D Ground Perspective Shockwave Ring */}
            {frame >= 70 && frame <= 92 && (
              <div
                style={{
                  position: 'absolute',
                  top: '60%',
                  left: '45%',
                  width: 380,
                  height: 220,
                  transform: `translate(-50%, -50%) rotateX(60deg) scale(${ringScale})`,
                  borderRadius: 40,
                  border: `5px solid ${isPro ? '#00F0FF' : '#FFE500'}`,
                  boxShadow: `0 0 20px ${isPro ? '#00F0FF' : '#FFE500'}`,
                  opacity: ringOpacity,
                  pointerEvents: 'none',
                }}
              />
            )}
          </div>
        </div>
      </Card3DWrapper>

      {/* Global Percentile Card */}
      <div
        style={{
          width: '100%',
          backgroundColor: '#000000',
          borderRadius: isPro ? 20 : 12,
          padding: '28px 40px',
          border: '4px solid #000000',
          boxShadow: '8px 8px 0px #000000',
          transform: `translateY(${rankY}px)`,
          opacity: rankOpacity,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div
          style={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 900,
            fontSize: 56,
            color: isPro ? '#00F0FF' : '#D2FF3A',
            letterSpacing: '-0.5px',
          }}
        >
          TOP {100 - data.percentileRank}% GLOBALLY
        </div>

        <div
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontWeight: 700,
            fontSize: 26,
            color: '#FFFFFF',
          }}
        >
          UNBROKEN STREAK: {data.streak.days} DAYS
        </div>
      </div>

      {/* 2 Secondary Metric Cards with 3D Folding-Door Hinges */}
      <div
        style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 24,
          perspective: 900,
        }}
      >
        {secondary.map((sec, idx) => {
          const rotY = idx === 0 ? sub1RotY : sub2RotY;
          const origin = idx === 0 ? 'left center' : 'right center';
          const op = idx === 0 ? sub1Opacity : sub2Opacity;

          return (
            <div
              key={idx}
              style={{
                backgroundColor: '#FFFFFF',
                border: '5px solid #000000',
                boxShadow: '8px 8px 0px #000000',
                padding: '24px 28px',
                borderRadius: isPro ? 16 : 8,
                transform: `rotateY(${rotY}deg)`,
                transformOrigin: origin,
                opacity: op,
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontWeight: 900,
                  fontSize: 54,
                  lineHeight: 1.0,
                  color: '#000000',
                  marginBottom: 10,
                }}
              >
                {String(sec.value)}
              </div>
              <div
                style={{
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                  fontWeight: 700,
                  fontSize: 20,
                  color: '#444444',
                  textTransform: 'uppercase',
                  lineHeight: 1.2,
                }}
              >
                {sec.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
