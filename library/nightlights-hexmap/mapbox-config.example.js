/**
 * Copy to mapbox-config.js and fill tokens (mapbox-config.js is gitignored).
 *
 *   cp mapbox-config.example.js mapbox-config.js
 *
 * Proxy for private Atlas tilesets (mlambrechts.*):
 *   python3 mapbox-proxy.py   # :8790
 */
window.ATLAS_MAPBOX_TOKEN =
  window.ATLAS_MAPBOX_TOKEN ||
  "pk.YOUR_MAPBOX_PUBLIC_TOKEN";

// Optional: Atlas data token for mapbox://mlambrechts.* (from Atlas client bundle)
window.ATLAS_MAPBOX_DATA_TOKEN =
  window.ATLAS_MAPBOX_DATA_TOKEN ||
  window.ATLAS_MAPBOX_TOKEN;

window.ATLAS_MAPBOX_PROXY =
  window.ATLAS_MAPBOX_PROXY || "http://127.0.0.1:8790";

window.ATLAS_HEXMAP_ORIGIN_TILES =
  window.ATLAS_HEXMAP_ORIGIN_TILES !== false;
