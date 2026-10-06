import React from 'react';
import { Easing, interpolate, useCurrentFrame } from 'remotion';
import { ThemeConfig, WrappedData } from '../../types';
import { Card3DWrapper } from '../components/3d/Card3DWrapper';
import { Crown3D } from '../components/3d/Crown3D';
import { CoinBadge3D } from '../components/3d/CoinBadge3D';

interface Scene4ArchetypeProps {
  data: WrappedData;
  theme: ThemeConfig;
  isPro: boolean;
}

export const Scene4Archetype: React.FC<Scene4ArchetypeProps> = ({
  data,
  isPro,
}) => {
  const frame = useCurrentFrame();

  // 1. Tag Animation with 3D tilt
  const tagY = interpolate(frame, [0, 18], [25, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const tagRotX = interpolate(frame, [0, 18], [30, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const tagOpacity = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // 2. Quirk Banner 3D Suspended Swing (Frames 42 to 66)
  const quirkRotX = interpolate(frame, [42, 66], [-50, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const quirkY = interpolate(frame, [42, 66], [35, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const quirkOpacity = interpolate(frame, [42, 56], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // 3. Outro Ribbon (Frames 68 to 92)
  const outroY = interpolate(frame, [68, 92], [35, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const outroRotX = interpolate(frame, [68, 92], [25, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const outroOpacity = interpolate(frame, [68, 82], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

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
        justifyContent: 'center',
        gap: 24,
        boxSizing: 'border-box',
        perspective: 1200,
      }}
    >
      {/* Section Tag */}
      <div
        style={{
          transform: `translateY(${tagY}px) rotateX(${tagRotX}deg)`,
          opacity: tagOpacity,
          fontFamily: '"JetBrains Mono", monospace',
          fontWeight: 700,
          fontSize: 30,
          color: '#000000',
          letterSpacing: '1px',
          transformOrigin: 'center bottom',
        }}
      >
        [ 03 // 2026 IDENTITY CROWN ]
      </div>

      {/* Archetype Monolith Box with 3D Entrance & Ambient Float */}
      <Card3DWrapper
        entranceDelay={6}
        entranceDuration={28}
        entranceTiltX={-22}
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
            padding: '36px 44px',
            border: `5px solid ${isPro ? '#00F0FF' : '#000000'}`,
            boxSizing: 'border-box',
          }}
        >
          {/* 3D Floating Crown & Subtitle Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              marginBottom: 16,
            }}
          >
            {/* 3D Floating Golden Crown */}
            <Crown3D
              size={110}
              primaryColor={isPro ? '#FFE500' : '#D2FF3A'}
              accentColor={isPro ? '#00F0FF' : '#FFE500'}
            />

            <span
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontWeight: 700,
                fontSize: 24,
                color: isPro ? '#00F0FF' : '#FFE500',
                letterSpacing: '1px',
              }}
            >
              ★ OFFICIAL RECAP ARCHETYPE
            </span>
          </div>

          {/* Archetype Title */}
          <div
            style={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 900,
              fontSize: 66,
              lineHeight: 1.05,
              color: isPro ? '#FFE500' : '#D2FF3A',
              letterSpacing: '-1px',
              marginBottom: 16,
            }}
          >
            {data.archetype.title}
          </div>

          {/* Tagline */}
          <div
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontWeight: 700,
              fontSize: 26,
              color: '#FFFFFF',
              lineHeight: 1.3,
              marginBottom: 18,
            }}
          >
            "{data.archetype.tagline}"
          </div>

          {/* Description */}
          <div
            style={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontWeight: 500,
              fontSize: 24,
              color: '#D4D4D4',
              lineHeight: 1.45,
            }}
          >
            {data.archetype.description}
          </div>
        </div>
      </Card3DWrapper>

      {/* Quirk / Fun Fact Banner with 3D Suspended Swing */}
      {data.failOrQuirk && (
        <div
          style={{
            backgroundColor: '#FF5A36',
            border: '4px solid #000000',
            boxShadow: '7px 7px 0px #000000',
            padding: '20px 32px',
            borderRadius: isPro ? 16 : 8,
            transform: `perspective(900px) translateY(${quirkY}px) rotateX(${quirkRotX}deg)`,
            transformOrigin: 'center top',
            opacity: quirkOpacity,
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontWeight: 700,
              fontSize: 20,
              color: '#000000',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: 4,
            }}
          >
            {data.failOrQuirk.label}
          </div>
          <div
            style={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontWeight: 700,
              fontSize: 24,
              color: '#000000',
              lineHeight: 1.3,
            }}
          >
            {data.failOrQuirk.description}
          </div>
        </div>
      )}

      {/* Outro Ribbon with Spinning 3D Coin Badge */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '4px solid #000000',
          boxShadow: '7px 7px 0px #000000',
          padding: '20px 32px',
          borderRadius: isPro ? 16 : 8,
          transform: `perspective(900px) translateY(${outroY}px) rotateX(${outroRotX}deg)`,
          transformOrigin: 'center bottom',
          opacity: outroOpacity,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxSizing: 'border-box',
        }}
      >
        <div>
          <div
            style={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 900,
              fontSize: 42,
              lineHeight: 1.1,
              color: '#000000',
            }}
          >
            {data.userName.toUpperCase()}
          </div>
          <div
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontWeight: 700,
              fontSize: 22,
              color: '#555555',
              marginTop: 4,
            }}
          >
            SEE YOU IN 2027 · {data.category.toUpperCase()}
          </div>
        </div>

        {/* 3D Spinning 2026 Gold Coin */}
        <CoinBadge3D
          size={74}
          label="★"
          subLabel="2026"
          color="#FFE500"
          accentColor="#000000"
          speed={1.6}
        />
      </div>
    </div>
  );
};
