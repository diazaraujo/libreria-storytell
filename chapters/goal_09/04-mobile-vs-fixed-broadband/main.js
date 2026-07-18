/**
 * mobile_vs_fixed_broadband — global dual line + country scatter by scene
 */
window.AtlasReplica = {
  ready: true, isStub: false,
  async render(scene, ctx) {
    const { chartEl, hidePlaceholder, sceneIndex } = ctx;
    hidePlaceholder();
    const [global, countries] = await Promise.all([
      AtlasLoad.csv("./data/mobile_fixed_global.csv"),
      AtlasLoad.csv("./data/mobile_fixed_broadband_subscriptions.csv"),
    ]);
    const NAMES = window.ATLAS_COUNTRY_NAMES || {};
    const gPts = global.map((r) => ({
      year: +r.year, fixed: +r.fixed_broadband, mobile: +r.mobile_broadband,
    })).filter((d) => Number.isFinite(d.year));
    const cty = countries.map((r) => ({
      iso: r.iso3c, mobile: +r.mobile_broadband, fixed: +r.fixed_broadband,
    })).filter((d) => Number.isFinite(d.mobile) && Number.isFinite(d.fixed));

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText = "position:relative;width:100%;height:100%;font-family:'Open Sans',system-ui,sans-serif";
    chartEl.appendChild(root);
    const w = root.clientWidth || 900, h = root.clientHeight || 440;
    const margin = { top: 28, right: 120, bottom: 40, left: 48 };
    const svg = AtlasSVG.el(root, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.cssText = "width:100%;height:100%";

    const MOB = "#34A7F2", FIX = "#081079";

    if (sceneIndex === 0) {
      // global time series
      const xScale = AtlasSVG.scaleLinear([2010, 2025], [margin.left, w - margin.right]);
      const yScale = AtlasSVG.scaleLinear([0, 110], [h - margin.bottom, margin.top]);
      [0, 25, 50, 75, 100].forEach((t) => {
        AtlasSVG.el(svg, "line", { x1: margin.left, x2: w - margin.right, y1: yScale(t), y2: yScale(t), stroke: "#f1f5f9" });
        AtlasSVG.el(svg, "text", { x: margin.left - 8, y: yScale(t) + 4, "text-anchor": "end", fill: "#6a7781", "font-size": 11 }).textContent = t;
      });
      [2010, 2015, 2020, 2025].forEach((yr) => {
        AtlasSVG.el(svg, "text", { x: xScale(yr), y: h - margin.bottom + 20, "text-anchor": "middle", fill: "#6a7781", "font-size": 12, "font-weight": "600" }).textContent = String(yr);
      });
      [["mobile", MOB, "Mobile broadband"], ["fixed", FIX, "Fixed broadband"]].forEach(([key, col, lab]) => {
        AtlasSVG.el(svg, "path", {
          d: gPts.map((p, i) => `${i ? "L" : "M"}${xScale(p.year)},${yScale(p[key])}`).join(" "),
          fill: "none", stroke: col, "stroke-width": 2.8,
        });
        const last = gPts.at(-1);
        AtlasSVG.el(svg, "text", {
          x: xScale(last.year) + 8, y: yScale(last[key]) + 4,
          fill: col, "font-size": 12, "font-weight": "700",
        }).textContent = `${lab} ${last[key]}`;
      });
      AtlasSVG.el(svg, "text", {
        x: margin.left, y: margin.top - 10, fill: "#6a7781", "font-size": 11,
      }).textContent = "Subscriptions per 100 people";
      return;
    }

    // scatter mobile vs fixed
    const xScale = AtlasSVG.scaleLinear([0, 200], [margin.left, w - margin.right]);
    const yScale = AtlasSVG.scaleLinear([0, 60], [h - margin.bottom, margin.top]);
    [0, 50, 100, 150, 200].forEach((t) => {
      AtlasSVG.el(svg, "line", { x1: xScale(t), x2: xScale(t), y1: margin.top, y2: h - margin.bottom, stroke: "#f1f5f9" });
      AtlasSVG.el(svg, "text", { x: xScale(t), y: h - margin.bottom + 18, "text-anchor": "middle", fill: "#6a7781", "font-size": 11 }).textContent = t;
    });
    [0, 15, 30, 45, 60].forEach((t) => {
      AtlasSVG.el(svg, "line", { x1: margin.left, x2: w - margin.right, y1: yScale(t), y2: yScale(t), stroke: "#f1f5f9" });
      AtlasSVG.el(svg, "text", { x: margin.left - 8, y: yScale(t) + 4, "text-anchor": "end", fill: "#6a7781", "font-size": 11 }).textContent = t;
    });
    AtlasSVG.el(svg, "text", {
      x: (margin.left + w - margin.right) / 2, y: h - 10, "text-anchor": "middle", fill: "#111", "font-size": 12, "font-weight": "600",
    }).textContent = "Mobile broadband (per 100)";
    AtlasSVG.el(svg, "text", {
      x: 14, y: h / 2, "text-anchor": "middle", fill: "#111", "font-size": 12, "font-weight": "600",
      transform: `rotate(-90 14 ${h / 2})`,
    }).textContent = "Fixed broadband (per 100)";

    const highlight = {
      1: ["DEU", "CHN", "USA", "JPN", "KOR", "GBR", "FRA"],
      2: ["LIC", "LMC"].length ? [] : [], // income not in country file
      3: ["CIV", "SEN", "SWZ", "MAR", "NGA", "KEN", "GHA"],
    };
    // scene 1 HIC-like high fixed; scene 2 low fixed; scene 3 Africa examples
    const hi = new Set(
      sceneIndex === 1 ? ["DEU", "CHN", "USA", "JPN", "KOR", "GBR", "FRA", "SGP", "CHE"]
        : sceneIndex === 2 ? cty.filter((d) => d.fixed < 5).slice(0, 20).map((d) => d.iso)
          : ["CIV", "SEN", "SWZ", "MAR", "NGA", "KEN", "GHA", "ETH"]
    );

    cty.forEach((d) => {
      const on = hi.has(d.iso);
      const op = sceneIndex === 0 ? 0.7 : on ? 1 : 0.2;
      AtlasSVG.el(svg, "circle", {
        cx: xScale(Math.min(d.mobile, 200)), cy: yScale(Math.min(d.fixed, 60)),
        r: on ? 5.5 : 3.5,
        fill: on ? (sceneIndex === 3 ? "#FF9800" : MOB) : "#cbd5e1",
        opacity: op, stroke: "#fff", "stroke-width": 1,
      });
      if (on) {
        AtlasSVG.el(svg, "text", {
          x: xScale(Math.min(d.mobile, 200)) + 6, y: yScale(Math.min(d.fixed, 60)) + 3,
          fill: "#111", "font-size": 10, "font-weight": "600",
        }).textContent = NAMES[d.iso] || d.iso;
      }
    });
  },
};
