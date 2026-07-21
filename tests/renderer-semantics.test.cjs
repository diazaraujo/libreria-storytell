const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const { AtlasLoad, parseCsv } = require("../shared/load.js");
const ROOT = path.resolve(__dirname, "..");

function read(relative) {
  return fs.readFileSync(path.join(ROOT, relative), "utf8");
}

function json(relative) {
  return JSON.parse(read(relative));
}

function rows(directory, file) {
  return parseCsv(read(`${directory}/data/${file}`));
}

function renderer(relative) {
  const absolute = path.join(ROOT, relative);
  const previousWindow = global.window;
  global.window = {};
  delete require.cache[require.resolve(absolute)];
  const exports = require(absolute);
  global.window = previousWindow;
  return exports;
}

class FakeElement {
  constructor(tag = "div", clientWidth = 900, clientHeight = 440) {
    this.tagName = tag;
    this.children = [];
    this.style = {};
    this.attributes = {};
    this.clientWidth = clientWidth;
    this.clientHeight = clientHeight;
    this.innerHTML = "";
    this.textContent = "";
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }

  setAttribute(name, value) {
    this.attributes[name] = String(value);
  }

  getContext() {
    return {
      scale() {},
      beginPath() {},
      arc() {},
      fill() {},
      fillStyle: "",
    };
  }
}

function descendants(root) {
  return [root, ...root.children.flatMap((child) => descendants(child))];
}

function textNodes(root, text) {
  return descendants(root).filter((node) =>
    node.tagName === "text" && String(node.textContent) === text
  );
}

function textNode(root, text) {
  const matches = textNodes(root, text);
  assert.equal(matches.length, 1, `expected one text node for ${text}, found ${matches.length}`);
  return matches[0];
}

function assertTextFits(node, width, message) {
  const x = Number(node.attributes.x);
  const fontSize = Number(node.attributes["font-size"] || 10);
  const estimatedWidth = String(node.textContent).length * fontSize * 0.58;
  const anchor = node.attributes["text-anchor"] || "start";
  const left = anchor === "middle" ? x - estimatedWidth / 2 : anchor === "end" ? x - estimatedWidth : x;
  const right = anchor === "middle" ? x + estimatedWidth / 2 : anchor === "end" ? x : x + estimatedWidth;
  assert.ok(left >= 4 && right <= width - 4, `${message}: estimated bounds ${left}–${right}`);
}

function fakeSvg() {
  return {
    el(parent, tag, attributes = {}) {
      const node = new FakeElement(tag);
      Object.entries(attributes).forEach(([name, value]) => {
        if (value !== null && value !== undefined) node.setAttribute(name, value);
      });
      if (parent) parent.appendChild(node);
      return node;
    },
    scaleLinear([domainLow, domainHigh], [rangeLow, rangeHigh]) {
      const slope = domainHigh === domainLow
        ? 0
        : (rangeHigh - rangeLow) / (domainHigh - domainLow);
      return (value) => rangeLow + (value - domainLow) * slope;
    },
    scaleBand(domain, [rangeLow, rangeHigh], padding = 0.1) {
      const step = (rangeHigh - rangeLow) / Math.max(domain.length, 1);
      const gap = step * padding;
      const positions = new Map(
        domain.map((value, index) => [value, rangeLow + index * step + gap / 2])
      );
      const scale = (value) => positions.get(value) ?? rangeLow;
      scale.bandwidth = () => step - gap;
      return scale;
    },
    line(points, x, y) {
      return points.map((point, index) =>
        `${index ? "L" : "M"}${x(point)},${y(point)}`
      ).join(" ");
    },
  };
}

