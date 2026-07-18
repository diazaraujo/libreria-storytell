/**
 * venn_diagram — bubble clusters by root-cause sets (Cl0Svw_j.js)
 * A = conflict · B = corruption/low accountability · C = poor economic management
 */
window.AtlasReplica = {
  ready: true,
  isStub: false,
  async render(_s, ctx) {
    const { chartEl, hidePlaceholder, config } = ctx;
    hidePlaceholder();
    const rows = await AtlasLoad.csv("./data/01_data_causes.csv");
    const NAMES = window.ATLAS_COUNTRY_NAMES || {};

    const data = rows
      .map((r) => ({
        iso: r.iso3c,
        venn: (r.venn || "").trim() || null,
        poor: +r.poor,
      }))
      .filter((d) => Number.isFinite(d.poor) && d.iso !== "VENN");

    // layout anchors (normalized) from Atlas K()
    const anchors = {
      A: { x: -1, y: -0.34, label: config?.conflict || "Acute insecurity", color: "#AA0000" },
      B: { x: 1, y: -0.34, label: config?.cpia_tran || "Corruption & low accountability", color: "#664AB6" },
      C: { x: 0, y: 1.4, label: config?.cpia_econ || "Poor economic management", color: "#FF9800" },
      AB: { x: 0, y: -0.5, color: "#8b5cf6" },
      AC: { x: -0.66, y: 0.66, color: "#f97316" },
      BC: { x: 0.66, y: 0.66, color: "#eab308" },
      ABC: { x: 0, y: 0.33, color: "#081079" },
    };
    const R_VENN = 190;

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText =
      "position:relative;width:100%;height:100%;font-family:'Open Sans',system-ui,sans-serif;background:#fff";
    chartEl.appendChild(root);

    const w = root.clientWidth || 900;
    const h = root.clientHeight || 520;
    const cx = w * 0.48;
    const cy = h * 0.42;
    const scale = Math.min(w, h) * 0.22;

    const svg = AtlasSVG.el(root, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.cssText = "width:100%;height:100%;display:block";

    // three large venn circles
    [
      { id: "A", ...anchors.A },
      { id: "B", ...anchors.B },
      { id: "C", ...anchors.C },
    ].forEach((c) => {
      AtlasSVG.el(svg, "circle", {
        class: "venn-circle",
        cx: cx + c.x * scale, cy: cy + c.y * scale * 0.85,
        r: R_VENN * (scale / 190),
        fill: c.color, opacity: 0.12, stroke: c.color, "stroke-width": 2,
      });
      AtlasSVG.el(svg, "text", {
        x: cx + c.x * scale * 1.35, y: cy + c.y * scale * 0.85 - R_VENN * (scale / 190) * 0.55,
        "text-anchor": "middle", fill: c.color, "font-size": 13, "font-weight": "700",
      }).textContent = c.label;
    });

    const maxPoor = Math.max(...data.map((d) => d.poor), 1);
    const rScale = (poor) => 4 + Math.sqrt(poor / maxPoor) * (scale * 0.55);

    // group by venn cell and pack simply in a spiral around anchor
    const groups = new Map();
    data.forEach((d) => {
      const key = d.venn || "NONE";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(d);
    });

    const place = (list, ax, ay, color) => {
      list.sort((a, b) => b.poor - a.poor);
      const highlight = new Set(["NGA", "COD", "IND", "BFA", "IDN", "CIV", "ZWE", "PAK", "UGA", "SDN", "MWI"]);
      list.forEach((d, i) => {
        const angle = (i * 2.4) + (d.iso.charCodeAt(0) % 7) * 0.2;
        const ring = 12 + Math.floor(i / 3) * (10 + rScale(d.poor) * 0.3);
        const x = ax + Math.cos(angle) * ring;
        const y = ay + Math.sin(angle) * ring * 0.85;
        const r = rScale(d.poor);
        const g = AtlasSVG.el(svg, "g", { class: "country-circle" });
        AtlasSVG.el(g, "circle", {
          cx: x, cy: y, r,
          fill: color, opacity: 0.85, stroke: "#fff", "stroke-width": 1,
        });
        if (highlight.has(d.iso) || r > 14) {
          AtlasSVG.el(g, "text", {
            x, y: y + 3, "text-anchor": "middle",
            fill: r > 18 ? "#fff" : "#111", "font-size": r > 18 ? 10 : 9, "font-weight": "700",
          }).textContent = d.iso;
        }
        g.setAttribute("style", "cursor:default");
        g.innerHTML += ""; // keep
        // title via native title element
        const t = document.createElementNS("http://www.w3.org/2000/svg", "title");
        t.textContent = `${NAMES[d.iso] || d.iso}: ${(d.poor / 1e6).toFixed(1)}m poor`;
        g.appendChild(t);
      });
    };

    Object.entries(anchors).forEach(([id, a]) => {
      const list = groups.get(id) || [];
      if (!list.length) return;
      place(list, cx + a.x * scale, cy + a.y * scale * 0.85, a.color || "#57626a");
    });
    // less-affected
    const none = groups.get("NONE") || [];
    if (none.length) {
      place(none, w * 0.88, h * 0.72, "#8a969f");
      AtlasSVG.el(svg, "text", {
        x: w * 0.88, y: h * 0.72 - 60, "text-anchor": "middle",
        fill: "#57626a", "font-size": 12, "font-weight": "700",
      }).textContent = config?.not_affected_title || "Less affected countries";
    }

    // size legend
    const leg = document.createElement("div");
    leg.style.cssText =
      "position:absolute;left:12px;bottom:12px;background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:8px 12px;font-size:11px";
    leg.innerHTML = `
      <div style="font-weight:700;margin-bottom:4px">${config?.number_poor || "Number of poor"} ${config?.million || "(millions)"}</div>
      <div style="display:flex;gap:12px;align-items:flex-end">
        <span style="text-align:center"><i style="display:block;width:10px;height:10px;border-radius:50%;background:#081079;margin:0 auto 4px"></i>10m</span>
        <span style="text-align:center"><i style="display:block;width:18px;height:18px;border-radius:50%;background:#081079;margin:0 auto 4px"></i>50m</span>
      </div>`;
    root.appendChild(leg);
  },
};
