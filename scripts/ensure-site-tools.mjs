import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const requiredTools = [
  "node_modules/.bin/vite",
  "node_modules/.bin/playwright",
  "node_modules/.bin/tsc",
  "node_modules/@axe-core/playwright/package.json"
];

if (!requiredTools.every((tool) => existsSync(resolve(repositoryRoot, tool)))) {
  console.log("Preparing the locked site toolchain for this command…");
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  const install = spawnSync(npmCommand, [
    "ci",
    "--include=dev",
    "--ignore-scripts",
    "--no-audit",
    "--fund=false"
  ], {
    cwd: repositoryRoot,
    stdio: "inherit"
  });

  if (install.error) {
    throw new Error(`Could not run npm ci: ${install.error.message}`);
  }
  if (install.status !== 0) {
    process.exit(install.status ?? 1);
  }
}
