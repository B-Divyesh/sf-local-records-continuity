import assert from "node:assert/strict";

const baseUrl = (process.env.VERIFY_BASE_URL ?? "https://local-records-continuity.sociobot.in").replace(/\/$/, "");
const endpoint = `${baseUrl}/api/plus-download?asset=multi-location-config.toml`;

const home = await fetch(`${baseUrl}/`);
assert.equal(home.status, 200);
assert.match(home.headers.get("content-security-policy") ?? "", /frame-ancestors 'none'/);
const demo = await fetch(`${baseUrl}/demo/`);
assert.equal(demo.status, 200);
assert.match(await demo.text(), /Demo — sample data, nothing is saved here/);
const missing = await fetch(`${baseUrl}/not-a-real-route-${Date.now()}`);
assert.equal(missing.status, 404);
assert.match(await missing.text(), /This page does not exist/);

const build = await fetch(`${baseUrl}/api/build`);
assert.equal(build.status, 200);
assert.equal(build.headers.get("x-continuity-api-build"), "local-records-continuity-polish-2");
assert.deepEqual(await build.json(), {
  product: "local-records-continuity",
  artifact: "managed-protected-download-api",
  version: "0.1.0",
  release: "local-records-continuity-polish-2",
  license_header: "x-continuity-license"
});

const anonymous = await fetch(endpoint, { method: "POST" });
assert.equal(anonymous.status, 401);
const reservedHeader = await fetch(endpoint, {
  method: "POST",
  headers: { Authorization: "Bearer verifier-invalid" }
});
assert.equal(reservedHeader.status, 401);
const productHeader = await fetch(endpoint, {
  method: "POST",
  headers: { "X-Continuity-License": "verifier-invalid" }
});
assert.equal(productHeader.status, 403);
assert.ok([anonymous, reservedHeader, productHeader]
  .every((response) => response.headers.get("x-continuity-api-build") === "local-records-continuity-polish-2"));

const delay = 60_000 - (Date.now() % 60_000) + 1_500;
process.stdout.write(`Waiting ${delay} ms for a fresh fixed rate-limit window...\n`);
await new Promise((resolve) => setTimeout(resolve, delay));

const responses = await Promise.all(Array.from({ length: 60 }, () => fetch(endpoint, {
  method: "POST",
  headers: { "X-Continuity-License": "deployment-rate-limit-fixture" },
  signal: AbortSignal.timeout(20_000)
})));
const counts = Object.fromEntries([...new Set(responses.map((response) => response.status))]
  .sort()
  .map((status) => [status, responses.filter((response) => response.status === status).length]));
const admitted = responses.filter((response) => response.status !== 429);
const throttled = responses.filter((response) => response.status === 429);

assert.equal(admitted.length, 20, JSON.stringify(counts));
assert.equal(throttled.length, 40, JSON.stringify(counts));
assert.ok(admitted.every((response) => response.status === 403), JSON.stringify(counts));
assert.ok(responses.every((response) => response.headers.get("ratelimit-policy") === "20;w=60"));
assert.ok(responses.every((response) => response.headers.get("ratelimit-backend") === "shared-azure-blob"));
assert.ok(throttled.every((response) => /^[1-9][0-9]?$/.test(response.headers.get("retry-after") ?? "")));

console.log(JSON.stringify({ endpoint, csp: true, demo: true, notFound: 404, apiBuild: "local-records-continuity-polish-2", auth: { anonymous: 401, reservedHeader: 401, productHeader: 403 }, requests: responses.length, counts }));
