/**
 * affordability_barrier — ranked bars (Tier B)
 */
window.AtlasReplica = {
  ready: true, isStub: false,
  async render(scene, ctx) {
    const { chartEl, hidePlaceholder, sceneIndex, config } = ctx;
    hidePlaceholder();
    const rows = await AtlasLoad.csv("./data/affordability_incgroup.csv");
    const NAMES = window.ATLAS_COUNTRY_NAMES || {};
    const headers = rows[0] ? Object.keys(rows[0]) : [];
    const catKey = headers.find(h => /iso3c|country|name|region|label|group|code/i.test(h)) || headers[0];
    const valKey = headers.find(h => h !== catKey && rows.some(r => Number.isFinite(+r[h]))) || headers[1];
    let data = rows.map(r => ({
      cat: NAMES[r[catKey]] || r[catKey],
      raw: r[catKey],
      v: +r[valKey]
    })).filter(d => Number.isFinite(d.v) && d.cat);
    data.sort((a, b) => a.v - b.v);
    // scene: show bottom/top slices
    if (sceneIndex === 0 && data.length > 40) data = data.slice(0, 30);
    else if (sceneIndex >= 1 && data.length > 40) data = data.slice(-30);

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText = "position:relative;width:100%;height:100%;font-family:Open Sans,system-ui,sans-serif";
    chartEl.appendChild(root);
    const w = root.clientWidth || 900;
    const h = Math.max(root.clientHeight || 440, 40 + data.length * 14);
    const margin = { top: 20, right: 56, bottom: 20, left: 140 };
    const svg = AtlasSVG.el(root, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.cssText = "width:100%;height:100%";
    const max = Math.max(...data.map(d => d.v), 1);
    const xScale = AtlasSVG.scaleLinear([0, max], [margin.left, w - margin.right]);
    const yScale = AtlasSVG.scaleBand(data.map(d => d.raw), [margin.top, h - margin.bottom], 0.15);
    const col = (window.WB_COLORS && window.WB_COLORS.wbBlue) || "#0071bc";
    data.forEach(d => {
      const y = yScale(d.raw), bh = yScale.bandwidth();
      AtlasSVG.el(svg, "rect", {
        x: margin.left, y, width: Math.max(xScale(d.v) - margin.left, 1), height: bh,
        fill: col, rx: 2, opacity: 0.9
      });
      AtlasSVG.el(svg, "text", {
        x: margin.left - 8, y: y + bh / 2, "text-anchor": "end", "dominant-baseline": "middle",
        fill: "#111", "font-size": 11, "font-weight": "600"
      }).textContent = String(d.cat).slice(0, 28);
      AtlasSVG.el(svg, "text", {
        x: xScale(d.v) + 4, y: y + bh / 2, "dominant-baseline": "middle",
        fill: col, "font-size": 11, "font-weight": "700"
      }).textContent = (Math.abs(d.v) >= 10 ? d.v.toFixed(1) : d.v.toFixed(2));
    });
  },
};
