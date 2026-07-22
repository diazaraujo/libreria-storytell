/* Story-shell chapter mounting.
 *
 * Mounts existing chapter renderers (window.AtlasReplica from each
 * chapter's main.js) inside a chapter-scroll story page:
 *  - loads each chapter's main.js sequentially, capturing the global it
 *    registers before the next one loads;
 *  - fills block title/subtitle/source (and scroller scenes) from the
 *    chapter's config.json instead of duplicating them in story.json;
 *  - resolves the chapter-relative URLs renderers use ("./data/x.csv",
 *    "../sibling/data/x.csv", "../../../shared/x.json") against the
 *    active chapter directory, for AtlasLoad.csv and bare fetch alike;
 *  - serializes renders so a scroll handoff can't cross chapter bases.
 */
(function initStoryMount(global) {
  "use strict";

  const DEFAULT_CHAPTERS_ROOT = "../../chapters/";

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error(`failed to load ${src}`));
      document.head.appendChild(s);
    });
  }

  function isRelative(url) {
    return typeof url === "string"
      && !/^([a-z]+:)?\/\//i.test(url)
      && !url.startsWith("/")
      && !url.startsWith("data:")
      && !url.startsWith("blob:");
  }

  function columnAccessors(options) {
    // Declarative blocks name columns in JSON; components expect accessors.
    const out = {};
    for (const [key, value] of Object.entries(options || {})) {
      out[key] = typeof value === "string" && !["title", "subtitle", "unit"].includes(key)
        ? (row) => {
            const v = row[value];
            const n = Number(v);
            return v !== "" && Number.isFinite(n) ? n : v;
          }
        : value;
    }
    return out;
  }

  async function prepare(story, opts) {
    const chaptersRoot = (opts && opts.chaptersRoot) || DEFAULT_CHAPTERS_ROOT;
    const replicas = {};
    const configs = {};
    const chapterBlocks = story.blocks.filter((b) => b.chapterDir);

    // Standalone renderer blocks: a script that registers window.AtlasReplica,
    // with scenes carried by the story block itself — no chapter layout needed.
    for (const b of story.blocks.filter((x) => x.rendererUrl)) {
      global.AtlasReplica = undefined;
      await loadScript(b.rendererUrl);
      const replica = global.AtlasReplica;
      b.mount = async (chartEl, ctx) => {
        AtlasChapterScroll.fitChartHeight(chartEl);
        const draw = (sceneIndex) => replica.render(b.scenes?.[sceneIndex] || null, {
          chartEl, config: b, sceneIndex, hidePlaceholder() {},
        });
        await draw(ctx.sceneIndex || 0);
        // Controller so scene changes re-render the chart (not just the note).
        return { updateScene: (sceneIndex) => draw(sceneIndex) };
      };
      b.forceRemount = true;
    }

    // Declarative component blocks: {"component": "LineChart",
    // "data": "./data/x.csv", "options": {"x": "col", "y": "col"}} —
    // any CSV, no renderer code at all.
    for (const b of story.blocks.filter((x) => x.component)) {
      const rows = await AtlasLoad.csv(b.data);
      const componentGlobal = global[`Atlas${b.component}`]
        || (global.AtlasComponents && global.AtlasComponents[b.component]);
      if (!componentGlobal || !componentGlobal.mount) {
        throw new Error(`unknown story component: ${b.component}`);
      }
      b.mount = async (chartEl) => {
        AtlasChapterScroll.fitChartHeight(chartEl);
        return componentGlobal.mount(chartEl, {
          data: rows, ...columnAccessors(b.options),
        });
      };
      b.forceRemount = true;
    }

    for (const b of chapterBlocks) {
      const base = chaptersRoot + b.chapterDir;
      configs[b.chapterDir] = await (await fetch(`${base}/config.json`)).json();
      global.AtlasReplica = undefined;
      await loadScript(`${base}/main.js`);
      replicas[b.chapterDir] = global.AtlasReplica;
      const cfg = configs[b.chapterDir];
      b.title = b.title || cfg.title;
      b.subtitle = b.subtitle || cfg.subtitle || "";
      b.source = b.source || cfg.source || "";
      if (b.scenesFromChapter && Array.isArray(cfg.scenes)) {
        b.scenes = cfg.scenes.map((s) => ({ type: "scene", id: s.id, text: s.text }));
      }
    }

    // URL rewriting: renderers compute URLs relative to their chapter dir.
    let activeBase = "";
    const resolveUrl = (url) =>
      activeBase && isRelative(url)
        ? new URL(url, new URL(`${activeBase}/`, global.location.href)).pathname
        : url;

    const realCsv = AtlasLoad.csv.bind(AtlasLoad);
    AtlasLoad.csv = (url, ...rest) => realCsv(resolveUrl(url), ...rest);
    if (AtlasLoad.json) {
      const realJson = AtlasLoad.json.bind(AtlasLoad);
      AtlasLoad.json = (url, ...rest) => realJson(resolveUrl(url), ...rest);
    }
    const realFetch = global.fetch.bind(global);
    global.fetch = (url, ...rest) => realFetch(resolveUrl(url), ...rest);
    // iframes embed sibling implementations with chapter-relative paths
    const srcDescriptor = Object.getOwnPropertyDescriptor(
      global.HTMLIFrameElement.prototype, "src");
    Object.defineProperty(global.HTMLIFrameElement.prototype, "src", {
      get() { return srcDescriptor.get.call(this); },
      set(value) { srcDescriptor.set.call(this, resolveUrl(value)); },
    });

    let chain = Promise.resolve();
    const serialized = (fn) => (chain = chain.then(fn, fn));

    for (const b of chapterBlocks) {
      const dir = b.chapterDir;
      b.mount = (chartEl, ctx) => serialized(async () => {
        activeBase = chaptersRoot + dir;
        AtlasChapterScroll.fitChartHeight(chartEl);
        const cfg = configs[dir];
        const sceneIndex = ctx.sceneIndex || 0;
        try {
          await replicas[dir].render(cfg.scenes?.[sceneIndex] || null, {
            chartEl,
            config: cfg,
            sceneIndex,
            hidePlaceholder() {},
          });
        } finally {
          activeBase = "";
        }
      });
      b.forceRemount = true;
    }
  }

  global.AtlasStoryMount = {
    async mount(container, opts) {
      const storyUrl = (opts && opts.storyUrl) || "./story.json";
      const story = (opts && opts.story)
        || await (await fetch(storyUrl)).json();
      await prepare(story, opts || {});
      return AtlasChapterScroll.mount(container, story);
    },
  };
})(window);
