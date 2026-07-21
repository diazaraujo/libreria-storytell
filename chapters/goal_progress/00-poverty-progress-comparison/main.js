function povertySlopeSeries(rows, fields) {
  const numeric = (value) => {
    if (value === null || value === undefined || String(value).trim() === "") return Number.NaN;
    const number = Number(value);
    return Number.isFinite(number) ? number : Number.NaN;
  };
  const grouped = new Map();
  rows.forEach((row) => {
    const code = String(row[fields.category] || "").trim();
    const year = numeric(row[fields.year]);
    const value = numeric(row[fields.value]);
    if (!code || !Number.isInteger(year) || !Number.isFinite(value)) return;
    if (!grouped.has(code)) grouped.set(code, []);
    grouped.get(code).push({ year, value });
  });
  return [...grouped].map(([code, points]) => ({
    code,
    points: points.sort((a, b) => a.year - b.year),
  })).filter((series) => series.points.length >= 2);
}

window.AtlasReplica = {
  ready: true,
  isStub: false,
  async render(_scene, ctx) {
    const { chartEl, config, hidePlaceholder, sceneIndex } = ctx;
    hidePlaceholder();
    const contract = config.dataContract;
    const rows = await AtlasLoad.csv(`./data/${contract.file}`);
    const fields = AtlasLoad.validateContract(rows, contract, config.graphic);
    const series = povertySlopeSeries(rows, fields);
    const names = window.ATLAS_COUNTRY_NAMES || {};
    const focusCodes = new Set([config.country_left, config.country_right].filter(Boolean));

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText = "position:relative;width:100%;height:100%;font-family:Open Sans,system-ui,sans-serif";
    chartEl.appendChild(root);
    const width = root.clientWidth || 900;
    const height = Math.max(root.clientHeight || 440, 340);
    const margin = { top: 42, right: 110, bottom: 42, left: 62 };
    const svg = AtlasSVG.el(root, "svg", {
      viewBox: `0 0 ${width} ${height}`,
      role: "img",
      "aria-label": "Slope chart comparing country poverty rates between 2015 and 2025",
    });
    svg.style.cssText = "display:block;width:100%;height:100%";

    const allPoints = series.flatMap((item) => item.points);
    const years = [...new Set(allPoints.map((point) => point.year))].sort((a, b) => a - b);
    const maximum = Math.max(...allPoints.map((point) => point.value), 1);
    const x = AtlasSVG.scaleLinear(
      [Math.min(...years), Math.max(...years)],
      [margin.left, width - margin.right]
    );
    const y = AtlasSVG.scaleLinear([0, Math.max(100, maximum)], [height - margin.bottom, margin.top]);

    for (let value = 0; value <= 100; value += 20) {
      AtlasSVG.el(svg, "line", {
        x1: margin.left, x2: width - margin.right,
        y1: y(value), y2: y(value),
        stroke: "#e2e8f0",
      });
      AtlasSVG.el(svg, "text", {
        x: margin.left - 8, y: y(value) + 4,
        "text-anchor": "end", fill: "#64748b", "font-size": 10,
      }).textContent = `${value}%`;
    }
    years.forEach((year) => {
      AtlasSVG.el(svg, "line", {
        x1: x(year), x2: x(year),
        y1: margin.top, y2: height - margin.bottom,
        stroke: "#cbd5e1", "stroke-width": 1.2,
      });
      AtlasSVG.el(svg, "text", {
        x: x(year), y: height - 14,
        "text-anchor": "middle", fill: "#334155", "font-size": 12, "font-weight": 700,
      }).textContent = year;
    });

    series.slice().sort((a, b) =>
      Number(focusCodes.has(a.code)) - Number(focusCodes.has(b.code))
    ).forEach((item) => {
      const highlighted = focusCodes.has(item.code);
      const isPrimary = sceneIndex === 1
        ? item.code === config.country_left
        : sceneIndex >= 2
          ? item.code === config.country_right
          : highlighted;
      const color = item.code === config.country_left ? "#C1261A" : "#0071bc";
      const group = AtlasSVG.el(svg, "g");
      AtlasSVG.el(group, "path", {
        d: AtlasSVG.line(item.points, (point) => x(point.year), (point) => y(point.value)),
        fill: "none",
        stroke: highlighted ? color : "#94a3b8",
        "stroke-width": highlighted ? (isPrimary ? 4 : 2.6) : 0.8,
        opacity: highlighted ? (isPrimary ? 1 : 0.55) : 0.18,
      });
      item.points.forEach((point) => {
        AtlasSVG.el(group, "circle", {
          cx: x(point.year),
          cy: y(point.value),
          r: highlighted ? (isPrimary ? 5 : 3.5) : 1.6,
          fill: highlighted ? color : "#94a3b8",
          opacity: highlighted ? 1 : 0.25,
          stroke: highlighted ? "#fff" : "none",
          "stroke-width": highlighted ? 1 : 0,
        });
      });
      AtlasSVG.el(group, "title").textContent =
        `${names[item.code] || item.code}: ` +
        item.points.map((point) => `${point.year} ${point.value.toFixed(1)}%`).join(" → ");

      if (highlighted) {
        const last = item.points.at(-1);
        AtlasSVG.el(svg, "text", {
          x: x(last.year) + 8,
          y: y(last.value) + 4,
          fill: color,
          "font-size": 11,
          "font-weight": 700,
        }).textContent = `${item.code} ${last.value.toFixed(1)}%`;
      }
    });

    AtlasSVG.el(svg, "text", {
      x: margin.left, y: 22, fill: "#334155", "font-size": 12, "font-weight": 700,
    }).textContent = `Extreme-poverty rate · ${series.length} countries`;
  },
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { povertySlopeSeries };
}
