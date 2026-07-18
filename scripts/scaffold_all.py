#!/usr/bin/env python3
"""
Scaffold a replica directory for every visualization in inventory.json.

For each item:
  chapters/goal_XX/NN-graphic/
    index.html   — shell from templates/shell.html
    config.json  — Atlas config + scenes + _meta
    main.js      — stub (or copy ready implementation)
    data/        — copied CSVs when data_download matches
    README.md    — short notes

Idempotent: re-running updates config/index shell but does not overwrite
custom main.js unless --force-main.
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TEMPLATE = (ROOT / "templates" / "shell.html").read_text()

MAIN_STUB = '''/**
 * Replica implementation for: {graphic}
 * Type: {type}
 * Status: {status}
 *
 * Implement window.AtlasReplica.render(scene, ctx)
 * - scene: current scene object or null for single-vis
 * - ctx.config: full config.json
 * - ctx.chartEl: container
 * - ctx.colors: WB_COLORS
 * - ctx.Beeswarm: packing helper
 *
 * Data files (if any) live in ./data/
 * Reference ready replica: chapters/goal_17/03-spi-scroller/
 */
window.AtlasReplica = {{
  async render(scene, ctx) {{
    // TODO: implement {graphic}
    // Example: load CSV from ./data/{data_download}
    const el = ctx.chartEl;
    if (!el.querySelector(".placeholder") && !el.querySelector("svg")) {{
      // keep shell placeholder until implemented
    }}
    console.info("[scaffold]", "{graphic}", scene?.id ?? "(single vis)");
  }},
}};
'''

MAIN_SPI = '''/**
 * Ready replica: SPI scroller (#c21)
 * Opens the full implementation (self-contained) when available,
 * otherwise falls back to redirect instructions.
 */
window.AtlasReplica = {
  async render(scene, ctx) {
    // Prefer linked full implementation
    const full = new URL("../../../_ready/spi-scroller/index.html", window.location.href);
    // If we are already the full page, do nothing special.
    if (window.__SPI_FULL__) return;
    // Embed note
    const el = ctx.chartEl;
    el.innerHTML = `
      <div class="placeholder" style="border-style:solid;border-color:#016B6C33;background:#f3faf8">
        <strong style="color:#016B6C">Ready replica</strong>
        <p>This graphic has a full interactive recreation.</p>
        <p><a href="${full.href}" style="color:#0071bc;font-weight:600">Open SPI scroller →</a></p>
        <p class="hint-sm">Also at <code>~/atlas-c21-spi-scroller/index.html</code></p>
      </div>`;
  },
};
'''


def strip_html_tags_light(s: str) -> str:
    if not s:
        return ""
    s = re.sub(r"<[^>]+>", "", s)
    return s.replace("&nbsp;", " ").strip()


def fill_shell(item: dict) -> str:
    return (
        TEMPLATE.replace("{{TITLE}}", item.get("title") or item["graphic"])
        .replace("{{SUBTITLE}}", item.get("subtitle") or "")
        .replace("{{CHAPTER}}", f"{item['chapterId']} · {item['chapterTitle']}")
        .replace("{{GRAPHIC}}", item["graphic"])
        .replace("{{TYPE}}", item.get("type") or "")
        .replace("{{STATUS}}", item.get("status") or "scaffold")
        .replace("{{SCENE_COUNT}}", str(item.get("sceneCount") or 0))
    )


def copy_data_files(atlas: Path, item: dict, dest_data: Path) -> list[str]:
    copied = []
    dd = item.get("data_download")
    data_root = atlas / "data"
    if not dd:
        # try dataRef as file id json in chapter folder
        ref = item.get("dataRef")
        if isinstance(ref, str) and ref not in ("(inline)", "(inline-omitted)"):
            # search for {ref}.json
            for p in data_root.rglob(f"{ref}.json"):
                dest_data.mkdir(parents=True, exist_ok=True)
                target = dest_data / p.name
                shutil.copy2(p, target)
                copied.append(p.name)
        return copied

    # data_download can be "file.csv" or multiple?
    names = [x.strip() for x in str(dd).split(",") if x.strip()]
    for name in names:
        found = list(data_root.rglob(name))
        if not found:
            # basename only
            found = [p for p in data_root.rglob("*") if p.name == name]
        if found:
            dest_data.mkdir(parents=True, exist_ok=True)
            target = dest_data / found[0].name
            shutil.copy2(found[0], target)
            copied.append(found[0].name)
    return copied


def write_readme(item: dict, copied: list[str]) -> str:
    scenes = item.get("scenes") or []
    scene_lines = "\n".join(
        f"- `{s.get('id')}`: {strip_html_tags_light(s.get('text') or '')[:140]}"
        for s in scenes[:12]
    )
    if len(scenes) > 12:
        scene_lines += f"\n- … +{len(scenes) - 12} more"
    return f"""# {item.get('title') or item['graphic']}

