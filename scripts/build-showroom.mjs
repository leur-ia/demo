#!/usr/bin/env node
// Builds every demo into one static site, dist/, ready for any
// static host:  /  the showroom · /shop/ (and /shop/plain.html) · /notes/ · /dex/ · /bike/
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "../dist");
const demos = [
	{ dir: "shop", path: "shop" },
	{ dir: "notes", path: "notes" },
	{ dir: "dex", path: "dex" },
	{ dir: "bike", path: "bike" },
];

rmSync(out, { recursive: true, force: true });
for (const { dir, path } of demos) {
	console.log(`Building ${path}…`);
	execFileSync("pnpm", ["exec", "vite", "build", "--base", `./`, "--outDir", join(out, path), "--emptyOutDir"], {
		cwd: join(here, "..", dir),
		stdio: ["ignore", "ignore", "inherit"],
	});
}

mkdirSync(join(out, "fonts"), { recursive: true });
copyFileSync(join(here, "../showroom/index.html"), join(out, "index.html"));
copyFileSync(join(here, "../../leuria/packages/pearl/src/tokens.css"), join(out, "tokens.css"));
copyFileSync(join(here, "../../leuria/packages/connect/fonts/plus-jakarta-sans-latin-wght-normal.woff2"), join(out, "fonts/plus-jakarta-sans-latin-wght-normal.woff2"));
// The Leuria mark, for every demo: they all live under one origin.
for (const icon of ["favicon.ico", "favicon.svg", "apple-touch-icon.png"]) copyFileSync(join(here, "../shared/icons", icon), join(out, icon));
console.log(`Showroom in ${out}`);
