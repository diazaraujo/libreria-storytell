/**
 * AtlasGenderGapBars v0.1 — male/female Internet use by income group
 * Depends: AtlasSVG
 */
(function (global) {
  function ensureSVG() {
    if (!global.AtlasSVG) throw new Error("AtlasGenderGapBars needs AtlasSVG");
    return global.AtlasSVG;
  }
  function mount(container, options = {}) {
    const SVG = ensureSVG();
    const {
      rows = [],
      order = ["LIC", "LMC", "UMC", "HIC"],
      labels = {
        LIC: "Low income",
        LMC: "Lower middle",
        UMC: "Upper middle",
        HIC: "High income",
      },
      femaleColor = "#DB95D7",
      maleColor = "#34A7F2",
      height: heightOpt = null,
    } = options;
    if (!container) throw new Error("container required");
    const data = order.map((k) => {
      const r = rows.find((x) => x.income_group === k);
      return {
        key: k,
        female: r ? +r.female : NaN,
        male: r ? +r.male : NaN,
      };
    }).filter((d) => Number.isFinite(d.female) && Number.isFinite(d.male));

    container.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-gender-gap atlas-chart-root";
    const w = Math.max(320, container.clientWidth || 860);
    const h = heightOpt || Math.max(360, container.clientHeight || 400);
    root.style.cssText = `position:relative;width:100%;height:${h}px;font-family:'Open Sans',system-ui,sans-serif;background:#fff`;
    container.appendChild(root);
    const foot = document.createElement("div");
    foot.style.cssText =
      "position:absolute;top:8px;right:16px;display:flex;gap:12px;font-size:12px;font-weight:600;z-index:2";
    foot.innerHTML = `<span><i style="width:10px;height:10px;background:${femaleColor};display:inline-block;margin-right:4px;border-radius:2px"></i>Female</span>
      <span><i style="width:10px;height:10px;background:${maleColor};display:inline-block;margin-right:4px;border-radius:2px"></i>Male</span>
      <span style="color:#6a7781;font-weight:500">Internet use</span>`;
    root.appendChild(foot);

    const margin = { top: 36, right: 24, bottom: 52, left: 48 };
    const svg = SVG.el(root, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.cssText = "width:100%;height:100%;display:block";
    const xScale = SVG.scaleBand(order, [margin.left, w - margin.right], 0.25);
    const yScale = SVG.scaleLinear([0, 100], [h - margin.bottom, margin.top]);
    const bw = xScale.bandwidth();

    [0, 25, 50, 75, 100].forEach((t) => {
      SVG.el(svg, "line", {
        x1: margin.left, x2: w - margin.right, y1: yScale(t), y2: yScale(t), stroke: "#f1f5f9",
      });
      SVG.el(svg, "text", {
        x: margin.left - 8, y: yScale(t) + 4, "text-anchor": "end", fill: "#6a7781", "font-size": 11,
      }).textContent = t + "%";
    });

    data.forEach((d) => {
      const x0 = xScale(d.key);
      const barW = bw * 0.38;
      SVG.el(svg, "rect", {
        x: x0, y: yScale(d.female), width: barW, height: yScale(0) - yScale(d.female),
        fill: femaleColor, rx: 3,
      });
      SVG.el(svg, "text", {
        x: x0 + barW / 2, y: yScale(d.female) - 6, "text-anchor": "middle",
        fill: femaleColor, "font-size": 12, "font-weight": "700",
      }).textContent = d.female.toFixed(1);
      SVG.el(svg, "rect", {
        x: x0 + barW + bw * 0.08, y: yScale(d.male), width: barW,
        height: yScale(0) - yScale(d.male), fill: maleColor, rx: 3,
      });
      SVG.el(svg, "text", {
        x: x0 + barW + bw * 0.08 + barW / 2, y: yScale(d.male) - 6, "text-anchor": "middle",
        fill: maleColor, "font-size": 12, "font-weight": "700",
      }).textContent = d.male.toFixed(1);
      const gap = d.male - d.female;
      if (gap > 5) {
        SVG.el(svg, "text", {
          x: x0 + bw / 2, y: h - margin.bottom + 34, "text-anchor": "middle",
          fill: "#AA0000", "font-size": 11, "font-weight": "600",
        }).textContent = `gap ${gap.toFixed(1)} pp`;
      }
      SVG.el(svg, "text", {
        x: x0 + bw / 2, y: h - margin.bottom + 18, "text-anchor": "middle",
        fill: "#111", "font-size": 12, "font-weight": "700",
      }).textContent = labels[d.key] || d.key;
    });

    return { updateScene() {}, setScene() {}, destroy() { container.innerHTML = ""; }, version: "0.1.0" };
  }
  const api = { mount, version: "0.1.0" };
  global.AtlasGenderGapBars = api;
  global.AtlasLibrary = global.AtlasLibrary || {};
  global.AtlasLibrary.GenderGapBars = api;
})(typeof window !== "undefined" ? window : globalThis);
