#!/usr/bin/env node
/**
 * Generate animated GIF thumbnails for gallery (GIF-style previews).
 *
 *   node thumbs.mjs --limit 20
 *   node thumbs.mjs --only 06
 *   node thumbs.mjs --status ready
 *   node thumbs.mjs --force   # regenerate existing
 */
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import os from "node:os";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const INV = path.join(ROOT, "inventory", "index.json");
const OUT = path.join(ROOT, "thumbs");

function parseArgs(argv) {
  const a = {
    only: null,
    limit: null,
    status: "ready",
    base: "http://127.0.0.1:8787",
    force: false,
    width: 640,
    height: 400,
    frames: 8,
  };
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i];
    const v = argv[i + 1];
    if (k === "--only") a.only = v;
    else if (k === "--limit") a.limit = +v;
    else if (k === "--status") a.status = v;
    else if (k === "--base") a.base = v;
    else if (k === "--force") a.force = true;
    else if (k === "--frames") a.frames = +v;
  }
  return a;
}

function loadItems(args) {
  let items = JSON.parse(fs.readFileSync(INV, "utf8"));
  if (args.status && args.status !== "all") {
    items = items.filter((i) => i.status === args.status);
  }
  if (args.only) {
    items = items.filter(
      (i) =>
        i.chapterId === args.only ||
        i.graphic === args.only ||
        i.dir.includes(args.only)
    );
  }
  if (args.limit) items = items.slice(0, args.limit);
  return items;
}

function thumbName(item) {
  const g = String(item.graphic || "g").replace(/[^a-zA-Z0-9_-]+/g, "-");
  return `${String(item.index).padStart(3, "0")}_${item.chapterId}_${g}.gif`;
}

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: "ignore" });
    p.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`${cmd} exit ${code}`))
    );
  });
}

async function framesToGif(frameDir, outGif) {
  const palette = path.join(frameDir, "palette.png");
  // list frames
  const files = fs
    .readdirSync(frameDir)
    .filter((f) => f.endsWith(".png") && f.startsWith("f"))
    .sort();
  if (!files.length) throw new Error("no frames");

  await run("ffmpeg", [
    "-y",
    "-framerate",
    "3",
    "-i",
    path.join(frameDir, "f%02d.png"),
    "-vf",
    "scale=360:-1:flags=lanczos,palettegen=stats_mode=diff",
    palette,
  ]);
  await run("ffmpeg", [
    "-y",
    "-framerate",
    "3",
    "-i",
    path.join(frameDir, "f%02d.png"),
    "-i",
    palette,
    "-lavfi",
    "scale=360:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3",
    "-loop",
    "0",
    outGif,
  ]);
}

async function captureItem(page, item, args) {
  const name = thumbName(item);
  const outGif = path.join(OUT, name);
  if (!args.force && fs.existsSync(outGif) && fs.statSync(outGif).size > 500) {
    return { item, gif: name, skipped: true };
  }

  const url = `${args.base.replace(/\/$/, "")}/${item.dir}/index.html?clean=1`;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "athumb-"));

  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
    await page.waitForTimeout(600);

    // Prefer chart area for crop feel
    const chart = page.locator("#chart, .stage, .page, body").first();
    const scenes = Math.max(1, item.sceneCount || 1);
    const nFrames = Math.min(
      args.frames,
      item.type === "scroller" ? Math.max(scenes + 1, 4) : 5
    );

    for (let i = 0; i < nFrames; i++) {
      if (item.type === "scroller" && i > 0) {
        const next = page.locator("#btn-next");
        if ((await next.count()) && !(await next.isDisabled().catch(() => true))) {
          await next.click().catch(() => {});
          await page.waitForTimeout(350);
        } else {
          // wheel fallback
          await page.mouse.wheel(0, 400);
          await page.waitForTimeout(250);
        }
      } else if (item.type !== "scroller" && i > 0) {
        // subtle "life": small hover / wait
        await page.waitForTimeout(280);
        try {
          const box = await chart.boundingBox();
          if (box) {
            await page.mouse.move(
              box.x + box.width * (0.2 + 0.6 * (i / nFrames)),
              box.y + box.height * 0.45
            );
          }
        } catch (_) {}
      }

      const file = path.join(tmp, `f${String(i).padStart(2, "0")}.png`);
      // screenshot viewport focused area
      try {
        await chart.screenshot({ path: file, timeout: 5000 });
      } catch {
        await page.screenshot({ path: file });
      }
    }

    // if only 1 unique frame, duplicate with slight delay frames for gif motion
    const frames = fs.readdirSync(tmp).filter((f) => f.startsWith("f")).sort();
    if (frames.length === 1) {
      for (let i = 1; i < 4; i++) {
        fs.copyFileSync(
          path.join(tmp, frames[0]),
          path.join(tmp, `f${String(i).padStart(2, "0")}.png`)
        );
      }
    }

    await framesToGif(tmp, outGif);
    return { item, gif: name, skipped: false, bytes: fs.statSync(outGif).size };
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

