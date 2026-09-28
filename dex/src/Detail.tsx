import { useStore } from "@sinuxjs/react";
import { useEffect } from "react";

import { dexStore } from "./app.store";
import { ElementChip } from "./Chips";
import { chain, type Creature, number, strengths, weaknesses } from "./data";
import { useIndexState } from "./hooks";
import { Portrait } from "./Portrait";

const STATS: Array<[keyof Creature["stats"], string]> = [
	["hp", "Stamina"],
	["attack", "Attack"],
	["defense", "Defence"],
	["speed", "Speed"],
	["focus", "Focus"],
];

export function Detail({ creature }: { creature: Creature }) {
	const similar = useStore(dexStore, (s) => s.similar);
	const indexStatus = useIndexState().status;
	const line = chain(creature);

	useEffect(() => {
		if (indexStatus === "ready") void dexStore.loadSimilar();
	}, [creature.id, indexStatus]);

	return (
		<article className="detail">
			<a href="#/" className="back">
				← All creatures
			</a>
			<div className="detail-head">
				<div className="detail-art">
					<Portrait creature={creature} size={220} />
				</div>
				<div>
					<p className="num">{number(creature.id)}</p>
					<h1>{creature.name}</h1>
					<p className="species">{creature.species}</p>
					<div className="chips">
						{creature.elements.map((e) => (
							<ElementChip key={e} id={e} />
						))}
					</div>
					<p className="desc">{creature.description}</p>
					<dl className="facts">
						<div>
							<dt>Habitat</dt>
							<dd>{creature.habitat}</dd>
						</div>
						<div>
							<dt>Height</dt>
							<dd>{creature.height} m</dd>
						</div>
						<div>
							<dt>Weight</dt>
							<dd>{creature.weight} kg</dd>
						</div>
						<div>
							<dt>Abilities</dt>
							<dd>{creature.abilities.join(", ")}</dd>
						</div>
					</dl>
				</div>
			</div>

			<div className="detail-grid">
				<section className="panel">
					<h2>Stats</h2>
					{STATS.map(([key, label]) => (
						<div key={key} className="stat">
							<span>{label}</span>
							<span className="stat-bar">
								<i style={{ width: `${(creature.stats[key] / 130) * 100}%` }} />
							</span>
							<b>{creature.stats[key]}</b>
						</div>
					))}
				</section>
				<section className="panel">
					<h2>Matchups</h2>
					<p className="label">Strong against</p>
					<div className="chips">
						{strengths(creature).map((e) => (
							<ElementChip key={e.id} id={e.id} />
						))}
					</div>
					<p className="label">Weak against</p>
					<div className="chips">
						{weaknesses(creature).map((e) => (
							<ElementChip key={e.id} id={e.id} />
						))}
					</div>
				</section>
				{line.length > 1 && (
					<section className="panel panel-wide">
						<h2>Line</h2>
						<div className="line">
							{line.map((c, i) => (
								<a key={c.id} href={`#/creature/${c.id}`} className={c.id === creature.id ? "line-item current" : "line-item"}>
									{i > 0 && <span className="arrow">→</span>}
									<Portrait creature={c} size={72} />
									<span>{c.name}</span>
								</a>
							))}
						</div>
					</section>
				)}
				<section className="panel panel-wide">
					<h2>Close in nature</h2>
					{indexStatus !== "ready" ? (
						<p className="muted">Appears once search by meaning is on.</p>
					) : (
						<div className="line">
							{similar.map((c) => (
								<a key={c.id} href={`#/creature/${c.id}`} className="line-item">
									<Portrait creature={c} size={72} />
									<span>{c.name}</span>
								</a>
							))}
						</div>
					)}
				</section>
			</div>
		</article>
	);
}
