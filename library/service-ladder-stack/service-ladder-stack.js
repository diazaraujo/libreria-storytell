/**
 * AtlasServiceLadderStack v0.3 — beauty: Total-only pivot + Open Sans craft
 * Pattern: safely_managed (goal_06) — stacked area JMP ladder.
 * Scenes: full timeline + layer emphasis (dim inactive bands).
 *
 * Data: year, level, value · optional Global column (Total | Urban | Rural).
 * Prefer Global=Total so stacked bands sum to ~100% (61%→74% safely managed).
 *
 * Depends: window.AtlasSVG
 */
(function (global) {
  const DEFAULT_ORDER = [
    "Safely managed",
    "Basic",
    "Limited",
    "Unimproved",
    "Surface",
  ];
  const DEFAULT_COLORS = {
    "Safely managed": "#0080c6",
    Basic: "#00b8ec",
    Limited: "#ced4de",
    Unimproved: "#e3a763",
    Surface: "#bd6126",
  };
  // Full timeline + layer emphasis (yearCaps optional for progressive demos).
  const DEFAULT_YEAR_CAPS = [Infinity, Infinity, Infinity];
  const TRANSITION_MS = 900;
  const INSTANCES = new WeakMap();

  function ensureSVG() {
    if (!global.AtlasSVG) throw new Error("AtlasServiceLadderStack needs AtlasSVG");
    return global.AtlasSVG;
  }

  function isTotalScope(r) {
    // JMP CSVs ship Total / Urban / Rural. Prefer Total (global ladder).
    const g = r.Global != null ? r.Global : r.global != null ? r.global : r.scope;
    if (g == null || g === "") return true;
    return /^total$/i.test(String(g).trim());
  }

  function pivot(rows) {
    const byYear = new Map();
    rows.forEach((r) => {
      if (!isTotalScope(r)) return;
      const y = +r.year;
      const v = +r.value;
      let lvl = r.level;
      if (!Number.isFinite(y) || !Number.isFinite(v) || !lvl) return;
      if (/^surface/i.test(lvl)) lvl = "Surface";
      if (!byYear.has(y)) byYear.set(y, {});
      byYear.get(y)[lvl] = v;
    });
    const years = [...byYear.keys()].sort((a, b) => a - b);
    return { byYear, years };
  }

  function mount(container, options = {}) {
    const SVG = ensureSVG();
    const {
      rows = [],
      sceneIndex = 0,
      order = DEFAULT_ORDER,
      colors = DEFAULT_COLORS,
      yearCaps = DEFAULT_YEAR_CAPS,
      height: heightOpt = null,
      reuse = true,
      forceRemount = false,
      legend = true,
    } = options;

    if (!container) throw new Error("container required");
    if (reuse && !forceRemount && INSTANCES.has(container)) {
      const inst = INSTANCES.get(container);
      inst.setScene(sceneIndex, { animate: options.animate !== false });
      return inst.api;
    }
    if (INSTANCES.has(container)) {
      try {
        INSTANCES.get(container).api.destroy();
      } catch (_) {}
      INSTANCES.delete(container);
    }

    const { byYear, years: allYears } = pivot(rows);
    if (!allYears.length) {
      container.innerHTML =
        '<div style="padding:24px;color:#aa0000">service-ladder-stack: no data</div>';
      return { updateScene() {}, destroy() {}, sceneIndex: 0 };
    }

    const xDomain = [allYears[0], allYears[allYears.length - 1]];

    container.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-service-ladder atlas-chart-root";
    const w = Math.max(320, container.clientWidth || 900);
    const h = heightOpt || Math.max(380, container.clientHeight || 440);
    root.style.cssText = `position:relative;width:100%;height:${h}px;font-family:'Open Sans',system-ui,sans-serif;background:#fff;display:flex;flex-direction:column`;
    container.appendChild(root);

    const style = document.createElement("style");
    style.textContent = `
      .atlas-service-ladder .plot { flex:1; min-height:0; position:relative; }
      .atlas-service-ladder .legend {
        display:flex; flex-wrap:wrap; gap:10px 18px; padding:6px 2px 4px;
        font-size:12px; color:#100e2b; font-weight:600;
        font-family:'Open Sans',system-ui,sans-serif;
      }
      .atlas-service-ladder .legend span { display:inline-flex; align-items:center; gap:6px; transition: opacity ${TRANSITION_MS}ms ease; }
      .atlas-service-ladder .legend i {
        width:11px; height:11px; border-radius:2px; display:inline-block;
        transition: opacity ${TRANSITION_MS}ms ease;
      }
      .atlas-service-ladder path.band {
        transition: opacity ${TRANSITION_MS}ms ease;
      }
    `;
    root.appendChild(style);

    if (legend) {
      const leg = document.createElement("div");
      leg.className = "legend";
      order.forEach((o) => {
        const span = document.createElement("span");
        span.dataset.level = o;
        span.innerHTML = `<i style="background:${colors[o] || "#999"}"></i>${o}`;
        leg.appendChild(span);
      });
      root.appendChild(leg);
    }

    const plot = document.createElement("div");
    plot.className = "plot";
    root.appendChild(plot);

    const margin = { top: 12, right: 14, bottom: 34, left: 42 };
    const plotH = Math.max(200, plot.clientHeight || h - 40);
    const svg = SVG.el(plot, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${plotH}`);
    svg.style.cssText = "width:100%;height:100%;display:block";

    const xScale = SVG.scaleLinear(xDomain, [margin.left, w - margin.right]);
    const yScale = SVG.scaleLinear([0, 100], [plotH - margin.bottom, margin.top]);

    [0, 25, 50, 75, 100].forEach((t) => {
      SVG.el(svg, "line", {
        x1: margin.left,
        x2: w - margin.right,
        y1: yScale(t),
        y2: yScale(t),
        stroke: t === 0 ? "#e8ecf0" : "#f1f5f9",
        "stroke-width": 1,
      });
      SVG.el(svg, "text", {
        x: margin.left - 8,
        y: yScale(t) + 4,
        "text-anchor": "end",
        fill: "#6a7781",
        "font-size": 11,
        "font-weight": "600",
        "font-family": "Open Sans, system-ui, sans-serif",
      }).textContent = t + "%";
    });
    allYears
      .filter(
        (y) =>
          y % 5 === 0 ||
          y === allYears[0] ||
          y === allYears[allYears.length - 1]
      )
      .forEach((yr) => {
        SVG.el(svg, "text", {
          x: xScale(yr),
          y: plotH - margin.bottom + 18,
          "text-anchor": "middle",
          fill: "#6a7781",
          "font-size": 12,
          "font-weight": "600",
          "font-family": "Open Sans, system-ui, sans-serif",
        }).textContent = String(yr);
      });

    // clip rect for progressive year reveal
    const defs = SVG.el(svg, "defs");
    const clipId = "ladder-clip-" + Math.random().toString(36).slice(2, 8);
    const clip = SVG.el(defs, "clipPath", { id: clipId });
    const clipRect = SVG.el(clip, "rect", {
      x: margin.left,
      y: margin.top,
      width: w - margin.left - margin.right,
      height: plotH - margin.top - margin.bottom,
    });

    const bandsG = SVG.el(svg, "g", {
      class: "bands",
      "clip-path": `url(#${clipId})`,
    });

    // always render full stack (paths); animate clip width by year
    const stacked = [];
    allYears.forEach((y) => {
      let acc = 0;
      order.forEach((lvl) => {
        const v = byYear.get(y)?.[lvl] ?? 0;
        stacked.push({ x: y, y0: acc, y1: acc + v, series: lvl });
        acc += v;
      });
    });

    const bandEls = new Map();
    order.forEach((lvl) => {
      const pts = stacked.filter((d) => d.series === lvl);
      if (pts.length < 2) return;
      let d = pts
        .map((p, i) => `${i ? "L" : "M"}${xScale(p.x)},${yScale(p.y1)}`)
        .join(" ");
      d +=
        " " +
        [...pts]
          .reverse()
          .map((p) => `L${xScale(p.x)},${yScale(p.y0)}`)
          .join(" ") +
        " Z";
      const path = SVG.el(bandsG, "path", {
        class: "band",
        d,
        fill: colors[lvl] || "#999",
        opacity: 0.92,
        stroke: "none",
      });
      bandEls.set(lvl, path);
    });

    let current = sceneIndex;

    function yearCapFor(idx) {
      const c = yearCaps[Math.max(0, Math.min(idx, yearCaps.length - 1))];
      if (c == null || !Number.isFinite(c)) return xDomain[1];
      // never collapse clip: at least ~12% of domain width
      const minY = xDomain[0] + (xDomain[1] - xDomain[0]) * 0.12;
      return Math.min(Math.max(c, minY), xDomain[1]);
    }

    function layersFor(idx) {
      if (idx === 0) return new Set(["Safely managed"]);
      if (idx === 1) return new Set(["Safely managed", "Basic"]);
      return new Set(order);
    }

    function applyScene(idx, { animate = true } = {}) {
      current = idx;
      const capY = yearCapFor(idx);
      const x0 = margin.left;
      const x1 = xScale(capY);
      const fullW = w - margin.left - margin.right;
      // Full-timeline default; yearCaps only shrink when finite
      let clipW = fullW;
      if (Number.isFinite(yearCaps[Math.max(0, Math.min(idx, yearCaps.length - 1))])) {
        clipW = Math.max(fullW * 0.12, Math.min(fullW, x1 - x0));
      }
      if (!animate) {
        clipRect.style.transition = "none";
      } else {
        clipRect.style.transition = `width ${TRANSITION_MS}ms ease`;
      }
      clipRect.setAttribute("width", String(clipW));

      const active = layersFor(idx);
      bandEls.forEach((path, lvl) => {
        const on = active.has(lvl);
        // Scene 0/1: dim inactive layers; scene 2: all full
        path.style.opacity = idx >= 2 ? "1" : on ? "1" : "0.14";
      });
      root.querySelectorAll(".legend span").forEach((span) => {
        const lvl = span.dataset.level;
        const on = active.has(lvl);
        span.style.opacity = idx >= 2 || on ? "1" : "0.35";
      });
    }

    applyScene(sceneIndex, { animate: false });
    if (options.animate !== false) {
      requestAnimationFrame(() => applyScene(sceneIndex, { animate: true }));
    }

    const api = {
      updateScene(n) {
        applyScene(n, { animate: true });
      },
      setScene(n, opts = {}) {
        applyScene(n, { animate: opts.animate !== false });
      },
      destroy() {
        try {
          container.innerHTML = "";
        } catch (_) {}
        INSTANCES.delete(container);
      },
      get sceneIndex() {
        return current;
      },
      version: "0.3.0",
    };
    INSTANCES.set(container, { api, setScene: (n, o) => applyScene(n, o) });
    return api;
  }

  const api = {
    mount,
    DEFAULT_ORDER,
    DEFAULT_COLORS,
    version: "0.3.0",
  };
  global.AtlasServiceLadderStack = api;
  global.AtlasLibrary = global.AtlasLibrary || {};
  global.AtlasLibrary.ServiceLadderStack = api;
})(typeof window !== "undefined" ? window : globalThis);
