/**
 * national_poverty_comparison — scatter: international monetary vs national multidimensional
 * (BYW0S-Jn.js) domain [0,75]
 */
window.AtlasReplica = {
  ready: true,
  isStub: false,
  async render(_s, ctx) {
    const { chartEl, hidePlaceholder, config } = ctx;
    hidePlaceholder();
    const rows = await AtlasLoad.csv("./data/01_data_national_poverty_comparison.csv");
    const NAMES = window.ATLAS_COUNTRY_NAMES || {};

    const data = rows
      .map((r) => ({
        iso: r.iso3c,
        multi: +r.multidimensional_national,
        money: +r.monetary_international_multidimensional,
        year: +r.year_multidimensional,
      }))
      .filter((d) => Number.isFinite(d.multi) && Number.isFinite(d.money));

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText = "position:relative;width:100%;height:100%;font-family:'Open Sans',system-ui,sans-serif";
    chartEl.appendChild(root);

    const w = root.clientWidth || 900;
    const h = root.clientHeight || 460;
    const margin = { top: 28, right: 28, bottom: 52, left: 56 };
    const svg = AtlasSVG.el(root, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.cssText = "width:100%;height:100%;display:block";

    const xScale = AtlasSVG.scaleLinear([0, 75], [margin.left, w - margin.right]);
    const yScale = AtlasSVG.scaleLinear([0, 75], [h - margin.bottom, margin.top]);

    // grid
    [0, 25, 50, 75].forEach((t) => {
      AtlasSVG.el(svg, "line", {
        x1: margin.left, x2: w - margin.right, y1: yScale(t), y2: yScale(t), stroke: "#f1f5f9",
      });
      AtlasSVG.el(svg, "line", {
        x1: xScale(t), x2: xScale(t), y1: margin.top, y2: h - margin.bottom, stroke: "#f1f5f9",
      });
      AtlasSVG.el(svg, "text", {
        x: margin.left - 8, y: yScale(t) + 4, "text-anchor": "end", fill: "#6a7781", "font-size": 11,
      }).textContent = t;
      AtlasSVG.el(svg, "text", {
        x: xScale(t), y: h - margin.bottom + 18, "text-anchor": "middle", fill: "#6a7781", "font-size": 11,
      }).textContent = t;
    });
    // 45° equality line
    AtlasSVG.el(svg, "line", {
      x1: xScale(0), y1: yScale(0), x2: xScale(75), y2: yScale(75),
      stroke: "#94a3b8", "stroke-dasharray": "5 4", "stroke-width": 1.5,
    });
    AtlasSVG.el(svg, "text", {
      x: xScale(60), y: yScale(62), fill: "#6a7781", "font-size": 11, "font-style": "italic",
    }).textContent = "equal rates";

    // axis titles
    AtlasSVG.el(svg, "text", {
      x: (margin.left + w - margin.right) / 2, y: h - 12,
      "text-anchor": "middle", fill: "#111", "font-size": 12, "font-weight": "600",
    }).textContent = config?.international_poverty_rate || "International poverty rate";
    AtlasSVG.el(svg, "text", {
      x: 16, y: h / 2, "text-anchor": "middle", fill: "#111", "font-size": 12, "font-weight": "600",
      transform: `rotate(-90 16 ${h / 2})`,
    }).textContent = config?.multidimensional || "National multidimensional poverty rate";

    // points — color by gap (multi - money)
    data.forEach((d) => {
      const gap = d.multi - d.money;
      const col = gap > 15 ? "#AA0000" : gap > 5 ? "#f7b841" : "#0C7C68";
      AtlasSVG.el(svg, "circle", {
        cx: xScale(d.money), cy: yScale(d.multi), r: 5.5,
        fill: col, opacity: 0.85, stroke: "#fff", "stroke-width": 1.2,
      });
    });

    // label extremes / notable
    const notables = data
      .slice()
      .sort((a, b) => Math.abs(b.multi - b.money) - Math.abs(a.multi - a.money))
      .slice(0, 12);
    notables.forEach((d) => {
      AtlasSVG.el(svg, "text", {
        x: xScale(d.money) + 7, y: yScale(d.multi) + 3,
        fill: "#334155", "font-size": 10, "font-weight": "600",
      }).textContent = NAMES[d.iso] || d.iso;
    });

    const foot = document.createElement("div");
    foot.className = "footer-leg";
    foot.style.cssText = "position:absolute;top:8px;right:12px;font-size:11px;display:flex;flex-direction:column;gap:4px;background:#fff;padding:6px 10px;border:1px solid #e2e8f0;border-radius:4px";
    foot.innerHTML = `
      <span style="font-weight:700">${config?.gap || "Gap"} (multi − monetary)</span>
      <span><i style="display:inline-block;width:10px;height:10px;background:#AA0000;border-radius:50%;margin-right:4px"></i>large (&gt;15pp)</span>
      <span><i style="display:inline-block;width:10px;height:10px;background:#f7b841;border-radius:50%;margin-right:4px"></i>moderate</span>
      <span><i style="display:inline-block;width:10px;height:10px;background:#0C7C68;border-radius:50%;margin-right:4px"></i>small</span>`;
    root.appendChild(foot);
  },
};
