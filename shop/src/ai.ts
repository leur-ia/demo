import { bridge, browserAI, createLeuria } from "@leuria/client";

// The visitor's own AI first, then the browser's built-in model. The
// assistant and the order form use the page's tools for quick tasks: Leuria
// recommends a model that fits, and no bigger.
export const ai = createLeuria({ providers: [bridge({ app: "Kiln & Co. (demo)", needs: { tools: true, effort: "light" } }), browserAI()] });
