# Story engine — scrollytelling for any data

The Atlas-replica story machinery generalized: a self-contained, no-build
vanilla-JS engine that renders a scrollytelling page (hero → prose →
charts with scroll-driven scenes) from a `story.json` and any data you
give it. It knows nothing about the Atlas, the SDGs, or any domain.

## Files to vendor (copy into your project)

```
shared/chapter-scroll.js      # the scrollytelling runtime
shared/chapter-scroll.css     # layout + theme variables
shared/story-mount.js         # block mounting (declarative / renderer / chapter)
shared/load.js                # CSV parser + data helpers (AtlasLoad)
shared/svg.js                 # SVG helpers (AtlasSVG)
shared/particles.js           # optional hero particles
shared/components/*.js        # optional chart kit (Line, Beeswarm, Waffle, Scatter, Axis)
```

Host page skeleton (see `stories/*/index.html` for full examples):

```html
<link rel="stylesheet" href="chapter-scroll.css" />
<div id="story"></div>
<script src="svg.js"></script><script src="load.js"></script>
<script src="components/Axis.js"></script> <!-- …rest of the kit… -->
<script src="chapter-scroll.js"></script><script src="story-mount.js"></script>
<script>AtlasStoryMount.mount(document.getElementById("story"));</script>
```

## story.json contract

```jsonc
{
  "slug": "mi-story",
  "title": "…",
  "hero": {
    "kicker": "…", "title": "…", "lead": "…", "byline": "…",
    "bg": "#0b2545",                 // hero background
    "particles": { "color": "#266FE0", "count": 900, "mode": "world",
                   "centroidsUrl": "…" },   // optional; omit for none
    "keyFacts": [{ "value": "…", "label": "…" }]   // optional
  },
  "blocks": [ /* in narrative order */ ]
}
```

Block kinds (mix freely):

1. **Prose** — `{"type": "prose", "html": "<h3>…</h3><p>…</p>"}`.
   Callouts: `<blockquote class="ch-callout">` (quote) or
   `class="ch-callout ch-callout-number"` with `<span class="num-xl">`.

2. **Declarative chart — any CSV, zero code**:
   ```json
   { "id": "precios", "type": "vis", "title": "…", "subtitle": "…",
     "source": "…", "component": "LineChart",
     "data": "./data/precios.csv",
     "options": { "x": "fecha", "y": "precio", "series": "canal" } }
   ```
   `component` is any global `Atlas<Name>` with a `mount(el, opts)`
   (the vendored kit or your own). String values in `options` are treated
   as column names and become accessors (numeric coercion included).

3. **Custom renderer** — `{"type": "scroller", "rendererUrl":
   "./renderers/mi-vis.js", "scenes": [{"id": "a", "text": "…"}]}`.
   The script registers `window.AtlasReplica = { ready: true,
   async render(scene, ctx) { /* draw into ctx.chartEl */ } }` and is
   re-invoked per scene (`ctx.sceneIndex`). Scenes live in the block.

4. **Atlas-style chapter** — `{"chapterDir": "goal_NN/…",
   "scenesFromChapter": true}` mounts an existing chapter directory
   (config.json + main.js + data/). Root configurable:
   `AtlasStoryMount.mount(el, { chaptersRoot: "../mis-capitulos/" })`.

`mount(el, opts)` also accepts `storyUrl` (default `./story.json`) or a
pre-built `story` object.

## Theming — override CSS variables, no file edits

```css
:root {
  --ch-font: "Hanken Grotesk";   /* body/UI font */
  --ch-text: #171B21; --ch-subtle: #5b6873;
  --ch-line: #E5E7EB; --ch-bg: #ffffff;
  --ch-blue: #266FE0;            /* accent (e.g. Unholster blue) */
  --ch-red: #e31c3d;
}
```

## Ground rules

- Everything is real data: `data` URLs resolve at runtime; a missing CSV
  fails visibly in the chart area, never silently.
- The engine is mount-relative: it works at any path depth and under any
  site mount (URL rewriting handles chapter-relative fetches).
- Keep prose in `story.json` (or `proseFile` per block) — the engine owns
  layout and scene choreography only.
