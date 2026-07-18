/**
 * prosperity_gaps — population (log) vs prosperity gap, scene-aware
 */
window.AtlasReplica = {
  ready: true,
  isStub: false,

  async render(scene, ctx) {
    const { chartEl, hidePlaceholder, sceneIndex, colors } = ctx;
    hidePlaceholder();

    const [countries, regions, world] = await Promise.all([
      AtlasLoad.csv("./data/country_prosperity_gaps.csv"),
      AtlasLoad.csv("./data/region_prosperity_gaps.csv"),
      AtlasLoad.csv("./data/world_prosperity_gaps.csv"),
    ]);

    const id = (scene?.id || "").toLowerCase();
    let rows = countries;
    let mode = "countries";
    if (id.includes("region")) {
      rows = regions;
      mode = "regions";
    } else if (id.includes("global")) {
      rows = [...countries, ...world];
      mode = "global";
    } else if (id.includes("col_mex") || sceneIndex === 0) {
      rows = countries.filter((r) => ["COL", "PER", "MEX"].includes(r.iso3c));
      mode = "highlight";
    }

    const data = rows
      .map((r) => ({
        iso3c: r.iso3c,
        pop: +r.pop,
        pg: +r.pg,
      }))
      .filter((d) => d.pop > 0 && Number.isFinite(d.pg));

    chartEl.innerHTML = "";
    const plot = document.createElement("div");
    plot.style.cssText = "position:absolute;inset:8px 12px 28px 12px";
    const foot = document.createElement("div");
    foot.style.cssText =
      "position:absolute;left:16px;bottom:4px;font-size:11px;color:#6a7781";
    foot.textContent = "X: population (log) · Y: Prosperity Gap";
    chartEl.appendChild(plot);
    chartEl.appendChild(foot);

    const REGION = {
      EAS: colors?.EAS || "#F3578E",
      ECS: colors?.ECS || "#AA0000",
      LCN: colors?.LCN || "#0C7C68",
      MEA: colors?.MEA || "#664AB6",
      NAC: colors?.NAC || "#34A7F2",
      SAS: colors?.SAS || "#4EC2C0",
      SSF: colors?.SSF || "#FF9800",
      WLD: colors?.WLD || "#081079",
    };

    const highlight = new Set(
      mode === "highlight" ? data.map((d) => d.iso3c) : []
    );

    AtlasScatter.mount(plot, {
      data,
      x: (d) => Math.log10(d.pop),
      y: (d) => d.pg,
      yDomain: [0, Math.max(12, Math.max(...data.map((d) => d.pg)) * 1.1)],
      width: plot.clientWidth,
      height: plot.clientHeight,
      r: (d) =>
        mode === "global" && d.iso3c === "WLD"
          ? 8
          : mode === "regions"
            ? 7
            : 4.5,
      color: (d) => {
        if (d.iso3c === "WLD") return REGION.WLD;
        if (REGION[d.iso3c]) return REGION[d.iso3c];
        if (highlight.size && !highlight.has(d.iso3c)) return "#ced4de";
        if (highlight.has(d.iso3c)) return colors?.wbBlue || "#0071bc";
        return colors?.wbBlue || "#0071bc";
      },
      opacity: (d) =>
        highlight.size && !highlight.has(d.iso3c) ? 0.25 : 0.9,
      xTicks: [6, 7, 8, 9], // 1M … 1B
      xFormat: (v) => {
        const n = Math.pow(10, v);
        if (n >= 1e9) return (n / 1e9).toFixed(0) + "B";
        if (n >= 1e6) return (n / 1e6).toFixed(0) + "M";
        return String(Math.round(n));
      },
      title: (d) => `${d.iso3c}\npop ${fmt(d.pop)}\nPG ${d.pg}`,
    });

    function fmt(n) {
      if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
      if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
      return String(Math.round(n));
    }
  },
};
