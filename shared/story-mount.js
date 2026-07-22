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

  const CHAPTERS_ROOT = "../../chapters/";

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

  async function prepare(story) {
    const replicas = {};
    const configs = {};
    const chapterBlocks = story.blocks.filter((b) => b.chapterDir);

    for (const b of chapterBlocks) {
      const base = CHAPTERS_ROOT + b.chapterDir;
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
        activeBase = CHAPTERS_ROOT + dir;
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
    async mount(container) {
      const story = await (await fetch("./story.json")).json();
      await prepare(story);
      return AtlasChapterScroll.mount(container, story);
    },
  };
})(window);
