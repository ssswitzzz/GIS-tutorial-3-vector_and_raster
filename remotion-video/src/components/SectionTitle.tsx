import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, MONO, palette, SERIF} from '../theme';

export const SectionTitle: React.FC<{
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  start?: number;
  align?: 'left' | 'center';
}> = ({eyebrow, title, subtitle, start = 0, align = 'left'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame: frame - start, fps, damping: 20, stiffness: 78});
  const opacity = interpolate(frame, [start, start + 12], [0, 1], clamp);

  return (
    <div
      style={{
        textAlign: align,
        opacity,
        transform: `translateY(${(1 - enter) * 34}px)`,
      }}
    >
      <div
        style={{
          color: palette.sage,
          fontFamily: MONO,
          fontSize: 16,
          fontWeight: 700,
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          marginBottom: 20,
        }}
      >
        {eyebrow}
      </div>
      <div
        style={{
          color: palette.ink,
          fontFamily: SERIF,
          fontSize: 88,
          fontWeight: 600,
          lineHeight: 1.16,
          letterSpacing: 0,
          whiteSpace: 'nowrap',
        }}
      >
        {title}
      </div>
      {subtitle ? (
        <div
          style={{
            color: palette.inkSoft,
            fontFamily: MONO,
            fontSize: 18,
            marginTop: 26,
            whiteSpace: 'nowrap',
          }}
        >
          {subtitle}
        </div>
      ) : null}
    </div>
  );
};
