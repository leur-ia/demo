import { defineTool } from "@leuria/client";

export interface Product {
	id: string;
	name: string;
	description: string;
	price: number;
	stock: number;
	/** Glaze colour, for the picture. */
	glaze: string;
}

export const products: Product[] = [
	{ id: "blue", name: "Blue mug", description: "Cobalt glaze, 350 ml. Our best seller for coffee.", price: 12, stock: 42, glaze: "#3f67a8" },
	{ id: "green", name: "Green mug", description: "Celadon glaze, 300 ml. Back in the kiln soon.", price: 9, stock: 0, glaze: "#6f9a74" },
	{ id: "white", name: "Plain white mug", description: "Satin white, 400 ml. Big enough for tea.", price: 7, stock: 130, glaze: "#efe9df" },
];

export const searchProducts = defineTool<{ query?: string }>({
	name: "search_products",
	description:
		"Search the shop's products. Returns id, name, description, price in euros and stock for each match. An empty query returns all products.",
	inputSchema: { type: "object", properties: { query: { type: "string" } } },
	annotations: { readOnlyHint: true },
	execute: ({ query = "" }) =>
		products
			.filter((p) => `${p.name} ${p.description}`.toLowerCase().includes(query.toLowerCase()))
			.map(({ glaze: _glaze, ...product }) => product),
});

/** What each tool call looks like to a shopper. */
export const toolWords: Record<string, string> = {
	search_products: "Looked through the shop's mugs",
};
