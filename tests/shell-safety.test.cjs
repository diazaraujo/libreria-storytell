const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const source = fs.readFileSync(
  path.resolve(__dirname, "../shared/shell.js"),
  "utf8"
);

test("shell awaits render failures and surfaces them", () => {
  assert.match(source, /await Promise\.resolve\(window\.AtlasReplica\.render/);
  assert.match(source, /catch \(err\)[\s\S]*showRenderError\(err\)/);
  assert.match(source, /placeholder\.replaceChildren\(strong, detail\)/);
});

test("shell stages async renders and commits only the newest token", () => {
  assert.match(source, /const token = renderGate\.start\(\)/);
  assert.match(source, /if \(!token\.isCurrent\(\)\)/);
  assert.match(source, /chart\.replaceChildren\(\.\.\.staging\.childNodes\)/);
  assert.doesNotMatch(source, /window\.AtlasReplica\.render\(scene, \{ \.\.\.ctx\(\), animate \}\)/);
});

test("shell does not hide the placeholder after a failed static render", () => {
  assert.doesNotMatch(source, /Always hide scaffold after custom render/);
  assert.match(source, /if \(placeholderRequest\.visible\)/);
  assert.match(source, /placeholder\.hidden = true/);
});
