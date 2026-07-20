/**
 * AtlasLimitingFactorsBars v0.1
 * Grouped bars: accessibility / availability / quality per country.
 * Limiting factor full opacity; others dimmed.
 *
 * Depends: AtlasSVG
 */
(function (global) {
  const INSTANCES = new WeakMap();
  const COLS = [
    { key: "accessibility", color: "#34A7F2", label: "Accessibility" },
    { key: "availability", color: "#664AB6", label: "Availability" },
    { key: "quality", color: "#4EC2C0", label: "Quality" },
  ];

  function ensureSVG() {
    if (!global.AtlasSVG) throw new Error("AtlasLimitingFactorsBars needs AtlasSVG");
    return global.AtlasSVG;
  }

  function parse(rows) {
    return rows
      .map((r) => ({
        name: r.country_name || r.name,
        iso: r.iso3 || r.iso3c,
        accessibility: +r.accessibility,
        availability: +r.availability,
        quality: +r.quality,
        limiting: String(r.limiting_factor || "").toLowerCase(),
        min: +r.min_value,
      }))
      .filter((d) => Number.isFinite(d.min));
  }

  function selectForScene(all, sceneIndex) {
    if (sceneIndex === 0) {
      const pacific = all.filter((d) =>
        /Tuvalu|Nauru|Tonga|Kiribati|Marshall|Palau|Micronesia|Samoa|Fiji/i.test(
          d.name
        )
      );
      if (pacific.length >= 3) return pacific.slice(0, 12);
      return all
        .filter((d) => d.limiting.includes("qual"))
        .sort((a, b) => a.quality - b.quality)
        .slice(0, 12);
    }
    if (sceneIndex === 1) {
      return all
        .filter((d) => d.limiting.includes("access"))
        .sort((a, b) => a.accessibility - b.accessibility)
        .slice(0, 15);
    }
    if (sceneIndex === 2) {
      return all
        .filter((d) => d.limiting.includes("avail"))
        .sort((a, b) => a.availability - b.availability)
        .slice(0, 15);
    }
    // overview: lowest min
    return all.sort((a, b) => a.min - b.min).slice(0, 18);
  }

  function mount(container, options = {}) {
    const SVG = ensureSVG();
    const {
      rows = [],
      sceneIndex = 0,
      height: heightOpt = null,
      forceRemount = false,
      reuse = true,
    } = options;

    if (!container) throw new Error("container required");
    if (reuse && !forceRemount && INSTANCES.has(container)) {
      const inst = INSTANCES.get(container);
      inst.setScene(sceneIndex);
      return inst.api;
    }
    if (INSTANCES.has(container)) {
      try {
        INSTANCES.get(container).api.destroy();
      } catch (_) {}
      INSTANCES.delete(container);
    }

    const all = parse(rows);
    container.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-limiting-bars atlas-chart-root";
    const w = Math.max(320, container.clientWidth || 900);
    const h = heightOpt || Math.max(400, container.clientHeight || 440);
    root.style.cssText = `position:relative;width:100%;height:${h}px;font-family:'Open Sans',system-ui,sans-serif;background:#fff;display:flex;flex-direction:column`;
    container.appendChild(root);

    const leg = document.createElement("div");
    leg.style.cssText =
      "display:flex;flex-wrap:wrap;gap:10px 14px;padding:8px 8px 0;font-size:12px;font-weight:600;color:#3d4a54";
    COLS.forEach((c) => {
      const s = document.createElement("span");
      s.innerHTML = `<i style="display:inline-block;width:11px;height:11px;border-radius:2px;background:${c.color};margin-right:5px"></i>${c.label}`;
      leg.appendChild(s);
    });
    root.appendChild(leg);

    const plot = document.createElement("div");
    plot.style.cssText = "flex:1;min-height:0;position:relative";
    root.appendChild(plot);

    let current = sceneIndex;

    function paint(idx) {
      let data = selectForScene(all.slice(), idx);
      if (!data.length) data = all.slice(0, 12);
      plot.innerHTML = "";
      const pw = plot.clientWidth || w;
      const ph = plot.clientHeight || h - 36;
      const margin = { top: 12, right: 10, bottom: 88, left: 40 };
      const svg = SVG.el(plot, "svg");
      svg.setAttribute("viewBox", `0 0 ${pw} ${ph}`);
      svg.style.cssText = "width:100%;height:100%;display:block";

      [0, 25, 50, 75, 100].forEach((t) => {
        const y =
          ph - margin.bottom - ((ph - margin.top - margin.bottom) * t) / 100;
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
      const barW = groupW / 4;
      data.forEach((d, i) => {
        COLS.forEach((c, ci) => {
          const v = d[c.key];
          if (!Number.isFinite(v)) return;
          const bh =
            ((ph - margin.top - margin.bottom) * Math.max(0, Math.min(100, v))) /
            100;
          const x = margin.left + i * groupW + barW * (ci + 0.45);
          const y = ph - margin.bottom - bh;
          const isLim = d.limiting.includes(c.key.slice(0, 4));
          SVG.el(svg, "rect", {
            x,
            y,
            width: Math.max(1, barW * 0.85),
            height: Math.max(0, bh),
            fill: c.color,
            opacity: isLim ? 1 : 0.38,
            rx: 1,
          });
        });
        const lab = SVG.el(svg, "text", {
          x: margin.left + i * groupW + groupW / 2,
          y: ph - margin.bottom + 12,
          "text-anchor": "end",
          fill: "#6a7781",
          "font-size": 10,
          transform: `rotate(-40 ${margin.left + i * groupW + groupW / 2} ${
            ph - margin.bottom + 12
          })`,
        });
        lab.textContent =
          d.name.length > 14 ? d.name.slice(0, 12) + "…" : d.name;
      });
      current = idx;
    }

    paint(sceneIndex);

    const api = {
      updateScene(n) {
        paint(n);
      },
      setScene(n) {
        paint(n);
      },
      destroy() {
        try {
          container.innerHTML = "";
        } catch (_) {}
        INSTANCES.delete(container);
      },
      get sceneIndex() {
        return current;
      },
      version: "0.1.0",
    };
    INSTANCES.set(container, { api, setScene: paint });
    return api;
  }

  const api = { mount, version: "0.1.0" };
  global.AtlasLimitingFactorsBars = api;
  global.AtlasLibrary = global.AtlasLibrary || {};
  global.AtlasLibrary.LimitingFactorsBars = api;
})(typeof window !== "undefined" ? window : globalThis);
