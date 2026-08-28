"use strict";

const VERIFY_URL = "https://api.sociobot.in/api/v1/products/local-records-continuity/verify";
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

function response(status, body, headers = {}) {
  return {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...headers
    },
    body
  };
}

module.exports = async function plusDownload(context, req) {
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
