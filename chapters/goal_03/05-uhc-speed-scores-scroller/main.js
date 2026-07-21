function uhcSpeedScores(rows, fields) {
  const numeric = (value) => {
    if (value === null || value === undefined || String(value).trim() === "") return Number.NaN;
    const number = Number(value);
    return Number.isFinite(number) ? number : Number.NaN;
  };
  return rows.map((row) => ({
    code: String(row[fields.category] || "").trim(),
    value: numeric(row[fields.value]),
    period: String(row[fields.period] || "").trim(),
  })).filter((item) => item.code && Number.isFinite(item.value));
}

window.AtlasReplica = {
  ready: true,
  isStub: false,
  async render(_scene, ctx) {
    const { chartEl, config, hidePlaceholder, sceneIndex } = ctx;
    hidePlaceholder();
    const contract = config.dataContract;
    const file = contract.files[Math.min(sceneIndex, contract.files.length - 1)];
    const rows = await AtlasLoad.csv(`./data/${file}`);
    const fields = AtlasLoad.validateContract(rows, contract, config.graphic);
    const validScores = uhcSpeedScores(rows, fields);
    const data = validScores.slice()
      .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
      .slice(0, 36)
      .sort((a, b) => a.value - b.value);
    const names = window.ATLAS_COUNTRY_NAMES || {};

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText = "position:relative;width:100%;height:100%;font-family:Open Sans,system-ui,sans-serif";
    chartEl.appendChild(root);
    const width = root.clientWidth || 900;
    const height = Math.max(root.clientHeight || 440, 64 + data.length * 14);
    const svg = AtlasSVG.el(root, "svg", {
      viewBox: `0 0 ${width} ${height}`,
      role: "img",
      "aria-label": "Signed speed-of-progress scores by country",
    });
    svg.style.cssText = "display:block;width:100%;height:100%";

    if (!data.length) {
      AtlasSVG.el(svg, "text", {
        x: width / 2, y: height / 2,
        "text-anchor": "middle", fill: "#64748b", "font-size": 14,
      }).textContent = "No speed scores are available for this outcome.";
      return;
    }

    const margin = { top: 48, right: 58, bottom: 38, left: 122 };
    const low = Math.min(0, ...data.map((item) => item.value));
    const high = Math.max(0, ...data.map((item) => item.value));
    const maximumAbsolute = Math.max(Math.abs(low), Math.abs(high), 1);
    const x = AtlasSVG.scaleLinear(
      [-maximumAbsolute, maximumAbsolute],
      [margin.left, width - margin.right]
    );
    const y = AtlasSVG.scaleBand(
      data.map((item) => item.code),
      [margin.top, height - margin.bottom],
      0.18
    );
    const zero = x(0);

    for (let index = -2; index <= 2; index += 1) {
      const value = maximumAbsolute * index / 2;
      AtlasSVG.el(svg, "line", {
        x1: x(value), x2: x(value),
        y1: margin.top, y2: height - margin.bottom,
        stroke: index === 0 ? "#334155" : "#e2e8f0",
        "stroke-width": index === 0 ? 1.5 : 1,
      });
      AtlasSVG.el(svg, "text", {
        x: x(value), y: height - 12,
        "text-anchor": "middle", fill: "#64748b", "font-size": 10,
      }).textContent = value.toFixed(1);
    }

    data.forEach((item) => {
      const yPosition = y(item.code);
      const barHeight = y.bandwidth();
      const end = x(item.value);
      const group = AtlasSVG.el(svg, "g");
      AtlasSVG.el(group, "rect", {
        x: Math.min(zero, end),
        y: yPosition,
        width: Math.max(Math.abs(end - zero), 1),
        height: barHeight,
        rx: 2,
        fill: item.value < 0 ? "#C1261A" : "#00A1C4",
        opacity: 0.9,
      });
      AtlasSVG.el(group, "text", {
        x: margin.left - 7,
        y: yPosition + barHeight / 2,
        "text-anchor": "end",
        "dominant-baseline": "middle",
        fill: "#334155",
        "font-size": 9.5,
        "font-weight": 600,
      }).textContent = item.code;
      AtlasSVG.el(group, "title").textContent =
        `${names[item.code] || item.code}: ${item.value.toFixed(2)}` +
        (item.period ? ` · ${item.period}` : "");
    });

    AtlasSVG.el(svg, "text", {
      x: margin.left, y: 20, fill: "#334155", "font-size": 12, "font-weight": 700,
    }).textContent = config[`title_scene_${Math.min(sceneIndex, 2) + 1}`] || "";
    AtlasSVG.el(svg, "text", {
      x: margin.left, y: 36, fill: "#64748b", "font-size": 10,
    }).textContent =
      `${validScores.length} of ${rows.length} countries have a score · ` +
      "negative values indicate reversal or slower-than-typical progress";
  },
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { uhcSpeedScores };
}
