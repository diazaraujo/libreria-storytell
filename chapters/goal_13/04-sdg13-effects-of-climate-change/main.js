/**
 * sdg13_effects_of_climate_change — multi-hazard exposure overview
 * Ranked small-multiples / switchable hazard bars with global callouts.
 * Data: 20260130_hazard_data_prepared.csv
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

    const rows = await AtlasLoad.csv("./data/20260130_hazard_data_prepared.csv");
    const NAMES = window.ATLAS_COUNTRY_NAMES || {};
    const hazards = [
      { key: "sha_flood", label: "Floods", color: "#089BD4", people: "775M" },
      { key: "sha_drought", label: "Drought", color: "#BE792B", people: "1.4B" },
      { key: "sha_cyclone", label: "Cyclones", color: "#A37ACD", people: "8%" },
      { key: "sha_heatwave", label: "Heatwaves", color: "#C1261A", people: "40%" },
      { key: "sha_all", label: "Any hazard", color: "#081079", people: "57%" },
    ];

    // scene cycles hazards; default show all small multiples when no scenes
    const focus =
      hazards[Math.min(sceneIndex || 0, hazards.length - 1)] || hazards[4];

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText =
      "position:relative;width:100%;height:100%;font-family:Open Sans,system-ui,sans-serif;display:flex;flex-direction:column;background:#fff";
    chartEl.appendChild(root);

    // callout strip
    const strip = document.createElement("div");
    strip.style.cssText =
      "display:flex;flex-wrap:wrap;gap:8px;padding:8px 12px 4px;flex:0 0 auto";
    hazards.forEach((hz, i) => {
      const active = hz.key === focus.key;
      const chip = document.createElement("div");
      chip.style.cssText = `padding:8px 12px;border-radius:6px;border:1px solid ${
        active ? hz.color : "#e2e8f0"
      };background:${active ? hz.color + "14" : "#f8fafc"};min-width:88px`;
      chip.innerHTML = `<div style="font-size:11px;color:#6a7781;font-weight:600">${hz.label}</div>
        <div style="font-size:18px;font-weight:700;color:${hz.color};line-height:1.2">${hz.people}</div>`;
      strip.appendChild(chip);
    });
    root.appendChild(strip);

    const plot = document.createElement("div");
    plot.style.cssText = "flex:1;position:relative;min-height:0";
    root.appendChild(plot);

    const data = rows
      .map((r) => ({
        iso: r.code,
        name: NAMES[r.code] || r.code,
        v: +r[focus.key],
      }))
      .filter((d) => Number.isFinite(d.v))
      .sort((a, b) => b.v - a.v)
      .slice(0, 40);

    const w = plot.clientWidth || 900;
    const h = Math.max(plot.clientHeight || 400, 40 + data.length * 11);
    const margin = { top: 20, right: 52, bottom: 16, left: 118 };
    const svg = AtlasSVG.el(plot, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.cssText = "width:100%;height:100%";

    AtlasSVG.el(svg, "text", {
      x: margin.left,
      y: 14,
      fill: "#111",
      "font-size": 13,
      "font-weight": "700",
    }).textContent = `Share of population exposed · ${focus.label}`;

    const xScale = AtlasSVG.scaleLinear([0, 100], [margin.left, w - margin.right]);
    const yScale = AtlasSVG.scaleBand(
      data.map((d) => d.iso),
      [margin.top + 8, h - margin.bottom],
      0.14
    );

    [0, 25, 50, 75, 100].forEach((t) => {
      AtlasSVG.el(svg, "line", {
        x1: xScale(t),
        x2: xScale(t),
        y1: margin.top + 4,
        y2: h - margin.bottom,
        stroke: "#f1f5f9",
      });
      AtlasSVG.el(svg, "text", {
        x: xScale(t),
        y: h - 2,
        "text-anchor": "middle",
        fill: "#6a7781",
        "font-size": 10,
      }).textContent = t + "%";
    });

    data.forEach((d) => {
      const y = yScale(d.iso);
      const bh = yScale.bandwidth();
      AtlasSVG.el(svg, "rect", {
        x: margin.left,
        y,
        width: Math.max(xScale(d.v) - margin.left, 1),
        height: bh,
        fill: focus.color,
        rx: 2,
        opacity: 0.9,
      });
      AtlasSVG.el(svg, "text", {
        x: margin.left - 6,
        y: y + bh / 2,
        "text-anchor": "end",
        "dominant-baseline": "middle",
        fill: "#111",
        "font-size": 10,
        "font-weight": "600",
      }).textContent = String(d.name).slice(0, 16);
      AtlasSVG.el(svg, "text", {
        x: xScale(d.v) + 4,
        y: y + bh / 2,
        "dominant-baseline": "middle",
        fill: focus.color,
        "font-size": 10,
        "font-weight": "700",
      }).textContent = d.v.toFixed(0) + "%";
    });
  },
};
