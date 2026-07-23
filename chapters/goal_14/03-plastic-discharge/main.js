function plasticDischargePoints(rows, fields) {
  const numeric = (value) => {
    if (value === null || value === undefined || String(value).trim() === "") return Number.NaN;
    const number = Number(value);
    return Number.isFinite(number) ? number : Number.NaN;
  };
  return rows.map((row) => ({
    magnitude: numeric(row[fields.magnitude]),
    longitude: numeric(row[fields.longitude]),
    latitude: numeric(row[fields.latitude]),
  })).filter((point) =>
    point.magnitude > 0 &&
    point.longitude >= -180 && point.longitude <= 180 &&
    point.latitude >= -90 && point.latitude <= 90
  );
}

window.AtlasReplica = {
  ready: true,
  isStub: false,
  async render(_scene, ctx) {
    const { chartEl, config, hidePlaceholder } = ctx;
    hidePlaceholder();
    const contract = config.dataContract;
    const rows = await AtlasLoad.csv(`./data/${contract.file}`);
    const fields = AtlasLoad.validateContract(rows, contract, config.graphic);
    const points = plasticDischargePoints(rows, fields);

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText = "position:relative;width:100%;height:100%;font-family:Open Sans,system-ui,sans-serif";
    chartEl.appendChild(root);

    const width = 1000;
    const height = 500;
    const svg = AtlasSVG.el(root, "svg", {
      viewBox: `0 0 ${width} ${height}`,
      role: "img",
      "aria-label": `${points.length} river plastic-discharge locations plotted by longitude and latitude`,
    });
    svg.style.cssText = "display:block;width:100%;height:100%;object-fit:contain";
    AtlasSVG.el(svg, "image", {
      href: "./data/ocean_floor_rivers.jpg",
      x: 0,
      y: 0,
      width,
      height,
      preserveAspectRatio: "none",
      opacity: 0.88,
    });

    const x = AtlasSVG.scaleLinear([-180, 180], [0, width]);
    const y = AtlasSVG.scaleLinear([90, -90], [0, height]);
    const maximum = Math.max(...points.map((point) => point.magnitude), 1);
    const radius = (magnitude) => 1.4 + 12 * Math.sqrt(magnitude / maximum);

    points.slice().sort((a, b) => b.magnitude - a.magnitude).forEach((point) => {
      const marker = AtlasSVG.el(svg, "circle", {
        cx: x(point.longitude),
        cy: y(point.latitude),
        r: radius(point.magnitude),
        fill: "#C1261A",
        opacity: 0.62,
        stroke: "#fff",
        "stroke-width": 0.7,
      });
      AtlasSVG.el(marker, "title").textContent =
        `${(point.magnitude / 1000).toFixed(2)} thousand tonnes/year · ` +
        `${point.latitude.toFixed(2)}, ${point.longitude.toFixed(2)}`;
    });

    const legend = AtlasSVG.el(svg, "g", { transform: "translate(20 430)" });
    AtlasSVG.el(legend, "rect", {
      x: 0, y: 0, width: 215, height: 52, rx: 5,
      fill: "#fff", opacity: 0.9,
    });
    AtlasSVG.el(legend, "text", {
      x: 10, y: 17, fill: "#334155", "font-size": 11, "font-weight": 700,
    }).textContent = "Annual plastic discharge";
    [1000, 10000, 50000].forEach((magnitude, index) => {
      const cx = 24 + index * 66;
      AtlasSVG.el(legend, "circle", {
        cx, cy: 34, r: radius(magnitude),
        fill: "#C1261A", opacity: 0.62, stroke: "#fff",
      });
      AtlasSVG.el(legend, "text", {
        x: cx + 15, y: 38, fill: "#475569", "font-size": 9,
      }).textContent = `${magnitude / 1000}k`;
    });
  },
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { plasticDischargePoints };
}
