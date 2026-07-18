/**
 * tanzania_typical_progress — Tanzania path vs typical multi-series lines
 */
window.AtlasReplica = {
  ready: true, isStub: false,
  async render(scene, ctx) {
    const { chartEl, hidePlaceholder, sceneIndex } = ctx;
    hidePlaceholder();
    const tz = await AtlasLoad.csv("./data/tanzania_drinking_water.csv");
    const typical = await AtlasLoad.csv("./data/drinking_water_typical_paths.csv");
    const colors = { accessibility: "#0080c6", quality: "#0c7c68", availability: "#f59e0b" };

    let data = [];
    const id = scene?.id || "";
    // Tanzania real series: year, series, value
    const tzData = tz.map((r) => ({
      x: +r.year, y: +r.value, series: "TZ-" + r.series, kind: r.series, src: "tz",
    }));
    // typical: y is level, time is years from start — map time+2000 as x approx
    const typData = typical.map((r) => ({
      x: 2000 + (+r.time || 0),
      y: +r.y,
      series: "TYP-" + r.series,
      kind: r.series,
      src: "typ",
    }));

    if (sceneIndex <= 1 || id.includes("tanzania")) {
      data = tzData;
      if (sceneIndex === 0) data = data.filter((d) => d.x <= 2005);
    } else if (sceneIndex === 2) {
      data = [...tzData, ...typData.filter((d) => d.x <= 2024)];
    } else {
      data = [...tzData, ...typData.filter((d) => d.x <= 2024)];
    }

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.innerHTML = `<div class="plot"></div><div class="footer-leg">
      <span><i style="background:#0080c6"></i>Accessibility</span>
      <span><i style="background:#0c7c68"></i>Quality</span>
      <span><i style="background:#f59e0b"></i>Availability</span>
      <span style="opacity:.8">Solid = Tanzania · lighter = typical path</span>
    </div>`;
    chartEl.appendChild(root);
    const plot = root.querySelector(".plot");
    const series = [...new Set(data.map((d) => d.series))];
    const colmap = { default: "#0080c6" };
    series.forEach((s) => {
      const kind = s.split("-")[1];
      const base = colors[kind] || "#0080c6";
      colmap[s] = s.startsWith("TYP") ? base + "99" : base;
      // hex with alpha may fail in some SVG — use opacity via separate if needed
      colmap[s] = base;
    });
    // dual opacity: draw twice
    const tzOnly = data.filter((d) => d.src === "tz");
    const typOnly = data.filter((d) => d.src === "typ");
    // mount typical first (dashed feel via thinner)
    if (typOnly.length) {
      AtlasLineChart.mount(plot, {
        data: typOnly, x: (d) => d.x, y: (d) => d.y, series: (d) => d.series,
        width: plot.clientWidth, height: plot.clientHeight,
        yDomain: [0, 100], xTicks: [2000, 2005, 2010, 2015, 2020, 2024],
        colors: Object.fromEntries(typOnly.map((d) => [d.series, colors[d.kind] || "#999"])),
        strokeWidth: 1.5,
      });
    }
    // overlay Tanzania on same plot - remount merges badly; custom draw instead
    plot.innerHTML = "";
    const all = data;
    const w = plot.clientWidth || 860, h = plot.clientHeight || 420;
    const margin = { top: 18, right: 16, bottom: 36, left: 44 };
    const SVG = AtlasSVG;
    const svg = SVG.el(plot, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.cssText = "width:100%;height:100%";
    const xs = all.map((d) => d.x), ys = all.map((d) => d.y);
    const xScale = SVG.scaleLinear([Math.min(...xs), Math.max(...xs)], [margin.left, w - margin.right]);
    const yScale = SVG.scaleLinear([0, 100], [h - margin.bottom, margin.top]);
    const gAxis = SVG.el(svg, "g");
    AtlasAxis.draw({
      g: gAxis, xScale, yScale, width: w, height: h, margin,
      xTicks: [2000, 2005, 2010, 2015, 2020, 2024],
      yTicks: [0, 25, 50, 75, 100],
      xFormat: (v) => String(Math.round(v)),
    });
    const byS = new Map();
    all.forEach((d) => {
      if (!byS.has(d.series)) byS.set(d.series, []);
      byS.get(d.series).push(d);
    });
    for (const [s, pts] of byS) {
      pts.sort((a, b) => a.x - b.x);
      const kind = pts[0].kind;
      const isTyp = s.startsWith("TYP");
      const d = pts.map((p, i) => `${i ? "L" : "M"}${xScale(p.x)},${yScale(p.y)}`).join(" ");
      SVG.el(svg, "path", {
        d, fill: "none",
        stroke: colors[kind] || "#0080c6",
        "stroke-width": isTyp ? 1.5 : 3,
        "stroke-dasharray": isTyp ? "5 4" : "none",
        opacity: isTyp ? 0.55 : 1,
      });
    }
  },
};
