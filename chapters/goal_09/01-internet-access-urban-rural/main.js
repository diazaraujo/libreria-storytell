/**
 * internet_access_urban_rural
 * Uses library/dual-line-urban-rural variant:income (v0.3)
 *
 * Income groups WLD/LIC/LMC/UMC/HIC · urban vs rural · 2022–2025
 * Mount once · hatch gap · curveNatural
 */
window.AtlasReplica = {
  ready: true,
  isStub: false,
  async render(_s, ctx) {
    const { chartEl, hidePlaceholder } = ctx;
    hidePlaceholder();

    if (typeof AtlasDualLineUrbanRural === "undefined") {
      chartEl.innerHTML =
        '<div style="padding:24px;color:#aa0000">Missing AtlasDualLineUrbanRural — load library/dual-line-urban-rural/dual-line-urban-rural.js</div>';
      return;
    }

    const rows = await AtlasLoad.csv(
      "./data/09_data_internet_access_urban_rural.csv"
    );
    const h = Math.max(360, chartEl.clientHeight || 420);

    return AtlasDualLineUrbanRural.mount(chartEl, {
      rows,
      variant: "income",
      forceRemount: true,
      height: h,
      intro: true,
      labels: {
        urban: "Urban",
        rural: "Rural",
        y_axis_units: "% of population",
      },
    });
  },
};
