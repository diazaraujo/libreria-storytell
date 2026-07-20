/**
 * AtlasAccessTrendsScroller v0.1
 * Pattern: internet_access_scroller (CJtYBxvU) — multi-series line chart
 * with scene-driven series sets (world → income → regions).
 *
 * Depends: window.AtlasSVG
 * API: mount once → updateScene(n)
 */
(function (global) {
  const INC_COLORS = {
    LIC: "#3B4DA6",
    LMC: "#DB95D7",
    UMC: "#73AF48",
    HIC: "#016B6C",
  };
  const REG_COLORS = {
    WLD: "#081079",
    EAS: "#F3578E",
    ECS: "#AA0000",
    LCN: "#0C7C68",
    MEA: "#664AB6",
    NAC: "#34A7F2",
    SAS: "#4EC2C0",
    SSF: "#FF9800",
  };
  const DEFAULT_LABELS = {
    WLD: "World",
    LIC: "Low income",
    LMC: "Lower middle",
    UMC: "Upper middle",
    HIC: "High income",
    EAS: "East Asia & Pacific",
    ECS: "Europe & CA",
    LCN: "LAC",
    MEA: "MENA",
    NAC: "N. America",
    SAS: "South Asia",
    SSF: "Sub-Saharan Africa",
  };
  const DEFAULT_SCENES = [
    ["WLD"],
    ["LIC", "LMC", "UMC", "HIC"],
    ["WLD", "EAS", "ECS", "LCN", "MEA", "NAC", "SAS", "SSF"],
  ];
  const TRANSITION_MS = 700;
  const INSTANCES = new WeakMap();

  function ensureSVG() {
    if (!global.AtlasSVG) throw new Error("AtlasAccessTrendsScroller needs AtlasSVG");
    return global.AtlasSVG;
  }

  function colorFor(key, colors) {
    return (
      (colors && colors[key]) ||
      INC_COLORS[key] ||
      REG_COLORS[key] ||
      "#57626a"
    );
  }

  function parseRows(rows, valueField) {
    const by = new Map();
    rows.forEach((r) => {
      const key = r.iso3c || r.key;
      const y = +r.year;
      const v = +(r[valueField] != null ? r[valueField] : r.value);
      if (!key || !Number.isFinite(y) || !Number.isFinite(v)) return;
      if (!by.has(key)) by.set(key, []);
      by.get(key).push({ year: y, v });
    });
    by.forEach((pts) => pts.sort((a, b) => a.year - b.year));
    return by;
  }

  function yearExtent(by) {
    let min = Infinity;
    let max = -Infinity;
    by.forEach((pts) => {
      pts.forEach((p) => {
        if (p.year < min) min = p.year;
        if (p.year > max) max = p.year;
      });
    });
    if (!Number.isFinite(min)) return [2005, 2025];
    return [min, max];
  }

  function mount(container, options = {}) {
    const SVG = ensureSVG();
    const {
      rows = [],
      valueField = "value",
      sceneIndex = 0,
      sceneKeys = DEFAULT_SCENES,
      labels: labelMap = {},
      colors = null,
      yDomain = [0, 100],
      xTicks = null,
      height: heightOpt = null,
      reuse = true,
      forceRemount = false,
      animate = true,
    } = options;

    const LABELS = { ...DEFAULT_LABELS, ...labelMap };

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

    const by = parseRows(rows, valueField);
    const [x0, x1] = yearExtent(by);
    const tickYears =
      xTicks ||
      Array.from(
        new Set(
          [x0, Math.round((x0 + x1) / 2), x1].concat(
            [2005, 2010, 2015, 2020, 2025].filter((y) => y >= x0 && y <= x1)
          )
        )
      ).sort((a, b) => a - b);

    container.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-access-trends atlas-chart-root";
    const w = Math.max(320, container.clientWidth || 900);
    const h = heightOpt || Math.max(360, container.clientHeight || 440);
    root.style.cssText = `position:relative;width:100%;height:${h}px;font-family:'Open Sans',system-ui,sans-serif;background:#fff`;
    container.appendChild(root);

    const style = document.createElement("style");
    style.textContent = `
      .atlas-access-trends .series-g {
        transition: opacity ${TRANSITION_MS}ms ease;
      }
      .atlas-access-trends path.series-line {
        fill: none;
        stroke-linecap: round;
        stroke-linejoin: round;
        transition: opacity ${TRANSITION_MS}ms ease, stroke-width ${TRANSITION_MS}ms ease;
      }
      .atlas-access-trends circle.series-dot,
      .atlas-access-trends text.series-label {
        transition: opacity ${TRANSITION_MS}ms ease;
      }
    `;
    root.appendChild(style);

    const margin = { top: 28, right: 148, bottom: 42, left: 48 };
    const svg = SVG.el(root, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.cssText = "width:100%;height:100%;display:block";

    const xScale = SVG.scaleLinear([x0, x1], [margin.left, w - margin.right]);
    const yScale = SVG.scaleLinear(yDomain, [h - margin.bottom, margin.top]);

    // grid + axes
    const yTicks = [0, 25, 50, 75, 100].filter(
      (t) => t >= yDomain[0] && t <= yDomain[1]
    );
    yTicks.forEach((t) => {
      SVG.el(svg, "line", {
        x1: margin.left,
        x2: w - margin.right,
        y1: yScale(t),
        y2: yScale(t),
        stroke: "#f1f5f9",
      });
      SVG.el(svg, "text", {
        x: margin.left - 8,
        y: yScale(t) + 4,
        "text-anchor": "end",
        fill: "#6a7781",
        "font-size": 11,
      }).textContent = t + "%";
    });
    tickYears.forEach((yr) => {
      SVG.el(svg, "text", {
        x: xScale(yr),
        y: h - margin.bottom + 22,
        "text-anchor": "middle",
        fill: "#6a7781",
        "font-size": 12,
        "font-weight": "600",
      }).textContent = String(yr);
    });

    // pre-build all series, hide with opacity
    const seriesEls = new Map();
    const allKeys = new Set();
    sceneKeys.forEach((ks) => ks.forEach((k) => allKeys.add(k)));
    // also include any keys present in data that might be used
    by.forEach((_, k) => allKeys.add(k));

    allKeys.forEach((k) => {
      const pts = by.get(k);
      if (!pts || pts.length < 2) return;
      const col = colorFor(k, colors);
      const g = SVG.el(svg, "g", { class: "series-g", "data-key": k });
      g.style.opacity = "0";
      g.style.pointerEvents = "none";

      const d = pts
        .map((p, i) => `${i ? "L" : "M"}${xScale(p.year)},${yScale(p.v)}`)
        .join(" ");
      const path = SVG.el(g, "path", {
        class: "series-line",
        d,
        stroke: col,
        "stroke-width": k === "WLD" ? 3 : 2.4,
      });
      const last = pts[pts.length - 1];
      SVG.el(g, "circle", {
        class: "series-dot",
        cx: xScale(last.year),
        cy: yScale(last.v),
        r: 3.5,
        fill: col,
      });
      const label = SVG.el(g, "text", {
        class: "series-label",
        x: xScale(last.year) + 8,
        y: yScale(last.v) + 4,
        fill: col,
        "font-size": 12,
        "font-weight": "700",
      });
      label.textContent = `${LABELS[k] || k} ${last.v.toFixed(1)}%`;
      seriesEls.set(k, { g, path });
    });

    let current = -1;

    function applyScene(idx, { animate: doAnim = true } = {}) {
      const keys = new Set(sceneKeys[Math.max(0, Math.min(idx, sceneKeys.length - 1))] || []);
      seriesEls.forEach(({ g }, k) => {
        const on = keys.has(k);
        if (!doAnim) g.style.transition = "none";
        g.style.opacity = on ? "1" : "0";
        g.style.pointerEvents = on ? "auto" : "none";
        if (!doAnim) {
          // reflow then restore transition
          void g.getBoundingClientRect();
          g.style.transition = "";
        }
      });
      current = idx;
    }

    applyScene(sceneIndex, { animate: false });
    if (animate) {
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
      version: "0.1.0",
    };

    INSTANCES.set(container, {
      api,
      setScene: (n, opts) => applyScene(n, opts),
    });
    return api;
  }

  const api = { mount, DEFAULT_SCENES, DEFAULT_LABELS, version: "0.1.0" };
  global.AtlasAccessTrendsScroller = api;
  global.AtlasLibrary = global.AtlasLibrary || {};
  global.AtlasLibrary.AccessTrendsScroller = api;
})(typeof window !== "undefined" ? window : globalThis);
