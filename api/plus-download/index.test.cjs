const test = require("node:test");
const assert = require("node:assert/strict");
const plusDownload = require("./index.js");

function context() {
  return { log: { warn() {} }, res: undefined };
}

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

test("does not expose unknown files even with a token", async () => {
  const ctx = context();
  await plusDownload(ctx, { query: { asset: "../../secret" }, headers: { authorization: "Bearer token" } });
  assert.equal(ctx.res.status, 404);
});
