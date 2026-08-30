"use strict";

const { createHash } = require("node:crypto");

const VERIFY_URL = "https://api.sociobot.in/api/v1/products/local-records-continuity/verify";
const RATE_LIMIT_MAX_REQUESTS = 20;
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_RATE_LIMIT_CLIENTS = 10_000;
const RATE_LIMIT_BLOB_BASE_URL = process.env.RATE_LIMIT_BLOB_BASE_URL;
const API_BUILD = "local-records-continuity-polish-1";
const LICENSE_HEADER = "x-continuity-license";
const ASSETS = Object.freeze({
  "multi-location-config.toml": {
    type: "application/toml; charset=utf-8",
    body: `# Continuity Plus — multi-location planning workbook
# Copy each profile into its own folder as continuity.toml.

# PROFILE: daily operating exports
business_name = "YOUR BUSINESS — DAILY"
output_dir = ".continuity/packs/daily"

[[records]]
label = "invoices"
path = "exports/invoices.csv"
required = true

[[records]]
label = "customers"
path = "exports/customers.csv"
required = true

# Run to mounted target A:
# continuity pack --config continuity-daily.toml --target /media/target-a
# Run a second independent copy to target B:
# continuity pack --config continuity-daily.toml --target /media/target-b
`
  },
  "quarterly-restore-drill.md": {
    type: "text/markdown; charset=utf-8",
    body: `# Quarterly restore drill

Date: __________  Operator: __________  Pack tested: __________

1. Confirm the pack and manifest are on the intended target.
2. Run \`continuity verify PACK.cpack\` and attach the JSON result.
3. Restore into a new empty directory.
4. Import into a non-production copy of the application.
5. Find one invoice, one customer, and one closed-period record.
6. Record missing fields, import warnings, and elapsed recovery time.
7. Correct the export/configuration route and repeat if needed.

Outcome: PASS / NEEDS WORK

Notes:
`
  },
  "team-handoff-checklist.md": {
    type: "text/markdown; charset=utf-8",
    body: `# Continuity Pack — team handoff

- [ ] Two named people know where the current target is kept.
- [ ] The passphrase recovery method is documented separately from the pack.
- [ ] The plain-language manifest is stored beside the \`.cpack\` file.
- [ ] Scheduled dry-read failures reach someone who can act.
- [ ] Required export paths match the current application configuration.
- [ ] A full application import was tested this quarter.
- [ ] The recovery time and any manual steps are recorded.
- [ ] An off-site or physically separate target exists.
`
  }
});

/** In-memory implementation for unit tests and local function development. */
function createRateLimiter({
  limit = RATE_LIMIT_MAX_REQUESTS,
  windowMs = RATE_LIMIT_WINDOW_MS,
  now = () => Date.now()
} = {}) {
  const clients = new Map();

  function prune(currentTime) {
    for (const [client, entry] of clients) {
      if (entry.resetAt <= currentTime) clients.delete(client);
    }
    while (clients.size >= MAX_RATE_LIMIT_CLIENTS) {
      const oldest = clients.keys().next().value;
      if (oldest === undefined) break;
      clients.delete(oldest);
    }
  }

  return {
    take(client) {
      const currentTime = now();
      let entry = clients.get(client);
      if (!entry || entry.resetAt <= currentTime) {
        if (!entry) prune(currentTime);
        entry = { count: 0, resetAt: currentTime + windowMs };
        clients.set(client, entry);
      }

      if (entry.count >= limit) {
        return {
          allowed: false,
          retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - currentTime) / 1000))
        };
      }

      entry.count += 1;
      return { allowed: true };
    },
    reset() {
      clients.clear();
    }
  };
}

function rateLimitClientId(client) {
  // Shared state stores a one-way hash, never a raw IP address.
  return createHash("sha256").update(client).digest("hex");
}

/**
 * Production implementation shared by every Azure Functions worker.
 *
 * One append blob represents one client and fixed one-minute window. Azure
 * Blob Storage applies x-ms-blob-condition-maxsize atomically, so at most 20
 * one-byte blocks can be appended even when separate function hosts race.
 */
function createAzureBlobRateLimiter({
  baseUrl,
  limit = RATE_LIMIT_MAX_REQUESTS,
  windowMs = RATE_LIMIT_WINDOW_MS,
  now = () => Date.now(),
  fetchFn = fetch
} = {}) {
  if (!baseUrl) throw new Error("RATE_LIMIT_BLOB_BASE_URL is required");

  function blobUrl(client, window) {
    const url = new URL(baseUrl);
    url.pathname = `${url.pathname.replace(/\/$/, "")}/v1/${rateLimitClientId(client)}/${window}`;
    return url;
  }

  async function ensureAppendBlob(url) {
    const created = await fetchFn(url, {
      method: "PUT",
      headers: {
        "Content-Length": "0",
        "If-None-Match": "*",
        "x-ms-blob-type": "AppendBlob",
        "x-ms-version": "2023-11-03"
      }
    });
    if (![201, 409, 412].includes(created.status)) {
      throw new Error(`rate-limit blob creation returned ${created.status}`);
    }
  }

  return {
    async take(client) {
      const currentTime = now();
      const window = Math.floor(currentTime / windowMs);
      const url = blobUrl(client, window);
      await ensureAppendBlob(url);
      const appendUrl = new URL(url);
      appendUrl.searchParams.set("comp", "appendblock");
      const appended = await fetchFn(appendUrl, {
        method: "PUT",
        headers: {
          "Content-Length": "1",
          "Content-Type": "application/octet-stream",
          "x-ms-blob-condition-maxsize": String(limit),
          "x-ms-version": "2023-11-03"
        },
        body: Buffer.from([1])
      });
      if (appended.status === 201) return { allowed: true };
      if (appended.status === 412) {
        return {
          allowed: false,
          retryAfterSeconds: Math.max(1, Math.ceil((windowMs - (currentTime % windowMs)) / 1000))
        };
      }
      throw new Error(`rate-limit blob append returned ${appended.status}`);
    }
  };
}

