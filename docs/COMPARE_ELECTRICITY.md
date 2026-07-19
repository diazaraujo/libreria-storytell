# Compare · Electricity Access — origin vs replica

**Date:** 2026-07-19  
**Origin:** `http://127.0.0.1:8765/en/atlas/electricity-access`  
**Replica story:** `http://127.0.0.1:8787/stories/electricity-access/`  
**Captures:** `/tmp/elec-compare/` (local session)

## Block matrix

| Block | Origin | Replica | Match |
|-------|--------|---------|-------|
| Hero + intro | particle field + prose | hero + lead (no particles) | **chrome gap** |
| Regions small multiples | sticky + 5 scenes | library v0.5 · 5 scenes | **strong** (78→92 World) |
| Population stack | 6 scenes | library v0.2 | **strong** |
| Progress race | 4 scenes · focus ETH/NGA/COD | library v0.2 · dots 2015 | **strong** |
| Urban–rural dual-line | hatch gap 4×2 | library v0.2 | **strong** |
| UR countries ETH/NGA/COD | 1×3 | library v0.2 | **strong** |
| Hexmap Nigeria | Mapbox Standard + tilesets | v0.9 origin tiles via proxy | **strong** (zones scene) |
| Hexmap Ethiopia | rural NTL + grid | v0.9 origin tiles | **strong** |

## Residuals (honest)

1. **Particle field** — ✅ replica ships `shared/particles.js` (canvas field, theme red, reduced-motion safe). Origin uses Pixi ParticleContainer; visual parity is strong on intro, not byte-identical engine.
2. **Story shell chrome** — origin has Atlas nav / theme tokens; replica has thin topbar + sticky charts (by design).
3. **Private tilesets** — need `mapbox-proxy.py` + data token for origin hex fidelity; falls back to H3 geojson offline.
4. **Scene nav on chapter pages** — clean mode uses scroller dots inside story; individual chapter `?clean=1` may not expose scene buttons (scroll-driven in story).

## Fixes applied after compare

- [x] Hide hexmap `origin tiles` badge by default (`showBadge` only in library demo)
- [x] Story topbar → Gallery / Dev / Live links
- [x] Document this compare matrix
- [x] Hero/story particle field (`AtlasParticles`)

## How to re-run captures

```bash
bash scripts/dev-servers.sh
# then Playwright script or manual scroll both URLs
open http://127.0.0.1:8787/stories/electricity-access/
open http://127.0.0.1:8765/en/atlas/electricity-access
```
