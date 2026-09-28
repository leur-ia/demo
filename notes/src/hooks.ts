import { useSyncExternalStore } from "react";

import { index } from "./vault";

export function useIndexState() {
	return useSyncExternalStore(index.subscribe, index.getState, index.getState);
}

/** "text-embedding-nomic-embed-text-v1.5" → "nomic-embed-text-v1.5"; "Xenova/all-MiniLM-L6-v2" → "all-MiniLM-L6-v2". */
export function modelName(model: string): string {
	return (model.split("/").pop() ?? model).replace(/^text-embedding-/, "");
}
