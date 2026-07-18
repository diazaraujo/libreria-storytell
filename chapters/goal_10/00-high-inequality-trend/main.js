/** high_inequality_trend */
window.AtlasReplica = {
  ready: true,
  isStub: false,
  async render(scene, ctx) {
    const { chartEl, hidePlaceholder, sceneIndex } = ctx;
    hidePlaceholder();
    const rows = await AtlasLoad.csv("./data/10_data_high_inequality_trend.csv");
    let data = rows.map((r) => ({
      x: +r.year,
      y: +r.country_count,
      series: r.ineq_type || "high",
    })).filter((d) => Number.isFinite(d.x) && Number.isFinite(d.y));

    if (sceneIndex > 0 && data.length > 4) {
      const years = [...new Set(data.map((d) => d.x))].sort((a, b) => a - b);
      const cut = years[Math.min(years.length - 1, Math.ceil(((sceneIndex + 1) / 4) * years.length) - 1)];
      data = data.filter((d) => d.x <= cut);
    }

    chartEl.innerHTML = "";
    const plot = document.createElement("div");
    plot.style.cssText = "position:absolute;inset:8px";
    chartEl.appendChild(plot);
    AtlasLineChart.mount(plot, {
      data,
      x: (d) => d.x,
      y: (d) => d.y,
      series: (d) => d.series,
      width: plot.clientWidth,
      height: plot.clientHeight,
      yDomain: [0, Math.max(...data.map((d) => d.y)) * 1.1],
      xTicks: [...new Set(data.map((d) => d.x))].filter((_, i, a) => i % Math.ceil(a.length / 6) === 0),
      colors: { high: "#AA0000", default: "#0071bc" },
      strokeWidth: 3,
    });
  },
};
