/**
 * sdg5_turkiye_education — multi-line / regional time series (Tier B)
 */
window.AtlasReplica = {
  ready: true, isStub: false,
  async render(scene, ctx) {
    const { chartEl, hidePlaceholder, sceneIndex, config } = ctx;
    hidePlaceholder();
    const rows = await AtlasLoad.csv("./data/05_data_flfp_drivers_education.csv");
    const COLORS = Object.assign({}, window.WB_COLORS && window.WB_COLORS.regions, {
      HIC:"#016B6C",UMC:"#73AF48",LMC:"#DB95D7",LIC:"#3B4DA6",
      WLD:"#081079",EAS:"#F3578E",ECS:"#AA0000",LCN:"#0C7C68",
      MEA:"#664AB6",NAC:"#34A7F2",SAS:"#4EC2C0",SSF:"#FF9800"
    });
    const headers = rows[0] ? Object.keys(rows[0]) : [];
    const yearKey = headers.find(h => /^(year|date|time)$/i.test(h)) || headers.find(h => /year|date/i.test(h));
    const valKey = headers.find(h => /^(value|rate|score|estimate)$/i.test(h)) || headers.find(h => {
      return h !== yearKey && rows.some(r => Number.isFinite(+r[h]));
    });
    const seriesKey = headers.find(h => /iso3c|region|group|income|series|code|country/i.test(h) && h !== yearKey && h !== valKey);

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText = "position:relative;width:100%;height:100%;font-family:Open Sans,system-ui,sans-serif";
    chartEl.appendChild(root);
    const w = root.clientWidth || 900, h = root.clientHeight || 440;
    const margin = { top: 24, right: 130, bottom: 40, left: 48 };
    const svg = AtlasSVG.el(root, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.cssText = "width:100%;height:100%;display:block";

    const parsed = rows.map(r => {
      let y = r[yearKey];
      if (typeof y === "string" && /^\d{4}/.test(y)) y = +y.slice(0,4);
      else y = +y;
      return { year: y, v: +r[valKey], series: seriesKey ? r[seriesKey] : "series" };
    }).filter(d => Number.isFinite(d.year) && Number.isFinite(d.v));

    let seriesList = [...new Set(parsed.map(d => d.series))];
    // scene progressive: first series only then all
    if (sceneIndex === 0 && seriesList.length > 1) {
      const prefer = seriesList.find(s => s === "WLD" || s === "World") || seriesList[0];
      seriesList = [prefer];
    } else if (sceneIndex === 1 && seriesList.length > 4) {
      seriesList = seriesList.slice(0, Math.min(4, seriesList.length));
    }

    const xs = parsed.map(d => d.year), ys = parsed.filter(d => seriesList.includes(d.series)).map(d => d.v);
    const xScale = AtlasSVG.scaleLinear([Math.min(...xs), Math.max(...xs)], [margin.left, w - margin.right]);
    const y0 = 0, y1 = Math.max(...ys, 1) * 1.08;
    const yScale = AtlasSVG.scaleLinear([y0, y1], [h - margin.bottom, margin.top]);

    const yTicks = 5;
    for (let i = 0; i <= yTicks; i++) {
      const t = y0 + (y1 - y0) * i / yTicks;
      AtlasSVG.el(svg, "line", { x1: margin.left, x2: w - margin.right, y1: yScale(t), y2: yScale(t), stroke: "#f1f5f9" });
      AtlasSVG.el(svg, "text", { x: margin.left - 8, y: yScale(t) + 4, "text-anchor": "end", fill: "#6a7781", "font-size": 11 }).textContent = (t >= 100 ? Math.round(t) : Math.round(t * 10) / 10) + (y1 <= 100 ? "" : "");
    }
    const xMin = Math.min(...xs), xMax = Math.max(...xs);
    const xSpan = xMax - xMin || 1;
    const xt = [];
    for (let i = 0; i < 6; i++) xt.push(Math.round(xMin + xSpan * i / 5));
    xt.forEach(yr => {
      AtlasSVG.el(svg, "text", { x: xScale(yr), y: h - margin.bottom + 20, "text-anchor": "middle", fill: "#6a7781", "font-size": 12, "font-weight": "600" }).textContent = String(yr);
    });

    seriesList.forEach((s, si) => {
      const pts = parsed.filter(d => d.series === s).sort((a,b) => a.year - b.year);
      if (pts.length < 2) return;
      const col = COLORS[s] || `hsl(${(si * 47) % 360} 55% 42%)`;
      AtlasSVG.el(svg, "path", {
        d: pts.map((p, i) => `${i ? "L" : "M"}${xScale(p.year)},${yScale(p.v)}`).join(" "),
        fill: "none", stroke: col, "stroke-width": s === "WLD" ? 3 : 2.2, "stroke-linecap": "round"
      });
      const last = pts.at(-1);
      AtlasSVG.el(svg, "circle", { cx: xScale(last.year), cy: yScale(last.v), r: 3, fill: col });
      AtlasSVG.el(svg, "text", {
        x: xScale(last.year) + 8, y: yScale(last.v) + 4, fill: col, "font-size": 11, "font-weight": "700"
      }).textContent = `${s} ${typeof last.v === "number" ? (Math.abs(last.v) >= 10 ? last.v.toFixed(1) : last.v.toFixed(2)) : last.v}`;
    });
  },
};
