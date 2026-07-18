/**
 * e_coli — PoC vs PoU paired comparison (scroller)
 */
window.AtlasReplica = {
  ready: true, isStub: false,
  async render(scene, ctx) {
    const { chartEl, hidePlaceholder, sceneIndex } = ctx;
    hidePlaceholder();
    const rows = await AtlasLoad.csv("./data/Ecoli_PoC_PoU_Scatter (High+Very High).csv");
    // pivot to country: poc, pou
    const by = new Map();
    rows.forEach((r) => {
      if (!by.has(r.country)) by.set(r.country, { country: r.country, year: r.year });
      by.get(r.country)[r.point] = +r.value;
    });
    let data = [...by.values()].filter((d) => Number.isFinite(d.PoC) && Number.isFinite(d.PoU));
    data.sort((a, b) => a.PoC - b.PoC);

    // scenes: 0 show PoC, 1 add PoU, 2 highlight where PoU > PoC a lot
    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.innerHTML = `<div class="plot"></div><div class="footer-leg">
      <span><i style="background:#0080c6"></i>Point of collection (PoC)</span>
      <span><i style="background:#AA0000"></i>Point of use (PoU)</span>
    </div>`;
    chartEl.appendChild(root);
    const plot = root.querySelector(".plot");
    const w = plot.clientWidth || 900, h = plot.clientHeight || 420;
    const margin = { top: 16, right: 16, bottom: 70, left: 44 };
    const SVG = AtlasSVG;
    const svg = SVG.el(plot, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.cssText = "width:100%;height:100%";
    const maxV = Math.max(...data.map((d) => Math.max(d.PoC, d.PoU)), 1);
    const n = data.length;
    const groupW = (w - margin.left - margin.right) / n;

    data.forEach((d, i) => {
      const x0 = margin.left + i * groupW;
      const showPoU = sceneIndex >= 1;
      const hi = sceneIndex >= 2 && d.PoU > d.PoC;
      const drawBar = (val, color, offset) => {
        const bh = ((h - margin.top - margin.bottom) * val) / maxV;
        SVG.el(svg, "rect", {
          x: x0 + offset, y: h - margin.bottom - bh,
          width: groupW * 0.35, height: bh, fill: color,
          opacity: sceneIndex >= 2 && !hi && showPoU ? 0.35 : 0.95, rx: 1,
        });
      };
      drawBar(d.PoC, "#0080c6", groupW * 0.1);
      if (showPoU) drawBar(d.PoU, "#AA0000", groupW * 0.5);
      if (n <= 20 || i % Math.ceil(n / 12) === 0) {
        const t = SVG.el(svg, "text", {
          x: x0 + groupW / 2, y: h - margin.bottom + 12,
          "text-anchor": "end", fill: "#6a7781", "font-size": 9,
          transform: `rotate(-40 ${x0 + groupW / 2} ${h - margin.bottom + 12})`,
        });
        t.textContent = d.country.length > 10 ? d.country.slice(0, 9) + "…" : d.country;
      }
    });
    [0, 0.25, 0.5, 0.75, 1].forEach((t) => {
      const v = maxV * t;
      const y = h - margin.bottom - ((h - margin.top - margin.bottom) * t);
      SVG.el(svg, "line", { x1: margin.left, x2: w - margin.right, y1: y, y2: y, stroke: "#eef1f5" });
      SVG.el(svg, "text", { x: margin.left - 6, y: y + 3, "text-anchor": "end", fill: "#6a7781", "font-size": 11 }).textContent = Math.round(v);
    });
  },
};
