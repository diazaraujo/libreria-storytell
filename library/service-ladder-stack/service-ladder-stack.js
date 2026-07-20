/**
 * AtlasServiceLadderStack v0.1
 * Pattern: safely_managed (goal_06) — stacked area of service levels over time.
 * Scene-driven year reveal (start → mid → full).
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
  // JMP palette matched to origin water-access (scene chips + areas)
  const DEFAULT_COLORS = {
    "Safely managed": "#0080c6",
    Basic: "#00b8ec",
    Limited: "#ced4de",
    Unimproved: "#e3a763",
    Surface: "#bd6126",
  };
  // Scene year caps: scene 0 = first year emphasis, 1 = through 2015, 2 = full
  const DEFAULT_YEAR_CAPS = [null, 2015, Infinity];
  const TRANSITION_MS = 800;
  const INSTANCES = new WeakMap();

  function ensureSVG() {
    if (!global.AtlasSVG) throw new Error("AtlasServiceLadderStack needs AtlasSVG");
    return global.AtlasSVG;
  }

  function pivot(rows, order) {
    const byYear = new Map();
    rows.forEach((r) => {
      const y = +r.year;
      const v = +r.value;
      let lvl = r.level;
      if (!Number.isFinite(y) || !Number.isFinite(v) || !lvl) return;
      // normalize Surface water label
      if (/^surface/i.test(lvl)) lvl = "Surface";
      if (!byYear.has(y)) byYear.set(y, {});
      byYear.get(y)[lvl] = v;
    });
    const years = [...byYear.keys()].sort((a, b) => a - b);
    return { byYear, years, order };
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

    const { byYear, years: allYears } = pivot(rows, order);
    if (!allYears.length) {
      container.innerHTML =
        '<div style="padding:24px;color:#aa0000">service-ladder-stack: no data</div>';
      return { updateScene() {}, destroy() {}, sceneIndex: 0 };
    }

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
        display:flex; flex-wrap:wrap; gap:10px 16px; padding:8px 4px 0;
        font-size:12px; color:#3d4a54; font-weight:600;
      }
      .atlas-service-ladder .legend span { display:inline-flex; align-items:center; gap:6px; }
      .atlas-service-ladder .legend i {
        width:12px; height:12px; border-radius:2px; display:inline-block;
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
        span.innerHTML = `<i style="background:${colors[o] || "#999"}"></i>${o}`;
        leg.appendChild(span);
      });
      root.appendChild(leg);
    }

    const plot = document.createElement("div");
    plot.className = "plot";
    root.appendChild(plot);

    const margin = { top: 16, right: 16, bottom: 36, left: 44 };
    const plotH = Math.max(200, (plot.clientHeight || h - 40));
    const svg = SVG.el(plot, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${plotH}`);
    svg.style.cssText = "width:100%;height:100%;display:block";

    const xDomain = [allYears[0], allYears[allYears.length - 1]];
    const xScale = SVG.scaleLinear(xDomain, [margin.left, w - margin.right]);
    const yScale = SVG.scaleLinear([0, 100], [plotH - margin.bottom, margin.top]);

    // static grid
    [0, 25, 50, 75, 100].forEach((t) => {
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
    allYears
      .filter((y) => y % 5 === 0 || y === allYears[0] || y === allYears[allYears.length - 1])
      .forEach((yr) => {
        SVG.el(svg, "text", {
          x: xScale(yr),
          y: plotH - margin.bottom + 20,
          "text-anchor": "middle",
          fill: "#6a7781",
          "font-size": 12,
          "font-weight": "600",
        }).textContent = String(yr);
      });

    const bandsG = SVG.el(svg, "g", { class: "bands" });

    function yearsForScene(idx) {
      const cap = yearCaps[Math.max(0, Math.min(idx, yearCaps.length - 1))];
      if (cap == null) {
        // scene 0: show only start year (thin strip) — use first two points for area
        const y0 = allYears[0];
        return allYears.filter((y) => y <= y0 + 0); // first year only → need 2 pts
      }
      if (!Number.isFinite(cap)) return allYears.slice();
      return allYears.filter((y) => y <= cap);
    }

    // For scene 0 with one year, duplicate so area has width
    function renderYears(years) {
      let ys = years.slice();
      if (ys.length === 1) {
        // invent a 1-year window for a visible strip
        ys = [ys[0], ys[0] + 0.35];
      }
      bandsG.innerHTML = "";
      const stacked = [];
      ys.forEach((y) => {
        const realY = Math.floor(y);
        let acc = 0;
        order.forEach((lvl) => {
          const v = byYear.get(realY)?.[lvl] ?? 0;
          stacked.push({ x: y, y0: acc, y1: acc + v, series: lvl });
          acc += v;
        });
      });
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
        SVG.el(bandsG, "path", {
          class: "band",
          d,
          fill: colors[lvl] || "#999",
          opacity: 0.92,
          stroke: "none",
        });
      });
    }

    let current = sceneIndex;
    // Better scene 0: show full chart but highlight only Safely managed via opacity
    // Matching chapter progressive year reveal is ok for MVP
    function applyScene(idx) {
      current = idx;
      if (idx === 0) {
        // full series, dim non-safely-managed
        renderYears(allYears);
        const paths = bandsG.querySelectorAll("path.band");
        paths.forEach((p, i) => {
          p.style.opacity = order[i] === "Safely managed" ? "0.95" : "0.25";
        });
      } else if (idx === 1) {
        renderYears(allYears);
        const paths = bandsG.querySelectorAll("path.band");
        paths.forEach((p, i) => {
          const lvl = order[i];
          p.style.opacity =
            lvl === "Safely managed" || lvl === "Basic" ? "0.95" : "0.28";
        });
      } else {
        renderYears(allYears);
        bandsG.querySelectorAll("path.band").forEach((p) => {
          p.style.opacity = "0.92";
        });
      }
    }

    applyScene(sceneIndex);

    const api = {
      updateScene(n) {
        applyScene(n);
      },
      setScene(n) {
        applyScene(n);
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

    INSTANCES.set(container, { api, setScene: applyScene });
    return api;
  }

  const api = {
    mount,
    DEFAULT_ORDER,
    DEFAULT_COLORS,
    version: "0.1.0",
  };
  global.AtlasServiceLadderStack = api;
  global.AtlasLibrary = global.AtlasLibrary || {};
  global.AtlasLibrary.ServiceLadderStack = api;
})(typeof window !== "undefined" ? window : globalThis);
