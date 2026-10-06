import React from 'react';
import { Easing, interpolate, useCurrentFrame } from 'remotion';
import { ThemeConfig, WrappedData } from '../../types';
import { VinylRecord3D } from '../components/3d/VinylRecord3D';

interface Scene3TopItemsProps {
  data: WrappedData;
  theme: ThemeConfig;
  isPro: boolean;
}

export const Scene3TopItems: React.FC<Scene3TopItemsProps> = ({
  data,
  isPro,
}) => {
  const frame = useCurrentFrame();

  // 1. Header Animation
  const tagY = interpolate(frame, [0, 18], [25, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const tagOpacity = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const titleY = interpolate(frame, [6, 24], [25, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const titleOpacity = interpolate(frame, [6, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const topItems = data.topItems.slice(0, 5);

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
        boxSizing: 'border-box',
        perspective: 1200,
      }}
    >
      {/* 3D Spinning Vinyl Record Floating in Top Right Corner */}
      <div
        style={{
          position: 'absolute',
          top: -20,
          right: -10,
          zIndex: 10,
          pointerEvents: 'none',
        }}
      >
        <VinylRecord3D
          size={200}
          labelColor={isPro ? '#00F0FF' : '#FFE500'}
          subLabel="TOP 5"
        />
      </div>

      {/* Header */}
      <div style={{ marginBottom: 28, maxWidth: 650 }}>
        <div
          style={{
            transform: `translateY(${tagY}px)`,
            opacity: tagOpacity,
            fontFamily: '"JetBrains Mono", monospace',
            fontWeight: 700,
            fontSize: 30,
            color: '#000000',
            letterSpacing: '1px',
            marginBottom: 6,
          }}
        >
          [ 02 // TOP 5 OBSESSIONS ]
        </div>

        <div
          style={{
            transform: `translateY(${titleY}px)`,
            opacity: titleOpacity,
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 900,
            fontSize: 64,
            lineHeight: 1.05,
            color: '#000000',
            letterSpacing: '-1px',
          }}
        >
          HEAVY ROTATION
        </div>
      </div>

      {/* 5 Stacked Cards with 3D Shelf Entrance & Perspective Tilt */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          width: '100%',
          perspective: 1000,
          transformStyle: 'preserve-3d',
        }}
      >
        {topItems.map((item, idx) => {
          const itemDelay = 12 + idx * 8;

          // 3D Shelf Flip entrance
          const rotX = interpolate(
            frame,
            [itemDelay, itemDelay + 22],
            [-32, 0],
            {
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }
          );
          const rotY = interpolate(
            frame,
            [itemDelay, itemDelay + 22],
            [idx % 2 === 0 ? -12 : 12, 0],
            {
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }
          );
          const transZ = interpolate(
            frame,
            [itemDelay, itemDelay + 22],
            [-120, 0],
            {
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }
          );
          const slideX = interpolate(
            frame,
            [itemDelay, itemDelay + 22],
            [idx % 2 === 0 ? -50 : 50, 0],
            {
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }
          );
          const itemOpacity = interpolate(
            frame,
            [itemDelay, itemDelay + 14],
            [0, 1],
            {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }
          );

          // Subtle ambient floating bob for #1 item
          const isFirst = idx === 0;
          const firstAmbientY = isFirst ? Math.sin(frame * 0.08) * 4 : 0;
          const firstZOffset = isFirst ? 18 : 0;

          return (
            <div
              key={item.id || idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: isFirst ? '20px 28px' : '18px 24px',
                backgroundColor: isFirst
                  ? isPro
                    ? '#FFE500'
                    : '#D2FF3A'
                  : '#FFFFFF',
                border: isFirst ? '5px solid #000000' : '4px solid #000000',
                boxShadow: isFirst
                  ? '9px 9px 0px #000000'
                  : '5px 5px 0px #000000',
                borderRadius: isPro ? 16 : 8,
                transform: `translateX(${slideX}px) translateY(${firstAmbientY}px) translateZ(${transZ + firstZOffset}px) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
                opacity: itemOpacity,
                transformOrigin: idx % 2 === 0 ? 'left center' : 'right center',
                boxSizing: 'border-box',
                position: 'relative',
              }}
            >
              {/* Left Rank & Info */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 20,
                  minWidth: 0,
                  flex: 1,
                }}
              >
                {/* Rank Badge */}
                <div
                  style={{
                    width: 58,
                    height: 58,
                    backgroundColor: '#000000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: isFirst ? '2px 2px 0px rgba(0,0,0,0.4)' : undefined,
                  }}
                >
                  <span
                    style={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontWeight: 900,
                      fontSize: 30,
                      color: isFirst
                        ? isPro
                          ? '#FFE500'
                          : '#D2FF3A'
                        : '#FFFFFF',
                    }}
                  >
                    0{idx + 1}
                  </span>
                </div>

                {/* Text */}
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontFamily: '"Space Grotesk", sans-serif',
                      fontWeight: 800,
                      fontSize: isFirst ? 36 : 30,
                      color: '#000000',
                      lineHeight: 1.15,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.name}
                  </div>

                  {item.subtitle && (
                    <div
                      style={{
                        fontFamily: '"Plus Jakarta Sans", sans-serif',
                        fontWeight: 600,
                        fontSize: 20,
                        color: '#444444',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        marginTop: 2,
                      }}
                    >
                      {item.subtitle}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Count Tag */}
              {item.count && (
                <div
                  style={{
                    backgroundColor: '#000000',
                    padding: '8px 18px',
                    borderRadius: 4,
                    marginLeft: 16,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {isFirst && (
                    <span style={{ color: '#FFE500', fontSize: 16 }}>★</span>
                  )}
                  <span
                    style={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontWeight: 700,
                      fontSize: 20,
                      color: isFirst ? '#FFE500' : isPro ? '#00F0FF' : '#D2FF3A',
                    }}
                  >
                    {String(item.count)}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
