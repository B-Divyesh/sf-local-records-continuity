const test = require("node:test");
const assert = require("node:assert/strict");
const { execFile } = require("node:child_process");
const { promisify } = require("node:util");
const plusDownload = require("./index.js");

const execFileAsync = promisify(execFile);

function context() {
  return { log: { warn() {} }, res: undefined };
}

test.beforeEach(async () => {
  await plusDownload.resetRateLimitForTests();
});

test("rejects every advertised download without a bearer license", async () => {
  for (const [asset, paidContent] of Object.entries(plusDownload.ASSETS)) {
    const ctx = context();
    await plusDownload(ctx, { query: { asset }, headers: {} });
    assert.equal(ctx.res.status, 401, asset);
    assert.equal(ctx.res.headers["Cache-Control"], "no-store", asset);
    assert.doesNotMatch(JSON.stringify(ctx.res.body), new RegExp(paidContent.body.slice(0, 24)), asset);
  }
});

test("rejects an invalid license without returning paid content", async (t) => {
  t.mock.method(global, "fetch", async () => ({ ok: true, json: async () => ({ valid: false, reason: "invalid" }) }));
  const ctx = context();
  await plusDownload(ctx, { query: { asset: "quarterly-restore-drill.md" }, headers: { authorization: "Bearer bad-token" } });
  assert.equal(ctx.res.status, 403);
  assert.deepEqual(ctx.res.body, { error: "license is not active" });
});

test("returns the requested file only after a valid live verification", async (t) => {
  let verificationUrl = "";
  t.mock.method(global, "fetch", async (url) => {
    verificationUrl = String(url);
    return { ok: true, json: async () => ({ valid: true, reason: "ok" }) };
  });
  const ctx = context();
  await plusDownload(ctx, { query: { asset: "quarterly-restore-drill.md" }, headers: { authorization: "Bearer valid token" } });
  assert.equal(ctx.res.status, 200);
  assert.match(ctx.res.body, /Quarterly restore drill/);
  assert.equal(ctx.res.headers["Content-Disposition"], 'attachment; filename="quarterly-restore-drill.md"');
  assert.match(verificationUrl, /verify\?license=valid%20token$/);
});

test("fails closed when live verification is unavailable", async (t) => {
  t.mock.method(global, "fetch", async () => ({ ok: false, status: 503 }));
  const ctx = context();
  await plusDownload(ctx, { query: { asset: "team-handoff-checklist.md" }, headers: { authorization: "Bearer unverified-token" } });
  assert.equal(ctx.res.status, 503);
  assert.equal(ctx.res.headers["Cache-Control"], "no-store");
  assert.deepEqual(ctx.res.body, { error: "license verification is temporarily unavailable" });
  assert.doesNotMatch(JSON.stringify(ctx.res.body), /team handoff/i);
});

test("does not expose unknown files even with a token", async () => {
  const ctx = context();
  await plusDownload(ctx, { query: { asset: "../../secret" }, headers: { authorization: "Bearer token" } });
  assert.equal(ctx.res.status, 404);
});

test("@claim:protected-download-rate-limit limits the verifier's exact 60-request anonymous burst", async () => {
  const responses = await Promise.all(Array.from({ length: 60 }, async () => {
    const ctx = context();
    await plusDownload(ctx, {
      query: { asset: "quarterly-restore-drill.md" },
      headers: { "x-azure-clientip": "203.0.113.44" }
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

test("rate limits authenticated bursts before upstream verification", async (t) => {
  let verificationCalls = 0;
  t.mock.method(global, "fetch", async () => {
    verificationCalls += 1;
    return { ok: true, json: async () => ({ valid: true, reason: "ok" }) };
  });

  const responses = await Promise.all(Array.from({ length: 60 }, async () => {
    const ctx = context();
    await plusDownload(ctx, {
      query: { asset: "quarterly-restore-drill.md" },
      headers: { authorization: "Bearer valid-token", "x-azure-clientip": "203.0.113.44" }
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

test("shared rate-limit state survives isolated function worker processes", async () => {
  const handlerPath = require.resolve("./index.js");
  const invocation = `
    const handler = require(${JSON.stringify(handlerPath)});
    const context = { log: { warn() {} } };
    handler(context, {
      query: { asset: "quarterly-restore-drill.md" },
      headers: { "x-azure-clientip": "198.51.100.55" }
    }).then(() => process.stdout.write(String(context.res.status)));
  `;
  const responses = await Promise.all(Array.from({ length: 21 }, async () => {
    const { stdout } = await execFileAsync(process.execPath, ["-e", invocation]);
    return Number.parseInt(stdout, 10);
  }));

  assert.equal(responses.filter((status) => status === 401).length, 20);
  assert.equal(responses.filter((status) => status === 429).length, 1);
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
