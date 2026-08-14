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
// Relative to start at 104.433s (Total duration: 131.367s = 7882 frames)
export const getTimestamps = (fps: number) => {
  const f = (sec: number) => Math.round(sec * fps);
  return {
    start: 0,
    minecraft: 0, // 0.000s - 19.633s: Minecraft 方块抽象
    raster_def: f(19.633), // 19.633s - 46.133s: 栅格数据本质与 O(1) 查询
    raster_adv: f(46.133), // 46.133s - 74.666s: 连续现象表达与图层代数运算
    raster_jaggies: f(74.666), // 74.666s - 95.433s: 离散地物锯齿现象
    raster_growth: f(95.433), // 95.433s - 131.367s: 分辨率平方级增长与 GeoTIFF
    end: f(131.367),
  };
};

// Bottom Progress Tracker (Pure Chinese, 思源宋体 SemiBold)
const BottomTracker: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const T = getTimestamps(fps);

  const act =
    frame < T.raster_def
      ? 1
      : frame < T.raster_adv
        ? 2
        : frame < T.raster_jaggies
          ? 3
          : frame < T.raster_growth
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
          { id: 1, label: '01. 方块抽象' },
          { id: 2, label: '02. 栅格本质' },
          { id: 3, label: '03. 代数优势' },
          { id: 4, label: '04. 锯齿隐患' },
          { id: 5, label: '05. 存储告急' },
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

// Centered Top Header Panel (Strictly SERIF, No Raw LaTeX String)
const CenteredHeadline: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const T = getTimestamps(fps);

  let eyebrow = '空间数据抽象';
  let title = '如何抽象连续变化的物理世界？';
  let subtitle = '最简单的抽象方式：像 Minecraft 一样把地图切成一个个方块';
  let keyStart = 0;

  if (frame >= T.raster_def && frame < T.raster_adv) {
    eyebrow = 'GIS 核心数据结构';
    title = '栅格数据：本质是一个二维数组';
    subtitle = '通过基准原点与行列号，像元位置计算的时间复杂度为 O(1)';
    keyStart = T.raster_def;
  } else if (frame >= T.raster_adv && frame < T.raster_jaggies) {
    eyebrow = '栅格数据优势';
    title = '天然表达连续现象 · 图层运算极速简单';
    subtitle = '高程、气温、降雨量与遥感影像的最佳表达，矩阵代数迅速高效';
    keyStart = T.raster_adv;
  } else if (frame >= T.raster_jaggies && frame < T.raster_growth) {
    eyebrow = '栅格局限与挑战';
    title = '离散地物界限：低分辨率下的锯齿现象';
    subtitle = '为了清晰刻画地物边界，必须将格子拆得更小（提高分辨率）';
    keyStart = T.raster_jaggies;
  } else if (frame >= T.raster_growth) {
    eyebrow = '数据代价警告';
    title = '分辨率翻倍 → 数据量惊人翻四倍！';
    subtitle = '栅格每个格子必存数值，数据量呈平方级 O(N²) 爆炸式增长';
    keyStart = T.raster_growth;
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

// Stage 1: Minecraft Voxel Metaphor (Continuous Dynamic Grid Subdivision)
const MinecraftStage: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const T = getTimestamps(fps);

  if (frame >= T.raster_def) return null;

  const enter = spring({ frame, fps, config: { damping: 20, stiffness: 80 } });

  // Continuously animate grid subdivision sizes (4x4 -> 16x16 -> 32x32)
  const dynamicGridSize = Math.round(
    interpolate(
      frame,
      [0, Math.round(fps * 6), Math.round(fps * 14)],
      [4, 12, 24],
      clamp
    )
  );

  const pulse = Math.sin(frame * 0.1) * 4;

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
        borderRadius: 24,
        boxShadow: `0 24px 60px ${palette.blue}20`,
        opacity: enter,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        padding: 36,
        fontFamily: SERIF,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `2px solid ${palette.blue}33`,
          paddingBottom: 18,
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
            游戏化映射 · 像素方块世界
          </span>
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <span
            style={{
              padding: '6px 18px',
              background: palette.amber + '18',
              color: palette.amber,
              fontFamily: SERIF,
              fontSize: 20,
              fontWeight: 700,
              borderRadius: 20,
            }}
          >
            方块越大 细节越粗糙
          </span>
          <span
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
            方块越小 刻画越精细
          </span>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          marginTop: 20,
          display: 'flex',
          gap: 36,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Coarse Grid */}
        <div
          style={{
            flex: 1,
            height: '100%',
            background: palette.paper,
            border: `2px solid ${palette.amber}`,
            borderRadius: 16,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 24,
              fontWeight: 700,
              color: palette.amber,
              marginBottom: 14,
            }}
          >
            粗糙大方块（4 × 4 像元）
          </div>
          <svg width="300" height="300" viewBox="0 0 300 300">
            {Array.from({ length: 4 }).map((_, r) =>
              Array.from({ length: 4 }).map((__, c) => {
                const color =
                  (r + c) % 2 === 0 ? palette.sage + '44' : palette.amber + '33';
                return (
                  <rect
                    key={`${r}-${c}`}
                    x={c * 75}
                    y={r * 75}
                    width="73"
                    height="73"
                    fill={color}
                    stroke={palette.amber}
                    strokeWidth="2"
                    rx="4"
                  />
                );
              })
            )}
          </svg>
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 20,
              color: palette.inkSoft,
              marginTop: 14,
            }}
          >
            像元数量少 · 锯齿感强
          </div>
        </div>

        {/* Dynamic Fine Grid */}
        <div
          style={{
            flex: 1,
            height: '100%',
            background: palette.paper,
            border: `2px solid ${palette.blue}`,
            borderRadius: 16,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 24,
              fontWeight: 700,
              color: palette.blue,
              marginBottom: 14,
            }}
          >
            精细小方块（{dynamicGridSize} × {dynamicGridSize} 动态切分）
          </div>
          <svg width="300" height="300" viewBox="0 0 300 300">
            {Array.from({ length: dynamicGridSize }).map((_, r) =>
              Array.from({ length: dynamicGridSize }).map((__, c) => {
                const step = 300 / dynamicGridSize;
                const dist = Math.sqrt(
                  Math.pow(r - dynamicGridSize / 2, 2) +
                    Math.pow(c - dynamicGridSize / 2, 2)
                );
                const color =
                  dist < dynamicGridSize * (0.42 + pulse * 0.01)
                    ? palette.blue + '55'
                    : palette.sage + '35';
                return (
                  <rect
                    key={`${r}-${c}`}
                    x={c * step}
                    y={r * step}
                    width={step - 1}
                    height={step - 1}
                    fill={color}
                    stroke={palette.blue}
                    strokeWidth="0.8"
                  />
                );
              })
            )}
          </svg>
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 20,
              color: palette.blue,
              marginTop: 14,
              fontWeight: 700,
            }}
          >
            细节丰富 · 拟合真实地理空间
          </div>
        </div>
      </div>
    </div>
  );
};

