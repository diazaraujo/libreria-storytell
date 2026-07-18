/**
 * arable_land_degradation — geo scatter of degradation drivers (lat/lon)
 */
window.AtlasReplica = {
  ready: true, isStub: false,
  async render(scene, ctx) {
    const { chartEl, hidePlaceholder, sceneIndex } = ctx;
    hidePlaceholder();
    const ph = document.getElementById("placeholder");
    if (ph) { ph.hidden = true; ph.style.display = "none"; }
    const rows = await AtlasLoad.csv("./data/15_data_arable_land_degradation.csv");
    const drivers = ["erosion", "carbon", "salinization", "arable"];
    const colors = { erosion: "#AA0000", carbon: "#664AB6", salinization: "#34A7F2", arable: "#0C7C68" };
    const focus = drivers[Math.min(sceneIndex || 0, drivers.length - 1)];

    // sample for perf
    const step = Math.max(1, Math.floor(rows.length / 1200));
    const pts = [];
    for (let i = 0; i < rows.length; i += step) {
      const r = rows[i];
      const lon = +r.lon, lat = +r.lat, v = +r[focus];
      if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue;
      if (r[focus] === "" || !Number.isFinite(v)) continue;
      pts.push({ lon, lat, v });
    }

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText = "position:relative;width:100%;height:100%;font-family:Open Sans,system-ui,sans-serif;background:#0b1220";
    chartEl.appendChild(root);
    const w = root.clientWidth || 900, h = root.clientHeight || 480;
    const margin = { top: 28, right: 16, bottom: 28, left: 16 };
    const svg = AtlasSVG.el(root, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.cssText = "width:100%;height:100%";
    const lons = pts.map((p) => p.lon), lats = pts.map((p) => p.lat);
    if (!pts.length) {
      AtlasSVG.el(svg, "text", { x: w / 2, y: h / 2, "text-anchor": "middle", fill: "#94a3b8" }).textContent = "No points";
      return;
    }
    const xScale = AtlasSVG.scaleLinear([Math.min(...lons), Math.max(...lons)], [margin.left, w - margin.right]);
    const yScale = AtlasSVG.scaleLinear([Math.min(...lats), Math.max(...lats)], [h - margin.bottom, margin.top]);
    const col = colors[focus] || "#f7b841";
    pts.forEach((p) => {
      AtlasSVG.el(svg, "circle", {
        cx: xScale(p.lon), cy: yScale(p.lat), r: 2.2,
        fill: col, opacity: 0.55,
      });
    });
    AtlasSVG.el(svg, "text", {
      x: margin.left, y: 18, fill: "#e2e8f0", "font-size": 13, "font-weight": "700",
    }).textContent = `Arable land degradation · ${focus} · ${pts.length} cells`;
  },
};
