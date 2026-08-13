import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {clamp, palette} from '../theme';

const contourPaths = [
  'M-120 200 C180 40 360 360 670 180 S1120 80 1420 260 S1840 310 2090 80',
  'M-180 280 C120 120 370 440 700 250 S1100 150 1460 330 S1800 380 2110 170',
  'M-120 850 C220 650 420 1010 760 790 S1250 650 1550 850 S1890 940 2110 720',
  'M-180 940 C170 730 430 1090 790 870 S1240 760 1580 940 S1900 1040 2110 820',
];

export const PaperBackground: React.FC<{accent?: 'sage' | 'blue'}> = ({
  accent = 'sage',
}) => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, 916], [0, 42], clamp);
  const color = accent === 'sage' ? palette.sage : palette.blue;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: palette.paper,
        overflow: 'hidden',
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage: [
            `radial-gradient(circle at 72% 34%, ${color}20 0, transparent 35%)`,
            `radial-gradient(circle at 16% 86%, ${palette.amber}16 0, transparent 30%)`,
            `linear-gradient(${palette.ink}0b 1px, transparent 1px)`,
            `linear-gradient(90deg, ${palette.ink}0b 1px, transparent 1px)`,
          ].join(','),
          backgroundSize: 'auto, auto, 96px 96px, 96px 96px',
          backgroundPosition: `0 0, 0 0, ${drift}px ${drift * 0.4}px, ${drift}px ${drift * 0.4}px`,
        }}
      />
      <svg
        width="1920"
        height="1080"
        viewBox="0 0 1920 1080"
        style={{position: 'absolute', inset: 0, opacity: 0.26}}
      >
        {contourPaths.map((d, index) => (
          <path
            key={d}
            d={d}
            fill="none"
            stroke={index < 2 ? color : palette.amber}
            strokeWidth={index % 2 === 0 ? 1.4 : 0.8}
            strokeDasharray={index % 2 === 0 ? undefined : '7 11'}
            transform={`translate(${drift * (index % 2 ? -0.45 : 0.3)} 0)`}
          />
        ))}
      </svg>
      <AbsoluteFill
        style={{
          opacity: 0.12,
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=%270 0 180 180%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%27.8%27 numOctaves=%273%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27 opacity=%27.14%27/%3E%3C/svg%3E")',
          mixBlendMode: 'multiply',
        }}
        from={-18} />
      <div
        style={{
          position: 'absolute',
          inset: 32,
          border: `1px solid ${palette.ink}18`,
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
