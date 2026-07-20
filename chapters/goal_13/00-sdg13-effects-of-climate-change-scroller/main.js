/**
 * sdg13_effects_of_climate_change_scroller — FLOODS
 * Library: hazard-exposure-map (RE BmkL22Hm.js)
 * Scenes: floods__sat__wld → floods__sat__bbox1 → floods__vec__wld
 * CRITICAL: mount once, updateScene on change.
 */
window.AtlasReplica = {
  ready: true,
  isStub: false,
  _api: null,
  _loading: null,
  _rows: null,
  hazard: "floods",

  async render(scene, ctx) {
    const { chartEl, hidePlaceholder, sceneIndex } = ctx;
    hidePlaceholder();
    const ph = document.getElementById("placeholder");
    if (ph) {
      ph.hidden = true;
      ph.style.display = "none";
    }

    if (typeof AtlasHazardExposureMap === "undefined") {
      chartEl.innerHTML =
        '<div style="padding:24px;color:#aa0000">Missing AtlasHazardExposureMap — load library/hazard-exposure-map/hazard-exposure-map.js</div>';
      return;
    }

    if (!this._rows) {
      if (!this._loading) {
        this._loading = AtlasLoad.csv(
          "./data/20260130_hazard_data_prepared.csv"
        ).then((rows) => {
          this._rows = rows;
        });
      }
      await this._loading;
    }

    const sceneId = (scene && scene.id) || null;
    const h = Math.max(420, chartEl.clientHeight || 480);

    if (!this._api) {
      this._api = AtlasHazardExposureMap.mount(chartEl, {
        rows: this._rows,
        hazard: this.hazard,
        sceneId,
        sceneIndex: sceneIndex || 0,
        height: h,
      });
    } else {
      await this._api.updateScene({ sceneId, sceneIndex: sceneIndex || 0 });
    }
  },
};
