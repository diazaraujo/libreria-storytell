/**
 * arsenic_by_source — grouped bars by water source
 */
window.AtlasReplica = {
  ready: true, isStub: false,
  async render(_s, ctx) {
    const { chartEl, hidePlaceholder } = ctx;
    hidePlaceholder();
    const rows = await AtlasLoad.csv("./data/ArsenicBySource.csv");
    const data = rows.map((r) => ({
      source: r.source,
      pct10: +r.pct10ppb,
      pct50: +r.pct50ppb,
    }));
    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.innerHTML = `<div class="plot"></div><div class="footer-leg">
      <span><i style="background:#fbbf24"></i>≥10 ppb</span>
      <span><i style="background:#AA0000"></i>≥50 ppb</span>
    </div>`;
    chartEl.appendChild(root);
    const plot = root.querySelector(".plot");
    const w = plot.clientWidth || 800, h = plot.clientHeight || 400;
    const margin = { top: 24, right: 20, bottom: 48, left: 48 };
    const SVG = AtlasSVG;
    const svg = SVG.el(plot, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.cssText = "width:100%;height:100%";
    const maxV = Math.max(...data.flatMap((d) => [d.pct10, d.pct50]), 1);
    const bw = (w - margin.left - margin.right) / data.length;
    data.forEach((d, i) => {
      [["pct10", "#fbbf24", 0.15], ["pct50", "#AA0000", 0.5]].forEach(([k, c, off]) => {
        const v = d[k];
        const bh = ((h - margin.top - margin.bottom) * v) / maxV;
        SVG.el(svg, "rect", {
          x: margin.left + i * bw + bw * off,
          y: h - margin.bottom - bh,
          width: bw * 0.3, height: bh, fill: c, rx: 2,
        });
        SVG.el(svg, "text", {
          x: margin.left + i * bw + bw * (off + 0.15),
          y: h - margin.bottom - bh - 6,
          "text-anchor": "middle", fill: "#111", "font-size": 12, "font-weight": "600",
        }).textContent = v + "%";
      });
      SVG.el(svg, "text", {
        x: margin.left + i * bw + bw / 2,
        y: h - margin.bottom + 22,
        "text-anchor": "middle", fill: "#111", "font-size": 13, "font-weight": "600",
      }).textContent = d.source;
    });
  },
};