| | |
|--|--|
| Chapter | **{item['chapterId']}** — {item['chapterTitle']} |
| Graphic | `{item['graphic']}` |
| Type | `{item['type']}` |
| Status | `{item['status']}` |
| Scenes | {item.get('sceneCount', 0)} |

## Description
{item.get('visdescription') or '_No description in config._'}

## Data files copied
{chr(10).join(f'- `data/{c}`' for c in copied) or '_None matched automatically. Check Atlas `data/goal_*`._'}

## Scenes
{scene_lines or '_Single-view (no scroller scenes)._'}

## Implement
1. Edit `main.js` → `window.AtlasReplica.render`
2. Use `./data/*` and `config.json`
3. Reuse `shared/beeswarm.js`, `shared/wb-colors.js`
4. When done, set `"status": "ready"` in inventory (re-run or edit)

## Original
- Config extracted from `all_visualizations.json`
- Live Atlas may differ slightly from the static build
"""


def scaffold_item(
    atlas: Path,
    item: dict,
    force_main: bool = False,
) -> Path:
    dest = ROOT / item["dir"]
    dest.mkdir(parents=True, exist_ok=True)

    # config.json
    cfg = dict(item.get("config") or {})
    cfg["_meta"] = {
        "index": item["index"],
        "chapterId": item["chapterId"],
        "chapterTitle": item["chapterTitle"],
        "dir": item["dir"],
        "status": item["status"],
        "template": item["template"],
        "reference": item.get("reference"),
    }
    # ensure scenes present
    if "scenes" not in cfg:
        cfg["scenes"] = item.get("scenes") or []
    (dest / "config.json").write_text(
        json.dumps(cfg, indent=2, ensure_ascii=False)
    )

    (dest / "index.html").write_text(fill_shell(item))

    main_path = dest / "main.js"
    if force_main or not main_path.exists():
        if item.get("graphic") == "spi_scroller":
            main_path.write_text(MAIN_SPI)
        else:
            main_path.write_text(
                MAIN_STUB.format(
                    graphic=item["graphic"],
                    type=item.get("type"),
                    status=item.get("status"),
                    data_download=item.get("data_download") or "(none)",
                )
            )

    copied = copy_data_files(atlas, item, dest / "data")
    (dest / "README.md").write_text(write_readme(item, copied))
    return dest


def link_ready_spi(atlas_c21: Path):
    ready = ROOT / "_ready" / "spi-scroller"
    ready.parent.mkdir(parents=True, exist_ok=True)
    if atlas_c21.is_dir():
        # copy latest ready files
        ready.mkdir(parents=True, exist_ok=True)
        for name in ("index.html", "data.json", "README.md"):
            src = atlas_c21 / name
            if src.exists():
                shutil.copy2(src, ready / name)
        # also embed pointer README
        (ready / "ORIGIN.txt").write_text(str(atlas_c21.resolve()) + "\n")


def build_gallery(inv: dict):
    rows = []
    for it in inv["items"]:
        href = it["dir"] + "/index.html"
        rows.append(
            f"""<tr class="status-{it['status']}">
  <td>{it['index']}</td>
  <td>{it['chapterId']}</td>
  <td>{it['chapterTitle']}</td>
  <td><code>{it['type']}</code></td>
  <td><code>{it['graphic']}</code></td>
  <td>{it['sceneCount']}</td>
  <td><span class="pill">{it['status']}</span></td>
  <td><a href="{href}">open</a></td>
  <td>{(it.get('title') or '')[:80]}</td>
