#!/usr/bin/env python3
"""Synchronize derived quality metadata from chapter config.json files.

`chapters/**/config.json#_meta` is the sole source of truth for chapter
status, fidelity, and approval. Use --write after changing a config and
--check in CI to reject drift in derived inventories/registries.
"""

from __future__ import annotations

import argparse
import copy
import json
import re
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
VALID_STATUS = {"scaffold", "partial", "ready"}
VALID_FIDELITY = {"unverified", "tier-B-bulk", "pixel-perfect"}


def read_json(path: Path):
    return json.loads(path.read_text())


def json_text(value) -> str:
    return json.dumps(value, indent=2, ensure_ascii=False) + "\n"


def canonical_quality() -> dict[str, dict]:
    records: dict[str, dict] = {}
    indices: set[int] = set()
    for path in sorted(ROOT.glob("chapters/*/*/config.json")):
        config = read_json(path)
        meta = config.get("_meta")
        relative_dir = path.parent.relative_to(ROOT).as_posix()
        if not isinstance(meta, dict):
            raise SystemExit(f"{path}: missing _meta object")
        status = meta.get("status")
        fidelity = meta.get("fidelity")
        approved = meta.get("approved")
        index = meta.get("index")
        if status not in VALID_STATUS:
            raise SystemExit(f"{path}: invalid _meta.status {status!r}")
        if fidelity not in VALID_FIDELITY:
            raise SystemExit(f"{path}: invalid _meta.fidelity {fidelity!r}")
        if not isinstance(approved, bool):
            raise SystemExit(f"{path}: _meta.approved must be true or false")
        if approved and (status != "ready" or fidelity != "pixel-perfect"):
            raise SystemExit(
                f"{path}: approved chapters must be ready and pixel-perfect"
            )
        if meta.get("dir") != relative_dir:
            raise SystemExit(
                f"{path}: _meta.dir {meta.get('dir')!r} != {relative_dir!r}"
            )
        if not isinstance(index, int) or index in indices:
            raise SystemExit(f"{path}: _meta.index must be a unique integer")
        indices.add(index)
        records[relative_dir] = {
            "index": index,
            "status": status,
            "fidelity": fidelity,
            "approved": approved,
        }
    if len(records) != 164 or indices != set(range(164)):
        raise SystemExit(
            f"Expected 164 canonical chapter configs indexed 0..163; got {len(records)}"
        )
    return records


def quality_counts(records: dict[str, dict]) -> dict:
    statuses = Counter(record["status"] for record in records.values())
    fidelities = Counter(record["fidelity"] for record in records.values())
    return {
        "byStatus": dict(sorted(statuses.items())),
        "byFidelity": dict(sorted(fidelities.items())),
        "approved": sum(record["approved"] for record in records.values()),
    }


def assign_quality(item: dict, record: dict) -> None:
    item["status"] = record["status"]
    item["fidelity"] = record["fidelity"]
    item["approved"] = record["approved"]


def sync_index(records: dict[str, dict]) -> list:
    index = copy.deepcopy(read_json(ROOT / "inventory/index.json"))
    if len(index) != len(records):
        raise SystemExit("inventory/index.json does not contain 164 items")
    seen = set()
    for item in index:
        directory = item.get("dir")
        if directory not in records:
            raise SystemExit(f"inventory/index.json has unknown dir {directory!r}")
        assign_quality(item, records[directory])
        seen.add(directory)
    if seen != records.keys():
        raise SystemExit("inventory/index.json is missing canonical chapter dirs")
    return index


