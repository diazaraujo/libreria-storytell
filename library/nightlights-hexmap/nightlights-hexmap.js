/**
 * AtlasNightlightsHexmap v0.9 — origin vector tiles residual close
 *
 * Primary path (originTiles): exact Mapbox sources from HexMapNigeria /
 * HexMapEthiopia via local proxy (Referer bypass for URL restrictions):
 *   NG hex   mapbox://mlambrechts.u2grslzw  · NGA-hex-data.zip-pwpaefcg
 *   Urban    mapbox://mlambrechts.9ybjbhr1  · urban_centers_africa
 *   ET hex   mapbox://mlambrechts.rxtvtmrq  · ETH-hex-data.zip-8hrun6xw
 *   Grid     mapbox://mlambrechts.c02hylmk  · electricity_grid_africa-8rd41z
 *
 * Fallback: H3 geojson (hexUrl) when originTiles false or proxy down.
 *
 * Map: Standard monochrome · slot middle · opacity scene switch (qsNowIZD)
 */
(function (global) {
  const INSTANCES = new WeakMap();

  const SEQ = {
    1: "#FDF6DB",
    2: "#A1CBCF",
    3: "#5D99C2",
    4: "#2868A0",
    5: "#023B6F",
  };
  const GREY200 = "#CED4DE";
  const GREY300 = "#8a969f";
  const GREY500 = "#111111";
  const INFRA = "#eb5757";
  const WB_BLUE = "#0071bc";

  // Origin highlight filter (exact props on tileset)
  const HIGHLIGHT_FILTER = [
    "all",
    ["==", ["get", "nghtlgh"], 483],
    ["==", ["get", "rural"], 23],
    ["==", ["get", "pop"], 108836],
  ];
  // Fallback if tiles use slightly different floats
  const HIGHLIGHT_HEX = "86580a4dfffffff";

  const NG_HEX_URL = "mapbox://mlambrechts.u2grslzw";
  const NG_HEX_LAYER = "NGA-hex-data.zip-pwpaefcg";
  const URBAN_URL = "mapbox://mlambrechts.9ybjbhr1";
  const URBAN_LAYER = "urban_centers_africa";
  const ET_HEX_URL = "mapbox://mlambrechts.rxtvtmrq";
  const ET_HEX_LAYER = "ETH-hex-data.zip-8hrun6xw";
  const GRID_URL = "mapbox://mlambrechts.c02hylmk";
  const GRID_LAYER = "electricity_grid_africa-8rd41z";

  const NG_BOUNDS = [
    [2.5, 4],
    [15, 14],
  ];
  const KANO_BOUNDS = [
    [8, 11.5],
    [9, 12.5],
  ];
  const CELL_BOUNDS = [
    [8.5, 11.835],
    [8.6, 11.935],
  ];
  const ET_BOUNDS = [
    [33, 3.3],
    [48, 15],
  ];
  const ET_SE_BOUNDS = [
    [38, 3.3],
    [45, 8],
  ];

  const FILTER_URBAN = ["<", ["get", "rural"], 70];
  const FILTER_URBAN_DARK = [
    "all",
    ["<", ["get", "nghtlgh"], 500],
    ["<", ["get", "rural"], 70],
  ];
  const FILTER_RURAL = [">", ["get", "rural"], 70];

  const LAYER_OPACITY = {
    "zones-fill": { prop: "fill-opacity", on: 0.8 },
    "zones-line": { prop: "line-opacity", on: 1 },
    "hex-fill": { prop: "fill-opacity", on: 1 },
    "hex-fill12": { prop: "fill-opacity", on: 1 },
    "hex-fill23": { prop: "fill-opacity", on: 1 },
    "hex-pop": { prop: "fill-opacity", on: 1 },
    "hex-pop-soft": { prop: "fill-opacity", on: 0.3 },
    "hex-line": { prop: "line-opacity", on: 1 },
    "urban-areas": { prop: "fill-opacity", on: 1 },
    "urban-areas-line": { prop: "line-opacity", on: 1 },
    highlight: { prop: "line-opacity", on: 1 },
    "power-lines": { prop: "line-opacity", on: 0.7 },
    labels: { prop: "text-opacity", on: 1 },
    "labels-hi": { prop: "text-opacity", on: 1 },
  };

  const NIGERIA_SCENES = [
    {
      id: "zones",
      layers: ["zones-fill", "zones-line", "labels"],
      bounds: NG_BOUNDS,
      legend: "zones",
    },
    {
      id: "nightlights",
      layers: ["hex-fill", "labels"],
      bounds: NG_BOUNDS,
      legend: "ntl",
    },
    {
      id: "nightlights_cities",
      layers: ["hex-fill", "labels-hi"],
      bounds: NG_BOUNDS,
      legend: "ntl",
    },
    {
      id: "nightlights_urban",
      layers: ["hex-line", "hex-fill", "labels"],
      bounds: NG_BOUNDS,
      legend: "ntl",
      filter: FILTER_URBAN,
    },
    {
      id: "zoom_kano",
      layers: ["hex-line", "hex-fill", "urban-areas", "urban-areas-line", "labels"],
      bounds: KANO_BOUNDS,
      legend: "ntl",
      filter: FILTER_URBAN,
    },
    {
      id: "urban_dark",
      layers: ["hex-line", "hex-fill", "urban-areas", "urban-areas-line", "labels"],
      bounds: KANO_BOUNDS,
      legend: "ntl",
      filter: FILTER_URBAN_DARK,
    },
    {
      id: "urban_population_dark",
      layers: ["hex-line", "hex-pop", "urban-areas", "urban-areas-line", "labels"],
      bounds: KANO_BOUNDS,
      legend: "pop",
      filter: FILTER_URBAN_DARK,
    },
    {
      id: "kano_cell_highlight",
      layers: [
        "hex-line",
        "hex-pop-soft",
        "urban-areas",
        "urban-areas-line",
        "highlight",
        "labels",
      ],
      bounds: CELL_BOUNDS,
      legend: "pop",
      filter: FILTER_URBAN_DARK,
    },
  ];

  const ETHIOPIA_SCENES = [
    {
      id: "nightlights12",
      layers: ["hex-line", "hex-fill12", "labels"],
      bounds: ET_BOUNDS,
      legend: "etl12",
      filter: FILTER_RURAL,
    },
    {
      id: "nightlights12_powerlines",
      layers: ["hex-line", "hex-fill12", "power-lines", "labels"],
      bounds: ET_BOUNDS,
      legend: "etl12_grid",
      filter: FILTER_RURAL,
    },
    {
      id: "nightlights12_se",
      layers: ["hex-line", "hex-fill12", "power-lines", "labels"],
      bounds: ET_SE_BOUNDS,
      legend: "etl12_grid",
      filter: FILTER_RURAL,
    },
    {
      id: "nightlights23",
      layers: ["hex-line", "hex-fill23", "power-lines", "labels"],
      bounds: ET_SE_BOUNDS,
      legend: "etl23_grid",
      filter: FILTER_RURAL,
    },
  ];

  const ETH_CITIES = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { name: "Awasa" },
        geometry: { type: "Point", coordinates: [38.4769986, 7.0599961] },
      },
      {
        type: "Feature",
        properties: { name: "Shashemene" },
        geometry: { type: "Point", coordinates: [38.590037, 7.200399] },
      },
      {
        type: "Feature",
        properties: { name: "Jijiga" },
        geometry: { type: "Point", coordinates: [42.7899873, 9.3504228] },
      },
      {
        type: "Feature",
        properties: { name: "Bahir Dar" },
        geometry: { type: "Point", coordinates: [37.3832889, 11.6000529] },
      },
      {
        type: "Feature",
        properties: { name: "Dire Dawa" },
        geometry: { type: "Point", coordinates: [41.8600183, 9.5899947] },
      },
      {
        type: "Feature",
        properties: { name: "Addis Ababa" },
        geometry: { type: "Point", coordinates: [38.6980586, 9.0352562] },
      },
      {
        type: "Feature",
        properties: { name: "Bishoftu" },
        geometry: { type: "Point", coordinates: [38.9745, 8.7487] },
      },
      {
        type: "Feature",
        properties: { name: "Adama" },
        geometry: { type: "Point", coordinates: [39.265, 8.528] },
      },
    ],
  };

  const BASEMAP_CONFIG = {
    showPedestrianRoads: false,
    showPlaceLabels: false,
    showPointOfInterestLabels: false,
    fuelingStationModePointOfInterestLabels: "none",
    showRoadLabels: false,
    showTransitLabels: false,
    showAdminBoundaries: false,
    show3dObjects: false,
    showLandmarkIconLabels: false,
    theme: "monochrome",
  };

  function ensureMap() {
    const m = global.maplibregl || global.mapboxgl;
    if (!m) throw new Error("Need mapbox-gl before nightlights-hexmap");
    return m;
  }

  function legendHTML(kind) {
    if (kind === "zones") {
      return `<div class="leg-title">Access to electricity</div>
        <div class="leg-bar" style="background:linear-gradient(90deg,${SEQ[1]},${SEQ[2]},${SEQ[3]},${SEQ[4]},${SEQ[5]})"></div>
        <div class="leg-ticks"><span>25</span><span>50</span><span>75</span></div>`;
    }
    if (kind === "ntl") {
      return `<div class="leg-title">Night lights 2024</div>
        <div class="leg-inline">
          <span class="leg-row"><i style="background:#ffea46"></i>Bright</span>
          <span class="leg-row"><i style="background:#8b7c55"></i>Weak</span>
          <span class="leg-row"><i style="background:#00204d"></i>Dark</span>
        </div>`;
    }
    if (
      kind === "etl12" ||
      kind === "etl23" ||
      kind === "etl12_grid" ||
      kind === "etl23_grid"
    ) {
      const y = kind.includes("23") ? "2023" : "2012";
      const grid = kind.includes("grid")
        ? `<div class="leg-title" style="margin-top:6px;font-weight:700">Power lines</div>
            <div class="leg-inline">
              <span class="leg-row"><i class="leg-line" style="background:${INFRA}"></i>Existing</span>
              <span class="leg-row"><i class="leg-line leg-dash"></i>Planned</span>
            </div>`
        : "";
      return `<div class="leg-title">Night lights in ${y}</div>
        <div class="leg-inline">
          <span class="leg-row"><i style="background:#95c4f3"></i>Some level of night lights</span>
          <span class="leg-row"><i style="background:#00204d"></i>Dark</span>
        </div>${grid}`;
    }
    if (kind === "pop") {
      return `<div class="leg-title">Population</div>
        <div class="leg-bar" style="background:linear-gradient(90deg,#f3e8f0,#b06aa0,#6e0046)"></div>
        <div class="leg-ticks"><span>0</span><span>50k</span><span>100k+</span></div>`;
    }
    return "";
  }

  function makeHatchImage() {
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, size, size);
    ctx.strokeStyle = GREY300;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = -size; i < size * 2; i += 8) {
      ctx.moveTo(i, 0);
      ctx.lineTo(i + size, size);
    }
    ctx.stroke();
    return ctx.getImageData(0, 0, size, size);
  }

  async function loadJSON(url) {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`Failed ${url}: ${r.status}`);
    return r.json();
  }

  async function probeProxy(proxyBase) {
    if (!proxyBase) return false;
    try {
      const r = await fetch(proxyBase.replace(/\/$/, "") + "/health", {
        cache: "no-store",
      });
      if (!r.ok) return false;
      const j = await r.json();
      return !!j.ok;
    } catch (_) {
      return false;
    }
  }

  function makeTransformRequest(proxyBase, dataToken) {
    const base = proxyBase.replace(/\/$/, "");
    return function transformRequest(url) {
      // Only private Atlas tilesets need Referer bypass — fonts/styles go direct
      if (typeof url === "string" && /mlambrechts\./i.test(url)) {
        let u = url;
        // Prefer data token on tileset requests (account that owns mlambrechts.*)
        if (dataToken && /access_token=/.test(u)) {
          u = u.replace(/access_token=[^&]+/, "access_token=" + encodeURIComponent(dataToken));
        } else if (dataToken && !/access_token=/.test(u)) {
          u += (u.includes("?") ? "&" : "?") + "access_token=" + encodeURIComponent(dataToken);
        }
        return { url: base + "/?u=" + encodeURIComponent(u) };
      }
      return { url };
    };
  }

  function addLayerSafe(map, spec, useSlot) {
    const layer = { ...spec };
    if (useSlot) layer.slot = "middle";
    if (layer.type === "fill") {
      layer.paint = {
        ...layer.paint,
        "fill-opacity-transition": { duration: 1000 },
      };
    }
    if (layer.type === "line") {
      layer.paint = {
        ...layer.paint,
        "line-opacity-transition": { duration: 1000 },
      };
    }
    if (layer.type === "symbol") {
      layer.paint = {
        ...layer.paint,
        "text-opacity-transition": { duration: 1000 },
      };
    }
    map.addLayer(layer);
  }

  function mount(container, options = {}) {
    const maplibregl = ensureMap();
    const {
      country = "nigeria",
      sceneIndex = 0,
      hexUrl = null,
      zonesUrl = null,
      citiesUrl = null,
      gridUrl = null,
      token =
        global.ATLAS_MAPBOX_DATA_TOKEN ||
        global.ATLAS_MAPBOX_TOKEN ||
        "",
      basemapToken = global.ATLAS_MAPBOX_TOKEN || token,
      proxy = global.ATLAS_MAPBOX_PROXY || "http://127.0.0.1:8790",
      originTiles = global.ATLAS_HEXMAP_ORIGIN_TILES !== false,
      showBadge = options.showBadge === true, // demo only; hidden in chapters/story
      reuse = true,
      forceRemount = false,
      height: heightOpt = null,
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

    const scenes = country === "ethiopia" ? ETHIOPIA_SCENES : NIGERIA_SCENES;
    const h = heightOpt || Math.max(440, container.clientHeight || 520);

    container.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-hexmap atlas-hexmap-h3 atlas-chart-root";
    root.style.cssText = `position:relative;width:100%;height:${h}px;background:#fff;font-family:'Open Sans',system-ui,sans-serif`;
    container.appendChild(root);

    const style = document.createElement("style");
    style.textContent = `
      .atlas-hexmap .map-el { position:absolute; inset:0; }
      .atlas-hexmap .legend-container {
        min-width: min(350px, calc(100vw - 16px)); max-width: 480px;
        position: absolute; bottom: 20px; right: 50%;
        transform: translate(50%);
        background: #fffffff2; padding: 10px 20px;
        border-radius: 2px; box-shadow: 0 1px 3px #0000001f;
        border: 1px solid #CED4DE; z-index: 10;
        font-size: 12px; color: #111;
        display: flex; flex-direction: column; gap: 6px;
      }
      .atlas-hexmap .leg-title {
        font-weight: 700; text-align: center; font-size: 12px; margin-bottom: 2px;
      }
      .atlas-hexmap .leg-bar {
        height: 10px; border-radius: 1px; width: 100%;
      }
      .atlas-hexmap .leg-ticks {
        display: flex; justify-content: space-between;
        color: #57626a; font-size: 11px; font-weight: 600;
      }
      .atlas-hexmap .leg-row {
        display: inline-flex; align-items: center; gap: 6px; font-size: 12px;
      }
      .atlas-hexmap .leg-inline {
        display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;
      }
      .atlas-hexmap .leg-row i {
        width: 12px; height: 12px; display: inline-block; border-radius: 1px;
      }
      .atlas-hexmap .leg-row i.leg-line {
        width: 18px; height: 3px; border-radius: 1px;
      }
      .atlas-hexmap .leg-row i.leg-dash {
        background: repeating-linear-gradient(90deg, ${INFRA} 0 4px, transparent 4px 8px);
      }
      .atlas-hexmap .map-status {
        position:absolute; top: 10px; left: 10px; z-index: 5;
        background: #fff; padding: 6px 10px; font-size: 11px; color: #57626a;
        border-radius: 4px; border: 1px solid #e2e8f0;
      }
      .atlas-hexmap .mode-badge {
        position:absolute; top: 10px; right: 10px; z-index: 5;
        background: #081079; color: #fff; font-size: 10px; font-weight: 700;
        padding: 4px 8px; border-radius: 999px;
      }
    `;
    root.appendChild(style);

    const mapEl = document.createElement("div");
    mapEl.className = "map-el";
    root.appendChild(mapEl);
    const status = document.createElement("div");
    status.className = "map-status";
    status.textContent = "Loading map…";
    root.appendChild(status);
    const badge = document.createElement("div");
    badge.className = "mode-badge";
    badge.textContent = "…";
    badge.style.display = showBadge ? "block" : "none";
    root.appendChild(badge);
    const legend = document.createElement("div");
    legend.className = "legend-container";
    root.appendChild(legend);

    let map = null;
    let ready = false;
    let current = sceneIndex;
    let useSlot = false;
    let mode = "geojson";
    const layerIds = [];

    function setLayerOpacity(id, on, instant) {
      if (!map.getLayer(id)) return;
      const meta = LAYER_OPACITY[id];
      if (!meta) return;
      const val = on ? meta.on : 0;
      try {
        map.setPaintProperty(id, `${meta.prop}-transition`, {
          duration: instant ? 0 : 1000,
        });
        map.setPaintProperty(id, meta.prop, val);
      } catch (_) {}
    }

    function setScene(idx, { animate = true } = {}) {
      const i = Math.max(0, Math.min(scenes.length - 1, idx | 0));
      current = i;
      const sc = scenes[i];
      legend.innerHTML = legendHTML(sc.legend);
      if (!ready || !map) return;

      const want = new Set(sc.layers);
      layerIds.forEach((id) => setLayerOpacity(id, want.has(id), !animate));

      ["hex-fill", "hex-fill12", "hex-fill23", "hex-pop", "hex-pop-soft"].forEach(
        (id) => {
          if (map.getLayer(id)) map.setFilter(id, sc.filter || null);
        }
      );

      const b = sc.bounds;
      map.fitBounds(
        [
          [b[0][0], b[0][1]],
          [b[1][0], b[1][1]],
        ],
        {
          padding: { top: 24, bottom: 60, left: 24, right: 24 },
          duration: animate ? 850 : 0,
        }
      );
    }

    const api = {
      root,
      updateScene(i, opts) {
        setScene(i, opts);
      },
      setScene,
      destroy() {
        if (map) {
          try {
            map.remove();
          } catch (_) {}
          map = null;
        }
        INSTANCES.delete(container);
        container.innerHTML = "";
      },
      get sceneIndex() {
        return current;
      },
      get nScenes() {
        return scenes.length;
      },
      get map() {
        return map;
      },
      get mode() {
        return mode;
      },
    };

    (async () => {
      try {
        const proxyOk = originTiles && token && (await probeProxy(proxy));
        mode = proxyOk ? "origin-tiles" : "geojson";
        badge.textContent =
          mode === "origin-tiles" ? "origin tiles" : "H3 geojson";
        status.textContent =
          mode === "origin-tiles"
            ? "Loading Atlas tilesets…"
            : "Loading H3 geojson…";

        if (mode === "geojson" && !hexUrl) {
          throw new Error(
            "origin tiles unavailable (start mapbox-proxy.py) and no hexUrl"
          );
        }

        const [zones, cities, gridFallback, hexFallback] = await Promise.all([
          zonesUrl ? loadJSON(zonesUrl) : null,
          citiesUrl ? loadJSON(citiesUrl) : null,
          mode === "geojson" && gridUrl ? loadJSON(gridUrl) : null,
          mode === "geojson" ? loadJSON(hexUrl) : null,
        ]);

        const labels =
          cities ||
          (country === "ethiopia"
            ? ETH_CITIES
            : { type: "FeatureCollection", features: [] });

        const hi = {
          type: "FeatureCollection",
          features: (labels.features || []).filter((f) =>
            ["Lagos", "Port Harcourt", "Abuja"].includes(f.properties?.name)
          ),
        };

        const canStandard = !!(
          (basemapToken || token) &&
          global.mapboxgl
        );
        useSlot = canStandard;
        // Basemap uses user/public token; mlambrechts tiles get data token via transformRequest
        global.mapboxgl.accessToken = basemapToken || token;

        const mapOpts = {
          container: mapEl,
          center: country === "ethiopia" ? [40.5, 9] : [8.75, 9],
          zoom: 5.2,
          attributionControl: true,
          maxPitch: 0,
          projection: "mercator",
          transformRequest:
            mode === "origin-tiles"
              ? makeTransformRequest(proxy, token)
              : undefined,
        };

        if (canStandard) {
          mapOpts.style = "mapbox://styles/mapbox/standard";
          mapOpts.config = { basemap: { ...BASEMAP_CONFIG } };
        } else {
          mapOpts.style = {
            version: 8,
            sources: {
              carto: {
                type: "raster",
                tiles: [
                  "https://a.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}@2x.png",
                ],
                tileSize: 256,
                attribution: "© OSM © CARTO",
              },
            },
            layers: [{ id: "carto", type: "raster", source: "carto" }],
            glyphs:
              "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
          };
        }

        map = new maplibregl.Map(mapOpts);

        let built = false;
        const onReady = () => {
          if (built || !map) return;
          built = true;
          try {
            if (!map.hasImage("diagonalhatch")) {
              map.addImage("diagonalhatch", makeHatchImage(), {
                pixelRatio: 2,
              });
            }
          } catch (_) {}

          // --- sources ---
          if (mode === "origin-tiles") {
            if (country === "ethiopia") {
              map.addSource("hex", {
                type: "vector",
                url: ET_HEX_URL,
              });
              map.addSource("grid", {
                type: "vector",
                url: GRID_URL,
              });
            } else {
              map.addSource("hex", {
                type: "vector",
                url: NG_HEX_URL,
              });
              map.addSource("urban", {
                type: "vector",
                url: URBAN_URL,
              });
            }
          } else {
            map.addSource("hex", { type: "geojson", data: hexFallback });
            if (gridFallback)
              map.addSource("grid", { type: "geojson", data: gridFallback });
            // urban approx from dense cells
            const urbanFeats = (hexFallback.features || []).filter((f) => {
              const p = f.properties || {};
              return (p.rural == null || p.rural < 70) && (p.pop || 0) >= 12000;
            });
            map.addSource("urban", {
              type: "geojson",
              data: { type: "FeatureCollection", features: urbanFeats },
            });
          }

          if (zones) map.addSource("zones", { type: "geojson", data: zones });
          map.addSource("labels", { type: "geojson", data: labels });
          map.addSource("labels-hi", { type: "geojson", data: hi });

          const hexSrc =
            mode === "origin-tiles"
              ? {
                  source: "hex",
                  "source-layer":
                    country === "ethiopia" ? ET_HEX_LAYER : NG_HEX_LAYER,
                }
              : { source: "hex" };

          const urbanSrc =
            mode === "origin-tiles"
              ? { source: "urban", "source-layer": URBAN_LAYER }
              : { source: "urban" };

          const gridSrc =
            mode === "origin-tiles"
              ? { source: "grid", "source-layer": GRID_LAYER }
              : { source: "grid" };

          if (zones) {
            addLayerSafe(
              map,
              {
                id: "zones-fill",
                type: "fill",
                source: "zones",
                paint: {
                  "fill-color": [
                    "interpolate",
                    ["linear"],
                    ["get", "access"],
                    25,
                    SEQ[1],
                    37.5,
                    SEQ[2],
                    50,
                    SEQ[3],
                    62.5,
                    SEQ[4],
                    75,
                    SEQ[5],
                  ],
                  "fill-opacity": 0,
                },
              },
              useSlot
            );
            addLayerSafe(
              map,
              {
                id: "zones-line",
                type: "line",
                source: "zones",
                paint: {
                  "line-color": "#ffffff",
                  "line-width": 1,
                  "line-opacity": 0,
                },
              },
              useSlot
            );
            layerIds.push("zones-fill", "zones-line");
          }

          // Origin order: outlines under fills
          addLayerSafe(
            map,
            {
              id: "hex-line",
              type: "line",
              ...hexSrc,
              paint: {
                "line-color": GREY200,
                "line-width": 1,
                "line-opacity": 0,
              },
            },
            useSlot
          );

          addLayerSafe(
            map,
            {
              id: "hex-fill",
              type: "fill",
              ...hexSrc,
              paint: {
                "fill-color": [
                  "step",
                  ["get", "nghtlgh"],
                  "#00204d",
                  100,
                  "#8b7c55",
                  500,
                  "#ffea46",
                ],
                "fill-opacity": 0,
              },
            },
            useSlot
          );
          addLayerSafe(
            map,
            {
              id: "hex-fill12",
              type: "fill",
              ...hexSrc,
              paint: {
                "fill-color": [
                  "step",
                  ["get", "nghtl12"],
                  "#00204d",
                  100,
                  "#95c4f3",
                ],
                "fill-opacity": 0,
              },
            },
            useSlot
          );
          addLayerSafe(
            map,
            {
              id: "hex-fill23",
              type: "fill",
              ...hexSrc,
              paint: {
                "fill-color": [
                  "step",
                  ["get", "nghtl23"],
                  "#00204d",
                  100,
                  "#95c4f3",
                ],
                "fill-opacity": 0,
              },
            },
            useSlot
          );
          addLayerSafe(
            map,
            {
              id: "hex-pop",
              type: "fill",
              ...hexSrc,
              paint: {
                "fill-color": [
                  "interpolate",
                  ["linear"],
                  ["get", "pop"],
                  0,
                  "#f3e8f0",
                  25000,
                  "#d4a5c8",
                  50000,
                  "#b06aa0",
                  75000,
                  "#8a4080",
                  100000,
                  "#6e0046",
                ],
                "fill-opacity": 0,
              },
            },
            useSlot
          );
          addLayerSafe(
            map,
            {
              id: "hex-pop-soft",
              type: "fill",
              ...hexSrc,
              paint: {
                "fill-color": [
                  "interpolate",
                  ["linear"],
                  ["get", "pop"],
                  0,
                  "#f3e8f0",
                  25000,
                  "#d4a5c8",
                  50000,
                  "#b06aa0",
                  75000,
                  "#8a4080",
                  100000,
                  "#6e0046",
                ],
                "fill-opacity": 0,
              },
            },
            useSlot
          );

          // True GHSL urban centers when origin tiles
          if (map.getSource("urban")) {
            addLayerSafe(
              map,
              {
                id: "urban-areas",
                type: "fill",
                ...urbanSrc,
                paint: {
                  "fill-pattern": "diagonalhatch",
                  "fill-opacity": 0,
                },
              },
              useSlot
            );
            addLayerSafe(
              map,
              {
                id: "urban-areas-line",
                type: "line",
                ...urbanSrc,
                paint: {
                  "line-color": GREY500,
                  "line-width": 1,
                  "line-opacity": 0,
                },
              },
              useSlot
            );
          }

          // Origin highlight-cell filter on tileset props
          addLayerSafe(
            map,
            {
              id: "highlight",
              type: "line",
              ...hexSrc,
              filter:
                mode === "origin-tiles"
                  ? HIGHLIGHT_FILTER
                  : ["==", ["get", "hex_id"], HIGHLIGHT_HEX],
              paint: {
                "line-color": WB_BLUE,
                "line-width": 2,
                "line-opacity": 0,
              },
            },
            useSlot
          );

          if (map.getSource("grid")) {
            addLayerSafe(
              map,
              {
                id: "power-lines",
                type: "line",
                ...gridSrc,
                layout: { "line-join": "none", "line-cap": "round" },
                paint: {
                  "line-color": INFRA,
                  "line-width": [
                    "interpolate",
                    ["linear"],
                    ["coalesce", ["get", "voltage_kV"], 0],
                    0,
                    1,
                    765,
                    6,
                  ],
                  "line-opacity": 0,
                  "line-dasharray": [
                    "match",
                    ["get", "status"],
                    "Planned",
                    ["literal", [2, 2]],
                    ["literal", [1, 0]],
                  ],
                },
              },
              useSlot
            );
            layerIds.push("power-lines");
          }

          const labelFont = canStandard
            ? ["Open Sans Bold", "Arial Unicode MS Bold"]
            : ["Open Sans Regular", "Arial Unicode MS Regular"];

          addLayerSafe(
            map,
            {
              id: "labels",
              type: "symbol",
              source: "labels",
              layout: {
                "text-field": ["get", "name"],
                "text-size": 12,
                "text-font": labelFont,
                "text-anchor": "center",
                "text-allow-overlap": false,
              },
              paint: {
                "text-color": "#222222",
                "text-halo-color": "#ffffff",
                "text-halo-width": 1.5,
                "text-opacity": 0,
              },
            },
            useSlot
          );
          addLayerSafe(
            map,
            {
              id: "labels-hi",
              type: "symbol",
              source: "labels-hi",
              layout: {
                "text-field": ["get", "name"],
                "text-size": 14,
                "text-font": labelFont,
                "text-anchor": "center",
                "text-allow-overlap": true,
                "text-ignore-placement": true,
              },
              paint: {
                "text-color": "#ffffff",
                "text-halo-color": "#222222",
                "text-halo-width": 1.5,
                "text-opacity": 0,
              },
            },
            useSlot
          );

          layerIds.push(
            "hex-line",
            "hex-fill",
            "hex-fill12",
            "hex-fill23",
            "hex-pop",
            "hex-pop-soft",
            "urban-areas",
            "urban-areas-line",
            "highlight",
            "labels",
            "labels-hi"
          );

          ready = true;
          status.textContent = "";
          status.style.display = "none";
          setScene(sceneIndex, { animate: false });
        };

        map.once("style.load", onReady);
        map.on("load", () => {
          if (!built) onReady();
        });

        map.on("error", (e) => {
          // Non-fatal basemap/font noise (403) should not cover the chart
          const msg = e?.error?.message || "";
          console.warn("[hexmap]", msg || e);
          if (!ready && msg && !/403|Unauthorized|Failed to fetch/i.test(msg)) {
            status.textContent = msg;
            status.style.display = "block";
          }
        });
      } catch (err) {
        console.error(err);
        status.textContent = String(err.message || err);
      }
    })();

    INSTANCES.set(container, { api, setScene });
    return api;
  }

  global.AtlasNightlightsHexmap = {
    mount,
    version: "0.9.0",
    HIGHLIGHT_HEX,
    RES: 6,
  };
  global.AtlasLibrary = global.AtlasLibrary || {};
  global.AtlasLibrary.NightlightsHexmap = global.AtlasNightlightsHexmap;
})(typeof window !== "undefined" ? window : globalThis);
