/**
 * sdg5_better_jobs_for_women — stacked employment types by sex (CHE example / multi)
 */
window.AtlasReplica = {
  ready: true, isStub: false,
  async render(_s, ctx) {
    const { chartEl, hidePlaceholder } = ctx;
    hidePlaceholder();
    const ph = document.getElementById("placeholder");
    if (ph) { ph.hidden = true; ph.style.display = "none"; }
    const rows = await AtlasLoad.csv("./data/05_data_types_employment_gender.csv");
    const types = ["unemployed", "vulnerable", "wage", "employer"];
    const labels = { unemployed: "Unemployed", vulnerable: "Vulnerable", wage: "Wage", employer: "Employer" };
    const colors = { unemployed: "#AA0000", vulnerable: "#f7b841", wage: "#0C7C68", employer: "#34A7F2" };
    const sexes = [...new Set(rows.map((r) => r.sex))];
    const data = rows.map((r) => ({
      sex: r.sex === "FE" ? "Female" : r.sex === "MA" ? "Male" : r.sex,
      code: r.code,
      vals: Object.fromEntries(types.map((t) => [t, +r[t]])),
    }));

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText = "position:relative;width:100%;height:100%;font-family:Open Sans,system-ui,sans-serif";
    chartEl.appendChild(root);
    const w = root.clientWidth || 900, h = root.clientHeight || 400;
    const margin = { top: 28, right: 24, bottom: 48, left: 56 };
    const svg = AtlasSVG.el(root, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.cssText = "width:100%;height:100%";
    const cats = data.map((d, i) => `${d.code}-${d.sex}`);
    const xScale = AtlasSVG.scaleBand(cats, [margin.left, w - margin.right], 0.25);
    const yScale = AtlasSVG.scaleLinear([0, 100], [h - margin.bottom, margin.top]);
    [0, 25, 50, 75, 100].forEach((t) => {
      AtlasSVG.el(svg, "line", { x1: margin.left, x2: w - margin.right, y1: yScale(t), y2: yScale(t), stroke: "#f1f5f9" });
      AtlasSVG.el(svg, "text", { x: margin.left - 8, y: yScale(t) + 4, "text-anchor": "end", fill: "#6a7781", "font-size": 11 }).textContent = t + "%";
    });
    data.forEach((d) => {
      const key = `${d.code}-${d.sex}`;
      let acc = 0;
      const bw = xScale.bandwidth();
      types.forEach((t) => {
        const v = d.vals[t] || 0;
        AtlasSVG.el(svg, "rect", {
          x: xScale(key), y: yScale(acc + v), width: bw, height: Math.max(0, yScale(acc) - yScale(acc + v)),
          fill: colors[t],
        });
        acc += v;
      });
      AtlasSVG.el(svg, "text", {
        x: xScale(key) + bw / 2, y: h - margin.bottom + 18, "text-anchor": "middle",
        fill: "#111", "font-size": 11, "font-weight": "600",
      }).textContent = d.sex;
    });
    const leg = document.createElement("div");
    leg.style.cssText = "position:absolute;top:8px;right:12px;display:flex;gap:10px;font-size:11px;flex-wrap:wrap";
    leg.innerHTML = types.map((t) =>
      `<span><i style="display:inline-block;width:10px;height:10px;background:${colors[t]};margin-right:3px"></i>${labels[t]}</span>`
    ).join("");
    root.appendChild(leg);
  },
};
