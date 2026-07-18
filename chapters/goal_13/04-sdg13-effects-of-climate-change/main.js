/**
 * sdg13_effects_of_climate_change — multi-hazard exposure bars / ranked
 */
window.AtlasReplica = {
  ready: true, isStub: false,
  async render(scene, ctx) {
    const { chartEl, hidePlaceholder, sceneIndex } = ctx;
    hidePlaceholder();
    const ph = document.getElementById("placeholder");
    if (ph) { ph.hidden = true; ph.style.display = "none"; }
    const rows = await AtlasLoad.csv("./data/20260130_hazard_data_prepared.csv");
    const NAMES = window.ATLAS_COUNTRY_NAMES || {};
    const fields = ["sha_cyclone", "sha_drought", "sha_flood", "sha_heatwave", "sha_all"];
    const titles = ["Cyclone", "Drought", "Flood", "Heatwave", "All hazards"];
    const field = fields[Math.min(sceneIndex || 0, fields.length - 1)];
    const title = titles[Math.min(sceneIndex || 0, titles.length - 1)];
    let data = rows.map((r) => ({
      iso: r.code, name: NAMES[r.code] || r.code, v: +r[field],
    })).filter((d) => Number.isFinite(d.v)).sort((a, b) => b.v - a.v).slice(0, 50);

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText = "position:relative;width:100%;height:100%;font-family:Open Sans,system-ui,sans-serif";
    chartEl.appendChild(root);
    const w = root.clientWidth || 900;
    const h = Math.max(root.clientHeight || 480, 40 + data.length * 10);
    const margin = { top: 28, right: 48, bottom: 20, left: 120 };
    const svg = AtlasSVG.el(root, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.cssText = "width:100%;height:100%";
    const xScale = AtlasSVG.scaleLinear([0, 100], [margin.left, w - margin.right]);
    const yScale = AtlasSVG.scaleBand(data.map((d) => d.iso), [margin.top, h - margin.bottom], 0.12);
    AtlasSVG.el(svg, "text", {
      x: margin.left, y: 16, fill: "#111", "font-size": 13, "font-weight": "700",
    }).textContent = `Share of population exposed · ${title}`;
    data.forEach((d) => {
      const y = yScale(d.iso), bh = yScale.bandwidth();
      const col = d.v > 75 ? "#AA0000" : d.v > 40 ? "#f7b841" : "#0C7C68";
      AtlasSVG.el(svg, "rect", {
        x: margin.left, y, width: Math.max(xScale(d.v) - margin.left, 1), height: bh,
        fill: col, rx: 2,
      });
      AtlasSVG.el(svg, "text", {
        x: margin.left - 6, y: y + bh / 2, "text-anchor": "end", "dominant-baseline": "middle",
        fill: "#111", "font-size": 10, "font-weight": "600",
      }).textContent = d.name.slice(0, 16);
      AtlasSVG.el(svg, "text", {
        x: xScale(d.v) + 4, y: y + bh / 2, "dominant-baseline": "middle",
        fill: col, "font-size": 10, "font-weight": "700",
      }).textContent = d.v.toFixed(0) + "%";
    });
  },
};
