function requireAlgalBloomPoints(points) {
  if (!Array.isArray(points) || points.length === 0) {
    throw new Error("algal_blooms: no valid longitude/latitude event points to render");
  }
  return points;
}

function aggregateAlgalBloomSites(points) {
  const sites = new Map();
  points.forEach((point) => {
    const key = `${point.longitude}|${point.latitude}`;
    if (!sites.has(key)) {
      sites.set(key, {
        longitude: point.longitude,
        latitude: point.latitude,
        count: 0,
        events: new Set(),
        years: new Set(),
      });
    }
    const site = sites.get(key);
    site.count += 1;
    site.events.add(point.event);
    site.years.add(point.year);
  });
  return [...sites.values()].map((site) => {
    const years = [...site.years].sort((a, b) => a - b);
    return {
      longitude: site.longitude,
      latitude: site.latitude,
      count: site.count,
      eventCount: site.events.size,
      firstYear: years[0],
      lastYear: years[years.length - 1],
    };
  }).sort((a, b) => b.count - a.count);
}

function algalBloomRadius(count, maximumCount, maximumRadius = 12.8) {
  if (!(count >= 0) || !(maximumCount > 0) || !(maximumRadius > 0)) {
    throw new Error("algal_blooms: invalid proportional-area scale input");
  }
  return maximumRadius * Math.sqrt(count / maximumCount);
}

window.AtlasReplica = {
  ready: true,
  isStub: false,
  async render(_scene, ctx) {
    const { chartEl, config, hidePlaceholder } = ctx;
    const contract = config.dataContract;
    const rows = await AtlasLoad.csv(`./data/${contract.file}`);
    const points = requireAlgalBloomPoints(AtlasLoad.algalBloomPoints(rows, contract));
    const sites = aggregateAlgalBloomSites(points);
    hidePlaceholder();

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText = "position:relative;width:100%;height:100%;font-family:Open Sans,system-ui,sans-serif";
    chartEl.appendChild(root);
    const width = root.clientWidth || 900;
    const height = Math.max(root.clientHeight || 440, 360);
    const margin = { top: 50, right: 28, bottom: 54, left: 62 };
    const svg = AtlasSVG.el(root, "svg", {
      viewBox: `0 0 ${width} ${height}`,
      role: "img",
      "aria-label": `${points.length} algal-bloom records aggregated into ${sites.length} coordinate sites`,
    });
    svg.style.cssText = "display:block;width:100%;height:100%";
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    AtlasSVG.el(svg, "image", {
      href: "./data/ocean_floor_rivers.jpg",
      x: margin.left, y: margin.top, width: plotWidth, height: plotHeight,
      preserveAspectRatio: "none", opacity: 0.9,
    });
    const x = AtlasSVG.scaleLinear([-180, 180], [margin.left, width - margin.right]);
    const y = AtlasSVG.scaleLinear([-90, 90], [height - margin.bottom, margin.top]);
    const firstYear = Math.min(...sites.map((site) => site.firstYear));
    const lastYear = Math.max(...sites.map((site) => site.lastYear));
    const maximumCount = Math.max(...sites.map((site) => site.count), 1);
    const radius = (count) => algalBloomRadius(count, maximumCount);
    const longitudeLabel = (value) => value === 0 ? "0°" : `${Math.abs(value)}°${value < 0 ? "W" : "E"}`;
    const latitudeLabel = (value) => value === 0 ? "0°" : `${Math.abs(value)}°${value < 0 ? "S" : "N"}`;
    [-180, -120, -60, 0, 60, 120, 180].forEach((longitude) => {
      AtlasSVG.el(svg, "line", { x1: x(longitude), x2: x(longitude), y1: margin.top, y2: height - margin.bottom, stroke: "#fff", opacity: 0.5, "stroke-width": 0.7 });
      AtlasSVG.el(svg, "text", { x: x(longitude), y: height - margin.bottom + 17, "text-anchor": "middle", fill: "#475569", "font-size": 8.5 }).textContent = longitudeLabel(longitude);
    });
    [-60, -30, 0, 30, 60].forEach((latitude) => {
      AtlasSVG.el(svg, "line", { x1: margin.left, x2: width - margin.right, y1: y(latitude), y2: y(latitude), stroke: "#fff", opacity: 0.5, "stroke-width": 0.7 });
      AtlasSVG.el(svg, "text", { x: margin.left - 7, y: y(latitude) + 3, "text-anchor": "end", fill: "#475569", "font-size": 8.5 }).textContent = latitudeLabel(latitude);
    });
    sites.forEach((site) => {
      const dot = AtlasSVG.el(svg, "circle", {
        cx: x(site.longitude), cy: y(site.latitude), r: radius(site.count),
        fill: "#C1261A", opacity: 0.62, stroke: "#fff", "stroke-width": 0.65,
      });
      AtlasSVG.el(dot, "title").textContent =
        `${site.count} records · ${site.eventCount} event identifiers · ${site.firstYear}–${site.lastYear} · ` +
        `latitude ${site.latitude.toFixed(2)}, longitude ${site.longitude.toFixed(2)}`;
    });
    AtlasSVG.el(svg, "text", { x: (margin.left + width - margin.right) / 2, y: height - 12, "text-anchor": "middle", fill: "#334155", "font-size": 10, "font-weight": 600 }).textContent = "Longitude";
    AtlasSVG.el(svg, "text", { x: 16, y: (margin.top + height - margin.bottom) / 2, transform: `rotate(-90 16 ${(margin.top + height - margin.bottom) / 2})`, "text-anchor": "middle", fill: "#334155", "font-size": 10, "font-weight": 600 }).textContent = "Latitude";
    AtlasSVG.el(svg, "text", { x: margin.left, y: 20, fill: "#334155", "font-size": 11, "font-weight": 700 }).textContent =
      `${points.length.toLocaleString()} records · ${sites.length} sites · ${firstYear}–${lastYear}`;
    AtlasSVG.el(svg, "text", {
      x: margin.left, y: 37, fill: "#475569", "font-size": 8.5,
    }).textContent = `Circle area is proportional to record count · maximum ${maximumCount} records at one site`;
  },
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { requireAlgalBloomPoints, aggregateAlgalBloomSites, algalBloomRadius };
}