// Stage 2: 8x8 Grid Matrix & Continuous O(1) Position Scanning Animation
const RasterDefinitionStage: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const T = getTimestamps(fps);

  if (frame < T.raster_def || frame >= T.raster_adv) return null;

  const enter = spring({
    frame: frame - T.raster_def,
    fps,
    config: { damping: 20, stiffness: 80 },
  });

  const relFrame = frame - T.raster_def;

  // Dynamically moving query target cell (gliding gracefully across cells)
  const rowSeq = [1, 2, 3, 4, 3];
  const colSeq = [2, 4, 5, 3, 5];
  const seqIdx = Math.floor((relFrame / (fps * 1.5)) % rowSeq.length);
  const targetRow = rowSeq[seqIdx];
  const targetCol = colSeq[seqIdx];

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
        borderRadius: 24,
        boxShadow: `0 24px 60px ${palette.blue}20`,
        opacity: enter,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        padding: 36,
        fontFamily: SERIF,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `2px solid ${palette.blue}33`,
          paddingBottom: 18,
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
            像元矩阵与 O(1) 空间位置查询
          </span>
        </div>

        <span
          style={{
            padding: '6px 20px',
            background: palette.amber,
            color: palette.paperLight,
            fontFamily: SERIF,
            fontSize: 22,
            fontWeight: 700,
            borderRadius: 20,
          }}
        >
          查询时间复杂度：O(1)
        </span>
      </div>

      <div
        style={{
          flex: 1,
          marginTop: 20,
          display: 'flex',
          gap: 40,
          alignItems: 'center',
        }}
      >
        {/* Left: 8x8 Grid Matrix SVG */}
        <div style={{ position: 'relative', width: 440, height: 440 }}>
          <div
            style={{
              position: 'absolute',
              top: -30,
              left: 40,
              right: 0,
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: SERIF,
              fontSize: 18,
              color: palette.blue,
              fontWeight: 700,
            }}
          >
            {[0, 1, 2, 3, 4, 5, 6, 7].map((c) => (
              <span key={c} style={{ width: 42, textAlign: 'center' }}>
                列{c}
              </span>
            ))}
          </div>

          <div
            style={{
              position: 'absolute',
              top: 40,
              bottom: 0,
              left: -35,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              fontFamily: SERIF,
              fontSize: 18,
              color: palette.blue,
              fontWeight: 700,
            }}
          >
            {[0, 1, 2, 3, 4, 5, 6, 7].map((r) => (
              <span key={r} style={{ height: 42, lineHeight: '42px' }}>
                行{r}
              </span>
            ))}
          </div>

          <svg
            width="400"
            height="400"
            viewBox="0 0 400 400"
            style={{ marginLeft: 40 }}
          >
            {Array.from({ length: 8 }).map((_, r) =>
              Array.from({ length: 8 }).map((__, c) => {
                const isTarget = r === targetRow && c === targetCol;
                const isOrigin = r === 0 && c === 0;
                const val = Math.round(
                  15 +
                    Math.sin(r * 0.8 + c * 0.5 + relFrame * 0.04) * 40 +
                    r * 5
                );
                return (
                  <g key={`${r}-${c}`}>
                    <rect
                      x={c * 48}
                      y={r * 48}
                      width="45"
                      height="45"
                      fill={
                        isTarget
                          ? palette.amber
                          : isOrigin
                            ? palette.sage + '66'
                            : palette.paper
                      }
                      stroke={
                        isTarget
                          ? palette.amber
                          : isOrigin
                            ? palette.sage
                            : palette.blue + '44'
                      }
                      strokeWidth={isTarget || isOrigin ? '3' : '1'}
                      rx="4"
                    />
                    <text
                      x={c * 48 + 22.5}
                      y={r * 48 + 28}
                      fontFamily={SERIF}
                      fontSize="16"
                      fontWeight="700"
                      fill={isTarget ? palette.paperLight : palette.inkSoft}
                      textAnchor="middle"
                    >
                      {val}
                    </text>
                  </g>
                );
              })
            )}
          </svg>
        </div>

        {/* Right: Pure Formula & Description Card in SERIF */}
        <div
          style={{
            flex: 1,
            background: palette.paper,
            border: `2px solid ${palette.blue}44`,
            borderRadius: 18,
            padding: 30,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 20,
            fontFamily: SERIF,
          }}
        >
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 26,
              fontWeight: 700,
              color: palette.ink,
            }}
          >
            🎯 像元位置计算公式：
          </div>

          <div
            style={{
              background: palette.paperLight,
              border: `2px solid ${palette.blue}`,
              borderRadius: 14,
              padding: '20px 24px',
              fontFamily: SERIF,
              fontSize: 26,
              color: palette.blue,
              fontWeight: 700,
              lineHeight: 1.6,
            }}
          >
            目标坐标 X = 基准原点 X ＋ 列号 × 像元大小
            <br />
            目标坐标 Y = 基准原点 Y － 行号 × 像元大小
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              fontFamily: SERIF,
              fontSize: 22,
              color: palette.inkSoft,
            }}
          >
            <div>基准原点：左上角像元 (行 0, 列 0)</div>
            <div>
              当前动态定位像元：
              <span style={{ color: palette.amber, fontWeight: 700 }}>
                行 {targetRow}, 列 {targetCol}
              </span>
            </div>
            <div style={{ color: palette.amber, fontWeight: 700, marginTop: 6 }}>
              ⚡ 直接通过行号与列号数学计算，无需逐项查找，复杂度为 O(1)！
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stage 3: Layer Matrix Algebra Addition Animation (A + B = C)
const RasterAdvantagesStage: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const T = getTimestamps(fps);

  if (frame < T.raster_adv || frame >= T.raster_jaggies) return null;

  const enter = spring({
    frame: frame - T.raster_adv,
    fps,
    config: { damping: 20, stiffness: 80 },
  });

  const relFrame = frame - T.raster_adv;
  const activeIdx = Math.floor((relFrame / (fps * 0.4)) % 16);

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
        borderRadius: 24,
        boxShadow: `0 24px 60px ${palette.blue}20`,
        opacity: enter,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        padding: 36,
        fontFamily: SERIF,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `2px solid ${palette.blue}33`,
          paddingBottom: 18,
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
            图层矩阵代数与波段计算
          </span>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          {['高程 DEM', '气温', '降雨量', '遥感影像'].map((tag) => (
            <span
              key={tag}
              style={{
                padding: '6px 16px',
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

      {/* Layer Addition Matrix Animation */}
      <div
        style={{
          flex: 1,
          marginTop: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
        }}
      >
        {/* Matrix A: Elevation Layer */}
        <div
          style={{
            flex: 1,
            background: palette.paper,
            border: `2px solid ${palette.sage}`,
            borderRadius: 16,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 22,
              fontWeight: 700,
              color: palette.sage,
              marginBottom: 12,
            }}
          >
            高程图层 (矩阵 A)
          </div>
          <svg width="220" height="220" viewBox="0 0 220 220">
            {Array.from({ length: 4 }).map((_, r) =>
              Array.from({ length: 4 }).map((__, c) => {
                const idx = r * 4 + c;
                const isCurrent = idx === activeIdx;
                const val = (r + 1) * 10 + c * 5;
                return (
                  <g key={`${r}-${c}`}>
                    <rect
                      x={c * 52}
                      y={r * 52}
                      width="48"
                      height="48"
                      fill={isCurrent ? palette.sage : palette.sage + '30'}
                      stroke={palette.sage}
                      strokeWidth={isCurrent ? '3' : '2'}
                      rx="4"
                    />
                    <text
                      x={c * 52 + 24}
                      y={r * 52 + 30}
                      fontFamily={SERIF}
                      fontSize="18"
                      fontWeight="700"
                      fill={isCurrent ? palette.paperLight : palette.ink}
                      textAnchor="middle"
                    >
                      {val}
                    </text>
                  </g>
                );
              })
            )}
          </svg>
        </div>

        <div
          style={{
            fontFamily: SERIF,
            fontSize: 36,
            fontWeight: 700,
            color: palette.amber,
          }}
        >
          ＋
        </div>

        {/* Matrix B: Rainfall Layer */}
        <div
          style={{
            flex: 1,
            background: palette.paper,
            border: `2px solid ${palette.blue}`,
            borderRadius: 16,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 22,
              fontWeight: 700,
              color: palette.blue,
              marginBottom: 12,
            }}
          >
            降雨图层 (矩阵 B)
          </div>
          <svg width="220" height="220" viewBox="0 0 220 220">
            {Array.from({ length: 4 }).map((_, r) =>
              Array.from({ length: 4 }).map((__, c) => {
                const idx = r * 4 + c;
                const isCurrent = idx === activeIdx;
                const val = (c + 1) * 8 + r * 3;
                return (
                  <g key={`${r}-${c}`}>
                    <rect
                      x={c * 52}
                      y={r * 52}
                      width="48"
                      height="48"
                      fill={isCurrent ? palette.blue : palette.blue + '25'}
                      stroke={palette.blue}
                      strokeWidth={isCurrent ? '3' : '2'}
                      rx="4"
                    />
                    <text
                      x={c * 52 + 24}
                      y={r * 52 + 30}
                      fontFamily={SERIF}
                      fontSize="18"
                      fontWeight="700"
                      fill={isCurrent ? palette.paperLight : palette.blue}
                      textAnchor="middle"
                    >
                      {val}
                    </text>
                  </g>
                );
              })
            )}
          </svg>
        </div>

        <div
          style={{
            fontFamily: SERIF,
            fontSize: 36,
            fontWeight: 700,
            color: palette.amber,
          }}
        >
          ＝
        </div>

        {/* Matrix C: Combined Result */}
        <div
          style={{
            flex: 1,
            background: palette.paper,
            border: `3px solid ${palette.amber}`,
            borderRadius: 16,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: `0 12px 30px ${palette.amber}25`,
          }}
        >
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 22,
              fontWeight: 700,
              color: palette.amber,
              marginBottom: 12,
            }}
          >
            分析结果 (矩阵 A ＋ B)
          </div>
          <svg width="220" height="220" viewBox="0 0 220 220">
            {Array.from({ length: 4 }).map((_, r) =>
              Array.from({ length: 4 }).map((__, c) => {
                const idx = r * 4 + c;
                const isCurrent = idx === activeIdx;
                const valA = (r + 1) * 10 + c * 5;
                const valB = (c + 1) * 8 + r * 3;
                return (
                  <g key={`${r}-${c}`}>
                    <rect
                      x={c * 52}
                      y={r * 52}
                      width="48"
                      height="48"
                      fill={isCurrent ? palette.amber : palette.amber + '35'}
                      stroke={palette.amber}
                      strokeWidth={isCurrent ? '4' : '2.5'}
                      rx="4"
                    />
                    <text
                      x={c * 52 + 24}
                      y={r * 52 + 30}
                      fontFamily={SERIF}
                      fontSize="18"
                      fontWeight="700"
                      fill={isCurrent ? palette.paperLight : palette.ink}
                      textAnchor="middle"
                    >
                      {valA + valB}
                    </text>
                  </g>
                );
              })
            )}
          </svg>
        </div>
      </div>

      <div
        style={{
          marginTop: 16,
          padding: '12px 24px',
          background: palette.paper,
          borderRadius: 12,
          border: `2px solid ${palette.blue}22`,
          fontFamily: SERIF,
          fontSize: 22,
          fontWeight: 700,
          color: palette.inkSoft,
          textAlign: 'center',
        }}
      >
        ⚡ 像元位置完全重合 → 逐像素算术与逻辑运算极速完成！
      </div>
    </div>
  );
};

// Stage 4: Discrete Object Boundaries & Jagged Edge Issue
const RasterJaggiesStage: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const T = getTimestamps(fps);

  if (frame < T.raster_jaggies || frame >= T.raster_growth) return null;

  const enter = spring({
    frame: frame - T.raster_jaggies,
    fps,
    config: { damping: 20, stiffness: 80 },
  });

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
        borderRadius: 24,
        boxShadow: `0 24px 60px ${palette.clay}20`,
        opacity: enter,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        padding: 36,
        fontFamily: SERIF,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `2px solid ${palette.clay}33`,
          paddingBottom: 18,
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
            离散地物界限问题 · 锯齿现象对比
          </span>
        </div>

        <span
          style={{
            padding: '6px 20px',
            background: palette.clay,
            color: palette.paperLight,
            fontFamily: SERIF,
            fontSize: 20,
            fontWeight: 700,
            borderRadius: 20,
          }}
        >
          格子太大的失真风险
        </span>
      </div>

      <div
        style={{
          flex: 1,
          marginTop: 20,
          display: 'flex',
          gap: 36,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Low Res Jagged Circle */}
        <div
          style={{
            flex: 1,
            height: '100%',
            background: palette.paper,
            border: `2px solid ${palette.clay}`,
            borderRadius: 16,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 24,
              fontWeight: 700,
              color: palette.clay,
              marginBottom: 14,
            }}
          >
            低分辨率（马赛克锯齿明显）
          </div>
          <svg width="280" height="280" viewBox="0 0 280 280">
            {/* Low Res Faint Background Grid */}
            {Array.from({ length: 7 }).map((_, i) => (
              <React.Fragment key={`grid-low-${i}`}>
                <line
                  x1={26 + i * 38}
                  y1={26}
                  x2={26 + i * 38}
                  y2={254}
                  stroke={palette.clay + '20'}
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                <line
                  x1={26}
                  y1={26 + i * 38}
                  x2={254}
                  y2={26 + i * 38}
                  stroke={palette.clay + '20'}
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
              </React.Fragment>
            ))}

            {/* Rasterized Pixel Cells */}
            {Array.from({ length: 6 }).map((_, r) =>
              Array.from({ length: 6 }).map((__, c) => {
                const dx = (c - 2.5) * 38;
                const dy = (r - 2.5) * 38;
                const inCircle = Math.sqrt(dx * dx + dy * dy) <= 105;
                if (!inCircle) return null;
                return (
                  <rect
                    key={`low-${r}-${c}`}
                    x={26 + c * 38 + 1}
                    y={26 + r * 38 + 1}
                    width="36"
                    height="36"
                    fill={palette.clay + '55'}
                    stroke={palette.clay}
                    strokeWidth="2"
                    rx="2"
                  />
                );
              })
            )}

            {/* Reference True Vector Circle */}
            <circle
              cx="140"
              cy="140"
              r="105"
              fill="none"
              stroke={palette.ink}
              strokeWidth="2.5"
              strokeDasharray="6 6"
            />
          </svg>
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 20,
              color: palette.clay,
              marginTop: 10,
              fontWeight: 700,
            }}
          >
            ⚠ 地形/湖泊/建筑边界失真
          </div>
        </div>

        {/* High Res Smooth Grid */}
        <div
          style={{
            flex: 1,
            height: '100%',
            background: palette.paper,
            border: `2px solid ${palette.blue}`,
            borderRadius: 16,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 24,
              fontWeight: 700,
              color: palette.blue,
              marginBottom: 14,
            }}
          >
            高分辨率（细化像元拟合边界）
          </div>
          <svg width="280" height="280" viewBox="0 0 280 280">
            {/* High Res Faint Background Grid */}
            {Array.from({ length: 19 }).map((_, i) => (
              <React.Fragment key={`grid-high-${i}`}>
                <line
                  x1={23 + i * 13}
                  y1={23}
                  x2={23 + i * 13}
                  y2={257}
                  stroke={palette.blue + '18'}
                  strokeWidth="0.8"
                />
                <line
                  x1={23}
                  y1={23 + i * 13}
                  x2={257}
                  y2={23 + i * 13}
                  stroke={palette.blue + '18'}
                  strokeWidth="0.8"
                />
              </React.Fragment>
            ))}

            {/* High Res Rasterized Pixel Cells */}
            {Array.from({ length: 18 }).map((_, r) =>
              Array.from({ length: 18 }).map((__, c) => {
                const dx = (c - 8.5) * 13;
                const dy = (r - 8.5) * 13;
                const inCircle = Math.sqrt(dx * dx + dy * dy) <= 105;
                if (!inCircle) return null;
                return (
                  <rect
                    key={`high-${r}-${c}`}
                    x={23 + c * 13 + 0.5}
                    y={23 + r * 13 + 0.5}
                    width="12"
                    height="12"
                    fill={palette.blue + '55'}
                    stroke={palette.blue}
                    strokeWidth="0.8"
                    rx="1"
                  />
                );
              })
            )}

            {/* Reference True Vector Circle */}
            <circle
              cx="140"
              cy="140"
              r="105"
              fill="none"
              stroke={palette.blue}
              strokeWidth="2.5"
              strokeDasharray="6 6"
            />
          </svg>
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 20,
              color: palette.blue,
              marginTop: 10,
              fontWeight: 700,
            }}
          >
            ✔ 边界顺滑，但代价是像元数激增！
          </div>
        </div>
      </div>
    </div>
  );
};

