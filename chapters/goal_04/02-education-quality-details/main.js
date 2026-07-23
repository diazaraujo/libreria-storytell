const EDUCATION_GENDERS = ["Total", "Male", "Female"];
const EDUCATION_MEASURES = ["years", "lays"];

function educationCountryGroups(rows, fields) {
  const numeric = (value) => {
    if (value === null || value === undefined || String(value).trim() === "") return Number.NaN;
    const number = Number(value);
    return Number.isFinite(number) ? number : Number.NaN;
  };
  const countries = new Map();
  rows.forEach((row) => {
    const code = String(row[fields.code] || "").trim();
    const country = String(row[fields.category] || "").trim();
    const gender = String(row[fields.gender] || "").trim();
    const measure = String(row[fields.measure] || "").trim().toLowerCase();
    const value = numeric(row[fields.value]);
    if (!code || !country || !EDUCATION_GENDERS.includes(gender) ||
        !EDUCATION_MEASURES.includes(measure) || !Number.isFinite(value)) return;
    if (!countries.has(code)) {
      countries.set(code, {
        code,
        country,
        region: String(row[fields.region] || "").trim(),
        income: String(row[fields.income] || "").trim(),
        values: new Map(),
      });
    }
    countries.get(code).values.set(`${gender}:${measure}`, { gender, measure, value });
  });
  return [...countries.values()].map((country) => ({
    code: country.code,
    country: country.country,
    region: country.region,
    income: country.income,
    values: EDUCATION_GENDERS.flatMap((gender) =>
      EDUCATION_MEASURES.map((measure) => country.values.get(`${gender}:${measure}`))
        .filter(Boolean)
    ),
  })).filter((country) => country.values.length).sort((a, b) =>
    a.country.localeCompare(b.country)
  );
}

window.AtlasReplica = {
  ready: true,
  isStub: false,
  async render(_scene, ctx) {
    const { chartEl, hidePlaceholder, config } = ctx;
    const contract = config.dataContract;
    const rows = await AtlasLoad.csv(`./data/${contract.file}`);
    const fields = AtlasLoad.validateContract(rows, contract, config.graphic);
    const allCountries = educationCountryGroups(rows, fields);
    const storyCodes = ["MLI", "PHL", "BRA", "KOR"];
    let data = storyCodes.map((code) => allCountries.find((item) => item.code === code)).filter(Boolean);
    if (!data.length) data = allCountries.slice(0, 8);
    hidePlaceholder();

    chartEl.innerHTML = "";
    const root = document.createElement("div");
    root.className = "atlas-chart-root";
    root.style.cssText = "position:relative;width:100%;height:100%;font-family:Open Sans,system-ui,sans-serif";
    chartEl.appendChild(root);
    const width = root.clientWidth || 900;
    const height = Math.max(root.clientHeight || 440, 400);
    const margin = { top: 66, right: 48, bottom: 32, left: 145 };
    const svg = AtlasSVG.el(root, "svg", {
      viewBox: `0 0 ${width} ${height}`,
      role: "img",
      "aria-label": "Expected and learning-adjusted schooling years grouped by country and gender",
    });
    svg.style.cssText = "display:block;width:100%;height:100%";
    const maximum = Math.max(...data.flatMap((item) => item.values.map((value) => value.value)), 1);
    const x = AtlasSVG.scaleLinear([0, maximum * 1.06], [margin.left, width - margin.right]);
    const y = AtlasSVG.scaleBand(data.map((item) => item.code), [margin.top, height - margin.bottom], 0.18);
    const colors = { years: "#0071BC", lays: "#C1261A" };
    const opacity = { Total: 1, Male: 0.72, Female: 0.45 };

    [0, maximum / 2, maximum].forEach((tick) => {
      AtlasSVG.el(svg, "line", {
        x1: x(tick), x2: x(tick), y1: margin.top - 7, y2: height - margin.bottom,
        stroke: "#d9e1e7", "stroke-width": 0.8,
      });
      AtlasSVG.el(svg, "text", {
        x: x(tick), y: margin.top - 12, "text-anchor": "middle", fill: "#64748b", "font-size": 9,
      }).textContent = tick.toFixed(1);
    });
    let legendX = margin.left;
    EDUCATION_MEASURES.forEach((measure) => {
      AtlasSVG.el(svg, "rect", { x: legendX, y: 17, width: 13, height: 10, rx: 2, fill: colors[measure] });
      const label = measure === "years" ? "Expected years" : "Learning-adjusted years";
      AtlasSVG.el(svg, "text", { x: legendX + 18, y: 26, fill: "#334155", "font-size": 10, "font-weight": 600 }).textContent = label;
      legendX += label.length * 6 + 42;
    });
    AtlasSVG.el(svg, "text", { x: margin.left, y: 45, fill: "#64748b", "font-size": 9 }).textContent =
      "Within each country: Total, Male, Female (progressively lighter).";

    data.forEach((country) => {
      const y0 = y(country.code);
      const band = y.bandwidth();
      const slot = band / EDUCATION_GENDERS.length;
      const barHeight = Math.max(2.5, (slot - 3) / EDUCATION_MEASURES.length);
      AtlasSVG.el(svg, "text", {
        x: margin.left - 9, y: y0 + band / 2, "text-anchor": "end", "dominant-baseline": "middle",
        fill: "#172b4d", "font-size": 11, "font-weight": 700,
      }).textContent = country.country;
      EDUCATION_GENDERS.forEach((gender, genderIndex) => {
        EDUCATION_MEASURES.forEach((measure, measureIndex) => {
          const observation = country.values.find((item) => item.gender === gender && item.measure === measure);
          if (!observation) return;
          const barY = y0 + genderIndex * slot + measureIndex * barHeight;
          const bar = AtlasSVG.el(svg, "rect", {
            x: margin.left,
            y: barY,
            width: Math.max(x(observation.value) - margin.left, 1),
            height: Math.max(barHeight - 0.8, 1.5),
            fill: colors[measure],
            opacity: opacity[gender],
            rx: 1.5,
          });
          AtlasSVG.el(bar, "title").textContent =
            `${country.country} (${country.code}) · ${country.region} · ${country.income.toUpperCase()} · ` +
            `${gender} · ${measure === "years" ? "expected years" : "learning-adjusted years"}: ` +
            `${observation.value.toFixed(2)}`;
        });
      });
    });
  },
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { educationCountryGroups };
}
