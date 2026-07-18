#!/usr/bin/env node
/**
 * Capture Atlas origin references via Firecrawl (live Data360).
 *
 * Why: data360.worldbank.org blocks iframes (X-Frame-Options).
 * Firecrawl uses a real browser on their infra → screenshots + markdown
 * of the live page for side-by-side QA with our replicas.
 *
 * Setup:
 *   export FIRECRAWL_API_KEY=fc-...
 *   cd ~/atlas-replicas/scripts/capture
 *   npm i @mendable/firecrawl-js
 *
 * Usage:
 *   node firecrawl-atlas-ref.mjs
 *   node firecrawl-atlas-ref.mjs --url https://data360.worldbank.org/en/atlas/electricity-access/
 *   node firecrawl-atlas-ref.mjs --slug water-access
 *   node firecrawl-atlas-ref.mjs --list
 *
 * Output:
 *   recordings/firecrawl/{slug}/screenshot.png
 *   recordings/firecrawl/{slug}/page.md
 *   recordings/firecrawl/{slug}/meta.json
 *   recordings/firecrawl/index.html  (gallery of refs)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const OUT = path.join(ROOT, "recordings", "firecrawl");

const SLUGS = {
  "extreme-poverty": "https://data360.worldbank.org/en/atlas/extreme-poverty/",
  "water-access": "https://data360.worldbank.org/en/atlas/water-access/",
  "electricity-access": "https://data360.worldbank.org/en/atlas/electricity-access/",
  "internet-access": "https://data360.worldbank.org/en/atlas/internet-access/",
  "data-for-development": "https://data360.worldbank.org/en/atlas/data-for-development/",
  "inequality": "https://data360.worldbank.org/en/atlas/inequality/",
  "learning-and-work": "https://data360.worldbank.org/en/atlas/learning-and-work/",
  "gender-and-jobs": "https://data360.worldbank.org/en/atlas/gender-and-jobs/",
  "urban-development": "https://data360.worldbank.org/en/atlas/urban-development/",
  "climate": "https://data360.worldbank.org/en/atlas/climate/",
  "artificial-intelligence": "https://data360.worldbank.org/en/atlas/artificial-intelligence/",
  "global-progress": "https://data360.worldbank.org/en/atlas/global-progress/",
  "measuring-progress": "https://data360.worldbank.org/en/atlas/measuring-progress/",
};

function parseArgs(argv) {
  const args = { slug: "electricity-access", url: null, list: false, waitMs: 4000 };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    const n = argv[i + 1];
    if (a === "--slug") args.slug = n;
    else if (a === "--url") args.url = n;
    else if (a === "--list") args.list = true;
    else if (a === "--wait") args.waitMs = +n;
    else if (a === "--help" || a === "-h") args.help = true;
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log(`firecrawl-atlas-ref.mjs

  export FIRECRAWL_API_KEY=fc-...
  node firecrawl-atlas-ref.mjs --slug electricity-access
  node firecrawl-atlas-ref.mjs --url https://data360.worldbank.org/en/atlas/water-access/
`);
    return;
  }
  if (args.list) {
    Object.entries(SLUGS).forEach(([k, v]) => console.log(k, v));
    return;
  }

  const key = process.env.FIRECRAWL_API_KEY || process.env.FIRECRAWL_KEY;
  if (!key) {
    console.error(`Missing FIRECRAWL_API_KEY.

1. Open https://firecrawl.dev/app → API Keys → copy key
2. export FIRECRAWL_API_KEY='fc-...'
3. cd ~/atlas-replicas/scripts/capture && npm i @mendable/firecrawl-js
4. node firecrawl-atlas-ref.mjs --slug electricity-access

Do NOT paste the key into chat or commit it.`);
    process.exit(1);
  }

  let Firecrawl;
  try {
    const mod = await import("@mendable/firecrawl-js");
    Firecrawl = mod.default || mod.FirecrawlApp || mod.Firecrawl;
  } catch {
    console.error("Install SDK first:\n  cd ~/atlas-replicas/scripts/capture && npm i @mendable/firecrawl-js");
    process.exit(1);
  }

  const url = args.url || SLUGS[args.slug];
  if (!url) {
    console.error("Unknown slug. Use --list or --url");
    process.exit(1);
  }
  const slug =
    args.url
      ? args.url.replace(/\/$/, "").split("/").pop() || "page"
      : args.slug;

  const dir = path.join(OUT, slug);
  fs.mkdirSync(dir, { recursive: true });

  console.log(`Firecrawl scrape (live origin)\n  url: ${url}\n  out: ${dir}`);

  const app = new Firecrawl({ apiKey: key });

  // API surface varies by SDK version — try scrapeUrl / scrape
  let result;
  const opts = {
    formats: ["markdown", "screenshot", "html"],
    waitFor: args.waitMs,
    timeout: 90000,
    onlyMainContent: false,
    actions: [
      // give SPA time, then scroll through story
      { type: "wait", milliseconds: args.waitMs },
      { type: "scroll", direction: "down" },
      { type: "wait", milliseconds: 1500 },
      { type: "scroll", direction: "down" },
      { type: "wait", milliseconds: 1500 },
      { type: "scroll", direction: "down" },
      { type: "wait", milliseconds: 2000 },
      { type: "screenshot", fullPage: true },
    ],
  };

  try {
    if (typeof app.scrape === "function") {
      result = await app.scrape(url, opts);
    } else if (typeof app.scrapeUrl === "function") {
      result = await app.scrapeUrl(url, opts);
    } else if (typeof app.scrapeUrlAsync === "function") {
      result = await app.scrapeUrlAsync(url, opts);
    } else {
      throw new Error("SDK has no scrape/scrapeUrl method — check @mendable/firecrawl-js version");
    }
  } catch (e) {
    // Fallback: simpler scrape without actions
    console.warn("scrape with actions failed, retrying simple:", e.message);
    if (typeof app.scrape === "function") {
      result = await app.scrape(url, {
        formats: ["markdown", "screenshot"],
        waitFor: args.waitMs,
        timeout: 90000,
      });
    } else {
      result = await app.scrapeUrl(url, {
        formats: ["markdown", "screenshot"],
        waitFor: args.waitMs,
      });
    }
  }

  // Normalize response shapes
  const data = result?.data || result || {};
  const markdown = data.markdown || result?.markdown || "";
  const screenshot =
    data.screenshot ||
    data.screenshotUrl ||
    result?.screenshot ||
    (data.actions?.screenshots && data.actions.screenshots[0]);

  if (markdown) {
    fs.writeFileSync(path.join(dir, "page.md"), markdown);
    console.log("  wrote page.md");
  }

  // screenshot may be base64 data URL or remote URL
  if (screenshot) {
    const shotPath = path.join(dir, "screenshot.png");
    if (String(screenshot).startsWith("data:image")) {
      const b64 = String(screenshot).split(",")[1];
      fs.writeFileSync(shotPath, Buffer.from(b64, "base64"));
      console.log("  wrote screenshot.png (base64)");
    } else if (String(screenshot).startsWith("http")) {
      const res = await fetch(screenshot);
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(shotPath, buf);
      console.log("  wrote screenshot.png (url)");
    } else {
      fs.writeFileSync(path.join(dir, "screenshot.raw.txt"), String(screenshot).slice(0, 500));
      console.log("  screenshot format unknown — raw tip saved");
    }
  } else {
    console.warn("  no screenshot in response — check Firecrawl plan / formats");
  }

  const meta = {
    url,
    slug,
    capturedAt: new Date().toISOString(),
    hasMarkdown: !!markdown,
    hasScreenshot: fs.existsSync(path.join(dir, "screenshot.png")),
    tools: "firecrawl",
  };
  fs.writeFileSync(path.join(dir, "meta.json"), JSON.stringify(meta, null, 2));

  writeGallery();
  console.log(`\nDone.
  dir:    recordings/firecrawl/${slug}/
  viewer: http://127.0.0.1:8787/recordings/firecrawl/
`);
}

function writeGallery() {
  fs.mkdirSync(OUT, { recursive: true });
  const dirs = fs
    .readdirSync(OUT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
  const cards = dirs
    .map((slug) => {
      const metaP = path.join(OUT, slug, "meta.json");
      const shot = path.join(OUT, slug, "screenshot.png");
      const meta = fs.existsSync(metaP) ? JSON.parse(fs.readFileSync(metaP, "utf8")) : {};
      return `<article class="card">
  <h2>${slug}</h2>
  <p class="u"><a href="${meta.url || "#"}" target="_blank" rel="noopener">${meta.url || ""}</a></p>
  ${fs.existsSync(shot) ? `<img src="./${slug}/screenshot.png" alt="${slug}"/>` : "<p>no screenshot</p>"}
  <p class="m"><a href="./${slug}/page.md">markdown</a> · captured ${meta.capturedAt || "?"}</p>
</article>`;
    })
    .join("\n");

  fs.writeFileSync(
    path.join(OUT, "index.html"),
    `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/>
<title>Firecrawl · Atlas origin refs</title>
<style>
body{font-family:system-ui;background:#0f1419;color:#e8eef6;margin:0;padding:24px}
.card{background:#1a222c;border:1px solid #2a3542;border-radius:12px;padding:14px;margin:14px 0}
img{max-width:100%;border-radius:8px;border:1px solid #2a3542}
.u a,.m a{color:#60a5fa;font-size:13px}
h1{font-size:1.3rem} h2{margin:0 0 8px;font-size:1.05rem}
</style></head><body>
<h1>Referencias Atlas vía Firecrawl (origen live)</h1>
<p style="color:#8b9aab">Screenshots del sitio real Data360 — para comparar con réplicas locales.</p>
${cards || "<p>Aún no hay capturas. Corre: node firecrawl-atlas-ref.mjs --slug electricity-access</p>"}
</body></html>`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
