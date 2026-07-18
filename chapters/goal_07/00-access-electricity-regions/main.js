/**
 * access_electricity_regions
 * Uses library/regions-small-multiples (Atlas AccessElectricityRegions pattern)
 *
 * CRITICAL: mount once, updateScene on scene change — never remount.
 * Remounting looks like "new static charts" and kills Atlas 1s transitions.
 */
window.AtlasReplica = {
  ready: true,
  isStub: false,
  _chart: null,
  _series: null,
  _loading: null,

  async render(scene, ctx) {
    const { chartEl, hidePlaceholder, sceneIndex, animate } = ctx;
    hidePlaceholder();
    const ph = document.getElementById("placeholder");
    if (ph) {
      ph.hidden = true;
      ph.style.display = "none";
    }

    if (typeof AtlasRegionsSmallMultiples === "undefined") {
      chartEl.innerHTML =
        '<div style="padding:24px;color:#aa0000">Missing AtlasRegionsSmallMultiples — load library/regions-small-multiples/regions-small-multiples.js</div>';
      return;
    }

    // Load series once
    if (!this._series) {
      if (!this._loading) {
        this._loading = (async () => {
          const rows = await AtlasLoad.csv("./data/07_data_access_electricity.csv");
          this._series = AtlasRegionsSmallMultiples.seriesFromRows(rows, {
            valueField: "access_electricity",
            order: AtlasRegionsSmallMultiples.ELECTRICITY_ORDER,
            highlight: AtlasRegionsSmallMultiples.ELECTRICITY_HIGHLIGHT,
          });
        })();
      }
      await this._loading;
    }

    const opts = {
      series: this._series,
      sceneIndex: sceneIndex || 0,
      xDomain: [2000, 2023],
      yDomain: [0, 110],
      yTicks: [0, 50, 100],
      particles: true,
      animateIntro: !this._chart, // only first mount
      forceHighlight: (key, idx) => idx === 2 && (key === "SAS" || key === "SSF"),
    };

    if (!this._chart || !chartEl.querySelector(".atlas-rsm")) {
      this._chart = AtlasRegionsSmallMultiples.mount(chartEl, {
        ...opts,
        animate: false, // first paint snap
      });
    } else {
      // Scene change → animated update only
      this._chart.updateScene(sceneIndex || 0);
    }

    // Story card crossfade is owned by shell.js (scroller-layout) —
    // chart only updates via updateScene (1s opacity + particles).
  },
};
