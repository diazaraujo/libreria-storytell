#!/usr/bin/env bash
# Optional: live screenshots of every Atlas story via Firecrawl.
# Requires FIRECRAWL_API_KEY or scripts/capture/.env
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT/scripts/capture"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

if [[ -z "${FIRECRAWL_API_KEY:-}" ]]; then
  echo "Set FIRECRAWL_API_KEY or create scripts/capture/.env"
  exit 1
fi

SLUGS=(
  extreme-poverty water-access electricity-access internet-access
  data-for-development inequality learning-and-work gender-and-jobs
  urban-development climate artificial-intelligence global-progress
  measuring-progress
)

for s in "${SLUGS[@]}"; do
  echo "=== Firecrawl $s ==="
  node firecrawl-api.mjs scrape "$s" || echo "WARN: failed $s"
done

echo "Done → $ROOT/recordings/firecrawl/"
echo "open http://127.0.0.1:8787/recordings/firecrawl/"
