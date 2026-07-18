#!/usr/bin/env node
/**
 * Side-by-side reference capture: Atlas original vs Gallery/Replica
 *
 * For each graphic produces:
 *   recordings/compare/{index}_{chapter}_{graphic}/
 *     replica.webm|mp4   — local scaffold (?clean=1), scene walk
 *     atlas.webm|mp4     — chapter scroll on Atlas (shared per chapter, copied)
 *     gallery.gif        — thumbs GIF if present (copy)
 *     meta.json
 *
 * Plus:
 *   recordings/compare/index.html  — browse dual videos
 *   recordings/compare/manifest.json
 *
 * Usage:
 *   # serve both:
 *   #   cd ~/atlas-replicas && python3 -m http.server 8787
 *   #   cd ~/atlas-global-development && python3 -m http.server 8765
 *
 *   node compare-capture.mjs --only goal_07
 *   node compare-capture.mjs --only electricity-access
 *   node compare-capture.mjs --limit 5
 *   node compare-capture.mjs --status ready --skip-existing
 *   node compare-capture.mjs --atlas-only   # only chapter atlas films
 *   node compare-capture.mjs --replica-only
 */

import { chromium } from "playwright";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const INVENTORY = path.join(ROOT, "inventory", "index.json");
const THUMBS = path.join(ROOT, "thumbs");
const OUT = path.join(ROOT, "recordings", "compare");

/** Atlas chapter path segment (local clone + Data360) */
const CHAPTER_SLUGS = {
  "01": "extreme-poverty",
  "02": "measuring-progress", // hunger may live in other; fallback
  "03": "global-progress",
  "04": "learning-and-work",
  "05": "gender-and-jobs",
  "06": "water-access",
  "07": "electricity-access",
  "08": "global-progress",
  "09": "internet-access",
  "10": "inequality",
  "11": "urban-development",
  "12": "climate",
  "13": "climate",
  "14": "climate",
  "15": "climate",
  "16": "artificial-intelligence",
  "17": "data-for-development",
  "99": "extreme-poverty",
  dashboard: "global-progress",
  id4d: "data-for-development",
  progress: "measuring-progress",
};

// Better slug map from local atlas folders when known
const FOLDER_HINTS = {
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
    only: null,
    limit: null,
    secondsReplica: null,
    secondsAtlas: 40,
    width: 1280,
    height: 800,
    replicaBase: "http://127.0.0.1:8787",
    atlasBase: "http://127.0.0.1:8765", // local clone preferred
    liveAtlas: "https://data360.worldbank.org/en/atlas",
    preferLive: false,
    skipExisting: false,
    atlasOnly: false,
    replicaOnly: false,
    headed: false,
    mp4: true,
    list: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    const n = argv[i + 1];
    if (a === "--only") args.only = n;
    else if (a === "--limit") args.limit = +n;
    else if (a === "--seconds") {
      args.secondsReplica = +n;
      args.secondsAtlas = +n;
    } else if (a === "--seconds-replica") args.secondsReplica = +n;
    else if (a === "--seconds-atlas") args.secondsAtlas = +n;
    else if (a === "--replica-base") args.replicaBase = n;
    else if (a === "--atlas-base") args.atlasBase = n;
    else if (a === "--live") args.preferLive = true;
    else if (a === "--skip-existing") args.skipExisting = true;
    else if (a === "--atlas-only") args.atlasOnly = true;
    else if (a === "--replica-only") args.replicaOnly = true;
    else if (a === "--headed") args.headed = true;
    else if (a === "--no-mp4") args.mp4 = false;
    else if (a === "--list") args.list = true;
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
        `goal_${i.chapterId}` === args.only ||
        (FOLDER_HINTS[i.chapterId] || "") === args.only ||
        (CHAPTER_SLUGS[i.chapterId] || "") === args.only ||
        (i.dir || "").includes(args.only) ||
        (i.graphic || "").toLowerCase().includes(key) ||
        (i.title || "").toLowerCase().includes(key)
    );
  }
  if (args.limit) list = list.slice(0, args.limit);
  return list;
}

