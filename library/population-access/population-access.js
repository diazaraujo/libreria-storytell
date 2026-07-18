/**
 * AtlasPopulationAccess v0.2
 * Pattern: AccessElectricityPopulation (BcrOvn12.js)
 *
 * Scenes (activeScene.index):
 *  0  World population area (yMax ~8.2B)
 *  1  + WLD without electricity, labels with/without
 *  2  Stacked regions (yMax ~1.5B)
 *  3  SSF focus on stack + right axis %
 *  4  Country stack top-8
 *  5  NGA / COD / ETH highlight + million labels
 *
 * Mount once · path opacity 2s (Atlas CSS) · no remount on scene.
 * Depends: window.AtlasSVG
 */
(function (global) {
  const COLORS = {
    WLD: "#081079", EAS: "#F3578E", ECS: "#AA0000", LCN: "#0C7C68",
    MEA: "#664AB6", NAC: "#34A7F2", SAS: "#4EC2C0", SSF: "#FF9800",
    POP: "#081079",
    COD: "#AA0000", NGA: "#34A7F2", ETH: "#f7b841",
  };
  const LABELS = {
    WLD: "World", EAS: "East Asia & Pacific", ECS: "Europe & Central Asia",
    LCN: "Latin America & Caribbean", MEA: "Middle East & N. Africa",
    NAC: "North America", SAS: "South Asia", SSF: "Sub-Saharan Africa",
    COD: "Congo, Dem. Rep.", NGA: "Nigeria", ETH: "Ethiopia",
  };
  const REGION_ORDER_PREF = ["EAS", "SAS", "SSF", "LCN", "MEA", "ECS", "NAC"];
  const FOCUS3 = ["NGA", "COD", "ETH"];
  const MARGIN = { top: 24, right: 56, bottom: 28, left: 52 };
  const TRANSITION_MS = 2000; // path.svelte-z7lx7f { transition: opacity 2s }
  const X_DOMAIN = [2000, 2023];
  const INSTANCES = new WeakMap();

  function ensureSVG() {
    if (!global.AtlasSVG) throw new Error("AtlasPopulationAccess needs AtlasSVG");
    return global.AtlasSVG;
  }

  /** curveNatural path through {x,y0,y1} or {x,y} */
  function naturalControls(coords) {
    const n = coords.length - 1;
    if (n < 1) return [[], []];
    const a = new Array(n), b = new Array(n), r = new Array(n);
    a[0] = 0; b[0] = 2; r[0] = coords[0] + 2 * coords[1];
    for (let t = 1; t < n - 1; ++t) {
      a[t] = 1; b[t] = 4; r[t] = 4 * coords[t] + 2 * coords[t + 1];
    }
    a[n - 1] = 2; b[n - 1] = 7; r[n - 1] = 8 * coords[n - 1] + coords[n];
    for (let t = 1; t < n; ++t) {
      const s = a[t] / b[t - 1];
      b[t] -= s; r[t] -= s * r[t - 1];
    }
    a[n - 1] = r[n - 1] / b[n - 1];
    for (let t = n - 2; t >= 0; --t) a[t] = (r[t] - a[t + 1]) / b[t];
    const c1 = a, c2 = new Array(n);
    c2[n - 1] = (coords[n] + c1[n - 1]) / 2;
    for (let t = 0; t < n - 1; ++t) c2[t] = 2 * coords[t + 1] - c1[t + 1];
    return [c1, c2];
  }

  function lineThrough(pts) {
    if (!pts.length) return "";
    if (pts.length === 1) return `M${pts[0][0]},${pts[0][1]}`;
    if (pts.length === 2) return `M${pts[0][0]},${pts[0][1]}L${pts[1][0]},${pts[1][1]}`;
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    const [cx1, cx2] = naturalControls(xs);
    const [cy1, cy2] = naturalControls(ys);
    let d = `M${xs[0]},${ys[0]}`;
    for (let i = 0; i < xs.length - 1; i++) {
      d += `C${cx1[i]},${cy1[i]},${cx2[i]},${cy2[i]},${xs[i + 1]},${ys[i + 1]}`;
    }
    return d;
  }

  function areaThrough(topPts, botPts) {
    // top left→right, bottom right→left
    if (topPts.length < 2) return "";
    const top = lineThrough(topPts);
    const bot = lineThrough(botPts.slice().reverse()).replace(/^M/, "L");
    return `${top}${bot}Z`;
  }

  function byIsoYear(rows, valueKey, isoKey = "iso3c") {
    const map = new Map();
    rows.forEach((r) => {
      const iso = r[isoKey];
      const year = +r.year;
      const v = +r[valueKey];
      if (!iso || !Number.isFinite(year) || !Number.isFinite(v)) return;
      if (!map.has(iso)) map.set(iso, new Map());
      map.get(iso).set(year, v);
    });
    return map;
  }

  function yearsBetween(a, b) {
    const out = [];
    for (let y = a; y <= b; y++) out.push(y);
    return out;
  }

  /**
   * d3-stack-like: order by total descending (then reverse like Atlas rt),
   * offset none. Returns array of series: { key, color, points: [{year,y0,y1}] }
   */
  function stackSeries(keys, dataByIso, years, colors) {
    // total per key for order
    const totals = keys.map((k) => {
      let s = 0;
      years.forEach((y) => { s += dataByIso.get(k)?.get(y) || 0; });
      return { k, s };
    });
    totals.sort((a, b) => b.s - a.s);
    // Atlas: order(rt) where rt = reverse of size-sort → smaller at bottom after reverse of descending = ascending totals at bottom?
    // at() sums series, sort ascending by sum, reverse → largest first in stack builder
    // d3 stack order reverse means first key is top. With largest first + offset none:
    // first series (largest) is drawn at bottom if stack builds y0=0 for first...
    // d3 stack: first series starts at 0. order reverse of ascending sum = largest first = largest at bottom.
    const ordered = totals.map((t) => t.k);

    return ordered.map((key) => {
      const points = years.map((year) => {
        let y0 = 0;
        for (const k of ordered) {
          if (k === key) break;
          y0 += dataByIso.get(k)?.get(year) || 0;
        }
        const val = dataByIso.get(key)?.get(year) || 0;
        return { year, y0, y1: y0 + val, v: val };
      });
      return { key, color: colors[key] || "#888", points };
    });
  }

  function yDomainForScene(sceneIndex) {
    // raw people counts (not millions)
    if (sceneIndex <= 1) return [0, 8.2e9];
    if (sceneIndex === 2) return [0, 1.5e9];
    return [0, 666e6]; // ~WLD without 2023
  }

  function leftTicks(sceneIndex) {
    // in people
    if (sceneIndex === 0) return [0, 2e9, 4e9, 6e9, 8e9];
    if (sceneIndex === 1 || sceneIndex === 2) return [0, 666e6, 1317e6, 2e9, 4e9, 6e9, 8e9];
    if (sceneIndex === 3) return [0, 581e6, 666e6];
    if (sceneIndex === 4) return [0, 333e6, 581e6, 666e6];
    return [0, 222e6, 500e6, 581e6, 666e6];
  }

  function rightTicks(sceneIndex) {
    if (sceneIndex === 3) return [{ v: 666e6, label: "100%" }, { v: 581e6, label: "87%" }];
    if (sceneIndex === 4) {
      return [
        { v: 666e6, label: "100%" },
        { v: 581e6, label: "87%" },
        { v: 333e6, label: "50%" },
      ];
    }
    if (sceneIndex === 5) {
      return [
        { v: 666e6, label: "100%" },
        { v: 581e6, label: "87%" },
        { v: 222e6, label: "33%" },
      ];
    }
    return [];
  }

  function fmtM(v) {
    return Math.round(v / 1e6).toLocaleString("en-US");
  }

  function mount(container, options = {}) {
    const SVG = ensureSVG();
    const {
      aggregates = [],
      worldPop = [],
      countries = [],
      sceneIndex = 0,
      transitionMs = TRANSITION_MS,
      reuse = true,
      forceRemount = false,
      labels = {},
    } = options;

    const L = {
      without_access: labels.without_access || "Population without electricity",
      with_access: labels.with_access || "Population with electricity",
      population: labels.population || "Population",
      y_axis_units: labels.y_axis_units || "millions of people",
      y_axis_title_right: labels.y_axis_title_right || "Global share in 2023",
      million: labels.million || "million",
    };

    if (!container) throw new Error("container required");

    if (reuse && !forceRemount && INSTANCES.has(container)) {
      const inst = INSTANCES.get(container);
      inst.setScene(sceneIndex, { animate: options.animate !== false });
      return inst.api;
    }
    if (INSTANCES.has(container)) {
      try { INSTANCES.get(container).api.destroy(); } catch (_) {}
      INSTANCES.delete(container);
    }

    container.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-pop atlas-chart-root";
    const w = Math.max(360, container.clientWidth || 900);
    const h = Math.max(320, container.clientHeight || 480);
    root.style.cssText = `position:relative;width:100%;height:${h}px;font-family:'Open Sans',system-ui,sans-serif;background:#fff`;
    container.appendChild(root);

    const style = document.createElement("style");
    style.textContent = `
      .atlas-pop .layer path {
        transition: opacity ${transitionMs}ms;
      }
      .atlas-pop .layer text, .atlas-pop .layer-label {
        transition: opacity ${Math.min(1000, transitionMs)}ms;
      }
      .atlas-pop .y-tick, .atlas-pop .axis-title {
        transition: opacity 800ms;
      }
      .atlas-pop.no-anim .layer path,
      .atlas-pop.no-anim .layer text,
      .atlas-pop.no-anim .y-tick {
        transition: none !important;
      }
    `;
    root.appendChild(style);

    const svg = SVG.el(root, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.cssText = "display:block;width:100%;height:100%";

    const iw = w - MARGIN.left - MARGIN.right;
    const ih = h - MARGIN.top - MARGIN.bottom;
    const gRoot = SVG.el(svg, "g", {
      transform: `translate(${MARGIN.left},${MARGIN.top})`,
    });

    const years = yearsBetween(X_DOMAIN[0], X_DOMAIN[1]);
    const xScale = SVG.scaleLinear(X_DOMAIN, [0, iw]);

    // data maps (raw people counts)
    const popMap = new Map(worldPop.map((r) => [+r.year, +r.pop]));
    const aggByIso = byIsoYear(aggregates, "pop_without_electricity");
    const ctyByIso = byIsoYear(countries, "pop_without_electricity");

    const regionKeys = REGION_ORDER_PREF.filter((k) => aggByIso.has(k));
    // add any extra regions present
    for (const k of aggByIso.keys()) {
      if (k !== "WLD" && !regionKeys.includes(k)) regionKeys.push(k);
    }

    const regionStack = stackSeries(regionKeys, aggByIso, years, COLORS);

    // country keys ordered by 2023 without access
    const ctyKeysAll = [...ctyByIso.keys()].sort((a, b) => {
      const va = ctyByIso.get(a)?.get(2023) || 0;
      const vb = ctyByIso.get(b)?.get(2023) || 0;
      return vb - va;
    });
    const countryStack = stackSeries(ctyKeysAll, ctyByIso, years, COLORS);
    const top8 = ctyKeysAll.slice(0, 8);

    // mutable y scale domain (tweened conceptually via instant set + CSS)
    let yDomain = yDomainForScene(sceneIndex);
    const yScale = (v) => {
      const [d0, d1] = yDomain;
      const t = d1 === d0 ? 0 : (v - d0) / (d1 - d0);
      return ih * (1 - t);
    };

    // --- static x ticks ---
    [2000, 2023].forEach((yr) => {
      SVG.el(gRoot, "text", {
        x: xScale(yr), y: ih + 18, "text-anchor": "middle",
        fill: "#6a7781", "font-size": 12, "font-weight": "600",
      }).textContent = String(yr);
    });

    // y ticks / right ticks (rebuilt each scene for labels, but we keep groups)
    const yTicksG = SVG.el(gRoot, "g", { class: "y-ticks" });
    const yRightG = SVG.el(gRoot, "g", { class: "y-right" });
    const axisTitleLeft = SVG.el(gRoot, "text", {
      class: "axis-title",
      x: -8, y: -8, "text-anchor": "start",
      fill: "#6a7781", "font-size": 11,
    });

    function redrawAxes(idx) {
      yDomain = yDomainForScene(idx);
      yTicksG.innerHTML = "";
      yRightG.innerHTML = "";
      const ticks = leftTicks(idx);
      ticks.forEach((v) => {
        if (v > yDomain[1] * 1.01) return;
        const y = yScale(v);
        SVG.el(yTicksG, "line", {
          x1: 0, x2: iw, y1: y, y2: y,
          stroke: "#e8ecf0",
          "stroke-dasharray": v === 0 ? "none" : "2,3",
          class: "y-tick",
        });
        SVG.el(yTicksG, "text", {
          x: -8, y: y + 4, "text-anchor": "end",
          fill: "#6a7781", "font-size": 11, class: "y-tick",
        }).textContent = fmtM(v);
      });
      const rt = rightTicks(idx);
      rt.forEach(({ v, label }) => {
        const y = yScale(v);
        SVG.el(yRightG, "text", {
          x: iw + 8, y: y + 4, "text-anchor": "start",
          fill: "#6a7781", "font-size": 11, class: "y-tick",
        }).textContent = label;
      });
      // dashed reference at WLD 2023 for scenes >=3
      if (idx >= 3) {
        const y = yScale(666e6);
        SVG.el(yRightG, "line", {
          x1: 0, x2: iw, y1: y, y2: y,
          stroke: "#ced4de", "stroke-dasharray": "4,4",
        });
      }
      axisTitleLeft.textContent =
        idx < 2 ? `${L.population} (${L.y_axis_units})` : `${L.without_access}`;
      // right title
      const old = gRoot.querySelector(".axis-title-right");
      if (old) old.remove();
      if (idx > 2) {
        const rtTitle = SVG.el(gRoot, "text", {
          class: "axis-title axis-title-right",
          x: iw + 8, y: -8, "text-anchor": "start",
          fill: "#6a7781", "font-size": 11,
        });
        rtTitle.textContent = L.y_axis_title_right;
      }
    }

    // --- layers ---
    function setOp(el, op) {
      if (!el) return;
      el.setAttribute("opacity", String(op));
    }

    // Layer A: world population area+line (scenes 0–1)
    const layerPop = SVG.el(gRoot, "g", { class: "layer layer-pop", opacity: "0" });
    {
      const top = years.map((y) => [xScale(y), yScale(popMap.get(y) || 0)]);
      // need yDomain for scene0 when building - rebuild paths in setScene
      layerPop.dataset.kind = "pop";
    }

    // Layer B: WLD without area+line
    const layerWld = SVG.el(gRoot, "g", { class: "layer layer-wld", opacity: "0" });

    // Layer C: region stack
    const layerRegions = SVG.el(gRoot, "g", { class: "layer layer-regions", opacity: "0" });

    // Layer D: country stack
    const layerCountries = SVG.el(gRoot, "g", { class: "layer layer-countries", opacity: "0" });

    // labels layer
    const layerLabels = SVG.el(gRoot, "g", { class: "layer layer-labels", opacity: "0" });

    function rebuildGeometry() {
      // clear dynamic paths
      [layerPop, layerWld, layerRegions, layerCountries, layerLabels].forEach((g) => {
        while (g.firstChild) g.removeChild(g.firstChild);
      });

      // pop
      {
        const top = years.map((y) => [xScale(y), yScale(popMap.get(y) || 0)]);
        const bot = years.map((y) => [xScale(y), yScale(0)]);
        SVG.el(layerPop, "path", {
          d: areaThrough(top, bot),
          fill: COLORS.WLD, opacity: 0.45, "stroke-width": 0,
        });
        SVG.el(layerPop, "path", {
          d: lineThrough(top),
          fill: "none", stroke: COLORS.WLD, "stroke-width": 2,
        });
      }

      // wld without
      {
        const series = years.map((y) => ({
          year: y,
          v: aggByIso.get("WLD")?.get(y) || 0,
        }));
        const top = series.map((p) => [xScale(p.year), yScale(p.v)]);
        const bot = series.map((p) => [xScale(p.year), yScale(0)]);
        SVG.el(layerWld, "path", {
          d: areaThrough(top, bot),
          fill: COLORS.WLD, opacity: 0.5, "stroke-width": 0, class: "wld-area",
        });
        SVG.el(layerWld, "path", {
          d: lineThrough(top),
          fill: "none", stroke: COLORS.WLD, "stroke-width": 2,
        });
      }

      // region stack
      regionStack.forEach((s) => {
        const top = s.points.map((p) => [xScale(p.year), yScale(p.y1)]);
        const bot = s.points.map((p) => [xScale(p.year), yScale(p.y0)]);
        const path = SVG.el(layerRegions, "path", {
          d: areaThrough(top, bot),
          fill: s.color,
          stroke: "#fff",
          "stroke-width": 1.2,
          "data-key": s.key,
          opacity: "0.85",
        });
        path.dataset.key = s.key;
      });

      // country stack
      countryStack.forEach((s, i) => {
        const top = s.points.map((p) => [xScale(p.year), yScale(p.y1)]);
        const bot = s.points.map((p) => [xScale(p.year), yScale(p.y0)]);
        const path = SVG.el(layerCountries, "path", {
          d: areaThrough(top, bot),
          fill: s.color,
          stroke: "#fff",
          "stroke-width": 0.8,
          "data-key": s.key,
          "data-rank": String(i),
          opacity: "0.8",
        });
        path.dataset.key = s.key;
        path.dataset.rank = String(i);
      });
    }

    function placeLabels(idx) {
      while (layerLabels.firstChild) layerLabels.removeChild(layerLabels.firstChild);
      if (idx === 1) {
        // with / without labels
        const labs = [
          { x: xScale(2012), y: yScale(5e9), text: L.with_access },
          { x: xScale(2012), y: yScale(4e8), text: L.without_access },
        ];
        labs.forEach((L0) => {
          SVG.el(layerLabels, "text", {
            x: L0.x, y: L0.y, "text-anchor": "middle",
            fill: "#100e2b", "font-size": 12, "font-weight": "700",
            class: "layer-label white stronger",
            stroke: "#fff", "stroke-width": 3, "paint-order": "stroke",
          }).textContent = L0.text;
        });
      }
      if (idx === 2 || idx === 3) {
        // region labels SSF SAS EAS approx positions from Atlas
        const labs = [
          { key: "SSF", year: 2013, y: 3e8 },
          { key: "SAS", year: 2007, y: 8e8 },
          { key: "EAS", year: 2003, y: 1.07e9 },
        ];
        labs.forEach((L0) => {
          if (idx === 3 && L0.key !== "SSF") return;
          SVG.el(layerLabels, "text", {
            x: xScale(L0.year), y: yScale(L0.y), "text-anchor": "middle",
            fill: COLORS[L0.key], "font-size": 12, "font-weight": "700",
            stroke: "#fff", "stroke-width": 3, "paint-order": "stroke",
          }).textContent = LABELS[L0.key] || L0.key;
        });
      }
      if (idx === 4) {
        top8.forEach((key, i) => {
          const series = countryStack.find((s) => s.key === key);
          if (!series) return;
          // mid-stack at year 2007+i*2
          const yr = Math.min(2021, 2007 + i * 2);
          const pt = series.points.find((p) => p.year === yr) || series.points[series.points.length >> 1];
          const y = yScale((pt.y0 + pt.y1) / 2) + 4;
          SVG.el(layerLabels, "text", {
            x: xScale(yr), y, "text-anchor": "middle",
            fill: "#100e2b", "font-size": 11, "font-weight": "700",
            stroke: "#fff", "stroke-width": 3, "paint-order": "stroke",
          }).textContent = LABELS[key] || key;
        });
      }
      if (idx === 5) {
        FOCUS3.forEach((key, c) => {
          const series = countryStack.find((s) => s.key === key);
          if (!series) return;
          const pt = series.points.find((p) => p.year === 2023) || series.points.at(-1);
          const y = yScale((pt.y0 + pt.y1) / 2) + 6;
          const val = ctyByIso.get(key)?.get(2023) || pt.v;
          SVG.el(layerLabels, "text", {
            x: xScale(2023) - 10, y, "text-anchor": "end",
            fill: COLORS[key] || "#333", "font-size": 12, "font-weight": "700",
            "fill-opacity": 0.9,
            stroke: "#fff", "stroke-width": 3, "paint-order": "stroke",
          }).textContent = `${LABELS[key] || key}  ${fmtM(val)} ${L.million}`;
        });
      }
    }

    function setScene(idx, { animate = true } = {}) {
      if (!animate) root.classList.add("no-anim");

      redrawAxes(idx);
      rebuildGeometry();
      placeLabels(idx);

      // opacities per Atlas G() conditions
      // layerPop: index < 2
      setOp(layerPop, idx < 2 ? 1 : 0);
      // layerWld: index > 0 && index < 3; at index 2 area opacity 0
      if (idx === 1) setOp(layerWld, 1);
      else if (idx === 2) {
        setOp(layerWld, 0.35);
        const area = layerWld.querySelector(".wld-area");
        if (area) area.setAttribute("opacity", "0");
      } else setOp(layerWld, 0);

      // regions: index > 1 && index < 4
      if (idx === 2) {
        setOp(layerRegions, 1);
        layerRegions.querySelectorAll("path").forEach((p) => p.setAttribute("opacity", "0.85"));
      } else if (idx === 3) {
        setOp(layerRegions, 1);
        layerRegions.querySelectorAll("path").forEach((p) => {
          const k = p.dataset.key;
          p.setAttribute("opacity", k === "SSF" ? "0.9" : "0.06");
        });
      } else setOp(layerRegions, 0);

      // countries: index > 3
      if (idx === 4) {
        setOp(layerCountries, 1);
        layerCountries.querySelectorAll("path").forEach((p) => {
          const rank = +p.dataset.rank;
          p.setAttribute("opacity", rank < 8 ? "0.85" : "0.25");
        });
      } else if (idx === 5) {
        setOp(layerCountries, 1);
        layerCountries.querySelectorAll("path").forEach((p) => {
          const k = p.dataset.key;
          p.setAttribute("opacity", FOCUS3.includes(k) ? "0.9" : "0.28");
        });
      } else setOp(layerCountries, 0);

      // labels
      const showLab =
        idx === 1 || idx === 2 || idx === 3 || idx === 4 || idx === 5;
      setOp(layerLabels, showLab ? 1 : 0);

      if (!animate) {
        void root.offsetHeight;
        requestAnimationFrame(() => root.classList.remove("no-anim"));
      }
      current = idx;
    }

    let current = sceneIndex;
    setScene(sceneIndex, { animate: false });

    const api = {
      root,
      svg,
      updateScene(i, opts) { setScene(i, opts); },
      setScene,
      destroy() {
        INSTANCES.delete(container);
        container.innerHTML = "";
      },
      get sceneIndex() { return current; },
    };
    INSTANCES.set(container, { api, setScene });
    return api;
  }

  global.AtlasPopulationAccess = {
    mount,
    version: "0.2.0",
    COLORS,
    FOCUS3,
  };
  global.AtlasLibrary = global.AtlasLibrary || {};
  global.AtlasLibrary.PopulationAccess = global.AtlasPopulationAccess;
})(typeof window !== "undefined" ? window : globalThis);
