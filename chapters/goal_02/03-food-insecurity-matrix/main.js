/**
 * food_insecurity_matrix — heatmap country × driver
 */
window.AtlasReplica = {
  ready: true, isStub: false,
  async render(_s, ctx) {
    const { chartEl, hidePlaceholder } = ctx;
    hidePlaceholder();
    const rows = await AtlasLoad.csv("./data/02_hunger_hotspots.csv");
    const NAMES = window.ATLAS_COUNTRY_NAMES || {};
    const drivers = ["conflict_security", "displacement", "dry_conditions", "economic_shock", "flood", "social_instability", "tropical_cyclone"];
    const labels = ["Conflict", "Displace.", "Dry", "Economic", "Flood", "Social", "Cyclone"];
    const periods = [...new Set(rows.map((r) => r.period))];
    const latest = periods[periods.length - 1];
    const data = rows.filter((r) => r.period === latest)
      .map((r) => ({
        iso: r.iso3c, name: NAMES[r.iso3c] || r.iso3c,
        vals: drivers.map((d) => +r[d] || 0),
        n: +r.driver_number || 0,
      }))
      .sort((a, b) => b.n - a.n)
      .slice(0, 40);

    chartEl.innerHTML = "";
    // ensure scaffold placeholder gone (QA PLACEHOLDER_VISIBLE)
    const ph = document.getElementById("placeholder");
    if (ph) ph.hidden = true;
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText = "position:relative;width:100%;height:100%;font-family:Open Sans,system-ui,sans-serif";
    chartEl.appendChild(root);
    const w = root.clientWidth || 900, h = root.clientHeight || 480;
    const margin = { top: 48, right: 16, bottom: 16, left: 110 };
    const svg = AtlasSVG.el(root, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.cssText = "width:100%;height:100%";
    const cellW = (w - margin.left - margin.right) / drivers.length;
    const cellH = (h - margin.top - margin.bottom) / data.length;
    labels.forEach((lab, i) => {
      AtlasSVG.el(svg, "text", {
        x: margin.left + i * cellW + cellW / 2, y: 28, "text-anchor": "middle",
        fill: "#111", "font-size": 11, "font-weight": "700",
      }).textContent = lab;
    });
    data.forEach((d, ri) => {
      AtlasSVG.el(svg, "text", {
        x: margin.left - 8, y: margin.top + ri * cellH + cellH * 0.65,
        "text-anchor": "end", fill: "#111", "font-size": 10, "font-weight": "600",
      }).textContent = d.name.slice(0, 16);
      d.vals.forEach((v, ci) => {
        AtlasSVG.el(svg, "rect", {
          x: margin.left + ci * cellW + 1, y: margin.top + ri * cellH + 1,
          width: cellW - 2, height: cellH - 2, rx: 2,
          fill: v ? "#081079" : "#f1f5f9",
        });
      });
    });
  },
};