// Stage 5: Resolution Squared Growth O(N^2) Curve & GeoTIFF Storage Alert
const RasterGrowthStage: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const T = getTimestamps(fps);

  if (frame < T.raster_growth) return null;

  const enter = spring({
    frame: frame - T.raster_growth,
    fps,
    config: { damping: 20, stiffness: 80 },
  });

  const relFrame = frame - T.raster_growth;
  const progress = Math.min(1, relFrame / (fps * 4));

  // Dynamic quadratic curve point tracer: y = s^2
  const currentS = 1 + progress * 3; // 1 to 4
  const currentVal = Math.pow(currentS, 2); // 1 to 16

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
        border: `3px solid ${palette.amber}`,
        borderRadius: 24,
        boxShadow: `0 24px 60px ${palette.amber}25`,
        opacity: enter,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        padding: 36,
        fontFamily: SERIF,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `2px solid ${palette.amber}33`,
          paddingBottom: 18,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: palette.amber,
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
            分辨率翻倍 → 数据量呈平方级 O(N²) 爆炸式增长！
          </span>
        </div>

        <span
          style={{
            padding: '6px 20px',
            background: palette.amber,
            color: palette.paperLight,
            fontFamily: SERIF,
            fontSize: 20,
            fontWeight: 700,
            borderRadius: 20,
          }}
        >
          GeoTIFF 存储告急 ⚠️
        </span>
      </div>

      <div
        style={{
          flex: 1,
          marginTop: 20,
          display: 'flex',
          gap: 40,
          alignItems: 'center',
        }}
      >
        {/* Left: O(N^2) Curve Plot */}
        <div
          style={{
            flex: 1.1,
            height: '100%',
            background: palette.paper,
            border: `2px solid ${palette.amber}`,
            borderRadius: 16,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 24,
              fontWeight: 700,
              color: palette.amber,
              marginBottom: 12,
            }}
          >
            像元数据量增长曲线 (y = s²)
          </div>

          <svg width="340" height="240" viewBox="0 0 340 240">
            {/* Axes */}
            <line
              x1="40"
              y1="200"
              x2="320"
              y2="200"
              stroke={palette.ink}
              strokeWidth="3"
            />
            <line
              x1="40"
              y1="20"
              x2="40"
              y2="200"
              stroke={palette.ink}
              strokeWidth="3"
            />

            {/* Labels */}
            <text
              x="320"
              y="225"
              fontFamily={SERIF}
              fontSize="16"
              fontWeight="700"
              fill={palette.inkSoft}
            >
              分辨率倍率 s
            </text>
            <text
              x="10"
              y="25"
              fontFamily={SERIF}
              fontSize="16"
              fontWeight="700"
              fill={palette.amber}
            >
              数据量 (s²)
            </text>

            {/* Quadratic Curve Path */}
            <path
              d="M 40 200 Q 180 190 300 30"
              fill="none"
              stroke={palette.amber}
              strokeWidth="5"
            />

            {/* Dynamic Tracer Point along Curve */}
            {(() => {
              const cx = 40 + (currentS - 1) * (260 / 3);
              const cy = 200 - (currentVal - 1) * (170 / 15);
              return (
                <g>
                  <circle cx={cx} cy={cy} r="8" fill={palette.amber} />
                  <circle
                    cx={cx}
                    cy={cy}
                    r="16"
                    fill="none"
                    stroke={palette.amber}
                    strokeWidth="2"
                  />
                </g>
              );
            })()}
          </svg>
        </div>

        {/* Right: Data Multiplier Progress & GeoTIFF Alert Card */}
        <div
          style={{
            flex: 1.2,
            height: '100%',
            background: palette.paper,
            border: `2px solid ${palette.amber}44`,
            borderRadius: 16,
            padding: 26,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 20,
          }}
        >
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 26,
              fontWeight: 700,
              color: palette.ink,
            }}
          >
            📊 像元数据量爆表：
          </div>

          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: SERIF,
                fontSize: 20,
                color: palette.inkSoft,
                marginBottom: 6,
              }}
            >
              <span>原分辨率图像 (1 × 1)</span>
              <span>基准数据量 (100 MB)</span>
            </div>
            <div
              style={{
                height: 24,
                background: palette.blue + '22',
                borderRadius: 12,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: '25%',
                  height: '100%',
                  background: palette.blue,
                }}
              />
            </div>
          </div>

          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: SERIF,
                fontSize: 20,
                color: palette.amber,
                fontWeight: 700,
                marginBottom: 6,
              }}
            >
              <span>分辨率提升 1 倍 (2 × 2)</span>
              <span>数据像元数 → 翻 4 倍 (400 MB!)</span>
            </div>
            <div
              style={{
                height: 24,
                background: palette.amber + '22',
                borderRadius: 12,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${(currentVal / 16) * 100}%`,
                  height: '100%',
                  background: palette.amber,
                  transition: 'width 0.1s linear',
                }}
              />
            </div>
          </div>

          <div
            style={{
              background: palette.paperLight,
              border: `2px solid ${palette.amber}`,
              borderRadius: 12,
              padding: '16px 20px',
              fontFamily: SERIF,
              fontSize: 22,
              color: palette.ink,
              lineHeight: 1.5,
            }}
          >
            ⚠️ <span style={{ color: palette.amber, fontWeight: 700 }}>GeoTIFF 存储告急</span>：一个 GeoTIFF 文件常同时存储多波段图像（如红外、近红外等），电脑存储空间分分钟告急！
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Composition Component for RasterConcept
const RasterConcept: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const T = getTimestamps(fps);

  const scale = width / 1920;

  const accent =
    frame < T.raster_jaggies
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
        <CenteredHeadline frame={frame} />

        <MinecraftStage frame={frame} />
        <RasterDefinitionStage frame={frame} />
        <RasterAdvantagesStage frame={frame} />
        <RasterJaggiesStage frame={frame} />
        <RasterGrowthStage frame={frame} />

        <BottomTracker frame={frame} />
      </div>
    </AbsoluteFill>
  );
};

export { RasterConcept };
