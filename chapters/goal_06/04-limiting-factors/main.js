/**
 * limiting_factors — grouped bars of three pillars; color by limiting factor
 */
window.AtlasReplica = {
  ready: true, isStub: false,
  async render(scene, ctx) {
    const { chartEl, hidePlaceholder, sceneIndex } = ctx;
    hidePlaceholder();
    const rows = await AtlasLoad.csv("./data/Limiting Factors.csv");
    let data = rows.map((r) => ({
      name: r.country_name,
      iso: r.iso3,
      accessibility: +r.accessibility,
      availability: +r.availability,
      quality: +r.quality,
      limiting: (r.limiting_factor || "").toLowerCase(),
      min: +r.min_value,
    })).filter((d) => Number.isFinite(d.min));

    // scene focus subsets
    const all = data;
    if (sceneIndex === 0) {
      const pacific = all.filter((d) =>
        /Tuvalu|Nauru|Tonga|Kiribati|Marshall|Palau|Micronesia|Samoa|Fiji/i.test(d.name)
      );
      data = (pacific.length >= 3 ? pacific : all.filter((d) => d.limiting.includes("qual"))).slice(0, 12);
    } else if (sceneIndex === 1) {
      data = all
        .filter((d) => d.limiting.includes("qual"))
        .sort((a, b) => a.quality - b.quality)
        .slice(0, 15);
    } else if (sceneIndex === 2) {
      data = all
        .filter((d) => d.limiting.includes("avail"))
        .sort((a, b) => a.availability - b.availability)
        .slice(0, 15);
    } else {
      data = all.sort((a, b) => a.min - b.min).slice(0, 20);
    }
    if (!data.length) data = all.sort((a, b) => a.min - b.min).slice(0, 15);

    const cols = [
      { key: "accessibility", color: "#0080c6", label: "Accessibility" },
      { key: "availability", color: "#00b8ec", label: "Availability" },
      { key: "quality", color: "#0c7c68", label: "Quality" },
    ];

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.innerHTML = `<div class="plot"></div><div class="footer-leg"></div>`;
    chartEl.appendChild(root);
    const leg = root.querySelector(".footer-leg");
    cols.forEach((c) => { leg.innerHTML += `<span><i style="background:${c.color}"></i>${c.label}</span>`; });
    const plot = root.querySelector(".plot");
    const w = plot.clientWidth || 900, h = plot.clientHeight || 420;
    const margin = { top: 16, right: 12, bottom: 90, left: 44 };
    const SVG = AtlasSVG;
    const svg = SVG.el(plot, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.cssText = "width:100%;height:100%";
    const groupW = (w - margin.left - margin.right) / Math.max(data.length, 1);
    const barW = groupW / 4;
    data.forEach((d, i) => {
      cols.forEach((c, ci) => {
        const v = d[c.key];
        if (!Number.isFinite(v)) return;
        const bh = ((h - margin.top - margin.bottom) * Math.max(0, v)) / 100;
        const x = margin.left + i * groupW + barW * (ci + 0.5);
        const y = h - margin.bottom - bh;
        const isLim = (d.limiting || "").includes(c.key.slice(0, 4));
        SVG.el(svg, "rect", {
          x, y, width: Math.max(1, barW * 0.85), height: Math.max(0, bh),
          fill: c.color, opacity: isLim ? 1 : 0.45, rx: 1,
        });
      });
      const lab = SVG.el(svg, "text", {
        x: margin.left + i * groupW + groupW / 2,
        y: h - margin.bottom + 12,
        "text-anchor": "end", fill: "#6a7781", "font-size": 10,
        transform: `rotate(-40 ${margin.left + i * groupW + groupW / 2} ${h - margin.bottom + 12})`,
      });
      lab.textContent = d.name.length > 14 ? d.name.slice(0, 12) + "…" : d.name;
    });
    [0, 25, 50, 75, 100].forEach((t) => {
      const y = h - margin.bottom - ((h - margin.top - margin.bottom) * t) / 100;
      SVG.el(svg, "line", { x1: margin.left, x2: w - margin.right, y1: y, y2: y, stroke: "#eef1f5" });
      SVG.el(svg, "text", { x: margin.left - 6, y: y + 3, "text-anchor": "end", fill: "#6a7781", "font-size": 11 }).textContent = t;
    });
  },
};
