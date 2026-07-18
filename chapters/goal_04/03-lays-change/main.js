/**
 * lays_change — progress race / slope between start and end (Tier B)
 */
window.AtlasReplica = {
  ready: true, isStub: false,
  async render(scene, ctx) {
    const { chartEl, hidePlaceholder, sceneIndex, config } = ctx;
    hidePlaceholder();
    const rows = await AtlasLoad.csv("./data/04_data_lays_scatter.csv");
    const NAMES = window.ATLAS_COUNTRY_NAMES || {};
    const headers = rows[0] ? Object.keys(rows[0]) : [];
    const isoKey = headers.find(h => /iso3c|code|country/i.test(h)) || headers[0];
    // find two numeric year-like columns
    let aKey = headers.find(h => /2015|start|value_start|from/i.test(h));
    let bKey = headers.find(h => /202[3-5]|end|value_end|to/i.test(h));
    const nums = headers.filter(h => h !== isoKey && rows.slice(0, 20).some(r => Number.isFinite(+r[h])));
    if (!aKey || !bKey) {
      if (nums.length >= 2) { aKey = nums[0]; bKey = nums[1]; }
    }
    let data = rows.map(r => ({
      iso: r[isoKey],
      name: NAMES[r[isoKey]] || r[isoKey],
      a: +r[aKey], b: +r[bKey]
    })).filter(d => Number.isFinite(d.a) && Number.isFinite(d.b));
    data.sort((a, b) => a.a - b.a);

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText = "position:relative;width:100%;height:100%;font-family:Open Sans,system-ui,sans-serif;background:#fff";
    chartEl.appendChild(root);
    const w = root.clientWidth || 900;
    const h = Math.max(root.clientHeight || 480, 40 + data.length * 3.5);
    const margin = { top: 28, right: 24, bottom: 20, left: 24 };
    const svg = AtlasSVG.el(root, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.cssText = "width:100%;height:100%";
    const plotW = w - margin.left - margin.right;
    const plotH = h - margin.top - margin.bottom;
    const allV = data.flatMap(d => [d.a, d.b]);
    const lo = Math.min(0, ...allV), hi = Math.max(...allV, 1);
    const xScale = AtlasSVG.scaleLinear([lo, hi], [0, plotW]);
    const yScale = AtlasSVG.scaleBand(data.map(d => d.iso), [0, plotH], 0.08);
    const g = AtlasSVG.el(svg, "g", { transform: `translate(${margin.left},${margin.top})` });

    // ticks
    for (let i = 0; i <= 4; i++) {
      const t = lo + (hi - lo) * i / 4;
      AtlasSVG.el(g, "line", { x1: xScale(t), x2: xScale(t), y1: 0, y2: plotH, stroke: "#f1f5f9" });
      AtlasSVG.el(g, "text", { x: xScale(t), y: -8, "text-anchor": "middle", fill: "#6a7781", "font-size": 11 }).textContent = Math.round(t * 10) / 10;
    }

    data.forEach((d, i) => {
      const y = yScale(d.iso) + yScale.bandwidth() / 2;
      const improved = d.b > d.a;
      const col = improved ? "#00a1c4" : "#701d57";
      const op = sceneIndex === 0 ? (i % 3 === 0 ? 1 : 0.35) : 0.85;
      AtlasSVG.el(g, "line", {
        x1: xScale(d.a), x2: xScale(d.b), y1: y, y2: y,
        stroke: col, "stroke-width": 4, opacity: op * 0.35
      });
      AtlasSVG.el(g, "circle", { cx: xScale(d.a), cy: y, r: 2.5, fill: "#94a3b8", opacity: op });
      AtlasSVG.el(g, "circle", { cx: xScale(d.b), cy: y, r: 3.5, fill: col, opacity: op });
      if (op > 0.5 && (i < 12 || sceneIndex > 0 && i % 8 === 0)) {
        AtlasSVG.el(g, "text", {
          x: xScale(d.b) + 6, y: y + 3, fill: col, "font-size": 10, "font-weight": "600", opacity: op
        }).textContent = d.name;
      }
    });

    const lab = document.createElement("div");
    lab.style.cssText = "position:absolute;bottom:8px;left:24px;font-size:11px;color:#57626a";
    lab.textContent = `${aKey} → ${bKey} · n=${data.length}`;
    root.appendChild(lab);
  },
};
