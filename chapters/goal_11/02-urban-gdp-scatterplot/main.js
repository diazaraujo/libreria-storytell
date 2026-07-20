/**
 * urban_gdp_scatterplot — % urban population vs GDP per capita
 * Latest year per economy; region colors; log-x optional via scale.
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

    const rows = await AtlasLoad.csv("./data/11_data_urban_gdp_scatterplot.csv");
    const NAMES = window.ATLAS_COUNTRY_NAMES || {};
    const REG =
      (window.ATLAS_INCOME && null) ||
      (window.WB_COLORS && window.WB_COLORS.regions) ||
      {};
    // map iso → region if available via income-map? use simple bucket by gdp
    // Prefer latest year per country
    const byIso = new Map();
    rows.forEach((r) => {
      const iso = String(r.iso3c || "").toUpperCase();
      const y = +r.year;
      const urb = +r.urb_pop;
      const gdp = +r.gdp;
      if (!iso || !Number.isFinite(urb) || !Number.isFinite(gdp) || !Number.isFinite(y))
        return;
      const prev = byIso.get(iso);
      if (!prev || y > prev.year) byIso.set(iso, { iso, year: y, urb, gdp });
    });
    let data = [...byIso.values()];
    // scene: all, then focus lower GDP, then high urban
    if (sceneIndex === 1) data = data.filter((d) => d.gdp < 5000);
    if (sceneIndex === 2) data = data.filter((d) => d.urb > 60);

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText =
      "position:relative;width:100%;height:100%;font-family:Open Sans,system-ui,sans-serif;background:#fff";
    chartEl.appendChild(root);

    const w = root.clientWidth || 900;
    const h = root.clientHeight || 440;
    const margin = { top: 36, right: 24, bottom: 48, left: 56 };
    const svg = AtlasSVG.el(root, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.cssText = "width:100%;height:100%";

    const xs = data.map((d) => d.urb);
    const ys = data.map((d) => d.gdp);
    const xScale = AtlasSVG.scaleLinear(
      [0, Math.max(...xs, 100)],
      [margin.left, w - margin.right]
    );
    // log-like for GDP: use sqrt scale for readability
    const yMax = Math.max(...ys, 1);
    const yScale = (v) => {
      const t = Math.sqrt(v) / Math.sqrt(yMax);
      return h - margin.bottom - t * (h - margin.top - margin.bottom);
    };

    // grid
    [0, 25, 50, 75, 100].forEach((t) => {
      AtlasSVG.el(svg, "line", {
        x1: xScale(t),
        x2: xScale(t),
        y1: margin.top,
        y2: h - margin.bottom,
        stroke: "#f1f5f9",
      });
      AtlasSVG.el(svg, "text", {
        x: xScale(t),
        y: h - margin.bottom + 18,
        "text-anchor": "middle",
        fill: "#6a7781",
        "font-size": 11,
        "font-weight": "600",
      }).textContent = t + "%";
    });
    [1000, 5000, 10000, 20000, 50000].forEach((g) => {
      if (g > yMax * 1.05) return;
      AtlasSVG.el(svg, "line", {
        x1: margin.left,
        x2: w - margin.right,
        y1: yScale(g),
        y2: yScale(g),
        stroke: "#f1f5f9",
      });
      AtlasSVG.el(svg, "text", {
        x: margin.left - 6,
        y: yScale(g) + 4,
        "text-anchor": "end",
        fill: "#6a7781",
        "font-size": 10,
      }).textContent = g >= 1000 ? g / 1000 + "k" : String(g);
    });

    AtlasSVG.el(svg, "text", {
      x: (margin.left + w - margin.right) / 2,
      y: h - 10,
      "text-anchor": "middle",
      fill: "#111",
      "font-size": 12,
      "font-weight": "700",
    }).textContent = "Urban population share (%) →";
    AtlasSVG.el(svg, "text", {
      x: 14,
      y: h / 2,
      "text-anchor": "middle",
      fill: "#111",
      "font-size": 12,
      "font-weight": "700",
      transform: `rotate(-90 14 ${h / 2})`,
    }).textContent = "GDP per capita (US$) →";

    const titles = [
      "Urbanization and income · latest year per economy",
      "Lower-income economies",
      "Highly urbanized economies (>60% urban)",
    ];
    AtlasSVG.el(svg, "text", {
      x: margin.left,
      y: 18,
      fill: "#111",
      "font-size": 13,
      "font-weight": "700",
    }).textContent = titles[Math.min(sceneIndex || 0, 2)];

    const focus = new Set(["CHN", "IND", "USA", "NGA", "BRA", "ETH", "BGD"]);
    data.forEach((d) => {
      // color by income bands via gdp
      const col =
        d.gdp < 1000
          ? "#3B4DA6"
          : d.gdp < 4000
            ? "#DB95D7"
            : d.gdp < 12000
              ? "#73AF48"
              : "#016B6C";
      AtlasSVG.el(svg, "circle", {
        cx: xScale(d.urb),
        cy: yScale(d.gdp),
        r: focus.has(d.iso) ? 5.5 : 3.5,
        fill: col,
        opacity: 0.75,
        stroke: "#fff",
        "stroke-width": 0.7,
      });
      if (focus.has(d.iso)) {
        AtlasSVG.el(svg, "text", {
          x: xScale(d.urb) + 6,
          y: yScale(d.gdp) + 3,
          fill: "#334155",
          "font-size": 10,
          "font-weight": "600",
        }).textContent = NAMES[d.iso] || d.iso;
      }
    });

    const leg = document.createElement("div");
    leg.style.cssText =
      "position:absolute;top:40px;right:12px;font-size:11px;display:flex;flex-direction:column;gap:4px";
    leg.innerHTML = [
      ["#3B4DA6", "LIC-ish"],
      ["#DB95D7", "LMC-ish"],
      ["#73AF48", "UMC-ish"],
      ["#016B6C", "HIC-ish"],
    ]
      .map(
        ([c, l]) =>
          `<span><i style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${c};margin-right:4px"></i>${l}</span>`
      )
      .join("");
    root.appendChild(leg);
  },
};
