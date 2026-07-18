/**
 * internet_access_scroller — world → income groups → regions (CJtYBxvU.js)
 */
window.AtlasReplica = {
  ready: true, isStub: false,
  async render(scene, ctx) {
    const { chartEl, hidePlaceholder, sceneIndex } = ctx;
    hidePlaceholder();
    const rows = await AtlasLoad.csv("./data/09_data_internet_access.csv");
    const INC = { LIC: "#3B4DA6", LMC: "#DB95D7", UMC: "#73AF48", HIC: "#016B6C" };
    const REG = {
      WLD: "#081079", EAS: "#F3578E", ECS: "#AA0000", LCN: "#0C7C68",
      MEA: "#664AB6", NAC: "#34A7F2", SAS: "#4EC2C0", SSF: "#FF9800",
    };
    const LABELS = {
      WLD: "World", LIC: "Low income", LMC: "Lower middle", UMC: "Upper middle", HIC: "High income",
      EAS: "East Asia & Pacific", ECS: "Europe & CA", LCN: "LAC", MEA: "MENA",
      NAC: "N. America", SAS: "South Asia", SSF: "Sub-Saharan Africa",
    };

    let keys;
    if (sceneIndex === 0) keys = ["WLD"];
    else if (sceneIndex === 1) keys = ["LIC", "LMC", "UMC", "HIC"];
    else keys = ["WLD", "EAS", "ECS", "LCN", "MEA", "NAC", "SAS", "SSF"];

    const by = new Map();
    rows.forEach((r) => {
      const y = +r.year, v = +r.value;
      if (!Number.isFinite(y) || !Number.isFinite(v)) return;
      if (!by.has(r.iso3c)) by.set(r.iso3c, []);
      by.get(r.iso3c).push({ year: y, v });
    });
    by.forEach((p) => p.sort((a, b) => a.year - b.year));

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText = "position:relative;width:100%;height:100%;font-family:'Open Sans',system-ui,sans-serif";
    chartEl.appendChild(root);
    const w = root.clientWidth || 900, h = root.clientHeight || 440;
    const margin = { top: 24, right: 140, bottom: 40, left: 48 };
    const svg = AtlasSVG.el(root, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.cssText = "width:100%;height:100%;display:block";
    const xScale = AtlasSVG.scaleLinear([2005, 2025], [margin.left, w - margin.right]);
    const yScale = AtlasSVG.scaleLinear([0, 100], [h - margin.bottom, margin.top]);

    [0, 25, 50, 75, 100].forEach((t) => {
      AtlasSVG.el(svg, "line", { x1: margin.left, x2: w - margin.right, y1: yScale(t), y2: yScale(t), stroke: "#f1f5f9" });
      AtlasSVG.el(svg, "text", { x: margin.left - 8, y: yScale(t) + 4, "text-anchor": "end", fill: "#6a7781", "font-size": 11 }).textContent = t + "%";
    });
    [2005, 2010, 2015, 2020, 2025].forEach((yr) => {
      AtlasSVG.el(svg, "text", { x: xScale(yr), y: h - margin.bottom + 20, "text-anchor": "middle", fill: "#6a7781", "font-size": 12, "font-weight": "600" }).textContent = String(yr);
    });

    keys.forEach((k) => {
      const pts = by.get(k);
      if (!pts || pts.length < 2) return;
      const col = INC[k] || REG[k] || "#57626a";
      AtlasSVG.el(svg, "path", {
        d: pts.map((p, i) => `${i ? "L" : "M"}${xScale(p.year)},${yScale(p.v)}`).join(" "),
        fill: "none", stroke: col, "stroke-width": k === "WLD" ? 3 : 2.4, "stroke-linecap": "round",
      });
      const last = pts.at(-1);
      AtlasSVG.el(svg, "circle", { cx: xScale(last.year), cy: yScale(last.v), r: 3.5, fill: col });
      AtlasSVG.el(svg, "text", {
        x: xScale(last.year) + 8, y: yScale(last.v) + 4,
        fill: col, "font-size": 12, "font-weight": "700",
      }).textContent = `${LABELS[k] || k} ${last.v.toFixed(1)}%`;
    });
  },
};
