/**
 * digital_skills — % of population by skill level × income group
 */
window.AtlasReplica = {
  ready: true, isStub: false,
  async render(_s, ctx) {
    const { chartEl, hidePlaceholder } = ctx;
    hidePlaceholder();
    const ph = document.getElementById("placeholder");
    if (ph) { ph.hidden = true; ph.style.display = "none"; }
    const rows = await AtlasLoad.csv("./data/digitalskills.csv");
    const INC = ["LIC", "LMC", "UMC", "HIC"];
    const INC_COL = { LIC: "#3B4DA6", LMC: "#DB95D7", UMC: "#73AF48", HIC: "#016B6C" };
    const skills = [...new Set(rows.map((r) => r.skill_level))];
    const data = rows.map((r) => ({
      skill: r.skill_level,
      income: r.income_group,
      v: +r.pct_of_population,
    })).filter((d) => Number.isFinite(d.v));

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText = "position:relative;width:100%;height:100%;font-family:Open Sans,system-ui,sans-serif";
    chartEl.appendChild(root);
    const w = root.clientWidth || 900, h = root.clientHeight || 420;
    const margin = { top: 36, right: 20, bottom: 80, left: 48 };
    const svg = AtlasSVG.el(root, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.cssText = "width:100%;height:100%";
    const xScale = AtlasSVG.scaleBand(skills, [margin.left, w - margin.right], 0.2);
    const yScale = AtlasSVG.scaleLinear([0, 100], [h - margin.bottom, margin.top]);
    const groupW = xScale.bandwidth();
    const barW = groupW / (INC.length + 0.5);

    [0, 25, 50, 75, 100].forEach((t) => {
      AtlasSVG.el(svg, "line", { x1: margin.left, x2: w - margin.right, y1: yScale(t), y2: yScale(t), stroke: "#f1f5f9" });
      AtlasSVG.el(svg, "text", { x: margin.left - 8, y: yScale(t) + 4, "text-anchor": "end", fill: "#6a7781", "font-size": 11 }).textContent = t + "%";
    });

    skills.forEach((sk) => {
      INC.forEach((inc, i) => {
        const d = data.find((x) => x.skill === sk && x.income === inc);
        if (!d) return;
        const x = xScale(sk) + i * barW;
        AtlasSVG.el(svg, "rect", {
          x, y: yScale(d.v), width: barW * 0.9, height: Math.max(0, yScale(0) - yScale(d.v)),
          fill: INC_COL[inc], rx: 2,
        });
      });
      AtlasSVG.el(svg, "text", {
        x: xScale(sk) + groupW / 2, y: h - margin.bottom + 36,
        "text-anchor": "middle", fill: "#111", "font-size": 11, "font-weight": "600",
      }).textContent = sk.replace(" Digital Skills", "").replace("Less than Basic", "< Basic");
    });

    const leg = document.createElement("div");
    leg.style.cssText = "position:absolute;top:8px;right:12px;display:flex;gap:10px;font-size:11px";
    leg.innerHTML = INC.map((i) =>
      `<span><i style="display:inline-block;width:10px;height:10px;background:${INC_COL[i]};margin-right:3px;border-radius:2px"></i>${i}</span>`
    ).join("");
    root.appendChild(leg);
  },
};
