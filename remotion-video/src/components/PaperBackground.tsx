import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { clamp, palette } from '../theme';

const contourPaths = [
  'M-120 200 C180 40 360 360 670 180 S1120 80 1420 260 S1840 310 2090 80',
  'M-180 280 C120 120 370 440 700 250 S1100 150 1460 330 S1800 380 2110 170',
  'M-120 850 C220 650 420 1010 760 790 S1250 650 1550 850 S1890 940 2110 720',
  'M-180 940 C170 730 430 1090 790 870 S1240 760 1580 940 S1900 1040 2110 820',
];

export const PaperBackground: React.FC<{
  frame?: number;
  accent?: 'sage' | 'blue' | 'clay' | 'amber';
}> = ({ accent = 'sage' }) => {
  const currentFrame = useCurrentFrame();
  const drift = interpolate(currentFrame, [0, 900], [0, 42], clamp);
  
  const accentColor =
    accent === 'sage'
      ? palette.sage
      : accent === 'blue'
        ? palette.blue
        : accent === 'clay'
          ? palette.clay
          : palette.amber;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: palette.paper,
        overflow: 'hidden',
      }}
    >
      {/* 细腻纸质纹理背景网格 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(${palette.line}40 1px, transparent 1px), linear-gradient(90deg, ${palette.line}40 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
          opacity: 0.75,
        }}
      />

      {/* 动态优雅的等高线 (Contour Curves) */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1920 1080"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
        }}
      >
        {contourPaths.map((d, index) => (
          <path
            key={index}
            d={d}
            fill="none"
            stroke={index % 2 === 0 ? accentColor : palette.line}
            strokeWidth={1.2}
            strokeDasharray={index % 2 === 0 ? 'none' : '6 8'}
            opacity={0.32}
            transform={`translate(${((index + 1) * drift * 0.4) % 40 - 20}, 0)`}
          />
        ))}
      </svg>

      {/* 边缘温润微暗角 (Vignette) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          boxShadow: `inset 0 0 140px ${palette.ink}0d`,
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
