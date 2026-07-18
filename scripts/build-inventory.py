#!/usr/bin/env python3
"""Rebuild docs/INVENTARIO_164.{json,md} from graphic-catalog + chapter configs + library map."""
from __future__ import annotations
import json
from pathlib import Path
from datetime import date
from collections import Counter
from itertools import groupby

ROOT = Path(__file__).resolve().parents[1]
ATLAS = Path.home() / "atlas-global-development"

LIBRARY = {
    "access_electricity_regions": {
        "pattern": "regions-small-multiples",
        "version": "0.5",
        "motion": "opacity 1s + particles",
        "demo": "library/regions-small-multiples/demo.html",
        "story": "stories/electricity-access/",
        "tier": "A-animated",
    },
    "access_electricity_population": {
        "pattern": "population-access",
        "version": "0.2",
        "motion": "opacity 2s + stack layers",
        "demo": "library/population-access/demo.html",
        "story": "stories/electricity-access/",
        "tier": "A-animated",
    },
    "access_electricity_progress": {
        "pattern": "progress-race",
        "version": "0.2",
        "motion": "dots 2015 + stems Se + gradient legend + chips + tween 2s",
        "demo": "library/progress-race/demo.html",
        "story": "stories/electricity-access/",
        "tier": "A-animated",
    },
    "access_electricity_urban_rural": {
        "pattern": "dual-line-urban-rural",
        "version": "0.2",
        "motion": "intro fade + hatch gap + dual lines (vis)",
        "demo": "library/dual-line-urban-rural/demo.html",
        "story": "stories/electricity-access/",
        "tier": "A-animated",
    },
    "access_electricity_urban_rural_countries": {
        "pattern": "dual-line-urban-rural",
        "version": "0.2",
        "motion": "countries ETH/NGA/COD hatch dual-line",
        "demo": "library/dual-line-urban-rural/demo-countries.html",
        "story": "stories/electricity-access/",
        "tier": "A-animated",
    },
    "hexmap_nigeria": {
        "pattern": "nightlights-hexmap",
        "version": "0.2",
        "motion": "Mapbox H3 vector tiles + scene layers/bounds",
        "demo": "library/nightlights-hexmap/demo.html",
        "story": "stories/electricity-access/",
        "tier": "A-animated",
    },
    "hexmap_ethiopia": {
        "pattern": "nightlights-hexmap",
        "version": "0.2",
        "motion": "Mapbox H3 vector tiles rural nightlights",
        "demo": "library/nightlights-hexmap/demo.html",
        "story": "stories/electricity-access/",
        "tier": "A-animated",
    },
}

STORIES = {
    "electricity-access": {
        "title": "Access to Electricity",
        "url": "stories/electricity-access/",
        "graphics": [
            "access_electricity_regions",
            "access_electricity_population",
            "access_electricity_progress",
            "access_electricity_urban_rural",
            "access_electricity_urban_rural_countries",
            "hexmap_nigeria",
            "hexmap_ethiopia",
        ],
        "blocks_pending": [],
        "status": "complete",
    }
}


