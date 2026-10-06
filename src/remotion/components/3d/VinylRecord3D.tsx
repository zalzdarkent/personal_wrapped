import React from 'react';
import { useCurrentFrame } from 'remotion';

interface VinylRecord3DProps {
  size?: number;
  labelColor?: string;
  subLabel?: string;
  style?: React.CSSProperties;
}

export const VinylRecord3D: React.FC<VinylRecord3DProps> = ({
  size = 280,
  labelColor = '#FFE500',
  subLabel = 'HEAVY ROTATION',
  style,
}) => {
  const frame = useCurrentFrame();

  const rotZ = frame * 2.2;
  const bobY = Math.sin(frame * 0.07) * 8;
  const tiltX = 54 + Math.sin(frame * 0.04) * 4;
  const tiltY = -16 + Math.cos(frame * 0.05) * 4;

  const labelSize = size * 0.38;

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        perspective: 1000,
        ...style,
      }}
    >
      {/* 3D Vinyl Disc Container */}
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          transformStyle: 'preserve-3d',
          transform: `translateY(${bobY}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) rotateZ(${rotZ}deg)`,
        }}
      >
        {/* Vinyl Base Disc */}
        <div
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            backgroundColor: '#0a0a0a',
            border: '4px solid #1f1f1f',
            boxShadow: '0 16px 36px rgba(0,0,0,0.6), inset 0 0 20px rgba(255,255,255,0.05)',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxSizing: 'border-box',
          }}
        >
          {/* Concentric Vinyl Grooves */}
          {[0.88, 0.76, 0.64, 0.52].map((fraction, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: size * fraction,
                height: size * fraction,
                borderRadius: '50%',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                pointerEvents: 'none',
              }}
            />
          ))}

          {/* Realistic Specular Vinyl Sheen (Conical Highlight) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background:
                'conic-gradient(from 0deg, rgba(255,255,255,0.18) 0deg, transparent 60deg, rgba(255,255,255,0.18) 180deg, transparent 240deg, rgba(255,255,255,0.18) 360deg)',
              pointerEvents: 'none',
              mixBlendMode: 'screen',
            }}
          />

          {/* Center Label */}
          <div
            style={{
              width: labelSize,
              height: labelSize,
              borderRadius: '50%',
              backgroundColor: labelColor,
              border: '4px solid #000000',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.4)',
              zIndex: 2,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontWeight: 900,
                fontSize: labelSize * 0.2,
                color: '#000000',
                lineHeight: 1,
              }}
            >
              2026
            </div>
            <div
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontWeight: 800,
                fontSize: labelSize * 0.1,
                color: '#000000',
                letterSpacing: '0.5px',
                marginTop: 2,
              }}
            >
              {subLabel}
            </div>

            {/* Center Spindle Hole */}
            <div
              style={{
                width: labelSize * 0.18,
                height: labelSize * 0.18,
                borderRadius: '50%',
                backgroundColor: '#000000',
                border: '2px solid #333333',
                marginTop: 4,
              }}
            />
          </div>
        </div>
      </div>

      {/* 3D Floor Shadow */}
      <div
        style={{
          position: 'absolute',
          bottom: -20,
          left: '10%',
          width: '80%',
          height: 36,
          borderRadius: '50%',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          filter: 'blur(12px)',
          transform: `scale(${1 - bobY / 24})`,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};
