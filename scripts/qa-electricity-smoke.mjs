/**
 * Smoke QA for electricity library + chapters + story.
 * Usage: node scripts/qa-electricity-smoke.mjs
 * Requires: python3 -m http.server 8787 and mapbox-proxy :8790 (for hex)
 */
import { chromium } from "../scripts/capture/node_modules/playwright/index.mjs";

const BASE = process.env.BASE || "http://127.0.0.1:8787";
const PAGES = [
  "/library/nightlights-hexmap/demo.html",
  "/library/progress-race/demo.html",
  "/library/dual-line-urban-rural/demo.html",
  "/library/dual-line-urban-rural/demo-countries.html",
  "/library/regions-small-multiples/demo.html",
  "/library/population-access/demo.html",
  "/chapters/goal_07/00-access-electricity-regions/",
  "/chapters/goal_07/01-access-electricity-population/",
  "/chapters/goal_07/02-access-electricity-urban-rural/",
  "/chapters/goal_07/03-access-electricity-progress/",
  "/chapters/goal_07/04-access-electricity-urban-rural-countries/",
  "/chapters/goal_07/05-hexmap-nigeria/",
  "/chapters/goal_07/06-hexmap-ethiopia/",
  "/stories/electricity-access/",
];

const browser = await chromium.launch({ headless: true });
let fail = 0;
for (const path of PAGES) {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  try {
    const res = await page.goto(BASE + path, {
      waitUntil: "domcontentloaded",
      timeout: 45000,
    });
    await page.waitForTimeout(path.includes("hex") || path.includes("stories") ? 10000 : 3000);
    const ok = res?.status() === 200 && errors.length === 0;
    console.log(ok ? "OK " : "FAIL", path, res?.status(), errors[0] || "");
    if (!ok) fail++;
  } catch (e) {
    console.log("FAIL", path, e.message);
    fail++;
  }
  await page.close();
}
await browser.close();
process.exit(fail ? 1 : 0);
