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

// --- Subtitle Audio Timestamps (60 FPS) ---
// Relative to start at 30.500s (Total duration: 73.933s = 4436 frames)
export const getTimestamps = (fps: number) => {
  const f = (sec: number) => Math.round(sec * fps);
  return {
    start: 0,
    two_categories: f(6.866),
    discrete_intro: f(10.766),
    discrete_street: f(18.333),
    discrete_count: f(27.633),
    discrete_summary: f(35.700),
    field_transition: f(37.766),
    field_intro: f(44.600),
    field_examples: f(48.266),
    field_probe: f(57.933),
    field_summary: f(66.600),
    end: f(73.933),
  };
};

// Bottom Chapter Progress Tracker (Centered, No English)
const BottomTracker: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const T = getTimestamps(fps);

  const act = frame < T.discrete_intro ? 1 : frame < T.field_transition ? 2 : 3;

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 36,
        height: 54,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: SERIF,
        zIndex: 50,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {[
          { id: 1, label: '01. 观察与认知' },
          { id: 2, label: '02. 离散对象' },
          { id: 3, label: '03. 连续场' },
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
                fontSize: 26,
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

// Centered Top Header Panel (Concise text, No English, Centered Layout)
const CenteredHeadline: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const T = getTimestamps(fps);

  let eyebrow = '地理空间认知';
  let title = '大脑如何看待这个世界？';
  let subtitle = '在把数据塞进电脑之前，先搞清楚人脑的观察模式';
  let keyStart = 0;

  if (frame >= T.two_categories && frame < T.discrete_intro) {
    eyebrow = '地理实体分类';
    title = '身边的事物分为两类地理实体';
    subtitle = '第一类：离散对象  |  第二类：连续场';
    keyStart = T.two_categories;
  } else if (frame >= T.discrete_intro && frame < T.field_transition) {
    eyebrow = '第一类地理实体';
    title = '离散对象：明确边界 · 独立可数';
    subtitle =
      frame >= T.discrete_count
        ? '一栋楼、两棵树、三辆车 · 可被清晰独立计数'
        : '大街上的建筑物、行道树与汽车，具有分明的空间界限';
    keyStart = frame >= T.discrete_count ? T.discrete_count : T.discrete_intro;
  } else if (frame >= T.field_transition && frame < T.field_summary) {
    eyebrow = '第二类地理实体';
    title = '连续场：处处有值 · 无明确界限';
    subtitle =
      frame >= T.field_probe
        ? '空间脚下任意一点都必有具体数值（哪怕数值为零）'
        : '海拔、温度、湿度、噪声大小与 PM 2.5 浓度';
    keyStart = frame >= T.field_probe ? T.field_probe : T.field_transition;
  } else if (frame >= T.field_summary) {
    eyebrow = '认知归纳总结';
    title = '离散对象 映射 矢量  |  连续场 映射 栅格';
    subtitle = '人类大脑看待世界的两把钥匙';
    keyStart = T.field_summary;
  }

  const relFrame = frame - keyStart;
  const slideIn = spring({
    frame: relFrame,
    fps,
    config: { damping: 22, stiffness: 85 },
  });
  const fade = interpolate(relFrame, [0, Math.round(fps * 0.3)], [0, 1], clamp);

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 70,
        textAlign: 'center',
        opacity: fade,
        transform: `translateY(${(1 - slideIn) * 20}px)`,
        zIndex: 20,
      }}
    >
      <div
        style={{
          color: palette.sage,
          fontFamily: SERIF,
          fontSize: 24,
          fontWeight: 700,
          letterSpacing: 2,
          marginBottom: 10,
        }}
      >
        {eyebrow}
      </div>

      <div
        style={{
          color: palette.ink,
          fontFamily: SERIF,
          fontSize: 64,
          fontWeight: 700,
          lineHeight: 1.2,
          whiteSpace: 'nowrap',
        }}
      >
        {title}
      </div>

      <div
        style={{
          color: palette.inkSoft,
          fontFamily: SERIF,
          fontSize: 26,
          marginTop: 12,
          fontWeight: 600,
          whiteSpace: 'nowrap',
        }}
      >
        {subtitle}
      </div>
    </div>
  );
};

