/**
 * safely_managed — global water service ladder stacked areas 2000–2024
 */
window.AtlasReplica = {
  ready: true, isStub: false,
  async render(scene, ctx) {
    const { chartEl, hidePlaceholder, sceneIndex } = ctx;
    hidePlaceholder();
    const rows = await AtlasLoad.csv("./data/safely_managed.csv");
    const order = ["Safely managed", "Basic", "Limited", "Unimproved", "Surface"];
    const colors = {
      "Safely managed": "#0080c6",
      "Basic": "#00b8ec",
      "Limited": "#7dd3fc",
      "Unimproved": "#fbbf24",
      "Surface": "#f97316",
    };
    // pivot year -> levels
    const byYear = new Map();
    rows.forEach((r) => {
      const y = +r.year, v = +r.value, lvl = r.level;
      if (!Number.isFinite(y) || !Number.isFinite(v)) return;
      if (!byYear.has(y)) byYear.set(y, {});
      byYear.get(y)[lvl] = v;
    });
    let years = [...byYear.keys()].sort((a,b)=>a-b);
    // progressive reveal by scene
    if (sceneIndex === 0) years = years.filter((y) => y <= 2000 || y === years[0]);
    if (sceneIndex === 1) years = years.filter((y) => y <= 2015);
    // scene 2: full

    const series = order.map((lvl) => years.map((y) => ({ x: y, y: byYear.get(y)?.[lvl] ?? 0, series: lvl })));
    // stacked
    const stacked = [];
    years.forEach((y, yi) => {
      let acc = 0;
      order.forEach((lvl) => {
        const v = byYear.get(y)?.[lvl] ?? 0;
        stacked.push({ x: y, y0: acc, y1: acc + v, series: lvl, v });
        acc += v;
      });
    });

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.innerHTML = `<div class="plot"></div><div class="footer-leg"></div>`;
    chartEl.appendChild(root);
    const plot = root.querySelector(".plot");
    const leg = root.querySelector(".footer-leg");
    order.forEach((o) => {
      leg.innerHTML += `<span><i style="background:${colors[o]}"></i>${o}</span>`;
    });

    const w = plot.clientWidth || 860, h = plot.clientHeight || 440;
    const margin = { top: 20, right: 16, bottom: 36, left: 44 };
    const SVG = AtlasSVG;
    const svg = SVG.el(plot, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.cssText = "width:100%;height:100%";
    const xScale = SVG.scaleLinear([years[0], years.at(-1)], [margin.left, w - margin.right]);
    const yScale = SVG.scaleLinear([0, 100], [h - margin.bottom, margin.top]);
    const gAxis = SVG.el(svg, "g");
    AtlasAxis.draw({
      g: gAxis, xScale, yScale, width: w, height: h, margin,
      xTicks: years.filter((y) => y % 5 === 0),
      yTicks: [0, 25, 50, 75, 100],
      xFormat: (v) => String(Math.round(v)),
    });
    // area paths per series
    order.forEach((lvl) => {
      const pts = stacked.filter((d) => d.series === lvl);
      if (pts.length < 2) return;
      let d = pts.map((p, i) => `${i ? "L" : "M"}${xScale(p.x)},${yScale(p.y1)}`).join(" ");
      d += " " + [...pts].reverse().map((p) => `L${xScale(p.x)},${yScale(p.y0)}`).join(" ") + " Z";
      SVG.el(svg, "path", { d, fill: colors[lvl], opacity: 0.92, stroke: "none" });
    });
  },
};
