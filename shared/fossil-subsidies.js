/** Semantic multi-scene renderer for the two fossil-fuel subsidy scrollers. */
(function initFossilSubsidies(global) {
  "use strict";

  const COLORS = { subsidy: "#e76f51", external: "#6c4ab6", country: "#0071bc" };

  function frame(chartEl) {
    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText = "position:relative;width:100%;height:100%;font-family:Open Sans,system-ui,sans-serif";
    chartEl.appendChild(root);
    const width = root.clientWidth || 900;
    const height = Math.max(root.clientHeight || 440, 360);
    const svg = AtlasSVG.el(root, "svg", { viewBox: `0 0 ${width} ${height}` });
    svg.style.cssText = "width:100%;height:100%";
    return { root, svg, width, height };
  }

  function label(svg, text, x, y, attrs = {}) {
    AtlasSVG.el(svg, "text", {
      x, y, fill: "#263238", "font-size": 12, "font-weight": 600, ...attrs,
    }).textContent = text;
  }

  function renderColumns(chartEl, rows, contract, sceneId) {
    const fields = AtlasLoad.validateContract(rows, contract, "fossil subsidy time series");
    const data = rows.map((row) => {
      const subsidy = Number(row[fields.subsidy]);
      const implicit = Number(row[fields.implicit]);
      let value = subsidy;
      let unit = "USD billions";
      let color = COLORS.subsidy;
      if (sceneId === "column_pct_gdp") {
        value = Number(row[fields.percentGdp]);
        unit = "% of GDP";
      } else if (sceneId === "column_total_externalities") {
        value = implicit;
        color = COLORS.external;
      } else if (sceneId === "column_pct_externalities") {
        value = 100 * implicit / (implicit + subsidy);
        unit = "% of total damages";
        color = COLORS.external;
      }
      return { year: Number(row[fields.year]), value };
    }).filter((row) => Number.isFinite(row.year) && Number.isFinite(row.value));

    const { svg, width, height } = frame(chartEl);
    const margin = { top: 34, right: 30, bottom: 48, left: 58 };
    const max = Math.max(...data.map((row) => row.value), 1);
    const x = AtlasSVG.scaleBand(data.map((row) => row.year), [margin.left, width - margin.right], 0.24);
    const y = AtlasSVG.scaleLinear([0, max * 1.08], [height - margin.bottom, margin.top]);
    AtlasSVG.el(svg, "line", { x1: margin.left, x2: width - margin.right, y1: height - margin.bottom, y2: height - margin.bottom, stroke: "#607d8b" });
    data.forEach((row) => {
      const top = y(row.value);
      AtlasSVG.el(svg, "rect", {
        x: x(row.year), y: top, width: x.bandwidth(), height: height - margin.bottom - top,
        fill: color, rx: 2,
      });
      label(svg, String(row.year), x(row.year) + x.bandwidth() / 2, height - 25, { "text-anchor": "middle", "font-size": 10 });
      label(svg, row.value.toLocaleString(undefined, { maximumFractionDigits: 1 }), x(row.year) + x.bandwidth() / 2, top - 7, { "text-anchor": "middle", "font-size": 10, fill: color });
    });
    label(svg, unit, margin.left, 18, { "font-size": 11, fill: "#546e7a" });
  }

  function renderRankedMapData(chartEl, rows, contract, sceneId) {
    const fields = AtlasLoad.validateContract(rows, contract, "fossil subsidy country map data");
    const valueColumn = sceneId === "map_pct_gdp" ? fields.end : fields.change;
    const data = rows.map((row) => ({
      country: row[fields.country], value: Number(row[valueColumn]),
    })).filter((row) => row.country && Number.isFinite(row.value))
      .sort((a, b) => b.value - a.value).slice(0, 18);
    const { svg, width, height } = frame(chartEl);
    const margin = { top: 26, right: 56, bottom: 24, left: 136 };
    const max = Math.max(...data.map((row) => row.value), 1);
    const x = AtlasSVG.scaleLinear([0, max], [margin.left, width - margin.right]);
    const y = AtlasSVG.scaleBand(data.map((row) => row.country), [margin.top, height - margin.bottom], 0.18);
    data.forEach((row) => {
      const top = y(row.country);
      AtlasSVG.el(svg, "rect", { x: margin.left, y: top, width: Math.max(1, x(row.value) - margin.left), height: y.bandwidth(), fill: COLORS.country, rx: 2 });
      label(svg, row.country, margin.left - 7, top + y.bandwidth() / 2, { "text-anchor": "end", "dominant-baseline": "middle", "font-size": 10 });
      label(svg, row.value.toFixed(1), x(row.value) + 5, top + y.bandwidth() / 2, { "dominant-baseline": "middle", "font-size": 10, fill: COLORS.country });
    });
  }

  function renderBubble(chartEl, rows, contract, sceneId) {
    let data = AtlasLoad.fossilSubsidies(rows, contract).filter((row) =>
      row.year === 2022 &&
      Number.isFinite(row.perCapita) &&
      Number.isFinite(row.gdpPerCapita) &&
      Number.isFinite(row.population)
    );
    if (sceneId === "bubble_low") {
      data = data.filter((row) =>
        row.incomeGroup === "High-income country" && row.perCapita < 30
      );
    }
    const { svg, width, height } = frame(chartEl);
    const margin = { top: 28, right: 34, bottom: 54, left: 64 };
    const maxX = Math.max(...data.map((row) => row.gdpPerCapita), 1);
    const maxY = Math.max(...data.map((row) => row.perCapita), 1);
    const maxPopulation = Math.max(...data.map((row) => row.population), 1);
    const x = AtlasSVG.scaleLinear([0, maxX], [margin.left, width - margin.right]);
    const y = AtlasSVG.scaleLinear([0, maxY], [height - margin.bottom, margin.top]);
    data.forEach((row) => {
      const radius = 2.5 + 13 * Math.sqrt(Math.max(row.population, 0) / maxPopulation);
      const dot = AtlasSVG.el(svg, "circle", { cx: x(row.gdpPerCapita), cy: y(row.perCapita), r: radius, fill: COLORS.subsidy, opacity: 0.55, stroke: "#fff" });
      AtlasSVG.el(dot, "title").textContent = `${row.country}: $${row.perCapita.toFixed(1)} per capita`;
    });
    label(svg, "GDP per capita (2021 USD)", width / 2, height - 17, { "text-anchor": "middle", "font-size": 11 });
    label(svg, "Subsidy per capita (USD)", margin.left, 17, { "font-size": 11 });
    if (sceneId === "bubble_low") {
      label(svg, "High-income countries below USD 30 per capita", width - margin.right, 17, {
        "text-anchor": "end", "font-size": 10, fill: "#546e7a",
      });
    }
  }

  async function render(scene, ctx) {
    const { chartEl, config, hidePlaceholder, sceneIndex } = ctx;
    hidePlaceholder();
    const sceneId = scene && scene.id || config.scenes?.[sceneIndex]?.id || "column_total";
    const contracts = config.dataContract.datasets;
    if (sceneId.startsWith("column_")) {
      const rows = await AtlasLoad.csv(`./data/${contracts.column.file}`);
      renderColumns(chartEl, rows, contracts.column, sceneId);
    } else if (sceneId.startsWith("map_")) {
      const rows = await AtlasLoad.csv(`./data/${contracts.map.file}`);
      renderRankedMapData(chartEl, rows, contracts.map, sceneId);
    } else {
      const rows = await AtlasLoad.csv(`./data/${contracts.bubble.file}`);
      renderBubble(chartEl, rows, contracts.bubble, sceneId);
    }
  }

  global.AtlasFossilSubsidies = { render };
})(window);
