import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { PaperBackground } from './components/PaperBackground';
import { clamp, MONO, palette, SERIF } from './theme';

// --- Dynamic Timestamp Keyframes based on Composition FPS (30fps or 60fps) ---
// SRT Timeline:
// 1: 00:00:00,019 -> 00:00:04,285 (Continuous World)
// 2: 00:00:04,285 -> 00:00:06,990 (Digital Devices)
// 3: 00:00:06,990 -> 00:00:09,887 (Binary 0 & 1)
// 4: 00:00:09,887 -> 00:00:12,862 (Computer Magic)
// 5: 00:00:12,862 -> 00:00:16,630 (Infinite Earth -> Finite Memory)
// 6: 00:00:16,630 -> 00:00:19,505 (Spatial Analysis)
// 7: 00:00:19,505 -> 00:00:23,897 (Zoom & Navigation)
// 8: 00:00:23,897 -> 00:00:25,770 (Today's Deconstruction)
// 9: 00:00:25,770 -> 00:00:28,570 (Two Data Models)
// 10: 00:00:28,570 -> 00:00:30,525 (Vector & Raster Payoff)

export const getTimestamps = (fps: number) => {
  const f = (sec: number) => Math.round(sec * fps);
  return {
    act1_start: 0,
    act1_binary: f(4.285),
    act2_start: f(9.887),
    act2_zoom: f(16.630),
    act3_start: f(23.897),
    act3_reveal: f(28.570),
    end: f(30.525),
  };
};

const silkEase = Easing.bezier(0.16, 1, 0.3, 1);
const softEase = Easing.bezier(0.25, 1, 0.5, 1);

