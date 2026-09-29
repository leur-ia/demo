import { bridge, browserAI, createLeuria } from "@leuria/client";

/** Where this page lives ("/" in development, "/bike/" on demo.leuria.dev): its skills are under it. */
export const siteRoot = location.pathname.replace(/[^/]*$/, "");

/**
 * The workshop's skills: its own (diagnose, book, warranty) from
 * `.well-known/agent-skills` on this site, and one shared by bike sites,
 * from GitHub, pinned to a commit.
 */
export const SHARED_SKILL = "leur-ia/demo@abc-quick-check#8ad0704615c42416e4840cffcd8da8cb24fa890e";

// The visitor's own AI first, with the workshop's skills; then the browser's model.
export const ai = createLeuria({
	providers: [
		bridge({ app: "Rayon Cycles (demo)", needs: { tools: true, effort: "standard" }, skills: [siteRoot, SHARED_SKILL] }),
		browserAI(),
	],
});
