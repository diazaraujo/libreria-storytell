/**
 * AtlasUrbanPayBeeswarm
 * Urban hourly earnings premium vs rural (%). Each dot = economy.
 * Vertical zero line; color urban-positive (teal) vs rural-higher (coral).
 */
(function (global) {
  const INSTANCES = new WeakMap();
  const POS = "#0C7C68";
  const NEG = "#E56245";
  const ZERO = "#94a3b8";

  function pack(values, xScale, yCenter, r) {
    if (global.Beeswarm) {
      const bs = new global.Beeswarm(values, r, (d) => xScale(d.v));
      return bs.calculateYPositions().map((p) => ({
        ...p.datum,
        x: p.x,
        y: yCenter + (p.y || 0),
      }));
    }
    return values.map((d, i) => ({
      ...d,
      x: xScale(d.v),
      y: yCenter + ((i % 9) - 4) * r * 0.85,
    }));
  }

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

    const NAMES = global.ATLAS_COUNTRY_NAMES || {};
    let data = (rows || [])
      .map((r) => ({
        iso: String(r.iso3c || r.code || "").toUpperCase(),
        v: +r.value,
        name: NAMES[r.iso3c] || r.iso3c,
      }))
      .filter((d) => Number.isFinite(d.v));

    // clip extreme outlier for layout (e.g. 336%) but keep real value in title
    const layout = data.map((d) => ({
      ...d,
      vPlot: Math.max(-40, Math.min(120, d.v)),
    }));

    container.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-urban-pay-beeswarm atlas-chart-root";
    const H = heightOpt || Math.max(400, container.clientHeight || 440);
    root.style.cssText = `position:relative;width:100%;height:${H}px;font-family:'Open Sans',system-ui,sans-serif;background:#fff`;
    container.appendChild(root);

    const header = document.createElement("div");
    header.style.cssText =
      "position:absolute;left:12px;top:8px;z-index:2;font-size:13px;font-weight:700;color:#111";
    root.appendChild(header);

    const plot = document.createElement("div");
    plot.style.cssText = "position:absolute;inset:36px 16px 36px 16px";
    root.appendChild(plot);

    const note = document.createElement("div");
    note.style.cssText =
      "position:absolute;left:12px;bottom:8px;font-size:11px;color:#6a7781;font-weight:600";
    note.textContent =
      "Urban hourly earnings premium over rural (%) · each dot = economy";
    root.appendChild(note);

    function paint(idx) {
      const w = plot.clientWidth || 900;
      const h = plot.clientHeight || 360;
      plot.innerHTML = "";
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      svg.style.cssText = "width:100%;height:100%";
      plot.appendChild(svg);

      const margin = { top: 12, right: 20, bottom: 24, left: 20 };
      const xMin = -40;
      const xMax = 120;
      const xScale = (v) =>
        margin.left +
        ((v - xMin) / (xMax - xMin)) * (w - margin.left - margin.right);

      // zero line
      const z = xScale(0);
      const zl = document.createElementNS("http://www.w3.org/2000/svg", "line");
      zl.setAttribute("x1", z);
      zl.setAttribute("x2", z);
      zl.setAttribute("y1", margin.top);
      zl.setAttribute("y2", h - margin.bottom);
      zl.setAttribute("stroke", ZERO);
      zl.setAttribute("stroke-width", "2");
      svg.appendChild(zl);
      const zt = document.createElementNS("http://www.w3.org/2000/svg", "text");
      zt.setAttribute("x", z);
      zt.setAttribute("y", margin.top + 10);
      zt.setAttribute("text-anchor", "middle");
      zt.setAttribute("fill", "#6a7781");
      zt.setAttribute("font-size", "11");
      zt.setAttribute("font-weight", "700");
      zt.textContent = "0";
      svg.appendChild(zt);

      [-20, 0, 20, 40, 60, 80, 100].forEach((t) => {
        const tx = document.createElementNS("http://www.w3.org/2000/svg", "text");
        tx.setAttribute("x", xScale(t));
        tx.setAttribute("y", h - 6);
        tx.setAttribute("text-anchor", "middle");
        tx.setAttribute("fill", "#6a7781");
        tx.setAttribute("font-size", "11");
        tx.setAttribute("font-weight", "600");
        tx.textContent = t + "%";
        svg.appendChild(tx);
      });

      let view = layout.map((d) => ({ ...d, v: d.vPlot }));
      if (idx === 1) {
        // only positive urban premium
        view = view.filter((d) => d.v >= 0);
      } else if (idx === 2) {
        view = view.filter((d) => d.v < 0);
      }

      const placed = pack(view, xScale, h / 2, 4.2);
      const nPos = layout.filter((d) => d.v > 0).length;
      const nNeg = layout.filter((d) => d.v < 0).length;

      placed.forEach((p) => {
        const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        c.setAttribute("cx", p.x);
        c.setAttribute("cy", p.y);
        c.setAttribute("r", 4);
        c.setAttribute("fill", p.v >= 0 ? POS : NEG);
        c.setAttribute("opacity", 0.85);
        c.setAttribute("stroke", "#fff");
        c.setAttribute("stroke-width", "0.8");
        svg.appendChild(c);
      });

      const titles = [
        `Most economies pay more in cities · ${nPos} urban premium · ${nNeg} rural higher`,
        "Urban pay premium (urban > rural)",
        "Where rural earnings are higher",
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

  global.AtlasUrbanPayBeeswarm = { mount, version: "1.0.0" };
})(typeof window !== "undefined" ? window : globalThis);
