/**
 * food_insecurity_hotspots — countries × driver flags
 */
window.AtlasReplica = {
  ready: true, isStub: false,
  async render(_s, ctx) {
    const { chartEl, hidePlaceholder } = ctx;
    hidePlaceholder();
    const rows = await AtlasLoad.csv("./data/02_hunger_hotspots.csv");
    const NAMES = window.ATLAS_COUNTRY_NAMES || {};
    const drivers = ["conflict_security", "displacement", "dry_conditions", "economic_shock", "flood", "social_instability", "tropical_cyclone"];
    const labels = {
      conflict_security: "Conflict", displacement: "Displacement", dry_conditions: "Dry",
      economic_shock: "Economic", flood: "Flood", social_instability: "Social", tropical_cyclone: "Cyclone",
    };
    // latest period per country
    const periods = [...new Set(rows.map((r) => r.period))];
    const latest = periods[periods.length - 1];
    const data = rows.filter((r) => r.period === latest)
      .map((r) => ({
        iso: r.iso3c,
        name: NAMES[r.iso3c] || r.iso3c,
        concern: r.concern,
        n: +r.driver_number || drivers.reduce((a, d) => a + (+r[d] || 0), 0),
        flags: Object.fromEntries(drivers.map((d) => [d, +r[d] || 0])),
      }))
      .sort((a, b) => b.n - a.n || a.iso.localeCompare(b.iso));

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText = "position:absolute;inset:0;overflow:auto;padding:12px 16px;font-family:Open Sans,system-ui,sans-serif";
    chartEl.appendChild(root);
    const head = document.createElement("div");
    head.style.cssText = "font-size:12px;color:#57626a;margin-bottom:10px";
    head.textContent = `Hotspots · ${latest} · ${data.length} countries`;
    root.appendChild(head);
    const table = document.createElement("div");
    table.style.cssText = `display:grid;grid-template-columns:120px 70px repeat(${drivers.length}, 1fr);gap:4px;font-size:11px;align-items:center`;
    table.innerHTML = `<div style="font-weight:700">Country</div><div style="font-weight:700">Concern</div>` +
      drivers.map((d) => `<div style="font-weight:700;text-align:center">${labels[d]}</div>`).join("");
    data.forEach((d) => {
      const concernCol = d.concern === "highest" ? "#AA0000" : d.concern === "high" ? "#f7b841" : "#94a3b8";
      table.innerHTML += `<div style="font-weight:600">${d.name}</div>
        <div style="color:${concernCol};font-weight:700;text-transform:capitalize">${d.concern || "—"}</div>` +
        drivers.map((dr) => {
          const on = d.flags[dr];
          return `<div style="text-align:center"><span style="display:inline-block;width:14px;height:14px;border-radius:3px;background:${on ? "#081079" : "#e2e8f0"}"></span></div>`;
        }).join("");
    });
    root.appendChild(table);
  },
};
