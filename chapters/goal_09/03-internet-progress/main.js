/**
 * internet_progress — horizontal race 2015→2024 (similar to electricity progress)
 */
window.AtlasReplica = {
  ready: true, isStub: false,
  async render(scene, ctx) {
    const { chartEl, hidePlaceholder, sceneIndex } = ctx;
    hidePlaceholder();
    const rows = await AtlasLoad.csv("./data/09_data_internet_usage_progress.csv");
    const NAMES = window.ATLAS_COUNTRY_NAMES || {};
    const FOCUS = sceneIndex >= 1 ? ["JOR", "KWT", "MYS", "KGZ", "KHM"] : [];

    let data = rows
      .map((r) => ({
        iso: r.iso3c,
        name: NAMES[r.iso3c] || r.iso3c,
        a2015: +r.internet_2015,
        a2024: +r.internet_2024,
      }))
      .filter((d) => Number.isFinite(d.a2015) && Number.isFinite(d.a2024));
    data.forEach((d) => { d.delta = d.a2024 - d.a2015; });
    data.sort((a, b) => a.a2015 - b.a2015);

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText = "position:relative;width:100%;height:100%;font-family:'Open Sans',system-ui,sans-serif;background:#fff";
    chartEl.appendChild(root);
    const w = root.clientWidth || 900;
    const h = Math.max(root.clientHeight || 520, 28 + data.length * 3.6);
    const margin = { top: 28, right: 20, bottom: 20, left: 20 };
    const svg = AtlasSVG.el(root, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.cssText = "width:100%;height:100%";
    const plotW = w - margin.left - margin.right;
    const plotH = h - margin.top - margin.bottom;
    const xScale = AtlasSVG.scaleLinear([0, 100], [0, plotW]);
    const yScale = AtlasSVG.scaleBand(data.map((d) => d.iso), [0, plotH], 0.05);
    const g = AtlasSVG.el(svg, "g", { transform: `translate(${margin.left},${margin.top})` });

    [0, 25, 50, 75, 90, 100].forEach((t) => {
      AtlasSVG.el(g, "line", { x1: xScale(t), x2: xScale(t), y1: 0, y2: plotH, stroke: "#f1f5f9" });
      AtlasSVG.el(g, "text", { x: xScale(t), y: -8, "text-anchor": "middle", fill: "#6a7781", "font-size": 11, "font-weight": "600" }).textContent = t + "%";
    });

    data.forEach((d) => {
      const y = yScale(d.iso) + yScale.bandwidth() / 2;
      const focus = FOCUS.includes(d.iso);
      const over90 = d.a2024 >= 90;
      const col = focus ? "#00a1c4" : over90 ? "#0C7C68" : "#94a3b8";
      const op = sceneIndex === 0 ? (over90 ? 1 : 0.45) : (focus ? 1 : 0.35);
      AtlasSVG.el(g, "line", {
        x1: xScale(d.a2015), x2: xScale(d.a2024), y1: y, y2: y,
        stroke: col, "stroke-width": 4, opacity: op * 0.35,
      });
      // triangle head
      const r = 4;
      AtlasSVG.el(g, "path", {
        d: `M${-r},${-r} L${r},0 L${-r},${r} Z`,
        fill: col, opacity: op,
        transform: `translate(${xScale(d.a2024)},${y})`,
      });
      if (focus || (sceneIndex === 0 && over90 && d.a2015 < 70)) {
        AtlasSVG.el(g, "text", {
          x: xScale(d.a2024) + 8, y: y + 3,
          fill: col, "font-size": 10, "font-weight": "700", opacity: op,
        }).textContent = `${d.name} ${d.a2024.toFixed(0)}%`;
      }
    });

    const cap = document.createElement("div");
    cap.style.cssText = "position:absolute;bottom:12px;left:20px;font-size:12px;color:#334155;background:#fff;padding:6px 10px;border:1px solid #e2e8f0;border-radius:4px";
    cap.textContent = sceneIndex === 0
      ? "54 countries above 90% Internet use by 2024 · 2015 → 2024"
      : "Highlight: fast risers (e.g. Jordan, Kuwait, Malaysia, Kyrgyzstan, Cambodia)";
    root.appendChild(cap);
  },
};
