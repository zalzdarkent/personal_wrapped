import React from 'react';
import { useCurrentFrame } from 'remotion';

interface Crown3DProps {
  size?: number;
  primaryColor?: string;
  accentColor?: string;
  style?: React.CSSProperties;
}

export const Crown3D: React.FC<Crown3DProps> = ({
  size = 140,
  primaryColor = '#FFE500',
  accentColor = '#00F0FF',
  style,
}) => {
  const frame = useCurrentFrame();

  // 3D Gyroscopic Floating & Hover Motion
  const rotY = Math.sin(frame * 0.05) * 22;
  const rotX = Math.cos(frame * 0.04) * 12 + 6;
  const rotZ = Math.sin(frame * 0.03) * 6;
  const bobY = Math.sin(frame * 0.07) * 12;

  // Specular sweep highlight across the crown
  const shineOffset = (frame * 3) % 200;

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size * 0.8,
        perspective: 900,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      {/* 3D Crown Anchor */}
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          transformStyle: 'preserve-3d',
          transform: `translateY(${bobY}px) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Back Crown Layer (Darker Depth Rim) */}
        <div
          style={{
            position: 'absolute',
            width: size,
            height: size * 0.75,
            transform: 'translateZ(-24px) scale(0.95)',
            filter: 'brightness(0.65)',
          }}
        >
          <svg viewBox="0 0 100 80" style={{ width: '100%', height: '100%' }}>
            <polygon
              points="0,70 15,20 35,45 50,10 65,45 85,20 100,70"
              fill="#D4B000"
              stroke="#000000"
              strokeWidth="5"
            />
          </svg>
        </div>

        {/* Mid Crown Layer (Main Body) */}
        <div
          style={{
            position: 'absolute',
            width: size,
            height: size * 0.75,
            transform: 'translateZ(0px)',
          }}
        >
          <svg viewBox="0 0 100 80" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.4))' }}>
            <defs>
              <linearGradient id="crownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF275" />
                <stop offset="50%" stopColor={primaryColor} />
                <stop offset="100%" stopColor="#E5A800" />
              </linearGradient>
            </defs>
            <polygon
              points="0,70 15,20 35,45 50,10 65,45 85,20 100,70"
              fill="url(#crownGrad)"
              stroke="#000000"
              strokeWidth="5"
            />

            {/* Inlaid Gems on Prongs */}
            <circle cx="50" cy="18" r="6" fill={accentColor} stroke="#000000" strokeWidth="2.5" />
            <circle cx="17" cy="28" r="5" fill="#FF007F" stroke="#000000" strokeWidth="2" />
            <circle cx="83" cy="28" r="5" fill="#FF007F" stroke="#000000" strokeWidth="2" />

            {/* Center Crown Emblem */}
            <polygon points="50,42 56,54 44,54" fill="#000000" />
          </svg>
        </div>

        {/* Front Jewel & Specular Layer (Extruded Forward) */}
        <div
          style={{
            position: 'absolute',
            width: size,
            height: size * 0.75,
            transform: 'translateZ(26px)',
            pointerEvents: 'none',
          }}
        >
          {/* Gleaming Center Gem */}
          <div
            style={{
              position: 'absolute',
              top: '48%',
              left: '50%',
              width: size * 0.16,
              height: size * 0.16,
              transform: 'translate(-50%, -50%) rotate(45deg)',
              backgroundColor: '#FFFFFF',
              border: '2px solid #000000',
              boxShadow: `0 0 12px ${accentColor}`,
            }}
          />

          {/* Golden Specular Sweep */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: `${shineOffset - 50}%`,
              width: 30,
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)',
              transform: 'skewX(-25deg)',
              opacity: 0.7,
            }}
          />
        </div>
      </div>

      {/* Dynamic 3D Floor Shadow */}
      <div
        style={{
          position: 'absolute',
          bottom: -16,
          width: size * 0.8,
          height: 20,
          borderRadius: '50%',
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          filter: 'blur(8px)',
          transform: `scale(${1 - bobY / 24})`,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};
