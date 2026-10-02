import { useExposedTools, useLeuria, useProvider } from "@leuria/react";
import { ConnectButton, LeuriaBadge } from "@leuria/react-connect";
import { useStore } from "@sinuxjs/react";
import { useEffect } from "react";

import { smallModelSize, useIndexState } from "../../shared/search";
import { SHOWROOM_URL } from "../../shared/showroom";

import { dexStore } from "./app.store";
import { ElementChip } from "./Chips";
import { creatureById, creatures, elements, index as creatureIndex, number, searchExamples } from "./data";
import { Detail } from "./Detail";
import { Portrait } from "./Portrait";
import { TeamBuilder } from "./TeamBuilder";
import { pageTools } from "./tools";

export function App() {
	const view = useStore(dexStore, (s) => s.view);
	const creature = view.kind === "creature" ? creatureById.get(view.id) : undefined;
	// The guide's tools, for the browser's own agents too.
	useExposedTools(pageTools);

	return (
		<>
			<header className="top">
				<div className="top-inner">
					<a className="demo-back" href={SHOWROOM_URL}>
						← All demos
					</a>
					<a href="#/" className="brand">
						<span className="brand-mark" aria-hidden>
							◐
						</span>
						Hollowmark <em>field guide</em>
					</a>
					<nav className="top-nav">
						<a href="#/">Creatures</a>
						<a href="#/team">Team builder</a>
					</nav>
					<ConnectButton className="top-connect" />
				</div>
			</header>
			<main className="main">{view.kind === "team" ? <TeamBuilder /> : creature ? <Detail creature={creature} /> : <Grid />}</main>
			<footer className="foot">
				<span>An original bestiary made for Leuria's demos.</span>
				<LeuriaBadge />
			</footer>
		</>
	);
}

function Grid() {
	const { element, query, hits, words, searching } = useStore(dexStore);
	const index = useIndexState(creatureIndex);

	useEffect(() => {
		const timer = setTimeout(() => void dexStore.runSearch(), 250);
		return () => clearTimeout(timer);
	}, [query, index.status]);

	const searchingByMeaning = query.trim() !== "" && index.status === "ready";
	const shown = searchingByMeaning
		? hits
		: query.trim()
			? words
			: creatures.filter((c) => !element || c.elements.includes(element));

	return (
		<>
			<section className="hero">
				<h1>48 creatures of the Hollowmark.</h1>
				<p className="muted">Describe what you're looking for in your own words: the guide searches by meaning, with your AI or a small model in this page.</p>
				<input
					className="search"
					value={query}
					onChange={(e) => void dexStore.setQuery(e.target.value)}
					placeholder="A creature that could guard my house at night…"
					aria-label="Describe a creature"
				/>
				<SearchStatus />
				{!query.trim() && (
					<div className="examples">
						{searchExamples.slice(0, 5).map((q) => (
							<button key={q} type="button" className="chip" onClick={() => void dexStore.setQuery(q)}>
								{q}
							</button>
						))}
					</div>
				)}
				{query.trim() && (
					<p className="words">
						{searchingByMeaning ? (searching ? "Searching…" : "Closest in meaning first.") : "Search by meaning is off: matching words only."} Words alone find {words.length}{" "}
						{words.length === 1 ? "creature" : "creatures"}.
					</p>
				)}
			</section>
			{!query.trim() && (
				<div className="filters">
					{elements.map((e) => (
						<button key={e.id} type="button" className={element === e.id ? "filter on" : "filter"} onClick={() => void dexStore.filter(e.id)} aria-pressed={element === e.id}>
							<ElementChip id={e.id} />
						</button>
					))}
				</div>
			)}
			<ul className="grid">
				{shown.map((c) => (
					<li key={c.id}>
						<a href={`#/creature/${c.id}`} className="card tile">
							<span className="num">{number(c.id)}</span>
							<Portrait creature={c} size={112} />
							<strong>{c.name}</strong>
							<span className="species">{c.species}</span>
							<div className="chips">
								{c.elements.map((e) => (
									<ElementChip key={e} id={e} />
								))}
							</div>
						</a>
					</li>
				))}
			</ul>
		</>
	);
}

/** Search by meaning: on (with which model), getting ready, or how to turn it on. */
function SearchStatus() {
	const ai = useLeuria();
	const index = useIndexState(creatureIndex);
	const page = useProvider("page-embed");
	if (index.status === "ready") {
		return <p className="status">Search by meaning is on · {index.model?.id === "bridge" ? "your AI, on this computer" : "a small model in this page"}</p>;
	}
	if (index.status === "indexing") return <p className="status">Reading the guide… {index.done} of {index.total}</p>;
	if (page?.status === "downloading") return <p className="status">Getting the search model… {Math.round((page.progress ?? 0) * 100)}%</p>;
	return (
		<p className="status">
			Search by meaning is off. Connect your AI, or{" "}
			<button type="button" className="link" onClick={() => void ai.connect("page-embed").catch(() => undefined)}>
				use a small model in this page
			</button>{" "}
			({smallModelSize(page)}, kept in your browser).
		</p>
	);
}
