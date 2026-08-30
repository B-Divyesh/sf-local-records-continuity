import test, { before } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const binary = resolve("target/debug/continuity");
const demoPassphrase = "maple-street-books-demo-only";

before(async () => {
  await execFileAsync("cargo", ["build", "--quiet", "-p", "continuity-pack", "--bin", "continuity"]);
});

async function demo() {
  const { stdout } = await execFileAsync(binary, ["--json", "demo"], { env: { PATH: process.env.PATH ?? "" } });
  return JSON.parse(stdout);
}

async function removeDemo(result) {
  await rm(result.workspace, { recursive: true, force: true });
}

test("@claim:demo-sandbox uses bundled data in a fresh temporary workspace", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "continuity-claim-cwd-"));
  const first = JSON.parse((await execFileAsync(binary, ["--json", "--demo"], { cwd })).stdout);
  const second = JSON.parse((await execFileAsync(binary, ["--json", "demo"], { cwd })).stdout);
  try {
    assert.notEqual(first.workspace, second.workspace);
    assert.ok(first.workspace.startsWith(tmpdir()));
    assert.ok(!first.workspace.startsWith(cwd));
    assert.equal(first.file_count, 3);
    assert.equal(first.verified, true);
    assert.equal((await readdir(cwd)).length, 0, "the demo must not write in the caller's folder");
  } finally {
    await Promise.all([removeDemo(first), removeDemo(second), rm(cwd, { recursive: true, force: true })]);
  }
});

test("@claim:pack-artifacts writes an encrypted pack, readable manifest, and matching receipt", async () => {
  const result = await demo();
  try {
    const files = await readdir(join(result.workspace, "target"));
    const packName = files.find((name) => name.endsWith(".cpack"));
    const manifestName = files.find((name) => name.endsWith(".manifest.txt"));
    const receiptName = files.find((name) => name.endsWith(".receipt.json"));
    assert.ok(packName && manifestName && receiptName);
    const pack = await readFile(join(result.workspace, "target", packName));
    const manifest = await readFile(join(result.workspace, "target", manifestName), "utf8");
    const receipt = JSON.parse(await readFile(join(result.workspace, "target", receiptName), "utf8"));
    assert.ok(pack.subarray(0, 8).equals(Buffer.from("CPACK01\n")));
    assert.doesNotMatch(pack.toString("utf8"), /INV-1048|Northwind Reading Group/);
    assert.match(manifest, /Maple Street Books/);
    assert.match(manifest, /Records: 3 files/);
    assert.equal(receipt.sha256, createHash("sha256").update(pack).digest("hex"));
  } finally {
    await removeDemo(result);
  }
});

test("@claim:authenticated-encryption accepts the demo passphrase and rejects a wrong one", async () => {
  const result = await demo();
  try {
    const implementation = await readFile("crates/continuity/src/lib.rs", "utf8");
    assert.match(implementation, /XChaCha20Poly1305::new/);
    assert.match(implementation, /Argon2::default\(\)/);
    const good = await execFileAsync(binary, ["--ci", "--json", "verify", result.target_pack], {
      env: { ...process.env, CONTINUITY_PASSPHRASE: demoPassphrase }
    });
    assert.equal(JSON.parse(good.stdout).authenticated, true);
    await assert.rejects(
      execFileAsync(binary, ["--ci", "--json", "verify", result.target_pack], {
        env: { ...process.env, CONTINUITY_PASSPHRASE: "this-passphrase-is-wrong" }
      }),
      (error) => error.code === 4 && /authentication failed/.test(error.stdout)
    );
  } finally {
    await removeDemo(result);
  }
});

