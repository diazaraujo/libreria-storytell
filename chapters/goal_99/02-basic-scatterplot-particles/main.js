/** basic_scatterplot_particles — scatter of indicator values (CSV stand-in) */
window.AtlasReplica = {
  ready: true,
  isStub: false,
  async render(scene, ctx) {
    const { chartEl, hidePlaceholder, sceneIndex } = ctx;
    hidePlaceholder();
    const files = await (await fetch("./data/index.json")).json();
    const csv = files.find((f) => f.endsWith(".csv")) || files[0];
    const rows = await AtlasLoad.csv("./data/" + csv);
    // pick year + value or index + value
    const data = rows
      .map((r, i) => ({
        x: Number(r.Year || r.year || r.gdp || r.x) || i,
        y: Number(r.value || r.Value || r.y),
        label: r.Country || r.iso3c || r.code || String(i),
        region: r.region_iso3c || r.Region || "WLD",
      }))
      .filter((d) => Number.isFinite(d.y));

    chartEl.innerHTML = "";
    const plot = document.createElement("div");
    plot.style.cssText = "position:absolute;inset:8px";
    chartEl.appendChild(plot);

    // scene: show progressive sample
    let shown = data;
    if (sceneIndex > 0) {
      const n = Math.max(20, Math.floor(((sceneIndex + 1) / 4) * data.length));
      shown = data.slice(0, n);
    }

    AtlasScatter.mount(plot, {
      data: shown,
      x: (d) => d.x,
      y: (d) => d.y,
      width: plot.clientWidth,
      height: plot.clientHeight,
      yDomain: [0, Math.max(...shown.map((d) => d.y), 1) * 1.1],
      color: (d) => (window.WB_COLORS && WB_COLORS[d.region]) || "#0071bc",
      title: (d) => `${d.label}: ${d.y}`,
    });
  },
};
