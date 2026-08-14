import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { PaperBackground } from './components/PaperBackground';
import { clamp, palette, SERIF } from './theme';

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

// Bottom Chapter Progress Tracker (Centered, Pure Chinese, Source Han Serif)
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

// Centered Top Header Panel (Concise editorial headings)
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
          whiteSpace: 'nowrap',
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

// ==========================================
// Stage 1: Redesigned High-Craft Cognitive Model (Frames 0 - 412)
// ==========================================
const CognitiveLens: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const T = getTimestamps(fps);

  if (frame >= T.two_categories) return null;

  const enter = spring({ frame, fps, config: { damping: 20, stiffness: 80 } });
  const pulse = Math.sin(frame * 0.08) * 4;

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
        padding: 32,
        fontFamily: SERIF,
      }}
    >
      {/* Header Inside Card */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `2px solid ${palette.sage}33`,
          paddingBottom: 16,
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
              fontSize: 26,
              fontWeight: 700,
              color: palette.ink,
              whiteSpace: 'nowrap',
            }}
          >
            人类大脑的空间认知解构过程
          </span>
        </div>

        <span
          style={{
            padding: '6px 22px',
            background: palette.sage + '18',
            color: palette.sage,
            fontSize: 20,
            fontWeight: 700,
            borderRadius: 20,
            whiteSpace: 'nowrap',
          }}
        >
          物理现实 ➔ 大脑抽象 ➔ 两大范式
        </span>
      </div>

      {/* 3-Part Flow Container */}
      <div
        style={{
          flex: 1,
          marginTop: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
        }}
      >
        {/* Step 1: Real Physical World (Artistic Landscape Vignette) */}
        <div
          style={{
            flex: 1,
            height: '100%',
            background: palette.paper,
            border: `2px solid ${palette.line}`,
            borderRadius: 16,
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: `0 8px 20px ${palette.ink}08`,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <span
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: palette.ink,
                whiteSpace: 'nowrap',
              }}
            >
              ① 真实物理世界
            </span>
            <span
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: palette.sage,
                background: palette.sage + '15',
                padding: '3px 10px',
                borderRadius: 12,
                whiteSpace: 'nowrap',
              }}
            >
              无限丰富
            </span>
          </div>

          {/* Vignette Illustration */}
          <svg width="270" height="240" viewBox="0 0 270 240">
            <defs>
              <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={palette.paper} />
                <stop offset="100%" stopColor={palette.sage + '15'} />
              </linearGradient>
              <linearGradient id="mountFar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={palette.sage + '44'} />
                <stop offset="100%" stopColor={palette.sage + '18'} />
              </linearGradient>
              <linearGradient id="mountNear" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={palette.sage + '88'} />
                <stop offset="100%" stopColor={palette.sage + '35'} />
              </linearGradient>
            </defs>

            {/* Circular Map Portal Frame */}
            <circle
              cx="135"
              cy="120"
              r="105"
              fill="url(#skyGrad)"
              stroke={palette.sage}
              strokeWidth="2.5"
            />

            {/* Sun / Temperature Radial Light */}
            <circle
              cx="185"
              cy="65"
              r="24"
              fill={palette.amber + '40'}
              stroke={palette.amber}
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />

            {/* Atmospheric Isoline Waves */}
            <path
              d="M 35 90 Q 90 65 140 85 T 235 70"
              fill="none"
              stroke={palette.amber}
              strokeWidth="1.5"
              strokeDasharray="4 4"
              opacity="0.85"
            />
            <path
              d="M 32 110 Q 85 90 145 105 T 238 95"
              fill="none"
              stroke={palette.blue}
              strokeWidth="1.5"
              strokeDasharray="5 5"
              opacity="0.7"
            />

            {/* Mountain Ridge Layers */}
            <path
              d="M 30 160 Q 75 90 120 130 T 210 100 L 240 160 L 240 220 L 30 220 Z"
              fill="url(#mountFar)"
            />
            <path
              d="M 30 180 Q 90 135 150 165 T 240 150 L 240 225 L 30 225 Z"
              fill="url(#mountNear)"
            />

            {/* River Stream */}
            <path
              d="M 120 155 Q 140 180 125 200 T 110 225"
              fill="none"
              stroke={palette.blue}
              strokeWidth="8"
              strokeLinecap="round"
              opacity="0.8"
            />

            {/* Little House (Discrete Object) */}
            <g transform="translate(160, 160)">
              <polygon
                points="0,15 20,0 40,15"
                fill={palette.clay}
                stroke={palette.clay}
                strokeWidth="1"
              />
              <rect
                x="4"
                y="15"
                width="32"
                height="26"
                fill={palette.paperLight}
                stroke={palette.clay}
                strokeWidth="2"
              />
              <rect x="9" y="22" width="8" height="8" fill={palette.amber + '66'} />
              <rect x="23" y="24" width="9" height="17" fill={palette.clay} />
            </g>

            {/* Forest Trees */}
            <g transform="translate(60, 165)">
              <rect x="10" y="16" width="4" height="14" fill={palette.amber} />
              <circle cx="12" cy="12" r="14" fill={palette.sage} />
              <circle cx="12" cy="10" r="11" fill={palette.sageLight} />
            </g>
            <g transform="translate(85, 172)">
              <rect x="8" y="12" width="3" height="12" fill={palette.amber} />
              <circle cx="9" cy="9" r="11" fill={palette.sage} />
            </g>

            {/* Reticle Boundary Crosshair Corner Marks */}
            <path
              d="M 135 15 L 135 25 M 135 215 L 135 225 M 30 120 L 40 120 M 230 120 L 240 120"
              stroke={palette.inkSoft}
              strokeWidth="2"
              opacity="0.6"
            />
          </svg>

          <div
            style={{
              fontSize: 18,
              color: palette.inkSoft,
              textAlign: 'center',
              fontWeight: 600,
              lineHeight: 1.4,
              whiteSpace: 'nowrap',
            }}
          >
            山川/湖泊/建筑/气温 纷繁交织
          </div>
        </div>

        {/* Dynamic Beam Flow 1 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <div
            style={{
              width: 38,
              height: 3,
              background: `linear-gradient(90deg, ${palette.sage}, ${palette.amber})`,
              borderRadius: 2,
            }}
          />
          <span style={{ fontSize: 18, fontWeight: 700, color: palette.sage }}>
            输入
          </span>
        </div>

        {/* Step 2: Cognitive Prism / Brain Lens Filter */}
        <div
          style={{
            flex: 1.1,
            height: '100%',
            background: palette.paper,
            border: `2px solid ${palette.sage}`,
            borderRadius: 16,
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: `0 12px 28px ${palette.sage}15`,
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <span
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: palette.sage,
                whiteSpace: 'nowrap',
              }}
            >
              ② 大脑观察与抽象
            </span>
            <span
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: palette.amber,
                background: palette.amber + '18',
                padding: '3px 10px',
                borderRadius: 12,
                whiteSpace: 'nowrap',
              }}
            >
              双轨解构
            </span>
          </div>

          {/* Stylized Cognitive Prism / Splitter Graphic */}
          <svg width="290" height="240" viewBox="0 0 290 240">
            <defs>
              <linearGradient id="prismGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={palette.sage + '30'} />
                <stop offset="100%" stopColor={palette.paperLight} />
              </linearGradient>
            </defs>

            {/* Cognitive Lens Diamond / Prism Shape */}
            <polygon
              points="145,25 220,120 145,215 70,120"
              fill="url(#prismGrad)"
              stroke={palette.sage}
              strokeWidth="3"
            />

            {/* Inner Neural Nodes & Lattice */}
            <line
              x1="70"
              y1="120"
              x2="145"
              y2="120"
              stroke={palette.inkSoft}
              strokeWidth="2"
              strokeDasharray="4 3"
            />
            <line
              x1="145"
              y1="120"
              x2="220"
              y2="65"
              stroke={palette.clay}
              strokeWidth="3.5"
            />
            <line
              x1="145"
              y1="120"
              x2="220"
              y2="175"
              stroke={palette.blue}
              strokeWidth="3.5"
            />

            {/* Central Cognitive Hub Node */}
            <circle
              cx="145"
              cy="120"
              r={18 + pulse}
              fill="none"
              stroke={palette.amber}
              strokeWidth="2"
              opacity="0.7"
            />
            <circle
              cx="145"
              cy="120"
              r="12"
              fill={palette.amber}
              stroke={palette.paperLight}
              strokeWidth="2.5"
            />

            {/* Satellite Neural Nodes */}
            <circle cx="115" cy="85" r="5" fill={palette.sage} />
            <circle cx="115" cy="155" r="5" fill={palette.sage} />
            <circle cx="175" cy="85" r="6" fill={palette.clay} />
            <circle cx="175" cy="155" r="6" fill={palette.blue} />

            <line
              x1="115"
              y1="85"
              x2="145"
              y2="120"
              stroke={palette.sage}
              strokeWidth="1.5"
            />
            <line
              x1="115"
              y1="155"
              x2="145"
              y2="120"
              stroke={palette.sage}
              strokeWidth="1.5"
            />

            {/* Incoming Multi-Ray */}
            <path
              d="M 15 120 L 70 120"
              stroke={palette.ink}
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Outgoing Distinct Classification Beams */}
            {/* Top Beam: Discrete */}
            <g transform="translate(0, -5)">
              <path
                d="M 220 70 L 280 45"
                stroke={palette.clay}
                strokeWidth="4"
                strokeDasharray="6 4"
              />
              <polygon points="280,45 270,40 272,48" fill={palette.clay} />
              <text
                x="206"
                y="34"
                fontFamily={SERIF}
                fontSize="17"
                fontWeight="700"
                fill={palette.clay}
              >
                边界分明 ➔
              </text>
            </g>

            {/* Bottom Beam: Field */}
            <g transform="translate(0, 5)">
              <path
                d="M 220 170 L 280 195"
                stroke={palette.blue}
                strokeWidth="4"
                strokeDasharray="6 4"
              />
              <polygon points="280,195 272,192 270,200" fill={palette.blue} />
              <text
                x="206"
                y="218"
                fontFamily={SERIF}
                fontSize="17"
                fontWeight="700"
                fill={palette.blue}
              >
                处处有值 ➔
              </text>
            </g>
          </svg>

          <div
            style={{
              fontSize: 18,
              color: palette.inkSoft,
              textAlign: 'center',
              fontWeight: 600,
              lineHeight: 1.4,
              whiteSpace: 'nowrap',
            }}
          >
            空间解构为「离散」与「连续」
          </div>
        </div>

        {/* Dynamic Beam Flow 2 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <div
            style={{
              width: 38,
              height: 3,
              background: `linear-gradient(90deg, ${palette.amber}, ${palette.blue})`,
              borderRadius: 2,
            }}
          />
          <span style={{ fontSize: 18, fontWeight: 700, color: palette.blue }}>
            分类
          </span>
        </div>

        {/* Step 3: Two Structured Perception Outcomes (Restored Clean Large Layout, No English) */}
        <div
          style={{
            flex: 1.35,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          {/* Path 1: Discrete Objects */}
          <div
            style={{
              flex: 1,
              background: palette.clay + '12',
              border: `2.5px solid ${palette.clay}`,
              borderRadius: 16,
              padding: '24px 28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: `0 8px 24px ${palette.clay}15`,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 700,
                  color: palette.clay,
                  whiteSpace: 'nowrap',
                }}
              >
                离散对象
              </div>
              <div
                style={{
                  fontSize: 22,
                  color: palette.inkSoft,
                  marginTop: 8,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                建筑、树木、车辆（界限分明）
              </div>
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: palette.clay,
                background: palette.paperLight,
                padding: '8px 20px',
                borderRadius: 20,
                border: `1.5px solid ${palette.clay}`,
                boxShadow: `0 4px 12px ${palette.clay}20`,
                whiteSpace: 'nowrap',
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
              border: `2.5px solid ${palette.blue}`,
              borderRadius: 16,
              padding: '24px 28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: `0 8px 24px ${palette.blue}15`,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 700,
                  color: palette.blue,
                  whiteSpace: 'nowrap',
                }}
              >
                连续场
              </div>
              <div
                style={{
                  fontSize: 22,
                  color: palette.inkSoft,
                  marginTop: 8,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                海拔、温度、噪声（处处有值）
              </div>
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: palette.blue,
                background: palette.paperLight,
                padding: '8px 20px',
                borderRadius: 20,
                border: `1.5px solid ${palette.blue}`,
                boxShadow: `0 4px 12px ${palette.blue}20`,
                whiteSpace: 'nowrap',
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

// ==========================================
// Stage 2: Centered Dual Branch Cards (Frames 412 - 1100)
// ==========================================
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
        width: 1340,
        height: 600,
        transform: `translateX(-50%) scale(${0.95 + enter * 0.05})`,
        display: 'flex',
        gap: 40,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: enter,
        fontFamily: SERIF,
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
          padding: 32,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: `0 20px 50px ${palette.clay}22`,
        }}
      >
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: palette.clay,
            whiteSpace: 'nowrap',
          }}
        >
          第一类地理实体
        </div>
        <div
          style={{
            fontSize: 44,
            fontWeight: 700,
            color: palette.ink,
            marginTop: 6,
            whiteSpace: 'nowrap',
          }}
        >
          离散对象
        </div>

        <div
          style={{
            marginTop: 18,
            height: 230,
            background: palette.paper,
            border: `2px dashed ${palette.clay}44`,
            borderRadius: 14,
            display: 'grid',
            placeItems: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <svg width="420" height="200" viewBox="0 0 420 200">
            {/* Building Icon */}
            <g transform="translate(30, 25)">
              <polygon points="0,20 35,0 70,20" fill={palette.clay} />
              <rect
                x="6"
                y="20"
                width="58"
                height="75"
                fill={palette.paperLight}
                stroke={palette.clay}
                strokeWidth="3"
                rx="2"
              />
              <rect x="14" y="30" width="16" height="16" fill={palette.clay + '40'} />
              <rect x="40" y="30" width="16" height="16" fill={palette.clay + '40'} />
              <rect x="14" y="56" width="16" height="16" fill={palette.clay + '40'} />
              <rect x="40" y="56" width="16" height="16" fill={palette.clay + '40'} />
              <rect
                x="-8"
                y="-8"
                width="86"
                height="112"
                fill="none"
                stroke={palette.clay}
                strokeWidth="2"
                strokeDasharray="5 4"
              />
              <text x="14" y="125" fontFamily={SERIF} fontSize="14" fontWeight="700" fill={palette.clay}>
                建筑 #1
              </text>
            </g>

            {/* Tree Icon (Clean Single Canopy) */}
            <g transform="translate(165, 30)">
              <line
                x1="30"
                y1="60"
                x2="30"
                y2="95"
                stroke={palette.amber}
                strokeWidth="7"
                strokeLinecap="round"
              />
              <circle cx="30" cy="45" r="35" fill={palette.sage + '40'} stroke={palette.sage} strokeWidth="3" />
              <circle
                cx="30"
                cy="45"
                r="44"
                fill="none"
                stroke={palette.sage}
                strokeWidth="2"
                strokeDasharray="5 4"
              />
              <text x="12" y="120" fontFamily={SERIF} fontSize="14" fontWeight="700" fill={palette.sage}>
                树木 #1
              </text>
            </g>

            {/* Car Icon */}
            <g transform="translate(275, 55)">
              <path
                d="M 6 36 Q 14 10 35 10 L 68 10 Q 85 10 96 36 Z"
                fill={palette.blue + '35'}
                stroke={palette.blue}
                strokeWidth="3"
              />
              <rect
                x="0"
                y="30"
                width="104"
                height="28"
                rx="6"
                fill={palette.blue + '35'}
                stroke={palette.blue}
                strokeWidth="3"
              />
              <circle cx="24" cy="58" r="11" fill={palette.ink} />
              <circle cx="80" cy="58" r="11" fill={palette.ink} />
              <rect
                x="-6"
                y="2"
                width="116"
                height="68"
                fill="none"
                stroke={palette.blue}
                strokeWidth="2"
                strokeDasharray="5 4"
              />
              <text x="32" y="95" fontFamily={SERIF} fontSize="14" fontWeight="700" fill={palette.blue}>
                汽车 #1
              </text>
            </g>
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
              fontSize: 22,
              fontWeight: 700,
              borderRadius: 8,
              whiteSpace: 'nowrap',
            }}
          >
            边界清晰
          </span>
          <span
            style={{
              padding: '8px 20px',
              background: palette.sage + '18',
              color: palette.sage,
              fontSize: 22,
              fontWeight: 700,
              borderRadius: 8,
              whiteSpace: 'nowrap',
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
          padding: 32,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: `0 20px 50px ${palette.blue}22`,
        }}
      >
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: palette.blue,
            whiteSpace: 'nowrap',
          }}
        >
          第二类地理实体
        </div>
        <div
          style={{
            fontSize: 44,
            fontWeight: 700,
            color: palette.ink,
            marginTop: 6,
            whiteSpace: 'nowrap',
          }}
        >
          连续场
        </div>

        <div
          style={{
            marginTop: 18,
            height: 230,
            background: `radial-gradient(circle at 40% 40%, ${palette.amber}22, ${palette.blue}20, ${palette.sage}15, transparent)`,
            border: `2px dashed ${palette.blue}44`,
            borderRadius: 14,
            display: 'grid',
            placeItems: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <svg width="420" height="200" viewBox="0 0 420 200">
            {/* Continuous Contour Lines */}
            <path
              d="M10 160 C90 100 180 170 270 110 S360 70 410 140"
              fill="none"
              stroke={palette.blue}
              strokeWidth="3.5"
            />
            <path
              d="M10 120 C100 60 190 130 280 80 S370 40 410 100"
              fill="none"
              stroke={palette.amber}
              strokeWidth="2.5"
              strokeDasharray="6 4"
            />
            <path
              d="M10 80 C110 30 200 90 290 50 S380 20 410 60"
              fill="none"
              stroke={palette.sage}
              strokeWidth="2"
              strokeDasharray="4 4"
            />

            {/* Live Point Probe Annotations */}
            <g transform="translate(120, 105)">
              <circle cx="0" cy="0" r="5" fill={palette.amber} stroke={palette.ink} strokeWidth="1.5" />
              <rect x="8" y="-14" width="76" height="24" rx="4" fill={palette.ink} />
              <text x="14" y="3" fontFamily={SERIF} fontSize="15" fontWeight="700" fill={palette.paperLight}>
                24.5 °C
              </text>
            </g>

            <g transform="translate(280, 90)">
              <circle cx="0" cy="0" r="5" fill={palette.blue} stroke={palette.ink} strokeWidth="1.5" />
              <rect x="8" y="-14" width="76" height="24" rx="4" fill={palette.ink} />
              <text x="14" y="3" fontFamily={SERIF} fontSize="15" fontWeight="700" fill={palette.paperLight}>
                1240 m
              </text>
            </g>
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
              fontSize: 22,
              fontWeight: 700,
              borderRadius: 8,
              whiteSpace: 'nowrap',
            }}
          >
            无明确边缘
          </span>
          <span
            style={{
              padding: '8px 20px',
              background: palette.amber + '18',
              color: palette.amber,
              fontSize: 22,
              fontWeight: 700,
              borderRadius: 8,
              whiteSpace: 'nowrap',
            }}
          >
            处处有数值
          </span>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// Stage 3: High-Craft Discrete Street Scene (Frames 1100 - 2266)