test("@claim:explicit-local-target makes no network call and requires a named target", async () => {
  const hookDir = await mkdtemp(join(tmpdir(), "continuity-network-hook-"));
  const source = join(hookDir, "block-network.c");
  const library = join(hookDir, "block-network.so");
  const marker = join(hookDir, "network-called");
  await writeFile(source, `#define _GNU_SOURCE\n#include <sys/socket.h>\n#include <errno.h>\n#include <fcntl.h>\n#include <stdlib.h>\n#include <unistd.h>\nint socket(int domain,int type,int protocol){const char *p=getenv("CONTINUITY_NETWORK_MARKER");if(p){int f=open(p,O_WRONLY|O_CREAT,0600);if(f>=0)close(f);}errno=ENETDOWN;return -1;}\n`);
  await execFileAsync("cc", ["-shared", "-fPIC", source, "-o", library]);
  const result = JSON.parse((await execFileAsync(binary, ["--json", "demo"], {
    env: { PATH: process.env.PATH ?? "", LD_PRELOAD: library, CONTINUITY_NETWORK_MARKER: marker }
  })).stdout);
  try {
    await assert.rejects(readFile(marker), (error) => error.code === "ENOENT");
    const cwd = await mkdtemp(join(tmpdir(), "continuity-no-target-"));
    try {
      await assert.rejects(
        execFileAsync(binary, ["--ci", "pack"], { cwd, env: { ...process.env, CONTINUITY_PASSPHRASE: demoPassphrase } }),
        (error) => error.code === 2 && /--target/.test(error.stderr)
      );
      assert.equal((await readdir(cwd)).length, 0);
    } finally {
      await rm(cwd, { recursive: true, force: true });
    }
  } finally {
    await Promise.all([removeDemo(result), rm(hookDir, { recursive: true, force: true })]);
  }
});

test("@claim:loud-scheduled-check exits non-zero when the target is unavailable", async () => {
  const missing = join(tmpdir(), `continuity-missing-target-${process.pid}-${Date.now()}`);
  await assert.rejects(
    execFileAsync(binary, ["--ci", "check", "--target", missing], {
      env: { ...process.env, CONTINUITY_PASSPHRASE: demoPassphrase }
    }),
    (error) => error.code === 3 && /target is unavailable/.test(error.stderr)
  );
});

test("@claim:restore-integrity restores all sample bytes and a report", async () => {
  const result = await demo();
  try {
    const restored = join(result.restored, "records");
    const pairs = [
      ["invoices/invoices.csv", "examples/maple-street-books/exports/invoices.csv"],
      ["customers/customers.csv", "examples/maple-street-books/exports/customers.csv"],
      ["supporting-documents/insurance-renewal.txt", "examples/maple-street-books/exports/documents/insurance-renewal.txt"]
    ];
    for (const [actual, fixture] of pairs) {
      assert.deepEqual(await readFile(join(restored, actual)), await readFile(fixture));
    }
    assert.match(await readFile(join(result.restored, "RESTORE-REPORT.txt"), "utf8"), /every file matched its recorded SHA-256/i);
  } finally {
    await removeDemo(result);
  }
});

test("@claim:free-core-and-json runs the complete sample without a license and returns one JSON object", async () => {
  const { stdout, stderr } = await execFileAsync(binary, ["--ci", "--json", "demo"], {
    env: { PATH: process.env.PATH ?? "" }
  });
  const result = JSON.parse(stdout);
  try {
    assert.equal(stderr, "");
    assert.equal(stdout.trim().split("\n").length, 1);
    assert.equal(result.status, "sample-recovery-complete");
    assert.equal(result.verified, true);
  } finally {
    await removeDemo(result);
  }
});

test("@claim:passphrase-sources accepts a file or environment value and exposes keychain status safely", async () => {
  const result = await demo();
  const passphraseFile = join(result.workspace, "demo-passphrase.txt");
  try {
    await writeFile(passphraseFile, `${demoPassphrase}\n`, { mode: 0o600 });
    const fromFile = await execFileAsync(binary, ["--ci", "--json", "--passphrase-file", passphraseFile, "verify", result.target_pack], {
      env: { PATH: process.env.PATH ?? "" }
    });
    assert.equal(JSON.parse(fromFile.stdout).authenticated, true);
    const fromEnvironment = await execFileAsync(binary, ["--ci", "--json", "verify", result.target_pack], {
      env: { PATH: process.env.PATH ?? "", CONTINUITY_PASSPHRASE: demoPassphrase }
    });
    assert.equal(JSON.parse(fromEnvironment.stdout).authenticated, true);
    const keyStatus = await execFileAsync(binary, ["--ci", "--json", "key", "status"], { env: { PATH: process.env.PATH ?? "" } });
    assert.equal(typeof JSON.parse(keyStatus.stdout).available, "boolean");
  } finally {
    await removeDemo(result);
  }
});
