import { readdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve("dist/site");
const assets = (await readdir(resolve(root, "assets")))
  .filter((name) => name.endsWith(".js") || name.endsWith(".css"))
  .sort()
  .map((name) => `/assets/${name}`);
const serviceWorkerPath = resolve(root, "sw.js");
const source = await readFile(serviceWorkerPath, "utf8");
const marker = "/* __PRECACHE_ASSETS__ */";
if (!source.includes(marker)) throw new Error("service worker precache marker is missing");
await writeFile(serviceWorkerPath, source.replace(marker, assets.map((asset) => JSON.stringify(asset)).join(", ")));
console.log(`precache: ${assets.length} hashed assets`);
