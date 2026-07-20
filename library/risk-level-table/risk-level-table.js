/**
 * AtlasRiskLevelTable v0.1
 * Static styled table for E. coli risk levels (JMP fecal contamination).
 */
(function (global) {
  const DEFAULT_COLORS = {
    "Low risk": "#54AE89",
    "Moderate risk": "#fbbf24",
    "Medium risk": "#fbbf24",
    "High risk": "#f97316",
    "Very high risk": "#AA0000",
  };

  function mount(container, options = {}) {
    if (!container) throw new Error("container required");
    const {
      rows = [],
      levelField = "E coli risk level",
      countField = "Count in 100mL water",
      colors = DEFAULT_COLORS,
      title = "E. coli risk levels",
    } = options;

    container.innerHTML = "";
    const wrap = document.createElement("div");
    wrap.className = "atlas-risk-table atlas-chart-root";
    wrap.style.cssText =
      "position:relative;width:100%;height:100%;min-height:280px;padding:28px 20px;font-family:'Open Sans',system-ui,sans-serif;background:#fff;box-sizing:border-box;overflow:auto";

    let html = `<div style="max-width:640px;margin:0 auto">
      <div style="font-size:13px;font-weight:700;color:#6a7781;margin-bottom:12px">${title}</div>
      <table style="width:100%;border-collapse:collapse;font-size:15px">
      <thead><tr>
        <th style="text-align:left;padding:12px;border-bottom:2px solid #e5e7eb;color:#3d4a54">E. coli risk level</th>
        <th style="text-align:left;padding:12px;border-bottom:2px solid #e5e7eb;color:#3d4a54">Count in 100 mL water</th>
      </tr></thead><tbody>`;

    rows.forEach((r) => {
      const lvl = r[levelField] || r.level || "";
      const count = r[countField] || r.count || "";
      const c = colors[lvl] || "#6a7781";
      html += `<tr>
        <td style="padding:14px 12px;border-bottom:1px solid #f1f5f9">
          <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${c};margin-right:8px"></span>
          <strong>${lvl}</strong>
        </td>
        <td style="padding:14px 12px;border-bottom:1px solid #f1f5f9;font-variant-numeric:tabular-nums;color:#1a1a1a">${count}</td>
      </tr>`;
    });
    html += `</tbody></table>
      <p style="margin:16px 0 0;font-size:12px;color:#6a7781;line-height:1.45">CFU = colony-forming units. Higher counts mean greater fecal contamination risk.</p>
    </div>`;
    wrap.innerHTML = html;
    container.appendChild(wrap);

    return {
      updateScene() {},
      setScene() {},
      destroy() {
        try {
          container.innerHTML = "";
        } catch (_) {}
      },
      version: "0.1.0",
    };
  }

  const api = { mount, version: "0.1.0" };
  global.AtlasRiskLevelTable = api;
  global.AtlasLibrary = global.AtlasLibrary || {};
  global.AtlasLibrary.RiskLevelTable = api;
})(typeof window !== "undefined" ? window : globalThis);
