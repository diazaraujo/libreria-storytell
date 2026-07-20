#!/usr/bin/env node
/**
 * Pixel-diff pipeline: origin Atlas chart crop vs replica chart crop.
 *
 * Usage:
 *   node scripts/capture/pixel-diff.mjs
 *   node scripts/capture/pixel-diff.mjs --only regions
 *
 * Requires: :8765 origin · :8787 replicas · python3 + Pillow
 * Output: recordings/compare/pixel-byte/
 */
import { chromium } from "./node_modules/playwright/index.mjs";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const OUT = path.join(ROOT, "recordings", "compare", "pixel-byte");
const ORIGIN = "http://127.0.0.1:8765";
const REPLICA = "http://127.0.0.1:8787";
const VP = { width: 1440, height: 900 };

/** Prefer real chart SVGs (paths+text), center in viewport, return clip */
async function findOriginChart(page, { textHint, minY = 600, maxY = 10000 } = {}) {
  let foundY = null;
  for (let y = minY; y < maxY; y += 220) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(140);
    const hit = await page.evaluate((hint) => {
      const t = document.body.innerText || "";
      if (hint && !new RegExp(hint, "i").test(t)) return false;
      // SVG with real marks
      for (const el of document.querySelectorAll("svg")) {
        const r = el.getBoundingClientRect();
        if (r.width < 420 || r.height < 260) continue;
        if (r.top < 40 || r.top > innerHeight - 80) continue;
        const paths = el.querySelectorAll("path, circle, rect, line").length;
        const texts = el.querySelectorAll("text").length;
        if (paths >= 6 && texts >= 4) return true;
      }
      return false;
    }, textHint || "");
    if (hit) {
      foundY = y;
      break;
    }
  }
  if (foundY == null) {
    // fallback: center richest SVG anywhere
    await page.evaluate(() => {
      let best = null;
      for (const el of document.querySelectorAll("svg")) {
        const paths = el.querySelectorAll("path,circle,rect,line").length;
        const texts = el.querySelectorAll("text").length;
        const r = el.getBoundingClientRect();
        const score = paths * 2 + texts + (r.width * r.height) / 50000;
        if (r.width > 300 && paths > 4 && (!best || score > best.score)) {
          best = { el, score };
        }
      }
      if (best) best.el.scrollIntoView({ block: "center" });
    });
  } else {
    // refine: scroll best in-view SVG to center
    await page.evaluate(() => {
      let best = null;
      for (const el of document.querySelectorAll("svg")) {
        const r = el.getBoundingClientRect();
        if (r.width < 420 || r.height < 260) continue;
        const paths = el.querySelectorAll("path,circle,rect,line").length;
        const texts = el.querySelectorAll("text").length;
        if (paths < 6) continue;
        const score = paths + texts * 2 + r.width / 10;
        if (!best || score > best.score) best = { el, score };
      }
      if (best) best.el.scrollIntoView({ block: "center", inline: "nearest" });
    });
  }
  await page.waitForTimeout(700);
  return page.evaluate(() => {
    let best = null;
    for (const el of document.querySelectorAll("svg")) {
      const r = el.getBoundingClientRect();
      if (r.width < 380 || r.height < 240) continue;
      // must be mostly in viewport
      if (r.bottom < 80 || r.top > innerHeight - 60) continue;
      const paths = el.querySelectorAll("path,circle,rect,line").length;
      const texts = el.querySelectorAll("text").length;
      if (paths < 4) continue;
      // exclude empty decorative full-bleed svgs
      if (paths === 0 && texts === 0) continue;
      const score = paths * 3 + texts * 4 + Math.min(r.width, 900) / 5;
      if (!best || score > best.score) {
        best = {
          score,
          x: Math.max(0, Math.floor(r.x)),
          y: Math.max(0, Math.floor(r.y)),
          width: Math.floor(Math.min(r.width, innerWidth - Math.max(0, r.x))),
          height: Math.floor(Math.min(r.height, innerHeight - Math.max(0, r.y))),
        };
      }
    }
    if (!best) return null;
    return { x: best.x, y: best.y, width: best.width, height: best.height };
  });
}

async function findReplicaChart(page, selectors) {
  await page.waitForTimeout(1100);
  for (const sel of selectors) {
    const el = page.locator(sel).first();
    if ((await el.count()) === 0) continue;
    try {
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      const box = await el.boundingBox();
      if (box && box.width > 200 && box.height > 180) {
        return {
          x: Math.floor(box.x),
          y: Math.floor(box.y),
          width: Math.floor(box.width),
          height: Math.floor(box.height),
        };
      }
    } catch (_) {}
  }
  return null;
}

