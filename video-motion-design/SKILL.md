---
name: video-motion-design
description: Universal Chinese video production and motion-design workflow for Codex. Use when the user asks to turn a script, outline, narration, idea, explainer, course segment, short-video opening, transition, title card, full video scene, or Remotion/frontend animation into a polished reusable video artifact; especially when they mention Remotion, Lottie, frontend animation libraries, Chinese typography, visual style, export resolution/fps, or video rendering.
---

# Video Motion Design

## Core Intent

Create polished animated video scenes from scripts or ideas. Treat every request as a complete video-design task: understand the full narrative context, shape the requested segment timing, build the visual system, implement the animation, verify the code and representative frames when allowed, and give render commands.

Use Remotion by default when the project already uses it or when frame-accurate video export matters. Use another frontend animation stack only when the repository clearly uses it, the user asks for it, or Remotion would be unnecessarily heavy.

For detailed standards, read [references/motion-video-standards.md](references/motion-video-standards.md) before implementing substantial scenes or full videos.

## Workflow

1. Read the existing project structure before editing. Prefer existing Remotion compositions, assets, fonts, CSS, and component patterns.
2. When an SRT/subtitle file is provided, read the entire file before designing any segment. Use the full narration to understand terminology, later payoffs, recurring metaphors, and the visual language of the complete video, even when the user only asks to animate the opening or a short timestamp range.
3. Identify the exact requested subtitle range. Do not silently expand implementation into later subtitles. Derive composition duration and scene boundaries from the selected SRT timestamps, preserving millisecond-level intent when converting timestamps to frames.
4. Convert the requested script segment into beat-level video timing. Preserve the user's voice, but tighten text for on-screen readability.
5. Design the motion system before coding: scene list, duration, visual metaphor, typography, palette, assets, transitions, and expected render settings. For openings, favor a continuous visual argument with a clear hook, escalation, question, and title payoff instead of a sequence of unrelated text cards.
6. Implement in the smallest appropriate surface:
   - Existing Remotion composition for video work.
   - New Remotion composition when the scene is conceptually separate.
   - Existing frontend component only when the video is meant to be screen-recorded or embedded.
7. Use real visual assets when helpful: local assets first, then Lottie JSON, public media, generated bitmap images, or simple code-native graphics. Avoid pure decorative gradients and generic tech clutter.
8. Validate with commands and representative stills when the user permits rendering:
   - Typecheck/lint if available.
   - Render stills at representative frames.
   - Inspect screenshots for text overflow, overlap, blank frames, asset failures, and style mismatch.
9. Respect the user's delivery boundary. If the user says they will render the video themselves, stop after source-code validation and do not render the final MP4. Provide exact preview and render commands instead. Do not keep changing completed animation code after the user says it is finished or asks to leave it untouched.

## Script To Screen

When the user gives narration, split it into 4-8 beats for short segments and more beats for full videos. Each beat should have:

- The narration or condensed on-screen line.
- The visual action.
- The dominant object or metaphor.
- The transition into the next beat.
- Timing in seconds or frames.

**Timing & Subtitle Alignment (动画与字幕时间的绝对对应)**:
- **Read Full SRT Before Segment Work**: Always read the complete subtitle file first, then implement only the user-selected entries or timestamp interval. Full-file reading is for narrative context, not authorization to animate the entire video.
- **Selected Range Is The Scope**: If the user supplies subtitle entries 1-10, an opening excerpt, or an explicit start/end time, treat that range as the exact composition scope unless they ask for more. The composition end should match the last selected subtitle timestamp as closely as the chosen fps permits.
- **Strict Frame Alignment**: Every visual event, transition, stamp hit, machine error, or state transition MUST be strictly synchronized with the timestamps in the subtitle (SRT) file. Avoid visual changes that feel out of sync with the narration.
- **Timestamp Conversion Rule**: Convert SRT milliseconds to frames consistently using the composition fps. Keep a single timing table or constants object in code so scene changes remain auditable against the subtitles; do not scatter unexplained frame numbers across components.
- **Concise Narrative Banners**: Do not use the spoken narration text directly as the primary scene titles or overlay banners. Summarize the concept concisely into clean, professional title cards/headers (e.g. "什么是投影转换？" or "第一步：用 Define Projection 贴标签" rather than copying the spoken explanation word-for-word). Keep on-screen text shorter than narration. Use large text only for key hooks, thesis lines, contrast pairs, and final takeaways. Put supporting explanations into smaller captions, cards, diagrams, or motion labels.
- **Opening Narrative Arc**: For a 20-40 second opening, build one coherent sequence: establish the world or problem, introduce the contradiction, visualize the core question, demonstrate the promised capability, and land on the episode title or key concept at the final subtitle beat.
- **Aesthetic Style Consistency (风格统一与精简文案)**:
  - Visual animations must maintain strict stylistic consistency with other scenes in the video (such as `OpeningScene` or `compare_video` / `GISComparison`).
  - Use the shared `PaperBackground` component to ensure a unified color theme, drifting grid lines, floating sketch curves, and subtle radial gradient lighting.
  - Do NOT display long explanatory text or transcript-like paragraphs that duplicate the voiceover subtitles.
  - If titles or explanations are required, keep them highly summarized and concise. Ensure on-screen titles are clean editorial headings (e.g. using a unified `SectionTitle` component with an eyebrow, large serif title, and short monospace subtitle).


