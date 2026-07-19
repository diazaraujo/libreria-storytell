#!/usr/bin/env bash
# Start local stack for atlas-replicas / libreria-storytell
#   :8787  static replicas (gallery, chapters, library)
#   :8765  Atlas origin mirror (optional)
#   :8790  Mapbox proxy for private mlambrechts.* tiles
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ATLAS_SRC="${ATLAS_SRC:-$HOME/atlas-global-development}"
ATLAS_SERVE="${ATLAS_SERVE:-$HOME/atlas-serve}"

kill_port() {
  local p="$1"
  if lsof -ti :"$p" >/dev/null 2>&1; then
    lsof -ti :"$p" | xargs kill 2>/dev/null || true
    sleep 0.3
  fi
}

start_one() {
  local port="$1" dir="$2" name="$3"
  kill_port "$port"
  (cd "$dir" && nohup python3 -m http.server "$port" >"/tmp/atlas-${name}.log" 2>&1 &)
  echo "started $name :$port  (log /tmp/atlas-${name}.log)"
}

echo "== atlas-replicas dev servers =="

# replicas
start_one 8787 "$ROOT" "replicas"

# origin mirror
mkdir -p "$ATLAS_SERVE/en"
if [[ ! -e "$ATLAS_SERVE/en/atlas" ]]; then
  ln -sfn "$ATLAS_SRC" "$ATLAS_SERVE/en/atlas"
fi
if [[ -d "$ATLAS_SERVE/en/atlas" ]]; then
  start_one 8765 "$ATLAS_SERVE" "origin"
else
  echo "skip origin (missing $ATLAS_SRC)"
fi

# mapbox proxy
kill_port 8790
(cd "$ROOT/library/nightlights-hexmap" && nohup python3 mapbox-proxy.py >"/tmp/atlas-mapbox-proxy.log" 2>&1 &)
echo "started mapbox-proxy :8790  (log /tmp/atlas-mapbox-proxy.log)"

sleep 0.6
echo
echo "health:"
curl -s -o /dev/null -w "  8787 gallery-atlas %{http_code}\n" "http://127.0.0.1:8787/gallery-atlas.html" || true
curl -s -o /dev/null -w "  8765 origin       %{http_code}\n" "http://127.0.0.1:8765/en/atlas/" || true
curl -s "http://127.0.0.1:8790/health" 2>/dev/null | sed 's/^/  8790 proxy       /' || echo "  8790 proxy       down"
echo
echo "open: http://127.0.0.1:8787/gallery-atlas.html"
echo "      http://127.0.0.1:8787/stories/electricity-access/"
echo "      http://127.0.0.1:8787/library/nightlights-hexmap/demo.html"
