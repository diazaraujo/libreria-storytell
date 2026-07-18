/**
 * prevalence_undernourishment_regions — multi-line hunger rate by region 2001–…
 */
window.AtlasReplica = {
  ready: true, isStub: false,
  async render(scene, ctx) {
    const { chartEl, hidePlaceholder, sceneIndex } = ctx;
    hidePlaceholder();
    const rows = await AtlasLoad.csv("./data/02_data_prevalence_undernourishment_regions.csv");
    const ORDER = ["WLD", "SSF", "SAS", "MEA", "LCN", "EAS", "ECS", "NAC"];
    const COLORS = {
      WLD: "#081079", SSF: "#FF9800", SAS: "#4EC2C0", MEA: "#664AB6",
      LCN: "#0C7C68", EAS: "#F3578E", ECS: "#AA0000", NAC: "#34A7F2",
    };
    const LABELS = {
      WLD: "World", SSF: "Sub-Saharan Africa", SAS: "South Asia", MEA: "MENA",
      LCN: "LAC", EAS: "East Asia & Pacific", ECS: "Europe & CA", NAC: "N. America",
    };
    // scene focus
    let keys = ORDER.filter((k) => rows.some((r) => r.iso3c === k));
    if (sceneIndex === 0) keys = keys.filter((k) => k === "WLD");
    else if (sceneIndex === 1) keys = keys.filter((k) => k !== "SSF" && k !== "SAS");
    else if (sceneIndex === 2) keys = ["WLD", "SSF", "SAS"].filter((k) => keys.includes(k));
    else if (sceneIndex >= 3 && sceneIndex <= 4) keys = ["WLD", "SSF"].filter((k) => keys.includes(k));
    // else all

    const by = new Map();
    rows.forEach((r) => {
      const y = +(r.date || r.year), v = +r.value;
      if (!Number.isFinite(y) || !Number.isFinite(v)) return;
      if (!by.has(r.iso3c)) by.set(r.iso3c, []);
      by.get(r.iso3c).push({ year: y, v });
    });
    by.forEach((p) => p.sort((a, b) => a.year - b.year));

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText = "position:relative;width:100%;height:100%;font-family:Open Sans,system-ui,sans-serif";
    chartEl.appendChild(root);
    const w = root.clientWidth || 900, h = root.clientHeight || 440;
    const margin = { top: 24, right: 150, bottom: 40, left: 48 };
    const svg = AtlasSVG.el(root, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.cssText = "width:100%;height:100%";
    const all = keys.flatMap((k) => by.get(k) || []);
    const years = all.map((d) => d.year);
    const xScale = AtlasSVG.scaleLinear([Math.min(...years), Math.max(...years)], [margin.left, w - margin.right]);
    const yScale = AtlasSVG.scaleLinear([0, Math.max(...all.map((d) => d.v), 1) * 1.1], [h - margin.bottom, margin.top]);
    [0, 10, 20, 30, 40].forEach((t) => {
      if (t > yScale.domain[1]) return;
      AtlasSVG.el(svg, "line", { x1: margin.left, x2: w - margin.right, y1: yScale(t), y2: yScale(t), stroke: "#f1f5f9" });
      AtlasSVG.el(svg, "text", { x: margin.left - 8, y: yScale(t) + 4, "text-anchor": "end", fill: "#6a7781", "font-size": 11 }).textContent = t + "%";
    });
    const ymin = Math.min(...years), ymax = Math.max(...years);
    [ymin, Math.round((ymin + ymax) / 2), ymax].forEach((yr) => {
      AtlasSVG.el(svg, "text", { x: xScale(yr), y: h - margin.bottom + 20, "text-anchor": "middle", fill: "#6a7781", "font-size": 12, "font-weight": "600" }).textContent = String(yr);
    });
    keys.forEach((k) => {
      const pts = by.get(k);
      if (!pts || pts.length < 2) return;
      const col = COLORS[k] || "#57626a";
      AtlasSVG.el(svg, "path", {
        d: pts.map((p, i) => `${i ? "L" : "M"}${xScale(p.year)},${yScale(p.v)}`).join(" "),
        fill: "none", stroke: col, "stroke-width": k === "WLD" ? 3 : 2.3, "stroke-linecap": "round",
      });
      const last = pts.at(-1);
      AtlasSVG.el(svg, "circle", { cx: xScale(last.year), cy: yScale(last.v), r: 3.5, fill: col });
      AtlasSVG.el(svg, "text", {
        x: xScale(last.year) + 8, y: yScale(last.v) + 4, fill: col, "font-size": 12, "font-weight": "700",
      }).textContent = `${LABELS[k] || k} ${last.v}%`;
    });
  },
};
