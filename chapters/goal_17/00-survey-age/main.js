/**
 * survey_age — pixel-faithful recreation of Atlas strip chart
 * Squares = economies, x = survey year, color = income group, stack = beeswarm column
 * Matches worldbank atlas CQgxRoFi survey component behavior.
 */
window.AtlasReplica = {
  ready: true,
  isStub: false,

  async render(_scene, cfgCtx) {
    const { config, chartEl, hidePlaceholder, colors } = cfgCtx;
    hidePlaceholder();

    const REF_YEAR = 2025;
    const S = 4; // half cell size → cell = 8px (Atlas uses S*2)
    const TYPES = [
      { key: "poverty", label: config.poverty || "Poverty survey" },
      { key: "health", label: config.health || "Health survey" },
      { key: "labor_force", label: config.labor_force || "Labor force survey" },
      { key: "agriculture", label: config.agriculture || "Agriculture survey" },
      { key: "business", label: config.business || "Business survey" },
    ];

    // income map from shared if present; fallback
    const incomeOf = (iso) => {
      if (window.ATLAS_INCOME && window.ATLAS_INCOME[iso]) return window.ATLAS_INCOME[iso];
      return "UMC";
    };

    // load income map once from bundled helper if we inject it
    if (!window.ATLAS_INCOME) {
      try {
        // optional file
        const m = await fetch("../../../shared/income-map.json");
        if (m.ok) window.ATLAS_INCOME = await m.json();
      } catch (_) {
        window.ATLAS_INCOME = {};
      }
    }

    let rows = await AtlasLoad.csv("./data/17_data_survey_age.csv");
    // LMIC filter (Atlas default story focus): exclude HIC & sometimes UMC via toggle
    // Match Atlas: filter !HIC && !UMC when "low and middle" — config subtitle says L&M
    // Original: filter(i=>!HIC&&!UMC) when switch off for HIC/UMC... 
    // "e(B)?!0:!["HIC","UMC"].includes" — when B false, exclude HIC and UMC
    // Default show LMIC only
    let showAll = this._showAll ?? false;

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "survey-age-root";
    root.style.cssText =
      "position:absolute;inset:0;display:flex;flex-direction:column;font-family:'Open Sans',system-ui,sans-serif;background:#fff";

    // toolbar
    const bar = document.createElement("div");
    bar.style.cssText =
      "display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 16px 4px;flex-shrink:0";
    bar.innerHTML = `
      <div style="font-size:12px;color:#6a7781">${config.x_axis_title || ""}</div>
      <label style="font-size:12px;display:flex;align-items:center;gap:6px;cursor:pointer;user-select:none">
        <input type="checkbox" id="sa-all" ${showAll ? "checked" : ""}/>
        Include high- & upper-middle-income
      </label>`;
    root.appendChild(bar);

    const plotHost = document.createElement("div");
    plotHost.style.cssText = "flex:1;min-height:0;position:relative";
    root.appendChild(plotHost);

    // legend
    const leg = document.createElement("div");
    leg.style.cssText =
      "display:flex;flex-wrap:wrap;gap:12px 16px;padding:6px 16px 10px;font-size:11px;color:#6a7781;flex-shrink:0";
    ["LIC", "LMC", "UMC", "HIC"].forEach((k) => {
      const c = (colors && colors[k]) || { LIC: "#3B4DA6", LMC: "#DB95D7", UMC: "#73AF48", HIC: "#016B6C" }[k];
      leg.innerHTML += `<span style="display:inline-flex;align-items:center;gap:5px"><i style="width:9px;height:9px;background:${c};display:inline-block;border:1px solid #fff;box-shadow:0 0 0 1px #ddd"></i>${
        { LIC: "Low income", LMC: "Lower-middle", UMC: "Upper-middle", HIC: "High income" }[k]
      }</span>`;
    });
    root.appendChild(leg);

    if (config.keyFact) {
      const kf = document.createElement("div");
      kf.style.cssText =
        "margin:0 16px 12px;padding:10px 12px;border-left:4px solid #0071bc;background:#f3f8fc;font-size:13px";
      kf.innerHTML = `<strong>${config.keyFact}</strong> ${config.keyFactLabel || ""}`;
      root.appendChild(kf);
    }

    chartEl.appendChild(root);

    const incomeColor = (iso) => {
      const inc = incomeOf(iso);
      return (colors && colors[inc]) || { LIC: "#3B4DA6", LMC: "#DB95D7", UMC: "#73AF48", HIC: "#016B6C" }[inc] || "#8a969f";
    };

    const draw = () => {
      showAll = root.querySelector("#sa-all")?.checked ?? false;
      this._showAll = showAll;

      const filtered = rows.filter((r) => {
        if (!r.year || String(r.year).trim() === "") return false;
        const inc = incomeOf(r.iso3c);
        if (!showAll && (inc === "HIC" || inc === "UMC")) return false;
        return true;
      });

      const w = plotHost.clientWidth || 900;
      const h = plotHost.clientHeight || 480;
      const margin = { top: 28, right: 20, bottom: 36, left: 120 };
      const innerW = w - margin.left - margin.right;
      const rowH = (h - margin.top - margin.bottom) / TYPES.length;

      const years = filtered.map((r) => +r.year).filter(Number.isFinite);
      const y0 = Math.min(2000, ...years, 2005);
      const y1 = Math.max(2025, ...years, 2024);
      const xScale = (year) => margin.left + ((year - y0) / (y1 - y0)) * innerW;

      // build stacked positions per type
      const bands = TYPES.map((t, ti) => {
        const items = filtered
          .filter((r) => r.survey_type === t.key)
          .map((r) => ({ ...r, year: +r.year }));
        // sort by income priority then year for stable stack
        const rank = { LIC: 0, LMC: 1, UMC: 2, HIC: 3 };
        items.sort((a, b) => a.year - b.year || (rank[incomeOf(a.iso3c)] ?? 9) - (rank[incomeOf(b.iso3c)] ?? 9));
        // column stack by year (integer)
        const byYear = new Map();
        items.forEach((d) => {
          const k = d.year;
          if (!byYear.has(k)) byYear.set(k, []);
          byYear.get(k).push(d);
        });
        const placed = [];
        byYear.forEach((list, year) => {
          list.forEach((d, stackIndex) => {
            placed.push({ ...d, stackIndex, year });
          });
        });
        const medianYear = quantile(
          items.map((d) => d.year),
          0.5
        );
        return { ...t, ti, items: placed, medianYear };
      });

      plotHost.innerHTML = "";
      const svgNS = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(svgNS, "svg");
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      svg.style.cssText = "width:100%;height:100%;display:block";
      plotHost.appendChild(svg);

      const el = (tag, attrs = {}, parent = svg) => {
        const n = document.createElementNS(svgNS, tag);
        for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
        parent.appendChild(n);
        return n;
      };

      // top axis years
      const ticks = [];
      for (let y = Math.ceil(y0 / 5) * 5; y <= y1; y += 5) ticks.push(y);
      ticks.forEach((y) => {
        const x = xScale(y);
        el("line", {
          x1: x,
          x2: x,
          y1: margin.top,
          y2: h - margin.bottom,
          stroke: "#eceef2",
        });
        el("text", {
          x,
          y: margin.top - 10,
          "text-anchor": "middle",
          fill: "#6a7781",
          "font-size": 11,
        }).textContent = String(y);
      });

      // bottom age axis label
      el("text", {
        x: margin.left + innerW / 2,
        y: h - 8,
        "text-anchor": "middle",
        fill: "#6a7781",
        "font-size": 11,
      }).textContent = config.x_axis_title_bottom || "Year of most recent survey";

      bands.forEach((band) => {
        const cy = margin.top + band.ti * rowH + rowH / 2;
        // row label
        el("text", {
          x: margin.left - 10,
          y: cy + 4,
          "text-anchor": "end",
          fill: "#111",
          "font-size": 12,
          "font-weight": "600",
        }).textContent = band.label;

        // center line
        el("line", {
          x1: margin.left,
          x2: margin.left + innerW,
          y1: cy,
          y2: cy,
          stroke: "#ced4de",
          "stroke-width": 1,
        });

        // squares
        band.items.forEach((d) => {
          const even = d.stackIndex % 2 === 0;
          const stack = Math.floor(d.stackIndex / 2);
          const x = even ? xScale(d.year) - 2 * S : xScale(d.year);
          const y = even ? cy - (stack + 1) * (2 * S) : cy + stack * (2 * S);
          const rect = el("rect", {
            x,
            y,
            width: 2 * S,
            height: 2 * S,
            fill: incomeColor(d.iso3c),
            stroke: "#ffffff",
            "stroke-width": 0.5,
          });
          const title = document.createElementNS(svgNS, "title");
          title.textContent = `${d.iso3c} · ${d.year} · ${incomeOf(d.iso3c)}`;
          rect.appendChild(title);
        });

        // median
        if (Number.isFinite(band.medianYear)) {
          const mx = xScale(band.medianYear);
          el("line", {
            x1: mx,
            x2: mx,
            y1: cy - rowH * 0.38,
            y2: cy + rowH * 0.38,
            stroke: "#ffffff",
            "stroke-width": 4,
          });
          el("line", {
            x1: mx,
            x2: mx,
            y1: cy - rowH * 0.38,
            y2: cy + rowH * 0.38,
            stroke: "#8a969f",
            "stroke-width": 1.5,
          });
          const age = REF_YEAR - band.medianYear;
          el("text", {
            x: mx + 6,
            y: cy - rowH * 0.32,
            fill: "#57626a",
            "font-size": 11,
            "font-weight": "600",
          }).textContent = `${config.medianLabel || "Median:"} ${age} ${config.years || "years"}`;
        }
      });
    };

    function quantile(arr, q) {
      if (!arr.length) return NaN;
      const a = [...arr].sort((x, y) => x - y);
      const pos = (a.length - 1) * q;
      const base = Math.floor(pos);
      const rest = pos - base;
      if (a[base + 1] !== undefined) return a[base] + rest * (a[base + 1] - a[base]);
      return a[base];
    }

    // load income map from atlas chunk export if missing — embed critical map via CSV join optional
    // Build income from a lightweight embedded set by fetching country meta once
    if (!Object.keys(window.ATLAS_INCOME || {}).length) {
      // derive from SPI data if available in sibling folder
      try {
        const spi = await AtlasLoad.csv("../03-spi-scroller/data/17_data_spi_pillar_scores.csv");
        // no income there — try shared file generated by pipeline
      } catch (_) {}
    }

    // Use color map from iso via shared countries if we generate income-map
    root.querySelector("#sa-all").addEventListener("change", draw);
    draw();
    window.addEventListener("resize", () => {
      clearTimeout(this._rz);
      this._rz = setTimeout(draw, 100);
    });
  },
};
