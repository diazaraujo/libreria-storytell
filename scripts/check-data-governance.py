#!/usr/bin/env python3
"""Validate catalog metadata and large tracked files without reading datasets."""

from __future__ import annotations

import fnmatch
import json
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CATALOG_PATH = ROOT / "docs" / "data-catalog.json"
ATTRIBUTES_PATH = ROOT / ".gitattributes"
MIB = 1024 * 1024


def fail(message: str, errors: list[str]) -> None:
    errors.append(message)


def tracked_files(errors: list[str]) -> list[str]:
    process = subprocess.run(
        ["git", "ls-files", "-z"],
        cwd=ROOT,
        check=False,
        capture_output=True,
    )
    if process.returncode:
        fail("git ls-files failed; run this check inside the repository", errors)
        return []
    return [item.decode("utf-8", "surrogateescape") for item in process.stdout.split(b"\0") if item]


def matches(path: str, patterns: list[str]) -> bool:
    return any(fnmatch.fnmatchcase(path, pattern) for pattern in patterns)


def explicit_storage_rationale(value: object) -> bool:
    if not isinstance(value, str):
        return False
    normalized = value.strip().lower()
    return bool(normalized) and normalized not in {
        "unknown", "not-reviewed", "not reviewed", "not-applicable",
        "n/a", "todo", "tbd",
    }


def main() -> int:
    errors: list[str] = []
    warnings: list[str] = []

    try:
        catalog = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        print(f"ERROR: cannot load {CATALOG_PATH.relative_to(ROOT)}: {exc}", file=sys.stderr)
        return 1

    policy = catalog.get("storage_policy", {})
    warn_bytes = policy.get("catalog_required_over_bytes", 10 * MIB)
    review_bytes = policy.get("review_required_over_bytes", 25 * MIB)
    reject_bytes = policy.get("reject_uncatalogued_over_bytes", 50 * MIB)
    hard_bytes = policy.get("hard_limit_bytes", 100 * MIB)
    thresholds = {
        "catalog_required_over_bytes": warn_bytes,
        "review_required_over_bytes": review_bytes,
        "reject_uncatalogued_over_bytes": reject_bytes,
        "hard_limit_bytes": hard_bytes,
    }
    for name, value in thresholds.items():
        if type(value) is not int or value <= 0:
            fail(f"storage_policy.{name} must be a positive integer", errors)
    if all(type(value) is int and value > 0 for value in thresholds.values()):
        if not warn_bytes < review_bytes < reject_bytes < hard_bytes:
            fail(
                "storage thresholds must increase: catalog < review < reject < hard limit",
                errors,
            )
    else:
        warn_bytes, review_bytes, reject_bytes, hard_bytes = (
            10 * MIB, 25 * MIB, 50 * MIB, 100 * MIB,
        )

    collections = catalog.get("collections")
    if not isinstance(collections, list) or not collections:
        fail("catalog.collections must be a non-empty list", errors)
        collections = []

    files = tracked_files(errors)
    ids: set[str] = set()
    validated: list[tuple[dict, list[str]]] = []
    required_objects = {
        "source": ("name", "url", "version", "retrieved_at"),
        "license": ("status", "evidence"),
        "integrity": ("status",),
        "sensitivity": ("classification", "review_status"),
    }

    for index, collection in enumerate(collections):
        label = f"collections[{index}]"
        if not isinstance(collection, dict):
            fail(f"{label} must be an object", errors)
            continue
        collection_id = collection.get("id")
        if not isinstance(collection_id, str) or not collection_id:
            fail(f"{label}.id must be a non-empty string", errors)
        elif collection_id in ids:
            fail(f"duplicate collection id: {collection_id}", errors)
        else:
            ids.add(collection_id)
            label = collection_id

        patterns = collection.get("paths")
        if not isinstance(patterns, list) or not patterns or not all(isinstance(p, str) and p for p in patterns):
            fail(f"{label}.paths must be a non-empty string list", errors)
            patterns = []
        elif files and not any(matches(path, patterns) for path in files):
            fail(f"{label}.paths does not match a tracked file", errors)

        for object_name, keys in required_objects.items():
            value = collection.get(object_name)
            if not isinstance(value, dict):
                fail(f"{label}.{object_name} must be an object", errors)
                continue
            for key in keys:
                if key not in value or value[key] in (None, ""):
                    fail(f"{label}.{object_name}.{key} must be explicit (use 'unknown' if needed)", errors)

        for field in ("transformers", "outputs"):
            value = collection.get(field)
            if not isinstance(value, list) or not all(isinstance(item, str) for item in value):
                fail(f"{label}.{field} must be a string list (it may be empty)", errors)

        if not isinstance(collection.get("large_file_exception", False), bool):
            fail(f"{label}.large_file_exception must be boolean", errors)
        validated.append((collection, patterns))

    large_count = 0
    for relative in files:
        absolute = ROOT / relative
        try:
            size = absolute.lstat().st_size
        except FileNotFoundError:
            warnings.append(f"tracked path absent from the working tree and skipped: {relative}")
            continue
        except OSError as exc:
            fail(f"cannot stat tracked path {relative!r}: {exc}", errors)
            continue
        if size <= warn_bytes:
            continue
        large_count += 1
        owners = [collection for collection, patterns in validated if matches(relative, patterns)]
        if not owners:
            fail(f"tracked file over {warn_bytes // MIB} MiB is not cataloged: {relative}", errors)
            continue
        if size > review_bytes and not any(
            explicit_storage_rationale(owner.get("storage_rationale"))
            for owner in owners
        ):
            fail(
                f"tracked file over {review_bytes // MIB} MiB lacks a written storage_rationale: {relative}",
                errors,
            )
        if size > hard_bytes:
            fail(f"tracked file exceeds the {hard_bytes // MIB} MiB hard limit: {relative}", errors)
        elif size > reject_bytes:
            if not any(owner.get("large_file_exception") is True for owner in owners):
                fail(f"tracked file over {reject_bytes // MIB} MiB lacks a legacy exception: {relative}", errors)
            else:
                warnings.append(f"legacy file over {reject_bytes // MIB} MiB remains tracked: {relative}")

    try:
        attribute_lines = ATTRIBUTES_PATH.read_text(encoding="utf-8").splitlines()
    except OSError as exc:
        fail(f"cannot read .gitattributes: {exc}", errors)
        attribute_lines = []
    for number, line in enumerate(attribute_lines, start=1):
        content = line.split("#", 1)[0].strip().lower()
        if any(token in content for token in ("filter=lfs", "diff=lfs", "merge=lfs")):
            fail(f".gitattributes:{number} configures LFS; migration approval is required first", errors)

    for warning in warnings:
        print(f"WARNING: {warning}")
    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1

    print(f"PASS: {len(collections)} catalog collections validated; {large_count} tracked files exceed {warn_bytes // MIB} MiB and are cataloged")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
