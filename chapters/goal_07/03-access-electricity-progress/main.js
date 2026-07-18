/**
 * access_electricity_progress
 * Uses library/progress-race (Atlas AccessElectricityProgress / Brmmsw6q)
 *
 * Mount once · updateScene — never remount (accessTween + CSS 2s).
 */
window.AtlasReplica = {
  ready: true,
  isStub: false,
  _chart: null,
  _rows: null,
  _loading: null,

  async render(scene, ctx) {
    const { chartEl, hidePlaceholder, sceneIndex, animate } = ctx;
    hidePlaceholder();
    const ph = document.getElementById("placeholder");
    if (ph) {
      ph.hidden = true;
      ph.style.display = "none";
    }

    if (typeof AtlasProgressRace === "undefined") {
      chartEl.innerHTML =
        '<div style="padding:24px;color:#aa0000">Missing AtlasProgressRace — load library/progress-race/progress-race.js</div>';
      return;
    }

    if (!this._rows) {
      if (!this._loading) {
        this._loading = AtlasLoad.csv(
          "./data/07_data_access_electricity_countries.csv"
        ).then((rows) => {
          this._rows = rows;
        });
      }
      await this._loading;
    }

    const labels = {
      progress_speed: "Speed of progress",
      regression: "regression",
      standstill: "standstill",
      slow: "slow",
      typical: "typical",
      fast: "fast",
      very_fast: "very fast",
      select_country: "Select countries to highlight",
    };

    if (!this._chart || !chartEl.querySelector(".atlas-progress-race")) {
      this._chart = AtlasProgressRace.mount(chartEl, {
        rows: this._rows,
        sceneIndex: sceneIndex || 0,
        names: window.ATLAS_COUNTRY_NAMES || {},
        labels,
        animate: false,
      });
    } else {
      this._chart.updateScene(sceneIndex || 0, {
        animate: animate !== false,
      });
    }
  },
};
