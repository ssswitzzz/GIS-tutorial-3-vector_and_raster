import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { Latex } from './components/Latex';
import { PaperBackground } from './components/PaperBackground';
import { clamp, MONO, palette, SERIF } from './theme';

export const getTimestamps = (fps: number) => {
  const f = (sec: number) => Math.round(sec * fps);
  return {
    start: 0,
    act1_construct: 0,
    point_intro: f(11.700),
    line_intro: f(15.033),
    polygon_intro: f(18.066),
    vector_realize: f(22.466),
    vector_define: f(29.200),

    act2_precision: f(47.100),
    precision_zoom: f(57.066),

    act3_attributes: f(63.466),
    attr_table: f(72.200),

    act4_limitations: f(81.366),
    algebra_issue: f(97.466),

    act5_dialectics: f(102.566),
    contours_tin: f(113.100),
    landuse_raster: f(122.400),
    end: f(127.366),
  };
};

const BottomTracker: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const T = getTimestamps(fps);

  const act =
    frame < T.act2_precision
      ? 1
      : frame < T.act3_attributes
        ? 2
        : frame < T.act4_limitations
          ? 3
          : frame < T.act5_dialectics
            ? 4
            : 5;

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
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {[
          { id: 1, label: '01. 几何要素' },
          { id: 2, label: '02. 矢量精度' },
          { id: 3, label: '03. 属性关联' },
          { id: 4, label: '04. 局限与短板' },
          { id: 5, label: '05. 辩证统一' },
        ].map((item) => {
          const isActive = act === item.id;
          const isPassed = act > item.id;
          return (
            <div
              key={item.id}
              style={{
                padding: '10px 24px',
                borderRadius: 30,
                background: isActive
                  ? palette.ink
                  : isPassed
                    ? palette.blue + '22'
                    : 'transparent',
                color: isActive
                  ? palette.paperLight
                  : isPassed
                    ? palette.blue
                    : palette.inkSoft + '88',
                border: `2px solid ${
                  isActive ? palette.ink : palette.ink + '25'
                }`,
                fontSize: 24,
                fontWeight: 700,
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
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
                      ? palette.blue
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

const CenteredHeadline: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const T = getTimestamps(fps);

  let eyebrow = '空间离散表达';
  let title = '地物表达的破局之道：坐标法';
  let subtitle = '用连续的笛卡尔坐标记录每一个端点，完美表达真实地物';
  let keyStart = 0;

  if (frame >= T.act2_precision && frame < T.act3_attributes) {
    eyebrow = '矢量核心优势 · 精度无损';
    title = '几何解析定义 · 无限放大无锯齿';
    subtitle = '由数学解析点直接绘制连续边缘，放大数千倍依然平滑如初';
    keyStart = T.act2_precision;
  } else if (frame >= T.act3_attributes && frame < T.act4_limitations) {
    eyebrow = '矢量核心优势 · 属性挂载';
    title = '空间几何与关系型属性数据库联动';
    subtitle = '每个要素可挂载上百个属性字段，实现超高维度的数据表达';
    keyStart = T.act3_attributes;
  } else if (frame >= T.act4_limitations && frame < T.act5_dialectics) {
    eyebrow = '矢量短板与局限';
    title = '连续场表达繁琐 · 代数运算复杂';
    subtitle = '对于高程、气温等无界连续场，矢量多边形碎片化且叠加困难';
    keyStart = T.act4_limitations;
  } else if (frame >= T.act5_dialectics) {
    eyebrow = '辩证认知与融合';
    title = '适不适合的艺术 · 各尽其长';
    subtitle = '等值线与三角网赋能连续场，土地利用栅格承载离散分类';
    keyStart = T.act5_dialectics;
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
        top: 60,
        textAlign: 'center',
        opacity: fade,
        transform: `translateY(${(1 - slideIn) * 20}px)`,
        zIndex: 20,
        fontFamily: SERIF,
      }}
    >
      <div
        style={{
          color: palette.blue,
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
          fontSize: 60,
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

const VectorConstructStage: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const T = getTimestamps(fps);

  if (frame >= T.act2_precision) return null;

  const enter = spring({ frame, fps, config: { damping: 20, stiffness: 80 } });

  const isPointPhase = frame >= T.point_intro;
  const isLinePhase = frame >= T.line_intro;
  const isPolygonPhase = frame >= T.polygon_intro;
  const isVectorDefine = frame >= T.vector_define;

  const pointSpring = spring({
    frame: frame - T.point_intro,
    fps,
    config: { damping: 16, stiffness: 90 },
  });
  const lineSpring = spring({
    frame: frame - T.line_intro,
    fps,
    config: { damping: 18, stiffness: 85 },
  });
  const polygonSpring = spring({
    frame: frame - T.polygon_intro,
    fps,
    config: { damping: 18, stiffness: 80 },
  });
  const stampSpring = spring({
    frame: frame - T.vector_define,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  const p1 = { x: 300, y: 320 };
  const linePoints = [
    { x: 140, y: 430 },
    { x: 270, y: 270 },
    { x: 420, y: 390 },
    { x: 570, y: 210 },
  ];
  const polyPoints = [
    { x: 190, y: 190, labelPos: { dx: -70, dy: -12 } },
    { x: 460, y: 150, labelPos: { dx: 15, dy: -12 } },
    { x: 550, y: 360, labelPos: { dx: 15, dy: 10 } },
    { x: 380, y: 460, labelPos: { dx: 15, dy: 16 } },
    { x: 150, y: 390, labelPos: { dx: -75, dy: 16 } },
  ];

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: 240,
        width: 1400,
        height: 650,
        transform: `translateX(-50%) scale(${0.96 + enter * 0.04})`,
        background: palette.paperLight,
        border: `3px solid ${palette.blue}`,
        borderRadius: 24,
        boxShadow: `0 24px 60px ${palette.blue}20`,
        opacity: enter,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        padding: 32,
        fontFamily: SERIF,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `2px solid ${palette.blue}33`,
          paddingBottom: 16,
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
            空间实体坐标化 · 几何模型演进
          </span>
        </div>

        <div style={{ display: 'flex', gap: 14 }}>
          <span
            style={{
              padding: '6px 18px',
              background: isPointPhase ? palette.blue + '22' : 'transparent',
              color: isPointPhase ? palette.blue : palette.inkSoft + '66',
              border: `2px solid ${
                isPointPhase ? palette.blue : palette.inkSoft + '33'
              }`,
              fontFamily: SERIF,
              fontSize: 20,
              fontWeight: 700,
              borderRadius: 20,
            }}
          >
            01. 点要素
          </span>
          <span
            style={{
              padding: '6px 18px',
              background: isLinePhase ? palette.sage + '22' : 'transparent',
              color: isLinePhase ? palette.sage : palette.inkSoft + '66',
              border: `2px solid ${
                isLinePhase ? palette.sage : palette.inkSoft + '33'
              }`,
              fontFamily: SERIF,
              fontSize: 20,
              fontWeight: 700,
              borderRadius: 20,
            }}
          >
            02. 线要素
          </span>
          <span
            style={{
              padding: '6px 18px',
              background: isPolygonPhase ? palette.amber + '22' : 'transparent',
              color: isPolygonPhase ? palette.amber : palette.inkSoft + '66',
              border: `2px solid ${
                isPolygonPhase ? palette.amber : palette.inkSoft + '33'
              }`,
              fontFamily: SERIF,
              fontSize: 20,
              fontWeight: 700,
              borderRadius: 20,
            }}
          >
            03. 面要素
          </span>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          gap: 28,
          marginTop: 20,
          position: 'relative',
        }}
      >
        <div
          style={{
            flex: 1.3,
            background: palette.paper,
            borderRadius: 18,
            border: `2px solid ${palette.blue}33`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <svg
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
            }}
          >
            <defs>
              <pattern
                id="coordGrid"
                width="50"
                height="50"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 50 0 L 0 0 0 50"
                  fill="none"
                  stroke={palette.blue}
                  strokeWidth="1"
                  strokeOpacity="0.15"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#coordGrid)" />

            <line
              x1="40"
              y1="490"
              x2="720"
              y2="490"
              stroke={palette.inkSoft}
              strokeWidth="2"
            />
            <line
              x1="40"
              y1="490"
              x2="40"
              y2="30"
              stroke={palette.inkSoft}
              strokeWidth="2"
            />
            <text
              x="710"
              y="480"
              fill={palette.inkSoft}
              fontFamily={SERIF}
              fontSize="20"
              fontWeight="700"
            >
              X
            </text>
            <text
              x="50"
              y="40"
              fill={palette.inkSoft}
              fontFamily={SERIF}
              fontSize="20"
              fontWeight="700"
            >
              Y
            </text>

            {isPointPhase && !isLinePhase && (
              <g opacity={pointSpring}>
                <circle
                  cx={p1.x}
                  cy={p1.y}
                  r={20 + Math.sin(frame * 0.15) * 8}
                  fill="none"
                  stroke={palette.blue}
                  strokeWidth="2"
                  opacity={0.6}
                />
                <circle cx={p1.x} cy={p1.y} r="12" fill={palette.blue} />
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p1.x + 80}
                  y2={p1.y - 60}
                  stroke={palette.blue}
                  strokeWidth="2"
                  strokeDasharray="4,4"
                />
                <rect
                  x={p1.x + 75}
                  y={p1.y - 95}
                  width="220"
                  height="48"
                  rx="8"
                  fill={palette.paperLight}
                  stroke={palette.blue}
                  strokeWidth="2"
                />
                <text
                  x={p1.x + 88}
                  y={p1.y - 63}
                  fill={palette.blue}
                  fontFamily={SERIF}
                  fontSize="22"
                  fontWeight="700"
                >
                  P (420.5, 280.0)
                </text>
              </g>
            )}

            {isLinePhase && !isPolygonPhase && (
              <g opacity={lineSpring}>
                <polyline
                  points={linePoints.map((p) => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke={palette.sage}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {linePoints.map((p, idx) => (
                  <g key={idx}>
                    <circle cx={p.x} cy={p.y} r="10" fill={palette.sage} />
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="16"
                      fill="none"
                      stroke={palette.sage}
                      strokeWidth="2"
                    />
                    <text
                      x={p.x + 14}
                      y={p.y - 12}
                      fill={palette.ink}
                      fontFamily={SERIF}
                      fontSize="20"
                      fontWeight="700"
                    >
                      折点 V{idx}
                    </text>
                  </g>
                ))}
              </g>
            )}

            {isPolygonPhase && (
              <g opacity={polygonSpring}>
                <polygon
                  points={polyPoints.map((p) => `${p.x},${p.y}`).join(' ')}
                  fill={palette.amber + '33'}
                  stroke={palette.amber}
                  strokeWidth="6"
                  strokeLinejoin="round"
                />
                {polyPoints.map((p, idx) => (
                  <g key={idx}>
                    <circle cx={p.x} cy={p.y} r="10" fill={palette.amber} />
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="16"
                      fill="none"
                      stroke={palette.amber}
                      strokeWidth="2"
                    />
                    <text
                      x={p.x + p.labelPos.dx}
                      y={p.y + p.labelPos.dy}
                      fill={palette.ink}
                      fontFamily={SERIF}
                      fontSize="19"
                      fontWeight="700"
                    >
                      端点 P{idx}
                    </text>
                  </g>
                ))}
                <path
                  d={`M ${polyPoints[polyPoints.length - 1].x} ${
                    polyPoints[polyPoints.length - 1].y
                  } Q ${polyPoints[0].x - 60} ${
                    (polyPoints[0].y + polyPoints[4].y) / 2
                  } ${polyPoints[0].x} ${polyPoints[0].y}`}
                  fill="none"
                  stroke={palette.amber}
                  strokeWidth="3"
                  strokeDasharray="6,4"
                />
              </g>
            )}
          </svg>

          {isVectorDefine && (
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) scale(${
                  0.85 + stampSpring * 0.15
                }) rotate(-8deg)`,
                opacity: stampSpring,
                border: `5px dashed ${palette.amber}`,
                borderRadius: 18,
                padding: '16px 36px',
                color: palette.amber,
                fontFamily: SERIF,
                fontSize: 38,
                fontWeight: 800,
                background: palette.paperLight + 'f5',
                boxShadow: `0 12px 36px ${palette.amber}40`,
                pointerEvents: 'none',
                zIndex: 30,
                whiteSpace: 'nowrap',
                textAlign: 'center',
              }}
            >
              ★ 地理空间要素 ★
            </div>
          )}
        </div>

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              background: palette.paper,
              border: `2px solid ${palette.ink}33`,
              borderRadius: 16,
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <div
              style={{
                fontFamily: SERIF,
                fontSize: 24,
                fontWeight: 700,
                color: palette.ink,
              }}
            >
              📋 空间几何坐标定义
            </div>

            <div
              style={{
                background: palette.paperLight,
                padding: '16px 20px',
                borderRadius: 12,
                border: `1px solid ${palette.ink}22`,
                fontSize: 22,
                color: palette.ink,
                lineHeight: 1.6,
              }}
            >
              {isPointPhase && !isLinePhase && (
                <div>
                  <div style={{ color: palette.blue, fontWeight: 700, marginBottom: 6 }}>
                    点要素坐标表达式：
                  </div>
                  <Latex math="P = (x_0, y_0) = (420.50, 280.00)" />
                </div>
              )}
              {isLinePhase && !isPolygonPhase && (
                <div>
                  <div style={{ color: palette.sage, fontWeight: 700, marginBottom: 6 }}>
                    线要素折点序列：
                  </div>
                  <Latex math="L = \big[ V_0(140, 430), V_1(270, 270), V_2(420, 390), V_3(570, 210) \big]" />
                </div>
              )}
              {isPolygonPhase && (
                <div>
                  <div style={{ color: palette.amber, fontWeight: 700, marginBottom: 6 }}>
                    面要素闭合环序列：
                  </div>
                  <Latex math="A = \big[ P_0, P_1, P_2, P_3, P_4, \mathbf{P_0} \big]" />
                  <div style={{ fontSize: 18, color: palette.inkSoft, marginTop: 6 }}>
                    首尾相连形成无缝空间多边形边界
                  </div>
                </div>
              )}
              {!isPointPhase && (
                <div style={{ color: palette.inkSoft }}>
                  等待空间几何输入...
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              background: palette.blue + '15',
              border: `2px solid ${palette.blue}`,
              borderRadius: 16,
              padding: '20px 24px',
              fontFamily: SERIF,
              fontSize: 23,
              color: palette.ink,
              lineHeight: 1.5,
            }}
          >
            💡 <strong style={{ color: palette.blue }}>核心定义</strong>：
            通过记录地理实体坐标的方式，精确表示点、线、面的空间位置与几何形状，这些实体统称为
            <span
              style={{
                color: palette.amber,
                fontWeight: 700,
                padding: '0 6px',
              }}
            >
              【要素】
            </span>
            。
          </div>
        </div>
      </div>
    </div>
  );
};

const VectorPrecisionStage: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const T = getTimestamps(fps);

  if (frame < T.act2_precision || frame >= T.act3_attributes) return null;

  const relFrame = frame - T.act2_precision;
  const enter = spring({
    frame: relFrame,
    fps,
    config: { damping: 20, stiffness: 80 },
  });

  const zoomFactor = interpolate(
    frame,
    [T.precision_zoom, T.precision_zoom + Math.round(fps * 3.5)],
    [1, 5.5],
    clamp
  );

  const zoomPercent = Math.round(zoomFactor * 100);

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: 240,
        width: 1440,
        height: 650,
        transform: `translateX(-50%) scale(${0.96 + enter * 0.04})`,
        background: palette.paperLight,
        border: `3px solid ${palette.blue}`,
        borderRadius: 24,
        boxShadow: `0 24px 60px ${palette.blue}20`,
        opacity: enter,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        padding: 32,
        fontFamily: SERIF,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `2px solid ${palette.blue}33`,
          paddingBottom: 16,
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
            超高清几何解析 vs 离散网格采样
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: palette.ink,
            padding: '8px 24px',
            borderRadius: 30,
            color: palette.paperLight,
          }}
        >
          <span style={{ fontSize: 20, fontFamily: SERIF }}>当前放大倍率:</span>
          <Latex
            math={`\\text{Scale} \\times ${zoomFactor.toFixed(1)} \\ (${zoomPercent}\\%)`}
            style={{ color: palette.amber, fontSize: 22, fontWeight: 700 }}
          />
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: 28, marginTop: 24 }}>
        <div
          style={{
            flex: 1,
            background: palette.paper,
            border: `3px solid ${palette.clay}66`,
            borderRadius: 20,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontFamily: SERIF,
                fontSize: 26,
                fontWeight: 700,
                color: palette.clay,
              }}
            >
              ❌ 栅格数据
            </span>
            <span
              style={{
                background: palette.clay + '22',
                color: palette.clay,
                padding: '4px 14px',
                borderRadius: 16,
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              产生马赛克阶梯锯齿
            </span>
          </div>

          <div
            style={{
              flex: 1,
              background: palette.paperLight,
              borderRadius: 14,
              border: `2px solid ${palette.ink}22`,
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              viewBox="0 0 400 300"
              style={{
                width: '100%',
                height: '100%',
                transform: `scale(${zoomFactor})`,
                transformOrigin: '200px 150px',
              }}
            >
              {Array.from({ length: 15 }).map((_, r) =>
                Array.from({ length: 20 }).map((_, c) => {
                  const isBoundaryOrBelow = r >= Math.floor(c * 0.75);
                  return (
                    <rect
                      key={`${r}-${c}`}
                      x={c * 20}
                      y={r * 20}
                      width="20"
                      height="20"
                      fill={
                        isBoundaryOrBelow ? palette.clay + 'aa' : palette.paper
                      }
                      stroke={palette.ink}
                      strokeWidth="0.8"
                      strokeOpacity="0.3"
                    />
                  );
                })
              )}
            </svg>
          </div>

          <div
            style={{
              fontFamily: SERIF,
              fontSize: 22,
              color: palette.inkSoft,
              lineHeight: 1.4,
            }}
          >
            像元尺寸固定，放大后出现巨大方块马赛克，边界严重锯齿失真。
          </div>
        </div>

        <div
          style={{
            flex: 1,
            background: palette.paper,
            border: `3px solid ${palette.sage}`,
            borderRadius: 20,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontFamily: SERIF,
                fontSize: 26,
                fontWeight: 700,
                color: palette.sage,
              }}
            >
              ✅ 矢量数据
            </span>
            <span
              style={{
                background: palette.sage + '22',
                color: palette.sage,
                padding: '4px 14px',
                borderRadius: 16,
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              数学解析 · 边缘极致平滑
            </span>
          </div>

          <div
            style={{
              flex: 1,
              background: palette.paperLight,
              borderRadius: 14,
              border: `2px solid ${palette.sage}44`,
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              viewBox="0 0 400 300"
              style={{
                width: '100%',
                height: '100%',
                transform: `scale(${zoomFactor})`,
                transformOrigin: '200px 150px',
              }}
            >
              <polygon
                points="0,0 400,300 0,300"
                fill={palette.sage + '33'}
              />
              <line
                x1="0"
                y1="0"
                x2="400"
                y2="300"
                stroke={palette.sage}
                strokeWidth={8 / Math.sqrt(zoomFactor)}
                strokeLinecap="round"
              />
              <circle
                cx="0"
                cy="0"
                r={6 / Math.sqrt(zoomFactor)}
                fill={palette.amber}
              />
              <circle
                cx="200"
                cy="150"
                r={6 / Math.sqrt(zoomFactor)}
                fill={palette.amber}
              />
              <circle
                cx="400"
                cy="300"
                r={6 / Math.sqrt(zoomFactor)}
                fill={palette.amber}
              />
            </svg>
          </div>

          <div
            style={{
              fontFamily: SERIF,
              fontSize: 22,
              color: palette.inkSoft,
              lineHeight: 1.4,
            }}
          >
            几何形状由数学方程直接解析，无论放大多少倍，边缘始终清晰丝滑！
          </div>
        </div>
      </div>
    </div>
  );
};

const VectorAttributesStage: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const T = getTimestamps(fps);

  if (frame < T.act3_attributes || frame >= T.act4_limitations) return null;

  const relFrame = frame - T.act3_attributes;
  const enter = spring({
    frame: relFrame,
    fps,
    config: { damping: 20, stiffness: 80 },
  });

  const tableSlide = spring({
    frame: frame - T.attr_table,
    fps,
    config: { damping: 18, stiffness: 85 },
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: 240,
        width: 1440,
        height: 650,
        transform: `translateX(-50%) scale(${0.96 + enter * 0.04})`,
        background: palette.paperLight,
        border: `3px solid ${palette.blue}`,
        borderRadius: 24,
        boxShadow: `0 24px 60px ${palette.blue}20`,
        opacity: enter,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        padding: 32,
        fontFamily: SERIF,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `2px solid ${palette.blue}33`,
          paddingBottom: 16,
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
            空间几何要素与关系型属性数据库联动
          </span>
        </div>

        <div style={{ display: 'flex', gap: 14 }}>
          <span
            style={{
              padding: '6px 18px',
              background: palette.clay + '18',
              color: palette.clay,
              fontFamily: SERIF,
              fontSize: 20,
              fontWeight: 700,
              borderRadius: 20,
            }}
          >
            栅格像元：仅单一数值
          </span>
          <span
            style={{
              padding: '6px 18px',
              background: palette.amber + '22',
              color: palette.amber,
              fontFamily: SERIF,
              fontSize: 20,
              fontWeight: 700,
              borderRadius: 20,
            }}
          >
            矢量要素：挂载上百个属性字段
          </span>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          gap: 24,
          marginTop: 20,
          position: 'relative',
        }}
      >
        <div
          style={{
            flex: 0.8,
            background: palette.paper,
            border: `2px solid ${palette.blue}44`,
            borderRadius: 18,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 24,
              fontWeight: 700,
              color: palette.ink,
            }}
          >
            空间几何实体（<Latex math="\text{要素编号 } 1042" />）
          </div>

          <div
            style={{
              flex: 1,
              margin: '12px 0',
              background: palette.paperLight,
              borderRadius: 12,
              border: `1px solid ${palette.ink}22`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <svg viewBox="0 0 300 200" style={{ width: '90%', height: '90%' }}>
              <polygon
                points="20,20 120,30 100,100 10,90"
                fill={palette.inkSoft + '15'}
                stroke={palette.inkSoft}
                strokeWidth="1.5"
              />
              <polygon
                points="180,30 280,40 260,110 170,100"
                fill={palette.inkSoft + '15'}
                stroke={palette.inkSoft}
                strokeWidth="1.5"
              />
              <polygon
                points="50,55 230,45 250,165 70,175"
                fill={palette.amber + '35'}
                stroke={palette.amber}
                strokeWidth="4"
              />
              <circle cx="50" cy="55" r="5" fill={palette.amber} />
              <circle cx="230" cy="45" r="5" fill={palette.amber} />
              <circle cx="250" cy="165" r="5" fill={palette.amber} />
              <circle cx="70" cy="175" r="5" fill={palette.amber} />
              <rect
                x="80"
                y="90"
                width="140"
                height="36"
                rx="6"
                fill={palette.paperLight}
                stroke={palette.amber}
                strokeWidth="1.5"
              />
              <text
                x="90"
                y="115"
                fill={palette.ink}
                fontFamily={SERIF}
                fontSize="18"
                fontWeight="700"
              >
                科技园3号楼
              </text>
            </svg>
          </div>

          <div
            style={{
              fontFamily: SERIF,
              fontSize: 19,
              color: palette.blue,
              fontWeight: 700,
            }}
          >
            <Latex math="\text{几何类型：闭合面要素 } \big[ P_0 \dots P_4 \big]" />
          </div>
        </div>

        <div
          style={{
            flex: 1.4,
            background: palette.paper,
            border: `2px solid ${palette.amber}66`,
            borderRadius: 18,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            opacity: tableSlide,
            transform: `translateX(${(1 - tableSlide) * 30}px)`,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontFamily: SERIF,
                fontSize: 24,
                fontWeight: 700,
                color: palette.ink,
              }}
            >
              要素属性表
            </span>
            <span
              style={{
                fontFamily: SERIF,
                fontSize: 18,
                color: palette.amber,
                fontWeight: 700,
              }}
            >
              <Latex math="m = 128 \text{ 个可用属性字段}" />
            </span>
          </div>

          <div
            style={{
              flex: 1,
              background: palette.paperLight,
              borderRadius: 12,
              border: `2px solid ${palette.ink}22`,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 130px 110px 100px 90px 1fr',
                background: palette.ink,
                color: palette.paperLight,
                fontFamily: SERIF,
                fontSize: 17,
                fontWeight: 700,
                padding: '10px 12px',
                textAlign: 'center',
              }}
            >
              <span>要素编号</span>
              <span>建筑名称</span>
              <span>土地用途</span>
              <span>建筑面积</span>
              <span>高度</span>
              <span>产权所有人</span>
            </div>

            {[
              {
                fid: '1041',
                name: '创新大厦A座',
                use: '商业办公',
                area: '12,400㎡',
                height: '84.5m',
                owner: '智创发展集团',
                highlight: false,
              },
              {
                fid: '1042',
                name: '科技园3号楼',
                use: '科研教育',
                area: '28,600㎡',
                height: '56.0m',
                owner: '国家重点实验室',
                highlight: true,
              },
              {
                fid: '1043',
                name: '云谷数据中心',
                use: '市政设施',
                area: '18,200㎡',
                height: '32.0m',
                owner: '云端网络科技',
                highlight: false,
              },
              {
                fid: '1044',
                name: '湖滨生态社区',
                use: '居住用地',
                area: '45,800㎡',
                height: '42.0m',
                owner: '城投置业股份',
                highlight: false,
              },
              {
                fid: '1045',
                name: '中央综合枢纽',
                use: '交通服务',
                area: '62,100㎡',
                height: '24.0m',
                owner: '市轨道交通局',
                highlight: false,
              },
            ].map((row, idx) => (
              <div
                key={idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 130px 110px 100px 90px 1fr',
                  fontFamily: SERIF,
                  fontSize: 17,
                  fontWeight: row.highlight ? 700 : 500,
                  padding: '9px 12px',
                  textAlign: 'center',
                  background: row.highlight
                    ? palette.amber + '25'
                    : idx % 2 === 0
                      ? 'transparent'
                      : palette.inkSoft + '0d',
                  borderBottom: `1px solid ${palette.ink}15`,
                  color: row.highlight ? palette.ink : palette.inkSoft,
                }}
              >
                <span style={{ fontFamily: MONO }}>{row.fid}</span>
                <span>{row.name}</span>
                <span>{row.use}</span>
                <span style={{ fontFamily: MONO }}>{row.area}</span>
                <span style={{ fontFamily: MONO }}>{row.height}</span>
                <span>{row.owner}</span>
              </div>
            ))}
          </div>

          <div
            style={{
              fontFamily: SERIF,
              fontSize: 20,
              color: palette.ink,
              lineHeight: 1.4,
            }}
          >
            每一个空间要素均可与关系型数据库无缝关联，支持多维度的空间专题统计与查询！
          </div>
        </div>
      </div>
    </div>
  );
};

const VectorLimitationsStage: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const T = getTimestamps(fps);

  if (frame < T.act4_limitations || frame >= T.act5_dialectics) return null;

  const relFrame = frame - T.act4_limitations;
  const enter = spring({
    frame: relFrame,
    fps,
    config: { damping: 20, stiffness: 80 },
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: 240,
        width: 1440,
        height: 650,
        transform: `translateX(-50%) scale(${0.96 + enter * 0.04})`,
        background: palette.paperLight,
        border: `3px solid ${palette.clay}`,
        borderRadius: 24,
        boxShadow: `0 24px 60px ${palette.clay}20`,
        opacity: enter,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        padding: 32,
        fontFamily: SERIF,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `2px solid ${palette.clay}33`,
          paddingBottom: 16,
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
            矢量的局限 · 连续场表达繁琐与拓扑计算复杂度
          </span>
        </div>

        <span
          style={{
            padding: '6px 18px',
            background: palette.clay + '20',
            color: palette.clay,
            fontFamily: SERIF,
            fontSize: 20,
            fontWeight: 700,
            borderRadius: 20,
          }}
        >
          无物理边界连续场困境
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: 28, marginTop: 24 }}>
        <div
          style={{
            flex: 1,
            background: palette.paper,
            border: `2px solid ${palette.clay}55`,
            borderRadius: 18,
            padding: 22,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 24,
              fontWeight: 700,
              color: palette.clay,
            }}
          >
            ⚠️ 连续场离散化：碎多边形爆炸
          </div>

          <div
            style={{
              flex: 1,
              background: palette.paperLight,
              borderRadius: 12,
              border: `1px solid ${palette.ink}22`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <svg viewBox="0 0 400 240" style={{ width: '100%', height: '100%' }}>
              {Array.from({ length: 8 }).map((_, i) =>
                Array.from({ length: 6 }).map((_, j) => (
                  <polygon
                    key={`${i}-${j}`}
                    points={`${i * 50 + (j % 2) * 10},${j * 40} ${
                      (i + 1) * 50
                    },${j * 40 + 10} ${(i + 1) * 50 - 5},${(j + 1) * 40} ${
                      i * 50
                    },${(j + 1) * 40 - 10}`}
                    fill={`rgba(153, 91, 73, ${0.1 + ((i + j) % 5) * 0.15})`}
                    stroke={palette.clay}
                    strokeWidth="1"
                  />
                ))
              )}
            </svg>
          </div>

          <div
            style={{
              fontFamily: SERIF,
              fontSize: 20,
              color: palette.inkSoft,
              lineHeight: 1.4,
            }}
          >
            高程、气温、降雨量等无边界现象，若用矢量多边形拟合，会产生数万碎多边形（<Latex math="N_{\text{碎片}} \gg 10^4" />），坐标冗余极其严重！
          </div>
        </div>

        <div
          style={{
            flex: 1,
            background: palette.paper,
            border: `2px solid ${palette.clay}55`,
            borderRadius: 18,
            padding: 22,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 24,
              fontWeight: 700,
              color: palette.clay,
            }}
          >
            ⚡ 图层叠加计算：复杂的几何求交
          </div>

          <div
            style={{
              flex: 1,
              background: palette.paperLight,
              borderRadius: 12,
              border: `1px solid ${palette.ink}22`,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-around',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 16px',
                background: palette.blue + '15',
                borderRadius: 10,
              }}
            >
              <span
                style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700 }}
              >
                🟩 栅格代数叠加
              </span>
              <Latex
                math="\mathbf{Z}_A + \mathbf{Z}_B \implies \mathcal{O}(N) \text{ 极速}"
                style={{ color: palette.blue, fontSize: 20, fontWeight: 700 }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 16px',
                background: palette.clay + '15',
                borderRadius: 10,
              }}
            >
              <span
                style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700 }}
              >
                🔴 矢量空间叠加
              </span>
              <Latex
                math="\text{拓扑几何求交} \implies \mathcal{O}(N^2) \text{ 繁琐}"
                style={{ color: palette.clay, fontSize: 20, fontWeight: 700 }}
              />
            </div>
          </div>

          <div
            style={{
              fontFamily: SERIF,
              fontSize: 20,
              color: palette.inkSoft,
              lineHeight: 1.4,
            }}
          >
            矢量多边形叠加需要计算线段交点、重建拓扑环、消除缝隙碎斑，计算极为繁重。
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// STAGE 5: 辩证认知 · 适不适合的艺术 (VectorDialecticsStage)
// ==========================================
const VectorDialecticsStage: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const T = getTimestamps(fps);

  if (frame < T.act5_dialectics) return null;

  const relFrame = frame - T.act5_dialectics;
  const enter = spring({
    frame: relFrame,
    fps,
    config: { damping: 20, stiffness: 80 },
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: 240,
        width: 1440,
        height: 650,
        transform: `translateX(-50%) scale(${0.96 + enter * 0.04})`,
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
              fontFamily: SERIF,
              fontSize: 26,
              fontWeight: 700,
              color: palette.ink,
            }}
          >
            空间表达的辩证法 · 适材适所的 GIS 艺术
          </span>
        </div>

        <span
          style={{
            padding: '6px 20px',
            background: palette.amber + '22',
            color: palette.amber,
            fontFamily: SERIF,
            fontSize: 20,
            fontWeight: 700,
            borderRadius: 20,
          }}
        >
          平衡统一 · 各尽其长
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: 28, marginTop: 24 }}>
        {/* Left: Vector expressing Continuous Fields (Organic Contours & 3D Shaded TIN) */}
        <div
          style={{
            flex: 1.15,
            background: palette.paper,
            border: `2px solid ${palette.blue}55`,
            borderRadius: 18,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontFamily: SERIF,
                fontSize: 23,
                fontWeight: 700,
                color: palette.blue,
              }}
            >
              连续表面表达：等高线 ＋ 三角网
            </span>
            <Latex
              math="Z = f(X, Y)"
              style={{ color: palette.blue, fontSize: 18, fontWeight: 700 }}
            />
          </div>

          {/* Graphic: Beautiful Realistic Topographic Contour Map + 3D Shaded TIN Surface */}
          <div
            style={{
              flex: 1,
              background: palette.paperLight,
              borderRadius: 12,
              border: `1px solid ${palette.ink}22`,
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
            }}
          >
            {/* Left Half: Realistic Organic Hypsometric Contours */}
            <div style={{ flex: 1, position: 'relative', borderRight: `1px dashed ${palette.ink}22` }}>
              <div
                style={{
                  position: 'absolute',
                  left: 10,
                  top: 8,
                  fontSize: 15,
                  fontWeight: 700,
                  color: palette.blue,
                  fontFamily: SERIF,
                  background: palette.paperLight + 'dd',
                  padding: '2px 8px',
                  borderRadius: 6,
                  zIndex: 10,
                }}
              >
                地形等高线
              </div>

              <svg viewBox="0 0 210 200" style={{ width: '100%', height: '100%' }}>
                <defs>
                  {/* Hypsometric tints gradients */}
                  <linearGradient id="contourGrad" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#dce8d6" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#c5ddbd" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#f3deb8" stopOpacity="0.8" />
                  </linearGradient>
                </defs>

                {/* Level 1: 100m Base Contour & Fill */}
                <path
                  d="M 15 160 C 30 185, 170 190, 195 155 C 205 110, 190 40, 140 25 C 90 10, 20 40, 15 110 Z"
                  fill="#e5efdf"
                  stroke={palette.blue}
                  strokeWidth="1.5"
                  strokeDasharray="4,3"
                />

                {/* Level 2: 200m Contour & Fill */}
                <path
                  d="M 35 140 C 45 165, 150 170, 175 135 C 185 95, 160 50, 120 40 C 70 30, 30 65, 35 140 Z"
                  fill="#d4e6cd"
                  stroke={palette.blue}
                  strokeWidth="2"
                />

                {/* Level 3: 300m Contour & Fill */}
                <path
                  d="M 60 120 C 70 145, 135 145, 150 115 C 160 85, 140 60, 105 55 C 75 50, 50 80, 60 120 Z"
                  fill="#f1dfbe"
                  stroke={palette.blue}
                  strokeWidth="2.5"
                />

                {/* Level 4: 400m Summit Contour */}
                <path
                  d="M 85 105 C 92 120, 120 120, 128 102 C 132 85, 118 72, 102 70 C 88 68, 80 88, 85 105 Z"
                  fill="#e8c895"
                  stroke={palette.blue}
                  strokeWidth="3"
                />

                {/* Summit Peak Marker */}
                <polygon points="106,90 111,98 101,98" fill={palette.clay} />
                <circle cx="106" cy="95" r="2" fill={palette.paperLight} />

                {/* Clean Elevation Text Badges Distributed along Contours */}
                <g fontFamily={SERIF} fontSize="11" fontWeight="700" fill={palette.blue}>
                  {/* 100m Base */}
                  <rect x="22" y="112" width="38" height="16" rx="3" fill={palette.paperLight} stroke={palette.blue} strokeWidth="0.8" />
                  <text x="25" y="124">100m</text>

                  {/* 200m Mid */}
                  <rect x="36" y="86" width="38" height="16" rx="3" fill={palette.paperLight} stroke={palette.blue} strokeWidth="0.8" />
                  <text x="39" y="98">200m</text>

                  {/* 300m High */}
                  <rect x="42" y="60" width="38" height="16" rx="3" fill={palette.paperLight} stroke={palette.blue} strokeWidth="0.8" />
                  <text x="45" y="72">300m</text>

                  {/* 486m Peak */}
                  <rect x="94" y="66" width="36" height="16" rx="3" fill={palette.clay + '22'} stroke={palette.clay} strokeWidth="0.8" />
                  <text x="97" y="78" fill={palette.clay} fontSize="11" fontWeight="800">486m</text>
                </g>
              </svg>
            </div>

            {/* Right Half: 3D Isometric Shaded TIN Mesh */}
            <div style={{ flex: 1, position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: 10,
                  top: 8,
                  fontSize: 15,
                  fontWeight: 700,
                  color: palette.amber,
                  fontFamily: SERIF,
                  background: palette.paperLight + 'dd',
                  padding: '2px 8px',
                  borderRadius: 6,
                  zIndex: 10,
                }}
              >
                不规则三角网
              </div>

              <svg viewBox="0 0 210 200" style={{ width: '100%', height: '100%' }}>
                {/* Shaded 3D Delaunay Triangular Facets */}
                <g stroke={palette.amber} strokeWidth="1.5" strokeLinejoin="round">
                  {/* Facet 1 (Lit peak facet) */}
                  <polygon points="105,40 45,95 105,100" fill="#f5eedc" />
                  {/* Facet 2 (Top-right facet) */}
                  <polygon points="105,40 105,100 165,75" fill="#eddcc1" />
                  {/* Facet 3 (Far-right steep slope) */}
                  <polygon points="165,75 105,100 185,130" fill="#d9c29d" />
                  {/* Facet 4 (Center-bottom valley) */}
                  <polygon points="105,100 120,165 185,130" fill="#cbb089" />
                  {/* Facet 5 (Bottom-left slope) */}
                  <polygon points="105,100 55,155 120,165" fill="#dfcca9" />
                  {/* Facet 6 (Left valley facet) */}
                  <polygon points="45,95 55,155 105,100" fill="#e8d8b9" />
                  {/* Facet 7 (Outer margin left) */}
                  <polygon points="45,95 20,140 55,155" fill="#d6c3a1" />
                  {/* Facet 8 (Outer margin bottom) */}
                  <polygon points="55,155 120,165 100,185" fill="#ba9f77" />
                  {/* Facet 9 (Outer margin bottom-right) */}
                  <polygon points="120,165 185,130 170,180" fill="#a88b62" />
                </g>

                {/* Delaunay Nodes */}
                {[
                  { x: 105, y: 40, peak: true },
                  { x: 45, y: 95 },
                  { x: 165, y: 75 },
                  { x: 105, y: 100 },
                  { x: 185, y: 130 },
                  { x: 55, y: 155 },
                  { x: 120, y: 165 },
                  { x: 20, y: 140 },
                  { x: 100, y: 185 },
                  { x: 170, y: 180 },
                ].map((node, i) => (
                  <g key={i}>
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.peak ? 5 : 3.5}
                      fill={node.peak ? palette.clay : palette.amber}
                    />
                    {node.peak && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="8"
                        fill="none"
                        stroke={palette.clay}
                        strokeWidth="1.5"
                      />
                    )}
                  </g>
                ))}

                <g fontFamily={SERIF} fontSize="12" fontWeight="800">
                  <rect x="58" y="16" width="94" height="20" rx="4" fill={palette.paperLight} stroke={palette.clay} strokeWidth="1" />
                  <text x="64" y="30" fill={palette.clay}>顶点 (X, Y, Z)</text>
                </g>
              </svg>
            </div>
          </div>

          <div
            style={{
              fontFamily: SERIF,
              fontSize: 19,
              color: palette.inkSoft,
              lineHeight: 1.4,
            }}
          >
            等高线追踪地形起伏，三角网在地形复杂处加密采样，优雅表达连续表面！
          </div>
        </div>

        {/* Right: Raster expressing Discrete Objects (Land Use Categorical Grid) */}
        <div
          style={{
            flex: 0.95,
            background: palette.paper,
            border: `2px solid ${palette.sage}55`,
            borderRadius: 18,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontFamily: SERIF,
                fontSize: 23,
                fontWeight: 700,
                color: palette.sage,
              }}
            >
              离散对象表达：土地利用分类栅格
            </span>
            <span
              style={{
                fontFamily: SERIF,
                fontSize: 16,
                color: palette.sage,
                fontWeight: 700,
              }}
            >
              类型编码
            </span>
          </div>

          <div
            style={{
              flex: 1,
              background: palette.paperLight,
              borderRadius: 12,
              border: `1px solid ${palette.ink}22`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 10,
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: 4,
                width: '100%',
                height: '100%',
              }}
            >
              {[
                { c: '#52745f', label: '林地' },
                { c: '#52745f', label: '林地' },
                { c: '#356b78', label: '水体' },
                { c: '#356b78', label: '水体' },
                { c: '#b37a42', label: '耕地' },
                { c: '#b37a42', label: '耕地' },

                { c: '#52745f', label: '林地' },
                { c: '#52745f', label: '林地' },
                { c: '#356b78', label: '水体' },
                { c: '#356b78', label: '水体' },
                { c: '#b37a42', label: '耕地' },
                { c: '#995b49', label: '建设' },

                { c: '#52745f', label: '林地' },
                { c: '#b37a42', label: '耕地' },
                { c: '#b37a42', label: '耕地' },
                { c: '#995b49', label: '建设' },
                { c: '#995b49', label: '建设' },
                { c: '#995b49', label: '建设' },

                { c: '#52745f', label: '林地' },
                { c: '#b37a42', label: '耕地' },
                { c: '#995b49', label: '建设' },
                { c: '#995b49', label: '建设' },
                { c: '#995b49', label: '建设' },
                { c: '#995b49', label: '建设' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: item.c,
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontFamily: SERIF,
                    fontSize: 15,
                    fontWeight: 700,
                    opacity: 0.92,
                  }}
                >
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: SERIF,
              fontSize: 17,
              fontWeight: 700,
            }}
          >
            <span style={{ color: '#52745f' }}>🟩 林地</span>
            <span style={{ color: '#356b78' }}>🟦 水体</span>
            <span style={{ color: '#b37a42' }}>🟨 耕地</span>
            <span style={{ color: '#995b49' }}>🟥 建设用地</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const VectorConcept: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const T = getTimestamps(fps);

  const scale = width / 1920;

  const accent =
    frame < T.act3_attributes
      ? 'blue'
      : frame < T.act4_limitations
        ? 'amber'
        : frame < T.act5_dialectics
          ? 'clay'
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
        <CenteredHeadline frame={frame} />

        <VectorConstructStage frame={frame} />
        <VectorPrecisionStage frame={frame} />
        <VectorAttributesStage frame={frame} />
        <VectorLimitationsStage frame={frame} />
        <VectorDialecticsStage frame={frame} />

        <BottomTracker frame={frame} />
      </div>
    </AbsoluteFill>
  );
};
