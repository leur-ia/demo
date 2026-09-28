import { createStore } from "@sinuxjs/core";

import { keywordNotes, type Note, type NoteHit, notes, noteBySlug, relatedNotes, searchNotes } from "./vault";

export interface AppState {
	slug: string;
	/** Right column: notes related by meaning, or the assistant. */
	panel: "related" | "ask";
	related: NoteHit[];
	searchOpen: boolean;
	query: string;
	hits: NoteHit[];
	/** What words alone find, for comparison. */
	words: Note[];
	searching: boolean;
	searchError: string;
}

const HOME = noteBySlug.has("studio-routine") ? "studio-routine" : (notes[0]?.slug ?? "");

function slugFromHash(): string {
	const slug = decodeURIComponent(location.hash.replace(/^#\/?/, ""));
	return noteBySlug.has(slug) ? slug : HOME;
}

/** Only the latest search may land. */
let searchToken = 0;

export const appStore = createStore(
	{
		slug: slugFromHash(),
		panel: "related",
		related: [],
		searchOpen: false,
		query: "",
		hits: [],
		words: [],
		searching: false,
		searchError: "",
	} as AppState,
	{
		/** Follow the address bar (links are `#/slug`). */
		route: (state: AppState) => {
			const slug = slugFromHash();
			return slug === state.slug ? {} : { slug, related: [] };
		},
		showPanel: (_state: AppState, panel: AppState["panel"]) => ({ panel }),
		loadRelated: async (state: AppState): Promise<Partial<AppState>> => {
			try {
				return { related: await relatedNotes(state.slug) };
			} catch {
				return { related: [] };
			}
		},
		openSearch: () => ({ searchOpen: true }),
		closeSearch: () => ({ searchOpen: false }),
		setQuery: (_state: AppState, query: string) => ({ query, words: keywordNotes(query), searching: Boolean(query.trim()), searchError: "" }),
		runSearch: async (state: AppState): Promise<Partial<AppState>> => {
			const token = ++searchToken;
			const query = state.query.trim();
			if (!query) return { hits: [], searching: false };
			try {
				const hits = await searchNotes(query);
				return token === searchToken ? { hits, searching: false } : {};
			} catch {
				return token === searchToken ? { hits: [], searching: false, searchError: "Search by meaning isn't ready yet." } : {};
			}
		},
	},
);

addEventListener("hashchange", () => void appStore.route());