def sync_inventory(records: dict[str, dict]) -> dict:
    inventory = copy.deepcopy(read_json(ROOT / "inventory/inventory.json"))
    seen_items = set()
    for item in inventory.get("items", []):
        directory = item.get("dir")
        if directory not in records:
            raise SystemExit(f"inventory/inventory.json has unknown dir {directory!r}")
        assign_quality(item, records[directory])
        seen_items.add(directory)
    for chapter in inventory.get("chapters", []):
        for visual in chapter.get("visuals", []):
            directory = visual.get("dir")
            if directory not in records:
                raise SystemExit(
                    f"inventory/inventory.json chapter visual has unknown dir {directory!r}"
                )
            assign_quality(visual, records[directory])
    if seen_items != records.keys():
        raise SystemExit("inventory/inventory.json is missing canonical chapter dirs")
    counts = quality_counts(records)
    inventory["statusCounts"] = counts["byStatus"]
    inventory["fidelityCounts"] = counts["byFidelity"]
    inventory["approvedCount"] = counts["approved"]
    return inventory


def inventory_markdown(inventory: dict) -> str:
    lines = [
        "# Atlas of Global Development — Visualization Inventory",
        "",
        "> Derived from `chapters/**/config.json#_meta` by `scripts/sync_quality.py`.",
        "",
        f"- **Total:** {inventory['total']}",
        f"- **Scrollers:** {inventory['byType']['scroller']}",
        f"- **Vis:** {inventory['byType']['vis']}",
        f"- **Status:** `{inventory['statusCounts']}`",
        f"- **Fidelity:** `{inventory['fidelityCounts']}`",
        f"- **Approved:** {inventory['approvedCount']}",
        "",
        "`status`, `fidelity`, and `approved` are separate quality dimensions.",
        "",
    ]
    for chapter in inventory["chapters"]:
        lines.append(
            f"## {chapter['id']} — {chapter['shortTitle']} ({len(chapter['visuals'])})"
        )
        lines.extend(
            [
                "",
                "| # | Type | Graphic | Scenes | Status | Fidelity | Approved | Dir |",
                "|---|------|---------|--------|--------|----------|----------|-----|",
            ]
        )
        for visual in chapter["visuals"]:
            lines.append(
                f"| {visual['ordinal']} | `{visual['type']}` | `{visual['graphic']}` | "
                f"{visual['sceneCount']} | {visual['status']} | {visual['fidelity']} | "
                f"{'yes' if visual['approved'] else 'no'} | `{visual['dir']}` |"
            )
        lines.append("")
    return "\n".join(lines)


def sync_curated_inventory(records: dict[str, dict]) -> dict:
    document = copy.deepcopy(read_json(ROOT / "docs/INVENTARIO_164.json"))
    by_index = {record["index"]: (directory, record) for directory, record in records.items()}
    seen = set()
    for item in document.get("items", []):
        index = item.get("index")
        if index not in by_index:
            raise SystemExit(f"docs/INVENTARIO_164.json has unknown index {index!r}")
        directory, record = by_index[index]
        item["configPath"] = f"{directory}/config.json"
        item["statusMeta"] = record["status"]
        item["fidelityMeta"] = record["fidelity"]
        item["approvedMeta"] = record["approved"]
        seen.add(directory)
    if seen != records.keys():
        raise SystemExit("docs/INVENTARIO_164.json is missing canonical chapter dirs")
    document["counts"]["quality"] = quality_counts(records)
    document["qualitySource"] = "chapters/**/config.json#_meta"
    return document


def sync_approval_registry(records: dict[str, dict]) -> dict:
    registry = copy.deepcopy(read_json(ROOT / "docs/APPROVED_PIXEL_PERFECT.json"))
    seen = set()
    for item in registry.get("items", []):
        path = item.get("path")
        if path in records:
            record = records[path]
            item["status"] = record["status"]
            item["fidelity"] = record["fidelity"]
            item["approved"] = record["approved"]
            seen.add(path)
    if seen != records.keys():
        missing = sorted(records.keys() - seen)
        raise SystemExit(
            "docs/APPROVED_PIXEL_PERFECT.json is missing chapter entries: "
            + ", ".join(missing[:3])
        )
    items = registry.get("items", [])
    approved_count = sum(item.get("approved") is True for item in items)
    registry["registryCount"] = len(items)
    registry["approvedCount"] = approved_count
    registry["pixelPerfectCount"] = sum(
        item.get("fidelity") == "pixel-perfect" for item in items
    )
    registry["count"] = approved_count
    registry["chapterQualitySource"] = "chapters/**/config.json#_meta"
    registry["criteria"] = (
        "Registry of chapter and non-chapter quality records. Pixel-perfect fidelity "
        "and explicit approval are separate fields; chapter values are synchronized "
        "from config.json _meta."
    )
    return registry


