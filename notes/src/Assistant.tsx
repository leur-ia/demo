import { type Message, NoProviderError } from "@leuria/client";
import { useConversation } from "@leuria/react";
import { type FormEvent, Fragment, type ReactNode, useEffect, useRef, useState } from "react";

import { assistantTools } from "./tools";
import { noteBySlug, slugForTitle } from "./vault";

const TOOL_WORDS: Record<string, string> = { search_notes: "Searched the notes", list_notes: "Looked at the list of notes", read_note: "Read a note" };

/** Answers from the notebook, citing notes as links. */
export function Assistant({ current }: { current: string }) {
	const { messages, status, error, session, send, stop } = useConversation({
		system:
			"You are the guide to Maren's notebook, the notes of a potter. Answer only from the notes: search them first, read the ones you need, and never invent facts. Cite every note you use as [[Exact title]]. Answer in two to four sentences.",
		tools: assistantTools,
	});
	const [draft, setDraft] = useState("");
	const thread = useRef<HTMLDivElement>(null);
	const running = status === "running";

	useEffect(() => {
		thread.current?.scrollTo({ top: thread.current.scrollHeight });
	}, [messages]);

	const onSubmit = (event: FormEvent) => {
		event.preventDefault();
		const text = draft.trim();
		if (!text || running) return;
		setDraft("");
		send(text, { context: { "Note open on screen": noteBySlug.get(current)?.title } });
	};

	return (
		<div className="assistant">
			<div className="thread" ref={thread} aria-live="polite">
				{messages.length === 0 && <p className="muted">Ask about glazes, firing or tea: answers come from the notes, with links to them.</p>}
				{messages.map((m) => (
					<Bubble key={m.id} message={m} />
				))}
				{running && !messages.at(-1)?.parts.some((p) => p.type === "text" && p.text.trim() && messages.at(-1)?.role === "assistant") && (
					<p className="muted">{session === "starting" ? "Starting your AI…" : "Thinking…"}</p>
				)}
				{status === "error" && error && (
					<p className="error">{error instanceof NoProviderError ? "No AI can answer yet. Connect yours at the top of the page." : "The guide couldn't answer this time. Try again."}</p>
				)}
			</div>
			<form className="composer" onSubmit={onSubmit}>
				<input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Ask the notebook…" aria-label="Your question" />
				{running ? (
					<button type="button" className="btn btn-quiet" onClick={stop}>
						Stop
					</button>
				) : (
					<button type="submit" className="btn" disabled={!draft.trim()}>
						Ask
					</button>
				)}
			</form>
		</div>
	);
}

function Bubble({ message }: { message: Message }) {
	if (message.role === "user") {
		return <div className="bubble me">{message.parts.map((p) => (p.type === "text" ? p.text : "")).join("")}</div>;
	}
	const tools = [...new Set(message.parts.filter((p) => p.type === "tool-call").map((p) => TOOL_WORDS[p.name] ?? "Checked the notes"))];
	return (
		<>
			{tools.length > 0 && <div className="tool-line">{tools.join(" · ")}</div>}
			{message.parts.map((part, i) =>
				part.type === "text" && part.text.trim() ? (
					<div key={i} className="bubble ai">
						{withLinks(part.text)}
					</div>
				) : null,
			)}
		</>
	);
}

/** `[[Title]]` in an answer becomes a link to the note, without trusting the text as HTML. */
function withLinks(text: string): ReactNode {
	return text.split(/(\[\[[^\]]+\]\])/g).map((piece, i) => {
		const match = /^\[\[([^\]|]+)(?:\|([^\]]+))?\]\]$/.exec(piece);
		if (!match) return <Fragment key={i}>{piece}</Fragment>;
		const slug = slugForTitle(match[1]!);
		const label = match[2] ?? match[1]!;
		return slug ? (
			<a key={i} href={`#/${slug}`} className="wikilink">
				{label}
			</a>
		) : (
			<Fragment key={i}>{label}</Fragment>
		);
	});
}
