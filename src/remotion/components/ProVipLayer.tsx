import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

interface ProVipLayerProps {
  isPro: boolean;
}

export const ProVipLayer: React.FC<ProVipLayerProps> = ({ isPro }) => {
  const frame = useCurrentFrame();

  if (!isPro) return null;

  // 1. Specular 45-degree Light Sweep across frame every 90 frames (~3 sec)
  const sweepCycle = 90;
  const sweepFrame = frame % sweepCycle;
  const sweepX = interpolate(sweepFrame, [10, 50], [-400, 1500], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const sweepOpacity = interpolate(sweepFrame, [10, 30, 50], [0, 0.45, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // 2. Holographic Corner Seal Rotation
  const sealRotation = (frame * 0.8) % 360;

  // 3. Golden Stardust Particles (30 deterministic particles)
  const particles = Array.from({ length: 30 }, (_, i) => {
    const speed = 2.5 + (i % 5) * 0.8;
    // Y floats from bottom (1920) to top (0)
    const y = ((1920 - ((frame * speed + i * 140) % 1920)) + 1920) % 1920;
    // X drifts with sine
    const baseX = 80 + ((i * 137.5) % 920);
    const x = baseX + Math.sin(frame * 0.05 + i) * 35;
    const size = 3 + (i % 4) * 2.5;
    const alpha = 0.3 + 0.6 * Math.abs(Math.sin(frame * 0.08 + i * 2));
    const isGold = i % 2 === 0;

    return { x, y, size, alpha, isGold, isStar: i % 3 === 0 };
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 40,
        overflow: 'hidden',
      }}
    >
      {/* Specular Sweep */}
      <div
        style={{
          position: 'absolute',
          top: -200,
          left: sweepX,
          width: 280,
          height: 2400,
          transform: 'rotate(25deg)',
          background:
            'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,229,0,0.15) 30%, rgba(255,255,255,0.4) 50%, rgba(0,240,255,0.2) 70%, rgba(255,255,255,0) 100%)',
          opacity: sweepOpacity,
        }}
      />

      {/* Golden Stardust Particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            borderRadius: p.isStar ? 0 : '50%',
            backgroundColor: p.isGold ? '#FFE500' : '#00F0FF',
            opacity: p.alpha,
            transform: p.isStar ? `rotate(${frame * 2 + i * 20}deg)` : undefined,
            boxShadow: `0 0 ${p.size * 2}px ${p.isGold ? '#FFE500' : '#00F0FF'}`,
          }}
        />
      ))}

      {/* Holographic VIP Corner Seal */}
      <div
        style={{
          position: 'absolute',
          top: 190,
          right: 75,
          width: 100,
          height: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          viewBox="-60 -60 120 120"
          style={{
            position: 'absolute',
            width: 100,
            height: 100,
            transform: `rotate(${sealRotation}deg)`,
          }}
        >
          <polygon
            points="0,-55 14,-38 35,-45 35,-24 53,-16 42,2 53,20 35,28 35,49 14,42 0,55 -14,42 -35,49 -35,28 -53,20 -42,2 -53,-16 -35,-24 -35,-45 -14,-38"
            fill="#FFE500"
            stroke="#000000"
            strokeWidth="3"
          />
        </svg>
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            fontFamily: '"JetBrains Mono", monospace',
            fontWeight: 900,
            fontSize: 16,
            color: '#000000',
            textAlign: 'center',
            lineHeight: 1.1,
          }}
        >
          VIP<br />PRO
        </div>
      </div>
    </div>
  );
};
