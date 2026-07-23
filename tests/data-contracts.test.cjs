const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const { AtlasLoad, parseCsv } = require("../shared/load.js");

const ROOT = path.resolve(__dirname, "..");
const CONTRACT_DIRS = [
  "chapters/goal_03/05-uhc-speed-scores-scroller",
  "chapters/goal_03/06-uhc-outcomes-scroller",
  "chapters/goal_04/02-education-quality-details",
  "chapters/goal_08/04-income-world-map",
  "chapters/goal_08/05-income-classification-scroller",
  "chapters/goal_10/01-high-inequality-map",
  "chapters/goal_12/00-intro-scroller",
  "chapters/goal_12/04-intro-scroller-2",
  "chapters/goal_12/06-ch12-reforms-scroller",
  "chapters/goal_14/02-plastic-leakage",
  "chapters/goal_14/03-plastic-discharge",
  "chapters/goal_14/06-fish-mortality",
  "chapters/goal_14/07-plastic-seafood",
  "chapters/goal_14/08-nitrogen-phosphorus",
  "chapters/goal_14/14-algal-blooms",
  "chapters/goal_15/00-land-use",
  "chapters/goal_16/01-affordability-barrier",
  "chapters/goal_16/02-digital-language-divide",
  "chapters/goal_16/04-exposure",
  "chapters/goal_progress/00-poverty-progress-comparison",
  "chapters/goal_progress/01-poverty-rate-change-scroller",
];

function json(relative) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relative), "utf8"));
}

function validateFile(directory, file, contract) {
  const filename = path.join(ROOT, directory, "data", file);
  assert.ok(fs.existsSync(filename), `${directory}: missing ${file}`);
  const rows = parseCsv(fs.readFileSync(filename, "utf8"));
  assert.ok(rows.length > 0, `${directory}/${file}: no records`);
  AtlasLoad.validateContract(rows, contract, `${directory}/${file}`);
}

test("all 21 formerly heuristic renderers have valid explicit data contracts", () => {
  assert.equal(CONTRACT_DIRS.length, 21);
  for (const directory of CONTRACT_DIRS) {
    const config = json(`${directory}/config.json`);
    const contract = config.dataContract;
    assert.ok(contract && contract.kind, `${directory}: missing dataContract.kind`);
    if (contract.file) validateFile(directory, contract.file, contract);
    for (const file of contract.files || []) validateFile(directory, file, contract);
    for (const dataset of Object.values(contract.datasets || {})) {
      validateFile(directory, dataset.file, dataset);
    }
  }
});

test("the 21 renderers do not infer the first numeric column", () => {
  for (const directory of CONTRACT_DIRS) {
    const source = fs.readFileSync(path.join(ROOT, directory, "main.js"), "utf8");
    assert.doesNotMatch(source, /headers\.find\s*\(/, directory);
    assert.doesNotMatch(source, /rows\.some\s*\([^)]*Number\.isFinite/, directory);
    assert.doesNotMatch(source, /headers\s*\[\s*[01]\s*\]/, directory);
  }
});

test("map contracts declare categorical or coordinate roles", () => {
  const expectedKinds = new Map([
    ["chapters/goal_08/04-income-world-map", "categorical-map"],
    ["chapters/goal_10/01-high-inequality-map", "categorical-map"],
    ["chapters/goal_14/03-plastic-discharge", "point-map"],
    ["chapters/goal_14/14-algal-blooms", "point-map"],
  ]);
  for (const [directory, kind] of expectedKinds) {
    assert.equal(json(`${directory}/config.json`).dataContract.kind, kind);
  }
});
