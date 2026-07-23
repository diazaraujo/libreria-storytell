function incomeClassificationTransitions(rows, fields) {
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

function isClassifiedIncomeGroup(group) {
  return group === "LMC" || group === "UMC" || group === "HIC";
}

function incomeClassificationLayout(width, hasDisclosure = false) {
  const compact = width < 560;
  return {
    compact,
    legendColumns: compact ? 2 : 5,
    legendColumnWidth: compact ? (width - 32) / 2 : null,
    legendTop: 33,
    legendRowHeight: 17,
    disclosureY: compact ? 97 : 55,
    chartTop: compact ? (hasDisclosure ? 112 : 94) : (hasDisclosure ? 70 : 62),
    minimumHeight: compact ? 460 : 390,
  };
}

function incomeGrowthLayout(width) {
  const compact = width < 560;
  return {
    compact,
    margin: compact
      ? { top: 64, right: 18, bottom: 34, left: 54 }
      : { top: 55, right: 56, bottom: 34, left: 128 },
    titleX: compact ? 16 : 128,
    minimumHeight: compact ? 420 : 390,
  };
}

function renderGrowthBars(svg, data, names, width, height) {
  const layout = incomeGrowthLayout(width);
  const margin = layout.margin;
  const sorted = data.filter((item) =>
    item.currentGroup === "LIC" && Number.isFinite(item.growth)
  ).sort((a, b) => a.growth - b.growth);

  if (!sorted.length) {
    AtlasSVG.el(svg, "text", {
      x: width / 2, y: height / 2, "text-anchor": "middle",
      fill: "#64748b", "font-size": 14,
    }).textContent = "No growth observations are available for current low-income economies.";
    return;
  }

  const low = Math.min(0, ...sorted.map((item) => item.growth));
  const high = Math.max(0, ...sorted.map((item) => item.growth));
  const x = AtlasSVG.scaleLinear([low, high], [margin.left, width - margin.right]);
  const y = AtlasSVG.scaleBand(sorted.map((item) => item.code), [margin.top, height - margin.bottom], 0.2);
  const zero = x(0);

  for (let index = 0; index <= 4; index += 1) {
    const value = low + (high - low) * index / 4;
    AtlasSVG.el(svg, "line", {
      x1: x(value), x2: x(value), y1: margin.top, y2: height - margin.bottom,
      stroke: Math.abs(value) < 0.0001 ? "#475569" : "#e2e8f0",
      "stroke-width": Math.abs(value) < 0.0001 ? 1.4 : 1,
    });
    AtlasSVG.el(svg, "text", {
      x: x(value), y: height - 12, "text-anchor": "middle",
      fill: "#64748b", "font-size": 10,
    }).textContent = `${value.toFixed(1)}%`;
  }

  sorted.forEach((item) => {
    const yPosition = y(item.code);
    const barHeight = y.bandwidth();
    const end = x(item.growth);
    const group = AtlasSVG.el(svg, "g");
    AtlasSVG.el(group, "rect", {
      x: Math.min(zero, end),
      y: yPosition,
      width: Math.max(Math.abs(end - zero), 1),
      height: barHeight,
      rx: 2,
      fill: item.growth < 0 ? "#C1261A" : "#016B6C",
      opacity: 0.88,
    });
    AtlasSVG.el(group, "text", {
      x: margin.left - 7, y: yPosition + barHeight / 2,
      "text-anchor": "end", "dominant-baseline": "middle",
      fill: "#334155", "font-size": 10, "font-weight": 600,
    }).textContent = item.code;
    AtlasSVG.el(group, "title").textContent =
      `${names[item.code] || item.code}: ${item.growth.toFixed(2)}% average annual GDP/capita growth`;
  });

  AtlasSVG.el(svg, "text", {
    x: layout.titleX, y: 20, fill: "#334155",
    "font-size": layout.compact ? 10.5 : 12, "font-weight": 700,
  }).textContent = layout.compact
    ? `Current LIC economies with growth data · ${sorted.length}`
    : `Current low-income economies with growth data (${sorted.length} countries)`;
  AtlasSVG.el(svg, "text", {
    x: layout.titleX, y: 36, fill: "#64748b", "font-size": layout.compact ? 9 : 10,
  }).textContent = layout.compact
    ? "Average annual GDP/capita growth, 2015–2024."
    : "Bundled measure: average annual GDP/capita growth, 2015–2024; missing values are omitted.";
  if (layout.compact) {
    const currentLowIncomeCount = data.filter((item) => item.currentGroup === "LIC").length;
    AtlasSVG.el(svg, "text", {
      x: layout.titleX, y: 50, fill: "#64748b", "font-size": 9,
    }).textContent = `Coverage: ${sorted.length} of ${currentLowIncomeCount}; missing values omitted.`;
  }
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
    const data = incomeClassificationTransitions(rows, fields);
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
      LMC: "Lower middle",
      UMC: "Upper middle",
      HIC: "High income",
      INX: "No classification",
    };

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText = "position:relative;width:100%;height:100%;font-family:Open Sans,system-ui,sans-serif";
    chartEl.appendChild(root);
    const width = root.clientWidth || 900;
    const hasDisclosure = sceneIndex === 0 || sceneIndex === 3;
    const tileLayout = incomeClassificationLayout(width, hasDisclosure);
    const growthLayout = incomeGrowthLayout(width);
    const minimumHeight = sceneIndex >= 5 ? growthLayout.minimumHeight : tileLayout.minimumHeight;
    const height = Math.max(root.clientHeight || 440, minimumHeight);
    const svg = AtlasSVG.el(root, "svg", {
      viewBox: `0 0 ${width} ${height}`,
      role: "img",
      "aria-label": "Country income-group transitions from 1990 to 2024",
    });
    svg.style.cssText = "display:block;width:100%;height:100%";

    if (sceneIndex >= 5) {
      renderGrowthBars(svg, data, names, width, height);
      return;
    }

    const order = { LIC: 0, LMC: 1, UMC: 2, HIC: 3, INX: 4 };
    const sorted = data.slice().sort((a, b) =>
      order[a.pastGroup] - order[b.pastGroup] || a.code.localeCompare(b.code)
    );
    const focus = sceneIndex === 3
      ? (item) => item.pastGroup === "LIC" && isClassifiedIncomeGroup(item.currentGroup)
      : sceneIndex === 4
        ? (item) => item.pastGroup !== "LIC" && item.currentGroup === "LIC"
        : () => true;
    const split = sceneIndex >= 2;
    const title = [
      "Income classification in 1990",
      "Income classification in 2024",
      "Transition from 1990 (left) to 2024 (right)",
      "Countries that moved out of low income",
      "Countries newly classified as low income",
    ][Math.min(sceneIndex, 4)];
    const focusCount = sorted.filter(focus).length;
    AtlasSVG.el(svg, "text", {
      x: 16, y: 20, fill: "#334155", "font-size": 12, "font-weight": 700,
    }).textContent = sceneIndex >= 3 ? `${title} · ${focusCount}` : title;
    if (sceneIndex === 0 || sceneIndex === 3) {
      AtlasSVG.el(svg, "text", {
        x: 16, y: tileLayout.disclosureY, fill: "#64748b", "font-size": 9.5,
      }).textContent = sceneIndex === 0
        ? "Bundled snapshot: 51 low-income classifications in 1990."
        : "Bundled snapshot: 30 classified moves out of LIC; INX is excluded.";
    }

    let legendX = 16;
    ["LIC", "LMC", "UMC", "HIC", "INX"].forEach((group, index) => {
      const itemX = tileLayout.compact
        ? 16 + (index % tileLayout.legendColumns) * tileLayout.legendColumnWidth
        : legendX;
      const itemY = tileLayout.legendTop +
        (tileLayout.compact ? Math.floor(index / tileLayout.legendColumns) * tileLayout.legendRowHeight : 0);
      AtlasSVG.el(svg, "rect", {
        x: itemX, y: itemY, width: 12, height: 12, rx: 2, fill: colors[group],
      });
      AtlasSVG.el(svg, "text", {
        x: itemX + 17, y: itemY + 10, fill: "#475569", "font-size": 9,
      }).textContent = labels[group];
      if (!tileLayout.compact) legendX += 55 + labels[group].length * 4.2;
    });

    const margin = { top: tileLayout.chartTop, right: 15, bottom: 15, left: 15 };
    const availableWidth = width - margin.left - margin.right;
    const availableHeight = height - margin.top - margin.bottom;
    const columns = Math.max(10, Math.min(19, Math.floor(availableWidth / 42)));
    const rowCount = Math.ceil(sorted.length / columns);
    const cellWidth = availableWidth / columns;
    const cellHeight = availableHeight / Math.max(rowCount, 1);
    const tileWidth = Math.max(17, cellWidth - 3);
    const tileHeight = Math.max(14, cellHeight - 3);

    sorted.forEach((item, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const x = margin.left + column * cellWidth;
      const y = margin.top + row * cellHeight;
      const highlighted = focus(item);
      const opacity = sceneIndex >= 3 && !highlighted ? 0.1 : 0.94;
      const group = AtlasSVG.el(svg, "g", { opacity });

      if (split) {
        AtlasSVG.el(group, "rect", {
          x, y, width: tileWidth / 2, height: tileHeight, rx: 2,
          fill: colors[item.pastGroup],
        });
        AtlasSVG.el(group, "rect", {
          x: x + tileWidth / 2, y, width: tileWidth / 2, height: tileHeight, rx: 2,
          fill: colors[item.currentGroup],
        });
      } else {
        const visibleGroup = sceneIndex === 0 ? item.pastGroup : item.currentGroup;
        AtlasSVG.el(group, "rect", {
          x, y, width: tileWidth, height: tileHeight, rx: 2,
          fill: colors[visibleGroup],
        });
      }
      if (tileHeight >= 17 && tileWidth >= 27) {
        AtlasSVG.el(group, "text", {
          x: x + tileWidth / 2,
          y: y + tileHeight / 2 + 3.2,
          "text-anchor": "middle",
          fill: "#fff",
          "font-size": Math.min(9.5, tileHeight * 0.43),
          "font-weight": 700,
          "paint-order": "stroke",
          stroke: "#334155",
          "stroke-width": split ? 1.4 : 0,
        }).textContent = item.code;
      }
      const growth = Number.isFinite(item.growth) ? ` · growth ${item.growth.toFixed(1)}%` : "";
      AtlasSVG.el(group, "title").textContent =
        `${names[item.code] || item.code}: ${labels[item.pastGroup]} (1990) → ` +
        `${labels[item.currentGroup]} (2024)${growth}`;
    });
  },
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    incomeClassificationTransitions, isClassifiedIncomeGroup,
    incomeClassificationLayout, incomeGrowthLayout,
  };
}
