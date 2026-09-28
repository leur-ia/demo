import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { leuriaAliases, leuriaDedupe } from "../leuria-aliases.mjs";

export default defineConfig({
	plugins: [react()],
	resolve: { alias: leuriaAliases, dedupe: leuriaDedupe },
	// Transformers.js loads its WebAssembly runtime itself.
	optimizeDeps: { exclude: ["@huggingface/transformers"] },
	server: { port: 5175, strictPort: true },
	// Transformers.js (loaded only when the visitor turns the page model on) is one large chunk.
	build: { target: "es2022", chunkSizeWarningLimit: 700 },
});
