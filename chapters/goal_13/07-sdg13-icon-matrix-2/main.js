/**
 * sdg13_icon_matrix (variant) — BFA/KEN · PHL/VNM mono compares
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

    if (typeof AtlasClimateIconMatrix === "undefined") {
      chartEl.innerHTML =
        '<div style="padding:24px;color:#aa0000">Missing AtlasClimateIconMatrix</div>';
      return;
    }

    if (!this._rows) {
      if (!this._loading) {
        this._loading = (async () => {
          try {
            this._rows = await AtlasLoad.csv("./data/2024_noimp.csv");
          } catch (_) {
            this._rows = await AtlasLoad.csv("./data/2010.csv");
          }
        })();
      }
      await this._loading;
    }

    const sceneId = (scene && scene.id) || null;
    const h = Math.max(420, chartEl.clientHeight || 460);

    if (!this._api) {
      this._api = AtlasClimateIconMatrix.mount(chartEl, {
        rows: this._rows,
        sceneIndex: sceneIndex || 0,
        sceneId,
        mode: "compare",
        height: h,
      });
    } else {
      this._api.setScene({
        sceneIndex: sceneIndex || 0,
        sceneId,
        mode: "compare",
      });
    }
  },
};
