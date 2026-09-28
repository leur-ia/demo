import { defineTool } from "@leuria/client";

import { orderStore } from "./order.store";
import { products, searchProducts } from "./products";

type Order = { name?: string; phone?: string; address?: string; product?: string; quantity?: number };

/** For the browser's agents: fill in the quick order form. The visitor still reviews and sends it. */
export const fillOrderForm = defineTool<Order>({
	name: "fill_order_form",
	description: `Fill in the shop's quick order form on this page for the visitor to review. product is one of: ${products.map((p) => p.id).join(", ")}.`,
	inputSchema: {
		type: "object",
		properties: {
			name: { type: "string" },
			phone: { type: "string" },
			address: { type: "string" },
			product: { type: "string", enum: products.map((p) => p.id) },
			quantity: { type: "integer", minimum: 1 },
		},
	},
	execute: (order) => {
		void orderStore.fill(order);
		document.getElementById("order")?.scrollIntoView({ behavior: "smooth" });
		return { filled: Object.keys(order), note: "The visitor reviews the form before anything is sent." };
	},
});

/** What the page offers the browser's own agents (WebMCP). */
export const pageTools = [searchProducts, fillOrderForm];
