/**
 * Vertical or horizontal beeswarm using shared Beeswarm packer.
 *
 * AtlasBeeswarmChart.mount(el, {
 *   data, value: d => d.spi, color: d => ...,
 *   orientation: 'vertical' | 'horizontal',
 *   domain: [0,100], radius: 3.5,
 * })
 */
window.AtlasBeeswarmChart = {
  mount(el, opts) {
    const SVG = window.AtlasSVG;
    const Beeswarm = window.Beeswarm;
    const data = opts.data || [];
    const width = opts.width || el.clientWidth || 800;
    const height = opts.height || el.clientHeight || 480;
    const margin = opts.margin || { top: 28, right: 20, bottom: 24, left: 44 };
    const value = opts.value || ((d) => d.value);
    const color = opts.color || (() => "#016B6C");
    const radius = opts.radius || 3.2;
    const domain = opts.domain || [0, 100];
    const vertical = (opts.orientation || "vertical") === "vertical";

    let svg = el.querySelector("svg");
    if (!svg) {
      svg = SVG.el(el, "svg");
      svg.style.cssText = "width:100%;height:100%;display:block";
    }
    SVG.clear(svg);
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;
    const mainScale = SVG.scaleLinear(
      domain,
      vertical
        ? [margin.top + innerH, margin.top]
        : [margin.left, margin.left + innerW]
    );

    const packer = new Beeswarm(data, radius, (d) => mainScale(value(d)));
    const nodes = packer.calculateYPositions();
    const center = vertical
      ? margin.left + innerW / 2
      : margin.top + innerH / 2;

    // grid
    const g = SVG.el(svg, "g");
    (opts.ticks || [20, 40, 60, 80, 100]).forEach((t) => {
      if (t < domain[0] || t > domain[1]) return;
      const p = mainScale(t);
      if (vertical) {
        SVG.el(g, "line", {
          x1: margin.left,
          x2: margin.left + innerW,
          y1: p,
          y2: p,
          stroke: "#eceef2",
        });
        SVG.el(g, "text", {
          x: margin.left - 8,
          y: p + 3,
          "text-anchor": "end",
          fill: "#6a7781",
          "font-size": 11,
        }).textContent = String(t);
      } else {
        SVG.el(g, "line", {
          x1: p,
          x2: p,
          y1: margin.top,
          y2: margin.top + innerH,
          stroke: "#eceef2",
        });
      }
    });

    const gDots = SVG.el(svg, "g");
    nodes.forEach((n) => {
      const cx = vertical ? center + n.y : n.x;
      const cy = vertical ? n.x : center + n.y;
      const c = SVG.el(gDots, "circle", {
        cx,
        cy,
        r: radius,
        fill: color(n.datum),
        stroke: "#fff",
        "stroke-width": 1,
        opacity: opts.opacity ? opts.opacity(n.datum) : 1,
      });
      if (opts.title) {
        const t = document.createElementNS("http://www.w3.org/2000/svg", "title");
        t.textContent = opts.title(n.datum);
        c.appendChild(t);
      }
    });

    return { svg, nodes, mainScale };
  },
};
