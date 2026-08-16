import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { Latex } from './components/Latex';
import { PaperBackground } from './components/PaperBackground';
import { clamp, MONO, palette, SERIF } from './theme';
import { getRasterCompressionTimestamps as getTimestamps } from './RasterCompressionTimeline';

const LAND = '#52745f';
const WATER = '#477591';
const ALERT = '#a75b48';
const CREAM = '#f7f1e6';

const enterAt = (frame: number, start: number, fps: number) =>
  spring({ frame: frame - start, fps, config: { damping: 18, stiffness: 92, mass: 0.8 } });

// =============================================================================
// 顶部标题与章节指示器
// =============================================================================
const ChapterHeader: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const T = getTimestamps(fps);
  const chapters = [
    { start: 0, end: T.act2_start, no: '01', label: '容量危机', title: '高分辨率，不等于高效率' },
    { start: T.act2_start, end: T.act3_start, no: '02', label: '编码破局', title: '别再逐格重复存储' },
    { start: T.act3_start, end: T.act4_start, no: '03', label: '游程编码', title: '把连续像元说成一句话' },
    { start: T.act4_start, end: T.act5_start, no: '04', label: '四叉树', title: '只在有细节的地方继续分' },
    { start: T.act5_start, end: T.end + fps, no: '05', label: '地图瓦片', title: '看哪里，才加载哪里' },
  ];
  const active = chapters.find((c) => frame >= c.start && frame < c.end) ?? chapters[4];
  const p = enterAt(frame, active.start, fps);

  return (
    <div style={{ position: 'absolute', left: 100, top: 48, zIndex: 40, fontFamily: SERIF }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, color: palette.amber, fontSize: 20, fontWeight: 800 }}>
        <span style={{ fontFamily: MONO }}>{active.no}</span>
        <span style={{ width: 42, height: 2, background: palette.amber }} />
        <span>{active.label}</span>
      </div>
      <div style={{ marginTop: 6, fontSize: 40, lineHeight: 1.1, fontWeight: 800, color: palette.ink, opacity: p, transform: `translateX(${(1 - p) * -20}px)` }}>
        {active.title}
      </div>
    </div>
  );
};

