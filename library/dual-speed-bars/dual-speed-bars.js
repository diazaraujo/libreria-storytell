/**
 * AtlasDualSpeedBars v0.1 — fixed vs mobile Mbps top-N ranked bars
 * Depends: AtlasSVG
 */
(function (global) {
  function ensureSVG() {
    if (!global.AtlasSVG) throw new Error("AtlasDualSpeedBars needs AtlasSVG");
    return global.AtlasSVG;
  }
  function mount(container, options = {}) {
    const SVG = ensureSVG();
    const {
      rows = [],
      names = global.ATLAS_COUNTRY_NAMES || {},
      topN = 22,
      height: heightOpt = null,
      fixedColor = "#081079",
      mobileColor = "#34A7F2",
    } = options;
    if (!container) throw new Error("container required");

    const fixed = rows
      .filter((r) => /Fixed/i.test(r.type))
      .map((r) => ({ iso: r.iso3c, mbps: +r.mbps }))
      .filter((d) => Number.isFinite(d.mbps))
      .sort((a, b) => b.mbps - a.mbps);
    const mobile = rows
      .filter((r) => /Mobile/i.test(r.type))
      .map((r) => ({ iso: r.iso3c, mbps: +r.mbps }))
      .filter((d) => Number.isFinite(d.mbps))
      .sort((a, b) => b.mbps - a.mbps);

    container.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-dual-speed atlas-chart-root";
    const w = Math.max(360, container.clientWidth || 900);
    const h = heightOpt || Math.max(420, container.clientHeight || 460);
    root.style.cssText = `position:relative;width:100%;height:${h}px;display:grid;grid-template-columns:1fr 1fr;font-family:'Open Sans',system-ui,sans-serif;background:#fff`;
    container.appendChild(root);

    const drawCol = (title, data, color) => {
      const col = document.createElement("div");
      col.style.cssText =
        "position:relative;padding:10px 6px;border-right:1px solid #e2e8f0;overflow:hidden";
      col.innerHTML = `<div style="font-weight:700;font-size:13px;margin:0 8px 6px;color:${color}">${title}</div><div class="plot" style="height:calc(100% - 28px)"></div>`;
      root.appendChild(col);
      const plot = col.querySelector(".plot");
      const top = data.slice(0, topN);
      const pw = plot.clientWidth || w / 2;
      const ph = plot.clientHeight || h - 40;
      const margin = { top: 4, right: 40, bottom: 4, left: 96 };
      const svg = SVG.el(plot, "svg");
      svg.setAttribute("viewBox", `0 0 ${pw} ${ph}`);
      svg.style.cssText = "width:100%;height:100%;display:block";
      const max = Math.max(...top.map((d) => d.mbps), 1);
      const xScale = SVG.scaleLinear([0, max], [margin.left, pw - margin.right]);
      const yScale = SVG.scaleBand(
        top.map((d) => d.iso),
        [margin.top, ph - margin.bottom],
        0.15
      );
      top.forEach((d) => {
        const y = yScale(d.iso);
        const bh = yScale.bandwidth();
        SVG.el(svg, "rect", {
          x: margin.left, y, width: Math.max(xScale(d.mbps) - margin.left, 1), height: bh,
          fill: color, rx: 2, opacity: 0.9,
        });
        SVG.el(svg, "text", {
          x: margin.left - 6, y: y + bh / 2, "text-anchor": "end", "dominant-baseline": "middle",
          fill: "#111", "font-size": 11, "font-weight": "600",
        }).textContent = names[d.iso] || d.iso;
        SVG.el(svg, "text", {
          x: xScale(d.mbps) + 4, y: y + bh / 2, "dominant-baseline": "middle",
          fill: color, "font-size": 11, "font-weight": "700",
        }).textContent = Math.round(d.mbps);
      });
    };
    drawCol("Fixed broadband · Mbps", fixed, fixedColor);
    drawCol("Mobile · Mbps", mobile, mobileColor);

    return { updateScene() {}, setScene() {}, destroy() { container.innerHTML = ""; }, version: "0.1.0" };
  }
  const api = { mount, version: "0.1.0" };
  global.AtlasDualSpeedBars = api;
  global.AtlasLibrary = global.AtlasLibrary || {};
  global.AtlasLibrary.DualSpeedBars = api;
})(typeof window !== "undefined" ? window : globalThis);
