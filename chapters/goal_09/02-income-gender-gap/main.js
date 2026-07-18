/** income_gender_gap — grouped male/female bars by income group (2024) */
window.AtlasReplica = {
  ready: true, isStub: false,
  async render(_s, ctx) {
    const { chartEl, hidePlaceholder } = ctx;
    hidePlaceholder();
    const rows = await AtlasLoad.csv("./data/09_data_income_gender_gap.csv");
    const ORDER = ["LIC", "LMC", "UMC", "HIC"];
    const LABELS = { LIC: "Low income", LMC: "Lower middle", UMC: "Upper middle", HIC: "High income" };
    const data = ORDER.map((k) => {
      const r = rows.find((x) => x.income_group === k);
      return { key: k, female: +r.female, male: +r.male };
    });

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText = "position:relative;width:100%;height:100%;font-family:'Open Sans',system-ui,sans-serif";
    chartEl.appendChild(root);
    const w = root.clientWidth || 860, h = root.clientHeight || 400;
    const margin = { top: 28, right: 24, bottom: 48, left: 48 };
    const svg = AtlasSVG.el(root, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.cssText = "width:100%;height:100%";
    const xScale = AtlasSVG.scaleBand(ORDER, [margin.left, w - margin.right], 0.25);
    const yScale = AtlasSVG.scaleLinear([0, 100], [h - margin.bottom, margin.top]);
    const bw = xScale.bandwidth();
    const F = "#DB95D7", M = "#34A7F2";

    [0, 25, 50, 75, 100].forEach((t) => {
      AtlasSVG.el(svg, "line", { x1: margin.left, x2: w - margin.right, y1: yScale(t), y2: yScale(t), stroke: "#f1f5f9" });
      AtlasSVG.el(svg, "text", { x: margin.left - 8, y: yScale(t) + 4, "text-anchor": "end", fill: "#6a7781", "font-size": 11 }).textContent = t + "%";
    });

    data.forEach((d) => {
      const x0 = xScale(d.key);
      const barW = bw * 0.38;
      // female
      AtlasSVG.el(svg, "rect", {
        x: x0, y: yScale(d.female), width: barW, height: yScale(0) - yScale(d.female),
        fill: F, rx: 3,
      });
      AtlasSVG.el(svg, "text", {
        x: x0 + barW / 2, y: yScale(d.female) - 6, "text-anchor": "middle",
        fill: F, "font-size": 12, "font-weight": "700",
      }).textContent = d.female.toFixed(1);
      // male
      AtlasSVG.el(svg, "rect", {
        x: x0 + barW + bw * 0.08, y: yScale(d.male), width: barW, height: yScale(0) - yScale(d.male),
        fill: M, rx: 3,
      });
      AtlasSVG.el(svg, "text", {
        x: x0 + barW + bw * 0.08 + barW / 2, y: yScale(d.male) - 6, "text-anchor": "middle",
        fill: M, "font-size": 12, "font-weight": "700",
      }).textContent = d.male.toFixed(1);
      // gap callout for LIC/LMC
      const gap = d.male - d.female;
      if (gap > 5) {
        AtlasSVG.el(svg, "text", {
          x: x0 + bw / 2, y: h - margin.bottom + 32, "text-anchor": "middle",
          fill: "#AA0000", "font-size": 11, "font-weight": "600",
        }).textContent = `gap ${gap.toFixed(1)} pp`;
      }
      AtlasSVG.el(svg, "text", {
        x: x0 + bw / 2, y: h - margin.bottom + 18, "text-anchor": "middle",
        fill: "#111", "font-size": 12, "font-weight": "700",
      }).textContent = LABELS[d.key];
    });

    const foot = document.createElement("div");
    foot.style.cssText = "position:absolute;top:8px;right:16px;display:flex;gap:12px;font-size:12px";
    foot.innerHTML = `<span><i style="width:10px;height:10px;background:${F};display:inline-block;margin-right:4px;border-radius:2px"></i>Female</span>
      <span><i style="width:10px;height:10px;background:${M};display:inline-block;margin-right:4px;border-radius:2px"></i>Male</span>
      <span style="color:#6a7781">Internet use 2024</span>`;
    root.appendChild(foot);
  },
};
