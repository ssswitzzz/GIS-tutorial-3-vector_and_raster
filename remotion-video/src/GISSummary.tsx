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

// =============================================================================
// 精确音频时间戳（基于 60 FPS，起点 00:11:14,900 = 674.900s，总长 64.833s / 3890 帧）
// 字幕 259 - 284
// =============================================================================
export const getTimestamps = (fps: number) => {
  const f = (sec: number) => Math.round(sec * fps);
  return {
    start: 0,
    // Act 1: 现实世界的数字化重构 (259-263) (0.000s -> 10.500s | 0 -> 630 帧)
    act1_start: 0,
    act1_final_intro: f(0.000), // 259: 00:11:14,900 那视频的最后
    act1_look_back: f(1.700), // 260: 00:11:16,600 我们回头看一下
    act1_complex_earth: f(3.466), // 261: 00:11:18,366 面对这个无限复杂的地球
    act1_into_computer: f(6.133), // 262: 00:11:21,033 要把它放到计算机里
    act1_abstract_rebuild: f(7.800), // 263: 00:11:22,700 我们就需要进行抽象和重构

    // Act 2: 栅格数据 —— 连续场的矩阵世界 (264-273) (10.500s -> 36.966s | 630 -> 2218 帧)
    act2_start: f(10.500), // 264: 00:11:25,400 对于降雨、气温、地形等这种没有明确边界的连续场
    act2_raster_data: f(15.600), // 265: 00:11:30,500 我们有栅格数据
    act2_minecraft_world: f(17.466), // 266: 00:11:32,366 它就像是用像素块搭建的 Minecraft 世界
    act2_matrix_nature: f(20.900), // 267: 00:11:35,800 本质是个二维矩阵
    act2_fast_query: f(22.700), // 268: 00:11:37,600 查询速度很快
    act2_map_algebra: f(24.033), // 269: 00:11:38,933 也适合进行代数计算
    act2_resolution_double: f(25.766), // 270: 00:11:40,666 虽然分辨率翻倍的时候
    act2_data_square: f(27.700), // 271: 00:11:42,600 数据量会呈平方级上升
    act2_engineer_encoding: f(30.133), // 272: 00:11:45,033 但工程师们通过不同的编码方式
    act2_optimize_storage: f(33.266), // 273: 00:11:48,166 优化了栅格数据的加载和存储问题

    // Act 3: 矢量数据 —— 离散对象的拓扑跃迁 (274-284) (36.966s -> 64.833s | 2218 -> 3890 帧)
    act3_start: f(36.966), // 274: 00:11:51,866 而对于建筑物、道路、行政区划这种边界分明的离散对象
    act3_vector_data: f(41.833), // 275: 00:11:56,733 我们有矢量数据
    act3_coords_lines_polys: f(43.566), // 276: 00:11:58,466 他用精准的坐标点连成线和面
    act3_infinite_zoom: f(46.733), // 277: 00:12:01,633 放的再大也不会失真
    act3_huge_attributes: f(48.533), // 278: 00:12:03,433 还能连接海量的属性字段
    act3_duplicate_coords: f(51.066), // 279: 00:12:05,966 那为了解决坐标重复存储
    act3_lack_topology: f(53.300), // 280: 00:12:08,200 和缺乏逻辑关系的问题
    act3_arc_node_model: f(55.000), // 281: 00:12:09,900 我们又引入了弧段节点模型
    act3_eliminate_gaps: f(57.600), // 282: 00:12:12,500 不仅消除了图形缝隙
    act3_spatial_relations: f(59.433), // 283: 00:12:14,333 更让计算机理解了要素之间的空间关系
    act3_navigation_possible: f(62.233), // 284: 00:12:17,133 这才有了今天路网导航的可能
    end: f(64.833),
  };
};

const VOXEL_GRID = [
  [2, 3, 4, 3, 2],
  [3, 5, 7, 5, 3],
  [4, 7, 9, 7, 4],
  [3, 5, 7, 5, 3],
  [2, 3, 4, 3, 2],
];

// 计算沿导航折线路径的精确坐标（等速移动）
// 折线顶点：(60,160) -> (220,80) -> (430,80) -> (640,160) -> (790,160)
const getNavPathPoint = (progress: number) => {
  const t = Math.max(0, Math.min(1, progress));
  if (t <= 0.2343) {
    const u = t / 0.2343;
    return {
      x: 60 + (220 - 60) * u,
      y: 160 + (80 - 160) * u,
    };
  } else if (t <= 0.5093) {
    const u = (t - 0.2343) / (0.5093 - 0.2343);
    return {
      x: 220 + (430 - 220) * u,
      y: 80,
    };
  } else if (t <= 0.8036) {
    const u = (t - 0.5093) / (0.8036 - 0.5093);
    return {
      x: 430 + (640 - 430) * u,
      y: 80 + (160 - 80) * u,
    };
  } else {
    const u = (t - 0.8036) / (1.0 - 0.8036);
    return {
      x: 640 + (790 - 640) * u,
      y: 160,
    };
  }
};

// =============================================================================
// 顶部标题栏（思源宋体，优雅过渡，严禁英文副标题）
// =============================================================================
const CenteredHeadline: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const T = getTimestamps(fps);

  let eyebrow = '全篇总结 · 空间信息认知论';
  let title = '面对无限复杂地球的抽象与重构';
  let subtitle = '从连续物理现实到离散二进制存储 · 构筑地理信息科学的两大底层支柱';
  let keyStart = 0;

  if (frame >= T.act2_start && frame < T.act3_start) {
    if (frame < T.act2_resolution_double) {
      eyebrow = '连续场表征范式 · 二维阵列之道';
      title = '栅格数据：像素矩阵与连续空间计算';
      subtitle = '像元矩阵无缝覆盖无边界连续场 · 内存直接寻址与像元代数高效叠加';
      keyStart = T.act2_start;
    } else {
      eyebrow = '空间连续性与维度压缩';
      title = '分辨率平方级挑战与空间编码突破';
      subtitle = '游程编码聚合连通同质序列 · 四叉树金字塔实现多尺度瓦片自适应调度';
      keyStart = T.act2_resolution_double;
    }
  } else if (frame >= T.act3_start) {
    if (frame < T.act3_duplicate_coords) {
      eyebrow = '离散对象表征范式 · 几何与属性映射';
      title = '矢量数据：精准坐标定义与多维属性挂载';
      subtitle = '点线面精准刻画分明实体边界 · 无限放大矢量不失真 · 关联海量属性数据库';
      keyStart = T.act3_start;
    } else {
      eyebrow = '空间图论革命 · 空间拓扑智能';
      title = '弧段-节点模型与现代空间网络导航';
      subtitle = '共享边单次存储杜绝裂隙重叠 · 逻辑关系表赋予计算机原生空间网络理解力';
      keyStart = T.act3_duplicate_coords;
    }
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
        top: 42,
        textAlign: 'center',
        opacity: fade,
        transform: `translateY(${(1 - slideIn) * 20}px)`,
        zIndex: 30,
        fontFamily: SERIF,
      }}
    >
      <div
        style={{
          color: palette.amber,
          fontSize: 30,
          fontWeight: 700,
          letterSpacing: 4,
          marginBottom: 10,
          whiteSpace: 'nowrap',
          textShadow: '0 2px 8px rgba(179,122,66,0.18)',
        }}
      >
        {eyebrow}
      </div>
      <div
        style={{
          color: palette.ink,
          fontSize: 72,
          fontWeight: 900,
          lineHeight: 1.15,
          letterSpacing: -0.5,
          whiteSpace: 'nowrap',
          textShadow: '0 4px 16px rgba(38,53,47,0.12)',
        }}
      >
        {title}
      </div>
      <div
        style={{
          color: palette.inkSoft,
          fontSize: 32,
          fontWeight: 600,
          marginTop: 12,
          letterSpacing: 1,
          whiteSpace: 'nowrap',
        }}
      >
        {subtitle}
      </div>
    </div>
  );
};

