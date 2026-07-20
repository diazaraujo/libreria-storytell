/**
 * AtlasRegionsSmallMultiples v0.5.1
 * Pattern: AccessElectricityRegions (DNnJZ53u.js)
 *
 * KEY: mount once, updateScene() only — never remount on scene change.
 *
 * Motion pixel-matched to Atlas:
 *  - region/label: `transition: opacity 1s` (exact CSS from D8sNcrsm)
 *  - particles: transform+fill+opacity 1s (Pixi-equivalent via CSS)
 *  - denser country-dot cloud near series end (2014–2023)
 *  - dimmed particle opacity = panel dim (0.1)
 *  - yDomain [0,100] (ticks flush with Atlas)
 *
 * Depends: window.AtlasSVG
 */
(function (global) {
  const DEFAULT_COLORS = {
    WLD: "#081079", EAS: "#F3578E", ECS: "#AA0000", LCN: "#0C7C68",
    MEA: "#664AB6", NAC: "#34A7F2", SAS: "#4EC2C0", SSF: "#FF9800",
  };
  const DEFAULT_TEXT = {
    WLD: "#081079", EAS: "#BB3B64", ECS: "#AA0000", LCN: "#0C7C68",
    MEA: "#664AB6", NAC: "#106CA1", SAS: "#208383", SSF: "#B65F0C",
  };
  const DEFAULT_LABELS = {
    WLD: "World",
    EAS: "East Asia & Pacific",
    ECS: "Europe & Central Asia",
    LCN: "Latin America & Caribbean",
    MEA: "Middle East, North Africa, Afghanistan & Pakistan",
    NAC: "North America",
    SAS: "South Asia",
    SSF: "Sub-Saharan Africa",
  };
  const ELECTRICITY_HIGHLIGHT = {
    WLD: [0, 1], MEA: [1], LCN: [1], EAS: [1], ECS: [1], NAC: [1],
    SAS: [2, 3], SSF: [2, 4],
  };
  const ELECTRICITY_ORDER = ["WLD", "MEA", "LCN", "EAS", "ECS", "NAC", "SAS", "SSF"];

  const LAYOUT = {
    margin: { top: 16, right: 20, bottom: 20, left: 32 },
    gapDesktop: { h: 40, v: 60 },
    gapMobile: { h: 34, v: 40 },
    heightDesktop: 500,
    heightMobile: 800,
    mobileBreak: 640,
    marker: 6,
    labelPad: 7,
    labelTopOffset: 16,
    valueYOffset: 6,
    areaOpacity: 0.3,
    dimOpacity: 0.1,
    strokeWidth: 2,
    particleSize: 5, // Atlas scaleX = g-1
    transitionMs: 1000,
  };

  // WeakMap so re-mount on same container reuses logic cleanly
  const INSTANCES = new WeakMap();

  function ensureSVG() {
    if (!global.AtlasSVG) throw new Error("AtlasRegionsSmallMultiples needs AtlasSVG");
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

  function curvePath(pts, xScale, yScale) {
    if (!pts.length) return "";
    if (pts.length === 1) return `M${xScale(pts[0].year)},${yScale(pts[0].value)}`;
    const xs = pts.map((d) => xScale(d.year));
    const ys = pts.map((d) => yScale(d.value));
    if (pts.length === 2) return `M${xs[0]},${ys[0]}L${xs[1]},${ys[1]}`;
    const [cx1, cx2] = naturalControls(xs);
    const [cy1, cy2] = naturalControls(ys);
    let d = `M${xs[0]},${ys[0]}`;
    for (let i = 0; i < xs.length - 1; i++) {
      d += `C${cx1[i]},${cy1[i]},${cx2[i]},${cy2[i]},${xs[i + 1]},${ys[i + 1]}`;
    }
    return d;
  }

  function areaPath(pts, xScale, yScale) {
    if (pts.length < 2) return "";
    const line = curvePath(pts, xScale, yScale);
    const last = pts[pts.length - 1];
    const first = pts[0];
    return `${line}L${xScale(last.year)},${yScale(0)}L${xScale(first.year)},${yScale(0)}Z`;
  }

  function seriesFromRows(rows, opts = {}) {
    const {
      keyField = "iso3c",
      yearField = "year",
      valueField = "access_electricity",
      order = ELECTRICITY_ORDER,
      colors = DEFAULT_COLORS,
      textColors = DEFAULT_TEXT,
      labels = DEFAULT_LABELS,
      highlight = ELECTRICITY_HIGHLIGHT,
    } = opts;

    const by = new Map();
    rows.forEach((r) => {
      const key = r[keyField];
      const year = +r[yearField];
      const value = +r[valueField];
      if (!key || !Number.isFinite(year) || !Number.isFinite(value)) return;
      if (!by.has(key)) by.set(key, []);
      by.get(key).push({ year, value });
    });
    by.forEach((pts) => pts.sort((a, b) => a.year - b.year));

    const keys = order.filter((k) => by.has(k));
    for (const k of by.keys()) if (!keys.includes(k)) keys.push(k);

    return keys.map((key) => ({
      key,
      label: labels[key] || key,
      color: colors[key] || "#57626a",
      textColor: textColors[key] || colors[key] || "#111",
      points: by.get(key) || [],
      highlight: highlight[key] || [],
    }));
  }

  function isHighlighted(s, sceneIndex, forceHighlight, anyHighlight) {
    let hi = Array.isArray(s.highlight) && s.highlight.includes(sceneIndex);
    if (typeof forceHighlight === "function" && forceHighlight(s.key, sceneIndex)) hi = true;
    if (!anyHighlight) hi = true;
    return hi;
  }

  /**
   * Synthetic particles — visual match to Atlas country dots.
   * Live Atlas clusters dots near the RIGHT end of each curve (≈2014–2023).
   * Each particle carries worldValue (WLD @ year) for scene-0 layout.
   */
  function buildParticles(series, xDomain) {
    const wld = series.find((s) => s.key === "WLD");
    const wldByYear = new Map((wld?.points || []).map((p) => [p.year, p.value]));
    const particles = [];
    // How many synthetic country-dots per region×year (denser late years = Atlas look)
    function copiesForYear(year) {
      if (year >= 2020) return 4;
      if (year >= 2017) return 3;
      if (year >= 2014) return 2;
      return 0;
    }
    series.forEach((s) => {
      if (s.key === "WLD") return;
      const pts = (s.points || []).filter(
        (p) => p.year >= xDomain[0] && p.year <= xDomain[1]
      );
      pts.forEach((p, i) => {
        const n = copiesForYear(p.year);
        if (!n) return;
        const worldValue = wldByYear.has(p.year)
          ? wldByYear.get(p.year)
          : p.value;
        for (let k = 0; k < n; k++) {
          // jitter so many countries at similar access look like a cloud
          const jy = (((i * 17 + k * 9) % 11) - 5) * 0.12;
          const yearX = Math.min(
            xDomain[1],
            Math.max(2014, p.year + jy)
          );
          const yJitter = (((i * 13 + k * 7) % 17) - 8) * 0.28;
          const xJitter = (((i * 5 + k * 3) % 9) - 4) * 0.08;
          particles.push({
            id: `${s.key}-${p.year}-${i}-${k}`,
            region: s.key,
            year: yearX + xJitter,
            regionValue: Math.max(0, Math.min(100, p.value + yJitter)),
            worldValue: Math.max(0, Math.min(100, worldValue + yJitter * 0.45)),
            color: s.color,
            stagger: ((i + k) % 10) * 18,
          });
        }
      });
    });
    return particles;
  }

  /**
   * Particle target layout — port of DNnJZ53u ve() setup.
   * Returns { x, y, color } in root SVG coords.
   */
  function particleTarget(p, sceneIndex, panelByKey, xDomain, yDomain, cellW, cellH) {
    const wld = panelByKey.WLD;
    const own = panelByKey[p.region] || wld;
    if (!wld || !own) return { x: 0, y: 0, color: p.color };

    const xLocal = (year) => {
      const t = (year - xDomain[0]) / (xDomain[1] - xDomain[0] || 1);
      return t * cellW;
    };
    const yLocal = (val) => {
      const t = (val - yDomain[0]) / (yDomain[1] - yDomain[0] || 1);
      return cellH * (1 - t);
    };

    let panel = sceneIndex === 0 ? wld : own;
    let color = sceneIndex === 0 ? DEFAULT_COLORS.WLD : p.color;
    let yVal = p.regionValue;

    if (sceneIndex === 0) {
      yVal = p.worldValue;
      panel = wld;
      color = DEFAULT_COLORS.WLD;
    } else if (sceneIndex === 1 && (p.region === "SAS" || p.region === "SSF")) {
      // stay on World with worldValue
      panel = wld;
      yVal = p.worldValue;
      color = DEFAULT_COLORS.WLD;
    } else {
      // own region with regionValue
      panel = own;
      yVal = p.regionValue;
      color = p.color;
    }

    return {
      x: panel.ox + xLocal(p.year),
      y: panel.oy + yLocal(yVal),
      color,
    };
  }

  function mount(container, options = {}) {
    const SVG = ensureSVG();
    const {
      series = [],
      sceneIndex = 0,
      xDomain = [2000, 2023],
      yDomain = [0, 100],
      yTicks = [0, 50, 100],
      xTickYears = null,
      marker = LAYOUT.marker,
      heightDesktop = LAYOUT.heightDesktop,
      heightMobile = LAYOUT.heightMobile,
      forceHighlight = null,
      transitionMs = LAYOUT.transitionMs,
      areaOpacity = LAYOUT.areaOpacity,
      dimOpacity = LAYOUT.dimOpacity,
      fontFamily = "'Open Sans', 'Helvetica Neue', system-ui, sans-serif",
      showValuesWhenDimmed = true,
      yAxisUnits = "",
      particles: particlesOpt = true,
      animateIntro = true,
      // if true and instance exists on container, only update scene
      reuse = true,
    } = options;

    if (!container) throw new Error("container required");

    // ── Reuse existing instance: only update scene (preserves transitions) ──
    if (reuse && INSTANCES.has(container)) {
      const inst = INSTANCES.get(container);
      // series identity / size change → full remount
      const sameSeries =
        inst.seriesRef === series ||
        (inst.seriesKeys === series.map((s) => s.key).join(",") &&
          Math.abs(inst.width - (container.clientWidth || inst.width)) < 2);
      if (sameSeries && !options.forceRemount) {
        inst.options = { ...inst.options, ...options, series: inst.series };
        inst.setScene(sceneIndex, { animate: options.animate !== false });
        return inst.api;
      }
      // size/series changed → destroy and rebuild
      INSTANCES.delete(container);
    }

    container.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-rsm atlas-chart-root";

    const w = Math.max(320, container.clientWidth || 900);
    const mobile = w < LAYOUT.mobileBreak;
    const h = mobile ? heightMobile : heightDesktop;
    const margin = LAYOUT.margin;
    const gap = mobile ? LAYOUT.gapMobile : LAYOUT.gapDesktop;
    const cols = mobile ? 2 : 4;
    const rowsN = mobile ? 4 : 2;
    const cellW = (w - margin.left - margin.right - (cols - 1) * gap.h) / cols;
    const cellH = (h - margin.top - margin.bottom - (rowsN - 1) * gap.v) / rowsN;

    root.style.cssText = [
      "position:relative",
      "width:100%",
      `height:${h}px`,
      `font-family:${fontFamily}`,
      "background:#fff",
      "overflow:visible",
    ].join(";");
    container.appendChild(root);

    // Exact Atlas timing: AccessElectricityRegions.D8sNcrsm → transition: opacity 1s
    // (no explicit easing = browser default `ease`)
    const style = document.createElement("style");
    style.textContent = `
      .atlas-rsm .region {
        transition: opacity ${transitionMs}ms;
      }
      .atlas-rsm .region-label {
        transition: opacity ${transitionMs}ms;
        pointer-events: none;
        text-align: center;
        font-size: 12px;
        font-weight: 600;
        line-height: 1.15;
        white-space: normal;
        overflow: hidden;
        text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff;
        position: absolute;
      }
      .atlas-rsm .value-label {
        transition: opacity ${transitionMs}ms;
      }
      /* Pixi particle flight equivalent — same 1s window as panel opacity */
      .atlas-rsm .particle {
        transition:
          transform ${transitionMs}ms ease,
          fill ${transitionMs}ms,
          opacity ${transitionMs}ms;
        will-change: transform, opacity;
      }
      .atlas-rsm .area {
        transition: opacity ${transitionMs}ms;
      }
      .atlas-rsm .line.intro {
        stroke-dasharray: var(--len);
        stroke-dashoffset: var(--len);
        animation: atlas-rsm-draw ${transitionMs + 200}ms ease forwards;
      }
      .atlas-rsm .area.intro {
        opacity: 0;
        animation: atlas-rsm-fade-in ${transitionMs}ms ease 200ms forwards;
      }
      @keyframes atlas-rsm-draw {
        to { stroke-dashoffset: 0; }
      }
      @keyframes atlas-rsm-fade-in {
        to { opacity: ${areaOpacity}; }
      }
      .atlas-rsm.no-anim .region,
      .atlas-rsm.no-anim .region-label,
      .atlas-rsm.no-anim .particle,
      .atlas-rsm.no-anim .value-label {
        transition: none !important;
      }
    `;
    root.appendChild(style);

    const svg = SVG.el(root, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.setAttribute("width", String(w));
    svg.setAttribute("height", String(h));
    svg.style.cssText = "display:block;width:100%;height:100%;overflow:visible";

    const labelsLayer = document.createElement("div");
    labelsLayer.className = "atlas-rsm-labels";
    labelsLayer.style.cssText = `position:absolute;left:0;top:0;width:${w}px;height:${h}px;pointer-events:none`;
    root.appendChild(labelsLayer);

    const xTicks = xTickYears || [xDomain[0], xDomain[1]];
    const anyHighlight = series.some((x) => (x.highlight || []).length);
    // Atlas marker: g=6 → square g+2 with white stroke (DNnJZ53u)
    const mSize = marker + 2;
    const panelByKey = {};
    const regionNodes = []; // { key, g, label, valueLabels[] }

    series.forEach((s, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const ox = margin.left + col * (cellW + gap.h);
      const oy = margin.top + row * (cellH + gap.v);
      const pts = (s.points || []).filter(
        (p) => Number.isFinite(p.year) && Number.isFinite(p.value)
      );
      if (!pts.length) return;

      const xScale = SVG.scaleLinear(xDomain, [0, cellW]);
      const yScale = SVG.scaleLinear(yDomain, [cellH, 0]);
      const color = s.color || "#57626a";
      const textColor = s.textColor || color;

      panelByKey[s.key] = { ox, oy, color, textColor, pts, xScale, yScale };

      const g = SVG.el(svg, "g", {
        class: "region",
        transform: `translate(${ox},${oy})`,
        opacity: "1",
        "data-key": s.key,
      });

      yTicks.forEach((t) => {
        const y = yScale(t);
        SVG.el(g, "line", {
          x1: 0, x2: cellW, y1: y, y2: y,
          stroke: "#ced4de",
          "stroke-width": 1,
          "stroke-dasharray": t === 0 ? "none" : "2,3",
        });
        if (col === 0) {
          SVG.el(g, "text", {
            x: -8, y: y + 3.5, "text-anchor": "end",
            fill: "#6a7781", "font-size": 12,
          }).textContent = String(t);
        }
      });

      if (i === 0 && yAxisUnits) {
        SVG.el(g, "text", {
          x: -8, y: -4, "text-anchor": "end",
          fill: "#6a7781", "font-size": 10,
        }).textContent = yAxisUnits;
      }

      xTicks.forEach((yr) => {
        SVG.el(g, "text", {
          x: xScale(yr), y: cellH + 14, "text-anchor": "middle",
          fill: "#6a7781", "font-size": 12, "font-weight": "600",
        }).textContent = String(yr);
      });

      let areaEl = null;
      let lineEl = null;
      if (pts.length > 1) {
        areaEl = SVG.el(g, "path", {
          d: areaPath(pts, xScale, yScale),
          fill: color,
          opacity: String(areaOpacity),
          "stroke-width": 0,
          class: "area" + (animateIntro ? " intro" : ""),
        });
        lineEl = SVG.el(g, "path", {
          d: curvePath(pts, xScale, yScale),
          fill: "none",
          stroke: color,
          "stroke-width": LAYOUT.strokeWidth,
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          class: "line" + (animateIntro ? " intro" : ""),
        });
        if (animateIntro && lineEl.getTotalLength) {
          try {
            const len = lineEl.getTotalLength();
            lineEl.style.setProperty("--len", `${len}`);
          } catch (_) { /* ignore */ }
        }
      }

      const p0 = pts.find((p) => p.year === xDomain[0]) || pts[0];
      const p1 = pts.find((p) => p.year === xDomain[1]) || pts[pts.length - 1];
      const valueLabels = [];
      [p0, p1].forEach((p) => {
        if (!p) return;
        const cx = xScale(p.year);
        const cy = yScale(p.value);
        SVG.el(g, "rect", {
          x: cx - mSize / 2,
          y: cy - mSize / 2,
          width: mSize,
          height: mSize,
          fill: color,
          stroke: "#ffffff",
          "stroke-width": 1.5,
          class: "marker",
        });
        const vt = SVG.el(g, "text", {
          x: cx, y: cy - LAYOUT.valueYOffset, "text-anchor": "middle",
          fill: color, "font-size": 11, "font-weight": "700",
          class: "value-label",
        });
        vt.textContent = String(Math.round(p.value));
        valueLabels.push(vt);
      });

      const lab = document.createElement("div");
      lab.className = "region-label";
      lab.dataset.key = s.key;
      lab.style.cssText = [
        `left:${ox + LAYOUT.labelPad}px`,
        `top:${oy - LAYOUT.labelTopOffset}px`,
        `width:${cellW - LAYOUT.labelPad * 2}px`,
        `color:${textColor}`,
        "opacity:1",
      ].join(";");
      lab.textContent = s.label || s.key;
      labelsLayer.appendChild(lab);

      regionNodes.push({ key: s.key, series: s, g, lab, valueLabels, areaEl, lineEl });
    });

    // Particles layer (above regions so they fly between panels)
    const particlesG = SVG.el(svg, "g", { class: "particles", "pointer-events": "none" });
    const particleData =
      particlesOpt === true
        ? buildParticles(series, xDomain)
        : Array.isArray(particlesOpt)
          ? particlesOpt
          : [];
    const particleEls = [];
    const psz = LAYOUT.particleSize;

    particleData.forEach((p) => {
      const el = SVG.el(particlesG, "rect", {
        width: psz,
        height: psz,
        class: "particle",
        "data-region": p.region,
        "data-year": String(p.year),
      });
      // start off-screen above (Atlas inactiveParticles y=-10)
      el.setAttribute("fill", p.color);
      el.style.transform = `translate(-20px, -20px)`;
      el.style.opacity = "0";
      particleEls.push({ p, el });
    });

    let currentScene = sceneIndex;

    function applyScene(idx, { animate = true } = {}) {
      currentScene = idx;
      if (!animate) root.classList.add("no-anim");

      regionNodes.forEach(({ series: s, g, lab, valueLabels }) => {
        const hi = isHighlighted(s, idx, forceHighlight, anyHighlight);
        const op = hi ? 1 : dimOpacity;
        g.setAttribute("opacity", String(op));
        lab.style.opacity = String(op);
        // Atlas: value labels stay readable; still fade slightly with dim
        valueLabels.forEach((vt) => {
          vt.style.opacity = hi ? "1" : showValuesWhenDimmed ? "1" : "0";
        });
      });

      particleEls.forEach(({ p, el }) => {
        const t = particleTarget(
          p, idx, panelByKey, xDomain, yDomain, cellW, cellH
        );
        const tx = t.x - psz / 2;
        const ty = t.y - psz / 2;

        // stagger transition-delay for cascade (Pixi feels sequential)
        if (animate && p.stagger) {
          el.style.transitionDelay = `${p.stagger}ms`;
        } else {
          el.style.transitionDelay = "0ms";
        }

        el.setAttribute("fill", t.color);
        el.style.transform = `translate(${tx}px, ${ty}px)`;

        // Opacity follows the panel the particle is sitting on
        let panelKey = p.region;
        if (idx === 0) panelKey = "WLD";
        else if (idx === 1 && (p.region === "SAS" || p.region === "SSF")) panelKey = "WLD";
        const panelSeries = series.find((s) => s.key === panelKey) || series[0];
        const panelHi = isHighlighted(panelSeries, idx, forceHighlight, anyHighlight);
        // Match region dim exactly (0.1) — Atlas particles dim with host panel
        el.style.opacity = panelHi ? "1" : String(dimOpacity);
      });

      if (!animate) {
        void root.offsetHeight;
        requestAnimationFrame(() => root.classList.remove("no-anim"));
      }
    }

    // Initial layout: particles jump to scene without animation, then enable
    applyScene(sceneIndex, { animate: false });
    // next frame: if intro, particles fade in with transition
    requestAnimationFrame(() => {
      particleEls.forEach(({ el }) => {
        // re-apply same transform so first transition can fire on next scene
        el.style.opacity = el.style.opacity || "1";
      });
    });

    const api = {
      root,
      svg,
      width: w,
      height: h,
      layout: { margin, gap, cols, rowsN, cellW, cellH, panelByKey },
      get sceneIndex() {
        return currentScene;
      },
      setScene(nextIndex, opts) {
        applyScene(nextIndex, opts);
      },
      updateScene(nextIndex) {
        applyScene(nextIndex, { animate: true });
      },
      destroy() {
        INSTANCES.delete(container);
        container.innerHTML = "";
      },
    };

    const inst = {
      api,
      series,
      seriesRef: series,
      seriesKeys: series.map((s) => s.key).join(","),
      width: w,
      options: { ...options, series },
      setScene: applyScene,
    };
    INSTANCES.set(container, inst);

    return api;
  }

  const api = {
    mount,
    seriesFromRows,
    curvePath,
    naturalControls,
    buildParticles,
    LAYOUT,
    DEFAULT_COLORS,
    DEFAULT_TEXT,
    DEFAULT_LABELS,
    ELECTRICITY_HIGHLIGHT,
    ELECTRICITY_ORDER,
    version: "0.5.0",
  };

  global.AtlasRegionsSmallMultiples = api;
  global.AtlasLibrary = global.AtlasLibrary || {};
  global.AtlasLibrary.RegionsSmallMultiples = api;
})(typeof window !== "undefined" ? window : globalThis);