## Critical Hard Rules & Prohibited Patterns (不可逾越的硬性红线)

1. **绝对禁止无必要英文注释与装饰性英文副标题 (Zero Gratuitous English)**:
   - **红线规定**：除行业标准通用专业缩写（如 GIS, GPS, DEM, TIN, SQL, WKT, GeoJSON, REST API, CPU, RAM）或代码/文件格式外，**严禁在任何中文标题、卡片、图例、徽章、步骤提示、状态栏、图表旁添加无意义的英文翻译、英文副标题或装饰性英文单词**！
   - **典型违规示例（坚决杜绝）**：
     - ❌ `简单要素模型 (Simple Feature Model)` ➔ 建议改为纯中文：`简单要素模型`
     - ❌ `拓扑缺失盲区 (Topology Defect Blindspot)` ➔ 建议改为纯中文：`拓扑缺失盲区`
     - ❌ `空间智能跃迁 (Spatial Intelligence Leap)` ➔ 建议改为纯中文：`空间智能跃迁`
     - ❌ `优势 1: 物理消除缝隙重叠 (Advantage 1: Zero Gaps)` ➔ 建议改为纯中文：`优势 1：物理彻底消除缝隙重叠`
     - ❌ `拓扑裂隙 (Sliver Gap)` / `交叉重叠 (Overlap)` ➔ 建议改为纯中文：`拓扑裂隙 (缝隙)` / `多边形交叉重叠`
   - **原则**：保持版面纯净，专注提升母语观众认知效率，坚决杜绝中英强行混排拼贴的廉价感。

2. **数学公式与学术符号一律使用 LaTeX 规范排版 (Mandatory LaTeX for Math)**:
   - **红线规定**：所有数学公式、几何代号、拓扑要素标号、坐标参量、时间复杂度、微积分/离散表达式，**必须使用 LaTeX (KaTeX) 排版**，严禁使用普通等宽代码字体（如 JetBrains Mono）或纯文本字符凑合！
   - **字体职责边界**：
     - **LaTeX (`<Latex math="..." />`)**：专用于所有数学变量与学术符号，例如多边形与节点 $P_1, P_2, V_1, V_2, A_1$、坐标 $(x_i, y_i)$、误差量 $\Delta d, \epsilon$、时间复杂度 $\mathcal{O}(1), \mathcal{O}(n)$、公式方程等。
     - **等宽代码字体 (`JetBrains Mono`)**：严格仅用于真实编程代码、命令行 CLI 指令、文件路径扩展名（如 `.shp`, `.gdb`）、内存十六进制地址（如 `0x7FFF`）、数据表字段名等。
   - **组件标准实现**：在项目中建立复用组件 `src/components/Latex.tsx`（基于 `katex`，导入 `katex/dist/katex.min.css`），支持通过 `style` 动态透传 `fontSize`, `color`, `fontWeight` 等属性，与周围排版完美融合。

---

## Visual Style Defaults

Default style for Chinese educational/explainer videos:

- Warm paper, editorial, map, notebook, gallery, or clean studio feel.
- Sophisticated but approachable motion.
- Controlled palette with off-white, ink, sage/green, muted blue, amber, and one accent color.
- Minimal glow and restrained shadows.
- Avoid excessive cyber, neon, HUD, glassmorphism, emoji-heavy visuals, and generic "tech" grids unless the user asks for that tone.

Typography defaults:

- Chinese serif: `Source Han Serif CN SemiBold` (思源宋体，用于所有中文文本)
- Math & Academic Symbols: **LaTeX (KaTeX)**
- Monospace / Code: `JetBrains Mono` (仅用于代码与技术参数)
- Do not scale font size with viewport width.
- Use 0 letter spacing for Chinese display text unless a local design system already differs.

## Remotion Implementation Rules

