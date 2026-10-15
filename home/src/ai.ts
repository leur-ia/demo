import { createAI, leuria, promptAPI } from "@leuria/client";

// The visitor's own models first (a decision model on their computer, their AI for words); then the browser's model for words.
export const ai = createAI({
	providers: [leuria({ app: "Hearth (demo)", needs: { decide: true, effort: "light" } }), promptAPI()],
});
