/**
 * poverty_regions — regional extreme poverty 1950–2025 (D_U9bE6j.js)
 * Order: WLD, SSF, SAS, MEA, LCN, EAS, ECS, NAC — multi-line with end labels
 */
window.AtlasReplica = {
  ready: true,
  isStub: false,
  async render(_s, ctx) {
    const { chartEl, hidePlaceholder } = ctx;
    hidePlaceholder();
    const rows = await AtlasLoad.csv("./data/01_data_regional_poverty.csv");

    const ORDER = ["WLD", "SSF", "SAS", "MEA", "LCN", "EAS", "ECS", "NAC"];
    const COLORS = {
      WLD: "#081079", SSF: "#FF9800", SAS: "#4EC2C0", MEA: "#664AB6",
      LCN: "#0C7C68", EAS: "#F3578E", ECS: "#AA0000", NAC: "#34A7F2",
    };
    const LABELS = {
      WLD: "World", SSF: "Sub-Saharan Africa", SAS: "South Asia",
      MEA: "Middle East & N. Africa", LCN: "Latin America & Caribbean",
      EAS: "East Asia & Pacific", ECS: "Europe & Central Asia", NAC: "North America",
    };

    const byIso = new Map();
    rows.forEach((r) => {
      const year = +(r.date || r.year);
      const v = +r.value;
      if (!Number.isFinite(year) || !Number.isFinite(v)) return;
      if (!byIso.has(r.iso3c)) byIso.set(r.iso3c, []);
      byIso.get(r.iso3c).push({ year, v });
    });
    byIso.forEach((pts) => pts.sort((a, b) => a.year - b.year));

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText = "position:relative;width:100%;height:100%;font-family:'Open Sans',system-ui,sans-serif";
    chartEl.appendChild(root);

    const w = root.clientWidth || 900;
    const h = root.clientHeight || 460;
    const margin = { top: 24, right: 150, bottom: 40, left: 48 };
    const svg = AtlasSVG.el(root, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.cssText = "width:100%;height:100%;display:block";

    const xScale = AtlasSVG.scaleLinear([1950, 2025], [margin.left, w - margin.right]);
    const yScale = AtlasSVG.scaleLinear([0, 100], [h - margin.bottom, margin.top]);

    [0, 25, 50, 75, 100].forEach((t) => {
      AtlasSVG.el(svg, "line", {
        x1: margin.left, x2: w - margin.right, y1: yScale(t), y2: yScale(t), stroke: "#f1f5f9",
      });
      AtlasSVG.el(svg, "text", {
        x: margin.left - 8, y: yScale(t) + 4, "text-anchor": "end",
        fill: "#6a7781", "font-size": 11,
      }).textContent = t + "%";
    });
    [1950, 1970, 1990, 2010, 2025].forEach((yr) => {
      AtlasSVG.el(svg, "text", {
        x: xScale(yr), y: h - margin.bottom + 20, "text-anchor": "middle",
        fill: "#6a7781", "font-size": 12, "font-weight": "600",
      }).textContent = String(yr);
    });

    // slight y-jitter for end labels to reduce collisions
    const ends = [];
    ORDER.forEach((key) => {
      const pts = byIso.get(key);
      if (!pts || pts.length < 2) return;
      const col = COLORS[key];
      AtlasSVG.el(svg, "path", {
        d: pts.map((p, i) => `${i ? "L" : "M"}${xScale(p.year)},${yScale(p.v)}`).join(" "),
        fill: "none", stroke: col,
        "stroke-width": key === "WLD" ? 3 : 2.2,
        "stroke-linecap": "round", "stroke-linejoin": "round",
      });
      const last = pts.at(-1);
      ends.push({ key, last, col });
      AtlasSVG.el(svg, "circle", {
        cx: xScale(last.year), cy: yScale(last.v), r: 3.5, fill: col,
      });
    });
    ends.sort((a, b) => b.last.v - a.last.v);
    let prevY = -Infinity;
    ends.forEach((e) => {
      let y = yScale(e.last.v);
      if (y - prevY < 14) y = prevY + 14;
      prevY = y;
      AtlasSVG.el(svg, "text", {
        x: xScale(e.last.year) + 10, y: y + 4,
        fill: e.col, "font-size": 12, "font-weight": "700",
      }).textContent = `${LABELS[e.key]} ${e.last.v.toFixed(1)}%`;
    });

    const foot = document.createElement("div");
    foot.className = "footer-leg";
    foot.style.cssText = "position:absolute;bottom:4px;left:48px;font-size:11px;color:#6a7781";
    foot.textContent = "Share of population in extreme poverty · 1950–2025";
    root.appendChild(foot);
  },
};
