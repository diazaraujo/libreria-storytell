/**
 * slum_waffle — dual-year people-in-slums unit chart
 */
window.AtlasReplica = {
  ready: true,
  isStub: false,
  _api: null,
  _rows: null,
  _loading: null,

  async render(scene, ctx) {
    const { chartEl, hidePlaceholder, sceneIndex } = ctx;
    hidePlaceholder();
    const ph = document.getElementById("placeholder");
    if (ph) {
      ph.hidden = true;
      ph.style.display = "none";
    }

    if (typeof AtlasSlumPopWaffle === "undefined") {
      chartEl.innerHTML =
        '<div style="padding:24px;color:#aa0000">Missing AtlasSlumPopWaffle</div>';
      return;
    }

    if (!this._rows) {
      if (!this._loading) {
        this._loading = AtlasLoad.csv("./data/11_data_slum_waffle.csv").then(
          (r) => {
            this._rows = r;
          }
        );
      }
      await this._loading;
    }

    const h = Math.max(400, chartEl.clientHeight || 440);
    if (!this._api) {
      this._api = AtlasSlumPopWaffle.mount(chartEl, {
        rows: this._rows,
        sceneIndex: sceneIndex || 0,
        height: h,
      });
    } else {
      this._api.setScene(sceneIndex || 0);
    }
  },
};
