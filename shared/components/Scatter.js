/**
 * Basic scatter plot.
 * AtlasScatter.mount(el, { data, x, y, color, r, xDomain, yDomain, ... })
 */
window.AtlasScatter = {
  mount(el, opts) {
    const SVG = window.AtlasSVG;
    const data = opts.data || [];
    const width = opts.width || el.clientWidth || 800;
    const height = opts.height || el.clientHeight || 480;
    const margin = opts.margin || { top: 20, right: 20, bottom: 40, left: 52 };
    const xAcc = opts.x || ((d) => d.x);
    const yAcc = opts.y || ((d) => d.y);
    const rAcc = opts.r || (() => opts.radius || 4);
    const color = opts.color || (() => "#0071bc");

    let svg = el.querySelector("svg");
    if (!svg) {
      svg = SVG.el(el, "svg");
      svg.style.cssText = "width:100%;height:100%;display:block";
    }
    SVG.clear(svg);
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    if (!data.length) return { svg };

    const xs = data.map(xAcc);
    const ys = data.map(yAcc);
    const xDomain = opts.xDomain || [Math.min(...xs), Math.max(...xs)];
    const yDomain = opts.yDomain || [Math.min(...ys), Math.max(...ys)];
    const xScale = SVG.scaleLinear(xDomain, [
      margin.left,
      width - margin.right,
    ]);
    const yScale = SVG.scaleLinear(yDomain, [
      height - margin.bottom,
      margin.top,
    ]);

    const gAxis = SVG.el(svg, "g");
    const yTicks = opts.yTicks || niceTicks(yDomain, 5);
    const xTicks = opts.xTicks || niceTicks(xDomain, 5);
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

    const g = SVG.el(svg, "g");
    data.forEach((d) => {
      const c = SVG.el(g, "circle", {
        cx: xScale(xAcc(d)),
        cy: yScale(yAcc(d)),
        r: rAcc(d),
        fill: color(d),
        stroke: "#fff",
        "stroke-width": 1,
        opacity: opts.opacity ? opts.opacity(d) : 0.9,
      });
      if (opts.title) {
        const t = document.createElementNS("http://www.w3.org/2000/svg", "title");
        t.textContent = opts.title(d);
        c.appendChild(t);
      }
    });

    return { svg, xScale, yScale };
  },
};

function niceTicks([a, b], n) {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return [0, 1];
  if (a === b) {
    const pad = Math.abs(a) * 0.1 || 1;
    return [a - pad, a, a + pad];
  }
  const span = b - a;
  const step = span / n;
  const out = [];
  for (let i = 0; i <= n; i++) {
    // round to reduce float noise
    const v = a + step * i;
    const decimals = Math.max(0, Math.min(4, 2 - Math.floor(Math.log10(Math.abs(step) || 1))));
    out.push(+v.toFixed(decimals));
  }
  return out;
}
