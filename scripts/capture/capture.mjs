#!/usr/bin/env node
/**
 * Programmatic video capture for Atlas visualizations.
 *
 * Modes:
 *   --target replica   Record local scaffolds/ready pages (default)
 *   --target atlas     Record live Data360 Atlas chapter pages (scroll-through)
 *
 * Examples:
 *   node capture.mjs --only 17
 *   node capture.mjs --only spi_scroller --seconds 25
 *   node capture.mjs --target atlas --only data-for-development
 *   node capture.mjs --limit 5
 *   node capture.mjs --list
 */

import { chromium } from "playwright";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const INVENTORY = path.join(ROOT, "inventory", "index.json");
const OUT_DIR = path.join(ROOT, "recordings");

const CHAPTER_SLUGS = {
  "01": "extreme-poverty",
  "04": "learning-and-work",
  "05": "gender-and-jobs",
  "06": "water-access",
  "07": "electricity-access",
  "09": "internet-access",
  "10": "inequality",
  "11": "urban-development",
  "13": "climate",
  "16": "artificial-intelligence",
  "17": "data-for-development",
  dashboard: "global-progress",
  progress: "measuring-progress",
};

function parseArgs(argv) {
  const args = {
    target: "replica",
    only: null,
    limit: null,
    seconds: null,
    width: 1440,
    height: 900,
    base: "http://127.0.0.1:8787",
    atlasBase: "https://data360.worldbank.org/en/atlas",
    list: false,
    mp4: true,
    headed: false,
    status: null, // ready | scaffold | all
    concurrency: 1,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    const next = argv[i + 1];
    if (a === "--target") args.target = next;
    else if (a === "--only") args.only = next;
    else if (a === "--limit") args.limit = +next;
    else if (a === "--seconds") args.seconds = +next;
    else if (a === "--width") args.width = +next;
    else if (a === "--height") args.height = +next;
    else if (a === "--base") args.base = next;
    else if (a === "--atlas-base") args.atlasBase = next;
    else if (a === "--status") args.status = next;
    else if (a === "--list") args.list = true;
    else if (a === "--no-mp4") args.mp4 = false;
    else if (a === "--headed") args.headed = true;
    else if (a === "--help" || a === "-h") args.help = true;
  }
  return args;
}

function loadItems(args) {
  const items = JSON.parse(fs.readFileSync(INVENTORY, "utf8"));
  let list = items;
  if (args.only) {
    const key = args.only.toLowerCase();
    list = items.filter(
      (i) =>
        i.graphic === args.only ||
        i.chapterId === args.only ||
        (CHAPTER_SLUGS[i.chapterId] || "") === args.only ||
        i.dir.includes(args.only) ||
        (i.title || "").toLowerCase().includes(key) ||
        (i.graphic || "").toLowerCase().includes(key)
    );
  }
  if (args.status && args.status !== "all") {
    list = list.filter((i) => i.status === args.status);
  }
  if (args.limit) list = list.slice(0, args.limit);
  return list;
}

function slugify(s) {
  return String(s || "item")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function outPaths(item) {
  const name = `${String(item.index).padStart(3, "0")}_${item.chapterId}_${slugify(item.graphic)}`;
  const dir = path.join(OUT_DIR, item.chapterId, name);
  fs.mkdirSync(dir, { recursive: true });
  return {
    dir,
    webm: path.join(dir, "capture.webm"),
    mp4: path.join(dir, "capture.mp4"),
    meta: path.join(dir, "meta.json"),
  };
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function webmToMp4(webm, mp4) {
  return new Promise((resolve, reject) => {
    const ff = spawn(
      "ffmpeg",
      [
        "-y",
        "-i",
        webm,
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        "-an",
        mp4,
      ],
      { stdio: "ignore" }
    );
    ff.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`ffmpeg exit ${code}`))
    );
  });
}