async function smokeRenderer(directory, sceneIndexes, dimensions = {}) {
  const absolute = path.join(ROOT, directory, "main.js");
  const config = json(`${directory}/config.json`);
  const clientWidth = dimensions.width || 900;
  const clientHeight = dimensions.height || 440;
  const previous = {
    window: global.window,
    document: global.document,
    AtlasLoad: global.AtlasLoad,
    AtlasSVG: global.AtlasSVG,
  };
  global.window = {
    ATLAS_COUNTRY_NAMES: {},
    WB_COLORS: {},
    devicePixelRatio: 1,
  };
  global.document = {
    createElement(tag) {
      return new FakeElement(tag, clientWidth, clientHeight);
    },
  };
  global.AtlasSVG = fakeSvg();
  global.AtlasLoad = {
    ...AtlasLoad,
    async csv(url) {
      return rows(directory, url.replace(/^\.\/data\//, ""));
    },
  };

  const rendered = [];
  const bridged = [];
  try {
    if (dimensions.sharedScripts) {
      for (const relative of dimensions.sharedScripts) {
        const shared = path.join(ROOT, relative);
        delete require.cache[require.resolve(shared)];
        require(shared);
      }
      for (const name of Object.keys(global.window)) {
        if (!(name in global)) {
          global[name] = global.window[name];
          bridged.push(name);
        }
      }
    }
    delete require.cache[require.resolve(absolute)];
    require(absolute);
    const replica = global.window.AtlasReplica;
    assert.equal(replica.ready, true);
    assert.equal(replica.isStub, false);
    for (const sceneIndex of sceneIndexes) {
      const scene = config.scenes?.[sceneIndex];
      if (dimensions.requireScenes) {
        assert.ok(scene && scene.id, `${directory} scene ${sceneIndex} must exist with an id`);
      }
      const chartEl = new FakeElement("div", clientWidth, clientHeight);
      let hidden = false;
      await replica.render(scene || null, {
        chartEl,
        config,
        sceneIndex,
        hidePlaceholder() {
          hidden = true;
        },
      });
      assert.equal(hidden, true, `${directory} scene ${sceneIndex} should render`);
      assert.ok(chartEl.children.length > 0, `${directory} scene ${sceneIndex} needs output`);
      rendered.push(chartEl);
    }
  } finally {
    bridged.forEach((name) => delete global[name]);
    for (const [name, value] of Object.entries(previous)) {
      if (value === undefined) delete global[name];
      else global[name] = value;
    }
  }
  return rendered;
}

function drawableNodes(node, tags = ["rect", "circle", "path"], found = []) {
  for (const child of node.children || []) {
    if (tags.includes(String(child.tagName).toLowerCase())) {
      found.push(child);
    }
    drawableNodes(child, tags, found);
  }
  return found;
}

test("plastic discharge uses all valid longitude, latitude, and magnitude roles", () => {
  const directory = "chapters/goal_14/03-plastic-discharge";
  const contract = json(`${directory}/config.json`).dataContract;
  const dataset = rows(directory, contract.file);
  const fields = AtlasLoad.validateContract(dataset, contract);
  const { plasticDischargePoints } = renderer(`${directory}/main.js`);
  const points = plasticDischargePoints(dataset, fields);

  assert.equal(points.length, 1000);
  assert.equal(Math.max(...points.map((point) => point.magnitude)), 62592);
  assert.ok(points.every((point) => point.longitude >= -180 && point.longitude <= 180));
  assert.ok(points.every((point) => point.latitude >= -90 && point.latitude <= 90));
  const source = read(`${directory}/main.js`);
  assert.match(source, /fields\.longitude/);
  assert.match(source, /fields\.latitude/);
  assert.match(source, /fields\.magnitude/);
  assert.match(source, /ocean_floor_rivers\.jpg/);
  assert.doesNotMatch(source, /ranked bars|catKey|valKey/);
});

test("high-inequality tiles are category-aware and put high Gini economies first", () => {
  const directory = "chapters/goal_10/01-high-inequality-map";
  const config = json(`${directory}/config.json`);
  const contract = config.dataContract;
  const dataset = rows(directory, contract.file);
  const fields = AtlasLoad.validateContract(dataset, contract);
  const { inequalityTiles } = renderer(`${directory}/main.js`);
  const tiles = inequalityTiles(dataset, fields);

  assert.equal(tiles.length, 169);
  assert.equal(tiles[0].category, "high");
  assert.ok(tiles.filter((item) => item.category === "high").length > 40);
  assert.ok(tiles.every((item) => Number.isFinite(item.value)));
  const lastHigh = tiles.map((item) => item.category).lastIndexOf("high");
  const firstModerate = tiles.findIndex((item) => item.category === "moderate");
  assert.ok(lastHigh < firstModerate);
  const source = read(`${directory}/main.js`);
  assert.match(source, /item\.category/);
  assert.match(source, /item\.value\.toFixed/);
  assert.doesNotMatch(source, /slice\(0,\s*30\)/);
  assert.doesNotMatch(config.title, /concentrated|geographic map/i);
  assert.match(config.limitations.geometry, /no country geometry or region field/);
});

test("both income renderers preserve past/current groups and real transitions", () => {
  const directory = "chapters/goal_08/04-income-world-map";
  const mapConfig = json(`${directory}/config.json`);
  const contract = mapConfig.dataContract;
  const dataset = rows(directory, contract.file);
  const fields = AtlasLoad.validateContract(dataset, contract);
  const { incomeTransitions } = renderer(`${directory}/main.js`);
  const transitions = incomeTransitions(dataset, fields);

  assert.equal(transitions.length, 217);
  assert.equal(transitions.filter((item) => item.pastGroup === "INX").length, 43);
  assert.equal(
    transitions.filter((item) => item.pastGroup === "LIC" && item.currentGroup !== "LIC").length,
    31
  );
  assert.equal(
    transitions.filter((item) => item.pastGroup !== "LIC" && item.currentGroup === "LIC").length,
    5
  );
  assert.match(read(`${directory}/main.js`), /pastGroup/);
  assert.match(read(`${directory}/main.js`), /currentGroup/);
  assert.doesNotMatch(read(`${directory}/main.js`), /1990 \(left\).*2024 \(right\)/);
  assert.match(read(`${directory}/main.js`), /no country geometry/);
  assert.match(read(`${directory}/main.js`), /sceneIndex === 0/);
  assert.match(read(`${directory}/main.js`), /sceneIndex >= 2/);
  assert.doesNotMatch(mapConfig.scenes.map((scene) => scene.text).join(" "), /transition into a map/i);

  const classificationDirectory = "chapters/goal_08/05-income-classification-scroller";
  const classificationContract = json(`${classificationDirectory}/config.json`).dataContract;
  const classificationRows = rows(classificationDirectory, classificationContract.file);
  const classificationFields = AtlasLoad.validateContract(
    classificationRows,
    classificationContract
  );
  const { incomeClassificationTransitions, isClassifiedIncomeGroup } = renderer(`${classificationDirectory}/main.js`);
  const classifications = incomeClassificationTransitions(
    classificationRows,
    classificationFields
  );
  assert.deepEqual(
    classifications.map(({ code, pastGroup, currentGroup }) => ({ code, pastGroup, currentGroup })),
    transitions.map(({ code, pastGroup, currentGroup }) => ({ code, pastGroup, currentGroup }))
  );
  assert.equal(
    classifications.filter((item) => item.currentGroup === "LIC" && Number.isFinite(item.growth)).length,
    19
  );
  assert.equal(
    classifications.filter((item) =>
      item.pastGroup === "LIC" && isClassifiedIncomeGroup(item.currentGroup)
    ).length,
    30
  );
  const classificationSource = read(`${classificationDirectory}/main.js`);
  assert.match(classificationSource, /item\.pastGroup === "LIC" && isClassifiedIncomeGroup\(item\.currentGroup\)/);
  assert.match(classificationSource, /item\.pastGroup !== "LIC" && item\.currentGroup === "LIC"/);
  assert.match(classificationSource, /Math\.min\(0, \.\.\.sorted\.map/);
  assert.match(classificationSource, /INX is excluded/);
});

test("UHC outcomes are true coverage/outcome scatters with year-aware pairs", () => {
  const directory = "chapters/goal_03/06-uhc-outcomes-scroller";
  const contract = json(`${directory}/config.json`).dataContract;
  const { uhcOutcomePoints } = renderer(`${directory}/main.js`);

  contract.files.forEach((file) => {
    const dataset = rows(directory, file);
    const fields = AtlasLoad.validateContract(dataset, contract);
    const points = uhcOutcomePoints(dataset, fields);
    assert.ok(points.length >= 380, `${file} should retain country-year observations`);
    assert.equal(Math.min(...points.map((point) => point.year)), 2000);
    assert.equal(Math.max(...points.map((point) => point.year)), 2023);
    assert.ok(points.every((point) => point.coverage >= 0 && point.coverage <= 100));
    assert.ok(points.every((point) => point.value >= 0));
  });
  const source = read(`${directory}/main.js`);
  assert.match(source, /point\.coverage/);
  assert.match(source, /point\.value/);
  assert.match(source, /point\.year/);
  assert.match(source, /AtlasSVG\.line\(series/);
  assert.doesNotMatch(source, /ranked bars|catKey|valKey/);
});

test("poverty comparison groups category/year/value into real slope series", () => {
  const directory = "chapters/goal_progress/00-poverty-progress-comparison";
  const contract = json(`${directory}/config.json`).dataContract;
  const dataset = rows(directory, contract.file);
  const fields = AtlasLoad.validateContract(dataset, contract);
  const { povertySlopeSeries } = renderer(`${directory}/main.js`);
  const series = povertySlopeSeries(dataset, fields);

  assert.equal(series.length, 171);
  assert.ok(!series.some((item) => item.code === "VEN"), "incomplete slopes stay missing");
  assert.ok(series.every((item) => item.points.length === 2));
  assert.deepEqual(series.find((item) => item.code === "CIV").points, [
    { year: 2015, value: 26.3 },
    { year: 2025, value: 16.1 },
  ]);
  assert.deepEqual(series.find((item) => item.code === "GEO").points, [
    { year: 2015, value: 10.6 },
    { year: 2025, value: 3.5 },
  ]);
  const source = read(`${directory}/main.js`);
  assert.match(source, /AtlasSVG\.line\(item\.points/);
  assert.match(source, /point\.year/);
  assert.match(source, /point\.value/);
});

test("poverty-rate change combines observations, median trend, and selected trajectories", () => {
  const directory = "chapters/goal_progress/01-poverty-rate-change-scroller";
  const contract = json(`${directory}/config.json`).dataContract.datasets;
  const { povertyScatterPoints, selectedPovertyChanges } = renderer(`${directory}/main.js`);
  const countryRows = rows(directory, contract.countries.file);
  const countryFields = AtlasLoad.validateContract(countryRows, contract.countries);
  const observations = povertyScatterPoints(countryRows, countryFields);
  const trendRows = rows(directory, contract.trend.file);
  const trendFields = AtlasLoad.validateContract(trendRows, contract.trend);
  const trend = povertyScatterPoints(trendRows, trendFields);
  const selectedRows = rows(directory, contract.selected.file);
  const selectedFields = AtlasLoad.validateContract(selectedRows, contract.selected);
  const selected = selectedPovertyChanges(selectedRows, selectedFields);

  assert.equal(observations.length, 11198);
  assert.equal(trend.length, 858);
  assert.equal(selected.length, 171);
  assert.ok(Math.min(...observations.map((point) => point.change)) < 0);
  assert.ok(Math.max(...observations.map((point) => point.change)) > 0);
  assert.ok(trend.every((point) => point.change <= 0));
  const coteDIvoire = selected.find((point) => point.code === "CIV");
  assert.ok(Math.abs(coteDIvoire.change - (-1.02)) < 1e-10);
  const source = read(`${directory}/main.js`);
  assert.match(source, /Promise\.all/);
  assert.match(source, /contracts\.countries\.file/);
  assert.match(source, /contracts\.trend\.file/);
  assert.match(source, /contracts\.selected\.file/);
  assert.match(source, /document\.createElement\("canvas"\)/);
});

test("education quality groups six gender/measure observations once per country", () => {
  const directory = "chapters/goal_04/02-education-quality-details";
  const contract = json(`${directory}/config.json`).dataContract;
  const dataset = rows(directory, contract.file);
  const fields = AtlasLoad.validateContract(dataset, contract);
  const { educationCountryGroups } = renderer(`${directory}/main.js`);
  const countries = educationCountryGroups(dataset, fields);

  assert.equal(countries.length, 171);
  assert.equal(new Set(countries.map((country) => country.code)).size, 171);
  assert.equal(countries.filter((country) => country.values.length === 6).length, 168);
  assert.deepEqual(
    countries.filter((country) => country.values.length < 6).map((country) => country.code),
    ["JPN", "PLW", "SGP"]
  );
  assert.ok(countries.every((country) =>
    new Set(country.values.map((item) => `${item.gender}:${item.measure}`)).size === country.values.length
  ));
  const mali = countries.find((country) => country.code === "MLI");
  assert.equal(mali.country, "Mali");
  assert.equal(mali.region, "Sub-Saharan Africa");
  assert.equal(mali.income, "lic");
  assert.deepEqual(new Set(mali.values.map((item) => item.gender)), new Set(["Total", "Male", "Female"]));
  assert.deepEqual(new Set(mali.values.map((item) => item.measure)), new Set(["years", "lays"]));
  const source = read(`${directory}/main.js`);
  assert.match(source, /fields\.gender/);
  assert.match(source, /fields\.measure/);
  assert.match(source, /country\.region/);
  assert.match(source, /country\.income/);
  assert.doesNotMatch(source, /scaleBand\(data\.map\(d => d\.raw\)/);
});

test("seafood bars retain standard errors and render whisker endpoints", () => {
  const directory = "chapters/goal_14/07-plastic-seafood";
  const contract = json(`${directory}/config.json`).dataContract;
  const dataset = rows(directory, contract.file);
  const fields = AtlasLoad.validateContract(dataset, contract);
  const { seafoodEstimates } = renderer(`${directory}/main.js`);
  const estimates = seafoodEstimates(dataset, fields);

  assert.equal(estimates.length, 9);
  assert.deepEqual(estimates[0], { category: "shrimp_vessel", value: 10.67, error: 2.26 });
  assert.ok(estimates.every((item) => item.error >= 0));
  const source = read(`${directory}/main.js`);
  assert.match(source, /fields\.error/);
  assert.match(source, /item\.value \+ item\.error/);
  assert.match(source, /standard error/);
});

test("land-use hierarchy consumes both cumulative segment files without double counting", () => {
  const directory = "chapters/goal_15/00-land-use";
  const contract = json(`${directory}/config.json`).dataContract;
  const landRows = rows(directory, contract.files[0]);
  const agriculturalRows = rows(directory, contract.files[1]);
  const fields = AtlasLoad.validateContract(landRows, contract);
  AtlasLoad.validateContract(agriculturalRows, contract);
  const { landUseHierarchy, landUseBars } = renderer(`${directory}/main.js`);
  const hierarchy = landUseHierarchy(landRows, agriculturalRows, fields, contract.derivations);
  const bars = landUseBars(hierarchy);

  assert.equal(hierarchy.total, 140);
  assert.equal(hierarchy.segments.length, 7);
  assert.deepEqual(
    hierarchy.segments.map(({ category, cumulative, end }) => ({ category, cumulative, end })),
    [
      { category: "agriculture", cumulative: 0, end: 48 },
      { category: "forest", cumulative: 48, end: 88 },
      { category: "shrub", cumulative: 88, end: 102 },
      { category: "urban", cumulative: 102, end: 103 },
      { category: "water", cumulative: 103, end: 106 },
      { category: "glaciers", cumulative: 106, end: 120 },
      { category: "barren", cumulative: 120, end: 140 },
    ]
  );
  assert.equal(hierarchy.agriculture.parent.area, 48);
  assert.equal(hierarchy.agriculture.total, 48);
  assert.deepEqual(hierarchy.agriculture.children.map((item) => item.category), [
    "pasture", "for_animals", "for_humans", "permanent",
  ]);
  assert.equal(hierarchy.arable.area, 14);
  assert.equal(hierarchy.arable.start, 32);
  assert.equal(hierarchy.arable.end, 46);
  assert.equal(hierarchy.arable.referenceTotal, 149);
  assert.ok(Math.abs(hierarchy.arable.referenceShare - 9.396) < 0.01);
  assert.deepEqual(bars, [
    { category: "arable", area: 14 },
    { category: "for_humans", area: 8 },
    { category: "for_animals", area: 6 },
    { category: "permanent", area: 2 },
  ]);
  const source = read(`${directory}/main.js`);
  assert.match(source, /Promise\.all/);
  assert.match(source, /contract\.files\.map/);
  assert.match(source, /segment\.cumulative/);
  assert.doesNotMatch(source, /Global land surface.*hierarchy\.total/);
});

test("plastic leakage retains paired years and gives every scene a distinct focus", () => {
  const directory = "chapters/goal_14/02-plastic-leakage";
  const config = json(`${directory}/config.json`);
  const dataset = rows(directory, config.dataContract.file);
  const fields = AtlasLoad.validateContract(dataset, config.dataContract);
  const { plasticLeakagePairs, plasticLeakageSummaries, plasticLeakageFocus } = renderer(`${directory}/main.js`);
  const pairs = plasticLeakagePairs(dataset, fields);
  const summaries = plasticLeakageSummaries(pairs, config.dataContract.aggregates);

  assert.equal(pairs.length, 6);
  assert.deepEqual(pairs.find((item) => item.category === "sinking_land"), {
    category: "sinking_land", start: 3.1, end: 5.8, change: 2.6999999999999997, panel: "flow",
  });
  assert.deepEqual(pairs.find((item) => item.category === "stock_oceans"), {
    category: "stock_oceans", start: 30, end: 145, change: 115, panel: "stock",
  });
  assert.deepEqual(summaries.map((item) => ({
    category: item.category,
    start: Number(item.start.toFixed(2)),
    end: Number(item.end.toFixed(2)),
    ratio: Number(item.ratio.toFixed(4)),
  })), [
    { category: "aquatic_leakage", start: 6.14, end: 11.7, ratio: 1.9055 },
    { category: "transport_to_oceans", start: 1.68, end: 4.1, ratio: 2.4405 },
  ]);
  const focuses = config.scenes.map((scene, index) => plasticLeakageFocus(scene, index));
  assert.equal(new Set(focuses.map((focus) => JSON.stringify(focus))).size, 7);
  assert.equal(focuses[0].year, "start");
  assert.equal(focuses[6].year, "end");
  assert.equal(focuses[0].summary, "aquatic_leakage");
  assert.equal(focuses[4].summary, "transport_to_oceans");
  assert.deepEqual(focuses[4].categories, ["rivers_to_oceans", "coasts_to_oceans"]);
  const source = read(`${directory}/main.js`);
  assert.match(source, /item\.start/);
  assert.match(source, /item\.end/);
  assert.match(source, /item\.ratio\.toFixed\(2\)/);
  assert.doesNotMatch(source, /sceneIndex >= 6 \? fields\.endValue/);
});

test("nitrogen and phosphorus are chronological multi-series, not ranked categories", () => {
  const directory = "chapters/goal_14/08-nitrogen-phosphorus";
  const contract = json(`${directory}/config.json`).dataContract;
  const dataset = rows(directory, contract.file);
  const fields = AtlasLoad.validateContract(dataset, contract);
  const { nutrientSeries } = renderer(`${directory}/main.js`);
  const series = nutrientSeries(dataset, fields, contract.projection);

  assert.deepEqual(series.map((item) => item.key), ["nitrogen", "phosphorus"]);
  assert.deepEqual(series[0].points.map((point) => point.year), [1860, 1950, 1980, 1990, 2010, 2050]);
  assert.equal(series[0].points.at(-1).value, 267.2);
  assert.equal(series[0].points.at(-1).projected, true);
  assert.ok(series[0].points.slice(0, -1).every((point) => point.projected === false));
  assert.equal(series[1].points[0].value, 0.3);
  const source = read(`${directory}/main.js`);
  assert.match(source, /AtlasSVG\.line\(observed/);
  assert.match(source, /AtlasSVG\.line\(projectionPath/);
  assert.match(source, /"stroke-dasharray": "7 5"/);
  assert.match(source, /point\.projected \? "#fff"/);
  assert.match(source, /point\.year/);
  assert.doesNotMatch(source, /data\.sort\(\(a, b\) => a\.v - b\.v\)/);
});

test("affordability derives mobile-data cost against the non-food budget", () => {
  const directory = "chapters/goal_16/01-affordability-barrier";
  const contract = json(`${directory}/config.json`).dataContract;
  const dataset = rows(directory, contract.file);
  const fields = AtlasLoad.validateContract(dataset, contract);
  const { affordabilityGroups } = renderer(`${directory}/main.js`);
  const groups = affordabilityGroups(dataset, fields);

  assert.deepEqual(groups.map((item) => item.category), ["LIC", "LMC", "UMC", "HIC"]);
  assert.equal(groups.length, 4);
  const lowIncome = groups[0];
  assert.equal(lowIncome.dataShare, 16.97729373);
  assert.equal(lowIncome.foodShare, 60.12727273);
  assert.deepEqual(
    groups.map((item) => Number(item.dataAsRemainingShare.toFixed(6))),
    [42.578712, 15.393611, 7.333052, 2.17795]
  );
  const source = read(`${directory}/main.js`);
  assert.match(source, /item\.dataShare/);
  assert.match(source, /item\.foodShare/);
  assert.match(source, /item\.dataAsRemainingShare/);
  assert.match(source, /non-food household budget/);
  assert.doesNotMatch(source, /\["foodShare", item\.foodShare\]/);
  assert.doesNotMatch(source, /flatMap\(\(row\) =>/);
});

test("algal-bloom map requires valid points and uses its geographic base texture", () => {
  const directory = "chapters/goal_14/14-algal-blooms";
  const config = json(`${directory}/config.json`);
  const dataset = rows(directory, config.dataContract.file);
  const points = AtlasLoad.algalBloomPoints(dataset, config.dataContract);
  const { requireAlgalBloomPoints, aggregateAlgalBloomSites, algalBloomRadius } = renderer(`${directory}/main.js`);
  assert.throws(
    () => requireAlgalBloomPoints([]),
    /no valid longitude\/latitude event points/
  );
  assert.equal(requireAlgalBloomPoints([{ longitude: 1, latitude: 2 }]).length, 1);
  const sites = aggregateAlgalBloomSites(points);
  assert.equal(sites.length, 85);
  assert.equal(sites.reduce((sum, site) => sum + site.count, 0), 1094);
  assert.equal(Math.max(...sites.map((site) => site.count)), 371);
  assert.equal(
    new Set(sites.map((site) => `${site.longitude}|${site.latitude}`)).size,
    sites.length
  );
  const singleRecordRadius = algalBloomRadius(1, 371);
  const maximumRadius = algalBloomRadius(371, 371);
  assert.ok(Math.abs(maximumRadius ** 2 / singleRecordRadius ** 2 - 371) < 1e-9);
  assert.throws(() => algalBloomRadius(1, 0), /invalid proportional-area scale input/);
  const source = read(`${directory}/main.js`);
  assert.match(source, /ocean_floor_rivers\.jpg/);
  assert.match(source, /Longitude/);
  assert.match(source, /Latitude/);
  assert.match(source, /Circle area is proportional to record count/);
  assert.match(source, /algalBloomRadius\(count, maximumCount\)/);
});

test("corrected legends and annotations stay usable at mobile chart width", async () => {
  const mobile = { width: 344, height: 420 };

  const [incomeMap] = await smokeRenderer(
    "chapters/goal_08/04-income-world-map", [0], mobile
  );
  const incomeMapLabels = [
    "Low income", "Lower middle income", "Upper middle income", "High income", "No classification",
  ].map((label) => textNode(incomeMap, label));
  assert.equal(new Set(incomeMapLabels.map((node) => node.attributes.y)).size, 3);
  incomeMapLabels.forEach((node) => assertTextFits(node, mobile.width, "income-map legend"));
  assertTextFits(
    textNode(incomeMap, "Equal-area tiles; the bundled CSV has no geometry."),
    mobile.width,
    "income-map note"
  );

  const [incomeClassification] = await smokeRenderer(
    "chapters/goal_08/05-income-classification-scroller", [0], mobile
  );
  const classificationLabels = [
    "Low income", "Lower middle", "Upper middle", "High income", "No classification",
  ].map((label) => textNode(incomeClassification, label));
  assert.equal(new Set(classificationLabels.map((node) => node.attributes.y)).size, 3);
  classificationLabels.forEach((node) =>
    assertTextFits(node, mobile.width, "income-classification legend")
  );
  const disclosure = textNode(
    incomeClassification, "Bundled snapshot: 51 low-income classifications in 1990."
  );
  assert.ok(Number(disclosure.attributes.y) > Math.max(
    ...classificationLabels.map((node) => Number(node.attributes.y))
  ));

  const [growth] = await smokeRenderer(
    "chapters/goal_08/05-income-classification-scroller", [5], mobile
  );
  [
    "Current LIC economies with growth data · 19",
    "Average annual GDP/capita growth, 2015–2024.",
    "Coverage: 19 of 25; missing values omitted.",
  ].forEach((line) => assertTextFits(textNode(growth, line), mobile.width, "income-growth note"));

  const [inequality] = await smokeRenderer(
    "chapters/goal_10/01-high-inequality-map", [0], mobile
  );
  const inequalityLabels = [
    "High > 40 · 43", "Moderate 30–40 · 93", "Low < 30 · 33",
  ].map((label) => textNode(inequality, label));
  assert.equal(new Set(inequalityLabels.map((node) => node.attributes.y)).size, 2);
  inequalityLabels.forEach((node) => assertTextFits(node, mobile.width, "inequality legend"));
  assertTextFits(
    textNode(inequality, "43 high-inequality economies appear first."),
    mobile.width,
    "inequality annotation"
  );
  assertTextFits(
    textNode(inequality, "Ranked tiles; no geometry or region field."),
    mobile.width,
    "inequality limitation"
  );

  const [plastic] = await smokeRenderer(
    "chapters/goal_14/02-plastic-leakage", [0], mobile
  );
  const plasticLabel = textNode(plastic, "Sinking to river and lake beds");
  assert.equal(plasticLabel.attributes["text-anchor"], "start");
  assertTextFits(plasticLabel, mobile.width, "plastic category label");
  assertTextFits(
    textNode(plastic, "Aquatic leakage: 6.14 → 11.70 Mt/year · 1.91×"),
    mobile.width,
    "plastic aggregate"
  );
  const plasticBars = descendants(plastic).filter((node) =>
    node.tagName === "rect" && Number(node.attributes.x) === 18 && Number(node.attributes.width) > 20
  );
  assert.ok(Math.max(...plasticBars.map((node) => Number(node.attributes.width))) >= mobile.width * 0.45);

  const [nutrients] = await smokeRenderer(
    "chapters/goal_14/08-nitrogen-phosphorus", [0], mobile
  );
  ["Nitrogen", "Phosphorus", "2050 projection"].forEach((label) =>
    assertTextFits(textNode(nutrients, label), mobile.width, "nutrient legend")
  );
  const visibleYearNodes = [1860, 1950, 1980, 1990, 2010, 2050]
    .flatMap((year) => textNodes(nutrients, String(year)));
  assert.deepEqual(visibleYearNodes.map((node) => Number(node.textContent)), [1860, 1950, 1980, 2010, 2050]);
  const yearPositions = visibleYearNodes.map((node) => Number(node.attributes.x));
  assert.ok(yearPositions.slice(1).every((position, index) => position - yearPositions[index] >= 30));
});

test("all corrected semantic renderers smoke against their real CSVs", async () => {
  await smokeRenderer("chapters/goal_04/02-education-quality-details", [0]);
  await smokeRenderer("chapters/goal_14/07-plastic-seafood", [0]);
  await smokeRenderer("chapters/goal_15/00-land-use", [0]);
  await smokeRenderer("chapters/goal_14/02-plastic-leakage", [0, 1, 2, 3, 4, 5, 6]);
  await smokeRenderer("chapters/goal_14/08-nitrogen-phosphorus", [0]);
  await smokeRenderer("chapters/goal_16/01-affordability-barrier", [0]);
  await smokeRenderer("chapters/goal_14/14-algal-blooms", [0]);
});

test("digital-language divergence retains both over- and underrepresentation", () => {
  const directory = "chapters/goal_16/02-digital-language-divide";
  const contract = json(`${directory}/config.json`).dataContract;
  const dataset = rows(directory, contract.file);
  const fields = AtlasLoad.validateContract(dataset, contract);
  const { languageRepresentationGaps } = renderer(`${directory}/main.js`);
  const languages = languageRepresentationGaps(dataset, fields);

  assert.ok(languages.length >= 150);
  assert.ok(Math.min(...languages.map((item) => item.gap)) < 0);
  assert.ok(Math.max(...languages.map((item) => item.gap)) > 0);
  assert.ok(languages.every((item) =>
    Math.abs(item.gap - (item.speakerPercent - item.urlPercent)) < 1e-12
  ));
  const source = read(`${directory}/main.js`);
  assert.match(source, /\[-maximumAbsoluteGap, maximumAbsoluteGap\]/);
  assert.match(source, /Math\.min\(zero, end\)/);
  assert.match(source, /Math\.abs\(end - zero\)/);
});

test("UHC speed scores exclude CSV blanks and use a signed zero-centered domain", () => {
  const directory = "chapters/goal_03/05-uhc-speed-scores-scroller";
  const contract = json(`${directory}/config.json`).dataContract;
  const { uhcSpeedScores } = renderer(`${directory}/main.js`);

  contract.files.forEach((file) => {
    const dataset = rows(directory, file);
    const fields = AtlasLoad.validateContract(dataset, contract);
    const scores = uhcSpeedScores(dataset, fields);
    const nonBlank = dataset.filter((row) =>
      String(row[fields.value] ?? "").trim() !== ""
    );
    assert.equal(scores.length, nonBlank.length, `${file} must not coerce blanks to zero`);
    assert.ok(scores.some((item) => item.value < 0), `${file} should retain negative scores`);
    assert.ok(scores.some((item) => item.value > 0), `${file} should retain positive scores`);
  });
  const source = read(`${directory}/main.js`);
  assert.match(source, /\[-maximumAbsolute, maximumAbsolute\]/);
  assert.match(source, /No speed scores are available/);
  assert.match(source, /validScores\.length/);
  assert.doesNotMatch(source, /Math\.max\(\.\.\.data\.map\(d => d\.v\), 1\)/);
});

test("semantic renderers execute every distinct scene branch with their real CSVs", async () => {
  const cases = [
    ["chapters/goal_14/03-plastic-discharge", [0]],
    ["chapters/goal_10/01-high-inequality-map", [0]],
    ["chapters/goal_08/04-income-world-map", [0, 1, 2]],
    ["chapters/goal_08/05-income-classification-scroller", [0, 1, 2, 3, 4, 5]],
    ["chapters/goal_03/06-uhc-outcomes-scroller", [0, 1, 2]],
    ["chapters/goal_progress/00-poverty-progress-comparison", [0, 1, 2]],
    ["chapters/goal_progress/01-poverty-rate-change-scroller", [0, 5, 10, 17, 18, 19]],
    ["chapters/goal_16/02-digital-language-divide", [0]],
    ["chapters/goal_03/05-uhc-speed-scores-scroller", [0, 1, 2]],
  ];
  for (const [directory, sceneIndexes] of cases) {
    await smokeRenderer(directory, sceneIndexes);
  }
});

test("fossil subsidy scrollers render every scene through the shared renderer", async () => {
  const cases = [
    ["chapters/goal_12/00-intro-scroller", 6],
    ["chapters/goal_12/04-intro-scroller-2", 3],
  ];
  for (const [directory, expectedScenes] of cases) {
    const config = json(`${directory}/config.json`);
    assert.equal(config.scenes.length, expectedScenes,
      `${directory} must keep its scene count; update this test when scenes change`);
    const rendered = await smokeRenderer(
      directory,
      config.scenes.map((scene, index) => index),
      { sharedScripts: ["shared/fossil-subsidies.js"], requireScenes: true }
    );
    rendered.forEach((chartEl, index) => {
      const marks = drawableNodes(chartEl);
      assert.ok(marks.length > 0,
        `${directory} scene ${config.scenes[index].id} must draw at least one mark`);
    });
  }
});
