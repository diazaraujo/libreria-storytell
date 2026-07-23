#!/usr/bin/env node
/* Story QA for CI: drives every story under a base URL with Playwright and
 * fails on broken placeholders, console errors, failed requests, empty
 * chart blocks, or horizontal overflow.
 *
 * Usage:
 *   node scripts/qa-stories.mjs <baseUrl> <storyPath...>
 *   node scripts/qa-stories.mjs http://127.0.0.1:8080 /stories/competencia/
 *
 * Requires: npm i -D playwright && npx playwright install chromium
 */
import { chromium } from "playwright";

const [base, ...paths] = process.argv.slice(2);
if (!base || paths.length === 0) {
  console.error("usage: qa-stories.mjs <baseUrl> <storyPath...>");
  process.exit(2);
}

const browser = await chromium.launch();
let failures = 0;

for (const path of paths) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  const failed = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 120)));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`console: ${m.text().slice(0, 120)}`);
  });
  page.on("response", (r) => {
    if (r.status() >= 400 && !/favicon|telemetry|mapbox-config/.test(r.url())) {
      failed.push(`${r.status()} ${r.url().slice(-70)}`);
    }
  });

  const problems = [];
  try {
    const url = base.replace(/\/$/, "") + path + (path.endsWith("/") ? "index.html" : "");
    await page.goto(url, { timeout: 30000 });
    await page.waitForLoadState("networkidle", { timeout: 25000 });
    await page.waitForTimeout(1200);

    // walk the page so every scroller mounts and every scene fires once
    for (const frac of [0.15, 0.3, 0.45, 0.6, 0.75, 0.9]) {
      await page.evaluate((f) => window.scrollTo(0, document.body.scrollHeight * f), frac);
      await page.waitForTimeout(1100);
    }

    const report = await page.evaluate(() => {
      const body = document.body.innerText;
      const charts = [...document.querySelectorAll(".ch-chart, [data-block] .chart, .ch-block .ch-sticky")];
      const chartStats = charts.map((el) => ({
        marks: el.querySelectorAll("rect, circle, path, line, text, canvas, iframe, img").length,
      }));
      return {
        brokenPlaceholders: (body.match(/⚠/g) || []).length,
        rawBraces: body.includes("{{"),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        chartBlocks: chartStats.length,
        emptyCharts: chartStats.filter((c) => c.marks === 0).length,
      };
    });

    if (errors.length) problems.push(`console/page errors: ${errors.slice(0, 3).join(" | ")}`);
    if (failed.length) problems.push(`failed requests: ${failed.slice(0, 3).join(" | ")}`);
    if (report.brokenPlaceholders) problems.push(`${report.brokenPlaceholders} broken ⚠ placeholders`);
    if (report.rawBraces) problems.push("raw {{ braces rendered in body");
    if (report.overflow > 1) problems.push(`horizontal overflow ${report.overflow}px`);
    if (report.chartBlocks > 0 && report.emptyCharts > 0) {
      problems.push(`${report.emptyCharts}/${report.chartBlocks} chart blocks empty`);
    }
  } catch (error) {
    problems.push(`navigation failed: ${String(error).slice(0, 140)}`);
  }

  console.log(`${problems.length ? "FAIL" : "ok  "} ${path}${problems.length ? " — " + problems.join("; ") : ""}`);
  failures += problems.length ? 1 : 0;
  await page.close();
}

await browser.close();
process.exit(failures ? 1 : 0);
