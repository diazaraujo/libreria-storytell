/** Data loaders for replica components. */
window.AtlasLoad = {
  async csv(url) {
    const text = await (await fetch(url)).text();
    const lines = text.trim().split(/\r?\n/);
    if (!lines.length) return [];
    const headers = splitCsvLine(lines[0]);
    return lines.slice(1).filter(Boolean).map((line) => {
      const cols = splitCsvLine(line);
      const row = {};
      headers.forEach((h, i) => {
        const v = cols[i] ?? "";
        const n = Number(v);
        row[h] = v !== "" && Number.isFinite(n) && String(n) === v.trim() ? n : v;
      });
      return row;
    });
  },

  async json(url) {
    return (await fetch(url)).json();
  },

  /** Try ./data/<name> then fall back to list of candidates */
  async firstCsv(names) {
    const list = Array.isArray(names) ? names : [names];
    for (const name of list) {
      if (!name || name === "(none)") continue;
      const url = name.startsWith("http") || name.startsWith("./") ? name : `./data/${name}`;
      try {
        const res = await fetch(url);
        if (res.ok) return { url, rows: await this.csv(url) };
      } catch (_) {}
    }
    return { url: null, rows: [] };
  },
};

function splitCsvLine(line) {
  const out = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      q = !q;
      continue;
    }
    if (c === "," && !q) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += c;
  }
  out.push(cur);
  return out;
}
