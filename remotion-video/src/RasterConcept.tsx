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
import { Latex } from './components/Latex';
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

  const items = [
    { id: 1, label: '01. 方块抽象' },
    { id: 2, label: '02. 栅格本质' },
    { id: 3, label: '03. 代数优势' },
    { id: 4, label: '04. 锯齿隐患' },
    { id: 5, label: '05. 存储告急' },
  ];
  const progress = interpolate(frame, [0, T.end], [0, 1], clamp);

  return (
    <div style={{ position: 'absolute', left: 100, right: 100, bottom: 34, height: 58, fontFamily: SERIF, zIndex: 50 }}>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 5, height: 2, background: palette.ink + '18' }}>
        <div style={{ width: `${progress * 100}%`, height: '100%', background: palette.amber }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        {items.map((item) => {
          const isActive = act === item.id;
          const isPassed = act > item.id;
          return (
            <div key={item.id} style={{ color: isActive ? palette.ink : isPassed ? palette.blue : palette.inkSoft + '70', fontSize: isActive ? 21 : 18, fontWeight: isActive ? 800 : 600, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8, transform: `translateY(${isActive ? 0 : 3}px)` }}>
              <span style={{ width: isActive ? 10 : 7, height: isActive ? 10 : 7, borderRadius: '50%', background: isActive ? palette.amber : isPassed ? palette.blue : palette.inkSoft + '40' }} />
              <span>{item.label}</span>
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

  const stageDuration = frame < T.raster_def
    ? T.raster_def
    : frame < T.raster_adv
      ? T.raster_adv - T.raster_def
      : frame < T.raster_jaggies
        ? T.raster_jaggies - T.raster_adv
        : frame < T.raster_growth
          ? T.raster_growth - T.raster_jaggies
          : T.end - T.raster_growth;
  const stageProgress = interpolate(frame - keyStart, [0, stageDuration], [0, 1], clamp);
  let echo = stageProgress < 0.42 ? '把连续世界，切成一个个格子' : '格子越小，细节越接近真实';
  let echoSub = 'CONTINUOUS  →  DISCRETE';
  let echoColor = palette.blue;
  if (frame >= T.raster_def && frame < T.raster_adv) {
    echo = stageProgress < 0.45 ? '每个像元，都有确定的行与列' : '一次计算，直接定位目标像元';
    echoSub = 'ROW  ×  COLUMN  /  O(1)';
  } else if (frame >= T.raster_adv && frame < T.raster_jaggies) {
    echo = stageProgress < 0.45 ? '连续现象，天然适合规则矩阵' : '像元对齐，图层即可逐格运算';
    echoSub = 'LAYER A  +  LAYER B  =  RESULT';
  } else if (frame >= T.raster_jaggies && frame < T.raster_growth) {
    echo = stageProgress < 0.48 ? '规则格网，也会带来阶梯边界' : '提高分辨率，锯齿逐渐收敛';
    echoSub = 'COARSE GRID  →  FINE GRID';
    echoColor = palette.clay;
  } else if (frame >= T.raster_growth) {
    echo = stageProgress < 0.42 ? '边长翻倍，像元数量翻四倍' : '精度提升，存储压力同步暴涨';
    echoSub = 'RESOLUTION  ↑  /  STORAGE  ↑↑';
    echoColor = palette.amber;
  }
  const echoSwitch = Math.floor(stageProgress * 2);
  const echoIn = spring({ frame: frame - keyStart - echoSwitch * Math.round(stageDuration * 0.5), fps, config: { damping: 20, stiffness: 100 } });

  return (
    <>
      <div style={{ position: 'absolute', left: 100, top: 44, width: 1120, opacity: fade, transform: `translateX(${(1 - slideIn) * -24}px)`, zIndex: 20, fontFamily: SERIF }}>
        <div style={{ color: palette.blue, fontSize: 18, fontWeight: 800, marginBottom: 7, display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ width: 36, height: 2, background: palette.blue }} />{eyebrow}</div>
        <div style={{ color: palette.ink, fontSize: 42, fontWeight: 800, lineHeight: 1.15, whiteSpace: 'nowrap' }}>{title}</div>
        <div style={{ color: palette.inkSoft, fontSize: 20, marginTop: 7, fontWeight: 600, whiteSpace: 'nowrap' }}>{subtitle}</div>
      </div>
      <div style={{ position: 'absolute', right: 100, top: 58, width: 620, textAlign: 'right', zIndex: 22, fontFamily: SERIF, opacity: echoIn, transform: `translateY(${(1 - echoIn) * 12}px)` }}>
        <div style={{ color: echoColor, fontSize: 26, fontWeight: 800 }}>{echo}</div>
        <div style={{ color: palette.inkSoft, fontFamily: MONO, fontSize: 16, marginTop: 7 }}>{echoSub}</div>
      </div>
    </>
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
  const coarseReveal = interpolate(frame, [Math.round(fps * 0.4), Math.round(fps * 2.2)], [0, 1], clamp);
  const fineReveal = interpolate(frame, [Math.round(fps * 2), Math.round(fps * 4.2)], [0, 1], clamp);

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
                    opacity={interpolate(coarseReveal, [(r + c) / 14, Math.min(1, (r + c) / 14 + 0.35)], [0, 1], clamp)}
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
                const cellReveal = interpolate(
                  fineReveal,
                  [Math.min(0.78, dist / Math.max(1, dynamicGridSize * 0.95)), Math.min(1, dist / Math.max(1, dynamicGridSize * 0.95) + 0.22)],
                  [0, 1],
                  clamp
                );
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
                    opacity={cellReveal}
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
  const formulaIn = spring({
    frame: relFrame - Math.round(fps * 1.1),
    fps,
    config: { damping: 19, stiffness: 90 },
  });

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
            像元矩阵与 <Latex math="\mathcal{O}(1)" /> 空间位置查询
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
          查询时间复杂度：<Latex math="\mathcal{O}(1)" />
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
              top: 2,
              height: 378,
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
                const cellIn = interpolate(
                  relFrame,
                  [Math.round(fps * (0.25 + (r + c) * 0.035)), Math.round(fps * (0.6 + (r + c) * 0.035))],
                  [0, 1],
                  clamp
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
                      opacity={cellIn}
                    />
                    <text
                      x={c * 48 + 22.5}
                      y={r * 48 + 28}
                      fontFamily={SERIF}
                      fontSize="16"
                      fontWeight="700"
                      fill={isTarget ? palette.paperLight : palette.inkSoft}
                      textAnchor="middle"
                      opacity={cellIn}
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
            opacity: formulaIn,
            transform: `translateX(${(1 - formulaIn) * 26}px)`,
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
            <Latex math="X = X_0 + c \cdot s" inline={false} />
            <Latex math="Y = Y_0 - r \cdot s" inline={false} />
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
              ⚡ 直接通过行号与列号数学计算，无需逐项查找，复杂度为 <Latex math="\mathcal{O}(1)" />！
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
  const layerAIn = spring({ frame: relFrame, fps, config: { damping: 19, stiffness: 90 } });
  const layerBIn = spring({ frame: relFrame - Math.round(fps * 0.45), fps, config: { damping: 19, stiffness: 90 } });
  const resultIn = spring({ frame: relFrame - Math.round(fps * 1.15), fps, config: { damping: 19, stiffness: 90 } });

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
            opacity: layerAIn,
            transform: `translateY(${(1 - layerAIn) * 18}px)`,
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
            opacity: layerBIn,
            transform: `translateY(${(1 - layerBIn) * 18}px)`,
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
            opacity: resultIn,
            transform: `translateY(${(1 - resultIn) * 18}px)`,
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
                      opacity={0.35 + resultIn * 0.65}
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
  const relFrame = frame - T.raster_jaggies;
  const highResIn = spring({
    frame: relFrame - Math.round(fps * 2.2),
    fps,
    config: { damping: 20, stiffness: 90 },
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
                const cellIn = interpolate(
                  relFrame,
                  [Math.round(fps * (0.25 + (r + c) * 0.045)), Math.round(fps * (0.55 + (r + c) * 0.045))],
                  [0, 1],
                  clamp
                );
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
                    opacity={cellIn}
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
            opacity: highResIn,
            transform: `translateX(${(1 - highResIn) * 28}px)`,
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
                const cellIn = interpolate(
                  highResIn,
                  [Math.min(0.78, (r + c) / 44), Math.min(1, (r + c) / 44 + 0.2)],
                  [0, 1],
                  clamp
                );
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
                    opacity={cellIn}
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
  const storageIn = spring({
    frame: relFrame - Math.round(fps * 2.8),
    fps,
    config: { damping: 20, stiffness: 85 },
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
            分辨率翻倍 → 数据量呈平方级 <Latex math="\mathcal{O}(N^2)" /> 爆炸式增长！
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
            justifyContent: 'center',
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
            像元数据量增长曲线（<Latex math="y=s^2" />）
          </div>

          {(() => {
            // Chart area dimensions
            const svgW = 380;
            const svgH = 320;
            const padL = 70; // left padding for y-axis labels
            const padR = 30;
            const padT = 30;
            const padB = 50; // bottom padding for x-axis labels

            const plotW = svgW - padL - padR; // 280
            const plotH = svgH - padT - padB; // 240

            // Data range: s from 1 to 4, y = s² from 1 to 16
            const sMin = 1;
            const sMax = 4;
            const yMin = 0;
            const yMax = 16;

            // Map data to pixel coordinates
            const toX = (s: number) =>
              padL + ((s - sMin) / (sMax - sMin)) * plotW;
            const toY = (y: number) =>
              padT + plotH - ((y - yMin) / (yMax - yMin)) * plotH;

            // Generate smooth curve points
            const curvePoints: string[] = [];
            for (let i = 0; i <= 60; i++) {
              const s = sMin + (i / 60) * (sMax - sMin);
              const y = s * s;
              curvePoints.push(`${toX(s).toFixed(1)},${toY(y).toFixed(1)}`);
            }
            const polylineStr = curvePoints.join(' ');

            // Tracer dot position (on the exact same curve)
            const dotX = toX(currentS);
            const dotY = toY(currentVal);

            // Axis ticks
            const xTicks = [1, 2, 3, 4];
            const yTicks = [0, 4, 8, 12, 16];

            return (
              <svg
                width={svgW}
                height={svgH}
                viewBox={`0 0 ${svgW} ${svgH}`}
              >
                {/* Grid lines */}
                {yTicks.map((v) => (
                  <line
                    key={`gy-${v}`}
                    x1={padL}
                    y1={toY(v)}
                    x2={padL + plotW}
                    y2={toY(v)}
                    stroke={palette.ink + '12'}
                    strokeWidth="1"
                  />
                ))}
                {xTicks.map((v) => (
                  <line
                    key={`gx-${v}`}
                    x1={toX(v)}
                    y1={padT}
                    x2={toX(v)}
                    y2={padT + plotH}
                    stroke={palette.ink + '12'}
                    strokeWidth="1"
                  />
                ))}

                {/* Axes */}
                <line
                  x1={padL}
                  y1={padT + plotH}
                  x2={padL + plotW}
                  y2={padT + plotH}
                  stroke={palette.ink}
                  strokeWidth="2.5"
                />
                <line
                  x1={padL}
                  y1={padT}
                  x2={padL}
                  y2={padT + plotH}
                  stroke={palette.ink}
                  strokeWidth="2.5"
                />

                {/* X-axis ticks & labels */}
                {xTicks.map((v) => (
                  <g key={`xt-${v}`}>
                    <line
                      x1={toX(v)}
                      y1={padT + plotH}
                      x2={toX(v)}
                      y2={padT + plotH + 6}
                      stroke={palette.ink}
                      strokeWidth="2"
                    />
                    <text
                      x={toX(v)}
                      y={padT + plotH + 24}
                      fontFamily={SERIF}
                      fontSize="15"
                      fontWeight="700"
                      fill={palette.inkSoft}
                      textAnchor="middle"
                    >
                      {v}×
                    </text>
                  </g>
                ))}

                {/* Y-axis ticks & labels */}
                {yTicks.map((v) => (
                  <g key={`yt-${v}`}>
                    <line
                      x1={padL - 6}
                      y1={toY(v)}
                      x2={padL}
                      y2={toY(v)}
                      stroke={palette.ink}
                      strokeWidth="2"
                    />
                    <text
                      x={padL - 12}
                      y={toY(v) + 5}
                      fontFamily={SERIF}
                      fontSize="15"
                      fontWeight="700"
                      fill={palette.inkSoft}
                      textAnchor="end"
                    >
                      {v}
                    </text>
                  </g>
                ))}

                {/* Axis titles */}
                <text
                  x={padL + plotW / 2}
                  y={svgH - 4}
                  fontFamily={SERIF}
                  fontSize="16"
                  fontWeight="700"
                  fill={palette.inkSoft}
                  textAnchor="middle"
                >
                  分辨率倍率 (s)
                </text>
                <text
                  x={16}
                  y={padT + plotH / 2}
                  fontFamily={SERIF}
                  fontSize="16"
                  fontWeight="700"
                  fill={palette.amber}
                  textAnchor="middle"
                  transform={`rotate(-90, 16, ${padT + plotH / 2})`}
                >
                  数据量 (s²)
                </text>

                {/* Quadratic curve y = s² */}
                <polyline
                  points={polylineStr}
                  fill="none"
                  stroke={palette.amber}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength={1}
                  strokeDasharray="1"
                  strokeDashoffset={1 - progress}
                />

                {/* Tracer dot — exactly on the curve */}
                <circle cx={dotX} cy={dotY} r="8" fill={palette.amber} />
                <circle
                  cx={dotX}
                  cy={dotY}
                  r="16"
                  fill="none"
                  stroke={palette.amber}
                  strokeWidth="2"
                  opacity="0.5"
                />
              </svg>
            );
          })()}
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
              opacity: storageIn,
              transform: `translateY(${(1 - storageIn) * 14}px)`,
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
    <AbsoluteFill style={{ fontFamily: SERIF, background: palette.paper }} from={-283}>
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
