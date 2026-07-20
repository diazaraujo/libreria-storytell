/**
 * skill_violin — specialization beeswarm by skill × urban/rural
 * Library: urban-skill-swarm (quality rewrite, was auto-bulk)
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
    document.getElementById("placeholder")?.setAttribute("hidden", "");
    const ph = document.getElementById("placeholder");
    if (ph) ph.style.display = "none";

    if (typeof AtlasUrbanSkillSwarm === "undefined") {
      chartEl.innerHTML =
        '<div style="padding:24px;color:#aa0000">Missing AtlasUrbanSkillSwarm</div>';
      return;
    }

    if (!this._rows) {
      if (!this._loading) {
        this._loading = AtlasLoad.csv("./data/countries.csv").then((r) => {
          this._rows = r;
        });
      }
      await this._loading;
    }

    const h = Math.max(420, chartEl.clientHeight || 460);
    if (!this._api) {
      this._api = AtlasUrbanSkillSwarm.mount(chartEl, {
        rows: this._rows,
        sceneIndex: sceneIndex || 0,
        highlightIso: "IDN",
        mode: "skill",
        height: h,
      });
    } else {
      this._api.setScene(sceneIndex || 0);
    }
  },
};
