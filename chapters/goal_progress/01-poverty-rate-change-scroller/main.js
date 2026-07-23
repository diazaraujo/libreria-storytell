function povertyScatterPoints(rows, fields) {
  const numeric = (value) => {
    if (value === null || value === undefined || String(value).trim() === "") return Number.NaN;
    const number = Number(value);
    return Number.isFinite(number) ? number : Number.NaN;
  };
  return rows.map((row) => ({
    rate: numeric(row[fields.rate]),
    change: numeric(row[fields.change]),
  })).filter((point) =>
    point.rate >= 0 && point.rate <= 100 && Number.isFinite(point.change)
  );
}

function selectedPovertyChanges(rows, fields) {
  const numeric = (value) => {
    if (value === null || value === undefined || String(value).trim() === "") return Number.NaN;
    const number = Number(value);
    return Number.isFinite(number) ? number : Number.NaN;
  };
  const grouped = new Map();
  rows.forEach((row) => {
    const code = String(row[fields.category] || "").trim();
    const year = numeric(row[fields.year]);
    const rate = numeric(row[fields.rate]);
    if (!code || !Number.isInteger(year) || !Number.isFinite(rate)) return;
    if (!grouped.has(code)) grouped.set(code, []);
    grouped.get(code).push({ year, rate });
  });
  return [...grouped].flatMap(([code, values]) => {
    values.sort((a, b) => a.year - b.year);
    const first = values[0];
    const last = values.at(-1);
    const elapsed = last.year - first.year;
    if (!elapsed) return [];
    return [{
      code,
      rate: first.rate,
      change: (last.rate - first.rate) / elapsed,
      firstYear: first.year,
      lastYear: last.year,
    }];
  });
}

