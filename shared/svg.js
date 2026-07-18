/** Tiny SVG helpers (no framework). */
window.AtlasSVG = {
  el(parent, tag, attrs = {}) {
    const ns = "http://www.w3.org/2000/svg";
    const n = document.createElementNS(ns, tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null) continue;
      n.setAttribute(k, v);
    }
    if (parent) parent.appendChild(n);
    return n;
  },

  clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  },

  /** Linear scale */
  scaleLinear(domain, range) {
    const [d0, d1] = domain;
    const [r0, r1] = range;
    const m = d1 === d0 ? 0 : (r1 - r0) / (d1 - d0);
    const f = (v) => r0 + (v - d0) * m;
    f.domain = domain;
    f.range = range;
    f.invert = (y) => d0 + (y - r0) / (m || 1);
    return f;
  },

  scaleBand(domain, range, padding = 0.1) {
    const [r0, r1] = range;
    const n = domain.length || 1;
    const step = (r1 - r0) / n;
    const pad = step * padding;
    const bw = step - pad;
    const map = new Map(domain.map((d, i) => [d, r0 + i * step + pad / 2]));
    const f = (d) => map.get(d) ?? r0;
    f.bandwidth = () => bw;
    f.step = () => step;
    f.domain = domain;
    return f;
  },

  line(points, x, y) {
    return points
      .map((p, i) => `${i ? "L" : "M"}${x(p)},${y(p)}`)
      .join(" ");
  },
};
