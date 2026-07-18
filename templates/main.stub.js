/**
 * {{GRAPHIC}} — {{TYPE}} · family: {{FAMILY}}
 *
 * 1) Load data from ./data (see config.data_download)
 * 2) Render with shared kit (AtlasLineChart, AtlasBeeswarmChart, …)
 * 3) Set ready: true when it looks good
 *
 * Docs: docs/DEV.md · Playground: dev/playground.html
 */
window.AtlasReplica = {
  ready: false,
  isStub: true,

  async render(scene, ctx) {
    const { config, chartEl, hidePlaceholder, showPlaceholder } = ctx;

    // --- TODO: replace this stub ---
    // Example skeleton (uncomment and adapt):
    //
    // hidePlaceholder();
    // const { rows } = await AtlasLoad.firstCsv(config.data_download);
    // if (!rows.length) {
    //   showPlaceholder(`<strong>Sin datos</strong><p>No se encontró CSV en ./data/</p>`);
    //   return;
    // }
    // AtlasLineChart.mount(chartEl, {
    //   data: rows,
    //   x: d => d.year,
    //   y: d => d.value,
    //   width: chartEl.clientWidth,
    //   height: chartEl.clientHeight,
    // });
    // this.ready = true;
    // this.isStub = false;

    const sceneInfo = scene
      ? `scene <code>${scene.id || ctx.sceneIndex}</code>`
      : "single view (sin scroller)";

    showPlaceholder(`
      <strong>Listo para desarrollar · <code>{{GRAPHIC}}</code></strong>
      <p>${config.visdescription || config.instructions || "Implementa <code>AtlasReplica.render</code> en main.js"}</p>
      <p class="hint-sm">${sceneInfo} · data: <code>${config.data_download || config.data || "—"}</code> · family: <code>{{FAMILY}}</code></p>
      <p class="hint-sm">Kit: LineChart · Beeswarm · Scatter · Waffle · Load.csv — ver <code>dev/playground.html</code></p>
    `);

    console.info("[scaffold]", "{{GRAPHIC}}", scene?.id ?? "(vis)", {
      data: config.data_download,
      scenes: (config.scenes || []).length,
    });
  },
};
