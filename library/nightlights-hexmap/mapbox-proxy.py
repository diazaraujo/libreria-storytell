#!/usr/bin/env python3
"""
Local Mapbox tile proxy for Atlas private tilesets (mlambrechts.*).

Mapbox URL restrictions block localhost Referer. This proxy re-fetches
api.mapbox.com with Origin/Referer of data360.worldbank.org so the replica
can use the same vector tiles as HexMapNigeria / HexMapEthiopia.

Usage:
  python3 mapbox-proxy.py          # :8790
  http://127.0.0.1:8790/?u=<encoded mapbox url>
"""
from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

PORT = int(os.environ.get("MAPBOX_PROXY_PORT", "8790"))
REFERER = "https://data360.worldbank.org/"
ORIGIN = "https://data360.worldbank.org"
ALLOWED_HOSTS = ("api.mapbox.com", "events.mapbox.com")


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self):
        if self.path in ("/", "/health"):
            body = json.dumps({"ok": True, "proxy": "mapbox", "port": PORT}).encode()
            self.send_response(200)
            self._cors()
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        parsed = urllib.parse.urlparse(self.path)
        qs = urllib.parse.parse_qs(parsed.query)
        target = (qs.get("u") or qs.get("url") or [None])[0]
        if not target:
            self.send_error(400, "missing u=")
            return

        try:
            host = urllib.parse.urlparse(target).hostname or ""
        except Exception:
            self.send_error(400, "bad url")
            return

        if host not in ALLOWED_HOSTS:
            self.send_error(403, f"host not allowed: {host}")
            return

        req = urllib.request.Request(
            target,
            headers={
                "Referer": REFERER,
                "Origin": ORIGIN,
                "User-Agent": "atlas-replicas-mapbox-proxy/1.0",
            },
            method="GET",
        )
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                data = resp.read()
                ctype = resp.headers.get("Content-Type", "application/octet-stream")
                self.send_response(resp.status)
                self._cors()
                self.send_header("Content-Type", ctype)
                self.send_header("Content-Length", str(len(data)))
                self.send_header("Cache-Control", "public, max-age=3600")
                self.end_headers()
                self.wfile.write(data)
        except urllib.error.HTTPError as e:
            body = e.read() if e.fp else b""
            self.send_response(e.code)
            self._cors()
            self.send_header("Content-Type", e.headers.get("Content-Type", "text/plain"))
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        except Exception as e:
            msg = str(e).encode()
            self.send_response(502)
            self._cors()
            self.send_header("Content-Type", "text/plain")
            self.send_header("Content-Length", str(len(msg)))
            self.end_headers()
            self.wfile.write(msg)


def main():
    server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    print(f"mapbox-proxy listening on http://127.0.0.1:{PORT}", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
