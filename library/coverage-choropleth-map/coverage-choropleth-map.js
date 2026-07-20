/**
 * AtlasCoverageChoroplethMap v0.3.1 — beauty chrome polish
 * Mapbox choropleth for mobile network coverage (3G / 4G / 5G).
 *
 * Data join: paint expression `match` on iso_3166_1_alpha_3.
 * Basemap: dark-v11 + globe projection + fog (Atlas-like space chrome).
 *
 * Scenes: 0=3G · 1=4G · 2=5G · 3=5G SSF emphasis
 * Depends: mapboxgl + ATLAS_MAPBOX_TOKEN
 */
(function (global) {
  const INSTANCES = new WeakMap();
  const FIELDS = ["coverage_3G", "coverage_4G", "coverage_5G", "coverage_5G"];
  const TITLES = [
    "3G coverage",
    "4G coverage",
    "5G coverage",
    "5G — Sub-Saharan Africa focus",
  ];
  const COLORS = ["#34A7F2", "#5b7cfa", "#F3578E", "#FF9800"];
  const SSF = new Set([
    "AGO","BDI","BEN","BFA","BWA","CAF","CIV","CMR","COD","COG","COM","CPV","DJI",
    "ERI","ETH","GAB","GHA","GIN","GMB","GNB","GNQ","KEN","LBR","LSO","MDG","MLI",
    "MOZ","MRT","MUS","MWI","NAM","NER","NGA","RWA","SDN","SEN","SLE","SOM","SSD",
    "STP","SWZ","SYC","TCD","TGO","TZA","UGA","ZAF","ZMB","ZWE",
  ]);

  const WORLDVIEW_FILTER = [
    "all",
    ["==", ["get", "disputed"], "false"],
    [
      "any",
      ["==", "all", ["get", "worldview"]],
      ["in", "US", ["get", "worldview"]],
    ],
  ];

  function token() {
    return global.ATLAS_MAPBOX_TOKEN || global.ATLAS_MAPBOX_DATA_TOKEN || "";
  }

  /** Build Mapbox match expression: match [get iso] iso1 v1 iso2 v2 … default */
  function matchCoverage(byIso, field, sceneIdx) {
    const expr = ["match", ["get", "iso_3166_1_alpha_3"]];
    let n = 0;
    byIso.forEach((row, iso) => {
      if (!iso || iso.length !== 3) return;
      let v = row[field];
      if (sceneIdx === 3 && !SSF.has(iso)) return; // omit → falls to default
      if (!Number.isFinite(v)) return;
      expr.push(iso, Math.round(v * 10) / 10);
      n++;
    });
    expr.push(-1); // default no data
    return { expr, n };
  }

  function colorExpr(matchExpr, accent) {
    return [
      "case",
      ["<", matchExpr, 0],
      "#1e293b",
      [
        "interpolate",
        ["linear"],
        matchExpr,
        0,
        "#0f172a",
        25,
        "#16325c",
        50,
        accent,
        75,
        "#93c5fd",
        100,
        "#f8fafc",
      ],
    ];
  }

  function mount(container, options = {}) {
    if (!container) throw new Error("container required");
    if (!global.mapboxgl) {
      container.innerHTML =
        '<div style="padding:24px;color:#aa0000">coverage map needs mapbox-gl</div>';
      return { updateScene() {}, destroy() {}, sceneIndex: 0 };
    }

    const {
      rows = [],
      sceneIndex = 0,
      height: heightOpt = null,
      forceRemount = false,
      reuse = true,
      styleUrl = "mapbox://styles/mapbox/dark-v11",
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

    const byIso = new Map();
    rows.forEach((r) => {
      const iso = (r.iso3c || r.iso || "").toUpperCase();
      if (!iso) return;
      byIso.set(iso, {
        coverage_3G: r.coverage_3G === "" || r.coverage_3G == null ? null : +r.coverage_3G,
        coverage_4G: r.coverage_4G === "" || r.coverage_4G == null ? null : +r.coverage_4G,
        coverage_5G: r.coverage_5G === "" || r.coverage_5G == null ? null : +r.coverage_5G,
      });
    });

    const tk = token();
    if (!tk || /YOUR_MAPBOX/.test(tk)) {
      container.innerHTML =
        '<div style="padding:24px;color:#aa0000;font:14px Open Sans,system-ui">Mapbox token missing. Copy library/nightlights-hexmap/mapbox-config.example.js → mapbox-config.js</div>';
      return { updateScene() {}, destroy() {}, sceneIndex: 0 };
    }
    global.mapboxgl.accessToken = tk;

    container.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-coverage-map atlas-chart-root";
    const h = heightOpt || Math.max(420, container.clientHeight || 480);
    root.style.cssText = `position:relative;width:100%;height:${h}px;font-family:'Open Sans',system-ui,sans-serif;background:#0b1220;border-radius:2px;overflow:hidden`;
    container.appendChild(root);

    const header = document.createElement("div");
    header.className = "cm-header";
    header.style.cssText =
      "position:absolute;z-index:2;left:12px;top:12px;padding:10px 14px;background:rgba(15,23,42,0.9);border-left:4px solid #34A7F2;color:#e2e8f0;max-width:min(360px,70%);pointer-events:none;font-family:'Open Sans',system-ui,sans-serif;border-radius:0 6px 6px 0;box-shadow:0 4px 16px rgba(0,0,0,0.25)";
    header.innerHTML = `<div class="cm-title" style="font-weight:700;font-size:14px;letter-spacing:-0.01em">3G coverage</div>
      <div class="cm-sub" style="font-size:12px;color:#94a3b8;margin-top:4px">% of population within range of signal</div>
      <div class="cm-meta" style="font-size:11px;color:#64748b;margin-top:6px"></div>`;
    root.appendChild(header);

    const legend = document.createElement("div");
    legend.className = "cm-legend";
    legend.style.cssText =
      "position:absolute;z-index:2;right:12px;bottom:28px;padding:8px 12px;background:rgba(15,23,42,0.92);color:#cbd5e1;font-size:11px;font-weight:600;font-family:'Open Sans',system-ui,sans-serif;border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,0.2)";
    legend.innerHTML = `
      <div style="margin-bottom:6px">Coverage</div>
      <div style="display:flex;align-items:center;gap:6px">
        <span>0%</span>
        <span class="cm-grad" style="display:inline-block;width:88px;height:8px;border-radius:2px;background:linear-gradient(90deg,#1e293b,#34A7F2,#e0f2fe)"></span>
        <span>100%</span>
      </div>`;
    root.appendChild(legend);

    const mapEl = document.createElement("div");
    mapEl.style.cssText = "position:absolute;inset:0";
    root.appendChild(mapEl);

    const isMobile = (container.clientWidth || global.innerWidth) < 640;
    const map = new global.mapboxgl.Map({
      container: mapEl,
      style: styleUrl,
      center: [20, 8],
      zoom: isMobile ? 0.55 : 1.15,
      attributionControl: true,
      cooperativeGestures: true,
      dragRotate: !isMobile,
      pitchWithRotate: false,
      projection: "globe", // Atlas coverage map chrome
    });
    if (!isMobile) {
      map.addControl(
        new global.mapboxgl.NavigationControl({ showCompass: false }),
        "top-right"
      );
    }

    function styleBasemap() {
      // Dark space / ocean — closer to Atlas digital maps
      try {
        map.setFog({
          color: "rgb(8, 16, 36)",
          "high-color": "rgb(18, 40, 78)",
          "horizon-blend": 0.08,
          "space-color": "rgb(4, 8, 18)",
          "star-intensity": 0.22,
        });
      } catch (_) {}
      // Mute noisy layers if present in dark-v11
      const mute = [
        "road-primary",
        "road-secondary-tertiary",
        "road-street",
        "road-minor",
        "road-label",
        "road-number-shield",
        "bridge-path",
        "building",
        "building-outline",
        "aeroway-polygon",
        "aeroway-line",
        "poi-label",
        "transit-label",
      ];
      mute.forEach((id) => {
        if (!map.getLayer(id)) return;
        try {
          const t = map.getLayer(id).type;
          if (t === "symbol") map.setLayoutProperty(id, "visibility", "none");
          else if (t === "line" || t === "fill")
            map.setPaintProperty(id, `${t}-opacity`, 0.05);
        } catch (_) {}
      });
      // Water / land contrast
      ["water", "waterway"].forEach((id) => {
        if (!map.getLayer(id)) return;
        try {
          map.setPaintProperty(id, "fill-color", "#060d1c");
        } catch (_) {
          try {
            map.setPaintProperty(id, "line-color", "#0a1428");
          } catch (__) {}
        }
      });
      if (map.getLayer("land")) {
        try {
          map.setPaintProperty("land", "background-color", "#0c1528");
        } catch (_) {}
      }
      if (map.getLayer("landcover")) {
        try {
          map.setPaintProperty("landcover", "fill-opacity", 0.15);
        } catch (_) {}
      }
      // Country labels: smaller, dimmer
      ["country-label", "state-label", "settlement-major-label"].forEach((id) => {
        if (!map.getLayer(id)) return;
        try {
          map.setPaintProperty(id, "text-color", "#8b9bb4");
          map.setPaintProperty(id, "text-halo-color", "rgba(6,12,24,0.9)");
          map.setPaintProperty(id, "text-halo-width", 1);
        } catch (_) {}
      });
    }

    let current = sceneIndex;
    let ready = false;
    const sourceId = "countries";
    const layerId = "countries-fill";
    const outlineId = "countries-line";

    function fieldFor(idx) {
      return FIELDS[Math.max(0, Math.min(idx, FIELDS.length - 1))];
    }

    function applyPaint(idx) {
      if (!ready || !map.getLayer(layerId)) return;
      const field = fieldFor(idx);
      const col = COLORS[Math.min(idx, COLORS.length - 1)];
      const { expr, n } = matchCoverage(byIso, field, idx);

      header.style.borderLeftColor = col;
      header.querySelector(".cm-title").textContent = TITLES[Math.min(idx, 3)];
      const meta = header.querySelector(".cm-meta");
      if (meta) {
        meta.textContent =
          idx === 3
            ? `${n} Sub-Saharan economies with 5G data`
            : `${n} economies with data · no-data = dark`;
      }
      const grad = legend.querySelector(".cm-grad");
      if (grad) {
        grad.style.background = `linear-gradient(90deg,#1e293b,${col},#f8fafc)`;
      }

      // Primary join path: property match (reliable)
      map.setPaintProperty(layerId, "fill-color", colorExpr(expr, col));
      map.setPaintProperty(layerId, "fill-opacity", [
        "case",
        ["<", expr, 0],
        0.4,
        0.9,
      ]);

      if (idx === 3) {
        map.easeTo({
          center: [22, 0],
          zoom: isMobile ? 1.35 : 2.1,
          duration: 900,
        });
      } else {
        map.easeTo({
          center: [20, 8],
          zoom: isMobile ? 0.55 : 1.15,
          duration: 700,
        });
      }
    }

    function setScene(idx) {
      current = idx;
      applyPaint(idx);
    }

    map.on("style.load", () => {
      styleBasemap();
    });

    map.on("load", () => {
      styleBasemap();
      map.addSource(sourceId, {
        type: "vector",
        url: "mapbox://mapbox.country-boundaries-v1",
      });
      // Choropleth under labels
      const beforeId = map.getStyle().layers?.find((l) =>
        /label|place|country/i.test(l.id)
      )?.id;
      const fillSpec = {
        id: layerId,
        type: "fill",
        source: sourceId,
        "source-layer": "country_boundaries",
        filter: WORLDVIEW_FILTER,
        paint: {
          "fill-color": "#1a2744",
          "fill-opacity": 0.9,
        },
      };
      const lineSpec = {
        id: outlineId,
        type: "line",
        source: sourceId,
        "source-layer": "country_boundaries",
        filter: WORLDVIEW_FILTER,
        paint: {
          "line-color": "#050a14",
          "line-width": 0.5,
          "line-opacity": 0.75,
        },
      };
      if (beforeId) {
        map.addLayer(fillSpec, beforeId);
        map.addLayer(lineSpec, beforeId);
      } else {
        map.addLayer(fillSpec);
        map.addLayer(lineSpec);
      }
      ready = true;
      setScene(sceneIndex);
    });

    // Resize when container height changes (story sticky)
    const ro = new ResizeObserver(() => {
      try {
        map.resize();
      } catch (_) {}
    });
    ro.observe(root);

    const popup = new global.mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      maxWidth: "220px",
    });
    map.on("mousemove", layerId, (e) => {
      map.getCanvas().style.cursor = e.features?.length ? "pointer" : "";
      if (!e.features?.length) return;
      const f = e.features[0];
      const iso = (
        f.properties?.iso_3166_1_alpha_3 ||
        f.properties?.iso_a3 ||
        ""
      ).toUpperCase();
      const name = f.properties?.name_en || f.properties?.name || iso;
      const row = byIso.get(iso);
      const field = fieldFor(current);
      let v = row ? row[field] : null;
      if (current === 3 && !SSF.has(iso)) v = null;
      const html = `<div style="font:600 12px Open Sans,system-ui"><strong>${name}</strong><br/><span style="font-weight:500;color:#334155">${
        Number.isFinite(v) ? v.toFixed(1) + "% covered" : "No data"
      }</span></div>`;
      popup.setLngLat(e.lngLat).setHTML(html).addTo(map);
    });
    map.on("mouseleave", layerId, () => {
      map.getCanvas().style.cursor = "";
      popup.remove();
    });

    const api = {
      updateScene(n) {
        setScene(n);
      },
      setScene(n) {
        setScene(n);
      },
      destroy() {
        try {
          ro.disconnect();
        } catch (_) {}
        try {
          popup.remove();
          map.remove();
        } catch (_) {}
        try {
          container.innerHTML = "";
        } catch (_) {}
        INSTANCES.delete(container);
      },
      get sceneIndex() {
        return current;
      },
      map,
      version: "0.3.1",
    };
    INSTANCES.set(container, { api, setScene });
    return api;
  }

  const api = { mount, matchCoverage, version: "0.3.1" };
  global.AtlasCoverageChoroplethMap = api;
  global.AtlasLibrary = global.AtlasLibrary || {};
  global.AtlasLibrary.CoverageChoroplethMap = api;
})(typeof window !== "undefined" ? window : globalThis);
