#!/usr/bin/env python3
"""Re-apply templates/shell.html to every chapter scaffold (keeps main.js + data)."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEMPLATE = (ROOT / "templates" / "shell.html").read_text()
INV = json.loads((ROOT / "inventory" / "inventory.json").read_text())


def family_of(graphic: str, typ: str) -> str:
    g = (graphic or "").lower()
    if "beeswarm" in g or g in {"spi_scroller", "pay_beeswarm", "sdg5_wage_gap_beeswarm"}:
        return "beeswarm"
    if "waffle" in g:
        return "waffle"
    if "scatter" in g:
        return "scatter"
    if "map" in g or "hexmap" in g:
        return "map"
    if g == "image" or g.startswith("image"):
        return "image"
    if "draw_your" in g or "line" in g or "trend" in g:
        return "line"
    if typ == "scroller":
        return "scroller"
    return "vis"


def fill(item: dict) -> str:
    return (
        TEMPLATE.replace("{{TITLE}}", item.get("title") or item["graphic"])
        .replace("{{SUBTITLE}}", item.get("subtitle") or "")
        .replace("{{CHAPTER}}", f"{item['chapterId']} · {item['chapterTitle']}")
        .replace("{{GRAPHIC}}", item["graphic"])
        .replace("{{TYPE}}", item.get("type") or "")
        .replace("{{STATUS}}", item.get("status") or "scaffold")
        .replace("{{SCENE_COUNT}}", str(item.get("sceneCount") or 0))
        .replace(
            "{{FAMILY}}",
            family_of(item.get("graphic") or "", item.get("type") or ""),
        )
    )


def main():
    n = 0
    for item in INV["items"]:
        dest = ROOT / item["dir"] / "index.html"
        if not dest.parent.exists():
            continue
        dest.write_text(fill(item))
        n += 1
    print(f"Refreshed {n} index.html shells with component kit")


if __name__ == "__main__":
    main()
