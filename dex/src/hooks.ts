import { useSyncExternalStore } from "react";

import { index } from "./data";

export function useIndexState() {
	return useSyncExternalStore(index.subscribe, index.getState, index.getState);
}
