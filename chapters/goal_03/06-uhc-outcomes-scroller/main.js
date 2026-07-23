function uhcOutcomePoints(rows, fields) {
  const numeric = (value) => {
    if (value === null || value === undefined || String(value).trim() === "") return Number.NaN;
    const number = Number(value);
    return Number.isFinite(number) ? number : Number.NaN;
  };
  return rows.map((row) => ({
    code: String(row[fields.category] || "").trim(),
    year: numeric(row[fields.year]),
    value: numeric(row[fields.value]),
    coverage: numeric(row[fields.coverage]),
  })).filter((point) =>
    point.code &&
    Number.isInteger(point.year) &&
    point.value >= 0 &&
    point.coverage >= 0 && point.coverage <= 100
  );
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
    const points = uhcOutcomePoints(rows, fields);
    const names = window.ATLAS_COUNTRY_NAMES || {};
    const highlightedCodes = [
      new Set(["SLE", "ETH"]),
      new Set(["RWA", "MWI"]),
      new Set(["KHM", "IND", "CHN"]),
    ][Math.min(sceneIndex, 2)];

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText = "position:relative;width:100%;height:100%;font-family:Open Sans,system-ui,sans-serif";
    chartEl.appendChild(root);
    const width = root.clientWidth || 900;
    const height = Math.max(root.clientHeight || 440, 360);
    const margin = { top: 50, right: 34, bottom: 50, left: 70 };
    const svg = AtlasSVG.el(root, "svg", {
      viewBox: `0 0 ${width} ${height}`,
      role: "img",
      "aria-label": "Scatter plot of mortality outcome against Universal Health Coverage by year",
    });
    svg.style.cssText = "display:block;width:100%;height:100%";

    const maximumValue = Math.max(...points.map((point) => point.value), 1);
    const x = AtlasSVG.scaleLinear([0, 100], [margin.left, width - margin.right]);
    const y = AtlasSVG.scaleLinear([0, maximumValue * 1.04], [height - margin.bottom, margin.top]);
    const years = [...new Set(points.map((point) => point.year))].sort((a, b) => a - b);
    const yearColors = Object.fromEntries(years.map((year, index) => [
      year,
      index === years.length - 1 ? "#0071bc" : "#8a969f",
    ]));

    for (let index = 0; index <= 5; index += 1) {
      const coverage = index * 20;
      AtlasSVG.el(svg, "line", {
        x1: x(coverage), x2: x(coverage),
        y1: margin.top, y2: height - margin.bottom,
        stroke: "#e2e8f0",
      });
      AtlasSVG.el(svg, "text", {
        x: x(coverage), y: height - margin.bottom + 19,
        "text-anchor": "middle", fill: "#64748b", "font-size": 10,
      }).textContent = coverage;
    }
    for (let index = 0; index <= 4; index += 1) {
      const value = maximumValue * index / 4;
      AtlasSVG.el(svg, "line", {
        x1: margin.left, x2: width - margin.right,
        y1: y(value), y2: y(value),
        stroke: "#edf2f7",
      });
      AtlasSVG.el(svg, "text", {
        x: margin.left - 8, y: y(value) + 4,
        "text-anchor": "end", fill: "#64748b", "font-size": 10,
      }).textContent = maximumValue >= 100 ? Math.round(value) : value.toFixed(1);
    }

    const byCountry = new Map();
    points.forEach((point) => {
      if (!byCountry.has(point.code)) byCountry.set(point.code, []);
      byCountry.get(point.code).push(point);
    });
    byCountry.forEach((series, code) => {
      series.sort((a, b) => a.year - b.year);
      if (series.length < 2) return;
      const highlighted = highlightedCodes.has(code);
      AtlasSVG.el(svg, "path", {
        d: AtlasSVG.line(series, (point) => x(point.coverage), (point) => y(point.value)),
        fill: "none",
        stroke: highlighted ? "#C1261A" : "#94a3b8",
        "stroke-width": highlighted ? 2 : 0.7,
        opacity: highlighted ? 0.9 : 0.22,
      });
    });

    points.slice().sort((a, b) =>
      Number(highlightedCodes.has(a.code)) - Number(highlightedCodes.has(b.code))
    ).forEach((point) => {
      const highlighted = highlightedCodes.has(point.code);
      const marker = AtlasSVG.el(svg, "circle", {
        cx: x(point.coverage),
        cy: y(point.value),
        r: highlighted ? 5.2 : 2.5,
        fill: highlighted ? "#C1261A" : yearColors[point.year],
        opacity: highlighted ? 0.95 : point.year === years.at(-1) ? 0.62 : 0.32,
        stroke: "#fff",
        "stroke-width": highlighted ? 1.2 : 0.5,
      });
      AtlasSVG.el(marker, "title").textContent =
        `${names[point.code] || point.code} · ${point.year}: ` +
        `UHC ${point.coverage.toFixed(0)}, outcome ${point.value.toFixed(1)}`;
      if (highlighted && point.year === years.at(-1)) {
        AtlasSVG.el(svg, "text", {
          x: x(point.coverage) + 7,
          y: y(point.value) + 3,
          fill: "#870000",
          "font-size": 10,
          "font-weight": 700,
        }).textContent = point.code;
      }
    });

    AtlasSVG.el(svg, "text", {
      x: width / 2, y: height - 12, "text-anchor": "middle",
      fill: "#334155", "font-size": 11, "font-weight": 600,
    }).textContent = config.x_title || "Universal Health Coverage Index (0–100)";
    AtlasSVG.el(svg, "text", {
      x: 15, y: height / 2, "text-anchor": "middle",
      transform: `rotate(-90 15 ${height / 2})`,
      fill: "#334155", "font-size": 11, "font-weight": 600,
    }).textContent = config[`y_title_${Math.min(sceneIndex, 2) + 1}`] || "Mortality outcome";
    AtlasSVG.el(svg, "text", {
      x: margin.left, y: 24, fill: "#334155", "font-size": 13, "font-weight": 700,
    }).textContent = config[`title_scene_${Math.min(sceneIndex, 2) + 1}`] || "";
    years.forEach((year, index) => {
      const legendX = width - margin.right - (years.length - index) * 75;
      AtlasSVG.el(svg, "circle", {
        cx: legendX, cy: 21, r: 4, fill: yearColors[year],
      });
      AtlasSVG.el(svg, "text", {
        x: legendX + 7, y: 25, fill: "#475569", "font-size": 10,
      }).textContent = year;
    });
  },
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { uhcOutcomePoints };
}
