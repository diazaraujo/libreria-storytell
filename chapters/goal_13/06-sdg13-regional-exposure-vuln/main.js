/**
 * sdg13_regional_exposure_vuln
 * Scatter: exposure (x) × vulnerability (y), size ~ population at risk,
 * color = region. Atlas narrative: high risk = exposure ∩ vulnerability.
 *
 * Data: 2024_noimp.csv / 2010.csv — sha_exp, sha_vuln, pop_risk, region_code
 */
window.AtlasReplica = {
  ready: true,
  isStub: false,

  async render(scene, ctx) {
    const { chartEl, hidePlaceholder, sceneIndex } = ctx;
    hidePlaceholder();
    const ph = document.getElementById("placeholder");
    if (ph) {
      ph.hidden = true;
      ph.style.display = "none";
    }

    let rows;
    try {
      rows = await AtlasLoad.csv("./data/2024_noimp.csv");
    } catch (_) {
      rows = await AtlasLoad.csv("./data/2010.csv");
    }

    const NAMES = window.ATLAS_COUNTRY_NAMES || {};
    const REG = (window.WB_COLORS && window.WB_COLORS.regions) || {
      NAC: "#34A7F2",
      LCN: "#0C7C68",
      SAS: "#4EC2C0",
      MEA: "#664AB6",
      ECS: "#AA0000",
      EAS: "#F3578E",
      SSF: "#FF9800",
    };

    const data = rows
      .map((r) => ({
        iso: String(r.code || "").toUpperCase(),
        name: NAMES[r.code] || r.code,
        region: r.region_code || "WLD",
        x: +r.sha_exp,
        y: +r.sha_vuln,
        risk: +r.sha_risk || +r.sha_exp * +r.sha_vuln,
        pop: +r.totalpop || +r.pop_risk || 1,
      }))
      .filter((d) => Number.isFinite(d.x) && Number.isFinite(d.y) && d.iso);

    // scene 0: all; later scenes could focus high-risk quadrant
    let view = data;
    if (sceneIndex >= 1) {
      view = data.filter((d) => d.x >= 0.15 && d.y >= 0.3);
    }

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText =
      "position:relative;width:100%;height:100%;font-family:Open Sans,system-ui,sans-serif;background:#fff";
    chartEl.appendChild(root);

    const w = root.clientWidth || 900;
    const h = root.clientHeight || 460;
    const margin = { top: 36, right: 140, bottom: 48, left: 56 };
    const svg = AtlasSVG.el(root, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.cssText = "width:100%;height:100%";

    const xScale = AtlasSVG.scaleLinear([0, 1], [margin.left, w - margin.right]);
    const yScale = AtlasSVG.scaleLinear([0, 1], [h - margin.bottom, margin.top]);

    // grid
    [0, 0.25, 0.5, 0.75, 1].forEach((t) => {
      AtlasSVG.el(svg, "line", {
        x1: xScale(t),
        x2: xScale(t),
        y1: margin.top,
        y2: h - margin.bottom,
        stroke: "#f1f5f9",
      });
      AtlasSVG.el(svg, "line", {
        x1: margin.left,
        x2: w - margin.right,
        y1: yScale(t),
        y2: yScale(t),
        stroke: "#f1f5f9",
      });
      AtlasSVG.el(svg, "text", {
        x: xScale(t),
        y: h - margin.bottom + 18,
        "text-anchor": "middle",
        fill: "#6a7781",
        "font-size": 11,
        "font-weight": "600",
      }).textContent = Math.round(t * 100) + "%";
      AtlasSVG.el(svg, "text", {
        x: margin.left - 8,
        y: yScale(t) + 4,
        "text-anchor": "end",
        fill: "#6a7781",
        "font-size": 11,
      }).textContent = Math.round(t * 100) + "%";
    });

    // high-risk quadrant hint
    AtlasSVG.el(svg, "rect", {
      x: xScale(0.15),
      y: yScale(1),
      width: xScale(1) - xScale(0.15),
      height: yScale(0.3) - yScale(1),
      fill: "#AA0000",
      opacity: 0.04,
    });

    AtlasSVG.el(svg, "text", {
      x: (margin.left + w - margin.right) / 2,
      y: h - 10,
      "text-anchor": "middle",
      fill: "#111",
      "font-size": 12,
      "font-weight": "700",
    }).textContent = "Share of population exposed →";
    AtlasSVG.el(svg, "text", {
      x: 14,
      y: h / 2,
      "text-anchor": "middle",
      fill: "#111",
      "font-size": 12,
      "font-weight": "700",
      transform: `rotate(-90 14 ${h / 2})`,
    }).textContent = "Share of population vulnerable →";

    AtlasSVG.el(svg, "text", {
      x: margin.left,
      y: 18,
      fill: "#111",
      "font-size": 13,
      "font-weight": "700",
    }).textContent =
      sceneIndex >= 1
        ? "Economies with elevated exposure and vulnerability"
        : "Exposure and vulnerability jointly determine climate risk";

    const maxPop = Math.max(...view.map((d) => d.pop), 1);
    // draw low-risk first
    [...view]
      .sort((a, b) => a.risk - b.risk)
      .forEach((d) => {
        const r = 3.5 + 10 * Math.sqrt(d.pop / maxPop);
        AtlasSVG.el(svg, "circle", {
          cx: xScale(d.x),
          cy: yScale(d.y),
          r,
          fill: REG[d.region] || "#0071bc",
          opacity: 0.72,
          stroke: "#fff",
          "stroke-width": 0.8,
        });
      });

    // label extremes + focus countries
    const focus = new Set(["BFA", "KEN", "PHL", "VNM", "BGD", "NLD", "TCD", "SOM"]);
    view.forEach((d) => {
      if (!focus.has(d.iso) && !(d.x > 0.5 && d.y > 0.7)) return;
      AtlasSVG.el(svg, "text", {
        x: xScale(d.x) + 6,
        y: yScale(d.y) + 3,
        fill: "#334155",
        "font-size": 10,
        "font-weight": "600",
      }).textContent = d.name.slice(0, 14);
    });

    // legend
    const leg = document.createElement("div");
    leg.style.cssText =
      "position:absolute;top:40px;right:12px;display:flex;flex-direction:column;gap:4px;font-size:11px";
    Object.keys(REG).forEach((k) => {
      if (!view.some((d) => d.region === k)) return;
      leg.innerHTML += `<span><i style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${REG[k]};margin-right:5px"></i>${k}</span>`;
    });
    root.appendChild(leg);
  },
};
