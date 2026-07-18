/**
 * prevalence_undernourishment_gridmap — SVG country tile grid
 */
window.AtlasReplica = {
  ready: true, isStub: false,
  async render(scene, ctx) {
    const { chartEl, hidePlaceholder, sceneIndex } = ctx;
    hidePlaceholder();
    const rows = await AtlasLoad.csv("./data/02_data_prevalence_undernourishment_countries.csv");
    const NAMES = window.ATLAS_COUNTRY_NAMES || {};
    const by = new Map();
    rows.forEach((r) => {
      const y = +(r.date || r.year), v = +r.value;
      if (!Number.isFinite(v)) return;
      const prev = by.get(r.iso3c);
      if (!prev || y > prev.year) by.set(r.iso3c, { year: y, v, iso: r.iso3c });
    });
    let data = [...by.values()].sort((a, b) => b.v - a.v);
    if (sceneIndex === 0) data = data.slice(0, 48);
    else if (sceneIndex === 1) data = data.filter((d) => d.v >= 20);
    else if (sceneIndex === 2) data = data.filter((d) => d.v >= 10);

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText = "position:relative;width:100%;height:100%;font-family:Open Sans,system-ui,sans-serif";
    chartEl.appendChild(root);
    const w = root.clientWidth || 900, h = root.clientHeight || 480;
    const svg = AtlasSVG.el(root, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.cssText = "width:100%;height:100%";
    const cols = Math.ceil(Math.sqrt(data.length * (w / h)));
    const rowsN = Math.ceil(data.length / cols);
    const pad = 8;
    const cellW = (w - pad * 2) / cols;
    const cellH = (h - pad * 2 - 20) / rowsN;
    const max = Math.max(...data.map((d) => d.v), 1);
    AtlasSVG.el(svg, "text", {
      x: pad, y: 14, fill: "#57626a", "font-size": 12, "font-weight": "600",
    }).textContent = `Undernourishment % · ${data.length} countries`;
    data.forEach((d, i) => {
      const c = i % cols, r = Math.floor(i / cols);
      const x = pad + c * cellW + 2, y = 22 + r * cellH + 2;
      const t = d.v / max;
      const bg = t > 0.7 ? "#AA0000" : t > 0.4 ? "#f7b841" : t > 0.2 ? "#ffdd92" : "#0C7C68";
      AtlasSVG.el(svg, "rect", {
        x, y, width: cellW - 4, height: cellH - 4, rx: 4, fill: bg,
      });
      AtlasSVG.el(svg, "text", {
        x: x + (cellW - 4) / 2, y: y + (cellH - 4) / 2 - 4,
        "text-anchor": "middle", fill: t > 0.2 ? "#fff" : "#111", "font-size": 9, "font-weight": "700",
      }).textContent = d.iso;
      AtlasSVG.el(svg, "text", {
        x: x + (cellW - 4) / 2, y: y + (cellH - 4) / 2 + 10,
        "text-anchor": "middle", fill: t > 0.2 ? "#fff" : "#111", "font-size": 11, "font-weight": "800",
      }).textContent = d.v.toFixed(0) + "%";
    });
  },
};
