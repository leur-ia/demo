import { NoProviderError } from "@leuria/client";
import { AIStatus } from "@leuria/react-connect";
import { useChat } from "@leuria/react";
import { useState } from "react";

import { ElementChip } from "./Chips";
import { creatureById, teamExamples } from "./data";
import { Portrait } from "./Portrait";
import { guideForRequest, guideTools } from "./tools";

interface Team {
	team: Array<{ id: number; role: string; why: string }>;
	summary: string;
}

const teamSchema = {
	type: "object",
	properties: {
		team: {
			type: "array",
			minItems: 1,
			maxItems: 6,
			items: {
				type: "object",
				properties: { id: { type: "integer" }, role: { type: "string" }, why: { type: "string" } },
				required: ["id", "role", "why"],
			},
		},
		summary: { type: "string" },
	},
	required: ["team", "summary"],
};

/** Describe a situation, get a team: structured output checked against the guide. */
export function TeamBuilder() {
	const { status, progress, error, start } = useChat();
	const [prompt, setPrompt] = useState(teamExamples[0] ?? "");
	const [team, setTeam] = useState<Team | null>(null);
	const busy = status === "running";

	const build = async () => {
		setTeam(null);
		try {
			const result = await start<Team>({
				system:
					"You build teams from the Hollowmark field guide. Use the tools to find creatures and check matchups; only pick creatures that exist in the guide. Give each member a short role and a one-sentence reason, and a two-sentence summary.",
				prompt,
				tools: guideTools,
				// This browser's AI can't look things up itself: the page finds the likely creatures for it.
				withoutTools: guideForRequest,
				schema: teamSchema,
				validate: (value) => {
					const t = value as Team;
					const unknown = t.team.filter((m) => !creatureById.has(m.id)).map((m) => m.id);
					if (unknown.length) throw new Error(`These ids are not in the guide: ${unknown.join(", ")}`);
					return t;
				},
			}).object();
			setTeam(result);
		} catch {
			// Shown from the hook's state.
		}
	};

	return (
		<section className="team">
			<a href="#/" className="back">
				← All creatures
			</a>
			<div className="team-head">
				<div>
					<h1>Team builder</h1>
					<p className="muted">Describe the trip or the opponent. The guide's AI picks a team from the creatures in this book, and explains why.</p>
				</div>
				<AIStatus />
			</div>
			<textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} aria-label="What the team is for" />
			<div className="team-examples">
				{teamExamples.map((p) => (
					<button key={p} type="button" className="chip" onClick={() => setPrompt(p)}>
						{p}
					</button>
				))}
			</div>
			<button type="button" className="btn" onClick={build} disabled={busy || !prompt.trim()}>
				{busy ? (progress ?? "Building a team…") : "Build a team"}
			</button>
			{status === "error" && error && (
				<p className="error" role="alert">
					{error instanceof NoProviderError ? "Connect your AI at the top of the page to build a team." : "No team this time. Try again, or describe it differently."}
				</p>
			)}
			{team && (
				<div className="team-result">
					<p className="summary">{team.summary}</p>
					<div className="team-grid">
						{team.team.map((m) => {
							const c = creatureById.get(m.id)!;
							return (
								<a key={m.id} href={`#/creature/${c.id}`} className="card member">
									<Portrait creature={c} size={96} />
									<strong>{c.name}</strong>
									<span className="role">{m.role}</span>
									<div className="chips">
										{c.elements.map((e) => (
											<ElementChip key={e} id={e} />
										))}
									</div>
									<p>{m.why}</p>
								</a>
							);
						})}
					</div>
				</div>
			)}
		</section>
	);
}
