/* Capital Trade × Unholster — "Cómo se arma un modelo quant estilo Jim Simons"
 *
 * Story sobre el motor de libreria-storytell (AtlasChapterScroll), tematizada Unholster.
 * TODOS los gráficos se PLOTEAN desde series reales (window.CT_DATA, generado por
 * capital-trade/cmf/export_chartdata.py) — no hay curvas dibujadas a mano. Con ejes,
 * ticks, gridlines, banda de confianza, N y tabla de desempeño.
 */
(function () {
  "use strict";
  var D = window.CT_DATA || {};

  // ---------- helpers de formato ----------
  function es(s) { return String(s).replace(/\./g, ","); }        // 9.7 -> 9,7
  function p1(x) { return es((x).toFixed(1)); }
  function p2(x) { return es((x).toFixed(2)); }
  function pct0(x) { return es(Math.round(x * 100)) + "%"; }        // fracción -> %
  function pctf(x, d) { return es((x * 100).toFixed(d == null ? 1 : d)) + "%"; }
  function signed(x, d) { var s = (x >= 0 ? "+" : ""); return s + es((x).toFixed(d == null ? 1 : d)); }

  // ---------- motor de escenas ----------
  var sc = 0;
  function S(text) { return { id: "s" + (sc++), text: text }; }
  function host(chartEl, viewBox, inner) {
    chartEl.innerHTML = '<svg class="ct" viewBox="' + viewBox + '" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;overflow:visible">' + inner + "</svg>";
    return chartEl.querySelector("svg.ct");
  }
  function controller(svg, n) {
    return { updateScene: function (i) {
      i = Math.max(0, Math.min(n - 1, i | 0));
      if (!svg.classList.contains("anim")) { svg.getBoundingClientRect(); svg.classList.add("anim"); }
      svg.setAttribute("data-scene", String(i));
    } };
  }
  function vis(cfg) {
    var n = cfg.scenes.length;
    return { id: cfg.id, type: "scroller", title: cfg.title, subtitle: cfg.subtitle, source: cfg.source,
      scenes: cfg.scenes, vhPerScene: cfg.vhPerScene || 0.92,
      mount: function (chartEl, ctx) {
        if (cfg.html) { chartEl.innerHTML = cfg.html; return { updateScene: function(){} }; }
        var svg = host(chartEl, cfg.viewBox || "0 0 680 400", cfg.inner);
        var c = controller(svg, n); c.updateScene((ctx && ctx.sceneIndex) || 0); return c;
      } };
  }

  // ---------- toolkit de gráficos (ejes, gridlines, ticks) ----------
  var M = { L: 56, R: 22, T: 20, B: 42, W: 680, H: 400 };
  function sx(v, d0, d1) { return M.L + (v - d0) / (d1 - d0) * (M.W - M.L - M.R); }
  function sy(v, v0, v1) { return (M.H - M.B) - (v - v0) / (v1 - v0) * (M.H - M.B - M.T); }
  function txt(x, y, s, o) { o = o || {};
    return '<text x="' + x + '" y="' + y + '" font-size="' + (o.size || 11) + '" fill="' + (o.fill || "#6B7280") + '"' +
      (o.anchor ? ' text-anchor="' + o.anchor + '"' : "") + (o.weight ? ' font-weight="' + o.weight + '"' : "") +
      (o.mono ? ' font-family="\'JetBrains Mono\',monospace"' : "") + (o.cls ? ' class="' + o.cls + '"' : "") +
      (o.dl ? ' style="transition-delay:' + o.dl + '"' : "") + ">" + s + "</text>";
  }
  function yGrid(v0, v1, ticks, fmt) {
    return ticks.map(function (t) { var y = sy(t, v0, v1);
      return '<line x1="' + M.L + '" y1="' + y.toFixed(1) + '" x2="' + (M.W - M.R) + '" y2="' + y.toFixed(1) + '" stroke="' + (t === 0 ? "#D6DBE2" : "#EEF0F3") + '"/>' +
        txt(M.L - 8, y + 3.5, fmt(t), { anchor: "end", size: 10, fill: "#9aa3ad", mono: true });
    }).join("");
  }
  function xTicks(d0, d1, ticks, fmt) {
    return ticks.map(function (t) { return txt(sx(t, d0, d1), M.H - M.B + 17, fmt(t), { anchor: "middle", size: 10, fill: "#9aa3ad", mono: true }); }).join("");
  }
  var COL = { blue: "#266FE0", bluedk: "#184D9B", green: "#10B981", greendk: "#0a7d5a", violet: "#8B5CF6",
    amber: "#F59E0B", amberdk: "#B87908", slate: "#94A3B8", red: "#EF4444", ink: "#171B21", mut: "#6B7280" };

  // ============================================================ GRÁFICOS (data real)

  // 1) DATOS — tiles de número grande (no barras de escalas incompatibles)
  function chartDatos() {
    var c = D.corpus || {};
    var tiles = [
      { v: (c.tx || 18991).toLocaleString("es-CL"), l: "transacciones de insiders", col: COL.blue },
      { v: "18", l: "años · precios de 131 acciones", col: COL.green, suf: "" },
      { v: (c.hechos || 1881).toLocaleString("es-CL"), l: "hechos esenciales CMF", col: COL.violet },
      { v: (c.identificados || 196).toLocaleString("es-CL"), l: "insiders identificados (RUT→persona)", col: COL.amber },
      { v: "~170", l: "fuentes de datos de Unholster", col: COL.ink },
      { v: (c.empresas || 187).toLocaleString("es-CL"), l: "emisores cubiertos", col: COL.slate },
    ];
    var cw = 214, ch = 108, gx = 18, gy = 16, x0 = 8, y0 = 24;
    var s = "";
    tiles.forEach(function (t, i) {
      var cx = x0 + (i % 3) * (cw + gx), cy = y0 + Math.floor(i / 3) * (ch + gy);
      var dl = (0.06 * i) + "s";
      s += '<g class="pop" style="transition-delay:' + dl + '">' +
        '<rect x="' + cx + '" y="' + cy + '" width="' + cw + '" height="' + ch + '" rx="12" fill="#fff" stroke="#E9ECF1"/>' +
        '<rect x="' + cx + '" y="' + cy + '" width="4" height="' + ch + '" rx="2" fill="' + t.col + '"/>' +
        txt(cx + 18, cy + 52, t.v, { size: 34, weight: 800, fill: COL.ink, mono: true }) +
        txt(cx + 18, cy + 78, t.l, { size: 12, fill: COL.mut }) + "</g>";
    });
    return s;
  }

  // 2) EVENT-STUDY — CAR diario real + banda IC95 + N
  function chartEvent() {
    var hb = D.car && D.car.hold_band, nat = D.car && D.car.nat;
    if (!hb) return txt(300, 200, "sin data", { anchor: "middle" });
    var v0 = -3, v1 = 13, d0 = 0, d1 = 60;
    var band = "M" + hb.curve.map(function (p) { return sx(p.d, d0, d1).toFixed(1) + "," + sy(p.hi, v0, v1).toFixed(1); }).join(" L") +
      " L" + hb.curve.slice().reverse().map(function (p) { return sx(p.d, d0, d1).toFixed(1) + "," + sy(p.lo, v0, v1).toFixed(1); }).join(" L") + " Z";
    var mean = "M" + hb.curve.map(function (p) { return sx(p.d, d0, d1).toFixed(1) + "," + sy(p.m, v0, v1).toFixed(1); }).join(" L");
    var natln = nat ? "M" + nat.curve.map(function (p) { return sx(p.d, d0, d1).toFixed(1) + "," + sy(p.m, v0, v1).toFixed(1); }).join(" L") : "";
    var ex = sx(60, d0, d1), ey = sy(hb.end, v0, v1);
    return yGrid(v0, v1, [0, 5, 10], function (t) { return t + "%"; }) +
      xTicks(d0, d1, [0, 20, 40, 60], function (t) { return t + "d"; }) +
      txt(M.L, M.T - 6, "Retorno abnormal acumulado tras la compra (vs mercado)", { size: 10.5, fill: "#9aa3ad" }) +
      '<path class="fade" d="' + band + '" fill="' + COL.blue + '" fill-opacity="0.14" stroke="none"/>' +
      (natln ? '<path class="rev1" d="' + natln + '" fill="none" stroke="' + COL.slate + '" stroke-width="2" stroke-dasharray="5 4"/>' : "") +
      '<path class="draw" d="' + mean + '" fill="none" stroke="' + COL.blue + '" stroke-width="2.6"/>' +
      '<g class="pop" style="transition-delay:1.1s"><circle cx="' + ex.toFixed(1) + '" cy="' + ey.toFixed(1) + '" r="4.5" fill="' + COL.blue + '"/>' +
        txt(ex - 6, ey - 10, signed(hb.end) + "%", { anchor: "end", size: 14, weight: 800, fill: COL.bluedk }) + "</g>" +
      txt(M.L + 8, sy(6.2, v0, v1), "HOLDING del director", { size: 11, weight: 700, fill: COL.bluedk, cls: "fade", dl: ".5s" }) +
      txt(M.W - M.R, sy(-1.6, v0, v1), "persona natural: " + signed(nat.end) + "% (N=" + nat.n + ")", { anchor: "end", size: 10.5, fill: COL.mut, cls: "rev1" }) +
      '<g class="fade" style="transition-delay:1.3s">' +
        txt(ex - 16, ey + 18, "t=" + es(hb.t) + " · N=" + hb.n, { anchor: "end", size: 10, fill: COL.mut, mono: true }) + "</g>" +
      txt(M.L, M.H - 4, "banda = IC 95% · abnormal vs mercado equal-weight de líquidos · fecha de comunicación", { size: 9.5, fill: "#b3bac3" });
  }

  // 3) BANDAS — barras reales con IC (error bar), t y n; color = significancia
  function chartBandas() {
    var b = D.bands || [];
    var v0 = -2, v1 = 13, n = b.length, bw = 78, gap = (M.W - M.L - M.R - n * bw) / (n + 1);
    var s = yGrid(v0, v1, [0, 5, 10], function (t) { return t + "%"; });
    b.forEach(function (d, i) {
      var x = M.L + gap + i * (bw + gap), sig = Math.abs(d.t) >= 1.96, col = sig ? COL.blue : COL.slate;
      var y = sy(d.m, v0, v1), y0 = sy(0, v0, v1), hgt = Math.abs(y0 - y);
      var elo = sy(d.lo, v0, v1), ehi = sy(d.hi, v0, v1), cx = x + bw / 2;
      s += '<rect class="grow" x="' + x + '" y="' + Math.min(y, y0) + '" width="' + bw + '" height="' + Math.max(1, hgt) + '" rx="4" fill="' + col + '" style="transition-delay:' + (0.08 * i) + 's"/>';
      s += '<g class="fade" style="transition-delay:' + (0.4 + 0.08 * i) + 's">' +
        '<line x1="' + cx + '" y1="' + ehi + '" x2="' + cx + '" y2="' + elo + '" stroke="' + COL.ink + '" stroke-width="1.2" opacity="0.55"/>' +
        '<line x1="' + (cx - 5) + '" y1="' + ehi + '" x2="' + (cx + 5) + '" y2="' + ehi + '" stroke="' + COL.ink + '" stroke-width="1.2" opacity="0.55"/>' +
        '<line x1="' + (cx - 5) + '" y1="' + elo + '" x2="' + (cx + 5) + '" y2="' + elo + '" stroke="' + COL.ink + '" stroke-width="1.2" opacity="0.55"/>' +
        txt(cx, ehi - 7, signed(d.m) + "%", { anchor: "middle", size: 12.5, weight: 800, fill: sig ? COL.bluedk : COL.mut }) + "</g>";
      s += txt(cx, M.H - M.B + 17, d.label, { anchor: "middle", size: 10.5, fill: COL.ink, weight: (d.label.indexOf("10") === 0 || d.label.indexOf("$10") === 0) ? 700 : 400 });
      s += txt(cx, M.H - M.B + 31, "t=" + es(d.t) + " · n=" + d.n, { anchor: "middle", size: 9, fill: "#9aa3ad", mono: true });
    });
    s += txt(M.W - M.R, M.T - 6, "azul = significativo (|t| ≥ 1,96)", { anchor: "end", size: 10, fill: "#9aa3ad" });
    return s;
  }

  // 4) MOTOR — spread del factor momentum por AÑO (regime), real
  function chartMotor() {
    var yrs = (D.momentum && D.momentum.years) || [];
    var vals = yrs.map(function (y) { return y.v; }).filter(function (v) { return v != null; });
    var v0 = Math.min(-6, Math.floor(Math.min.apply(null, vals))), v1 = Math.max(11, Math.ceil(Math.max.apply(null, vals)));
    var n = yrs.length, bw = (M.W - M.L - M.R) / n * 0.68, step = (M.W - M.L - M.R) / n;
    var s = yGrid(v0, v1, [-5, 0, 5, 10], function (t) { return signed(t, 0) + "%"; });
    yrs.forEach(function (y, i) {
      if (y.v == null) return;
      var cx = M.L + step * (i + 0.5), x = cx - bw / 2, yv = sy(y.v, v0, v1), y0 = sy(0, v0, v1);
      var col = y.v >= 0 ? COL.green : COL.red;
      s += '<rect class="grow" x="' + x.toFixed(1) + '" y="' + Math.min(yv, y0).toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + Math.max(1, Math.abs(yv - y0)).toFixed(1) + '" rx="2.5" fill="' + col + '" style="transition-delay:' + (0.03 * i) + 's"/>';
    });
    [2010, 2014, 2018, 2022, 2026].forEach(function (yr) {
      var i = yrs.findIndex(function (y) { return +y.y === yr; });
      if (i >= 0) s += txt(M.L + step * (i + 0.5), M.H - M.B + 17, yr, { anchor: "middle", size: 10, fill: "#9aa3ad", mono: true });
    });
    s += txt(M.L, M.T - 6, "Spread anual del factor momentum 12-1 (long-short)", { size: 10.5, fill: "#9aa3ad" });
    s += txt(M.W - M.R, M.T - 6, "verde = positivo · rojo = negativo", { anchor: "end", size: 10, fill: "#9aa3ad" });
    return s;
  }

  // 5) COSTOS — escalera de honestidad real (CAGR neto) vs benchmark
  function chartLadder() {
    var L = (D.ladder || []).slice(0, 3);
    var v0 = 0, v1 = 24, n = L.length, bw = 96, gap = (M.W - M.L - M.R - n * bw) / (n + 1);
    var bench = L.length ? L[0].cagr_bench * 100 : 10.2;
    var s = yGrid(v0, v1, [0, 10, 20], function (t) { return t + "%"; });
    var by = sy(bench, v0, v1);
    s += '<line class="draw" x1="' + M.L + '" y1="' + by.toFixed(1) + '" x2="' + (M.W - M.R) + '" y2="' + by.toFixed(1) + '" stroke="' + COL.slate + '" stroke-width="1.5" stroke-dasharray="5 4"/>';
    s += txt(M.W - M.R, by - 6, "benchmark líquido " + p1(bench) + "%", { anchor: "end", size: 10, fill: COL.mut });
    L.forEach(function (d, i) {
      var v = d.cagr_port * 100, x = M.L + gap + i * (bw + gap), y = sy(v, v0, v1), y0 = sy(0, v0, v1);
      s += '<rect class="grow" x="' + x + '" y="' + y.toFixed(1) + '" width="' + bw + '" height="' + (y0 - y).toFixed(1) + '" rx="5" fill="' + COL.blue + '" style="transition-delay:' + (0.12 * i) + 's"/>';
      s += txt(x + bw / 2, y - 8, p1(v) + "%", { anchor: "middle", size: 14, weight: 800, fill: COL.bluedk, cls: "fade", dl: (0.5 + 0.12 * i) + "s" });
      var lab = ["bruto", "− costos (60 bps)", "+ solo líquidos"][i] || d.label;
      s += txt(x + bw / 2, M.H - M.B + 18, lab, { anchor: "middle", size: 11, fill: COL.ink });
    });
    s += txt(M.L, M.T - 6, "CAGR de la estrategia, descontando realismo", { size: 10.5, fill: "#9aa3ad" });
    return s;
  }

  // 6) BANDIT — camino de pesos REAL (144 meses), stacked area
  function chartBandit() {
    var W = D.wpath || []; if (!W.length) return txt(300, 200, "sin data", { anchor: "middle" });
    var order = ["momentum", "residual", "quality", "hechos", "baja-beta", "insider"];
    var colf = { momentum: COL.blue, residual: COL.violet, quality: COL.amber, hechos: "#0EA5A3", "baja-beta": COL.green, insider: COL.slate };
    var d0 = 0, d1 = W.length - 1, v0 = 0, v1 = 1;
    var layers = order.map(function () { return []; });
    W.forEach(function (m, i) {
      var acc = 0, tot = order.reduce(function (a, k) { return a + (m[k] || 0); }, 0) || 1;
      order.forEach(function (k, li) { var lo = acc; acc += (m[k] || 0) / tot; layers[li].push([i, lo, acc]); });
    });
    var s = '<defs><clipPath id="ctB"><rect class="growx" x="' + M.L + '" y="0" width="' + (M.W - M.L - M.R) + '" height="' + M.H + '"/></clipPath></defs>';
    s += yGrid(v0, v1, [0, 0.5, 1], function (t) { return Math.round(t * 100) + "%"; });
    s += '<g clip-path="url(#ctB)">';
    layers.forEach(function (pts, li) {
      var top = pts.map(function (p) { return sx(p[0], d0, d1).toFixed(1) + "," + sy(p[2], v0, v1).toFixed(1); });
      var bot = pts.slice().reverse().map(function (p) { return sx(p[0], d0, d1).toFixed(1) + "," + sy(p[1], v0, v1).toFixed(1); });
      s += '<path d="M' + top.join(" L") + " L" + bot.join(" L") + ' Z" fill="' + colf[order[li]] + '" fill-opacity="0.85"/>';
    });
    s += "</g>";
    ["2013", "2016", "2019", "2022", "2026"].forEach(function (yr) {
      var i = W.findIndex(function (m) { return m.mes.slice(0, 4) === yr; });
      if (i >= 0) s += txt(sx(i, d0, d1), M.H - M.B + 17, yr, { anchor: "middle", size: 10, fill: "#9aa3ad", mono: true });
    });
    var lx = M.L, ly = M.T - 6;
    s += '<g class="fade" style="transition-delay:.8s">';
    order.forEach(function (k) { var w = k.length * 6.2 + 22;
      s += '<rect x="' + lx + '" y="' + (ly - 8) + '" width="9" height="9" rx="2" fill="' + colf[k] + '"/>' + txt(lx + 13, ly, k, { size: 10, fill: "#33383f" }); lx += w; });
    s += "</g>";
    return s;
  }

  // 7) TABLA de desempeño (HTML)
  function tablaHTML() {
    var f = D.factores || {}, pm = D.peso_medio || {}, ad = D.adaptativo || {}, ew = D.equal_weight || {};
    var rows = [
      ["momentum", f.momentum], ["residual", f.residual], ["quality", f.quality],
      ["hechos", f.hechos], ["baja-beta", f["baja-beta"]], ["insider", f.insider],
    ];
    function cell(v, kind) {
      if (v == null) return "—";
      if (kind === "pct") return pctf(v, 1);
      if (kind === "dd") return pct0(v);
      return es(v.toFixed(2));
    }
    function irc(v) { return '<td class="num ' + (v >= 0 ? "pos" : "neg") + '">' + (v >= 0 ? "+" : "") + es(v.toFixed(2)) + "</td>"; }
    var body = rows.map(function (r) { var k = r[0], s = r[1] || {};
      return '<tr><td>' + k + "</td>" +
        '<td class="num">' + cell(s.ann_ret, "pct") + "</td>" +
        '<td class="num">' + cell(s.vol, "pct") + "</td>" +
        '<td class="num">' + cell(s.sharpe) + "</td>" +
        irc(s.info_ratio || 0) +
        '<td class="num">' + cell(s.maxdd, "dd") + "</td>" +
        '<td class="num">' + (pm[k] != null ? pct0(pm[k]) : "—") + "</td></tr>";
    }).join("");
    var foot = '<tr class="mut"><td>equal-weight</td><td class="num">' + pctf(ew.ann_ret) + '</td><td class="num">' + pctf(ew.vol) + '</td><td class="num">' + es(ew.sharpe.toFixed(2)) + '</td>' + irc(ew.info_ratio) + '<td class="num">' + pct0(ew.maxdd) + '</td><td class="num">—</td></tr>' +
      '<tr class="hi"><td>adaptativo (bandit)</td><td class="num">' + pctf(ad.ann_ret) + '</td><td class="num">' + pctf(ad.vol) + '</td><td class="num">' + es(ad.sharpe.toFixed(2)) + '</td>' + irc(ad.info_ratio) + '<td class="num">' + pct0(ad.maxdd) + '</td><td class="num">100%</td></tr>';
    return '<div class="ct-table"><table><caption>Desempeño por factor · walk-forward mensual · ' + (D.factores && D.factores.momentum ? D.factores.momentum.n : 144) + ' meses</caption>' +
      '<thead><tr><th>Señal</th><th>Ret/a</th><th>Vol</th><th>Sharpe</th><th>IR</th><th>MaxDD</th><th>Peso medio</th></tr></thead>' +
      "<tbody>" + body + foot + "</tbody></table></div>";
  }

  // 8) HEDGE — small multiples: 3 métricas, sin hedge vs con hedge
  function chartHedge() {
    var h = D.hedge || {}, lo = h.long || {}, hd = h.hedge || {};
    var panels = [
      { t: "Sharpe", a: lo.sharpe, b: hd.sharpe, max: 0.24, fmt: function (v) { return es(v.toFixed(2)); } },
      { t: "Max drawdown", a: Math.abs(lo.maxdd), b: Math.abs(hd.maxdd), max: 0.6, fmt: function (v) { return "−" + Math.round(v * 100) + "%"; }, worse: true },
      { t: "Beta al mercado", a: h.beta_long, b: h.beta_hedge, max: 0.55, min: -0.15, fmt: function (v) { return es(v.toFixed(2)); } },
    ];
    var pw = (M.W - M.L - M.R) / 3, base = M.H - M.B - 6, top = M.T + 22;
    var s = "";
    panels.forEach(function (p, pi) {
      var px = M.L + pi * pw, cx0 = px + pw * 0.30, cx1 = px + pw * 0.62, bw = pw * 0.20;
      var vmin = p.min || 0, vmax = p.max;
      function h4(v) { return (v - vmin) / (vmax - vmin) * (base - top); }
      function y4(v) { return base - h4(v); }
      s += txt(px + pw / 2, top - 8, p.t, { anchor: "middle", size: 11, weight: 700, fill: COL.ink });
      // zero baseline for beta
      var zb = base - h4(0);
      s += '<line x1="' + px + '" y1="' + zb.toFixed(1) + '" x2="' + (px + pw - 12) + '" y2="' + zb.toFixed(1) + '" stroke="#EEF0F3"/>';
      [[cx0, p.a, COL.slate, "sin hedge"], [cx1, p.b, COL.blue, "con hedge"]].forEach(function (bar, bi) {
        var v = bar[1], yv = y4(v), h0 = Math.abs(yv - zb);
        s += '<rect class="grow" x="' + bar[0] + '" y="' + Math.min(yv, zb).toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + Math.max(1, h0).toFixed(1) + '" rx="3" fill="' + bar[2] + '" style="transition-delay:' + (0.15 * pi + 0.1 * bi) + 's"/>';
        s += txt(bar[0] + bw / 2, (v >= 0 ? yv - 7 : yv + 13), p.fmt(v), { anchor: "middle", size: 12, weight: 800, fill: bi ? COL.bluedk : COL.mut, cls: "fade", dl: (0.5 + 0.15 * pi) + "s" });
        s += txt(bar[0] + bw / 2, base + 16, bar[3], { anchor: "middle", size: 9, fill: "#9aa3ad" });
      });
    });
    return s;
  }

  // 9) CIERRE — métricas de esfuerzo (sin venn)
  function chartCierre() {
    var m = [["6", "días"], ["~30", "módulos"], ["6", "factores"], ["+1", "señal = horas"]];
    var s = txt(M.W / 2, M.T + 30, "De la idea al motor validado", { anchor: "middle", size: 13, weight: 700, fill: COL.ink, cls: "fade" });
    m.forEach(function (d, i) {
      var cx = M.L + (i + 0.5) * (M.W - M.L - M.R) / 4;
      s += '<g class="pop" style="transition-delay:' + (0.15 * i) + 's">' +
        txt(cx, 180, d[0], { anchor: "middle", size: 48, weight: 800, fill: COL.bluedk, mono: true }) +
        txt(cx, 210, d[1], { anchor: "middle", size: 13, fill: COL.mut }) + "</g>";
    });
    s += txt(M.W / 2, 270, "y sumar la próxima señal cuesta horas, no meses", { anchor: "middle", size: 12.5, fill: COL.mut, cls: "fade", dl: ".8s" });
    return s;
  }

  // ============================================================ STORY
  var ad = D.adaptativo || {}, mm = (D.momentum && D.momentum.walk_forward) || {}, ls = (D.momentum && D.momentum.long_short) || {};
  var hb = (D.car && D.car.hold_band) || {}, pmBB = (D.peso_medio && D.peso_medio["baja-beta"]) || 0.22;

  window.CT_STORY = {
    title: "Cómo se arma un modelo quant estilo Jim Simons",
    hero: {
      kicker: "La unión de dos mundos · caso real",
      title: "Cómo se arma un modelo quant estilo Jim Simons",
      lead: "No se busca una fórmula mágica, sino una máquina: juntar toda la data, encontrar señales que persistan y combinarlas con disciplina. Renaissance no ganó con una idea genial — ganó con muchas señales débiles, medidas sin autoengaño. Este es ese proceso, sobre el mercado chileno, con la data de Unholster. Cada gráfico es data real.",
      byline: "Un ejemplo Capital Trade × Unholster · datos públicos reales · las cifras salen de corridas reproducibles.",
      bg: "#0A1E4D",
      particles: { mode: "plume", color: "#266FE0", count: 560, opacity: 0.5, biasLeft: 0.5, biasY: 0.5 },
      keyFacts: [
        { value: "18.991", label: "transacciones de insiders analizadas" },
        { value: signed(hb.end || 9.7) + "%", label: "abnormal a 60d cuando compra el holding de un director (t=" + es(hb.t || 6.4) + ")" },
        { value: "IR " + es((ad.info_ratio || 0.45).toFixed(2)), label: "del asignador adaptativo, walk-forward" },
      ],
    },
    blocks: [
      { type: "prose", id: "intro", html:
        '<h2 class="u-h2">El sueño Medallion, aterrizado</h2>' +
        "<p>El mejor fondo de la historia no adivinó el futuro. Recolectó <strong>toda la data que pudo</strong>, buscó patrones que persistieran y los combinó. La ventaja no fue una fórmula — fue la <strong>máquina</strong>.</p>" +
        "<p>Unholster ya tiene esa máquina de datos. Lo que sigue es apuntarla al mercado — paso a paso, y con los números a la vista.</p>" },

      vis({ id: "datos", title: "Los datos", subtitle: "Primero, recolectar toda la materia prima",
        source: "CMF · Bolsa de Santiago · fuentes Unholster", inner: chartDatos(),
        scenes: [S("En días armamos el corpus: <b>18.991</b> transacciones de insiders, 18 años de precios, hechos esenciales, y —clave— las <b>~170 fuentes</b> de Unholster para cruzar el RUT y saber <b>quién es quién</b>. Todo dato público real.")] }),

      vis({ id: "senal", title: "La primera señal", subtitle: "Cuando el holding de un director compra",
        source: "Event-study propio · universo líquido · fecha de comunicación", inner: chartEvent(),
        scenes: [
          S("Idea clásica del mercado: seguí a los que saben. Con un event-study sobre <b>" + (hb.n || 133) + " compras reales</b>, el precio corre <b>" + signed(hb.end || 9.7) + "% sobre el mercado</b> a 60 días (t=" + es(hb.t || 6.4) + "). La banda sombreada es el intervalo de confianza al 95% — la incertidumbre, a la vista."),
          S("Y el hallazgo <b>contraintuitivo</b>: el edge no está en el ejecutivo como <b>persona</b> (línea gris, ~0), sino en su <b>sociedad de inversión</b> acumulando. Distinguir uno de otro ya obliga a cruzar identidad — justo lo que hace la máquina."),
        ] }),

      vis({ id: "bandas", title: "Dónde está el edge", subtitle: "La compra moderada es la que más paga",
        source: "Abnormal 60d por banda de monto · barras de error = IC 95%", inner: chartBandas(),
        scenes: [
          S("¿Importa el tamaño de la compra? Uno esperaría que la <b>grande</b> —la estructural— sea la que más dice."),
          S("La que más paga es la <b>oportunista de $10–50 MM</b> (+9,7%, t=6,4). La grande sí dice algo (+4,2%, t=3,3), pero la de tamaño medio manda; la banda intermedia es ruido. El color marca lo <b>significativo</b>."),
        ] }),

      { type: "prose", id: "puente", html:
        '<h2 class="u-h2">Una señal no es una estrategia</h2>' +
        "<p>Por evento la señal es fuerte. Pero como <strong>cartera sola</strong> es esparsa: hay ~2–3 nombres activos a la vez, queda <strong>~70% en caja</strong> y su alpha standalone es ≈ 0. Descontá costos y exigí liquidez y el brillo se apaga.</p>" +
        "<p>Veredicto honesto: el insider es una <strong>alerta</strong>, no un motor. Decirlo es lo que separa a un quant de un vendedor — así que fuimos a buscar el motor de verdad.</p>" },

      vis({ id: "motor", title: "El motor real", subtitle: "Momentum, validado sin trampa",
        source: "Momentum 12-1 · universo point-in-time · walk-forward", inner: chartMotor(),
        scenes: [S("Buscando en serio apareció el motor: <b>momentum</b>. Acá está el spread <b>año por año</b> (2010–2026): paga en años tendenciales, pierde en los choppy — <b>régimen-dependiente</b>, sin esconderlo. Validado point-in-time: factor long-short Sharpe <b>" + es((ls.sharpe || 1.19).toFixed(2)) + "</b>; la versión investable long-only rinde IR <b>" + es((mm.info_ratio || 0.44).toFixed(2)) + "</b>. Los dos números, a la vista.")] }),

      vis({ id: "costos", title: "El abogado del diablo del backtest", subtitle: "Descontá costos y liquidez",
        source: "Escalera de realismo · CAGR neto vs benchmark", inner: chartLadder(),
        scenes: [S("Un backtest bonito no es plata. Descontamos <b>costos</b> (60 bps) y exigimos que sea <b>transable</b> (ADV ≥ 500 MM$/día). El retorno baja de 20,2% a <b>11,8%</b> — sigue por encima del benchmark (10,2%), pero mucho más modesto. El número honesto no es el bruto.")] }),

      vis({ id: "bandit", title: "El corazón del modelo", subtitle: "No descartar: dejar que la data elija",
        source: "Asignador adaptativo (bandit) · pesos reales, 144 meses", inner: chartBandit(),
        scenes: [S("El instinto es quedarse con el mejor factor y botar el resto. <b>Error.</b> Cableamos <b>todas</b> las señales y un bandit las pondera por su desempeño reciente — nunca a cero. Acá está el <b>camino de pesos real</b>, mes a mes: rota con el régimen. La baja-beta que quisimos botar promedió <b>" + pct0(pmBB) + "</b> de peso.")] }),

      vis({ id: "tabla", title: "La cuenta honesta", subtitle: "Cada señal, medida — y la mezcla les gana",
        source: "Walk-forward mensual · neto", html: tablaHTML(),
        scenes: [S("La tabla completa, sin adornos: cada señal con su retorno, Sharpe, Information Ratio y drawdown. Ninguna es espectacular sola — el <b>insider como factor mensual hasta resta</b> (IR negativo). Pero el <b>adaptativo</b> (última fila) le gana a todas y al promedio ingenuo: IR " + es((ad.info_ratio || 0.45).toFixed(2)) + " vs " + es(((D.equal_weight || {}).info_ratio || 0.26).toFixed(2)) + ". Esa es la tesis Renaissance en una fila.")] }),

      vis({ id: "hedge", title: "La ejecución", subtitle: "Aislar el alpha del mercado",
        source: "Libro momentum USD · short de ECH, 2011–26", inner: chartHedge(),
        scenes: [S("El alpha es genuinamente <b>market-neutral</b>. Al cubrir el beta con un short del ETF de Chile, la <b>beta cae de 0,45 a −0,10</b>, el <b>drawdown se aplana de −53% a −33%</b> y el Sharpe salta. El cuello de botella no es la estrategia: es la <b>plomería</b> — shortear en Chile es inviable a este tamaño, la ruta es un prime broker en EE.UU.")] }),

      vis({ id: "cierre", title: "La máquina", subtitle: "La unión de dos mundos", inner: chartCierre(),
        source: "Capital Trade × Unholster",
        scenes: [S("No vendemos una máquina de hacer plata probada. Construimos un <b>motor validado</b> y una <b>fábrica de señales</b>: sumar el próximo candidato (value, la familia de los insiders, otra fuente) cuesta <b>horas</b>. Un motor quant multi-factor, honesto, en 6 días. Eso es el potencial cuando se juntan los dos mundos: el mercado pone la idea, Unholster la máquina.")] }),

      { type: "prose", id: "final", html:
        '<div class="u-endbox">' +
        '<div class="k">Y ahora</div><h3>Lo que falta no es research — es infraestructura</h3>' +
        "<p>El código está maduro. Los tres pendientes (factor value, sesgo de supervivencia, short real) convergen en <b style=\"color:#fff\">una</b> decisión operativa: abrir un prime broker en EE.UU. + un data vendor. Después, un piloto en vivo de 60–90 días antes de escalar.</p>" +
        '<div class="tag">Capital Trade pone el mercado y la estructura · Unholster pone la máquina · la unión pone el motor</div></div>' +
        '<div class="u-foot"><b>Capital Trade × Unholster</b> · documento de trabajo, uso interno. Todas las cifras salen de corridas reales y reproducibles sobre data pública (cmf/export_chartdata.py). El factor long-short (Sharpe ' + es((ls.sharpe || 1.19).toFixed(2)) + ') es bruto y no investable; el número para capital es el long-only (IR ~' + es((mm.info_ratio || 0.44).toFixed(2)) + '). No constituye asesoría ni recomendación de inversión.</div>' },
    ],
  };
})();