const CASES = [
  {
    id: "regions-demo",
    label: "regions-small-multiples · demo vs origin chart crop",
    origin: `${ORIGIN}/en/atlas/electricity-access/`,
    originFind: (page) =>
      findOriginChart(page, {
        textHint: "World|Sub-Saharan|access to electricity",
        minY: 900,
        maxY: 4500,
      }),
    replica: `${REPLICA}/library/regions-small-multiples/demo.html`,
    replicaFind: (page) =>
      findReplicaChart(page, ["#chart", ".atlas-rsm", ".atlas-chart-root svg", "svg"]),
  },
  {
    id: "regions-chapter",
    label: "regions chapter clean vs origin",
    origin: `${ORIGIN}/en/atlas/electricity-access/`,
    originFind: (page) =>
      findOriginChart(page, {
        textHint: "World|regions",
        minY: 900,
        maxY: 4500,
      }),
    replica: `${REPLICA}/chapters/goal_07/00-access-electricity-regions/index.html?clean=1`,
    replicaFind: (page) =>
      findReplicaChart(page, ["#chart", ".chart", ".atlas-rsm", "svg"]),
  },
  {
    id: "dual-line-demo",
    label: "dual-line urban-rural regions",
    origin: `${ORIGIN}/en/atlas/electricity-access/`,
    originFind: (page) =>
      findOriginChart(page, {
        textHint: "urban|rural|Urban areas",
        minY: 2800,
        maxY: 10000,
      }),
    replica: `${REPLICA}/library/dual-line-urban-rural/demo.html`,
    replicaFind: (page) =>
      findReplicaChart(page, [".atlas-urban-rural", "#chart", ".atlas-chart-root", "svg"]),
  },
  {
    id: "progress-demo",
    label: "progress-race demo",
    origin: `${ORIGIN}/en/atlas/electricity-access/`,
    // Origin progress uses heavy canvas/Pixi — SVG crop is approximate
    originFind: (page) =>
      findOriginChart(page, {
        textHint: "Ethiopia|Speed of progress|progressed|Nigeria",
        minY: 2000,
        maxY: 10000,
      }),
    replica: `${REPLICA}/library/progress-race/demo.html`,
    replicaFind: (page) =>
      findReplicaChart(page, [".atlas-progress-race", "#chart", "svg"]),
  },
  {
    id: "story-regions",
    label: "electricity story chart column only",
    origin: `${ORIGIN}/en/atlas/electricity-access/`,
    originFind: (page) =>
      findOriginChart(page, {
        textHint: "Global access|advancing globally",
        minY: 900,
        maxY: 5000,
      }),
    replica: `${REPLICA}/stories/electricity-access/`,
    replicaFind: async (page) => {
      await page.waitForTimeout(1500);
      await page.evaluate(() => {
        const b = document.querySelector("#regions") || document.querySelector(".ch-block--scroller");
        if (b) window.scrollTo(0, b.getBoundingClientRect().top + window.scrollY + 100);
      });
      await page.waitForTimeout(1400);
      return findReplicaChart(page, [".ch-chart svg", ".ch-chart .atlas-rsm", ".ch-chart"]);
    },
  },
];

const only = process.argv.includes("--only")
  ? process.argv[process.argv.indexOf("--only") + 1]
  : null;

fs.mkdirSync(OUT, { recursive: true });

