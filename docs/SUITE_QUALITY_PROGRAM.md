# Suite quality program

**Goal:** Bring every Atlas story suite to the same level of detail and polish as the gold stories (Water, Electricity, Internet) — not gallery completeness, but **visual and narrative fidelity**.

**Date started:** 2026-07-20  
**Repo:** https://github.com/diazaraujo/libreria-storytell  
**Method:** [`METODOLOGIA_PIXEL_PERFECT.md`](./METODOLOGIA_PIXEL_PERFECT.md)

---

## Quality bar (definition of done for a suite)

A suite is **gold** when **all** of the following hold:

| # | Criterion |
|---|-----------|
| 1 | **Origen first.** Chart type and scene choreography match the live/local Atlas story (`:8765/en/atlas/<story>/`), not a generic multi-line or scatter template. |
| 2 | **Pattern library.** Shared chart logic lives in `library/<patron>/` with `SPEC.md` from RE (chunk ids, domains, colors, scene maps). Chapters only load data + `mount` / `updateScene`. |
| 3 | **Mount once.** Scrollers never remount on scene change (kills Atlas ~1s transitions). |
| 4 | **Real data bind.** Local CSV/JSON from goal data; no invented series. Image-only only when Atlas is image-only (with real assets). |
| 5 | **WB chrome.** Open Sans, `WB_COLORS` / seq palettes, note type scale, source footer, clean mode `?clean=1`. |
| 6 | **Scene fidelity.** Each scene id changes the chart the way Atlas does (highlight, domain, zoom, layer). |
| 7 | **Story shell.** Sticky scrollytelling under `stories/<slug>/` when the suite is narrative (like water/electricity/internet). |
| 8 | **QA.** `node --check` library; manual scroll vs origin; no placeholder; no console errors on happy path. |

**Not enough:** “approved” list membership, bulk generator, or hardened SVG placeholder.

---

## Gold reference suites

| Story | Chapters | Library patterns |
|-------|----------|------------------|
| Water access | goal_06 (11) | service-ladder, dual-line, beeswarm, limiting-factors, … |
| Electricity | goal_07 (7) | regions-small-multiples, progress-race, nightlights-hexmap, … |
| Internet | goal_09 (10) | access-trends-scroller, coverage-choropleth-map, gender-gap, … |

---

## Work order (quality, not speed)

One suite fully before the next. Within a suite: RE → library → chapters → story → QA.

| Order | Suite | Atlas story | Why this order |
|------:|-------|-------------|----------------|
| **1** | **Climate** | `/climate/` · goal_13 | Largest fidelity gap (maps mis-rendered as scatter; icon matrix bulk). Mapbox path already proven. |
| 2 | Urban development | `/urban-development/` · goal_11 | Beeswarm/violin/waffle still auto-bulk; skill/pay need true patterns. |
| 3 | Artificial intelligence | `/artificial-intelligence/` · goal_16 | Small (5); close hand baseline → quick gold. |
| 4 | Gender and jobs | `/gender-and-jobs/` · goal_05 | Wage scatter + employment types need RE depth. |
| 5 | Oceans & plastics | (gallery) · goal_14 | Many image/map panels need assets or choropleths. |
| 6 | Life on land | (gallery) · goal_15 | Aridity rasters / land maps. |
| 7 | Hunger residual | (gallery) · goal_02 | NDVI map scroller. |
| 8 | Other residual | id4d, goal_99, prices… | Image strips / scaffolds last. |

Progress is tracked per suite under `docs/suites/<name>/`.

---

## Rules of engagement

- Prefer **one pattern done right** over ten chapters half-fixed.
- Document RE findings in `library/<patron>/SPEC.md` before large rewrites.
- Do not mark suite “gold” in APPROVED notes until criteria 1–8 pass.
- Private Mapbox tiles (`mlambrechts.*`) use proxy `:8790` when available; country choropleth fallback must still narrate correctly.
