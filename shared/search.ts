import { useSyncExternalStore } from "react";

/** Plain word matching, to compare with search by meaning: items whose text has every word of four letters or more. */
export function keywordFilter<T>(items: T[], text: (item: T) => string, query: string): T[] {
	const words = query
		.toLowerCase()
		.split(/\W+/)
		.filter((w) => w.length > 3);
	if (words.length === 0) return [];
	return items.filter((item) => {
		const haystack = text(item).toLowerCase();
		return words.every((w) => haystack.includes(w));
	});
}

/**
 * Search as the visitor types: only the latest search may land. The result
 * is undefined when a newer search started meanwhile.
 */
export function latestSearch<H>(search: (query: string) => Promise<H[]>) {
	let token = 0;
	return async (query: string): Promise<{ hits: H[]; failed: boolean } | undefined> => {
		const mine = ++token;
		if (!query.trim()) return { hits: [], failed: false };
		try {
			const hits = await search(query.trim());
			return mine === token ? { hits, failed: false } : undefined;
		} catch {
			return mine === token ? { hits: [], failed: true } : undefined;
		}
	};
}

/** Follow an index made by `createIndex`. */
export function useIndexState<S>(index: { subscribe: (listener: () => void) => () => void; getState: () => S }): S {
	return useSyncExternalStore(index.subscribe, index.getState, index.getState);
}

/** The small in-page model's download size, from its provider's detail: "… (about 40 MB)". */
export function smallModelSize(provider: { detail?: string } | undefined): string {
	return provider?.detail?.match(/\(([^)]+)\)/)?.[1] ?? "about 40 MB";
}
