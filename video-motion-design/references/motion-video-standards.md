# Motion Video Standards

## Beat Planning Template

Use this compact table mentally or explicitly for substantial videos:

| Beat | Time | Narration / Screen Text | Visual | Motion | Asset |
| --- | --- | --- | --- | --- | --- |
| 1 | 0-3s | Hook | Strong first-frame signal | Soft spring reveal | Lottie/image/code |
| 2 | 3-8s | Setup | Context object | Slide/scale/focus | UI mockup/diagram |
| 3 | 8-14s | Contrast | A vs B or before vs after | Split/transform | Cards/labels |
| 4 | 14-22s | Explanation | Diagram or concrete example | Trace/draw/recalculate | SVG/canvas |
| 5 | 22-30s | Personal or practical turn | Story card or workflow | Calm reveal | Photo/icon/Lottie |
| 6 | 30s+ | Takeaway | Final thesis | Underline/lockup | Text/brand |

## Subtitle-First Intake

When an SRT file exists, read it to the end before planning visuals. This is mandatory even when only the first few subtitles will be animated. The complete file establishes the lesson's vocabulary, conceptual destination, recurring examples, and tone.

Separate context from scope:

- **Context** is the complete subtitle file and may inform motifs, terminology, palette, and title payoff.
- **Scope** is only the subtitle entries or timestamp interval requested by the user.
- Never animate later content merely because it appeared in the full SRT.
- Use the selected final timestamp to calculate composition duration. At 30fps, `00:00:30,525` maps to approximately 916 frames of timeline coverage.
- Store key subtitle boundaries in a named timing object or table. Prefer names such as `world`, `binary`, `analysis`, and `titleReveal` over anonymous frame literals.

## Script Editing Rules

- Keep the first line sharp. Prefer a question, contradiction, or concrete pain point.
- Preserve the user's personality. Do not flatten casual self-reference if it builds trust.
- Reduce repeated wording on screen; let narration carry the full sentence.
- Show key terms visually when they first appear.
- For education topics, pair every abstract claim with a concrete object, comparison, or diagram.
- For technical topics, distinguish metadata, data values, transformations, inputs, outputs, and failure states visually.
- For openings, do not treat each subtitle as an isolated slide. Connect beats through object transformation, camera movement, visual continuity, or a recurring metaphor.
- Land the main episode title on the exact subtitle beat where the narration names it. Avoid revealing the final concept substantially earlier than the voiceover.

## Style Families

Use one of these unless the user specifies another:

### Editorial Paper

- Background: warm white, faint map/grid lines, paper texture.
- Text: large Chinese serif, small mono labels.
- Motion: quiet spring, ink-line drawing, masked reveals.
- Best for: GIS, humanities, education, thoughtful explainers.

### Clean Studio

- Background: flat off-white or charcoal with restrained panels.
- Text: hierarchy-driven, fewer ornaments.
- Motion: camera-like focus shifts, smooth cards, precise diagrams.
- Best for: productivity, tutorials, SaaS walkthroughs.

### Documentary Data

- Background: neutral map/table/workbench surface.
- Text: captions, labels, numbers.
- Motion: trace lines, counters, timelines, before/after overlays.
- Best for: analysis, reports, research videos.

### Playful Explainer

- Background: bright but controlled.
- Text: chunky cards, friendly icons.
- Motion: elastic but readable.
- Best for: short-form social content and light intros.

Avoid using "dark neon tech" by default. Only use it when the subject or user asks for cyber/tech/AI/hacker/game styling.

## Palette Guidance

Recommended base:

- Paper: `#f9f4e9`, `#fffdf6`, `#ece6d8`
- Ink: `#29342f`, `#3b332d`
- Sage: `#4f745d`, `#5f8163`
- Muted blue: `#315f6d`, `#426b80`
- Amber: `#a77748`
- Warning clay: `#8f4e3e`, `#b77a64`

