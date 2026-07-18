/**
 * slum_regions — urban slum population share by region over time
 */
window.AtlasReplica = {
  ready: true, isStub: false,
  async render(scene, ctx) {
    const { chartEl, hidePlaceholder, sceneIndex } = ctx;
    hidePlaceholder();
    const rows = await AtlasLoad.csv("./data/11_data_slum_regions.csv");
    const COLORS = {
      WLD: "#081079", EAS: "#F3578E", ECS: "#AA0000", LCN: "#0C7C68",
      MEA: "#664AB6", NAC: "#34A7F2", SAS: "#4EC2C0", SSF: "#FF9800",
    };
    const LABELS = {
      WLD: "World", EAS: "East Asia & Pacific", ECS: "Europe & CA", LCN: "LAC",
      MEA: "MENA", NAC: "N. America", SAS: "South Asia", SSF: "Sub-Saharan Africa",
    };
    const by = new Map();
    rows.forEach((r) => {
      const y = +r.year, v = +r.value;
      if (!Number.isFinite(y) || !Number.isFinite(v)) return;
      if (!by.has(r.iso3c)) by.set(r.iso3c, []);
      by.get(r.iso3c).push({ year: y, v });
    });
    by.forEach((p) => p.sort((a, b) => a.year - b.year));
    // only series with ≥2 points for lines; single points as dots
    let keys = [...by.keys()].sort();
    if (sceneIndex === 0) keys = keys.filter((k) => (by.get(k) || []).length >= 2).slice(0, 3);
    else if (sceneIndex === 1) keys = keys.filter((k) => k === "SSF" || k === "SAS" || k === "LCN");
    // else all

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText = "position:relative;width:100%;height:100%;font-family:Open Sans,system-ui,sans-serif";
    chartEl.appendChild(root);
    const w = root.clientWidth || 900, h = root.clientHeight || 440;
    const margin = { top: 24, right: 140, bottom: 40, left: 48 };
    const svg = AtlasSVG.el(root, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.cssText = "width:100%;height:100%";
    const all = keys.flatMap((k) => by.get(k) || []);
    if (!all.length) {
      // fallback all data
      keys = [...by.keys()];
      keys.forEach((k) => all.push(...(by.get(k) || [])));
    }
    const xs = all.map((d) => d.year), ys = all.map((d) => d.v);
    const xScale = AtlasSVG.scaleLinear([Math.min(...xs), Math.max(...xs)], [margin.left, w - margin.right]);
    const yScale = AtlasSVG.scaleLinear([0, Math.max(...ys, 1) * 1.1], [h - margin.bottom, margin.top]);
    [0, 10, 20, 30, 40, 50].forEach((t) => {
      AtlasSVG.el(svg, "line", { x1: margin.left, x2: w - margin.right, y1: yScale(t), y2: yScale(t), stroke: "#f1f5f9" });
      AtlasSVG.el(svg, "text", { x: margin.left - 8, y: yScale(t) + 4, "text-anchor": "end", fill: "#6a7781", "font-size": 11 }).textContent = t + "%";
    });
    const ymin = Math.min(...xs), ymax = Math.max(...xs);
    [ymin, Math.round((ymin + ymax) / 2), ymax].forEach((yr) => {
      AtlasSVG.el(svg, "text", { x: xScale(yr), y: h - margin.bottom + 20, "text-anchor": "middle", fill: "#6a7781", "font-size": 12, "font-weight": "600" }).textContent = String(yr);
    });
    keys.forEach((k) => {
      const pts = by.get(k) || [];
      if (!pts.length) return;
      const col = COLORS[k] || "#57626a";
      if (pts.length >= 2) {
        AtlasSVG.el(svg, "path", {
          d: pts.map((p, i) => `${i ? "L" : "M"}${xScale(p.year)},${yScale(p.v)}`).join(" "),
          fill: "none", stroke: col, "stroke-width": 2.5, "stroke-linecap": "round",
        });
      }
      pts.forEach((p) => {
        AtlasSVG.el(svg, "circle", { cx: xScale(p.year), cy: yScale(p.v), r: 3.5, fill: col });
      });
      const last = pts.at(-1);
      AtlasSVG.el(svg, "text", {
        x: xScale(last.year) + 8, y: yScale(last.v) + 4, fill: col, "font-size": 12, "font-weight": "700",
      }).textContent = `${LABELS[k] || k} ${last.v.toFixed(1)}%`;
    });
  },
};
