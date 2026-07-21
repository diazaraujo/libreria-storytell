const assert = require("node:assert/strict");
const childProcess = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const ROOT = path.resolve(__dirname, "..");

function run(command, args, options = {}) {
  return childProcess.spawnSync(command, args, {
    cwd: ROOT,
    encoding: "utf8",
    ...options,
  });
}

test("scaffolding preserves files and local config extensions by behavior", () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "story-scaffold-"));
  try {
    const program = String.raw`
import importlib.util
import json
import pathlib
import sys

root = pathlib.Path(sys.argv[1])
module_path = pathlib.Path(sys.argv[2])
spec = importlib.util.spec_from_file_location("scaffold_all", module_path)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
module.ROOT = root
module.TEMPLATE = "title={{TITLE}}"

atlas = root / "atlas"
(atlas / "data").mkdir(parents=True)
(atlas / "data" / "source.csv").write_text("category,value\nnew,2\n")

item = {
    "index": 7,
    "chapterId": "99",
    "chapterTitle": "Test",
    "dir": "chapters/goal_99/00-example",
    "graphic": "example",
    "type": "vis",
    "status": "ready",
    "fidelity": "tier-B-bulk",
    "approved": False,
    "template": "vis",
    "reference": None,
    "title": "New title",
    "subtitle": "",
    "sceneCount": 0,
    "scenes": [],
    "data_download": "source.csv",
    "config": {"title": "New title", "graphic": "example"},
}

dest = root / item["dir"]
(dest / "data").mkdir(parents=True)
(dest / "config.json").write_text(json.dumps({
    "title": "Old title",
    "dataContract": {"kind": "bars", "columns": {"value": "value"}},
    "localExtension": {"keep": True},
    "_meta": {"status": "old"},
}))
(dest / "index.html").write_text("old shell")
(dest / "main.js").write_text("old main")
(dest / "README.md").write_text("old readme")
(dest / "data" / "source.csv").write_text("category,value\nold,1\n")

module.scaffold_item(atlas, item)
assert (dest / "index.html").read_text() == "old shell"
assert (dest / "main.js").read_text() == "old main"
assert (dest / "README.md").read_text() == "old readme"
assert "old,1" in (dest / "data" / "source.csv").read_text()
assert json.loads((dest / "config.json").read_text())["title"] == "Old title"

module.scaffold_item(
    atlas,
    item,
    force_main=True,
    force_data=True,
    write_metadata=True,
    write_shells=True,
)
config = json.loads((dest / "config.json").read_text())
assert config["title"] == "New title"
assert config["dataContract"]["columns"]["value"] == "value"
assert config["localExtension"] == {"keep": True}
assert config["_meta"]["status"] == "ready"
assert (dest / "index.html").read_text() == "title=New title"
assert (dest / "main.js").read_text() != "old main"
assert (dest / "README.md").read_text() != "old readme"
assert "new,2" in (dest / "data" / "source.csv").read_text()
`;
    const result = run("python3", ["-B", "-c", program, temporary, path.join(ROOT, "scripts/scaffold_all.py")]);
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
});

test("mirror reset occurs only after the explicit --force-reset flag", () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "story-mirror-"));
  try {
    const bin = path.join(temporary, "bin");
    const atlas = path.join(temporary, "atlas");
    const log = path.join(temporary, "git.log");
    fs.mkdirSync(bin);
    fs.mkdirSync(path.join(atlas, ".git"), { recursive: true });

    const fakeGit = `#!/usr/bin/env bash
printf '%s\\n' "$*" >> "$GIT_LOG"
if [[ "$*" == *"pull --ff-only"* ]]; then exit 1; fi
if [[ "$*" == *"log -1 --oneline"* ]]; then echo "fake head"; fi
exit 0
`;
    const fakePython = "#!/usr/bin/env bash\nexit 0\n";
    fs.writeFileSync(path.join(bin, "git"), fakeGit);
    fs.writeFileSync(path.join(bin, "python3"), fakePython);
    fs.chmodSync(path.join(bin, "git"), 0o755);
    fs.chmodSync(path.join(bin, "python3"), 0o755);

    const env = {
      ...process.env,
      PATH: `${bin}:${process.env.PATH}`,
      ATLAS_PATH: atlas,
      GIT_LOG: log,
    };
    const script = path.join(ROOT, "scripts/mirror/sync-atlas.sh");
    const safe = run("bash", [script], { env });
    assert.notEqual(safe.status, 0, "a failed pull must stop without opt-in");
    assert.doesNotMatch(fs.readFileSync(log, "utf8"), /reset --hard/);

    fs.writeFileSync(log, "");
    const forced = run("bash", [script, "--force-reset"], { env });
    assert.equal(forced.status, 0, `${forced.stdout}\n${forced.stderr}`);
    assert.match(fs.readFileSync(log, "utf8"), /reset --hard origin\/main/);
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
});