const BottomTracker: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const T = getTimestamps(fps);

  const act =
    frame < T.act2_start
      ? 1
      : frame < T.act3_start
        ? 2
        : frame < T.act4_start
          ? 3
          : frame < T.act5_start
            ? 4
            : 5;

  const items = [
    { id: 1, label: '01. 容量危机' },
    { id: 2, label: '02. 编码破局' },
    { id: 3, label: '03. 游程编码' },
    { id: 4, label: '04. 四叉树' },
    { id: 5, label: '05. 地图瓦片' },
  ];
  const progress = interpolate(frame, [0, T.end], [0, 1], clamp);

  return (
    <div style={{ position: 'absolute', left: 100, right: 100, bottom: 32, height: 48, fontFamily: SERIF, zIndex: 50 }}>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 3, background: palette.ink + '18' }}>
        <div style={{ width: `${progress * 100}%`, height: '100%', background: palette.amber }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%', paddingBottom: 8 }}>
        {items.map((item) => {
          const isActive = act === item.id;
          const isPassed = act > item.id;
          return (
            <div
              key={item.id}
              style={{
                color: isActive ? palette.ink : isPassed ? palette.blue : palette.inkSoft + '70',
                fontSize: isActive ? 20 : 17,
                fontWeight: isActive ? 800 : 600,
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span
                style={{
                  width: isActive ? 10 : 7,
                  height: isActive ? 10 : 7,
                  borderRadius: '50%',
                  background: isActive ? palette.amber : isPassed ? palette.blue : palette.inkSoft + '40',
                }}
              />
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Echo: React.FC<{ text: string; sub?: string; progress?: number; tone?: string }> = ({
  text,
  sub,
  progress = 1,
  tone = palette.amber,
}) => (
  <div style={{ position: 'absolute', right: 100, top: 50, width: 700, textAlign: 'right', fontFamily: SERIF, zIndex: 45 }}>
    <div style={{ fontSize: 28, fontWeight: 800, color: tone, opacity: progress, transform: `translateY(${(1 - progress) * 10}px)` }}>
      {text}
    </div>
    {sub && <div style={{ fontSize: 18, color: palette.inkSoft, marginTop: 6, opacity: progress }}>{sub}</div>}
  </div>
);

// =============================================================================
// Scene 1: 容量危机与拟合真实圆地物 (右侧矢量描点也绘制多边形拟合圆)
// =============================================================================
const CapacityScene: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const T = getTimestamps(fps);
  if (frame >= T.act2_start) return null;

  // 动态格网尺寸：从 8x8 逐步细分为 34x34，拟合一个圆地物
  const gridStep = Math.round(interpolate(frame, [T.act1_raster_explode, T.act1_vector_fail], [8, 34], clamp));
  const cells = gridStep * gridStep;
  const pulse = 0.5 + 0.5 * Math.sin(frame / 8);

  const question = frame < T.act1_contradiction;
  const explode = frame >= T.act1_raster_explode;
  const vector = frame >= T.act1_vector_fail;
  const contour = frame >= T.act1_contour_mess;
  const ask = frame >= T.act1_question_card;

  const vectorSlide = enterAt(frame, T.act1_vector_fail, fps);
  const draw = interpolate(frame, [T.act1_vector_fail, T.act1_contour_mess + fps * 2], [0, 1], clamp);

  // 右侧矢量描点拟合圆形 (中心 330, 190，半径 130，48 个顶点)
  const nodeCount = 48;
  const circlePoints = Array.from({ length: nodeCount }, (_, i) => {
    const angle = (i / nodeCount) * 2 * Math.PI - Math.PI / 2;
    const r = 130;
    const x = 330 + r * Math.cos(angle);
    const y = 190 + r * Math.sin(angle);
    return { x, y };
  });

  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: SERIF }}>
      <Echo
        text={
          question
            ? '真的已经自洽了吗？'
            : vector
              ? '矢量与栅格：强行描圆引爆冗余'
              : explode
                ? '分辨率 ×2  ·  数据量 ×4'
                : '格子越细分，越接近真实地物'
        }
        sub={
          question
            ? '矢量与栅格模型的本质边界'
            : vector
              ? '描点越密集，轮廓节点越暴涨，文件反更大'
              : explode
                ? `${gridStep} × ${gridStep} = ${cells.toLocaleString()} 个像元`
                : '细分提升精度的同时，带来巨大存储代价'
        }
        progress={enterAt(frame, question ? T.act1_question : T.act1_contradiction, fps)}
        tone={explode || vector ? ALERT : palette.amber}
      />

      <div style={{ position: 'absolute', left: 100, right: 100, top: 170, bottom: 90, display: 'flex', gap: 32 }}>
        {/* 左侧：栅格像元切分拟合圆地物 */}
        <div
          style={{
            flex: 1.1,
            background: palette.paperLight,
            borderRadius: 24,
            border: `3px solid ${explode ? ALERT : palette.blue}`,
            boxShadow: `0 20px 50px ${explode ? ALERT + '22' : palette.blue + '18'}`,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: explode ? ALERT : palette.blue }} />
              <span style={{ fontSize: 24, fontWeight: 800, color: palette.ink }}>
                栅格细分 · 拟合真实圆地物
              </span>
            </div>
            <span
              style={{
                fontSize: 18,
                color: explode ? ALERT : palette.blue,
                fontWeight: 800,
                background: (explode ? ALERT : palette.blue) + '20',
                padding: '4px 14px',
                borderRadius: 8,
              }}
            >
              {gridStep} × {gridStep} 像元拟合
            </span>
          </div>

          {/* SVG 像元切分拟合圆 */}
          <div
            style={{
              flex: 1,
              margin: '16px 0',
              borderRadius: 16,
              overflow: 'hidden',
              position: 'relative',
              background: palette.paper,
              border: `2px solid ${palette.ink}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg viewBox="0 0 400 400" style={{ width: '88%', height: '88%' }}>
              {Array.from({ length: gridStep }).map((_, r) =>
                Array.from({ length: gridStep }).map((__, c) => {
                  const cellSize = 400 / gridStep;
                  const cx = (c + 0.5) * cellSize;
                  const cy = (r + 0.5) * cellSize;
                  const dist = Math.sqrt(Math.pow(cx - 200, 2) + Math.pow(cy - 200, 2));
                  const isCircle = dist <= 145;

                  return (
                    <rect
                      key={`${r}-${c}`}
                      x={c * cellSize}
                      y={r * cellSize}
                      width={cellSize - 0.5}
                      height={cellSize - 0.5}
                      fill={isCircle ? LAND : CREAM}
                      stroke={palette.blue}
                      strokeWidth={gridStep > 20 ? 0.4 : 1}
                      strokeOpacity={gridStep > 20 ? 0.3 : 0.6}
                    />
                  );
                })
              )}
              {/* 真实光滑圆形对比线 */}
              <circle
                cx="200"
                cy="200"
                r="145"
                fill="none"
                stroke={palette.amber}
                strokeWidth="2.5"
                strokeDasharray="6 4"
                opacity="0.85"
              />
            </svg>
          </div>

          {/* 底部信息汇总 */}
          <div
            style={{
              background: explode ? ALERT + '15' : palette.blue + '15',
              border: `2px solid ${explode ? ALERT + '40' : palette.blue + '40'}`,
              borderRadius: 16,
              padding: '14px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: 15, color: palette.inkSoft, fontWeight: 700 }}>像元总数</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: explode ? ALERT : palette.blue, fontFamily: MONO }}>
                {cells.toLocaleString()} 个像元
              </div>
            </div>

            <div>
              <div style={{ fontSize: 15, color: palette.inkSoft, fontWeight: 700 }}>内存占用</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: palette.ink, fontFamily: MONO }}>
                {(cells * 1024 / 1000000).toFixed(2)} MB
              </div>
            </div>

            <div
              style={{
                background: explode ? ALERT : palette.sage,
                color: palette.paperLight,
                padding: '6px 16px',
                borderRadius: 8,
                fontSize: 18,
                fontWeight: 800,
              }}
            >
              {explode ? '⚠️ 存储爆炸 ×4' : '✓ 运行正常'}
            </div>
          </div>
        </div>

        {/* 右侧：强行矢量化拟合圆（同样描描圆形，折点爆炸） */}
        {vector ? (
          <div
            style={{
              flex: 1.1,
              background: palette.paperLight,
              borderRadius: 24,
              border: `3px solid ${ALERT}`,
              boxShadow: `0 20px 50px ${ALERT}18`,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              opacity: vectorSlide,
              transform: `translateX(${(1 - vectorSlide) * 30}px)`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 24, fontWeight: 800, color: ALERT }}>
                强行矢量化：描圆折点陷阱
              </span>
              <span style={{ fontSize: 18, color: ALERT, fontWeight: 800, background: ALERT + '20', padding: '4px 14px', borderRadius: 8 }}>
                节点过载
              </span>
            </div>

            <div
              style={{
                flex: 1,
                margin: '16px 0',
                borderRadius: 16,
                background: palette.paper,
                border: `2px dashed ${ALERT}40`,
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg viewBox="0 0 660 380" style={{ width: '100%', height: '100%' }}>
                {/* 矢量多边形拟合圆 */}
                <polygon
                  points={circlePoints.map((p) => `${p.x},${p.y}`).join(' ')}
                  fill={ALERT + '20'}
                  stroke={ALERT}
                  strokeWidth="4"
                  strokeLinejoin="round"
                  pathLength="1"
                  strokeDasharray="1"
                  strokeDashoffset={1 - draw}
                />
                {/* 密密麻麻的折点 */}
                {circlePoints.map((p, idx) => {
                  const shown = idx / nodeCount <= draw;
                  return shown ? (
                    <g key={idx}>
                      <circle cx={p.x} cy={p.y} r={contour ? 6 : 4.5} fill={ALERT} />
                      <circle cx={p.x} cy={p.y} r={contour ? 9 : 7} fill="none" stroke={ALERT} strokeWidth="1" opacity="0.6" />
                    </g>
                  ) : null;
                })}
              </svg>
            </div>

            <div
              style={{
                background: ALERT + '15',
                border: `2px solid ${ALERT}40`,
                borderRadius: 16,
                padding: '14px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: 15, color: palette.inkSoft, fontWeight: 700 }}>折点节点总数</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: ALERT, fontFamily: MONO }}>
                  {Math.round(draw * 12759).toLocaleString()} 个节点
                </div>
              </div>

              <div style={{ fontSize: 18, color: ALERT, fontWeight: 800 }}>
                ⚠️ 矢量文件反而变大数倍！
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              flex: 1.1,
              background: palette.paperLight + '66',
              borderRadius: 24,
              border: `2px dashed ${palette.ink}25`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: palette.inkSoft + '70',
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            等待矢量化尝试...
          </div>
        )}
      </div>

      {/* 中央核心抉择卡片 */}
      {ask && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '52%',
            width: 620,
            transform: `translate(-50%, -50%) scale(${0.94 + enterAt(frame, T.act1_question_card, fps) * 0.06})`,
            padding: '34px 44px',
            background: palette.ink,
            color: palette.paperLight,
            borderRadius: 24,
            boxShadow: '0 25px 80px rgba(27,42,37,.35)',
            zIndex: 60,
          }}
        >
          <div style={{ color: palette.amber, fontFamily: MONO, fontSize: 18, letterSpacing: 2, fontWeight: 800 }}>
            核心技术抉择
          </div>
          <div style={{ fontSize: 40, fontWeight: 800, marginTop: 12, lineHeight: 1.35 }}>
            在不损失精度的前提下，
            <br />
            能否让栅格“瘦”下来？
          </div>
          <div style={{ marginTop: 22, height: 4, background: palette.paperLight + '22', borderRadius: 2 }}>
            <div style={{ width: `${pulse * 40 + 35}%`, height: '100%', background: palette.amber, borderRadius: 2 }} />
          </div>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// Scene 2: 编码破局 —— 大字号、充实无留白排版
// =============================================================================
const EncodingScene: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const T = getTimestamps(fps);
  if (frame < T.act2_start || frame >= T.act3_start) return null;

  const p = interpolate(frame, [T.act2_start, T.act2_two_methods], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const isTwoMethods = frame >= T.act2_two_methods;

  // 4 行 5 列格网数据（Row 0,1: 全林地; Row 2,3: 全水体）
  const gridRows = [
    [LAND, LAND, LAND, LAND, LAND],
    [LAND, LAND, LAND, LAND, LAND],
    [WATER, WATER, WATER, WATER, WATER],
    [WATER, WATER, WATER, WATER, WATER],
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: SERIF }}>
      <Echo
        text={!isTwoMethods ? '一个格子，一个值：逐格重复太多' : '重复，正是可以被压缩的空间'}
        sub={!isTwoMethods ? '逐格存储正在浪费空间' : '一维按行扫描连续性 · 二维全域均质性'}
        progress={enterAt(frame, !isTwoMethods ? T.act2_start : T.act2_two_methods, fps)}
      />

      <div style={{ position: 'absolute', left: 100, right: 100, top: 170, bottom: 90, display: 'flex', gap: 32 }}>
        {/* 左侧：低效逐格机械存储 (4 行 5 列 = 20 个独立记录) */}
        <div
          style={{
            flex: 1,
            background: palette.paperLight,
            borderRadius: 24,
            border: `3px solid ${palette.clay}`,
            boxShadow: `0 20px 50px ${palette.clay}18`,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 26, fontWeight: 800, color: palette.clay }}>
              低效逐格存储 (4行 × 5列)
            </span>
            <span
              style={{
                fontSize: 16,
                color: palette.clay,
                fontWeight: 800,
                background: palette.clay + '20',
                padding: '4px 12px',
                borderRadius: 8,
              }}
            >
              未压缩原始状态
            </span>
          </div>

          {/* 4x5 像元网格 */}
          <div
            style={{
              height: 390,
              display: 'grid',
              gridTemplateRows: 'repeat(4, 1fr)',
              gap: 10,
              margin: '12px 0',
            }}
          >
            {gridRows.map((row, r) => (
              <div key={r} style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
                {row.map((color, c) => {
                  const isLand = color === LAND;
                  return (
                    <div
                      key={c}
                      style={{
                        background: color,
                        borderRadius: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: palette.paperLight,
                        fontSize: 20,
                        fontWeight: 900,
                        boxShadow: '0 3px 8px rgba(0,0,0,0.12)',
                      }}
                    >
                      <span>{isLand ? '林地' : '水体'}</span>
                      <span style={{ fontSize: 13, opacity: 0.85, fontFamily: MONO }}>
                        [{isLand ? '0x01' : '0x02'}]
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div
            style={{
              background: palette.clay + '18',
              border: `2px solid ${palette.clay}40`,
              borderRadius: 16,
              padding: '14px 20px',
              fontSize: 22,
              fontWeight: 800,
              color: palette.clay,
              textAlign: 'center',
            }}
          >
            📋 20 个像元 / 20 条独立重复存储记录
          </div>
        </div>

        {/* 右侧：两大空间编码破局 (大字号，满格无留白) */}
        {isTwoMethods ? (
          <div style={{ flex: 1.3, display: 'flex', flexDirection: 'column', gap: 20, opacity: p }}>
            {/* 上区域：一维连续性 · 游程编码 */}
            <div
              style={{
                flex: 1.2,
                background: palette.paperLight,
                borderRadius: 24,
                border: `3px solid ${LAND}`,
                boxShadow: `0 16px 40px ${LAND}18`,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 26, fontWeight: 800, color: LAND }}>
                  一维连续性 · 逐行游程编码 (Run-Length)
                </span>
                <span style={{ fontSize: 16, background: LAND + '20', color: LAND, padding: '4px 12px', borderRadius: 8, fontWeight: 800 }}>
                  光栅扫描线按行打包
                </span>
              </div>

              {/* 逐行游程流 (大字号展示) */}
              <div
                style={{
                  background: palette.paper,
                  borderRadius: 16,
                  padding: '16px 24px',
                  border: `2px dashed ${LAND}50`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  margin: '10px 0',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 24, fontWeight: 800, color: LAND }}>
                  <span>第 1 行 (全林地): <Latex math="(\text{林地}, 5)" style={{ fontSize: 26 }} /></span>
                  <span>第 2 行 (全林地): <Latex math="(\text{林地}, 5)" style={{ fontSize: 26 }} /></span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 24, fontWeight: 800, color: WATER }}>
                  <span>第 3 行 (全水体): <Latex math="(\text{水体}, 5)" style={{ fontSize: 26 }} /></span>
                  <span>第 4 行 (全水体): <Latex math="(\text{水体}, 5)" style={{ fontSize: 26 }} /></span>
                </div>
              </div>

              <div style={{ fontSize: 20, color: palette.inkSoft, fontWeight: 700, lineHeight: 1.4 }}>
                💡 <strong>核心规则</strong>：游程编码沿扫描线<strong>逐行独立归并</strong>，绝不跨行乱拼！20 条记录压缩为 4 个二元组。
              </div>
            </div>

            {/* 下区域：二维自适应分治 · 四叉树编码 */}
            <div
              style={{
                flex: 1,
                background: palette.paperLight,
                borderRadius: 24,
                border: `3px solid ${WATER}`,
                boxShadow: `0 16px 40px ${WATER}18`,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 26, fontWeight: 800, color: WATER }}>
                  二维自适应分治 · 四叉树编码 (Quadtree)
                </span>
                <span style={{ fontSize: 16, background: WATER + '20', color: WATER, padding: '4px 12px', borderRadius: 8, fontWeight: 800 }}>
                  全域二维均质识别
                </span>
              </div>

              <div
                style={{
                  background: palette.paper,
                  borderRadius: 16,
                  padding: '16px 24px',
                  border: `2px dashed ${WATER}50`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 100, height: 74 }}>
                  <div style={{ flex: 1, background: LAND, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 15, fontWeight: 900 }}>纯林地块</div>
                  <div style={{ flex: 1, background: WATER, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 15, fontWeight: 900 }}>纯水体块</div>
                </div>

                <div style={{ fontSize: 21, color: palette.ink, fontWeight: 700, textAlign: 'right', lineHeight: 1.4 }}>
                  超越扫描线限制，二维识别更大均质面！<br />
                  上半区纯林地、下半区纯水体 $\rightarrow$ 仅需 2 个节点
                </div>
              </div>

              <div style={{ fontSize: 20, color: WATER, fontWeight: 800 }}>
                🚀 适合多尺度复杂地形与 Web 地图切片调度！
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              flex: 1.3,
              background: palette.paperLight + '66',
              borderRadius: 24,
              border: `2px dashed ${palette.ink}25`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: palette.inkSoft + '70',
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            等待编码破局比对...
          </div>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// Scene 3: 游程编码 —— 大字号烧烤点单与 5x5 GIS 扫描
// =============================================================================
const RleScene: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const T = getTimestamps(fps);
  if (frame < T.act3_start || frame >= T.act4_start) return null;

  const gridMode = frame >= T.act3_grid_5x5;
  const scan = interpolate(frame, [T.act3_scan_row1, T.act3_scan_rest + fps * 2], [0, 5], clamp);
  const scanRow = Math.min(4, Math.floor(scan));
  const fast = enterAt(frame, T.act3_kebab_fast, fps);
  const slowCount = Math.round(interpolate(frame, [T.act3_kebab_slow, T.act3_kebab_fast], [1, 10], clamp));

  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: SERIF }}>
      <Echo
        text={!gridMode ? (frame < T.act3_kebab_fast ? '一个、一个、再一个……' : '十串羊肉串，一句话就够') : '从左到右，从上到下'}
        sub={!gridMode ? '相同内容 × 连续次数' : `正在读取第 ${Math.min(5, scanRow + 1)} 行光栅扫描线`}
        progress={enterAt(frame, gridMode ? T.act3_grid_5x5 : T.act3_start, fps)}
        tone={gridMode ? WATER : palette.amber}
      />

      <div style={{ position: 'absolute', left: 100, right: 100, top: 170, bottom: 90 }}>
        {!gridMode ? (
          /* 生活化烧烤点单比喻 (大字号) */
          <div style={{ display: 'flex', gap: 32, height: '100%' }}>
            {/* 左侧：逐串机械点单 */}
            <div
              style={{
                flex: 1,
                background: palette.paperLight,
                borderRadius: 24,
                border: `3px solid ${palette.clay}`,
                boxShadow: `0 20px 50px ${palette.clay}18`,
                padding: 28,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <span style={{ fontSize: 28, fontWeight: 800, color: palette.clay }}>
                    逐串点单（逐像元低效记录）
                  </span>
                  <span style={{ background: palette.clay + '20', color: palette.clay, padding: '4px 14px', borderRadius: 8, fontSize: 18, fontWeight: 800 }}>
                    10 次重复操作
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                  {Array.from({ length: slowCount }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        background: palette.paper,
                        border: `2px solid ${palette.clay}30`,
                        borderRadius: 14,
                        padding: '14px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        fontSize: 22,
                        fontWeight: 700,
                      }}
                    >
                      <span style={{ fontSize: 28 }}>🍢</span>
                      <span>第 {i + 1} 串：羊肉串</span>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  background: palette.clay + '18',
                  border: `2px solid ${palette.clay}40`,
                  borderRadius: 16,
                  padding: '16px 20px',
                  fontSize: 22,
                  fontWeight: 800,
                  color: palette.clay,
                  textAlign: 'center',
                }}
              >
                ⚠️ “老板，来一串羊肉串，再来一串，还要一串...” —— 极度繁琐！
              </div>
            </div>

            {/* 右侧：游程压缩点单 */}
            <div
              style={{
                flex: 1,
                background: palette.paperLight,
                borderRadius: 24,
                border: `3px solid ${palette.sage}`,
                boxShadow: `0 20px 50px ${palette.sage}18`,
                padding: 28,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <span style={{ fontSize: 28, fontWeight: 800, color: palette.sage }}>
                    游程压缩（提炼游程二元组）
                  </span>
                  <span style={{ background: palette.sage + '20', color: palette.sage, padding: '4px 14px', borderRadius: 8, fontSize: 18, fontWeight: 800 }}>
                    节省 90% 开销
                  </span>
                </div>

                {frame >= T.act3_kebab_fast && (
                  <div
                    style={{
                      background: palette.paper,
                      border: `3px dashed ${palette.sage}60`,
                      borderRadius: 22,
                      padding: '44px 28px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 24,
                      marginTop: 20,
                      opacity: fast,
                      transform: `scale(${0.9 + fast * 0.1})`,
                    }}
                  >
                    <div style={{ fontSize: 72 }}>🍢 × 10</div>
                    <div
                      style={{
                        background: palette.sage,
                        color: palette.paperLight,
                        padding: '16px 48px',
                        borderRadius: 20,
                        fontSize: 38,
                        fontWeight: 900,
                        boxShadow: '0 10px 24px rgba(82,116,95,0.4)',
                      }}
                    >
                      <Latex math="(\text{羊肉串}, 10)" />
                    </div>
                  </div>
                )}
              </div>

              <div
                style={{
                  background: palette.sage + '18',
                  border: `2px solid ${palette.sage}40`,
                  borderRadius: 16,
                  padding: '16px 20px',
                  fontSize: 22,
                  fontWeight: 800,
                  color: palette.sage,
                  textAlign: 'center',
                }}
              >
                ✨ “老板，直接来 10 串羊肉串！” —— 一键打包为单个二元组！
              </div>
            </div>
          </div>
        ) : (
          /* 5x5 真实 GIS 光栅扫描 (大字号展板) */
          <div style={{ display: 'flex', gap: 32, height: '100%' }}>
            {/* 左侧：5x5 栅格与激光扫描 */}
            <div
              style={{
                flex: 1.1,
                background: palette.paperLight,
                borderRadius: 24,
                border: `3px solid ${palette.sage}`,
                boxShadow: `0 20px 50px ${palette.sage}18`,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 26, fontWeight: 800, color: palette.ink }}>
                  5×5 地物空间栅格（中心 3×3 湖泊）
                </span>
                <span style={{ fontSize: 16, color: palette.sage, fontWeight: 800, background: palette.sage + '20', padding: '4px 12px', borderRadius: 8 }}>
                  光栅扫描中
                </span>
              </div>

              {/* 5x5 网格主体 */}
              <div
                style={{
                  height: 420,
                  display: 'grid',
                  gridTemplateRows: 'repeat(5, 1fr)',
                  gap: 8,
                  margin: '12px 0',
                }}
              >
                {[
                  [0, 0, 0, 0, 0],
                  [0, 1, 1, 1, 0],
                  [0, 1, 1, 1, 0],
                  [0, 1, 1, 1, 0],
                  [0, 0, 0, 0, 0],
                ].map((row, rIdx) => {
                  const isCurRow = rIdx === scanRow;
                  return (
                    <div
                      key={rIdx}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(5, 1fr)',
                        gap: 8,
                        padding: 3,
                        borderRadius: 10,
                        background: isCurRow ? palette.amber + '25' : 'transparent',
                        border: isCurRow ? `2px solid ${palette.amber}` : '2px solid transparent',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {row.map((val, cIdx) => {
                        const isWater = val === 1;
                        return (
                          <div
                            key={cIdx}
                            style={{
                              background: isWater ? WATER : LAND,
                              borderRadius: 6,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: palette.paperLight,
                              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                            }}
                          >
                            <span style={{ fontSize: 22, fontWeight: 900 }}>{isWater ? '水' : '陆'}</span>
                            <span style={{ fontSize: 12, opacity: 0.85, fontFamily: MONO }}>
                              ({rIdx},{cIdx})
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              <div style={{ fontSize: 18, color: palette.inkSoft, textAlign: 'center', fontWeight: 700 }}>
                从左至右 · 自上而下逐行扫描
              </div>
            </div>

            {/* 右侧：动态生成游程二元组数据流 (大字号，排版满格) */}
            <div
              style={{
                flex: 1.25,
                background: palette.paperLight,
                borderRadius: 24,
                border: `3px solid ${palette.sage}`,
                boxShadow: `0 20px 50px ${palette.sage}18`,
                padding: 26,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: 26, fontWeight: 800, color: palette.sage, marginBottom: 16 }}>
                  光栅扫描游程编码流
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {frame >= T.act3_scan_row1 && (
                    <div
                      style={{
                        background: palette.paper,
                        borderRadius: 14,
                        padding: '16px 22px',
                        border: `2px solid ${palette.sage}50`,
                        fontSize: 24,
                        fontWeight: 800,
                        color: palette.sage,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>第 1 行（全陆地）：</span>
                      <Latex math="(\text{陆地}, 5)" style={{ fontSize: 28 }} />
                    </div>
                  )}

                  {frame >= T.act3_scan_row2 && (
                    <div
                      style={{
                        background: palette.paper,
                        borderRadius: 14,
                        padding: '16px 22px',
                        border: `2px solid ${WATER}50`,
                        fontSize: 24,
                        fontWeight: 800,
                        color: WATER,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>第 2 行（陆水交替）：</span>
                      <Latex math="(\text{陆}, 1), (\text{水}, 3), (\text{陆}, 1)" style={{ fontSize: 26 }} />
                    </div>
                  )}

                  {frame >= T.act3_scan_rest && (
                    <>
                      <div
                        style={{
                          background: palette.paper,
                          borderRadius: 14,
                          padding: '16px 22px',
                          border: `2px solid ${WATER}50`,
                          fontSize: 24,
                          fontWeight: 800,
                          color: WATER,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span>第 3-4 行（同第2行）：</span>
                        <Latex math="(\text{陆}, 1), (\text{水}, 3), (\text{陆}, 1)" style={{ fontSize: 26 }} />
                      </div>

                      <div
                        style={{
                          background: palette.paper,
                          borderRadius: 14,
                          padding: '16px 22px',
                          border: `2px solid ${palette.sage}50`,
                          fontSize: 24,
                          fontWeight: 800,
                          color: palette.sage,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span>第 5 行（全陆地）：</span>
                        <Latex math="(\text{陆地}, 5)" style={{ fontSize: 28 }} />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* 压缩比对比条 (大字号) */}
              <div
                style={{
                  background: palette.amber + '18',
                  border: `2px solid ${palette.amber}50`,
                  borderRadius: 18,
                  padding: '18px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: 15, color: palette.inkSoft, fontWeight: 700 }}>原始阵列像元</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: palette.ink, fontFamily: MONO }}>
                    25 个像元
                  </div>
                </div>
                <span style={{ fontSize: 28, color: palette.amber }}>➔</span>
                <div>
                  <div style={{ fontSize: 15, color: palette.inkSoft, fontWeight: 700 }}>游程压缩后</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: palette.amber, fontFamily: MONO }}>
                    11 个游程二元组
                  </div>
                </div>
                <div
                  style={{
                    background: palette.amber,
                    color: palette.paperLight,
                    padding: '8px 18px',
                    borderRadius: 10,
                    fontSize: 20,
                    fontWeight: 900,
                  }}
                >
                  体积 -56%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// Scene 4: 四叉树编码 —— 准确交界线 (仅 NE 混合，NW/SW纯陆，SE纯水)
// =============================================================================
const QuadScene: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const T = getTimestamps(fps);
  if (frame < T.act4_start || frame >= T.act5_start) return null;

  const split = interpolate(frame, [T.act4_quad_split1, T.act4_quad_check], [0, 1], clamp);
  const recurse = interpolate(frame, [T.act4_quad_recurse, T.act4_quad_recurse + fps * 1.4], [0, 1], clamp);
  const pure = frame >= T.act4_pure_water;
  const pureP = enterAt(frame, T.act4_pure_water, fps);
  const philosophy = frame >= T.act4_philosophy;

  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: SERIF }}>
      <Echo
        text={pure ? '全是水体？看一眼，贴标签，结束' : philosophy ? '细节丰富处花内存，平坦处“划水”' : '同质停止，混合继续一分为四'}
        sub={pure ? '单块记录 · 0 剖分开销' : '二维空间的自适应分治'}
        progress={enterAt(frame, pure ? T.act4_pure_water : philosophy ? T.act4_philosophy : T.act4_start, fps)}
        tone={pure ? WATER : palette.amber}
      />

      <div style={{ position: 'absolute', left: 100, right: 100, top: 170, bottom: 90 }}>
        <svg viewBox="0 0 1720 740" style={{ width: '100%', height: '100%' }}>
          <defs>
            <clipPath id="quadMapClip">
              <rect x="30" y="30" width="720" height="660" rx="16" />
            </clipPath>
          </defs>

          {/* 左侧：准确的水陆交界地图切分 (NW, SW 全纯陆LAND, SE 全纯水WATER, 仅 NE 有水陆混合) */}
          <g clipPath="url(#quadMapClip)" opacity={pure ? 1 - pureP : 1}>
            {/* 背景全铺 LAND */}
            <rect x="30" y="30" width="720" height="660" fill={LAND} />

            {/* 水体 WATER Path：完全覆盖 SE (右下 390~750, 360~690)，并从 NE (右上 390~750, 30~360) 穿过 */}
            <path
              d="M 390 360 L 390 195 C 440 240 500 120 570 30 L 750 30 L 750 690 L 390 690 Z"
              fill={WATER}
            />

            <rect x="30" y="30" width="720" height="660" fill="none" stroke={palette.paperLight} strokeWidth="6" rx="16" />

            {/* 一级 2x2 分割线 */}
            {split > 0 && (
              <g opacity={split}>
                <line x1="390" y1="30" x2="390" y2="690" stroke={palette.paperLight} strokeWidth="5" />
                <line x1="30" y1="360" x2="750" y2="360" stroke={palette.paperLight} strokeWidth="5" />
              </g>
            )}

            {/* 二级 4x4 递归细分线 (仅在 NE 象限 390~750, 30~360 内部细分) */}
            {recurse > 0 && (
              <g opacity={recurse}>
                <line x1="570" y1="30" x2="570" y2="360" stroke={palette.paperLight} strokeWidth="3" />
                <line x1="390" y1="195" x2="750" y2="195" stroke={palette.paperLight} strokeWidth="3" />
              </g>
            )}
          </g>

          {/* 全纯色纯水展示 */}
          {pure && (
            <g opacity={pureP}>
              <rect x="30" y="30" width="720" height="660" fill={WATER} rx="16" />
              <rect x="30" y="30" width="720" height="660" fill="none" stroke={palette.paperLight} strokeWidth="6" rx="16" />
              <circle cx="390" cy="360" r="75" fill={palette.paperLight} />
              <text x="390" y="378" textAnchor="middle" fontFamily={SERIF} fontSize="46" fontWeight="900" fill={WATER}>
                水
              </text>
            </g>
          )}

          {/* 右侧：四叉树拓扑树 (排版工整，大字号，无遮挡) */}
          <g transform="translate(860 30)">
            <rect x="0" y="0" width="830" height="660" fill={palette.paperLight} rx="20" stroke={palette.amber} strokeWidth="3" />
            <text x="40" y="52" fontFamily={SERIF} fontSize="28" fontWeight="800" fill={palette.ink}>
              四叉树分层拓扑索引结构
            </text>

            <line
              x1="415"
              y1="130"
              x2="120"
              y2="270"
              stroke={palette.ink}
              strokeWidth="4"
              opacity={pure ? 1 - pureP : split}
            />
            <line
              x1="415"
              y1="130"
              x2="310"
              y2="270"
              stroke={palette.ink}
              strokeWidth="4"
              opacity={pure ? 1 - pureP : split}
            />
            <line
              x1="415"
              y1="130"
              x2="520"
              y2="270"
              stroke={palette.ink}
              strokeWidth="4"
              opacity={pure ? 1 - pureP : split}
            />
            <line
              x1="415"
              y1="130"
              x2="710"
              y2="270"
              stroke={palette.ink}
              strokeWidth="4"
              opacity={pure ? 1 - pureP : split}
            />

            {/* 根节点 */}
            <circle cx="415" cy="130" r="48" fill={pure ? WATER : palette.amber} />
            <text x="415" y="143" textAnchor="middle" fontFamily={SERIF} fontSize="32" fontWeight="900" fill="#fff">
              {pure ? '水' : '根'}
            </text>

            {!pure &&
              [
                [120, '陆', LAND, '西北 (纯)'],
                [310, '陆', LAND, '西南 (纯)'],
                [520, '混', ALERT, '东北 (细分)'],
                [710, '水', WATER, '东南 (纯)'],
              ].map(([x, t, c, label], i) => (
                <g key={i} opacity={split}>
                  <circle cx={Number(x)} cy="270" r="38" fill={String(c)} />
                  <text x={Number(x)} y="281" textAnchor="middle" fontFamily={SERIF} fontSize="26" fontWeight="900" fill="#fff">
                    {String(t)}
                  </text>
                  <text x={Number(x)} y="332" textAnchor="middle" fontFamily={SERIF} fontSize="18" fontWeight="800" fill={palette.inkSoft}>
                    {String(label)}
                  </text>
                </g>
              ))}

            {/* 二级叶子节点分支 */}
            {!pure && recurse > 0 && (
              <g opacity={recurse}>
                {[440, 490, 550, 600].map((x, i) => (
                  <React.Fragment key={i}>
                    <line x1="520" y1="345" x2={x} y2="430" stroke={ALERT} strokeWidth="3" strokeDasharray="4 4" />
                    <rect x={x - 22} y="430" width="44" height="44" rx="8" fill={i % 2 ? WATER : LAND} />
                    <text x={x} y="459" textAnchor="middle" fontFamily={SERIF} fontSize="20" fontWeight="900" fill="#fff">
                      {i % 2 ? '水' : '陆'}
                    </text>
                  </React.Fragment>
                ))}
              </g>
            )}

            {/* 底部中文节点信息面板 */}
            <rect x="40" y="555" width="750" height="60" rx="14" fill={palette.amber + '18'} stroke={palette.amber + '40'} strokeWidth="2" />
            <text x="65" y="593" fontFamily={SERIF} fontSize="22" fontWeight="800" fill={palette.ink}>
              💡 索引节点总数：
              <tspan fill={palette.amber} fontFamily={MONO} fontSize="28" fontWeight="900" dx="12">
                {pure ? '1' : `${recurse > 0.5 ? 9 : split > 0.5 ? 5 : 1}`}
              </tspan>
              <tspan fill={palette.ink} fontFamily={SERIF} fontSize="22" fontWeight="800" dx="8">
                个节点
              </tspan>
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
};

// =============================================================================
// Scene 5: 现代工程结晶 —— 栅格金字塔与地图瓦片调度 (大字号展板)
// =============================================================================
const PyramidScene: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const T = getTimestamps(fps);
  if (frame < T.act5_start) return null;

  const p = enterAt(frame, T.act5_start, fps);
  const zoom = interpolate(frame, [T.act5_viewport_zoom, T.end], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });

  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: SERIF }}>
      <Echo
        text={zoom < 0.2 ? '全局看粗块，放大才取细节' : '视口移动，高精瓦片随之接力'}
        sub={zoom < 0.2 ? '宏观调用粗粒度 · 微观加载高精瓦片' : '只加载屏幕真正看见的区域'}
        progress={p}
        tone={WATER}
      />

      <div style={{ position: 'absolute', left: 100, right: 100, top: 170, bottom: 90, display: 'flex', gap: 32 }}>
        {/* 左侧：3D 分层立体金字塔 */}
        <div
          style={{
            flex: 1.15,
            background: palette.paperLight,
            borderRadius: 24,
            border: `3px solid ${palette.blue}`,
            boxShadow: `0 20px 50px ${palette.blue}18`,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 26, fontWeight: 800, color: palette.blue }}>
              3D 分层栅格金字塔（多尺度模型）
            </span>
            <span style={{ fontSize: 16, color: palette.blue, fontWeight: 800, background: palette.blue + '20', padding: '4px 12px', borderRadius: 8 }}>
              层次索引
            </span>
          </div>

          {/* 3D 金字塔 SVG (大字号标注) */}
          <div style={{ flex: 1, position: 'relative', margin: '10px 0' }}>
            <svg viewBox="0 0 600 340" style={{ width: '100%', height: '100%' }}>
              <line x1="160" y1="35" x2="60" y2="250" stroke={palette.ink + '30'} strokeWidth="1.5" strokeDasharray="4 4" />
              <line x1="160" y1="35" x2="260" y2="250" stroke={palette.ink + '30'} strokeWidth="1.5" strokeDasharray="4 4" />

              {/* L0 Top */}
              <g transform="translate(100, 25)">
                <polygon points="60,0 120,18 60,36 0,18" fill={palette.amber + 'aa'} stroke={palette.amber} strokeWidth="2" />
                <text x="145" y="27" fill={palette.amber} fontFamily={SERIF} fontSize="22" fontWeight="900">
                  顶层 L0 (1×1 全局缩略)
                </text>
              </g>

              {/* L1 Mid */}
              <g transform="translate(55, 105)">
                <polygon points="105,0 210,30 105,60 0,30" fill={palette.sage + '99'} stroke={palette.sage} strokeWidth="2" />
                <line x1="105" y1="0" x2="105" y2="60" stroke="#fff" strokeWidth="1.5" strokeOpacity="0.6" />
                <line x1="0" y1="30" x2="210" y2="30" stroke="#fff" strokeWidth="1.5" strokeOpacity="0.6" />
                <text x="235" y="39" fill={palette.sage} fontFamily={SERIF} fontSize="22" fontWeight="900">
                  中层 L1 (2×2 区域瓦片)
                </text>
              </g>

              {/* L2 High */}
              <g transform="translate(10, 195)">
                <polygon points="150,0 300,44 150,88 0,44" fill={palette.blue + '88'} stroke={palette.blue} strokeWidth="2" />
                <line x1="150" y1="0" x2="150" y2="88" stroke="#fff" strokeWidth="2" strokeOpacity="0.6" />
                <line x1="0" y1="44" x2="300" y2="44" stroke="#fff" strokeWidth="2" strokeOpacity="0.6" />
                <text x="325" y="53" fill={palette.blue} fontFamily={SERIF} fontSize="22" fontWeight="900">
                  底层 L2 (4×4 超精细瓦片)
                </text>
              </g>
            </svg>
          </div>

          <div style={{ textAlign: 'center', fontSize: 22, color: palette.inkSoft, fontWeight: 700 }}>
            <Latex math="\text{金字塔梯度：} 1 : \frac{1}{2} : \frac{1}{4} : \frac{1}{8} \quad \cdots" style={{ fontSize: 22 }} />
          </div>
        </div>

        {/* 右侧：网页地图视口切片动态调度 (大字号展板) */}
        <div
          style={{
            flex: 1.15,
            background: palette.paperLight,
            borderRadius: 24,
            border: `3px solid ${palette.blue}`,
            boxShadow: `0 20px 50px ${palette.blue}18`,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 26, fontWeight: 800, color: palette.blue }}>
              网页地图视口瓦片按需流式调度
            </span>
            <span style={{ fontSize: 16, color: palette.sage, fontWeight: 800, background: palette.sage + '20', padding: '4px 12px', borderRadius: 8 }}>
              动态渲染
            </span>
          </div>

          {/* 视口模拟器 */}
          <div
            style={{
              height: 350,
              background: palette.paper,
              borderRadius: 16,
              border: `2px solid ${palette.ink}25`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              margin: '10px 0',
            }}
          >
            <div
              style={{
                width: '92%',
                height: '88%',
                background: palette.sage + '20',
                borderRadius: 14,
                border: `2px dashed ${palette.ink}30`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: 16,
                position: 'relative',
              }}
            >
              <div style={{ fontSize: 18, color: palette.inkSoft, fontWeight: 800 }}>
                ● 全域低分辨率概览瓦片（微量带宽）
              </div>

              {/* 动态视口高亮窗口 */}
              <div
                style={{
                  alignSelf: 'center',
                  width: 260,
                  height: 140,
                  border: `3.5px solid ${ALERT}`,
                  background: ALERT + '30',
                  borderRadius: 12,
                  boxShadow: '0 0 30px rgba(153,91,73,0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <div
                  style={{
                    background: ALERT,
                    color: palette.paperLight,
                    fontSize: 18,
                    fontWeight: 900,
                    padding: '4px 14px',
                    borderRadius: 6,
                  }}
                >
                  当前用户屏幕视口
                </div>
                <div style={{ fontSize: 20, fontWeight: 900, color: ALERT }}>
                  按需加载 4K 局部高精瓦片
                </div>
              </div>

              <div style={{ fontSize: 18, color: palette.inkSoft, textAlign: 'right', fontWeight: 800 }}>
                视口外高精瓦片不加载、零显存占用 ●
              </div>
            </div>
          </div>

          {/* 性能指标胶囊 (大字号) */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              background: palette.paper,
              padding: '16px 24px',
              borderRadius: 16,
              fontSize: 22,
              fontWeight: 800,
              border: `1px solid ${palette.ink}15`,
            }}
          >
            <span style={{ color: palette.sage }}>● 渲染帧率：稳定 60 FPS</span>
            <span style={{ color: palette.blue }}>● 显存压力: 极低 (16 块瓦片)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const RasterCompressionMotion: React.FC = () => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const scale = width / 1920;
  return (
    <AbsoluteFill style={{ background: palette.paper }}>
      <div
        style={{
          width: 1920,
          height: 1080,
          position: 'relative',
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          overflow: 'hidden',
        }}
      >
        <PaperBackground accent={frame < 6240 ? 'clay' : frame < 9540 ? 'amber' : 'blue'} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(90deg, ${palette.paper}00 55%, ${palette.paper}88 100%)`,
          }}
        />
        <CapacityScene frame={frame} />
        <EncodingScene frame={frame} />
        <RleScene frame={frame} />
        <QuadScene frame={frame} />
        <PyramidScene frame={frame} />
        <ChapterHeader frame={frame} />
        <BottomTracker frame={frame} />
      </div>
    </AbsoluteFill>
  );
};
