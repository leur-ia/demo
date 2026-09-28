import { defineTool } from "@leuria/client";

import { creatureById, creatures, elements, searchCreatures } from "./data";

/** Looking things up in the guide: for the team builder and the browser's agents. */
export const guideTools = [
	defineTool<{ query: string }>({
		name: "search_creatures",
		description: "Search the field guide by meaning (behaviour, habitat, temperament). Returns id, name, elements and species of the closest creatures.",
		inputSchema: { type: "object", properties: { query: { type: "string" } }, required: ["query"] },
		annotations: { readOnlyHint: true },
		execute: async ({ query }) => {
			try {
				return (await searchCreatures(query, 6)).map(({ creature: c }) => ({ id: c.id, name: c.name, elements: c.elements, species: c.species }));
			} catch {
				return { error: "Search by meaning is off; use list_creatures." };
			}
		},
	}),
	defineTool({
		name: "list_creatures",
		description: "Every creature: id, name, elements, stats total, and whether it is rare.",
		inputSchema: { type: "object", properties: {} },
		annotations: { readOnlyHint: true },
		execute: () =>
			creatures.map((c) => ({
				id: c.id,
				name: c.name,
				elements: c.elements,
				total: Object.values(c.stats).reduce((a, b) => a + b, 0),
				rare: /rare/i.test(c.species),
			})),
	}),
	defineTool<{ id: number }>({
		name: "get_creature",
		description: "A creature's full entry: description, habitat, stats, abilities.",
		inputSchema: { type: "object", properties: { id: { type: "integer" } }, required: ["id"] },
		annotations: { readOnlyHint: true },
		execute: ({ id }) => {
			const c = creatureById.get(id);
			if (!c) throw new Error(`No creature ${id}`);
			const { colors: _colors, shape: _shape, ...entry } = c;
			return entry;
		},
	}),
	defineTool({
		name: "element_chart",
		description: "Which element is strong and weak against which.",
		inputSchema: { type: "object", properties: {} },
		annotations: { readOnlyHint: true },
		execute: () => elements.map(({ id, strongAgainst, weakAgainst }) => ({ id, strongAgainst, weakAgainst })),
	}),
];

/** For the browser's agents: show a creature's page to the visitor. */
const openTool = defineTool<{ id: number }>({
	name: "open_creature",
	description: "Open a creature's page on screen for the visitor, by its id.",
	inputSchema: { type: "object", properties: { id: { type: "integer" } }, required: ["id"] },
	execute: ({ id }) => {
		const creature = creatureById.get(id);
		if (!creature) throw new Error(`No creature ${id}`);
		location.hash = `#/creature/${id}`;
		return { opened: creature.name };
	},
});

/** What the page offers the browser's own agents (WebMCP). */
export const pageTools = [...guideTools, openTool];
