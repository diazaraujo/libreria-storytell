function landAreaSegments(rows, fields, label) {
  const numeric = (value) => {
    if (value === null || value === undefined || String(value).trim() === "") return Number.NaN;
    const number = Number(value);
    return Number.isFinite(number) ? number : Number.NaN;
  };
  const segments = rows.map((row) => {
    const area = numeric(row[fields.value]);
    const cumulative = numeric(row[fields.cumulative]);
    return {
      category: String(row[fields.category] || "").trim(),
      area,
      cumulative,
      end: cumulative + area,
    };
  }).filter((item) => item.category && item.area > 0 && item.cumulative >= 0)
    .sort((a, b) => a.cumulative - b.cumulative);
  let previousEnd = 0;
  segments.forEach((segment) => {
    if (segment.cumulative < previousEnd - 1e-9) {
      throw new Error(`${label}: overlapping cumulative area segments`);
    }
    previousEnd = segment.end;
  });
  return segments;
}

function landUseHierarchy(landRows, agriculturalRows, fields, derivations = {}) {
  const segments = landAreaSegments(landRows, fields, "land use");
  const children = landAreaSegments(agriculturalRows, fields, "agricultural land use");
  const agriculture = segments.find((segment) => segment.category === "agriculture");
  if (!agriculture) throw new Error("land use: agriculture parent segment is missing");
  const childTotal = Math.max(...children.map((segment) => segment.end), 0);
  if (Math.abs(childTotal - agriculture.area) > 1e-6) {
    throw new Error(`land use: agricultural children total ${childTotal} does not match parent ${agriculture.area}`);
  }
  const arableCategories = derivations.arableCategories || ["for_animals", "for_humans"];
  const arableChildren = children.filter((segment) => arableCategories.includes(segment.category));
  if (arableChildren.length !== arableCategories.length) {
    throw new Error("land use: the declared arable child segments are incomplete");
  }
  const arableArea = arableChildren.reduce((sum, segment) => sum + segment.area, 0);
  const referenceTotal = Number(derivations.globalLandSurface || 149);
  if (!(referenceTotal > 0)) throw new Error("land use: invalid global land-surface reference");
  return {
    total: Math.max(...segments.map((segment) => segment.end), 0),
    segments,
    agriculture: { parent: agriculture, children, total: childTotal },
    arable: {
      categories: arableCategories,
      area: arableArea,
      start: Math.min(...arableChildren.map((segment) => segment.cumulative)),
      end: Math.max(...arableChildren.map((segment) => segment.end)),
      referenceTotal,
      referenceShare: arableArea / referenceTotal * 100,
    },
  };
}

function landUseBars(hierarchy) {
  const children = Object.fromEntries(
    hierarchy.agriculture.children.map((segment) => [segment.category, segment])
  );
  for (const category of ["for_humans", "for_animals", "permanent"]) {
    if (!children[category]) throw new Error(`land use: missing ${category} segment`);
  }
  return [
    { category: "arable", area: hierarchy.arable.area },
    { category: "for_humans", area: children.for_humans.area },
    { category: "for_animals", area: children.for_animals.area },
    { category: "permanent", area: children.permanent.area },
  ];
}

window.AtlasReplica = {
  ready: true,
  isStub: false,
  async render(_scene, ctx) {
    const { chartEl, hidePlaceholder, config } = ctx;
    const contract = config.dataContract;
    const [landRows, agriculturalRows] = await Promise.all(
      contract.files.map((file) => AtlasLoad.csv(`./data/${file}`))
    );
    const landFields = AtlasLoad.validateContract(landRows, contract, `${config.graphic}: land use`);
    const agriculturalFields = AtlasLoad.validateContract(
      agriculturalRows, contract, `${config.graphic}: agricultural land use`
    );
    const hierarchy = landUseHierarchy(
      landRows, agriculturalRows, landFields, contract.derivations
    );
    const bars = landUseBars(hierarchy);
    if (JSON.stringify(landFields) !== JSON.stringify(agriculturalFields)) {
      throw new Error("land use: both files must share the declared area-segment columns");
    }
    hidePlaceholder();

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText = "position:relative;width:100%;height:100%;font-family:Open Sans,system-ui,sans-serif";
    chartEl.appendChild(root);
    const width = root.clientWidth || 900;
    const height = Math.max(root.clientHeight || 440, 390);
    const margin = { top: 42, right: 28, bottom: 82, left: 48 };
    const svg = AtlasSVG.el(root, "svg", {
      viewBox: `0 0 ${width} ${height}`,
      role: "img", "aria-label": "Arable land, its human and animal components, and permanent crops in million square kilometers",
    });
    svg.style.cssText = "display:block;width:100%;height:100%";
    const x = AtlasSVG.scaleBand(
      bars.map((item) => item.category), [margin.left, width - margin.right], 0.36
    );
    const maximum = Math.max(...bars.map((item) => item.area), 1);
    const y = AtlasSVG.scaleLinear([0, maximum * 1.12], [height - margin.bottom, margin.top]);
    [0, 5, 10, 15].forEach((tick) => {
      if (tick > maximum * 1.12) return;
      AtlasSVG.el(svg, "line", {
        x1: margin.left, x2: width - margin.right, y1: y(tick), y2: y(tick),
        stroke: "#dce4ea", "stroke-width": 0.8,
      });
      AtlasSVG.el(svg, "text", {
        x: margin.left - 8, y: y(tick) + 3, "text-anchor": "end",
        fill: "#64748b", "font-size": 9,
      }).textContent = String(tick);
    });
    bars.forEach((item) => {
      const barX = x(item.category);
      const bar = AtlasSVG.el(svg, "rect", {
        x: barX, y: y(item.area), width: x.bandwidth(),
        height: height - margin.bottom - y(item.area), fill: "#0071BC", rx: 2,
      });
      AtlasSVG.el(bar, "title").textContent =
        `${config[item.category] || item.category}: ${item.area} million km²`;
      AtlasSVG.el(svg, "text", {
        x: barX + x.bandwidth() / 2, y: y(item.area) - 6,
        "text-anchor": "middle", fill: "#005A96", "font-size": 11, "font-weight": 700,
      }).textContent = `${item.area}m`;
      AtlasSVG.el(svg, "text", {
        x: barX + x.bandwidth() / 2, y: height - margin.bottom + 17,
        "text-anchor": "middle", fill: "#64748b", "font-size": 9.5,
      }).textContent = config[item.category] || item.category.replaceAll("_", " ");
    });
    AtlasSVG.el(svg, "text", {
      x: margin.left, y: 20, fill: "#334155", "font-size": 10, "font-weight": 700,
    }).textContent =
      `Arable: ${hierarchy.arable.area}m km² · ${hierarchy.arable.referenceShare.toFixed(1)}% of ${hierarchy.arable.referenceTotal}m km²`;
    AtlasSVG.el(svg, "text", {
      x: margin.left, y: height - 18, fill: "#64748b", "font-size": 9.5,
    }).textContent =
      `Sources: agriculture ${hierarchy.agriculture.total}m; rounded categories ${hierarchy.total}m km².`;
  },
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { landAreaSegments, landUseHierarchy, landUseBars };
}
