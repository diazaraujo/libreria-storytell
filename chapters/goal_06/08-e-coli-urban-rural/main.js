/**
 * e_coli_urban_rural — paired bars urban vs rural very high risk
 */
window.AtlasReplica = {
  ready: true, isStub: false,
  async render(_s, ctx) {
    const { chartEl, hidePlaceholder } = ctx;
    hidePlaceholder();
    const rows = await AtlasLoad.csv("./data/E-coli urban rural.csv");
    const by = new Map();
    rows.forEach((r) => {
      if (!by.has(r.country)) by.set(r.country, { country: r.country });
      by.get(r.country)[r.urban_rural] = +r.very_high_risk;
    });
    const data = [...by.values()].filter((d) => d.Urban != null || d.Rural != null);
    data.sort((a, b) => (b.Rural || 0) - (a.Rural || 0));

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.innerHTML = `<div class="plot"></div><div class="footer-leg">
      <span><i style="background:#6D88D1"></i>Urban</span>
      <span><i style="background:#54AE89"></i>Rural</span>
      <span>% with very high E. coli risk</span>
    </div>`;
    chartEl.appendChild(root);
    const plot = root.querySelector(".plot");
    const w = plot.clientWidth || 900, h = plot.clientHeight || 400;
    const margin = { top: 16, right: 12, bottom: 70, left: 44 };
    const SVG = AtlasSVG;
    const svg = SVG.el(plot, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.cssText = "width:100%;height:100%";
    const maxV = Math.max(...data.flatMap((d) => [d.Urban || 0, d.Rural || 0]), 1);
    const groupW = (w - margin.left - margin.right) / data.length;
    data.forEach((d, i) => {
      [["Urban", "#6D88D1", 0.1], ["Rural", "#54AE89", 0.5]].forEach(([k, c, off]) => {
        const v = d[k] || 0;
        const bh = ((h - margin.top - margin.bottom) * v) / maxV;
        SVG.el(svg, "rect", {
          x: margin.left + i * groupW + groupW * off,
          y: h - margin.bottom - bh,
          width: groupW * 0.35, height: bh, fill: c, rx: 1,
        });
      });
      const t = SVG.el(svg, "text", {
        x: margin.left + i * groupW + groupW / 2,
        y: h - margin.bottom + 12,
        "text-anchor": "end", fill: "#6a7781", "font-size": 10,
        transform: `rotate(-35 ${margin.left + i * groupW + groupW / 2} ${h - margin.bottom + 12})`,
      });
      t.textContent = d.country;
    });
  },
};
