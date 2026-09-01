const test = require("node:test");
const assert = require("node:assert/strict");
const buildIdentity = require("./index.js");

test("managed API exposes a stable candidate identity", async () => {
  const context = { res: undefined };
  await buildIdentity(context, {});
  assert.equal(context.res.status, 200);
  assert.equal(context.res.headers["Cache-Control"], "no-store");
  assert.equal(context.res.headers["X-Continuity-API-Build"], buildIdentity.BUILD.release);
  assert.deepEqual(context.res.body, buildIdentity.BUILD);
  assert.equal(context.res.body.release, "local-records-continuity-repair-10");
  assert.equal(context.res.body.license_header, "x-continuity-license");
});
