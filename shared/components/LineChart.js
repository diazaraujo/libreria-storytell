/**
 * Simple multi/single line chart component.
 *
 * AtlasLineChart.mount(el, {
 *   data: [{x, y, series?}],
 *   x: d => d.x,
 *   y: d => d.y,
 *   series: d => d.series, // optional
 *   colors: { default: '#0071bc' },
 *   margin, width, height,
 *   yDomain: [0,100],
 * })
 */
window.AtlasLineChart = {
  mount(el, opts) {
    const SVG = window.AtlasSVG;
    const data = opts.data || [];
    const width = opts.width || el.clientWidth || 800;
    const height = opts.height || el.clientHeight || 420;
    const margin = opts.margin || { top: 20, right: 20, bottom: 36, left: 48 };
    const xAcc = opts.x || ((d) => d.x);
    const yAcc = opts.y || ((d) => d.y);
    const sAcc = opts.series || ((d) => d.series || "default");

    let svg = el.querySelector("svg");
    if (!svg) {
      svg = SVG.el(el, "svg");
      svg.style.width = "100%";
      svg.style.height = "100%";
    }
    SVG.clear(svg);
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

    if (!data.length) return { svg, update: () => {} };

    const xs = data.map(xAcc).filter((v) => v != null && Number.isFinite(+v));
    const ys = data.map(yAcc).filter((v) => v != null && Number.isFinite(+v));
    if (!xs.length || !ys.length) return { svg };

    let x0 = Math.min(...xs);
    let x1 = Math.max(...xs);
    if (x0 === x1) {
      x0 -= 1;
      x1 += 1;
    }
    const xDomain = opts.xDomain || [x0, x1];
    const yDomain = opts.yDomain || [0, Math.max(...ys) * 1.05 || 1];
    const xScale = SVG.scaleLinear(xDomain, [
      margin.left,
      width - margin.right,
    ]);
    const yScale = SVG.scaleLinear(yDomain, [
      height - margin.bottom,
      margin.top,
    ]);

    const gAxis = SVG.el(svg, "g");
    const yTicks =
      opts.yTicks ||
      [0, 0.25, 0.5, 0.75, 1].map((t) => yDomain[0] + t * (yDomain[1] - yDomain[0]));
    const xTicks =
      opts.xTicks ||
      [0, 0.25, 0.5, 0.75, 1].map((t) => xDomain[0] + t * (xDomain[1] - xDomain[0]));
    window.AtlasAxis?.draw({
      g: gAxis,
      xScale,
      yScale,
      width,
      height,
      margin,
      xTicks,
      yTicks,
      xFormat: opts.xFormat,
      yFormat: opts.yFormat,
    });

    const bySeries = new Map();
    data.forEach((d) => {
      const s = sAcc(d);
      if (!bySeries.has(s)) bySeries.set(s, []);
      bySeries.get(s).push(d);
    });

    const colors = opts.colors || {};
    const gLines = SVG.el(svg, "g");
    for (const [s, rows] of bySeries) {
      rows.sort((a, b) => xAcc(a) - xAcc(b));
      const d = rows
        .map(
          (p, i) =>
            `${i ? "L" : "M"}${xScale(xAcc(p)).toFixed(1)},${yScale(yAcc(p)).toFixed(1)}`
        )
        .join(" ");
      SVG.el(gLines, "path", {
        d,
        fill: "none",
        stroke: colors[s] || colors.default || "#0071bc",
        "stroke-width": opts.strokeWidth || 2.5,
        "stroke-linejoin": "round",
        "stroke-linecap": "round",
      });
    }

    return { svg, xScale, yScale, width, height };
  },
};
