/**
 * skill_violin — Tier B auto-custom (beeswarm)
 * Generated for pixel-faithful bulk pass · edit freely
 */
window.AtlasReplica = {
  ready: true,
  isStub: false,
  async render(scene, ctx) {
    const { chartEl, hidePlaceholder, sceneIndex, config } = ctx;
    hidePlaceholder();
    const kind = "beeswarm";
    const primary = "avgs.csv";
    const img = null;

    // Image-only / hybrid
    if (kind === "image" || (img && !primary)) {
      chartEl.innerHTML = "";
      const root = document.createElement("div");
      root.style.cssText = "position:absolute;inset:0;display:flex;flex-direction:column;background:#0b1220;font-family:Open Sans,system-ui,sans-serif;color:#e2e8f0";
      const cap = document.createElement("div");
      cap.style.cssText = "padding:10px 14px;background:#111827;font-size:13px;line-height:1.45";
      const scenes = (config && config.scenes) || [];
      const s = scenes[sceneIndex] || scenes[0];
      cap.innerHTML = (s && (s.text || s.id)) || (config && config.title) || "";
      // strip simple tags for safety in textContent path — keep HTML for emphasis
      const stage = document.createElement("div");
      stage.style.cssText = "flex:1;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#020617";
      if (img) {
        const el = document.createElement("img");
        el.src = "./data/" + img;
        el.alt = (config && config.title) || "";
        el.style.cssText = "max-width:100%;max-height:100%;object-fit:contain";
        stage.appendChild(el);
      } else {
        stage.innerHTML = '<div style="padding:24px;color:#94a3b8">Asset map/image (external Atlas asset)</div>';
      }
      root.appendChild(cap);
      root.appendChild(stage);
      chartEl.appendChild(root);
      return;
    }

    // Data charts via polished AtlasAuto + WB chrome
    if (typeof AtlasAuto !== "undefined") {
      const res = await AtlasAuto.render(scene, ctx);
      // strip auto badge chrome for cleaner look
      const banner = chartEl.querySelector(".auto-root > div");
      if (banner && banner.textContent && banner.textContent.includes("rows")) {
        banner.style.display = "none";
      }
      return res;
    }

    chartEl.innerHTML = `<div style="padding:24px;color:#6a7781">Missing AtlasAuto for ${config.graphic}</div>`;
  },
};
