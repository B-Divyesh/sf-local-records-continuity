import assert from "node:assert/strict";
import { execFile, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import test from "node:test";

const execFileAsync = promisify(execFile);
const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const claimsPath = resolve(repositoryRoot, ".factory/claims.json");

function runClaim(command, cwd) {
  return new Promise((resolveResult, reject) => {
    const child = spawn(command, {
      cwd,
      env: {
        ...process.env,
        npm_config_audit: "false",
        npm_config_fund: "false"
      },
      shell: true,
      stdio: ["ignore", "pipe", "pipe"]
    });
    let output = "";
    child.stdout.on("data", (chunk) => { output += chunk; });
    child.stderr.on("data", (chunk) => { output += chunk; });
    child.once("error", reject);
    child.once("close", (code, signal) => resolveResult({ code, output, signal }));
  });
}

test("@regression:clean-clone-claims run independently before manual npm setup", { timeout: 1_200_000 }, async (t) => {
  const claims = JSON.parse(await readFile(claimsPath, "utf8"));
  assert.equal(claims.length, 18, "the release claims manifest changed; update this independent runner deliberately");

  const temporaryRoot = await mkdtemp(resolve(tmpdir(), "continuity-clean-claims-"));
  try {
    for (const [index, claim] of claims.entries()) {
      const clone = resolve(temporaryRoot, `${String(index + 1).padStart(2, "0")}-${claim.id}`);
      await execFileAsync("git", ["clone", "--quiet", "--no-local", repositoryRoot, clone]);
      assert.equal(existsSync(resolve(clone, "node_modules")), false, `${claim.id} must start with no installed Node modules`);

      t.diagnostic(`clean clone ${index + 1}/${claims.length}: ${claim.id}`);
      const result = await runClaim(claim.test, clone);
      assert.equal(
        result.code,
        0,
        `${claim.id} failed from its own clean clone${result.signal ? ` (${result.signal})` : ""}:\n${result.output}`
      );
      assert.doesNotMatch(result.output, /vite: not found/, `${claim.id} must not depend on a previous npm install`);
    }
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});