Keep accent count low. Use color semantically:

- Green/sage: correct, defined, stable, understood.
- Blue: target, concept, neutral technical context.
- Amber: personal note, learning, transition.
- Clay/red: warning, missing input, invalid tool.

## Typography Guidance

Use Chinese display text with a serif stack:

```ts
const SERIF_STACK =
  "'Source Han Serif CN SemiBold', 'Source Han Serif CN', 'Source Han Serif SC', 'Noto Serif SC', SimSun, serif";
```

Use code/status labels with:

```ts
const MONO_STACK = "'JetBrains Mono', 'Cascadia Mono', Consolas, monospace";
```

Sizing for 1920x1080:

- Hook/title: 68-112px.
- Section headings: 46-74px.
- Card headings: 28-44px.
- Captions: 18-28px.
- Mono labels: 12-17px.

Reduce text length before reducing font size. Keep Chinese letter spacing at 0.

## Remotion Timing Notes

At 30fps:

- 3s = 90 frames.
- 5s = 150 frames.
- 8s = 240 frames.
- 10s = 300 frames.

At 60fps, double frame counts to preserve duration.

Use helper functions:

```ts
const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const fade = (frame: number, start: number, end: number, fadeIn = 14, fadeOut = 16) =>
  interpolate(frame, [start, start + fadeIn, end - fadeOut, end], [0, 1, 1, 0], clamp);
```

For motion feel:

- Entry: `spring({damping: 18, stiffness: 80})`
- Snappy click: `spring({damping: 9, stiffness: 180})`
- Calm card: `spring({damping: 20, stiffness: 80})`
- Use `Easing.bezier(0.22, 1, 0.36, 1)` for soft editorial interpolation.

## Lottie And Assets

- Prefer local `public/*.json` Lottie assets already in the project.
- Wrap Lottie loading with `delayRender()` and `continueRender()`.
- Use Lottie as a supporting accent, not the main explanation, unless the animation directly explains the idea.
- If online asset search is needed, prefer lightweight, relevant JSON icons and save them into `public/` with descriptive names.
- Avoid generic decorative assets that do not advance the idea.

## Validation Stills

For each substantial composition, render stills at:

- First hook frame after entry.
- Most text-dense scene.
- Main diagram scene.
- Transition or personal-story scene.
- Final takeaway.

Example:

```powershell
npx.cmd remotion still src\index.ts <CompositionId> tmp-frame-225.png --frame=225 --overwrite
```

Use still rendering only when it is within the user's requested workflow. If the user asks for code only or says they will handle rendering, source validation is sufficient unless they separately authorize visual renders.

Inspect the stills. Fix:

- Text overflow.
- Text too close to edges.
- Objects covering important text.
- Unloaded assets.
- Overly empty or overly crowded frames.
- Palette drifting into unwanted cyber/neon styling.

## Windows Notes

- Use `npm.cmd`, not `npm`, when PowerShell blocks `npm.ps1`.
- If Remotion/esbuild fails because sandboxing blocks parent-directory reads, rerun the same important render/still command with approval.
- Use explicit paths and output names. Prefer `out\video-name.mp4` for final renders and `tmp-frame-*.png` for checks.
- `npm.cmd exec remotion still ... --frame=...` may allow npm to consume the frame flag in some versions. Prefer `npx.cmd remotion still ... --frame=...` or use an explicit npm argument separator.

## Render Ownership And Stop Conditions

- Treat source implementation, representative still validation, and final MP4 rendering as separate stages.
- If the user says they will render locally, do not start or resume a full render.
- If a full render was already attempted and the user asks to stop, do not retry it.
- Once the user confirms the animation code is complete and asks not to touch it, make no further edits to that project. Limit subsequent work to explicitly requested documentation, skill, or workflow changes.
- Always provide the composition ID, entry file, preview command, final render command, resolution, fps, codec, CRF, and output path so the user can render independently.
