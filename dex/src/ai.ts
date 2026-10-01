import { createAI, leuria, promptAPI } from "@leuria/client";
import { pageEmbedder } from "@leuria/web-embed";

export const ai = createAI({
	providers: [leuria({ app: "Hollowmark field guide (demo)", needs: { tools: true, effort: "standard" } }), promptAPI(), pageEmbedder()],
});
