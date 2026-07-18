/**
 * financial_hardship_chart — % facing financial hardship (ranked bars by income)
 */
window.AtlasReplica = {
  ready: true, isStub: false,
  async render(_s, ctx) {
    const { chartEl, hidePlaceholder } = ctx;
    hidePlaceholder();
    const rows = await AtlasLoad.csv("./data/03_data_financial_hardship_chart.csv");
    const NAMES = window.ATLAS_COUNTRY_NAMES || {};
    const INC = { lic: "#3B4DA6", lmc: "#DB95D7", umc: "#73AF48", hic: "#016B6C" };
    let data = rows.map((r) => ({
      iso: r.iso3c,
      name: NAMES[r.iso3c] || r.iso3c,
      v: +r.value,
      income: (r.income || "").toLowerCase(),
    })).filter((d) => Number.isFinite(d.v)).sort((a, b) => b.v - a.v);

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText = "position:relative;width:100%;height:100%;font-family:Open Sans,system-ui,sans-serif";
    chartEl.appendChild(root);
    const w = root.clientWidth || 900;
    const h = Math.max(root.clientHeight || 480, 40 + data.length * 5);
    const margin = { top: 28, right: 48, bottom: 20, left: 120 };
    const svg = AtlasSVG.el(root, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.cssText = "width:100%;height:100%";
    const max = Math.max(...data.map((d) => d.v), 1);
    const xScale = AtlasSVG.scaleLinear([0, max], [margin.left, w - margin.right]);
    const yScale = AtlasSVG.scaleBand(data.map((d) => d.iso), [margin.top, h - margin.bottom], 0.12);
    data.forEach((d) => {
      const y = yScale(d.iso), bh = yScale.bandwidth();
      const col = INC[d.income] || "#0071bc";
      AtlasSVG.el(svg, "rect", {
        x: margin.left, y, width: Math.max(xScale(d.v) - margin.left, 1), height: bh,
        fill: col, rx: 2,
      });
      AtlasSVG.el(svg, "text", {
        x: margin.left - 6, y: y + bh / 2, "text-anchor": "end", "dominant-baseline": "middle",
        fill: "#111", "font-size": 10, "font-weight": "600",
      }).textContent = d.name.slice(0, 18);
      AtlasSVG.el(svg, "text", {
        x: xScale(d.v) + 4, y: y + bh / 2, "dominant-baseline": "middle",
        fill: col, "font-size": 10, "font-weight": "700",
      }).textContent = d.v.toFixed(1);
    });
    const leg = document.createElement("div");
    leg.style.cssText = "position:absolute;top:6px;right:12px;display:flex;gap:10px;font-size:11px";
    leg.innerHTML = Object.entries({ lic: "LIC", lmc: "LMC", umc: "UMC", hic: "HIC" })
      .map(([k, lab]) => `<span><i style="display:inline-block;width:10px;height:10px;background:${INC[k]};margin-right:3px;border-radius:2px"></i>${lab}</span>`).join("");
    root.appendChild(leg);
  },
};
