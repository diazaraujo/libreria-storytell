/**
 * bangladesh_arsenic_grouped — stacked bars by income or urban/rural
 */
window.AtlasReplica = {
  ready: true, isStub: false,
  async render(scene, ctx) {
    const { chartEl, hidePlaceholder, sceneIndex } = ctx;
    hidePlaceholder();
    const rows = await AtlasLoad.csv("./data/Bangladesh_arsenic_by_group.csv");
    const view = sceneIndex >= 1 ? "income" : "urban_rural";
    // scene0 rural/urban, scene1 income — or swap based on config scenes
    const useView = sceneIndex >= 1 ? "income" : "urban_rural";
    const data = rows.filter((r) => r.view === useView && r.group !== "Total")
      .map((r) => ({
        group: r.group,
        low: +r.ppb_10,
        mid: +r.ppb_10_50,
        high: +r.ppb_50,
      }));

    const colors = { low: "#54AE89", mid: "#fbbf24", high: "#AA0000" };
    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.innerHTML = `<div class="plot"></div><div class="footer-leg">
      <span><i style="background:#54AE89"></i>&lt;10 ppb</span>
      <span><i style="background:#fbbf24"></i>10–50 ppb</span>
      <span><i style="background:#AA0000"></i>&gt;50 ppb</span>
      <span>Bangladesh · ${useView.replace("_", "/")}</span>
    </div>`;
    chartEl.appendChild(root);
    const plot = root.querySelector(".plot");
    const w = plot.clientWidth || 800, h = plot.clientHeight || 400;
    const margin = { top: 20, right: 20, bottom: 48, left: 48 };
    const SVG = AtlasSVG;
    const svg = SVG.el(plot, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.cssText = "width:100%;height:100%";
    const bw = (w - margin.left - margin.right) / data.length;
    data.forEach((d, i) => {
      let acc = 0;
      [["low", colors.low], ["mid", colors.mid], ["high", colors.high]].forEach(([k, c]) => {
        const v = d[k];
        const bh = ((h - margin.top - margin.bottom) * v) / 100;
        const y = h - margin.bottom - acc - bh;
        SVG.el(svg, "rect", {
          x: margin.left + i * bw + bw * 0.2,
          y, width: bw * 0.6, height: bh, fill: c,
        });
        acc += bh;
      });
      SVG.el(svg, "text", {
        x: margin.left + i * bw + bw / 2,
        y: h - margin.bottom + 20,
        "text-anchor": "middle", fill: "#111", "font-size": 13, "font-weight": "600",
      }).textContent = d.group;
    });
    [0, 25, 50, 75, 100].forEach((t) => {
      const y = h - margin.bottom - ((h - margin.top - margin.bottom) * t) / 100;
      SVG.el(svg, "line", { x1: margin.left, x2: w - margin.right, y1: y, y2: y, stroke: "#eef1f5" });
      SVG.el(svg, "text", { x: margin.left - 8, y: y + 4, "text-anchor": "end", fill: "#6a7781", "font-size": 11 }).textContent = t;
    });
  },
};
