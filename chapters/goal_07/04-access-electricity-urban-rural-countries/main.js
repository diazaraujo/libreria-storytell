/**
 * access_electricity_urban_rural_countries
 * library dual-line variant:countries (DnvCGyY_)
 */
window.AtlasReplica = {
  ready: true,
  isStub: false,
  _chart: null,
  _rows: null,
  _loading: null,

  async render(_scene, ctx) {
    const { chartEl, hidePlaceholder } = ctx;
    hidePlaceholder();
    const ph = document.getElementById("placeholder");
    if (ph) {
      ph.hidden = true;
      ph.style.display = "none";
    }

    if (typeof AtlasDualLineUrbanRural === "undefined") {
      chartEl.innerHTML =
        '<div style="padding:24px;color:#aa0000">Missing AtlasDualLineUrbanRural</div>';
      return;
    }

    if (!this._rows) {
      if (!this._loading) {
        this._loading = AtlasLoad.csv(
          "./data/07_data_access_electricity_rural_urban_countries.csv"
        ).then((rows) => {
          this._rows = rows;
        });
      }
      await this._loading;
    }

    if (!this._chart || !chartEl.querySelector(".atlas-urban-rural")) {
      this._chart = AtlasDualLineUrbanRural.mount(chartEl, {
        rows: this._rows,
        variant: "countries",
        labels: {
          urban: "Urban areas",
          rural: "Rural areas",
          y_axis_units: "%",
        },
      });
    }
  },
};
