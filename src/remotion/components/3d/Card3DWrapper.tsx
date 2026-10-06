import React from 'react';
import { Easing, interpolate, useCurrentFrame } from 'remotion';

interface Card3DWrapperProps {
  children: React.ReactNode;
  entranceDelay?: number;
  entranceDuration?: number;
  entranceTiltX?: number;
  entranceTiltY?: number;
  entranceZ?: number;
  ambientFloat?: boolean;
  ambientTiltScale?: number;
  perspective?: number;
  style?: React.CSSProperties;
}

export const Card3DWrapper: React.FC<Card3DWrapperProps> = ({
  children,
  entranceDelay = 0,
  entranceDuration = 26,
  entranceTiltX = -20,
  entranceTiltY = 10,
  entranceZ = -140,
  ambientFloat = true,
  ambientTiltScale = 1,
  perspective = 1100,
  style,
}) => {
  const frame = useCurrentFrame();

  const entranceStart = entranceDelay;
  const entranceEnd = entranceDelay + entranceDuration;

  // 1. 3D Entrance Interpolations
  const rotXEntrance = interpolate(
    frame,
    [entranceStart, entranceEnd],
    [entranceTiltX, 0],
    {
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const rotYEntrance = interpolate(
    frame,
    [entranceStart, entranceEnd],
    [entranceTiltY, 0],
    {
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const zEntrance = interpolate(
    frame,
    [entranceStart, entranceEnd],
    [entranceZ, 0],
    {
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const opacity = interpolate(
    frame,
    [entranceStart, entranceStart + Math.min(18, entranceDuration)],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  // 2. Ambient continuous 3D hover wobble (after entrance)
  const isAfterEntrance = frame >= entranceEnd;
  const ambientFrame = isAfterEntrance ? frame - entranceEnd : 0;
  const ambientRotX = ambientFloat
    ? Math.sin(ambientFrame * 0.05) * 3 * ambientTiltScale
    : 0;
  const ambientRotY = ambientFloat
    ? Math.cos(ambientFrame * 0.04) * 3.5 * ambientTiltScale
    : 0;
  const ambientY = ambientFloat ? Math.sin(ambientFrame * 0.07) * 6 : 0;

  const totalRotX = rotXEntrance + ambientRotX;
  const totalRotY = rotYEntrance + ambientRotY;
  const totalZ = zEntrance;

  // Dynamic shadow offset matching 3D tilt
  const shadowX = 10 - totalRotY * 1.5;
  const shadowY = 10 + totalRotX * 1.5;

  return (
    <div
      style={{
        perspective,
        transformStyle: 'preserve-3d',
        opacity,
        width: '100%',
        ...style,
      }}
    >
      <div
        style={{
          transformStyle: 'preserve-3d',
          transform: `translateY(${ambientY}px) translateZ(${totalZ}px) rotateX(${totalRotX}deg) rotateY(${totalRotY}deg)`,
          filter: `drop-shadow(${shadowX}px ${shadowY}px 0px #000000)`,
          transition: 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
};