// Stage 1: Redesigned Cognitive Model (Frames 0 - 412)
const CognitiveLens: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const T = getTimestamps(fps);

  if (frame >= T.two_categories) return null;

  const enter = spring({ frame, fps, config: { damping: 20, stiffness: 80 } });

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: 250,
        width: 1360,
        height: 630,
        transform: `translateX(-50%) scale(${0.95 + enter * 0.05})`,
        background: palette.paperLight,
        border: `3px solid ${palette.sage}`,
        borderRadius: 24,
        boxShadow: `0 24px 60px ${palette.sage}20`,
        opacity: enter,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        padding: 36,
      }}
    >
      {/* Header Inside Card */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `2px solid ${palette.sage}33`,
          paddingBottom: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: palette.sage,
            }}
          />
          <span
            style={{
              fontFamily: SERIF,
              fontSize: 26,
              fontWeight: 700,
              color: palette.ink,
            }}
          >
            人类大脑的空间认知解构过程
          </span>
        </div>

        <span
          style={{
            padding: '6px 20px',
            background: palette.sage + '18',
            color: palette.sage,
            fontFamily: SERIF,
            fontSize: 20,
            fontWeight: 700,
            borderRadius: 20,
          }}
        >
          物理现实 → 大脑解构
        </span>
      </div>

      {/* 3-Column Visual Process Diagram */}
      <div
        style={{
          flex: 1,
          marginTop: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 32,
        }}
      >
        {/* Step 1: Real Physical World */}
        <div
          style={{
            flex: 1,
            height: '100%',
            background: palette.paper,
            border: `2px stroke ${palette.line}`,
            borderRadius: 16,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 26,
              fontWeight: 700,
              color: palette.ink,
              marginBottom: 16,
            }}
          >
            ① 真实物理世界
          </div>
          <svg width="220" height="200" viewBox="0 0 220 200">
            <circle
              cx="110"
              cy="100"
              r="75"
              fill={palette.sage + '15'}
              stroke={palette.sage}
              strokeWidth="3"
            />
            <path
              d="M50 140 Q 90 60 120 120 T 170 140"
              fill="none"
              stroke={palette.sage}
              strokeWidth="4"
            />
            <rect
              x="70"
              y="110"
              width="24"
              height="32"
              fill={palette.clay + '30'}
              stroke={palette.clay}
              strokeWidth="2"
            />
            <path
              d="M40 90 C 80 120 130 60 180 100"
              fill="none"
              stroke={palette.amber}
              strokeWidth="3"
              strokeDasharray="4 4"
            />
          </svg>
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 20,
              color: palette.inkSoft,
              marginTop: 12,
              textAlign: 'center',
            }}
          >
            复杂、无限、现象交织
          </div>
        </div>

        {/* Arrow 1 */}
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 32,
            fontWeight: 700,
            color: palette.sage,
          }}
        >
          ➔
        </div>

        {/* Step 2: Human Brain Cognitive Filter */}
        <div
          style={{
            flex: 1.2,
            height: '100%',
            background: palette.paper,
            border: `2px solid ${palette.sage}`,
            borderRadius: 16,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 26,
              fontWeight: 700,
              color: palette.sage,
              marginBottom: 16,
            }}
          >
            ② 大脑观察与抽象
          </div>
          <svg width="240" height="200" viewBox="0 0 240 200">
            <path
              d="M 60 150 C 30 130 30 70 70 40 C 110 10 160 30 170 70 C 190 90 180 140 140 160 C 120 170 80 170 60 150 Z"
              fill={palette.sage + '20'}
              stroke={palette.sage}
              strokeWidth="4"
            />
            <circle cx="120" cy="90" r="12" fill={palette.amber} />
            <path
              d="M 120 90 L 210 50"
              stroke={palette.clay}
              strokeWidth="4"
              strokeDasharray="6 4"
            />
            <path
              d="M 120 90 L 210 130"
              stroke={palette.blue}
              strokeWidth="4"
              strokeDasharray="6 4"
            />
          </svg>
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 20,
              color: palette.inkSoft,
              marginTop: 12,
              textAlign: 'center',
            }}
          >
            将世界归类解构
          </div>
        </div>

        {/* Arrow 2 */}
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 32,
            fontWeight: 700,
            color: palette.sage,
          }}
        >
          ➔
        </div>

        {/* Step 3: Two Perception Outcomes */}
        <div
          style={{
            flex: 1.3,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {/* Path 1: Discrete Objects */}
          <div
            style={{
              flex: 1,
              background: palette.clay + '12',
              border: `2px solid ${palette.clay}`,
              borderRadius: 14,
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 24,
                  fontWeight: 700,
                  color: palette.clay,
                }}
              >
                离散对象
              </div>
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 18,
                  color: palette.inkSoft,
                  marginTop: 4,
                }}
              >
                建筑、树木、车辆 (界限分明)
              </div>
            </div>
            <div
              style={{
                fontFamily: SERIF,
                fontSize: 18,
                fontWeight: 700,
                color: palette.clay,
                background: palette.paperLight,
                padding: '6px 14px',
                borderRadius: 6,
                border: `1px solid ${palette.clay}44`,
              }}
            >
              独立可数
            </div>
          </div>

          {/* Path 2: Continuous Field */}
          <div
            style={{
              flex: 1,
              background: palette.blue + '12',
              border: `2px solid ${palette.blue}`,
              borderRadius: 14,
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 24,
                  fontWeight: 700,
                  color: palette.blue,
                }}
              >
                连续场
              </div>
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 18,
                  color: palette.inkSoft,
                  marginTop: 4,
                }}
              >
                海拔、温度、噪声 (处处有值)
              </div>
            </div>
            <div
              style={{
                fontFamily: SERIF,
                fontSize: 18,
                fontWeight: 700,
                color: palette.blue,
                background: palette.paperLight,
                padding: '6px 14px',
                borderRadius: 6,
                border: `1px solid ${palette.blue}44`,
              }}
            >
              连续分布
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stage 2: Centered Dual Branch Cards (Frames 412 - 646)
const DualBranchCards: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const T = getTimestamps(fps);

  if (frame < T.two_categories || frame >= T.discrete_street) return null;

  const enter = spring({
    frame: frame - T.two_categories,
    fps,
    config: { damping: 20, stiffness: 85 },
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: 260,
        width: 1320,
        height: 600,
        transform: `translateX(-50%) scale(${0.95 + enter * 0.05})`,
        display: 'flex',
        gap: 48,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: enter,
      }}
    >
      {/* Card 1: Discrete Objects */}
      <div
        style={{
          flex: 1,
          height: 520,
          background: palette.paperLight,
          border: `3px solid ${palette.clay}`,
          borderRadius: 20,
          padding: 36,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: `0 20px 50px ${palette.clay}22`,
        }}
      >
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 22,
            fontWeight: 700,
            color: palette.clay,
          }}
        >
          第一类地理实体
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 46,
            fontWeight: 700,
            color: palette.ink,
            marginTop: 8,
          }}
        >
          离散对象
        </div>

        <div
          style={{
            marginTop: 24,
            height: 220,
            background: palette.paper,
            border: `2px dashed ${palette.clay}44`,
            borderRadius: 12,
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <svg width="240" height="160" viewBox="0 0 240 160">
            <rect
              x="20"
              y="40"
              width="60"
              height="90"
              fill={palette.clay + '25'}
              stroke={palette.clay}
              strokeWidth="3"
            />
            <circle
              cx="120"
              cy="80"
              r="28"
              fill={palette.sage + '25'}
              stroke={palette.sage}
              strokeWidth="3"
            />
            <rect
              x="160"
              y="90"
              width="60"
              height="40"
              rx="6"
              fill={palette.blue + '25'}
              stroke={palette.blue}
              strokeWidth="3"
            />
          </svg>
        </div>

        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            gap: 16,
          }}
        >
          <span
            style={{
              padding: '8px 20px',
              background: palette.clay + '18',
              color: palette.clay,
              fontFamily: SERIF,
              fontSize: 22,
              fontWeight: 700,
              borderRadius: 8,
            }}
          >
            边界清晰
          </span>
          <span
            style={{
              padding: '8px 20px',
              background: palette.sage + '18',
              color: palette.sage,
              fontFamily: SERIF,
              fontSize: 22,
              fontWeight: 700,
              borderRadius: 8,
            }}
          >
            独立可数
          </span>
        </div>
      </div>

      {/* Card 2: Continuous Field */}
      <div
        style={{
          flex: 1,
          height: 520,
          background: palette.paperLight,
          border: `3px solid ${palette.blue}`,
          borderRadius: 20,
          padding: 36,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: `0 20px 50px ${palette.blue}22`,
        }}
      >
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 22,
            fontWeight: 700,
            color: palette.blue,
          }}
        >
          第二类地理实体
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 46,
            fontWeight: 700,
            color: palette.ink,
            marginTop: 8,
          }}
        >
          连续场
        </div>

        <div
          style={{
            marginTop: 24,
            height: 220,
            background: `radial-gradient(circle at 50% 50%, ${palette.blue}20, ${palette.sage}15, transparent)`,
            border: `2px dashed ${palette.blue}44`,
            borderRadius: 12,
            display: 'grid',
            placeItems: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <svg width="260" height="180" viewBox="0 0 260 180">
            <path
              d="M10 140 C70 80 130 160 190 100 S230 60 250 120"
              fill="none"
              stroke={palette.blue}
              strokeWidth="3"
            />
            <path
              d="M10 100 C60 50 120 120 180 60 S220 30 250 80"
              fill="none"
              stroke={palette.amber}
              strokeWidth="2"
              strokeDasharray="5 5"
            />
            <circle cx="80" cy="100" r="4" fill={palette.ink} />
            <text
              x="92"
              y="104"
              fontFamily={SERIF}
              fontSize="18"
              fontWeight="700"
              fill={palette.inkSoft}
            >
              24.5°C
            </text>
          </svg>
        </div>

        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            gap: 16,
          }}
        >
          <span
            style={{
              padding: '8px 20px',
              background: palette.blue + '18',
              color: palette.blue,
              fontFamily: SERIF,
              fontSize: 22,
              fontWeight: 700,
              borderRadius: 8,
            }}
          >
            无明确边缘
          </span>
          <span
            style={{
              padding: '8px 20px',
              background: palette.amber + '18',
              color: palette.amber,
              fontFamily: SERIF,
              fontSize: 22,
              fontWeight: 700,
              borderRadius: 8,
            }}
          >
            处处有数值
          </span>
        </div>
      </div>
    </div>
  );
};

