import React, { useMemo } from 'react';
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

// =============================================================================
// 精确音频时间戳（基于 60 FPS，起点 00:06:03,200 = 363.200s，总长 178.700s / 10722 帧）
// =============================================================================
export const getTimestamps = (fps: number) => {
  const f = (sec: number) => Math.round(sec * fps);
  return {
    start: 0,
    // Act 1: 栅格体量爆炸与矢量转化的死胡同 (134-150)
    act1_start: 0,
    act1_question: f(1.033), // 135: 是不是我们的 GIS 数据类型就已经很自洽了呢
    act1_contradiction: f(5.333), // 137: 其实不然，现在的矢量和栅格分别暴露了一些问题
    act1_raster_explode: f(10.400), // 140: 分辨率一提高，数据量成平方级暴涨
    act1_vector_fail: f(17.466), // 143: 面对高分辨率遥感影像，转成矢量其实不现实
    act1_contour_mess: f(23.366), // 146: 矢量勾勒所有细节，文件大概率比影像还大
    act1_question_card: f(32.100), // 149: 怎么在不丢精度的前提下给庞大的栅格数据瘦身？

    // Act 2: 空间冗余与两大编码之道 (151-156)
    act2_start: f(38.200), // 151: 存储栅格数据，一个格子一个格子存，太费空间了
    act2_two_methods: f(43.400), // 154: 工程师采用其他编码方式：游程编码与四叉树编码

    // Act 3: 游程编码 —— 一维空间连续性压缩 (157-181)
    act3_start: f(52.133), // 157: 先说游程编码，把大片连续像素整合起来存储
    act3_kebab_order: f(58.566), // 159: 就像你在点菜一样，老板问你要啥
    act3_kebab_slow: f(63.200), // 162: 我要一个羊肉串，还有一个羊肉串，再要一个...
    act3_kebab_fast: f(70.400), // 166: 直接说我要十串羊肉串就完事了
    act3_grid_5x5: f(73.200), // 167: 比如在5x5格子里，中心3x3是湖，其余是陆地
    act3_scan_row1: f(84.833), // 172: 从左往右从上往下，第一行全是陆地 (陆地, 5)
    act3_scan_row2: f(93.800), // 176: 第二行有水体，先存一格陆地，再存三格水体，最后一格陆地
    act3_scan_rest: f(100.466), // 180: 之后以此类推
    act3_2d_transition: f(102.300), // 181: 一行行扫还是慢，二维数组用二维视角最快

    // Act 4: 四叉树编码 —— 二维自适应层次剖分 (182-200)
    act4_start: f(106.133), // 182: 四叉树编码就是这么干的
    act4_quad_split1: f(113.733), // 185: 海和陆地图，中心点一分为四
    act4_quad_check: f(124.133), // 188: 检查四个小块是否全为同一种地物，是就贴标签不细分
    act4_quad_recurse: f(129.300), // 190: 如果有其他地物，继续一分为四，直到单一为止
    act4_pure_water: f(139.700), // 194: 如果给你一张全是水体的图，根本不需细分直接贴水体标签
    act4_philosophy: f(150.333), // 198: 细节丰富花内存，平坦地方一律划水

    // Act 5: 现代延伸 —— 金字塔与地图瓦片切片 (201-207)
    act5_start: f(158.900), // 201: 四叉树编码是栅格金字塔与网页地图瓦片切片的底层技术
    act5_viewport_zoom: f(167.700), // 204: 全局调用低分辨率字块，放大才加载高分辨率字块，节省渲染与内存
    end: f(178.700),
  };
};

// =============================================================================
// 顶部标题栏
// =============================================================================
const CenteredHeadline: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const T = getTimestamps(fps);

  let eyebrow = '数据模型的物理困境';
  let title = '栅格体量爆炸与矢量转化的死胡同';
  let subtitle = '分辨率提升带来数据量平方级暴涨，强行矢量化导致边界碎片化与体积失控';
  let keyStart = 0;

  if (frame >= T.act2_start && frame < T.act3_start) {
    eyebrow = '空间相关性原理';
    title = '地理空间冗余与空间编码破局';
    subtitle = '打破低效逐格存储，利用空间自相似性构建紧凑空间编码';
    keyStart = T.act2_start;
  } else if (frame >= T.act3_start && frame < T.act4_start) {
    eyebrow = '一维连续性聚合';
    title = '游程编码：点菜的艺术与光栅压缩';
    subtitle =
      frame >= T.act3_grid_5x5
        ? '光栅逐行扫描，将同质像元序列提炼为游程二元组'
        : '生活化点单类比：十串羊肉串的压缩哲学';
    keyStart = frame >= T.act3_grid_5x5 ? T.act3_grid_5x5 : T.act3_start;
  } else if (frame >= T.act4_start && frame < T.act5_start) {
    eyebrow = '二维空间自适应分治';
    title = '四叉树编码：细节与均质的平衡之道';
    subtitle = '细节丰富处倾注内存，平坦均质处一律划水';
    keyStart = T.act4_start;
  } else if (frame >= T.act5_start) {
    eyebrow = '四叉树的现代工程结晶';
    title = '栅格金字塔与瓦片切片调度';
    subtitle = '多尺度空间索引：宏观调用粗粒度，微观按需加载高精瓦片';
    keyStart = T.act5_start;
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
        top: 48,
        textAlign: 'center',
        opacity: fade,
        transform: `translateY(${(1 - slideIn) * 20}px)`,
        zIndex: 20,
        fontFamily: SERIF,
      }}
    >
      <div
        style={{
          color: palette.amber,
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: 4,
          marginBottom: 8,
          whiteSpace: 'nowrap',
        }}
      >
        {eyebrow}
      </div>

      <div
        style={{
          color: palette.ink,
          fontSize: 54,
          fontWeight: 700,
          lineHeight: 1.15,
          whiteSpace: 'nowrap',
        }}
      >
        {title}
      </div>

      <div
        style={{
          color: palette.inkSoft,
          fontSize: 24,
          marginTop: 10,
          fontWeight: 600,
          whiteSpace: 'nowrap',
        }}
      >
        {subtitle}
      </div>
    </div>
  );
};

