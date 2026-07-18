/**
 * ecoli_table — risk level table (faithful static table viz)
 */
window.AtlasReplica = {
  ready: true, isStub: false,
  async render(_s, ctx) {
    const { chartEl, hidePlaceholder } = ctx;
    hidePlaceholder();
    const rows = await AtlasLoad.csv("./data/E-coli Table.csv");
    chartEl.innerHTML = "";
    const wrap = document.createElement("div");
    wrap.style.cssText = "position:absolute;inset:0;padding:28px;font-family:Open Sans,system-ui,sans-serif;overflow:auto";
    const colors = { "Low risk": "#54AE89", "Moderate risk": "#fbbf24", "High risk": "#f97316", "Very high risk": "#AA0000" };
    let html = `<table style="width:100%;max-width:640px;margin:40px auto;border-collapse:collapse;font-size:15px">
      <thead><tr>
        <th style="text-align:left;padding:12px;border-bottom:2px solid #e5e7eb">E. coli risk level</th>
        <th style="text-align:left;padding:12px;border-bottom:2px solid #e5e7eb">Count in 100 mL water</th>
      </tr></thead><tbody>`;
    rows.forEach((r) => {
      const lvl = r["E coli risk level"];
      const c = colors[lvl] || "#6a7781";
      html += `<tr>
        <td style="padding:14px 12px;border-bottom:1px solid #f1f5f9">
          <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${c};margin-right:8px"></span>
          <strong>${lvl}</strong>
        </td>
        <td style="padding:14px 12px;border-bottom:1px solid #f1f5f9;font-variant-numeric:tabular-nums">${r["Count in 100mL water"]}</td>
      </tr>`;
    });
    html += `</tbody></table>`;
    wrap.innerHTML = html;
    chartEl.appendChild(wrap);
  },
};