- Keep composition metadata in `Root.tsx`: `id`, `durationInFrames`, `fps`, `width`, `height`.
- If changing fps while preserving duration, scale `durationInFrames` proportionally.
- Use `useCurrentFrame`, `useVideoConfig`, `interpolate`, `spring`, and `Easing` for deterministic animation.
- **No CSS Transitions for Frame State (禁止在帧控变量上使用 CSS 过渡)**: Avoid using CSS `transition: "transform 0.2s"` or `transition: "opacity 0.3s"` on elements that change with frame-level state variables. These time-based CSS transitions depend on real-time browser playback and will render incorrectly or stutter when rendering frame-by-frame. Always use deterministic `interpolate()` or `spring()` to calculate styles directly.
- **Symmetric Cross-Fade & Scale Morphing (无缝渐变切换与尺寸缩放同步)**: When transitioning between images/avatars/icons that have different ideal sizes (e.g., swapping character expression states):
  - Do not apply a shared scale factor to a common parent container during transitions; this forces the incoming element to start at the wrong size.
  - Instead, apply individual scales and opacities to each asset separately.
  - Establish a cross-fade window (typically 10-20 frames). During this window:
    - The outgoing asset should smoothly fade out (`opacity` from `1` to `0`) and shrink (from `normalScale` down to `normalScale * 0.7`).
    - The incoming asset should smoothly fade in (`opacity` from `0` to `1`) and grow (from `normalScale * 0.7` up to `normalScale`).
    - This ensures a beautiful morphing transition where elements smoothly expand/contract into place without abrupt popping.
- **Preventing Unexpected Text Wrapping (防止文本意外折行)**: For UI labels, card headers, status screens, slots, button labels, and path strings, always include `whiteSpace: "nowrap"` in CSS. Unexpected line-wrapping (e.g. single characters or slashes wrapping to the next line) degrades the professional look of the video.
- Use `staticFile()` and `delayRender()` / `continueRender()` for Lottie or fetched local assets.
- Prefer fixed dimensions, aspect ratios, and constrained text boxes to prevent layout shifts.
- Build reusable small components for repeated cards, labels, diagrams, lower thirds, title cards, and Lottie players.
- **Proportional Asset Scaling in Transitions**: When cross-fading or transitioning between images/assets (e.g. character avatars) that have different base scales, make their transition/shrink scales proportional to their respective base sizes rather than using hardcoded absolute values (e.g., if target shrink size is 70%, calculate `baseScale * 0.7` rather than using `0.7` for both). This ensures the zoom/easing looks symmetric, balanced, and silky smooth.
- **Scene Integration & Page Consolidation (根据字幕整合页面，禁止频繁硬切)**:
  - Do NOT open a new standalone slide or full-screen page cut for every 1-2 second spoken subtitle line. This causes rapid flickering ("眼花缭乱").
  - Group related contiguous subtitle timestamps into 3-4 unified multi-beat thematic Acts (e.g., Act 1: Background & Binary, Act 2: Spatial Abstraction & Zoom, Act 3: Vector vs Raster Payoff).
  - Use a **single persistent 3D canvas** (`UnifiedVisualCanvas`) where graphics morph, tilt, unfold, and transition smoothly via camera transforms instead of unmounting page components.
- **Smooth Transition Architecture (页面平滑过渡与禁止跳变)**:
  - **Fixed Full-Screen Outer Containers**: Outer visual canvas containers MUST remain fixed at `width: 1920, height: 1080` (or `AbsoluteFill`). NEVER dynamically switch container `width`, `left`, `right`, or `margin` across frame intervals, as browser layout reflow causes objects to snap/fly abruptly.
  - **Physics Springs & Silk Bezier Curves**: Use `spring({ damping: 18, stiffness: 55 })` for organic unfolding, sliding, and popping cards. Use `Easing.bezier(0.16, 1, 0.3, 1)` for smooth camera tilts and zooms.
  - **Strict Phase Gate & Unmount Handling**: When a headline or panel fades out during transitions (e.g. at Frame 717), explicitly lock its state variables on the active beat instead of resetting to default Act 1 fallback values. Unmount panels cleanly (`return null`) only after fade-out completes (`opacity == 0`).
- **Strict Font Size Hierarchy & Minimum Size Rules (字体大小规范)**:
  - **Minimum Font Size Constraint**: No text label, data matrix value, badge, anchor tag, footer, or caption in compositions shall be smaller than **`30px`** (bold).
  - **Font Hierarchy**:
    - Hero Main Titles: `88px ~ 150px` bold.
    - Section / Card Titles: `48px ~ 76px` bold.
    - Subtitles & Explanations: `30px ~ 34px`.
    - Feature Badges / Tag Pills: `30px`.
    - Node Labels & Graphic Anchors: `30px` bold.
    - Micro Grid Values / Hex Memory Addrs / Act Pills: Minimum **`30px` bold** (`fontWeight: 700`).
