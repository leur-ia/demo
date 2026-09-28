#!/usr/bin/env node
// Serves a folder (default: the built showroom) on http://localhost:4173.
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(process.argv[2] ?? fileURLToPath(new URL("../dist", import.meta.url)));
const port = Number(process.env.PORT ?? 4173);
const types = {
	".html": "text/html; charset=utf-8",
	".js": "text/javascript",
	".css": "text/css",
	".json": "application/json",
	".svg": "image/svg+xml",
	".woff2": "font/woff2",
	".wasm": "application/wasm",
};

if (!existsSync(root)) {
	console.error(`Nothing at ${root}. Build it first: pnpm build`);
	process.exit(1);
}

createServer((req, res) => {
	let file = normalize(join(root, decodeURIComponent(new URL(req.url ?? "/", "http://localhost").pathname)));
	if (!file.startsWith(root)) return void res.writeHead(403).end();
	if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
	if (!existsSync(file)) return void res.writeHead(404).end("Not found");
	res.writeHead(200, { "Content-Type": types[extname(file)] ?? "application/octet-stream" });
	createReadStream(file).pipe(res);
}).listen(port, "localhost", () => console.log(`Showroom on http://localhost:${port}`));
