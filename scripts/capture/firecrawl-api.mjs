#!/usr/bin/env node
/**
 * Thin CLI around Firecrawl API for Atlas origin refs.
 *
 *   node firecrawl-api.mjs credits
 *   node firecrawl-api.mjs scrape electricity-access
 *   node firecrawl-api.mjs agent electricity-access
 *   node firecrawl-api.mjs gallery   # rebuild index.html only
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const OUT = path.join(ROOT, "recordings", "firecrawl");

const SLUGS = {
  "electricity-access": "https://data360.worldbank.org/en/atlas/electricity-access/",
  "water-access": "https://data360.worldbank.org/en/atlas/water-access/",
  "extreme-poverty": "https://data360.worldbank.org/en/atlas/extreme-poverty/",
  "internet-access": "https://data360.worldbank.org/en/atlas/internet-access/",
  "data-for-development": "https://data360.worldbank.org/en/atlas/data-for-development/",
  "inequality": "https://data360.worldbank.org/en/atlas/inequality/",
  "climate": "https://data360.worldbank.org/en/atlas/climate/",
  "learning-and-work": "https://data360.worldbank.org/en/atlas/learning-and-work/",
  "gender-and-jobs": "https://data360.worldbank.org/en/atlas/gender-and-jobs/",
  "urban-development": "https://data360.worldbank.org/en/atlas/urban-development/",
  "artificial-intelligence": "https://data360.worldbank.org/en/atlas/artificial-intelligence/",
  "global-progress": "https://data360.worldbank.org/en/atlas/global-progress/",
  "measuring-progress": "https://data360.worldbank.org/en/atlas/measuring-progress/",
};

function loadEnv() {
  for (const p of [path.join(__dirname, ".env"), path.join(ROOT, ".env")]) {
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      const v = m[2].replace(/^["']|["']$/g, "");
      if (!process.env[m[1]]) process.env[m[1]] = v;
    }
  }
}

// ── Guarda de gasto ──────────────────────────────────────────────────────
// Firecrawl cobra por scrape/agent. Esta guarda muestra un WARNING y exige
// confirmación ANTES de cualquier llamada que consuma créditos. Fail-safe:
// en sesión no interactiva aborta salvo --yes / FIRECRAWL_CONFIRM=1.
// Los comandos que NO gastan (credits/gallery/help) nunca pasan por acá.
async function confirmFirecrawlSpend(action, target) {
  const argv = process.argv.slice(2);
  const assumeYes =
    argv.includes("--yes") ||
    argv.includes("-y") ||
    process.env.FIRECRAWL_CONFIRM === "1" ||
    process.env.FIRECRAWL_YES === "1";
  process.stderr.write(
    `\n\x1b[33m⚠️  FIRECRAWL — esto CONSUME créditos de pago\x1b[0m\n` +
      `   acción: ${action}\n` +
      (target ? `   url:    ${target}\n` : "")
  );
  if (assumeYes) {
    process.stderr.write("   confirmado (--yes / FIRECRAWL_CONFIRM=1)\n\n");
    return;
  }
  if (!process.stdin.isTTY) {
    process.stderr.write(
      "\x1b[31m   Abortado: sesión no interactiva y sin --yes / FIRECRAWL_CONFIRM=1.\x1b[0m\n\n"
    );
    process.exit(1);
  }
  const rl = (await import("node:readline/promises")).createInterface({
    input: process.stdin,
    output: process.stderr,
  });
  const ans = (await rl.question("   ¿Continuar y gastar créditos? [y/N] "))
    .trim()
    .toLowerCase();
  rl.close();
  if (!["y", "yes", "s", "si", "sí"].includes(ans)) {
    process.stderr.write("\x1b[31m   Cancelado — no se llamó a Firecrawl.\x1b[0m\n\n");
    process.exit(0);
  }
  process.stderr.write("\n");
}

function resolveUrl(arg) {
  if (!arg) return SLUGS["electricity-access"];
  if (arg.startsWith("http")) return arg;
  if (SLUGS[arg]) return SLUGS[arg];
  return `https://data360.worldbank.org/en/atlas/${arg}/`;
}

function slugFromUrl(url) {
  return url.replace(/\/$/, "").split("/").pop() || "page";
}

async function saveShot(shot, dest) {
  if (!shot) return false;
  if (String(shot).startsWith("data:image")) {
    fs.writeFileSync(dest, Buffer.from(String(shot).split(",")[1], "base64"));
    return true;
  }
  if (String(shot).startsWith("http")) {
    const res = await fetch(shot);
    fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    return true;
  }
  return false;
}

function writeGallery() {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
  const dirs = fs
    .readdirSync(OUT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
  const cards = dirs
    .map((slug) => {
      const metaP = path.join(OUT, slug, "meta.json");
      const shot = path.join(OUT, slug, "screenshot.png");
      let meta = {};
      try {
        meta = JSON.parse(fs.readFileSync(metaP, "utf8"));
      } catch {}
      const url = meta.url || `https://data360.worldbank.org/en/atlas/${slug}/`;
      const img = fs.existsSync(shot)
        ? `<img src="./${slug}/screenshot.png" alt="${slug}" loading="lazy"/>`
        : "<p>no screenshot</p>";
      const md = fs.existsSync(path.join(OUT, slug, "page.md"))
        ? `<a href="./${slug}/page.md">markdown</a>`
        : "";
      return `<article class="card">
  <h2>${slug}</h2>
  <p class="u"><a href="${url}" target="_blank" rel="noopener">${url}</a></p>
  ${img}
  <p class="m">${md} · captured ${meta.at || meta.capturedAt || "?"}</p>
</article>`;
    })
    .join("\n");

  fs.writeFileSync(
    path.join(OUT, "index.html"),
    `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Firecrawl · Atlas origin refs (${dirs.length})</title>
<style>
body{font-family:system-ui,sans-serif;background:#0f1419;color:#e8eef6;margin:0;padding:24px}
h1{font-size:1.35rem;margin:0 0 6px}
.sub{color:#8b9aab;margin-bottom:18px;font-size:14px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(420px,1fr));gap:16px}
.card{background:#1a222c;border:1px solid #2a3542;border-radius:12px;padding:14px}
.card h2{margin:0 0 8px;font-size:1.05rem}
.card img{width:100%;height:auto;border-radius:8px;border:1px solid #2a3542;background:#0b1016;display:block}
.u a,.m a{color:#60a5fa;font-size:13px;word-break:break-all}
.m{color:#8b9aab;font-size:12px;margin:10px 0 0}
</style></head><body>
<h1>Referencias Atlas vía Firecrawl (origen live)</h1>
<p class="sub">${dirs.length} stories · screenshots Data360 · hard-refresh (⌘⇧R) si no ves cambios</p>
<div class="grid">
${cards || "<p>Sin capturas aún.</p>"}
</div>
</body></html>`
  );
  console.log(`gallery: ${dirs.length} cards → ${path.join(OUT, "index.html")}`);
}

async function main() {
  loadEnv();
  const positional = process.argv.slice(2).filter((a) => !a.startsWith("-"));
  const [cmd, target] = positional;
  if (!cmd || cmd === "help" || cmd === "-h") {
    console.log(`Firecrawl API helper

  credits              credit usage
  scrape [slug|url]    screenshot + markdown
  agent  [slug|url]    agent browse
  gallery              rebuild index.html only
`);
    return;
  }

  if (cmd === "gallery") {
    writeGallery();
    return;
  }

  const key = process.env.FIRECRAWL_API_KEY || process.env.FIRECRAWL_KEY;
  if (!key) {
    console.error("Missing FIRECRAWL_API_KEY");
    process.exit(1);
  }

  const { default: Firecrawl } = await import("@mendable/firecrawl-js");
  const app = new Firecrawl({ apiKey: key });

  if (cmd === "credits") {
    console.log(JSON.stringify(await app.getCreditUsage(), null, 2));
    return;
  }

  const url = resolveUrl(target);
  const slug = slugFromUrl(url);

  // scrape y agent gastan créditos → warning + confirmación
  if (cmd === "scrape" || cmd === "agent") await confirmFirecrawlSpend(cmd, url);

  const dir = path.join(OUT, slug);
  fs.mkdirSync(dir, { recursive: true });

  if (cmd === "scrape") {
    console.log("API scrape", url);
    const result = await app.scrape(url, {
      formats: ["markdown", "screenshot"],
      waitFor: 5000,
      timeout: 90000,
      onlyMainContent: false,
      actions: [
        { type: "wait", milliseconds: 3000 },
        { type: "scroll", direction: "down" },
        { type: "wait", milliseconds: 1000 },
        { type: "scroll", direction: "down" },
        { type: "wait", milliseconds: 1000 },
        { type: "scroll", direction: "down" },
        { type: "wait", milliseconds: 2000 },
      ],
    });
    const data = result?.data || result || {};
    const md = data.markdown || result?.markdown || "";
    const shot = data.screenshot || result?.screenshot;
    if (md) fs.writeFileSync(path.join(dir, "page.md"), md);
    const ok = await saveShot(shot, path.join(dir, "screenshot.png"));
    // reject tiny/blank screenshots
    const shotPath = path.join(dir, "screenshot.png");
    if (ok && fs.statSync(shotPath).size < 15000) {
      console.warn("screenshot very small — may be blank");
    }
    fs.writeFileSync(
      path.join(dir, "meta.json"),
      JSON.stringify(
        { url, slug, cmd: "scrape", at: new Date().toISOString(), hasMd: !!md, hasShot: ok },
        null,
        2
      )
    );
    writeGallery();
    console.log("saved →", dir, { md: !!md, shot: ok });
    return;
  }

  if (cmd === "agent") {
    console.log("API agent", url);
    const result = await app.agent({
      urls: [url],
      prompt: `Open this World Bank Atlas story page. Scroll until main data visualizations are visible. Screenshot the primary chart and summarize layout.`,
      model: "spark-1-mini",
      timeout: 180,
      pollInterval: 3,
    });
    fs.writeFileSync(path.join(dir, "agent-response.json"), JSON.stringify(result, null, 2));
    writeGallery();
    console.log("saved agent →", path.join(dir, "agent-response.json"));
    return;
  }

  console.error("Unknown command:", cmd);
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
