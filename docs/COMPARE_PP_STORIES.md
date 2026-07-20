# Pixel-perfect compare — 3 stories vs origin

**Date:** 2026-07-20  
**Captures:** `recordings/compare/pp-stories-2026-07-20/`  
**Viewport:** 1440×900  

| Story | Origin | Replica |
|-------|--------|---------|
| Electricity | `:8765/en/atlas/electricity-access/` | `:8787/stories/electricity-access/` |
| Internet | `:8765/en/atlas/internet-access/` | `:8787/stories/internet-access/` |
| Water | `:8765/en/atlas/water-access/` | `:8787/stories/water-access/` |

## Hero (chrome) — pass after navy remodel

| Element | Origin | Replica (post-PP) | Match |
|---------|--------|-------------------|-------|
| Full-bleed navy `#071a3d` | yes | yes | **strong** |
| White title / lead | yes | yes · origin copy | **strong** |
| Byline | yes | yes | **strong** |
| Key facts 3 cards | yes | yes · same numbers | **strong** |
| Particle field | Pixi on navy | canvas · theme color · left bias | **strong** (not byte-identical) |
| WB global nav | yes | thin story topbar only | chrome gap (by design) |
| Scroll cue | “Scroll down” | yes | **strong** |

## Sticky body (charts)

| Element | Match |
|---------|-------|
| Two-column sticky (note · chart) | **strong** |
| Red rule under title | **strong** |
| Annotation card + left rail | **strong** |
| Scene dots | present · lighter weight than origin |
| Chart fidelity | electricity **strong**; water/internet **good** (library v0.1 patterns) |

## Files changed this PP pass

- `shared/chapter-scroll.css` — dark hero · key facts · byline · transparent topbar  
- `shared/chapter-scroll.js` — hero DOM + keyFacts + particles bias  
- `shared/particles.js` — left-plume seed bias  
- `stories/*/story.json` — origin leads, bylines, key facts, particle palette  
- `stories/*/index.html` — topbar over dark hero  

## Re-capture

```bash
bash scripts/dev-servers.sh
# headless pair shots → recordings/compare/pp-stories-2026-07-20/
```

## Residual (next PP iterations)

1. Origin particle engine density map (country scatter) — synthetic plume only  
2. Key-fact cards: exact origin padding / underline links “Show details”  
3. Chart-level pixel pass per graphic (service ladder year-reveal, dual-line hatch, etc.)  
4. Mobile breakpoint match vs Atlas  