- **Clean Bottom Tracker Layout (简洁底部导航栏)**:
  - Do NOT clutter the bottom tracker with verbose episode subtitles, title texts, or redundant timer progress bars. Keep the bottom bar clean and focused with centered Act Pills only (`01. 真实与二进制`, `02. 抽象与分析`, `03. 矢量与栅格`).
- **Universal Chinese Typography Standard (全局中文字体统一为思源宋体)**:
  - ALL Chinese text (headings, body text, subtitles, card headers, tag pills, graphic badges, footers, act indicators) MUST use **`Source Han Serif CN SemiBold`** (`SERIF`). Do not use sans-serif / YaHei for Chinese body or badges unless explicitly requested.
- **LaTeX Math Component Standard (KaTeX 公式规范)**:
  - Any mathematical expression, variable, index, complexity notation, or formula MUST be rendered via KaTeX (`<Latex math="..." />`). Never use Monospace or raw strings for math.
- **4K 60fps Export Resolution & Frame-Rate Standard (4K 60帧高清画质规范)**:
  - Default compositions for high-end explainer videos should support **4K 60fps** (`width: 3840, height: 2160, fps: 60`).
  - Use `getTimestamps(fps)` dynamic frame calculation (`Math.round(seconds * fps)`) so subtitle alignment scales seamlessly across 30fps and 60fps.
  - Wrap top-level compositions with `scale = width / 1920` (`transform: scale(${scale})`, `transformOrigin: 'top left'`) to ensure 1080p layout math renders vector elements, fonts, borders, and SVGs at ultra-crisp 4K physical resolution without breakage.

## Render And Preview

Rendering is a separate delivery step from implementation. Do not automatically render a full MP4 merely because the source code is complete. Render the final video only when the user asks for it or has not reserved rendering for themselves. If they say "我自己渲染", "不需要渲染", or equivalent, leave the code unchanged after validation and only provide commands.

Preview:

```powershell
npm.cmd run dev -- --port 3000
```

Render (4K 60fps Default):

```powershell
npm.cmd exec remotion render src\index.ts <CompositionId> out\<name>_4k60.mp4 --codec=h264 --crf=18
```

For still-frame validation on Windows, prefer direct CLI invocation so frame flags are not consumed by npm:

```powershell
npx.cmd remotion still src\index.ts <CompositionId> tmp-frame-450.png --frame=450 --overwrite
```

## Quality Checklist

Before finishing, verify:

- **No Gratuitous English**: Verify that NO titles, cards, labels, or badges contain unnecessary English translation subtitles or decorative English text.
- **LaTeX Math Compliance**: Verify that ALL mathematical variables ($P_1, V_1, A_1, \Delta d$), formulas, and complexity notations ($\mathcal{O}(1)$) are rendered using KaTeX (`<Latex math="..." />`), never monospace code fonts or raw text.
- The video has a clear hook, development, and payoff.
- Every scene has a visual reason to exist.
- Text fits and does not overlap at target resolution.
- Visual assets load correctly.
- Motion is smooth and not visually noisy.
- The palette is not one-note and does not default to generic dark tech styling.
- Render commands are correct for Windows PowerShell; use `npm.cmd` when PowerShell blocks `npm.ps1`.
- The implemented subtitle range starts and ends at the requested timestamps and does not drift into later narration.
- If the user owns the final render step, no final MP4 render was started and completed source files were left untouched.
- Any warnings are explained, especially if they come from unrelated existing files.

## Project & Version Control Hygiene

When working on video production codebases (which often mix Remotion, Python, Manim, voiceovers, and media assets):
- **Configure `.gitignore` early**: Ensure a root-level `.gitignore` is created to explicitly exclude heavy media, raw recording assets, and documents, keeping only source code and essential assets in Git. Ignore:
  - Raw/Final voiceover files and directories (e.g., `#1 project/`, `#1视频配音/`).
  - Audio and background music directories (e.g., `bgms/`).
  - Subtitle files (e.g., `*.srt`).
  - Scripts and narrative documents (e.g., `*.txt`, `*.docx`, etc.).
  - Python virtual environments and caches (e.g., `.venv/`, `__pycache__/`).
  - Rendered video outputs (e.g., `/out/`, `/build/`, `/media/` output folders).
  - Unneeded screenshot files (e.g., `PixPin_*.png`, etc.).
- **Remove Nested `.git` Directories**: If a Remotion template is cloned or initialized inside a parent Git repository, delete the subfolder's `.git/` directory so the outer Git repository can track all video code seamlessly as one repository instead of hitting submodule conflicts.
