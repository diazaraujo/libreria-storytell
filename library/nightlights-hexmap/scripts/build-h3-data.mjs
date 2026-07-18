/**
 * Build H3 res-6 GeoJSON for Nigeria / Ethiopia nightlights maps.
 *
 * Uses Uber H3 indexing API:
 *   polygonToCells(poly, 6)
 *   cellToBoundary(id, true)  // GeoJSON [lng,lat]
 *   isValidCell(id)
 *
 * Docs: https://h3geo.org/docs/api/indexing
 *
 * Then enriches cells via Space2Stats:
 *   POST https://space2stats.ds.io/summary_by_hexids
 *
 * Usage:
 *   node scripts/build-h3-data.mjs
 */
import h3 from "h3-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RES = 6;
const OUT = path.join(__dirname, "../data");

function bboxPolygon(west, south, east, north) {
  // H3 expects [lat, lng]
  return [
    [south, west],
    [south, east],
    [north, east],
    [north, west],
    [south, west],
  ];
}

async function fetchByHexIds(hex_ids, fields) {
  const batch = 400;
  const all = [];
  for (let i = 0; i < hex_ids.length; i += batch) {
    const chunk = hex_ids.slice(i, i + batch);
    const res = await fetch("https://space2stats.ds.io/summary_by_hexids", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hex_ids: chunk, fields }),
    });
    if (!res.ok) throw new Error(`Space2Stats ${res.status}`);
    const data = await res.json();
    all.push(...data);
    process.stdout.write(`  batch ${i / batch + 1} +${data.length}\n`);
  }
  return all;
}

function cellsToFC(rows) {
  const feats = [];
  for (const row of rows) {
    const id = row.hex_id;
    if (!id || !h3.isValidCell(id)) continue;
    const boundary = h3.cellToBoundary(id, true);
    if (
      boundary.length &&
      (boundary[0][0] !== boundary.at(-1)[0] ||
        boundary[0][1] !== boundary.at(-1)[1])
    ) {
      boundary.push(boundary[0]);
    }
    const pop = +(row.pop || 0);
    feats.push({
      type: "Feature",
      id,
      properties: {
        hex_id: id,
        nghtlgh: +(row.sum_viirs_ntl_2024 || 0),
        nghtl12: +(row.sum_viirs_ntl_2012 || 0),
        nghtl23: +(row.sum_viirs_ntl_2023 || 0),
        pop,
        rural: pop < 40000 ? 85 : pop < 120000 ? 45 : 15,
      },
      geometry: { type: "Polygon", coordinates: [boundary] },
    });
  }
  return { type: "FeatureCollection", features: feats };
}

async function build(name, west, south, east, north) {
  const cells = h3.polygonToCells(bboxPolygon(west, south, east, north), RES);
  console.log(name, "cells", cells.length, "res", RES);
  const rows = await fetchByHexIds(cells, [
    "sum_viirs_ntl_2012",
    "sum_viirs_ntl_2023",
    "sum_viirs_ntl_2024",
    "pop",
  ]);
  const fc = cellsToFC(rows);
  const out = path.join(OUT, `${name}_h3.geojson`);
  fs.writeFileSync(out, JSON.stringify(fc));
  console.log("wrote", out, fc.features.length);
}

await build("nigeria", 2.5, 4.0, 15.0, 14.0);
await build("ethiopia", 33.0, 3.3, 48.0, 15.0);
console.log("done");
