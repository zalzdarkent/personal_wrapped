import React from 'react';
import { useCurrentFrame } from 'remotion';

interface CoinBadge3DProps {
  size?: number;
  label?: string;
  subLabel?: string;
  color?: string;
  accentColor?: string;
  speed?: number;
  tiltAngle?: number;
  style?: React.CSSProperties;
}

export const CoinBadge3D: React.FC<CoinBadge3DProps> = ({
  size = 90,
  label = '★',
  subLabel = '2026',
  color = '#FFE500',
  accentColor = '#000000',
  speed = 1.8,
  tiltAngle = 12,
  style,
}) => {
  const frame = useCurrentFrame();

  const rotY = (frame * speed * 2) % 360;
  const bobY = Math.sin(frame * 0.08) * 6;

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        perspective: 800,
        ...style,
      }}
    >
      {/* 3D Coin Rotation Container */}
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          transformStyle: 'preserve-3d',
          transform: `translateY(${bobY}px) rotateX(${tiltAngle}deg) rotateY(${rotY}deg)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Front Face */}
        <div
          style={{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: '50%',
            backgroundColor: color,
            border: `4px solid ${accentColor}`,
            boxShadow: 'inset 0 0 12px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'translateZ(6px)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          <span
            style={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 900,
              fontSize: size * 0.36,
              color: accentColor,
              lineHeight: 1,
            }}
          >
            {label}
          </span>
          {subLabel && (
            <span
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontWeight: 800,
                fontSize: size * 0.16,
                color: accentColor,
                marginTop: 2,
              }}
            >
              {subLabel}
            </span>
          )}
        </div>

        {/* Back Face */}
        <div
          style={{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: '50%',
            backgroundColor: color,
            border: `4px solid ${accentColor}`,
            boxShadow: 'inset 0 0 12px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'rotateY(180deg) translateZ(6px)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          <span
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontWeight: 900,
              fontSize: size * 0.28,
              color: accentColor,
            }}
          >
            #1
          </span>
        </div>

        {/* 3D Thickness Edge Layers */}
        {[-4, -2, 0, 2, 4].map((z) => (
          <div
            key={z}
            style={{
              position: 'absolute',
              width: size - 1,
              height: size - 1,
              borderRadius: '50%',
              border: `2px solid #8B6508`,
              transform: `translateZ(${z}px)`,
              pointerEvents: 'none',
              opacity: 0.7,
            }}
          />
        ))}
      </div>

      {/* Shadow */}
      <div
        style={{
          position: 'absolute',
          bottom: -12,
          left: '15%',
          width: '70%',
          height: 16,
          borderRadius: '50%',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          filter: 'blur(6px)',
          transform: `scale(${1 - bobY / 20})`,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};
