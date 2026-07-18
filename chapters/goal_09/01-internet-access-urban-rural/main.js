/** internet_access_urban_rural — income groups urban vs rural dual lines 2022–2025 */
window.AtlasReplica = {
  ready: true, isStub: false,
  async render(_s, ctx) {
    const { chartEl, hidePlaceholder } = ctx;
    hidePlaceholder();
    const rows = await AtlasLoad.csv("./data/09_data_internet_access_urban_rural.csv");
    const ORDER = ["WLD", "LIC", "LMC", "UMC", "HIC"];
    const LABELS = { WLD: "World", LIC: "Low income", LMC: "Lower middle", UMC: "Upper middle", HIC: "High income" };
    const COLORS = { WLD: "#081079", LIC: "#3B4DA6", LMC: "#DB95D7", UMC: "#73AF48", HIC: "#016B6C" };
    const URBAN = "#6D88D1", RURAL = "#54AE89";

    const by = new Map();
    rows.forEach((r) => {
      const y = +r.year, v = +r.value;
      if (!Number.isFinite(y) || !Number.isFinite(v)) return;
      if (!by.has(r.iso3c)) by.set(r.iso3c, []);
      by.get(r.iso3c).push({ year: y, area: r.area, v });
    });

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText = "position:relative;width:100%;height:100%;font-family:'Open Sans',system-ui,sans-serif";
    chartEl.appendChild(root);
    const w = root.clientWidth || 900, h = root.clientHeight || 420;
    const margin = { top: 36, right: 16, bottom: 36, left: 40 };
    const gap = 20;
    const cols = 5;
    const cellW = (w - margin.left - margin.right - (cols - 1) * gap) / cols;
    const cellH = h - margin.top - margin.bottom;
    const svg = AtlasSVG.el(root, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.cssText = "width:100%;height:100%";

    ORDER.forEach((key, i) => {
      const ox = margin.left + i * (cellW + gap), oy = margin.top;
      const pts = by.get(key) || [];
      const urban = pts.filter((p) => p.area === "urban").sort((a, b) => a.year - b.year);
      const rural = pts.filter((p) => p.area === "rural").sort((a, b) => a.year - b.year);
      const xScale = AtlasSVG.scaleLinear([2022, 2025], [0, cellW]);
      const yScale = AtlasSVG.scaleLinear([0, 100], [cellH, 8]);
      const g = AtlasSVG.el(svg, "g", { transform: `translate(${ox},${oy})` });
      [0, 50, 100].forEach((t) => {
        AtlasSVG.el(g, "line", { x1: 0, x2: cellW, y1: yScale(t), y2: yScale(t), stroke: "#f1f5f9" });
        if (i === 0) AtlasSVG.el(g, "text", { x: -6, y: yScale(t) + 3, "text-anchor": "end", fill: "#6a7781", "font-size": 10 }).textContent = String(t);
      });
      if (urban.length > 1) {
        AtlasSVG.el(g, "path", {
          d: urban.map((p, j) => `${j ? "L" : "M"}${xScale(p.year)},${yScale(p.v)}`).join(" "),
          fill: "none", stroke: URBAN, "stroke-width": 2.5,
        });
      }
      if (rural.length > 1) {
        AtlasSVG.el(g, "path", {
          d: rural.map((p, j) => `${j ? "L" : "M"}${xScale(p.year)},${yScale(p.v)}`).join(" "),
          fill: "none", stroke: RURAL, "stroke-width": 2.5,
        });
      }
      [[urban.at(-1), URBAN], [rural.at(-1), RURAL]].forEach(([p, c]) => {
        if (!p) return;
        AtlasSVG.el(g, "circle", { cx: xScale(p.year), cy: yScale(p.v), r: 4, fill: c, stroke: "#fff", "stroke-width": 1.5 });
        AtlasSVG.el(g, "text", { x: xScale(p.year) - 4, y: yScale(p.v) - 8, "text-anchor": "end", fill: c, "font-size": 11, "font-weight": "700" }).textContent = Math.round(p.v) + "%";
      });
      AtlasSVG.el(g, "text", {
        x: cellW / 2, y: -12, "text-anchor": "middle", fill: COLORS[key], "font-size": 12, "font-weight": "700",
      }).textContent = LABELS[key];
    });
    const foot = document.createElement("div");
    foot.style.cssText = "position:absolute;bottom:4px;left:40px;display:flex;gap:14px;font-size:12px";
    foot.innerHTML = `<span><i style="width:14px;height:3px;background:${URBAN};display:inline-block;margin-right:4px"></i>Urban</span>
      <span><i style="width:14px;height:3px;background:${RURAL};display:inline-block;margin-right:4px"></i>Rural</span>`;
    root.appendChild(foot);
  },
};
