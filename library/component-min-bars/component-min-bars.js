/**
 * AtlasComponentMinBars v0.1
 * Bars for components of safely managed water; min component highlighted.
 * Scene switches country (e.g. Mongolia → Nepal).
 *
 * Depends: AtlasSVG
 */
(function (global) {
  const INSTANCES = new WeakMap();
  const DEFAULT_COLORS = {
    min: "#0080c6",
    other: "#94a3b8",
    accessibility: "#34A7F2",
    availability: "#664AB6",
    quality: "#4EC2C0",
  };

  function ensureSVG() {
    if (!global.AtlasSVG) throw new Error("AtlasComponentMinBars needs AtlasSVG");
    return global.AtlasSVG;
  }

  function mount(container, options = {}) {
    const SVG = ensureSVG();
    const {
      rows = [],
      sceneIndex = 0,
      countries = ["Mongolia", "Nepal"],
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
    root.className = "atlas-component-min-bars atlas-chart-root";
    const w = Math.max(320, container.clientWidth || 800);
    const h = heightOpt || Math.max(360, container.clientHeight || 400);
    root.style.cssText = `position:relative;width:100%;height:${h}px;font-family:'Open Sans',system-ui,sans-serif;background:#fff`;
    container.appendChild(root);

    const titleEl = document.createElement("div");
    titleEl.style.cssText =
      "padding:10px 14px 0;font-weight:700;font-size:14px;color:#111";
    root.appendChild(titleEl);

    const plot = document.createElement("div");
    plot.style.cssText = "position:absolute;left:0;right:0;top:36px;bottom:28px";
    root.appendChild(plot);

    const foot = document.createElement("div");
    foot.style.cssText =
      "position:absolute;left:14px;bottom:6px;font-size:11px;color:#6a7781;font-weight:600";
    foot.textContent = "Safely managed = minimum of the three components (highlighted)";
    root.appendChild(foot);

    let current = sceneIndex;

    function paint(idx) {
      const country = countries[Math.max(0, Math.min(idx, countries.length - 1))];
      titleEl.textContent = `${country}: components of safely managed access`;
      plot.innerHTML = "";

      const use = rows
        .filter((r) => r.country === country)
        .map((r) => ({
          cat: r.component,
          value: +r.usage_pct,
        }))
        .filter((d) => Number.isFinite(d.value));
      if (!use.length) {
        plot.innerHTML = `<div style="padding:24px;color:#aa0000">No data for ${country}</div>`;
        current = idx;
        return;
      }

      const minV = Math.min(...use.map((d) => d.value));
      const pw = plot.clientWidth || w;
      const ph = plot.clientHeight || h - 64;
      const margin = { top: 20, right: 16, bottom: 70, left: 48 };
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
        }).textContent = t;
      });

      const bw = (pw - margin.left - margin.right) / use.length;
      use.forEach((d, i) => {
        const bh = ((ph - margin.top - margin.bottom) * d.value) / 100;
        const x = margin.left + i * bw + bw * 0.15;
        const y = ph - margin.bottom - bh;
        const isMin = d.value === minV;
        const key = (d.cat || "").toLowerCase();
        let fill = DEFAULT_COLORS.other;
        if (isMin) fill = DEFAULT_COLORS.min;
        else if (key.includes("access")) fill = DEFAULT_COLORS.accessibility;
        else if (key.includes("available") || key.includes("avail"))
          fill = DEFAULT_COLORS.availability;
        else if (key.includes("contam") || key.includes("free") || key.includes("qual"))
          fill = DEFAULT_COLORS.quality;

        SVG.el(svg, "rect", {
          x,
          y,
          width: bw * 0.7,
          height: Math.max(0, bh),
          fill,
          opacity: isMin ? 1 : 0.75,
          rx: 3,
        });
        SVG.el(svg, "text", {
          x: x + bw * 0.35,
          y: y - 6,
          "text-anchor": "middle",
          fill: "#111",
          "font-size": 13,
          "font-weight": isMin ? "700" : "600",
        }).textContent = d.value + "%";
        const lab = SVG.el(svg, "text", {
          x: x + bw * 0.35,
          y: ph - margin.bottom + 16,
          "text-anchor": "end",
          fill: "#6a7781",
          "font-size": 11,
          transform: `rotate(-28 ${x + bw * 0.35} ${ph - margin.bottom + 16})`,
        });
        lab.textContent = d.cat;
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
  global.AtlasComponentMinBars = api;
  global.AtlasLibrary = global.AtlasLibrary || {};
  global.AtlasLibrary.ComponentMinBars = api;
})(typeof window !== "undefined" ? window : globalThis);
