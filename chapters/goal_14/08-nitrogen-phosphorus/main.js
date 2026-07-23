function nutrientSeries(rows, fields, projection = {}) {
  const numeric = (value) => {
    if (value === null || value === undefined || String(value).trim() === "") return Number.NaN;
    const number = Number(value);
    return Number.isFinite(number) ? number : Number.NaN;
  };
  const observations = rows.map((row) => ({
    year: numeric(row[fields.category]),
    nitrogen: numeric(row[fields.nitrogen]),
    phosphorus: numeric(row[fields.phosphorus]),
  })).filter((item) => Number.isFinite(item.year)).sort((a, b) => a.year - b.year);
  const projectionYear = Number(projection.year || 2050);
  return ["nitrogen", "phosphorus"].map((key) => ({
    key,
    points: observations.filter((item) => Number.isFinite(item[key]))
      .map((item) => ({
        year: item.year,
        value: item[key],
        projected: item.year >= projectionYear,
      })),
  }));
}

function nutrientTickYears(years, width, margin, minimumGap = 30) {
  if (width >= 560 || years.length < 3) return [...years];
  const first = years[0];
  const last = years[years.length - 1];
  const span = last - first || 1;
  const position = (year) => margin.left +
    (year - first) / span * (width - margin.left - margin.right);
  const selected = [first];
  years.slice(1, -1).forEach((year) => {
    const farFromPrevious = position(year) - position(selected[selected.length - 1]) >= minimumGap;
    const leavesRoomForLast = position(last) - position(year) >= minimumGap;
    if (farFromPrevious && leavesRoomForLast) selected.push(year);
  });
  selected.push(last);
  return selected;
}

function nutrientLayout(width, years) {
  const compact = width < 560;
  const margin = compact
    ? { top: 64, right: 18, bottom: 48, left: 48 }
    : { top: 54, right: 34, bottom: 48, left: 62 };
  return { compact, margin, tickYears: nutrientTickYears(years, width, margin) };
}

window.AtlasReplica = {
  ready: true,
  isStub: false,
  async render(_scene, ctx) {
    const { chartEl, hidePlaceholder, config } = ctx;
    const contract = config.dataContract;
    const rows = await AtlasLoad.csv(`./data/${contract.file}`);
    const fields = AtlasLoad.validateContract(rows, contract, config.graphic);
    const series = nutrientSeries(rows, fields, contract.projection);
    hidePlaceholder();

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText = "position:relative;width:100%;height:100%;font-family:Open Sans,system-ui,sans-serif";
    chartEl.appendChild(root);
    const width = root.clientWidth || 900;
    const points = series.flatMap((item) => item.points);
    const years = [...new Set(points.map((point) => point.year))].sort((a, b) => a - b);
    const layout = nutrientLayout(width, years);
    const height = Math.max(root.clientHeight || 440, 360);
    const margin = layout.margin;
    const svg = AtlasSVG.el(root, "svg", {
      viewBox: `0 0 ${width} ${height}`,
      role: "img",
      "aria-label": "Observed nitrogen and phosphorus input series through 2010 with a projected 2050 endpoint",
    });
    svg.style.cssText = "display:block;width:100%;height:100%";
    const maximum = Math.max(...points.map((point) => point.value), 1);
    const x = AtlasSVG.scaleLinear([years[0], years[years.length - 1]], [margin.left, width - margin.right]);
    const y = AtlasSVG.scaleLinear([0, maximum * 1.08], [height - margin.bottom, margin.top]);
    [0, maximum / 2, maximum].forEach((tick) => {
      AtlasSVG.el(svg, "line", { x1: margin.left, x2: width - margin.right, y1: y(tick), y2: y(tick), stroke: "#dce4ea", "stroke-width": 0.8 });
      AtlasSVG.el(svg, "text", { x: margin.left - 8, y: y(tick) + 3, "text-anchor": "end", fill: "#64748b", "font-size": 9 }).textContent = tick.toFixed(0);
    });
    layout.tickYears.forEach((year) => {
      AtlasSVG.el(svg, "text", { x: x(year), y: height - 25, "text-anchor": "middle", fill: "#64748b", "font-size": 9 }).textContent = year;
    });
    const colors = { nitrogen: "#0071BC", phosphorus: "#C1261A" };
    series.forEach((item) => {
      const observed = item.points.filter((point) => !point.projected);
      const projected = item.points.filter((point) => point.projected);
      const projectionPath = projected.length && observed.length
        ? [observed[observed.length - 1], ...projected]
        : projected;
      AtlasSVG.el(svg, "path", {
        d: AtlasSVG.line(observed, (point) => x(point.year), (point) => y(point.value)),
        fill: "none", stroke: colors[item.key], "stroke-width": 3, "stroke-linejoin": "round",
      });
      if (projectionPath.length > 1) {
        AtlasSVG.el(svg, "path", {
          d: AtlasSVG.line(projectionPath, (point) => x(point.year), (point) => y(point.value)),
          fill: "none", stroke: colors[item.key], "stroke-width": 3,
          "stroke-linejoin": "round", "stroke-dasharray": "7 5",
        });
      }
      item.points.forEach((point) => {
        const dot = AtlasSVG.el(svg, "circle", {
          cx: x(point.year), cy: y(point.value), r: point.projected ? 5 : 4,
          fill: point.projected ? "#fff" : colors[item.key],
          stroke: point.projected ? colors[item.key] : "#fff",
          "stroke-width": point.projected ? 2 : 1,
        });
        AtlasSVG.el(dot, "title").textContent =
          `${config[item.key] || item.key} · ${point.year}: ${point.value} Tg/year` +
          (point.projected ? " (projection)" : " (observed)");
      });
    });
    let legendX = margin.left;
    series.forEach((item, index) => {
      const itemX = layout.compact ? (index === 0 ? margin.left : width / 2) : legendX;
      AtlasSVG.el(svg, "line", { x1: itemX, x2: itemX + 22, y1: 22, y2: 22, stroke: colors[item.key], "stroke-width": 3 });
      const label = config[item.key] || item.key;
      AtlasSVG.el(svg, "text", { x: itemX + 28, y: 26, fill: "#334155", "font-size": 10, "font-weight": 600 }).textContent = label;
      if (!layout.compact) legendX += 60 + label.length * 6;
    });
    const projectionX = layout.compact ? margin.left : legendX;
    const projectionY = layout.compact ? 42 : 22;
    AtlasSVG.el(svg, "line", {
      x1: projectionX, x2: projectionX + 22, y1: projectionY, y2: projectionY,
      stroke: "#64748b", "stroke-width": 2.5, "stroke-dasharray": "7 5",
    });
    AtlasSVG.el(svg, "text", {
      x: projectionX + 28, y: projectionY + 4,
      fill: "#475569", "font-size": 10, "font-weight": 600,
    }).textContent = "2050 projection";
    AtlasSVG.el(svg, "text", { x: 15, y: height / 2, transform: `rotate(-90 15 ${height / 2})`, "text-anchor": "middle", fill: "#475569", "font-size": 10 }).textContent =
      config.y_axis_units || "Tg/year";
  },
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { nutrientSeries, nutrientTickYears, nutrientLayout };
}