/** Advance replica shell with keyboard / scroll / buttons */
async function playReplica(page, item, seconds) {
  const sceneCount = Math.max(1, item.sceneCount || 1);
  const perScene = seconds
    ? (seconds * 1000) / sceneCount
    : item.type === "scroller"
      ? 2200
      : 3500;
  const totalBudget =
    seconds != null
      ? seconds * 1000
      : item.type === "scroller"
        ? sceneCount * 2200 + 1500
        : 5000;

  await page.waitForTimeout(800);

  // Prefer next buttons if present
  const hasNav = await page.locator("#btn-next").count();
  if (item.type === "scroller" && hasNav) {
    for (let i = 0; i < sceneCount; i++) {
      await page.waitForTimeout(perScene);
      if (i < sceneCount - 1) {
        const disabled = await page.locator("#btn-next").isDisabled().catch(() => true);
        if (!disabled) await page.locator("#btn-next").click().catch(() => {});
        else await page.keyboard.press("ArrowRight").catch(() => {});
      }
    }
  } else if (item.type === "scroller") {
    // wheel scroll through stage
    const steps = Math.max(sceneCount * 3, 8);
    for (let i = 0; i < steps; i++) {
      await page.mouse.wheel(0, 500);
      await page.waitForTimeout(totalBudget / steps);
    }
  } else if (item.graphic === "draw_your_chart") {
    // auto-draw a plausible poverty decline then reveal
    await autoDrawPoverty(page);
  } else {
    await page.waitForTimeout(totalBudget);
  }

  // small hold at end
  await page.waitForTimeout(600);
}

async function autoDrawPoverty(page) {
  const svg = page.locator(".draw-svg-wrap svg");
  if ((await svg.count()) === 0) {
    await page.waitForTimeout(4000);
    return;
  }
  const box = await svg.boundingBox();
  if (!box) {
    await page.waitForTimeout(4000);
    return;
  }
  // draw from left (1950 ~58%) to right (~10%)
  const x0 = box.x + box.width * 0.08;
  const x1 = box.x + box.width * 0.92;
  const yHigh = box.y + box.height * 0.42; // ~58%
  const yLow = box.y + box.height * 0.88; // ~10%
  await page.mouse.move(x0, yHigh);
  await page.mouse.down();
  const steps = 40;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const x = x0 + (x1 - x0) * t;
    // slight curve
    const y = yHigh + (yLow - yHigh) * Math.pow(t, 1.15);
    await page.mouse.move(x, y);
    await sleep(30);
  }
  await page.mouse.up();
  await sleep(500);
  const done = page.locator("#btn-done");
  if (await done.isEnabled().catch(() => false)) {
    await done.click();
  } else {
    await page.locator("#btn-show-data").click().catch(() => {});
  }
  await sleep(2500);
}

/** Scroll live Atlas chapter story */
async function playAtlasChapter(page, seconds) {
  const budget = (seconds || 40) * 1000;
  await page.waitForTimeout(2000);
  // dismiss cookies if any
  for (const sel of [
    "button:has-text('Accept')",
    "button:has-text('I agree')",
    "#onetrust-accept-btn-handler",
  ]) {
    const b = page.locator(sel);
    if (await b.count()) {
      await b.first().click().catch(() => {});
      break;
    }
  }
  const steps = 48;
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, 650);
    await page.waitForTimeout(budget / steps);
  }
  await page.waitForTimeout(1000);
}

function replicaUrl(item, args) {
  const base = args.base.replace(/\/$/, "");
  // Prefer full ready builds when present
  if (item.graphic === "spi_scroller") {
    return `${base}/_ready/spi-scroller/index.html`;
  }
  return `${base}/${item.dir}/index.html`;
}

async function playReadySpi(page, seconds) {
  // Full SPI recreation: keyboard / progress dots / wheel on stage
  const budget = (seconds || 24) * 1000;
  await page.waitForTimeout(1000);
  const scenes = 9;
  const per = budget / scenes;
  for (let i = 0; i < scenes; i++) {
    await page.waitForTimeout(per);
    if (i < scenes - 1) {
      await page.keyboard.press("ArrowRight").catch(() => {});
    }
  }
  await page.waitForTimeout(500);
}

