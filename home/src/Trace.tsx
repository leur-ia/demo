import type React from "react";
import { useState } from "react";

import type { Answers, Trace } from "./house";

/** Every question of a decision, with what the model answered: the top option bold, the rest faded. */
export function DecisionTrace({ traces }: { traces: Trace[] }) {
	if (traces.length === 0) {
		return (
			<section className="trace" aria-label="Decision trace">
				<h2>Decision trace</h2>
				<p className="trace-empty">Every request is read by a decision model: all the questions at once, each with its probabilities. They show up here.</p>
			</section>
		);
	}
	return (
		<section className="trace" aria-label="Decision trace">
			<h2>Decision trace</h2>
			{traces.map((trace, i) => (
				<TraceCard key={`${traces.length}-${i}`} trace={trace} open={i === 0} />
			))}
		</section>
	);
}

function TraceCard({ trace, open: initiallyOpen }: { trace: Trace; open: boolean }) {
	const [open, setOpen] = useState(initiallyOpen);
	const ids = Object.keys(trace.questions) as Array<string & keyof Answers>;
	return (
		<article className={open ? "trace-card open" : "trace-card"}>
			<button type="button" className="trace-head" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
				<span className="trace-request">“{trace.request}”</span>
				<span className="trace-meta">
					<b>{trace.model}</b> · {ids.length} questions · {trace.ms} ms{trace.spoke ? ` · words by ${trace.spoke}` : ""}
				</span>
				<span className="trace-outcome">{trace.outcome}</span>
			</button>
			{open && (
				<ol className="trace-list">
					{ids.map((id, i) => (
						<Question key={id} id={id} index={i} question={trace.questions[id]} answer={trace.answers[id]} />
					))}
				</ol>
			)}
		</article>
	);
}

function Question({ id, index, question, answer }: { id: string; index: number; question: { type: string; instructions: unknown }; answer: Answers[keyof Answers] }) {
	const text = String(question.instructions).replace(/`request`/g, "the request");
	// Each question settles a beat after the one before (see .q in home.css).
	const stagger = { "--i": index } as React.CSSProperties;
	if (answer.type === "noul") {
		const yes = answer.noul;
		return (
			<li className={yes > 0.5 ? "q relevant" : "q"} style={stagger}>
				<span className="q-type noul">noul</span>
				<div className="q-body">
					<span className="q-text">{text}</span>
					<span className="q-options">
						<span className={yes > 0.5 ? "opt top" : "opt"}>yes {yes.toFixed(2)}</span>
						<span className={yes <= 0.5 ? "opt top" : "opt"}>no {(1 - yes).toFixed(2)}</span>
					</span>
				</div>
				<Confidence value={Math.abs(yes - 0.5) * 2} />
			</li>
		);
	}
	const options = Object.entries(answer.probabilities as Record<string, number>).sort((a, b) => b[1] - a[1]);
	const relevant = answer.confidence >= 0.5 && !/^none_of_these$/.test(answer.choice);
	return (
		<li className={relevant ? "q relevant" : "q"} data-id={id} style={stagger}>
			<span className="q-type">choice</span>
			<div className="q-body">
				<span className="q-text">{text}</span>
				<span className="q-options">
					{options.map(([option, p]) => (
						<span key={option} className={option === answer.choice ? "opt top" : "opt"}>
							{option} {p.toFixed(2)}
						</span>
					))}
				</span>
			</div>
			<Confidence value={answer.confidence} />
		</li>
	);
}

function Confidence({ value }: { value: number }) {
	const level = value >= 0.8 ? "high" : value >= 0.5 ? "mid" : "low";
	return (
		<span className={`confidence ${level}`} title="Confidence">
			{value.toFixed(2)}
		</span>
	);
}
