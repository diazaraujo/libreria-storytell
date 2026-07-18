/**
 * wage_scroller — scatter (Tier B)
 */
window.AtlasReplica = {
  ready: true, isStub: false,
  async render(scene, ctx) {
    const { chartEl, hidePlaceholder, sceneIndex, config } = ctx;
    hidePlaceholder();
    const rows = await AtlasLoad.csv("./data/04_data_wage_scroller.csv");
    const NAMES = window.ATLAS_COUNTRY_NAMES || {};
    const headers = rows[0] ? Object.keys(rows[0]) : [];
    const isoKey = headers.find(h => /iso3c|code|country/i.test(h));
    const nums = headers.filter(h => h !== isoKey && rows.slice(0, 30).some(r => Number.isFinite(+r[h])));
    const xKey = nums[0], yKey = nums[1] || nums[0];
    const data = rows.map(r => ({
      iso: isoKey ? r[isoKey] : "",
      x: +r[xKey], y: +r[yKey]
    })).filter(d => Number.isFinite(d.x) && Number.isFinite(d.y));

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText = "position:relative;width:100%;height:100%;font-family:Open Sans,system-ui,sans-serif";
    chartEl.appendChild(root);
    const w = root.clientWidth || 900, h = root.clientHeight || 440;
    const margin = { top: 24, right: 24, bottom: 48, left: 56 };
    const svg = AtlasSVG.el(root, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.cssText = "width:100%;height:100%";
    const xs = data.map(d => d.x), ys = data.map(d => d.y);
    const xScale = AtlasSVG.scaleLinear([Math.min(...xs), Math.max(...xs)], [margin.left, w - margin.right]);
    const yScale = AtlasSVG.scaleLinear([Math.min(0, ...ys), Math.max(...ys)], [h - margin.bottom, margin.top]);
    for (let i = 0; i <= 4; i++) {
      const t = Math.min(...xs) + (Math.max(...xs) - Math.min(...xs)) * i / 4;
      AtlasSVG.el(svg, "line", { x1: xScale(t), x2: xScale(t), y1: margin.top, y2: h - margin.bottom, stroke: "#f1f5f9" });
    }
    for (let i = 0; i <= 4; i++) {
      const lo = Math.min(0, ...ys), hi = Math.max(...ys);
      const t = lo + (hi - lo) * i / 4;
      AtlasSVG.el(svg, "line", { x1: margin.left, x2: w - margin.right, y1: yScale(t), y2: yScale(t), stroke: "#f1f5f9" });
      AtlasSVG.el(svg, "text", { x: margin.left - 8, y: yScale(t) + 4, "text-anchor": "end", fill: "#6a7781", "font-size": 11 }).textContent = Math.round(t * 10) / 10;
    }
    AtlasSVG.el(svg, "text", { x: (margin.left + w - margin.right) / 2, y: h - 12, "text-anchor": "middle", fill: "#111", "font-size": 12, "font-weight": "600" }).textContent = xKey;
    AtlasSVG.el(svg, "text", { x: 14, y: h / 2, "text-anchor": "middle", fill: "#111", "font-size": 12, "font-weight": "600", transform: `rotate(-90 14 ${h / 2})` }).textContent = yKey;
    data.forEach((d, i) => {
      const hi = sceneIndex > 0 ? i % 12 === 0 : i % 20 === 0;
      AtlasSVG.el(svg, "circle", {
        cx: xScale(d.x), cy: yScale(d.y), r: hi ? 5 : 3.5,
        fill: "#0071bc", opacity: hi ? 0.95 : 0.55, stroke: "#fff", "stroke-width": 1
      });
      if (hi && d.iso) {
        AtlasSVG.el(svg, "text", {
          x: xScale(d.x) + 6, y: yScale(d.y) + 3, fill: "#334155", "font-size": 10, "font-weight": "600"
        }).textContent = NAMES[d.iso] || d.iso;
      }
    });
  },
};