window.AtlasReplica = {
  ready: true,
  isStub: false,
  async render(_scene, ctx) {
    const { chartEl, config, hidePlaceholder, sceneIndex } = ctx;
    hidePlaceholder();
    const contracts = config.dataContract.datasets;
    const [trendRows, countryRows, selectedRows] = await Promise.all([
      AtlasLoad.csv(`./data/${contracts.trend.file}`),
      AtlasLoad.csv(`./data/${contracts.countries.file}`),
      AtlasLoad.csv(`./data/${contracts.selected.file}`),
    ]);
    const trendFields = AtlasLoad.validateContract(trendRows, contracts.trend, `${config.graphic} trend`);
    const countryFields = AtlasLoad.validateContract(countryRows, contracts.countries, `${config.graphic} observations`);
    const selectedFields = AtlasLoad.validateContract(selectedRows, contracts.selected, `${config.graphic} selected countries`);
    const trend = povertyScatterPoints(trendRows, trendFields).sort((a, b) => a.rate - b.rate);
    const observations = povertyScatterPoints(countryRows, countryFields);
    const selected = selectedPovertyChanges(selectedRows, selectedFields);
    const names = window.ATLAS_COUNTRY_NAMES || {};

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText = "position:relative;width:100%;height:100%;min-height:360px;font-family:Open Sans,system-ui,sans-serif";
    chartEl.appendChild(root);
    const width = root.clientWidth || 900;
    const height = Math.max(root.clientHeight || 440, 360);
    const margin = { top: 44, right: 34, bottom: 52, left: 64 };
    const lowChange = Math.min(0, ...observations.map((point) => point.change), ...trend.map((point) => point.change));
    const highChange = Math.max(0, ...observations.map((point) => point.change), ...trend.map((point) => point.change));
    const padding = Math.max((highChange - lowChange) * 0.04, 0.2);
    const x = AtlasSVG.scaleLinear([0, 100], [margin.left, width - margin.right]);
    const y = AtlasSVG.scaleLinear(
      [lowChange - padding, highChange + padding],
      [height - margin.bottom, margin.top]
    );

    const canvas = document.createElement("canvas");
    canvas.setAttribute("role", "img");
    canvas.setAttribute(
      "aria-label",
      `${observations.length} observed annual poverty-rate changes plotted against baseline poverty`
    );
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%";
    const pixelRatio = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    root.appendChild(canvas);
    const canvasContext = canvas.getContext("2d");
    canvasContext.scale(pixelRatio, pixelRatio);
    canvasContext.fillStyle = "rgba(0,113,188,0.18)";
    observations.forEach((point) => {
      canvasContext.beginPath();
      canvasContext.arc(x(point.rate), y(point.change), 1.45, 0, Math.PI * 2);
      canvasContext.fill();
    });

    const svg = AtlasSVG.el(root, "svg", {
      viewBox: `0 0 ${width} ${height}`,
      role: "img",
      "aria-label": "Typical poverty-change curve and selected country trajectories",
    });
    svg.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none";

    for (let index = 0; index <= 5; index += 1) {
      const rate = index * 20;
      AtlasSVG.el(svg, "line", {
        x1: x(rate), x2: x(rate),
        y1: margin.top, y2: height - margin.bottom,
        stroke: "#e2e8f0",
      });
      AtlasSVG.el(svg, "text", {
        x: x(rate), y: height - margin.bottom + 20,
        "text-anchor": "middle", fill: "#64748b", "font-size": 10,
      }).textContent = `${rate}%`;
    }
    for (let index = 0; index <= 4; index += 1) {
      const change = lowChange + (highChange - lowChange) * index / 4;
      AtlasSVG.el(svg, "line", {
        x1: margin.left, x2: width - margin.right,
        y1: y(change), y2: y(change),
        stroke: Math.abs(change) < 0.01 ? "#475569" : "#edf2f7",
        "stroke-width": Math.abs(change) < 0.01 ? 1.4 : 1,
      });
      AtlasSVG.el(svg, "text", {
        x: margin.left - 8, y: y(change) + 4,
        "text-anchor": "end", fill: "#64748b", "font-size": 10,
      }).textContent = `${change.toFixed(1)} pp`;
    }

    AtlasSVG.el(svg, "line", {
      x1: margin.left, x2: width - margin.right,
      y1: y(0), y2: y(0),
      stroke: "#475569", "stroke-width": 1.4,
    });
    AtlasSVG.el(svg, "path", {
      d: AtlasSVG.line(trend, (point) => x(point.rate), (point) => y(point.change)),
      fill: "none",
      stroke: "#B143C7",
      "stroke-width": sceneIndex === 0 ? 2 : 3.5,
      opacity: sceneIndex === 0 ? 0.55 : 1,
    });

    let focusCodes = new Set(["CIV", "GEO"]);
    if (sceneIndex >= 5 && sceneIndex <= 9) focusCodes = new Set(["CIV"]);
    else if (sceneIndex === 10 || sceneIndex === 16) focusCodes = new Set(["GEO"]);
    else if (sceneIndex === 14 || sceneIndex === 15) focusCodes = new Set(["CIV"]);
    else if (sceneIndex === 17) focusCodes = new Set(["SLE"]);
    else if (sceneIndex === 18) focusCodes = new Set(["MWI"]);
    else if (sceneIndex >= 19) focusCodes = new Set(["CIV", "GEO", "SLE", "MWI"]);

    selected.filter((point) => focusCodes.has(point.code)).forEach((point) => {
      const marker = AtlasSVG.el(svg, "circle", {
        cx: x(point.rate),
        cy: y(point.change),
        r: 5.5,
        fill: "#111",
        stroke: "#fff",
        "stroke-width": 1.5,
      });
      AtlasSVG.el(marker, "title").textContent =
        `${names[point.code] || point.code}: ${point.change.toFixed(2)} pp/year ` +
        `from ${point.firstYear} to ${point.lastYear}`;
      AtlasSVG.el(svg, "text", {
        x: x(point.rate) + 8,
        y: y(point.change) + 4,
        fill: "#111",
        "font-size": 10,
        "font-weight": 700,
      }).textContent = point.code;
    });

    AtlasSVG.el(svg, "text", {
      x: width / 2, y: height - 12, "text-anchor": "middle",
      fill: "#334155", "font-size": 11, "font-weight": 600,
    }).textContent = "Baseline extreme-poverty rate";
    AtlasSVG.el(svg, "text", {
      x: 14, y: height / 2, "text-anchor": "middle",
      transform: `rotate(-90 14 ${height / 2})`,
      fill: "#334155", "font-size": 11, "font-weight": 600,
    }).textContent = "Annual change in poverty rate (percentage points)";
    AtlasSVG.el(svg, "text", {
      x: margin.left, y: 23, fill: "#334155", "font-size": 12, "font-weight": 700,
    }).textContent = `${observations.length.toLocaleString()} observations · purple line: typical change`;
  },
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { povertyScatterPoints, selectedPovertyChanges };
}
