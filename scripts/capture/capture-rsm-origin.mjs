/**
 * Reliable capture of AccessElectricityRegions scroller on local Atlas :8765
 * and replica chapter / demo on :8787.
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../../recordings/compare/regions-small-multiples-polish");
const ORIGIN = "http://127.0.0.1:8765/en/atlas/electricity-access/";
const REPLICA = "http://127.0.0.1:8787/chapters/goal_07/00-access-electricity-regions/index.html?clean=1";
const DEMO = "http://127.0.0.1:8787/library/regions-small-multiples/demo.html";

async function shot(page, file, clip = null) {
  const fp = path.join(OUT, file);
  await page.screenshot({ path: fp, fullPage: false, ...(clip ? { clip } : {}) });
  console.log("wrote", file, clip || "viewport");
  return fp;
}

async function findChartEl(page) {
  // Prefer sticky scroller chart with region labels / World panel
  const selectors = [
    ".region-label",
    ".region-label-container",
    "g.region",
    "[class*='AccessElectricity']",
    "svg g path[stroke-width='2']",
  ];
  for (const sel of selectors) {
    const loc = page.locator(sel).first();
    if (await loc.count().catch(() => 0)) {
      try {
        await loc.waitFor({ state: "visible", timeout: 3000 });
        return loc;
      } catch {}
    }
  }
  return null;
}

async function scrollToRegionsChart(page) {
  // Progressive scroll looking for "World" + "Sub-Saharan" region labels together
  const max = await page.evaluate(() => document.body.scrollHeight);
  const step = 400;
  let best = null;
  for (let y = 0; y < max; y += step) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(350);
    const hit = await page.evaluate(() => {
      const texts = [...document.querySelectorAll(".region-label, .label, text, div")]
        .map((el) => (el.textContent || "").trim())
        .filter(Boolean);
      const hasWorld = texts.some((t) => t === "World" || /^World$/i.test(t));
      const hasSSA = texts.some((t) => /Sub-Saharan/i.test(t));
      const has2000 = texts.some((t) => t === "2000");
      const labels = [...document.querySelectorAll(".region-label")];
      if (labels.length >= 4) {
        const r = labels[0].getBoundingClientRect();
        return { ok: true, top: r.top, n: labels.length, via: "region-label" };
      }
      // sticky chart svg with multiple region groups
      const gs = document.querySelectorAll("g.region");
      if (gs.length >= 4) {
        const r = gs[0].ownerSVGElement?.getBoundingClientRect?.() || gs[0].getBoundingClientRect();
        return { ok: true, top: r.top, n: gs.length, via: "g.region" };
      }
      if (hasWorld && hasSSA && has2000) {
        return { ok: true, top: window.innerHeight / 3, n: 0, via: "text" };
      }
      return { ok: false, y: window.scrollY, labels: labels.length, gs: gs.length };
    });
    if (hit.ok) {
      best = { y, ...hit };
      console.log("found chart at scroll", y, hit);
      // Center chart in view
      if (hit.via === "region-label" || hit.via === "g.region") {
        await page.evaluate(() => {
          const el =
            document.querySelector(".region-label") ||
            document.querySelector("g.region")?.ownerSVGElement;
          el?.scrollIntoView?.({ block: "center", behavior: "instant" });
        });
        await page.waitForTimeout(600);
      }
      return best;
    }
  }
  console.log("chart not found, last scroll diagnostics needed");
  return null;
}

async function captureOrigin(browser) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.setDefaultTimeout(60000);
  console.log("goto origin", ORIGIN);
  await page.goto(ORIGIN, { waitUntil: "networkidle", timeout: 90000 }).catch(async () => {
    await page.goto(ORIGIN, { waitUntil: "domcontentloaded", timeout: 60000 });
  });
  await page.waitForTimeout(2500);

  // dump structure for debugging
  const info = await page.evaluate(() => ({
    title: document.title,
    h: document.body.scrollHeight,
    classes: [...new Set([...document.querySelectorAll("[class]")].flatMap((e) => [...e.classList]))]
      .filter((c) => /region|scroll|chart|sticky|electric|scene|viz/i.test(c))
      .slice(0, 40),
  }));
  console.log("page info", JSON.stringify(info, null, 2));

  const found = await scrollToRegionsChart(page);
  await shot(page, "origin-v03-viewport.png");

  // Try clip around sticky chart area
  const box = await page.evaluate(() => {
    const labels = [...document.querySelectorAll(".region-label")];
    if (labels.length) {
      const rects = labels.map((l) => l.getBoundingClientRect());
      const svg = document.querySelector("g.region")?.ownerSVGElement
        || document.querySelector("svg");
      const sr = svg?.getBoundingClientRect();
      let minX = Math.min(...rects.map((r) => r.left));
      let minY = Math.min(...rects.map((r) => r.top), sr?.top ?? 9999);
      let maxX = Math.max(...rects.map((r) => r.right), sr?.right ?? 0);
      let maxY = Math.max(...rects.map((r) => r.bottom), sr?.bottom ?? 0);
      // expand
      minX = Math.max(0, minX - 40);
      minY = Math.max(0, minY - 80);
      maxX = Math.min(window.innerWidth, maxX + 40);
      maxY = Math.min(window.innerHeight, maxY + 40);
      return {
        x: minX, y: minY,
        width: maxX - minX, height: maxY - minY,
        nLabels: labels.length,
      };
    }
    const sticky = document.querySelector("[class*='sticky'], .sticky, [style*='sticky']");
    if (sticky) {
      const r = sticky.getBoundingClientRect();
      return { x: r.left, y: r.top, width: r.width, height: r.height, nLabels: 0 };
    }
    return null;
  });
  console.log("clip box", box);
  if (box && box.width > 100 && box.height > 100) {
    await shot(page, "origin-v03-chart.png", {
      x: Math.floor(box.x),
      y: Math.floor(box.y),
      width: Math.floor(box.width),
      height: Math.floor(box.height),
    });
  }

  // Also try scrolling mid-story and mid-bottom
  for (const [name, frac] of [["mid", 0.25], ["mid2", 0.35], ["mid3", 0.45]]) {
    await page.evaluate((f) => window.scrollTo(0, document.body.scrollHeight * f), frac);
    await page.waitForTimeout(800);
    const n = await page.locator(".region-label").count().catch(() => 0);
    console.log("scroll frac", frac, "labels", n);
    if (n >= 4) {
      await shot(page, `origin-v03-${name}.png`);
      break;
    }
  }

  await page.close();
  return found;
}

async function captureReplica(browser) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  for (const scene of [0, 2, 4]) {
    const url = `${REPLICA}${REPLICA.includes("?") ? "&" : "?"}scene=${scene}`;
    // chapter may use hash or keyboard — try clean + click scene if present
    await page.goto(REPLICA, { waitUntil: "networkidle", timeout: 60000 }).catch(() =>
      page.goto(REPLICA, { waitUntil: "domcontentloaded" })
    );
    await page.waitForTimeout(1500);
    // try advancing scenes via buttons / keys
    if (scene > 0) {
      for (let i = 0; i < scene; i++) {
        await page.keyboard.press("ArrowRight").catch(() => {});
        await page.waitForTimeout(400);
        // click next if exists
        const next = page.locator('button:has-text("→"), .nav-next, [aria-label="Next"]').first();
        if (await next.count()) await next.click().catch(() => {});
        await page.waitForTimeout(300);
      }
    }
    // force scene via AtlasReplica if available
    await page.evaluate((s) => {
      if (window.AtlasReplica?.render && window.__atlasCtx) {
        window.AtlasReplica.render(null, { ...window.__atlasCtx, sceneIndex: s });
      }
      // click scene dots
      const dots = document.querySelectorAll(".scene-dot, .pager button, [data-scene]");
      if (dots[s]) dots[s].click();
    }, scene).catch(() => {});
    await page.waitForTimeout(800);
    const chart = page.locator(".atlas-rsm, #chart, .chart-area, .atlas-chart-root").first();
    if (await chart.count()) {
      await chart.screenshot({ path: path.join(OUT, `replica-v03-s${scene}.png`) }).catch(async () => {
        await shot(page, `replica-v03-s${scene}.png`);
      });
    } else {
      await shot(page, `replica-v03-s${scene}.png`);
    }
    console.log("replica scene", scene);
  }
  await page.close();
}

async function captureDemo(browser) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 700 } });
  await page.goto(DEMO, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  for (const scene of [0, 2, 4]) {
    await page.evaluate((s) => {
      const btns = document.querySelectorAll("#nav button");
      if (btns[s]) btns[s].click();
    }, scene);
    await page.waitForTimeout(600);
    const chart = page.locator("#chart, .atlas-rsm").first();
    await chart.screenshot({ path: path.join(OUT, `demo-v03-s${scene}.png`) });
    console.log("demo scene", scene);
  }
  await page.close();
}

const browser = await chromium.launch({ headless: true });
await mkdir(OUT, { recursive: true });
try {
  await captureOrigin(browser);
  await captureDemo(browser);
  await captureReplica(browser);
} finally {
  await browser.close();
}
console.log("done →", OUT);