async function recordReplicaItem(browser, item, args) {
  const paths = outPaths(item);
  const url = replicaUrl(item, args);
  const context = await browser.newContext({
    viewport: { width: args.width, height: args.height },
    recordVideo: {
      dir: paths.dir,
      size: { width: args.width, height: args.height },
    },
  });
  const page = await context.newPage();
  const started = Date.now();
  let error = null;
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
    if (item.graphic === "spi_scroller" && url.includes("_ready/")) {
      await playReadySpi(page, args.seconds);
    } else {
      await playReplica(page, item, args.seconds);
    }
  } catch (e) {
    error = String(e);
    console.error("  error:", error);
  }
  await context.close(); // flushes video

  // Playwright names video randomly; find webm in dir
  const files = fs.readdirSync(paths.dir).filter((f) => f.endsWith(".webm"));
  let webm = files[0] ? path.join(paths.dir, files[0]) : null;
  if (webm && webm !== paths.webm) {
    fs.renameSync(webm, paths.webm);
    webm = paths.webm;
  }

  let mp4Ok = false;
  if (args.mp4 && webm && fs.existsSync(webm)) {
    try {
      await webmToMp4(webm, paths.mp4);
      mp4Ok = true;
    } catch (e) {
      console.error("  ffmpeg failed:", e.message);
    }
  }

  const meta = {
    item,
    url,
    target: "replica",
    durationMs: Date.now() - started,
    webm: webm && fs.existsSync(webm) ? path.relative(ROOT, webm) : null,
    mp4: mp4Ok ? path.relative(ROOT, paths.mp4) : null,
    error,
    recordedAt: new Date().toISOString(),
  };
  fs.writeFileSync(paths.meta, JSON.stringify(meta, null, 2));
  return meta;
}

async function recordAtlasChapter(browser, chapterId, args) {
  const slug = CHAPTER_SLUGS[chapterId] || chapterId;
  const url = `${args.atlasBase.replace(/\/$/, "")}/${slug}/?lang=en`;
  const dir = path.join(OUT_DIR, "_atlas_chapters", slug);
  fs.mkdirSync(dir, { recursive: true });
  const context = await browser.newContext({
    viewport: { width: args.width, height: args.height },
    recordVideo: {
      dir,
      size: { width: args.width, height: args.height },
    },
  });
  const page = await context.newPage();
  const started = Date.now();
  let error = null;
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
    await playAtlasChapter(page, args.seconds || 45);
  } catch (e) {
    error = String(e);
    console.error("  error:", error);
  }
  await context.close();
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".webm"));
  let webm = files[0] ? path.join(dir, files[0]) : null;
  const finalWebm = path.join(dir, "chapter.webm");
  if (webm) {
    fs.renameSync(webm, finalWebm);
    webm = finalWebm;
  }
  let mp4Ok = false;
  const mp4 = path.join(dir, "chapter.mp4");
  if (args.mp4 && webm) {
    try {
      await webmToMp4(webm, mp4);
      mp4Ok = true;
    } catch (e) {
      console.error("  ffmpeg failed:", e.message);
    }
  }
  const meta = {
    chapterId,
    slug,
    url,
    target: "atlas",
    durationMs: Date.now() - started,
    webm: webm ? path.relative(ROOT, webm) : null,
    mp4: mp4Ok ? path.relative(ROOT, mp4) : null,
    error,
    recordedAt: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(dir, "meta.json"), JSON.stringify(meta, null, 2));
  return meta;
}

