/**
 * Component kit entry — load after svg.js, beeswarm.js, load.js
 * Order-safe: each file sets window.Atlas*
 */
(function () {
  window.AtlasComponents = {
    version: "0.1.0",
    list: [
      "AtlasLoad",
      "AtlasSVG",
      "AtlasAxis",
      "AtlasLineChart",
      "AtlasBeeswarmChart",
      "AtlasWaffle",
      "AtlasScatter",
      "AtlasRegionsSmallMultiples",
      "Beeswarm",
      "WB_COLORS",
    ],
    ready() {
      return this.list.every((k) => typeof window[k] !== "undefined");
    },
  };
})();
