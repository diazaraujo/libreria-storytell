/**
 * myanmar_foodprices_conflict — dual axis: conflict events + food price index
 */
window.AtlasReplica = {
  ready: true, isStub: false,
  async render(scene, ctx) {
    const { chartEl, hidePlaceholder, sceneIndex } = ctx;
    hidePlaceholder();
    const rows = await AtlasLoad.csv("./data/national_aggregates.csv");
    const data = rows.map((r) => ({
      month: r.month,
      t: new Date(r.month).getTime(),
      events: +r.events,
      price: +r.price_index,
    })).filter((d) => Number.isFinite(d.t) && Number.isFinite(d.price)).sort((a, b) => a.t - b.t);

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText = "position:relative;width:100%;height:100%;font-family:Open Sans,system-ui,sans-serif";
    chartEl.appendChild(root);
    const w = root.clientWidth || 900, h = root.clientHeight || 420;
    const margin = { top: 28, right: 56, bottom: 40, left: 48 };
    const svg = AtlasSVG.el(root, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.cssText = "width:100%;height:100%";
    const xScale = AtlasSVG.scaleLinear([data[0].t, data.at(-1).t], [margin.left, w - margin.right]);
    const yPrice = AtlasSVG.scaleLinear([0, Math.max(...data.map((d) => d.price)) * 1.1], [h - margin.bottom, margin.top]);
    const yEv = AtlasSVG.scaleLinear([0, Math.max(...data.map((d) => d.events), 1) * 1.2], [h - margin.bottom, margin.top]);

    // event bars
    const bw = Math.max(2, (w - margin.left - margin.right) / data.length * 0.7);
    data.forEach((d) => {
      AtlasSVG.el(svg, "rect", {
        x: xScale(d.t) - bw / 2, y: yEv(d.events),
        width: bw, height: Math.max(0, yEv(0) - yEv(d.events)),
        fill: "#AA0000", opacity: sceneIndex >= 1 ? 0.55 : 0.25,
      });
    });
    // price line
    AtlasSVG.el(svg, "path", {
      d: data.map((p, i) => `${i ? "L" : "M"}${xScale(p.t)},${yPrice(p.price)}`).join(" "),
      fill: "none", stroke: "#081079", "stroke-width": 2.8, "stroke-linecap": "round",
    });
    // axes labels
    const ticks = [0, Math.floor(data.length / 2), data.length - 1].map((i) => data[i]);
    ticks.forEach((d) => {
      AtlasSVG.el(svg, "text", {
        x: xScale(d.t), y: h - margin.bottom + 20, "text-anchor": "middle",
        fill: "#6a7781", "font-size": 11, "font-weight": "600",
      }).textContent = d.month.slice(0, 7);
    });
    AtlasSVG.el(svg, "text", { x: margin.left, y: margin.top - 10, fill: "#081079", "font-size": 12, "font-weight": "700" }).textContent = "Food price index";
    AtlasSVG.el(svg, "text", { x: w - margin.right, y: margin.top - 10, "text-anchor": "end", fill: "#AA0000", "font-size": 12, "font-weight": "700" }).textContent = "Conflict events";
  },
};
