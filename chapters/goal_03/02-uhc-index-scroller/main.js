/**
 * uhc_index_scroller — UHC service coverage index by country (beeswarm / ranked)
 */
window.AtlasReplica = {
  ready: true, isStub: false,
  async render(scene, ctx) {
    const { chartEl, hidePlaceholder, sceneIndex } = ctx;
    hidePlaceholder();
    const rows = await AtlasLoad.csv("./data/03_data_uhc_countries.csv");
    const NAMES = window.ATLAS_COUNTRY_NAMES || {};
    let data = rows.map((r) => ({
      iso: r.iso3c, name: NAMES[r.iso3c] || r.iso3c, v: +r.value, year: +r.year,
    })).filter((d) => Number.isFinite(d.v));
    data.sort((a, b) => a.v - b.v);
    if (sceneIndex === 0) data = data.filter((d) => d.v < 50);
    else if (sceneIndex === 1) data = data.filter((d) => d.v >= 50);

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText = "position:relative;width:100%;height:100%;font-family:Open Sans,system-ui,sans-serif";
    chartEl.appendChild(root);
    const w = root.clientWidth || 900;
    const h = Math.max(root.clientHeight || 440, 40 + Math.min(data.length, 80) * 6);
    const margin = { top: 28, right: 48, bottom: 24, left: 120 };
    const svg = AtlasSVG.el(root, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.cssText = "width:100%;height:100%";
    const show = data.length > 80 ? data.filter((_, i) => i % Math.ceil(data.length / 80) === 0) : data;
    const xScale = AtlasSVG.scaleLinear([0, 100], [margin.left, w - margin.right]);
    const yScale = AtlasSVG.scaleBand(show.map((d) => d.iso), [margin.top, h - margin.bottom], 0.12);
    [0, 25, 50, 75, 100].forEach((t) => {
      AtlasSVG.el(svg, "line", { x1: xScale(t), x2: xScale(t), y1: margin.top, y2: h - margin.bottom, stroke: "#f1f5f9" });
      AtlasSVG.el(svg, "text", { x: xScale(t), y: margin.top - 8, "text-anchor": "middle", fill: "#6a7781", "font-size": 11 }).textContent = t;
    });
    show.forEach((d) => {
      const y = yScale(d.iso), bh = yScale.bandwidth();
      const col = d.v < 50 ? "#AA0000" : d.v < 70 ? "#f7b841" : "#0C7C68";
      AtlasSVG.el(svg, "rect", {
        x: margin.left, y, width: Math.max(xScale(d.v) - margin.left, 1), height: bh,
        fill: col, rx: 2,
      });
      AtlasSVG.el(svg, "text", {
        x: margin.left - 6, y: y + bh / 2, "text-anchor": "end", "dominant-baseline": "middle",
        fill: "#111", "font-size": 10, "font-weight": "600",
      }).textContent = d.name.slice(0, 18);
      AtlasSVG.el(svg, "text", {
        x: xScale(d.v) + 4, y: y + bh / 2, "dominant-baseline": "middle",
        fill: col, "font-size": 10, "font-weight": "700",
      }).textContent = d.v;
    });
  },
};