async function shotClip(page, clip, file) {
  if (!clip || clip.width < 50 || clip.height < 50) {
    await page.screenshot({ path: file, fullPage: false });
    return false;
  }
  await page.screenshot({ path: file, clip, fullPage: false });
  return true;
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const c of CASES) {
    if (only && !c.id.includes(only) && !c.label.includes(only)) continue;
    console.log("\n==", c.id, c.label);
    const dir = path.join(OUT, c.id);
    fs.mkdirSync(dir, { recursive: true });

    // ORIGIN
    const po = await browser.newPage({ viewport: VP, deviceScaleFactor: 1 });
    try {
      await po.goto(c.origin, { waitUntil: "domcontentloaded", timeout: 60000 });
    } catch {
      await po.goto(c.origin, { waitUntil: "load", timeout: 60000 });
    }
    await po.waitForTimeout(2500);
    const oClip = await c.originFind(po);
    const oPath = path.join(dir, "origin.png");
    const oOk = await shotClip(po, oClip, oPath);
    console.log("  origin clip", oClip, oOk);
    await po.close();

    // REPLICA
    const pr = await browser.newPage({ viewport: VP, deviceScaleFactor: 1 });
    await pr.goto(c.replica, { waitUntil: "domcontentloaded", timeout: 45000 });
    await pr.waitForTimeout(2000);
    const rClip = await c.replicaFind(pr);
    const rPath = path.join(dir, "replica.png");
    const rOk = await shotClip(pr, rClip, rPath);
    console.log("  replica clip", rClip, rOk);
    await pr.close();

    // DIFF via python
    const dPath = path.join(dir, "diff.png");
    const sidePath = path.join(dir, "side-by-side.png");
    const metricsPath = path.join(dir, "metrics.json");
    const py = `
from PIL import Image, ImageChops, ImageDraw, ImageFont, ImageStat, ImageOps
import json, sys
o=Image.open(${JSON.stringify(oPath)}).convert('RGB')
r=Image.open(${JSON.stringify(rPath)}).convert('RGB')
# normalize sizes to common box (letterbox center)
W=max(o.width,r.width); H=max(o.height,r.height)
# prefer min dimension for fair compare of chart content
tw=min(o.width,r.width); th=min(o.height,r.height)
o2=ImageOps.fit(o,(tw,th),method=Image.Resampling.LANCZOS,centering=(0.5,0.5))
r2=ImageOps.fit(r,(tw,th),method=Image.Resampling.LANCZOS,centering=(0.5,0.5))
diff=ImageChops.difference(o2,r2)
# amplify
amp=diff.point(lambda p: min(255,int(p*3)))
heat=ImageOps.colorize(ImageOps.grayscale(amp), black='black', white='red')
# metrics
st=ImageStat.Stat(diff)
mae=sum(st.mean)/3.0
# % pixels with any channel > 18
px=list(diff.getdata())
n=len(px)
changed=sum(1 for p in px if max(p)>18)
pct=100.0*changed/n if n else 0
# score 0-100 approximate fidelity
score=max(0, min(100, 100 - mae*1.8 - pct*0.15))
meta=dict(mae=round(mae,3), pct_changed=round(pct,2), score=round(score,1), w=tw, h=th, origin_size=o.size, replica_size=r.size)
open(${JSON.stringify(metricsPath)},'w').write(json.dumps(meta,indent=2))
# side by side
gap=12
sb=Image.new('RGB',(tw*2+gap*3, th+gap*2+36),(255,255,255))
sb.paste(o2,(gap,gap+28)); sb.paste(r2,(gap*2+tw,gap+28))
d=ImageDraw.Draw(sb)
d.text((gap,8), f"ORIGIN  mae={meta['mae']}  Δ%={meta['pct_changed']}  score={meta['score']}", fill=(20,20,20))
d.text((gap*2+tw,8), "REPLICA", fill=(20,20,20))
# heat strip under
heat_s=heat.resize((tw, max(40, th//5)))
sb2=Image.new('RGB',(sb.width, sb.height+heat_s.height+8),(255,255,255))
sb2.paste(sb,(0,0)); sb2.paste(heat_s,(gap, sb.height+4))
sb2.save(${JSON.stringify(sidePath)})
amp.save(${JSON.stringify(dPath)})
print(json.dumps(meta))
`;
    const run = spawnSync("python3", ["-c", py], { encoding: "utf8" });
    let metrics = {};
    try {
      metrics = JSON.parse((run.stdout || "").trim().split("\n").pop());
    } catch {
      metrics = { error: run.stderr || run.stdout };
    }
    console.log("  metrics", metrics);
    results.push({ id: c.id, label: c.label, ...metrics });
  }

  await browser.close();
  const report = {
    generated: new Date().toISOString(),
    viewport: VP,
    note:
      "score≈100 is chart-crop visual fidelity after resize-to-common-box; not raw byte identity of full pages (shell differs by design).",
    cases: results,
  };
  fs.writeFileSync(path.join(OUT, "REPORT.json"), JSON.stringify(report, null, 2));

  // markdown
  let md = `# Pixel-byte compare (chart crops)\n\n**Viewport:** ${VP.width}×${VP.height}\n\n`;
  md += `| Case | Score | MAE | Δ% pixels | Size |\n|------|------:|----:|----------:|------|\n`;
  for (const r of results) {
    md += `| ${r.id} | **${r.score ?? "—"}** | ${r.mae ?? "—"} | ${r.pct_changed ?? "—"} | ${r.w || "?"}×${r.h || "?"} |\n`;
  }
  md += `\n## How to read\n\n`;
  md += `- **score** ≈ 100 − MAE×1.8 − Δ%×0.15 (heuristic fidelity after common-box resize)\n`;
  md += `- **Byte-identical full pages is impossible** (Atlas nav chrome vs story shell)\n`;
  md += `- Diffs live in \`recordings/compare/pixel-byte/<case>/\` (gitignored)\n`;
  md += `\nOpen side-by-side PNGs under each case folder.\n`;
  fs.writeFileSync(path.join(OUT, "REPORT.md"), md);
  // also copy summary into docs (tracked)
  fs.writeFileSync(path.join(ROOT, "docs", "PIXEL_BYTE_COMPARE.md"), md);
  console.log("\nWrote", path.join(OUT, "REPORT.md"));
  console.log(md);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
