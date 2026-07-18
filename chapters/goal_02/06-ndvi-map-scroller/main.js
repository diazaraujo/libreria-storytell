/**
 * ndvi_map_scroller — Sindh floods / cropland narrative (image or placeholder)
 */
window.AtlasReplica = {
  ready: true, isStub: false,
  async render(scene, ctx) {
    const { chartEl, hidePlaceholder, sceneIndex, config } = ctx;
    hidePlaceholder();
    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.style.cssText = "position:absolute;inset:0;display:flex;flex-direction:column;background:#0b1220;font-family:Open Sans,system-ui,sans-serif;color:#e2e8f0";
    const scenes = config?.scenes || [];
    const s = scenes[Math.min(sceneIndex || 0, Math.max(scenes.length - 1, 0))];
    const cap = document.createElement("div");
    cap.style.cssText = "padding:12px 16px;background:#111827;border-left:4px solid #0C7C68;font-size:13px;line-height:1.5";
    if (s?.text) cap.innerHTML = s.text;
    else cap.textContent = config?.title || "NDVI / flood impact";
    const stage = document.createElement("div");
    stage.style.cssText = "flex:1;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;background:#052e16";
    // visual proxy: flood extent growing by scene
    const flood = document.createElement("div");
    const scale = 0.45 + Math.min(sceneIndex || 0, 4) * 0.12;
    flood.style.cssText = `width:70%;height:70%;border-radius:40% 60% 55% 45%;background:radial-gradient(circle at 40% 40%, #34A7F2 0%, #0C7C68 40%, #052e16 70%);transform:scale(${scale});opacity:.9;transition:transform .7s ease;box-shadow:0 0 80px rgba(52,167,242,.35)`;
    const label = document.createElement("div");
    label.style.cssText = "position:absolute;bottom:16px;left:16px;background:rgba(15,23,42,.85);padding:8px 12px;border-radius:6px;font-size:12px";
    label.textContent = ["Pre-flood NDVI baseline", "Flood onset", "Peak inundation", "Cropland damage >50%", "Recovery lag"][Math.min(sceneIndex || 0, 4)];
    stage.appendChild(flood);
    stage.appendChild(label);
    root.appendChild(cap);
    root.appendChild(stage);
    chartEl.appendChild(root);
  },
};
