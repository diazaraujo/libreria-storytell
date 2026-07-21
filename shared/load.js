/** Data loaders and strict data-contract helpers for replica components. */
(function initAtlasLoad(global) {
  "use strict";

  function coerceCsvValue(value) {
    if (value === "") return "";
    const trimmed = value.trim();
    if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(trimmed)) {
      return value;
    }
    const number = Number(trimmed);
    return Number.isFinite(number) ? number : value;
  }

  /** Convert a present numeric value without treating CSV blanks as zero. */
  function numberOrNaN(value) {
    if (value === null || value === undefined) return Number.NaN;
    if (typeof value === "string" && value.trim() === "") return Number.NaN;
    const number = Number(value);
    return Number.isFinite(number) ? number : Number.NaN;
  }

  /** Issue monotonically newer render tokens so stale async work cannot commit. */
  function createLatestGate() {
    let latest = 0;
    return {
      start() {
        const id = ++latest;
        return {
          id,
          isCurrent: () => id === latest,
        };
      },
      invalidate() {
        latest += 1;
      },
    };
  }

  /**
   * Parse RFC 4180-style CSV, including escaped quotes and quoted newlines.
   * Empty trailing records are ignored; empty fields inside records are kept.
   */
  function parseCsv(text) {
    const source = String(text ?? "").replace(/^\uFEFF/, "");
    if (!source) return [];

    const records = [];
    let record = [];
    let field = "";
    let quoted = false;

    const pushField = () => {
      record.push(field);
      field = "";
    };
    const pushRecord = () => {
      pushField();
      if (record.length > 1 || record[0] !== "") records.push(record);
      record = [];
    };

    for (let i = 0; i < source.length; i += 1) {
      const char = source[i];
      if (quoted) {
        if (char === '"') {
          if (source[i + 1] === '"') {
            field += '"';
            i += 1;
          } else {
            quoted = false;
          }
        } else {
          field += char;
        }
        continue;
      }

      if (char === '"' && field === "") {
        quoted = true;
      } else if (char === ",") {
        pushField();
      } else if (char === "\n") {
        pushRecord();
      } else if (char === "\r") {
        if (source[i + 1] === "\n") i += 1;
        pushRecord();
      } else {
        field += char;
      }
    }

    if (quoted) throw new Error("Invalid CSV: unterminated quoted field");
    if (field !== "" || record.length) pushRecord();
    if (!records.length) return [];

    const headers = records[0].map((header) => header.trim());
    if (headers.some((header) => !header)) {
      throw new Error("Invalid CSV: every column must have a header");
    }
    if (new Set(headers).size !== headers.length) {
      throw new Error("Invalid CSV: duplicate column headers");
    }

    return records.slice(1).map((values) => {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = coerceCsvValue(values[index] ?? "");
      });
      return row;
    });
  }

  function responseError(url, response) {
    const status = response && "status" in response ? ` (${response.status})` : "";
    return new Error(`Unable to load ${url}${status}`);
  }

  function contractColumns(contract) {
    if (!contract || typeof contract !== "object") return [];
    const flatten = (value) => {
      if (Array.isArray(value)) return value.flatMap(flatten);
      if (value && typeof value === "object") return Object.values(value).flatMap(flatten);
      return value ? [value] : [];
    };
    const required = Array.isArray(contract.required) ? contract.required : [];
    const columns = contract.columns && typeof contract.columns === "object"
      ? Object.values(contract.columns).flatMap(flatten)
      : [];
    return [...new Set([...required, ...columns].filter(Boolean))];
  }

  const AtlasLoad = {
    parseCsv,
    createLatestGate,

    async csv(url) {
      const response = await fetch(url);
      if (!response.ok) throw responseError(url, response);
      return parseCsv(await response.text());
    },

    async json(url) {
      const response = await fetch(url);
      if (!response.ok) throw responseError(url, response);
      return response.json();
    },

    /** Try ./data/<name> candidates, fetching each candidate at most once. */
    async firstCsv(names) {
      const list = Array.isArray(names) ? names : [names];
      for (const name of list) {
        if (!name || name === "(none)") continue;
        const url = name.startsWith("http") || name.startsWith("./")
          ? name
          : `./data/${name}`;
        try {
          const response = await fetch(url);
          if (response.ok) return { url, rows: parseCsv(await response.text()) };
        } catch (_) {
          // Candidates are expected to be optional. The caller receives an empty result
          // only after all of them have been attempted.
        }
      }
      return { url: null, rows: [] };
    },

    /** Validate a config dataContract and return its named column bindings. */
    validateContract(rows, contract, label = "dataset") {
      if (!contract || typeof contract !== "object") {
        throw new Error(`${label}: missing dataContract`);
      }
      const available = rows[0] ? Object.keys(rows[0]) : [];
      const required = contractColumns(contract);
      const missing = required.filter((column) => !available.includes(column));
      if (missing.length) {
        throw new Error(
          `${label}: missing required column${missing.length === 1 ? "" : "s"} ` +
          `${missing.join(", ")} (available: ${available.join(", ") || "none"})`
        );
      }
      return contract.columns || {};
    },

    fossilSubsidies(rows, contract) {
      const columns = this.validateContract(rows, contract, "fossil subsidies");
      return rows.map((row) => ({
        country: row[columns.country],
        code: row[columns.code],
        year: numberOrNaN(row[columns.year]),
        percentGdp: numberOrNaN(row[columns.percentGdp]),
        perCapita: numberOrNaN(row[columns.perCapita]),
        gdpPerCapita: numberOrNaN(row[columns.gdpPerCapita]),
        population: numberOrNaN(row[columns.population]),
        incomeGroup: row[columns.incomeGroup],
      })).filter((row) => row.country && Number.isFinite(row.percentGdp));
    },

    algalBloomPoints(rows, contract) {
      const columns = this.validateContract(rows, contract, "algal blooms");
      return rows.map((row) => ({
        event: row[columns.event],
        longitude: numberOrNaN(row[columns.longitude]),
        latitude: numberOrNaN(row[columns.latitude]),
        year: numberOrNaN(row[columns.year]),
      })).filter((row) =>
        row.event &&
        Number.isFinite(row.longitude) && row.longitude >= -180 && row.longitude <= 180 &&
        Number.isFinite(row.latitude) && row.latitude >= -90 && row.latitude <= 90 &&
        Number.isInteger(row.year)
      );
    },

    exposureOccupations(rows, contract, group = "glo") {
      const columns = this.validateContract(rows, contract, "AI exposure");
      const scoreColumn = columns.scores && columns.scores[group];
      const shareColumn = columns.shares && columns.shares[group];
      if (!scoreColumn || !shareColumn) {
        throw new Error(`AI exposure: unsupported group ${group}`);
      }
      return rows.map((row) => ({
        code: row[columns.code],
        occupation: row[columns.occupation],
        score: numberOrNaN(row[scoreColumn]),
        share: numberOrNaN(row[shareColumn]),
        icon: row[columns.icon],
      })).filter((row) =>
        row.occupation &&
        Number.isFinite(row.score) && row.score >= 0 && row.score <= 100 &&
        Number.isFinite(row.share) && row.share >= 0
      );
    },
  };

  global.AtlasLoad = AtlasLoad;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      AtlasLoad,
      parseCsv,
      coerceCsvValue,
      numberOrNaN,
      createLatestGate,
      contractColumns,
    };
  }
})(typeof window !== "undefined" ? window : globalThis);
