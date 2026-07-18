#!/usr/bin/env python3
"""Build a machine-readable catalog of every Atlas graphic + local paths."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ATLAS = Path.home() / "atlas-global-development"
OUT_JSON = ROOT / "docs" / "graphic-catalog.json"
OUT_MD = ROOT / "docs" / "graphic-catalog.md"

# story slug by chapter id (site folders)
STORY_SLUG = {
    "01": "extreme-poverty",
    "04": "learning-and-work",
    "05": "gender-and-jobs",
    "06": "water-access",
    "07": "electricity-access",
    "09": "internet-access",
    "10": "inequality",
    "11": "urban-development",
    "13": "climate",
    "16": "artificial-intelligence",
    "17": "data-for-development",
    "dashboard": "global-progress",
    "progress": "measuring-progress",
}


def find_data_files(chapter_id: str, download: str | None) -> list[str]:
    folder = ATLAS / "data" / f"goal_{chapter_id}" if chapter_id.isdigit() else ATLAS / "data" / f"goal_{chapter_id}"
    # id4d etc.
    candidates = [
        ATLAS / "data" / f"goal_{chapter_id}",
        ATLAS / "data" / f"goal{chapter_id}",
    ]
    # special folders
    special = {
        "dashboard": ATLAS / "data" / "goal_dashboard",
        "progress": ATLAS / "data" / "goal_progress",
        "id4d": ATLAS / "data" / "goal_id4d" if (ATLAS / "data" / "goal_id4d").exists() else ATLAS / "data" / "goal_99",
        "99": ATLAS / "data" / "goal_99",
    }
    if chapter_id in special:
        candidates.insert(0, special[chapter_id])

    found: list[str] = []
    for base in candidates:
        if not base.exists():
            continue
        if download:
            # exact or zip sibling
            for name in [download, download.replace(".zip", ".csv"), download.replace(".csv", ".zip")]:
                p = base / name
                if p.exists():
                    found.append(str(p.relative_to(ATLAS)))
        # always list primary data files in folder (capped)
        for p in sorted(base.iterdir()):
            if p.suffix.lower() in {".csv", ".json", ".zip", ".geojson", ".topojson"}:
                rel = str(p.relative_to(ATLAS))
                if rel not in found:
                    found.append(rel)
        break
    return found[:40]


def find_gallery_thumb(graphic: str, chapter_title: str) -> str | None:
    thumbs = ATLAS / "assets" / "images" / "gallery_thumbnails"
    if not thumbs.exists():
        return None
    g = graphic.lower().replace("_", "-")
    for p in thumbs.iterdir():
        n = p.name.lower()
        if graphic.lower() in n or g in n:
            return str(p.relative_to(ATLAS))
    return None


def main() -> None:
    inv_path = ROOT / "inventory" / "index.json"
    if not inv_path.exists():
        inv_path = ROOT / "inventory" / "inventory.json"
        items = json.loads(inv_path.read_text())["items"]
    else:
        items = json.loads(inv_path.read_text())

    catalog = []
    for it in items:
        cid = str(it.get("chapterId") or "")
        graphic = it.get("graphic") or ""
        slug = STORY_SLUG.get(cid)
        local_story = f"{slug}/" if slug and (ATLAS / slug).exists() else None
        live = f"https://data360.worldbank.org/en/atlas/{slug}/" if slug else None
        replica_dir = it.get("dir") or ""
        data_files = find_data_files(cid, it.get("data_download"))
        thumb = find_gallery_thumb(graphic, it.get("chapterTitle") or "")

        # fidelity from replica config if any
        fidelity = "unknown"
        approved = False
        cfgp = ROOT / replica_dir / "config.json" if replica_dir else None
        if cfgp and cfgp.exists():
            cfg = json.loads(cfgp.read_text())
            meta = cfg.get("_meta") or {}
            fidelity = meta.get("fidelity") or "ready"
            approved = bool(meta.get("approved"))

        catalog.append(
            {
                "index": it.get("index"),
                "chapterId": cid,
                "chapterTitle": it.get("chapterTitle"),
                "graphic": graphic,
                "type": it.get("type"),
                "title": it.get("title"),
                "sceneCount": it.get("sceneCount") or 0,
                "data_download": it.get("data_download"),
                "atlas": {
                    "storySlug": slug,
                    "localStoryPath": local_story,
                    "localOriginUrl": f"http://127.0.0.1:8765/{slug}/" if slug else None,
                    "liveUrl": live,
                    "dataFiles": data_files,
                    "galleryThumb": thumb,
                },
                "replica": {
                    "dir": replica_dir,
                    "url": f"http://127.0.0.1:8787/{replica_dir}/index.html?clean=1" if replica_dir else None,
                    "fidelity": fidelity,
                    "approved": approved,
                },
            }
        )

    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "generatedFrom": str(ATLAS),
        "total": len(catalog),
        "approvedPixelPerfect": sum(1 for c in catalog if c["replica"]["approved"]),
        "items": catalog,
    }
    OUT_JSON.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")

    # markdown summary by chapter
    lines = [
        "# Graphic catalog (Atlas mirror)",
        "",
        f"Total: **{len(catalog)}** · approved pixel-perfect: **{payload['approvedPixelPerfect']}**",
        "",
        "Origen local: `http://127.0.0.1:8765/` · Réplicas: `http://127.0.0.1:8787/`",
        "",
    ]
    by_ch: dict[str, list] = {}
    for c in catalog:
        by_ch.setdefault(c["chapterId"], []).append(c)
    for cid in sorted(by_ch, key=lambda x: (len(x), x)):
        rows = by_ch[cid]
        title = rows[0]["chapterTitle"]
        lines.append(f"## {cid} · {title} ({len(rows)})")
        lines.append("")
        for c in rows:
            badge = " ✅" if c["replica"]["approved"] else ""
            lines.append(
                f"- `{c['graphic']}`{badge} — {c['type']} · scenes {c['sceneCount']}  "
                f"· [local]({c['atlas']['localOriginUrl'] or '#'}) · [replica]({c['replica']['url'] or '#'})"
            )
        lines.append("")
    OUT_MD.write_text("\n".join(lines))
    print(f"wrote {OUT_JSON} ({len(catalog)} items)")
    print(f"wrote {OUT_MD}")


if __name__ == "__main__":
    main()
