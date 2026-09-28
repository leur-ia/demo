import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { leuriaAliases, leuriaDedupe } from "../leuria-aliases.mjs";

export default defineConfig({
	plugins: [react()],
	resolve: { alias: leuriaAliases, dedupe: leuriaDedupe },
	server: { port: 5173, strictPort: true },
	build: {
		target: "es2022",
		// Two pages: the React shop, and the same shop in plain HTML.
		rollupOptions: { input: { react: "index.html", plain: "plain.html" } },
	},
});
