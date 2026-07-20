/**
 * skill_violin_groups — occupation specialization beeswarm
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

    if (typeof AtlasUrbanSkillSwarm === "undefined") {
      chartEl.innerHTML =
        '<div style="padding:24px;color:#aa0000">Missing AtlasUrbanSkillSwarm</div>';
      return;
    }

    if (!this._rows) {
      if (!this._loading) {
        this._loading = AtlasLoad.csv("./data/11_data_skill_violin.csv").then(
          (r) => {
            this._rows = r;
          }
        );
      }
      await this._loading;
    }

    const h = Math.max(420, chartEl.clientHeight || 460);
    const cfg = window.ATLAS_CONFIG || {};
    const labels = {};
    Object.keys(cfg).forEach((k) => {
      if (k.startsWith("label_OCU_")) labels[k.replace(/^label_/, "")] = cfg[k];
    });
    // also support label_OCU_ISCO08_n keys already matching skill codes
    Object.keys(cfg).forEach((k) => {
      if (k.startsWith("label_") && k.includes("ISCO")) {
        labels[k.slice("label_".length)] = cfg[k];
      }
    });

    if (!this._api) {
      this._api = AtlasUrbanSkillSwarm.mount(chartEl, {
        rows: this._rows,
        sceneIndex: sceneIndex || 0,
        mode: "occupation",
        labels,
        height: h,
      });
    } else {
      this._api.setScene(sceneIndex || 0);
    }
  },
};
