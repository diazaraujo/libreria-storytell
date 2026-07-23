# Real-browser visual QA — 2026-07-21

Driver: Playwright + headless Chromium against the single-port server
(`sostenibilidad-data-code/scripts/serve.py`, library mounted at `/ar`).
Machine-readable axe results: `axe-results-prefix.json` (the run that
surfaced the findings, before any fix) and `axe-results-postfix.json`
(verification after the fixes below). Chromium only; Safari/Firefox not
exercised.

## Coverage

- 21 pages x viewports (58 renders): hub pages, the three galleries, and the
  12 renderers corrected in the previous review, at 1440x900, 768x1024
  (galleries/hub), and 344x740.
- Per render: console errors, page errors, failed HTTP requests, horizontal
  overflow, screenshot.
- Keyboard: 10 Tab stops on hub, gallery, and income-world-map — all stops
  had a visible focus indicator and were on-screen.
- Reduced motion: hub and gallery reloaded under `prefers-reduced-motion:
  reduce` with no errors.
- Error states: chapters goal_03/06 and goal_14/06 with all CSV requests
  blocked show a visible "Render error" message instead of a blank chart
  (screenshot saved for fish-mortality).
- axe-core on 7 representative pages (`axe-results.json`).

## Findings and fixes (all verified in-browser after the fix)

1. `shared/fossil-subsidies.js` — `ReferenceError: color is not defined`:
   `unit`/`color` were declared inside the `rows.map()` callback but used
   outside it, so every `column_*` scene of goal_12/00-intro-scroller and
   goal_12/04-intro-scroller-2 died with a visible "Render error" (BEFORE
   screenshot). Fixed by hoisting the scene-scoped values; regression test
   "fossil subsidy scrollers render every scene through the shared renderer"
   reproduces the original error against the unfixed file. Tests: 37/37.
2. `gallery-table.html` — the 918px table forced body-level horizontal
   scroll at 768/344px (598px overflow at 344px). Wrapped in a
   `.table-scroll` container whose `overflow-x: auto` applies only below
   980px, because an always-on scroll wrapper silently broke the table's
   sticky column headers on desktop (caught by code review). Verified
   post-fix: overflow 0 at 344px AND `th` still pinned (top 0) after a
   2500px desktop scroll.
3. Landmarks and contrast: `gallery.html` had no `<main>` and the hub
   section sat outside any landmark; `gallery-table.html` had no `<main>`,
   an empty `<th>`, and 8 serious contrast nodes (`#6a7781` at 4.25–4.43:1
   in `.meta` and `th`, darkened to `#5b6873`). All fixed; post-fix axe on
   both galleries: no violations (`axe-results-postfix.json`).

## Non-findings

- Gallery cards render black in a full-page screenshot: lazy-loaded thumbs
  not triggered by screenshotting; on real scroll all 164 load
  (gallery-desktop-thumbs-loaded.png).

## Open items (documented, intentionally not changed)

- Chapter-level color contrast: axe flags ~3 serious contrast nodes per
  chapter page (secondary gray text inherited from the Atlas replica
  styling). Changing colors trades off pixel-perfect fidelity against
  WCAG AA; needs a product decision, then a template-level fix. (The
  gallery pages' own contrast debt is already fixed — this item covers
  the 164 generated chapter pages only.)
- Chapter templates lack `<main>` landmarks (164 generated pages) — fix in
  the scaffold template and regenerate, not page by page.
- Browser-zoom (200%) and screen-reader passes not performed.
- Safari and Firefox not exercised (Chromium only).
