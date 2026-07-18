/** speed_test — ranked fixed vs mobile Mbps */
window.AtlasReplica = {
  ready: true, isStub: false,
  async render(_s, ctx) {
    const { chartEl, hidePlaceholder } = ctx;
    hidePlaceholder();
    const rows = await AtlasLoad.csv("./data/09_data_speedtest.csv");
    const NAMES = window.ATLAS_COUNTRY_NAMES || {};
    const fixed = rows.filter((r) => /Fixed/i.test(r.type)).map((r) => ({ iso: r.iso3c, mbps: +r.mbps })).filter((d) => Number.isFinite(d.mbps)).sort((a, b) => b.mbps - a.mbps);
    const mobile = rows.filter((r) => /Mobile/i.test(r.type)).map((r) => ({ iso: r.iso3c, mbps: +r.mbps })).filter((d) => Number.isFinite(d.mbps)).sort((a, b) => b.mbps - a.mbps);

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText = "position:relative;width:100%;height:100%;display:grid;grid-template-columns:1fr 1fr;gap:0;font-family:'Open Sans',system-ui,sans-serif";
    chartEl.appendChild(root);

    const drawCol = (title, data, color) => {
      const col = document.createElement("div");
      col.style.cssText = "position:relative;padding:12px 8px;border-right:1px solid #e2e8f0;overflow:hidden";
      col.innerHTML = `<div style="font-weight:700;font-size:13px;margin:0 8px 8px;color:${color}">${title}</div><div class="plot" style="height:calc(100% - 28px)"></div>`;
      root.appendChild(col);
      const plot = col.querySelector(".plot");
      const top = data.slice(0, 25);
      const w = plot.clientWidth || 400, h = plot.clientHeight || 400;
      const margin = { top: 4, right: 48, bottom: 4, left: 100 };
      const svg = AtlasSVG.el(plot, "svg");
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      svg.style.cssText = "width:100%;height:100%";
      const max = Math.max(...top.map((d) => d.mbps), 1);
      const xScale = AtlasSVG.scaleLinear([0, max], [margin.left, w - margin.right]);
      const yScale = AtlasSVG.scaleBand(top.map((d) => d.iso), [margin.top, h - margin.bottom], 0.15);
      top.forEach((d) => {
        const y = yScale(d.iso), bh = yScale.bandwidth();
        AtlasSVG.el(svg, "rect", {
          x: margin.left, y, width: xScale(d.mbps) - margin.left, height: bh,
          fill: color, rx: 2, opacity: 0.9,
        });
        AtlasSVG.el(svg, "text", {
          x: margin.left - 6, y: y + bh / 2, "text-anchor": "end", "dominant-baseline": "middle",
          fill: "#111", "font-size": 11, "font-weight": "600",
        }).textContent = NAMES[d.iso] || d.iso;
        AtlasSVG.el(svg, "text", {
          x: xScale(d.mbps) + 4, y: y + bh / 2, "dominant-baseline": "middle",
          fill: color, "font-size": 11, "font-weight": "700",
        }).textContent = Math.round(d.mbps);
      });
    };
    drawCol("Fixed broadband · Mbps", fixed, "#081079");
    drawCol("Mobile · Mbps", mobile, "#34A7F2");
  },
};