// Bottom Act Tracker (Clean & Centered, without left text or right progress bar)
const BottomTracker: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const T = getTimestamps(fps);

  const act = frame < T.act2_start ? 1 : frame < T.act3_start ? 2 : 3;

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 40,
        height: 54,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: SERIF,
        zIndex: 50,
      }}
    >
      {/* Centered Act Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {[
          { id: 1, label: '01. 真实与二进制' },
          { id: 2, label: '02. 抽象与分析' },
          { id: 3, label: '03. 矢量与栅格' },
        ].map((item) => {
          const isActive = act === item.id;
          const isPassed = act > item.id;
          return (
            <div
              key={item.id}
              style={{
                padding: '10px 28px',
                borderRadius: 30,
                background: isActive
                  ? palette.ink
                  : isPassed
                    ? palette.sage + '22'
                    : 'transparent',
                color: isActive
                  ? palette.paperLight
                  : isPassed
                    ? palette.sage
                    : palette.inkSoft + '88',
                border: `2px solid ${
                  isActive ? palette.ink : palette.ink + '25'
                }`,
                fontSize: 30,
                fontWeight: isActive ? 700 : 600,
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: isActive
                    ? palette.amber
                    : isPassed
                      ? palette.sage
                      : palette.inkSoft + '44',
                }}
              />
              {item.label}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- Left Morphing Typography Panel ---
const MorphingHeadline: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const T = getTimestamps(fps);
  const fadeOutFrames = Math.round(fps * 0.5); // 0.5s fade out

  // If we have passed into Act 3, headline cleanly unmounts after fade out
  if (frame >= T.act3_start + fadeOutFrames) return null;

  let eyebrow = '真实物理世界';
  let title = (
    <>
      <span>连续</span>
      <span style={{ color: palette.amber }}>、无限</span>
      <br />
      极其复杂
    </>
  );
  let subtitle = '无处不在 · 连续变化';
  let keyStart = 0;

  if (frame >= T.act1_binary && frame < T.act2_start) {
    eyebrow = '数字计算设备';
    title = (
      <>
        只识别 <span style={{ fontFamily: MONO, color: palette.blue }}>0</span>
        <span style={{ color: palette.inkSoft }}> 与 </span>
        <span style={{ fontFamily: MONO, color: palette.amber }}>1</span>
        <br />
        离散的有限设备
      </>
    );
    subtitle = '计算机与内存的基本结构';
    keyStart = T.act1_binary;
  } else if (frame >= T.act2_start && frame < T.act2_zoom) {
    eyebrow = '地理空间抽象';
    title = (
      <>
        把地球装进
        <br />
        <span style={{ color: palette.sage }}>有限的内存里</span>
      </>
    );
    subtitle = '把无限现实转化为有限数据';
    keyStart = T.act2_start;
  } else if (frame >= T.act2_zoom) {
    eyebrow = '空间计算与分析';
    title = (
      <>
        缩放 · 分析
        <br />
        <span style={{ color: palette.blue }}>与 动态导航</span>
      </>
    );
    subtitle = '地图是可计算的空间模型';
    keyStart = T.act2_zoom;
  }

  // Smooth entrance interpolation for each beat
  const relFrame = frame - keyStart;
  const slideIn = spring({
    frame: relFrame,
    fps,
    config: {
      damping: 22,
      stiffness: 85,
    },
  });
  const fade = interpolate(relFrame, [0, Math.round(fps * 0.33)], [0, 1], clamp);

  // Fade left panel when entering Act 3 so comparative cards take center stage cleanly
  const hideLeft = interpolate(
    frame,
    [T.act3_start - Math.round(fps * 0.66), T.act3_start + Math.round(fps * 0.33)],
    [1, 0],
    clamp
  );

  return (
    <div
      style={{
        position: 'absolute',
        left: 120,
        top: 190,
        width: 800,
        opacity: fade * hideLeft,
        transform: `translateY(${(1 - slideIn) * 28}px)`,
        zIndex: 20,
      }}
    >
      <div
        style={{
          color: palette.sage,
          fontFamily: SERIF,
          fontSize: 30,
          fontWeight: 700,
          letterSpacing: 1.5,
          marginBottom: 20,
          whiteSpace: 'nowrap',
        }}
      >
        {eyebrow}
      </div>

      <div
        style={{
          color: palette.ink,
          fontFamily: SERIF,
          fontSize: 88,
          fontWeight: 700,
          lineHeight: 1.18,
          whiteSpace: 'nowrap',
        }}
      >
        {title}
      </div>

      <div
        style={{
          color: palette.inkSoft,
          fontFamily: SERIF,
          fontSize: 30,
          marginTop: 26,
          whiteSpace: 'nowrap',
          opacity: 0.9,
          fontWeight: 600,
        }}
      >
        {subtitle}
      </div>

      {/* Feature tags row */}
      <div
        style={{
          marginTop: 46,
          display: 'flex',
          gap: 16,
          opacity: interpolate(relFrame, [Math.round(fps * 0.4), Math.round(fps * 0.8)], [0, 1], clamp),
        }}
      >
        {frame < T.act1_binary
          ? ['高程地形', '温度湿度', '植被水系'].map((tag) => (
            <div
              key={tag}
              style={{
                padding: '12px 28px',
                border: `2px solid ${palette.ink}25`,
                background: palette.paperLight + 'dd',
                fontFamily: SERIF,
                fontSize: 30,
                fontWeight: 600,
                color: palette.inkSoft,
                whiteSpace: 'nowrap',
              }}
            >
              {tag}
            </div>
          ))
          : frame < T.act2_start
            ? ['二进制流 0101', '内存 Block', '离散采样'].map((tag) => (
              <div
                key={tag}
                style={{
                  padding: '12px 28px',
                  border: `2px solid ${palette.blue}44`,
                  background: palette.blue + '12',
                  fontFamily: SERIF,
                  fontSize: 30,
                  fontWeight: 600,
                  color: palette.blue,
                  whiteSpace: 'nowrap',
                }}
              >
                {tag}
              </div>
            ))
            : frame < T.act2_zoom
              ? ['坐标索引 (x,y)', '矩阵像素 Grid', '空间降维'].map((tag) => (
                <div
                  key={tag}
                  style={{
                    padding: '12px 28px',
                    border: `2px solid ${palette.sage}44`,
                    background: palette.sage + '12',
                    fontFamily: SERIF,
                    fontSize: 30,
                    fontWeight: 600,
                    color: palette.sage,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tag}
                </div>
              ))
              : ['矢量路线', '栅格高程图', '无级缩放'].map((tag) => (
                <div
                  key={tag}
                  style={{
                    padding: '12px 28px',
                    border: `2px solid ${palette.amber}55`,
                    background: palette.amber + '15',
                    fontFamily: SERIF,
                    fontSize: 30,
                    fontWeight: 600,
                    color: palette.amber,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tag}
                </div>
              ))}
      </div>
    </div>
  );
};

