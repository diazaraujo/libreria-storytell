/**
 * nigeria_poverty_extrapolation — dual-line survey vs extrapolation (Atlas fidelity)
 */
window.AtlasReplica = {
  ready: true,
  isStub: false,

  async render(scene, ctx) {
    const { config, chartEl, hidePlaceholder, sceneIndex } = ctx;
    hidePlaceholder();
    const rows = await AtlasLoad.csv("./data/17_data_nigeria_poverty.csv");

    const survey = rows
      .filter((r) => r.type === "survey")
      .map((r) => ({ x: +r.year, y: +r.value, series: "survey" }));
    const extrap = rows
      .filter((r) => r.type === "extrapolated")
      .map((r) => ({ x: +r.year, y: +r.value, series: "extrapolated" }));

    const id = scene?.id || "";
    let data = [];
    let showDiff = false;
    if (id === "initial_survey" || sceneIndex === 0) {
      data = survey.filter((d) => d.x <= 2018);
    } else if (id === "extapolation" || sceneIndex === 1) {
      data = [
        ...survey.filter((d) => d.x <= 2018),
        ...extrap.filter((d) => d.x >= 2018 && d.x <= 2022),
      ];
    } else if (id === "new_survey" || sceneIndex === 2) {
      data = [...survey, ...extrap.filter((d) => d.x >= 2018)];
    } else {
      data = [...survey, ...extrap.filter((d) => d.x >= 2018)];
      showDiff = true;
    }

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.style.cssText =
      "position:absolute;inset:0;display:flex;flex-direction:column;font-family:'Open Sans',system-ui,sans-serif;background:#fff";
    const plot = document.createElement("div");
    plot.style.cssText = "flex:1;min-height:0;position:relative";
    const legend = document.createElement("div");
    legend.style.cssText =
      "display:flex;gap:16px;padding:6px 16px 10px;font-size:12px;color:#6a7781";
    legend.innerHTML = `
      <span><i style="display:inline-block;width:16px;height:3px;background:#0071bc;vertical-align:middle;margin-right:6px"></i>Survey-based</span>
      <span><i style="display:inline-block;width:16px;height:3px;background:#be62d0;vertical-align:middle;margin-right:6px;border-top:1px dashed #be62d0"></i>Extrapolated (national accounts)</span>`;
    root.appendChild(plot);
    root.appendChild(legend);
    chartEl.appendChild(root);

    // custom dual-line with annotations
    const w = plot.clientWidth || 800;
    const h = plot.clientHeight || 420;
    const margin = { top: 28, right: 24, bottom: 36, left: 48 };
    const SVG = AtlasSVG;
    const svg = SVG.el(plot, "svg");
    svg.style.cssText = "width:100%;height:100%";
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);

    const yDomain = [0, 50];
    const xDomain = [2017.5, 2022.5];
    const xScale = SVG.scaleLinear(xDomain, [margin.left, w - margin.right]);
    const yScale = SVG.scaleLinear(yDomain, [h - margin.bottom, margin.top]);

    const gAxis = SVG.el(svg, "g");
    AtlasAxis.draw({
      g: gAxis,
      xScale,
      yScale,
      width: w,
      height: h,
      margin,
      xTicks: [2018, 2019, 2020, 2021, 2022],
      yTicks: [0, 10, 20, 30, 40, 50],
      xFormat: (v) => String(Math.round(v)),
      yFormat: (v) => String(v),
    });
    SVG.el(svg, "text", {
      x: 14,
      y: margin.top - 8,
      fill: "#6a7781",
      "font-size": 11,
    }).textContent = (config.y_axis_title || "Poverty rate") + " (%)";

    const pathOf = (pts, series) => {
      const p = data
        .filter((d) => d.series === series)
        .sort((a, b) => a.x - b.x);
      if (p.length < 2) {
        // single point as circle only
        p.forEach((d) => {
          SVG.el(svg, "circle", {
            cx: xScale(d.x),
            cy: yScale(d.y),
            r: 5,
            fill: series === "survey" ? "#0071bc" : "#be62d0",
            stroke: "#fff",
            "stroke-width": 2,
          });
        });
        return;
      }
      const d = p
        .map(
          (pt, i) =>
            `${i ? "L" : "M"}${xScale(pt.x).toFixed(1)},${yScale(pt.y).toFixed(1)}`
        )
        .join(" ");
      SVG.el(svg, "path", {
        d,
        fill: "none",
        stroke: series === "survey" ? "#0071bc" : "#be62d0",
        "stroke-width": 3,
        "stroke-linecap": "round",
        "stroke-dasharray": series === "extrapolated" ? "6 4" : "none",
      });
      p.forEach((pt) => {
        SVG.el(svg, "circle", {
          cx: xScale(pt.x),
          cy: yScale(pt.y),
          r: 4.5,
          fill: series === "survey" ? "#0071bc" : "#be62d0",
          stroke: "#fff",
          "stroke-width": 1.5,
        });
      });
    };

    pathOf(data, "extrapolated");
    pathOf(data, "survey");

    // end labels
    const lastSurvey = [...survey].sort((a, b) => a.x - b.x).at(-1);
    const lastEx = [...extrap].sort((a, b) => a.x - b.x).at(-1);
    if (lastSurvey && (sceneIndex >= 2 || id === "new_survey" || id === "difference")) {
      SVG.el(svg, "text", {
        x: xScale(lastSurvey.x) + 8,
        y: yScale(lastSurvey.y) + 4,
        fill: "#0071bc",
        "font-size": 12,
        "font-weight": "700",
      }).textContent = `${lastSurvey.y}%`;
    }
    if (lastEx && sceneIndex >= 1) {
      SVG.el(svg, "text", {
        x: xScale(lastEx.x) + 8,
        y: yScale(lastEx.y) + 4,
        fill: "#be62d0",
        "font-size": 12,
        "font-weight": "700",
      }).textContent = `${lastEx.y}%`;
    }

    if (showDiff && lastSurvey && lastEx) {
      // vertical gap brace at 2022
      const x = xScale(2022);
      SVG.el(svg, "line", {
        x1: x + 28,
        x2: x + 28,
        y1: yScale(lastSurvey.y),
        y2: yScale(lastEx.y),
        stroke: "#AA0000",
        "stroke-width": 2,
      });
      const mid = (yScale(lastSurvey.y) + yScale(lastEx.y)) / 2;
      SVG.el(svg, "text", {
        x: x + 34,
        y: mid + 4,
        fill: "#AA0000",
        "font-size": 12,
        "font-weight": "700",
      }).textContent = `+${(lastSurvey.y - lastEx.y).toFixed(1)} pp`;
    }
  },
};
