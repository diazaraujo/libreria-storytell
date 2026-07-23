function seafoodEstimates(rows, fields) {
  const numeric = (value) => {
    if (value === null || value === undefined || String(value).trim() === "") return Number.NaN;
    const number = Number(value);
    return Number.isFinite(number) ? number : Number.NaN;
  };
  return rows.map((row) => ({
    category: String(row[fields.category] || "").trim(),
    value: numeric(row[fields.value]),
    error: numeric(row[fields.error]),
  })).filter((item) => item.category && item.value >= 0 && item.error >= 0)
    .sort((a, b) => b.value - a.value);
}

window.AtlasReplica = {
  ready: true,
  isStub: false,
  async render(_scene, ctx) {
    const { chartEl, hidePlaceholder, config } = ctx;
    const contract = config.dataContract;
    const rows = await AtlasLoad.csv(`./data/${contract.file}`);
    const fields = AtlasLoad.validateContract(rows, contract, config.graphic);
    const data = seafoodEstimates(rows, fields);
    hidePlaceholder();

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText = "position:relative;width:100%;height:100%;font-family:Open Sans,system-ui,sans-serif";
    chartEl.appendChild(root);
    const width = root.clientWidth || 900;
    const height = Math.max(root.clientHeight || 440, 380);
    const margin = { top: 34, right: 74, bottom: 35, left: 205 };
    const svg = AtlasSVG.el(root, "svg", {
      viewBox: `0 0 ${width} ${height}`,
      role: "img",
      "aria-label": "Mean anthropogenic particles per gram of seafood with standard-error whiskers",
    });
    svg.style.cssText = "display:block;width:100%;height:100%";
    const maximum = Math.max(...data.map((item) => item.value + item.error), 1);
    const x = AtlasSVG.scaleLinear([0, maximum * 1.04], [margin.left, width - margin.right]);
    const y = AtlasSVG.scaleBand(data.map((item) => item.category), [margin.top, height - margin.bottom], 0.24);
    const color = "#0071BC";
    data.forEach((item) => {
      const y0 = y(item.category);
      const band = y.bandwidth();
      const center = y0 + band / 2;
      const bar = AtlasSVG.el(svg, "rect", {
        x: margin.left, y: y0, width: Math.max(x(item.value) - margin.left, 1), height: band,
        fill: color, opacity: 0.84, rx: 2,
      });
      const low = Math.max(0, item.value - item.error);
      const high = item.value + item.error;
      AtlasSVG.el(svg, "line", { x1: x(low), x2: x(high), y1: center, y2: center, stroke: "#172b4d", "stroke-width": 1.8 });
      [low, high].forEach((endpoint) => AtlasSVG.el(svg, "line", {
        x1: x(endpoint), x2: x(endpoint), y1: center - 5, y2: center + 5,
        stroke: "#172b4d", "stroke-width": 1.5,
      }));
      AtlasSVG.el(bar, "title").textContent =
        `${config[item.category] || item.category}: ${item.value.toFixed(3)} ± ${item.error.toFixed(3)} particles/g (standard error)`;
      AtlasSVG.el(svg, "text", {
        x: margin.left - 10, y: center, "text-anchor": "end", "dominant-baseline": "middle",
        fill: "#172b4d", "font-size": 10.5, "font-weight": 600,
      }).textContent = config[item.category] || item.category.replaceAll("_", " ");
      AtlasSVG.el(svg, "text", {
        x: x(high) + 5, y: center, "dominant-baseline": "middle", fill: color, "font-size": 10, "font-weight": 700,
      }).textContent = `${item.value.toFixed(2)} ± ${item.error.toFixed(2)}`;
    });
    AtlasSVG.el(svg, "text", { x: (margin.left + width - margin.right) / 2, y: height - 9, "text-anchor": "middle", fill: "#475569", "font-size": 10 }).textContent =
      config.x_axis_title || "Particles per gram of tissue";
  },
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { seafoodEstimates };
}
