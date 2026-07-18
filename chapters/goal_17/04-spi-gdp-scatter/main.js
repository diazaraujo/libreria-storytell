/**
 * spi_gdp_scatter — log GDP vs SPI with regression expectation
 * "Income matters, but it is not destiny"
 */
window.AtlasReplica = {
  ready: true,
  isStub: false,

  async render(_scene, ctx) {
    const { config, chartEl, hidePlaceholder, colors } = ctx;
    hidePlaceholder();
    const rows = await AtlasLoad.csv("./data/17_data_spi_vs_gdp.csv");
    const data = rows
      .map((r) => ({
        iso3c: r.iso3c,
        spi: +r.spi_index,
        gdp: +r.gdp_per_capita,
        pred: +r.predicted_spi,
      }))
      .filter((d) => d.gdp > 0 && Number.isFinite(d.spi));

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.style.cssText =
      "position:absolute;inset:0;display:flex;flex-direction:column;font-family:'Open Sans',system-ui,sans-serif;background:#fff";
    const plot = document.createElement("div");
    plot.style.cssText = "flex:1;min-height:0;position:relative";
    const foot = document.createElement("div");
    foot.style.cssText =
      "display:flex;flex-wrap:wrap;gap:14px;padding:8px 16px 12px;font-size:12px;color:#6a7781";
    foot.innerHTML = `
      <span>X: GDP per capita (log) · Y: SPI (0–100)</span>
      <span style="color:#AA0000">● Over-performers (SPI ≫ predicted)</span>
      <span style="color:#8a969f">● On/under trend</span>
      <span style="color:#0071bc">— Expected SPI given income</span>`;
    root.appendChild(plot);
    root.appendChild(foot);
    chartEl.appendChild(root);

    const w = plot.clientWidth || 860;
    const h = plot.clientHeight || 460;
    const margin = { top: 24, right: 20, bottom: 40, left: 48 };
    const SVG = AtlasSVG;
    const svg = SVG.el(plot, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.cssText = "width:100%;height:100%";

    const xDomain = [
      Math.log10(Math.min(...data.map((d) => d.gdp)) * 0.9),
      Math.log10(Math.max(...data.map((d) => d.gdp)) * 1.1),
    ];
    const yDomain = [0, 100];
    const xScale = SVG.scaleLinear(xDomain, [margin.left, w - margin.right]);
    const yScale = SVG.scaleLinear(yDomain, [h - margin.bottom, margin.top]);

    const gAxis = SVG.el(svg, "g");
    const xTicks = [2.5, 3, 3.5, 4, 4.5, 5].filter(
      (t) => t >= xDomain[0] && t <= xDomain[1]
    );
    AtlasAxis.draw({
      g: gAxis,
      xScale,
      yScale,
      width: w,
      height: h,
      margin,
      xTicks,
      yTicks: [0, 20, 40, 60, 80, 100],
      xFormat: (v) => {
        const n = Math.pow(10, v);
        if (n >= 1e4) return "$" + Math.round(n / 1000) + "k";
        return "$" + Math.round(n);
      },
    });

    // predicted trend curve (sort by gdp)
    const trend = [...data].sort((a, b) => a.gdp - b.gdp);
    const dTrend = trend
      .map(
        (d, i) =>
          `${i ? "L" : "M"}${xScale(Math.log10(d.gdp)).toFixed(1)},${yScale(d.pred).toFixed(1)}`
      )
      .join(" ");
    SVG.el(svg, "path", {
      d: dTrend,
      fill: "none",
      stroke: "#0071bc",
      "stroke-width": 2,
      "stroke-dasharray": "5 4",
      opacity: 0.85,
    });

    const g = SVG.el(svg, "g");
    const callouts = new Set(
      (config.overperformers || "SEN,BFA,PHL,MEX,UZB").split(/[,\s]+/).filter(Boolean)
    );
    // also from data residual
    data.forEach((d) => {
      const over = d.spi - d.pred >= 8;
      const c = SVG.el(g, "circle", {
        cx: xScale(Math.log10(d.gdp)),
        cy: yScale(d.spi),
        r: callouts.has(d.iso3c) || over ? 5 : 3.8,
        fill: over || callouts.has(d.iso3c) ? "#AA0000" : "#8a969f",
        stroke: "#fff",
        "stroke-width": 1,
        opacity: 0.9,
      });
      const t = document.createElementNS("http://www.w3.org/2000/svg", "title");
      t.textContent = `${d.iso3c}\nSPI ${d.spi} (pred ${d.pred})\nGDP/cap ${Math.round(d.gdp)}`;
      c.appendChild(t);
    });

    // label a few overperformers
    ["SEN", "BFA", "MEX", "PHL", "UZB"].forEach((iso) => {
      const d = data.find((x) => x.iso3c === iso);
      if (!d) return;
      SVG.el(svg, "text", {
        x: xScale(Math.log10(d.gdp)) + 6,
        y: yScale(d.spi) - 6,
        fill: "#AA0000",
        "font-size": 11,
        "font-weight": "700",
      }).textContent = iso;
    });
  },
};
