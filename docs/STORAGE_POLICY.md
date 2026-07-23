# Storage policy

This policy prevents new opaque or untraceable blobs without rewriting the
repository's existing history. It applies to code, datasets, captures, maps,
fonts, images, and generated outputs.

## Thresholds

| Tracked file size | Rule |
|---:|---|
| Up to 10 MiB | Normal Git is acceptable when the file belongs in the repository. |
| Over 10 MiB | The collection must be cataloged with source, license status, version/date, integrity status, sensitivity, and transformer/output paths. |
| Over 25 MiB | Maintainer review and a short storage rationale are required before adding or replacing the file. Prefer an external object store for datasets and an artifact store for generated media. |
| Over 50 MiB | Do not add a new Git blob. A documented exception is only for an already-tracked legacy file while a tested migration is pending. |
| Over 100 MiB | Hard failure; store the object outside normal Git. |

The current large GeoJSON files under `library/nightlights-hexmap/data/` are
cataloged legacy assets. This policy does not convert them, delete them, or
rewrite their history.

## Required metadata

Every dataset or asset collection must have an entry in
`docs/data-catalog.json`. Use explicit `unknown` values when evidence is absent;
never infer a license from public accessibility. For externally acquired files,
record a source revision or retrieval date and a SHA-256 manifest when the next
verified refresh occurs. Git object identity alone is not an upstream
checksum.

For any tracked file over 25 MiB, its owning catalog entry must include a
written `storage_rationale` recording maintainer review. Placeholder values
such as `unknown` do not satisfy this requirement.

Do not commit credentials, private access tokens, personal data, or restricted
data. A collection with `unknown` sensitivity must be reviewed before public
release or broader distribution.

## Choosing storage

- Use ordinary Git for small, reviewable source and configuration files.
- Consider Git LFS for stable opaque binaries only after hosting, quotas,
  archival access, and fresh-clone behavior have been tested.
- Prefer DVC or an object store with immutable checksums for versioned datasets
  and reproducible pipelines.
- Prefer CI artifacts or release assets for reproducible captures and rendered
  media that do not need to live in every clone.

This repository intentionally has no LFS filters today. Adding LFS is a
separate migration, not an automatic attribute change.

## Safe migration plan

1. Inventory tracked blobs and complete provenance and sensitivity fields.
2. Choose a backend and test authentication, quotas, retention, and offline
   failure modes in a disposable branch and a fresh clone.
3. Publish immutable objects and verify SHA-256 checksums before replacing any
   working-tree file with a pointer or fetch recipe.
4. Migrate in a dedicated, reviewed change. Do not rewrite history as part of
   routine governance work.
5. Rewrite historical blobs only through a separately approved incident or
   repository-migration plan with backups and coordination for every clone.

Run `python3 scripts/check-data-governance.py` before merging data or asset
changes.
