/**
 * AtlasUrbanRuralBars v0.1
 * Paired urban/rural bars per country (e.g. very high E. coli risk).
 *
 * Depends: AtlasSVG
 */
(function (global) {
  function ensureSVG() {
    if (!global.AtlasSVG) throw new Error("AtlasUrbanRuralBars needs AtlasSVG");
    return global.AtlasSVG;
  }

  function mount(container, options = {}) {
    const SVG = ensureSVG();
    const {
      rows = [], // { country, urban, rural } or long form
      urbanKey = "urban",
      ruralKey = "rural",
      labelKey = "country",
      urbanColor = "#6D88D1",
      ruralColor = "#54AE89",
      unitNote = "% with very high E. coli risk",
      height: heightOpt = null,
      sortBy = "rural",
    } = options;

    if (!container) throw new Error("container required");

    // accept long form: urban_rural, very_high_risk
    let data;
    if (rows.length && rows[0].urban_rural != null) {
      const by = new Map();
      rows.forEach((r) => {
        const c = r.country;
        if (!by.has(c)) by.set(c, { country: c, urban: null, rural: null });
        const k = String(r.urban_rural).toLowerCase();
        const v = +r.very_high_risk;
        if (k.startsWith("u")) by.get(c).urban = v;
        if (k.startsWith("r")) by.get(c).rural = v;
      });
      data = [...by.values()];
    } else {
      data = rows.map((r) => ({
        country: r[labelKey] || r.country,
        urban: +(r[urbanKey] != null ? r[urbanKey] : r.Urban),
        rural: +(r[ruralKey] != null ? r[ruralKey] : r.Rural),
      }));
    }
    data = data.filter((d) => Number.isFinite(d.urban) || Number.isFinite(d.rural));
    data.sort((a, b) => (b[sortBy] || 0) - (a[sortBy] || 0));

    container.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-ur-bars atlas-chart-root";
    const w = Math.max(320, container.clientWidth || 900);
    const h = heightOpt || Math.max(380, container.clientHeight || 420);
    root.style.cssText = `position:relative;width:100%;height:${h}px;font-family:'Open Sans',system-ui,sans-serif;background:#fff;display:flex;flex-direction:column`;
    container.appendChild(root);

    const leg = document.createElement("div");
    leg.style.cssText =
      "display:flex;flex-wrap:wrap;gap:10px 16px;padding:8px 8px 0;font-size:12px;font-weight:600;color:#3d4a54";
    leg.innerHTML = `
      <span><i style="display:inline-block;width:11px;height:11px;border-radius:2px;background:${urbanColor};margin-right:5px"></i>Urban</span>
      <span><i style="display:inline-block;width:11px;height:11px;border-radius:2px;background:${ruralColor};margin-right:5px"></i>Rural</span>
      <span style="font-weight:500;opacity:.8">${unitNote}</span>`;
    root.appendChild(leg);

    const plot = document.createElement("div");
    plot.style.cssText = "flex:1;min-height:0";
    root.appendChild(plot);

    const pw = plot.clientWidth || w;
    const ph = plot.clientHeight || h - 36;
    const margin = { top: 12, right: 10, bottom: 70, left: 40 };
    const svg = SVG.el(plot, "svg");
    svg.setAttribute("viewBox", `0 0 ${pw} ${ph}`);
    svg.style.cssText = "width:100%;height:100%;display:block";

    const maxV = Math.max(
      ...data.flatMap((d) => [d.urban || 0, d.rural || 0]),
      1
    );
    const yScale = (v) =>
      ph - margin.bottom - ((ph - margin.top - margin.bottom) * v) / maxV;

    [0, 25, 50, 75, 100]
      .filter((t) => t <= maxV * 1.05)
      .forEach((t) => {
        const y = yScale(t);
        SVG.el(svg, "line", {
          x1: margin.left,
          x2: pw - margin.right,
          y1: y,
          y2: y,
          stroke: "#eef1f5",
        });
        SVG.el(svg, "text", {
          x: margin.left - 6,
          y: y + 3,
          "text-anchor": "end",
          fill: "#6a7781",
          "font-size": 11,
        }).textContent = t;
      });

    const groupW = (pw - margin.left - margin.right) / Math.max(data.length, 1);
    data.forEach((d, i) => {
      [
        [d.urban, urbanColor, 0.12],
        [d.rural, ruralColor, 0.5],
      ].forEach(([v, c, off]) => {
        if (!Number.isFinite(v)) return;
        const y = yScale(v);
        SVG.el(svg, "rect", {
          x: margin.left + i * groupW + groupW * off,
          y,
          width: Math.max(1, groupW * 0.32),
          height: Math.max(0, ph - margin.bottom - y),
          fill: c,
          rx: 1,
        });
      });
      const lab = SVG.el(svg, "text", {
        x: margin.left + i * groupW + groupW / 2,
        y: ph - margin.bottom + 12,
        "text-anchor": "end",
        fill: "#6a7781",
        "font-size": 10,
        transform: `rotate(-35 ${margin.left + i * groupW + groupW / 2} ${
          ph - margin.bottom + 12
        })`,
      });
      lab.textContent =
        (d.country || "").length > 12
          ? d.country.slice(0, 11) + "…"
          : d.country;
    });

    return {
      updateScene() {},
      setScene() {},
      destroy() {
        try {
          container.innerHTML = "";
        } catch (_) {}
      },
      version: "0.1.0",
    };
  }

  const api = { mount, version: "0.1.0" };
  global.AtlasUrbanRuralBars = api;
  global.AtlasLibrary = global.AtlasLibrary || {};
  global.AtlasLibrary.UrbanRuralBars = api;
})(typeof window !== "undefined" ? window : globalThis);