// Stage 3: Centered Discrete Street Scene (Frames 646 - 2266)
const DiscreteStreetStage: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const T = getTimestamps(fps);

  if (frame < T.discrete_intro || frame >= T.field_transition) return null;

  const enter = spring({
    frame: frame - T.discrete_intro,
    fps,
    config: { damping: 20, stiffness: 80 },
  });

  const isCountingBeat = frame >= T.discrete_count;

  // Pop counts
  const bldgPop = spring({
    frame: frame - T.discrete_count,
    fps,
    config: { damping: 14, stiffness: 120 },
  });
  const tree1Pop = spring({
    frame: frame - (T.discrete_count + Math.round(fps * 0.25)),
    fps,
    config: { damping: 14, stiffness: 120 },
  });
  const tree2Pop = spring({
    frame: frame - (T.discrete_count + Math.round(fps * 0.5)),
    fps,
    config: { damping: 14, stiffness: 120 },
  });
  const car1Pop = spring({
    frame: frame - (T.discrete_count + Math.round(fps * 0.75)),
    fps,
    config: { damping: 14, stiffness: 120 },
  });
  const car2Pop = spring({
    frame: frame - (T.discrete_count + Math.round(fps * 1.0)),
    fps,
    config: { damping: 14, stiffness: 120 },
  });
  const car3Pop = spring({
    frame: frame - (T.discrete_count + Math.round(fps * 1.25)),
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const carOffset = (frame * 1.8) % 180;

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: 250,
        width: 1360,
        height: 630,
        transform: `translateX(-50%) scale(${0.95 + enter * 0.05})`,
        background: palette.paperLight,
        border: `3px solid ${palette.clay}`,
        borderRadius: 20,
        boxShadow: `0 24px 60px ${palette.clay}20`,
        opacity: enter,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Banner */}
      <div
        style={{
          padding: '16px 36px',
          borderBottom: `2px solid ${palette.clay}33`,
          background: palette.paper,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: palette.clay,
            }}
          />
          <span
            style={{
              fontFamily: SERIF,
              fontSize: 26,
              fontWeight: 700,
              color: palette.ink,
            }}
          >
            大街视角 · 离散对象
          </span>
        </div>

        {isCountingBeat && (
          <div
            style={{
              display: 'flex',
              gap: 24,
              fontFamily: SERIF,
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            <span style={{ color: palette.clay }}>1 栋楼</span>
            <span style={{ color: palette.sage }}>2 棵树</span>
            <span style={{ color: palette.blue }}>3 辆车</span>
          </div>
        )}
      </div>

      {/* SVG Canvas (1360 × 480) */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <svg
          width="1360"
          height="480"
          viewBox="0 0 1360 480"
          style={{ position: 'absolute', inset: 0 }}
        >
          {/* Horizon & Road */}
          <line
            x1="0"
            y1="280"
            x2="1360"
            y2="280"
            stroke={palette.line}
            strokeWidth="3"
          />
          <rect
            x="0"
            y="280"
            width="1360"
            height="200"
            fill={palette.ink + '08'}
          />
          <line
            x1="0"
            y1="380"
            x2="1360"
            y2="380"
            stroke={palette.amber}
            strokeWidth="4"
            strokeDasharray="24 18"
          />

          {/* --- BUILDING --- */}
          <g transform="translate(140, 40)">
            <text
              x="30"
              y="-12"
              fontFamily={SERIF}
              fontSize="20"
              fontWeight="700"
              fill={palette.clay}
            >
              建筑 #1
            </text>
            <rect
              x="0"
              y="0"
              width="220"
              height="240"
              fill={palette.clay + '20'}
              stroke={palette.clay}
              strokeWidth="4"
              rx="6"
            />
            {/* Windows */}
            {[0, 1, 2, 3].map((r) =>
              [0, 1, 2, 3].map((c) => (
                <rect
                  key={`${r}-${c}`}
                  x={20 + c * 48}
                  y={20 + r * 52}
                  width="36"
                  height="36"
                  fill={palette.paperLight}
                  stroke={palette.clay}
                  strokeWidth="2"
                />
              ))
            )}
            <rect
              x="-10"
              y="-10"
              width="240"
              height="260"
              fill="none"
              stroke={palette.clay}
              strokeWidth="3"
              strokeDasharray="8 6"
            />
          </g>

          {/* --- TREE 1 --- */}
          <g transform="translate(520, 100)">
            <text
              x="-10"
              y="-15"
              fontFamily={SERIF}
              fontSize="20"
              fontWeight="700"
              fill={palette.sage}
            >
              树木 #1
            </text>
            <line
              x1="45"
              y1="80"
              x2="45"
              y2="180"
              stroke={palette.amber}
              strokeWidth="10"
              strokeLinecap="round"
            />
            <circle
              cx="45"
              cy="70"
              r="55"
              fill={palette.sage + '35'}
              stroke={palette.sage}
              strokeWidth="4"
            />
            <circle
              cx="45"
              cy="85"
              r="72"
              fill="none"
              stroke={palette.sage}
              strokeWidth="3"
              strokeDasharray="6 6"
            />
          </g>

          {/* --- TREE 2 --- */}
          <g transform="translate(740, 110)">
            <text
              x="-10"
              y="-15"
              fontFamily={SERIF}
              fontSize="20"
              fontWeight="700"
              fill={palette.sage}
            >
              树木 #2
            </text>
            <line
              x1="40"
              y1="70"
              x2="40"
              y2="170"
              stroke={palette.amber}
              strokeWidth="9"
              strokeLinecap="round"
            />
            <circle
              cx="40"
              cy="60"
              r="48"
              fill={palette.sage + '35'}
              stroke={palette.sage}
              strokeWidth="4"
            />
            <circle
              cx="40"
              cy="75"
              r="64"
              fill="none"
              stroke={palette.sage}
              strokeWidth="3"
              strokeDasharray="6 6"
            />
          </g>

          {/* --- CARS --- */}
          {/* Car 1 */}
          <g transform={`translate(${120 + carOffset}, 310)`}>
            <text
              x="20"
              y="-14"
              fontFamily={SERIF}
              fontSize="18"
              fontWeight="700"
              fill={palette.blue}
            >
              汽车 #1
            </text>
            <rect
              x="0"
              y="0"
              width="150"
              height="58"
              rx="12"
              fill={palette.blue + '30'}
              stroke={palette.blue}
              strokeWidth="4"
            />
            <circle cx="38" cy="58" r="16" fill={palette.ink} />
            <circle cx="112" cy="58" r="16" fill={palette.ink} />
            <rect
              x="-6"
              y="-6"
              width="162"
              height="78"
              fill="none"
              stroke={palette.blue}
              strokeWidth="2"
              strokeDasharray="5 5"
            />
          </g>

          {/* Car 2 */}
          <g transform={`translate(${460 + carOffset}, 390)`}>
            <text
              x="20"
              y="-14"
              fontFamily={SERIF}
              fontSize="18"
              fontWeight="700"
              fill={palette.blue}
            >
              汽车 #2
            </text>
            <rect
              x="0"
              y="0"
              width="160"
              height="60"
              rx="12"
              fill={palette.blue + '30'}
              stroke={palette.blue}
              strokeWidth="4"
            />
            <circle cx="42" cy="60" r="18" fill={palette.ink} />
            <circle cx="118" cy="60" r="18" fill={palette.ink} />
            <rect
              x="-6"
              y="-6"
              width="172"
              height="82"
              fill="none"
              stroke={palette.blue}
              strokeWidth="2"
              strokeDasharray="5 5"
            />
          </g>

          {/* Car 3 */}
          <g transform={`translate(${820 + carOffset}, 320)`}>
            <text
              x="20"
              y="-14"
              fontFamily={SERIF}
              fontSize="18"
              fontWeight="700"
              fill={palette.blue}
            >
              汽车 #3
            </text>
            <rect
              x="0"
              y="0"
              width="140"
              height="54"
              rx="10"
              fill={palette.blue + '30'}
              stroke={palette.blue}
              strokeWidth="4"
            />
            <circle cx="35" cy="54" r="14" fill={palette.ink} />
            <circle cx="105" cy="54" r="14" fill={palette.ink} />
            <rect
              x="-6"
              y="-6"
              width="152"
              height="74"
              fill="none"
              stroke={palette.blue}
              strokeWidth="2"
              strokeDasharray="5 5"
            />
          </g>
        </svg>

        {/* Floating Count Badges */}
        {isCountingBeat && (
          <>
            <div
              style={{
                position: 'absolute',
                left: 230,
                top: 15,
                transform: `scale(${bldgPop})`,
                padding: '8px 22px',
                background: palette.clay,
                color: palette.paperLight,
                fontFamily: SERIF,
                fontSize: 24,
                fontWeight: 700,
                borderRadius: 20,
                boxShadow: `0 10px 24px ${palette.clay}44`,
              }}
            >
              1 栋楼
            </div>

            <div
              style={{
                position: 'absolute',
                left: 550,
                top: 60,
                transform: `scale(${tree1Pop})`,
                padding: '6px 18px',
                background: palette.sage,
                color: palette.paperLight,
                fontFamily: SERIF,
                fontSize: 20,
                fontWeight: 700,
                borderRadius: 16,
              }}
            >
              第 1 棵树
            </div>

            <div
              style={{
                position: 'absolute',
                left: 770,
                top: 70,
                transform: `scale(${tree2Pop})`,
                padding: '6px 18px',
                background: palette.sage,
                color: palette.paperLight,
                fontFamily: SERIF,
                fontSize: 20,
                fontWeight: 700,
                borderRadius: 16,
              }}
            >
              第 2 棵树
            </div>

            <div
              style={{
                position: 'absolute',
                left: 170,
                bottom: 120,
                transform: `scale(${car1Pop})`,
                padding: '6px 18px',
                background: palette.blue,
                color: palette.paperLight,
                fontFamily: SERIF,
                fontSize: 20,
                fontWeight: 700,
                borderRadius: 16,
              }}
            >
              第 1 辆车
            </div>

            <div
              style={{
                position: 'absolute',
                left: 510,
                bottom: 30,
                transform: `scale(${car2Pop})`,
                padding: '6px 18px',
                background: palette.blue,
                color: palette.paperLight,
                fontFamily: SERIF,
                fontSize: 20,
                fontWeight: 700,
                borderRadius: 16,
              }}
            >
              第 2 辆车
            </div>

            <div
              style={{
                position: 'absolute',
                left: 870,
                bottom: 110,
                transform: `scale(${car3Pop})`,
                padding: '6px 18px',
                background: palette.blue,
                color: palette.paperLight,
                fontFamily: SERIF,
                fontSize: 20,
                fontWeight: 700,
                borderRadius: 16,
              }}
            >
              第 3 辆车
            </div>
          </>
        )}
      </div>

      {/* Footer Banner */}
      <div
        style={{
          padding: '14px 36px',
          background: palette.paper,
          borderTop: `2px solid ${palette.clay}22`,
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: SERIF,
          fontSize: 22,
          fontWeight: 700,
          color: palette.inkSoft,
        }}
      >
        <span>核心特征：几何物理界限清晰</span>
        <span>个体独立：能够被独立逐一计数</span>
      </div>
    </div>
  );
};

// Stage 4: Centered Continuous Field Stage & Probe (Frames 2266 - 3996)
const ContinuousFieldStage: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const T = getTimestamps(fps);

  if (frame < T.field_transition || frame >= T.field_summary) return null;

  const enter = spring({
    frame: frame - T.field_transition,
    fps,
    config: { damping: 20, stiffness: 80 },
  });

  const isProbeActive = frame >= T.field_probe;

  const probeRelFrame = Math.max(0, frame - T.field_probe);
  const probeX = interpolate(
    probeRelFrame,
    [0, Math.round(fps * 2), Math.round(fps * 4), Math.round(fps * 6)],
    [320, 680, 1020, 560],
    clamp
  );
  const probeY = interpolate(
    probeRelFrame,
    [0, Math.round(fps * 2), Math.round(fps * 4), Math.round(fps * 6)],
    [150, 300, 200, 380],
    clamp
  );

  let currentValText = '1420 米 (海拔)';
  let currentLocText = '山顶主峰';
  let isZeroValue = false;

  if (probeRelFrame > fps * 4.5) {
    currentValText = '0.00 微克/立方米 (PM 2.5)';
    currentLocText = '极净采样点';
    isZeroValue = true;
  } else if (probeRelFrame > fps * 2.8) {
    currentValText = '68.5 分贝 (城市噪声)';
    currentLocText = '主干道旁';
  } else if (probeRelFrame > fps * 1.2) {
    currentValText = '18.4 °C (环境温度)';
    currentLocText = '山腰植被区';
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: 250,
        width: 1360,
        height: 630,
        transform: `translateX(-50%) scale(${0.95 + enter * 0.05})`,
        background: palette.paperLight,
        border: `3px solid ${palette.blue}`,
        borderRadius: 20,
        boxShadow: `0 24px 60px ${palette.blue}20`,
        opacity: enter,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          padding: '16px 36px',
          borderBottom: `2px solid ${palette.blue}33`,
          background: palette.paper,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: palette.blue,
            }}
          />
          <span
            style={{
              fontFamily: SERIF,
              fontSize: 26,
              fontWeight: 700,
              color: palette.ink,
            }}
          >
            场景观察 · 连续场
          </span>
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          {['海拔/温度', '城市噪声', 'PM 2.5 浓度'].map((tag) => (
            <span
              key={tag}
              style={{
                padding: '6px 18px',
                background: palette.blue + '18',
                color: palette.blue,
                fontFamily: SERIF,
                fontSize: 20,
                fontWeight: 700,
                borderRadius: 20,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* SVG Stage */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <svg
          width="1360"
          height="480"
          viewBox="0 0 1360 480"
          style={{ position: 'absolute', inset: 0 }}
        >
          <defs>
            <radialGradient id="fieldThermal" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor={palette.amber} stopOpacity="0.45" />
              <stop offset="45%" stopColor={palette.sage} stopOpacity="0.3" />
              <stop offset="100%" stopColor={palette.blue} stopOpacity="0.15" />
            </radialGradient>
            <linearGradient id="mountainGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={palette.blue} stopOpacity="0.25" />
              <stop offset="100%" stopColor={palette.paper} stopOpacity="0.9" />
            </linearGradient>
          </defs>

          <rect width="1360" height="480" fill="url(#fieldThermal)" />

          {/* Contour Lines */}
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <path
              key={i}
              d={`M-50 ${100 + i * 55} C250 ${40 + i * 35} 550 ${
                180 + i * 45
              } 900 ${80 + i * 40} S1250 ${200 + i * 50} 1410 ${140 + i * 45}`}
              fill="none"
              stroke={i % 2 === 0 ? palette.blue : palette.sage}
              strokeWidth="2.5"
              strokeDasharray={i % 2 === 1 ? '8 6' : undefined}
              opacity={0.45}
            />
          ))}

          {/* Mountain Profile */}
          <path
            d="M 0 480 L 0 300 Q 240 90 420 150 T 850 240 T 1360 320 L 1360 480 Z"
            fill="url(#mountainGrad)"
            stroke={palette.blue}
            strokeWidth="3"
          />

          {/* Decibel Noise Rings */}
          <circle
            cx="850"
            cy="280"
            r="80"
            fill="none"
            stroke={palette.amber}
            strokeWidth="2"
            strokeDasharray="4 4"
            opacity="0.6"
          />
          <circle
            cx="850"
            cy="280"
            r="160"
            fill="none"
            stroke={palette.amber}
            strokeWidth="2"
            strokeDasharray="6 6"
            opacity="0.4"
          />

          {/* Field Grid Sampling Values */}
          {Array.from({ length: 36 }).map((_, i) => {
            const gx = 100 + (i % 9) * 140;
            const gy = 70 + Math.floor(i / 9) * 100;
            const val = Math.round(
              12 + Math.sin(i * 1.5 + frame * 0.05) * 35 + (8 - Math.floor(i / 9)) * 8
            );
            return (
              <g key={i}>
                <circle
                  cx={gx}
                  cy={gy}
                  r="4"
                  fill={palette.inkSoft}
                  opacity="0.5"
                />
                <text
                  x={gx + 8}
                  y={gy + 6}
                  fontFamily={SERIF}
                  fontSize="16"
                  fontWeight="600"
                  fill={palette.inkSoft}
                  opacity="0.7"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Target Probe Crosshair */}
          {isProbeActive && (
            <g transform={`translate(${probeX}, ${probeY})`}>
              <circle
                cx="0"
                cy="0"
                r="22"
                fill="none"
                stroke={isZeroValue ? palette.amber : palette.blue}
                strokeWidth="4"
              />
              <circle
                cx="0"
                cy="0"
                r="6"
                fill={isZeroValue ? palette.amber : palette.blue}
              />
              <line
                x1="-32"
                y1="0"
                x2="32"
                y2="0"
                stroke={palette.ink}
                strokeWidth="2"
              />
              <line
                x1="0"
                y1="-32"
                x2="0"
                y2="32"
                stroke={palette.ink}
                strokeWidth="2"
              />
            </g>
          )}
        </svg>

        {/* Live Probe Tooltip Box */}
        {isProbeActive && (
          <div
            style={{
              position: 'absolute',
              left: Math.min(900, probeX + 35),
              top: Math.max(30, probeY - 50),
              background: palette.ink,
              color: palette.paperLight,
              padding: '16px 26px',
              borderRadius: 14,
              boxShadow: `0 16px 36px ${palette.ink}44`,
              border: `2px solid ${
                isZeroValue ? palette.amber : palette.blueLight
              }`,
              zIndex: 30,
            }}
          >
            <div
              style={{
                fontFamily: SERIF,
                fontSize: 18,
                color: palette.sageLight,
                marginBottom: 4,
              }}
            >
              采样点位置: ({Math.round(probeX)}, {Math.round(probeY)})
            </div>
            <div
              style={{
                fontFamily: SERIF,
                fontSize: 28,
                fontWeight: 700,
                color: isZeroValue ? palette.amber : palette.paperLight,
              }}
            >
              {currentValText}
            </div>
            <div
              style={{
                fontFamily: SERIF,
                fontSize: 20,
                color: palette.paperLight + 'aa',
                marginTop: 4,
              }}
            >
              {currentLocText}
            </div>
          </div>
        )}
      </div>

      {/* Footer Banner */}
      <div
        style={{
          padding: '14px 36px',
          background: palette.paper,
          borderTop: `2px solid ${palette.blue}22`,
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: SERIF,
          fontSize: 22,
          fontWeight: 700,
          color: palette.inkSoft,
        }}
      >
        <span>连续场核心：任意点均有属性值</span>
        <span style={{ color: palette.amber }}>无从无到有的明确界限 (哪怕数值为零)</span>
      </div>
    </div>
  );
};

// Stage 5: Centered Grand Synthesis Comparison Matrix (Frames 3996 - 4436)
const GrandSynthesis: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const T = getTimestamps(fps);

  if (frame < T.field_summary) return null;

  const enter = spring({
    frame: frame - T.field_summary,
    fps,
    config: { damping: 20, stiffness: 80 },
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: 250,
        width: 1320,
        height: 630,
        transform: `translateX(-50%) scale(${0.95 + enter * 0.05})`,
        background: palette.paperLight,
        border: `3px solid ${palette.ink}44`,
        borderRadius: 24,
        boxShadow: `0 30px 80px ${palette.ink}25`,
        opacity: enter,
        padding: 36,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          fontFamily: SERIF,
          fontSize: 38,
          fontWeight: 700,
          color: palette.ink,
          marginBottom: 24,
        }}
      >
        人类大脑看待世界的两类地理实体总结
      </div>

      <div style={{ display: 'flex', gap: 36, flex: 1 }}>
        {/* Card 1: Discrete Objects */}
        <div
          style={{
            flex: 1,
            background: palette.paper,
            border: `3px solid ${palette.clay}`,
            borderRadius: 18,
            padding: 30,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 40,
              fontWeight: 700,
              color: palette.clay,
            }}
          >
            离散对象
          </div>

          <div
            style={{
              marginTop: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              fontFamily: SERIF,
              fontSize: 24,
              color: palette.ink,
              lineHeight: 1.5,
            }}
          >
            <div style={{ display: 'flex', gap: 12 }}>
              <span style={{ color: palette.clay, fontWeight: 700, whiteSpace: 'nowrap' }}>
                ● 边界:
              </span>
              <span>几何与物理界限明确分明</span>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <span style={{ color: palette.clay, fontWeight: 700, whiteSpace: 'nowrap' }}>
                ● 计数:
              </span>
              <span>独立个体，可被逐一计数</span>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <span style={{ color: palette.clay, fontWeight: 700, whiteSpace: 'nowrap' }}>
                ● 分布:
              </span>
              <span>内部有实体，外部无实体</span>
            </div>
          </div>

          <div
            style={{
              marginTop: 'auto',
              padding: '16px 20px',
              background: palette.clay + '18',
              border: `2px solid ${palette.clay}`,
              borderRadius: 12,
              fontFamily: SERIF,
              fontSize: 26,
              fontWeight: 700,
              color: palette.clay,
              textAlign: 'center',
            }}
          >
            映射为 GIS → 矢量模型
          </div>
        </div>

        {/* Card 2: Continuous Field */}
        <div
          style={{
            flex: 1,
            background: palette.paper,
            border: `3px solid ${palette.blue}`,
            borderRadius: 18,
            padding: 30,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 40,
              fontWeight: 700,
              color: palette.blue,
            }}
          >
            连续场
          </div>

          <div
            style={{
              marginTop: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              fontFamily: SERIF,
              fontSize: 24,
              color: palette.ink,
              lineHeight: 1.5,
            }}
          >
            <div style={{ display: 'flex', gap: 12 }}>
              <span style={{ color: palette.blue, fontWeight: 700, whiteSpace: 'nowrap' }}>
                ● 边界:
              </span>
              <span>无从无到有的明确界限</span>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <span style={{ color: palette.blue, fontWeight: 700, whiteSpace: 'nowrap' }}>
                ● 计数:
              </span>
              <span>空间连续分布，不可单独计数</span>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <span style={{ color: palette.blue, fontWeight: 700, whiteSpace: 'nowrap' }}>
                ● 分布:
              </span>
              <span>任意点必有具体数值 (哪怕为0)</span>
            </div>
          </div>

          <div
            style={{
              marginTop: 'auto',
              padding: '16px 20px',
              background: palette.blue + '18',
              border: `2px solid ${palette.blue}`,
              borderRadius: 12,
              fontFamily: SERIF,
              fontSize: 26,
              fontWeight: 700,
              color: palette.blue,
              textAlign: 'center',
            }}
          >
            映射为 GIS → 栅格模型
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
const EntityTypes: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const T = getTimestamps(fps);

  const scale = width / 1920;

  const accent =
    frame < T.discrete_intro
      ? 'sage'
      : frame < T.field_transition
        ? 'sage'
        : 'blue';

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
        <CenteredHeadline frame={frame} />

        <CognitiveLens frame={frame} />
        <DualBranchCards frame={frame} />
        <DiscreteStreetStage frame={frame} />
        <ContinuousFieldStage frame={frame} />
        <GrandSynthesis frame={frame} />

        <BottomTracker frame={frame} />
      </div>
    </AbsoluteFill>
  );
};

export { EntityTypes };
