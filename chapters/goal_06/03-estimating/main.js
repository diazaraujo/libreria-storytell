/**
 * estimating — min of components determines safely managed (Mongolia vs Nepal)
 */
window.AtlasReplica = {
  ready: true, isStub: false,
  async render(scene, ctx) {
    const { chartEl, hidePlaceholder, sceneIndex } = ctx;
    hidePlaceholder();
    const rows = await AtlasLoad.csv("./data/Indicator.csv");
    const country = sceneIndex >= 1 ? "Nepal" : "Mongolia";
    const data = rows.filter((r) => r.country === country)
      .map((r) => ({ cat: r.component, value: +r.usage_pct }));
    // if only one country in file, use all and filter
    let use = data.length ? data : rows.map((r) => ({ cat: r.component + " (" + r.country + ")", value: +r.usage_pct, country: r.country }));
    if (!data.length) {
      use = rows.filter((r) => (sceneIndex >= 1 ? r.country === "Nepal" : r.country === "Mongolia"))
        .map((r) => ({ cat: r.component, value: +r.usage_pct }));
    }
    const minV = Math.min(...use.map((d) => d.value));

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.innerHTML = `<div class="note" style="padding:12px 14px 0;font-weight:600">${country}: components of safely managed access</div><div class="plot"></div><div class="footer-leg">Safely managed = minimum of components (highlighted)</div>`;
    chartEl.appendChild(root);
    const plot = root.querySelector(".plot");
    const w = plot.clientWidth || 800, h = plot.clientHeight || 400;
    const margin = { top: 16, right: 16, bottom: 80, left: 48 };
    const SVG = AtlasSVG;
    const svg = SVG.el(plot, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.cssText = "width:100%;height:100%";
    const maxV = 100;
    const bw = (w - margin.left - margin.right) / use.length;
    use.forEach((d, i) => {
      const bh = ((h - margin.top - margin.bottom) * d.value) / maxV;
      const x = margin.left + i * bw + bw * 0.15;
      const y = h - margin.bottom - bh;
      const isMin = d.value === minV;
      SVG.el(svg, "rect", {
        x, y, width: bw * 0.7, height: bh,
        fill: isMin ? "#0080c6" : "#94a3b8", rx: 3,
      });
      SVG.el(svg, "text", {
        x: x + bw * 0.35, y: y - 6, "text-anchor": "middle",
        fill: "#111", "font-size": 12, "font-weight": isMin ? "700" : "400",
      }).textContent = d.value + "%";
      const label = SVG.el(svg, "text", {
        x: x + bw * 0.35, y: h - margin.bottom + 14, "text-anchor": "end",
        fill: "#6a7781", "font-size": 11,
        transform: `rotate(-35 ${x + bw * 0.35} ${h - margin.bottom + 14})`,
      });
      label.textContent = d.cat;
    });
    // y ticks
    [0, 25, 50, 75, 100].forEach((t) => {
      const y = h - margin.bottom - ((h - margin.top - margin.bottom) * t) / 100;
      SVG.el(svg, "line", { x1: margin.left, x2: w - margin.right, y1: y, y2: y, stroke: "#eef1f5" });
      SVG.el(svg, "text", { x: margin.left - 8, y: y + 4, "text-anchor": "end", fill: "#6a7781", "font-size": 11 }).textContent = t;
    });
  },
};
