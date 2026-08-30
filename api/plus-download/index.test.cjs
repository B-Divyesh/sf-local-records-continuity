const test = require("node:test");
const assert = require("node:assert/strict");
const { access } = require("node:fs/promises");
const plusDownload = require("./index.js");

function context() {
  return { log: { warn() {} }, res: undefined };
}

test.beforeEach(async () => {
  await plusDownload.resetRateLimitForTests();
});

test("rejects every advertised download without a product license header", async () => {
  for (const [asset, paidContent] of Object.entries(plusDownload.ASSETS)) {
    const ctx = context();
    await plusDownload(ctx, { query: { asset }, headers: {} });
    assert.equal(ctx.res.status, 401, asset);
    assert.equal(ctx.res.headers["Cache-Control"], "no-store", asset);
    assert.equal(ctx.res.headers["RateLimit-Policy"], "20;w=60", asset);
    assert.doesNotMatch(JSON.stringify(ctx.res.body), new RegExp(paidContent.body.slice(0, 24)), asset);
  }
});

test("rejects an invalid license without returning paid content", async (t) => {
  t.mock.method(global, "fetch", async () => ({ ok: true, json: async () => ({ valid: false, reason: "invalid" }) }));
  const ctx = context();
  await plusDownload(ctx, { query: { asset: "quarterly-restore-drill.md" }, headers: { "x-continuity-license": "bad-token" } });
  assert.equal(ctx.res.status, 403);
  assert.deepEqual(ctx.res.body, { error: "license is not active" });
});

test("@claim:licensed-download returns field-kit files only after an active check and never ships them publicly", async (t) => {
  const verificationUrls = [];
  t.mock.method(global, "fetch", async (url) => {
    verificationUrls.push(String(url));
    return {
      ok: true,
      json: async () => ({ valid: String(url).endsWith("license=valid%20token"), reason: "fixture" })
    };
  });

  const missing = context();
  await plusDownload(missing, { query: { asset: "quarterly-restore-drill.md" }, headers: {} });
  assert.equal(missing.res.status, 401);
  assert.doesNotMatch(JSON.stringify(missing.res.body), /Quarterly restore drill/);

  const gatewayReservedHeader = context();
  await plusDownload(gatewayReservedHeader, {
    query: { asset: "quarterly-restore-drill.md" },
    headers: { authorization: "Bearer valid token" }
  });
  assert.equal(gatewayReservedHeader.res.status, 401, "the managed API must not rely on SWA's reserved Authorization header");

  const invalid = context();
  await plusDownload(invalid, {
    query: { asset: "quarterly-restore-drill.md" },
    headers: { "x-continuity-license": "invalid-token" }
  });
  assert.equal(invalid.res.status, 403);
  assert.doesNotMatch(JSON.stringify(invalid.res.body), /Quarterly restore drill/);

  const valid = context();
  await plusDownload(valid, {
    query: { asset: "quarterly-restore-drill.md" },
    headers: { "X-Continuity-License": "valid token" }
  });
  assert.equal(valid.res.status, 200);
  assert.match(valid.res.body, /Quarterly restore drill/);
  assert.equal(valid.res.headers["Content-Disposition"], 'attachment; filename="quarterly-restore-drill.md"');
  assert.equal(valid.res.headers["X-Continuity-API-Build"], "local-records-continuity-polish-1");
  assert.deepEqual(verificationUrls.map((url) => new URL(url).searchParams.get("license")), ["invalid-token", "valid token"]);

  for (const asset of Object.keys(plusDownload.ASSETS)) {
    await assert.rejects(access(`dist/site/plus/${asset}`), (error) => error.code === "ENOENT", asset);
  }
});

test("fails closed when live verification is unavailable", async (t) => {
  t.mock.method(global, "fetch", async () => ({ ok: false, status: 503 }));
  const ctx = context();
  await plusDownload(ctx, { query: { asset: "team-handoff-checklist.md" }, headers: { "x-continuity-license": "unverified-token" } });
  assert.equal(ctx.res.status, 503);
  assert.equal(ctx.res.headers["Cache-Control"], "no-store");
  assert.deepEqual(ctx.res.body, { error: "license verification is temporarily unavailable" });
  assert.doesNotMatch(JSON.stringify(ctx.res.body), /team handoff/i);
});