function printHelp() {
  console.log(`Atlas video capture

Usage:
  node capture.mjs [options]

Options:
  --target replica|atlas   What to record (default: replica)
  --only <id|graphic|slug> Filter chapter id, graphic name, or atlas slug
  --status ready|scaffold  Only items with this status (replica mode)
  --limit N                First N items
  --seconds N              Force duration budget per item/chapter
  --base URL               Replica server (default http://127.0.0.1:8787)
  --atlas-base URL         Live atlas base
  --width --height         Viewport (default 1440x900)
  --no-mp4                 Skip ffmpeg conversion
  --headed                 Show browser
  --list                   List matching items and exit

Outputs under: recordings/
`);
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    printHelp();
    return;
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  if (args.target === "atlas") {
    // record by chapter (one video per story scroll)
    let chapterIds = Object.keys(CHAPTER_SLUGS);
    if (args.only) {
      chapterIds = chapterIds.filter(
        (id) =>
          id === args.only ||
          CHAPTER_SLUGS[id] === args.only ||
          CHAPTER_SLUGS[id]?.includes(args.only)
      );
      if (!chapterIds.length) chapterIds = [args.only];
    }
    if (args.limit) chapterIds = chapterIds.slice(0, args.limit);
    if (args.list) {
      chapterIds.forEach((id) => console.log(id, CHAPTER_SLUGS[id] || id));
      return;
    }

    console.log(`Recording ${chapterIds.length} Atlas chapter(s)…`);
    const browser = await chromium.launch({ headless: !args.headed });
    const results = [];
    for (const id of chapterIds) {
      console.log(`→ atlas ${id} (${CHAPTER_SLUGS[id] || id})`);
      results.push(await recordAtlasChapter(browser, id, args));
    }
    await browser.close();
    const manifest = path.join(OUT_DIR, "manifest-atlas.json");
    fs.writeFileSync(manifest, JSON.stringify(results, null, 2));
    console.log(`Done. Manifest: ${manifest}`);
    return;
  }

  // replica mode
  const items = loadItems(args);
  if (args.list) {
    items.forEach((i) =>
      console.log(
        `${i.index}\t${i.status}\t${i.chapterId}\t${i.graphic}\tscenes=${i.sceneCount}\t${i.dir}`
      )
    );
    console.log(`total ${items.length}`);
    return;
  }
  if (!items.length) {
    console.error("No items matched.");
    process.exit(1);
  }

  // health check server
  try {
    const r = await fetch(args.base);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
  } catch (e) {
    console.error(
      `Cannot reach replica server at ${args.base}\nStart it with:\n  cd ${ROOT} && python3 -m http.server 8787\n\n${e}`
    );
    process.exit(1);
  }

  console.log(`Recording ${items.length} replica page(s) → ${OUT_DIR}`);
  const browser = await chromium.launch({ headless: !args.headed });
  const results = [];
  for (const item of items) {
    console.log(
      `→ [${item.index}] ${item.chapterId}/${item.graphic} (${item.status}, scenes=${item.sceneCount})`
    );
    results.push(await recordReplicaItem(browser, item, args));
  }
  await browser.close();

  const manifest = path.join(OUT_DIR, "manifest-replica.json");
  fs.writeFileSync(manifest, JSON.stringify(results, null, 2));

  // simple HTML index of recordings
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Recordings</title>
  <style>body{font-family:system-ui;margin:24px} video{max-width:420px;background:#111} .card{display:inline-block;margin:8px;vertical-align:top;width:440px} code{font-size:12px}</style>
  </head><body><h1>Recordings</h1>
  ${results
    .map((r) => {
      const src = r.mp4 || r.webm;
      if (!src) return `<div class="card"><code>${r.item?.graphic}</code> failed</div>`;
      return `<div class="card"><div><code>${r.item.chapterId}/${r.item.graphic}</code></div>
      <video src="../${src}" controls muted playsinline></video></div>`;
    })
    .join("\n")}
  </body></html>`;
  fs.writeFileSync(path.join(OUT_DIR, "index.html"), html);
  console.log(`Done. Manifest: ${manifest}`);
  console.log(`Gallery: ${path.join(OUT_DIR, "index.html")}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
