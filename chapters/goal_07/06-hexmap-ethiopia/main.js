/**
 * hexmap_ethiopia — H3 res 6 + Space2Stats nightlights (MapLibre)
 */
window.AtlasReplica = {
  ready: true,
  isStub: false,
  _chart: null,

  async render(scene, ctx) {
    const { chartEl, hidePlaceholder, sceneIndex, animate } = ctx;
    hidePlaceholder();
    const ph = document.getElementById("placeholder");
    if (ph) { ph.hidden = true; ph.style.display = "none"; }

    if (typeof AtlasNightlightsHexmap === "undefined" || !(window.maplibregl || window.mapboxgl)) {
      chartEl.innerHTML = '<div style="padding:24px;color:#aa0000">Need MapLibre + nightlights-hexmap</div>';
      return;
    }

    const lib = "../../../library/nightlights-hexmap/data/";
    if (!this._chart || !chartEl.querySelector(".atlas-hexmap")) {
      this._chart = AtlasNightlightsHexmap.mount(chartEl, {
        country: "ethiopia",
        hexUrl: lib + "ethiopia_h3.geojson",
        gridUrl: lib + "ethiopia_grid.geojson",
        sceneIndex: sceneIndex || 0,
        forceRemount: true,
      });
    } else {
      this._chart.updateScene(sceneIndex || 0, { animate: animate !== false });
    }
  },
};
