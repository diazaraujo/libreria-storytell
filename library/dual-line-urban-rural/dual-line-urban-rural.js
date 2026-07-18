/**
 * AtlasDualLineUrbanRural v0.2 — pixel-matched
 *
 * Variants:
 *  - regions   (Bktvr1TG AccessElectricityUrbanRural)  4×2
 *  - countries (DnvCGyY_ AccessElectricityUrbanRuralCountries) 1×3 ETH/NGA/COD
 *
 * Dual lines urban/rural · gap = diagonal hatch · curveNatural
 * Vis — mount once.
 *
 * Depends: window.AtlasSVG
 */
(function (global) {
  const URBAN = "#6D88D1";
  const RURAL = "#54AE89";
  const URBAN_TEXT = "#5071c8";
  const RURAL_TEXT = "#21865d";

  const REGION_ORDER = ["WLD", "SSF", "SAS", "MEA", "LCN", "EAS", "ECS", "NAC"];
  const REGION_LABELS = {
    WLD: "World",
    SSF: "Sub-Saharan Africa",
    SAS: "South Asia",
    MEA: "Middle East, North Africa, Afghanistan & Pakistan",
    LCN: "Latin America & Caribbean",
    EAS: "East Asia & Pacific",
    ECS: "Europe & Central Asia",
    NAC: "North America",
  };

  const COUNTRY_ORDER = ["ETH", "NGA", "COD"];
  const COUNTRY_LABELS = {
    ETH: "Ethiopia",
    NGA: "Nigeria",
    COD: "Congo, Dem. Rep.",
  };

  const X_DOMAIN = [2000, 2023];
  const Y_DOMAIN = [0, 100];
  const INSTANCES = new WeakMap();

  function ensureSVG() {
    if (!global.AtlasSVG) throw new Error("AtlasDualLineUrbanRural needs AtlasSVG");
    return global.AtlasSVG;
  }

  function naturalControls(coords) {
    const n = coords.length - 1;
    if (n < 1) return [[], []];
    const a = new Array(n);
    const b = new Array(n);
    const r = new Array(n);
    a[0] = 0;
    b[0] = 2;
    r[0] = coords[0] + 2 * coords[1];
    for (let t = 1; t < n - 1; ++t) {
      a[t] = 1;
      b[t] = 4;
      r[t] = 4 * coords[t] + 2 * coords[t + 1];
    }
    a[n - 1] = 2;
    b[n - 1] = 7;
    r[n - 1] = 8 * coords[n - 1] + coords[n];
    for (let t = 1; t < n; ++t) {
      const s = a[t] / b[t - 1];
      b[t] -= s;
      r[t] -= s * r[t - 1];
    }
    a[n - 1] = r[n - 1] / b[n - 1];
    for (let t = n - 2; t >= 0; --t) a[t] = (r[t] - a[t + 1]) / b[t];
    const c1 = a;
    const c2 = new Array(n);
    c2[n - 1] = (coords[n] + c1[n - 1]) / 2;
    for (let t = 0; t < n - 1; ++t) c2[t] = 2 * coords[t + 1] - c1[t + 1];
    return [c1, c2];
  }

  function curvePath(pts, x, y) {
    if (!pts.length) return "";
    if (pts.length === 1) return `M${x(pts[0].year)},${y(pts[0].value)}`;
    if (pts.length === 2) {
      return `M${x(pts[0].year)},${y(pts[0].value)}L${x(pts[1].year)},${y(pts[1].value)}`;
    }
    const xs = pts.map((p) => x(p.year));
    const ys = pts.map((p) => y(p.value));
    const [cx1, cx2] = naturalControls(xs);
    const [cy1, cy2] = naturalControls(ys);
    let d = `M${xs[0]},${ys[0]}`;
    for (let i = 0; i < xs.length - 1; i++) {
      d += `C${cx1[i]},${cy1[i]},${cx2[i]},${cy2[i]},${xs[i + 1]},${ys[i + 1]}`;
    }
    return d;
  }

  function gapPath(joined, x, y) {
    if (joined.length < 2) return "";
    const top = joined.map((p) => ({ year: p.year, value: p.urban }));
    const bot = joined.map((p) => ({ year: p.year, value: p.rural }));
    const topD = curvePath(top, x, y);
    const botRev = bot.slice().reverse();
    const xs = botRev.map((p) => x(p.year));
    const ys = botRev.map((p) => y(p.value));
    if (xs.length < 2) return "";
    let d = topD;
    if (xs.length === 2) {
      d += `L${xs[0]},${ys[0]}L${xs[1]},${ys[1]}Z`;
      return d;
    }
    const [cx1, cx2] = naturalControls(xs);
    const [cy1, cy2] = naturalControls(ys);
    d += `L${xs[0]},${ys[0]}`;
    for (let i = 0; i < xs.length - 1; i++) {
      d += `C${cx1[i]},${cy1[i]},${cx2[i]},${cy2[i]},${xs[i + 1]},${ys[i + 1]}`;
    }
    return d + "Z";
  }

  function prepareByIso(rows) {
    const byIso = new Map();
    rows.forEach((r) => {
      const iso = r.iso3c || r.iso;
      const year = +r.year;
      const v = +r.access_electricity;
      const area = (r.area || "").toLowerCase();
      if (!iso || !Number.isFinite(year) || !Number.isFinite(v)) return;
      if (area !== "urban" && area !== "rural") return;
      if (!byIso.has(iso)) byIso.set(iso, { urban: [], rural: [] });
      byIso
        .get(iso)
        [area].push({ year, value: v, access_electricity: v, area });
    });
    byIso.forEach((o) => {
      o.urban.sort((a, b) => a.year - b.year);
      o.rural.sort((a, b) => a.year - b.year);
    });
    return byIso;
  }

  function variantConfig(variant, w, heightOpt) {
    const mobile = w < 640;
    if (variant === "countries") {
      // DnvCGyY_
      return {
        margin: { top: 16, right: 20, bottom: 30, left: 32 },
        gap: 40,
        cols: mobile ? 1 : 3,
        rowsN: mobile ? 3 : 1,
        h: heightOpt || (mobile ? 600 : 300),
        order: COUNTRY_ORDER,
        labels: COUNTRY_LABELS,
        yHead: 10,
        yTicks: [0, 50, 100],
        // ETH gets Urban/Rural labels at (2012, 85) / (2012, 13)
        inlineLabelKey: "ETH",
        inlineUrbanY: 85,
        inlineRuralY: 13,
        labelTop: -16,
        xTicks: [2000, 2023],
      };
    }
    // regions Bktvr1TG
    return {
      margin: { top: 40, right: 20, bottom: 30, left: 32 },
      gap: 44,
      cols: mobile ? 2 : 4,
      rowsN: mobile ? 4 : 2,
      h: heightOpt || (mobile ? 800 : 600),
      order: REGION_ORDER,
      labels: REGION_LABELS,
      yHead: 20,
      yTicks: [0, 50, 100],
      inlineLabelKey: "WLD",
      inlineUrbanY: 94,
      inlineRuralY: 73,
      labelTop: -16,
      labelTopMEA: -32,
      xTicks: [2000, 2023],
    };
  }

  function mount(container, options = {}) {
    const SVG = ensureSVG();
    const {
      rows = [],
      variant = "regions", // 'regions' | 'countries'
      labels: labelOpts = {},
      reuse = true,
      forceRemount = false,
      height: heightOpt = null,
      intro = true,
    } = options;

    const L = {
      urban: labelOpts.urban || "Urban areas",
      rural: labelOpts.rural || "Rural areas",
      y_axis_units: labelOpts.y_axis_units || "% of population",
    };

    if (!container) throw new Error("container required");

    if (reuse && !forceRemount && INSTANCES.has(container)) {
      return INSTANCES.get(container).api;
    }
    if (INSTANCES.has(container)) {
      try {
        INSTANCES.get(container).api.destroy();
      } catch (_) {}
      INSTANCES.delete(container);
    }

    const byIso = prepareByIso(rows);
    const w = Math.max(360, container.clientWidth || 900);
    const cfg = variantConfig(variant, w, heightOpt);
    const {
      margin: MARGIN,
      gap: GAP,
      cols,
      rowsN,
      h,
      order: ORDER,
      labels: PANEL_LABELS,
      yHead,
      yTicks,
      inlineLabelKey,
      inlineUrbanY,
      inlineRuralY,
      xTicks,
    } = cfg;

    container.innerHTML = "";
    const root = document.createElement("div");
    root.className = `atlas-urban-rural atlas-urban-rural--${variant} atlas-chart-root`;
    root.style.cssText = `position:relative;width:100%;height:${h}px;font-family:'Open Sans',system-ui,sans-serif;background:#fff`;
    container.appendChild(root);

    const style = document.createElement("style");
    style.textContent = `
      .atlas-urban-rural .gap { fill: url(#diagonalHatchDarkUR); opacity: 0.3; }
      .atlas-urban-rural .panel-label {
        position: absolute; text-align: center; font-size: 12px; font-weight: 700;
        color: #111; pointer-events: none; line-height: 1.2;
        text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff;
      }
      .atlas-urban-rural--countries .panel-label { font-size: 13px; }
      .atlas-urban-rural .line-urban, .atlas-urban-rural .line-rural {
        fill: none; stroke-width: 2;
      }
      .atlas-urban-rural.intro .line-urban,
      .atlas-urban-rural.intro .line-rural,
      .atlas-urban-rural.intro .gap,
      .atlas-urban-rural.intro circle.end,
      .atlas-urban-rural.intro text.end-val { opacity: 0; }
      .atlas-urban-rural.intro-done .line-urban,
      .atlas-urban-rural.intro-done .line-rural { opacity: 1; transition: opacity 900ms ease; }
      .atlas-urban-rural.intro-done .gap { opacity: 0.3; transition: opacity 900ms ease; }
      .atlas-urban-rural.intro-done circle.end,
      .atlas-urban-rural.intro-done text.end-val { opacity: 1; transition: opacity 600ms ease 200ms; }
    `;
    root.appendChild(style);

    const cellW =
      (w - MARGIN.left - MARGIN.right - (cols - 1) * GAP) / cols;
    const cellH =
      (h - MARGIN.top - MARGIN.bottom - (rowsN - 1) * GAP) / rowsN;

    const svg = SVG.el(root, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.cssText = "display:block;width:100%;height:100%";

    const defs = SVG.el(svg, "defs");
    // unique id so regions+countries can coexist on same page
    const patId = "diagonalHatchDarkUR";
    const pat = SVG.el(defs, "pattern", {
      id: patId,
      width: "100",
      height: "5",
      patternUnits: "userSpaceOnUse",
      patternContentUnits: "userSpaceOnUse",
      viewBox: "0 0 100 100",
      preserveAspectRatio: "none",
      patternTransform: "rotate(-45)",
    });
    SVG.el(pat, "line", {
      x1: 0,
      x2: 100,
      y1: 50,
      y2: 50,
      "stroke-width": 10,
      stroke: "#111111",
    });

    const gRoot = SVG.el(svg, "g", {
      transform: `translate(${MARGIN.left},${MARGIN.top})`,
    });

    const labelsLayer = document.createElement("div");
    labelsLayer.style.cssText =
      "position:absolute;inset:0;pointer-events:none";
    root.appendChild(labelsLayer);

    const xScale = (year) => {
      const t = (year - X_DOMAIN[0]) / (X_DOMAIN[1] - X_DOMAIN[0] || 1);
      return t * cellW;
    };
    const yScale = (v) => {
      const t = (v - Y_DOMAIN[0]) / (Y_DOMAIN[1] - Y_DOMAIN[0] || 1);
      return cellH + (yHead - cellH) * t;
    };

    ORDER.forEach((key, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const ox = col * (cellW + GAP);
      const oy = row * (cellH + GAP);
      const series = byIso.get(key);
      if (!series) return;

      const g = SVG.el(gRoot, "g", {
        class: "panel",
        "data-key": key,
        transform: `translate(${ox},${oy})`,
      });

      yTicks.forEach((tick) => {
        const y = yScale(tick);
        SVG.el(g, "line", {
          x1: 0,
          x2: cellW,
          y1: y,
          y2: y,
          stroke: "#e8ecf0",
          "stroke-width": 1,
        });
        if (col === 0) {
          SVG.el(g, "text", {
            x: -6,
            y: y + 3,
            "text-anchor": "end",
            fill: "#6a7781",
            "font-size": 10,
          }).textContent = String(tick);
        }
      });

      // x ticks on bottom row
      if (row === rowsN - 1) {
        xTicks.forEach((yr) => {
          SVG.el(g, "text", {
            x: xScale(yr),
            y: cellH + 14,
            "text-anchor": "middle",
            fill: "#6a7781",
            "font-size": 10,
            "font-weight": "600",
          }).textContent = String(yr);
        });
      }

      if (i === 0) {
        SVG.el(g, "text", {
          x: 0,
          y: 8,
          fill: "#6a7781",
          "font-size": 10,
        }).textContent = L.y_axis_units;
      }

      const urban = series.urban;
      const rural = series.rural;
      const byYear = new Map();
      urban.forEach((p) => byYear.set(p.year, { year: p.year, urban: p.value }));
      rural.forEach((p) => {
        const o = byYear.get(p.year) || { year: p.year };
        o.rural = p.value;
        byYear.set(p.year, o);
      });
      const joined = [...byYear.values()]
        .filter((p) => p.urban != null && p.rural != null)
        .sort((a, b) => a.year - b.year);

      if (joined.length > 1) {
        SVG.el(g, "path", {
          class: "gap",
          d: gapPath(joined, xScale, yScale),
          fill: `url(#${patId})`,
          opacity: "0.3",
          "stroke-width": 0,
        });
      }

      if (urban.length > 1) {
        SVG.el(g, "path", {
          class: "line-urban",
          d: curvePath(urban, xScale, yScale),
          fill: "none",
          stroke: URBAN,
          "stroke-width": 2,
        });
      }
      if (rural.length > 1) {
        SVG.el(g, "path", {
          class: "line-rural",
          d: curvePath(rural, xScale, yScale),
          fill: "none",
          stroke: RURAL,
          "stroke-width": 2,
        });
      }

      const endPts = [...urban, ...rural].filter((p) => p.year === 2023);
      endPts.forEach((p) => {
        const isU = p.area === "urban";
        const col = isU ? URBAN : RURAL;
        SVG.el(g, "circle", {
          class: "end",
          cx: xScale(p.year),
          cy: yScale(p.value),
          r: 4,
          fill: col,
          stroke: "#ffffff",
          "stroke-width": 1.5,
        });
        SVG.el(g, "text", {
          class: "end-val middle",
          x: xScale(p.year),
          y: yScale(p.value) + (isU ? -8 : 18),
          "text-anchor": "middle",
          fill: col,
          "font-size": 11,
          "font-weight": "700",
        }).textContent = String(Math.round(p.value));
      });

      if (key === inlineLabelKey) {
        SVG.el(g, "text", {
          class: "middle",
          x: xScale(2012),
          y: yScale(inlineUrbanY),
          "text-anchor": "middle",
          fill: URBAN_TEXT,
          "font-size": 11,
          "font-weight": "700",
        }).textContent = L.urban;
        SVG.el(g, "text", {
          class: "middle",
          x: xScale(2012),
          y: yScale(inlineRuralY),
          "text-anchor": "middle",
          fill: RURAL_TEXT,
          "font-size": 11,
          "font-weight": "700",
        }).textContent = L.rural;
      }

      const lab = document.createElement("div");
      lab.className = "panel-label";
      const topOff =
        key === "MEA" && cfg.labelTopMEA != null
          ? cfg.labelTopMEA
          : cfg.labelTop != null
            ? cfg.labelTop
            : -16;
      lab.style.cssText = [
        `left:${MARGIN.left + ox}px`,
        `top:${MARGIN.top + oy + topOff}px`,
        `width:${cellW}px`,
      ].join(";");
      lab.textContent = PANEL_LABELS[key] || key;
      labelsLayer.appendChild(lab);
    });

    if (intro) {
      root.classList.add("intro");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          root.classList.remove("intro");
          root.classList.add("intro-done");
        });
      });
    } else {
      root.classList.add("intro-done");
    }

    const api = {
      root,
      svg,
      updateScene() {},
      setScene() {},
      destroy() {
        INSTANCES.delete(container);
        container.innerHTML = "";
      },
      get sceneIndex() {
        return 0;
      },
    };
    INSTANCES.set(container, { api });
    return api;
  }

  global.AtlasDualLineUrbanRural = {
    mount,
    prepareByIso,
    version: "0.2.0",
    REGION_ORDER,
    COUNTRY_ORDER,
    URBAN,
    RURAL,
  };
  global.AtlasLibrary = global.AtlasLibrary || {};
  global.AtlasLibrary.DualLineUrbanRural = global.AtlasDualLineUrbanRural;
})(typeof window !== "undefined" ? window : globalThis);
