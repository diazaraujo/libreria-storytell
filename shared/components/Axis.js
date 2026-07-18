/**
 * Draw simple X/Y axes + grid into an SVG group.
 * opts: { g, xScale, yScale, width, height, margin, xTicks, yTicks, xFormat, yFormat }
 */
window.AtlasAxis = {
  /** Pretty number labels (avoids 0.014999999999 style garbage). */
  fmt(v) {
    if (v == null || !Number.isFinite(+v)) return String(v ?? "");
    const n = +v;
    const a = Math.abs(n);
    if (a >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
    if (a >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
    if (a >= 1e4) return (n / 1e3).toFixed(0) + "k";
    if (Number.isInteger(n) || Math.abs(n - Math.round(n)) < 1e-6) return String(Math.round(n));
    if (a >= 100) return n.toFixed(0);
    if (a >= 10) return n.toFixed(1);
    if (a >= 1) return n.toFixed(2);
    return n.toFixed(2);
  },

  draw(opts) {
    const {
      g,
      xScale,
      yScale,
      width,
      height,
      margin,
      xTicks = [],
      yTicks = [],
      xFormat = (v) => window.AtlasAxis.fmt(v),
      yFormat = (v) => window.AtlasAxis.fmt(v),
    } = opts;
    const SVG = window.AtlasSVG;
    SVG.clear(g);

    const innerW = width - margin.left - margin.right;

    yTicks.forEach((t) => {
      const y = yScale(t);
      if (!Number.isFinite(y)) return;
      SVG.el(g, "line", {
        x1: margin.left,
        x2: margin.left + innerW,
        y1: y,
        y2: y,
        stroke: "#eceef2",
      });
      SVG.el(g, "text", {
        x: margin.left - 8,
        y: y + 3,
        "text-anchor": "end",
        fill: "#6a7781",
        "font-size": 11,
      }).textContent = yFormat(t);
    });

    xTicks.forEach((t) => {
      const x = typeof xScale === "function" ? xScale(t) : t;
      if (!Number.isFinite(x)) return;
      SVG.el(g, "text", {
        x,
        y: height - 10,
        "text-anchor": "middle",
        fill: "#6a7781",
        "font-size": 11,
      }).textContent = xFormat(t);
    });
  },
};
