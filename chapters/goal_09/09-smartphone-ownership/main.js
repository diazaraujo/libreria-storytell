/**
 * smartphone_ownership — % without smartphone / mobile_is_main by income (scenes)
 * Data: mobile_is_main = own smartphone-ish; lack_of_money barrier
 */
window.AtlasReplica = {
  ready: true, isStub: false,
  async render(scene, ctx) {
    const { chartEl, hidePlaceholder, sceneIndex } = ctx;
    hidePlaceholder();
    const rows = await AtlasLoad.csv("./data/09_data_lack_of_money.csv");
    const INC_ORDER = ["LIC", "LMC", "UMC", "HIC"];
    const INC_LABEL = { LIC: "Low income", LMC: "Lower middle", UMC: "Upper middle", HIC: "High income" };
    const INC_COL = { LIC: "#3B4DA6", LMC: "#DB95D7", UMC: "#73AF48", HIC: "#016B6C" };

    // country rows only
    const countries = rows
      .filter((r) => r.region_code && !INC_ORDER.includes(r.region_code) && r.mobile_is_main !== "")
      .map((r) => ({
        iso: r.region_code,
        name: r.region_name,
        income: r.income_group,
        own: +r.mobile_is_main,
        lack: r.lack_of_money === "" ? null : +r.lack_of_money,
        pop: +r.population || 0,
      }))
      .filter((d) => Number.isFinite(d.own));

    // lack of ownership = 100 - own
    countries.forEach((d) => { d.noPhone = 100 - d.own; });

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText = "position:relative;width:100%;height:100%;font-family:'Open Sans',system-ui,sans-serif";
    chartEl.appendChild(root);
    const w = root.clientWidth || 900, h = root.clientHeight || 460;
    const margin = { top: 28, right: 24, bottom: 40, left: 48 };
    const svg = AtlasSVG.el(root, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.cssText = "width:100%;height:100%";

    if (sceneIndex === 0) {
      // beeswarm-ish strip by income: % without smartphone
      const xScale = AtlasSVG.scaleBand(INC_ORDER, [margin.left, w - margin.right], 0.2);
      const yScale = AtlasSVG.scaleLinear([0, 100], [h - margin.bottom, margin.top]);
      [0, 25, 50, 75, 100].forEach((t) => {
        AtlasSVG.el(svg, "line", { x1: margin.left, x2: w - margin.right, y1: yScale(t), y2: yScale(t), stroke: "#f1f5f9" });
        AtlasSVG.el(svg, "text", { x: margin.left - 8, y: yScale(t) + 4, "text-anchor": "end", fill: "#6a7781", "font-size": 11 }).textContent = t + "%";
      });
      INC_ORDER.forEach((inc) => {
        const list = countries.filter((d) => d.income === inc).sort((a, b) => b.noPhone - a.noPhone);
        const cx = xScale(inc) + xScale.bandwidth() / 2;
        list.forEach((d, i) => {
          const jitter = ((i % 7) - 3) * 5;
          AtlasSVG.el(svg, "circle", {
            cx: cx + jitter, cy: yScale(d.noPhone), r: 4.5,
            fill: INC_COL[inc], opacity: 0.75, stroke: "#fff", "stroke-width": 1,
          });
        });
        AtlasSVG.el(svg, "text", {
          x: cx, y: h - margin.bottom + 20, "text-anchor": "middle",
          fill: INC_COL[inc], "font-size": 12, "font-weight": "700",
        }).textContent = INC_LABEL[inc];
      });
      AtlasSVG.el(svg, "text", {
        x: 12, y: margin.top - 10, fill: "#6a7781", "font-size": 11,
      }).textContent = "% who do not own a smartphone";
    } else {
      // focus LIC countries bars
      const lic = countries.filter((d) => d.income === "LIC").sort((a, b) => b.noPhone - a.noPhone);
      const focus = ["BFA", "TCD", "COD", "ETH", "MWI", "NER", "MDG", "MOZ", "UGA", "GNB"];
      const show = lic.filter((d) => focus.includes(d.iso)).concat(lic.filter((d) => !focus.includes(d.iso))).slice(0, 17);
      const xScale = AtlasSVG.scaleLinear([0, 100], [margin.left, w - margin.right - 80]);
      const yScale = AtlasSVG.scaleBand(show.map((d) => d.iso), [margin.top, h - margin.bottom], 0.15);
      show.forEach((d) => {
        const y = yScale(d.iso), bh = yScale.bandwidth();
        const hi = focus.includes(d.iso);
        AtlasSVG.el(svg, "rect", {
          x: margin.left, y, width: Math.max(xScale(d.noPhone) - margin.left, 1), height: bh,
          fill: hi ? "#3B4DA6" : "#94a3b8", rx: 3,
        });
        AtlasSVG.el(svg, "text", {
          x: margin.left - 8, y: y + bh / 2, "text-anchor": "end", "dominant-baseline": "middle",
          fill: "#111", "font-size": 12, "font-weight": hi ? "700" : "500",
        }).textContent = d.name;
        AtlasSVG.el(svg, "text", {
          x: xScale(d.noPhone) + 6, y: y + bh / 2, "dominant-baseline": "middle",
          fill: hi ? "#3B4DA6" : "#57626a", "font-size": 12, "font-weight": "700",
        }).textContent = d.noPhone.toFixed(0) + "%";
      });
      AtlasSVG.el(svg, "text", {
        x: margin.left, y: margin.top - 10, fill: "#6a7781", "font-size": 11,
      }).textContent = "Low-income countries — share without a smartphone";
    }
  },
};
