/** urban_rural_pop_scroller */
window.AtlasReplica = {
  ready: true,
  isStub: false,
  async render(scene, ctx) {
    const { chartEl, hidePlaceholder, sceneIndex } = ctx;
    hidePlaceholder();
    const rows = await AtlasLoad.csv("./data/11_data_urban_rural_pop.csv");
    // aggregate world by group+year if many iso3c are regions
    let data = rows.map((r) => ({
      x: +r.year,
      y: +r.value,
      series: `${r.iso3c}-${r.group}`,
      group: r.group,
      iso: r.iso3c,
    })).filter((d) => Number.isFinite(d.x) && Number.isFinite(d.y));

    // keep at most 8 series: prefer urban/rural for WLD or top regions
    const keys = [...new Set(data.map((d) => d.series))];
    let keep = keys.filter((k) => /WLD|urban|rural/i.test(k));
    if (keep.length < 2) keep = keys.slice(0, 8);
    else keep = keep.slice(0, 8);
    data = data.filter((d) => keep.includes(d.series));

    if (sceneIndex > 0) {
      const years = [...new Set(data.map((d) => d.x))].sort((a, b) => a - b);
      const cut = years[Math.min(years.length - 1, Math.floor(((sceneIndex + 1) / 5) * years.length))];
      data = data.filter((d) => d.x <= cut);
    }

    chartEl.innerHTML = "";
    const plot = document.createElement("div");
    plot.style.cssText = "position:absolute;inset:8px";
    chartEl.appendChild(plot);
    const series = [...new Set(data.map((d) => d.series))];
    const palette = ["#6D88D1","#54AE89","#0071bc","#FF9800","#F3578E","#664AB6","#016B6C","#3B4DA6"];
    const colors = { default: palette[0] };
    series.forEach((s, i) => (colors[s] = palette[i % palette.length]));
    AtlasLineChart.mount(plot, {
      data,
      x: (d) => d.x,
      y: (d) => d.y,
      series: (d) => d.series,
      width: plot.clientWidth,
      height: plot.clientHeight,
      yDomain: [0, Math.max(...data.map((d) => d.y), 1) * 1.05],
      xTicks: [...new Set(data.map((d) => d.x))].filter((_, i, a) => i % Math.ceil(a.length / 6) === 0),
      colors,
      strokeWidth: 2.5,
    });
  },
};
