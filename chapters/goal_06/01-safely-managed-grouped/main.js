/**
 * safely_managed_grouped — urban vs rural safely managed by region
 */
window.AtlasReplica = {
  ready: true, isStub: false,
  async render(scene, ctx) {
    const { chartEl, hidePlaceholder, sceneIndex, colors } = ctx;
    hidePlaceholder();
    const rows = await AtlasLoad.csv("./data/region_urban_rural.csv");
    const REG = { EAS: "East Asia", ECS: "Europe & CA", LCN: "LAC", MEA: "MENA", NAC: "N. America", SAS: "South Asia", SSF: "SSA" };
    let data = rows
      .filter((r) => r.level === "safely_managed" && r.value !== "" && r.location !== "total")
      .map((r) => ({
        x: +r.year,
        y: +r.value,
        series: `${r.region}-${r.location}`,
        region: r.region,
        location: r.location,
      }))
      .filter((d) => Number.isFinite(d.x) && Number.isFinite(d.y));

    // scene filters
    const id = scene?.id || "";
    if (sceneIndex === 0) data = data.filter((d) => d.location === "urban" && d.x >= 2015);
    else if (sceneIndex === 1) data = data.filter((d) => d.x >= 2015);
    else if (sceneIndex === 2) data = data.filter((d) => ["SAS", "SSF"].includes(d.region) && d.x >= 2015);
    else data = data.filter((d) => d.x >= 2000);

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.innerHTML = `<div class="plot"></div><div class="footer-leg">
      <span><i style="background:#6D88D1"></i>Urban</span>
      <span><i style="background:#54AE89"></i>Rural</span>
    </div>`;
    chartEl.appendChild(root);
    const plot = root.querySelector(".plot");
    const series = [...new Set(data.map((d) => d.series))];
    const colmap = {};
    series.forEach((s) => {
      colmap[s] = s.endsWith("urban") ? "#6D88D1" : "#54AE89";
    });
    AtlasLineChart.mount(plot, {
      data,
      x: (d) => d.x,
      y: (d) => d.y,
      series: (d) => d.series,
      width: plot.clientWidth,
      height: plot.clientHeight,
      yDomain: [0, 100],
      xTicks: [2000, 2005, 2010, 2015, 2020, 2024],
      colors: colmap,
      strokeWidth: 2,
    });
  },
};
