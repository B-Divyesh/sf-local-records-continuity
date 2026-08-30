"use strict";

const { createHash, randomUUID } = require("node:crypto");
const { mkdir, readFile, rename, rmdir, stat, unlink, writeFile } = require("node:fs/promises");
const { tmpdir } = require("node:os");
const { join } = require("node:path");

const VERIFY_URL = "https://api.sociobot.in/api/v1/products/local-records-continuity/verify";
const RATE_LIMIT_MAX_REQUESTS = 20;
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_RATE_LIMIT_CLIENTS = 10_000;
const RATE_LIMIT_LOCK_TIMEOUT_MS = 2_000;
const RATE_LIMIT_LOCK_STALE_MS = 10_000;
const RATE_LIMIT_STATE_PATH = join(tmpdir(), "continuity-plus-download-rate-limit-v1.json");
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

/**
 * Keep the protected endpoint from becoming an unbounded license-verification
 * proxy. Azure Functions reuses a module while an instance is warm, so this
 * limits each client on every warm instance without storing license tokens or
 * other customer data. Expired entries are pruned and the map is capped to
 * prevent an IP-spray from growing process memory indefinitely.
 */
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

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function rateLimitClientId(client) {
  // The short-lived state file stores a one-way hash, never a raw IP address.
  return createHash("sha256").update(client).digest("hex");
}

function pruneRateLimitState(state, currentTime) {
  for (const [client, entry] of Object.entries(state)) {
    if (!entry || typeof entry.count !== "number" || typeof entry.resetAt !== "number" || entry.resetAt <= currentTime) {
      delete state[client];
    }
  }
  const overflow = Object.keys(state).length - MAX_RATE_LIMIT_CLIENTS;
  if (overflow > 0) {
    Object.entries(state)
      .sort(([, left], [, right]) => left.resetAt - right.resetAt)
      .slice(0, overflow)
      .forEach(([client]) => delete state[client]);
  }
}

async function acquireFileLock(lockPath, now = () => Date.now()) {
  const deadline = now() + RATE_LIMIT_LOCK_TIMEOUT_MS;
  while (now() < deadline) {
    try {
      await mkdir(lockPath);
      return async () => { await rmdir(lockPath).catch(() => {}); };
    } catch (error) {
      if (!error || error.code !== "EEXIST") throw error;
      try {
        const lock = await stat(lockPath);
        if (now() - lock.mtimeMs > RATE_LIMIT_LOCK_STALE_MS) await rmdir(lockPath).catch(() => {});
      } catch (lockError) {
        if (!lockError || lockError.code !== "ENOENT") throw lockError;
      }
      await wait(5);
    }
  }
  throw new Error("protected-download rate-limit state is busy");
}

function createSharedRateLimiter({
  statePath = RATE_LIMIT_STATE_PATH,
  now = () => Date.now()
} = {}) {
  const lockPath = `${statePath}.lock`;

  async function readState() {
    try {
      const parsed = JSON.parse(await readFile(statePath, "utf8"));
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch (error) {
      if (error && error.code === "ENOENT") return {};
      return {};
    }
  }

  async function writeState(state) {
    const temporaryPath = `${statePath}.${process.pid}.${randomUUID()}.tmp`;
    await writeFile(temporaryPath, JSON.stringify(state), { mode: 0o600 });
    await rename(temporaryPath, statePath);
  }

  return {
    async take(client) {
      const release = await acquireFileLock(lockPath, now);
      try {
        const currentTime = now();
        const state = await readState();
        pruneRateLimitState(state, currentTime);
        const clientId = rateLimitClientId(client);
        let entry = state[clientId];
        if (!entry || entry.resetAt <= currentTime) {
          entry = { count: 0, resetAt: currentTime + RATE_LIMIT_WINDOW_MS };
          state[clientId] = entry;
        }

        let result;
        if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
          result = {
            allowed: false,
            retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - currentTime) / 1000))
          };
        } else {
          entry.count += 1;
          result = { allowed: true };
        }
        await writeState(state);
        return result;
      } finally {
        await release();
      }
    },
    async reset() {
      const release = await acquireFileLock(lockPath, now);
      try {
        await unlink(statePath).catch((error) => {
          if (!error || error.code !== "ENOENT") throw error;
        });
      } finally {
        await release();
      }
    }
  };
}

function headerValue(headers, name) {
  const value = headers?.[name] ?? headers?.[name.toLowerCase()] ?? headers?.[name.toUpperCase()];
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
  // Azure's reverse proxy appends the actual source address to X-Forwarded-For.
  // Use that final value so a caller cannot select the rate-limit bucket with a
  // prepended header, and normalize connection-specific ports away.
  const forwarded = headerValue(req.headers, "x-forwarded-for");
  if (typeof forwarded === "string" && forwarded.trim()) return normalizedClientAddress(forwarded.split(",").at(-1));

  // Local function hosts and other standard reverse proxies may not send XFF.
  // Azure provides this fallback at its platform edge.
  const azureClientIp = headerValue(req.headers, "x-azure-clientip");
  if (typeof azureClientIp === "string" && azureClientIp.trim()) return normalizedClientAddress(azureClientIp);

  return "unknown-client";
}

const downloadRateLimiter = createSharedRateLimiter();

function response(status, body, headers = {}) {
  return {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "RateLimit-Policy": `${RATE_LIMIT_MAX_REQUESTS};w=${RATE_LIMIT_WINDOW_MS / 1000}`,
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

  const authorization = req.headers?.authorization ?? req.headers?.Authorization ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(authorization);
  const token = match?.[1]?.trim();
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
module.exports.createRateLimiter = createRateLimiter;
module.exports.createSharedRateLimiter = createSharedRateLimiter;
module.exports.resetRateLimitForTests = () => downloadRateLimiter.reset();