def sync_legacy_meta(records: dict[str, dict]) -> dict[Path, str]:
    """Keep optional legacy meta.json quality fields aligned with config _meta."""

    generated: dict[Path, str] = {}
    for directory, record in records.items():
        path = ROOT / directory / "meta.json"
        if not path.is_file():
            continue
        document = copy.deepcopy(read_json(path))
        document["fidelity"] = record["fidelity"]
        document["approved"] = record["approved"]
        if not record["approved"]:
            document.pop("approvedAt", None)
        generated[path] = json_text(document)
    return generated


def replace_once(text: str, pattern: str, replacement: str, label: str) -> str:
    updated, count = re.subn(pattern, replacement, text, flags=re.MULTILINE)
    if count != 1:
        raise SystemExit(f"{label}: expected one summary match, found {count}")
    return updated


def sync_human_summaries(
    records: dict[str, dict], registry: dict
) -> dict[Path, str]:
    """Refresh the explicit quality claims in maintained Markdown documents."""

    counts = quality_counts(records)
    statuses = counts["byStatus"]
    fidelities = counts["byFidelity"]
    total = len(records)
    ready = statuses.get("ready", 0)
    pixel = fidelities.get("pixel-perfect", 0)
    tier_b = fidelities.get("tier-B-bulk", 0)
    unverified = fidelities.get("unverified", 0)
    approved = counts["approved"]
    registry_total = registry["registryCount"]
    registry_approved = registry["approvedCount"]
    non_chapter_approved = registry_approved - approved

    readme_path = ROOT / "README.md"
    readme = readme_path.read_text()
    readme = replace_once(readme, r"^\| Total \|.*$", f"| Total | **{total}** visualizaciones |", "README Total")
    readme = replace_once(readme, r"^\| \*\*Status.*$", f"| **Status** | **{ready}** ready |", "README status")
    readme = replace_once(
        readme,
        r"^\| \*\*Fidelity\*\* \|.*$",
        f"| **Fidelity** | **{pixel}** pixel-perfect · **{tier_b}** tier-B-bulk · **{unverified}** unverified |",
        "README fidelity",
    )
    readme = replace_once(
        readme,
        r"^\| \*\*Approved\*\* \|.*$",
        f"| **Approved** | **{approved}** capítulos con aprobación explícita |",
        "README approved",
    )

    inventory_path = ROOT / "docs/INVENTARIO_164.md"
    inventory = inventory_path.read_text()
    replacements = {
        r"^\| Status ready \|.*$": f"| Status ready | **{ready}** |",
        r"^\| Fidelity pixel-perfect \|.*$": f"| Fidelity pixel-perfect | **{pixel}** |",
        r"^\| Fidelity tier-B-bulk \|.*$": f"| Fidelity tier-B-bulk | **{tier_b}** |",
        r"^\| Fidelity unverified \|.*$": f"| Fidelity unverified | **{unverified}** |",
        r"^\| Approved \|.*$": f"| Approved | **{approved}** |",
    }
    for pattern, replacement in replacements.items():
        inventory = replace_once(inventory, pattern, replacement, "INVENTARIO_164")

    approval_path = ROOT / "docs/APPROVED_PIXEL_PERFECT.md"
    approval = approval_path.read_text()
    approval = replace_once(
        approval,
        r"^\*\*\d+ registros\*\* en el registry; \*\*\d+ aprobados pixel-perfect\*\*\.$",
        f"**{registry_total} registros** en el registry; **{registry_approved} aprobados pixel-perfect**.",
        "APPROVED registry summary",
    )
    approval = replace_once(
        approval,
        r"^Para capítulos, .*?$",
        f"Para capítulos, `chapters/**/config.json#_meta` es la fuente canónica: {approved} están aprobados pixel-perfect, {tier_b} son `tier-B-bulk` no aprobados y {unverified} permanecen `unverified`. Los otros {non_chapter_approved} aprobados son heroes/librerías/artefactos no-capítulo. Las secciones inferiores conservan todos los candidatos del registry; consulta `approved` y `fidelity` en el JSON para el estado vigente de cada uno.",
        "APPROVED chapter summary",
    )
    approval = replace_once(
        approval,
        r"^- \*\*\d+/\d+\*\* rutas de capítulo registradas.*$",
        f"- **{total}/{total}** rutas de capítulo registradas; **{ready}/{total}** tienen `status: ready` y **{approved}/{total}** aprobación explícita.",
        "APPROVED coverage",
    )

    pixel_path = ROOT / "docs/PIXEL_PERFECT.md"
    pixel_doc = pixel_path.read_text()
    pixel_doc = replace_once(
        pixel_doc,
        r"^El registry contiene .*?$",
        f"El registry contiene **{registry_total} registros**. Actualmente **{registry_approved}** tienen `fidelity: pixel-perfect` y `approved: true`: **{approved} capítulos** cuya fuente canónica es `config.json#_meta`, más **{non_chapter_approved}** heroes/librerías/artefactos no-capítulo. `fidelity` y `approved` son campos distintos, aunque la política exige pixel-perfect para aprobar.",
        "PIXEL_PERFECT registry summary",
    )
    pixel_replacements = {
        r"^\| `status: ready` \|.*$": f"| `status: ready` | {ready} |",
        r"^\| `fidelity: pixel-perfect`, `approved: true` \|.*$": f"| `fidelity: pixel-perfect`, `approved: true` | {pixel} |",
        r"^\| `fidelity: tier-B-bulk`, `approved: false` \|.*$": f"| `fidelity: tier-B-bulk`, `approved: false` | {tier_b} |",
        r"^\| `fidelity: unverified`, `approved: false` \|.*$": f"| `fidelity: unverified`, `approved: false` | {unverified} |",
    }
    for pattern, replacement in pixel_replacements.items():
        pixel_doc = replace_once(pixel_doc, pattern, replacement, "PIXEL_PERFECT")

    return {
        readme_path: readme,
        inventory_path: inventory,
        approval_path: approval,
        pixel_path: pixel_doc,
    }


