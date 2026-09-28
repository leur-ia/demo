import { createStore } from "@sinuxjs/core";

import { type Creature, creatureById, keywordCreatures, searchCreatures, similarCreatures } from "./data";

export type View = { kind: "grid" } | { kind: "creature"; id: number } | { kind: "team" };

export interface DexState {
	view: View;
	/** Element filter on the grid. */
	element: string | null;
	query: string;
	hits: Array<{ creature: Creature; score: number }>;
	words: Creature[];
	searching: boolean;
	similar: Creature[];
}

function viewFromHash(): View {
	const [, kind, id] = location.hash.split("/");
	if (kind === "creature" && creatureById.has(Number(id))) return { kind: "creature", id: Number(id) };
	if (kind === "team") return { kind: "team" };
	return { kind: "grid" };
}

let searchToken = 0;

export const dexStore = createStore(
	{ view: viewFromHash(), element: null, query: "", hits: [], words: [], searching: false, similar: [] } as DexState,
	{
		route: () => ({ view: viewFromHash(), similar: [] }),
		filter: (state: DexState, element: string | null) => ({ element: state.element === element ? null : element }),
		setQuery: (_state: DexState, query: string) => ({ query, words: keywordCreatures(query), searching: Boolean(query.trim()) }),
		runSearch: async (state: DexState): Promise<Partial<DexState>> => {
			const token = ++searchToken;
			if (!state.query.trim()) return { hits: [], searching: false };
			try {
				const hits = await searchCreatures(state.query);
				return token === searchToken ? { hits, searching: false } : {};
			} catch {
				return token === searchToken ? { hits: [], searching: false } : {};
			}
		},
		loadSimilar: async (state: DexState): Promise<Partial<DexState>> => {
			if (state.view.kind !== "creature") return {};
			try {
				return { similar: await similarCreatures(state.view.id) };
			} catch {
				return { similar: [] };
			}
		},
	},
);

addEventListener("hashchange", () => {
	void dexStore.route();
	scrollTo({ top: 0 });
});
