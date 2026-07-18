/**
 * access_electricity_urban_rural
 * Uses library/dual-line-urban-rural (Atlas AccessElectricityUrbanRural / Bktvr1TG)
 *
 * Vis · mount once · diagonal hatch gap · curveNatural
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
        '<div style="padding:24px;color:#aa0000">Missing AtlasDualLineUrbanRural — load library/dual-line-urban-rural/dual-line-urban-rural.js</div>';
      return;
    }

    if (!this._rows) {
      if (!this._loading) {
        this._loading = AtlasLoad.csv(
          "./data/07_data_access_electricity_urban_rural.csv"
        ).then((rows) => {
          this._rows = rows;
        });
      }
      await this._loading;
    }

    if (!this._chart || !chartEl.querySelector(".atlas-urban-rural")) {
      this._chart = AtlasDualLineUrbanRural.mount(chartEl, {
        rows: this._rows,
        labels: {
          urban: "Urban areas",
          rural: "Rural areas",
          y_axis_units: "% of population",
        },
      });
    }
  },
};
