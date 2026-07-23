function inequalityTiles(rows, fields) {
  const numeric = (value) => {
    if (value === null || value === undefined || String(value).trim() === "") return Number.NaN;
    const number = Number(value);
    return Number.isFinite(number) ? number : Number.NaN;
  };
  const order = { high: 0, moderate: 1, low: 2 };
  return rows.map((row) => ({
    code: String(row[fields.code] || "").trim(),
    value: numeric(row[fields.value]),
    category: String(row[fields.category] || "").trim().toLowerCase(),
  })).filter((item) =>
    item.code && Number.isFinite(item.value) &&
    Object.prototype.hasOwnProperty.call(order, item.category)
  ).sort((a, b) =>
    order[a.category] - order[b.category] ||
    b.value - a.value ||
    a.code.localeCompare(b.code)
  );
}

function inequalityLayout(width) {
  const compact = width < 560;
  return {
    compact,
    margin: compact
      ? { top: 90, right: 18, bottom: 18, left: 18 }
      : { top: 72, right: 18, bottom: 18, left: 18 },
    legendColumns: compact ? 2 : 3,
    legendColumnWidth: compact ? (width - 36) / 2 : null,
    legendRowHeight: 20,
    minimumHeight: compact ? 420 : 360,
    minimumColumns: compact ? 9 : 8,
  };
}

window.AtlasReplica = {
  ready: true,
  isStub: false,
  async render(_scene, ctx) {
    const { chartEl, config, hidePlaceholder } = ctx;
    hidePlaceholder();
    const contract = config.dataContract;
    const rows = await AtlasLoad.csv(`./data/${contract.file}`);
    const fields = AtlasLoad.validateContract(rows, contract, config.graphic);
    const data = inequalityTiles(rows, fields);
    const names = window.ATLAS_COUNTRY_NAMES || {};
    const colors = {
      high: "#C1261A",
      moderate: "#ECB63A",
      low: "#75CCEC",
    };
    const labels = {
      high: config.high || "High (Gini > 40)",
      moderate: config.moderate || "Moderate (Gini 30–40)",
      low: config.low || "Low (Gini < 30)",
    };

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText = "position:relative;width:100%;height:100%;font-family:Open Sans,system-ui,sans-serif";
    chartEl.appendChild(root);
    const width = root.clientWidth || 900;
    const layout = inequalityLayout(width);
    const height = Math.max(root.clientHeight || 440, layout.minimumHeight);
    const margin = layout.margin;
    const svg = AtlasSVG.el(root, "svg", {
      viewBox: `0 0 ${width} ${height}`,
      role: "img",
      "aria-label": "Country tile grid grouped by high, moderate, and low Gini inequality",
    });
    svg.style.cssText = "display:block;width:100%;height:100%";

    const counts = Object.fromEntries(
      Object.keys(colors).map((category) => [
        category,
        data.filter((item) => item.category === category).length,
      ])
    );
    let legendX = margin.left;
    ["high", "moderate", "low"].forEach((category, index) => {
      const itemX = layout.compact
        ? margin.left + (index % layout.legendColumns) * layout.legendColumnWidth
        : legendX;
      const itemY = 18 + (layout.compact
        ? Math.floor(index / layout.legendColumns) * layout.legendRowHeight
        : 0);
      AtlasSVG.el(svg, "rect", {
        x: itemX, y: itemY, width: 14, height: 14, rx: 2,
        fill: colors[category],
      });
      const label = AtlasSVG.el(svg, "text", {
        x: itemX + 20, y: itemY + 11, fill: "#334155", "font-size": 11, "font-weight": 600,
      });
      const compactLabel = {
        high: "High > 40", moderate: "Moderate 30–40", low: "Low < 30",
      }[category];
      label.textContent = `${layout.compact ? compactLabel : labels[category]} · ${counts[category]}`;
      if (!layout.compact) legendX += Math.min(245, 72 + labels[category].length * 5.8);
    });
    AtlasSVG.el(svg, "text", {
      x: margin.left, y: layout.compact ? 70 : 54,
      fill: colors.high, "font-size": layout.compact ? 10.5 : 12, "font-weight": 700,
    }).textContent = layout.compact
      ? `${counts.high} high-inequality economies appear first.`
      : `${counts.high} economies have high inequality; they appear first and in full color.`;
    AtlasSVG.el(svg, "text", {
      x: margin.left, y: layout.compact ? 84 : 68, fill: "#64748b", "font-size": 9.5,
    }).textContent = layout.compact
      ? "Ranked tiles; no geometry or region field."
      : "Ranked tile proxy: the bundled CSV has no geometry or region field.";

    const availableWidth = width - margin.left - margin.right;
    const availableHeight = height - (margin.top + 10) - margin.bottom;
    const columns = Math.max(layout.minimumColumns, Math.min(17, Math.floor(availableWidth / 46)));
    const rowCount = Math.ceil(data.length / columns);
    const cellWidth = availableWidth / columns;
    const cellHeight = availableHeight / Math.max(rowCount, 1);
    const tileWidth = Math.max(18, cellWidth - 3);
    const tileHeight = Math.max(15, cellHeight - 3);

    data.forEach((item, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const x = margin.left + column * cellWidth;
      const y = margin.top + 10 + row * cellHeight;
      const group = AtlasSVG.el(svg, "g");
      AtlasSVG.el(group, "rect", {
        x, y, width: tileWidth, height: tileHeight, rx: 3,
        fill: colors[item.category],
        opacity: item.category === "high" ? 0.96 : 0.48,
        stroke: item.category === "high" ? "#870000" : "#fff",
        "stroke-width": item.category === "high" ? 1 : 0.6,
      });
      if (tileHeight >= 18 && tileWidth >= 28) {
        AtlasSVG.el(group, "text", {
          x: x + tileWidth / 2,
          y: y + tileHeight / 2 + 3.5,
          "text-anchor": "middle",
          fill: item.category === "moderate" ? "#4b3500" : "#fff",
          "font-size": Math.min(10, tileHeight * 0.42),
          "font-weight": 700,
        }).textContent = item.code;
      }
      AtlasSVG.el(group, "title").textContent =
        `${names[item.code] || item.code}: Gini ${item.value.toFixed(1)} · ${labels[item.category]}`;
    });
  },
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { inequalityTiles, inequalityLayout };
}
