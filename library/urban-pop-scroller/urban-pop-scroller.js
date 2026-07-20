/**
 * AtlasUrbanPopScroller
 * Regional urban vs rural population (stacked / dual lines).
 * Data: iso3c (region), group (urban|rural), year, value
 * Scenes: stack narrative → unstack → NAC/LCN → EAS → SSF/MEA
 */
(function (global) {
  const INSTANCES = new WeakMap();
  const REG = {
    WLD: "#081079",
    EAS: "#F3578E",
    ECS: "#AA0000",
    LCN: "#0C7C68",
    MEA: "#664AB6",
    NAC: "#34A7F2",
    SAS: "#4EC2C0",
    SSF: "#FF9800",
  };
  const LABELS = {
    WLD: "World",
    EAS: "East Asia & Pacific",
    ECS: "Europe & Central Asia",
    LCN: "Latin America & Caribbean",
    MEA: "Middle East & N. Africa",
    NAC: "North America",
    SAS: "South Asia",
    SSF: "Sub-Saharan Africa",
  };
  const URBAN = (global.WB_COLORS && global.WB_COLORS.urban) || "#6D88D1";
  const RURAL = (global.WB_COLORS && global.WB_COLORS.rural) || "#54AE89";

  function mount(container, options = {}) {
    if (!container) throw new Error("container required");
    const {
      rows = [],
      sceneIndex = 0,
      height: heightOpt = null,
      reuse = true,
      forceRemount = false,
    } = options;

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

    // nest: region -> group -> [{year,v}]
    const nest = new Map();
    (rows || []).forEach((r) => {
      const reg = r.iso3c;
      const g = String(r.group || "").toLowerCase();
      const y = +r.year;
      const v = +r.value;
      if (!Number.isFinite(y) || !Number.isFinite(v)) return;
      if (!nest.has(reg)) nest.set(reg, { urban: [], rural: [] });
      const bucket = nest.get(reg);
      if (g === "urban" || g === "rural") bucket[g].push({ year: y, v });
    });
    nest.forEach((b) => {
      b.urban.sort((a, c) => a.year - c.year);
      b.rural.sort((a, c) => a.year - c.year);
    });

    container.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-urban-pop atlas-chart-root";
    const H = heightOpt || Math.max(420, container.clientHeight || 460);
    root.style.cssText = `position:relative;width:100%;height:${H}px;font-family:'Open Sans',system-ui,sans-serif;background:#fff`;
    container.appendChild(root);

    const header = document.createElement("div");
    header.style.cssText =
      "position:absolute;left:12px;top:8px;z-index:2;font-size:13px;font-weight:700;color:#111";
    root.appendChild(header);

    const plot = document.createElement("div");
    plot.style.cssText = "position:absolute;inset:36px 12px 28px 12px";
    root.appendChild(plot);

    const leg = document.createElement("div");
    leg.style.cssText =
      "position:absolute;right:12px;top:8px;display:flex;gap:10px;font-size:11px;font-weight:600;z-index:2";
    leg.innerHTML = `<span><i style="display:inline-block;width:10px;height:10px;background:${URBAN};margin-right:3px;border-radius:2px"></i>Urban</span>
      <span><i style="display:inline-block;width:10px;height:10px;background:${RURAL};margin-right:3px;border-radius:2px"></i>Rural</span>`;
    root.appendChild(leg);

    function regionsFor(idx) {
      if (idx <= 0) return ["WLD"];
      if (idx === 1) return ["WLD"];
      if (idx === 2) return ["NAC", "LCN"];
      if (idx === 3) return ["EAS"];
      return ["SSF", "MEA", "SAS"];
    }

    function paint(idx) {
      const w = plot.clientWidth || 900;
      const h = plot.clientHeight || 400;
      plot.innerHTML = "";
      const svgNS = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(svgNS, "svg");
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      svg.style.cssText = "width:100%;height:100%";
      plot.appendChild(svg);

      const regs = regionsFor(idx).filter((r) => nest.has(r));
      const margin = { top: 12, right: 16, bottom: 32, left: 56 };
      // collect years/values
      let years = [];
      let vmax = 0;
      regs.forEach((r) => {
        const b = nest.get(r);
        [...b.urban, ...b.rural].forEach((p) => {
          years.push(p.year);
          vmax = Math.max(vmax, p.v);
        });
      });
      years = [...new Set(years)].sort((a, b) => a - b);
      if (!years.length) return;
      const x0 = years[0],
        x1 = years[years.length - 1];
      const xScale = (y) =>
        margin.left +
        ((y - x0) / Math.max(1, x1 - x0)) * (w - margin.left - margin.right);
      const yScale = (v) =>
        h -
        margin.bottom -
        (v / (vmax * 1.08 || 1)) * (h - margin.top - margin.bottom);

      // grid
      for (let i = 0; i <= 4; i++) {
        const v = (vmax * 1.08 * i) / 4;
        const y = yScale(v);
        const line = document.createElementNS(svgNS, "line");
        line.setAttribute("x1", margin.left);
        line.setAttribute("x2", w - margin.right);
        line.setAttribute("y1", y);
        line.setAttribute("y2", y);
        line.setAttribute("stroke", "#f1f5f9");
        svg.appendChild(line);
        const t = document.createElementNS(svgNS, "text");
        t.setAttribute("x", margin.left - 6);
        t.setAttribute("y", y + 4);
        t.setAttribute("text-anchor", "end");
        t.setAttribute("fill", "#6a7781");
        t.setAttribute("font-size", "10");
        t.textContent =
          v >= 1e9
            ? (v / 1e9).toFixed(1) + "B"
            : v >= 1e6
              ? (v / 1e6).toFixed(0) + "M"
              : String(Math.round(v));
        svg.appendChild(t);
      }
      [x0, Math.round((x0 + x1) / 2), x1].forEach((yr) => {
        const t = document.createElementNS(svgNS, "text");
        t.setAttribute("x", xScale(yr));
        t.setAttribute("y", h - 8);
        t.setAttribute("text-anchor", "middle");
        t.setAttribute("fill", "#6a7781");
        t.setAttribute("font-size", "11");
        t.setAttribute("font-weight", "600");
        t.textContent = String(yr);
        svg.appendChild(t);
      });

      const stacked = idx === 0; // scene 0: stacked world total feel via both series

      regs.forEach((reg) => {
        const b = nest.get(reg);
        const colU = regs.length === 1 ? URBAN : REG[reg] || URBAN;
        const colR = regs.length === 1 ? RURAL : REG[reg] || RURAL;
        // dual lines always (Atlas unstack narrative from scene 1+)
        function path(pts, col, width) {
          if (pts.length < 2) return;
          const d = pts
            .map(
              (p, i) =>
                `${i ? "L" : "M"}${xScale(p.year)},${yScale(p.v)}`
            )
            .join(" ");
          const el = document.createElementNS(svgNS, "path");
          el.setAttribute("d", d);
          el.setAttribute("fill", "none");
          el.setAttribute("stroke", col);
          el.setAttribute("stroke-width", width);
          el.setAttribute("stroke-linecap", "round");
          svg.appendChild(el);
        }
        if (stacked && reg === "WLD") {
          // area under urban+rural as total population band
          const byY = new Map();
          b.urban.forEach((p) => byY.set(p.year, { u: p.v, r: 0 }));
          b.rural.forEach((p) => {
            const o = byY.get(p.year) || { u: 0, r: 0 };
            o.r = p.v;
            byY.set(p.year, o);
          });
          const ys = [...byY.keys()].sort((a, c) => a - c);
          let dU = "";
          ys.forEach((y, i) => {
            const o = byY.get(y);
            dU += `${i ? "L" : "M"}${xScale(y)},${yScale(o.u + o.r)}`;
          });
          for (let i = ys.length - 1; i >= 0; i--) {
            const y = ys[i];
            const o = byY.get(y);
            dU += `L${xScale(y)},${yScale(o.r)}`;
          }
          dU += "Z";
          const area = document.createElementNS(svgNS, "path");
          area.setAttribute("d", dU);
          area.setAttribute("fill", URBAN);
          area.setAttribute("opacity", "0.35");
          svg.appendChild(area);
        }
        path(b.urban, colU, 2.6);
        path(b.rural, colR, 2.6);
        // end labels
        const lastU = b.urban[b.urban.length - 1];
        const lastR = b.rural[b.rural.length - 1];
        if (lastU) {
          const t = document.createElementNS(svgNS, "text");
          t.setAttribute("x", xScale(lastU.year) + 4);
          t.setAttribute("y", yScale(lastU.v) + 4);
          t.setAttribute("fill", colU);
          t.setAttribute("font-size", "11");
          t.setAttribute("font-weight", "700");
          t.textContent =
            (regs.length > 1 ? LABELS[reg] || reg : "Urban") +
            "";
          svg.appendChild(t);
        }
        if (lastR && regs.length === 1) {
          const t = document.createElementNS(svgNS, "text");
          t.setAttribute("x", xScale(lastR.year) + 4);
          t.setAttribute("y", yScale(lastR.v) + 4);
          t.setAttribute("fill", colR);
          t.setAttribute("font-size", "11");
          t.setAttribute("font-weight", "700");
          t.textContent = "Rural";
          svg.appendChild(t);
        }
      });

      const titles = [
        "World urban + rural population",
        "Urban and rural series unstacked",
        "North America & Latin America and the Caribbean",
        "East Asia & Pacific — rapid urban growth",
        "Sub-Saharan Africa, MENA & South Asia",
      ];
      header.textContent = titles[Math.min(idx, titles.length - 1)];
    }

    const api = {
      setScene: paint,
      updateScene: paint,
      destroy() {
        INSTANCES.delete(container);
        container.innerHTML = "";
      },
    };
    INSTANCES.set(container, { api, setScene: paint });
    paint(sceneIndex || 0);
    return api;
  }

  global.AtlasUrbanPopScroller = { mount, version: "1.0.0" };
})(typeof window !== "undefined" ? window : globalThis);
