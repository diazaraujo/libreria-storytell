/**
 * AtlasCoverageRankedBars v0.2 — beauty craft (map fallback)
 * Ranked horizontal bars for 3G / 4G / 5G coverage.
 * Scene: 0=3G, 1=4G, 2=5G, 3=5G Sub-Saharan Africa focus
 * Lowest coverage first (origin narrative for gaps).
 * Depends: AtlasSVG
 */
(function (global) {
  const INSTANCES = new WeakMap();
  const FIELDS = ["coverage_3G", "coverage_4G", "coverage_5G", "coverage_5G"];
  const TITLES = [
    "3G coverage",
    "4G coverage",
    "5G coverage",
    "5G — Sub-Saharan Africa",
  ];
  const COLORS = ["#34A7F2", "#081079", "#F3578E", "#FF9800"];
  const SSF = new Set([
    "AGO","BDI","BEN","BFA","BWA","CAF","CIV","CMR","COD","COG","COM","CPV","DJI","ERI","ETH",
    "GAB","GHA","GIN","GMB","GNB","GNQ","KEN","LBR","LSO","MDG","MLI","MOZ","MRT","MUS","MWI",
    "NAM","NER","NGA","RWA","SDN","SEN","SLE","SOM","SSD","STP","SWZ","SYC","TCD","TGO","TZA",
    "UGA","ZAF","ZMB","ZWE",
  ]);
  const NAME_OVERRIDE = {
    COD: "Congo, Dem. Rep.",
    CIV: "Côte d'Ivoire",
    SWZ: "Eswatini",
    TZA: "Tanzania",
    USA: "United States",
    GBR: "United Kingdom",
    KOR: "Korea, Rep.",
  };

  function ensureSVG() {
    if (!global.AtlasSVG) throw new Error("AtlasCoverageRankedBars needs AtlasSVG");
    return global.AtlasSVG;
  }

  function displayName(iso, names) {
    return NAME_OVERRIDE[iso] || names[iso] || iso;
  }

  function mount(container, options = {}) {
    const SVG = ensureSVG();
    const {
      rows = [],
      sceneIndex = 0,
      names = global.ATLAS_COUNTRY_NAMES || {},
      height: heightOpt = null,
      forceRemount = false,
      reuse = true,
      topN = 36,
    } = options;
    if (!container) throw new Error("container required");
    if (reuse && !forceRemount && INSTANCES.has(container)) {
      const inst = INSTANCES.get(container);
      inst.setScene(sceneIndex);
      return inst.api;
    }
    if (INSTANCES.has(container)) {
      try {
        INSTANCES.get(container).api.destroy();
      } catch (_) {}
      INSTANCES.delete(container);
    }

    container.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-coverage-rank atlas-chart-root";
    const w = Math.max(320, container.clientWidth || 900);
    const h = heightOpt || Math.max(440, container.clientHeight || 480);
    root.style.cssText = `position:relative;width:100%;height:${h}px;font-family:'Open Sans',system-ui,sans-serif;background:#fff`;
    container.appendChild(root);

    let current = sceneIndex;
    const font = "Open Sans, system-ui, sans-serif";

    function paint(idx) {
      root.innerHTML = "";
      const field = FIELDS[Math.min(idx, 3)];
      const title = TITLES[Math.min(idx, 3)];
      const col = COLORS[Math.min(idx, 3)];
      let data = rows
        .map((r) => ({
          iso: (r.iso3c || r.iso || "").toUpperCase(),
          v: r[field] === "" || r[field] == null ? NaN : +r[field],
        }))
        .filter((d) => d.iso && Number.isFinite(d.v));
      if (idx === 3) data = data.filter((d) => SSF.has(d.iso));
      data.sort((a, b) => a.v - b.v);
      // lowest first — gaps narrative
      const show = data.slice(0, Math.min(topN, data.length));

      const titleEl = document.createElement("div");
      titleEl.style.cssText = `position:absolute;top:6px;left:12px;right:12px;z-index:2;font:700 13px ${font};color:${col}`;
      titleEl.textContent = `${title} · % of population in range · lowest ${show.length}`;
      root.appendChild(titleEl);

      const margin = { top: 34, right: 48, bottom: 28, left: 118 };
      const svg = SVG.el(root, "svg");
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      svg.style.cssText = "width:100%;height:100%;display:block";

      const xScale = SVG.scaleLinear([0, 100], [margin.left, w - margin.right]);
      const yScale = SVG.scaleBand(
        show.map((d) => d.iso),
        [margin.top, h - margin.bottom],
        0.14
      );

      // x grid + ticks
      [0, 25, 50, 75, 100].forEach((t) => {
        SVG.el(svg, "line", {
          x1: xScale(t),
          x2: xScale(t),
          y1: margin.top,
          y2: h - margin.bottom,
          stroke: t === 0 ? "#e8ecf0" : "#f1f5f9",
          "stroke-width": 1,
        });
        SVG.el(svg, "text", {
          x: xScale(t),
          y: h - margin.bottom + 16,
          "text-anchor": "middle",
          fill: "#6a7781",
          "font-size": 10,
          "font-weight": "600",
          "font-family": font,
        }).textContent = String(t);
      });

      show.forEach((d) => {
        const y = yScale(d.iso);
        const bh = Math.max(yScale.bandwidth(), 3);
        const barW = Math.max(xScale(d.v) - margin.left, 1);
        SVG.el(svg, "rect", {
          x: margin.left,
          y,
          width: barW,
          height: bh,
          fill: col,
          opacity: 0.9,
          rx: 2,
        });
        SVG.el(svg, "text", {
          x: margin.left - 6,
          y: y + bh / 2,
          "text-anchor": "end",
          "dominant-baseline": "middle",
          fill: "#100e2b",
          "font-size": show.length > 30 ? 10 : 11,
          "font-weight": "600",
          "font-family": font,
        }).textContent = displayName(d.iso, names);
        if (bh >= 8) {
          SVG.el(svg, "text", {
            x: xScale(d.v) + 4,
            y: y + bh / 2,
            "dominant-baseline": "middle",
            fill: col,
            "font-size": 10,
            "font-weight": "700",
            "font-family": font,
          }).textContent = d.v.toFixed(0);
        }
      });
      current = idx;
    }

    paint(sceneIndex);
    const api = {
      updateScene(n) {
        paint(n);
      },
      setScene(n) {
        paint(n);
      },
      destroy() {
        container.innerHTML = "";
        INSTANCES.delete(container);
      },
      get sceneIndex() {
        return current;
      },
      version: "0.2.0",
    };
    INSTANCES.set(container, { api, setScene: paint });
    return api;
  }

  const api = { mount, version: "0.2.0" };
  global.AtlasCoverageRankedBars = api;
  global.AtlasLibrary = global.AtlasLibrary || {};
  global.AtlasLibrary.CoverageRankedBars = api;
})(typeof window !== "undefined" ? window : globalThis);
