/**
 * sdg5_wage_gap_beeswarm — female/male wage ratio scatter by country
 */
window.AtlasReplica = {
  ready: true, isStub: false,
  async render(_s, ctx) {
    const { chartEl, hidePlaceholder } = ctx;
    hidePlaceholder();
    const ph = document.getElementById("placeholder");
    if (ph) { ph.hidden = true; ph.style.display = "none"; }
    const rows = await AtlasLoad.csv("./data/wage_month.csv");
    const NAMES = window.ATLAS_COUNTRY_NAMES || {};
    const data = rows.map((r) => ({
      iso: r.code,
      name: NAMES[r.code] || r.code,
      female: +r.Female,
      male: +r.Male,
      ratio: +r.wage_ratio,
    })).filter((d) => Number.isFinite(d.ratio));

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText = "position:relative;width:100%;height:100%;font-family:Open Sans,system-ui,sans-serif";
    chartEl.appendChild(root);
    const w = root.clientWidth || 900, h = root.clientHeight || 440;
    const margin = { top: 28, right: 24, bottom: 48, left: 56 };
    const svg = AtlasSVG.el(root, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.cssText = "width:100%;height:100%";
    const xs = data.map((d) => d.male), ys = data.map((d) => d.female);
    const max = Math.max(...xs, ...ys, 1) * 1.05;
    const xScale = AtlasSVG.scaleLinear([0, max], [margin.left, w - margin.right]);
    const yScale = AtlasSVG.scaleLinear([0, max], [h - margin.bottom, margin.top]);
    // equality line
    AtlasSVG.el(svg, "line", {
      x1: xScale(0), y1: yScale(0), x2: xScale(max), y2: yScale(max),
      stroke: "#94a3b8", "stroke-dasharray": "5 4",
    });
    for (let i = 0; i <= 4; i++) {
      const t = (max * i) / 4;
      AtlasSVG.el(svg, "line", { x1: margin.left, x2: w - margin.right, y1: yScale(t), y2: yScale(t), stroke: "#f1f5f9" });
      AtlasSVG.el(svg, "line", { x1: xScale(t), x2: xScale(t), y1: margin.top, y2: h - margin.bottom, stroke: "#f1f5f9" });
      AtlasSVG.el(svg, "text", { x: margin.left - 8, y: yScale(t) + 4, "text-anchor": "end", fill: "#6a7781", "font-size": 11 }).textContent = Math.round(t);
    }
    data.forEach((d) => {
      const above = d.female > d.male;
      AtlasSVG.el(svg, "circle", {
        cx: xScale(d.male), cy: yScale(d.female), r: 5,
        fill: above ? "#DB95D7" : "#34A7F2", opacity: 0.8, stroke: "#fff", "stroke-width": 1,
      });
    });
    AtlasSVG.el(svg, "text", {
      x: (margin.left + w - margin.right) / 2, y: h - 12, "text-anchor": "middle",
      fill: "#111", "font-size": 12, "font-weight": "600",
    }).textContent = "Male wage (index)";
    AtlasSVG.el(svg, "text", {
      x: 14, y: h / 2, "text-anchor": "middle", fill: "#111", "font-size": 12, "font-weight": "600",
      transform: `rotate(-90 14 ${h / 2})`,
    }).textContent = "Female wage (index)";
  },
};
