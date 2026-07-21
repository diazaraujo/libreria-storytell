function languageRepresentationGaps(rows, fields) {
  const numeric = (value) => {
    if (value === null || value === undefined || String(value).trim() === "") return Number.NaN;
    const number = Number(value);
    return Number.isFinite(number) ? number : Number.NaN;
  };
  return rows.map((row) => {
    const speakerPercent = numeric(row[fields.speakerPercent]);
    const urlPercent = numeric(row[fields.urlPercent]);
    return {
      code: String(row[fields.code] || "").trim(),
      category: String(row[fields.category] || "").trim(),
      speakers: numeric(row[fields.speakers]),
      speakerPercent,
      urls: numeric(row[fields.urls]),
      urlPercent,
      incomeGroup: String(row[fields.incomeGroup] || "").trim(),
      gap: speakerPercent - urlPercent,
    };
  }).filter((item) =>
    item.code && item.category &&
    Number.isFinite(item.speakerPercent) &&
    Number.isFinite(item.urlPercent) &&
    Number.isFinite(item.gap)
  );
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
    const allLanguages = languageRepresentationGaps(rows, fields);
    const data = allLanguages.slice()
      .sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap))
      .slice(0, 36)
      .sort((a, b) => a.gap - b.gap);

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText = "position:relative;width:100%;height:100%;font-family:Open Sans,system-ui,sans-serif";
    chartEl.appendChild(root);
    const width = root.clientWidth || 900;
    const height = Math.max(root.clientHeight || 440, 36 + data.length * 15);
    const margin = { top: 44, right: 66, bottom: 42, left: 132 };
    const svg = AtlasSVG.el(root, "svg", {
      viewBox: `0 0 ${width} ${height}`,
      role: "img",
      "aria-label": "Diverging bars of population share minus URL share by language",
    });
    svg.style.cssText = "display:block;width:100%;height:100%";

    const maximumAbsoluteGap = Math.max(...data.map((item) => Math.abs(item.gap)), 1);
    const x = AtlasSVG.scaleLinear(
      [-maximumAbsoluteGap, maximumAbsoluteGap],
      [margin.left, width - margin.right]
    );
    const y = AtlasSVG.scaleBand(
      data.map((item) => item.code),
      [margin.top, height - margin.bottom],
      0.17
    );
    const zero = x(0);

    for (let index = -2; index <= 2; index += 1) {
      const value = maximumAbsoluteGap * index / 2;
      AtlasSVG.el(svg, "line", {
        x1: x(value), x2: x(value),
        y1: margin.top, y2: height - margin.bottom,
        stroke: index === 0 ? "#475569" : "#e2e8f0",
        "stroke-width": index === 0 ? 1.5 : 1,
      });
      AtlasSVG.el(svg, "text", {
        x: x(value), y: height - 14,
        "text-anchor": "middle", fill: "#64748b", "font-size": 9,
      }).textContent = `${value.toFixed(1)} pp`;
    }

    data.forEach((item) => {
      const yPosition = y(item.code);
      const barHeight = y.bandwidth();
      const end = x(item.gap);
      const group = AtlasSVG.el(svg, "g");
      AtlasSVG.el(group, "rect", {
        x: Math.min(zero, end),
        y: yPosition,
        width: Math.max(Math.abs(end - zero), 1),
        height: barHeight,
        rx: 2,
        fill: item.gap >= 0 ? "#B143C7" : "#016B6C",
        opacity: 0.88,
      });
      AtlasSVG.el(group, "text", {
        x: margin.left - 8,
        y: yPosition + barHeight / 2,
        "text-anchor": "end",
        "dominant-baseline": "middle",
        fill: "#334155",
        "font-size": 9.5,
        "font-weight": 600,
      }).textContent = item.category.slice(0, 20);
      AtlasSVG.el(group, "title").textContent =
        `${item.category}: speakers ${item.speakerPercent.toFixed(3)}%, ` +
        `URLs ${item.urlPercent.toFixed(3)}%, gap ${item.gap.toFixed(3)} pp`;
    });

    AtlasSVG.el(svg, "text", {
      x: margin.left, y: 20, fill: "#334155", "font-size": 12, "font-weight": 700,
    }).textContent = "Population share − URL share (percentage points)";
    AtlasSVG.el(svg, "text", {
      x: margin.left, y: 35, fill: "#B143C7", "font-size": 10, "font-weight": 600,
    }).textContent = "← overrepresented online · underrepresented online →";
  },
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { languageRepresentationGaps };
}
