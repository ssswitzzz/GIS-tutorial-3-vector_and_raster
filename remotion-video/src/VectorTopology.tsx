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
import { clamp, palette, SERIF } from './theme';

// =============================================================================
// 精确音频时间戳（基于 60 FPS，起点 00:09:01,933 = 541.933s，总长 132.933s / 7976 帧）
// =============================================================================
export const getTimestamps = (fps: number) => {
  const f = (sec: number) => Math.round(sec * fps);
  return {
    start: 0,
    // Act 1: 简单要素模型 (00:09:01,933 -> 00:09:26,200)
    act1_start: 0,
    act1_raster_solved: 0, // 208: 那栅格数据的问题大致解决了
    act1_vector_flaw: f(3.067), // 209: 矢量数据又有什么致命问题呢
    act1_store_vertices: f(6.167), // 210: 我们原本说的存储每一个要素的顶点坐标
    act1_entity_structure: f(10.300), // 211: 得到的是实体型数据结构
    act1_simple_feature: f(12.967), // 212: 也叫做简单要素模型
    act1_isolated_logic: f(15.267), // 213: 它的核心逻辑是每一个要素都是独立的
    act1_point_is_point: f(19.000), // 214: 点就是点
    act1_line_is_line: f(20.133), // 215: 线就是线
    act1_poly_is_ring: f(21.100), // 216: 面就是一个独立的闭合坐标环

    // Act 2: 精度与缝隙困境 (00:09:26,200 -> 00:09:58,266)
    act2_start: f(24.267), // 217: 比如我们要记录福建和江西两个省份
    act2_fujian_store: f(27.400), // 218: 那福建存一份自己的多边形坐标
    act2_jiangxi_store: f(30.167), // 219: 江西也存一份自己的多边形坐标
    act2_adjacent_border: f(33.067), // 220: 那因为福建和江西是紧挨着的
    act2_shared_boundary: f(35.967), // 221: 他们的省界线必然会有共享的地方
    act2_computer_float: f(39.100), // 222: 但在计算机的世界里
    act2_precision_error: f(40.800), // 223: 浮点数计算通常是有精度误差的
    act2_stored_twice: f(43.867), // 224: 如果这条线被存储了两遍
    act2_zoom_in: f(46.833), // 225: 地图放大到一定程度
    act2_lines_diverge: f(48.767), // 226: 这两条原本应该重合的线
    act2_coord_offset: f(51.233), // 227: 就会因为微小的坐标偏差
    act2_gap_and_overlap: f(53.267), // 228: 而产生了空隙或是重叠

    // Act 3: 拓扑关系缺失 (00:09:58,266 -> 00:10:14,633)
    act3_start: f(56.333), // 229: 同时，实体型数据结构
    act3_no_spatial_rel: f(58.833), // 230: 也无法表征要素之间的空间关联
    act3_topology_def: f(61.533), // 231: 也就是拓扑关系
    act3_isolated_coords: f(63.500), // 232: 计算机只能看到一堆孤立的坐标
    act3_who_is_neighbor: f(66.367), // 233: 根本不知道谁和谁相邻
    act3_which_road_connect: f(68.467), // 234: 哪条路和哪条路连着
    act3_how_to_solve: f(70.900), // 235: 那怎么解决呢

    // Act 4: 图论与弧段-节点模型 (00:10:14,633 -> 00:10:51,266)
    act4_start: f(72.700), // 236: 工程师们一拍大腿
    act4_graph_theory: f(74.533), // 237: 直接引入了图论
    act4_new_topology_struct: f(76.533), // 238: 创造了新的拓扑型数据结构
    act4_arc_node_name: f(79.000), // 239: 也就是Arc-Node模型
    act4_model_how: f(81.533), // 240: 那这个模型是咋样的呢
    act4_no_vertex_store: f(83.933), // 241: 计算机不再去分别存各种要素的顶点坐标
    act4_extract_nodes: f(87.900), // 242: 而是把所有交点提取成节点
    act4_extract_arcs: f(91.167), // 243: 把共享的边提取成独立的弧段
    act4_relational_table: f(94.833), // 244: 然后在数据库里建一张关系表
    act4_logic_only: f(97.700), // 245: 只记录逻辑关系
    act4_arc1_from_v1: f(99.733), // 246: 弧段一起点是 V1
    act4_arc1_to_v2: f(101.700), // 247: 终点是 V 2
    act4_arc1_left_p1: f(102.933), // 248: 然后左边是多边形 P 1
    act4_arc1_right_p2: f(105.100), // 249: 右边是多边形 P 2
    act4_intuitive_view: f(107.133), // 250: 那我们就可以非常直观的看到

    // Act 5: 空间智能跃迁 (00:10:51,266 -> 00:11:14,866)
    act5_start: f(109.333), // 251: 第一个，多边形的公共边只存储了一次
    act5_save_space: f(113.000), // 252: 不仅节省了大量空间
    act5_eliminate_gaps: f(114.800), // 253: 而且在物理上彻底消除了缝隙和重叠
    act5_spatial_logic: f(118.700), // 254: 第二个，计算机终于有了空间逻辑
    act5_look_at_table: f(122.533), // 255: 他直接看一眼关系表
    act5_know_neighbors: f(124.433), // 256: 就能够知道江西和福建是相邻的
    act5_along_arcs_nodes: f(127.467), // 257: 只要沿着弧段和节点
    act5_navigation_planning: f(129.433), // 258: 我们就能够顺理成章地做导航规划了
    end: f(132.933),
  };
};