// =============================================================================
// 底部进度导航胶囊
// =============================================================================
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

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 30,
        height: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: SERIF,
        zIndex: 50,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {[
          { id: 1, label: '01. 容量危机' },
          { id: 2, label: '02. 空间冗余' },
          { id: 3, label: '03. 游程编码' },
          { id: 4, label: '04. 四叉树编码' },
          { id: 5, label: '05. 现代金字塔' },
        ].map((item) => {
          const isActive = act === item.id;
          const isPassed = act > item.id;
          return (
            <div
              key={item.id}
              style={{
                padding: '8px 22px',
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
                fontSize: 22,
                fontWeight: 700,
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 9,
                  height: 9,
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

// =============================================================================
// Stage 1: 容量危机与矢量转换死胡同 (0 - 2292 帧)
// =============================================================================
const CapacityCrisisStage: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const T = getTimestamps(fps);

  if (frame >= T.act2_start) return null;

  const enter = spring({ frame, fps, config: { damping: 20, stiffness: 80 } });

  const gridStep =
    frame < T.act1_raster_explode
      ? 8
      : frame < T.act1_vector_fail
        ? 18
        : 36;
  const cellCount = gridStep * gridStep;
  const dataSizeMB = Math.round(
    interpolate(
      frame,
      [T.act1_start, T.act1_raster_explode, T.act1_vector_fail],
      [25, 400, 16384],
      clamp
    )
  );

  return (
    <div
      style={{
        position: 'absolute',
        left: 140,
        right: 140,
        top: 195,
        height: 780,
        opacity: enter,
        transform: `translateY(${(1 - enter) * 25}px)`,
        display: 'flex',
        gap: 36,
        fontFamily: SERIF,
      }}
    >
      {/* 左侧：超大幅遥感矩阵视口 */}
      <div
        style={{
          flex: 1.25,
          background: palette.paperLight,
          borderRadius: 24,
          border: `3px solid ${palette.clay}`,
          boxShadow: `0 24px 60px ${palette.clay}18`,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        <div
          style={{
            padding: '16px 24px',
            background: palette.clay + '15',
            borderBottom: `2px solid ${palette.clay}30`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: palette.clay }} />
            <span style={{ fontSize: 24, fontWeight: 800, color: palette.ink }}>
              遥感卫星影像 · 分辨率裂变探测器
            </span>
          </div>
          <div
            style={{
              padding: '4px 14px',
              borderRadius: 14,
              background: palette.clay,
              color: palette.paperLight,
              fontSize: 16,
              fontWeight: 800,
            }}
          >
            {gridStep} × {gridStep} 像元阵列
          </div>
        </div>

        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <svg viewBox="0 0 600 480" style={{ width: '100%', height: '100%' }}>
            <defs>
              <linearGradient id="st1-land" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#557c60" />
                <stop offset="100%" stopColor="#3b5844" />
              </linearGradient>
              <linearGradient id="st1-water" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#4a708b" />
                <stop offset="100%" stopColor="#254157" />
              </linearGradient>
              <linearGradient id="st1-sand" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#d4a373" />
                <stop offset="100%" stopColor="#ba8252" />
              </linearGradient>
            </defs>

            <rect width="600" height="480" fill="url(#st1-land)" />
            <path
              d="M 0 160 Q 200 240 320 180 T 600 320 L 600 480 L 0 480 Z"
              fill="url(#st1-sand)"
              opacity="0.8"
            />
            <path
              d="M 0 200 Q 220 280 340 210 T 600 350 L 600 480 L 0 480 Z"
              fill="url(#st1-water)"
            />
            <circle cx="160" cy="110" r="70" fill="#2d4233" opacity="0.7" />
            <circle cx="460" cy="90" r="55" fill="#2d4233" opacity="0.7" />

            {Array.from({ length: gridStep + 1 }).map((_, i) => (
              <line
                key={`v-${i}`}
                x1={(i * 600) / gridStep}
                y1={0}
                x2={(i * 600) / gridStep}
                y2={480}
                stroke="#ffffff"
                strokeWidth={gridStep > 20 ? 0.8 : 1.5}
                strokeOpacity={gridStep > 20 ? 0.4 : 0.6}
              />
            ))}
            {Array.from({ length: gridStep + 1 }).map((_, i) => (
              <line
                key={`h-${i}`}
                x1={0}
                y1={(i * 480) / gridStep}
                x2={600}
                y2={(i * 480) / gridStep}
                stroke="#ffffff"
                strokeWidth={gridStep > 20 ? 0.8 : 1.5}
                strokeOpacity={gridStep > 20 ? 0.4 : 0.6}
              />
            ))}
          </svg>

          <div
            style={{
              position: 'absolute',
              bottom: 20,
              left: 20,
              right: 20,
              background: palette.ink + 'e6',
              backdropFilter: 'blur(8px)',
              color: palette.paperLight,
              padding: '14px 24px',
              borderRadius: 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            }}
          >
            <div>
              <div style={{ fontSize: 14, color: palette.inkSoft + 'aa' }}>像元总数</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: palette.amber, fontFamily: MONO }}>
                {cellCount.toLocaleString()} 像素
              </div>
            </div>

            <div style={{ height: 36, width: 2, background: '#ffffff30' }} />

            <div>
              <div style={{ fontSize: 14, color: palette.inkSoft + 'aa' }}>原始存储体量</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#ff7b7b', fontFamily: MONO }}>
                {dataSizeMB > 1024 ? `${(dataSizeMB / 1024).toFixed(1)} GB` : `${dataSizeMB} MB`}
              </div>
            </div>

            <div style={{ height: 36, width: 2, background: '#ffffff30' }} />

            <div
              style={{
                background: frame >= T.act1_raster_explode ? '#ff4d4f' : palette.sage,
                color: palette.paperLight,
                padding: '6px 16px',
                borderRadius: 10,
                fontSize: 16,
                fontWeight: 800,
              }}
            >
              {frame >= T.act1_raster_explode ? '⚠️ 显存承载告急' : '✓ 运行正常'}
            </div>
          </div>
        </div>
      </div>

      {/* 右侧：矢量化死胡同与数学推导 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* 矢量转换失败模拟 */}
        <div
          style={{
            flex: 1.2,
            background: palette.paperLight,
            borderRadius: 24,
            border: `3px solid ${palette.clay}`,
            boxShadow: `0 24px 60px ${palette.clay}15`,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: palette.clay }}>
              矢量化死胡同：锯齿勾勒与边界碎裂
            </div>
            <span style={{ fontSize: 16, color: palette.clay, fontWeight: 700, background: palette.clay + '20', padding: '4px 10px', borderRadius: 8 }}>
              节点过载
            </span>
          </div>

          <div
            style={{
              flex: 1,
              background: palette.paper,
              borderRadius: 16,
              margin: '10px 0',
              border: `2px dashed ${palette.clay}40`,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg viewBox="0 0 400 160" style={{ width: '100%', height: '100%' }}>
              <path
                d="M 30 40 L 90 40 L 90 70 L 150 70 L 150 110 L 230 110 L 230 80 L 310 80 L 310 40 L 370 40 L 370 140 L 30 140 Z"
                fill={palette.clay + '25'}
                stroke={palette.clay}
                strokeWidth="3"
              />
              {[
                [30, 40], [90, 40], [90, 70], [150, 70], [150, 110],
                [230, 110], [230, 80], [310, 80], [310, 40], [370, 40],
                [370, 140], [30, 140],
              ].map(([x, y], idx) => (
                <circle key={idx} cx={x} cy={y} r="5" fill={palette.clay} />
              ))}
            </svg>
          </div>

          <div
            style={{
              background: palette.clay + '18',
              color: palette.clay,
              padding: '10px 16px',
              borderRadius: 12,
              fontSize: 17,
              fontWeight: 800,
              lineHeight: 1.4,
            }}
          >
            ⚠️ 强行勾勒每个像元微边界：产生海量冗余折点，矢量体积反超栅格数倍！
          </div>
        </div>

        {/* 数学规律卡片 */}
        <div
          style={{
            background: palette.paperLight,
            borderRadius: 24,
            border: `3px solid ${palette.amber}`,
            boxShadow: `0 20px 50px ${palette.amber}18`,
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: palette.ink }}>
              空间容量与平方级增长定律
            </span>
            <span style={{ fontSize: 22, fontWeight: 900, color: palette.amber, fontFamily: MONO }}>
              <Latex math="S \propto \mathcal{O}(N^2)" />
            </span>
          </div>

          <div style={{ fontSize: 19, color: palette.inkSoft, lineHeight: 1.45 }}>
            像元分辨率提升为 <Latex math="\frac{1}{k}" /> 时，数据总量按 <Latex math="k^2" /> 暴涨。
            <br />
            核心技术命题：<strong style={{ color: palette.ink }}>如何在不损失精度的前提下，为庞大的栅格数据瘦身？</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// Stage 2: 空间冗余与两大编码之道 (2292 - 3128 帧)
// =============================================================================
const SpatialRedundancyStage: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const T = getTimestamps(fps);

  if (frame < T.act2_start || frame >= T.act3_start) return null;

  const enter = spring({ frame: frame - T.act2_start, fps, config: { damping: 20, stiffness: 80 } });

  return (
    <div
      style={{
        position: 'absolute',
        left: 140,
        right: 140,
        top: 195,
        height: 780,
        opacity: enter,
        transform: `translateY(${(1 - enter) * 25}px)`,
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
        fontFamily: SERIF,
      }}
    >
      {/* 顶部宽幅：低效逐格存储的荒谬冗余 */}
      <div
        style={{
          background: palette.paperLight,
          borderRadius: 24,
          border: `3px solid ${palette.clay}`,
          boxShadow: `0 20px 50px ${palette.clay}18`,
          padding: '24px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: palette.clay }} />
            <span style={{ fontSize: 26, fontWeight: 800, color: palette.clay }}>
              逐格机械存储的荒谬：连续空间中的高度数据冗余
            </span>
          </div>
          <span style={{ fontSize: 18, color: palette.clay, fontWeight: 800 }}>
            ❌ 连续 18 个像元全部机械存储相同的“林地”代码
          </span>
        </div>

        {/* 宽幅像元链条 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 10 }}>
          {Array.from({ length: 24 }).map((_, i) => {
            const isForest = i < 18;
            return (
              <div
                key={i}
                style={{
                  height: 60,
                  borderRadius: 10,
                  background: isForest ? '#52745f' : '#4a708b',
                  color: palette.paperLight,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                }}
              >
                <span style={{ fontSize: 18, fontWeight: 900 }}>{isForest ? '林地' : '水体'}</span>
                <span style={{ fontSize: 12, opacity: 0.8, fontFamily: MONO }}>[0x0{isForest ? '1' : '2'}]</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 底部双翼：两大空间编码架构 */}
      <div style={{ flex: 1, display: 'flex', gap: 32 }}>
        {/* 翼 1：游程编码 */}
        <div
          style={{
            flex: 1,
            background: palette.paperLight,
            borderRadius: 24,
            border: `3px solid ${palette.sage}`,
            boxShadow: `0 20px 50px ${palette.sage}18`,
            padding: 32,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: palette.sage,
                  color: palette.paperLight,
                  fontSize: 26,
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                一
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: palette.sage }}>
                  游程编码
                </div>
                <div style={{ fontSize: 18, color: palette.inkSoft }}>一维空间连续性聚合</div>
              </div>
            </div>

            <div style={{ fontSize: 22, color: palette.ink, lineHeight: 1.6, marginTop: 16 }}>
              沿光栅扫描线，将连续同属性像元序列打包为一个二元组：
              <div
                style={{
                  margin: '16px 0',
                  padding: '12px 20px',
                  background: palette.sage + '18',
                  borderRadius: 12,
                  fontSize: 24,
                  fontWeight: 800,
                  color: palette.sage,
                  textAlign: 'center',
                }}
              >
                <Latex math="(\text{类别代码}, \text{连续长度})" />
              </div>
            </div>
          </div>

          <div style={{ fontSize: 18, color: palette.sage, fontWeight: 700 }}>
            适用场景：大面积同质斑块、一维流式栅格
          </div>
        </div>

        {/* 翼 2：四叉树编码 */}
        <div
          style={{
            flex: 1,
            background: palette.paperLight,
            borderRadius: 24,
            border: `3px solid ${palette.blue}`,
            boxShadow: `0 20px 50px ${palette.blue}18`,
            padding: 32,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: palette.blue,
                  color: palette.paperLight,
                  fontSize: 26,
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                四
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: palette.blue }}>
                  四叉树编码
                </div>
                <div style={{ fontSize: 18, color: palette.inkSoft }}>二维自适应空间分治</div>
              </div>
            </div>

            <div style={{ fontSize: 22, color: palette.ink, lineHeight: 1.6, marginTop: 16 }}>
              以二维全局视角递归四等分空间，构建层次分明的分层索引树：
              <div
                style={{
                  margin: '16px 0',
                  padding: '12px 20px',
                  background: palette.blue + '18',
                  borderRadius: 12,
                  fontSize: 24,
                  fontWeight: 800,
                  color: palette.blue,
                  textAlign: 'center',
                }}
              >
                <Latex math="\text{纯色叶子节点} \quad \leftrightarrow \quad \text{混合分裂节点}" />
              </div>
            </div>
          </div>

          <div style={{ fontSize: 18, color: palette.blue, fontWeight: 700 }}>
            适用场景：多尺度复杂地形、现代网页地图瓦片
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// Stage 3: 游程编码 —— 烧烤点单与 5x5 激光扫描 (3128 - 6368 帧)
// =============================================================================
const RunLengthStage: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const T = getTimestamps(fps);

  if (frame < T.act3_start || frame >= T.act4_start) return null;

  const enter = spring({ frame: frame - T.act3_start, fps, config: { damping: 20, stiffness: 80 } });

  return (
    <div
      style={{
        position: 'absolute',
        left: 140,
        right: 140,
        top: 195,
        height: 780,
        opacity: enter,
        transform: `translateY(${(1 - enter) * 25}px)`,
        fontFamily: SERIF,
      }}
    >
      {frame < T.act3_grid_5x5 ? (
        /* 生活化烧烤点单对照舞台 */
        <div style={{ display: 'flex', gap: 36, height: '100%' }}>
          {/* 左侧：逐串机械点单 */}
          <div
            style={{
              flex: 1,
              background: palette.paperLight,
              borderRadius: 24,
              border: `3px solid ${palette.clay}`,
              boxShadow: `0 20px 50px ${palette.clay}18`,
              padding: 32,
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
                <span style={{ background: palette.clay + '20', color: palette.clay, padding: '4px 12px', borderRadius: 8, fontSize: 16, fontWeight: 800 }}>
                  10 次重复操作
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                {Array.from({ length: 10 }).map((_, i) => {
                  const isVisible = frame >= T.act3_kebab_slow + i * 16;
                  if (!isVisible) return null;
                  return (
                    <div
                      key={i}
                      style={{
                        background: palette.paper,
                        border: `2px solid ${palette.clay}30`,
                        borderRadius: 14,
                        padding: '12px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        fontSize: 22,
                        fontWeight: 700,
                        boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
                      }}
                    >
                      <span style={{ fontSize: 26 }}>🍢</span>
                      <span>第 {i + 1} 串：羊肉串</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div
              style={{
                background: palette.clay + '15',
                color: palette.clay,
                padding: '14px 20px',
                borderRadius: 12,
                fontSize: 20,
                fontWeight: 800,
                textAlign: 'center',
              }}
            >
              ⚠️ “老板，我要一串羊肉串，再要一串，还要一串...” —— 极度繁琐！
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
              padding: 32,
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
                <span style={{ background: palette.sage + '20', color: palette.sage, padding: '4px 12px', borderRadius: 8, fontSize: 16, fontWeight: 800 }}>
                  节省 90% 开销
                </span>
              </div>

              <div
                style={{
                  background: palette.paper,
                  border: `3px dashed ${palette.sage}60`,
                  borderRadius: 20,
                  padding: '40px 30px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 24,
                  marginTop: 20,
                }}
              >
                <div style={{ fontSize: 72 }}>🍢 × 10</div>
                <div
                  style={{
                    background: palette.sage,
                    color: palette.paperLight,
                    padding: '16px 48px',
                    borderRadius: 20,
                    fontSize: 36,
                    fontWeight: 900,
                    boxShadow: '0 10px 24px rgba(82,116,95,0.4)',
                  }}
                >
                  <Latex math="(\text{羊肉串}, 10)" />
                </div>
              </div>
            </div>

            <div
              style={{
                background: palette.sage + '15',
                color: palette.sage,
                padding: '14px 20px',
                borderRadius: 12,
                fontSize: 22,
                fontWeight: 800,
                textAlign: 'center',
              }}
            >
              ✨ “老板，直接来 10 串羊肉串！” —— 一键压缩为单个二元组！
            </div>
          </div>
        </div>
      ) : (
        /* 5x5 真实 GIS 光栅扫描与数据流 */
        <div style={{ display: 'flex', gap: 36, height: '100%' }}>
          {/* 左侧：5x5 栅格与激光扫描 */}
          <div
            style={{
              flex: 1.1,
              background: palette.paperLight,
              borderRadius: 24,
              border: `3px solid ${palette.sage}`,
              boxShadow: `0 20px 50px ${palette.sage}18`,
              padding: 28,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 26, fontWeight: 800, color: palette.ink }}>
                5×5 地物空间栅格（中心 3×3 湖泊）
              </span>
              <span style={{ fontSize: 16, color: palette.sage, fontWeight: 800 }}>
                光栅扫描中
              </span>
            </div>

            {/* 5x5 网格主体 */}
            {(() => {
              const grid = [
                [0, 0, 0, 0, 0],
                [0, 1, 1, 1, 0],
                [0, 1, 1, 1, 0],
                [0, 1, 1, 1, 0],
                [0, 0, 0, 0, 0],
              ];
              const scanProgress = interpolate(
                frame,
                [T.act3_grid_5x5, T.act3_scan_row1, T.act3_scan_row2, T.act3_scan_rest],
                [0, 1, 2, 5],
                clamp
              );
              const currentScanRow = Math.min(4, Math.floor(scanProgress));

              return (
                <div
                  style={{
                    height: 480,
                    display: 'grid',
                    gridTemplateRows: 'repeat(5, 1fr)',
                    gap: 10,
                    position: 'relative',
                  }}
                >
                  {grid.map((row, rIdx) => {
                    const isCurRow = rIdx === currentScanRow;
                    return (
                      <div
                        key={rIdx}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(5, 1fr)',
                          gap: 10,
                          padding: 4,
                          borderRadius: 12,
                          background: isCurRow ? palette.amber + '25' : 'transparent',
                          border: isCurRow ? `2px solid ${palette.amber}` : '2px solid transparent',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {row.map((val, cIdx) => {
                          const isWater = val === 1;
                          return (
                            <div
                              key={cIdx}
                              style={{
                                background: isWater ? '#4a708b' : '#52745f',
                                borderRadius: 8,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: palette.paperLight,
                                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                              }}
                            >
                              <span style={{ fontSize: 24, fontWeight: 900 }}>{isWater ? '水' : '陆'}</span>
                              <span style={{ fontSize: 12, opacity: 0.8, fontFamily: MONO }}>
                                ({rIdx},{cIdx})
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            <div style={{ fontSize: 18, color: palette.inkSoft, textAlign: 'center' }}>
              从左至右 · 自上而下逐行扫描
            </div>
          </div>

          {/* 右侧：生成的游程二元组数据流 */}
          <div
            style={{
              flex: 1.2,
              background: palette.paperLight,
              borderRadius: 24,
              border: `3px solid ${palette.sage}`,
              boxShadow: `0 20px 50px ${palette.sage}18`,
              padding: 32,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: palette.sage, marginBottom: 20 }}>
                动态游程数据流
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {frame >= T.act3_scan_row1 && (
                  <div
                    style={{
                      background: palette.paper,
                      borderRadius: 14,
                      padding: '14px 20px',
                      border: `2px solid ${palette.sage}50`,
                      fontSize: 22,
                      fontWeight: 800,
                      color: palette.sage,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>第 1 行（全陆）：</span>
                    <Latex math="(\text{陆地}, 5)" />
                  </div>
                )}

                {frame >= T.act3_scan_row2 && (
                  <div
                    style={{
                      background: palette.paper,
                      borderRadius: 14,
                      padding: '14px 20px',
                      border: `2px solid ${palette.blue}50`,
                      fontSize: 22,
                      fontWeight: 800,
                      color: palette.blue,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>第 2 行（陆水交替）：</span>
                    <Latex math="(\text{陆}, 1), (\text{水}, 3), (\text{陆}, 1)" />
                  </div>
                )}

                {frame >= T.act3_scan_rest && (
                  <>
                    <div
                      style={{
                        background: palette.paper,
                        borderRadius: 14,
                        padding: '14px 20px',
                        border: `2px solid ${palette.blue}50`,
                        fontSize: 22,
                        fontWeight: 800,
                        color: palette.blue,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>第 3-4 行（同第2行）：</span>
                      <Latex math="(\text{陆}, 1), (\text{水}, 3), (\text{陆}, 1)" />
                    </div>

                    <div
                      style={{
                        background: palette.paper,
                        borderRadius: 14,
                        padding: '14px 20px',
                        border: `2px solid ${palette.sage}50`,
                        fontSize: 22,
                        fontWeight: 800,
                        color: palette.sage,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>第 5 行（全陆）：</span>
                      <Latex math="(\text{陆地}, 5)" />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 压缩比对比条 */}
            <div
              style={{
                background: palette.amber + '18',
                border: `2px solid ${palette.amber}60`,
                borderRadius: 16,
                padding: '18px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: 14, color: palette.inkSoft }}>原始阵列像元</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: palette.ink, fontFamily: MONO }}>
                  25 个像元
                </div>
              </div>
              <span style={{ fontSize: 32 }}>➔</span>
              <div>
                <div style={{ fontSize: 14, color: palette.inkSoft }}>游程压缩后</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: palette.amber, fontFamily: MONO }}>
                  11 个游程对
                </div>
              </div>
              <div
                style={{
                  background: palette.amber,
                  color: palette.paperLight,
                  padding: '8px 18px',
                  borderRadius: 10,
                  fontSize: 18,
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
  );
};

// =============================================================================
// Stage 4: 四叉树编码 —— 二维自适应层次剖分 (6368 - 9534 帧)
// =============================================================================
const QuadtreeStage: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const T = getTimestamps(fps);

  if (frame < T.act4_start || frame >= T.act5_start) return null;

  const enter = spring({ frame: frame - T.act4_start, fps, config: { damping: 20, stiffness: 80 } });

  return (
    <div
      style={{
        position: 'absolute',
        left: 140,
        right: 140,
        top: 195,
        height: 780,
        opacity: enter,
        transform: `translateY(${(1 - enter) * 25}px)`,
        display: 'flex',
        gap: 36,
        fontFamily: SERIF,
      }}
    >
      {/* 左侧：二维空间自适应象限剖分 */}
      <div
        style={{
          flex: 1.1,
          background: palette.paperLight,
          borderRadius: 24,
          border: `3px solid ${palette.amber}`,
          boxShadow: `0 20px 50px ${palette.amber}18`,
          padding: 28,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 26, fontWeight: 800, color: palette.ink }}>
            空间自适应象限剖分（二维分治）
          </span>
          <span style={{ fontSize: 16, color: palette.amber, fontWeight: 800, background: palette.amber + '20', padding: '4px 12px', borderRadius: 8 }}>
            一级剖分 ➔ 二级细分
          </span>
        </div>

        {/* 四象限主图 */}
        <div
          style={{
            height: 480,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: '1fr 1fr',
            gap: 10,
            background: palette.paper,
            padding: 10,
            borderRadius: 18,
            border: `2px solid ${palette.amber}40`,
          }}
        >
          {/* NW */}
          <div
            style={{
              background: '#52745f',
              borderRadius: 12,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: palette.paperLight,
              gap: 6,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            <span style={{ fontSize: 28, fontWeight: 900 }}>西北象限</span>
            <span style={{ fontSize: 18, background: '#ffffff30', padding: '2px 10px', borderRadius: 6 }}>
              纯陆地 · 停止细分
            </span>
          </div>

          {/* NE */}
          {frame < T.act4_quad_recurse ? (
            <div
              style={{
                background: palette.clay + '25',
                border: `3px dashed ${palette.clay}`,
                borderRadius: 12,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: palette.clay,
                gap: 6,
              }}
            >
              <span style={{ fontSize: 28, fontWeight: 900 }}>东北象限</span>
              <span style={{ fontSize: 18, background: palette.clay, color: palette.paperLight, padding: '2px 10px', borderRadius: 6 }}>
                混合象限 · 继续剖分
              </span>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gridTemplateRows: '1fr 1fr',
                gap: 6,
                background: palette.clay + '20',
                borderRadius: 12,
                padding: 6,
                border: `2px solid ${palette.clay}`,
              }}
            >
              <div style={{ background: '#52745f', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: palette.paperLight, fontSize: 20, fontWeight: 900 }}>陆</div>
              <div style={{ background: '#4a708b', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: palette.paperLight, fontSize: 20, fontWeight: 900 }}>水</div>
              <div style={{ background: '#52745f', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: palette.paperLight, fontSize: 20, fontWeight: 900 }}>陆</div>
              <div style={{ background: '#4a708b', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: palette.paperLight, fontSize: 20, fontWeight: 900 }}>水</div>
            </div>
          )}

          {/* SW */}
          <div
            style={{
              background: '#52745f',
              borderRadius: 12,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: palette.paperLight,
              gap: 6,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            <span style={{ fontSize: 28, fontWeight: 900 }}>西南象限</span>
            <span style={{ fontSize: 18, background: '#ffffff30', padding: '2px 10px', borderRadius: 6 }}>
              纯陆地 · 停止细分
            </span>
          </div>

          {/* SE */}
          <div
            style={{
              background: '#4a708b',
              borderRadius: 12,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: palette.paperLight,
              gap: 6,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            <span style={{ fontSize: 28, fontWeight: 900 }}>东南象限</span>
            <span style={{ fontSize: 18, background: '#ffffff30', padding: '2px 10px', borderRadius: 6 }}>
              纯水体 · 停止细分
            </span>
          </div>
        </div>

        <div style={{ fontSize: 18, color: palette.inkSoft, textAlign: 'center' }}>
          同质块直接贴属性标签 · 仅对混合边界进行深度细分
        </div>
      </div>

      {/* 右侧：拓扑树状图 */}
      <div
        style={{
          flex: 1.2,
          background: palette.paperLight,
          borderRadius: 24,
          border: `3px solid ${palette.amber}`,
          boxShadow: `0 20px 50px ${palette.amber}18`,
          padding: 28,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 26, fontWeight: 800, color: palette.amber }}>
            四叉树分层拓扑索引结构
          </span>
          <span style={{ fontSize: 20, fontWeight: 800, color: palette.amber, fontFamily: MONO }}>
            <Latex math="\mathcal{O}(\log N)" />
          </span>
        </div>

        {/* 拓扑 SVG 树 */}
        <div style={{ flex: 1, position: 'relative', margin: '16px 0' }}>
          <svg viewBox="0 0 500 320" style={{ width: '100%', height: '100%' }}>
            {/* 根节点 */}
            <circle cx="250" cy="35" r="22" fill={palette.amber} />
            <text x="250" y="42" textAnchor="middle" fill={palette.paperLight} fontFamily={SERIF} fontSize="18" fontWeight="900">
              根
            </text>

            {/* Level 1 连线 */}
            <line x1="250" y1="57" x2="90" y2="120" stroke={palette.ink} strokeWidth="2.5" />
            <line x1="250" y1="57" x2="190" y2="120" stroke={palette.ink} strokeWidth="2.5" />
            <line x1="250" y1="57" x2="310" y2="120" stroke={palette.ink} strokeWidth="2.5" />
            <line x1="250" y1="57" x2="410" y2="120" stroke={palette.ink} strokeWidth="2.5" />

            {/* Level 1 节点 */}
            {/* NW */}
            <rect x="65" y="120" width="50" height="36" rx="8" fill="#52745f" />
            <text x="90" y="144" textAnchor="middle" fill={palette.paperLight} fontFamily={SERIF} fontSize="18" fontWeight="900">陆</text>
            <text x="90" y="176" textAnchor="middle" fill={palette.inkSoft} fontFamily={SERIF} fontSize="14" fontWeight="700">西北(纯)</text>

            {/* SW */}
            <rect x="165" y="120" width="50" height="36" rx="8" fill="#52745f" />
            <text x="190" y="144" textAnchor="middle" fill={palette.paperLight} fontFamily={SERIF} fontSize="18" fontWeight="900">陆</text>
            <text x="190" y="176" textAnchor="middle" fill={palette.inkSoft} fontFamily={SERIF} fontSize="14" fontWeight="700">西南(纯)</text>

            {/* NE (Mixed) */}
            <circle cx="310" cy="138" r="20" fill={palette.clay} />
            <text x="310" y="145" textAnchor="middle" fill={palette.paperLight} fontFamily={SERIF} fontSize="18" fontWeight="900">混</text>
            {frame < T.act4_quad_recurse && (
              <text x="310" y="176" textAnchor="middle" fill={palette.clay} fontFamily={SERIF} fontSize="14" fontWeight="800">东北(裂变)</text>
            )}

            {/* SE */}
            <rect x="385" y="120" width="50" height="36" rx="8" fill="#4a708b" />
            <text x="410" y="144" textAnchor="middle" fill={palette.paperLight} fontFamily={SERIF} fontSize="18" fontWeight="900">水</text>
            <text x="410" y="176" textAnchor="middle" fill={palette.inkSoft} fontFamily={SERIF} fontSize="14" fontWeight="700">东南(纯)</text>

            {/* Level 2 子树 */}
            {frame >= T.act4_quad_recurse && (
              <g>
                <line x1="310" y1="158" x2="235" y2="230" stroke={palette.clay} strokeWidth="2" strokeDasharray="4 4" />
                <line x1="310" y1="158" x2="285" y2="230" stroke={palette.clay} strokeWidth="2" strokeDasharray="4 4" />
                <line x1="310" y1="158" x2="335" y2="230" stroke={palette.clay} strokeWidth="2" strokeDasharray="4 4" />
                <line x1="310" y1="158" x2="385" y2="230" stroke={palette.clay} strokeWidth="2" strokeDasharray="4 4" />

                <rect x="215" y="230" width="40" height="30" rx="6" fill="#52745f" />
                <text x="235" y="251" textAnchor="middle" fill={palette.paperLight} fontFamily={SERIF} fontSize="15" fontWeight="900">陆</text>

                <rect x="265" y="230" width="40" height="30" rx="6" fill="#4a708b" />
                <text x="285" y="251" textAnchor="middle" fill={palette.paperLight} fontFamily={SERIF} fontSize="15" fontWeight="900">水</text>

                <rect x="315" y="230" width="40" height="30" rx="6" fill="#52745f" />
                <text x="335" y="251" textAnchor="middle" fill={palette.paperLight} fontFamily={SERIF} fontSize="15" fontWeight="900">陆</text>

                <rect x="365" y="230" width="40" height="30" rx="6" fill="#4a708b" />
                <text x="385" y="251" textAnchor="middle" fill={palette.paperLight} fontFamily={SERIF} fontSize="15" fontWeight="900">水</text>
              </g>
            )}
          </svg>
        </div>

        {/* 哲学真理标语 */}
        <div
          style={{
            background: palette.amber + '18',
            border: `2px solid ${palette.amber}50`,
            borderRadius: 16,
            padding: '16px 20px',
            fontSize: 20,
            fontWeight: 800,
            color: palette.ink,
            textAlign: 'center',
          }}
        >
          💡 “细节丰富处倾注内存，平坦均质处一律划水” —— 空间效率的终极平衡！
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// Stage 5: 现代延伸 —— 栅格金字塔与瓦片切片 (9534 - 10722 帧)
// =============================================================================
const RasterPyramidStage: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const T = getTimestamps(fps);

  if (frame < T.act5_start) return null;

  const enter = spring({ frame: frame - T.act5_start, fps, config: { damping: 20, stiffness: 80 } });

  return (
    <div
      style={{
        position: 'absolute',
        left: 140,
        right: 140,
        top: 195,
        height: 780,
        opacity: enter,
        transform: `translateY(${(1 - enter) * 25}px)`,
        display: 'flex',
        gap: 36,
        fontFamily: SERIF,
      }}
    >
      {/* 左侧：3D 分层立体金字塔 */}
      <div
        style={{
          flex: 1.15,
          background: palette.paperLight,
          borderRadius: 24,
          border: `3px solid ${palette.blue}`,
          boxShadow: `0 20px 50px ${palette.blue}18`,
          padding: 28,
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

        {/* 3D 金字塔 SVG */}
        <div style={{ flex: 1, position: 'relative', margin: '10px 0' }}>
          <svg viewBox="0 0 600 360" style={{ width: '100%', height: '100%' }}>
            {/* 虚线连接投影柱 */}
            <line x1="160" y1="40" x2="60" y2="260" stroke={palette.ink + '40'} strokeWidth="1.5" strokeDasharray="4 4" />
            <line x1="160" y1="40" x2="260" y2="260" stroke={palette.ink + '40'} strokeWidth="1.5" strokeDasharray="4 4" />
            <line x1="160" y1="70" x2="160" y2="330" stroke={palette.ink + '40'} strokeWidth="1.5" strokeDasharray="4 4" />

            {/* Level 0 (Top Layer) */}
            <g transform="translate(100, 30)">
              <polygon points="60,0 120,20 60,40 0,20" fill={palette.amber + '99'} stroke={palette.amber} strokeWidth="2" />
              <text x="140" y="26" fill={palette.amber} fontFamily={SERIF} fontSize="17" fontWeight="900">
                顶层 L0 (1×1 全局缩略)
              </text>
            </g>

            {/* Level 1 (Middle Layer) */}
            <g transform="translate(55, 120)">
              <polygon points="105,0 210,32 105,64 0,32" fill={palette.sage + '88'} stroke={palette.sage} strokeWidth="2" />
              <line x1="105" y1="0" x2="105" y2="64" stroke={palette.ink + '60'} strokeWidth="1.5" />
              <line x1="0" y1="32" x2="210" y2="32" stroke={palette.ink + '60'} strokeWidth="1.5" />
              <text x="230" y="38" fill={palette.sage} fontFamily={SERIF} fontSize="17" fontWeight="900">
                中层 L1 (2×2 区域瓦片)
              </text>
            </g>

            {/* Level 2 (Bottom Layer) */}
            <g transform="translate(10, 220)">
              <polygon points="150,0 300,48 150,96 0,48" fill={palette.blue + '77'} stroke={palette.blue} strokeWidth="2" />
              {/* 4x4 网格线 */}
              <line x1="75" y1="24" x2="225" y2="72" stroke={palette.ink + '50'} strokeWidth="1" />
              <line x1="150" y1="0" x2="150" y2="96" stroke={palette.ink + '70'} strokeWidth="2" />
              <line x1="0" y1="48" x2="300" y2="48" stroke={palette.ink + '70'} strokeWidth="2" />
              <line x1="75" y1="72" x2="225" y2="24" stroke={palette.ink + '50'} strokeWidth="1" />
              <text x="320" y="55" fill={palette.blue} fontFamily={SERIF} fontSize="17" fontWeight="900">
                底层 L2 (4×4 超精细瓦片)
              </text>
            </g>
          </svg>
        </div>

        <div style={{ textAlign: 'center', fontSize: 20, color: palette.inkSoft }}>
          <Latex math="\text{尺度缩放梯度：} 1 : \frac{1}{2} : \frac{1}{4} : \frac{1}{8} \quad \cdots" />
        </div>
      </div>

      {/* 右侧：网页地图视口切片动态调度 */}
      <div
        style={{
          flex: 1.15,
          background: palette.paperLight,
          borderRadius: 24,
          border: `3px solid ${palette.blue}`,
          boxShadow: `0 20px 50px ${palette.blue}18`,
          padding: 28,
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
            height: 380,
            background: palette.paper,
            borderRadius: 18,
            border: `2px solid ${palette.ink}30`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* 全域低分底图背景 */}
          <div
            style={{
              width: '90%',
              height: '85%',
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
            <div style={{ fontSize: 16, color: palette.inkSoft, fontWeight: 800 }}>
              ● 全域低分辨率概览瓦片（仅占用微量带宽）
            </div>

            {/* 动态视口高亮窗口 */}
            <div
              style={{
                alignSelf: 'center',
                width: 220,
                height: 140,
                border: `3px solid ${palette.clay}`,
                background: palette.clay + '35',
                borderRadius: 12,
                boxShadow: '0 0 30px rgba(153,91,73,0.5)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <div
                style={{
                  background: palette.clay,
                  color: palette.paperLight,
                  fontSize: 16,
                  fontWeight: 900,
                  padding: '4px 14px',
                  borderRadius: 6,
                }}
              >
                当前用户屏幕视口
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, color: palette.clay }}>
                按需加载 4K 局部高精瓦片
              </div>
            </div>

            <div style={{ fontSize: 16, color: palette.inkSoft, textAlign: 'right', fontWeight: 700 }}>
              视口外高精瓦片不加载、不占用显存 ●
            </div>
          </div>
        </div>

        {/* 性能指标胶囊 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            background: palette.paper,
            padding: '14px 24px',
            borderRadius: 14,
            fontSize: 20,
            fontWeight: 800,
          }}
        >
          <span style={{ color: palette.sage }}>● 渲染吞吐：稳定 60 FPS</span>
          <span style={{ color: palette.blue }}>● 网络吞吐：带宽压力骤降 90%+</span>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// 主组件入口
// =============================================================================
export const RasterCompression: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const T = getTimestamps(fps);

  const scale = width / 1920;

  const accent =
    frame < T.act2_start
      ? 'clay'
      : frame < T.act3_start
        ? 'sage'
        : frame < T.act4_start
          ? 'sage'
          : frame < T.act5_start
            ? 'amber'
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

        <CapacityCrisisStage frame={frame} />
        <SpatialRedundancyStage frame={frame} />
        <RunLengthStage frame={frame} />
        <QuadtreeStage frame={frame} />
        <RasterPyramidStage frame={frame} />

        <BottomTracker frame={frame} />
      </div>
    </AbsoluteFill>
  );
};
