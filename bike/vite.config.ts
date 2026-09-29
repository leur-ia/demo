import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { leuriaAliases, leuriaDedupe } from "../leuria-aliases.mjs";

export default defineConfig({
	plugins: [react()],
	resolve: { alias: leuriaAliases, dedupe: leuriaDedupe },
	server: { port: 5177, strictPort: true },
	build: { target: "es2022" },
});
