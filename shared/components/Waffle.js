/**
 * Simple waffle / unit chart.
 * AtlasWaffle.mount(el, { total, filled, cols, colors: { on, off }, cell })
 */
window.AtlasWaffle = {
  mount(el, opts) {
    const total = opts.total || 100;
    const filled = Math.max(0, Math.min(total, opts.filled || 0));
    const cols = opts.cols || 10;
    const cell = opts.cell || 14;
    const gap = opts.gap ?? 3;
    const on = (opts.colors && opts.colors.on) || "#0071bc";
    const off = (opts.colors && opts.colors.off) || "#e8eaef";
    const rows = Math.ceil(total / cols);

    const width = cols * (cell + gap) - gap;
    const height = rows * (cell + gap) - gap;

    el.innerHTML = "";
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.style.width = "100%";
    svg.style.maxWidth = `${width * 1.2}px`;
    svg.style.height = "auto";
    el.appendChild(svg);

    for (let i = 0; i < total; i++) {
      const c = i % cols;
      const r = Math.floor(i / cols);
      const rect = document.createElementNS(svgNS, "rect");
      rect.setAttribute("x", c * (cell + gap));
      rect.setAttribute("y", r * (cell + gap));
      rect.setAttribute("width", cell);
      rect.setAttribute("height", cell);
      rect.setAttribute("rx", 2);
      rect.setAttribute("fill", i < filled ? on : off);
      svg.appendChild(rect);
    }
    return { svg, total, filled };
  },
};
