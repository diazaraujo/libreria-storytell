const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const {
  AtlasLoad,
  createLatestGate,
  numberOrNaN,
  parseCsv,
} = require("../shared/load.js");

test("parseCsv handles CRLF, multiline fields, escaped quotes, and numeric values", () => {
  const text = [
    "name,note,value",
    'Alpha,"first line\r\nsecond line",1.0',
    'Beta,"She said ""hello""",-2.5e1',
    "",
  ].join("\r\n");
  const rows = parseCsv(text);
  assert.deepEqual(rows, [
    { name: "Alpha", note: "first line\r\nsecond line", value: 1 },
    { name: "Beta", note: 'She said "hello"', value: -25 },
  ]);
});

test("the real exposure CSV is parsed as 52 logical records", () => {
  const file = path.join(
    __dirname,
    "../chapters/goal_16/04-exposure/data/beeswarm_updated.csv"
  );
  const rows = parseCsv(fs.readFileSync(file, "utf8"));
  assert.equal(rows.length, 52);
  assert.match(rows[1].isco08_definition, /Non-commissioned armed forces officers/);
  assert.equal(rows[1].isco08, 2);
});

test("numeric conversion preserves missingness instead of inventing zeroes", () => {
  for (const value of ["", "   ", null, undefined, "not-a-number"]) {
    assert.ok(Number.isNaN(numberOrNaN(value)), String(value));
  }
  assert.equal(numberOrNaN("0"), 0);
  assert.equal(numberOrNaN(" -2.5 "), -2.5);
});

test("latest render gate invalidates older asynchronous work", () => {
  const gate = createLatestGate();
  const first = gate.start();
  assert.equal(first.isCurrent(), true);
  const second = gate.start();
  assert.equal(first.isCurrent(), false);
  assert.equal(second.isCurrent(), true);
  gate.invalidate();
  assert.equal(second.isCurrent(), false);
});

test("firstCsv performs only one fetch for a successful candidate", async () => {
  const originalFetch = global.fetch;
  let calls = 0;
  global.fetch = async (url) => {
    calls += 1;
    assert.equal(url, "./data/example.csv");
    return {
      ok: true,
      status: 200,
      text: async () => "label,value\nA,7\n",
    };
  };
  try {
    const result = await AtlasLoad.firstCsv("example.csv");
    assert.equal(calls, 1);
    assert.deepEqual(result, {
      url: "./data/example.csv",
      rows: [{ label: "A", value: 7 }],
    });
  } finally {
    global.fetch = originalFetch;
  }
});

test("csv rejects non-success HTTP responses", async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => ({ ok: false, status: 404 });
  try {
    await assert.rejects(() => AtlasLoad.csv("missing.csv"), /missing\.csv \(404\)/);
  } finally {
    global.fetch = originalFetch;
  }
});

test("validateContract reports missing columns rather than guessing", () => {
  assert.throws(
    () => AtlasLoad.validateContract([{ category: "A", year: 2022 }], {
      columns: { category: "category", value: "actual_value" },
    }),
    /missing required column actual_value/
  );
});
