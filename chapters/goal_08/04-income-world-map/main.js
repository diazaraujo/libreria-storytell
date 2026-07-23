function incomeTransitions(rows, fields) {
  const groups = new Set(["LIC", "LMC", "UMC", "HIC", "INX"]);
  const normalizeGroup = (value) => {
    const group = String(value || "").trim().toUpperCase() || "INX";
    return groups.has(group) ? group : "INX";
  };
  const numeric = (value) => {
    if (value === null || value === undefined || String(value).trim() === "") return Number.NaN;
    const number = Number(value);
    return Number.isFinite(number) ? number : Number.NaN;
  };
  return rows.map((row) => {
    const pastGroup = normalizeGroup(row[fields.pastGroup]);
    const currentGroup = normalizeGroup(row[fields.currentGroup]);
    return {
      code: String(row[fields.code] || "").trim(),
      pastGroup,
      currentGroup,
      growth: numeric(row[fields.growth]),
      changed: pastGroup !== currentGroup,
    };
  }).filter((item) => item.code);
}

function incomeWorldLayout(width) {
  const compact = width < 560;
  const horizontalPadding = 32;
  return {
    compact,
    legendColumns: compact ? 2 : 5,
    legendColumnWidth: compact ? (width - horizontalPadding) / 2 : null,
    legendTop: 34,
    legendRowHeight: 17,
    noteY: compact ? 96 : 61,
    chartTop: compact ? 112 : 74,
    minimumHeight: compact ? 460 : 360,
  };
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
    const order = { LIC: 0, LMC: 1, UMC: 2, HIC: 3, INX: 4 };
    const transitions = incomeTransitions(rows, fields);
    const data = transitions.slice().sort((a, b) => sceneIndex === 0
      ? a.code.localeCompare(b.code)
      : order[a.pastGroup] - order[b.pastGroup] || a.code.localeCompare(b.code)
    );
    const names = window.ATLAS_COUNTRY_NAMES || {};
    const colors = Object.assign({
      LIC: "#3B4DA6",
      LMC: "#DB95D7",
      UMC: "#73AF48",
      HIC: "#016B6C",
      INX: "#CED4DE",
    }, window.WB_COLORS || {});
    const labels = {
      LIC: "Low income",
      LMC: "Lower middle income",
      UMC: "Upper middle income",
      HIC: "High income",
      INX: "No classification",
    };

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText = "position:relative;width:100%;height:100%;font-family:Open Sans,system-ui,sans-serif";
    chartEl.appendChild(root);
    const width = root.clientWidth || 900;
    const layout = incomeWorldLayout(width);
    const height = Math.max(root.clientHeight || 440, layout.minimumHeight);
    const margin = { top: layout.chartTop, right: 16, bottom: 16, left: 16 };
    const svg = AtlasSVG.el(root, "svg", {
      viewBox: `0 0 ${width} ${height}`,
      role: "img",
      "aria-label": "Country income groups in 1990 shown as an equal-area tile grid",
    });
    svg.style.cssText = "display:block;width:100%;height:100%";

    const sceneTitle = [
      "1990 overview · alphabetical equal-area tiles",
      "1990 income groups · countries regrouped by class",
      "1990 income groups · labeled country tiles",
    ][Math.min(sceneIndex, 2)];
    AtlasSVG.el(svg, "text", {
      x: margin.left, y: 20, fill: "#334155", "font-size": 12, "font-weight": 700,
    }).textContent = sceneTitle;

    let legendX = margin.left;
    ["LIC", "LMC", "UMC", "HIC", "INX"].forEach((group, index) => {
      const itemX = layout.compact
        ? margin.left + (index % layout.legendColumns) * layout.legendColumnWidth
        : legendX;
      const itemY = layout.legendTop +
        (layout.compact ? Math.floor(index / layout.legendColumns) * layout.legendRowHeight : 0);
      AtlasSVG.el(svg, "rect", {
        x: itemX, y: itemY, width: 12, height: 12, rx: 2, fill: colors[group],
      });
      AtlasSVG.el(svg, "text", {
        x: itemX + 17, y: itemY + 10, fill: "#475569", "font-size": 9,
      }).textContent = labels[group];
      if (!layout.compact) legendX += 57 + labels[group].length * 4.3;
    });
    AtlasSVG.el(svg, "text", {
      x: margin.left, y: layout.noteY, fill: "#64748b", "font-size": 10,
    }).textContent = layout.compact
      ? "Equal-area tiles; the bundled CSV has no geometry."
      : "Equal-area tile proxy: the bundled CSV has classifications but no country geometry.";

    const availableWidth = width - margin.left - margin.right;
    const availableHeight = height - margin.top - margin.bottom;
    const columns = Math.max(10, Math.min(19, Math.floor(availableWidth / 42)));
    const rowCount = Math.ceil(data.length / columns);
    const cellWidth = availableWidth / columns;
    const cellHeight = availableHeight / Math.max(rowCount, 1);
    const tileWidth = Math.max(17, cellWidth - 3);
    const tileHeight = Math.max(14, cellHeight - 3);

    data.forEach((item, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const x = margin.left + column * cellWidth;
      const y = margin.top + row * cellHeight;
      const group = AtlasSVG.el(svg, "g");
      AtlasSVG.el(group, "rect", {
        x, y, width: tileWidth, height: tileHeight, rx: 2,
        fill: colors[item.pastGroup],
        stroke: "#fff",
        "stroke-width": 0.6,
      });
      if (sceneIndex >= 2 && tileHeight >= 17 && tileWidth >= 27) {
        AtlasSVG.el(group, "text", {
          x: x + tileWidth / 2,
          y: y + tileHeight / 2 + 3.2,
          "text-anchor": "middle",
          fill: item.pastGroup === "LMC" || item.pastGroup === "INX" ? "#334155" : "#fff",
          "font-size": Math.min(9.5, tileHeight * 0.43),
          "font-weight": 700,
        }).textContent = item.code;
      }
      AtlasSVG.el(group, "title").textContent =
        `${names[item.code] || item.code}: ${labels[item.pastGroup]} (1990)`;
    });
  },
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { incomeTransitions, incomeWorldLayout };
}