// ==========================================
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

  // Crisp spring animations for count badges
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
        fontFamily: SERIF,
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
              fontSize: 26,
              fontWeight: 700,
              color: palette.ink,
              whiteSpace: 'nowrap',
            }}
          >
            大街视角 · 离散实体物理界限
          </span>
        </div>

        {isCountingBeat && (
          <div
            style={{
              display: 'flex',
              gap: 24,
              fontSize: 24,
              fontWeight: 700,
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ color: palette.clay }}>1 栋楼</span>
            <span style={{ color: palette.sage }}>2 棵树</span>
            <span style={{ color: palette.blue }}>3 辆车</span>
          </div>
        )}
      </div>

      {/* Architectural & Street Vector Canvas (1360 × 480) */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <svg
          width="1360"
          height="480"
          viewBox="0 0 1360 480"
          style={{ position: 'absolute', inset: 0 }}
        >
          <defs>
            <linearGradient id="bldgGlass" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={palette.paperLight} />
              <stop offset="100%" stopColor={palette.blue + '25'} />
            </linearGradient>
            <linearGradient id="carGlass" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={palette.paperLight} />
              <stop offset="100%" stopColor={palette.blueLight + '44'} />
            </linearGradient>
          </defs>

          {/* Sidewalk Background */}
          <rect x="0" y="240" width="1360" height="70" fill={palette.line + '30'} />
          <line x1="0" y1="240" x2="1360" y2="240" stroke={palette.line} strokeWidth="2" />
          <line x1="0" y1="310" x2="1360" y2="310" stroke={palette.inkSoft} strokeWidth="2.5" />

          {/* Sidewalk Stone Tiles */}
          {Array.from({ length: 24 }).map((_, i) => (
            <line
              key={`tile-${i}`}
              x1={i * 60}
              y1="240"
              x2={i * 60}
              y2="310"
              stroke={palette.line}
              strokeWidth="1.5"
              strokeDasharray="2 4"
            />
          ))}

          {/* Road Surface */}
          <rect x="0" y="310" width="1360" height="170" fill={palette.ink + '0a'} />

          {/* Road Lane Center Divider */}
          <line
            x1="0"
            y1="395"
            x2="1360"
            y2="395"
            stroke={palette.amber}
            strokeWidth="4"
            strokeDasharray="28 20"
          />

          {/* Decorative Vintage Street Lamp */}
          <g transform="translate(420, 135)">
            <path
              d="M 10 175 L 10 20 Q 10 0 25 0 Q 40 0 40 20 L 40 30"
              fill="none"
              stroke={palette.inkSoft}
              strokeWidth="4"
              strokeLinecap="round"
            />
            <polygon points="32,30 48,30 44,45 36,45" fill={palette.amber} />
            <circle cx="40" cy="48" r="14" fill={palette.amber + '35'} />
          </g>

          {/* =======================================================
              1. ARCHITECTURAL BUILDING (建筑 #1)
             ======================================================= */}
          <g transform="translate(90, 52)">
            {/* Top Label (Always clearly visible above building) */}
            <text
              x="80"
              y="-20"
              fontFamily={SERIF}
              fontSize="20"
              fontWeight="700"
              fill={palette.clay}
            >
              建筑实体 #1
            </text>

            {/* Bounding Box Outline (Vector geometry concept) */}
            <rect
              x="-12"
              y="-12"
              width="274"
              height="270"
              fill="none"
              stroke={palette.clay}
              strokeWidth="2.5"
              strokeDasharray="8 6"
              rx="8"
            />

            {/* Building Main Body */}
            <rect
              x="0"
              y="0"
              width="250"
              height="246"
              fill={palette.clay + '20'}
              stroke={palette.clay}
              strokeWidth="4"
              rx="4"
            />

            {/* Top Roof Parapet / Cornice */}
            <rect
              x="-6"
              y="-6"
              width="262"
              height="16"
              fill={palette.clay}
              rx="3"
            />

            {/* Architectural Windows (3 rows × 3 columns) */}
            {[0, 1, 2].map((r) =>
              [0, 1, 2].map((c) => (
                <g key={`win-${r}-${c}`} transform={`translate(${24 + c * 74}, ${22 + r * 54})`}>
                  <rect
                    x="0"
                    y="0"
                    width="54"
                    height="42"
                    fill="url(#bldgGlass)"
                    stroke={palette.clay}
                    strokeWidth="2.5"
                    rx="3"
                  />
                  {/* Muntin Cross */}
                  <line x1="27" y1="0" x2="27" y2="42" stroke={palette.clay} strokeWidth="1.5" />
                  <line x1="0" y1="21" x2="54" y2="21" stroke={palette.clay} strokeWidth="1.5" />
                </g>
              ))
            )}

            {/* Ground Floor Entrance & Awning */}
            <g transform="translate(85, 194)">
              <polygon points="-12,0 92,0 80,14 0,14" fill={palette.amber} />
              <rect
                x="10"
                y="14"
                width="60"
                height="38"
                fill={palette.paperLight}
                stroke={palette.clay}
                strokeWidth="3"
              />
              <line x1="40" y1="14" x2="40" y2="52" stroke={palette.clay} strokeWidth="2" />
              <circle cx="36" cy="33" r="2" fill={palette.clay} />
              <circle cx="44" cy="33" r="2" fill={palette.clay} />
            </g>
          </g>

          {/* =======================================================
              2. ORGANIC TREE 1 (树木 #1 - Single Clean Canopy)
             ======================================================= */}
          <g transform="translate(530, 80)">
            {/* Top Label */}
            <text
              x="18"
              y="-12"
              fontFamily={SERIF}
              fontSize="20"
              fontWeight="700"
              fill={palette.sage}
            >
              树木 #1
            </text>

            {/* Dashed Bounding Ring */}
            <circle
              cx="55"
              cy="95"
              r="76"
              fill="none"
              stroke={palette.sage}
              strokeWidth="2.5"
              strokeDasharray="7 5"
            />

            {/* Tree Trunk & Roots */}
            <path
              d="M 47 95 L 47 220 Q 40 230 32 230 L 78 230 Q 70 230 63 220 L 63 95 Z"
              fill={palette.amber}
            />

            {/* Clean Single Lush Canopy with Soft Gradient */}
            <circle cx="55" cy="85" r="56" fill={palette.sage + '44'} stroke={palette.sage} strokeWidth="3.5" />
            <circle cx="55" cy="80" r="42" fill={palette.sage + '35'} />
          </g>

          {/* =======================================================
              3. ORGANIC TREE 2 (树木 #2 - Single Clean Canopy)
             ======================================================= */}
          <g transform="translate(760, 95)">
            {/* Top Label */}
            <text
              x="14"
              y="-12"
              fontFamily={SERIF}
              fontSize="20"
              fontWeight="700"
              fill={palette.sage}
            >
              树木 #2
            </text>

            {/* Dashed Bounding Ring */}
            <circle
              cx="48"
              cy="85"
              r="66"
              fill="none"
              stroke={palette.sage}
              strokeWidth="2.5"
              strokeDasharray="7 5"
            />

            {/* Trunk */}
            <path
              d="M 42 85 L 42 215 Q 36 222 30 222 L 66 222 Q 60 222 54 215 L 54 85 Z"
              fill={palette.amber}
            />

            {/* Clean Single Lush Canopy */}
            <circle cx="48" cy="78" r="48" fill={palette.sage + '44'} stroke={palette.sage} strokeWidth="3.5" />
            <circle cx="48" cy="74" r="36" fill={palette.sage + '35'} />
          </g>

          {/* =======================================================
              4. SLEEK VECTOR CARS (汽车 #1, #2, #3 - With Explicit Labels)
             ======================================================= */}
          {/* Car 1 (Lane 1: Top lane) */}
          <g transform={`translate(${110 + carOffset}, 325)`}>
            {/* Car Label */}
            <text
              x="52"
              y="-14"
              fontFamily={SERIF}
              fontSize="18"
              fontWeight="700"
              fill={palette.blue}
            >
              汽车 #1
            </text>

            {/* Dashed Bounding Box */}
            <rect
              x="-8"
              y="-6"
              width="176"
              height="78"
              fill="none"
              stroke={palette.blue}
              strokeWidth="2"
              strokeDasharray="6 4"
              rx="6"
            />

            {/* Car Upper Cabin */}
            <path
              d="M 25 25 Q 40 4 75 4 L 115 4 Q 135 4 145 25 Z"
              fill="url(#carGlass)"
              stroke={palette.blue}
              strokeWidth="3.5"
            />
            {/* Window Pillar */}
            <line x1="88" y1="4" x2="88" y2="25" stroke={palette.blue} strokeWidth="2.5" />

            {/* Lower Body */}
            <rect
              x="0"
              y="22"
              width="160"
              height="35"
              rx="10"
              fill={palette.blue + '35'}
              stroke={palette.blue}
              strokeWidth="3.5"
            />

            {/* Headlights & Taillights */}
            <rect x="154" y="26" width="6" height="12" rx="2" fill={palette.amber} />
            <rect x="0" y="26" width="5" height="12" rx="2" fill={palette.clay} />

            {/* Wheels */}
            <g transform="translate(38, 56)">
              <circle cx="0" cy="0" r="16" fill={palette.ink} />
              <circle cx="0" cy="0" r="7" fill={palette.paperLight} stroke={palette.inkSoft} strokeWidth="2" />
            </g>
            <g transform="translate(122, 56)">
              <circle cx="0" cy="0" r="16" fill={palette.ink} />
              <circle cx="0" cy="0" r="7" fill={palette.paperLight} stroke={palette.inkSoft} strokeWidth="2" />
            </g>
          </g>

          {/* Car 2 (Lane 2: Bottom lane) */}
          <g transform={`translate(${460 + carOffset}, 405)`}>
            {/* Car Label */}
            <text
              x="58"
              y="-14"
              fontFamily={SERIF}
              fontSize="18"
              fontWeight="700"
              fill={palette.blue}
            >
              汽车 #2
            </text>

            {/* Dashed Bounding Box */}
            <rect
              x="-8"
              y="-6"
              width="186"
              height="80"
              fill="none"
              stroke={palette.blue}
              strokeWidth="2"
              strokeDasharray="6 4"
              rx="6"
            />

            {/* Car Upper Cabin */}
            <path
              d="M 28 26 Q 45 4 80 4 L 125 4 Q 145 4 155 26 Z"
              fill="url(#carGlass)"
              stroke={palette.blue}
              strokeWidth="3.5"
            />
            <line x1="95" y1="4" x2="95" y2="26" stroke={palette.blue} strokeWidth="2.5" />

            {/* Lower Body */}
            <rect
              x="0"
              y="22"
              width="170"
              height="36"
              rx="10"
              fill={palette.blue + '35'}
              stroke={palette.blue}
              strokeWidth="3.5"
            />

            <rect x="164" y="26" width="6" height="12" rx="2" fill={palette.amber} />
            <rect x="0" y="26" width="5" height="12" rx="2" fill={palette.clay} />

            {/* Wheels */}
            <g transform="translate(42, 58)">
              <circle cx="0" cy="0" r="17" fill={palette.ink} />
              <circle cx="0" cy="0" r="7" fill={palette.paperLight} stroke={palette.inkSoft} strokeWidth="2" />
            </g>
            <g transform="translate(128, 58)">
              <circle cx="0" cy="0" r="17" fill={palette.ink} />
              <circle cx="0" cy="0" r="7" fill={palette.paperLight} stroke={palette.inkSoft} strokeWidth="2" />
            </g>
          </g>

          {/* Car 3 (Lane 1: Top lane right) */}
          <g transform={`translate(${840 + carOffset}, 325)`}>
            {/* Car Label */}
            <text
              x="48"
              y="-14"
              fontFamily={SERIF}
              fontSize="18"
              fontWeight="700"
              fill={palette.blue}
            >
              汽车 #3
            </text>

            {/* Dashed Bounding Box */}
            <rect
              x="-8"
              y="-6"
              width="166"
              height="78"
              fill="none"
              stroke={palette.blue}
              strokeWidth="2"
              strokeDasharray="6 4"
              rx="6"
            />

            {/* Car Upper Cabin */}
            <path
              d="M 22 24 Q 35 4 70 4 L 105 4 Q 125 4 135 24 Z"
              fill="url(#carGlass)"
              stroke={palette.blue}
              strokeWidth="3.5"
            />
            <line x1="80" y1="4" x2="80" y2="24" stroke={palette.blue} strokeWidth="2.5" />

            {/* Lower Body */}
            <rect
              x="0"
              y="20"
              width="150"
              height="35"
              rx="10"
              fill={palette.blue + '35'}
              stroke={palette.blue}
              strokeWidth="3.5"
            />

            <rect x="144" y="24" width="6" height="12" rx="2" fill={palette.amber} />
            <rect x="0" y="24" width="5" height="12" rx="2" fill={palette.clay} />

            {/* Wheels */}
            <g transform="translate(36, 55)">
              <circle cx="0" cy="0" r="16" fill={palette.ink} />
              <circle cx="0" cy="0" r="7" fill={palette.paperLight} stroke={palette.inkSoft} strokeWidth="2" />
            </g>
            <g transform="translate(114, 55)">
              <circle cx="0" cy="0" r="16" fill={palette.ink} />
              <circle cx="0" cy="0" r="7" fill={palette.paperLight} stroke={palette.inkSoft} strokeWidth="2" />
            </g>
          </g>
        </svg>

        {/* Floating Physical Count Badges (Spring Animated on Beat) */}
        {isCountingBeat && (
          <>
            <div
              style={{
                position: 'absolute',
                left: 155,
                top: 8,
                transform: `scale(${bldgPop})`,
                padding: '8px 24px',
                background: palette.clay,
                color: palette.paperLight,
                fontSize: 24,
                fontWeight: 700,
                borderRadius: 20,
                boxShadow: `0 10px 24px ${palette.clay}44`,
                whiteSpace: 'nowrap',
                zIndex: 20,
              }}
            >
              1 栋建筑
            </div>

            <div
              style={{
                position: 'absolute',
                left: 550,
                top: 30,
                transform: `scale(${tree1Pop})`,
                padding: '6px 20px',
                background: palette.sage,
                color: palette.paperLight,
                fontSize: 22,
                fontWeight: 700,
                borderRadius: 18,
                boxShadow: `0 8px 20px ${palette.sage}40`,
                whiteSpace: 'nowrap',
                zIndex: 20,
              }}
            >
              第 1 棵树
            </div>

            <div
              style={{
                position: 'absolute',
                left: 775,
                top: 45,
                transform: `scale(${tree2Pop})`,
                padding: '6px 20px',
                background: palette.sage,
                color: palette.paperLight,
                fontSize: 22,
                fontWeight: 700,
                borderRadius: 18,
                boxShadow: `0 8px 20px ${palette.sage}40`,
                whiteSpace: 'nowrap',
                zIndex: 20,
              }}
            >
              第 2 棵树
            </div>

            <div
              style={{
                position: 'absolute',
                left: 150,
                bottom: 120,
                transform: `scale(${car1Pop})`,
                padding: '6px 20px',
                background: palette.blue,
                color: palette.paperLight,
                fontSize: 22,
                fontWeight: 700,
                borderRadius: 18,
                boxShadow: `0 8px 20px ${palette.blue}40`,
                whiteSpace: 'nowrap',
                zIndex: 20,
              }}
            >
              第 1 辆车
            </div>

            <div
              style={{
                position: 'absolute',
                left: 500,
                bottom: 30,
                transform: `scale(${car2Pop})`,
                padding: '6px 20px',
                background: palette.blue,
                color: palette.paperLight,
                fontSize: 22,
                fontWeight: 700,
                borderRadius: 18,
                boxShadow: `0 8px 20px ${palette.blue}40`,
                whiteSpace: 'nowrap',
                zIndex: 20,
              }}
            >
              第 2 辆车
            </div>

            <div
              style={{
                position: 'absolute',
                left: 880,
                bottom: 120,
                transform: `scale(${car3Pop})`,
                padding: '6px 20px',
                background: palette.blue,
                color: palette.paperLight,
                fontSize: 22,
                fontWeight: 700,
                borderRadius: 18,
                boxShadow: `0 8px 20px ${palette.blue}40`,
                whiteSpace: 'nowrap',
                zIndex: 20,
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
          fontSize: 22,
          fontWeight: 700,
          color: palette.inkSoft,
        }}
      >
        <span>核心特征：几何与物理边界清晰分明</span>
        <span style={{ color: palette.clay }}>个体独立：能够被逐一离散计数</span>
      </div>
    </div>
  );
};

// ==========================================
// Stage 4: Centered Continuous Field Stage & Probe (Frames 2266 - 3996)
// ==========================================
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
  let currentLocText = '山顶主峰高程点';
  let isZeroValue = false;

  if (probeRelFrame > fps * 4.5) {
    currentValText = '0.00 微克/立方米 (PM 2.5)';
    currentLocText = '极净空气采样点 (依然有确切数值)';
    isZeroValue = true;
  } else if (probeRelFrame > fps * 2.8) {
    currentValText = '68.5 分贝 (城市噪声)';
    currentLocText = '主干道旁声压级';
  } else if (probeRelFrame > fps * 1.2) {
    currentValText = '18.4 °C (环境温度)';
    currentLocText = '山腰植被区气温';
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
        fontFamily: SERIF,
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
              fontSize: 26,
              fontWeight: 700,
              color: palette.ink,
              whiteSpace: 'nowrap',
            }}
          >
            场景观察 · 连续场现象
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
                fontSize: 20,
                fontWeight: 700,
                borderRadius: 20,
                whiteSpace: 'nowrap',
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
              left: Math.min(880, probeX + 35),
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
                fontSize: 18,
                color: palette.sageLight,
                marginBottom: 4,
                whiteSpace: 'nowrap',
              }}
            >
              探针采样坐标: ({Math.round(probeX)}, {Math.round(probeY)})
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: isZeroValue ? palette.amber : palette.paperLight,
                whiteSpace: 'nowrap',
              }}
            >
              {currentValText}
            </div>
            <div
              style={{
                fontSize: 20,
                color: palette.paperLight + 'cc',
                marginTop: 4,
                whiteSpace: 'nowrap',
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
          fontSize: 22,
          fontWeight: 700,
          color: palette.inkSoft,
        }}
      >
        <span>连续场核心：空间任意位置均有明确属性值</span>
        <span style={{ color: palette.amber }}>无从无到有的突变界限 (数值为零亦是有效值)</span>
      </div>
    </div>
  );
};

