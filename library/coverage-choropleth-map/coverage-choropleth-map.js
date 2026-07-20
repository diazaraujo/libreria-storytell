/**
 * AtlasCoverageChoroplethMap v0.1
 * Real Mapbox choropleth for mobile network coverage (3G / 4G / 5G).
 * Uses mapbox.country-boundaries-v1 + feature-state join to CSV.
 *
 * Scenes: 0=3G · 1=4G · 2=5G · 3=5G SSF emphasis
 * Depends: mapboxgl, optional ATLAS_MAPBOX_TOKEN / proxy config
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

  function token() {
    return (
      global.ATLAS_MAPBOX_TOKEN ||
      global.ATLAS_MAPBOX_DATA_TOKEN ||
      ""
    );
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
      const iso = r.iso3c || r.iso;
      if (!iso) return;
      byIso.set(iso, {
        coverage_3G: r.coverage_3G === "" ? null : +r.coverage_3G,
        coverage_4G: r.coverage_4G === "" ? null : +r.coverage_4G,
        coverage_5G: r.coverage_5G === "" ? null : +r.coverage_5G,
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
    header.style.cssText =
      "position:absolute;z-index:2;left:12px;top:12px;padding:10px 12px;background:rgba(15,23,42,0.88);border-left:4px solid #34A7F2;color:#e2e8f0;max-width:min(360px,70%);pointer-events:none";
    header.innerHTML = `<div class="cm-title" style="font-weight:700;font-size:14px">3G coverage</div>
      <div class="cm-sub" style="font-size:12px;color:#94a3b8;margin-top:4px">% of population within range of signal</div>`;
    root.appendChild(header);

    const legend = document.createElement("div");
    legend.style.cssText =
      "position:absolute;z-index:2;right:12px;bottom:28px;padding:8px 10px;background:rgba(15,23,42,0.9);color:#cbd5e1;font-size:11px;font-weight:600";
    legend.innerHTML = `
      <div style="margin-bottom:6px">Coverage</div>
      <div style="display:flex;align-items:center;gap:6px">
        <span>0%</span>
        <span style="display:inline-block;width:88px;height:8px;border-radius:2px;background:linear-gradient(90deg,#1e293b,#34A7F2,#e0f2fe)"></span>
        <span>100%</span>
      </div>`;
    root.appendChild(legend);

    const mapEl = document.createElement("div");
    mapEl.style.cssText = "position:absolute;inset:0";
    root.appendChild(mapEl);

    const map = new global.mapboxgl.Map({
      container: mapEl,
      style: styleUrl,
      center: [15, 12],
      zoom: 1.35,
      attributionControl: true,
      cooperativeGestures: true,
    });
    map.addControl(new global.mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    let current = sceneIndex;
    let ready = false;
    const sourceId = "countries";
    const layerId = "countries-fill";
    const outlineId = "countries-line";

    function fieldFor(idx) {
      return FIELDS[Math.max(0, Math.min(idx, FIELDS.length - 1))];
    }

    function applyFeatureStates(idx) {
      if (!ready) return;
      const field = fieldFor(idx);
      // Prefer setting state for all known ISO codes (promoteId = iso_3166_1_alpha_3)
      byIso.forEach((row, iso) => {
        let cov = row[field];
        if (idx === 3 && !SSF.has(iso)) cov = null;
        try {
          map.setFeatureState(
            { source: sourceId, sourceLayer: "country_boundaries", id: iso },
            {
              coverage: Number.isFinite(cov) ? cov : -1,
              ssf: SSF.has(iso) ? 1 : 0,
            }
          );
        } catch (_) {}
      });
      // Also paint any features currently in view (covers promoteId edge cases)
      const feats = map.querySourceFeatures(sourceId, {
        sourceLayer: "country_boundaries",
      });
      const seen = new Set();
      feats.forEach((f) => {
        const iso =
          f.id ||
          f.properties?.iso_3166_1_alpha_3 ||
          f.properties?.iso_a3;
        if (!iso || seen.has(iso)) return;
        seen.add(iso);
        const row = byIso.get(iso);
        let cov = row ? row[field] : null;
        if (idx === 3 && !SSF.has(String(iso))) cov = null;
        try {
          map.setFeatureState(
            { source: sourceId, sourceLayer: "country_boundaries", id: iso },
            {
              coverage: Number.isFinite(cov) ? cov : -1,
              ssf: SSF.has(String(iso)) ? 1 : 0,
            }
          );
        } catch (_) {}
      });
    }

    function paintLayer(idx) {
      const col = COLORS[Math.min(idx, COLORS.length - 1)];
      header.style.borderLeftColor = col;
      header.querySelector(".cm-title").textContent = TITLES[Math.min(idx, 3)];
      if (!map.getLayer(layerId)) return;
      map.setPaintProperty(layerId, "fill-color", [
        "case",
        ["<", ["feature-state", "coverage"], 0],
        "#1e293b",
        [
          "interpolate",
          ["linear"],
          ["feature-state", "coverage"],
          0,
          "#0f172a",
          30,
          "#1e3a5f",
          60,
          col,
          100,
          "#f8fafc",
        ],
      ]);
      map.setPaintProperty(layerId, "fill-opacity", [
        "case",
        ["==", ["feature-state", "coverage"], null],
        0.35,
        ["<", ["feature-state", "coverage"], 0],
        0.35,
        0.88,
      ]);
      if (idx === 3) {
        map.easeTo({ center: [20, 2], zoom: 2.4, duration: 900 });
      } else {
        map.easeTo({ center: [15, 12], zoom: 1.35, duration: 700 });
      }
    }

    function setScene(idx) {
      current = idx;
      paintLayer(idx);
      // re-query after move/render
      map.once("idle", () => applyFeatureStates(idx));
      applyFeatureStates(idx);
    }

    map.on("load", () => {
      map.addSource(sourceId, {
        type: "vector",
        url: "mapbox://mapbox.country-boundaries-v1",
        // promote ISO3 so setFeatureState can target by iso if needed
        promoteId: "iso_3166_1_alpha_3",
      });
      // filter disputed / worldview
      map.addLayer({
        id: layerId,
        type: "fill",
        source: sourceId,
        "source-layer": "country_boundaries",
        filter: [
          "all",
          ["==", ["get", "disputed"], "false"],
          [
            "any",
            ["==", "all", ["get", "worldview"]],
            ["in", "US", ["get", "worldview"]],
          ],
        ],
        paint: {
          "fill-color": "#1e293b",
          "fill-opacity": 0.85,
        },
      });
      map.addLayer({
        id: outlineId,
        type: "line",
        source: sourceId,
        "source-layer": "country_boundaries",
        filter: [
          "all",
          ["==", ["get", "disputed"], "false"],
          [
            "any",
            ["==", "all", ["get", "worldview"]],
            ["in", "US", ["get", "worldview"]],
          ],
        ],
        paint: {
          "line-color": "#0b1220",
          "line-width": 0.4,
          "line-opacity": 0.6,
        },
      });
      ready = true;
      setScene(sceneIndex);
      // second pass after tiles
      setTimeout(() => applyFeatureStates(current), 800);
      setTimeout(() => applyFeatureStates(current), 1800);
    });

    map.on("mousemove", layerId, (e) => {
      map.getCanvas().style.cursor = e.features?.length ? "pointer" : "";
    });

    const popup = new global.mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
    });
    map.on("mousemove", layerId, (e) => {
      if (!e.features?.length) return;
      const f = e.features[0];
      const iso =
        f.properties?.iso_3166_1_alpha_3 || f.properties?.iso_a3 || "";
      const name = f.properties?.name_en || f.properties?.name || iso;
      const row = byIso.get(iso);
      const field = fieldFor(current);
      const v = row ? row[field] : null;
      const html = `<strong>${name}</strong><br/>${
        Number.isFinite(v) ? v.toFixed(1) + "% covered" : "No data"
      }`;
      popup.setLngLat(e.lngLat).setHTML(html).addTo(map);
    });
    map.on("mouseleave", layerId, () => popup.remove());

    const api = {
      updateScene(n) {
        setScene(n);
      },
      setScene(n) {
        setScene(n);
      },
      destroy() {
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
      version: "0.1.0",
    };
    INSTANCES.set(container, { api, setScene });
    return api;
  }

  const api = { mount, version: "0.1.0" };
  global.AtlasCoverageChoroplethMap = api;
  global.AtlasLibrary = global.AtlasLibrary || {};
  global.AtlasLibrary.CoverageChoroplethMap = api;
})(typeof window !== "undefined" ? window : globalThis);
