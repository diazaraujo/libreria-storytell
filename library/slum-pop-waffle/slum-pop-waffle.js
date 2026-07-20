/**
 * AtlasSlumPopWaffle
 * Global people living in slums — dual-year unit chart.
 * Data: year,value (absolute population counts).
 * Atlas: +25% from 2018 → 2022.
 */
(function (global) {
  const INSTANCES = new WeakMap();
  const ON = "#E56245";
  const OFF = "#EBEEF4";
  const ON2 = "#AA0000";

  function mount(container, options = {}) {
    if (!container) throw new Error("container required");
    const {
      rows = [],
      sceneIndex = 0,
      height: heightOpt = null,
      reuse = true,
      forceRemount = false,
      cells = 100,
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

    const series = (rows || [])
      .map((r) => ({ year: +r.year, v: +r.value }))
      .filter((d) => Number.isFinite(d.year) && Number.isFinite(d.v))
      .sort((a, b) => a.year - b.year);

    const y0 = series[0];
    const y1 = series[series.length - 1] || y0;
    const maxV = Math.max(...series.map((d) => d.v), 1);
    // cells filled proportional to max year
    const filled0 = y0 ? Math.round((y0.v / maxV) * cells) : 0;
    const filled1 = y1 ? Math.round((y1.v / maxV) * cells) : 0;
    const growth =
      y0 && y1 && y0.v ? ((y1.v - y0.v) / y0.v) * 100 : 0;

    container.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-slum-waffle atlas-chart-root";
    const H = heightOpt || Math.max(400, container.clientHeight || 440);
    root.style.cssText = `position:relative;width:100%;height:${H}px;font-family:'Open Sans',system-ui,sans-serif;background:#fff;display:flex;flex-direction:column`;
    container.appendChild(root);

    const header = document.createElement("div");
    header.style.cssText =
      "padding:12px 16px 4px;font-size:13px;font-weight:700;color:#111";
    root.appendChild(header);

    const body = document.createElement("div");
    body.style.cssText =
      "flex:1;display:flex;gap:24px;align-items:center;justify-content:center;padding:8px 16px 24px;flex-wrap:wrap";
    root.appendChild(body);

    const note = document.createElement("div");
    note.style.cssText =
      "padding:0 16px 12px;font-size:11px;color:#6a7781;font-weight:600";
    note.textContent = `Each square ≈ ${(maxV / cells / 1e6).toFixed(1)} million people`;
    root.appendChild(note);

    function drawWaffle(parent, filled, title, color, people) {
      const wrap = document.createElement("div");
      wrap.style.cssText = "text-align:center";
      const t = document.createElement("div");
      t.style.cssText = `font-size:14px;font-weight:700;color:${color};margin-bottom:8px`;
      t.textContent = title;
      wrap.appendChild(t);
      const plot = document.createElement("div");
      wrap.appendChild(plot);
      if (global.AtlasWaffle) {
        global.AtlasWaffle.mount(plot, {
          total: cells,
          filled,
          cols: 10,
          cell: 16,
          gap: 3,
          colors: { on: color, off: OFF },
        });
      } else {
        // inline
        const cols = 10;
        const cell = 16;
        const gap = 3;
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        const rowsN = Math.ceil(cells / cols);
        svg.setAttribute(
          "viewBox",
          `0 0 ${cols * (cell + gap)} ${rowsN * (cell + gap)}`
        );
        svg.style.cssText = "width:200px;height:auto";
        for (let i = 0; i < cells; i++) {
          const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          rect.setAttribute("x", (i % cols) * (cell + gap));
          rect.setAttribute("y", Math.floor(i / cols) * (cell + gap));
          rect.setAttribute("width", cell);
          rect.setAttribute("height", cell);
          rect.setAttribute("rx", 2);
          rect.setAttribute("fill", i < filled ? color : OFF);
          svg.appendChild(rect);
        }
        plot.appendChild(svg);
      }
      const sub = document.createElement("div");
      sub.style.cssText = "margin-top:8px;font-size:18px;font-weight:700;color:#111";
      sub.textContent = (people / 1e9).toFixed(2) + "B people";
      wrap.appendChild(sub);
      parent.appendChild(wrap);
    }

    function paint(idx) {
      body.innerHTML = "";
      if (idx === 0) {
        header.textContent = `${y0.year}: people living in slum conditions`;
        drawWaffle(body, filled0, String(y0.year), ON, y0.v);
      } else if (idx === 1) {
        header.textContent = `${y1.year}: +${growth.toFixed(0)}% in four years`;
        drawWaffle(body, filled1, String(y1.year), ON2, y1.v);
      } else {
        header.textContent = `Slum population grew ~${growth.toFixed(0)}% (${y0.year}→${y1.year})`;
        drawWaffle(body, filled0, String(y0.year), ON, y0.v);
        drawWaffle(body, filled1, String(y1.year), ON2, y1.v);
      }
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

  global.AtlasSlumPopWaffle = { mount, version: "1.0.0" };
})(typeof window !== "undefined" ? window : globalThis);