// =============================================================================
// 顶部标题栏（思源宋体，平滑切换）
// =============================================================================
const CenteredHeadline: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const T = getTimestamps(fps);

  let eyebrow = '传统矢量架构';
  let title = '实体型数据结构与简单要素模型';
  let subtitle = '每一个要素独立存在 · 存储各自的几何顶点坐标序列';
  let keyStart = 0;

  if (frame >= T.act2_start && frame < T.act3_start) {
    eyebrow = '致命几何困境 · 空间冗余与容差失效';
    title = '公共边界重复存储与浮点精度撕裂';
    subtitle = '紧邻省界被存储两次 · 浮点微小误差在放大时引发拓扑裂隙与重叠';
    keyStart = T.act2_start;
  } else if (frame >= T.act3_start && frame < T.act4_start) {
    eyebrow = '致命逻辑困境 · 空间关联缺失';
    title = '孤立坐标的盲区：计算机眼中的“拓扑文盲”';
    subtitle = '缺乏空间拓扑关联 · 无法原生识别要素相邻与路网连通';
    keyStart = T.act3_start;
  } else if (frame >= T.act4_start && frame < T.act5_start) {
    eyebrow = '图论引入与数据结构革命';
    title = '弧段-节点拓扑模型：逻辑关系与几何解耦';
    subtitle =
      frame >= T.act4_relational_table
        ? '交点提炼为节点 · 共享边提炼为独立弧段 · 拓扑表记录左右多边形'
        : '计算机不再分别记录冗余坐标，而是构建图论拓扑网络';
    keyStart = frame >= T.act4_relational_table ? T.act4_relational_table : T.act4_start;
  } else if (frame >= T.act5_start) {
    eyebrow = '拓扑维度的质变跃迁';
    title = '双重物理红利与空间智能基石';
    subtitle = '零冗余无缝拼接 · 原生邻接查询 · 赋能网络拓扑与路径导航规划';
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
        top: 44,
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
          fontSize: 52,
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
// 底部导航栏（5 个纯中文思源宋体圆角胶囊）
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
        bottom: 34,
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
          { id: 1, label: '01. 简单要素模型' },
          { id: 2, label: '02. 精度与缝隙' },
          { id: 3, label: '03. 拓扑缺失盲区' },
          { id: 4, label: '04. 弧段-节点模型' },
          { id: 5, label: '05. 空间智能跃迁' },
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
                fontSize: 24,
                fontWeight: isActive ? 700 : 600,
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

// =============================================================================
// Act 1: 简单要素模型阶段 (纯中文 + LaTeX 公式)
// =============================================================================
const SimpleFeatureStage: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const T = getTimestamps(fps);

  if (frame > T.act2_start + Math.round(fps * 0.5)) return null;

  const fadeOut = interpolate(
    frame,
    [T.act2_start - Math.round(fps * 0.4), T.act2_start],
    [1, 0],
    clamp
  );

  const card1Spring = spring({
    frame: frame - T.act1_store_vertices,
    fps,
    config: { damping: 18, stiffness: 75 },
  });
  const card2Spring = spring({
    frame: frame - T.act1_line_is_line,
    fps,
    config: { damping: 18, stiffness: 75 },
  });
  const card3Spring = spring({
    frame: frame - T.act1_poly_is_ring,
    fps,
    config: { damping: 18, stiffness: 75 },
  });

  const ruleSpring = spring({
    frame: frame - T.act1_isolated_logic,
    fps,
    config: { damping: 20, stiffness: 80 },
  });

  const card2Active = frame >= T.act1_line_is_line;
  const card3Active = frame >= T.act1_poly_is_ring;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: fadeOut,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
      }}
    >
      {/* 核心特征提炼横幅 */}
      <div
        style={{
          opacity: interpolate(
            frame,
            [T.act1_isolated_logic, T.act1_isolated_logic + 20],
            [0, 1],
            clamp
          ),
          transform: `scale(${0.9 + ruleSpring * 0.1})`,
          marginBottom: 36,
          background: `linear-gradient(135deg, ${palette.paperLight}, ${palette.paper})`,
          border: `2px solid ${palette.amber}`,
          boxShadow: `0 12px 36px ${palette.ink}15`,
          borderRadius: 24,
          padding: '16px 36px',
          display: 'flex',
          alignItems: 'center',
          gap: 20,
        }}
      >
        <div
          style={{
            background: palette.amber,
            color: palette.paperLight,
            padding: '6px 16px',
            borderRadius: 12,
            fontSize: 24,
            fontWeight: 700,
            fontFamily: SERIF,
          }}
        >
          核心逻辑
        </div>
        <div
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: palette.ink,
            fontFamily: SERIF,
          }}
        >
          每一个要素都是独立的 · 独自封装完整坐标序列
        </div>
      </div>

      {/* 三大独立实体卡片：点、线、面 */}
      <div
        style={{
          display: 'flex',
          gap: 36,
          alignItems: 'stretch',
          justifyContent: 'center',
          width: 1720,
        }}
      >
        {/* 卡片 1: 点要素 */}
        <div
          style={{
            flex: 1,
            background: palette.paperLight,
            border: `2px solid ${palette.ink}20`,
            borderRadius: 28,
            padding: 32,
            boxShadow: `0 16px 40px ${palette.ink}0e`,
            opacity: interpolate(
              frame,
              [T.act1_store_vertices, T.act1_store_vertices + 20],
              [0, 1],
              clamp
            ),
            transform: `translateY(${(1 - card1Spring) * 30}px)`,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
            }}
          >
            <span
              style={{
                fontFamily: SERIF,
                fontSize: 32,
                fontWeight: 700,
                color: palette.ink,
              }}
            >
              点要素
            </span>
            <span
              style={{
                fontFamily: SERIF,
                fontSize: 20,
                fontWeight: 700,
                background: palette.amber + '22',
                color: palette.amber,
                padding: '4px 14px',
                borderRadius: 20,
              }}
            >
              零维点实体
            </span>
          </div>

          <div
            style={{
              height: 220,
              background: palette.paper,
              borderRadius: 20,
              border: `1px dashed ${palette.ink}30`,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `linear-gradient(${palette.ink}0f 1px, transparent 1px), linear-gradient(90deg, ${palette.ink}0f 1px, transparent 1px)`,
                backgroundSize: '24px 24px',
              }}
            />
            <div
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: palette.amber,
                  boxShadow: `0 0 0 10px ${palette.amber}25`,
                  border: `3px solid ${palette.paperLight}`,
                }}
              />
              <div
                style={{
                  marginTop: 12,
                  background: palette.paperLight,
                  padding: '6px 16px',
                  borderRadius: 12,
                  border: `1px solid ${palette.ink}20`,
                }}
              >
                <Latex
                  math="(119.30^{\circ}\text{E},\; 26.08^{\circ}\text{N})"
                  style={{ fontSize: 22, color: palette.ink }}
                />
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 20,
              fontFamily: SERIF,
              fontSize: 22,
              background: palette.ink + '08',
              padding: 16,
              borderRadius: 14,
              color: palette.inkSoft,
              lineHeight: 1.6,
            }}
          >
            <div style={{ color: palette.amber, fontWeight: 700 }}>
              几何描述：独立单点坐标
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>坐标表示：</span>
              <Latex
                math="P = (x, y)"
                style={{ fontSize: 20, color: palette.ink }}
              />
            </div>
            <div>空间拓扑：无（孤立几何对象）</div>
          </div>
        </div>

        {/* 卡片 2: 线要素 */}
        <div
          style={{
            flex: 1,
            background: palette.paperLight,
            border: `2px solid ${card2Active ? palette.blue : palette.ink + '20'}`,
            borderRadius: 28,
            padding: 32,
            boxShadow: `0 16px 40px ${palette.ink}0e`,
            opacity: card2Active
              ? 1
              : interpolate(
                  frame,
                  [T.act1_store_vertices, T.act1_store_vertices + 20],
                  [0, 0.4],
                  clamp
                ),
            transform: card2Active
              ? `translateY(${(1 - card2Spring) * 30}px)`
              : 'none',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
            }}
          >
            <span
              style={{
                fontFamily: SERIF,
                fontSize: 32,
                fontWeight: 700,
                color: palette.ink,
              }}
            >
              线要素
            </span>
            <span
              style={{
                fontFamily: SERIF,
                fontSize: 20,
                fontWeight: 700,
                background: palette.blue + '22',
                color: palette.blue,
                padding: '4px 14px',
                borderRadius: 20,
              }}
            >
              一维折线实体
            </span>
          </div>

          <div
            style={{
              height: 220,
              background: palette.paper,
              borderRadius: 20,
              border: `1px dashed ${palette.ink}30`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <svg width="100%" height="100%" viewBox="0 0 450 220">
              <path
                d="M 50 160 Q 150 40 250 140 T 400 70"
                fill="none"
                stroke={palette.blue}
                strokeWidth={5}
                strokeLinecap="round"
              />
              {[
                { x: 50, y: 160, label: 'P₁' },
                { x: 170, y: 80, label: 'P₂' },
                { x: 280, y: 145, label: 'P₃' },
                { x: 400, y: 70, label: 'P₄' },
              ].map((pt) => (
                <g key={pt.label} transform={`translate(${pt.x}, ${pt.y})`}>
                  <circle
                    cx={0}
                    cy={0}
                    r={7}
                    fill={palette.blue}
                    stroke={palette.paperLight}
                    strokeWidth={2}
                  />
                  <text
                    x={0}
                    y={-14}
                    textAnchor="middle"
                    fill={palette.ink}
                    fontFamily={SERIF}
                    fontSize={18}
                    fontWeight={700}
                  >
                    {pt.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <div
            style={{
              marginTop: 20,
              fontFamily: SERIF,
              fontSize: 22,
              background: palette.ink + '08',
              padding: 16,
              borderRadius: 14,
              color: palette.inkSoft,
              lineHeight: 1.6,
            }}
          >
            <div style={{ color: palette.blue, fontWeight: 700 }}>
              几何描述：有序顶点序列
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>顶点集合：</span>
              <Latex
                math="L = \{P_1, P_2, P_3, P_4\}"
                style={{ fontSize: 20, color: palette.ink }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>长度计算：</span>
              <Latex
                math="\text{Len} = \sum \|P_{i+1} - P_i\|"
                style={{ fontSize: 20, color: palette.ink }}
              />
            </div>
          </div>
        </div>

        {/* 卡片 3: 面要素 */}
        <div
          style={{
            flex: 1,
            background: palette.paperLight,
            border: `2px solid ${card3Active ? palette.sage : palette.ink + '20'}`,
            borderRadius: 28,
            padding: 32,
            boxShadow: `0 16px 40px ${palette.ink}0e`,
            opacity: card3Active
              ? 1
              : interpolate(
                  frame,
                  [T.act1_store_vertices, T.act1_store_vertices + 20],
                  [0, 0.4],
                  clamp
                ),
            transform: card3Active
              ? `translateY(${(1 - card3Spring) * 30}px)`
              : 'none',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
            }}
          >
            <span
              style={{
                fontFamily: SERIF,
                fontSize: 32,
                fontWeight: 700,
                color: palette.ink,
              }}
            >
              面要素
            </span>
            <span
              style={{
                fontFamily: SERIF,
                fontSize: 20,
                fontWeight: 700,
                background: palette.sage + '22',
                color: palette.sage,
                padding: '4px 14px',
                borderRadius: 20,
              }}
            >
              二维多边形实体
            </span>
          </div>

          <div
            style={{
              height: 220,
              background: palette.paper,
              borderRadius: 20,
              border: `1px dashed ${palette.ink}30`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <svg width="100%" height="100%" viewBox="0 0 450 220">
              <polygon
                points="70,170 120,50 330,40 390,160 220,195"
                fill={palette.sage + '33'}
                stroke={palette.sage}
                strokeWidth={4}
                strokeLinejoin="round"
              />
              {[
                { x: 70, y: 170, label: 'V₁' },
                { x: 120, y: 50, label: 'V₂' },
                { x: 330, y: 40, label: 'V₃' },
                { x: 390, y: 160, label: 'V₄' },
                { x: 220, y: 195, label: 'V₅' },
              ].map((pt) => (
                <g key={pt.label} transform={`translate(${pt.x}, ${pt.y})`}>
                  <circle
                    cx={0}
                    cy={0}
                    r={6}
                    fill={palette.sage}
                    stroke={palette.paperLight}
                    strokeWidth={2}
                  />
                  <text
                    x={0}
                    y={-10}
                    textAnchor="middle"
                    fill={palette.ink}
                    fontFamily={SERIF}
                    fontSize={16}
                    fontWeight={700}
                  >
                    {pt.label}
                  </text>
                </g>
              ))}
              <text
                x="225"
                y="115"
                textAnchor="middle"
                fill={palette.sage}
                fontFamily={SERIF}
                fontSize={26}
                fontWeight={700}
              >
                闭合坐标环
              </text>
            </svg>
          </div>

          <div
            style={{
              marginTop: 20,
              fontFamily: SERIF,
              fontSize: 22,
              background: palette.ink + '08',
              padding: 16,
              borderRadius: 14,
              color: palette.inkSoft,
              lineHeight: 1.6,
            }}
          >
            <div style={{ color: palette.sage, fontWeight: 700 }}>
              几何描述：首尾相连闭合环
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>坐标序列：</span>
              <Latex
                math="[V_1, V_2, V_3, V_4, V_5, V_1]"
                style={{ fontSize: 20, color: palette.ink }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>闭合约束：</span>
              <Latex
                math="V_{\text{start}} = V_{\text{end}}"
                style={{ fontSize: 20, color: palette.ink }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// Act 2: 精度与缝隙阶段 (真实地理抽象 + 显微真实裂隙重叠 + LaTeX 公式)
// =============================================================================
const PrecisionGapStage: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const T = getTimestamps(fps);

  if (frame < T.act2_start - 10 || frame > T.act3_start + Math.round(fps * 0.5))
    return null;

  const fadeIn = interpolate(
    frame,
    [T.act2_start, T.act2_start + Math.round(fps * 0.4)],
    [0, 1],
    clamp
  );
  const fadeOut = interpolate(
    frame,
    [T.act3_start - Math.round(fps * 0.4), T.act3_start],
    [1, 0],
    clamp
  );

  const zoomProgress = interpolate(
    frame,
    [T.act2_zoom_in, T.act2_zoom_in + Math.round(fps * 1.5)],
    [0, 1],
    clamp
  );

  const divergeProgress = interpolate(
    frame,
    [T.act2_lines_diverge, T.act2_lines_diverge + Math.round(fps * 1.2)],
    [0, 1],
    clamp
  );

  const calloutSpring = spring({
    frame: frame - T.act2_gap_and_overlap,
    fps,
    config: { damping: 18, stiffness: 80 },
  });

  const borderPulse =
    frame >= T.act2_adjacent_border && frame < T.act2_zoom_in
      ? Math.sin(((frame - T.act2_adjacent_border) / fps) * Math.PI * 4) * 0.3 + 0.7
      : 1;

  // 摄像机镜头平滑推拉参数 (由远及近)
  const cameraScale = 1 + zoomProgress * 1.35; // 1.0 -> 2.35
  const cameraTx = zoomProgress * -40;
  const cameraTy = zoomProgress * -10;

  // 边界微观偏离量 (随采样误差平滑张开)
  const d = 55 * divergeProgress;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: Math.min(fadeIn, fadeOut),
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 40,
          width: 1720,
          height: 740,
          alignItems: 'stretch',
        }}
      >
        {/* 左侧：赣闽两省地图与显微边界平滑推镜 */}
        <div
          style={{
            flex: 1.25,
            background: palette.paperLight,
            border: `2px solid ${palette.ink}20`,
            borderRadius: 28,
            boxShadow: `0 20px 48px ${palette.ink}12`,
            padding: 30,
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* 状态指示标 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
              zIndex: 10,
              gap: 16,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                flexWrap: 'nowrap',
                whiteSpace: 'nowrap',
              }}
            >
              <span
                style={{
                  background: palette.ink,
                  color: palette.paperLight,
                  padding: '6px 16px',
                  borderRadius: 12,
                  fontSize: 22,
                  fontWeight: 700,
                  fontFamily: SERIF,
                }}
              >
                多边形边界重合案例
              </span>
              <span
                style={{
                  fontFamily: SERIF,
                  fontSize: 24,
                  fontWeight: 700,
                  color: palette.ink,
                }}
              >
                江西省（西侧内陆）与 福建省（东侧沿海）
              </span>
            </div>

            {zoomProgress > 0.05 && (
              <div
                style={{
                  opacity: zoomProgress,
                  background: palette.clay + '18',
                  border: `2px solid ${palette.clay}`,
                  color: palette.clay,
                  padding: '4px 12px',
                  borderRadius: 20,
                  fontSize: 18,
                  fontWeight: 700,
                  fontFamily: SERIF,
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  flexShrink: 0,
                }}
              >
                <span>🔍 边界局部特写</span>
              </div>
            )}
          </div>

          {/* 地图主视口 (单画布平滑连续镜头) */}
          <div
            style={{
              flex: 1,
              background: palette.paper,
              borderRadius: 20,
              border: `1px solid ${palette.ink}20`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* 摄像机变换层 */}
            <div
              style={{
                width: '100%',
                height: '100%',
                transformOrigin: '48% 50%',
                transform: `scale(${cameraScale}) translate(${cameraTx}px, ${cameraTy}px)`,
              }}
            >
              <svg width="100%" height="100%" viewBox="0 0 900 560">
                <defs>
                  {/* 背景坐标细网格 */}
                  <pattern
                    id="grid-sub"
                    width="30"
                    height="30"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 30 0 L 0 0 0 30"
                      fill="none"
                      stroke={palette.ink + (zoomProgress > 0.3 ? '18' : '0d')}
                      strokeWidth="1"
                    />
                  </pattern>

                  {/* 拓扑裂隙斜线填充 */}
                  <pattern
                    id="sliver-stripes"
                    width="10"
                    height="10"
                    patternTransform="rotate(45 0 0)"
                    patternUnits="userSpaceOnUse"
                  >
                    <line
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="10"
                      stroke={palette.clay}
                      strokeWidth="3"
                    />
                  </pattern>
                </defs>

                <rect width="900" height="560" fill="url(#grid-sub)" />

                {/* 江西省多边形面 (西侧，含边界微观曲线) */}
                <path
                  d={`M 340 70 L 220 90 L 140 180 L 120 280 L 140 390 L 220 490 L 340 510 L 420 480 C ${420 + d} 410, ${410 + d} 350, 410 280 C ${410 - d} 210, ${430 - d} 150, 430 80 Z`}
                  fill={palette.sage + '28'}
                  stroke={palette.sage}
                  strokeWidth={3}
                  strokeLinejoin="round"
                />

                {/* 福建省多边形面 (东侧，含边界微观曲线) */}
                <path
                  d={`M 430 80 L 560 80 L 680 110 L 730 210 L 710 300 L 660 390 L 570 470 L 440 510 L 420 480 C ${420 - d} 410, ${410 - d} 350, 410 280 C ${410 + d} 210, ${430 + d} 150, 430 80 Z`}
                  fill={palette.blue + '28'}
                  stroke={palette.blue}
                  strokeWidth={3}
                  strokeLinejoin="round"
                />

                {/* 1. 拓扑裂隙区域 (严格限定在上交点 430,80 与中交点 410,280 之间，无溢出) */}
                {divergeProgress > 0.01 && (
                  <path
                    d={`M 430 80 C ${430 - d} 150, ${410 - d} 210, 410 280 C ${410 + d} 210, ${430 + d} 150, 430 80 Z`}
                    fill="url(#sliver-stripes)"
                    stroke={palette.clay}
                    strokeWidth={2}
                    opacity={divergeProgress}
                  />
                )}

                {/* 2. 交叉重叠区域 (严格限定在中交点 410,280 与下交点 420,480 之间，无溢出) */}
                {divergeProgress > 0.01 && (
                  <path
                    d={`M 410 280 C ${410 + d} 350, ${420 + d} 410, 420 480 C ${420 - d} 410, ${410 - d} 350, 410 280 Z`}
                    fill={palette.amber + '88'}
                    stroke={palette.amber}
                    strokeWidth={2}
                    opacity={divergeProgress}
                  />
                )}

                {/* 江西数字化边界曲线 (绿色) */}
                <path
                  d={`M 430 80 C ${430 - d} 150, ${410 - d} 210, 410 280 C ${410 + d} 350, ${420 + d} 410, 420 480`}
                  fill="none"
                  stroke={palette.sage}
                  strokeWidth={divergeProgress > 0.1 ? 5 : 4}
                  strokeLinecap="round"
                />

                {/* 福建数字化边界曲线 (蓝色) */}
                <path
                  d={`M 430 80 C ${430 + d} 150, ${410 + d} 210, 410 280 C ${410 - d} 350, ${420 - d} 410, 420 480`}
                  fill="none"
                  stroke={palette.blue}
                  strokeWidth={divergeProgress > 0.1 ? 5 : 4}
                  strokeLinecap="round"
                />

                {/* 宏观视角共享省界高亮 (未放大时闪烁提示) */}
                {zoomProgress < 0.8 && (
                  <path
                    d="M 430 80 C 430 150, 410 210, 410 280 C 410 350, 420 410, 420 480"
                    fill="none"
                    stroke={palette.amber}
                    strokeWidth={6}
                    strokeDasharray="6 6"
                    opacity={(1 - zoomProgress) * borderPulse}
                  />
                )}

                {/* 宏观省份名称 (随放大平滑淡出) */}
                <g opacity={Math.max(0, 1 - zoomProgress * 2)}>
                  <text
                    x="270"
                    y="290"
                    textAnchor="middle"
                    fill={palette.sage}
                    fontFamily={SERIF}
                    fontSize={36}
                    fontWeight={700}
                  >
                    江西省 (P₁)
                  </text>
                  <text
                    x="590"
                    y="290"
                    textAnchor="middle"
                    fill={palette.blue}
                    fontFamily={SERIF}
                    fontSize={36}
                    fontWeight={700}
                  >
                    福建省 (P₂)
                  </text>
                  <text
                    x="420"
                    y="535"
                    textAnchor="middle"
                    fill={palette.amber}
                    fontFamily={SERIF}
                    fontSize={22}
                    fontWeight={700}
                  >
                    ▲ 共享天然山脊省界（各自独立数字化）
                  </text>
                </g>

                {/* 显微多边形标注 (随放大平滑淡入，位于放大后的两侧视野中心) */}
                <g opacity={Math.max(0, (zoomProgress - 0.4) * 1.6)}>
                  <text
                    x="360"
                    y="280"
                    textAnchor="middle"
                    fill={palette.sage}
                    fontFamily={SERIF}
                    fontSize={22}
                    fontWeight={700}
                  >
                    江西省 (P₁)
                  </text>
                  <text
                    x="490"
                    y="280"
                    textAnchor="middle"
                    fill={palette.blue}
                    fontFamily={SERIF}
                    fontSize={22}
                    fontWeight={700}
                  >
                    福建省 (P₂)
                  </text>
                </g>
              </svg>
            </div>

            {/* 显微标注悬浮卡片 (仅在放大且出现裂隙重叠后优雅滑入) */}
            {calloutSpring > 0.01 && (
              <>
                {/* 拓扑缝隙标注卡片 (指向上部缝隙) */}
                <div
                  style={{
                    position: 'absolute',
                    top: 20,
                    left: 20,
                    background: palette.paperLight,
                    border: `2px solid ${palette.clay}`,
                    borderRadius: 16,
                    padding: '10px 18px',
                    boxShadow: `0 8px 24px ${palette.ink}15`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    opacity: calloutSpring,
                    transform: `translateY(${(1 - calloutSpring) * -15}px)`,
                  }}
                >
                  <span style={{ fontSize: 22 }}>⚠️</span>
                  <span
                    style={{
                      fontFamily: SERIF,
                      fontSize: 20,
                      fontWeight: 700,
                      color: palette.clay,
                    }}
                  >
                    拓扑缝隙（漏空空白）：边界未闭合，产生无主带
                  </span>
                </div>

                {/* 交叉重叠标注卡片 (指向下部重叠) */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 20,
                    right: 20,
                    background: palette.paperLight,
                    border: `2px solid ${palette.amber}`,
                    borderRadius: 16,
                    padding: '10px 18px',
                    boxShadow: `0 8px 24px ${palette.ink}15`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    opacity: calloutSpring,
                    transform: `translateY(${(1 - calloutSpring) * 15}px)`,
                  }}
                >
                  <span style={{ fontSize: 22 }}>⚠️</span>
                  <span
                    style={{
                      fontFamily: SERIF,
                      fontSize: 20,
                      fontWeight: 700,
                      color: palette.amber,
                    }}
                  >
                    交叉重叠（自相交）：双重存储引发行政权属重叠
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 右侧：存储机制与浮点误差深度解析 (LaTeX 公式) */}
        <div
          style={{
            flex: 0.95,
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          {/* 双份存储机制 */}
          <div
            style={{
              background: palette.paperLight,
              border: `2px solid ${palette.ink}20`,
              borderRadius: 24,
              padding: 24,
              boxShadow: `0 12px 32px ${palette.ink}0d`,
            }}
          >
            <div
              style={{
                fontFamily: SERIF,
                fontSize: 26,
                fontWeight: 700,
                color: palette.ink,
                marginBottom: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span style={{ color: palette.clay }}>⚠️ 冗余双份存储机制</span>
            </div>

            <div
              style={{
                fontFamily: SERIF,
                fontSize: 20,
                background: palette.ink + '08',
                padding: 16,
                borderRadius: 14,
                lineHeight: 1.8,
                color: palette.inkSoft,
              }}
            >
              <div style={{ color: palette.sage, fontWeight: 700 }}>
                // 江西省多边形环独立记录一份坐标
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>江西边界顶点：</span>
                <Latex
                  math="P_{\text{赣}} = (118.234501,\; 27.982103)"
                  style={{ fontSize: 19, color: palette.ink }}
                />
              </div>
              <div
                style={{
                  color: palette.blue,
                  fontWeight: 700,
                  marginTop: 6,
                }}
              >
                // 福建省多边形环又独立记录一份坐标
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>福建边界顶点：</span>
                <Latex
                  math="P_{\text{闽}} = (118.234498,\; 27.982107)"
                  style={{ fontSize: 19, color: palette.ink }}
                />
              </div>
            </div>
          </div>

          {/* 浮点数截断误差 */}
          <div
            style={{
              flex: 1,
              background: palette.paperLight,
              border: `2px solid ${palette.clay}44`,
              borderRadius: 24,
              padding: 24,
              boxShadow: `0 12px 32px ${palette.ink}0d`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 26,
                  fontWeight: 700,
                  color: palette.clay,
                  marginBottom: 12,
                }}
              >
                浮点数计算精度截断与容差失效
              </div>

              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 22,
                  color: palette.inkSoft,
                  lineHeight: 1.6,
                }}
              >
                在双精度浮点计算中存在固有的舍入容差{' '}
                <Latex
                  math="\varepsilon \approx 10^{-7} \sim 10^{-16}"
                  style={{ fontSize: 20, color: palette.ink }}
                />
                。
                <br />
                同一条物理边界被两个多边形分别离散存储，
                <span style={{ color: palette.clay, fontWeight: 700 }}>
                  微小的坐标偏差
                </span>
                在地图无级缩放时被无限放大！
              </div>
            </div>

            <div
              style={{
                background: palette.clay + '12',
                border: `1px solid ${palette.clay}40`,
                padding: '14px 20px',
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div style={{ fontSize: 28 }}>💥</div>
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 22,
                  fontWeight: 700,
                  color: palette.clay,
                }}
              >
                后果：碎屑多边形、非法缝隙与空间拓扑撕裂
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// Act 3: 拓扑关系缺失阶段 (纯中文 + LaTeX 公式)
// =============================================================================
const TopologyDefectStage: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const T = getTimestamps(fps);

  if (frame < T.act3_start - 10 || frame > T.act4_start + Math.round(fps * 0.5))
    return null;

  const fadeIn = interpolate(
    frame,
    [T.act3_start, T.act3_start + Math.round(fps * 0.4)],
    [0, 1],
    clamp
  );
  const fadeOut = interpolate(
    frame,
    [T.act4_start - Math.round(fps * 0.4), T.act4_start],
    [1, 0],
    clamp
  );

  const q1Spring = spring({
    frame: frame - T.act3_who_is_neighbor,
    fps,
    config: { damping: 18, stiffness: 80 },
  });
  const q2Spring = spring({
    frame: frame - T.act3_which_road_connect,
    fps,
    config: { damping: 18, stiffness: 80 },
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: Math.min(fadeIn, fadeOut),
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 40,
          width: 1720,
          alignItems: 'stretch',
        }}
      >
        {/* 左侧：人类直觉空间认知 */}
        <div
          style={{
            flex: 1,
            background: palette.paperLight,
            border: `2px solid ${palette.sage}40`,
            borderRadius: 28,
            padding: 36,
            boxShadow: `0 16px 44px ${palette.ink}10`,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 24,
            }}
          >
            <span
              style={{
                fontFamily: SERIF,
                fontSize: 32,
                fontWeight: 700,
                color: palette.sage,
              }}
            >
              人类视角：天然空间关联
            </span>
            <span
              style={{
                background: palette.sage + '20',
                color: palette.sage,
                padding: '6px 14px',
                borderRadius: 14,
                fontFamily: SERIF,
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              视觉认知一目了然
            </span>
          </div>

          <div
            style={{
              flex: 1,
              background: palette.paper,
              borderRadius: 20,
              border: `1px solid ${palette.ink}20`,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 24,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                background: palette.paperLight,
                padding: '18px 24px',
                borderRadius: 16,
                border: `1px solid ${palette.sage}40`,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: palette.sage,
                  color: palette.paperLight,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  fontWeight: 700,
                }}
              >
                ✓
              </div>
              <div style={{ fontFamily: SERIF, fontSize: 26, color: palette.ink }}>
                <b>相邻关系：</b>眼见江西与福建共享武夷山脉省界
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                background: palette.paperLight,
                padding: '18px 24px',
                borderRadius: 16,
                border: `1px solid ${palette.sage}40`,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: palette.sage,
                  color: palette.paperLight,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  fontWeight: 700,
                }}
              >
                ✓
              </div>
              <div style={{ fontFamily: SERIF, fontSize: 26, color: palette.ink }}>
                <b>连通关系：</b>直观识别两条公路相交于十字交叉路口
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：计算机在实体模型下的空间盲区 */}
        <div
          style={{
            flex: 1,
            background: palette.paperLight,
            border: `2px solid ${palette.clay}40`,
            borderRadius: 28,
            padding: 36,
            boxShadow: `0 16px 44px ${palette.ink}10`,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 24,
            }}
          >
            <span
              style={{
                fontFamily: SERIF,
                fontSize: 32,
                fontWeight: 700,
                color: palette.clay,
              }}
            >
              计算机视角：孤立坐标之海
            </span>
            <span
              style={{
                background: palette.clay + '20',
                color: palette.clay,
                padding: '6px 14px',
                borderRadius: 14,
                fontFamily: SERIF,
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              拓扑关系彻底缺失
            </span>
          </div>

          <div
            style={{
              flex: 1,
              background: palette.paper,
              borderRadius: 20,
              border: `1px solid ${palette.ink}20`,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 20,
            }}
          >
            {/* 提问卡片 1 */}
            <div
              style={{
                background: palette.paperLight,
                padding: '18px 24px',
                borderRadius: 16,
                border: `2px solid ${palette.clay}`,
                opacity: interpolate(
                  frame,
                  [T.act3_who_is_neighbor, T.act3_who_is_neighbor + 16],
                  [0, 1],
                  clamp
                ),
                transform: `translateX(${(1 - q1Spring) * 30}px)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ fontFamily: SERIF, fontSize: 26, color: palette.ink }}>
                ❓ 计算机知道<b>谁和谁相邻</b>吗？
              </div>
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 20,
                  fontWeight: 700,
                  color: palette.clay,
                  background: palette.clay + '18',
                  padding: '6px 14px',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>未知（需</span>
                <Latex
                  math="\mathcal{O}(N^2)"
                  style={{ fontSize: 18, color: palette.clay }}
                />
                <span>求交计算）</span>
              </div>
            </div>

            {/* 提问卡片 2 */}
            <div
              style={{
                background: palette.paperLight,
                padding: '18px 24px',
                borderRadius: 16,
                border: `2px solid ${palette.clay}`,
                opacity: interpolate(
                  frame,
                  [T.act3_which_road_connect, T.act3_which_road_connect + 16],
                  [0, 1],
                  clamp
                ),
                transform: `translateX(${(1 - q2Spring) * 30}px)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ fontFamily: SERIF, fontSize: 26, color: palette.ink }}>
                ❓ 计算机知道<b>哪条路连着哪条路</b>吗？
              </div>
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 20,
                  fontWeight: 700,
                  color: palette.clay,
                  background: palette.clay + '18',
                  padding: '6px 14px',
                  borderRadius: 10,
                }}
              >
                未知（无连通网络索引）
              </div>
            </div>

            {/* 总结卡片 */}
            <div
              style={{
                background: palette.ink + '08',
                padding: '12px 20px',
                borderRadius: 12,
                fontFamily: SERIF,
                fontSize: 22,
                color: palette.inkSoft,
                textAlign: 'center',
              }}
            >
              实体型模型只记录了“几何图形长什么样”，却没有记录“空间关系是什么”
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// Act 4: 弧段-节点拓扑模型阶段
// 纠正起终点与左右拓扑对应：V1在南部(下方起点)，V2在北部(上方终点)，朝向向上(↑)
// 沿 V1->V2 看：左侧为多边形 P1 (江西)，右侧为多边形 P2 (福建)
// =============================================================================
const ArcNodeModelStage: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const T = getTimestamps(fps);

  if (frame < T.act4_start - 10 || frame > T.act5_start + Math.round(fps * 0.5))
    return null;

  const fadeIn = interpolate(
    frame,
    [T.act4_start, T.act4_start + Math.round(fps * 0.4)],
    [0, 1],
    clamp
  );
  const fadeOut = interpolate(
    frame,
    [T.act5_start - Math.round(fps * 0.4), T.act5_start],
    [1, 0],
    clamp
  );

  const nodeSpring = spring({
    frame: frame - T.act4_extract_nodes,
    fps,
    config: { damping: 16, stiffness: 90 },
  });

  const isArc1Active = frame >= T.act4_arc1_from_v1;
  const arc1Pulse = Math.sin((frame - T.act4_arc1_from_v1) * 0.15) * 0.5 + 0.5;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: Math.min(fadeIn, fadeOut),
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 36,
          width: 1720,
          height: 740,
          alignItems: 'stretch',
        }}
      >
        {/* 左侧：图论拓扑网络解构图 */}
        <div
          style={{
            flex: 1.15,
            background: palette.paperLight,
            border: `2px solid ${palette.ink}20`,
            borderRadius: 28,
            padding: 28,
            boxShadow: `0 16px 44px ${palette.ink}10`,
            display: 'flex',
            flexDirection: 'column',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span
                style={{
                  background: palette.amber,
                  color: palette.paperLight,
                  padding: '6px 16px',
                  borderRadius: 12,
                  fontSize: 22,
                  fontWeight: 700,
                  fontFamily: SERIF,
                }}
              >
                图论空间拓扑网络
              </span>
              <span
                style={{
                  fontFamily: SERIF,
                  fontSize: 24,
                  fontWeight: 700,
                  color: palette.ink,
                }}
              >
                交点 ➔ 节点 · 共享边 ➔ 弧段 · 记录左右多边形
              </span>
            </div>
          </div>

          <div
            style={{
              flex: 1,
              background: palette.paper,
              borderRadius: 20,
              border: `1px solid ${palette.ink}20`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <svg width="100%" height="100%" viewBox="0 0 850 560">
              <defs>
                <marker
                  id="arrow-arc1-up"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="8"
                  markerHeight="8"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill={palette.amber} />
                </marker>
              </defs>

              {/* 多边形 P1 (江西) 真实特征几何面 */}
              <polygon
                points="120,255 425,75 425,435"
                fill={palette.sage + '20'}
                stroke="none"
              />
              {/* 多边形 P2 (福建) 真实特征几何面 */}
              <polygon
                points="425,75 730,255 425,435"
                fill={palette.blue + '20'}
                stroke="none"
              />

              {/* 弧段 A2: V1(425,435) -> V3(120,255) */}
              <path
                d="M 425 435 L 120 255"
                fill="none"
                stroke={palette.sage}
                strokeWidth={4}
              />
              {/* 弧段 A3: V3(120,255) -> V2(425,75) */}
              <path
                d="M 120 255 L 425 75"
                fill="none"
                stroke={palette.sage}
                strokeWidth={4}
              />
              {/* 弧段 A4: V2(425,75) -> V4(730,255) */}
              <path
                d="M 425 75 L 730 255"
                fill="none"
                stroke={palette.blue}
                strokeWidth={4}
              />
              {/* 弧段 A5: V4(730,255) -> V1(425,435) */}
              <path
                d="M 730 255 L 425 435"
                fill="none"
                stroke={palette.blue}
                strokeWidth={4}
              />

              {/* 核心共享弧段 A1: 起点 V1(425,435, 南部) -> 终点 V2(425,75, 北部)，箭头向上(↑) */}
              <path
                d="M 425 435 L 425 75"
                fill="none"
                stroke={isArc1Active ? palette.amber : palette.ink}
                strokeWidth={isArc1Active ? 8 : 5}
                markerEnd="url(#arrow-arc1-up)"
              />

              {/* 观察视角提示标 */}
              <g transform="translate(425, 520)">
                <text
                  x="0"
                  y="0"
                  textAnchor="middle"
                  fill={palette.amber}
                  fontFamily={SERIF}
                  fontSize={20}
                  fontWeight={700}
                >
                  ▲ 沿弧段前进方向（起点 V₁ ➔ 终点 V₂）观察：左手边为江西 P₁，右手边为福建 P₂
                </text>
              </g>
            </svg>

            {/* HTML/KaTeX 浮层元素 */}
            {/* 弧段 A1 标识胶囊 (居中) */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '46%',
                transform: 'translate(-50%, -50%)',
                background: isArc1Active ? palette.amber : palette.paperLight,
                border: `2px solid ${palette.amber}`,
                borderRadius: 12,
                padding: '6px 18px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Latex
                math="A_1\;(\uparrow)"
                style={{
                  fontSize: 22,
                  color: isArc1Active ? palette.paperLight : palette.ink,
                  fontWeight: 'bold',
                }}
              />
            </div>

            {/* 多边形 P1 (江西) 标识 */}
            <div
              style={{
                position: 'absolute',
                left: '28%',
                top: '46%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
              }}
            >
              <Latex
                math="P_1"
                style={{ fontSize: 34, color: palette.sage, fontWeight: 'bold' }}
              />
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 20,
                  fontWeight: 700,
                  color: palette.inkSoft,
                  marginTop: 4,
                }}
              >
                （左多边形：江西）
              </div>
            </div>

            {/* 多边形 P2 (福建) 标识 */}
            <div
              style={{
                position: 'absolute',
                left: '72%',
                top: '46%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
              }}
            >
              <Latex
                math="P_2"
                style={{ fontSize: 34, color: palette.blue, fontWeight: 'bold' }}
              />
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 20,
                  fontWeight: 700,
                  color: palette.inkSoft,
                  marginTop: 4,
                }}
              >
                （右多边形：福建）
              </div>
            </div>

            {/* 节点 V1 (起点 / 南部) */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                bottom: 84,
                transform: `translate(-50%, 0) scale(${nodeSpring})`,
                background: palette.paperLight,
                border: `2px solid ${palette.amber}`,
                borderRadius: 10,
                padding: '4px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              }}
            >
              <Latex
                math="V_1\;(\text{起点})"
                style={{ fontSize: 20, color: palette.amber, fontWeight: 'bold' }}
              />
            </div>

            {/* 节点 V2 (终点 / 北部) */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: 24,
                transform: `translate(-50%, 0) scale(${nodeSpring})`,
                background: palette.paperLight,
                border: `2px solid ${palette.amber}`,
                borderRadius: 10,
                padding: '4px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              }}
            >
              <Latex
                math="V_2\;(\text{终点})"
                style={{ fontSize: 20, color: palette.amber, fontWeight: 'bold' }}
              />
            </div>

            {/* 节点 V3 */}
            <div
              style={{
                position: 'absolute',
                left: '14%',
                top: '51%',
                transform: `translate(-50%, 0) scale(${nodeSpring})`,
                background: palette.paperLight,
                border: `2px solid ${palette.inkSoft}`,
                borderRadius: 8,
                padding: '2px 10px',
              }}
            >
              <Latex
                math="V_3"
                style={{ fontSize: 18, color: palette.inkSoft, fontWeight: 'bold' }}
              />
            </div>

            {/* 节点 V4 */}
            <div
              style={{
                position: 'absolute',
                left: '86%',
                top: '51%',
                transform: `translate(-50%, 0) scale(${nodeSpring})`,
                background: palette.paperLight,
                border: `2px solid ${palette.inkSoft}`,
                borderRadius: 8,
                padding: '2px 10px',
              }}
            >
              <Latex
                math="V_4"
                style={{ fontSize: 18, color: palette.inkSoft, fontWeight: 'bold' }}
              />
            </div>
          </div>
        </div>

        {/* 右侧：拓扑关系表 (纯中文表头 + LaTeX 符号) */}
        <div
          style={{
            flex: 0.85,
            background: palette.paperLight,
            border: `2px solid ${palette.ink}20`,
            borderRadius: 28,
            padding: 28,
            boxShadow: `0 16px 44px ${palette.ink}10`,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 28,
              fontWeight: 700,
              color: palette.ink,
              marginBottom: 18,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <span
              style={{
                background: palette.ink,
                color: palette.paperLight,
                padding: '4px 14px',
                borderRadius: 10,
                fontSize: 20,
              }}
            >
              数据库
            </span>
            <span>弧段拓扑关系表</span>
          </div>

          <div
            style={{
              flex: 1,
              background: palette.paper,
              borderRadius: 20,
              border: `1px solid ${palette.ink}20`,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* 表头 */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1.2fr 1.2fr',
                background: palette.ink,
                color: palette.paperLight,
                padding: '14px 10px',
                fontFamily: SERIF,
                fontSize: 20,
                fontWeight: 700,
                textAlign: 'center',
              }}
            >
              <div>弧段</div>
              <div>起点</div>
              <div>终点</div>
              <div>左多边形</div>
              <div>右多边形</div>
            </div>

            {/* 表格内容行 */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* 第 1 行: A1 核心高亮行 (起点 V1, 终点 V2, 左 P1 江西, 右 P2 福建) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr 1.2fr 1.2fr',
                  padding: '14px 10px',
                  textAlign: 'center',
                  background: isArc1Active
                    ? palette.amber + '22'
                    : 'transparent',
                  borderBottom: `2px solid ${
                    isArc1Active ? palette.amber : palette.ink + '15'
                  }`,
                  alignItems: 'center',
                  transform: isArc1Active
                    ? `scale(${1 + arc1Pulse * 0.02})`
                    : 'none',
                }}
              >
                <div>
                  <Latex
                    math="A_1"
                    style={{ fontSize: 22, color: palette.amber, fontWeight: 'bold' }}
                  />
                </div>
                <div>
                  <Latex
                    math="V_1"
                    style={{ fontSize: 22, color: palette.amber, fontWeight: 'bold' }}
                  />
                </div>
                <div>
                  <Latex
                    math="V_2"
                    style={{ fontSize: 22, color: palette.amber, fontWeight: 'bold' }}
                  />
                </div>
                <div
                  style={{
                    color: palette.sage,
                    fontFamily: SERIF,
                    fontSize: 20,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                  }}
                >
                  <span>江西（</span>
                  <Latex
                    math="P_1"
                    style={{ fontSize: 18, color: palette.sage }}
                  />
                  <span>）</span>
                </div>
                <div
                  style={{
                    color: palette.blue,
                    fontFamily: SERIF,
                    fontSize: 20,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                  }}
                >
                  <span>福建（</span>
                  <Latex
                    math="P_2"
                    style={{ fontSize: 18, color: palette.blue }}
                  />
                  <span>）</span>
                </div>
              </div>

              {/* 其余弧段行 */}
              {[
                {
                  id: 'A_2',
                  from: 'V_1',
                  to: 'V_3',
                  left: '外界',
                  right: '江西',
                },
                {
                  id: 'A_3',
                  from: 'V_3',
                  to: 'V_2',
                  left: '外界',
                  right: '江西',
                },
                {
                  id: 'A_4',
                  from: 'V_2',
                  to: 'V_4',
                  left: '外界',
                  right: '福建',
                },
                {
                  id: 'A_5',
                  from: 'V_4',
                  to: 'V_1',
                  left: '外界',
                  right: '福建',
                },
              ].map((row) => (
                <div
                  key={row.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr 1.2fr 1.2fr',
                    padding: '12px 10px',
                    textAlign: 'center',
                    borderBottom: `1px solid ${palette.ink}10`,
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <Latex
                      math={row.id}
                      style={{ fontSize: 20, color: palette.inkSoft }}
                    />
                  </div>
                  <div>
                    <Latex
                      math={row.from}
                      style={{ fontSize: 20, color: palette.inkSoft }}
                    />
                  </div>
                  <div>
                    <Latex
                      math={row.to}
                      style={{ fontSize: 20, color: palette.inkSoft }}
                    />
                  </div>
                  <div
                    style={{
                      fontFamily: SERIF,
                      fontSize: 19,
                      color: palette.inkSoft,
                    }}
                  >
                    {row.left}
                  </div>
                  <div
                    style={{
                      fontFamily: SERIF,
                      fontSize: 19,
                      color: palette.inkSoft,
                    }}
                  >
                    {row.right}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              marginTop: 16,
              background: palette.amber + '15',
              border: `1px solid ${palette.amber}50`,
              padding: '12px 18px',
              borderRadius: 14,
              fontFamily: SERIF,
              fontSize: 22,
              color: palette.ink,
              lineHeight: 1.5,
            }}
          >
            💡 <b>数据分离哲学：</b>几何坐标只在弧段库中记录一次；数据库表只存储清晰的
            <b>拓扑逻辑关系</b>。
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// Act 5: 空间智能跃迁阶段 (真实地理抽象 + 纯中文 + LaTeX 公式)
// =============================================================================
const SpatialIntelligenceStage: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const T = getTimestamps(fps);

  if (frame < T.act5_start - 10) return null;

  const fadeIn = interpolate(
    frame,
    [T.act5_start, T.act5_start + Math.round(fps * 0.4)],
    [0, 1],
    clamp
  );

  const card1Spring = spring({
    frame: frame - T.act5_start,
    fps,
    config: { damping: 18, stiffness: 75 },
  });
  const card2Spring = spring({
    frame: frame - T.act5_spatial_logic,
    fps,
    config: { damping: 18, stiffness: 75 },
  });

  const navProgress = interpolate(
    frame,
    [T.act5_along_arcs_nodes, T.act5_along_arcs_nodes + Math.round(fps * 2.8)],
    [0, 1],
    clamp
  );

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: fadeIn,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 36,
          width: 1720,
          height: 740,
          alignItems: 'stretch',
        }}
      >
        {/* 优势一：物理消除缝隙与零冗余 */}
        <div
          style={{
            flex: 1,
            background: palette.paperLight,
            border: `2px solid ${palette.sage}50`,
            borderRadius: 28,
            padding: 32,
            boxShadow: `0 16px 44px ${palette.ink}10`,
            transform: `translateY(${(1 - card1Spring) * 35}px)`,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
            }}
          >
            <span
              style={{
                fontFamily: SERIF,
                fontSize: 30,
                fontWeight: 700,
                color: palette.sage,
              }}
            >
              优势 1：物理彻底消除缝隙重叠
            </span>
            <span
              style={{
                background: palette.sage,
                color: palette.paperLight,
                padding: '6px 14px',
                borderRadius: 12,
                fontFamily: SERIF,
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              零冗余无缝
            </span>
          </div>

          <div
            style={{
              flex: 1,
              background: palette.paper,
              borderRadius: 20,
              border: `1px solid ${palette.ink}20`,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-around',
            }}
          >
            {/* 真实轮廓几何无缝拼接示意 */}
            <div
              style={{
                height: 220,
                background: palette.paperLight,
                borderRadius: 16,
                border: `1px solid ${palette.sage}40`,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <svg width="100%" height="100%" viewBox="0 0 500 220">
                {/* 江西省拓扑三角形 (左侧 P1) */}
                <polygon
                  points="65,105 250,30 250,180"
                  fill={palette.sage + '28'}
                  stroke={palette.sage}
                  strokeWidth={3}
                  strokeLinejoin="round"
                />

                {/* 福建省拓扑三角形 (右侧 P2) */}
                <polygon
                  points="250,30 435,105 250,180"
                  fill={palette.blue + '28'}
                  stroke={palette.blue}
                  strokeWidth={3}
                  strokeLinejoin="round"
                />

                {/* 唯一共享公共弧段 A1 (高亮金黄色) */}
                <line
                  x1="250"
                  y1="180"
                  x2="250"
                  y2="30"
                  stroke={palette.amber}
                  strokeWidth={6}
                  strokeLinecap="round"
                />

                {/* 节点小标记 */}
                {[
                  { x: 250, y: 175, label: 'V₁', tx: 12, ty: 5, anchor: 'start' as const },
                  { x: 250, y: 30, label: 'V₂', tx: 12, ty: 5, anchor: 'start' as const },
                  { x: 65, y: 102, label: 'V₃', tx: -12, ty: 5, anchor: 'end' as const },
                  { x: 435, y: 102, label: 'V₄', tx: 12, ty: 5, anchor: 'start' as const },
                ].map((pt) => (
                  <g key={pt.label} transform={`translate(${pt.x}, ${pt.y})`}>
                    <circle
                      cx={0}
                      cy={0}
                      r={5}
                      fill={palette.amber}
                      stroke={palette.paperLight}
                      strokeWidth={2}
                    />
                    <text
                      x={pt.tx}
                      y={pt.ty}
                      textAnchor={pt.anchor}
                      fill={palette.inkSoft}
                      fontFamily={SERIF}
                      fontSize={16}
                      fontWeight={700}
                    >
                      {pt.label}
                    </text>
                  </g>
                ))}

                <text
                  x="160"
                  y="112"
                  textAnchor="middle"
                  fill={palette.sage}
                  fontFamily={SERIF}
                  fontSize={24}
                  fontWeight={700}
                >
                  江西省 (P₁)
                </text>
                <text
                  x="340"
                  y="112"
                  textAnchor="middle"
                  fill={palette.blue}
                  fontFamily={SERIF}
                  fontSize={24}
                  fontWeight={700}
                >
                  福建省 (P₂)
                </text>
                <text
                  x="250"
                  y="208"
                  textAnchor="middle"
                  fill={palette.amber}
                  fontFamily={SERIF}
                  fontSize={19}
                  fontWeight={700}
                >
                  ★ 唯一共享公共弧段 A₁（单次物理存储）
                </text>
              </svg>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div
                style={{
                  background: palette.sage + '15',
                  padding: '12px 18px',
                  borderRadius: 12,
                  fontFamily: SERIF,
                  fontSize: 22,
                  color: palette.ink,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <span style={{ color: palette.sage, fontSize: 24 }}>✔</span>
                <span>
                  <b>公共边界单次存储：</b>内存与磁盘存储体积骤降 50%
                </span>
              </div>
              <div
                style={{
                  background: palette.sage + '15',
                  padding: '12px 18px',
                  borderRadius: 12,
                  fontFamily: SERIF,
                  fontSize: 22,
                  color: palette.ink,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <span style={{ color: palette.sage, fontSize: 24 }}>✔</span>
                <span>
                  <b>物理数学无缝：</b>放大任意倍数均 100% 严密贴合，无缝隙重叠
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 优势二：空间逻辑与路径导航规划 */}
        <div
          style={{
            flex: 1,
            background: palette.paperLight,
            border: `2px solid ${palette.blue}50`,
            borderRadius: 28,
            padding: 32,
            boxShadow: `0 16px 44px ${palette.ink}10`,
            transform: `translateY(${(1 - card2Spring) * 35}px)`,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
            }}
          >
            <span
              style={{
                fontFamily: SERIF,
                fontSize: 30,
                fontWeight: 700,
                color: palette.blue,
              }}
            >
              优势 2：具备空间逻辑与路网导航
            </span>
            <span
              style={{
                background: palette.blue,
                color: palette.paperLight,
                padding: '6px 14px',
                borderRadius: 12,
                fontFamily: SERIF,
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              网络拓扑导航
            </span>
          </div>

          <div
            style={{
              flex: 1,
              background: palette.paper,
              borderRadius: 20,
              border: `1px solid ${palette.ink}20`,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-around',
            }}
          >
            {/* 动态路网导航规划演示 */}
            <div
              style={{
                height: 220,
                background: palette.paperLight,
                borderRadius: 16,
                border: `1px solid ${palette.blue}40`,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <svg width="100%" height="100%" viewBox="0 0 500 220">
                {/* 拓扑路网骨架 */}
                <line
                  x1="80"
                  y1="160"
                  x2="250"
                  y2="50"
                  stroke={palette.ink + '25'}
                  strokeWidth="4"
                />
                <line
                  x1="250"
                  y1="50"
                  x2="420"
                  y2="160"
                  stroke={palette.ink + '25'}
                  strokeWidth="4"
                />
                <line
                  x1="80"
                  y1="160"
                  x2="250"
                  y2="180"
                  stroke={palette.ink + '25'}
                  strokeWidth="4"
                />
                <line
                  x1="250"
                  y1="180"
                  x2="420"
                  y2="160"
                  stroke={palette.ink + '25'}
                  strokeWidth="4"
                />
                <line
                  x1="250"
                  y1="50"
                  x2="250"
                  y2="180"
                  stroke={palette.ink + '25'}
                  strokeWidth="4"
                />

                {/* 导航规划高亮路径 */}
                <path
                  d="M 80 160 L 250 180 L 250 50 L 420 160"
                  fill="none"
                  stroke={palette.amber}
                  strokeWidth={6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* 节点 */}
                {[
                  { x: 80, y: 160, label: '起点' },
                  { x: 250, y: 180, label: 'V₁' },
                  { x: 250, y: 50, label: 'V₂' },
                  { x: 420, y: 160, label: '终点' },
                ].map((pt) => (
                  <g key={pt.label} transform={`translate(${pt.x}, ${pt.y})`}>
                    <circle
                      cx={0}
                      cy={0}
                      r={9}
                      fill={palette.amber}
                      stroke={palette.paperLight}
                      strokeWidth={2}
                    />
                    <text
                      x={0}
                      y={-14}
                      textAnchor="middle"
                      fill={palette.ink}
                      fontFamily={SERIF}
                      fontSize={16}
                      fontWeight={700}
                    >
                      {pt.label}
                    </text>
                  </g>
                ))}

                {/* 导航脉冲光斑 */}
                {(() => {
                  let px = 80;
                  let py = 160;
                  if (navProgress < 0.33) {
                    const t = navProgress / 0.33;
                    px = 80 + (250 - 80) * t;
                    py = 160 + (180 - 160) * t;
                  } else if (navProgress < 0.66) {
                    const t = (navProgress - 0.33) / 0.33;
                    px = 250;
                    py = 180 + (50 - 180) * t;
                  } else {
                    const t = (navProgress - 0.66) / 0.34;
                    px = 250 + (420 - 250) * t;
                    py = 50 + (160 - 50) * t;
                  }
                  return (
                    <g transform={`translate(${px}, ${py})`}>
                      <circle r={16} fill={palette.clay} opacity={0.4} />
                      <circle
                        r={8}
                        fill={palette.clay}
                        stroke={palette.paperLight}
                        strokeWidth={2}
                      />
                    </g>
                  );
                })()}

                <text
                  x="250"
                  y="208"
                  textAnchor="middle"
                  fill={palette.blue}
                  fontFamily={SERIF}
                  fontSize={20}
                  fontWeight={700}
                >
                  🚀 顺理成章执行最短路径规划算法
                </text>
              </svg>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div
                style={{
                  background: palette.blue + '15',
                  padding: '12px 18px',
                  borderRadius: 12,
                  fontFamily: SERIF,
                  fontSize: 22,
                  color: palette.ink,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span style={{ color: palette.blue, fontSize: 24 }}>✔</span>
                <span>
                  <b>秒查空间邻接：</b>查阅关系表即知江西与福建相邻（
                </span>
                <Latex
                  math="\mathcal{O}(1)"
                  style={{ fontSize: 20, color: palette.blue }}
                />
                <span>复杂度）</span>
              </div>
              <div
                style={{
                  background: palette.blue + '15',
                  padding: '12px 18px',
                  borderRadius: 12,
                  fontFamily: SERIF,
                  fontSize: 22,
                  color: palette.ink,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <span style={{ color: palette.blue, fontSize: 24 }}>✔</span>
                <span>
                  <b>路网拓扑分析：</b>沿弧段节点构建连通图，赋能智能导航
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// 主组件入口
// =============================================================================
export const VectorTopology: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const T = getTimestamps(fps);

  const scale = width / 1920;

  const accent =
    frame < T.act2_start
      ? 'sage'
      : frame < T.act3_start
        ? 'clay'
        : frame < T.act4_start
          ? 'clay'
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

        <SimpleFeatureStage frame={frame} />
        <PrecisionGapStage frame={frame} />
        <TopologyDefectStage frame={frame} />
        <ArcNodeModelStage frame={frame} />
        <SpatialIntelligenceStage frame={frame} />

        <BottomTracker frame={frame} />
      </div>
    </AbsoluteFill>
  );
};
