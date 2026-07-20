/**
 * buildup_area_overtime — Addis Ababa built-up area + population (dual series)
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

    const [area, pop] = await Promise.all([
      AtlasLoad.csv("./data/build_up_area.csv"),
      AtlasLoad.csv("./data/population.csv"),
    ]);
    const aPts = area
      .map((r) => ({ year: +r.year, v: +r.value }))
      .filter((d) => Number.isFinite(d.year) && Number.isFinite(d.v))
      .sort((a, b) => a.year - b.year);
    const pPts = pop
      .map((r) => ({ year: +r.year, v: +r.value }))
      .filter((d) => Number.isFinite(d.year) && Number.isFinite(d.v))
      .sort((a, b) => a.year - b.year);

    // scene progressive: area only → both
    const showPop = (sceneIndex || 0) >= 1;

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText =
      "position:relative;width:100%;height:100%;font-family:Open Sans,system-ui,sans-serif;background:#fff";
    chartEl.appendChild(root);

    const w = root.clientWidth || 900;
    const h = root.clientHeight || 440;
    const margin = { top: 36, right: 56, bottom: 40, left: 56 };
    const svg = AtlasSVG.el(root, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.cssText = "width:100%;height:100%";

    const years = [
      ...new Set([...aPts.map((d) => d.year), ...pPts.map((d) => d.year)]),
    ].sort((a, b) => a - b);
    const xScale = AtlasSVG.scaleLinear(
      [years[0], years[years.length - 1]],
      [margin.left, w - margin.right]
    );
    const aMax = Math.max(...aPts.map((d) => d.v), 1);
    const pMax = Math.max(...pPts.map((d) => d.v), 1);
    const yArea = AtlasSVG.scaleLinear(
      [0, aMax * 1.1],
      [h - margin.bottom, margin.top]
    );
    const yPop = AtlasSVG.scaleLinear(
      [0, pMax * 1.1],
      [h - margin.bottom, margin.top]
    );

    const colA = "#F3578E";
    const colP = "#34A7F2";

    // grid on area scale
    for (let i = 0; i <= 4; i++) {
      const t = (aMax * 1.1 * i) / 4;
      AtlasSVG.el(svg, "line", {
        x1: margin.left,
        x2: w - margin.right,
        y1: yArea(t),
        y2: yArea(t),
        stroke: "#f1f5f9",
      });
      AtlasSVG.el(svg, "text", {
        x: margin.left - 6,
        y: yArea(t) + 4,
        "text-anchor": "end",
        fill: colA,
        "font-size": 10,
      }).textContent = Math.round(t);
    }

    // area path + fill
    if (aPts.length > 1) {
      const dLine = aPts
        .map((p, i) => `${i ? "L" : "M"}${xScale(p.year)},${yArea(p.v)}`)
        .join(" ");
      let dArea =
        dLine +
        ` L${xScale(aPts[aPts.length - 1].year)},${yArea(0)} L${xScale(
          aPts[0].year
        )},${yArea(0)} Z`;
      AtlasSVG.el(svg, "path", {
        d: dArea,
        fill: colA,
        opacity: 0.15,
      });
      AtlasSVG.el(svg, "path", {
        d: dLine,
        fill: "none",
        stroke: colA,
        "stroke-width": 2.8,
        "stroke-linecap": "round",
      });
    }

    if (showPop && pPts.length > 1) {
      AtlasSVG.el(svg, "path", {
        d: pPts
          .map((p, i) => `${i ? "L" : "M"}${xScale(p.year)},${yPop(p.v)}`)
          .join(" "),
        fill: "none",
        stroke: colP,
        "stroke-width": 2.4,
        "stroke-dasharray": "6 4",
        "stroke-linecap": "round",
      });
      // right axis ticks
      for (let i = 0; i <= 4; i++) {
        const t = (pMax * 1.1 * i) / 4;
        AtlasSVG.el(svg, "text", {
          x: w - margin.right + 6,
          y: yPop(t) + 4,
          fill: colP,
          "font-size": 10,
        }).textContent = Math.round(t);
      }
    }

    [years[0], years[Math.floor(years.length / 2)], years[years.length - 1]].forEach(
      (yr) => {
        AtlasSVG.el(svg, "text", {
          x: xScale(yr),
          y: h - 12,
          "text-anchor": "middle",
          fill: "#6a7781",
          "font-size": 12,
          "font-weight": "600",
        }).textContent = String(yr);
      }
    );

    AtlasSVG.el(svg, "text", {
      x: margin.left,
      y: 18,
      fill: "#111",
      "font-size": 13,
      "font-weight": "700",
    }).textContent = showPop
      ? "Addis Ababa · built-up area (km²) + population (000s)"
      : "Addis Ababa · built-up area has more than tripled";

    const leg = document.createElement("div");
    leg.style.cssText =
      "position:absolute;top:40px;right:16px;font-size:11px;font-weight:600;display:flex;flex-direction:column;gap:4px";
    leg.innerHTML = `<span style="color:${colA}">━ Built-up area</span>${
      showPop ? `<span style="color:${colP}">┄ Population</span>` : ""
    }`;
    root.appendChild(leg);
  },
};