function writeGallery(items) {
  const cards = items
    .map((it) => {
      const gif = thumbName(it);
      const exists = fs.existsSync(path.join(OUT, gif));
      const href = `${it.dir}/index.html?clean=1`;
      const thumb = exists
        ? `<img src="thumbs/${gif}" alt="${it.graphic}" loading="lazy" />`
        : `<div class="ph">${it.type}</div>`;
      return `<a class="card status-${it.status}" href="${href}">
      <div class="thumb">${thumb}</div>
      <div class="meta">
        <div class="top">
          <span class="ch">${it.chapterId}</span>
          <span class="pill">${it.status}</span>
        </div>
        <code class="g">${it.graphic}</code>
        <div class="title">${(it.title || "").replace(/</g, "")}</div>
        <div class="sub">${it.type}${it.sceneCount ? ` · ${it.sceneCount} scenes` : ""}</div>
      </div>
    </a>`;
    })
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Atlas replicas — gallery con animaciones</title>
<style>
  :root { font-family: system-ui, sans-serif; color: #111; }
  body { margin: 0; background: #eef1f5; }
  header {
    position: sticky; top: 0; z-index: 10;
    background: #fff; border-bottom: 1px solid #e2e8f0;
    padding: 14px 20px; display: flex; flex-wrap: wrap; gap: 12px; align-items: center;
  }
  h1 { margin: 0; font-size: 1.15rem; }
  .lead { color: #64748b; font-size: 13px; margin: 0; flex: 1; min-width: 200px; }
  input[type=search] {
    padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 8px; min-width: 220px;
  }
  .filters { display: flex; gap: 6px; flex-wrap: wrap; }
  .filters button {
    border: 1px solid #cbd5e1; background: #fff; border-radius: 999px;
    padding: 6px 10px; font-size: 12px; cursor: pointer;
  }
  .filters button.on { background: #062958; color: #fff; border-color: #062958; }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 14px; padding: 16px 20px 40px;
  }
  .card {
    background: #fff; border-radius: 12px; overflow: hidden;
    border: 1px solid #e2e8f0; text-decoration: none; color: inherit;
    display: flex; flex-direction: column;
    transition: box-shadow .15s, transform .15s;
  }
  .card:hover { box-shadow: 0 10px 28px rgba(6,41,88,.12); transform: translateY(-2px); }
  .thumb {
    aspect-ratio: 16/10; background: #0b1220; display: flex; align-items: center; justify-content: center;
    overflow: hidden;
  }
  .thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .thumb .ph {
    color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: .06em;
  }
  .meta { padding: 10px 12px 12px; }
  .top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
  .ch { font-size: 11px; color: #64748b; font-weight: 600; }
  .pill {
    font-size: 10px; padding: 2px 7px; border-radius: 999px; background: #e2e8f0; color: #475569;
  }
  .card.status-ready .pill { background: #dcfce7; color: #166534; }
  .g {
    font-size: 11px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px;
    display: inline-block; margin-bottom: 4px;
  }
  .title { font-size: 13px; font-weight: 600; line-height: 1.3; margin-bottom: 2px; }
  .sub { font-size: 11px; color: #64748b; }
  .card.hidden { display: none; }
  .links { font-size: 12px; }
  .links a { color: #0071bc; margin-right: 10px; }
</style>
</head>
<body>
<header>
  <div>
    <h1>Atlas replicas — previews animados</h1>
    <p class="lead">${items.length} gráficos · GIF estilo loop · click para abrir</p>
    <div class="links">
      <a href="_ready/heroes.html">Chapter heroes</a>
      <a href="_ready/water-chapter.html">Water chapter</a>
      <a href="gallery-table.html">Vista tabla</a>
    </div>
  </div>
  <input id="q" type="search" placeholder="Filtrar graphic, capítulo, título…" />
  <div class="filters" id="filters">
    <button type="button" data-f="all" class="on">Todos</button>
    <button type="button" data-f="scroller">Scrollers</button>
    <button type="button" data-f="vis">Vis</button>
    <button type="button" data-f="ready">Ready</button>
  </div>
</header>
<div class="grid" id="grid">
${cards}
</div>
<script>
const q = document.getElementById('q');
const cards = [...document.querySelectorAll('.card')];
let typeFilter = 'all';
function apply() {
  const s = q.value.toLowerCase();
  cards.forEach(c => {
    const text = c.textContent.toLowerCase();
    const isScroller = text.includes('scroller');
    const isVis = c.querySelector('.sub')?.textContent.includes('vis');
    const isReady = c.classList.contains('status-ready');
    let ok = !s || text.includes(s);
    if (typeFilter === 'scroller') ok = ok && isScroller;
    if (typeFilter === 'vis') ok = ok && !isScroller;
    if (typeFilter === 'ready') ok = ok && isReady;
    c.classList.toggle('hidden', !ok);
  });
}
q.addEventListener('input', apply);
document.getElementById('filters').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  typeFilter = b.dataset.f;
  document.querySelectorAll('#filters button').forEach(x => x.classList.toggle('on', x === b));
  apply();
});
</script>
</body>
</html>`;

  fs.writeFileSync(path.join(ROOT, "gallery.html"), html);
  // keep old table as gallery-table
  // if old table exists as backup - write from index if needed
}

async function main() {
  const args = parseArgs(process.argv);
  fs.mkdirSync(OUT, { recursive: true });

  try {
    const r = await fetch(args.base);
    if (!r.ok) throw new Error(`server ${r.status}`);
  } catch (e) {
    console.error(`Server ${args.base} not up. Run: cd ~/atlas-replicas && python3 -m http.server 8787`);
    process.exit(1);
  }

  const items = loadItems(args);
  console.log(`Thumbnails for ${items.length} items → ${OUT}`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: args.width, height: args.height },
    deviceScaleFactor: 1,
  });

  const results = [];
  for (const item of items) {
    process.stdout.write(`→ [${item.index}] ${item.graphic} `);
    try {
      const res = await captureItem(page, item, args);
      results.push(res);
      console.log(
        res.skipped
          ? "skip"
          : `ok ${(res.bytes / 1024).toFixed(0)}KB`
      );
    } catch (e) {
      console.log("FAIL", e.message);
      results.push({ item, error: String(e) });
    }
  }
  await browser.close();

  // Full gallery always uses complete inventory for cards
  const all = JSON.parse(fs.readFileSync(INV, "utf8"));
  writeGallery(all);

  // also save map
  const map = {};
  for (const r of results) {
    if (r.gif) map[r.item.dir] = r.gif;
  }
  fs.writeFileSync(path.join(OUT, "index.json"), JSON.stringify(map, null, 2));

  const ok = results.filter((r) => r.gif && !r.error).length;
  console.log(`\nDone: ${ok}/${items.length} gifs · gallery.html updated`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
