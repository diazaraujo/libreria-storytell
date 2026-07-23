/**
 * Shared shell for Atlas replica scaffolds.
 * Loads ./config.json, wires scene navigation for scrollers.
 * Implementations override window.AtlasReplica.render(scene, ctx).
 */
(async function () {
  const metaPre = document.getElementById("meta-pre");
  const placeholder = document.getElementById("placeholder");
  const nav = document.getElementById("nav");
  const storyCard = document.getElementById("story-card");
  const progressEl = document.getElementById("progress");

  // Always start with nav/story hidden until we know we have scenes
  if (nav) nav.hidden = true;
  if (storyCard) storyCard.hidden = true;
  if (progressEl) progressEl.hidden = true;

  let config;
  try {
    const res = await fetch("./config.json");
    if (!res.ok) throw new Error(`config.json HTTP ${res.status}`);
    config = await res.json();
  } catch (err) {
    console.error(err);
    if (placeholder) {
      placeholder.innerHTML = `
        <strong style="color:#aa0000">Could not load config.json</strong>
        <p>${String(err.message || err)}</p>
        <p class="hint-sm">Serve the folder over HTTP (not raw file:// for relative fetches of shared assets is ok if paths resolve).</p>`;
      placeholder.style.display = "";
    }
    if (metaPre) metaPre.textContent = String(err);
    return;
  }

  window.ATLAS_CONFIG = config;

  // Pixel-perfect / clean mode: ?clean=1 hides debug chrome
  const cleanMode = new URLSearchParams(location.search).has("clean");
  if (cleanMode) {
    document.body.classList.add("clean-mode");
    document.querySelector(".devtools")?.remove();
    document.querySelector(".crumbs")?.remove();
    document.querySelector(".badges")?.remove();
  }

  // Scroller chapters use Atlas two-column layout (annotation + chart)
  const isScroller =
    config.type === "scroller" ||
    (Array.isArray(config.scenes) && config.scenes.length > 1);
  if (isScroller) {
    document.body.classList.add("scroller-layout");
  }

  /** Atlas-like annotation accent from first data-color-id / class in scene HTML */
  function sceneAccent(html) {
    const s = String(html || "");
    const m =
      s.match(/data-color-id="([A-Z]{3})"/i) ||
      s.match(/class="([A-Z]{3})"/i);
    const key = (m && m[1] && m[1].toUpperCase()) || null;
    const map = {
      WLD: "#081079",
      EAS: "#F3578E",
      ECS: "#AA0000",
      LCN: "#0C7C68",
      MEA: "#664AB6",
      NAC: "#34A7F2",
      SAS: "#4EC2C0",
      SSF: "#FF9800",
    };
    return (key && map[key]) || "#c41230";
  }


  const titleEl = document.getElementById("title");
  const subEl = document.getElementById("subtitle");
  const sourceEl = document.getElementById("source");
  const storyText = document.getElementById("story-text");
  const sceneMeta = document.getElementById("scene-meta");
  const btnPrev = document.getElementById("btn-prev");
  const btnNext = document.getElementById("btn-next");
  const counter = document.getElementById("counter");

  if (titleEl && config.title) titleEl.textContent = config.title;
  if (subEl) subEl.textContent = config.subtitle || "";
  if (sourceEl) {
    sourceEl.innerHTML = config.source
      ? `Source: ${config.source}`
      : "Source: World Bank Atlas of Global Development 2026";
  }

  const status = config._meta?.status || "scaffold";
  if (metaPre) {
    metaPre.textContent = JSON.stringify(
      {
        graphic: config.graphic,
        type: config.type,
        status,
        sceneCount: (config.scenes || []).length,
        data_download: config.data_download,
        dataRef: config.data,
        dir: config._meta?.dir,
      },
      null,
      2
    );
  }

  // Enrich default placeholder for scaffolds
  if (placeholder && status !== "ready") {
    placeholder.innerHTML = `
      <strong>Scaffold · <code>${config.graphic || "?"}</code></strong>
      <p>${config.visdescription || config.instructions || "Config + data loaded. Implement <code>main.js</code> → <code>AtlasReplica.render</code>."}</p>
      <p class="hint-sm">
        type: <code>${config.type || "?"}</code>
        · data: <code>${config.data_download || config.data || "—"}</code>
        · scenes: <code>${(config.scenes || []).length}</code>
      </p>
      <p class="hint-sm">Reference: <code>goal_17/03-spi-scroller</code> · <code>_ready/spi-scroller</code></p>`;
    placeholder.style.display = "";
  }

  const scenes = Array.isArray(config.scenes) ? config.scenes : [];
  let sceneIndex = 0;
  const renderGate = window.AtlasLoad.createLatestGate();

  function ctx() {
    return {
      config,
      sceneIndex,
      scene: scenes[sceneIndex] || null,
      chartEl: document.getElementById("chart"),
      colors: window.WB_COLORS,
      Beeswarm: window.Beeswarm,
      hidePlaceholder() {
        if (placeholder) placeholder.style.display = "none";
      },
      showPlaceholder(html) {
        if (!placeholder) return;
        if (html) placeholder.innerHTML = html;
        placeholder.style.display = "";
      },
    };
  }

  function formatSceneHtml(html) {
    if (!html) return "";
    let s = String(html);
    // Atlas markup: [emphasis: text] → highlighted span
    s = s.replace(/\[emphasis:\s*([^\]]+)\]/gi, (_, t) => {
      const text = String(t).trim();
      return text ? `<span class="emphasis">${text}</span>` : "";
    });
    // empty emphasis leftovers
    s = s.replace(/\[emphasis:\s*\]/gi, "");
    // leftover mustache placeholders
    s = s.replace(/\{\{[^}]+\}\}/g, "");
    return s;
  }

  function rendererAvailable() {
    return (
      status === "ready" &&
      typeof window.AtlasReplica?.render === "function" &&
      !window.AtlasReplica.isStub
    );
  }

  function showRenderError(err) {
    console.error(err);
    if (!placeholder) return;
    const strong = document.createElement("strong");
    strong.style.color = "#aa0000";
    strong.textContent = "Render error";
    const detail = document.createElement("p");
    detail.textContent = String(err?.message || err);
    placeholder.replaceChildren(strong, detail);
    placeholder.hidden = false;
    placeholder.style.display = "";
    placeholder.setAttribute("aria-hidden", "false");
  }

  /** Render off-screen and commit only the newest successfully completed scene. */
  async function renderReplica(scene, animate) {
    if (!rendererAvailable()) return false;
    const base = ctx();
    const chart = base.chartEl;
    if (!chart) return false;

    const token = renderGate.start();
    const staging = document.createElement("div");
    staging.className = "atlas-render-staging";
    staging.style.cssText = [
      "position:absolute",
      "left:-100000px",
      `width:${chart.clientWidth || 900}px`,
      `height:${chart.clientHeight || 440}px`,
      "visibility:hidden",
      "pointer-events:none",
    ].join(";");
    chart.appendChild(staging);

    let placeholderRequest = { visible: false, html: null };
    const renderContext = {
      ...base,
      chartEl: staging,
      animate,
      renderToken: token.id,
      hidePlaceholder() {
        placeholderRequest = { visible: false, html: null };
      },
      showPlaceholder(html) {
        placeholderRequest = { visible: true, html: html || null };
      },
    };

    try {
      await Promise.resolve(window.AtlasReplica.render(scene, renderContext));
    } catch (err) {
      staging.remove();
      if (token.isCurrent()) showRenderError(err);
      return false;
    }
    if (!token.isCurrent()) {
      staging.remove();
      return false;
    }

    chart.replaceChildren(...staging.childNodes);
    if (placeholder) {
      if (placeholderRequest.visible) {
        if (placeholderRequest.html) placeholder.innerHTML = placeholderRequest.html;
        placeholder.hidden = false;
        placeholder.style.display = "";
        placeholder.setAttribute("aria-hidden", "false");
      } else {
        placeholder.hidden = true;
        placeholder.style.display = "none";
        placeholder.setAttribute("aria-hidden", "true");
      }
    }
    return true;
  }

  // Format static config fields that may contain Atlas markup
  if (subEl && config.subtitle) {
    subEl.innerHTML = formatSceneHtml(config.subtitle);
  }
  if (config.textParagraph) {
    // optional inject under subtitle
  }

  let sceneBusy = false;
  const SCENE_MS = 1000; // match AccessElectricityRegions opacity 1s

  function setScene(i, animate = true) {
    if (!scenes.length) return;
    const next = Math.max(0, Math.min(scenes.length - 1, i));
    if (next === sceneIndex && storyCard && !storyCard.hidden) {
      // still re-render if needed, but skip card animation
    }
    sceneIndex = next;
    const scene = scenes[sceneIndex];
    storyCard.hidden = false;
    nav.hidden = false;
    progressEl.hidden = false;

    const html = formatSceneHtml(scene.text || "");
    const accent = sceneAccent(scene.text || "");

    const applyCopy = () => {
      storyText.innerHTML = html;
      if (sceneMeta) sceneMeta.textContent = `${sceneIndex + 1} · ${scene.id || "scene"}`;
      if (storyCard) storyCard.style.borderLeftColor = accent;
    };

    // Annotation crossfade (Atlas left card) — out → swap → in
    if (animate && storyCard && isScroller) {
      storyCard.classList.remove("is-entered", "is-entering");
      storyCard.classList.add("is-leaving");
      window.setTimeout(() => {
        applyCopy();
        storyCard.classList.remove("is-leaving");
        storyCard.classList.add("is-entering");
        // force reflow so enter transition runs
        void storyCard.offsetWidth;
        storyCard.classList.remove("is-entering");
        storyCard.classList.add("is-entered");
      }, 280);
    } else if (animate && storyText) {
      storyText.classList.remove("scene-in");
      storyText.classList.add("scene-out");
      window.setTimeout(() => {
        applyCopy();
        storyText.classList.remove("scene-out");
        storyText.classList.add("scene-in");
      }, 200);
    } else {
      applyCopy();
      if (storyCard) {
        storyCard.classList.remove("is-leaving", "is-entering");
        storyCard.classList.add("is-entered");
      }
    }

    counter.textContent = `${sceneIndex + 1} / ${scenes.length}`;
    btnPrev.disabled = sceneIndex === 0;
    btnNext.disabled = sceneIndex === scenes.length - 1;
    [...progressEl.children].forEach((b, idx) =>
      b.classList.toggle("active", idx === sceneIndex)
    );

    // Chart scene transition (1s opacity + particles) — never remount
    return renderReplica(scene, animate);
  }

  async function boot() {
    if (scenes.length) {
      progressEl.innerHTML = "";
      scenes.forEach((s, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.title = s.id || `Scene ${i + 1}`;
        b.addEventListener("click", () => setScene(i));
        progressEl.appendChild(b);
      });
      btnPrev.addEventListener("click", () => setScene(sceneIndex - 1));
      btnNext.addEventListener("click", () => setScene(sceneIndex + 1));

      // Lock wheel for full Atlas scene window (1s) so transitions complete
      let wheelLock = false;
      document.getElementById("stage").addEventListener(
        "wheel",
        (e) => {
          if (Math.abs(e.deltaY) < 10) return;
          e.preventDefault();
          if (wheelLock || sceneBusy) return;
          wheelLock = true;
          sceneBusy = true;
          setScene(sceneIndex + (e.deltaY > 0 ? 1 : -1));
          setTimeout(() => {
            wheelLock = false;
            sceneBusy = false;
          }, SCENE_MS);
        },
        { passive: false }
      );

      window.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight" || e.key === " ") {
          e.preventDefault();
          setScene(sceneIndex + 1);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          setScene(sceneIndex - 1);
        }
      });
    }

    // Wait so main.js always defines AtlasReplica before first render
    for (let i = 0; i < 20 && typeof window.AtlasReplica?.render !== "function"; i++) {
      await new Promise((r) => setTimeout(r, 25));
    }

    if (scenes.length) {
      // First scene: show annotation + chart (no remount animation)
      try {
        await setScene(0, false);
      } catch (err) {
        showRenderError(err);
        return;
      }
    } else if (rendererAvailable()) {
      await renderReplica(null, false);
    }
  }

  window.AtlasShell = {
    setScene,
    ctx,
    config,
    get sceneIndex() {
      return sceneIndex;
    },
  };

  await boot();
})().catch((err) => {
  console.error(err);
  const pre = document.getElementById("meta-pre");
  if (pre) pre.textContent = String(err);
  const placeholder = document.getElementById("placeholder");
  if (placeholder) {
    placeholder.style.display = "";
    placeholder.innerHTML = `<strong style="color:#aa0000">Shell error</strong><p>${String(err)}</p>`;
  }
});
