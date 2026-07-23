#!/usr/bin/env bash
# Sync World Bank Atlas production build to local disk.
set -euo pipefail

ATLAS="${ATLAS_PATH:-$HOME/atlas-global-development}"
REPO="${ATLAS_REPO:-https://github.com/worldbank/atlas-global-development.git}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
FORCE_RESET=0

if [[ "${1:-}" == "--force-reset" ]]; then
  FORCE_RESET=1
  shift
fi
if [[ $# -ne 0 ]]; then
  echo "Usage: $0 [--force-reset]" >&2
  exit 2
fi

echo "==> Atlas mirror"
echo "    path: $ATLAS"

if [[ ! -d "$ATLAS/.git" ]]; then
  echo "==> Cloning $REPO"
  git clone --depth 1 "$REPO" "$ATLAS"
else
  echo "==> git pull --ff-only"
  if ! git -C "$ATLAS" pull --ff-only; then
    if [[ "$FORCE_RESET" -ne 1 ]]; then
      echo "Fast-forward pull failed; mirror was not reset." >&2
      echo "Re-run with --force-reset only if discarding local mirror changes is intended." >&2
      exit 1
    fi
    echo "==> Explicitly resetting mirror to origin/main"
    git -C "$ATLAS" fetch --depth 1 origin main
    git -C "$ATLAS" reset --hard origin/main
  fi
fi

echo "==> Size: $(du -sh "$ATLAS" | awk '{print $1}')"
echo "==> HEAD: $(git -C "$ATLAS" log -1 --oneline)"

echo "==> Rebuild inventory"
python3 "$ROOT/scripts/build_inventory.py" --atlas "$ATLAS" --out "$ROOT/inventory" 2>/dev/null \
  || python3 "$ROOT/scripts/build_inventory.py" --atlas "$ATLAS" --out "$ROOT/inventory"
python3 "$ROOT/scripts/sync_quality.py" --write

echo "==> Graphic catalog"
python3 "$ROOT/scripts/mirror/build-graphic-catalog.py"

echo ""
echo "Serve origin locally:"
echo "  cd $ATLAS && python3 -m http.server 8765"
echo "  open http://127.0.0.1:8765/"
echo ""
echo "Serve replicas:"
echo "  cd $ROOT && python3 -m http.server 8787"
echo "  open http://127.0.0.1:8787/_ready/all-chapters.html"
