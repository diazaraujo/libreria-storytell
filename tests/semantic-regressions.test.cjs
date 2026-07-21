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

test("fossil subsidies bind named subsidy metrics, never Year as the value", () => {
  const directory = "chapters/goal_12/00-intro-scroller";
  const contract = json(`${directory}/config.json`).dataContract.datasets;
  const columnRows = parseCsv(read(`${directory}/data/${contract.column.file}`));
  const columnFields = AtlasLoad.validateContract(columnRows, contract.column);
  assert.equal(columnFields.year, "Year");
  assert.equal(columnFields.subsidy, "Fossil fuel subsidy (2021 USD billions)");
  assert.equal(columnFields.percentGdp, "Fossil fuel subsidy (% of GDP)");
  const latest = columnRows.find((row) => row.Year === 2022);
  assert.ok(latest[contract.column.columns.subsidy] > 1200);
  assert.ok(latest[contract.column.columns.percentGdp] > 1.2);

  const bubbleRows = parseCsv(read(`${directory}/data/${contract.bubble.file}`));
  const countries = AtlasLoad.fossilSubsidies(bubbleRows, contract.bubble);
  assert.ok(countries.length > 100);
  assert.ok(countries.every((row) => row.percentGdp !== row.year));
  const lowSubsidyHighIncome = countries.filter((row) =>
    row.year === 2022 &&
    row.incomeGroup === "High-income country" &&
    row.perCapita < 30
  );
  assert.deepEqual(
    lowSubsidyHighIncome.map((row) => row.country).sort(),
    ["Finland", "Norway", "Portugal", "Sweden"]
  );
  assert.match(read("shared/fossil-subsidies.js"), /High-income country/);
  assert.match(read("shared/fossil-subsidies.js"), /row\.perCapita < 30/);
  assert.doesNotMatch(read(`${directory}/main.js`), /valKey|headers\.find/);
});

test("algal blooms parse 1,094 valid lon/lat records spanning 2016–2025", () => {
  const directory = "chapters/goal_14/14-algal-blooms";
  const contract = json(`${directory}/config.json`).dataContract;
  const rows = parseCsv(read(`${directory}/data/${contract.file}`));
  const points = AtlasLoad.algalBloomPoints(rows, contract);
  assert.equal(points.length, 1094);
  assert.equal(Math.min(...points.map((point) => point.year)), 2016);
  assert.equal(Math.max(...points.map((point) => point.year)), 2025);
  assert.ok(points.every((point) => point.longitude >= -180 && point.longitude <= 180));
  assert.ok(points.every((point) => point.latitude >= -90 && point.latitude <= 90));
  assert.match(read(`${directory}/main.js`), /algalBloomPoints/);
});

test("AI exposure uses AIOE and scene-specific employment-share groups", () => {
  const directory = "chapters/goal_16/04-exposure";
  const contract = json(`${directory}/config.json`).dataContract;
  const rows = parseCsv(read(`${directory}/data/${contract.file}`));
  assert.equal(rows.length, 52);
  const global = AtlasLoad.exposureOccupations(rows, contract, "glo");
  assert.equal(global.length, 52);
  assert.ok(global.every((row) => row.score >= 0 && row.score <= 100));
  assert.equal(global[0].occupation, "Commissioned Armed forces Officers");
  assert.ok(Math.abs(global[0].score - 87.967789) < 1e-6);
  const expectedCounts = { hic: 38, mic: 52, lic: 40 };
  for (const group of ["hic", "mic", "lic"]) {
    const occupations = AtlasLoad.exposureOccupations(rows, contract, group);
    assert.equal(occupations.length, expectedCounts[group]);
    assert.ok(occupations.every((row) => Number.isFinite(row.share)));
  }
  const source = read(`${directory}/main.js`);
  assert.match(source, /sceneIndex >= 5 \? "lic"/);
  assert.match(source, /sceneIndex === 4 \? "mic"/);
  assert.match(source, /sceneIndex === 3 \? "hic"/);
  assert.match(source, /not US-specific/);
  assert.match(contract.limitations.scene4, /no United States employment-share column/);
  assert.doesNotMatch(source, /isco08[^\n]*\+|valKey|headers\.find/);
});