</tr>"""
        )
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Atlas replicas — gallery</title>
<style>
  :root {{ font-family: system-ui, sans-serif; color: #111; }}
  body {{ margin: 24px; background: #f5f6f8; }}
  h1 {{ margin: 0 0 6px; font-size: 1.4rem; }}
  .meta {{ color: #6a7781; margin-bottom: 16px; }}
  input {{ padding: 8px 12px; width: min(420px, 100%); border: 1px solid #d0d5de; border-radius: 8px; }}
  table {{ width: 100%; border-collapse: collapse; background: #fff; margin-top: 14px; font-size: 13px; }}
  th, td {{ text-align: left; padding: 8px 10px; border-bottom: 1px solid #e8eaef; vertical-align: top; }}
  th {{ position: sticky; top: 0; background: #fafbfc; font-size: 11px; text-transform: uppercase; letter-spacing: .04em; color: #6a7781; }}
  code {{ font-size: 11px; background: #eef2f7; padding: 1px 5px; border-radius: 3px; }}
  .pill {{ font-size: 11px; padding: 2px 8px; border-radius: 999px; background: #eef2f7; }}
  tr.status-ready .pill {{ background: #e5f6ea; color: #1b7a3a; }}
  tr.status-scaffold .pill {{ background: #f0f1f4; color: #5a6270; }}
  a {{ color: #0071bc; }}
  tr.hidden {{ display: none; }}
</style>
</head>
<body>
  <h1>Atlas of Global Development — replicas</h1>
  <p class="meta">{inv['total']} visualizations · {inv['byType']['scroller']} scrollers · {inv['byType']['vis']} vis · status {inv['statusCounts']}</p>
  <input id="q" type="search" placeholder="Filter by chapter, graphic, title…" />
  <table>
    <thead>
      <tr>
        <th>#</th><th>Ch</th><th>Chapter</th><th>Type</th><th>Graphic</th><th>Scenes</th><th>Status</th><th></th><th>Title</th>
      </tr>
    </thead>
    <tbody id="tb">
      {''.join(rows)}
    </tbody>
  </table>
  <script>
    const q = document.getElementById('q');
    const rows = [...document.querySelectorAll('#tb tr')];
    q.addEventListener('input', () => {{
      const s = q.value.toLowerCase();
      rows.forEach(r => {{
        r.classList.toggle('hidden', s && !r.textContent.toLowerCase().includes(s));
      }});
    }});
  </script>
</body>
</html>
"""
    (ROOT / "gallery.html").write_text(html)


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument(
        "--atlas",
        type=Path,
        default=Path.home() / "atlas-global-development",
    )
    ap.add_argument(
        "--inventory",
        type=Path,
        default=ROOT / "inventory" / "inventory.json",
    )
    ap.add_argument("--force-main", action="store_true")
    ap.add_argument(
        "--only",
        help="Only scaffold graphic name or chapter id (e.g. spi_scroller or 17)",
    )
    ap.add_argument(
        "--c21",
        type=Path,
        default=Path.home() / "atlas-c21-spi-scroller",
        help="Path to ready SPI scroller",
    )
    args = ap.parse_args()

    if not args.inventory.exists():
        raise SystemExit(
            f"Missing {args.inventory}. Run scripts/build_inventory.py first."
        )

    inv = json.loads(args.inventory.read_text())
    items = inv["items"]
    if args.only:
        key = args.only
        items = [
            i
            for i in items
            if i["graphic"] == key
            or i["chapterId"] == key
            or key in i["dir"]
        ]
        if not items:
            raise SystemExit(f"No items matched --only {key}")

    link_ready_spi(args.c21)

    n = 0
    for item in items:
        # refresh status from inventory item
        scaffold_item(args.atlas, item, force_main=args.force_main)
        n += 1

    build_gallery(inv)
    print(f"Scaffolded {n} items under {ROOT / 'chapters'}")
    print(f"Gallery: {ROOT / 'gallery.html'}")


if __name__ == "__main__":
    main()