def main() -> None:
    gc = json.loads((ROOT / "docs/graphic-catalog.json").read_text())
    items = gc["items"]

    # index configs by graphic
    cfg_by_graphic = {}
    for c in (ROOT / "chapters").glob("goal_*/**/config.json"):
        try:
            d = json.loads(c.read_text())
        except Exception:
            continue
        g = d.get("graphic")
        if g:
            cfg_by_graphic[g] = (c, d)

    enriched = []
    for it in items:
        g = it.get("graphic") or ""
        cfg_path = None
        meta = {}
        if g in cfg_by_graphic:
            c, d = cfg_by_graphic[g]
            cfg_path = str(c.relative_to(ROOT))
            meta = d.get("_meta") or {}

        lib = LIBRARY.get(g)
        if lib:
            tier = "A-animated"
        elif meta.get("fidelity") == "pixel-perfect" or meta.get("approved"):
            tier = "B-approved-static"
        elif it.get("type") == "scroller":
            tier = "C-scroller-shell"
        else:
            tier = "D-bulk"

        local = (it.get("atlas") or {}).get("localOriginUrl") or ""
        if local and "127.0.0.1:8765" in local and "/en/atlas/" not in local:
            local = local.replace("http://127.0.0.1:8765/", "http://127.0.0.1:8765/en/atlas/")

        enriched.append(
            {
                "index": it.get("index"),
                "chapterId": it.get("chapterId"),
                "chapterTitle": it.get("chapterTitle"),
                "graphic": g,
                "type": it.get("type"),
                "title": it.get("title"),
                "sceneCount": it.get("sceneCount") or 0,
                "tier": tier,
                "library": lib,
                "configPath": cfg_path,
                "localOriginUrl": local,
                "liveUrl": (it.get("atlas") or {}).get("liveUrl"),
                "storySlug": (it.get("atlas") or {}).get("storySlug"),
                "fidelityMeta": meta.get("fidelity"),
                "statusMeta": meta.get("status"),
            }
        )

    def sort_key(x):
        cid = str(x["chapterId"] or "zz")
        try:
            cnum = int(cid)
        except ValueError:
            cnum = 900
        return (cnum if cid.isdigit() else 900, cid, x["index"] or 0)

    enriched.sort(key=sort_key)
    tier_c = Counter(e["tier"] for e in enriched)
    type_c = Counter(e["type"] for e in enriched)
    by_ch = Counter(e["chapterId"] for e in enriched)

    inventory = {
        "generated": str(date.today()),
        "total": len(enriched),
        "note": "Official count is 164 graphics. Not 167.",
        "tiers": {
            "A-animated": "Library + mount/updateScene motion",
            "B-approved-static": "Meta pixel-perfect; revalidate motion",
            "C-scroller-shell": "Scroller scaffold",
            "D-bulk": "Bulk / simple vis",
        },
        "counts": {
            "total": len(enriched),
            "byTier": dict(tier_c),
            "byType": dict(type_c),
            "byChapter": dict(sorted(by_ch.items(), key=lambda x: str(x[0]))),
        },
        "stories": STORIES,
        "library": LIBRARY,
        "workOrder": {
            "now": [],
            "next_story_blocks": STORIES["electricity-access"]["blocks_pending"],
        },
        "items": enriched,
    }

    (ROOT / "docs/INVENTARIO_164.json").write_text(
        json.dumps(inventory, indent=2, ensure_ascii=False) + "\n"
    )

    lines = [
        "# Inventario ordenado — 164 gráficos Atlas",
        "",
        f"**Fecha:** {date.today()}  ",
        "**Total canónico: 164** (fuentes alineadas: all_visualizations · graphic-catalog · chapters · gallery).",
        "",
        "## Conteos",
        "",
        "| Métrica | N |",
        "|---------|---|",
        f"| Total | **{len(enriched)}** |",
        f"| Scroller | {type_c.get('scroller', 0)} |",
        f"| Vis | {type_c.get('vis', 0)} |",
        f"| **A — animated** | **{tier_c.get('A-animated', 0)}** |",
        f"| B — approved static | {tier_c.get('B-approved-static', 0)} |",
        f"| C — scroller shell | {tier_c.get('C-scroller-shell', 0)} |",
        f"| D — bulk | {tier_c.get('D-bulk', 0)} |",
        "",
        "## Tiers",
        "",
        "| Tier | Significado |",
        "|------|-------------|",
        "| A-animated | Library con motion real |",
        "| B-approved-static | Meta PP; re-QA |",
        "| C-scroller-shell | Scroller genérico |",
        "| D-bulk | Scaffold / vis simple |",
        "",
        "## Story en curso",
        "",
        "| Story | Vivos | Siguiente |",
        "|-------|-------|-----------|",
        "| [electricity-access](../stories/electricity-access/) | **7/7 complete** | — |",
        "",
        "## Librería",
        "",
        "| Patrón | Graphic | Motion |",
        "|--------|---------|--------|",
    ]
    for g, lib in LIBRARY.items():
        lines.append(
            f"| `{lib['pattern']}` v{lib['version']} | `{g}` | {lib['motion']} |"
        )
    lines += ["", "## Orden por capítulo", ""]

    for cid, group in groupby(enriched, key=lambda x: x["chapterId"]):
        group = list(group)
        title = group[0].get("chapterTitle") or cid
        lines.append(f"### {cid} — {title} ({len(group)})")
        lines.append("")
        lines.append("| # | graphic | type | scenes | tier |")
        lines.append("|---|---------|------|--------|------|")
        for e in group:
            flag = f" · `{e['library']['pattern']}`" if e.get("library") else ""
            lines.append(
                f"| {e['index']} | `{e['graphic']}` | {e['type']} | {e['sceneCount'] or '—'} | {e['tier']}{flag} |"
            )
        lines.append("")

    lines += [
        "## Cómo avanzar",
        "",
        "1. Cerrar story electricity (progress → …).",
        "2. Cada patrón nuevo → `library/` + demo + `updateScene`.",
        "3. Marcar A-animated en este inventario (`LIBRARY` map en el script).",
        "4. No reabrir bulk 164 hasta 1–2 stories sólidas.",
        "",
        "```bash",
        "python3 scripts/build-inventory.py",
        "```",
        "",
    ]
    (ROOT / "docs/INVENTARIO_164.md").write_text("\n".join(lines) + "\n")
    print(f"OK total={len(enriched)} tiers={dict(tier_c)}")


if __name__ == "__main__":
    main()
