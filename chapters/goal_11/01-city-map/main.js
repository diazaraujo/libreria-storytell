/**
 * city_map — world city points by population (canvas)
 * Library: city-points-map
 */
window.AtlasReplica = {
  ready: true,
  isStub: false,
  _api: null,
  _cities: null,
  _values: null,
  _loading: null,

  async render(scene, ctx) {
    const { chartEl, hidePlaceholder, sceneIndex } = ctx;
    hidePlaceholder();
    const ph = document.getElementById("placeholder");
    if (ph) {
      ph.hidden = true;
      ph.style.display = "none";
    }
    if (typeof AtlasCityPointsMap === "undefined") {
      chartEl.innerHTML =
        '<div style="padding:24px;color:#aa0000">Missing AtlasCityPointsMap</div>';
      return;
    }
    if (!this._cities) {
      if (!this._loading) {
        this._loading = Promise.all([
          AtlasLoad.csv("./data/city_ids.csv"),
          AtlasLoad.csv("./data/city_values.csv"),
        ]).then(([ids, vals]) => {
          this._cities = ids;
          this._values = vals;
        });
      }
      await this._loading;
    }
    const h = Math.max(440, chartEl.clientHeight || 480);
    if (!this._api) {
      this._api = AtlasCityPointsMap.mount(chartEl, {
        cities: this._cities,
        values: this._values,
        sceneIndex: sceneIndex || 0,
        height: h,
      });
    } else {
      this._api.setScene(sceneIndex || 0);
    }
  },
};