// =============================================================================
// Act 1: 现实世界的数字化重构 (Frames 0 -> 630)
// =============================================================================
const DigitalReconstructionStage: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const T = getTimestamps(fps);

  const stageFade = interpolate(
    frame,
    [T.act1_start, T.act1_start + 24, T.act2_start - 20, T.act2_start],
    [0, 1, 1, 0],
    clamp
  );

  if (stageFade <= 0) return null;

  const earthScale = spring({
    frame: frame - T.act1_look_back,
    fps,
    config: { damping: 20, stiffness: 70 },
  });

  const scanProgress = interpolate(
    frame,
    [T.act1_into_computer, T.act1_into_computer + 60],
    [0, 1],
    clamp
  );

  const splitProgress = spring({
    frame: frame - T.act1_abstract_rebuild,
    fps,
    config: { damping: 18, stiffness: 60 },
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: stageFade,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: 1680,
          height: 640,
          marginTop: 140,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* 左侧：连续场概念卡片 (栅格世界) */}
        <div
          style={{
            position: 'absolute',
            left: 20,
            width: 540,
            height: 520,
            borderRadius: 32,
            background: 'rgba(255, 253, 247, 0.94)',
            border: `3px solid ${palette.blueLight}`,
            boxShadow: '0 20px 48px rgba(53, 107, 120, 0.14)',
            padding: 36,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transform: `translateX(${interpolate(splitProgress, [0, 1], [320, 0])}px) scale(${interpolate(splitProgress, [0, 1], [0.8, 1])})`,
            opacity: splitProgress,
            backdropFilter: 'blur(10px)',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-block',
                padding: '8px 20px',
                borderRadius: 20,
                background: palette.blue + '18',
                color: palette.blue,
                fontSize: 30,
                fontWeight: 700,
                fontFamily: SERIF,
                marginBottom: 16,
                whiteSpace: 'nowrap',
              }}
            >
              自然连续场
            </div>
            <div
              style={{
                fontSize: 44,
                fontWeight: 900,
                color: palette.ink,
                fontFamily: SERIF,
                lineHeight: 1.2,
                marginBottom: 12,
                whiteSpace: 'nowrap',
              }}
            >
              无明确边界的物理量
            </div>
            <div
              style={{
                fontSize: 30,
                color: palette.inkSoft,
                fontFamily: SERIF,
                lineHeight: 1.5,
                whiteSpace: 'nowrap',
              }}
            >
              降雨量 · 气温梯度 · 地形高程
            </div>
          </div>

          <div
            style={{
              height: 180,
              borderRadius: 20,
              background: `linear-gradient(135deg, ${palette.blue}15, ${palette.sage}20)`,
              border: `2px dashed ${palette.blue}40`,
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="100%" height="100%" viewBox="0 0 400 180">
              <path
                d="M 0,90 Q 100,30 200,90 T 400,90 L 400,180 L 0,180 Z"
                fill={palette.blue + '25'}
              />
              <path
                d="M 0,110 Q 120,60 220,110 T 400,110 L 400,180 L 0,180 Z"
                fill={palette.sage + '35'}
              />
              {Array.from({ length: 8 }).map((_, r) =>
                Array.from({ length: 16 }).map((_, c) => (
                  <rect
                    key={`rg-${r}-${c}`}
                    x={c * 25}
                    y={r * 22.5}
                    width={24}
                    height={21.5}
                    fill="none"
                    stroke={palette.ink}
                    strokeWidth={1}
                    strokeOpacity={0.12}
                  />
                ))
              )}
            </svg>
            <div
              style={{
                position: 'absolute',
                bottom: 12,
                right: 16,
                padding: '6px 14px',
                borderRadius: 12,
                background: palette.blue,
                color: palette.paperLight,
                fontSize: 30,
                fontWeight: 700,
                fontFamily: SERIF,
                whiteSpace: 'nowrap',
              }}
            >
              栅格抽象
            </div>
          </div>

          <div
            style={{
              fontSize: 30,
              fontWeight: 700,
              color: palette.blue,
              fontFamily: SERIF,
              textAlign: 'center',
              whiteSpace: 'nowrap',
            }}
          >
            空间划分：全域像元矩阵
          </div>
        </div>

        {/* 中央：3D 旋转立体地球 / 数字化全息球体 */}
        <div
          style={{
            width: 440,
            height: 440,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${earthScale})`,
            zIndex: 10,
          }}
        >
          <div
            style={{
              position: 'absolute',
              width: 440,
              height: 440,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${palette.sage}25 0%, ${palette.blue}15 60%, transparent 75%)`,
              filter: 'blur(8px)',
            }}
          />

          <svg
            width="420"
            height="420"
            viewBox="0 0 420 420"
            style={{
              overflow: 'visible',
              filter: 'drop-shadow(0 16px 36px rgba(38,53,47,0.18))',
            }}
          >
            <circle
              cx="210"
              cy="210"
              r="200"
              fill={palette.paperLight}
              stroke={palette.ink}
              strokeWidth="4"
            />

            <g
              transform={`rotate(${frame * 0.25}, 210, 210)`}
              stroke={palette.line}
              strokeWidth="2"
              fill="none"
            >
              <ellipse cx="210" cy="210" rx="198" ry="70" />
              <ellipse cx="210" cy="210" rx="198" ry="140" />
              <ellipse cx="210" cy="210" rx="70" ry="198" />
              <ellipse cx="210" cy="210" rx="140" ry="198" />
              <line x1="10" y1="210" x2="410" y2="210" stroke={palette.sageLight} strokeWidth="3" />
              <line x1="210" y1="10" x2="210" y2="410" stroke={palette.sageLight} strokeWidth="3" />
            </g>

            <path
              d="M 120,150 Q 150,110 200,120 Q 250,130 280,100 Q 310,140 290,190 Q 260,230 210,210 Q 160,230 130,190 Z"
              fill={palette.sage + '35'}
              stroke={palette.sage}
              strokeWidth="3"
            />
            <path
              d="M 160,250 Q 200,230 240,260 Q 260,300 220,330 Q 180,340 150,300 Z"
              fill={palette.amber + '35'}
              stroke={palette.amber}
              strokeWidth="3"
            />

            {scanProgress > 0 && (
              <g>
                <line
                  x1={10 + scanProgress * 400}
                  y1="10"
                  x2={10 + scanProgress * 400}
                  y2="410"
                  stroke={palette.clay}
                  strokeWidth="5"
                  strokeDasharray="6 4"
                />
                <circle
                  cx={10 + scanProgress * 400}
                  cy="210"
                  r="12"
                  fill={palette.clay}
                  filter="drop-shadow(0 0 10px #995b49)"
                />
              </g>
            )}
          </svg>

          <div
            style={{
              position: 'absolute',
              padding: '10px 24px',
              borderRadius: 30,
              background: palette.ink,
              color: palette.paperLight,
              fontSize: 30,
              fontWeight: 800,
              fontFamily: SERIF,
              boxShadow: '0 8px 24px rgba(38,53,47,0.3)',
              border: `2px solid ${palette.paperLight}`,
              whiteSpace: 'nowrap',
            }}
          >
            空间抽象与重构
          </div>
        </div>

        {/* 右侧：离散对象概念卡片 (矢量世界) */}
        <div
          style={{
            position: 'absolute',
            right: 20,
            width: 540,
            height: 520,
            borderRadius: 32,
            background: 'rgba(255, 253, 247, 0.94)',
            border: `3px solid ${palette.sageLight}`,
            boxShadow: '0 20px 48px rgba(82, 116, 95, 0.14)',
            padding: 36,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transform: `translateX(${interpolate(splitProgress, [0, 1], [-320, 0])}px) scale(${interpolate(splitProgress, [0, 1], [0.8, 1])})`,
            opacity: splitProgress,
            backdropFilter: 'blur(10px)',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-block',
                padding: '8px 20px',
                borderRadius: 20,
                background: palette.sage + '18',
                color: palette.sage,
                fontSize: 30,
                fontWeight: 700,
                fontFamily: SERIF,
                marginBottom: 16,
                whiteSpace: 'nowrap',
              }}
            >
              人造离散对象
            </div>
            <div
              style={{
                fontSize: 44,
                fontWeight: 900,
                color: palette.ink,
                fontFamily: SERIF,
                lineHeight: 1.2,
                marginBottom: 12,
                whiteSpace: 'nowrap',
              }}
            >
              边界清晰的地理实体
            </div>
            <div
              style={{
                fontSize: 30,
                color: palette.inkSoft,
                fontFamily: SERIF,
                lineHeight: 1.5,
                whiteSpace: 'nowrap',
              }}
            >
              建筑物 · 交通路网 · 行政区划
            </div>
          </div>

          <div
            style={{
              height: 180,
              borderRadius: 20,
              background: `linear-gradient(135deg, ${palette.sage}15, ${palette.amber}20)`,
              border: `2px dashed ${palette.sage}40`,
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="100%" height="100%" viewBox="0 0 400 180">
              <polyline
                points="30,140 120,60 250,110 370,40"
                fill="none"
                stroke={palette.amber}
                strokeWidth="5"
                strokeDasharray="8 4"
              />
              <polygon
                points="160,50 240,30 280,90 200,120"
                fill={palette.sage + '40'}
                stroke={palette.sage}
                strokeWidth="3"
              />
              {[
                { x: 160, y: 50 },
                { x: 240, y: 30 },
                { x: 280, y: 90 },
                { x: 200, y: 120 },
              ].map((pt, idx) => (
                <circle
                  key={`v-${idx}`}
                  cx={pt.x}
                  cy={pt.y}
                  r="6"
                  fill={palette.clay}
                  stroke={palette.paperLight}
                  strokeWidth="2"
                />
              ))}
            </svg>
            <div
              style={{
                position: 'absolute',
                bottom: 12,
                right: 16,
                padding: '6px 14px',
                borderRadius: 12,
                background: palette.sage,
                color: palette.paperLight,
                fontSize: 30,
                fontWeight: 700,
                fontFamily: SERIF,
                whiteSpace: 'nowrap',
              }}
            >
              矢量抽象
            </div>
          </div>

          <div
            style={{
              fontSize: 30,
              fontWeight: 700,
              color: palette.sage,
              fontFamily: SERIF,
              textAlign: 'center',
              whiteSpace: 'nowrap',
            }}
          >
            几何定义：精确点线面拓扑
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// Act 2: 栅格数据 —— 连续场的矩阵世界 (Frames 630 -> 2218)
// =============================================================================
const RasterSynthesisStage: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const T = getTimestamps(fps);

  const stageFade = interpolate(
    frame,
    [T.act2_start, T.act2_start + 20, T.act3_start - 20, T.act3_start],
    [0, 1, 1, 0],
    clamp
  );

  if (stageFade <= 0) return null;

  const isMinecraft = frame < T.act2_matrix_nature;
  const isMatrixAlgebra = frame >= T.act2_matrix_nature && frame < T.act2_resolution_double;
  const isExplosionAndCompression = frame >= T.act2_resolution_double;

  const algebraProgress = spring({
    frame: frame - T.act2_map_algebra,
    fps,
    config: { damping: 18, stiffness: 75 },
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: stageFade,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 140,
      }}
    >
      {/* 阶段 1：连续场与 3D Minecraft 像素体素世界 (Frames 630 - 1254) */}
      {isMinecraft && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 60,
            width: 1620,
          }}
        >
          <div
            style={{
              width: 640,
              background: 'rgba(255, 253, 247, 0.94)',
              borderRadius: 32,
              border: `3px solid ${palette.blueLight}`,
              padding: 40,
              boxShadow: '0 20px 48px rgba(53, 107, 120, 0.12)',
            }}
          >
            <div
              style={{
                display: 'inline-block',
                padding: '8px 20px',
                borderRadius: 20,
                background: palette.blue + '18',
                color: palette.blue,
                fontSize: 30,
                fontWeight: 700,
                fontFamily: SERIF,
                marginBottom: 16,
                whiteSpace: 'nowrap',
              }}
            >
              连续场特征
            </div>
            <div
              style={{
                fontSize: 48,
                fontWeight: 900,
                color: palette.ink,
                fontFamily: SERIF,
                marginBottom: 16,
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
              }}
            >
              处处有值的物理世界
            </div>
            <div
              style={{
                fontSize: 32,
                color: palette.inkSoft,
                fontFamily: SERIF,
                lineHeight: 1.6,
                marginBottom: 24,
              }}
            >
              没有人工界限，空间中任意一点均存在连续变化的标量场数值（高程、温度、气压）。
            </div>

            <div
              style={{
                padding: '20px 24px',
                borderRadius: 20,
                background: palette.paper,
                border: `2px solid ${palette.line}`,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: palette.blue,
                }}
              />
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 700,
                  color: palette.ink,
                  fontFamily: SERIF,
                  whiteSpace: 'nowrap',
                }}
              >
                抽象方式：像素块规则密铺
              </div>
            </div>
          </div>

          <div
            style={{
              width: 820,
              height: 540,
              position: 'relative',
              perspective: 1200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: 480,
                height: 480,
                transform: `rotateX(60deg) rotateZ(-35deg)`,
                transformStyle: 'preserve-3d',
                position: 'relative',
              }}
            >
              {VOXEL_GRID.map((row, r) =>
                row.map((val, c) => {
                  const popDelay = r * 3 + c * 2;
                  const pop = spring({
                    frame: frame - T.act2_minecraft_world - popDelay,
                    fps,
                    config: { damping: 14, stiffness: 90 },
                  });
                  const height = val * 18 * pop;
                  const color =
                    val > 6
                      ? palette.amber
                      : val > 4
                        ? palette.sage
                        : palette.blue;

                  return (
                    <div
                      key={`vx-${r}-${c}`}
                      style={{
                        position: 'absolute',
                        left: c * 90,
                        top: r * 90,
                        width: 82,
                        height: 82,
                        transformStyle: 'preserve-3d',
                        transform: `translateZ(${height}px)`,
                      }}
                    >
                      <div
                        style={{
                          width: 82,
                          height: 82,
                          background: color,
                          border: `2px solid ${palette.paperLight}`,
                          boxShadow: 'inset 0 0 12px rgba(255,255,255,0.4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: palette.paperLight,
                          fontSize: 30,
                          fontWeight: 900,
                          fontFamily: MONO,
                        }}
                      >
                        {val}
                      </div>
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: 82,
                          width: 82,
                          height: height,
                          background: palette.ink,
                          opacity: 0.35,
                          transformOrigin: 'top',
                          transform: 'rotateX(-90deg)',
                        }}
                      />
                    </div>
                  );
                })
              )}
            </div>

            <div
              style={{
                position: 'absolute',
                bottom: 20,
                right: 40,
                padding: '10px 24px',
                borderRadius: 24,
                background: palette.ink,
                color: palette.paperLight,
                fontSize: 30,
                fontWeight: 700,
                fontFamily: SERIF,
                boxShadow: '0 10px 24px rgba(38,53,47,0.25)',
                whiteSpace: 'nowrap',
              }}
            >
              像素高程矩阵表达
            </div>
          </div>
        </div>
      )}

      {/* 阶段 2：二维矩阵本质、O(1) 寻址与地图代数计算 (Frames 1254 - 1808) */}
      {isMatrixAlgebra && (
        <div
          style={{
            display: 'flex',
            alignItems: 'stretch',
            justifyContent: 'center',
            gap: 40,
            width: 1680,
          }}
        >
          <div
            style={{
              width: 800,
              background: 'rgba(255, 253, 247, 0.94)',
              borderRadius: 32,
              border: `3px solid ${palette.blueLight}`,
              padding: 36,
              boxShadow: '0 20px 48px rgba(53, 107, 120, 0.12)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    display: 'inline-block',
                    padding: '8px 20px',
                    borderRadius: 20,
                    background: palette.blue + '18',
                    color: palette.blue,
                    fontSize: 30,
                    fontWeight: 700,
                    fontFamily: SERIF,
                    whiteSpace: 'nowrap',
                  }}
                >
                  二维矩阵本质
                </div>
                <div
                  style={{
                    padding: '8px 20px',
                    borderRadius: 20,
                    background: palette.sage + '20',
                    color: palette.sage,
                    fontSize: 30,
                    fontWeight: 800,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Latex math="\text{查询复杂度 } \mathcal{O}(1)" />
                </div>
              </div>

              <div
                style={{
                  padding: '20px 24px',
                  borderRadius: 20,
                  background: palette.paper,
                  border: `2px solid ${palette.line}`,
                  marginBottom: 20,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 8, color: palette.ink, fontWeight: 700 }}>
                  <Latex math="\text{内存地址} = \text{基地址} + (r \times W + c) \times S" />
                </div>
                <div style={{ fontSize: 30, color: palette.inkSoft, fontFamily: SERIF, whiteSpace: 'nowrap' }}>
                  无需空间遍历 · 行列号直接映射物理内存
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 10,
              }}
            >
              {[
                [12, 15, 18, 20],
                [14, 22, 28, 25],
                [19, 31, 35, 29],
                [16, 24, 27, 21],
              ].flatMap((row, r) =>
                row.map((val, c) => {
                  const isTarget = r === 2 && c === 1;
                  return (
                    <div
                      key={`mcell-${r}-${c}`}
                      style={{
                        height: 58,
                        borderRadius: 12,
                        background: isTarget ? palette.amber : palette.paperLight,
                        border: `2px solid ${isTarget ? palette.ink : palette.line}`,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isTarget ? palette.paperLight : palette.ink,
                        boxShadow: isTarget ? '0 6px 16px rgba(179,122,66,0.3)' : 'none',
                      }}
                    >
                      <div style={{ fontSize: 30, fontWeight: 900, fontFamily: MONO }}>{val}</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div
            style={{
              width: 840,
              background: 'rgba(255, 253, 247, 0.94)',
              borderRadius: 32,
              border: `3px solid ${palette.sageLight}`,
              padding: 36,
              boxShadow: '0 20px 48px rgba(82, 116, 95, 0.12)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  display: 'inline-block',
                  padding: '8px 20px',
                  borderRadius: 20,
                  background: palette.sage + '18',
                  color: palette.sage,
                  fontSize: 30,
                  fontWeight: 700,
                  fontFamily: SERIF,
                  whiteSpace: 'nowrap',
                }}
              >
                地图代数计算
              </div>
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 800,
                  color: palette.sage,
                  whiteSpace: 'nowrap',
                }}
              >
                <Latex math="\mathbf{A}_{\text{降雨}} \oplus \mathbf{B}_{\text{坡度}} = \mathbf{C}_{\text{径流}}" />
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                padding: '12px 0',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: 190,
                    height: 190,
                    borderRadius: 16,
                    background: palette.blue + '25',
                    border: `2px solid ${palette.blue}`,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 6,
                    padding: 8,
                  }}
                >
                  {[10, 20, 15, 30].map((v, i) => (
                    <div
                      key={`a-${i}`}
                      style={{
                        background: palette.paperLight,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 30,
                        fontWeight: 900,
                        fontFamily: MONO,
                        borderRadius: 8,
                        color: palette.blue,
                      }}
                    >
                      {v}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 10, fontSize: 30, fontWeight: 700, fontFamily: SERIF, whiteSpace: 'nowrap' }}>
                  降雨栅格
                </div>
              </div>

              <div style={{ fontSize: 44, fontWeight: 900, color: palette.ink }}>+</div>

              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: 190,
                    height: 190,
                    borderRadius: 16,
                    background: palette.sage + '25',
                    border: `2px solid ${palette.sage}`,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 6,
                    padding: 8,
                  }}
                >
                  {[5, 10, 8, 12].map((v, i) => (
                    <div
                      key={`b-${i}`}
                      style={{
                        background: palette.paperLight,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 30,
                        fontWeight: 900,
                        fontFamily: MONO,
                        borderRadius: 8,
                        color: palette.sage,
                      }}
                    >
                      {v}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 10, fontSize: 30, fontWeight: 700, fontFamily: SERIF, whiteSpace: 'nowrap' }}>
                  坡度栅格
                </div>
              </div>

              <div style={{ fontSize: 44, fontWeight: 900, color: palette.ink }}>=</div>

              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: 190,
                    height: 190,
                    borderRadius: 16,
                    background: palette.amber + '25',
                    border: `3px solid ${palette.amber}`,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 6,
                    padding: 8,
                    transform: `scale(${interpolate(algebraProgress, [0, 1], [0.85, 1])})`,
                    boxShadow: '0 10px 24px rgba(179,122,66,0.25)',
                  }}
                >
                  {[15, 30, 23, 42].map((v, i) => (
                    <div
                      key={`c-${i}`}
                      style={{
                        background: palette.amber,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 30,
                        fontWeight: 900,
                        fontFamily: MONO,
                        borderRadius: 8,
                        color: palette.paperLight,
                      }}
                    >
                      {v}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 10, fontSize: 30, fontWeight: 700, fontFamily: SERIF, color: palette.amber, whiteSpace: 'nowrap' }}>
                  综合分析结果
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 阶段 3：分辨率翻倍平方级暴涨 & 空间编码优化突破 (Frames 1808 - 2218) */}
      {isExplosionAndCompression && (
        <div
          style={{
            display: 'flex',
            alignItems: 'stretch',
            justifyContent: 'center',
            gap: 40,
            width: 1680,
          }}
        >
          <div
            style={{
              width: 780,
              background: 'rgba(255, 253, 247, 0.94)',
              borderRadius: 32,
              border: `3px solid ${palette.clay}`,
              padding: 36,
              boxShadow: '0 20px 48px rgba(153, 91, 73, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    display: 'inline-block',
                    padding: '8px 20px',
                    borderRadius: 20,
                    background: palette.clay + '18',
                    color: palette.clay,
                    fontSize: 30,
                    fontWeight: 700,
                    fontFamily: SERIF,
                    whiteSpace: 'nowrap',
                  }}
                >
                  分辨率翻倍困境
                </div>
                <div
                  style={{
                    fontSize: 30,
                    fontWeight: 800,
                    color: palette.clay,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Latex math="\text{数据量膨胀 } \mathcal{O}(N^2)" />
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-around',
                  padding: '16px 0',
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      width: 160,
                      height: 160,
                      borderRadius: 16,
                      border: `2px solid ${palette.line}`,
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: 4,
                      padding: 6,
                      background: palette.paper,
                    }}
                  >
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={`p1-${i}`} style={{ background: palette.blueLight + '60', borderRadius: 4 }} />
                    ))}
                  </div>
                  <div style={{ marginTop: 12, fontSize: 30, fontWeight: 700, fontFamily: SERIF, whiteSpace: 'nowrap' }}>
                    <Latex math="1\times \implies 4\text{ 像元}" />
                  </div>
                </div>

                <div style={{ fontSize: 44, color: palette.clay, fontWeight: 900 }}>➔</div>

                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      width: 160,
                      height: 160,
                      borderRadius: 16,
                      border: `2px solid ${palette.clay}`,
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: 3,
                      padding: 4,
                      background: palette.clay + '15',
                    }}
                  >
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div key={`p2-${i}`} style={{ background: palette.clay, borderRadius: 2 }} />
                    ))}
                  </div>
                  <div style={{ marginTop: 12, fontSize: 30, fontWeight: 700, fontFamily: SERIF, color: palette.clay, whiteSpace: 'nowrap' }}>
                    <Latex math="2\times \implies 16\text{ 像元 (4倍)}" />
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                padding: '16px 20px',
                borderRadius: 16,
                background: palette.clay + '15',
                color: palette.clay,
                fontSize: 30,
                fontWeight: 700,
                fontFamily: SERIF,
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              存储体积呈几何级爆发 · 亟需空间编码优化
            </div>
          </div>

          <div
            style={{
              width: 860,
              background: 'rgba(255, 253, 247, 0.94)',
              borderRadius: 32,
              border: `3px solid ${palette.sage}`,
              padding: 36,
              boxShadow: '0 20px 48px rgba(82, 116, 95, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                display: 'inline-block',
                padding: '8px 20px',
                borderRadius: 20,
                background: palette.sage + '18',
                color: palette.sage,
                fontSize: 30,
                fontWeight: 700,
                fontFamily: SERIF,
                marginBottom: 16,
                whiteSpace: 'nowrap',
              }}
            >
              空间编码破局方案
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div
                style={{
                  padding: '20px 24px',
                  borderRadius: 20,
                  background: palette.paper,
                  border: `2px solid ${palette.line}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: 34, fontWeight: 800, color: palette.ink, fontFamily: SERIF, marginBottom: 4, whiteSpace: 'nowrap' }}>
                    游程编码 (RLE)
                  </div>
                  <div style={{ fontSize: 30, color: palette.inkSoft, fontFamily: SERIF, whiteSpace: 'nowrap' }}>
                    连续同质像素序列压缩为二元组
                  </div>
                </div>
                <div style={{ fontSize: 30, fontWeight: 800, color: palette.sage, whiteSpace: 'nowrap' }}>
                  <Latex math="(V_{\text{值}},\, L_{\text{长度}})" />
                </div>
              </div>

              <div
                style={{
                  padding: '20px 24px',
                  borderRadius: 20,
                  background: palette.paper,
                  border: `2px solid ${palette.line}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: 34, fontWeight: 800, color: palette.ink, fontFamily: SERIF, marginBottom: 4, whiteSpace: 'nowrap' }}>
                    四叉树金字塔与瓦片切片
                  </div>
                  <div style={{ fontSize: 30, color: palette.inkSoft, fontFamily: SERIF, whiteSpace: 'nowrap' }}>
                    宏观粗粒度调阅 · 微观按需动态高精瓦片加载
                  </div>
                </div>
                <div
                  style={{
                    padding: '8px 20px',
                    borderRadius: 14,
                    background: palette.sage,
                    color: palette.paperLight,
                    fontSize: 30,
                    fontWeight: 700,
                    fontFamily: SERIF,
                    whiteSpace: 'nowrap',
                  }}
                >
                  多尺度索引
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 10,
                fontSize: 30,
                fontWeight: 700,
                color: palette.sage,
                fontFamily: SERIF,
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              兼顾极速渲染与紧凑存储的双重突破
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// Act 3: 矢量数据 —— 离散对象的拓扑跃迁 (Frames 2218 -> 3890)
// =============================================================================
const VectorSynthesisStage: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const T = getTimestamps(fps);

  const stageFade = interpolate(
    frame,
    [T.act3_start, T.act3_start + 20, T.end - 15, T.end],
    [0, 1, 1, 1],
    clamp
  );

  if (stageFade <= 0) return null;

  const isGeometryAndAttr = frame >= T.act3_start && frame < T.act3_duplicate_coords;
  const isTopologyEvolution = frame >= T.act3_duplicate_coords && frame < T.act3_navigation_possible;
  const isGrandFinale = frame >= T.act3_navigation_possible;

  const zoomScale = interpolate(
    frame,
    [T.act3_infinite_zoom, T.act3_infinite_zoom + 45],
    [1, 2.2],
    clamp
  );

  // 导航点每 90 帧（1.5秒）完成一次从起点 S 到终点 T 的匀速路径导航
  const loopDuration = 90;
  const navProgress = interpolate(
    (frame - T.act3_navigation_possible) % loopDuration,
    [0, loopDuration - 10, loopDuration],
    [0, 1, 1],
    clamp
  );
  const navPoint = getNavPathPoint(navProgress);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: stageFade,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 140,
      }}
    >
      {/* 阶段 1：点线面几何精准定义、无限放大不失真与属性表关联 (Frames 2218 - 3196) */}
      {isGeometryAndAttr && (
        <div
          style={{
            display: 'flex',
            alignItems: 'stretch',
            justifyContent: 'center',
            gap: 40,
            width: 1680,
          }}
        >
          <div
            style={{
              width: 800,
              background: 'rgba(255, 253, 247, 0.94)',
              borderRadius: 32,
              border: `3px solid ${palette.sageLight}`,
              padding: 36,
              boxShadow: '0 20px 48px rgba(82, 116, 95, 0.12)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    display: 'inline-block',
                    padding: '8px 20px',
                    borderRadius: 20,
                    background: palette.sage + '18',
                    color: palette.sage,
                    fontSize: 30,
                    fontWeight: 700,
                    fontFamily: SERIF,
                    whiteSpace: 'nowrap',
                  }}
                >
                  几何点线面定义
                </div>
                <div
                  style={{
                    padding: '8px 18px',
                    borderRadius: 16,
                    background: palette.amber + '20',
                    color: palette.amber,
                    fontSize: 30,
                    fontWeight: 800,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Latex math="\text{矢量缩放零失真 }" />
                </div>
              </div>

              <div
                style={{
                  height: 250,
                  borderRadius: 20,
                  background: palette.paper,
                  border: `2px solid ${palette.line}`,
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    transform: `scale(${zoomScale})`,
                    transformOrigin: 'center center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="360" height="240" viewBox="0 0 360 240">
                    <polygon
                      points="80,50 200,30 280,120 180,190 70,140"
                      fill={palette.sage + '30'}
                      stroke={palette.sage}
                      strokeWidth="4"
                    />
                    {[
                      { x: 80, y: 50 },
                      { x: 200, y: 30 },
                      { x: 280, y: 120 },
                      { x: 180, y: 190 },
                      { x: 70, y: 140 },
                    ].map((pt, idx) => (
                      <g key={`gpt-${idx}`}>
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="7"
                          fill={palette.clay}
                          stroke={palette.paperLight}
                          strokeWidth="2.5"
                        />
                      </g>
                    ))}
                  </svg>
                </div>

                <div
                  style={{
                    position: 'absolute',
                    top: 14,
                    right: 16,
                    padding: '6px 16px',
                    borderRadius: 12,
                    background: palette.ink,
                    color: palette.paperLight,
                    fontSize: 30,
                    fontWeight: 800,
                    fontFamily: MONO,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {Math.round(zoomScale * 100)}% 放大
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 16,
                fontSize: 28,
                color: palette.inkSoft,
                fontFamily: SERIF,
                lineHeight: 1.4,
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              解析几何方程定义边界 · 连续空间数学表达 · 边缘始终光滑锐利
            </div>
          </div>

          <div
            style={{
              width: 840,
              background: 'rgba(255, 253, 247, 0.94)',
              borderRadius: 32,
              border: `3px solid ${palette.blueLight}`,
              padding: 36,
              boxShadow: '0 20px 48px rgba(53, 107, 120, 0.12)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-block',
                  padding: '8px 20px',
                  borderRadius: 20,
                  background: palette.blue + '18',
                  color: palette.blue,
                  fontSize: 30,
                  fontWeight: 700,
                  fontFamily: SERIF,
                  marginBottom: 16,
                  whiteSpace: 'nowrap',
                }}
              >
                关系型属性数据库挂载
              </div>

              <div
                style={{
                  borderRadius: 16,
                  border: `2px solid ${palette.line}`,
                  overflow: 'hidden',
                  background: palette.paperLight,
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.4fr 2fr 1.6fr 1.4fr',
                    background: palette.ink,
                    color: palette.paperLight,
                    padding: '12px 16px',
                    fontSize: 30,
                    fontWeight: 700,
                    fontFamily: SERIF,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <div>要素编号</div>
                  <div>名称</div>
                  <div>用地类型</div>
                  <div>容积率</div>
                </div>

                {[
                  { id: 'POLY_01', name: '中央科技园区', type: '科研用地', far: '3.50' },
                  { id: 'POLY_02', name: '滨江生态公园', type: '绿化用地', far: '0.05' },
                  { id: 'POLY_03', name: '国际商务中心', type: '商业用地', far: '5.20' },
                ].map((row, rIdx) => (
                  <div
                    key={`tbl-${rIdx}`}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.4fr 2fr 1.6fr 1.4fr',
                      padding: '12px 16px',
                      fontSize: 30,
                      fontFamily: SERIF,
                      background: rIdx % 2 === 0 ? palette.paper : palette.paperLight,
                      borderTop: `1px solid ${palette.line}`,
                      color: palette.ink,
                      alignItems: 'center',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <div style={{ fontFamily: MONO, fontWeight: 700, color: palette.blue }}>
                      {row.id}
                    </div>
                    <div style={{ fontWeight: 600 }}>{row.name}</div>
                    <div>{row.type}</div>
                    <div style={{ fontFamily: MONO, fontWeight: 700 }}>{row.far}</div>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                marginTop: 16,
                fontSize: 30,
                fontWeight: 700,
                color: palette.blue,
                fontFamily: SERIF,
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              几何图形与多维属性字段原生无缝关联
            </div>
          </div>
        </div>
      )}

      {/* 阶段 2：传统缺陷 vs 弧段-节点模型 (Arc-Node) 拓扑消除裂隙 (Frames 3196 - 3734) */}
      {isTopologyEvolution && (
        <div
          style={{
            display: 'flex',
            alignItems: 'stretch',
            justifyContent: 'center',
            gap: 40,
            width: 1680,
          }}
        >
          <div
            style={{
              width: 800,
              background: 'rgba(255, 253, 247, 0.94)',
              borderRadius: 32,
              border: `3px solid ${palette.amber}`,
              padding: 36,
              boxShadow: '0 20px 48px rgba(179, 122, 66, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    display: 'inline-block',
                    padding: '8px 20px',
                    borderRadius: 20,
                    background: palette.amber + '18',
                    color: palette.amber,
                    fontSize: 30,
                    fontWeight: 700,
                    fontFamily: SERIF,
                    whiteSpace: 'nowrap',
                  }}
                >
                  拓扑结构革新
                </div>
                <div
                  style={{
                    fontSize: 30,
                    fontWeight: 800,
                    color: palette.amber,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Latex math="\text{消除缝隙重叠 }" />
                </div>
              </div>

              {/* 弧段与多边形拓扑示意图 */}
              <div
                style={{
                  height: 250,
                  borderRadius: 20,
                  background: palette.paper,
                  border: `2px solid ${palette.line}`,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="600" height="240" viewBox="0 0 600 240">
                  {/* 左多边形 P1 */}
                  <polygon
                    points="40,40 270,40 270,200 40,200"
                    fill={palette.blue + '25'}
                    stroke={palette.blue}
                    strokeWidth="3"
                  />
                  {/* 右多边形 P2 */}
                  <polygon
                    points="270,40 500,40 500,200 270,200"
                    fill={palette.sage + '25'}
                    stroke={palette.sage}
                    strokeWidth="3"
                  />

                  {/* 共享公共边弧段 A1 */}
                  <line
                    x1="270"
                    y1="40"
                    x2="270"
                    y2="200"
                    stroke={palette.amber}
                    strokeWidth="7"
                  />

                  {/* 节点 V1 与 V2 */}
                  <circle cx="270" cy="40" r="10" fill={palette.clay} stroke={palette.paperLight} strokeWidth="3" />
                  <circle cx="270" cy="200" r="10" fill={palette.clay} stroke={palette.paperLight} strokeWidth="3" />

                  {/* 多边形文字标注 */}
                  <text x="145" y="125" textAnchor="middle" fill={palette.blue} fontSize="28" fontWeight="800" fontFamily={SERIF}>
                    多边形 P1
                  </text>
                  <text x="395" y="125" textAnchor="middle" fill={palette.sage} fontSize="28" fontWeight="800" fontFamily={SERIF}>
                    多边形 P2
                  </text>

                  {/* 弧段标签胶囊 */}
                  <rect x="210" y="105" width="120" height="34" rx="8" fill={palette.ink} />
                  <text x="270" y="129" textAnchor="middle" fill={palette.paperLight} fontSize="24" fontWeight="900" fontFamily={SERIF}>
                    弧段 A1
                  </text>

                  <text x="270" y="28" textAnchor="middle" fill={palette.clay} fontSize="26" fontWeight="900" fontFamily={SERIF}>
                    节点 V1
                  </text>
                  <text x="270" y="232" textAnchor="middle" fill={palette.clay} fontSize="26" fontWeight="900" fontFamily={SERIF}>
                    节点 V2
                  </text>
                </svg>
              </div>
            </div>

            <div
              style={{
                marginTop: 16,
                fontSize: 30,
                fontWeight: 700,
                color: palette.ink,
                fontFamily: SERIF,
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              公共边界仅存一次 · 零存储冗余 · 物理杜绝裂隙
            </div>
          </div>

          <div
            style={{
              width: 840,
              background: 'rgba(255, 253, 247, 0.94)',
              borderRadius: 32,
              border: `3px solid ${palette.sage}`,
              padding: 36,
              boxShadow: '0 20px 48px rgba(82, 116, 95, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-block',
                  padding: '8px 20px',
                  borderRadius: 20,
                  background: palette.sage + '18',
                  color: palette.sage,
                  fontSize: 30,
                  fontWeight: 700,
                  fontFamily: SERIF,
                  marginBottom: 16,
                  whiteSpace: 'nowrap',
                }}
              >
                弧段-节点拓扑关系表
              </div>

              <div
                style={{
                  borderRadius: 16,
                  border: `2px solid ${palette.line}`,
                  overflow: 'hidden',
                  background: palette.paperLight,
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.2fr 1fr 1fr 1.2fr 1.2fr',
                    background: palette.ink,
                    color: palette.paperLight,
                    padding: '12px 16px',
                    fontSize: 30,
                    fontWeight: 700,
                    fontFamily: SERIF,
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <div>弧段</div>
                  <div>起点</div>
                  <div>终点</div>
                  <div>左多边形</div>
                  <div>右多边形</div>
                </div>

                {[
                  { arc: 'A1', from: 'V1', to: 'V2', left: 'P1', right: 'P2' },
                  { arc: 'A2', from: 'V2', to: 'V3', left: 'P2', right: 'P3' },
                  { arc: 'A3', from: 'V3', to: 'V1', left: 'P1', right: '外部' },
                ].map((row, idx) => (
                  <div
                    key={`topo-${idx}`}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.2fr 1fr 1fr 1.2fr 1.2fr',
                      padding: '12px 16px',
                      fontSize: 30,
                      fontFamily: SERIF,
                      background: idx === 0 ? palette.amber + '22' : idx % 2 === 0 ? palette.paper : palette.paperLight,
                      borderTop: `1px solid ${palette.line}`,
                      color: palette.ink,
                      textAlign: 'center',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <div style={{ color: palette.amber }}>{row.arc}</div>
                    <div style={{ color: palette.clay }}>{row.from}</div>
                    <div style={{ color: palette.clay }}>{row.to}</div>
                    <div style={{ color: palette.blue }}>{row.left}</div>
                    <div style={{ color: palette.sage }}>{row.right}</div>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                marginTop: 16,
                fontSize: 30,
                fontWeight: 700,
                color: palette.sage,
                fontFamily: SERIF,
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              直接解析关系表 · 瞬间洞悉要素邻接、包含与连通
            </div>
          </div>
        </div>
      )}

      {/* 阶段 3：现代路网拓扑导航与全片终极大升华 (Frames 3734 - 3890) */}
      {isGrandFinale && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: 1640,
          }}
        >
          <div
            style={{
              width: 1540,
              height: 380,
              borderRadius: 36,
              background: 'rgba(255, 253, 247, 0.96)',
              border: `3px solid ${palette.sage}`,
              padding: '24px 36px',
              boxShadow: '0 24px 60px rgba(38, 53, 47, 0.18)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* 左侧：网络导航图论拓扑 */}
            <div style={{ width: 840, height: 320, position: 'relative' }}>
              <svg width="100%" height="100%" viewBox="0 0 840 320">
                {/* 基础全网络底图线 */}
                <g stroke={palette.line} strokeWidth="6" strokeLinecap="round">
                  <line x1="60" y1="160" x2="220" y2="80" />
                  <line x1="60" y1="160" x2="220" y2="240" />
                  <line x1="220" y1="80" x2="430" y2="80" />
                  <line x1="220" y1="240" x2="430" y2="240" />
                  <line x1="220" y1="80" x2="220" y2="240" />
                  <line x1="430" y1="80" x2="640" y2="160" />
                  <line x1="430" y1="240" x2="640" y2="160" />
                  <line x1="640" y1="160" x2="790" y2="160" />
                </g>

                {/* 导航规划高亮路径 (棕色高亮轨迹线: S -> N1 -> N3 -> N5 -> T) */}
                <polyline
                  points="60,160 220,80 430,80 640,160 790,160"
                  fill="none"
                  stroke={palette.amber}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* 严格沿折线轨迹移动的动态导航光点 */}
                <g>
                  <circle
                    cx={navPoint.x}
                    cy={navPoint.y}
                    r={22}
                    fill="none"
                    stroke={palette.amber}
                    strokeWidth={3}
                    opacity={0.6}
                  />
                  <circle
                    cx={navPoint.x}
                    cy={navPoint.y}
                    r={14}
                    fill={palette.amber}
                    filter="drop-shadow(0 0 14px #b37a42)"
                  />
                  <circle
                    cx={navPoint.x}
                    cy={navPoint.y}
                    r={6}
                    fill={palette.paperLight}
                  />
                </g>

                {/* 拓扑节点标记 */}
                {[
                  { x: 60, y: 160, label: '起点 S' },
                  { x: 220, y: 80, label: 'N1' },
                  { x: 220, y: 240, label: 'N2' },
                  { x: 430, y: 80, label: 'N3' },
                  { x: 430, y: 240, label: 'N4' },
                  { x: 640, y: 160, label: 'N5' },
                  { x: 790, y: 160, label: '终点 T' },
                ].map((nd, idx) => (
                  <g key={`nd-${idx}`}>
                    <circle cx={nd.x} cy={nd.y} r="12" fill={palette.ink} stroke={palette.paperLight} strokeWidth="3" />
                    <text
                      x={nd.x}
                      y={nd.y - 18}
                      textAnchor="middle"
                      fill={palette.ink}
                      fontSize="24"
                      fontWeight="900"
                      fontFamily={SERIF}
                    >
                      {nd.label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            {/* 右侧：路网拓扑导航赋能结语 */}
            <div
              style={{
                width: 600,
                padding: '24px 30px',
                borderRadius: 24,
                background: palette.paper,
                border: `2px solid ${palette.sageLight}`,
              }}
            >
              <div
                style={{
                  display: 'inline-block',
                  padding: '6px 18px',
                  borderRadius: 16,
                  background: palette.sage + '20',
                  color: palette.sage,
                  fontSize: 30,
                  fontWeight: 800,
                  fontFamily: SERIF,
                  marginBottom: 12,
                  whiteSpace: 'nowrap',
                }}
              >
                现代路网导航基石
              </div>
              <div
                style={{
                  fontSize: 38,
                  fontWeight: 900,
                  color: palette.ink,
                  fontFamily: SERIF,
                  lineHeight: 1.3,
                  marginBottom: 10,
                  whiteSpace: 'nowrap',
                }}
              >
                从几何数据到空间智能
              </div>
              <div
                style={{
                  fontSize: 30,
                  color: palette.inkSoft,
                  fontFamily: SERIF,
                  lineHeight: 1.6,
                }}
              >
                <div>图论连通性 · 实时通行代价计算</div>
                <div>驱动全球卫星定位与秒级路径规划</div>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 30,
              padding: '16px 48px',
              borderRadius: 36,
              background: `linear-gradient(135deg, ${palette.ink} 0%, ${palette.blue} 100%)`,
              color: palette.paperLight,
              fontSize: 34,
              fontWeight: 800,
              fontFamily: SERIF,
              boxShadow: '0 12px 32px rgba(38,53,47,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: 24,
              whiteSpace: 'nowrap',
            }}
          >
            <span>栅格刻画自然世界的连续流动</span>
            <span style={{ color: palette.amber }}>✕</span>
            <span>矢量承载人类文明的离散秩序</span>
          </div>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// 底部导航指示器（极简三幕指示胶囊，纯中文，居中布局）
// =============================================================================
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
        bottom: 36,
        height: 54,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: SERIF,
        zIndex: 50,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        {[
          { id: 1, label: '01. 真实与抽象' },
          { id: 2, label: '02. 连续场与栅格' },
          { id: 3, label: '03. 离散对象与矢量' },
        ].map((item) => {
          const isActive = act === item.id;
          const isPassed = act > item.id;
          return (
            <div
              key={item.id}
              style={{
                padding: '8px 28px',
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
                border: `2px solid ${isActive ? palette.ink : palette.ink + '25'
                  }`,
                fontSize: 30,
                fontWeight: isActive ? 800 : 600,
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                boxShadow: isActive ? '0 6px 20px rgba(38,53,47,0.2)' : 'none',
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
                      : palette.inkSoft + '60',
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
// 主组件入口：GISSummary
// =============================================================================
export const GISSummary: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const T = getTimestamps(fps);

  const scale = width / 1920;

  const accent =
    frame < T.act2_start
      ? 'amber'
      : frame < T.act3_start
        ? 'blue'
        : 'sage';

  return (
    <AbsoluteFill
      style={{
        width: 1920,
        height: 1080,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        overflow: 'hidden',
      }}
    >
      <PaperBackground frame={frame} accent={accent} />
      <CenteredHeadline frame={frame} />

      <DigitalReconstructionStage frame={frame} />
      <RasterSynthesisStage frame={frame} />
      <VectorSynthesisStage frame={frame} />

      <BottomTracker frame={frame} />
    </AbsoluteFill>
  );
};
