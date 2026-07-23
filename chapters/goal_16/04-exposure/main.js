/** AI occupational exposure — weighted beeswarm by explicit AIOE/share group. */
window.AtlasReplica = {
  ready: true,
  isStub: false,
  async render(_scene, ctx) {
    const { chartEl, config, hidePlaceholder, sceneIndex } = ctx;
    hidePlaceholder();
    const contract = config.dataContract;
    const rows = await AtlasLoad.csv(`./data/${contract.file}`);
    const group = sceneIndex >= 5 ? "lic" : sceneIndex === 4 ? "mic" : sceneIndex === 3 ? "hic" : "glo";
    const data = AtlasLoad.exposureOccupations(rows, contract, group);
    const weighted = sceneIndex >= 3;
    const shares = data.map((row) => row.share).filter(Number.isFinite);
    const maxShare = Math.max(...shares, 1);
    const groupLabels = {
      glo: "Occupational exposure index",
      hic: "High-income aggregate · employment-weighted (not US-specific)",
      mic: "Middle-income countries · employment-weighted",
      lic: "Low-income countries · employment-weighted",
    };

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText = "position:relative;width:100%;height:100%;font-family:Open Sans,system-ui,sans-serif";
    chartEl.appendChild(root);
    const width = root.clientWidth || 900;
    const height = Math.max(root.clientHeight || 440, 360);
    const margin = { top: 52, right: 34, bottom: 58, left: 42 };
    const svg = AtlasSVG.el(root, "svg", {
      viewBox: `0 0 ${width} ${height}`,
      role: "img",
      "aria-label": `${data.length} occupations plotted by AIOE score for ${group}`,
    });
    svg.style.cssText = "width:100%;height:100%";
    const x = AtlasSVG.scaleLinear([0, 100], [margin.left, width - margin.right]);
    const plotTop = margin.top + 20;
    const plotBottom = height - margin.bottom;

    AtlasSVG.el(svg, "rect", { x: x(50), y: plotTop, width: x(100) - x(50), height: plotBottom - plotTop, fill: "#eef5ff" });
    AtlasSVG.el(svg, "line", { x1: x(50), x2: x(50), y1: plotTop - 8, y2: plotBottom, stroke: "#0071bc", "stroke-dasharray": "5 4" });
    [0, 25, 50, 75, 100].forEach((tick) => {
      AtlasSVG.el(svg, "line", { x1: x(tick), x2: x(tick), y1: plotBottom, y2: plotBottom + 6, stroke: "#546e7a" });
      AtlasSVG.el(svg, "text", { x: x(tick), y: plotBottom + 22, "text-anchor": "middle", fill: "#455a64", "font-size": 10 }).textContent = String(tick);
    });

    const orderedByShare = [...data].filter((row) => Number.isFinite(row.share)).sort((a, b) => b.share - a.share);
    const labelCodes = new Set(orderedByShare.slice(0, weighted ? 5 : 0).map((row) => row.code));
    data.forEach((row, index) => {
      const radius = weighted && Number.isFinite(row.share)
        ? 3 + 20 * Math.sqrt(Math.max(row.share, 0) / maxShare)
        : 5;
      const lanes = 9;
      const lane = (Number(row.code) || index) % lanes;
      const cy = plotTop + 18 + lane * Math.max((plotBottom - plotTop - 36) / (lanes - 1), 1);
      const emphasized = sceneIndex === 0 ? row.score >= 90 : sceneIndex === 1 ? row.score <= 25 : true;
      const dot = AtlasSVG.el(svg, "circle", {
        cx: x(row.score), cy, r: radius,
        fill: row.score >= 50 ? "#2166ac" : "#d6604d",
        opacity: emphasized ? 0.76 : 0.14,
        stroke: "#fff", "stroke-width": 0.8,
      });
      AtlasSVG.el(dot, "title").textContent = `${row.occupation}: AIOE ${row.score.toFixed(1)}${Number.isFinite(row.share) ? ` · share ${row.share.toFixed(2)}` : ""}`;
      if (labelCodes.has(row.code)) {
        AtlasSVG.el(svg, "text", {
          x: x(row.score) + radius + 3, y: cy + 3,
          fill: "#263238", "font-size": 8.5, "font-weight": 600,
        }).textContent = String(row.occupation).slice(0, 30);
      }
    });

    AtlasSVG.el(svg, "text", { x: margin.left, y: 24, fill: "#263238", "font-size": 14, "font-weight": 700 }).textContent = groupLabels[group];
    if (sceneIndex === 3) {
      AtlasSVG.el(svg, "text", {
        x: margin.left, y: 42, fill: "#546e7a", "font-size": 9.5,
      }).textContent = "Bundled data contain no US-specific employment weights; HIC is shown as a disclosed proxy.";
    }
    AtlasSVG.el(svg, "text", { x: x(50) + 6, y: plotTop - 12, fill: "#0071bc", "font-size": 10, "font-weight": 600 }).textContent = "High exposure (AIOE > 50)";
    AtlasSVG.el(svg, "text", { x: width / 2, y: height - 14, "text-anchor": "middle", fill: "#455a64", "font-size": 11 }).textContent = "Artificial Intelligence Occupational Exposure (AIOE), 0–100";
  },
};
