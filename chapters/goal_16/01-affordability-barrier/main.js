function affordabilityGroups(rows, fields) {
  const numeric = (value) => {
    if (value === null || value === undefined || String(value).trim() === "") return Number.NaN;
    const number = Number(value);
    return Number.isFinite(number) ? number : Number.NaN;
  };
  const order = { LIC: 0, LMC: 1, UMC: 2, HIC: 3 };
  return rows.map((row) => {
    const category = String(row[fields.category] || "").trim().toUpperCase();
    const dataShare = numeric(row[fields.dataShare]);
    const foodShare = numeric(row[fields.foodShare]);
    const remainingShare = 100 - foodShare;
    return {
      category,
      dataShare,
      foodShare,
      remainingShare,
      dataAsRemainingShare: remainingShare > 0 ? dataShare / remainingShare * 100 : Number.NaN,
    };
  }).filter((item) =>
    Object.hasOwn(order, item.category) && item.dataShare >= 0 &&
    item.foodShare >= 0 && item.foodShare < 100 &&
    Number.isFinite(item.dataAsRemainingShare)
  )
    .sort((a, b) => order[a.category] - order[b.category]);
}

window.AtlasReplica = {
  ready: true,
  isStub: false,
  async render(_scene, ctx) {
    const { chartEl, hidePlaceholder, config } = ctx;
    const contract = config.dataContract;
    const rows = await AtlasLoad.csv(`./data/${contract.file}`);
    const fields = AtlasLoad.validateContract(rows, contract, config.graphic);
    const data = affordabilityGroups(rows, fields);
    hidePlaceholder();

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText = "position:relative;width:100%;height:100%;font-family:Open Sans,system-ui,sans-serif";
    chartEl.appendChild(root);
    const width = root.clientWidth || 900;
    const height = Math.max(root.clientHeight || 440, 340);
    const margin = { top: 48, right: 28, bottom: 44, left: 52 };
    const svg = AtlasSVG.el(root, "svg", {
      viewBox: `0 0 ${width} ${height}`,
      role: "img",
      "aria-label": "Mobile-data cost as a share of the non-food household budget by country income group",
    });
    svg.style.cssText = "display:block;width:100%;height:100%";
    const maximum = Math.max(...data.map((item) => item.dataAsRemainingShare), 1);
    const y = AtlasSVG.scaleLinear([0, maximum * 1.12], [height - margin.bottom, margin.top]);
    const x = AtlasSVG.scaleBand(data.map((item) => item.category), [margin.left, width - margin.right], 0.28);
    const color = "#0071BC";
    [0, maximum / 2, maximum].forEach((tick) => {
      AtlasSVG.el(svg, "line", { x1: margin.left, x2: width - margin.right, y1: y(tick), y2: y(tick), stroke: "#dce4ea", "stroke-width": 0.8 });
      AtlasSVG.el(svg, "text", { x: margin.left - 8, y: y(tick) + 3, "text-anchor": "end", fill: "#64748b", "font-size": 9 }).textContent = `${tick.toFixed(0)}%`;
    });
    data.forEach((item) => {
      const band = x.bandwidth();
      const barX = x(item.category);
      const value = item.dataAsRemainingShare;
      const bar = AtlasSVG.el(svg, "rect", {
        x: barX, y: y(value), width: band, height: height - margin.bottom - y(value),
        fill: color, rx: 3, opacity: 0.9,
      });
      AtlasSVG.el(bar, "title").textContent =
        `${item.category}: ${value.toFixed(1)}% of the non-food household budget ` +
        `(${item.dataShare.toFixed(1)}% data cost and ${item.foodShare.toFixed(1)}% food, both as shares of total budget)`;
      AtlasSVG.el(svg, "text", {
        x: barX + band / 2, y: y(value) - 5, "text-anchor": "middle",
        fill: color, "font-size": 11, "font-weight": 700,
      }).textContent = `${value.toFixed(1)}%`;
      AtlasSVG.el(svg, "text", { x: x(item.category) + band / 2, y: height - 18, "text-anchor": "middle", fill: "#334155", "font-size": 11, "font-weight": 700 }).textContent = item.category;
    });
    AtlasSVG.el(svg, "text", {
      x: margin.left, y: 24, fill: "#334155", "font-size": 9.5, "font-weight": 600,
    }).textContent = "5GB data cost · % of non-food household budget";
  },
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { affordabilityGroups };
}
