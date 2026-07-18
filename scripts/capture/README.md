# Automated video capture

Record Atlas visualizations **without manual screen recording**.

## Setup (once)

```bash
cd /Users/diazaraujo/atlas-replicas/scripts/capture
npm install
npx playwright install chromium
```

## 1) Record local replicas (per graphic)

Start the gallery server:

```bash
cd /Users/diazaraujo/atlas-replicas
python3 -m http.server 8787
```

Capture:

```bash
cd scripts/capture

# list what would be recorded
node capture.mjs --list
node capture.mjs --status ready --list

# only ready implementations
node capture.mjs --status ready

# one graphic
node capture.mjs --only spi_scroller --seconds 30

# one chapter
node capture.mjs --only 17 --seconds 20

# first 5 items (smoke test)
node capture.mjs --limit 5 --seconds 8
```

Outputs:

```
recordings/
  17/003_17_spi-scroller/
    capture.webm
    capture.mp4
    meta.json
  manifest-replica.json
  index.html          # watch all videos
```

## 2) Record live Atlas chapters (full story scroll)

One video per published chapter (auto-scroll):

```bash
node capture.mjs --target atlas --list
node capture.mjs --target atlas --only data-for-development --seconds 50
node capture.mjs --target atlas --limit 3 --seconds 40
```

Videos land in `recordings/_atlas_chapters/<slug>/`.

## Tips

| Goal | Flag |
|------|------|
| Faster draft | `--seconds 8 --no-mp4` |
| Higher quality stills later | keep `.webm` |
| Debug interaction | `--headed` |
| Only finished replicas | `--status ready` |

## Limits

- **Scaffolds** without real `main.js` will record mostly empty shells — prefer `--status ready` until more are implemented.
- **Live Atlas** records whole chapters (scroll), not isolated `#c21` hashes (hard to deep-link every graphic).
- **Interactive** charts: only a few are scripted (e.g. `draw_your_chart` auto-draws). Others hold a static view unless you extend `playReplica()`.
- Full 164 × ~15s ≈ 40+ minutes and multi‑GB disk — run in batches with `--only` / `--limit`.

## Through the agent

You can ask:

- “Graba todas las ready”
- “Graba el capítulo 17”
- “Graba atlas live data-for-development 45s”

The agent runs `node capture.mjs …` and reports paths under `recordings/`.
