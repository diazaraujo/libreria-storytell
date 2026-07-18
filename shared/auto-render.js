/**
 * AtlasAuto — best-effort renderer for any scaffold with CSV/JSON data.
 * Used by all scaffold main.js files so every graphic "works" out of the box.
 */
window.AtlasAuto = {
  async render(scene, ctx) {
    const { config, chartEl, hidePlaceholder, showPlaceholder, sceneIndex } = ctx;
    hidePlaceholder();

    const tables = await this._loadTables();

    if (!tables.length) {
      this._empty(chartEl, config, "Sin archivos en ./data/ (mapa, imagen o asset externo).");
      return { status: "empty" };
    }

    // Prefer CSV named in data_download
    let table = tables[0];
    if (config.data_download) {
      const want = String(config.data_download).split(",")[0].trim();
      const hit = tables.find((t) => t.name === want || t.name.endsWith(want));
      if (hit) table = hit;
    }

    const graphic = (config.graphic || "").toLowerCase();
    const headers = table.headers;
    const rows = table.rows;

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "auto-root";
    root.style.cssText =
      "position:absolute;inset:0;display:grid;grid-template-rows:auto 1fr auto;padding:6px 10px 8px;gap:4px";
    const banner = document.createElement("div");
    banner.style.cssText = "font-size:12px;color:#6a7781;display:flex;gap:10px;flex-wrap:wrap;align-items:center";
    const plot = document.createElement("div");
    plot.style.cssText = "min-height:0;position:relative";
    const foot = document.createElement("div");
    foot.style.cssText = "font-size:11px;color:#8a969f";
    root.appendChild(banner);
    root.appendChild(plot);
    root.appendChild(foot);
    chartEl.appendChild(root);

    let kind = this._infer(graphic, config, headers, rows);
    // If "time series" but only one distinct year → bars
    if (kind === "line" || kind === "multi-line") {
      const xKey = this._pick(headers, ["year", "date", "time", "Year"]);
      if (xKey) {
        const uniq = new Set(
          rows.map((r) => {
            let x = r[xKey];
            if (typeof x === "string" && /^\d{4}/.test(x)) x = +x.slice(0, 4);
            return this._num(x) ?? x;
          })
        );
        if (uniq.size <= 1) kind = "bars";
      }
    }

    // Clean chrome for pixel-pass (no scaffold badge)
    banner.style.display = "none";
    banner.innerHTML = "";

    const w = Math.max(320, plot.clientWidth || chartEl.clientWidth || 800);
    const h = Math.max(280, plot.clientHeight || chartEl.clientHeight - 48 || 400);

    try {
      switch (kind) {
        case "line":
          this._line(plot, rows, headers, config, sceneIndex, w, h);
          break;
        case "multi-line":
          this._multiLine(plot, rows, headers, config, sceneIndex, w, h);
          break;
        case "scatter":
          this._scatter(plot, rows, headers, config, w, h);
          break;
        case "beeswarm":
          this._beeswarm(plot, rows, headers, config, w, h);
          break;
        case "bars":
          this._bars(plot, rows, headers, config, sceneIndex, w, h);
          break;
        case "waffle":
          this._waffle(plot, rows, headers, config, sceneIndex);
          break;
        case "heatmap-matrix":
          this._matrix(plot, rows, headers, config, w, h);
          break;
        default:
          this._tablePreview(plot, rows, headers, w, h);
          kind_fallback(banner);
      }
      foot.textContent =
        (config.y_axis_title || config.x_axis_title || config.subtitle || "") +
        (config.keyFact ? `  ·  Key fact: ${config.keyFact}` : "");
      return { status: "ok", kind, rows: rows.length };
    } catch (err) {
      console.error(err);
      this._empty(plot, config, String(err.message || err));
      return { status: "error", error: String(err) };
    }

    function kind_fallback(el) {
      el.innerHTML += ` <span style="color:#9a6b00">preview table</span>`;
    }
  },

  _empty(el, config, msg) {
    el.innerHTML = `<div style="position:absolute;inset:24px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;border:2px dashed #c9d0db;border-radius:12px;background:#f7f9fc;color:#6a7781;padding:20px">
      <strong style="color:#111">${config.title || config.graphic || "Visualization"}</strong>
      <p style="max-width:48ch">${msg}</p>
      <p style="font-size:12px">${config.visdescription || ""}</p>
    </div>`;
  },

  async _loadTables() {
    const config = window.ATLAS_CONFIG || {};
    const names = [];

    // Preferred: manifest written by pipeline
    try {
      const idx = await fetch("./data/index.json");
      if (idx.ok) {
        const list = await idx.json();
        if (Array.isArray(list)) names.push(...list);
      }
    } catch (_) {}

    if (config._meta?.dataFiles) names.push(...config._meta.dataFiles);
    if (config.data_download) {
      String(config.data_download)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((n) => names.push(n));
    }

    const unique = [...new Set(names.filter(Boolean))];
    const tables = [];
    for (const name of unique) {
      if (/\.zip$/i.test(name)) continue;
      const url = name.startsWith("./") || name.startsWith("http") ? name : `./data/${name}`;
      try {
        if (/\.json$/i.test(name)) {
          const data = await AtlasLoad.json(url);
          const rows = this._jsonToRows(data);
          if (rows.length) {
            tables.push({ name, headers: Object.keys(rows[0]), rows });
          }
        } else {
          const rows = await AtlasLoad.csv(url);
          if (rows.length) {
            tables.push({ name, headers: Object.keys(rows[0]), rows });
          }
        }
      } catch (e) {
        console.warn("skip", name, e);
      }
    }

    if (!tables.length) {
      try {
        const data = await AtlasLoad.json("./data.json");
        const rows = Array.isArray(data) ? data : this._jsonToRows(data);
        if (rows.length) {
          tables.push({ name: "data.json", headers: Object.keys(rows[0]), rows });
        }
      } catch (_) {}
    }
    return tables;
  },

  _jsonToRows(data) {
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object") {
      // first array value
      for (const v of Object.values(data)) {
        if (Array.isArray(v) && v.length && typeof v[0] === "object") return v;
      }
    }
    return [];
  },

  _infer(graphic, config, headers, rows) {
    const h = headers.map((x) => x.toLowerCase());
    const g = graphic;

    if (g.includes("waffle") || g.includes("missing_children")) return "waffle";
    if (g.includes("beeswarm") || g.includes("spi_scroller") || g.includes("pay_beeswarm"))
      return "beeswarm";
    if (g.includes("scatter") || g.includes("spi_gdp")) return "scatter";
    if (g.includes("matrix") || g.includes("hotspot")) return "heatmap-matrix";
    if (g.includes("venn")) return "bars";

    const hasYear =
      h.includes("year") || h.includes("date") || h.includes("time") || h.includes("year");
    const hasIso = h.some((x) => x.includes("iso") || x === "code" || x === "country");
    const numCols = headers.filter((col) =>
      rows.slice(0, 20).some((r) => Number.isFinite(Number(r[col])) && r[col] !== "")
    );

    // two numeric + iso-like → scatter
    if (numCols.length >= 2 && !hasYear && (g.includes("vs") || g.includes("gdp") || g.includes("plot")))
      return "scatter";

    // year + value (+ optional group) → line
    if (hasYear && (h.includes("value") || h.includes("rate") || numCols.length >= 1)) {
      if (h.includes("group") || h.includes("gender") || h.includes("sex") || h.includes("area") || h.includes("type") || h.includes("series_name"))
        return "multi-line";
      // many countries over time → multi by top series or aggregate mean line
      if (hasIso && rows.length > 100) return "multi-line";
      return "line";
    }

    // single numeric distribution
    if (numCols.length === 1 && rows.length > 15) return "beeswarm";

    // categorical + value
    if (numCols.length >= 1 && rows.length <= 40) return "bars";

    // two numerics
    if (numCols.length >= 2) return "scatter";

    return "table";
  },

  _pick(headers, cands) {
    const lower = headers.map((h) => h.toLowerCase());
    for (const c of cands) {
      const i = lower.indexOf(c.toLowerCase());
      if (i >= 0) return headers[i];
    }
    // partial
    for (const c of cands) {
      const i = lower.findIndex((h) => h.includes(c.toLowerCase()));
      if (i >= 0) return headers[i];
    }
    return null;
  },

  _num(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  },

  _line(plot, rows, headers, config, sceneIndex, w, h) {
    const xKey =
      this._pick(headers, ["year", "date", "time", "Year"]) || headers[0];
    const yKey =
      this._pick(headers, ["value", "rate", "access_electricity", "years_of_schooling", "y"]) ||
      headers.find((k) => k !== xKey && rows.some((r) => this._num(r[k]) != null));

    // aggregate mean by x if multiple rows per year
    const map = new Map();
    rows.forEach((r) => {
      let x = r[xKey];
      if (typeof x === "string" && /^\d{4}/.test(x)) x = +x.slice(0, 4);
      x = this._num(x) ?? x;
      const y = this._num(r[yKey]);
      if (y == null || x == null || x === "") return;
      if (!map.has(x)) map.set(x, []);
      map.get(x).push(y);
    });
    let data = [...map.entries()]
      .map(([x, ys]) => ({ x, y: ys.reduce((a, b) => a + b, 0) / ys.length }))
      .sort((a, b) => a.x - b.x);

    // scroller: progressively reveal
    if (sceneIndex > 0 && data.length > 4) {
      const n = Math.max(2, Math.ceil(((sceneIndex + 1) / 6) * data.length));
      data = data.slice(0, n);
    }

    AtlasLineChart.mount(plot, {
      data,
      x: (d) => d.x,
      y: (d) => d.y,
      width: w,
      height: h,
      yDomain: this._yDomain(data.map((d) => d.y), config),
      xTicks: this._sampleTicks(data.map((d) => d.x), 6),
      colors: { default: (window.WB_COLORS && WB_COLORS.wbBlue) || "#0071bc" },
    });
  },

  _multiLine(plot, rows, headers, config, sceneIndex, w, h) {
    const xKey = this._pick(headers, ["year", "date", "time", "Year", "experience_years"]);
    const yKey =
      this._pick(headers, ["value", "rate", "access_electricity", "years_of_schooling", "wage_estimate", "Female", "Male"]) ||
      headers.find((k) => k !== xKey && this._num(rows[0][k]) != null);
    const sKey =
      this._pick(headers, ["group", "gender", "sex", "area", "type", "series_name", "income", "region", "iso3c", "country"]) ||
      null;

    // If too many series (countries), keep top N by latest value or mean
    let seriesField = sKey;
    let data = [];
    if (seriesField) {
      const byS = new Map();
      rows.forEach((r) => {
        const s = String(r[seriesField] ?? "all");
        let x = r[xKey];
        if (typeof x === "string" && /^\d{4}/.test(x)) x = +x.slice(0, 4);
        x = this._num(x) ?? x;
        const y = this._num(r[yKey]);
        if (y == null || x == null || x === "") return;
        if (!byS.has(s)) byS.set(s, []);
        byS.get(s).push({ x, y, series: s });
      });
      let keys = [...byS.keys()];
      if (keys.length > 8) {
        // aggregate world mean + sample regions if look like iso
        const all = [];
        const byX = new Map();
        rows.forEach((r) => {
          let x = r[xKey];
          if (typeof x === "string" && /^\d{4}/.test(x)) x = +x.slice(0, 4);
          x = this._num(x);
          const y = this._num(r[yKey]);
          if (x == null || y == null) return;
          if (!byX.has(x)) byX.set(x, []);
          byX.get(x).push(y);
        });
        data = [...byX.entries()]
          .map(([x, ys]) => ({
            x,
            y: ys.reduce((a, b) => a + b, 0) / ys.length,
            series: "mean",
          }))
          .sort((a, b) => a.x - b.x);
      } else {
        keys.forEach((k) => {
          const pts = byS.get(k).sort((a, b) => a.x - b.x);
          data.push(...pts);
        });
      }
    } else {
      return this._line(plot, rows, headers, config, sceneIndex, w, h);
    }

    if (sceneIndex > 0 && data.length > 8) {
      const maxX = [...new Set(data.map((d) => d.x))].sort((a, b) => a - b);
      const cut = maxX[Math.min(maxX.length - 1, Math.floor(((sceneIndex + 1) / 5) * maxX.length))];
      data = data.filter((d) => d.x <= cut);
    }

    const palette = [
      WB_COLORS?.wbBlue || "#0071bc",
      WB_COLORS?.HIC || "#016B6C",
      WB_COLORS?.LIC || "#3B4DA6",
      WB_COLORS?.UMC || "#73AF48",
      WB_COLORS?.LMC || "#DB95D7",
      "#FF9800",
      "#F3578E",
      "#664AB6",
    ];
    const series = [...new Set(data.map((d) => d.series))];
    const colors = { default: palette[0] };
    series.forEach((s, i) => {
      colors[s] = palette[i % palette.length];
    });

    AtlasLineChart.mount(plot, {
      data,
      x: (d) => d.x,
      y: (d) => d.y,
      series: (d) => d.series,
      width: w,
      height: h,
      yDomain: this._yDomain(data.map((d) => d.y), config),
      xTicks: this._sampleTicks(data.map((d) => d.x), 6),
      colors,
    });
  },

  _scatter(plot, rows, headers, config, w, h) {
    const numHeaders = headers.filter((col) =>
      rows.slice(0, 30).some((r) => this._num(r[col]) != null)
    );
    // prefer known pairs
    let xKey =
      this._pick(headers, [
        "gdp_per_capita",
        "gdp",
        "pop",
        "population",
        "mmr",
        "lays_2010",
        "x",
        "income",
      ]) || numHeaders[0];
    let yKey =
      this._pick(headers, [
        "spi_index",
        "pg",
        "prosperity_gap",
        "nmr",
        "lays_2025",
        "value",
        "y",
        "return_to_education",
      ]) || numHeaders[1] || numHeaders[0];
    if (xKey === yKey && numHeaders.length > 1) yKey = numHeaders[1];

    const data = rows
      .map((r) => ({
        ...r,
        _x: this._num(r[xKey]),
        _y: this._num(r[yKey]),
      }))
      .filter((d) => d._x != null && d._y != null && d._x > 0);

    const xs = data.map((d) => d._x);
    const maxX = Math.max(...xs);
    const minX = Math.min(...xs);
    // log x for gdp/pop or highly skewed distributions
    const logX =
      /gdp|income|capita|pop/i.test(xKey) ||
      (minX > 0 && maxX / minX > 50);

    AtlasScatter.mount(plot, {
      data,
      x: (d) => (logX ? Math.log10(Math.max(1e-6, d._x)) : d._x),
      y: (d) => d._y,
      width: w,
      height: h,
      yDomain: this._yDomain(data.map((d) => d._y), config),
      xTicks: logX
        ? this._logTicks(minX, maxX)
        : undefined,
      xFormat: logX
        ? (v) => this._fmtPop(Math.pow(10, v))
        : undefined,
      color: () => WB_COLORS?.wbBlue || "#0071bc",
      title: (d) =>
        `${d.iso3c || d.country || d.code || ""}\n${xKey}=${d._x}\n${yKey}=${d._y}`,
    });
  },

  _logTicks(minX, maxX) {
    const a = Math.floor(Math.log10(Math.max(1, minX)));
    const b = Math.ceil(Math.log10(Math.max(1, maxX)));
    const ticks = [];
    for (let e = a; e <= b; e++) ticks.push(e);
    return ticks.length ? ticks : [a, b];
  },

  _fmtPop(n) {
    if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(0) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(0) + "k";
    return String(Math.round(n));
  },

  _beeswarm(plot, rows, headers, config, w, h) {
    const vKey =
      this._pick(headers, [
        "spi_index",
        "value",
        "rate",
        "wage_ratio",
        "access_electricity",
      ]) ||
      headers.find((col) => rows.some((r) => this._num(r[col]) != null));

    // latest year if panel
    let data = rows;
    const yKey = this._pick(headers, ["year", "date"]);
    if (yKey) {
      const years = data.map((r) => this._num(r[yKey]) || r[yKey]).filter((x) => x != null);
      const maxY = years.sort().at(-1);
      data = data.filter((r) => (this._num(r[yKey]) || r[yKey]) === maxY);
    }

    const points = data
      .map((r) => ({
        ...r,
        value: this._num(r[vKey]),
      }))
      .filter((d) => d.value != null);

    const incomeKey = this._pick(headers, ["income", "income_level_iso3c", "fcv"]);
    AtlasBeeswarmChart.mount(plot, {
      data: points,
      value: (d) => d.value,
      domain: this._yDomain(points.map((d) => d.value), config) || [0, 100],
      radius: points.length > 150 ? 2.4 : 3.2,
      width: w,
      height: h,
      color: (d) => {
        if (incomeKey && WB_COLORS?.[d[incomeKey]]) return WB_COLORS[d[incomeKey]];
        if (d.income && WB_COLORS?.[d.income]) return WB_COLORS[d.income];
        return WB_COLORS?.HIC || "#016B6C";
      },
      title: (d) => `${d.iso3c || d.country || d.code || ""}: ${d.value}`,
    });
  },

  _bars(plot, rows, headers, config, sceneIndex, w, h) {
    const catKey =
      this._pick(headers, ["iso3c", "country", "name", "group", "source", "venn", "component", "category"]) ||
      headers[0];
    const valKey =
      this._pick(headers, ["value", "poor", "rate", "pct", "usage_pct"]) ||
      headers.find((k) => k !== catKey && this._num(rows[0]?.[k]) != null);

    let data = rows
      .map((r) => ({ cat: String(r[catKey]), value: this._num(r[valKey]) }))
      .filter((d) => d.value != null);
    // aggregate
    const m = new Map();
    data.forEach((d) => m.set(d.cat, (m.get(d.cat) || 0) + d.value));
    data = [...m.entries()].map(([cat, value]) => ({ cat, value }));
    data.sort((a, b) => b.value - a.value);
    const limit = sceneIndex > 0 ? Math.min(data.length, 8 + sceneIndex * 4) : Math.min(data.length, 20);
    data = data.slice(0, limit);

    const SVG = AtlasSVG;
    const margin = { top: 12, right: 16, bottom: 64, left: 48 };
    const svg = SVG.el(plot, "svg");
    svg.style.cssText = "width:100%;height:100%";
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    const maxV = Math.max(...data.map((d) => d.value), 1);
    const bw = (w - margin.left - margin.right) / data.length;
    data.forEach((d, i) => {
      const bh = ((h - margin.top - margin.bottom) * d.value) / maxV;
      const x = margin.left + i * bw + bw * 0.1;
      const y = h - margin.bottom - bh;
      SVG.el(svg, "rect", {
        x,
        y,
        width: bw * 0.8,
        height: bh,
        fill: WB_COLORS?.wbBlue || "#0071bc",
        rx: 2,
      });
      const label = SVG.el(svg, "text", {
        x: x + bw * 0.4,
        y: h - margin.bottom + 12,
        "text-anchor": "end",
        "font-size": 10,
        fill: "#6a7781",
        transform: `rotate(-45 ${x + bw * 0.4} ${h - margin.bottom + 12})`,
      });
      label.textContent = d.cat.length > 12 ? d.cat.slice(0, 11) + "…" : d.cat;
    });
  },

  _waffle(plot, rows, headers, config, sceneIndex) {
    // try proportion from data
    let filled = 60;
    let total = 100;
    const valKey = this._pick(headers, ["value", "share", "pct", "percent", "without_data"]);
    if (valKey) {
      const nums = rows.map((r) => this._num(r[valKey])).filter((x) => x != null);
      if (nums.length) {
        const v = nums.reduce((a, b) => a + b, 0) / nums.length;
        filled = v <= 1 ? Math.round(v * 100) : Math.round(Math.min(100, v));
      }
    }
    if (config.keyFact && /%/.test(config.keyFact)) {
      const m = config.keyFact.match(/(\d+)/);
      if (m) filled = +m[1];
    }
    // scene progression
    if (sceneIndex > 0) filled = Math.min(100, filled + sceneIndex * 5);

    const wrap = document.createElement("div");
    wrap.style.cssText = "display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:12px";
    const host = document.createElement("div");
    wrap.appendChild(host);
    const cap = document.createElement("div");
    cap.style.cssText = "font-size:14px;color:#333";
    cap.textContent = `${filled} / ${total}`;
    wrap.appendChild(cap);
    plot.appendChild(wrap);
    AtlasWaffle.mount(host, {
      total,
      filled,
      cols: 10,
      cell: 18,
      colors: {
        on: WB_COLORS?.cat8 || "#AA0000",
        off: "#e8eaef",
      },
    });
  },

  _matrix(plot, rows, headers, config, w, h) {
    // simple numeric grid of first N categorical cols
    const numHeaders = headers.filter((col) =>
      rows.some((r) => this._num(r[col]) != null || r[col] === 0 || r[col] === 1)
    ).slice(0, 12);
    const idKey = this._pick(headers, ["iso3c", "country", "period"]) || headers[0];
    const sample = rows.slice(0, 25);
    const SVG = AtlasSVG;
    const svg = SVG.el(plot, "svg");
    svg.style.cssText = "width:100%;height:100%";
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    const cellW = (w - 100) / Math.max(numHeaders.length, 1);
    const cellH = (h - 40) / Math.max(sample.length, 1);
    sample.forEach((r, ri) => {
      numHeaders.forEach((col, ci) => {
        const v = this._num(r[col]) ?? (r[col] ? 1 : 0);
        const intensity = Math.max(0, Math.min(1, Math.abs(v) > 1 ? v / 100 : v));
        SVG.el(svg, "rect", {
          x: 90 + ci * cellW,
          y: 8 + ri * cellH,
          width: cellW - 2,
          height: cellH - 2,
          fill: `rgba(0,113,188,${0.15 + intensity * 0.85})`,
        });
      });
      SVG.el(svg, "text", {
        x: 86,
        y: 8 + ri * cellH + cellH * 0.7,
        "text-anchor": "end",
        "font-size": 9,
        fill: "#57626a",
      }).textContent = String(r[idKey] || "").slice(0, 10);
    });
  },

  _tablePreview(plot, rows, headers, w, h) {
    const tbl = document.createElement("div");
    tbl.style.cssText =
      "position:absolute;inset:8px;overflow:auto;font-size:12px;font-family:ui-monospace,monospace";
    const cols = headers.slice(0, 8);
    let html = "<table style='border-collapse:collapse;width:100%'><thead><tr>";
    cols.forEach((c) => {
      html += `<th style="text-align:left;border-bottom:1px solid #ddd;padding:4px 6px;position:sticky;top:0;background:#fff">${c}</th>`;
    });
    html += "</tr></thead><tbody>";
    rows.slice(0, 40).forEach((r) => {
      html += "<tr>";
      cols.forEach((c) => {
        html += `<td style="padding:3px 6px;border-bottom:1px solid #f0f0f0">${r[c] ?? ""}</td>`;
      });
      html += "</tr>";
    });
    html += `</tbody></table><p style="color:#8a969f">${rows.length} rows · showing first 40</p>`;
    tbl.innerHTML = html;
    plot.appendChild(tbl);
  },

  _yDomain(vals, config) {
    const nums = vals.filter((v) => v != null && Number.isFinite(v));
    if (!nums.length) return [0, 100];
    let min = Math.min(...nums);
    let max = Math.max(...nums);
    // unit interval (shares)
    if (max <= 1.5 && min >= 0) return [0, Math.max(1, max * 1.05)];
    // percentages that actually use the 0–100 range
    if (max > 40 && max <= 100 && min >= 0) return [0, 100];
    // small positive metrics (prosperity gap ~0–25, ratios, etc.)
    if (min >= 0 && max <= 40) return [0, max * 1.15];
    if (min >= 0) return [0, max * 1.08];
    const pad = (max - min) * 0.08 || 1;
    return [min - pad, max + pad];
  },

  _sampleTicks(vals, n) {
    const u = [...new Set(vals.filter((v) => v != null))].sort((a, b) => a - b);
    if (u.length <= n) return u;
    const out = [];
    for (let i = 0; i < n; i++) out.push(u[Math.round((i * (u.length - 1)) / (n - 1))]);
    return out;
  },
};