test("does not expose unknown files even with a token", async () => {
  const ctx = context();
  await plusDownload(ctx, { query: { asset: "../../secret" }, headers: { "x-continuity-license": "token" } });
  assert.equal(ctx.res.status, 404);
});

test("@claim:protected-download-rate-limit limits the verifier's exact 60-request anonymous burst", async () => {
  const responses = await Promise.all(Array.from({ length: 60 }, async () => {
    const ctx = context();
    await plusDownload(ctx, {
      query: { asset: "quarterly-restore-drill.md" },
      headers: { "x-azure-clientip": "203.0.113.44:443" }
    });
    return ctx.res;
  }));

  assert.equal(responses.filter((res) => res.status === 401).length, 20);
  const throttled = responses.filter((res) => res.status === 429);
  assert.equal(throttled.length, 40);
  for (const res of throttled) {
    assert.match(res.headers["Retry-After"], /^(?:[1-9]|[1-5][0-9]|60)$/);
    assert.equal(res.headers["Cache-Control"], "no-store");
    assert.deepEqual(res.body, { error: "too many protected-download requests; try again shortly" });
  }
});

test("rate limits one license across changing network addresses before upstream verification", async (t) => {
  let verificationCalls = 0;
  t.mock.method(global, "fetch", async () => {
    verificationCalls += 1;
    return { ok: true, json: async () => ({ valid: true, reason: "ok" }) };
  });

  const responses = await Promise.all(Array.from({ length: 60 }, async (_, index) => {
    const ctx = context();
    await plusDownload(ctx, {
      query: { asset: "quarterly-restore-drill.md" },
      headers: { "x-continuity-license": "valid-token", "x-azure-clientip": `203.0.113.${index % 6 + 40}:${4000 + index}` }
    });
    return ctx.res;
  }));

  assert.equal(responses.filter((res) => res.status === 200).length, 20);
  const throttled = responses.filter((res) => res.status === 429);
  assert.equal(throttled.length, 40);
  assert.equal(verificationCalls, 20, "throttled requests must not call Sociobot");
  for (const res of throttled) {
    assert.match(res.headers["Retry-After"], /^(?:[1-9]|[1-5][0-9]|60)$/);
    assert.equal(res.headers["Cache-Control"], "no-store");
    assert.deepEqual(res.body, { error: "too many protected-download requests; try again shortly" });
  }
});

test("shared Azure append condition admits only 20 requests across isolated workers", async () => {
  const blobs = new Map();
  const storageFetch = async (input, init) => {
    const url = new URL(String(input));
    const key = url.pathname;
    if (!url.searchParams.has("comp")) {
      if (blobs.has(key)) return { status: 409 };
      blobs.set(key, 0);
      return { status: 201 };
    }
    const maximum = Number(init.headers["x-ms-blob-condition-maxsize"]);
    const length = blobs.get(key);
    if (length === undefined) return { status: 404 };
    if (length >= maximum) return { status: 412 };
    blobs.set(key, length + 1);
    return { status: 201 };
  };
  const workers = Array.from({ length: 6 }, () => plusDownload.createAzureBlobRateLimiter({
    baseUrl: "https://storage.example/rate-limits?sig=fixture",
    now: () => 120_000,
    fetchFn: storageFetch
  }));
  const results = await Promise.all(Array.from({ length: 60 }, (_, index) =>
    workers[index % workers.length].take("198.51.100.55")
  ));

  assert.equal(results.filter((result) => result.allowed).length, 20);
  assert.equal(results.filter((result) => !result.allowed).length, 40);
  assert.ok(results.filter((result) => !result.allowed).every((result) => result.retryAfterSeconds === 60));
});

test("rate-limit retry timing resets accurately and clients have separate windows", () => {
  let clock = 10_000;
  const limiter = plusDownload.createRateLimiter({ limit: 2, windowMs: 60_000, now: () => clock });

  assert.deepEqual(limiter.take("198.51.100.8"), { allowed: true });
  assert.deepEqual(limiter.take("198.51.100.8"), { allowed: true });
  assert.deepEqual(limiter.take("198.51.100.9"), { allowed: true });
  assert.deepEqual(limiter.take("198.51.100.8"), { allowed: false, retryAfterSeconds: 60 });

  clock += 59_001;
  assert.deepEqual(limiter.take("198.51.100.8"), { allowed: false, retryAfterSeconds: 1 });
  clock += 999;
  assert.deepEqual(limiter.take("198.51.100.8"), { allowed: true });
});
