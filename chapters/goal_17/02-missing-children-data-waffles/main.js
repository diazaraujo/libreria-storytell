/**
 * missing_children_data_waffles — Atlas-style unit charts per indicator
 */
window.AtlasReplica = {
  ready: true,
  isStub: false,

  async render(scene, ctx) {
    const { config, chartEl, hidePlaceholder, sceneIndex } = ctx;
    hidePlaceholder();

    const children = await AtlasLoad.csv("./data/missing_children_data.csv").catch(() => []);
    const pop = await AtlasLoad.csv("./data/pop_with_data.csv").catch(() => []);

    // Flexible column detection
    let indicators = [];
    if (children.length) {
      const keys = Object.keys(children[0]);
      // wide format: one row with metrics
      if (children.length <= 5) {
        const row = children[0];
        keys.forEach((k) => {
          if (/iso|name|country|region/i.test(k)) return;
          const v = Number(row[k]);
          if (!Number.isFinite(v)) return;
          const pct = v <= 1 ? v * 100 : v;
          if (pct < 0 || pct > 100) return;
          indicators.push({ id: k, name: labelize(k), without: pct });
        });
      } else {
        // long format
        const nameKey =
          keys.find((k) => /indicator|metric|name|type/i.test(k)) || keys[0];
        const valKey =
          keys.find((k) => /without|missing|share|pct|value/i.test(k)) ||
          keys.find((k) => keys.some(() => Number.isFinite(Number(children[0][k]))));
        children.forEach((r) => {
          const v = Number(r[valKey]);
          if (!Number.isFinite(v)) return;
          indicators.push({
            id: r[nameKey],
            name: labelize(String(r[nameKey])),
            without: v <= 1 ? v * 100 : v,
          });
        });
      }
    }

    // Atlas story labels from config when available
    const defaults = [
      { id: "birth_reg", name: config.birth_reg || "Birth registration", without: 25 },
      { id: "stunting", name: config.stunting || "Stunting (nutrition)", without: 35 },
      { id: "learn_assess", name: config.learn_assess || "Learning assessment", without: 48 },
    ];
    if (!indicators.length) indicators = defaults;

    // scene: reveal 1..n waffles
    const n = Math.min(indicators.length, Math.max(1, (sceneIndex ?? 0) + 1));
    const show = indicators.slice(0, n);

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.style.cssText =
      "position:absolute;inset:0;padding:20px 24px;display:flex;flex-direction:column;gap:12px;font-family:'Open Sans',system-ui,sans-serif;background:#fff";

    const title = document.createElement("div");
    title.style.cssText = "font-size:13px;color:#6a7781";
    title.textContent =
      config.square_represents ||
      "Each square ≈ population of children · red = without recent comparable data";
    root.appendChild(title);

    const grid = document.createElement("div");
    grid.style.cssText = `flex:1;display:grid;grid-template-columns:repeat(${Math.min(
      show.length,
      3
    )},1fr);gap:24px;align-items:center`;
    root.appendChild(grid);

    show.forEach((ind, i) => {
      const cell = document.createElement("div");
      cell.style.cssText = "text-align:center";
      const h = document.createElement("div");
      h.style.cssText =
        "font-size:14px;font-weight:700;margin-bottom:12px;min-height:2.4em;display:flex;align-items:flex-end;justify-content:center";
      h.textContent = ind.name;
      const host = document.createElement("div");
      host.style.cssText = "display:flex;justify-content:center";
      const cap = document.createElement("div");
      cap.style.cssText = "margin-top:12px;font-size:13px;color:#57626a";
      const filled = Math.round(Math.min(100, Math.max(0, ind.without)));
      cap.innerHTML = `<span style="color:#AA0000;font-weight:700">${filled}%</span> without data`;
      cell.appendChild(h);
      cell.appendChild(host);
      cell.appendChild(cap);
      grid.appendChild(cell);
      AtlasWaffle.mount(host, {
        total: 100,
        filled,
        cols: 10,
        cell: 14,
        gap: 3,
        colors: {
          on: "#AA0000",
          off: "#e8edf3",
        },
      });
      // stagger appear
      cell.style.opacity = "0";
      cell.style.transform = "translateY(8px)";
      cell.style.transition = `opacity .4s ${i * 0.12}s ease, transform .4s ${i * 0.12}s ease`;
      requestAnimationFrame(() => {
        cell.style.opacity = "1";
        cell.style.transform = "none";
      });
    });

    // legend
    const leg = document.createElement("div");
    leg.style.cssText =
      "display:flex;gap:16px;justify-content:center;font-size:12px;color:#6a7781;padding-top:4px";
    leg.innerHTML = `
      <span><i style="width:10px;height:10px;background:#AA0000;display:inline-block;margin-right:5px"></i>${
        config.without_data || "Without data"
      }</span>
      <span><i style="width:10px;height:10px;background:#e8edf3;display:inline-block;margin-right:5px;border:1px solid #ddd"></i>${
        config.with_data || "With data"
      }</span>`;
    root.appendChild(leg);
    chartEl.appendChild(root);

    function labelize(s) {
      return String(s)
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }
  },
};
