/** can_send_text_message — % who can send a text; highlight never-send countries */
window.AtlasReplica = {
  ready: true, isStub: false,
  async render(_s, ctx) {
    const { chartEl, hidePlaceholder } = ctx;
    hidePlaceholder();
    const rows = await AtlasLoad.csv("./data/09_data_can_send_text_message.csv");
    const data = rows
      .map((r) => ({ iso: r.region_code, name: r.region_name, v: +r.value }))
      .filter((d) => Number.isFinite(d.v))
      .sort((a, b) => a.v - b.v);

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText = "position:relative;width:100%;height:100%;font-family:'Open Sans',system-ui,sans-serif";
    chartEl.appendChild(root);
    const w = root.clientWidth || 900;
    const h = Math.max(root.clientHeight || 480, 40 + data.length * 7);
    const margin = { top: 24, right: 56, bottom: 24, left: 140 };
    const svg = AtlasSVG.el(root, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.cssText = "width:100%;height:100%";
    const xScale = AtlasSVG.scaleLinear([0, 100], [margin.left, w - margin.right]);
    const yScale = AtlasSVG.scaleBand(data.map((d) => d.iso), [margin.top, h - margin.bottom], 0.12);

    // 50% threshold
    AtlasSVG.el(svg, "line", {
      x1: xScale(50), x2: xScale(50), y1: margin.top, y2: h - margin.bottom,
      stroke: "#AA0000", "stroke-dasharray": "4 3", "stroke-width": 1.5,
    });
    AtlasSVG.el(svg, "text", {
      x: xScale(50) + 4, y: margin.top - 6, fill: "#AA0000", "font-size": 11, "font-weight": "700",
    }).textContent = "50%";

    data.forEach((d) => {
      const y = yScale(d.iso), bh = yScale.bandwidth();
      const low = d.v < 50;
      AtlasSVG.el(svg, "rect", {
        x: margin.left, y, width: Math.max(xScale(d.v) - margin.left, 1), height: bh,
        fill: low ? "#AA0000" : "#34A7F2", opacity: 0.85, rx: 2,
      });
      AtlasSVG.el(svg, "text", {
        x: margin.left - 8, y: y + bh / 2, "text-anchor": "end", "dominant-baseline": "middle",
        fill: "#111", "font-size": 11, "font-weight": low ? "700" : "500",
      }).textContent = d.name;
      AtlasSVG.el(svg, "text", {
        x: xScale(d.v) + 4, y: y + bh / 2, "dominant-baseline": "middle",
        fill: low ? "#AA0000" : "#57626a", "font-size": 11, "font-weight": "700",
      }).textContent = d.v.toFixed(0) + "%";
    });

    const note = document.createElement("div");
    note.style.cssText = "position:absolute;top:8px;right:12px;font-size:11px;color:#57626a;max-width:220px;text-align:right";
    note.innerHTML = `<span style="color:#AA0000;font-weight:700">Red</span>: more than half have <em>never</em> sent a text · value = % who can`;
    root.appendChild(note);
  },
};
