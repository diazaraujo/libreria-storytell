/* Client-error telemetry. On any uncaught error or promise rejection,
 * beacon a compact report to /api/telemetry (present on staging deploys;
 * on local dev the beacon 404s silently and costs nothing). */
(function initTelemetry() {
  "use strict";
  var MAX_REPORTS = 10;
  var sent = 0;

  function report(kind, message, source) {
    if (sent >= MAX_REPORTS) return;
    sent += 1;
    var payload = JSON.stringify({
      kind: kind,
      message: String(message).slice(0, 500),
      source: String(source || "").slice(0, 200),
      page: location.pathname,
      ua: navigator.userAgent.slice(0, 120),
      ts: new Date().toISOString(),
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/telemetry", payload);
    }
  }

  window.addEventListener("error", function (event) {
    report("error", event.message, event.filename + ":" + event.lineno);
  });
  window.addEventListener("unhandledrejection", function (event) {
    report("unhandledrejection", event.reason && event.reason.message || event.reason);
  });
})();
