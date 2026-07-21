#!/usr/bin/env bash
# Full C+B pipeline: inventory → scaffold all Atlas visualizations
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ATLAS="${ATLAS_PATH:-$HOME/atlas-global-development}"
C21="${C21_PATH:-$HOME/atlas-c21-spi-scroller}"

if [[ ! -f "$ATLAS/data/all_visualizations.json" ]]; then
  echo "Cloning Atlas static build into $ATLAS ..."
  git clone --depth 1 https://github.com/worldbank/atlas-global-development.git "$ATLAS"
fi

python3 "$ROOT/scripts/build_inventory.py" --atlas "$ATLAS" --out "$ROOT/inventory"
python3 "$ROOT/scripts/scaffold_all.py" --atlas "$ATLAS" --c21 "$C21" "$@"
python3 "$ROOT/scripts/sync_quality.py" --write

echo ""
echo "Done."
echo "  Inventory: $ROOT/inventory/inventory.md"
echo "  Gallery:   $ROOT/gallery.html"
echo "  Existing chapter files were preserved unless an explicit --write-* or --force-* flag was passed."
echo "  Serve:     cd $ROOT && python3 -m http.server 8787"
echo "  Open:      http://localhost:8787/gallery.html"
