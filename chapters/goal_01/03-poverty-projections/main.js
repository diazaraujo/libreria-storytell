/**
 * poverty_projections — global poverty under different speeds (BVJdN-Z_.js)
 * Scenes: rate4 (Korea pace) → rate2 (Brazil) → rate1 (typical) → rateH (recent slowdown)
 */
window.AtlasReplica = {
  ready: true,
  isStub: false,
  async render(scene, ctx) {
    const { chartEl, hidePlaceholder, sceneIndex } = ctx;
    hidePlaceholder();
    const [proj, hist] = await Promise.all([
      AtlasLoad.csv("./data/global_projections.csv"),
      AtlasLoad.csv("./data/rate_since_2000.csv"),
    ]);

    const seriesMeta = {
      rate4: { label: "Korea’s historical pace", color: "#F3578E", from: 0 },
      rate2: { label: "Brazil’s pace", color: "#0C7C68", from: 1 },
      rate1: { label: "Typical pace since 1950", color: "#34A7F2", from: 2 },
      rateH: { label: "Recent (slower) pace", color: "#AA0000", from: 3 },
    };

    const histPts = hist
      .map((r) => ({ year: +r.year, v: +r.rate }))
      .filter((d) => Number.isFinite(d.year) && Number.isFinite(d.v));
    const projRows = proj
      .map((r) => ({
        year: +r.year,
        rate1: +r.rate1, rate2: +r.rate2, rate4: +r.rate4, rateH: +r.rateH,
      }))
      .filter((d) => Number.isFinite(d.year));

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText = "position:relative;width:100%;height:100%;font-family:'Open Sans',system-ui,sans-serif";
    chartEl.appendChild(root);

    const w = root.clientWidth || 900;
    const h = root.clientHeight || 440;
    const margin = { top: 28, right: 180, bottom: 40, left: 48 };
    const svg = AtlasSVG.el(root, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.cssText = "width:100%;height:100%;display:block";

    const xScale = AtlasSVG.scaleLinear([2000, 2050], [margin.left, w - margin.right]);
    const yScale = AtlasSVG.scaleLinear([0, 40], [h - margin.bottom, margin.top]);

    [0, 10, 20, 30, 40].forEach((t) => {
      AtlasSVG.el(svg, "line", {
        x1: margin.left, x2: w - margin.right, y1: yScale(t), y2: yScale(t), stroke: "#f1f5f9",
      });
      AtlasSVG.el(svg, "text", {
        x: margin.left - 8, y: yScale(t) + 4, "text-anchor": "end",
        fill: "#6a7781", "font-size": 11,
      }).textContent = t + "%";
    });
    [2000, 2010, 2020, 2025, 2030, 2040, 2050].forEach((yr) => {
      AtlasSVG.el(svg, "text", {
        x: xScale(yr), y: h - margin.bottom + 20, "text-anchor": "middle",
        fill: "#6a7781", "font-size": 12, "font-weight": "600",
      }).textContent = String(yr);
    });

    // historical solid
    if (histPts.length > 1) {
      AtlasSVG.el(svg, "path", {
        d: histPts.map((p, i) => `${i ? "L" : "M"}${xScale(p.year)},${yScale(p.v)}`).join(" "),
        fill: "none", stroke: "#081079", "stroke-width": 2.8,
      });
      const lastH = histPts.at(-1);
      AtlasSVG.el(svg, "text", {
        x: xScale(lastH.year) - 8, y: yScale(lastH.v) - 10,
        "text-anchor": "end", fill: "#081079", "font-size": 11, "font-weight": "700",
      }).textContent = "Observed";
    }

    // vertical divider at 2025
    AtlasSVG.el(svg, "line", {
      x1: xScale(2025), x2: xScale(2025), y1: margin.top, y2: h - margin.bottom,
      stroke: "#cbd5e1", "stroke-dasharray": "4 3",
    });

    Object.entries(seriesMeta).forEach(([key, meta]) => {
      if (sceneIndex < meta.from) return;
      const pts = projRows.map((r) => ({ year: r.year, v: r[key] })).filter((d) => Number.isFinite(d.v));
      if (pts.length < 2) return;
      AtlasSVG.el(svg, "path", {
        d: pts.map((p, i) => `${i ? "L" : "M"}${xScale(p.year)},${yScale(p.v)}`).join(" "),
        fill: "none", stroke: meta.color, "stroke-width": 2.5,
        "stroke-dasharray": "6 4",
      });
      const last = pts.at(-1);
      AtlasSVG.el(svg, "circle", {
        cx: xScale(last.year), cy: yScale(last.v), r: 4, fill: meta.color, stroke: "#fff", "stroke-width": 1.5,
      });
      AtlasSVG.el(svg, "text", {
        x: xScale(last.year) + 8, y: yScale(last.v) + 4,
        fill: meta.color, "font-size": 12, "font-weight": "700",
      }).textContent = `${meta.label} · ${last.v.toFixed(1)}%`;
    });

    const foot = document.createElement("div");
    foot.className = "footer-leg";
    foot.style.cssText = "position:absolute;bottom:4px;left:48px;font-size:11px;color:#6a7781";
    foot.textContent = "Global extreme poverty rate · projections 2025–2050";
    root.appendChild(foot);
  },
};
