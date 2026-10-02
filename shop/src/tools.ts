import { defineTool } from "@leuria/client";

import { type Order, orderSchema, orderStore } from "./order.store";
import { products, searchProducts } from "./products";

/** For the browser's agents: fill in the quick order form. The visitor still reviews and sends it. */
export const fillOrderForm = defineTool<Order>({
	name: "fill_order_form",
	description: `Fill in the shop's quick order form on this page for the visitor to review. product is one of: ${products.map((p) => p.id).join(", ")}.`,
	inputSchema: orderSchema,
	execute: (order) => {
		void orderStore.fill(order);
		document.getElementById("order")?.scrollIntoView({ behavior: "smooth" });
		return { filled: Object.keys(order), note: "The visitor reviews the form before anything is sent." };
	},
});

/** What the page offers the browser's own agents (WebMCP). */
export const pageTools = [searchProducts, fillOrderForm];