def targets(records: dict[str, dict]) -> dict[Path, str]:
    inventory = sync_inventory(records)
    registry = sync_approval_registry(records)
    generated = {
        ROOT / "inventory/index.json": json_text(sync_index(records)),
        ROOT / "inventory/inventory.json": json_text(inventory),
        ROOT / "inventory/inventory.md": inventory_markdown(inventory).rstrip() + "\n",
        ROOT / "docs/INVENTARIO_164.json": json_text(
            sync_curated_inventory(records)
        ),
        ROOT / "docs/APPROVED_PIXEL_PERFECT.json": json_text(registry),
    }
    generated.update(sync_legacy_meta(records))
    generated.update(sync_human_summaries(records, registry))
    return generated


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--check", action="store_true", help="fail if derived files drift")
    mode.add_argument("--write", action="store_true", help="rewrite derived files")
    args = parser.parse_args()

    records = canonical_quality()
    expected = targets(records)
    drift = [path for path, text in expected.items() if path.read_text() != text]
    if args.check:
        if drift:
            names = "\n  ".join(str(path.relative_to(ROOT)) for path in drift)
            raise SystemExit(
                "Quality metadata drift detected. Run "
                "`python3 scripts/sync_quality.py --write`:\n  " + names
            )
        print(f"Quality metadata OK: {len(records)} canonical chapters, no drift")
        return

    for path, text in expected.items():
        path.write_text(text)
    counts = quality_counts(records)
    print(
        f"Synchronized {len(records)} chapters: "
        f"status={counts['byStatus']} fidelity={counts['byFidelity']} "
        f"approved={counts['approved']}"
    )


if __name__ == "__main__":
    main()
