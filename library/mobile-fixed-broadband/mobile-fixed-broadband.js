/**
 * AtlasMobileFixedBroadband v0.2 — beauty craft
 * Scene 0: global dual line (mobile vs fixed) 2010–2025
 * Scenes 1–3: scatter mobile×fixed with narrative highlights
 *
 * 1 · high-income fixed (DEU, …)
 * 2 · low fixed broadband
 * 3 · mobile-first Africa / lower-middle
 *
 * Depends: window.AtlasSVG
 */
(function (global) {
  const INSTANCES = new WeakMap();
  const MOB = "#34A7F2";
  const FIX = "#081079";
  const HI_TEAL = "#016B6C";
  const HI_PINK = "#DB95D7";
  const GREY = {
    text: "#100e2b",
    tick: "#6a7781",
    grid: "#e8ecf0",
    muted: "#cbd5e1",
  };
  const NAME_OVERRIDE = {
    DEU: "Germany",
    CIV: "Côte d'Ivoire",
    SWZ: "Eswatini",
    KOR: "Korea, Rep.",
    USA: "United States",
    GBR: "United Kingdom",
    CHN: "China",
    JPN: "Japan",
  };

  function ensureSVG() {
    if (!global.AtlasSVG) throw new Error("AtlasMobileFixedBroadband needs AtlasSVG");
    return global.AtlasSVG;
  }

  function displayName(iso, names) {
    return NAME_OVERRIDE[iso] || names[iso] || iso;
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
      inst.setScene(sceneIndex, { animate: options.animate !== false });
      return inst.api;
    }
    if (INSTANCES.has(container)) {
      try {
        INSTANCES.get(container).api.destroy();
      } catch (_) {}
      INSTANCES.delete(container);
    }

    const gPts = globalRows
      .map((r) => ({
        year: +r.year,
        fixed: +r.fixed_broadband,
        mobile: +r.mobile_broadband,
      }))
      .filter((d) => Number.isFinite(d.year) && Number.isFinite(d.fixed) && Number.isFinite(d.mobile))
      .sort((a, b) => a.year - b.year);

    const cty = countryRows
      .map((r) => ({
        iso: r.iso3c || r.iso,
        mobile: +r.mobile_broadband,
        fixed: +r.fixed_broadband,
      }))
      .filter((d) => d.iso && Number.isFinite(d.mobile) && Number.isFinite(d.fixed));

    container.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-mobile-fixed atlas-chart-root";
    const w = Math.max(320, container.clientWidth || 900);
    const h = heightOpt || Math.max(400, container.clientHeight || 440);
    root.style.cssText = `position:relative;width:100%;height:${h}px;font-family:'Open Sans',system-ui,sans-serif;background:#fff`;
    container.appendChild(root);

    const style = document.createElement("style");
    style.textContent = `
      .atlas-mobile-fixed .mf-legend {
        position:absolute; top:8px; right:12px; z-index:2;
        display:flex; flex-direction:column; gap:6px;
        font:600 12px 'Open Sans',system-ui,sans-serif; color:${GREY.text};
        pointer-events:none;
      }
      .atlas-mobile-fixed .mf-legend span { display:inline-flex; align-items:center; gap:7px; }
      .atlas-mobile-fixed .mf-legend i {
        width:18px; height:3px; border-radius:1px; display:inline-block;
      }
      .atlas-mobile-fixed .mf-legend i.dot {
        width:8px; height:8px; border-radius:50%;
      }
    `;
    root.appendChild(style);

    let current = sceneIndex;

    // Scene 1: keep labels sparse (origin labels only a few HICs)
    const hiHic = new Set([
      "DEU", "USA", "JPN", "KOR", "GBR", "FRA", "SGP", "NLD", "CHE", "CAN", "AUS",
    ]);
    const hiHicLabel = new Set(["DEU", "USA", "JPN", "SGP", "FRA", "GBR", "CAN"]);
    // Scene 3: countries named in story + a few peers
    const hiMobileAfrica = new Set([
      "MAR", "CIV", "SEN", "NGA", "KEN", "GHA", "ETH", "ZAF", "RWA", "CMR",
    ]);
    const hiAfricaLabel = new Set(["MAR", "CIV", "SEN", "NGA", "KEN", "GHA", "ETH", "ZAF"]);

    function lowFixedSet() {
      return new Set(
        cty
          .filter((d) => d.fixed < 5)
          .slice()
          .sort((a, b) => a.fixed - b.fixed)
          .slice(0, 22)
          .map((d) => d.iso)
      );
    }

    function paint(idx) {
      root.querySelectorAll("svg, .mf-legend, .scene-note").forEach((n) => n.remove());
      const margin = { top: 32, right: 28, bottom: 44, left: 52 };
      const svg = SVG.el(root, "svg");
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      svg.style.cssText = "width:100%;height:100%;display:block";

      const font = "Open Sans, system-ui, sans-serif";

      if (idx === 0) {
        const years = gPts.map((p) => p.year);
        const x0 = years.length ? Math.min(...years) : 2010;
        const x1 = years.length ? Math.max(...years) : 2025;
        const yMax = Math.max(
          100,
          ...gPts.map((p) => Math.max(p.mobile || 0, p.fixed || 0))
        );
        const xScale = SVG.scaleLinear([x0, x1], [margin.left, w - margin.right - 100]);
        const yScale = SVG.scaleLinear([0, Math.ceil(yMax / 10) * 10], [
          h - margin.bottom,
          margin.top,
        ]);

        // grid + y labels
        const yTicks = [0, 25, 50, 75, 100].filter((t) => t <= yMax + 5);
        if (yMax > 100) yTicks.push(Math.ceil(yMax / 25) * 25);
        yTicks.forEach((t) => {
          SVG.el(svg, "line", {
            x1: margin.left,
            x2: w - margin.right - 100,
            y1: yScale(t),
            y2: yScale(t),
            stroke: GREY.grid,
            "stroke-width": 1,
          });
          SVG.el(svg, "text", {
            x: margin.left - 8,
            y: yScale(t) + 4,
            "text-anchor": "end",
            fill: GREY.tick,
            "font-size": 11,
            "font-weight": "600",
            "font-family": font,
          }).textContent = String(t);
        });

        const xTicks = [x0, 2015, 2020, x1].filter(
          (y, i, a) => y >= x0 && y <= x1 && a.indexOf(y) === i
        );
        xTicks.forEach((yr) => {
          SVG.el(svg, "text", {
            x: xScale(yr),
            y: h - margin.bottom + 20,
            "text-anchor": "middle",
            fill: GREY.tick,
            "font-size": 12,
            "font-weight": "600",
            "font-family": font,
          }).textContent = String(yr);
        });

        SVG.el(svg, "text", {
          x: margin.left,
          y: margin.top - 12,
          fill: GREY.tick,
          "font-size": 11,
          "font-weight": "600",
          "font-family": font,
        }).textContent = "Subscriptions per 100 people";

        [
          ["mobile", MOB, "Mobile"],
          ["fixed", FIX, "Fixed"],
        ].forEach(([key, col, shortLab]) => {
          const d = gPts
            .map((p, i) => `${i ? "L" : "M"}${xScale(p.year)},${yScale(p[key])}`)
            .join(" ");
          SVG.el(svg, "path", {
            d,
            fill: "none",
            stroke: col,
            "stroke-width": 2.8,
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
          });
          const last = gPts[gPts.length - 1];
          if (!last) return;
          const val = Math.round(+last[key]);
          SVG.el(svg, "circle", {
            cx: xScale(last.year),
            cy: yScale(last[key]),
            r: 4.5,
            fill: col,
            stroke: "#fff",
            "stroke-width": 1.5,
          });
          // short end label so "99" / "20" never clip
          SVG.el(svg, "text", {
            x: xScale(last.year) + 10,
            y: yScale(last[key]) + 4,
            fill: col,
            "font-size": 13,
            "font-weight": "700",
            "font-family": font,
          }).textContent = `${shortLab} ${val}`;
        });

        const leg = document.createElement("div");
        leg.className = "mf-legend";
        leg.innerHTML = `
          <span><i style="background:${MOB}"></i>Mobile broadband</span>
          <span><i style="background:${FIX}"></i>Fixed broadband</span>`;
        root.appendChild(leg);
      } else {
        // scatter: mobile (x) vs fixed (y)
        const maxM = Math.max(120, ...cty.map((d) => d.mobile));
        const maxF = Math.max(50, ...cty.map((d) => d.fixed));
        const xDomain = [0, Math.min(220, Math.ceil(maxM / 20) * 20)];
        const yDomain = [0, Math.min(70, Math.ceil(maxF / 10) * 10)];
        const xScale = SVG.scaleLinear(xDomain, [margin.left, w - margin.right - 8]);
        const yScale = SVG.scaleLinear(yDomain, [h - margin.bottom, margin.top]);

        // grid
        const xStep = xDomain[1] <= 100 ? 25 : 50;
        for (let t = 0; t <= xDomain[1]; t += xStep) {
          SVG.el(svg, "line", {
            x1: xScale(t),
            x2: xScale(t),
            y1: margin.top,
            y2: h - margin.bottom,
            stroke: GREY.grid,
          });
          SVG.el(svg, "text", {
            x: xScale(t),
            y: h - margin.bottom + 18,
            "text-anchor": "middle",
            fill: GREY.tick,
            "font-size": 11,
            "font-weight": "600",
            "font-family": font,
          }).textContent = String(t);
        }
        const yStep = yDomain[1] <= 40 ? 10 : 15;
        for (let t = 0; t <= yDomain[1]; t += yStep) {
          SVG.el(svg, "line", {
            x1: margin.left,
            x2: w - margin.right - 8,
            y1: yScale(t),
            y2: yScale(t),
            stroke: GREY.grid,
          });
          SVG.el(svg, "text", {
            x: margin.left - 8,
            y: yScale(t) + 4,
            "text-anchor": "end",
            fill: GREY.tick,
            "font-size": 11,
            "font-weight": "600",
            "font-family": font,
          }).textContent = String(t);
        }

        SVG.el(svg, "text", {
          x: (margin.left + w - margin.right) / 2,
          y: h - 8,
          "text-anchor": "middle",
          fill: GREY.text,
          "font-size": 12,
          "font-weight": "600",
          "font-family": font,
        }).textContent = "Mobile broadband (per 100 people)";
        SVG.el(svg, "text", {
          x: 14,
          y: h / 2,
          "text-anchor": "middle",
          fill: GREY.text,
          "font-size": 12,
          "font-weight": "600",
          "font-family": font,
          transform: `rotate(-90 14 ${h / 2})`,
        }).textContent = "Fixed broadband (per 100 people)";

        const hi =
          idx === 1
            ? hiHic
            : idx === 2
              ? lowFixedSet()
              : hiMobileAfrica;
        const labelSet =
          idx === 1
            ? hiHicLabel
            : idx === 2
              ? new Set(
                  [...hi]
                    .slice(0, 12)
                )
              : hiAfricaLabel;
        const hiCol = idx === 1 ? HI_TEAL : HI_PINK;

        // background points first
        cty.forEach((d) => {
          if (hi.has(d.iso)) return;
          SVG.el(svg, "circle", {
            cx: xScale(Math.min(d.mobile, xDomain[1])),
            cy: yScale(Math.min(d.fixed, yDomain[1])),
            r: 2.8,
            fill: GREY.muted,
            opacity: 0.45,
          });
        });
        // highlights on top
        cty.forEach((d) => {
          if (!hi.has(d.iso)) return;
          const cx = xScale(Math.min(d.mobile, xDomain[1]));
          const cy = yScale(Math.min(d.fixed, yDomain[1]));
          SVG.el(svg, "circle", {
            cx,
            cy,
            r: 5.5,
            fill: hiCol,
            opacity: 0.95,
            stroke: "#fff",
            "stroke-width": 1.25,
          });
          if (labelSet.has(d.iso)) {
            // nudge labels that cluster (USA/JPN at high mobile)
            let dx = 7;
            let dy = 3.5;
            if (d.iso === "JPN") {
              dx = 7;
              dy = -8;
            }
            if (d.iso === "USA") {
              dx = 7;
              dy = 12;
            }
            if (d.iso === "DEU") {
              dx = -8;
              dy = -10;
            }
            SVG.el(svg, "text", {
              x: cx + dx,
              y: cy + dy,
              "text-anchor": d.iso === "DEU" ? "end" : "start",
              fill: GREY.text,
              "font-size": 11,
              "font-weight": "700",
              "font-family": font,
            }).textContent = displayName(d.iso, names);
          }
        });

        const leg = document.createElement("div");
        leg.className = "mf-legend";
        const lab =
          idx === 1
            ? "High-income / high fixed"
            : idx === 2
              ? "Very low fixed (<5)"
              : "Mobile-first Africa";
        leg.innerHTML = `
          <span><i class="dot" style="background:${hiCol}"></i>${lab}</span>
          <span><i class="dot" style="background:${GREY.muted}"></i>Other economies</span>`;
        root.appendChild(leg);
      }
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
        container.innerHTML = "";
        INSTANCES.delete(container);
      },
      get sceneIndex() {
        return current;
      },
      version: "0.2.0",
    };
    INSTANCES.set(container, { api, setScene: paint });
    return api;
  }

  const api = { mount, version: "0.2.0" };
  global.AtlasMobileFixedBroadband = api;
  global.AtlasLibrary = global.AtlasLibrary || {};
  global.AtlasLibrary.MobileFixedBroadband = api;
})(typeof window !== "undefined" ? window : globalThis);
