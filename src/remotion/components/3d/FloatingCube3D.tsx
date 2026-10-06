import React from 'react';
import { useCurrentFrame } from 'remotion';

interface FloatingCube3DProps {
  size?: number;
  color?: string;
  accentColor?: string;
  frontText?: string;
  speed?: number;
  style?: React.CSSProperties;
  showShadow?: boolean;
}

export const FloatingCube3D: React.FC<FloatingCube3DProps> = ({
  size = 90,
  color = '#000000',
  accentColor = '#FFE500',
  frontText = '2026',
  speed = 1,
  style,
  showShadow = true,
}) => {
  const frame = useCurrentFrame();

  const half = size / 2;
  const rotX = frame * 1.4 * speed;
  const rotY = frame * 1.8 * speed;
  const rotZ = frame * 0.6 * speed;
  const bobY = Math.sin(frame * 0.08 * speed) * 12;

  const faceCommon: React.CSSProperties = {
    position: 'absolute',
    width: size,
    height: size,
    border: `3px solid ${accentColor}`,
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '"JetBrains Mono", monospace',
    fontWeight: 900,
    fontSize: size * 0.22,
    color: accentColor,
    backfaceVisibility: 'visible',
    WebkitBackfaceVisibility: 'visible',
    boxShadow: `inset 0 0 ${size * 0.3}px rgba(0,0,0,0.7)`,
  };

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        perspective: 900,
        ...style,
      }}
    >
      {/* 3D Cube Container */}
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          transformStyle: 'preserve-3d',
          transform: `translateY(${bobY}px) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg)`,
        }}
      >
        {/* Front */}
        <div
          style={{
            ...faceCommon,
            backgroundColor: color,
            transform: `translateZ(${half}px)`,
          }}
        >
          {frontText}
        </div>

        {/* Back */}
        <div
          style={{
            ...faceCommon,
            backgroundColor: color,
            transform: `rotateY(180deg) translateZ(${half}px)`,
          }}
        >
          ★
        </div>

        {/* Right */}
        <div
          style={{
            ...faceCommon,
            backgroundColor: color,
            transform: `rotateY(90deg) translateZ(${half}px)`,
          }}
        >
          ⚡
        </div>

        {/* Left */}
        <div
          style={{
            ...faceCommon,
            backgroundColor: color,
            transform: `rotateY(-90deg) translateZ(${half}px)`,
          }}
        >
          WRAP
        </div>

        {/* Top */}
        <div
          style={{
            ...faceCommon,
            backgroundColor: accentColor,
            color: '#000000',
            transform: `rotateX(90deg) translateZ(${half}px)`,
          }}
        >
          PRO
        </div>

        {/* Bottom */}
        <div
          style={{
            ...faceCommon,
            backgroundColor: color,
            transform: `rotateX(-90deg) translateZ(${half}px)`,
          }}
        >
          2026
        </div>
      </div>

      {/* 3D Floor Shadow */}
      {showShadow && (
        <div
          style={{
            position: 'absolute',
            bottom: -size * 0.4,
            left: size * 0.1,
            width: size * 0.8,
            height: size * 0.3,
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 0, 0, 0.35)',
            filter: 'blur(8px)',
            transform: `scale(${1 - bobY / 30})`,
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
};
