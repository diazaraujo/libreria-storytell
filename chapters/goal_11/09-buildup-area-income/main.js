/**
 * buildup_area_income — built-up area by income group over time
 */
window.AtlasReplica = {
  ready: true, isStub: false,
  async render(scene, ctx) {
    const { chartEl, hidePlaceholder, sceneIndex } = ctx;
    hidePlaceholder();
    const ph = document.getElementById("placeholder");
    if (ph) { ph.hidden = true; ph.style.display = "none"; }
    const rows = await AtlasLoad.csv("./data/11_data_buildup_area_income.csv");
    const COLORS = { HIC: "#016B6C", UMC: "#73AF48", LMC: "#DB95D7", LIC: "#3B4DA6" };
    const LABELS = { HIC: "High income", UMC: "Upper middle", LMC: "Lower middle", LIC: "Low income" };
    const by = new Map();
    rows.forEach((r) => {
      const y = +r.year, v = +r.value, s = r.income || r.iso3c;
      if (!Number.isFinite(y) || !Number.isFinite(v)) return;
      if (!by.has(s)) by.set(s, []);
      by.get(s).push({ year: y, v });
    });
    by.forEach((p) => p.sort((a, b) => a.year - b.year));
    let keys = ["LIC", "LMC", "UMC", "HIC"].filter((k) => by.has(k));
    if (!keys.length) keys = [...by.keys()];
    if (sceneIndex === 0) keys = keys.slice(0, 2);
    else if (sceneIndex === 1) keys = keys.slice(0, 3);

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText = "position:relative;width:100%;height:100%;font-family:Open Sans,system-ui,sans-serif";
    chartEl.appendChild(root);
    const w = root.clientWidth || 900, h = root.clientHeight || 440;
    const margin = { top: 24, right: 130, bottom: 40, left: 56 };
    const svg = AtlasSVG.el(root, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.cssText = "width:100%;height:100%";
    const all = keys.flatMap((k) => by.get(k) || []);
    const xs = all.map((d) => d.year), ys = all.map((d) => d.v);
    const xScale = AtlasSVG.scaleLinear([Math.min(...xs), Math.max(...xs)], [margin.left, w - margin.right]);
    const yScale = AtlasSVG.scaleLinear([0, Math.max(...ys) * 1.08], [h - margin.bottom, margin.top]);
    for (let i = 0; i <= 4; i++) {
      const t = (Math.max(...ys) * 1.08) * i / 4;
      AtlasSVG.el(svg, "line", { x1: margin.left, x2: w - margin.right, y1: yScale(t), y2: yScale(t), stroke: "#f1f5f9" });
      AtlasSVG.el(svg, "text", { x: margin.left - 8, y: yScale(t) + 4, "text-anchor": "end", fill: "#6a7781", "font-size": 11 }).textContent = Math.round(t).toLocaleString();
    }
    const ymin = Math.min(...xs), ymax = Math.max(...xs);
    [ymin, Math.round((ymin + ymax) / 2), ymax].forEach((yr) => {
      AtlasSVG.el(svg, "text", { x: xScale(yr), y: h - margin.bottom + 20, "text-anchor": "middle", fill: "#6a7781", "font-size": 12, "font-weight": "600" }).textContent = String(yr);
    });
    keys.forEach((k) => {
      const pts = by.get(k) || [];
      if (pts.length < 2) return;
      const col = COLORS[k] || "#0071bc";
      AtlasSVG.el(svg, "path", {
        d: pts.map((p, i) => `${i ? "L" : "M"}${xScale(p.year)},${yScale(p.v)}`).join(" "),
        fill: "none", stroke: col, "stroke-width": 2.6, "stroke-linecap": "round",
      });
      const last = pts.at(-1);
      AtlasSVG.el(svg, "circle", { cx: xScale(last.year), cy: yScale(last.v), r: 4, fill: col });
      AtlasSVG.el(svg, "text", {
        x: xScale(last.year) + 8, y: yScale(last.v) + 4, fill: col, "font-size": 12, "font-weight": "700",
      }).textContent = LABELS[k] || k;
    });
    AtlasSVG.el(svg, "text", {
      x: 12, y: margin.top - 8, fill: "#6a7781", "font-size": 11,
    }).textContent = "Built-up area";
  },
};
