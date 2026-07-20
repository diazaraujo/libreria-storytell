/**
 * AtlasStackedShareBars v0.1
 * 100% stacked bars by group (arsenic ppb bands, etc).
 * sceneIndex switches view filter on rows.
 *
 * Depends: AtlasSVG
 */
(function (global) {
  const INSTANCES = new WeakMap();
  const DEFAULT_SEGMENTS = [
    { key: "low", field: "ppb_10", color: "#54AE89", label: "<10 ppb" },
    { key: "mid", field: "ppb_10_50", color: "#fbbf24", label: "10–50 ppb" },
    { key: "high", field: "ppb_50", color: "#AA0000", label: ">50 ppb" },
  ];

  function ensureSVG() {
    if (!global.AtlasSVG) throw new Error("AtlasStackedShareBars needs AtlasSVG");
    return global.AtlasSVG;
  }

  function mount(container, options = {}) {
    const SVG = ensureSVG();
    const {
      rows = [],
      sceneIndex = 0,
      // views: scene 0 urban_rural, scene 1 income
      views = ["urban_rural", "income"],
      viewField = "view",
      groupField = "group",
      segments = DEFAULT_SEGMENTS,
      excludeGroups = ["Total"],
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

    container.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-stacked-share atlas-chart-root";
    const w = Math.max(320, container.clientWidth || 800);
    const h = heightOpt || Math.max(380, container.clientHeight || 420);
    root.style.cssText = `position:relative;width:100%;height:${h}px;font-family:'Open Sans',system-ui,sans-serif;background:#fff;display:flex;flex-direction:column`;
    container.appendChild(root);

    const leg = document.createElement("div");
    leg.style.cssText =
      "display:flex;flex-wrap:wrap;gap:10px 16px;padding:8px 8px 0;font-size:12px;font-weight:600;color:#3d4a54";
    segments.forEach((s) => {
      const span = document.createElement("span");
      span.innerHTML = `<i style="display:inline-block;width:11px;height:11px;border-radius:2px;background:${s.color};margin-right:5px"></i>${s.label}`;
      leg.appendChild(span);
    });
    const viewNote = document.createElement("span");
    viewNote.id = "view-note";
    viewNote.style.cssText = "font-weight:500;opacity:.8";
    leg.appendChild(viewNote);
    root.appendChild(leg);

    const plot = document.createElement("div");
    plot.style.cssText = "flex:1;min-height:0";
    root.appendChild(plot);

    let current = sceneIndex;

    function paint(idx) {
      const view = views[Math.max(0, Math.min(idx, views.length - 1))];
      viewNote.textContent = "Bangladesh · " + view.replace(/_/g, " / ");

      const data = rows
        .filter(
          (r) =>
            r[viewField] === view &&
            !excludeGroups.includes(r[groupField])
        )
        .map((r) => {
          const o = { group: r[groupField] };
          segments.forEach((s) => {
            o[s.key] = +(r[s.field] != null ? r[s.field] : r[s.key]);
          });
          return o;
        });

      plot.innerHTML = "";
      if (!data.length) {
        plot.innerHTML =
          '<div style="padding:24px;color:#aa0000">No data for view: ' +
          view +
          "</div>";
        current = idx;
        return;
      }

      const pw = plot.clientWidth || w;
      const ph = plot.clientHeight || h - 36;
      const margin = { top: 16, right: 16, bottom: 48, left: 48 };
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
          x: margin.left - 8,
          y: y + 4,
          "text-anchor": "end",
          fill: "#6a7781",
          "font-size": 11,
        }).textContent = t + "%";
      });

      const bw = (pw - margin.left - margin.right) / data.length;
      data.forEach((d, i) => {
        let acc = 0;
        segments.forEach((s) => {
          const v = Number.isFinite(d[s.key]) ? d[s.key] : 0;
          const bh = ((ph - margin.top - margin.bottom) * v) / 100;
          const y = ph - margin.bottom - acc - bh;
          SVG.el(svg, "rect", {
            x: margin.left + i * bw + bw * 0.18,
            y,
            width: bw * 0.64,
            height: Math.max(0, bh),
            fill: s.color,
          });
          acc += bh;
        });
        SVG.el(svg, "text", {
          x: margin.left + i * bw + bw / 2,
          y: ph - margin.bottom + 22,
          "text-anchor": "middle",
          fill: "#111",
          "font-size": 12,
          "font-weight": "700",
        }).textContent = d.group;
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
  global.AtlasStackedShareBars = api;
  global.AtlasLibrary = global.AtlasLibrary || {};
  global.AtlasLibrary.StackedShareBars = api;
})(typeof window !== "undefined" ? window : globalThis);
