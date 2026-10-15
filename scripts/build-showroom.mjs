#!/usr/bin/env node
// Builds every demo into one static site, dist/, ready for any
// static host:  /  the showroom · /shop/ (and /shop/plain.html) · /notes/ · /dex/ · /bike/ · /home/
import { execFileSync } from "node:child_process";
import { copyFileSync, cpSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "../dist");
const demos = ["shop", "notes", "dex", "bike", "home"];

rmSync(out, { recursive: true, force: true });
for (const demo of demos) {
	console.log(`Building ${demo}…`);
	execFileSync("pnpm", ["exec", "vite", "build", "--base", `./`, "--outDir", join(out, demo), "--emptyOutDir"], {
		cwd: join(here, "..", demo),
		stdio: ["ignore", "ignore", "inherit"],
	});
}

mkdirSync(join(out, "fonts"), { recursive: true });
copyFileSync(join(here, "../showroom/index.html"), join(out, "index.html"));
copyFileSync(join(here, "../shared/consent.js"), join(out, "consent.js"));
copyFileSync(join(here, "../../leuria/packages/pearl/src/tokens.css"), join(out, "tokens.css"));
copyFileSync(join(here, "../../leuria/packages/connect/fonts/plus-jakarta-sans-latin-wght-normal.woff2"), join(out, "fonts/plus-jakarta-sans-latin-wght-normal.woff2"));
// The showroom's own pictures (each demo's first screen) and the SDK it runs on, for its live "your AI" slot.
cpSync(join(here, "../showroom/shots"), join(out, "shots"), { recursive: true });
cpSync(join(here, "../../leuria/packages/connect/dist"), join(out, "leuria"), { recursive: true, filter: (src) => !src.endsWith(".d.ts") });
// The Leuria mark, for every demo: they all live under one origin.
for (const icon of ["favicon.ico", "favicon.svg", "apple-touch-icon.png"]) copyFileSync(join(here, "../shared/icons", icon), join(out, icon));
console.log(`Showroom in ${out}`);
