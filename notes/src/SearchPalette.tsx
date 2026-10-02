import { useStore } from "@sinuxjs/react";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";

import { useIndexState } from "../../shared/search";

import { appStore } from "./app.store";
import { index, queries } from "./vault";

/** ⌘K: search by meaning, with what words alone would find beside it. */
export function SearchPalette() {
	const { searchOpen: open, query, hits, words, searching: busy, searchError: error } = useStore(appStore);
	const status = useIndexState(index).status;
	const dialog = useRef<HTMLDialogElement>(null);
	const [cursor, setCursor] = useState(0);

	useEffect(() => {
		const onKey = (event: globalThis.KeyboardEvent) => {
			if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
				event.preventDefault();
				void appStore.openSearch();
			}
		};
		addEventListener("keydown", onKey);
		return () => removeEventListener("keydown", onKey);
	}, []);

	// A modal <dialog>: Escape, the backdrop and focus come with it.
	useEffect(() => {
		if (open) dialog.current?.showModal();
		else dialog.current?.close();
	}, [open]);

	// Search as the visitor types, once they pause.
	useEffect(() => {
		setCursor(0);
		const timer = setTimeout(() => void appStore.runSearch(), 250);
		return () => clearTimeout(timer);
	}, [query, status]);

	// Closeness shown against the best hit: raw scores depend on the model.
	const top = Math.max(0.01, hits[0]?.score ?? 1);

	const go = (slug: string) => {
		location.hash = `#/${slug}`;
		void appStore.closeSearch();
	};
	const onKeyDown = (event: KeyboardEvent) => {
		if (event.key === "ArrowDown") setCursor((c) => Math.min(c + 1, hits.length - 1));
		else if (event.key === "ArrowUp") setCursor((c) => Math.max(c - 1, 0));
		else if (event.key === "Enter" && hits[cursor]) go(hits[cursor].note.slug);
		else return;
		event.preventDefault();
	};

	return (
		<dialog
			ref={dialog}
			className="palette-dialog"
			aria-label="Search the notebook"
			onClose={() => void appStore.closeSearch()}
			// Only the backdrop is the dialog itself: the palette fills it.
			onMouseDown={(e) => e.target === e.currentTarget && dialog.current?.close()}
		>
			<div className="palette">
				<input
					value={query}
					onChange={(e) => void appStore.setQuery(e.target.value)}
					onKeyDown={onKeyDown}
					placeholder="Search by meaning: describe what you're looking for…"
					aria-label="Search"
				/>
				{status !== "ready" && <p className="palette-note">Search by meaning is off. Turn it on in the right column; until then, only exact words match.</p>}
				{!query.trim() && queries.length > 0 && (
					<div className="palette-suggest">
						<span className="muted">Try</span>
						{queries.slice(0, 6).map((q) => (
							<button key={q.query} type="button" className="chip" onClick={() => void appStore.setQuery(q.query)}>
								{q.query}
							</button>
						))}
					</div>
				)}
				{query.trim() && (
					<>
						<ul className="results" role="listbox">
							{hits.map((hit, i) => (
								<li key={hit.note.slug} role="option" aria-selected={i === cursor}>
									<button type="button" className={i === cursor ? "result active" : "result"} onMouseEnter={() => setCursor(i)} onClick={() => go(hit.note.slug)}>
										<span className="result-title">{hit.note.title}</span>
										<span className="result-snippet">{hit.snippet.slice(0, 180)}…</span>
										<span className="score" aria-hidden>
											<i style={{ width: `${Math.max(4, Math.round((hit.score / top) * 100))}%` }} />
										</span>
									</button>
								</li>
							))}
						</ul>
						{busy && hits.length === 0 && <p className="palette-note">Looking…</p>}
						{error && <p className="palette-note">{error}</p>}
						<p className="palette-words">
							{words.length === 0
								? "Words alone: no note contains all these words."
								: `Words alone: ${words.length} note${words.length > 1 ? "s" : ""} (${words
										.slice(0, 3)
										.map((n) => n.title)
										.join(", ")}${words.length > 3 ? "…" : ""}).`}
						</p>
					</>
				)}
			</div>
		</dialog>
	);
}
