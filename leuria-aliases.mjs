import { fileURLToPath } from "node:url";

/** @param {string} path */
const pkg = (path) => fileURLToPath(new URL(`../leuria/packages/${path}`, import.meta.url));

/**
 * The demos load the Leuria packages from source, in the leuria repo next
 * to this one: no build step, and edits to them reload the demo. Remove
 * these aliases (and the overrides in pnpm-workspace.yaml) to use the
 * published packages.
 */
/** @type {import("vite").Alias[]} */
export const leuriaAliases = [
	{ find: /^@leuria\/client$/, replacement: pkg("client/src/index.ts") },
	{ find: /^@leuria\/react$/, replacement: pkg("react/src/index.ts") },
	{ find: /^@leuria\/connect$/, replacement: pkg("connect/src/index.ts") },
	{ find: /^@leuria\/connect\/standalone$/, replacement: pkg("connect/src/standalone.ts") },
	{ find: /^@leuria\/react-connect$/, replacement: pkg("react-connect/src/index.ts") },
	{ find: /^@leuria\/store$/, replacement: pkg("store/src/index.ts") },
	{ find: /^@leuria\/web-embed$/, replacement: pkg("web-embed/src/index.ts") },
];

/**
 * The Leuria sources sit in another repo with its own node_modules: without
 * this, they would import that repo's React, a second copy, and hooks break.
 */
export const leuriaDedupe = ["react", "react-dom"];