function slugify(s) {
  return String(s || "item")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

function itemDir(item) {
  const name = `${String(item.index).padStart(3, "0")}_${item.chapterId}_${slugify(item.graphic)}`;
  return path.join(OUT, name);
}

function chapterSlug(chapterId) {
  return FOLDER_HINTS[chapterId] || CHAPTER_SLUGS[chapterId] || null;
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function webmToMp4(webm, mp4) {
  return new Promise((resolve, reject) => {
    const ff = spawn(
      "ffmpeg",
      ["-y", "-i", webm, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", mp4],
      { stdio: "ignore" }
    );
    ff.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg ${code}`))));
  });
}

async function finalizeVideo(dir, basename, mp4) {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".webm") && !f.startsWith(basename));
  // Playwright dumps random name; also keep if already renamed
  let webm = path.join(dir, `${basename}.webm`);
  if (!fs.existsSync(webm)) {
    const random = fs.readdirSync(dir).filter((f) => f.endsWith(".webm"));
    if (!random.length) return { webm: null, mp4: null };
    // pick newest
    random.sort(
      (a, b) => fs.statSync(path.join(dir, b)).mtimeMs - fs.statSync(path.join(dir, a)).mtimeMs
    );
    fs.renameSync(path.join(dir, random[0]), webm);
  }
  let mp4Path = null;
  if (mp4 && fs.existsSync(webm)) {
    mp4Path = path.join(dir, `${basename}.mp4`);
    try {
      await webmToMp4(webm, mp4Path);
    } catch {
      mp4Path = null;
    }
  }
  return { webm, mp4: mp4Path };
}

async function playReplica(page, item, seconds) {
  const sceneCount = Math.max(1, item.sceneCount || 1);
  const budget =
    seconds != null
      ? seconds * 1000
      : item.type === "scroller"
        ? sceneCount * 2000 + 1200
        : 4500;
  const per = budget / sceneCount;
  await page.waitForTimeout(900);

  const hasNav = (await page.locator("#btn-next").count()) > 0;
  if (item.type === "scroller" && hasNav) {
    for (let i = 0; i < sceneCount; i++) {
      await page.waitForTimeout(per);
      if (i < sceneCount - 1) {
        const disabled = await page.locator("#btn-next").isDisabled().catch(() => true);
        if (!disabled) await page.locator("#btn-next").click().catch(() => {});
        else await page.keyboard.press("ArrowRight").catch(() => {});
      }
    }
  } else if (item.type === "scroller") {
    const steps = Math.max(sceneCount * 3, 10);
    for (let i = 0; i < steps; i++) {
      await page.mouse.wheel(0, 480);
      await page.waitForTimeout(budget / steps);
    }
  } else if (item.graphic === "draw_your_chart") {
    // simple hold + try reveal
    await page.waitForTimeout(1500);
    await page.locator("button").filter({ hasText: /show|done|data/i }).first().click().catch(() => {});
    await page.waitForTimeout(2500);
  } else {
    await page.waitForTimeout(budget);
  }
  await page.waitForTimeout(500);
}

async function playAtlasChapter(page, seconds, graphicTitle) {
  const budget = (seconds || 40) * 1000;
  await page.waitForTimeout(1500);
  for (const sel of [
    "button:has-text('Accept')",
    "button:has-text('I agree')",
    "#onetrust-accept-btn-handler",
    "button:has-text('Close')",
  ]) {
    const b = page.locator(sel);
    if (await b.count()) {
      await b.first().click().catch(() => {});
      break;
    }
  }

  // Try scroll to graphic title if present
  if (graphicTitle) {
    const hit = page.getByText(graphicTitle.slice(0, 40), { exact: false }).first();
    if (await hit.count().catch(() => 0)) {
      await hit.scrollIntoViewIfNeeded().catch(() => {});
      await page.waitForTimeout(1200);
    }
  }

  const steps = 36;
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, 700);
    await page.waitForTimeout(budget / steps);
  }
  await page.waitForTimeout(800);
}

async function recordAtlasChapter(browser, slug, args, graphicTitle) {
  const dir = path.join(OUT, "_atlas_chapters", slug);
  fs.mkdirSync(dir, { recursive: true });
  const finalMp4 = path.join(dir, "chapter.mp4");
  const finalWebm = path.join(dir, "chapter.webm");
  if (args.skipExisting && (fs.existsSync(finalMp4) || fs.existsSync(finalWebm))) {
    return {
      slug,
      skipped: true,
      webm: fs.existsSync(finalWebm) ? finalWebm : null,
      mp4: fs.existsSync(finalMp4) ? finalMp4 : null,
      url: null,
    };
  }

  const bases = args.preferLive
    ? [args.liveAtlas, args.atlasBase]
    : [args.atlasBase, args.liveAtlas];

  let lastErr = null;
  for (const base of bases) {
    const url = `${base.replace(/\/$/, "")}/${slug}/`;
    try {
      const context = await browser.newContext({
        viewport: { width: args.width, height: args.height },
        recordVideo: { dir, size: { width: args.width, height: args.height } },
      });
      const page = await context.newPage();
      const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
      if (!res || res.status() >= 400) {
        await context.close();
        lastErr = `HTTP ${res?.status()} ${url}`;
        continue;
      }
      await playAtlasChapter(page, args.secondsAtlas, graphicTitle);
      await context.close();
      // rename playwright dump
      const dumps = fs
        .readdirSync(dir)
        .filter((f) => f.endsWith(".webm") && f !== "chapter.webm");
      if (dumps.length) {
        dumps.sort(
          (a, b) => fs.statSync(path.join(dir, b)).mtimeMs - fs.statSync(path.join(dir, a)).mtimeMs
        );
        fs.renameSync(path.join(dir, dumps[0]), finalWebm);
      }
      let mp4Ok = false;
      if (args.mp4 && fs.existsSync(finalWebm)) {
        try {
          await webmToMp4(finalWebm, finalMp4);
          mp4Ok = true;
        } catch {}
      }
      const meta = {
        slug,
        url,
        target: "atlas",
        webm: fs.existsSync(finalWebm) ? path.relative(ROOT, finalWebm) : null,
        mp4: mp4Ok ? path.relative(ROOT, finalMp4) : null,
        recordedAt: new Date().toISOString(),
      };
      fs.writeFileSync(path.join(dir, "meta.json"), JSON.stringify(meta, null, 2));
      return { ...meta, webm: finalWebm, mp4: mp4Ok ? finalMp4 : null };
    } catch (e) {
      lastErr = String(e);
    }
  }
  return { slug, error: lastErr, webm: null, mp4: null };
}

async function recordReplica(browser, item, args) {
  const dir = itemDir(item);
  fs.mkdirSync(dir, { recursive: true });
  const webmPath = path.join(dir, "replica.webm");
  const mp4Path = path.join(dir, "replica.mp4");
  if (args.skipExisting && (fs.existsSync(mp4Path) || fs.existsSync(webmPath))) {
    return { skipped: true, webm: webmPath, mp4: fs.existsSync(mp4Path) ? mp4Path : null };
  }

  const url =
    item.graphic === "spi_scroller"
      ? `${args.replicaBase.replace(/\/$/, "")}/_ready/spi-scroller/index.html`
      : `${args.replicaBase.replace(/\/$/, "")}/${item.dir}/index.html?clean=1`;

  const context = await browser.newContext({
    viewport: { width: args.width, height: args.height },
    recordVideo: { dir, size: { width: args.width, height: args.height } },
  });
  const page = await context.newPage();
  let error = null;
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
    await playReplica(page, item, args.secondsReplica);
  } catch (e) {
    error = String(e);
  }
  await context.close();

  // rename latest webm → replica.webm
  const dumps = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".webm") && f !== "replica.webm" && f !== "atlas.webm");
  if (dumps.length) {
    dumps.sort(
      (a, b) => fs.statSync(path.join(dir, b)).mtimeMs - fs.statSync(path.join(dir, a)).mtimeMs
    );
    fs.renameSync(path.join(dir, dumps[0]), webmPath);
  }
  let mp4Ok = false;
  if (args.mp4 && fs.existsSync(webmPath)) {
    try {
      await webmToMp4(webmPath, mp4Path);
      mp4Ok = true;
    } catch {}
  }
  return {
    url,
    error,
    webm: fs.existsSync(webmPath) ? webmPath : null,
    mp4: mp4Ok ? mp4Path : null,
  };
}

function findGalleryGif(item) {
  // thumbs.mjs names: 000_01_draw_your_chart.gif
  const prefix = String(item.index).padStart(3, "0");
  if (!fs.existsSync(THUMBS)) return null;
  const files = fs.readdirSync(THUMBS).filter((f) => f.startsWith(prefix + "_") && f.endsWith(".gif"));
  if (files.length) return path.join(THUMBS, files[0]);
  // fuzzy by graphic
  const g = slugify(item.graphic);
  const fuzzy = fs.readdirSync(THUMBS).filter((f) => f.includes(g) && f.endsWith(".gif"));
  return fuzzy.length ? path.join(THUMBS, fuzzy[0]) : null;
}

function buildIndex(manifest) {
  const rows = manifest.items
    .map((it) => {
      const rel = (p) => (p ? path.relative(OUT, path.isAbsolute(p) ? p : path.join(ROOT, p)) : null);
      const atlas = it.atlasMp4 || it.atlasWebm;
      const replica = it.replicaMp4 || it.replicaWebm;
      const gif = it.galleryGif;
      const atlasSrc = atlas ? rel(atlas.startsWith("recordings") ? path.join(ROOT, atlas) : atlas) : null;
      const repSrc = replica
        ? rel(replica.startsWith("recordings") ? path.join(ROOT, replica) : replica)
        : null;
      const gifSrc = gif ? rel(gif.startsWith("recordings") || gif.startsWith("thumbs") ? path.join(ROOT, gif.replace(/^thumbs\//, "thumbs/").includes("thumbs") ? path.join(ROOT, gif) : gif) : gif) : null;
      // normalize paths relative to compare/
      const a = it.atlasMp4Rel || it.atlasWebmRel || "";
      const r = it.replicaMp4Rel || it.replicaWebmRel || "";
      const g = it.galleryGifRel || "";
      return `<article class="card" data-ch="${it.chapterId}" data-pp="${it.approved || false}">
  <header>
    <span class="idx">#${it.index}</span>
    <strong>${it.graphic}</strong>
    ${it.approved ? '<span class="pp">pixel-perfect</span>' : ""}
    <div class="title">${escapeHtml(it.title || "")}</div>
    <div class="meta">${it.chapterId} · ${it.type} · scenes ${it.sceneCount || 0}</div>
  </header>
  <div class="grid">
    <div class="pane">
      <div class="label">Atlas original (chapter scroll)</div>
      ${a ? `<video controls playsinline preload="metadata" src="${a}"></video>` : `<div class="missing">no atlas video</div>`}
      ${it.atlasUrl ? `<a class="link" href="${it.atlasUrl}" target="_blank" rel="noopener">Open Atlas ↗</a>` : ""}
    </div>
    <div class="pane">
      <div class="label">Réplica local (?clean=1)</div>
      ${r ? `<video controls playsinline preload="metadata" src="${r}"></video>` : `<div class="missing">no replica video</div>`}
      ${it.replicaUrl ? `<a class="link" href="${it.replicaUrl}" target="_blank" rel="noopener">Open replica ↗</a>` : ""}
    </div>
    <div class="pane">
      <div class="label">Galería GIF</div>
      ${g ? `<img src="${g}" alt="gallery thumb"/>` : `<div class="missing">no GIF</div>`}
    </div>
  </div>
</article>`;
    })
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="es"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Compare · Atlas vs Réplica vs Galería</title>
<style>
:root { --bg:#0f1419; --card:#1a222c; --muted:#8b9aab; --line:#2a3542; --acc:#3b82f6; --pp:#16a34a; }
*{box-sizing:border-box}
body{margin:0;font-family:system-ui,sans-serif;background:var(--bg);color:#e7eef7}
.wrap{max-width:1400px;margin:0 auto;padding:24px 16px 80px}
h1{font-size:1.5rem;margin:0 0 6px}
.sub{color:var(--muted);margin-bottom:18px;line-height:1.5}
.bar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:14px 0 22px}
.bar input,.bar select{background:#0b1016;border:1px solid var(--line);color:#e7eef7;padding:8px 10px;border-radius:8px}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px;margin:14px 0}
.card header{margin-bottom:10px}
.card .idx{color:var(--muted);font-size:12px;margin-right:8px}
.card .title{color:var(--muted);font-size:13px;margin-top:4px}
.card .meta{font-size:11px;color:var(--muted);margin-top:2px}
.pp{background:var(--pp);color:#fff;font-size:10px;font-weight:700;padding:2px 7px;border-radius:999px;margin-left:8px}
.grid{display:grid;grid-template-columns:1fr 1fr 0.7fr;gap:10px}
@media(max-width:1000px){.grid{grid-template-columns:1fr}}
.pane{background:#0b1016;border-radius:10px;padding:8px;min-height:120px}
.pane .label{font-size:11px;color:var(--muted);margin-bottom:6px;font-weight:600;text-transform:uppercase;letter-spacing:.03em}
.pane video,.pane img{width:100%;border-radius:6px;background:#000;display:block;max-height:320px;object-fit:contain}
.missing{color:#6b7c8f;font-size:13px;padding:28px 8px;text-align:center}
.link{display:inline-block;margin-top:6px;font-size:12px;color:var(--acc)}
.stat{font-size:13px;color:var(--muted)}
</style></head><body><div class="wrap">
<h1>Atlas original · Réplica · Galería</h1>
<p class="sub">Primer paso de QA visual: cómo se comporta cada gráfico en el Atlas (scroll del capítulo),
cómo se ve en nuestra réplica local, y el GIF de la galería. Usa esto para priorizar el trabajo pixel-perfect real.</p>
<div class="bar">
  <input id="q" type="search" placeholder="Filtrar graphic / título…" style="min-width:220px"/>
  <select id="ch"><option value="">Todos los capítulos</option></select>
  <label class="stat"><input type="checkbox" id="pp"/> Solo pixel-perfect aprobados</label>
  <span class="stat" id="count"></span>
</div>
<div id="list">${rows}</div>
<script>
const cards=[...document.querySelectorAll('.card')];
const chs=[...new Set(cards.map(c=>c.dataset.ch))].sort();
const sel=document.getElementById('ch');
chs.forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=c;sel.appendChild(o)});
function apply(){
  const q=document.getElementById('q').value.toLowerCase();
  const ch=sel.value;
  const pp=document.getElementById('pp').checked;
  let n=0;
  cards.forEach(c=>{
    const text=c.innerText.toLowerCase();
    const ok=(!q||text.includes(q))&&(!ch||c.dataset.ch===ch)&&(!pp||c.dataset.pp==='true');
    c.style.display=ok?'':'none';
    if(ok)n++;
  });
  document.getElementById('count').textContent=n+' / '+cards.length;
}
document.getElementById('q').oninput=apply;
sel.onchange=apply;
document.getElementById('pp').onchange=apply;
apply();
</script>
</div></body></html>`;

  fs.writeFileSync(path.join(OUT, "index.html"), html);
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function loadApproved() {
  const p = path.join(ROOT, "docs", "APPROVED_PIXEL_PERFECT.json");
  if (!fs.existsSync(p)) return new Set();
  const j = JSON.parse(fs.readFileSync(p, "utf8"));
  const set = new Set();
  for (const it of j.items || []) {
    if (it.graphic) set.add(it.graphic);
    if (it.path && it.path.includes("chapters/")) {
      // path like chapters/goal_07/00-...
    }
  }
  // also from configs
  return set;
}

function isApprovedGraphic(item) {
  try {
    const cfg = JSON.parse(
      fs.readFileSync(path.join(ROOT, item.dir, "config.json"), "utf8")
    );
    return !!(cfg._meta?.approved || cfg._meta?.fidelity === "pixel-perfect");
  } catch {
    return false;
  }
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log(`compare-capture.mjs — Atlas vs Replica vs Gallery

  node compare-capture.mjs --only goal_07
  node compare-capture.mjs --only electricity-access --skip-existing
  node compare-capture.mjs --limit 10
  node compare-capture.mjs --atlas-only
  node compare-capture.mjs --replica-only --skip-existing

Serve:
  cd ~/atlas-replicas && python3 -m http.server 8787
  cd ~/atlas-global-development && python3 -m http.server 8765

Open: http://127.0.0.1:8787/recordings/compare/
`);
    return;
  }

  fs.mkdirSync(OUT, { recursive: true });
  const items = loadItems(args);
  if (args.list) {
    items.forEach((i) => console.log(i.index, i.chapterId, i.graphic, i.dir));
    console.log("total", items.length);
    return;
  }

  console.log(`Compare capture · ${items.length} graphics`);
  console.log(`  replica: ${args.replicaBase}`);
  console.log(`  atlas:   ${args.preferLive ? args.liveAtlas : args.atlasBase} (fallback live)`);

  const browser = await chromium.launch({ headless: !args.headed });
  const atlasCache = new Map(); // slug -> result
  const manifest = { generatedAt: new Date().toISOString(), items: [] };

  // Pre-record unique atlas chapters
  if (!args.replicaOnly) {
    const slugs = new Map();
    for (const it of items) {
      const slug = chapterSlug(it.chapterId);
      if (slug) slugs.set(slug, it);
    }
    console.log(`\nAtlas chapters (${slugs.size})…`);
    for (const [slug, sample] of slugs) {
      process.stdout.write(`  atlas ${slug}… `);
      const res = await recordAtlasChapter(browser, slug, args, sample.title);
      atlasCache.set(slug, res);
      console.log(res.skipped ? "skip" : res.error ? `FAIL ${res.error.slice(0, 60)}` : "ok");
    }
  }

  if (!args.atlasOnly) {
    console.log(`\nReplica + gallery (${items.length})…`);
    let i = 0;
    for (const item of items) {
      i++;
      const dir = itemDir(item);
      fs.mkdirSync(dir, { recursive: true });
      process.stdout.write(`  [${i}/${items.length}] ${item.graphic}… `);

      const rep = await recordReplica(browser, item, args);
      const slug = chapterSlug(item.chapterId);
      let atlas = slug ? atlasCache.get(slug) : null;
      if (!atlas && !args.replicaOnly && slug) {
        atlas = await recordAtlasChapter(browser, slug, args, item.title);
        atlasCache.set(slug, atlas);
      }

      // copy atlas video into item folder for portability
      let atlasWebmRel = null;
      let atlasMp4Rel = null;
      let atlasUrl = atlas?.url || (slug ? `${args.liveAtlas}/${slug}/` : null);
      if (atlas?.mp4 && fs.existsSync(atlas.mp4)) {
        const dest = path.join(dir, "atlas.mp4");
        fs.copyFileSync(atlas.mp4, dest);
        atlasMp4Rel = path.relative(OUT, dest);
      } else if (atlas?.webm && fs.existsSync(atlas.webm)) {
        const dest = path.join(dir, "atlas.webm");
        fs.copyFileSync(atlas.webm, dest);
        atlasWebmRel = path.relative(OUT, dest);
      } else if (atlas?.mp4) {
        atlasMp4Rel = path.relative(OUT, atlas.mp4);
      }

      // gallery gif
      let galleryGifRel = null;
      const gif = findGalleryGif(item);
      if (gif && fs.existsSync(gif)) {
        const dest = path.join(dir, "gallery.gif");
        fs.copyFileSync(gif, dest);
        galleryGifRel = path.relative(OUT, dest);
      }

      const entry = {
        index: item.index,
        chapterId: item.chapterId,
        graphic: item.graphic,
        title: item.title,
        type: item.type,
        sceneCount: item.sceneCount,
        dir: item.dir,
        approved: isApprovedGraphic(item),
        replicaUrl: rep.url || null,
        atlasUrl,
        atlasSlug: slug,
        replicaWebmRel: rep.webm ? path.relative(OUT, rep.webm) : null,
        replicaMp4Rel: rep.mp4 ? path.relative(OUT, rep.mp4) : null,
        atlasWebmRel,
        atlasMp4Rel,
        galleryGifRel,
        error: rep.error || atlas?.error || null,
      };
      fs.writeFileSync(path.join(dir, "meta.json"), JSON.stringify(entry, null, 2));
      manifest.items.push(entry);
      console.log(
        rep.skipped ? "skip" : rep.error ? `FAIL ${String(rep.error).slice(0, 40)}` : "ok",
        gif ? "+gif" : ""
      );
    }
  } else {
    // atlas-only: still write manifest stubs
    for (const item of items) {
      const slug = chapterSlug(item.chapterId);
      const atlas = slug ? atlasCache.get(slug) : null;
      manifest.items.push({
        index: item.index,
        chapterId: item.chapterId,
        graphic: item.graphic,
        title: item.title,
        type: item.type,
        sceneCount: item.sceneCount,
        approved: isApprovedGraphic(item),
        atlasSlug: slug,
        atlasMp4Rel: atlas?.mp4 ? path.relative(OUT, path.join(itemDir(item), "atlas.mp4")) : null,
      });
    }
  }

  await browser.close();

  // rewrite paths relative for index
  for (const it of manifest.items) {
    // already relative to OUT
  }
  manifest.count = manifest.items.length;
  manifest.withReplica = manifest.items.filter((i) => i.replicaMp4Rel || i.replicaWebmRel).length;
  manifest.withAtlas = manifest.items.filter((i) => i.atlasMp4Rel || i.atlasWebmRel).length;
  manifest.withGif = manifest.items.filter((i) => i.galleryGifRel).length;
  fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2));
  buildIndex(manifest);

  console.log(`\nDone.
  manifest: recordings/compare/manifest.json
  viewer:   http://127.0.0.1:8787/recordings/compare/
  replica videos: ${manifest.withReplica}
  atlas videos:   ${manifest.withAtlas}
  gallery gifs:   ${manifest.withGif}
`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
