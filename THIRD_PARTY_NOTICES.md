# Third-party notices

This file records third-party provenance that is visible in the repository. It
is a due-diligence aid, not a complete bill of materials and not legal advice.
It grants no additional rights. Keep upstream copyright, attribution, and
license notices with any redistributed material.

## World Bank Atlas material

The repository describes itself as a storytelling library based on the World
Bank's Atlas of Global Development and links to
`https://github.com/worldbank/atlas-global-development`. Chapter data, story
data, presentation patterns, and some assets may reproduce or derive from that
project or from the individual sources used by it.

No collection-specific license file, source revision, or retrieval date was
found in this repository. Their status is therefore recorded as `unknown` in
the data catalog. Verify the upstream project and each underlying data
provider's current terms before reuse.

## H3 JavaScript bundle

`library/nightlights-hexmap/vendor-h3/` contains bundled `h3-js` source. The
bundles include copyright notices for Uber Technologies, Inc. and state the
Apache License 2.0. The exact upstream package version is not recorded here.
Retain the embedded notices and verify the corresponding upstream release when
redistributing or replacing the bundle.

## Maps, tiles, and fonts

The night-lights component contains references to Mapbox services and private
tilesets, and a fallback carrying OpenStreetMap and CARTO attribution. Other
pages may load web fonts from Google Fonts. Service access and displayed map or
font content are governed by the relevant provider terms; a URL or runtime
dependency in this repository is not a redistribution license. Credentials or
private tile access are not included by this notice.

## Capture-tool dependencies

`scripts/capture/package-lock.json` records npm dependencies and their declared
licenses, including MIT, Apache-2.0, and ISC packages. The capture package's
`package.json` declares ISC. The lockfile is the authoritative local inventory
for exact package versions; consult each package for its complete license text
and notices.

## Dataset-level status

The machine-readable inventory is `docs/data-catalog.json`; its readable view
is `docs/DATA_CATALOG.md`. Entries deliberately say `unknown` where source,
license, date, checksum, or sensitivity evidence is missing. Resolve those
fields before publishing, sublicensing, or combining the affected material
with a product that has incompatible obligations.
