import React, { useMemo } from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from '@remotion/transitions';

// ============================================================================
// 1. CUBE 3D TRANSITION (Isometric / Spatial Cube Rotation)
// ============================================================================

export type Cube3DDirection = 'from-right' | 'from-left' | 'from-bottom' | 'from-top';

export type Cube3DProps = {
  direction?: Cube3DDirection;
  perspective?: number;
  depthShadow?: boolean;
  [key: string]: unknown;
};

const Cube3DComponent: React.FC<
  TransitionPresentationComponentProps<Cube3DProps>
> = ({
  children,
  presentationDirection,
  presentationProgress,
  passedProps: { direction = 'from-right', perspective = 1200, depthShadow = true },
}) => {
  const isEntering = presentationDirection === 'entering';

  const style = useMemo((): React.CSSProperties => {
    const isHorizontal = direction === 'from-right' || direction === 'from-left';

    if (isHorizontal) {
      const sign = direction === 'from-right' ? 1 : -1;
      const exitRotation = -90 * sign;
      const enterStartRotation = 90 * sign;

      const rotY = isEntering
        ? interpolate(presentationProgress, [0, 1], [enterStartRotation, 0])
        : interpolate(presentationProgress, [0, 1], [0, exitRotation]);

      const origin = isEntering
        ? direction === 'from-right'
          ? 'left center'
          : 'right center'
        : direction === 'from-right'
        ? 'right center'
        : 'left center';

      const brightness = depthShadow
        ? isEntering
          ? interpolate(presentationProgress, [0, 1], [0.45, 1])
          : interpolate(presentationProgress, [0, 1], [1, 0.45])
        : 1;

      return {
        width: '100%',
        height: '100%',
        transformOrigin: origin,
        transform: `rotateY(${rotY}deg)`,
        filter: `brightness(${brightness})`,
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
      };
    } else {
      // Vertical Cube rotation
      const sign = direction === 'from-bottom' ? 1 : -1;
      const exitRotation = -90 * sign;
      const enterStartRotation = 90 * sign;

      const rotX = isEntering
        ? interpolate(presentationProgress, [0, 1], [enterStartRotation, 0])
        : interpolate(presentationProgress, [0, 1], [0, exitRotation]);

      const origin = isEntering
        ? direction === 'from-bottom'
          ? 'center top'
          : 'center bottom'
        : direction === 'from-bottom'
        ? 'center bottom'
        : 'center top';

      const brightness = depthShadow
        ? isEntering
          ? interpolate(presentationProgress, [0, 1], [0.45, 1])
          : interpolate(presentationProgress, [0, 1], [1, 0.45])
        : 1;

      return {
        width: '100%',
        height: '100%',
        transformOrigin: origin,
        transform: `rotateX(${rotX}deg)`,
        filter: `brightness(${brightness})`,
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
      };
    }
  }, [depthShadow, direction, isEntering, presentationProgress]);

  return (
    <AbsoluteFill
      style={{
        perspective,
        transformStyle: 'preserve-3d',
        overflow: 'hidden',
      }}
    >
      <AbsoluteFill style={style}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

export const cube3D = (
  props?: Cube3DProps
): TransitionPresentation<Cube3DProps> => ({
  component: Cube3DComponent,
  props: props ?? {},
});

// ============================================================================
// 2. DEPTH DECK 3D TRANSITION (3D Receding Layer & Power Tilt Entrance)
// ============================================================================

export type DepthDeck3DProps = {
  perspective?: number;
  recedeDepth?: number;
  tiltAngle?: number;
  [key: string]: unknown;
};

const DepthDeck3DComponent: React.FC<
  TransitionPresentationComponentProps<DepthDeck3DProps>
> = ({
  children,
  presentationDirection,
  presentationProgress,
  passedProps: {
    perspective = 1400,
    recedeDepth = 600,
    tiltAngle = 18,
  },
}) => {
  const isEntering = presentationDirection === 'entering';

  const style = useMemo((): React.CSSProperties => {
    if (!isEntering) {
      // Exiting slide: pushes backwards deep in 3D z-space, tilts, darkens
      const translateZ = interpolate(presentationProgress, [0, 1], [0, -recedeDepth]);
      const rotateX = interpolate(presentationProgress, [0, 1], [0, tiltAngle]);
      const scale = interpolate(presentationProgress, [0, 1], [1, 0.8]);
      const opacity = interpolate(presentationProgress, [0, 0.85, 1], [1, 0.4, 0]);
      const brightness = interpolate(presentationProgress, [0, 1], [1, 0.4]);

      return {
        width: '100%',
        height: '100%',
        transform: `translateZ(${translateZ}px) rotateX(${rotateX}deg) scale(${scale})`,
        opacity,
        filter: `brightness(${brightness})`,
        transformOrigin: 'center center',
      };
    } else {
      // Entering slide: surges up from bottom with 3D tilt
      const translateY = interpolate(presentationProgress, [0, 1], [100, 0]);
      const rotateX = interpolate(presentationProgress, [0, 1], [-tiltAngle * 1.2, 0]);
      const translateZ = interpolate(presentationProgress, [0, 1], [-180, 0]);
      const opacity = interpolate(presentationProgress, [0, 0.4, 1], [0, 0.8, 1]);

      return {
        width: '100%',
        height: '100%',
        transform: `translateY(${translateY}%) rotateX(${rotateX}deg) translateZ(${translateZ}px)`,
        opacity,
        transformOrigin: 'center bottom',
      };
    }
  }, [isEntering, presentationProgress, recedeDepth, tiltAngle]);

  return (
    <AbsoluteFill
      style={{
        perspective,
        transformStyle: 'preserve-3d',
        overflow: 'hidden',
      }}
    >
      <AbsoluteFill style={style}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

export const depthDeck3D = (
  props?: DepthDeck3DProps
): TransitionPresentation<DepthDeck3DProps> => ({
  component: DepthDeck3DComponent,
  props: props ?? {},
});

// ============================================================================
// 3. FLIP 3D TRANSITION (3D Perspective Card Flip with Specular Light Flash)
// ============================================================================

export type Flip3DDirection = 'from-bottom' | 'from-top' | 'from-right' | 'from-left';

export type Flip3DProps = {
  direction?: Flip3DDirection;
  perspective?: number;
  withFlash?: boolean;
  [key: string]: unknown;
};

const Flip3DComponent: React.FC<
  TransitionPresentationComponentProps<Flip3DProps>
> = ({
  children,
  presentationDirection,
  presentationProgress,
  passedProps: { direction = 'from-bottom', perspective = 1200, withFlash = true },
}) => {
  const isEntering = presentationDirection === 'entering';
  const isVertical = direction === 'from-bottom' || direction === 'from-top';

  const style = useMemo((): React.CSSProperties => {
    const sign = direction === 'from-bottom' || direction === 'from-right' ? 1 : -1;
    const exitAngle = -90 * sign;
    const enterAngle = 90 * sign;

    const angle = isEntering
      ? interpolate(presentationProgress, [0, 1], [enterAngle, 0])
      : interpolate(presentationProgress, [0, 1], [0, exitAngle]);

    const scale = isEntering
      ? interpolate(presentationProgress, [0, 1], [0.88, 1])
      : interpolate(presentationProgress, [0, 1], [1, 0.88]);

    const opacity = isEntering
      ? interpolate(presentationProgress, [0, 0.3, 1], [0, 0.7, 1])
      : interpolate(presentationProgress, [0, 0.7, 1], [1, 0.7, 0]);

    const rotateProp = isVertical ? `rotateX(${angle}deg)` : `rotateY(${angle}deg)`;

    return {
      width: '100%',
      height: '100%',
      transform: `${rotateProp} scale(${scale})`,
      opacity,
      transformOrigin: 'center center',
      backfaceVisibility: 'hidden',
      WebkitBackfaceVisibility: 'hidden',
    };
  }, [direction, isEntering, isVertical, presentationProgress]);

  // Flash highlight across the seam
  const flashOpacity = withFlash
    ? interpolate(presentationProgress, [0.35, 0.5, 0.65], [0, 0.6, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;

  return (
    <AbsoluteFill
      style={{
        perspective,
        transformStyle: 'preserve-3d',
        overflow: 'hidden',
      }}
    >
      <AbsoluteFill style={style}>{children}</AbsoluteFill>
      {withFlash && flashOpacity > 0 && (
        <AbsoluteFill
          style={{
            pointerEvents: 'none',
            backgroundColor: '#FFE500',
            opacity: flashOpacity,
            mixBlendMode: 'screen',
          }}
        />
      )}
    </AbsoluteFill>
  );
};

export const flip3D = (
  props?: Flip3DProps
): TransitionPresentation<Flip3DProps> => ({
  component: Flip3DComponent,
  props: props ?? {},
});
