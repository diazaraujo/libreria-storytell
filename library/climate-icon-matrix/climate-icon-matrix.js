/**
 * AtlasClimateIconMatrix
 * People-icon / cell matrix for climate vulnerability (goal_13).
 * Atlas copy: each of 1000 cells ≈ 8 million people.
 *
 * Mount once; setScene for narrative steps.
 */
(function (global) {
  const INSTANCES = new WeakMap();
  const CELL_M = 8; // million people per cell (Atlas note)
  const GRID = 1000;

  const REGION_ORDER = ["EAS", "ECS", "LCN", "MEA", "NAC", "SAS", "SSF"];
  const REGION_LABEL = {
    EAS: "East Asia & Pacific",
    ECS: "Europe & Central Asia",
    LCN: "Latin America & Caribbean",
    MEA: "Middle East & N. Africa",
    NAC: "North America",
    SAS: "South Asia",
    SSF: "Sub-Saharan Africa",
    WLD: "World",
  };

  function regionColor(code) {
    const r = (global.WB_COLORS && global.WB_COLORS.regions) || {};
    return r[code] || "#0071bc";
  }

  function aggregate(rows) {
    const by = new Map();
    let worldPop = 0;
    let worldVuln = 0;
    let worldRisk = 0;
    let worldExp = 0;
    (rows || []).forEach((r) => {
      const reg = r.region_code || "WLD";
      const pop = +r.totalpop || 0;
      const vuln = +r.pop_vuln || (+r.sha_vuln || 0) * pop;
      const risk = +r.pop_risk || (+r.sha_risk || 0) * pop;
      const exp = +r.exp_ || (+r.sha_exp || 0) * pop;
      if (!by.has(reg)) by.set(reg, { pop: 0, vuln: 0, risk: 0, exp: 0, n: 0 });
      const o = by.get(reg);
      o.pop += pop;
      o.vuln += vuln;
      o.risk += risk;
      o.exp += exp;
      o.n += 1;
      worldPop += pop;
      worldVuln += vuln;
      worldRisk += risk;
      worldExp += exp;
    });
    const regions = REGION_ORDER.filter((k) => by.has(k)).map((k) => {
      const o = by.get(k);
      return {
        code: k,
        label: REGION_LABEL[k] || k,
        pop: o.pop,
        vuln: o.vuln,
        risk: o.risk,
        exp: o.exp,
        sha_vuln: o.pop ? o.vuln / o.pop : 0,
        sha_risk: o.pop ? o.risk / o.pop : 0,
        sha_exp: o.pop ? o.exp / o.pop : 0,
        color: regionColor(k),
      };
    });
    return {
      regions,
      world: {
        pop: worldPop,
        vuln: worldVuln,
        risk: worldRisk,
        exp: worldExp,
        sha_vuln: worldPop ? worldVuln / worldPop : 0,
        sha_risk: worldPop ? worldRisk / worldPop : 0,
      },
      byCode: new Map(
        (rows || []).map((r) => [String(r.code || "").toUpperCase(), r])
      ),
    };
  }

  function countryPair(agg, a, b) {
    const ca = agg.byCode.get(a);
    const cb = agg.byCode.get(b);
    return { a: ca, b: cb };
  }

  function paintCells(svg, cells, w, h, margin) {
    // cells: [{fill, opacity}] length up to GRID, laid in 40 cols × 25 rows
    const cols = 40;
    const rows = Math.ceil(cells.length / cols);
    const innerW = w - margin.left - margin.right;
    const innerH = h - margin.top - margin.bottom;
    const cw = innerW / cols;
    const ch = Math.min(cw, innerH / rows);
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("transform", `translate(${margin.left},${margin.top})`);
    cells.forEach((c, i) => {
      const x = (i % cols) * cw;
      const y = Math.floor(i / cols) * ch;
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", x + 0.4);
      rect.setAttribute("y", y + 0.4);
      rect.setAttribute("width", Math.max(cw - 0.8, 0.5));
      rect.setAttribute("height", Math.max(ch - 0.8, 0.5));
      rect.setAttribute("rx", 0.6);
      rect.setAttribute("fill", c.fill);
      rect.setAttribute("opacity", c.opacity != null ? c.opacity : 1);
      g.appendChild(rect);
    });
    svg.appendChild(g);
    return { cols, rows, cw, ch };
  }

  function buildGlobalVulnCells(agg, emphasize) {
    // 1000 cells: filled = vulnerable share of world
    const nVuln = Math.round(Math.min(1, agg.world.sha_vuln) * GRID);
    const cells = [];
    for (let i = 0; i < GRID; i++) {
      const vuln = i < nVuln;
      let fill = vuln ? "#AA0000" : "#EBEEF4";
      let opacity = 1;
      if (emphasize === "SSF" && vuln) {
        // tint later third as SSF narrative accent
        fill = i < nVuln * 0.55 ? "#FF9800" : "#AA0000";
      }
      cells.push({ fill, opacity });
    }
    return { cells, nVuln };
  }

  function buildRegionRows(agg, focusCode) {
    // One row of 100 cells per region, filled by sha_vuln
    const rows = [];
    agg.regions.forEach((r) => {
      const n = 100;
      const filled = Math.round(Math.min(1, r.sha_vuln) * n);
      const dim = focusCode && r.code !== focusCode;
      const cells = [];
      for (let i = 0; i < n; i++) {
        cells.push({
          fill: i < filled ? r.color : "#EBEEF4",
          opacity: dim ? 0.25 : 1,
        });
      }
      rows.push({ region: r, cells, filled });
    });
    return rows;
  }

  function buildCountryCompare(agg, codeA, codeB, mode) {
    // Two blocks of 100 cells each
    const A = agg.byCode.get(codeA);
    const B = agg.byCode.get(codeB);
    const metric = mode === "exp" ? "sha_exp" : mode === "risk" ? "sha_risk" : "sha_vuln";
    const va = A ? +A[metric] : 0;
    const vb = B ? +B[metric] : 0;
    function block(v, color) {
      const filled = Math.round(Math.min(1, v) * 100);
      const cells = [];
      for (let i = 0; i < 100; i++) {
        cells.push({ fill: i < filled ? color : "#EBEEF4", opacity: 1 });
      }
      return { cells, v, filled };
    }
    return {
      a: { code: codeA, ...block(va, "#FF9800") },
      b: { code: codeB, ...block(vb, "#34A7F2") },
      metric,
    };
  }

  function mount(container, options = {}) {
    if (!container) throw new Error("container required");
    const {
      rows = [],
      sceneIndex = 0,
      sceneId = null,
      mode = "matrix", // matrix | compare
      height: heightOpt = null,
      reuse = true,
      forceRemount = false,
    } = options;

    if (reuse && !forceRemount && INSTANCES.has(container)) {
      const inst = INSTANCES.get(container);
      inst.agg = aggregate(rows);
      setScene(container, { sceneIndex, sceneId, mode });
      return inst.api;
    }
    if (INSTANCES.has(container)) {
      try {
        INSTANCES.get(container).api.destroy();
      } catch (_) {}
      INSTANCES.delete(container);
    }

    const agg = aggregate(rows);
    container.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-climate-matrix atlas-chart-root";
    const H = heightOpt || Math.max(420, container.clientHeight || 460);
    root.style.cssText = `position:relative;width:100%;height:${H}px;font-family:'Open Sans',system-ui,sans-serif;background:#fff`;
    container.appendChild(root);

    const header = document.createElement("div");
    header.style.cssText =
      "position:absolute;left:12px;top:8px;right:12px;z-index:2;font-size:13px;color:#111;font-weight:600";
    root.appendChild(header);

    const note = document.createElement("div");
    note.style.cssText =
      "position:absolute;left:12px;bottom:8px;z-index:2;font-size:11px;color:#6a7781";
    note.textContent = "Each square ≈ 8 million people";
    root.appendChild(note);

    const plot = document.createElement("div");
    plot.style.cssText = "position:absolute;inset:36px 8px 28px 8px";
    root.appendChild(plot);

    const inst = {
      root,
      header,
      note,
      plot,
      agg,
      mode,
      api: null,
    };

    function draw(sceneIndex, sceneId) {
      const w = plot.clientWidth || 860;
      const h = plot.clientHeight || 400;
      plot.innerHTML = "";
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      svg.style.cssText = "width:100%;height:100%;display:block";
      plot.appendChild(svg);

      const sid = String(sceneId || "");
      const idx = sceneIndex || 0;

      // Compare scenes for chapter 07
      if (
        sid.includes("bfa_ken") ||
        sid.includes("phl_vnm") ||
        (inst.mode === "compare" && idx < 3)
      ) {
        let codeA = "BFA",
          codeB = "KEN",
          metric = "vul";
        if (sid.includes("phl_vnm") || idx === 2) {
          codeA = "PHL";
          codeB = "VNM";
          metric = sid.includes("exp") ? "exp" : "vul";
        } else if (sid.includes("vul_exp") || idx === 1) {
          metric = "exp";
        }
        const cmp = buildCountryCompare(inst.agg, codeA, codeB, metric);
        header.textContent =
          metric === "exp"
            ? `${codeA} vs ${codeB} · share of population exposed`
            : `${codeA} vs ${codeB} · share of population vulnerable`;
        // two 10×10 grids side by side
        const names = global.ATLAS_COUNTRY_NAMES || {};
        const margin = { top: 28, right: 24, bottom: 16, left: 24 };
        const half = (w - margin.left - margin.right - 40) / 2;
        function grid(block, x0, label, color) {
          const cols = 10;
          const cw = half / cols;
          const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
          g.setAttribute("transform", `translate(${x0},${margin.top})`);
          block.cells.forEach((c, i) => {
            const rect = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "rect"
            );
            rect.setAttribute("x", (i % cols) * cw + 0.5);
            rect.setAttribute("y", Math.floor(i / cols) * cw + 0.5);
            rect.setAttribute("width", cw - 1);
            rect.setAttribute("height", cw - 1);
            rect.setAttribute("rx", 1);
            rect.setAttribute("fill", c.fill);
            g.appendChild(rect);
          });
          const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
          t.setAttribute("x", half / 2);
          t.setAttribute("y", -8);
          t.setAttribute("text-anchor", "middle");
          t.setAttribute("fill", color);
          t.setAttribute("font-size", "13");
          t.setAttribute("font-weight", "700");
          t.textContent = `${names[label] || label} · ${(block.v * 100).toFixed(0)}%`;
          g.appendChild(t);
          svg.appendChild(g);
        }
        grid(cmp.a, margin.left, codeA, "#FF9800");
        grid(cmp.b, margin.left + half + 40, codeB, "#34A7F2");
        return;
      }

      // Regional rows (scenes 1–2)
      if (idx === 1 || idx === 2 || sid.includes("region") || sid.includes("SSF")) {
        const focus = idx === 2 || sid.toUpperCase().includes("SSF") ? "SSF" : null;
        const regRows = buildRegionRows(inst.agg, focus);
        header.textContent = focus
          ? "Sub-Saharan Africa: highest vulnerability share"
          : "Vulnerability varies widely across regions";
        const margin = { top: 8, right: 120, bottom: 8, left: 8 };
        const rowH = (h - margin.top - margin.bottom) / regRows.length;
        regRows.forEach((rr, ri) => {
          const y0 = margin.top + ri * rowH;
          const cols = 100;
          const cw = (w - margin.left - margin.right) / cols;
          const ch = Math.min(cw, rowH * 0.7);
          rr.cells.forEach((c, i) => {
            const rect = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "rect"
            );
            rect.setAttribute("x", margin.left + i * cw);
            rect.setAttribute("y", y0 + (rowH - ch) / 2);
            rect.setAttribute("width", Math.max(cw - 0.4, 0.4));
            rect.setAttribute("height", ch);
            rect.setAttribute("fill", c.fill);
            rect.setAttribute("opacity", c.opacity);
            svg.appendChild(rect);
          });
          const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
          t.setAttribute("x", w - margin.right + 8);
          t.setAttribute("y", y0 + rowH / 2 + 4);
          t.setAttribute("fill", rr.region.color);
          t.setAttribute("font-size", "11");
          t.setAttribute("font-weight", "700");
          t.textContent = `${rr.region.code} ${(rr.region.sha_vuln * 100).toFixed(0)}%`;
          svg.appendChild(t);
        });
        return;
      }

      // Default: global 1000-cell waffle
      const emphasize = idx >= 2 ? "SSF" : null;
      const { cells, nVuln } = buildGlobalVulnCells(inst.agg, emphasize);
      header.textContent = emphasize
        ? "More than one-third of people live in highly vulnerable settings"
        : "Each row has 1,000 squares · vulnerable population share";
      paintCells(svg, cells, w, h, { top: 4, right: 8, bottom: 4, left: 8 });
      const pct = ((nVuln / GRID) * 100).toFixed(0);
      note.textContent = `Each square ≈ 8 million people · ~${pct}% cells = vulnerable (${nVuln}/${GRID})`;
    }

    const api = {
      setScene({ sceneIndex = 0, sceneId = null, mode } = {}) {
        if (mode) inst.mode = mode;
        draw(sceneIndex, sceneId);
      },
      destroy() {
        INSTANCES.delete(container);
        container.innerHTML = "";
      },
    };
    inst.api = api;
    INSTANCES.set(container, inst);
    draw(sceneIndex, sceneId);
    return api;
  }

  function setScene(container, opts) {
    const inst = INSTANCES.get(container);
    if (inst) inst.api.setScene(opts);
  }

  global.AtlasClimateIconMatrix = {
    mount,
    setScene,
    aggregate,
    CELL_M,
    GRID,
  };
})(typeof window !== "undefined" ? window : globalThis);
