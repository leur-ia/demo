import { bridge, browserAI, createLeuria } from "@leuria/client";
import { pageEmbedder } from "@leuria/web-embed";

export const ai = createLeuria({
	providers: [bridge({ app: "Hollowmark field guide (demo)", needs: { tools: true, effort: "standard" } }), browserAI(), pageEmbedder()],
});
