#!/usr/bin/env python3
"""
Build inventory of all Atlas of Global Development visualizations.

Reads from a local clone of:
  https://github.com/worldbank/atlas-global-development

Outputs:
  inventory/inventory.json  — machine-readable catalog
  inventory/inventory.md    — human-readable catalog
  inventory/by-graphic.json — index graphic name → items
"""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter, defaultdict
from pathlib import Path


def slug(s: str, max_len: int = 60) -> str:
    s = re.sub(r"[^a-zA-Z0-9]+", "-", (s or "untitled").lower()).strip("-")
    return (s[:max_len] or "untitled")


def chapter_data_folder(data_root: Path, ch: str) -> str | None:
    candidates = [f"goal_{ch}", ch]
    if ch.isdigit():
        candidates.append(f"goal_{int(ch):02d}")
    for name in candidates:
        if (data_root / name).is_dir():
            return name
    for p in data_root.iterdir():
        if p.is_dir() and ch in p.name:
            return p.name
    return None


def scene_summary(scenes: list) -> list[dict]:
    out = []
    for s in scenes or []:
        if not isinstance(s, dict):
            continue
        out.append(
            {
                "id": s.get("id"),
                "text": s.get("text"),
                "translationPrefix": s.get("translationPrefix"),
            }
        )
    return out


def build(atlas_root: Path) -> dict:
    data_root = atlas_root / "data"
    viz = json.loads((data_root / "all_visualizations.json").read_text())
    cfg = json.loads((data_root / "chapter_configs.json").read_text())

    data_files: dict[str, list[str]] = defaultdict(list)
    for p in data_root.rglob("*"):
        if p.is_file() and p.suffix.lower() in {
            ".csv",
            ".json",
            ".zip",
            ".geojson",
            ".topojson",
            ".tsv",
        }:
            rel = str(p.relative_to(data_root))
            data_files[p.parent.name].append(rel)

    chapters = []
    items = []
    idx = 0

    def sort_key(x: str):
        if x.isdigit():
            return (0, int(x))
        return (1, x)

    for ch in sorted(viz.keys(), key=sort_key):
        langs = viz[ch]
        en = langs.get("en") if isinstance(langs, dict) else None
        if not isinstance(en, list):
            continue

        cinfo = cfg.get(ch, {})
        if isinstance(cinfo, dict) and "en" in cinfo:
            cinfo = cinfo["en"]
        if not isinstance(cinfo, dict):
            cinfo = {}

        folder = f"goal_{ch}"
        actual = chapter_data_folder(data_root, ch)
        chapter = {
            "id": ch,
            "shortTitle": cinfo.get("shortTitle") or cinfo.get("title") or ch,
            "title": cinfo.get("title") or "",
            "folder": folder,
            "dataFolder": actual,
            "dataFiles": sorted(data_files.get(actual or "", [])),
            "visuals": [],
        }

        seen: Counter = Counter()
        for i, v in enumerate(en):
            g = v.get("graphic") or f"graphic_{i}"
            seen[g] += 1
            suffix = f"-{seen[g]}" if seen[g] > 1 else ""
            dir_name = f"{i:02d}-{slug(g)}{suffix}"
            scenes = v.get("scenes") or []

            data_ref = v.get("data")
            if data_ref is not None and not isinstance(data_ref, str):
                data_ref = "(inline)"

            # Lightweight config copy (no huge inline tables)
            config_keys = [
                k
                for k in v.keys()
                if k
                not in {
                    # keep scenes separately; data blobs may be huge
                }
            ]
            config = {}
            for k in config_keys:
                val = v[k]
                if k == "data" and not isinstance(val, str):
                    config[k] = "(inline-omitted)"
                else:
                    config[k] = val

            item = {
                "index": idx,
                "chapterId": ch,
                "chapterTitle": chapter["shortTitle"],
                "ordinal": i,
                "type": v.get("type"),
                "graphic": g,
                "title": v.get("title") or "",
                "subtitle": v.get("subtitle") or "",
                "sceneCount": len(scenes),
                "scenes": scene_summary(scenes),
                "data_download": v.get("data_download"),
                "dataRef": data_ref,
                "visSize": v.get("visSize"),
                "source": v.get("source"),
                "visdescription": v.get("visdescription"),
                "dir": f"chapters/{folder}/{dir_name}",
                "status": "ready" if g == "spi_scroller" else "scaffold",
                "template": "scroller" if v.get("type") == "scroller" else "vis",
                "reference": "atlas-c21-spi-scroller" if g == "spi_scroller" else None,
                "config": config,
            }
            items.append(item)
            chapter["visuals"].append(
                {k: item[k] for k in item if k != "config"}
            )
            # store full config only on items for scaffolding
            idx += 1

        chapters.append(chapter)

    by_graphic: dict[str, list] = defaultdict(list)
    for it in items:
        by_graphic[it["graphic"]].append(
            {
                "index": it["index"],
                "chapterId": it["chapterId"],
                "dir": it["dir"],
                "title": it["title"],
            }
        )

    return {
        "generatedFrom": "worldbank/atlas-global-development",
        "atlasPath": str(atlas_root.resolve()),
        "total": len(items),
        "byType": {
            "scroller": sum(1 for i in items if i["type"] == "scroller"),
            "vis": sum(1 for i in items if i["type"] == "vis"),
        },
        "statusCounts": dict(Counter(i["status"] for i in items)),
        "chapters": chapters,
        "items": items,
        "byGraphic": dict(by_graphic),
    }


