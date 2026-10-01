import { createAI, leuria, promptAPI } from "@leuria/client";
import { pageEmbedder } from "@leuria/web-embed";

// Chat: the visitor's own AI, then the browser's. Embeddings: the
// visitor's own model through Leuria, then a small one in the page.
export const ai = createAI({
	providers: [leuria({ app: "Maren's notebook (demo)", needs: { tools: true, effort: "light" } }), promptAPI(), pageEmbedder()],
});
