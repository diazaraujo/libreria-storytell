/**
 * AtlasComponentPaths v0.1
 * Multi-series lines for water components (accessibility / quality / availability).
 * Tanzania solid + optional typical dashed paths.
 *
 * Depends: AtlasSVG
 */
(function (global) {
  const INSTANCES = new WeakMap();
  const COLORS = {
    accessibility: "#34A7F2",
    quality: "#4EC2C0",
    availability: "#664AB6",
  };
  const LABELS = {
    accessibility: "Accessibility",
    quality: "Quality",
    availability: "Availability",
  };

  function ensureSVG() {
    if (!global.AtlasSVG) throw new Error("AtlasComponentPaths needs AtlasSVG");
    return global.AtlasSVG;
  }

  function mount(container, options = {}) {
    const SVG = ensureSVG();
    const {
      rows = [], // { year, series, value }
      typicalRows = [], // { y, time, series } or { year, series, value }
      sceneIndex = 0,
      height: heightOpt = null,
      forceRemount = false,
      reuse = true,
      showTypicalFromScene = 2,
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

    const tz = rows
      .map((r) => ({
        year: +r.year,
        series: r.series,
        value: +r.value,
        src: "tz",
      }))
      .filter((d) => Number.isFinite(d.year) && Number.isFinite(d.value));

    const typ = (typicalRows || [])
      .map((r) => {
        if (r.year != null) {
          return {
            year: +r.year,
            series: r.series,
            value: +r.value,
            src: "typ",
          };
        }
        // typical paths: time from 0, y = level
        return {
          year: 2000 + (+r.time || 0),
          series: r.series,
          value: +r.y,
          src: "typ",
        };
      })
      .filter((d) => Number.isFinite(d.year) && Number.isFinite(d.value));

    container.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-component-paths atlas-chart-root";
    const w = Math.max(320, container.clientWidth || 900);
    const h = heightOpt || Math.max(400, container.clientHeight || 440);
    root.style.cssText = `position:relative;width:100%;height:${h}px;font-family:'Open Sans',system-ui,sans-serif;background:#fff;display:flex;flex-direction:column`;
    container.appendChild(root);

    const leg = document.createElement("div");
    leg.style.cssText =
      "display:flex;flex-wrap:wrap;gap:10px 14px;padding:8px 8px 0;font-size:12px;font-weight:600;color:#3d4a54";
    Object.keys(COLORS).forEach((k) => {
      const s = document.createElement("span");
      s.innerHTML = `<i style="display:inline-block;width:11px;height:11px;border-radius:2px;background:${COLORS[k]};margin-right:5px"></i>${LABELS[k]}`;
      leg.appendChild(s);
    });
    const note = document.createElement("span");
    note.style.opacity = "0.75";
    note.style.fontWeight = "500";
    note.textContent = "Solid = Tanzania · dashed = typical path";
    note.id = "cp-note";
    leg.appendChild(note);
    root.appendChild(leg);

    const plot = document.createElement("div");
    plot.style.cssText = "flex:1;min-height:0";
    root.appendChild(plot);

    let current = sceneIndex;

    function paint(idx) {
      let data = tz.slice();
      if (idx === 0) data = data.filter((d) => d.year <= 2005);
      const showTyp = idx >= showTypicalFromScene && typ.length;
      if (showTyp) {
        // map typical time series onto chart x — keep as-is (2000+)
        data = data.concat(typ);
      }
      note.style.display = showTyp ? "inline" : "none";

      plot.innerHTML = "";
      const pw = plot.clientWidth || w;
      const ph = plot.clientHeight || h - 40;
      const margin = { top: 16, right: 18, bottom: 36, left: 44 };
      const svg = SVG.el(plot, "svg");
      svg.setAttribute("viewBox", `0 0 ${pw} ${ph}`);
      svg.style.cssText = "width:100%;height:100%;display:block";

      const xs = data.map((d) => d.year);
      const x0 = Math.min(...xs, 2000);
      const x1 = Math.max(...xs, 2024);
      const xScale = SVG.scaleLinear([x0, x1], [margin.left, pw - margin.right]);
      const yScale = SVG.scaleLinear([0, 100], [ph - margin.bottom, margin.top]);

      [0, 25, 50, 75, 100].forEach((t) => {
        SVG.el(svg, "line", {
          x1: margin.left,
          x2: pw - margin.right,
          y1: yScale(t),
          y2: yScale(t),
          stroke: "#f1f5f9",
        });
        SVG.el(svg, "text", {
          x: margin.left - 8,
          y: yScale(t) + 4,
          "text-anchor": "end",
          fill: "#6a7781",
          "font-size": 11,
        }).textContent = t + "%";
      });
      [2000, 2005, 2010, 2015, 2020, 2024]
        .filter((y) => y >= x0 && y <= x1)
        .forEach((yr) => {
          SVG.el(svg, "text", {
            x: xScale(yr),
            y: ph - margin.bottom + 20,
            "text-anchor": "middle",
            fill: "#6a7781",
            "font-size": 12,
            "font-weight": "600",
          }).textContent = String(yr);
        });

      const byS = new Map();
      data.forEach((d) => {
        const key = d.src + "|" + d.series;
        if (!byS.has(key)) byS.set(key, []);
        byS.get(key).push(d);
      });
      // draw typical first
      [...byS.entries()]
        .sort((a, b) => (a[0].startsWith("typ") ? -1 : 1))
        .forEach(([key, pts]) => {
          pts.sort((a, b) => a.year - b.year);
          const kind = pts[0].series;
          const isTyp = pts[0].src === "typ";
          const d = pts
            .map(
              (p, i) =>
                `${i ? "L" : "M"}${xScale(p.year)},${yScale(p.value)}`
            )
            .join(" ");
          SVG.el(svg, "path", {
            d,
            fill: "none",
            stroke: COLORS[kind] || "#0080c6",
            "stroke-width": isTyp ? 1.6 : 3,
            "stroke-dasharray": isTyp ? "5 4" : "none",
            opacity: isTyp ? 0.5 : 1,
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
          });
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

  const api = { mount, COLORS, version: "0.1.0" };
  global.AtlasComponentPaths = api;
  global.AtlasLibrary = global.AtlasLibrary || {};
  global.AtlasLibrary.ComponentPaths = api;
})(typeof window !== "undefined" ? window : globalThis);
