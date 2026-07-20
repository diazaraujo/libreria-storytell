/**
 * AtlasMobileFixedBroadband v0.1
 * Scene 0: global dual line · scenes 1–3: scatter mobile vs fixed with highlights
 * Depends: AtlasSVG
 */
(function (global) {
  const INSTANCES = new WeakMap();
  const MOB = "#34A7F2";
  const FIX = "#081079";

  function ensureSVG() {
    if (!global.AtlasSVG) throw new Error("AtlasMobileFixedBroadband needs AtlasSVG");
    return global.AtlasSVG;
  }

  function mount(container, options = {}) {
    const SVG = ensureSVG();
    const {
      globalRows = [],
      countryRows = [],
      sceneIndex = 0,
      names = global.ATLAS_COUNTRY_NAMES || {},
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
      try { INSTANCES.get(container).api.destroy(); } catch (_) {}
      INSTANCES.delete(container);
    }

    const gPts = globalRows
      .map((r) => ({
        year: +r.year,
        fixed: +r.fixed_broadband,
        mobile: +r.mobile_broadband,
      }))
      .filter((d) => Number.isFinite(d.year));
    const cty = countryRows
      .map((r) => ({
        iso: r.iso3c,
        mobile: +r.mobile_broadband,
        fixed: +r.fixed_broadband,
      }))
      .filter((d) => Number.isFinite(d.mobile) && Number.isFinite(d.fixed));

    container.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-mobile-fixed atlas-chart-root";
    const w = Math.max(320, container.clientWidth || 900);
    const h = heightOpt || Math.max(400, container.clientHeight || 440);
    root.style.cssText = `position:relative;width:100%;height:${h}px;font-family:'Open Sans',system-ui,sans-serif;background:#fff`;
    container.appendChild(root);

    let current = sceneIndex;
    function paint(idx) {
      root.querySelectorAll("svg, .scene-note").forEach((n) => n.remove());
      const margin = { top: 28, right: 120, bottom: 40, left: 48 };
      const svg = SVG.el(root, "svg");
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      svg.style.cssText = "width:100%;height:100%;display:block";

      if (idx === 0) {
        const xScale = SVG.scaleLinear([2010, 2025], [margin.left, w - margin.right]);
        const yScale = SVG.scaleLinear([0, 110], [h - margin.bottom, margin.top]);
        [0, 25, 50, 75, 100].forEach((t) => {
          SVG.el(svg, "line", {
            x1: margin.left, x2: w - margin.right, y1: yScale(t), y2: yScale(t), stroke: "#f1f5f9",
          });
          SVG.el(svg, "text", {
            x: margin.left - 8, y: yScale(t) + 4, "text-anchor": "end", fill: "#6a7781", "font-size": 11,
          }).textContent = t;
        });
        [2010, 2015, 2020, 2025].forEach((yr) => {
          SVG.el(svg, "text", {
            x: xScale(yr), y: h - margin.bottom + 20, "text-anchor": "middle",
            fill: "#6a7781", "font-size": 12, "font-weight": "600",
          }).textContent = String(yr);
        });
        [["mobile", MOB, "Mobile broadband"], ["fixed", FIX, "Fixed broadband"]].forEach(
          ([key, col, lab]) => {
            SVG.el(svg, "path", {
              d: gPts
                .map((p, i) => `${i ? "L" : "M"}${xScale(p.year)},${yScale(p[key])}`)
                .join(" "),
              fill: "none", stroke: col, "stroke-width": 2.8,
            });
            const last = gPts[gPts.length - 1];
            if (!last) return;
            SVG.el(svg, "text", {
              x: xScale(last.year) + 8, y: yScale(last[key]) + 4,
              fill: col, "font-size": 12, "font-weight": "700",
            }).textContent = `${lab} ${last[key]}`;
          }
        );
        SVG.el(svg, "text", {
          x: margin.left, y: margin.top - 10, fill: "#6a7781", "font-size": 11,
        }).textContent = "Subscriptions per 100 people";
      } else {
        const xScale = SVG.scaleLinear([0, 200], [margin.left, w - margin.right]);
        const yScale = SVG.scaleLinear([0, 60], [h - margin.bottom, margin.top]);
        [0, 50, 100, 150, 200].forEach((t) => {
          SVG.el(svg, "line", {
            x1: xScale(t), x2: xScale(t), y1: margin.top, y2: h - margin.bottom, stroke: "#f1f5f9",
          });
          SVG.el(svg, "text", {
            x: xScale(t), y: h - margin.bottom + 18, "text-anchor": "middle", fill: "#6a7781", "font-size": 11,
          }).textContent = t;
        });
        [0, 15, 30, 45, 60].forEach((t) => {
          SVG.el(svg, "line", {
            x1: margin.left, x2: w - margin.right, y1: yScale(t), y2: yScale(t), stroke: "#f1f5f9",
          });
          SVG.el(svg, "text", {
            x: margin.left - 8, y: yScale(t) + 4, "text-anchor": "end", fill: "#6a7781", "font-size": 11,
          }).textContent = t;
        });
        SVG.el(svg, "text", {
          x: (margin.left + w - margin.right) / 2, y: h - 8, "text-anchor": "middle",
          fill: "#111", "font-size": 12, "font-weight": "600",
        }).textContent = "Mobile broadband (per 100)";
        SVG.el(svg, "text", {
          x: 14, y: h / 2, "text-anchor": "middle", fill: "#111", "font-size": 12, "font-weight": "600",
          transform: `rotate(-90 14 ${h / 2})`,
        }).textContent = "Fixed broadband (per 100)";

        const hiSets = {
          1: new Set(["DEU", "CHN", "USA", "JPN", "KOR", "GBR", "FRA", "SGP", "NLD", "CHE"]),
          2: new Set(
            cty
              .filter((d) => d.fixed < 5)
              .slice()
              .sort((a, b) => a.fixed - b.fixed)
              .slice(0, 20)
              .map((d) => d.iso)
          ),
          3: new Set(["CIV", "SEN", "SWZ", "MAR", "NGA", "KEN", "GHA", "ETH", "TZA", "UGA"]),
        };
        const hi = hiSets[idx] || new Set();
        cty.forEach((d) => {
          const isHi = hi.has(d.iso);
          SVG.el(svg, "circle", {
            cx: xScale(Math.min(d.mobile, 200)),
            cy: yScale(Math.min(d.fixed, 60)),
            r: isHi ? 5 : 2.5,
            fill: isHi ? (idx === 1 ? "#016B6C" : "#DB95D7") : "#cbd5e1",
            opacity: isHi ? 0.95 : 0.35,
            stroke: "#fff",
            "stroke-width": isHi ? 1 : 0,
          });
          if (isHi) {
            SVG.el(svg, "text", {
              x: xScale(Math.min(d.mobile, 200)) + 6,
              y: yScale(Math.min(d.fixed, 60)) + 3,
              fill: "#111", "font-size": 11, "font-weight": "700",
            }).textContent = names[d.iso] || d.iso;
          }
        });
      }
      current = idx;
    }
    paint(sceneIndex);
    const api = {
      updateScene(n) { paint(n); },
      setScene(n) { paint(n); },
      destroy() { container.innerHTML = ""; INSTANCES.delete(container); },
      get sceneIndex() { return current; },
      version: "0.1.0",
    };
    INSTANCES.set(container, { api, setScene: paint });
    return api;
  }
  const api = { mount, version: "0.1.0" };
  global.AtlasMobileFixedBroadband = api;
  global.AtlasLibrary = global.AtlasLibrary || {};
  global.AtlasLibrary.MobileFixedBroadband = api;
})(typeof window !== "undefined" ? window : globalThis);
