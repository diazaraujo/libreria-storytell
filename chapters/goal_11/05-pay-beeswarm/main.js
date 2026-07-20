/**
 * pay_beeswarm — urban pay premium % beeswarm
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

    if (typeof AtlasUrbanPayBeeswarm === "undefined") {
      chartEl.innerHTML =
        '<div style="padding:24px;color:#aa0000">Missing AtlasUrbanPayBeeswarm</div>';
      return;
    }

    if (!this._rows) {
      if (!this._loading) {
        this._loading = AtlasLoad.csv("./data/11_data_pay_beeswarm.csv").then(
          (r) => {
            this._rows = r;
          }
        );
      }
      await this._loading;
    }

    const h = Math.max(400, chartEl.clientHeight || 440);
    if (!this._api) {
      this._api = AtlasUrbanPayBeeswarm.mount(chartEl, {
        rows: this._rows,
        sceneIndex: sceneIndex || 0,
        height: h,
      });
    } else {
      this._api.setScene(sceneIndex || 0);
    }
  },
};
