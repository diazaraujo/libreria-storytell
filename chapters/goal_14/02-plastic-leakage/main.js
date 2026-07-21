function plasticLeakagePairs(rows, fields) {
  const numeric = (value) => {
    if (value === null || value === undefined || String(value).trim() === "") return Number.NaN;
    const number = Number(value);
    return Number.isFinite(number) ? number : Number.NaN;
  };
  return rows.map((row) => {
    const start = numeric(row[fields.startValue]);
    const end = numeric(row[fields.endValue]);
    const category = String(row[fields.category] || "").trim();
    return {
      category,
      start,
      end,
      change: end - start,
      panel: category.startsWith("stock_") ? "stock" : "flow",
    };
  }).filter((item) => item.category && item.start >= 0 && item.end >= 0);
}

function plasticLeakageSummaries(pairs, aggregates) {
  const byCategory = Object.fromEntries(pairs.map((item) => [item.category, item]));
  return Object.entries(aggregates || {}).map(([category, members]) => {
    const components = members.map((member) => {
      if (!byCategory[member]) throw new Error(`plastic leakage: missing aggregate member ${member}`);
      return byCategory[member];
    });
    const start = components.reduce((sum, item) => sum + item.start, 0);
    const end = components.reduce((sum, item) => sum + item.end, 0);
    return {
      category, members: [...members], start, end,
      change: end - start,
      ratio: start > 0 ? end / start : Number.NaN,
    };
  });
}

function plasticLeakageFocus(scene, sceneIndex) {
  const id = scene && scene.id;
  const byScene = {
    leakage19: { year: "start", categories: [], summary: "aquatic_leakage" },
    sinking: { year: null, categories: ["sinking_land"], summary: null },
    in_rivers: { year: null, categories: ["floating_rivers"], summary: null },
    coastal: { year: null, categories: ["coasts_to_oceans"], summary: null },
    to_oceans: { year: null, categories: ["rivers_to_oceans", "coasts_to_oceans"], summary: "transport_to_oceans" },
    in_oceans: { year: null, categories: ["stock_oceans"], summary: null },
    projection_2060: { year: "end", categories: [], summary: "aquatic_leakage" },
  };
  const fallbackIds = Object.keys(byScene);
  return byScene[id] || byScene[fallbackIds[Math.max(0, Math.min(sceneIndex || 0, fallbackIds.length - 1))]];
}

function plasticLeakageLayout(width) {
  const compact = width < 600;
  return {
    compact,
    margin: compact ? { left: 18, right: 50 } : { left: 190, right: 55 },
    flow: compact ? { top: 70, bottom: 274 } : { top: 70, bottom: 265 },
    stock: compact ? { top: 282, bottom: 432 } : { top: 280, bottom: 425 },
  };
}

