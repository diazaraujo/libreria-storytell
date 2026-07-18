/**
 * undernourishment_conflict — FCS vs non-FCS hunger trends
 */
window.AtlasReplica = {
  ready: true, isStub: false,
  async render(_s, ctx) {
    const { chartEl, hidePlaceholder } = ctx;
    hidePlaceholder();
    const rows = await AtlasLoad.csv("./data/02_data_undernourishment_conflict.csv");
    const COLORS = { fcs_pct: "#AA0000", non_fcs_pct: "#0C7C68", fcs: "#AA0000", non_fcs: "#0C7C68" };
    const LABELS = {
      fcs_pct: "Fragile & conflict-affected",
      non_fcs_pct: "Other economies",
      fcs: "Fragile & conflict-affected",
      non_fcs: "Other economies",
    };
    const by = new Map();
    rows.forEach((r) => {
      const y = +r.year, v = +r.value, g = r.group;
      if (!Number.isFinite(y) || !Number.isFinite(v)) return;
      if (!by.has(g)) by.set(g, []);
      by.get(g).push({ year: y, v });
    });
    by.forEach((p) => p.sort((a, b) => a.year - b.year));

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText = "position:relative;width:100%;height:100%;font-family:Open Sans,system-ui,sans-serif";
    chartEl.appendChild(root);
    const w = root.clientWidth || 900, h = root.clientHeight || 420;
    const margin = { top: 24, right: 180, bottom: 40, left: 48 };
    const svg = AtlasSVG.el(root, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.cssText = "width:100%;height:100%";
    const all = [...by.values()].flat();
    const xScale = AtlasSVG.scaleLinear([Math.min(...all.map((d) => d.year)), Math.max(...all.map((d) => d.year))], [margin.left, w - margin.right]);
    const yScale = AtlasSVG.scaleLinear([0, Math.max(...all.map((d) => d.v)) * 1.1], [h - margin.bottom, margin.top]);
    [0, 10, 20, 30, 40].forEach((t) => {
      AtlasSVG.el(svg, "line", { x1: margin.left, x2: w - margin.right, y1: yScale(t), y2: yScale(t), stroke: "#f1f5f9" });
      AtlasSVG.el(svg, "text", { x: margin.left - 8, y: yScale(t) + 4, "text-anchor": "end", fill: "#6a7781", "font-size": 11 }).textContent = t + "%";
    });
    const years = [...new Set(all.map((d) => d.year))].sort((a, b) => a - b);
    years.filter((_, i) => i % Math.ceil(years.length / 6) === 0 || i === years.length - 1).forEach((yr) => {
      AtlasSVG.el(svg, "text", { x: xScale(yr), y: h - margin.bottom + 20, "text-anchor": "middle", fill: "#6a7781", "font-size": 12, "font-weight": "600" }).textContent = String(yr);
    });
    for (const [g, pts] of by) {
      if (pts.length < 2) continue;
      const col = COLORS[g] || "#57626a";
      AtlasSVG.el(svg, "path", {
        d: pts.map((p, i) => `${i ? "L" : "M"}${xScale(p.year)},${yScale(p.v)}`).join(" "),
        fill: "none", stroke: col, "stroke-width": 2.8, "stroke-linecap": "round",
      });
      const last = pts.at(-1);
      AtlasSVG.el(svg, "text", {
        x: xScale(last.year) + 8, y: yScale(last.v) + 4, fill: col, "font-size": 12, "font-weight": "700",
      }).textContent = `${LABELS[g] || g} ${last.v}%`;
    }
  },
};
