/**
 * Atlas Chapter Scroll Runtime
 * Scroll-linked sticky stages + scene index (like Atlas inview scroller).
 *
 * Usage:
 *   AtlasChapterScroll.mount(rootEl, storyConfig)
 *
 * storyConfig.blocks[]:
 *   { id, type: 'scroller'|'vis'|'prose', title, subtitle, scenes?,
 *     mount(chartEl, ctx) → controller | void,
 *     vhPerScene?: number,  // default 0.9
 *     html?: string }       // for prose
 *
 * controller: { updateScene(i, {animate}), destroy? }
 */
(function (global) {
  const DEFAULT_VH = 0.9;
  const SCENE_EPS = 0.02;

  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }

  function sceneFromProgress(progress, n) {
    if (n <= 1) return 0;
    // progress 0..1 across sticky travel; map to 0..n-1
    const i = Math.floor(progress * n + SCENE_EPS);
    return clamp(i, 0, n - 1);
  }

  function accentFromHtml(html) {
    const s = String(html || "");
    const m =
      s.match(/data-color-id="([A-Z]{3})"/i) ||
      s.match(/class="([A-Z]{3})"/i) ||
      s.match(/background-color:\s*rgb\(255,\s*152,\s*0\)/i);
    if (m && m[1] && m[1].length === 3) {
      const map = {
        WLD: "#081079", EAS: "#F3578E", ECS: "#AA0000", LCN: "#0C7C68",
        MEA: "#664AB6", NAC: "#34A7F2", SAS: "#4EC2C0", SSF: "#FF9800",
      };
      return map[m[1].toUpperCase()] || "#c41230";
    }
    if (/255,\s*152,\s*0/.test(s)) return "#FF9800";
    return "#c41230";
  }

  function formatSceneHtml(html) {
    if (!html) return "";
    let s = String(html);
    s = s.replace(/\[emphasis:\s*([^\]]+)\]/gi, (_, t) => {
      const text = String(t).trim();
      return text ? `<span class="emphasis">${text}</span>` : "";
    });
    s = s.replace(/\[emphasis:\s*\]/gi, "");
    s = s.replace(/\{\{[^}]+\}\}/g, "");
    return s;
  }

  function buildBlockDOM(block, index) {
    const section = document.createElement("section");
    section.className = `ch-block ch-block--${block.type || "scroller"}`;
    section.dataset.blockId = block.id || `b${index}`;
    section.dataset.blockIndex = String(index);

    if (block.type === "prose") {
      section.classList.add("ch-prose");
      const inner = document.createElement("div");
      inner.className = "ch-prose-inner";
      inner.innerHTML = block.html || block.text || "";
      section.appendChild(inner);
      return { section, chartEl: null, noteEl: null, titleEl: null };
    }

    const nScenes = (block.scenes && block.scenes.length) || 1;
    const vh = block.vhPerScene != null ? block.vhPerScene : DEFAULT_VH;
    // Travel height so sticky has room (Atlas-like calc(100% - 100vh) sensor)
    section.style.setProperty("--ch-scenes", String(nScenes));
    section.style.setProperty("--ch-vh", String(vh));
    section.style.minHeight = `calc(${nScenes * vh} * 100vh)`;

    const sticky = document.createElement("div");
    sticky.className = "ch-sticky";

    const inner = document.createElement("div");
    inner.className = "ch-sticky-inner";

    // Head over chart column only + red rule (Atlas)
    const head = document.createElement("header");
    head.className = "ch-sticky-head";
    if (block.title) {
      const h2 = document.createElement("h2");
      h2.className = "ch-title";
      h2.textContent = block.title;
      head.appendChild(h2);
    }
    if (block.subtitle) {
      const sub = document.createElement("p");
      sub.className = "ch-subtitle";
      sub.textContent = block.subtitle;
      head.appendChild(sub);
    }
    const rule = document.createElement("hr");
    rule.className = "ch-rule";
    head.appendChild(rule);
    inner.appendChild(head);

    // Annotation left
    const note = document.createElement("aside");
    note.className = "ch-note is-entered";
    note.innerHTML = `<div class="ch-note-text"></div>`;
    inner.appendChild(note);

    // Chart column
    const chartWrap = document.createElement("div");
    chartWrap.className = "ch-chart-wrap";
    const chart = document.createElement("div");
    chart.className = "ch-chart";
    chart.setAttribute("role", "img");
    chart.setAttribute("aria-label", block.title || block.id || "chart");
    chartWrap.appendChild(chart);

    const dots = document.createElement("div");
    dots.className = "ch-dots";
    for (let i = 0; i < nScenes; i++) {
      const d = document.createElement("button");
      d.type = "button";
      d.dataset.scene = String(i);
      d.setAttribute("aria-label", `Scene ${i + 1}`);
      dots.appendChild(d);
    }
    chartWrap.appendChild(dots);
    inner.appendChild(chartWrap);

    if (block.source) {
      const src = document.createElement("footer");
      src.className = "ch-source";
      src.innerHTML = `Source: ${block.source}`;
      inner.appendChild(src);
    }

    sticky.appendChild(inner);
    section.appendChild(sticky);

    // invisible inview track (mirrors Atlas sensor height)
    const sensor = document.createElement("div");
    sensor.className = "ch-sensor";
    section.appendChild(sensor);

    return {
      section,
      sticky,
      chartEl: chart,
      noteEl: note,
      noteText: note.querySelector(".ch-note-text"),
      dotsEl: dots,
      titleEl: head.querySelector(".ch-title"),
      nScenes,
      vh,
    };
  }

  function mount(root, story) {
    if (!root) throw new Error("chapter-scroll: root required");
    const blocks = story.blocks || [];
    root.classList.add("ch-story");
    root.innerHTML = "";

    if (story.hero) {
      const hero = document.createElement("header");
      hero.className = "ch-hero";
      hero.innerHTML = `
        <p class="ch-kicker">${story.hero.kicker || "Electricity Access"}</p>
        <h1>${story.hero.title || story.title || ""}</h1>
        <p class="ch-lead">${story.hero.lead || ""}</p>
      `;
      root.appendChild(hero);
    }

    const runtime = [];
    const controllers = new Map(); // id → controller
    let raf = 0;

    blocks.forEach((block, index) => {
      const ui = buildBlockDOM(block, index);
      root.appendChild(ui.section);

      const state = {
        block,
        index,
        ui,
        nScenes: ui.nScenes || (block.scenes && block.scenes.length) || 1,
        sceneIndex: -1,
        mounted: false,
        controller: null,
      };
      runtime.push(state);

      // dots jump
      if (ui.dotsEl) {
        ui.dotsEl.addEventListener("click", (e) => {
          const btn = e.target.closest("button[data-scene]");
          if (!btn) return;
          const si = +btn.dataset.scene;
          scrollToScene(state, si);
        });
      }
    });

    function scrollToScene(state, sceneIndex) {
      const rect = state.ui.section.getBoundingClientRect();
      const top = window.scrollY + rect.top;
      const h = state.ui.section.offsetHeight;
      const travel = Math.max(1, h - window.innerHeight);
      const n = state.nScenes || 1;
      const p = n <= 1 ? 0 : (sceneIndex + 0.5) / n;
      window.scrollTo({ top: top + travel * p, behavior: "smooth" });
    }

    async function ensureMounted(state, { force = false } = {}) {
      if (state.block.type === "prose") return;
      if (state.mounted && !force) return;
      if (state.controller && force && state.controller.destroy) {
        try { state.controller.destroy(); } catch (_) { /* ignore */ }
        state.controller = null;
      }
      state.mounted = true;
      const ctx = {
        block: state.block,
        chartEl: state.ui.chartEl,
        sceneIndex: Math.max(0, state.sceneIndex),
        animate: false,
      };
      try {
        if (typeof state.block.mount === "function") {
          state.controller = await state.block.mount(state.ui.chartEl, ctx);
        }
      } catch (err) {
        console.error("chapter-scroll mount", state.block.id, err);
        if (state.ui.chartEl) {
          state.ui.chartEl.innerHTML = `<div class="ch-error">Mount error: ${String(err.message || err)}</div>`;
        }
      }
      if (state.controller) controllers.set(state.block.id, state.controller);

      // Remount only when size changes a lot (avoid thrashing that resets scenes)
      if (state.ui.chartEl && !state._ro) {
        let lastW = state.ui.chartEl.clientWidth;
        let lastH = state.ui.chartEl.clientHeight;
        let roTimer = 0;
        state._ro = new ResizeObserver(() => {
          const el = state.ui.chartEl;
          if (!el) return;
          const w = el.clientWidth;
          const h = el.clientHeight;
          if (w < 80 || h < 80) return;
          if (Math.abs(w - lastW) < 40 && Math.abs(h - lastH) < 40) return;
          lastW = w;
          lastH = h;
          // debounce force remount
          clearTimeout(roTimer);
          roTimer = setTimeout(() => {
            const keep = state.sceneIndex;
            ensureMounted(state, { force: true }).then(() => {
              if (keep >= 0) applyScene(state, keep, { animate: false });
            });
          }, 120);
        });
        state._ro.observe(state.ui.chartEl);
      }
    }

    function setNote(state, sceneIndex, animate) {
      const scenes = state.block.scenes || [];
      const scene = scenes[sceneIndex];
      if (!state.ui.noteEl || !scene) {
        if (state.ui.noteEl) state.ui.noteEl.style.visibility = scenes.length ? "visible" : "hidden";
        return;
      }
      const html = formatSceneHtml(scene.text || "");
      const accent = accentFromHtml(scene.text || "");
      const note = state.ui.noteEl;
      const apply = () => {
        if (state.ui.noteText) state.ui.noteText.innerHTML = html;
        // Atlas annotation rail stays red; color lives in text chips
        note.style.borderLeftColor = "";
      };
      if (!animate) {
        apply();
        note.classList.remove("is-leaving", "is-entering");
        note.classList.add("is-entered");
        return;
      }
      note.classList.remove("is-entered", "is-entering");
      note.classList.add("is-leaving");
      setTimeout(() => {
        apply();
        note.classList.remove("is-leaving");
        note.classList.add("is-entering");
        void note.offsetWidth;
        note.classList.remove("is-entering");
        note.classList.add("is-entered");
      }, 260);
    }

    function setDots(state, sceneIndex) {
      if (!state.ui.dotsEl) return;
      [...state.ui.dotsEl.children].forEach((b, i) => {
        b.classList.toggle("active", i === sceneIndex);
      });
    }

    async function applyScene(state, sceneIndex, { animate = true } = {}) {
      if (sceneIndex === state.sceneIndex) return;
      const prev = state.sceneIndex;
      state.sceneIndex = sceneIndex;
      setDots(state, sceneIndex);
      setNote(state, sceneIndex, animate && prev >= 0);

      await ensureMounted(state);
      if (state.controller && typeof state.controller.updateScene === "function") {
        state.controller.updateScene(sceneIndex, { animate: animate && prev >= 0 });
      } else if (state.controller && typeof state.controller.setScene === "function") {
        state.controller.setScene(sceneIndex, { animate: animate && prev >= 0 });
      }
    }

    function tick() {
      raf = 0;
      const vh = window.innerHeight;
      runtime.forEach((state) => {
        if (state.block.type === "prose") return;
        const sec = state.ui.section;
        const rect = sec.getBoundingClientRect();
        // Active while section intersects viewport (sticky travel)
        const visible = rect.bottom > 80 && rect.top < vh - 40;
        if (!visible) return;

        // Progress: 0 when block top hits viewport top, 1 near end of travel
        const travel = Math.max(1, sec.offsetHeight - vh);
        const scrolled = clamp(-rect.top, 0, travel);
        const progress = scrolled / travel;
        const n = state.nScenes || 1;
        const sceneIndex = sceneFromProgress(progress, n);

        // Sync scene (mount if needed). Do not gate applyScene behind only-first-mount.
        if (!state.mounted) {
          ensureMounted(state).then(() => {
            applyScene(state, sceneIndex, { animate: false });
          });
        } else {
          applyScene(state, sceneIndex, { animate: true });
        }
      });
    }

    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(tick);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    // initial
    tick();

    return {
      root,
      runtime,
      destroy() {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
        controllers.forEach((c) => c.destroy && c.destroy());
        root.innerHTML = "";
      },
      scrollToBlock(id) {
        const st = runtime.find((s) => s.block.id === id);
        if (st) st.ui.section.scrollIntoView({ behavior: "smooth", block: "start" });
      },
    };
  }

  global.AtlasChapterScroll = {
    mount,
    formatSceneHtml,
    sceneFromProgress,
    version: "0.1.1",
  };
})(typeof window !== "undefined" ? window : globalThis);
