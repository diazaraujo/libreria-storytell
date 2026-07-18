#!/usr/bin/env node
/**
 * Interactive QA pass: open each ready viz, click through scenes,
 * collect console errors / empty charts / bad markup / axis smells.
 * Writes report + screenshots of failures.
 *
 *   node qa-pass.mjs --limit 30
 *   node qa-pass.mjs --only 10
 *   node qa-pass.mjs --status ready
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const INV = path.join(ROOT, "inventory", "index.json");
const OUT = path.join(ROOT, "recordings", "qa");

function parseArgs(argv) {
  const a = { only: null, limit: null, status: "ready", base: "http://127.0.0.1:8787", headed: false };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--only") a.only = argv[++i];
    else if (argv[i] === "--limit") a.limit = +argv[++i];
    else if (argv[i] === "--status") a.status = argv[++i];
    else if (argv[i] === "--base") a.base = argv[++i];
    else if (argv[i] === "--headed") a.headed = true;
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

async function qaItem(page, item, args) {
  const url = `${args.base.replace(/\/$/, "")}/${item.dir}/index.html`;
  const issues = [];
  const errors = [];
  const onErr = (e) => errors.push(String(e));
  page.on("pageerror", onErr);
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });

  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
  } catch (e) {
    issues.push({ code: "LOAD_FAIL", detail: String(e) });
    page.off("pageerror", onErr);
    return { item, url, issues, errors, ok: false };
  }

  // Wait for renderer to settle (placeholder gone or chart filled)
  await page
    .waitForFunction(
      () => {
        const ph = document.querySelector("#placeholder");
        const chart = document.querySelector("#chart");
        const phHidden =
          !ph ||
          getComputedStyle(ph).display === "none" ||
          getComputedStyle(ph).visibility === "hidden";
        const hasContent =
          chart &&
          (chart.querySelector("svg, img, iframe, table, .auto-root, .draw-root, .atlas-chart-root") ||
            (chart.innerText || "").trim().length > 40);
        return phHidden && hasContent;
      },
      { timeout: 12000 }
    )
    .catch(() => {});

  await page.waitForTimeout(350);

  // Placeholder still visible? (retry once — flaky on slow image mounts)
  async function placeholderBlocking() {
    const ph = page.locator("#placeholder");
    if (!(await ph.count())) return false;
    const visible = await ph.isVisible().catch(() => false);
    if (!visible) return false;
    const display = await ph.evaluate((el) => getComputedStyle(el).display).catch(() => "");
    if (display === "none") return false;
    const hasContent = await page
      .locator("#chart svg, #chart img, #chart iframe, #chart .auto-root, #chart .draw-root, #chart .atlas-chart-root")
      .count();
    return hasContent === 0;
  }
  if (await placeholderBlocking()) {
    await page.waitForTimeout(2000);
    if (await placeholderBlocking()) {
      issues.push({
        code: "PLACEHOLDER_VISIBLE",
        detail: await page.locator("#placeholder").innerText().catch(() => ""),
      });
    }
  }

  // Content signals
  const hasSvg = (await page.locator("#chart svg").count()) > 0;
  const hasImg = (await page.locator("#chart img").count()) > 0;
  const hasIframe = (await page.locator("#chart iframe").count()) > 0;
  const chartText = (await page.locator("#chart").innerText().catch(() => "")) || "";
  // Prefer story/chart chrome; avoid false positives from long decimals in source notes
  const storyText = (await page.locator("#story-text, .sub, h1").allInnerTexts().catch(() => []))
    .join("\n");
  const bodyText = storyText;

  if (!hasSvg && !hasImg && !hasIframe) {
    // table preview is ok
    if (!chartText.includes("rows") && chartText.trim().length < 20) {
      issues.push({ code: "EMPTY_CHART", detail: chartText.slice(0, 120) });
    }
  }

  // Bad markup leftovers
  if (/\[emphasis:/.test(bodyText)) {
    issues.push({ code: "RAW_EMPHASIS", detail: "unparsed [emphasis:] in page text" });
  }
  if (/\{\{[a-zA-Z_]+\}\}/.test(bodyText)) {
    issues.push({ code: "RAW_MUSTACHE", detail: bodyText.match(/\{\{[^}]+\}\}/)?.[0] });
  }

  // Axis smell: only flag real population-scale integers (not float garbage)
  const axisNums = [...bodyText.matchAll(/\b([1-9]\d{8,})\b/g)].map((m) => m[1]);
  // ignore years-like and ids under 1e9 unless multiple billion-scale
  const billions = axisNums.filter((n) => +n >= 1e9);
  if (billions.length >= 2) {
    issues.push({
      code: "AXIS_RAW_HUGE",
      detail: `raw large tick numbers: ${billions.slice(0, 4).join(", ")}`,
    });
  }

  // Play through scenes
  const sceneCount = item.sceneCount || 0;
  if (sceneCount > 1) {
    const next = page.locator("#btn-next");
    if ((await next.count()) === 0) {
      issues.push({ code: "NO_SCENE_NAV", detail: "scroller without #btn-next" });
    } else {
      for (let i = 0; i < Math.min(sceneCount - 1, 12); i++) {
        const disabled = await next.isDisabled().catch(() => true);
        if (disabled) break;
        await next.click().catch(() => {});
        await page.waitForTimeout(280);
      }
      // re-check emphasis after navigation
      const t2 = (await page.locator("#story-text").innerHTML().catch(() => "")) || "";
      if (/\[emphasis:/.test(t2)) {
        issues.push({ code: "RAW_EMPHASIS_SCENE", detail: "after navigation" });
      }
    }
  }

  // Image broken?
  if (hasImg) {
    const broken = await page.locator("#chart img").evaluateAll((imgs) =>
      imgs.filter((i) => !i.naturalWidth).map((i) => i.src)
    );
    if (broken.length) issues.push({ code: "BROKEN_IMAGE", detail: broken[0] });
  }

  // SVG with zero circles/paths/rects might be empty axes only
  if (hasSvg) {
    const marks = await page.locator("#chart svg circle, #chart svg path, #chart svg rect").count();
    if (marks === 0) {
      issues.push({ code: "SVG_NO_MARKS", detail: "axes only?" });
    }
  }

  if (errors.length) {
    issues.push({ code: "JS_ERROR", detail: errors.slice(0, 3).join(" | ") });
  }

  page.off("pageerror", onErr);

  let shot = null;
  if (issues.length) {
    const dir = path.join(OUT, "failures", `${String(item.index).padStart(3, "0")}_${item.graphic}`);
    fs.mkdirSync(dir, { recursive: true });
    shot = path.join(dir, "screen.png");
    await page.screenshot({ path: shot, fullPage: true });
    fs.writeFileSync(
      path.join(dir, "issues.json"),
      JSON.stringify({ item, url, issues, errors }, null, 2)
    );
  }

  return {
    item,
    url,
    issues,
    errors,
    ok: issues.length === 0,
    shot: shot ? path.relative(ROOT, shot) : null,
  };
}

async function main() {
  const args = parseArgs(process.argv);
  fs.mkdirSync(OUT, { recursive: true });

  try {
    const r = await fetch(args.base);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
  } catch (e) {
    console.error(`Server not reachable at ${args.base}. Start: python3 -m http.server 8787\n${e}`);
    process.exit(1);
  }

  const items = loadItems(args);
  console.log(`QA ${items.length} items…`);

  const browser = await chromium.launch({ headless: !args.headed });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  const results = [];

  for (const item of items) {
    process.stdout.write(`→ [${item.index}] ${item.chapterId}/${item.graphic} `);
    const res = await qaItem(page, item, args);
    results.push(res);
    console.log(res.ok ? "OK" : `FAIL (${res.issues.map((i) => i.code).join(",")})`);
  }

  await browser.close();

  const failed = results.filter((r) => !r.ok);
  const byCode = {};
  for (const r of failed) {
    for (const i of r.issues) {
      byCode[i.code] = (byCode[i.code] || 0) + 1;
    }
  }

  const report = {
    at: new Date().toISOString(),
    total: results.length,
    ok: results.length - failed.length,
    failed: failed.length,
    byCode,
    failures: failed.map((r) => ({
      index: r.item.index,
      graphic: r.item.graphic,
      chapterId: r.item.chapterId,
      dir: r.item.dir,
      issues: r.issues,
      shot: r.shot,
    })),
  };

  fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(report, null, 2));
  fs.writeFileSync(
    path.join(OUT, "report.md"),
    [
      `# QA report`,
      ``,
      `- Total: ${report.total}`,
      `- OK: ${report.ok}`,
      `- Failed: ${report.failed}`,
      ``,
      `## By code`,
      ...Object.entries(byCode).map(([k, v]) => `- **${k}**: ${v}`),
      ``,
      `## Failures`,
      ...report.failures.map(
        (f) =>
          `- \`${f.chapterId}/${f.graphic}\` — ${f.issues.map((i) => i.code).join(", ")}` +
          (f.shot ? ` ([shot](../../${f.shot}))` : "")
      ),
    ].join("\n")
  );

  console.log(`\nOK ${report.ok}/${report.total} · failed ${report.failed}`);
  console.log(`Report: ${path.join(OUT, "report.md")}`);
  if (failed.length) process.exitCode = 2;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
