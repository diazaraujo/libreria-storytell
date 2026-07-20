/**
 * AtlasRankedRateBars v0.1
 * Horizontal rate bars (text messaging capability, smartphone ownership, etc).
 * Modes: 'can-send' | 'no-smartphone-strip' | 'lic-bars'
 * Depends: AtlasSVG
 */
(function (global) {
  const INSTANCES = new WeakMap();
  const INC_ORDER = ["LIC", "LMC", "UMC", "HIC"];
  const INC_LABEL = {
    LIC: "Low income",
    LMC: "Lower middle",
    UMC: "Upper middle",
    HIC: "High income",
  };
  const INC_COL = {
    LIC: "#3B4DA6",
    LMC: "#DB95D7",
    UMC: "#73AF48",
    HIC: "#016B6C",
  };

  function ensureSVG() {
    if (!global.AtlasSVG) throw new Error("AtlasRankedRateBars needs AtlasSVG");
    return global.AtlasSVG;
  }

  function mount(container, options = {}) {
    const SVG = ensureSVG();
    const {
      rows = [],
      mode = "can-send", // can-send | smartphone
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

    container.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-ranked-rate atlas-chart-root";
    const w = Math.max(320, container.clientWidth || 900);
    const h = heightOpt || Math.max(420, container.clientHeight || 480);
    root.style.cssText = `position:relative;width:100%;height:${h}px;font-family:'Open Sans',system-ui,sans-serif;background:#fff`;
    container.appendChild(root);

    let current = sceneIndex;

    function paintCanSend() {
      // value = % who CAN send; red when <50 (never-send majority)
      const data = rows
        .map((r) => ({
          iso: r.region_code || r.iso3c,
          name: r.region_name || names[r.region_code] || r.region_code,
          v: +r.value,
        }))
        .filter((d) => Number.isFinite(d.v))
        .sort((a, b) => a.v - b.v);

      const note = document.createElement("div");
      note.style.cssText =
        "position:absolute;top:8px;right:12px;font-size:11px;color:#57626a;max-width:240px;text-align:right;z-index:2";
      note.innerHTML =
        `<span style="color:#AA0000;font-weight:700">Red</span>: more than half have <em>never</em> sent a text · value = % who can`;
      root.appendChild(note);

      const margin = { top: 28, right: 56, bottom: 16, left: 140 };
      const svg = SVG.el(root, "svg");
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      svg.style.cssText = "width:100%;height:100%;display:block";
      const xScale = SVG.scaleLinear([0, 100], [margin.left, w - margin.right]);
      const yScale = SVG.scaleBand(
        data.map((d) => d.iso),
        [margin.top, h - margin.bottom],
        0.12
      );
      SVG.el(svg, "line", {
        x1: xScale(50), x2: xScale(50), y1: margin.top, y2: h - margin.bottom,
        stroke: "#AA0000", "stroke-dasharray": "4 3", "stroke-width": 1.5,
      });
      SVG.el(svg, "text", {
        x: xScale(50) + 4, y: margin.top - 6, fill: "#AA0000", "font-size": 11, "font-weight": "700",
      }).textContent = "50%";
      data.forEach((d) => {
        const y = yScale(d.iso);
        const bh = yScale.bandwidth();
        const low = d.v < 50;
        SVG.el(svg, "rect", {
          x: margin.left, y, width: Math.max(xScale(d.v) - margin.left, 1), height: bh,
          fill: low ? "#AA0000" : "#34A7F2", opacity: 0.85, rx: 2,
        });
        SVG.el(svg, "text", {
          x: margin.left - 8, y: y + bh / 2, "text-anchor": "end", "dominant-baseline": "middle",
          fill: "#111", "font-size": 11, "font-weight": low ? "700" : "500",
        }).textContent = d.name;
        SVG.el(svg, "text", {
          x: xScale(d.v) + 4, y: y + bh / 2, "dominant-baseline": "middle",
          fill: low ? "#AA0000" : "#57626a", "font-size": 11, "font-weight": "700",
        }).textContent = d.v.toFixed(0) + "%";
      });
    }

    function paintSmartphone(idx) {
      const countries = rows
        .filter(
          (r) =>
            r.region_code &&
            !INC_ORDER.includes(r.region_code) &&
            r.mobile_is_main !== ""
        )
        .map((r) => ({
          iso: r.region_code,
          name: r.region_name || names[r.region_code] || r.region_code,
          income: r.income_group,
          own: +r.mobile_is_main,
          noPhone: 100 - +r.mobile_is_main,
        }))
        .filter((d) => Number.isFinite(d.own));

      const margin = { top: 32, right: 24, bottom: 40, left: 48 };
      const svg = SVG.el(root, "svg");
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      svg.style.cssText = "width:100%;height:100%;display:block";

      if (idx === 0) {
        // strip by income: % without smartphone
        const yScale = SVG.scaleLinear([0, 100], [h - margin.bottom, margin.top]);
        [0, 25, 50, 75, 100].forEach((t) => {
          SVG.el(svg, "line", {
            x1: margin.left, x2: w - margin.right, y1: yScale(t), y2: yScale(t), stroke: "#f1f5f9",
          });
          SVG.el(svg, "text", {
            x: margin.left - 8, y: yScale(t) + 4, "text-anchor": "end", fill: "#6a7781", "font-size": 11,
          }).textContent = t;
        });
        const colW = (w - margin.left - margin.right) / INC_ORDER.length;
        INC_ORDER.forEach((inc, i) => {
          const subset = countries.filter((d) => d.income === inc);
          const cx = margin.left + colW * i + colW / 2;
          subset.forEach((d, j) => {
            const jitter = ((j % 7) - 3) * 5;
            SVG.el(svg, "circle", {
              cx: cx + jitter, cy: yScale(d.noPhone), r: 4.5,
              fill: INC_COL[inc], opacity: 0.75, stroke: "#fff", "stroke-width": 1,
            });
          });
          SVG.el(svg, "text", {
            x: cx, y: h - margin.bottom + 20, "text-anchor": "middle",
            fill: INC_COL[inc], "font-size": 12, "font-weight": "700",
          }).textContent = INC_LABEL[inc];
        });
        SVG.el(svg, "text", {
          x: 12, y: margin.top - 12, fill: "#6a7781", "font-size": 11,
        }).textContent = "% who do not own a smartphone";
      } else {
        const lic = countries
          .filter((d) => d.income === "LIC")
          .sort((a, b) => b.noPhone - a.noPhone);
        const focus = ["BFA", "TCD", "COD", "ETH", "MWI", "NER", "MDG", "MOZ", "UGA", "GNB"];
        const show = lic
          .filter((d) => focus.includes(d.iso))
          .concat(lic.filter((d) => !focus.includes(d.iso)))
          .slice(0, 17);
        const xScale = SVG.scaleLinear([0, 100], [margin.left + 80, w - margin.right - 40]);
        const yScale = SVG.scaleBand(
          show.map((d) => d.iso),
          [margin.top, h - margin.bottom],
          0.15
        );
        show.forEach((d) => {
          const y = yScale(d.iso);
          const bh = yScale.bandwidth();
          const hi = focus.includes(d.iso);
          SVG.el(svg, "rect", {
            x: margin.left + 80, y,
            width: Math.max(xScale(d.noPhone) - (margin.left + 80), 1),
            height: bh,
            fill: hi ? "#3B4DA6" : "#94a3b8", rx: 3,
          });
          SVG.el(svg, "text", {
            x: margin.left + 74, y: y + bh / 2, "text-anchor": "end", "dominant-baseline": "middle",
            fill: "#111", "font-size": 12, "font-weight": hi ? "700" : "500",
          }).textContent = d.name;
          SVG.el(svg, "text", {
            x: xScale(d.noPhone) + 6, y: y + bh / 2, "dominant-baseline": "middle",
            fill: hi ? "#3B4DA6" : "#57626a", "font-size": 12, "font-weight": "700",
          }).textContent = d.noPhone.toFixed(0) + "%";
        });
        SVG.el(svg, "text", {
          x: margin.left + 80, y: margin.top - 12, fill: "#6a7781", "font-size": 11,
        }).textContent = "Low-income countries — share without a smartphone";
      }
    }

    function paint(idx) {
      root.innerHTML = "";
      if (mode === "can-send") paintCanSend();
      else paintSmartphone(idx);
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
  global.AtlasRankedRateBars = api;
  global.AtlasLibrary = global.AtlasLibrary || {};
  global.AtlasLibrary.RankedRateBars = api;
})(typeof window !== "undefined" ? window : globalThis);
