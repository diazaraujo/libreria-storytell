/**
 * AtlasPairedCompareBars v0.1
 * Side-by-side bars for two measures per category (e.g. PoC vs PoU E. coli).
 * Scenes: show A only · show A+B · highlight where B > A.
 *
 * Depends: AtlasSVG
 */
(function (global) {
  const INSTANCES = new WeakMap();

  function ensureSVG() {
    if (!global.AtlasSVG) throw new Error("AtlasPairedCompareBars needs AtlasSVG");
    return global.AtlasSVG;
  }

  function mount(container, options = {}) {
    const SVG = ensureSVG();
    const {
      rows = [], // { label, a, b }
      sceneIndex = 0,
      aKey = "a",
      bKey = "b",
      labelKey = "label",
      aColor = "#0080c6",
      bColor = "#AA0000",
      aLabel = "Point of collection (PoC)",
      bLabel = "Point of use (PoU)",
      height: heightOpt = null,
      forceRemount = false,
      reuse = true,
      yMax = null,
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

    const data = rows
      .map((r) => ({
        label: r[labelKey] || r.country || r.name,
        a: +(r[aKey] != null ? r[aKey] : r.PoC),
        b: +(r[bKey] != null ? r[bKey] : r.PoU),
      }))
      .filter((d) => Number.isFinite(d.a))
      .sort((x, y) => x.a - y.a);

    container.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-paired-compare atlas-chart-root";
    const w = Math.max(320, container.clientWidth || 900);
    const h = heightOpt || Math.max(400, container.clientHeight || 440);
    root.style.cssText = `position:relative;width:100%;height:${h}px;font-family:'Open Sans',system-ui,sans-serif;background:#fff;display:flex;flex-direction:column`;
    container.appendChild(root);

    const leg = document.createElement("div");
    leg.style.cssText =
      "display:flex;flex-wrap:wrap;gap:10px 16px;padding:8px 8px 0;font-size:12px;font-weight:600;color:#3d4a54";
    leg.innerHTML = `
      <span><i style="display:inline-block;width:11px;height:11px;border-radius:2px;background:${aColor};margin-right:5px"></i>${aLabel}</span>
      <span id="b-leg"><i style="display:inline-block;width:11px;height:11px;border-radius:2px;background:${bColor};margin-right:5px"></i>${bLabel}</span>
      <span style="font-weight:500;opacity:.8">% high + very high E. coli risk</span>`;
    root.appendChild(leg);

    const plot = document.createElement("div");
    plot.style.cssText = "flex:1;min-height:0";
    root.appendChild(plot);

    let current = sceneIndex;

    function paint(idx) {
      const showB = idx >= 1;
      const highlightWorse = idx >= 2;
      leg.querySelector("#b-leg").style.opacity = showB ? "1" : "0.25";

      plot.innerHTML = "";
      const pw = plot.clientWidth || w;
      const ph = plot.clientHeight || h - 36;
      const margin = { top: 12, right: 10, bottom: 72, left: 40 };
      const svg = SVG.el(plot, "svg");
      svg.setAttribute("viewBox", `0 0 ${pw} ${ph}`);
      svg.style.cssText = "width:100%;height:100%;display:block";

      const maxV =
        yMax ||
        Math.max(
          ...data.map((d) => Math.max(d.a, showB && Number.isFinite(d.b) ? d.b : 0)),
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

      const n = Math.max(data.length, 1);
      const groupW = (pw - margin.left - margin.right) / n;
      data.forEach((d, i) => {
        const x0 = margin.left + i * groupW;
        const hi = highlightWorse && Number.isFinite(d.b) && d.b > d.a;
        const dim = highlightWorse && showB && !hi;

        const draw = (val, color, offset) => {
          if (!Number.isFinite(val)) return;
          const y = yScale(val);
          const bh = ph - margin.bottom - y;
          SVG.el(svg, "rect", {
            x: x0 + groupW * offset,
            y,
            width: Math.max(1, groupW * 0.32),
            height: Math.max(0, bh),
            fill: color,
            opacity: dim ? 0.28 : 0.95,
            rx: 1,
          });
        };
        draw(d.a, aColor, 0.12);
        if (showB) draw(d.b, bColor, 0.5);

        const lab = SVG.el(svg, "text", {
          x: x0 + groupW / 2,
          y: ph - margin.bottom + 12,
          "text-anchor": "end",
          fill: hi ? "#111" : "#6a7781",
          "font-size": 9,
          "font-weight": hi ? "700" : "500",
          transform: `rotate(-40 ${x0 + groupW / 2} ${ph - margin.bottom + 12})`,
        });
        const name = d.label || "";
        lab.textContent = name.length > 11 ? name.slice(0, 10) + "…" : name;
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
  global.AtlasPairedCompareBars = api;
  global.AtlasLibrary = global.AtlasLibrary || {};
  global.AtlasLibrary.PairedCompareBars = api;
})(typeof window !== "undefined" ? window : globalThis);
