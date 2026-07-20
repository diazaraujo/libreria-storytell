/**
 * AtlasCoverageRankedBars v0.1
 * Ranked horizontal bars for 3G/4G/5G coverage (map proxy).
 * Scene: 0=3G, 1=4G, 2=5G, 3=5G SSF focus
 * Depends: AtlasSVG
 */
(function (global) {
  const INSTANCES = new WeakMap();
  const FIELDS = ["coverage_3G", "coverage_4G", "coverage_5G", "coverage_5G"];
  const TITLES = ["3G coverage", "4G coverage", "5G coverage", "5G — Sub-Saharan Africa"];
  const COLORS = ["#34A7F2", "#081079", "#F3578E", "#FF9800"];
  const SSF = new Set([
    "AGO","BDI","BEN","BFA","BWA","CAF","CIV","CMR","COD","COG","COM","CPV","DJI","ERI","ETH",
    "GAB","GHA","GIN","GMB","GNB","GNQ","KEN","LBR","LSO","MDG","MLI","MOZ","MRT","MUS","MWI",
    "NAM","NER","NGA","RWA","SDN","SEN","SLE","SOM","SSD","STP","SWZ","SYC","TCD","TGO","TZA",
    "UGA","ZAF","ZMB","ZWE",
  ]);

  function ensureSVG() {
    if (!global.AtlasSVG) throw new Error("AtlasCoverageRankedBars needs AtlasSVG");
    return global.AtlasSVG;
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
      topN = 40,
    } = options;
    if (!container) throw new Error("container required");
    if (reuse && !forceRemount && INSTANCES.has(container)) {
      const inst = INSTANCES.get(container);
      inst.setScene(sceneIndex);
      return inst.api;
    }
    if (INSTANCES.has(container)) {
      try { INSTANCES.get(container).api.destroy(); } catch (_) {}
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
    function paint(idx) {
      root.innerHTML = "";
      const field = FIELDS[Math.min(idx, 3)];
      const title = TITLES[Math.min(idx, 3)];
      const col = COLORS[Math.min(idx, 3)];
      let data = rows
        .map((r) => ({ iso: r.iso3c, v: +r[field] }))
        .filter((d) => Number.isFinite(d.v));
      if (idx === 3) data = data.filter((d) => SSF.has(d.iso));
      data.sort((a, b) => a.v - b.v);
      // show lowest half emphasis for gaps, but display spread of topN from bottom
      const show = data.slice(0, Math.min(topN, data.length));

      const titleEl = document.createElement("div");
      titleEl.style.cssText =
        "position:absolute;top:8px;left:12px;font-size:13px;font-weight:700;color:" + col;
      titleEl.textContent = title + " · % of population in range";
      root.appendChild(titleEl);

      const margin = { top: 36, right: 56, bottom: 16, left: 110 };
      const svg = SVG.el(root, "svg");
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      svg.style.cssText = "width:100%;height:100%;display:block";
      const xScale = SVG.scaleLinear([0, 100], [margin.left, w - margin.right]);
      const yScale = SVG.scaleBand(
        show.map((d) => d.iso),
        [margin.top, h - margin.bottom],
        0.12
      );
      show.forEach((d) => {
        const y = yScale(d.iso);
        const bh = yScale.bandwidth();
        SVG.el(svg, "rect", {
          x: margin.left, y, width: Math.max(xScale(d.v) - margin.left, 1), height: bh,
          fill: col, opacity: 0.88, rx: 2,
        });
        SVG.el(svg, "text", {
          x: margin.left - 6, y: y + bh / 2, "text-anchor": "end", "dominant-baseline": "middle",
          fill: "#111", "font-size": 11, "font-weight": "600",
        }).textContent = names[d.iso] || d.iso;
        SVG.el(svg, "text", {
          x: xScale(d.v) + 4, y: y + bh / 2, "dominant-baseline": "middle",
          fill: col, "font-size": 11, "font-weight": "700",
        }).textContent = d.v.toFixed(0);
      });
      current = idx;
    }
    paint(sceneIndex);
    const api = {
      updateScene(n) { paint(n); },
      setScene(n) { paint(n); },
      destroy() { container.innerHTML = ""; INSTANCES.delete(container); },
      get sceneIndex() { return current; },
      version: "0.1.0",
    };
    INSTANCES.set(container, { api, setScene: paint });
    return api;
  }
  const api = { mount, version: "0.1.0" };
  global.AtlasCoverageRankedBars = api;
  global.AtlasLibrary = global.AtlasLibrary || {};
  global.AtlasLibrary.CoverageRankedBars = api;
})(typeof window !== "undefined" ? window : globalThis);
