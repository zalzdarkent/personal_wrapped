import React from 'react';
import { ThemeConfig, WrappedData } from '../../types';

interface WatermarkFooterProps {
  data: WrappedData;
  theme: ThemeConfig;
  isPro: boolean;
}

export const WatermarkFooter: React.FC<WatermarkFooterProps> = ({
  data,
  isPro,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 48,
        left: 48,
        right: 48,
        height: 80,
        backgroundColor: '#000000',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 36px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          fontFamily: '"Space Grotesk", sans-serif',
          fontWeight: 700,
          fontSize: 22,
          color: isPro ? '#FFE500' : '#FFFFFF',
          letterSpacing: '0.5px',
        }}
      >
        {isPro ? '✦ VIP PRO DOSSIER · UNRESTRICTED ARCHIVE' : 'PERSONAL YEAR WRAPPED 2026'}
      </div>

      <div
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontWeight: 700,
          fontSize: 20,
          color: isPro ? '#00F0FF' : '#FFE500',
          letterSpacing: '0.5px',
        }}
      >
        {isPro ? 'VERIFIED 2026 EDITION' : 'personalwrapped.app'}
      </div>
    </div>
  );
};