// --- Unified Graphic Visual (3D Morphing Globe -> Stacked Map -> Split Models -> Title Payoff) ---
const UnifiedVisualCanvas: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const T = getTimestamps(fps);

  // Act 1: Globe rotation & binary scanning stream
  const rotateGlobe = interpolate(frame, [0, T.act2_start], [-10, 22], clamp);
  const binaryScan = interpolate(
    frame,
    [T.act1_binary, T.act1_binary + Math.round(fps * 1.0)],
    [0, 1],
    clamp
  );

  // Transition from Globe to Isometric Stacked Map (Act 1 -> Act 2)
  const morphToStack = interpolate(
    frame,
    [T.act2_start - Math.round(fps * 0.5), T.act2_start + Math.round(fps * 1.15)],
    [0, 1],
    { ...clamp, easing: silkEase }
  );

  // Transition Act 2 Zoom & Navigation
  const mapZoom = interpolate(
    frame,
    [T.act2_zoom - Math.round(fps * 0.33), T.act2_zoom + Math.round(fps * 1.66)],
    [1, 1.45],
    { ...clamp, easing: softEase }
  );
  const mapPanX = interpolate(
    frame,
    [T.act2_zoom - Math.round(fps * 0.33), T.act2_zoom + Math.round(fps * 1.66)],
    [0, -70],
    clamp
  );
  const routeProgress = interpolate(
    frame,
    [T.act2_zoom + Math.round(fps * 0.33), T.act3_start - Math.round(fps * 0.66)],
    [0, 1],
    clamp
  );

  // Transition Act 3: Smooth Unfolding / Splitting into Comparative Cards
  const act3RelFrame = frame - (T.act3_start - Math.round(fps * 0.33));
  const cardSpring = spring({
    frame: act3RelFrame,
    fps,
    config: {
      damping: 18,
      stiffness: 55,
    },
  });

  const morphToSplit = interpolate(
    frame,
    [T.act3_start - Math.round(fps * 0.66), T.act3_start + Math.round(fps * 0.83)],
    [0, 1],
    { ...clamp, easing: silkEase }
  );

  const finalReveal = spring({
    frame: frame - T.act3_reveal,
    fps,
    config: {
      damping: 18,
      stiffness: 75,
    },
  });

  return (
    <AbsoluteFill style={{ zIndex: 10, pointerEvents: 'none' }}>
      {/* --- RIGHT SIDE CONTAINER FOR ACT 1 (GLOBE) & ACT 2 (STACKED MAP) --- */}
      {frame < T.act3_start + Math.round(fps * 0.83) && (
        <div
          style={{
            position: 'absolute',
            right: 100,
            top: 130,
            width: 820,
            height: 740,
            display: 'grid',
            placeItems: 'center',
          }}
        >
          {/* PHASE 1 & 2: CONTINUOUS GLOBE & BINARY SCANNER */}
          {frame < T.act2_start + Math.round(fps * 1.15) && (
            <div
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                opacity: 1 - morphToStack,
                transform: `scale(${(1 - morphToStack * 0.3) * (0.88 + Math.sin(frame * (0.9 / fps)) * 0.02)
                  }) rotate(${rotateGlobe}deg)`,
                transition: 'opacity 0.2s ease',
              }}
            >
              {/* Globe Graphic Sphere */}
              <div
                style={{
                  width: 540,
                  height: 540,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  position: 'relative',
                  boxShadow: `0 40px 90px ${palette.ink}22, inset -32px -24px 70px ${palette.blue}25`,
                  background: palette.paperLight,
                  border: `2px solid ${palette.ink}24`,
                }}
              >
                <svg width="540" height="540" viewBox="0 0 540 540">
                  <defs>
                    <clipPath id="globe-clip-main">
                      <circle cx="270" cy="270" r="266" />
                    </clipPath>
                  </defs>
                  <g clipPath="url(#globe-clip-main)">
                    <rect width="540" height="540" fill={palette.paperLight} />

                    {/* Latitude Lines */}
                    {Array.from({ length: 9 }).map((_, i) => (
                      <ellipse
                        key={`lat-${i}`}
                        cx="270"
                        cy={65 + i * 52}
                        rx={260 - Math.abs(4 - i) * 22}
                        ry={34 + Math.abs(4 - i) * 5}
                        fill="none"
                        stroke={binaryScan > 0.4 ? palette.blue : palette.sage}
                        strokeOpacity={0.22 + (i % 2) * 0.08}
                        strokeWidth="1.2"
                      />
                    ))}

                    {/* Longitude Lines */}
                    {Array.from({ length: 7 }).map((_, i) => (
                      <ellipse
                        key={`lng-${i}`}
                        cx="270"
                        cy="270"
                        rx={42 + i * 42}
                        ry="262"
                        fill="none"
                        stroke={binaryScan > 0.4 ? palette.blue : palette.sage}
                        strokeOpacity="0.2"
                        strokeWidth="1.2"
                      />
                    ))}

                    {/* Continent Outlines */}
                    <path
                      d="M75 135 C140 90 215 128 237 178 C262 234 330 206 355 250 C385 302 350 368 279 384 C203 401 195 478 122 457 C65 440 27 382 42 319 C56 262 15 191 75 135Z"
                      fill={palette.sage}
                      fillOpacity={0.7 + binaryScan * 0.1}
                    />
                    <path
                      d="M364 75 C435 67 505 115 510 183 C514 239 461 245 457 301 C452 357 496 389 450 440 C410 485 353 476 334 422 C311 358 375 333 351 281 C330 235 282 200 307 141 Z"
                      fill={palette.amber}
                      fillOpacity={0.5}
                    />

                    {/* Binary Overlay Grid */}
                    {binaryScan > 0.05 && (
                      <g opacity={binaryScan}>
                        {Array.from({ length: 36 }).map((_, i) => {
                          const col = i % 6;
                          const row = Math.floor(i / 6);
                          const bit = (i * 13 + Math.floor(frame / (fps / 5))) % 2;
                          return (
                            <text
                              key={i}
                              x={85 + col * 74}
                              y={105 + row * 70}
                              fill={bit ? palette.blue : palette.amber}
                              fontSize="30"
                              fontFamily={MONO}
                              fontWeight="700"
                              opacity={0.8}
                            >
                              {bit}
                            </text>
                          );
                        })}
                      </g>
                    )}
                  </g>
                  <circle
                    cx="270"
                    cy="270"
                    r="266"
                    fill="none"
                    stroke={palette.ink}
                    strokeOpacity=".25"
                    strokeWidth="3"
                  />
                </svg>
              </div>

              {/* Ambient Data Badge */}
              <div
                style={{
                  marginTop: 20,
                  background: palette.paperLight + 'f6',
                  border: `2px solid ${palette.ink}25`,
                  padding: '12px 30px',
                  fontFamily: SERIF,
                  fontSize: 30,
                  fontWeight: 700,
                  color: palette.inkSoft,
                  borderRadius: 30,
                  boxShadow: `0 8px 20px ${palette.ink}12`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  whiteSpace: 'nowrap',
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: binaryScan > 0.5 ? palette.blue : palette.sage,
                  }}
                />
                {binaryScan > 0.5
                  ? '数字计算：二进制数据流'
                  : '物理世界：连续场'}
              </div>
            </div>
          )}

          {/* PHASE 3 & 4: 3D ISOMETRIC STACKED MAP (ACT 2) */}
          {frame >= T.act2_start - Math.round(fps * 0.5) && frame < T.act3_start + Math.round(fps * 0.66) && (
            <div
              style={{
                position: 'absolute',
                opacity: morphToStack * (1 - morphToSplit),
                transform: `scale(${(0.85 + morphToStack * 0.15) * mapZoom * (1 - morphToSplit * 0.25)
                  }) translateX(${mapPanX}px) perspective(1000px) rotateX(${50 - (mapZoom - 1) * 15 - morphToSplit * 30
                  }deg) rotateZ(${-15 + (mapZoom - 1) * 10}deg)`,
                transition: 'opacity 0.2s ease',
              }}
            >
              <div
                style={{
                  width: 740,
                  height: 520,
                  position: 'relative',
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Layer 1: Memory Address Grid */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: palette.paperLight,
                    border: `2px solid ${palette.ink}44`,
                    boxShadow: `0 30px 60px ${palette.ink}20`,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(12, 1fr)',
                    gridTemplateRows: 'repeat(8, 1fr)',
                    gap: 2,
                    padding: 8,
                    transform: 'translateZ(-40px)',
                    opacity: 0.7,
                  }}
                >
                  {Array.from({ length: 96 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        border: `1px solid ${palette.ink}12`,
                        background: (i * 7) % 3 === 0 ? palette.sage + '15' : 'transparent',
                        display: 'grid',
                        placeItems: 'center',
                        fontFamily: MONO,
                        fontSize: 30,
                        fontWeight: 700,
                        color: palette.inkSoft + '99',
                      }}
                    >
                      {(i * 4).toString(16).toUpperCase()}
                    </div>
                  ))}
                </div>

                {/* Layer 2: Raster Elevation Terrain & Vector Routes */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: palette.paperLight + 'fa',
                    border: `2px solid ${palette.blue}66`,
                    boxShadow: `0 20px 40px ${palette.blue}15`,
                    transform: 'translateZ(20px)',
                    overflow: 'hidden',
                  }}
                >
                  <svg width="740" height="520" viewBox="0 0 740 520">
                    {/* Elevation Contours */}
                    {Array.from({ length: 10 }).map((_, i) => (
                      <path
                        key={i}
                        d={`M-40 ${40 + i * 48} C140 ${10 + i * 50} 220 ${100 + i * 32
                          } 380 ${45 + i * 50} S600 ${15 + i * 45} 760 ${65 + i * 44}`}
                        fill="none"
                        stroke={palette.blue}
                        strokeOpacity={0.24}
                        strokeWidth="1.5"
                      />
                    ))}

                    {/* Animated Navigation Route */}
                    <path
                      d="M 80 410 C 180 320 210 260 310 285 S 430 225 500 125 S 620 55 700 95"
                      fill="none"
                      stroke={palette.clay}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray="900"
                      strokeDashoffset={900 * (1 - routeProgress)}
                    />
                    <path
                      d="M 80 410 C 180 320 210 260 310 285 S 430 225 500 125 S 620 55 700 95"
                      fill="none"
                      stroke={palette.paperLight}
                      strokeWidth="2.5"
                      strokeDasharray="12 12"
                    />

                    {/* Node Anchors */}
                    {[
                      [80, 410],
                      [310, 285],
                      [500, 125],
                      [700, 95],
                    ].map(([x, y], i) => (
                      <g key={i} transform={`translate(${x}, ${y})`}>
                        <circle
                          r="9"
                          fill={palette.amber}
                          stroke={palette.paperLight}
                          strokeWidth="3"
                        />
                        <circle
                          r="16"
                          fill="none"
                          stroke={palette.amber}
                          strokeWidth="1.5"
                          strokeOpacity="0.5"
                        />
                      </g>
                    ))}
                  </svg>

                  {/* Spatial Overlay Badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 18,
                      left: 20,
                      fontFamily: SERIF,
                      fontSize: 30,
                      fontWeight: 700,
                      color: palette.inkSoft,
                      background: palette.paperLight + 'ee',
                      padding: '10px 24px',
                      border: `2px solid ${palette.ink}22`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                    }}
                  >
                    <span>缩放比例: {Math.round(mapZoom * 100)}%</span>
                    <span style={{ color: palette.sage }}>
                      N 31°14'22" E 121°28'09"
                    </span>
                  </div>

                  {/* In-Card Layer Label Pins */}
                  <div
                    style={{
                      position: 'absolute',
                      right: 20,
                      top: 18,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                    }}
                  >
                    {[
                      { label: '矢量道路线', color: palette.clay },
                      { label: '高程栅格场', color: palette.blue },
                      { label: '内存数据块', color: palette.sage },
                    ].map((item) => (
                      <div
                        key={item.label}
                        style={{
                          background: palette.paperLight + 'ee',
                          border: `2px solid ${palette.ink}22`,
                          padding: '10px 22px',
                          fontFamily: SERIF,
                          fontSize: 30,
                          fontWeight: 700,
                          color: palette.ink,
                          whiteSpace: 'nowrap',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                        }}
                      >
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 3,
                            background: item.color,
                          }}
                        />
                        {item.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- CENTER FULL-SCREEN CONTAINER FOR ACT 3 (SPLIT COMPARATIVE CARDS & FINAL REVEAL) --- */}
      {frame >= T.act3_start - Math.round(fps * 0.66) && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: morphToSplit,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Side-by-Side Comparative Cards (Smoothly spring-unfold outwards) */}
          <div
            style={{
              display: 'flex',
              gap: 50,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: (1 - finalReveal) * 0.98,
              transform: `scale(${1 - finalReveal * 0.08})`,
            }}
          >
            {/* Vector Card */}
            <div
              style={{
                width: 580,
                height: 580,
                background: palette.paperLight,
                border: `3px solid ${palette.sage}`,
                boxShadow: `0 24px 60px ${palette.sage}22`,
                padding: 32,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transform: `translateX(${interpolate(cardSpring, [0, 1], [-140, 0])}px) scale(${interpolate(cardSpring, [0, 1], [0.9, 1])})`,
                opacity: cardSpring,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ fontFamily: SERIF, fontSize: 48, color: palette.sage, fontWeight: 700 }}>
                  矢量数据
                </div>
                <div
                  style={{
                    fontFamily: SERIF,
                    fontSize: 30,
                    fontWeight: 700,
                    color: palette.sage,
                    border: `2px solid ${palette.sage}44`,
                    padding: '8px 22px',
                    background: palette.sage + '12',
                  }}
                >
                  几何坐标 (X, Y)
                </div>
              </div>

              {/* Vector Graphic: Bezier Anchor Curve */}
              <div
                style={{
                  height: 330,
                  position: 'relative',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <svg width="500" height="300" viewBox="0 0 500 300">
                  <path
                    d="M 40 240 C 100 45, 250 260, 410 60"
                    fill="none"
                    stroke={palette.sage}
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                  {/* Control Lines */}
                  <line
                    x1="40"
                    y1="240"
                    x2="100"
                    y2="45"
                    stroke={palette.sage}
                    strokeDasharray="6 6"
                    strokeWidth="2"
                    opacity="0.6"
                  />
                  <line
                    x1="410"
                    y1="60"
                    x2="250"
                    y2="260"
                    stroke={palette.sage}
                    strokeDasharray="6 6"
                    strokeWidth="2"
                    opacity="0.6"
                  />

                  {/* Anchor Handles */}
                  {[
                    [40, 240, '点 P0', 20],
                    [100, 45, '点 P1', 20],
                    [250, 260, '点 P2', 20],
                    [410, 60, '点 P3', -115],
                  ].map(([x, y, label, textX], i) => (
                    <g key={i} transform={`translate(${x}, ${y})`}>
                      <rect
                        x="-10"
                        y="-10"
                        width="20"
                        height="20"
                        fill={palette.paperLight}
                        stroke={palette.sage}
                        strokeWidth="3.5"
                      />
                      <text
                        x={textX as number}
                        y="10"
                        fontFamily={SERIF}
                        fontSize="30"
                        fill={palette.sage}
                        fontWeight="700"
                      >
                        {label}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>

              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 30,
                  fontWeight: 700,
                  color: palette.inkSoft,
                  borderTop: `2px solid ${palette.ink}18`,
                  paddingTop: 16,
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>精确几何 · 点线面</span>
                <span>离散要素</span>
              </div>
            </div>

            {/* Raster Card */}
            <div
              style={{
                width: 580,
                height: 580,
                background: palette.paperLight,
                border: `3px solid ${palette.blue}`,
                boxShadow: `0 24px 60px ${palette.blue}22`,
                padding: 32,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transform: `translateX(${interpolate(cardSpring, [0, 1], [140, 0])}px) scale(${interpolate(cardSpring, [0, 1], [0.9, 1])})`,
                opacity: cardSpring,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ fontFamily: SERIF, fontSize: 48, color: palette.blue, fontWeight: 700 }}>
                  栅格数据
                </div>
                <div
                  style={{
                    fontFamily: SERIF,
                    fontSize: 30,
                    fontWeight: 700,
                    color: palette.blue,
                    border: `2px solid ${palette.blue}44`,
                    padding: '8px 22px',
                    background: palette.blue + '12',
                  }}
                >
                  矩阵像元
                </div>
              </div>

              {/* Raster Graphic: Pixel Matrix */}
              <div
                style={{
                  height: 330,
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <div
                  style={{
                    width: 440,
                    height: 300,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(8, 1fr)',
                    gridTemplateRows: 'repeat(6, 1fr)',
                    gap: 4,
                    border: `2px solid ${palette.blue}44`,
                    padding: 4,
                    background: palette.paper,
                  }}
                >
                  {Array.from({ length: 48 }).map((_, i) => {
                    const row = Math.floor(i / 8);
                    const col = i % 8;
                    const val = Math.floor(
                      Math.sin(row * 0.8 + col * 0.6) * 120 + 130
                    );
                    const isHigh = val > 160;
                    return (
                      <div
                        key={i}
                        style={{
                          background: isHigh
                            ? palette.blue
                            : val > 110
                              ? palette.blueLight
                              : palette.amber + '99',
                          color: isHigh ? palette.paperLight : palette.ink,
                          display: 'grid',
                          placeItems: 'center',
                          fontFamily: MONO,
                          fontSize: 22,
                          fontWeight: 700,
                        }}
                      >
                        {val}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 30,
                  fontWeight: 700,
                  color: palette.inkSoft,
                  borderTop: `2px solid ${palette.ink}18`,
                  paddingTop: 16,
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>像元阵列 · 行列值</span>
                <span>连续属性</span>
              </div>
            </div>
          </div>

          {/* --- GRAND FINAL TITLE REVEAL ("矢量与栅格") --- */}
          {frame >= T.act3_reveal - Math.round(fps * 0.5) && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'grid',
                placeItems: 'center',
                opacity: finalReveal,
                transform: `scale(${0.92 + finalReveal * 0.08})`,
                zIndex: 60,
              }}
            >
              <div
                style={{
                  textAlign: 'center',
                  background: palette.paperLight,
                  padding: '56px 100px',
                  border: `3px solid ${palette.ink}33`,
                  boxShadow: `0 40px 100px ${palette.ink}35`,
                }}
              >
                <div
                  style={{
                    fontFamily: SERIF,
                    fontSize: 34,
                    color: palette.sage,
                    fontWeight: 700,
                    letterSpacing: 2,
                    marginBottom: 24,
                  }}
                >
                  GIS 最底层的两大数据模型
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 48,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span
                    style={{
                      fontFamily: SERIF,
                      fontSize: 150,
                      fontWeight: 700,
                      color: palette.sage,
                    }}
                  >
                    矢量
                  </span>
                  <span
                    style={{
                      fontFamily: SERIF,
                      fontSize: 76,
                      color: palette.inkSoft,
                      fontStyle: 'italic',
                    }}
                  >
                    与
                  </span>
                  <span
                    style={{
                      fontFamily: SERIF,
                      fontSize: 150,
                      fontWeight: 700,
                      color: palette.blue,
                    }}
                  >
                    栅格
                  </span>
                </div>

                {/* Accent Split Bar */}
                <div
                  style={{
                    width: 760,
                    height: 6,
                    margin: '32px auto 0',
                    background: `linear-gradient(90deg, ${palette.sage} 0 46%, ${palette.amber} 46% 54%, ${palette.blue} 54% 100%)`,
                    transform: `scaleX(${finalReveal})`,
                  }}
                />

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: 760,
                    margin: '24px auto 0',
                    fontFamily: SERIF,
                    fontSize: 30,
                    fontWeight: 700,
                    color: palette.inkSoft,
                  }}
                >
                  <span>矢量模型 / 离散要素</span>
                  <span>栅格模型 / 连续属性</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </AbsoluteFill>
  );
};

export const GISOpening: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const T = getTimestamps(fps);
  const scale = width / 1920;

  const accent =
    frame >= T.act1_binary && frame < T.act3_start
      ? 'blue'
      : 'sage';

  return (
    <AbsoluteFill style={{ fontFamily: SERIF, background: palette.paper }}>
      <div
        style={{
          width: 1920,
          height: 1080,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          position: 'relative',
        }}
      >
        <PaperBackground accent={accent} />
        <MorphingHeadline frame={frame} />
        <UnifiedVisualCanvas frame={frame} />
        <BottomTracker frame={frame} />
      </div>
    </AbsoluteFill>
  );
};