// ==========================================
// Stage 5: Centered Grand Synthesis Comparison Matrix (Frames 3996 - 4436)
// ==========================================
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
        fontFamily: SERIF,
      }}
    >
      <div
        style={{
          textAlign: 'center',
          fontSize: 38,
          fontWeight: 700,
          color: palette.ink,
          marginBottom: 24,
          whiteSpace: 'nowrap',
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
            boxShadow: `0 12px 30px ${palette.clay}15`,
          }}
        >
          <div
            style={{
              fontSize: 40,
              fontWeight: 700,
              color: palette.clay,
              whiteSpace: 'nowrap',
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
              fontSize: 24,
              color: palette.ink,
              lineHeight: 1.5,
            }}
          >
            <div style={{ display: 'flex', gap: 12 }}>
              <span style={{ color: palette.clay, fontWeight: 700, whiteSpace: 'nowrap' }}>
                ● 边界:
              </span>
              <span style={{ whiteSpace: 'nowrap' }}>几何与物理界限明确分明</span>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <span style={{ color: palette.clay, fontWeight: 700, whiteSpace: 'nowrap' }}>
                ● 计数:
              </span>
              <span style={{ whiteSpace: 'nowrap' }}>独立个体，可被逐一计数</span>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <span style={{ color: palette.clay, fontWeight: 700, whiteSpace: 'nowrap' }}>
                ● 分布:
              </span>
              <span style={{ whiteSpace: 'nowrap' }}>内部有实体，外部无实体</span>
            </div>
          </div>

          <div
            style={{
              marginTop: 'auto',
              padding: '16px 20px',
              background: palette.clay + '18',
              border: `2px solid ${palette.clay}`,
              borderRadius: 12,
              fontSize: 26,
              fontWeight: 700,
              color: palette.clay,
              textAlign: 'center',
              whiteSpace: 'nowrap',
            }}
          >
            映射为 GIS ➔ 矢量模型 (Vector)
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
            boxShadow: `0 12px 30px ${palette.blue}15`,
          }}
        >
          <div
            style={{
              fontSize: 40,
              fontWeight: 700,
              color: palette.blue,
              whiteSpace: 'nowrap',
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
              fontSize: 24,
              color: palette.ink,
              lineHeight: 1.5,
            }}
          >
            <div style={{ display: 'flex', gap: 12 }}>
              <span style={{ color: palette.blue, fontWeight: 700, whiteSpace: 'nowrap' }}>
                ● 边界:
              </span>
              <span style={{ whiteSpace: 'nowrap' }}>无从无到有的明确界限</span>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <span style={{ color: palette.blue, fontWeight: 700, whiteSpace: 'nowrap' }}>
                ● 计数:
              </span>
              <span style={{ whiteSpace: 'nowrap' }}>空间连续分布，不可单独计数</span>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <span style={{ color: palette.blue, fontWeight: 700, whiteSpace: 'nowrap' }}>
                ● 分布:
              </span>
              <span style={{ whiteSpace: 'nowrap' }}>任意点必有具体数值 (哪怕为0)</span>
            </div>
          </div>

          <div
            style={{
              marginTop: 'auto',
              padding: '16px 20px',
              background: palette.blue + '18',
              border: `2px solid ${palette.blue}`,
              borderRadius: 12,
              fontSize: 26,
              fontWeight: 700,
              color: palette.blue,
              textAlign: 'center',
              whiteSpace: 'nowrap',
            }}
          >
            映射为 GIS ➔ 栅格模型 (Raster)
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
