import { useExposedTools } from "@leuria/react";
import { AIStatus, ConnectButton, LeuriaBadge } from "@leuria/react-connect";
import { useStore } from "@sinuxjs/react";
import { useEffect, useMemo } from "react";

import { useIndexState } from "../../shared/search";
import { SHOWROOM_URL } from "../../shared/showroom";

import { appStore } from "./app.store";
import { Assistant } from "./Assistant";
import { IndexCard } from "./IndexCard";
import { renderNote } from "./markdown";
import { SearchPalette } from "./SearchPalette";
import { pageTools } from "./tools";
import { backlinks, index, noteBySlug, notes } from "./vault";

const TAG_ORDER = ["journal", "clay", "making", "glaze", "firing", "kiln", "failure", "tea", "studio", "market"];

export function App() {
	const { slug, panel, related } = useStore(appStore, (s) => ({ slug: s.slug, panel: s.panel, related: s.related }));
	const indexStatus = useIndexState(index).status;
	const note = noteBySlug.get(slug);
	const html = useMemo(() => (note ? renderNote(note.body) : ""), [note]);
	const linkedFrom = useMemo(() => backlinks(slug), [slug]);
	// The same tools, for the browser's own agents too.
	useExposedTools(pageTools);

	useEffect(() => {
		if (indexStatus === "ready") void appStore.loadRelated();
	}, [slug, indexStatus]);
	useEffect(() => {
		document.title = `${note?.title ?? "Notebook"} · Maren's notebook`;
		document.querySelector(".page")?.scrollTo({ top: 0 });
	}, [note]);

	const groups = useMemo(() => {
		const byTag = new Map<string, typeof notes>();
		for (const n of notes) {
			const tag = n.tags[0] ?? "other";
			byTag.set(tag, [...(byTag.get(tag) ?? []), n]);
		}
		return [...byTag.entries()].sort(([a], [b]) => (TAG_ORDER.indexOf(a) + 99) % 99 - ((TAG_ORDER.indexOf(b) + 99) % 99));
	}, []);

	return (
		<div className="layout">
			<aside className="sidebar">
				<a className="demo-back" href={SHOWROOM_URL}>
					← All demos
				</a>
				<a className="vault-name" href="#/">
					Maren's notebook
				</a>
				<button type="button" className="search-button" onClick={() => void appStore.openSearch()}>
					<span>Search by meaning</span>
					<kbd>⌘K</kbd>
				</button>
				<nav aria-label="Notes">
					{groups.map(([tag, items]) => (
						<div key={tag} className="group">
							<div className="group-name">{tag}</div>
							{items.map((n) => (
								<a key={n.slug} href={`#/${n.slug}`} className={n.slug === slug ? "file active" : "file"} aria-current={n.slug === slug ? "page" : undefined}>
									{n.title}
								</a>
							))}
						</div>
					))}
				</nav>
				<div className="sidebar-foot">
					<LeuriaBadge />
				</div>
			</aside>

			<main className="page">
				<header className="page-bar">
					<span className="crumb">{note?.tags[0] ?? "notes"} /</span>
					<ConnectButton />
				</header>
				{note && (
					<article className="note">
						<h1>{note.title}</h1>
						<div className="tags">
							{note.tags.map((t) => (
								<span key={t} className="tag">
									#{t}
								</span>
							))}
						</div>
						{/* The vault is the site's own content. */}
						<div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
						{linkedFrom.length > 0 && (
							<section className="backlinks">
								<h2>Linked from</h2>
								{linkedFrom.map((n) => (
									<a key={n.slug} href={`#/${n.slug}`}>
										{n.title}
									</a>
								))}
							</section>
						)}
					</article>
				)}
			</main>

			<aside className="side">
				<div className="side-tabs" role="tablist">
					<button type="button" role="tab" aria-selected={panel === "related"} onClick={() => void appStore.showPanel("related")}>
						Related
					</button>
					<button type="button" role="tab" aria-selected={panel === "ask"} onClick={() => void appStore.showPanel("ask")}>
						Ask the notebook
					</button>
				</div>
				{panel === "related" ? (
					<div className="side-body">
						<IndexCard />
						<h2 className="side-title">Close in meaning</h2>
						{indexStatus !== "ready" && <p className="muted">Appears once search by meaning is on.</p>}
						{related.map((hit) => (
							<a key={hit.note.slug} href={`#/${hit.note.slug}`} className="related">
								<span className="related-title">{hit.note.title}</span>
								<span className="related-snippet">{hit.snippet.slice(0, 120)}…</span>
							</a>
						))}
					</div>
				) : (
					<div className="side-body side-ask">
						<AIStatus />
						<Assistant current={slug} />
					</div>
				)}
			</aside>
			<SearchPalette />
		</div>
	);
}
