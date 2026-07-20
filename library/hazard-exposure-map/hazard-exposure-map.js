/**
 * AtlasHazardExposureMap
 * Climate hazard exposure scroller (goal_13) — Mapbox country choropleth + camera.
 *
 * RE: atlas-global-development chunks/BmkL22Hm.js
 * Scene ids: {floods|drought|cyclones|heatwave}__{sat|vec}__{wld|bbox|bbox1}
 *
 * Mount once; updateScene on scroll. Never remount.
 * Depends: mapboxgl + ATLAS_MAPBOX_TOKEN (library/nightlights-hexmap/mapbox-config.js)
 */
(function (global) {
  const INSTANCES = new WeakMap();

  const HAZARDS = {
    floods: {
      field: "sha_flood",
      label: "Floods",
      units: "% of population exposed",
      // light → mid → dark (Atlas: rgb(195,227,245), seqB3, seqB5)
      ramp: ["#c3e3f5", "#089BD4", "#023B6F"],
      accent: "#34A7F2",
      bbox: [2.666, 50.626, 8.201, 53.757],
    },
    drought: {
      field: "sha_drought",
      label: "Agricultural drought",
      units: "% of population exposed",
      ramp: ["#FDF7DB", "#BE792B", "#5C0000"],
      accent: "#FF9800",
      bbox: [9.668, -36.739, 41.66, -14.86],
    },
    cyclones: {
      field: "sha_cyclone",
      label: "Cyclones",
      units: "% of population exposed",
      ramp: ["#FFE2FF", "#A37ACD", "#2F1E9C"],
      accent: "#664AB6",
      bbox: [-99.272, 7.493, -59.0186, 32.101],
    },
    heatwave: {
      field: "sha_heatwave",
      label: "Heatwaves",
      units: "% of population exposed",
      ramp: ["#FDF7DB", "#ECB63A", "#C1261A"],
      accent: "#AA0000",
      bbox: [60, 6.5, 120, 45.5],
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

  function token() {
    return global.ATLAS_MAPBOX_TOKEN || global.ATLAS_MAPBOX_DATA_TOKEN || "";
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

  /** Atlas-like step expression on match of ISO → value */
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

  /**
   * step colors: nodata transparent-ish, 0 grey100, then ramp breakpoints 1,10,20,30,40
   * Matches BmkL22Hm step paint structure.
   */
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
    const mute = [
      "road-primary",
      "road-secondary-tertiary",
      "road-street",
      "road-minor",
      "road-label",
      "building",
      "poi-label",
      "transit-label",
    ];
    mute.forEach((id) => {
      if (!map.getLayer(id)) return;
      try {
        const t = map.getLayer(id).type;
        if (t === "symbol") map.setLayoutProperty(id, "visibility", "none");
        else map.setPaintProperty(id, `${t}-opacity`, 0.06);
      } catch (_) {}
    });
  }

  function fitBbox(map, bbox, isMobile, duration) {
    // bbox is [west, south, east, north]
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

  function ensureLayers(map, sourceId, fillId, lineId) {
    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: "vector",
        url: "mapbox://mapbox.country-boundaries-v1",
      });
    }
    if (!map.getLayer(fillId)) {
      const beforeId = map.getStyle().layers?.find((l) =>
        /label|place|country/i.test(l.id)
      )?.id;
      map.addLayer(
        {
          id: fillId,
          type: "fill",
          source: sourceId,
          "source-layer": "country_boundaries",
          filter: WORLDVIEW_FILTER,
          paint: {
            "fill-color": "#1a2744",
            "fill-opacity": 0.85,
          },
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

  function applyScene(inst, sceneId, sceneIndex) {
    const { map, byIso, hazardKey, header, legend, isMobile, fillId, lineId } =
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

    // Header
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
              ? "Satellite · regional focus"
              : "Satellite · global context"
            : "Share of population exposed by economy";
      }
      if (meta) {
        meta.textContent =
          parsed.mode === "vec"
            ? `${n} economies · ${hz.units}`
            : "Hazard geography (Atlas camera path)";
      }
    }

    // Legend gradient
    if (legend) {
      const grad = legend.querySelector(".hm-grad");
      if (grad) {
        grad.style.background = `linear-gradient(90deg,${hz.ramp[0]},${hz.ramp[1]},${hz.ramp[2]})`;
      }
      legend.style.opacity = parsed.mode === "vec" ? "1" : "0.35";
    }

    // Choropleth only meaningful on vec; sat keeps outline, fill near transparent
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
        map.setPaintProperty(fillId, "fill-color", "rgba(15,23,42,0.08)");
        map.setPaintProperty(fillId, "fill-opacity", 0.15);
      }
    }
    if (map.getLayer(lineId)) {
      map.setPaintProperty(
        lineId,
        "line-opacity",
        parsed.mode === "vec" ? 0.5 : 0.25
      );
      map.setPaintProperty(
        lineId,
        "line-color",
        parsed.mode === "sat" ? "#e2e8f0" : "#94a3b8"
      );
    }

    // Camera
    if (parsed.isBbox) {
      fitBbox(map, hz.bbox, isMobile, 1000);
    } else {
      fitWorld(map, isMobile, 850);
    }

    inst.current = parsed;
  }

  function setBasemapStyle(inst, mode) {
    // Style swap is expensive; prefer paint-only. Satellite uses setStyle only when mode changes.
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
        ensureLayers(inst.map, inst.sourceId, inst.fillId, inst.lineId);
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

    const tk = token();
    if (!tk || /YOUR_MAPBOX/.test(tk)) {
      container.innerHTML =
        '<div style="padding:24px;color:#aa0000;font:14px Open Sans,system-ui">Mapbox token missing. Copy library/nightlights-hexmap/mapbox-config.example.js → mapbox-config.js</div>';
      return { updateScene() {}, destroy() {} };
    }
    global.mapboxgl.accessToken = tk;

    const byIso = rowsToMap(rows);
    const parsed0 = parseSceneId(sceneId, hazardKey, sceneIndex);
    const initialSat = parsed0.mode === "sat";

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
      <div class="hm-sub" style="font-size:12px;color:#94a3b8;margin-top:4px">Share of population exposed</div>
      <div class="hm-meta" style="font-size:11px;color:#64748b;margin-top:6px"></div>`;
    root.appendChild(header);

    const legend = document.createElement("div");
    legend.className = "hm-legend";
    legend.style.cssText =
      "position:absolute;z-index:2;right:12px;bottom:28px;padding:8px 10px;background:rgba(15,23,42,0.92);color:#cbd5e1;font-size:11px;font-weight:600;transition:opacity .35s";
    legend.innerHTML = `
      <div style="margin-bottom:6px">Population exposed</div>
      <div style="display:flex;align-items:center;gap:6px">
        <span>low</span>
        <span class="hm-grad" style="display:inline-block;width:96px;height:8px;border-radius:2px;background:linear-gradient(90deg,${hz0.ramp.join(",")})"></span>
        <span>high</span>
      </div>`;
    root.appendChild(legend);

    const mapEl = document.createElement("div");
    mapEl.style.cssText = "position:absolute;inset:0";
    root.appendChild(mapEl);

    const isMobile = (container.clientWidth || global.innerWidth) < 640;
    const styleUrl = initialSat
      ? "mapbox://styles/mapbox/satellite-v9"
      : "mapbox://styles/mapbox/dark-v11";

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
    });
    if (!isMobile) {
      map.addControl(
        new global.mapboxgl.NavigationControl({ showCompass: false }),
        "top-right"
      );
    }

    const sourceId = "countries";
    const fillId = "hazard-countries-fill";
    const lineId = "hazard-countries-line";

    const inst = {
      map,
      byIso,
      hazardKey,
      header,
      legend,
      isMobile,
      sourceId,
      fillId,
      lineId,
      ready: false,
      basemap: initialSat ? "satellite" : "vector",
      pending: null,
      current: null,
      root,
      api: null,
    };

    map.on("load", () => {
      if (!initialSat) muteBasemap(map);
      ensureLayers(map, sourceId, fillId, lineId);
      inst.ready = true;
      applyScene(inst, sceneId, sceneIndex);
      if (inst.pending) {
        applyScene(inst, inst.pending.sceneId, inst.pending.sceneIndex);
        inst.pending = null;
      }
    });

    async function updateSceneApi(opts = {}) {
      const sid = opts.sceneId != null ? opts.sceneId : sceneId;
      const sidx = opts.sceneIndex != null ? opts.sceneIndex : sceneIndex;
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
          map.remove();
        } catch (_) {}
        INSTANCES.delete(container);
        container.innerHTML = "";
      },
      get scene() {
        return inst.current;
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
  };
})(typeof window !== "undefined" ? window : globalThis);
