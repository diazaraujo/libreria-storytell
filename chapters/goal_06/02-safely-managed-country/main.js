/**
 * safely_managed_country — 2024 country dots sorted / beeswarm on value
 */
window.AtlasReplica = {
  ready: true, isStub: false,
  async render(scene, ctx) {
    const { chartEl, hidePlaceholder, sceneIndex, colors } = ctx;
    hidePlaceholder();
    const rows = await AtlasLoad.csv("./data/Country_SafelyManaged_2024.csv");
    let data = rows.map((r) => ({
      iso3c: r.iso3,
      name: r.country_name,
      value: +r.value,
      income: (window.ATLAS_INCOME && window.ATLAS_INCOME[r.iso3]) || "UMC",
    })).filter((d) => Number.isFinite(d.value));

    // scene highlights
    if (sceneIndex === 1) {
      // universal 99%
      data = data.map((d) => ({ ...d, hi: d.value >= 99 }));
    } else if (sceneIndex === 2) {
      // SSA focus - approximate by LIC+LMC Africa hard without region; use income LIC heavy
      data = data.map((d) => ({ ...d, hi: d.value < 50 }));
    } else {
      data = data.map((d) => ({ ...d, hi: true }));
    }

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.innerHTML = `<div class="plot"></div><div class="footer-leg">Each dot = economy · 2024 safely managed drinking water (%)</div>`;
    chartEl.appendChild(root);
    const plot = root.querySelector(".plot");
    AtlasBeeswarmChart.mount(plot, {
      data,
      value: (d) => d.value,
      domain: [0, 100],
      radius: 3.2,
      width: plot.clientWidth,
      height: plot.clientHeight,
      color: (d) => {
        if (sceneIndex >= 1 && !d.hi) return "#ced4de";
        return (colors && colors[d.income]) || "#0080c6";
      },
      opacity: (d) => (sceneIndex >= 1 && !d.hi ? 0.25 : 1),
      title: (d) => `${d.name}: ${d.value.toFixed(1)}%`,
    });
  },
};