function headerValue(headers, name) {
  const entry = Object.entries(headers ?? {}).find(([key]) => key.toLowerCase() === name.toLowerCase());
  const value = entry?.[1];
  return Array.isArray(value) ? value[0] : value;
}

function normalizedClientAddress(value) {
  const address = value.trim();
  const bracketedIpv6 = /^\[([^\]]+)\](?::\d+)?$/.exec(address);
  if (bracketedIpv6) return bracketedIpv6[1].toLowerCase().slice(0, 128);
  const ipv4WithPort = /^(\d{1,3}(?:\.\d{1,3}){3})(?::\d+)?$/.exec(address);
  if (ipv4WithPort) return ipv4WithPort[1];
  return address.toLowerCase().slice(0, 128);
}

function clientKey(req) {
  // Azure supplies the client address at its platform edge. It includes a
  // transient source port in this deployment, so normalize the address first.
  const azureClientIp = headerValue(req.headers, "x-azure-clientip");
  if (typeof azureClientIp === "string" && azureClientIp.trim()) return normalizedClientAddress(azureClientIp);

  // Local function hosts and other reverse proxies may not send the Azure
  // header. Their final forwarded entry is the best available fallback.
  const forwarded = headerValue(req.headers, "x-forwarded-for");
  if (typeof forwarded === "string" && forwarded.trim()) return normalizedClientAddress(forwarded.split(",").at(-1));

  return "unknown-client";
}

const downloadRateLimiter = RATE_LIMIT_BLOB_BASE_URL
  ? createAzureBlobRateLimiter({ baseUrl: RATE_LIMIT_BLOB_BASE_URL })
  : createRateLimiter();
const rateLimitBackend = RATE_LIMIT_BLOB_BASE_URL ? "shared-azure-blob" : "local-memory";

function response(status, body, headers = {}) {
  return {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Continuity-API-Build": API_BUILD,
      "RateLimit-Policy": `${RATE_LIMIT_MAX_REQUESTS};w=${RATE_LIMIT_WINDOW_MS / 1000}`,
      "RateLimit-Backend": rateLimitBackend,
      ...headers
    },
    body
  };
}

module.exports = async function plusDownload(context, req) {
  let rateLimit;
  try {
    rateLimit = await downloadRateLimiter.take(clientKey(req));
  } catch (error) {
    context.log.warn("Continuity Plus rate limit unavailable", error instanceof Error ? error.message : String(error));
    context.res = response(503, { error: "protected download is temporarily unavailable" }, {
      "Content-Type": "application/json",
      "Retry-After": "1"
    });
    return;
  }
  if (!rateLimit.allowed) {
    context.res = response(429, { error: "too many protected-download requests; try again shortly" }, {
      "Content-Type": "application/json",
      "Retry-After": String(rateLimit.retryAfterSeconds)
    });
    return;
  }

  const assetName = req.query?.asset;
  const asset = typeof assetName === "string" ? ASSETS[assetName] : undefined;
  if (!asset) {
    context.res = response(404, { error: "unknown field-kit file" }, { "Content-Type": "application/json" });
    return;
  }

  const license = headerValue(req.headers, LICENSE_HEADER);
  const token = typeof license === "string" ? license.trim() : "";
  if (!token) {
    context.res = response(401, { error: "a Continuity Plus license is required" }, { "Content-Type": "application/json" });
    return;
  }

  try {
    const verification = await fetch(`${VERIFY_URL}?license=${encodeURIComponent(token)}`, {
      headers: { Accept: "application/json" }
    });
    if (!verification.ok) throw new Error(`verification returned ${verification.status}`);
    const verdict = await verification.json();
    if (verdict.valid !== true) {
      context.res = response(403, { error: "license is not active" }, { "Content-Type": "application/json" });
      return;
    }
  } catch (error) {
    context.log.warn("Continuity Plus license verification unavailable", error instanceof Error ? error.message : String(error));
    context.res = response(503, { error: "license verification is temporarily unavailable" }, { "Content-Type": "application/json", "Retry-After": "60" });
    return;
  }

  context.res = response(200, asset.body, {
    "Content-Type": asset.type,
    "Content-Disposition": `attachment; filename="${assetName}"`
  });
};

module.exports.ASSETS = ASSETS;
module.exports.API_BUILD = API_BUILD;
module.exports.LICENSE_HEADER = LICENSE_HEADER;
module.exports.createRateLimiter = createRateLimiter;
module.exports.createAzureBlobRateLimiter = createAzureBlobRateLimiter;
module.exports.resetRateLimitForTests = () => downloadRateLimiter.reset();
