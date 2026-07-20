/**
 * AtlasValueBeeswarm v0.1
 * Country dots packed by numeric value (safely managed % etc).
 * Scene modes: all · universal (≥threshold) · low (<lowThreshold).
 *
 * Depends: AtlasSVG, Beeswarm (shared/beeswarm.js), AtlasBeeswarmChart
 */
(function (global) {
  const INSTANCES = new WeakMap();
  const INCOME_COLORS = {
    LIC: "#3B4DA6",
    LMC: "#DB95D7",
    UMC: "#73AF48",
    HIC: "#016B6C",
  };

  function mount(container, options = {}) {
    if (!container) throw new Error("container required");
    if (!global.AtlasBeeswarmChart || !global.Beeswarm) {
      throw new Error("AtlasValueBeeswarm needs Beeswarm + AtlasBeeswarmChart");
    }

    const {
      rows = [],
      sceneIndex = 0,
      valueField = "value",
      nameField = "name",
      isoField = "iso3c",
      incomeField = "income",
      universalThreshold = 99,
      lowThreshold = 50,
      height: heightOpt = null,
      forceRemount = false,
      reuse = true,
      baseColor = "#0080c6",
      dimColor = "#ced4de",
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

    const data = rows
      .map((r) => ({
        iso3c: r[isoField] || r.iso3 || r.iso,
        name: r[nameField] || r.country_name || r.iso3 || "",
        value: +(r[valueField] != null ? r[valueField] : r.value),
        income: r[incomeField] || (global.ATLAS_INCOME && global.ATLAS_INCOME[r.iso3 || r.iso3c]) || "UMC",
      }))
      .filter((d) => Number.isFinite(d.value));

    container.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-value-beeswarm atlas-chart-root";
    const w = Math.max(320, container.clientWidth || 900);
    const h = heightOpt || Math.max(400, container.clientHeight || 480);
    root.style.cssText = `position:relative;width:100%;height:${h}px;font-family:'Open Sans',system-ui,sans-serif;background:#fff`;
    container.appendChild(root);

    const note = document.createElement("div");
    note.style.cssText =
      "position:absolute;left:12px;bottom:8px;font-size:11px;color:#6a7781;font-weight:600;z-index:2";
    note.textContent = "Each dot = economy · safely managed drinking water (%)";
    root.appendChild(note);

    const plot = document.createElement("div");
    plot.style.cssText = "position:absolute;inset:0 0 28px 0";
    root.appendChild(plot);

    let current = sceneIndex;

    function paint(idx) {
      plot.innerHTML = "";
      const mode = idx; // 0 all, 1 universal, 2 low
      AtlasBeeswarmChart.mount(plot, {
        data,
        value: (d) => d.value,
        domain: [0, 100],
        radius: 3.2,
        width: plot.clientWidth || w,
        height: plot.clientHeight || h - 28,
        orientation: "vertical",
        ticks: [0, 20, 40, 60, 80, 100],
        color: (d) => {
          if (mode === 1) return d.value >= universalThreshold ? baseColor : dimColor;
          if (mode === 2) return d.value < lowThreshold ? "#e31c3d" : dimColor;
          return INCOME_COLORS[d.income] || baseColor;
        },
        opacity: (d) => {
          if (mode === 1) return d.value >= universalThreshold ? 1 : 0.22;
          if (mode === 2) return d.value < lowThreshold ? 1 : 0.22;
          return 0.92;
        },
        title: (d) => `${d.name}: ${d.value.toFixed(1)}%`,
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
  global.AtlasValueBeeswarm = api;
  global.AtlasLibrary = global.AtlasLibrary || {};
  global.AtlasLibrary.ValueBeeswarm = api;
})(typeof window !== "undefined" ? window : globalThis);
