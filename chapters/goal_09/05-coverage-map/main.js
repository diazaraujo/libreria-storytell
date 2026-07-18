/**
 * coverage_map — ranked coverage by generation (3G/4G/5G) as proxy for map scroller
 * Full Atlas uses Mapbox/WebGL; we match narrative with ordered beeswarm-bars
 */
window.AtlasReplica = {
  ready: true, isStub: false,
  async render(scene, ctx) {
    const { chartEl, hidePlaceholder, sceneIndex } = ctx;
    hidePlaceholder();
    const rows = await AtlasLoad.csv("./data/09_data_network_coverages.csv");
    const NAMES = window.ATLAS_COUNTRY_NAMES || {};
    const fields = ["coverage_3G", "coverage_4G", "coverage_5G"];
    const titles = ["3G coverage", "4G coverage", "5G coverage", "5G — Sub-Saharan focus"];
    const colors = ["#34A7F2", "#081079", "#F3578E", "#FF9800"];
    const field = fields[Math.min(sceneIndex, 2)];
    const col = colors[Math.min(sceneIndex, 3)];

    // SSF iso list (approx) for scene 3 filter emphasis
    const SSF = new Set(["AGO","BDI","BEN","BFA","BWA","CAF","CIV","CMR","COD","COG","COM","CPV","DJI","ERI","ETH","GAB","GHA","GIN","GMB","GNB","GNQ","KEN","LBR","LSO","MDG","MLI","MOZ","MRT","MUS","MWI","NAM","NER","NGA","RWA","SDN","SEN","SLE","SOM","SSD","STP","SWZ","SYC","TCD","TGO","TZA","UGA","ZAF","ZMB","ZWE"]);

    let data = rows
      .map((r) => ({ iso: r.iso3c, v: +r[field] }))
      .filter((d) => Number.isFinite(d.v));
    data.sort((a, b) => a.v - b.v);

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText = "position:relative;width:100%;height:100%;font-family:'Open Sans',system-ui,sans-serif;background:#0b1220;color:#e2e8f0";
    chartEl.appendChild(root);

    const header = document.createElement("div");
    header.style.cssText = "padding:12px 16px;background:#111827;border-left:4px solid " + col;
    header.innerHTML = `<div style="font-weight:700;font-size:14px">${titles[Math.min(sceneIndex, 3)]}</div>
      <div style="font-size:12px;color:#94a3b8;margin-top:4px">Share of population covered · each bar is a country</div>`;
    root.appendChild(header);

    const plot = document.createElement("div");
    plot.style.cssText = "flex:1;position:relative;padding:8px 12px 16px";
    root.style.display = "flex";
    root.style.flexDirection = "column";
    root.appendChild(plot);

    const w = plot.clientWidth || 900;
    const h = Math.max(plot.clientHeight || 400, 320);
    const margin = { top: 8, right: 16, bottom: 28, left: 16 };
    const svg = AtlasSVG.el(plot, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.cssText = "width:100%;height:100%";
    const xScale = AtlasSVG.scaleLinear([0, 100], [margin.left, w - margin.right]);
    const yScale = AtlasSVG.scaleBand(data.map((d) => d.iso), [margin.top, h - margin.bottom], 0.15);

    [0, 25, 50, 75, 100].forEach((t) => {
      AtlasSVG.el(svg, "line", {
        x1: xScale(t), x2: xScale(t), y1: margin.top, y2: h - margin.bottom,
        stroke: "#1e293b",
      });
      AtlasSVG.el(svg, "text", {
        x: xScale(t), y: h - 8, "text-anchor": "middle", fill: "#64748b", "font-size": 11,
      }).textContent = t + "%";
    });

    data.forEach((d) => {
      const y = yScale(d.iso);
      const bh = Math.max(yScale.bandwidth(), 1.2);
      const isSSF = SSF.has(d.iso);
      const dim = sceneIndex === 3 && !isSSF;
      AtlasSVG.el(svg, "rect", {
        x: margin.left, y, width: Math.max(xScale(d.v) - margin.left, 1), height: bh,
        fill: sceneIndex === 3 ? (isSSF ? col : "#1e293b") : col,
        opacity: dim ? 0.25 : (d.v < 50 ? 0.55 : 0.9),
        rx: 1,
      });
    });

    // label extremes
    const low = data.slice(0, 5);
    const high = data.slice(-5);
    [...low, ...high].forEach((d) => {
      if (sceneIndex === 3 && !SSF.has(d.iso)) return;
      AtlasSVG.el(svg, "text", {
        x: xScale(d.v) + 4, y: yScale(d.iso) + yScale.bandwidth() / 2 + 3,
        fill: "#e2e8f0", "font-size": 9, "font-weight": "600",
      }).textContent = `${NAMES[d.iso] || d.iso} ${d.v.toFixed(0)}%`;
    });
  },
};
