/**
 * access_electricity_population
 * Uses library/population-access (Atlas AccessElectricityPopulation / BcrOvn12)
 *
 * Mount once · updateScene — never remount (opacity 2s transitions).
 */
window.AtlasReplica = {
  ready: true,
  isStub: false,
  _chart: null,
  _data: null,
  _loading: null,

  async render(scene, ctx) {
    const { chartEl, hidePlaceholder, sceneIndex, animate } = ctx;
    hidePlaceholder();
    const ph = document.getElementById("placeholder");
    if (ph) {
      ph.hidden = true;
      ph.style.display = "none";
    }

    if (typeof AtlasPopulationAccess === "undefined") {
      chartEl.innerHTML =
        '<div style="padding:24px;color:#aa0000">Missing AtlasPopulationAccess — load library/population-access/population-access.js</div>';
      return;
    }

    if (!this._data) {
      if (!this._loading) {
        this._loading = (async () => {
          const [aggregates, worldPop, countries] = await Promise.all([
            AtlasLoad.csv("./data/access_electricity_population_aggregates.csv"),
            AtlasLoad.csv("./data/population_world.csv"),
            AtlasLoad.csv("./data/access_electricity_population_countries.csv"),
          ]);
          this._data = { aggregates, worldPop, countries };
        })();
      }
      await this._loading;
    }

    const labels = {
      without_access: "Population without electricity",
      with_access: "Population with electricity",
      population: "Population",
      y_axis_units: "millions of people",
      y_axis_title_right: "Global share in 2023",
      million: "million",
    };

    if (!this._chart || !chartEl.querySelector(".atlas-pop")) {
      this._chart = AtlasPopulationAccess.mount(chartEl, {
        ...this._data,
        sceneIndex: sceneIndex || 0,
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