def to_markdown(inv: dict) -> str:
    lines = [
        "# Atlas of Global Development — Visualization Inventory",
        "",
        f"- **Total:** {inv['total']}",
        f"- **Scrollers:** {inv['byType']['scroller']}",
        f"- **Vis (static/interactive single):** {inv['byType']['vis']}",
        f"- **Status:** `{inv['statusCounts']}`",
        f"- **Source clone:** `{inv.get('atlasPath','')}`",
        "",
        "Statuses: `scaffold` (stub ready to implement) · `partial` · `ready` (working replica).",
        "",
    ]
    for ch in inv["chapters"]:
        lines.append(f"## {ch['id']} — {ch['shortTitle']} ({len(ch['visuals'])})")
        if ch.get("title"):
            lines.append(f"*{ch['title']}*")
        lines.append("")
        lines.append("| # | Type | Graphic | Scenes | Status | Dir |")
        lines.append("|---|------|---------|--------|--------|-----|")
        for v in ch["visuals"]:
            lines.append(
                f"| {v['ordinal']} | `{v['type']}` | `{v['graphic']}` | {v['sceneCount']} | {v['status']} | `{v['dir']}` |"
            )
        lines.append("")
    return "\n".join(lines)


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument(
        "--atlas",
        type=Path,
        default=Path.home() / "atlas-global-development",
        help="Path to atlas-global-development clone",
    )
    ap.add_argument(
        "--out",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "inventory",
        help="Output directory",
    )
    args = ap.parse_args()

    if not (args.atlas / "data" / "all_visualizations.json").exists():
        raise SystemExit(
            f"Atlas data not found at {args.atlas}. Clone:\n"
            "  git clone --depth 1 https://github.com/worldbank/atlas-global-development.git"
        )

    inv = build(args.atlas)
    args.out.mkdir(parents=True, exist_ok=True)

    # Slim inventory for chapters (without full config bloat in MD)
    inv_path = args.out / "inventory.json"
    inv_path.write_text(json.dumps(inv, indent=2, ensure_ascii=False))
    (args.out / "inventory.md").write_text(to_markdown(inv))
    (args.out / "by-graphic.json").write_text(
        json.dumps(inv["byGraphic"], indent=2, ensure_ascii=False)
    )

    # Lightweight index for gallery
    index = [
        {
            "index": i["index"],
            "chapterId": i["chapterId"],
            "chapterTitle": i["chapterTitle"],
            "type": i["type"],
            "graphic": i["graphic"],
            "title": i["title"],
            "sceneCount": i["sceneCount"],
            "status": i["status"],
            "dir": i["dir"],
        }
        for i in inv["items"]
    ]
    (args.out / "index.json").write_text(json.dumps(index, indent=2, ensure_ascii=False))

    print(f"Wrote {inv_path} ({inv['total']} items)")
    print(f"  scrollers={inv['byType']['scroller']} vis={inv['byType']['vis']}")
    print(f"  status={inv['statusCounts']}")


if __name__ == "__main__":
    main()
