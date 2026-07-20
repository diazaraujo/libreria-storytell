/**
 * AtlasSlopeGapChart v0.1 — 3G coverage → Internet use slope chart
 * Depends: AtlasSVG
 */
(function (global) {
  function ensureSVG() {
    if (!global.AtlasSVG) throw new Error("AtlasSlopeGapChart needs AtlasSVG");
    return global.AtlasSVG;
  }
  function mount(container, options = {}) {
    const SVG = ensureSVG();
    const {
      rows = [],
      names = global.ATLAS_COUNTRY_NAMES || {},
      height: heightOpt = null,
      topGaps = 15,
    } = options;
    if (!container) throw new Error("container required");

    const data = rows
      .map((r) => ({
        iso: r.iso3c,
        access: +r.access,
        cov: +r.coverage_3G,
      }))
      .filter((d) => Number.isFinite(d.access) && Number.isFinite(d.cov));
    data.sort((a, b) => b.cov - b.access - (a.cov - a.access));

    container.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-slope-gap atlas-chart-root";
    const w = Math.max(320, container.clientWidth || 900);
    const h = heightOpt || Math.max(420, container.clientHeight || 480);
    root.style.cssText = `position:relative;width:100%;height:${h}px;font-family:'Open Sans',system-ui,sans-serif;background:#fff`;
    container.appendChild(root);

    const m = { top: 28, right: 140, bottom: 36, left: 48 };
    const svg = SVG.el(root, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.cssText = "width:100%;height:100%;display:block";
    const yS = SVG.scaleLinear([0, 100], [h - m.bottom, m.top]);
    const xL = m.left + 80;
    const xR = w - m.right - 40;

    [0, 25, 50, 75, 100].forEach((t) => {
      SVG.el(svg, "line", {
        x1: m.left, x2: w - m.right, y1: yS(t), y2: yS(t), stroke: "#f1f5f9",
      });
      SVG.el(svg, "text", {
        x: m.left - 8, y: yS(t) + 4, "text-anchor": "end", fill: "#6a7781", "font-size": 11,
      }).textContent = String(t);
    });
    SVG.el(svg, "line", { x1: xL, x2: xL, y1: m.top, y2: h - m.bottom, stroke: "#e2e8f0" });
    SVG.el(svg, "line", { x1: xR, x2: xR, y1: m.top, y2: h - m.bottom, stroke: "#e2e8f0" });
    SVG.el(svg, "text", {
      x: xL, y: h - m.bottom + 20, "text-anchor": "middle",
      fill: "#34A7F2", "font-size": 12, "font-weight": "700",
    }).textContent = "3G coverage";
    SVG.el(svg, "text", {
      x: xR, y: h - m.bottom + 20, "text-anchor": "middle",
      fill: "#FF9800", "font-size": 12, "font-weight": "700",
    }).textContent = "Internet use";

    const topGap = new Set(data.slice(0, topGaps).map((d) => d.iso));
    data.forEach((d) => {
      const gap = d.cov - d.access;
      const hi = topGap.has(d.iso);
      SVG.el(svg, "line", {
        x1: xL, x2: xR, y1: yS(d.cov), y2: yS(d.access),
        stroke: hi ? "#AA0000" : "#cbd5e1",
        "stroke-width": hi ? 2 : 1,
        opacity: hi ? 0.9 : 0.35,
      });
      SVG.el(svg, "circle", {
        cx: xL, cy: yS(d.cov), r: hi ? 3.5 : 2.2,
        fill: "#34A7F2", opacity: hi ? 1 : 0.45,
      });
      SVG.el(svg, "circle", {
        cx: xR, cy: yS(d.access), r: hi ? 3.5 : 2.2,
        fill: "#FF9800", opacity: hi ? 1 : 0.45,
      });
      if (hi) {
        SVG.el(svg, "text", {
          x: xR + 8, y: yS(d.access) + 3,
          fill: "#AA0000", "font-size": 11, "font-weight": "700",
        }).textContent = `${names[d.iso] || d.iso} (−${gap.toFixed(0)}pp)`;
      }
    });

    return { updateScene() {}, setScene() {}, destroy() { container.innerHTML = ""; }, version: "0.1.0" };
  }
  const api = { mount, version: "0.1.0" };
  global.AtlasSlopeGapChart = api;
  global.AtlasLibrary = global.AtlasLibrary || {};
  global.AtlasLibrary.SlopeGapChart = api;
})(typeof window !== "undefined" ? window : globalThis);
