/**
 * AtlasDualThresholdBars v0.1
 * Grouped bars for two thresholds per category (e.g. arsenic ≥10 / ≥50 ppb by source).
 *
 * Depends: AtlasSVG
 */
(function (global) {
  function ensureSVG() {
    if (!global.AtlasSVG) throw new Error("AtlasDualThresholdBars needs AtlasSVG");
    return global.AtlasSVG;
  }

  function mount(container, options = {}) {
    const SVG = ensureSVG();
    const {
      rows = [],
      labelField = "source",
      aField = "pct10ppb",
      bField = "pct50ppb",
      aColor = "#fbbf24",
      bColor = "#AA0000",
      aLabel = "≥10 ppb",
      bLabel = "≥50 ppb",
      height: heightOpt = null,
    } = options;

    if (!container) throw new Error("container required");

    const data = rows.map((r) => ({
      label: r[labelField] || r.source,
      a: +(r[aField] != null ? r[aField] : r.pct10),
      b: +(r[bField] != null ? r[bField] : r.pct50),
    }));

    container.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-dual-threshold atlas-chart-root";
    const w = Math.max(320, container.clientWidth || 800);
    const h = heightOpt || Math.max(380, container.clientHeight || 420);
    root.style.cssText = `position:relative;width:100%;height:${h}px;font-family:'Open Sans',system-ui,sans-serif;background:#fff;display:flex;flex-direction:column`;
    container.appendChild(root);

    const leg = document.createElement("div");
    leg.style.cssText =
      "display:flex;flex-wrap:wrap;gap:10px 16px;padding:8px 8px 0;font-size:12px;font-weight:600;color:#3d4a54";
    leg.innerHTML = `
      <span><i style="display:inline-block;width:11px;height:11px;border-radius:2px;background:${aColor};margin-right:5px"></i>${aLabel}</span>
      <span><i style="display:inline-block;width:11px;height:11px;border-radius:2px;background:${bColor};margin-right:5px"></i>${bLabel}</span>`;
    root.appendChild(leg);

    const plot = document.createElement("div");
    plot.style.cssText = "flex:1;min-height:0";
    root.appendChild(plot);

    const pw = plot.clientWidth || w;
    const ph = plot.clientHeight || h - 36;
    const margin = { top: 28, right: 20, bottom: 48, left: 48 };
    const svg = SVG.el(plot, "svg");
    svg.setAttribute("viewBox", `0 0 ${pw} ${ph}`);
    svg.style.cssText = "width:100%;height:100%;display:block";

    const maxV = Math.max(...data.flatMap((d) => [d.a || 0, d.b || 0]), 1);
    const yScale = (v) =>
      ph - margin.bottom - ((ph - margin.top - margin.bottom) * v) / maxV;

    [0, 5, 10, 15, 20, 25]
      .filter((t) => t <= maxV * 1.1)
      .forEach((t) => {
        const y = yScale(t);
        SVG.el(svg, "line", {
          x1: margin.left,
          x2: pw - margin.right,
          y1: y,
          y2: y,
          stroke: "#eef1f5",
        });
        SVG.el(svg, "text", {
          x: margin.left - 8,
          y: y + 4,
          "text-anchor": "end",
          fill: "#6a7781",
          "font-size": 11,
        }).textContent = t + "%";
      });

    const bw = (pw - margin.left - margin.right) / Math.max(data.length, 1);
    data.forEach((d, i) => {
      [
        [d.a, aColor, 0.15],
        [d.b, bColor, 0.5],
      ].forEach(([v, c, off]) => {
        if (!Number.isFinite(v)) return;
        const y = yScale(v);
        SVG.el(svg, "rect", {
          x: margin.left + i * bw + bw * off,
          y,
          width: bw * 0.3,
          height: Math.max(0, ph - margin.bottom - y),
          fill: c,
          rx: 2,
        });
        SVG.el(svg, "text", {
          x: margin.left + i * bw + bw * (off + 0.15),
          y: y - 6,
          "text-anchor": "middle",
          fill: "#111",
          "font-size": 12,
          "font-weight": "600",
        }).textContent = v + "%";
      });
      SVG.el(svg, "text", {
        x: margin.left + i * bw + bw / 2,
        y: ph - margin.bottom + 22,
        "text-anchor": "middle",
        fill: "#111",
        "font-size": 13,
        "font-weight": "600",
      }).textContent = d.label;
    });

    return {
      updateScene() {},
      setScene() {},
      destroy() {
        try {
          container.innerHTML = "";
        } catch (_) {}
      },
      version: "0.1.0",
    };
  }

  const api = { mount, version: "0.1.0" };
  global.AtlasDualThresholdBars = api;
  global.AtlasLibrary = global.AtlasLibrary || {};
  global.AtlasLibrary.DualThresholdBars = api;
})(typeof window !== "undefined" ? window : globalThis);
