/**
 * poverty_scroller — country poverty paths with scene choreography (CdkPgD4t.js)
 * Focus series: KOR→JPN/THA/BGD/CHN→BRA/TUR→RWA + on-track / left-behind cohorts
 */
window.AtlasReplica = {
  ready: true,
  isStub: false,
  async render(scene, ctx) {
    const { chartEl, hidePlaceholder, sceneIndex } = ctx;
    hidePlaceholder();
    const [rows, proj] = await Promise.all([
      AtlasLoad.csv("./data/country_poverty.csv"),
      AtlasLoad.csv("./data/takingoff_projections.csv"),
    ]);

    const NAMES = window.ATLAS_COUNTRY_NAMES || {};
    const byIso = new Map();
    rows.forEach((r) => {
      const year = +r.year, v = +r.value;
      if (!Number.isFinite(year) || !Number.isFinite(v)) return;
      if (!byIso.has(r.iso3c)) byIso.set(r.iso3c, []);
      byIso.get(r.iso3c).push({ year, value: v });
    });
    byIso.forEach((pts) => pts.sort((a, b) => a.year - b.year));

    const COLORS = {
      KOR: "#F3578E", JPN: "#e879a8", THA: "#f9a8c9", CHN: "#be185d",
      BGD: "#4EC2C0", BRA: "#0C7C68", TUR: "#AA0000", RWA: "#FF9800",
    };
    // Atlas focus series with scene visibility
    const FOCUS = [
      { iso: "KOR", visible: [0, 1, 2, 3, 4, 5, 6], transparent: [4, 5, 6], labelX: 1970 },
      { iso: "JPN", visible: [1, 2, 3, 4, 5, 6], transparent: [4, 5, 6], labelX: 1958 },
      { iso: "THA", visible: [1, 2, 3, 4, 5, 6], transparent: [4, 5, 6], labelX: 1978 },
      { iso: "BGD", visible: [1, 2, 3, 4, 5, 6], transparent: [4, 5, 6], labelX: 1995 },
      { iso: "CHN", visible: [1, 2, 3, 4, 5, 6], transparent: [4, 5, 6], labelX: 1998 },
      { iso: "BRA", visible: [4, 5, 6], transparent: [5, 6], labelX: 1984 },
      { iso: "TUR", visible: [4, 5, 6], transparent: [5, 6], labelX: 1996 },
      { iso: "RWA", visible: [5, 6], transparent: [], labelX: 2022 },
    ];
    const ON_TRACK = ["BEN", "BFA", "CIV", "DJI", "HND", "RWA", "SEN", "STP", "TGO", "ZAF"];
    const LEFT = ["AGO", "BDI", "BWA", "CAF", "CMR", "COD", "COG", "ETH", "GHA", "GMB",
      "GNB", "HTI", "KEN", "LBR", "LSO", "MDG", "MLI", "MOZ", "MWI", "NAM", "NER", "NGA",
      "PAK", "PNG", "SDN", "SLE", "SSD", "SWZ", "SYR", "TCD", "TLS", "TZA", "UGA", "YEM", "ZMB", "ZWE"];

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText = "position:relative;width:100%;height:100%;font-family:'Open Sans',system-ui,sans-serif;background:#fff";
    chartEl.appendChild(root);

    const w = root.clientWidth || 900;
    const h = root.clientHeight || 480;
    const margin = { top: 32, right: 32, bottom: 46, left: 44 };
    const svg = AtlasSVG.el(root, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.cssText = "width:100%;height:100%;display:block";

    // x domain shifts: scenes 0–5 historical; 6–8 extend / zoom modern
    const xDomain = sceneIndex > 5 ? [2000, 2050] : [1950, 2025];
    const yMax = sceneIndex === 8 ? 90 : 70;
    const xScale = AtlasSVG.scaleLinear(xDomain, [margin.left, w - margin.right]);
    const yScale = AtlasSVG.scaleLinear([0, yMax], [h - margin.bottom, margin.top]);

    // grids
    const yTicks = sceneIndex === 8 ? [0, 10, 30, 50, 70, 90] : [0, 10, 30, 50, 70];
    yTicks.forEach((t) => {
      AtlasSVG.el(svg, "line", {
        x1: margin.left, x2: w - margin.right, y1: yScale(t), y2: yScale(t), stroke: "#f1f5f9",
      });
      AtlasSVG.el(svg, "text", {
        x: margin.left - 8, y: yScale(t) + 4, "text-anchor": "end",
        fill: "#6a7781", "font-size": 11,
      }).textContent = t + "%";
    });
    const xTicks = sceneIndex === 0
      ? [1950, 1965, 1977, 1990, 2010, 2025]
      : sceneIndex < 5
        ? [1950, 1970, 1990, 2010, 2025]
        : sceneIndex > 5
          ? [2000, 2015, 2025, 2050]
          : [1950, 1970, 1990, 2010, 2025];
    xTicks.forEach((yr) => {
      if (yr < xDomain[0] || yr > xDomain[1]) return;
      AtlasSVG.el(svg, "text", {
        x: xScale(yr), y: h - margin.bottom + 20, "text-anchor": "middle",
        fill: "#6a7781", "font-size": 12, "font-weight": "600",
      }).textContent = String(yr);
    });

    // reference lines 50% and 10%
    if (sceneIndex !== 3) {
      AtlasSVG.el(svg, "line", {
        x1: margin.left, x2: w - margin.right, y1: yScale(50), y2: yScale(50),
        stroke: "#000", "stroke-width": 1.5, opacity: 0.35,
      });
    }
    if (sceneIndex !== 2) {
      AtlasSVG.el(svg, "line", {
        x1: margin.left, x2: w - margin.right, y1: yScale(10), y2: yScale(10),
        stroke: "#000", "stroke-width": 1.5, opacity: 0.35,
      });
    }
    // Korea annotation window scene 0
    if (sceneIndex === 0) {
      AtlasSVG.el(svg, "rect", {
        x: xScale(1965), y: yScale(50),
        width: xScale(1977) - xScale(1965),
        height: yScale(10) - yScale(50),
        fill: "#F3578E", opacity: 0.08, class: "annotated-area",
      });
    }
    // shift band for scenes 3–5
    if (sceneIndex > 2 && sceneIndex < 6) {
      AtlasSVG.el(svg, "rect", {
        x: xScale(0) || margin.left, // uses alternate scale conceptually
        y: yScale(50),
        width: 40,
        height: yScale(10) - yScale(50),
        fill: "none", stroke: "#94a3b8", "stroke-dasharray": "4 3", opacity: 0.5,
      });
    }

    const line = (pts, color, width = 2.5, opacity = 1, dash = null) => {
      if (!pts || pts.length < 2) return;
      const attrs = {
        d: pts.map((p, i) => `${i ? "L" : "M"}${xScale(p.year)},${yScale(p.value)}`).join(" "),
        fill: "none", stroke: color, "stroke-width": width, opacity,
        "stroke-linecap": "round", "stroke-linejoin": "round",
      };
      if (dash) attrs["stroke-dasharray"] = dash;
      // white halo
      AtlasSVG.el(svg, "path", {
        d: attrs.d, fill: "none", stroke: "#fff", "stroke-width": width + 3, opacity: opacity * 0.9,
      });
      AtlasSVG.el(svg, "path", attrs);
    };

    // focus country paths
    FOCUS.forEach((f) => {
      if (!f.visible.includes(sceneIndex)) return;
      const pts = byIso.get(f.iso);
      if (!pts) return;
      const op = f.transparent.includes(sceneIndex) ? 0.12 : 1;
      const col = COLORS[f.iso] || "#57626a";
      line(pts.filter((p) => p.year >= xDomain[0] && p.year <= Math.min(2025, xDomain[1])), col, 2.5, op);
      if (op > 0.5) {
        const anchor = pts.find((p) => p.year === f.labelX) || pts[Math.floor(pts.length / 2)];
        if (anchor && anchor.year >= xDomain[0] && anchor.year <= xDomain[1]) {
          AtlasSVG.el(svg, "text", {
            x: xScale(anchor.year), y: yScale(anchor.value) - 8,
            "text-anchor": "middle", fill: col, "font-size": 12, "font-weight": "700",
          }).textContent = NAMES[f.iso] || f.iso;
        }
        // pop-year square markers for KOR/THA/CHN/BGD on scenes 2–3
        if ((sceneIndex === 2 || sceneIndex === 3) && ["KOR", "THA", "CHN", "BGD"].includes(f.iso)) {
          AtlasSVG.el(svg, "rect", {
            x: xScale(f.labelX) - 6, y: yScale(50) - 6,
            width: 12, height: 12, fill: col, stroke: "#fff", "stroke-width": 1,
          });
        }
      }
    });

    // Rwanda projection dashed (scene 6)
    if (sceneIndex === 6) {
      const rwaProj = proj
        .filter((r) => r.iso3c === "RWA")
        .map((r) => ({ year: +r.year, value: +r.value }))
        .filter((d) => Number.isFinite(d.year));
      line(rwaProj, COLORS.RWA, 2, 1, "4 4");
    }

    // on-track / left-behind short segments (scenes 7–8): 2015→2025 only
    if (sceneIndex > 6) {
      const list = sceneIndex === 8 ? LEFT : ON_TRACK;
      const accent = sceneIndex === 8 ? "#701d57" : "#00a1c4";
      list.forEach((iso) => {
        const pts = (byIso.get(iso) || []).filter((p) => p.year === 2015 || p.year === 2025);
        if (pts.length < 2) return;
        line(pts, accent, 2, iso === "RWA" ? 1 : 0.75);
        const last = pts.find((p) => p.year === 2025);
        if (last && (sceneIndex === 7 || ["RWA"].includes(iso))) {
          AtlasSVG.el(svg, "text", {
            x: xScale(2025) + 4, y: yScale(last.value) + 4,
            fill: accent, "font-size": 10, "font-weight": "600",
          }).textContent = NAMES[iso] || iso;
        }
      });
    }

    // scene caption chip
    const caps = [
      "Korea’s rapid exit from extreme poverty",
      "Japan, Thailand, Bangladesh, China also transformed",
      "Half the population in poverty…",
      "…then below 10%",
      "Brazil & Türkiye too",
      "Rwanda on a promising path",
      "Rwanda projected to keep falling",
      "10 countries mostly in SSA on track",
      "43 countries left behind",
    ];
    const chip = document.createElement("div");
    chip.style.cssText =
      "position:absolute;top:8px;right:12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:4px;padding:6px 10px;font-size:11px;color:#334155;max-width:240px";
    chip.textContent = caps[Math.min(sceneIndex, caps.length - 1)];
    root.appendChild(chip);
  },
};
