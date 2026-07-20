/**
 * AtlasHazardExposureMap v1.1
 * Climate hazard exposure scroller (goal_13).
 *
 * RE: atlas-global-development chunks/BmkL22Hm.js
 * Scene ids: {floods|drought|cyclones|heatwave}__{sat|vec}__{wld|bbox|bbox1}
 *
 * Modes (Atlas):
 *  - sat: satellite basemap + hazard raster (mlambrechts.*)
 *  - vec: dark basemap + country exposure choropleth (sha_*)
 *
 * Private tiles: ATLAS_MAPBOX_DATA_TOKEN + proxy :8790 (same as nightlights-hexmap)
 * Mount once; updateScene on scroll.
 */
(function (global) {
  const INSTANCES = new WeakMap();

  const HAZARDS = {
    floods: {
      field: "sha_flood",
      label: "Floods",
      units: "% of population exposed",
      ramp: ["#c3e3f5", "#089BD4", "#023B6F"],
      accent: "#34A7F2",
      bbox: [2.666, 50.626, 8.201, 53.757],
      rasterSource: "floodMapGL_rp10y",
      rasterUrl: "mapbox://mlambrechts.4s3qmpky",
      rasterLayer: "08_floods",
      // N(cat1, 0.8) at value >= 50/255
      rasterPaint: {
        "raster-resampling": "linear",
        "raster-opacity": 0.9,
        "raster-color": [
          "step",
          ["raster-value"],
          "rgba(255,255,255,0)",
          50 / 255,
          "rgba(52,167,242,0.8)",
        ],
      },
    },
    drought: {
      field: "sha_drought",
      label: "Agricultural drought",
      units: "% of population exposed",
      ramp: ["#FDF7DB", "#BE792B", "#5C0000"],
      accent: "#FF9800",
      bbox: [9.668, -36.739, 41.66, -14.86],
      rasterSource: "drought_asi_1km",
      rasterUrl: "mapbox://mlambrechts.42umnzdv",
      rasterLayer: "07_drought",
      rasterPaint: {
        "raster-resampling": "linear",
        "raster-opacity": 0.9,
        "raster-color": [
          "step",
          ["raster-value"],
          "rgba(255,255,255,0)",
          2 / 255,
          "rgba(255,152,0,0.8)",
          4 / 255,
          "rgba(255,255,255,0)",
        ],
      },
    },
    cyclones: {
      field: "sha_cyclone",
      label: "Cyclones",
      units: "% of population exposed",
      ramp: ["#FFE2FF", "#A37ACD", "#2F1E9C"],
      accent: "#664AB6",
      bbox: [-99.272, 7.493, -59.0186, 32.101],
      rasterSource: "cyclone_wind_6arcmin",
      rasterUrl: "mapbox://mlambrechts.cjvyvcle",
      rasterLayer: "09_cyclones",
      rasterPaint: {
        "raster-resampling": "linear",
        "raster-opacity": 0.95,
        "raster-color": [
          "interpolate",
          ["linear"],
          ["raster-value"],
          0,
          "rgba(0,0,0,0)",
          29 / 255,
          "rgba(0,0,0,0)",
          30 / 255,
          "rgba(102,74,182,0.1)",
          40 / 255,
          "rgba(102,74,182,0.9)",
        ],
      },
    },
    heatwave: {
      field: "sha_heatwave",
      label: "Heatwaves",
      units: "% of population exposed",
      ramp: ["#FDF7DB", "#ECB63A", "#C1261A"],
      accent: "#AA0000",
      bbox: [60, 6.5, 120, 45.5],
      rasterSource: "heat_max5dESI_15arcmin",
      rasterUrl: "mapbox://mlambrechts.224rew2o",
      rasterLayer: "10_heatwaves",
      rasterPaint: {
        "raster-resampling": "linear",
        "raster-opacity": 0.8,
        "raster-color": [
          "step",
          ["raster-value"],
          "rgba(0,0,0,0)",
          30 / 255,
          "rgba(193,38,26,0.8)",
          35 / 255,
          "rgba(193,38,26,1)",
        ],
      },
    },
  };

  const DEFAULT_SCENES = {
    floods: ["floods__sat__wld", "floods__sat__bbox1", "floods__vec__wld"],
    drought: ["drought__sat__wld", "drought__sat__bbox1", "drought__vec__wld"],
    cyclones: ["cyclones__sat__wld", "cyclones__vec__bbox1", "cyclones__vec__wld"],
    heatwave: ["heatwave__sat__wld", "heatwave__sat__bbox", "heatwave__vec__wld"],
  };

  const WORLDVIEW_FILTER = [
    "all",
    ["==", ["get", "disputed"], "false"],
    [
      "any",
      ["==", "all", ["get", "worldview"]],
      ["in", "US", ["get", "worldview"]],
    ],
  ];

  function basemapToken() {
    return global.ATLAS_MAPBOX_TOKEN || global.ATLAS_MAPBOX_DATA_TOKEN || "";
  }
  function dataToken() {
    return global.ATLAS_MAPBOX_DATA_TOKEN || global.ATLAS_MAPBOX_TOKEN || "";
  }
  function proxyBase() {
    return (global.ATLAS_MAPBOX_PROXY || "http://127.0.0.1:8790").replace(/\/$/, "");
  }

  function makeTransformRequest(proxy, dataTok) {
    return function transformRequest(url) {
      if (typeof url === "string" && /mlambrechts\./i.test(url)) {
        let u = url;
        if (dataTok && /access_token=/.test(u)) {
          u = u.replace(
            /access_token=[^&]+/,
            "access_token=" + encodeURIComponent(dataTok)
          );
        } else if (dataTok && !/access_token=/.test(u)) {
          u +=
            (u.includes("?") ? "&" : "?") +
            "access_token=" +
            encodeURIComponent(dataTok);
        }
        return { url: proxy + "/?u=" + encodeURIComponent(u) };
      }
      return { url };
    };
  }

  async function probeProxy(proxy) {
    try {
      const r = await fetch(proxy + "/health", { cache: "no-store" });
      if (!r.ok) return false;
      const j = await r.json();
      return !!j.ok;
    } catch (_) {
      return false;
    }
  }

  function parseSceneId(sceneId, hazard, sceneIndex) {
    let id = sceneId;
    if (!id && DEFAULT_SCENES[hazard]) {
      const list = DEFAULT_SCENES[hazard];
      id = list[Math.max(0, Math.min(sceneIndex || 0, list.length - 1))];
    }
    if (!id) id = `${hazard}__vec__wld`;
    const parts = String(id).split("__");
    const h = parts[0] in HAZARDS ? parts[0] : hazard;
    const mode = parts[1] === "sat" ? "sat" : "vec";
    const frame = parts[2] || "wld";
    const isBbox = /^bbox/i.test(frame);
    return { id, hazard: h, mode, isBbox };
  }

  function rowsToMap(rows) {
    const byIso = new Map();
    (rows || []).forEach((r) => {
      const iso = String(r.code || r.iso3c || r.iso || "").toUpperCase();
      if (iso.length !== 3) return;
      byIso.set(iso, {
        sha_flood: +r.sha_flood,
        sha_drought: +r.sha_drought,
        sha_cyclone: +r.sha_cyclone,
        sha_heatwave: +r.sha_heatwave,
        sha_all: +r.sha_all,
      });
    });
    return byIso;
  }

  function matchExpr(byIso, field) {
    const expr = ["match", ["get", "iso_3166_1_alpha_3"]];
    let n = 0;
    byIso.forEach((row, iso) => {
      const v = row[field];
      if (!Number.isFinite(v)) return;
      expr.push(iso, Math.round(v * 10) / 10);
      n++;
    });
    expr.push(-1);
    return { expr, n };
  }

  function fillColorExpr(match, ramp, grey100) {
    const [c1, c2, c3] = ramp;
    return [
      "case",
      ["<", match, 0],
      "rgba(255,255,255,0.15)",
      [
        "step",
        match,
        grey100 || "#EBEEF4",
        0.01,
        c1,
        10,
        c1,
        20,
        c2,
        30,
        c2,
        40,
        c3,
      ],
    ];
  }

  function muteBasemap(map) {
    try {
      map.setFog({
        color: "rgb(8, 16, 36)",
        "high-color": "rgb(18, 40, 78)",
        "horizon-blend": 0.08,
        "space-color": "rgb(4, 8, 18)",
        "star-intensity": 0.18,
      });
    } catch (_) {}
    [
      "road-primary",
      "road-secondary-tertiary",
      "road-street",
      "road-minor",
      "road-label",
      "building",
      "poi-label",
      "transit-label",
    ].forEach((id) => {
      if (!map.getLayer(id)) return;
      try {
        const t = map.getLayer(id).type;
        if (t === "symbol") map.setLayoutProperty(id, "visibility", "none");
        else map.setPaintProperty(id, `${t}-opacity`, 0.06);
      } catch (_) {}
    });
  }

  function fitBbox(map, bbox, isMobile, duration) {
    const [w, s, e, n] = bbox;
    map.fitBounds(
      [
        [w, s],
        [e, n],
      ],
      {
        padding: isMobile ? 28 : 48,
        duration: duration ?? 900,
        maxZoom: isMobile ? 5.2 : 6.2,
      }
    );
  }

  function fitWorld(map, isMobile, duration) {
    map.easeTo({
      center: [12, 12],
      zoom: isMobile ? 0.7 : 1.25,
      duration: duration ?? 800,
      pitch: 0,
      bearing: 0,
    });
  }

  function ensureCountryLayers(map, sourceId, fillId, lineId) {
    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: "vector",
        url: "mapbox://mapbox.country-boundaries-v1",
      });
    }
    if (!map.getLayer(fillId)) {
      const beforeId = map
        .getStyle()
        .layers?.find((l) => /label|place|country/i.test(l.id))?.id;
      map.addLayer(
        {
          id: fillId,
          type: "fill",
          source: sourceId,
          "source-layer": "country_boundaries",
          filter: WORLDVIEW_FILTER,
          paint: { "fill-color": "#1a2744", "fill-opacity": 0.85 },
        },
        beforeId
      );
    }
    if (!map.getLayer(lineId)) {
      map.addLayer({
        id: lineId,
        type: "line",
        source: sourceId,
        "source-layer": "country_boundaries",
        filter: WORLDVIEW_FILTER,
        paint: {
          "line-color": "#94a3b8",
          "line-width": 0.4,
          "line-opacity": 0.45,
        },
      });
    }
  }

  /** Add all hazard raster sources/layers (hidden by default). Atlas sat mode. */
  function ensureHazardRasters(map, fillId) {
    Object.values(HAZARDS).forEach((hz) => {
      if (!map.getSource(hz.rasterSource)) {
        try {
          map.addSource(hz.rasterSource, {
            type: "raster",
            url: hz.rasterUrl,
            tileSize: 256,
          });
        } catch (err) {
          console.warn("[hazard-map] source", hz.rasterSource, err);
          return;
        }
      }
      if (!map.getLayer(hz.rasterLayer)) {
        try {
          // Below country fill so choropleth can sit on top in vec mode
          const before = map.getLayer(fillId) ? fillId : undefined;
          map.addLayer(
            {
              id: hz.rasterLayer,
              type: "raster",
              source: hz.rasterSource,
              minzoom: 0,
              maxzoom: 10,
              layout: { visibility: "none" },
              paint: {
                ...hz.rasterPaint,
                "raster-opacity-transition": { duration: 500 },
              },
            },
            before
          );
        } catch (err) {
          // raster-color requires Mapbox GL that supports it; fall back opacity-only
          console.warn("[hazard-map] layer paint", hz.rasterLayer, err);
          try {
            map.addLayer({
              id: hz.rasterLayer,
              type: "raster",
              source: hz.rasterSource,
              minzoom: 0,
              maxzoom: 10,
              layout: { visibility: "none" },
              paint: {
                "raster-opacity": 0.75,
                "raster-resampling": "linear",
                "raster-opacity-transition": { duration: 500 },
              },
            });
          } catch (e2) {
            console.warn("[hazard-map] layer fallback", hz.rasterLayer, e2);
          }
        }
      }
    });
  }

  function setRasterVisibility(map, activeHazard, show) {
    Object.entries(HAZARDS).forEach(([key, hz]) => {
      if (!map.getLayer(hz.rasterLayer)) return;
      const on = show && key === activeHazard;
      try {
        map.setLayoutProperty(
          hz.rasterLayer,
          "visibility",
          on ? "visible" : "none"
        );
      } catch (_) {}
    });
  }

  function applyScene(inst, sceneId, sceneIndex) {
    const { map, byIso, hazardKey, header, legend, badge, isMobile, fillId, lineId } =
      inst;
    if (!map || !inst.ready) {
      inst.pending = { sceneId, sceneIndex };
      return;
    }

    const parsed = parseSceneId(sceneId, hazardKey, sceneIndex);
    const hz = HAZARDS[parsed.hazard] || HAZARDS[hazardKey];
    const { expr, n } = matchExpr(byIso, hz.field);
    const grey100 =
      (global.WB_COLORS && global.WB_COLORS.grey100) || "#EBEEF4";

    if (header) {
      header.style.borderLeftColor = hz.accent;
      const title = header.querySelector(".hm-title");
      const sub = header.querySelector(".hm-sub");
      const meta = header.querySelector(".hm-meta");
      if (title) title.textContent = hz.label;
      if (sub) {
        sub.textContent =
          parsed.mode === "sat"
            ? parsed.isBbox
              ? "Satellite · hazard raster · regional focus"
              : "Satellite · hazard raster · global"
            : "Share of population exposed by economy";
      }
      if (meta) {
        meta.textContent =
          parsed.mode === "vec"
            ? `${n} economies · ${hz.units}`
            : inst.proxyOk
              ? "Atlas tiles via proxy · mlambrechts.*"
              : "Raster tiles need proxy :8790 (optional)";
      }
    }

    if (legend) {
      const grad = legend.querySelector(".hm-grad");
      if (grad) {
        grad.style.background = `linear-gradient(90deg,${hz.ramp.join(",")})`;
      }
      const lab = legend.querySelector(".hm-leg-title");
      if (lab) {
        lab.textContent =
          parsed.mode === "sat" ? "Hazard intensity (raster)" : "Population exposed";
      }
      legend.style.opacity = "1";
    }

    if (badge) {
      badge.textContent =
        parsed.mode === "sat"
          ? inst.proxyOk
            ? "sat + raster"
            : "sat (raster offline)"
          : "vec choropleth";
      badge.style.borderColor = hz.accent;
    }

    // Atlas: rasters on sat; choropleth on vec
    setRasterVisibility(map, parsed.hazard, parsed.mode === "sat");

    if (map.getLayer(fillId)) {
      if (parsed.mode === "vec") {
        map.setPaintProperty(
          fillId,
          "fill-color",
          fillColorExpr(expr, hz.ramp, grey100)
        );
        map.setPaintProperty(fillId, "fill-opacity", [
          "case",
          ["<", expr, 0],
          0.12,
          0.88,
        ]);
      } else {
        // sat: faint country tint so land is readable over satellite
        map.setPaintProperty(fillId, "fill-color", "rgba(15,23,42,0.05)");
        map.setPaintProperty(fillId, "fill-opacity", 0.08);
      }
    }
    if (map.getLayer(lineId)) {
      map.setPaintProperty(
        lineId,
        "line-opacity",
        parsed.mode === "vec" ? 0.5 : 0.35
      );
      map.setPaintProperty(
        lineId,
        "line-color",
        parsed.mode === "sat" ? "#e2e8f0" : "#94a3b8"
      );
    }

    if (parsed.isBbox) fitBbox(map, hz.bbox, isMobile, 1000);
    else fitWorld(map, isMobile, 850);

    inst.current = parsed;
  }

  function setBasemapStyle(inst, mode) {
    const want = mode === "sat" ? "satellite" : "vector";
    if (inst.basemap === want) return Promise.resolve();
    inst.basemap = want;
    const styleUrl =
      mode === "sat"
        ? "mapbox://styles/mapbox/satellite-v9"
        : "mapbox://styles/mapbox/dark-v11";
    return new Promise((resolve) => {
      inst.map.once("style.load", () => {
        if (mode !== "sat") muteBasemap(inst.map);
        ensureCountryLayers(inst.map, inst.sourceId, inst.fillId, inst.lineId);
        ensureHazardRasters(inst.map, inst.fillId);
        inst.ready = true;
        resolve();
      });
      inst.ready = false;
      inst.map.setStyle(styleUrl);
    });
  }

  function mount(container, options = {}) {
    if (!container) throw new Error("container required");
    if (!global.mapboxgl) {
      container.innerHTML =
        '<div style="padding:24px;color:#aa0000;font:14px Open Sans,system-ui">Hazard map needs mapbox-gl</div>';
      return { updateScene() {}, destroy() {} };
    }

    const {
      rows = [],
      hazard = "floods",
      sceneId = null,
      sceneIndex = 0,
      height: heightOpt = null,
      forceRemount = false,
      reuse = true,
      showBadge = false,
    } = options;

    const hazardKey = hazard in HAZARDS ? hazard : "floods";

    if (reuse && !forceRemount && INSTANCES.has(container)) {
      const inst = INSTANCES.get(container);
      inst.byIso = rowsToMap(rows);
      inst.hazardKey = hazardKey;
      updateScene(container, { sceneId, sceneIndex });
      return inst.api;
    }
    if (INSTANCES.has(container)) {
      try {
        INSTANCES.get(container).api.destroy();
      } catch (_) {}
      INSTANCES.delete(container);
    }

    const tk = basemapToken();
    if (!tk || /YOUR_MAPBOX/.test(tk)) {
      container.innerHTML =
        '<div style="padding:24px;color:#aa0000;font:14px Open Sans,system-ui">Mapbox token missing. Copy library/nightlights-hexmap/mapbox-config.example.js → mapbox-config.js</div>';
      return { updateScene() {}, destroy() {} };
    }
    global.mapboxgl.accessToken = tk;

    const byIso = rowsToMap(rows);
    const parsed0 = parseSceneId(sceneId, hazardKey, sceneIndex);
    const initialSat = parsed0.mode === "sat";
    const proxy = proxyBase();
    const dTok = dataToken();

    container.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-hazard-map atlas-chart-root";
    const h = heightOpt || Math.max(440, container.clientHeight || 480);
    root.style.cssText = `position:relative;width:100%;height:${h}px;font-family:'Open Sans',system-ui,sans-serif;background:#0b1220;border-radius:2px;overflow:hidden`;
    container.appendChild(root);

    const hz0 = HAZARDS[hazardKey];
    const header = document.createElement("div");
    header.className = "hm-header";
    header.style.cssText =
      "position:absolute;z-index:2;left:12px;top:12px;padding:10px 12px;background:rgba(15,23,42,0.9);border-left:4px solid " +
      hz0.accent +
      ";color:#e2e8f0;max-width:min(340px,72%);pointer-events:none;backdrop-filter:blur(8px)";
    header.innerHTML = `<div class="hm-title" style="font-weight:700;font-size:14px">${hz0.label}</div>
      <div class="hm-sub" style="font-size:12px;color:#94a3b8;margin-top:4px;line-height:1.35">Share of population exposed</div>
      <div class="hm-meta" style="font-size:11px;color:#64748b;margin-top:6px"></div>`;
    root.appendChild(header);

    const legend = document.createElement("div");
    legend.className = "hm-legend";
    legend.style.cssText =
      "position:absolute;z-index:2;right:12px;bottom:28px;padding:8px 10px;background:rgba(15,23,42,0.92);color:#cbd5e1;font-size:11px;font-weight:600;transition:opacity .35s";
    legend.innerHTML = `
      <div class="hm-leg-title" style="margin-bottom:6px">Population exposed</div>
      <div style="display:flex;align-items:center;gap:6px">
        <span>low</span>
        <span class="hm-grad" style="display:inline-block;width:96px;height:8px;border-radius:2px;background:linear-gradient(90deg,${hz0.ramp.join(",")})"></span>
        <span>high</span>
      </div>`;
    root.appendChild(legend);

    const badge = document.createElement("div");
    badge.className = "hm-badge";
    badge.style.cssText =
      "position:absolute;z-index:2;left:12px;bottom:28px;padding:4px 8px;font-size:10px;font-weight:700;letter-spacing:.02em;text-transform:uppercase;color:#e2e8f0;background:rgba(15,23,42,0.85);border:1px solid " +
      hz0.accent +
      ";border-radius:4px;" +
      (showBadge ? "" : "display:none;");
    root.appendChild(badge);

    const mapEl = document.createElement("div");
    mapEl.style.cssText = "position:absolute;inset:0";
    root.appendChild(mapEl);

    const isMobile = (container.clientWidth || global.innerWidth) < 640;
    const styleUrl = initialSat
      ? "mapbox://styles/mapbox/satellite-v9"
      : "mapbox://styles/mapbox/dark-v11";

    const inst = {
      map: null,
      byIso,
      hazardKey,
      header,
      legend,
      badge,
      isMobile,
      sourceId: "countries",
      fillId: "hazard-countries-fill",
      lineId: "hazard-countries-line",
      ready: false,
      basemap: initialSat ? "satellite" : "vector",
      pending: null,
      current: null,
      proxyOk: false,
      root,
      api: null,
    };

    // Probe proxy then create map (so transformRequest is wired)
    const start = async () => {
      inst.proxyOk = await probeProxy(proxy);
      const map = new global.mapboxgl.Map({
        container: mapEl,
        style: styleUrl,
        center: [12, 12],
        zoom: isMobile ? 0.7 : 1.25,
        attributionControl: true,
        cooperativeGestures: true,
        dragRotate: !isMobile,
        pitchWithRotate: false,
        projection: "globe",
        transformRequest: makeTransformRequest(proxy, dTok),
      });
      inst.map = map;
      if (!isMobile) {
        map.addControl(
          new global.mapboxgl.NavigationControl({ showCompass: false }),
          "top-right"
        );
      }

      map.on("load", () => {
        if (!initialSat) muteBasemap(map);
        ensureCountryLayers(map, inst.sourceId, inst.fillId, inst.lineId);
        ensureHazardRasters(map, inst.fillId);
        inst.ready = true;
        applyScene(inst, sceneId, sceneIndex);
        if (inst.pending) {
          applyScene(inst, inst.pending.sceneId, inst.pending.sceneIndex);
          inst.pending = null;
        }
      });

      map.on("error", (e) => {
        // tile errors for private rasters without proxy — non-fatal
        if (e && e.error) {
          const msg = String(e.error.message || e.error);
          if (/mlambrechts|tile/i.test(msg)) {
            console.warn("[hazard-map]", msg);
          }
        }
      });
    };
    start();

    async function updateSceneApi(opts = {}) {
      const sid = opts.sceneId != null ? opts.sceneId : sceneId;
      const sidx = opts.sceneIndex != null ? opts.sceneIndex : sceneIndex;
      if (!inst.map) {
        inst.pending = { sceneId: sid, sceneIndex: sidx };
        return;
      }
      const next = parseSceneId(sid, inst.hazardKey, sidx);
      const wantSat = next.mode === "sat";
      const curSat = inst.basemap === "satellite";
      if (wantSat !== curSat) {
        await setBasemapStyle(inst, wantSat ? "sat" : "vec");
      }
      applyScene(inst, sid, sidx);
    }

    const api = {
      updateScene: updateSceneApi,
      destroy() {
        try {
          if (inst.map) inst.map.remove();
        } catch (_) {}
        INSTANCES.delete(container);
        container.innerHTML = "";
      },
      get scene() {
        return inst.current;
      },
      get proxyOk() {
        return inst.proxyOk;
      },
    };
    inst.api = api;
    INSTANCES.set(container, inst);
    return api;
  }

  function updateScene(container, opts = {}) {
    const inst = INSTANCES.get(container);
    if (!inst) return;
    return inst.api.updateScene(opts);
  }

  global.AtlasHazardExposureMap = {
    HAZARDS,
    DEFAULT_SCENES,
    parseSceneId,
    mount,
    updateScene,
    seriesFromRows: rowsToMap,
    version: "1.1.0",
  };
})(typeof window !== "undefined" ? window : globalThis);