window.AtlasReplica = {
  ready: true,
  isStub: false,
  async render(scene, ctx) {
    const { chartEl, hidePlaceholder, sceneIndex, config } = ctx;
    const contract = config.dataContract;
    const rows = await AtlasLoad.csv(`./data/${contract.file}`);
    const fields = AtlasLoad.validateContract(rows, contract, config.graphic);
    const data = plasticLeakagePairs(rows, fields);
    const summaries = plasticLeakageSummaries(data, contract.aggregates);
    const focus = plasticLeakageFocus(scene, sceneIndex);
    hidePlaceholder();

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText = "position:relative;width:100%;height:100%;font-family:Open Sans,system-ui,sans-serif";
    chartEl.appendChild(root);
    const width = root.clientWidth || 900;
    const height = Math.max(root.clientHeight || 440, 450);
    const layout = plasticLeakageLayout(width);
    const margin = layout.margin;
    const svg = AtlasSVG.el(root, "svg", {
      viewBox: `0 0 ${width} ${height}`,
      role: "img",
      "aria-label": "Plastic leakage and accumulated stocks paired for 2019 and 2060",
    });
    svg.style.cssText = "display:block;width:100%;height:100%";
    const colors = { start: "#79BCE8", end: "#C1261A" };
    AtlasSVG.el(svg, "rect", { x: margin.left, y: 15, width: 13, height: 10, rx: 2, fill: colors.start });
    AtlasSVG.el(svg, "text", { x: margin.left + 18, y: 24, fill: "#334155", "font-size": 10 }).textContent = config.label19 || "2019";
    AtlasSVG.el(svg, "rect", { x: margin.left + 70, y: 15, width: 13, height: 10, rx: 2, fill: colors.end });
    AtlasSVG.el(svg, "text", { x: margin.left + 88, y: 24, fill: "#334155", "font-size": 10 }).textContent = config.label60 || "2060";
    summaries.forEach((item, index) => {
      const active = focus.summary === item.category;
      const summaryLabel = layout.compact
        ? (item.category === "aquatic_leakage" ? "Aquatic leakage" : "To oceans")
        : (config[item.category] || item.category);
      AtlasSVG.el(svg, "text", {
        x: margin.left, y: 43 + index * 15,
        fill: active ? "#7f1d1d" : "#475569", "font-size": layout.compact ? 9 : 10,
        "font-weight": active ? 700 : 500, opacity: focus.summary && !active ? 0.32 : 1,
      }).textContent =
        `${summaryLabel}: ${item.start.toFixed(2)} → ${item.end.toFixed(2)} Mt/year · ${item.ratio.toFixed(2)}×`;
    });

    const opacityFor = (item, series) => {
      if (focus.year) return focus.year === series ? 0.96 : 0.28;
      return focus.categories.includes(item.category) ? (series === "end" ? 0.96 : 0.7) : 0.15;
    };
    const drawPanel = (panel, top, bottom, title) => {
      const panelData = data.filter((item) => item.panel === panel);
      const maximum = Math.max(...panelData.flatMap((item) => [item.start, item.end]), 1);
      const x = AtlasSVG.scaleLinear([0, maximum * 1.05], [margin.left, width - margin.right]);
      const y = AtlasSVG.scaleBand(
        panelData.map((item) => item.category), [top + 24, bottom], layout.compact ? 0.12 : 0.24
      );
      AtlasSVG.el(svg, "text", { x: margin.left, y: top + 12, fill: "#172b4d", "font-size": 11, "font-weight": 700 }).textContent = title;
      panelData.forEach((item) => {
        const band = y.bandwidth();
        const y0 = y(item.category);
        const barTop = layout.compact ? y0 + 15 : y0;
        const barHeight = Math.max(3, (band - (layout.compact ? 16 : 3)) / 2);
        [["start", item.start], ["end", item.end]].forEach(([series, value], index) => {
          const bar = AtlasSVG.el(svg, "rect", {
            x: margin.left, y: barTop + index * barHeight,
            width: Math.max(x(value) - margin.left, 1), height: Math.max(barHeight - 0.8, 2),
            fill: colors[series], opacity: opacityFor(item, series), rx: 2,
            stroke: focus.categories.includes(item.category) ? "#7f1d1d" : "none",
            "stroke-width": focus.categories.includes(item.category) ? 0.8 : 0,
          });
          AtlasSVG.el(bar, "title").textContent =
            `${config[item.category] || item.category} · ${series === "start" ? "2019" : "2060"}: ${value} Mt`;
        });
        AtlasSVG.el(svg, "text", {
          x: layout.compact ? margin.left : margin.left - 9,
          y: layout.compact ? y0 + 9 : y0 + band / 2,
          "text-anchor": layout.compact ? "start" : "end", "dominant-baseline": "middle",
          fill: focus.categories.includes(item.category) ? "#7f1d1d" : "#334155",
          "font-size": layout.compact ? 8.7 : 9.5,
          "font-weight": focus.categories.includes(item.category) ? 700 : 500,
        }).textContent = config[item.category] || item.category.replaceAll("_", " ");
        AtlasSVG.el(svg, "text", {
          x: x(Math.max(item.start, item.end)) + 5,
          y: layout.compact ? barTop + barHeight : y0 + band / 2,
          "dominant-baseline": "middle", fill: "#64748b", "font-size": 9,
        }).textContent = `+${item.change.toFixed(2)}`;
      });
    };
    drawPanel(
      "flow", layout.flow.top, layout.flow.bottom,
      layout.compact ? "Flows · Mt/year" : "Annual leakage and transport components · Mt/year"
    );
    drawPanel(
      "stock", layout.stock.top, layout.stock.bottom,
      layout.compact ? "Stocks since 1950 · Mt" : "Accumulated plastic stock since 1950 · Mt"
    );
  },
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    plasticLeakagePairs, plasticLeakageSummaries, plasticLeakageFocus, plasticLeakageLayout,
  };
}
