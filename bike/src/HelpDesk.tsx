import { type Message, NoProviderError } from "@leuria/client";
import { AIStatus } from "@leuria/react-connect";
import { useConversation } from "@leuria/react";
import { type FormEvent, useEffect, useRef, useState } from "react";

import { toolWords, workshopTools } from "./tools";

const SUGGESTIONS = ["My bike clicks when I pedal hard", "Is my frame crack covered? Order RC-2291", "Is my bike safe to ride today?", "Book a tune-up for my e-bike"];

/** The workshop's help desk: short instructions here, the know-how in the workshop's skills. */
export function HelpDesk() {
	const { messages, status, error, session, send, stop } = useConversation({
		system:
			"You are the help desk of Rayon Cycles, a bike workshop in Lyon. Follow the workshop's skills whenever a request matches one. Keep answers short: two to four sentences, or a short list.",
		tools: workshopTools,
	});
	const [draft, setDraft] = useState("");
	const thread = useRef<HTMLDivElement>(null);
	const running = status === "running";

	useEffect(() => {
		thread.current?.scrollTo({ top: thread.current.scrollHeight, behavior: "smooth" });
	}, [messages]);

	const ask = (question: string) => {
		const text = question.trim();
		if (!text || running) return;
		setDraft("");
		send(text);
	};
	const onSubmit = (event: FormEvent) => {
		event.preventDefault();
		ask(draft);
	};

	const last = messages[messages.length - 1];
	const waiting = running && (!last || last.role === "user" || !hasText(last));

	return (
		<section id="help" className="panel desk">
			<div className="panel-head">
				<div>
					<h2>Help desk</h2>
					<p className="panel-sub">Noises, warranty, booking a repair.</p>
				</div>
				<AIStatus />
			</div>

			<div className="thread" ref={thread} aria-live="polite">
				{messages.length === 0 && (
					<div className="suggestions">
						{SUGGESTIONS.map((s) => (
							<button key={s} type="button" className="chip" onClick={() => ask(s)}>
								{s}
							</button>
						))}
					</div>
				)}
				{messages.map((message) => (
					<Bubble key={message.id} message={message} />
				))}
				{waiting && (
					<div className="bubble bubble-ai bubble-wait">
						<span className="typing" aria-hidden>
							<i />
							<i />
							<i />
						</span>
						{session === "starting" ? "Starting your AI…" : "Thinking…"}
					</div>
				)}
				{status === "error" && error && <p className="thread-error">{errorText(error)}</p>}
			</div>

			<form className="composer" onSubmit={onSubmit}>
				<input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Describe the problem…" aria-label="Your question" />
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
		</section>
	);
}

function hasText(message: Message): boolean {
	return message.parts.some((p) => p.type === "text" && p.text.trim() !== "");
}

function Bubble({ message }: { message: Message }) {
	if (message.role === "user") {
		const text = message.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
		return <div className="bubble bubble-me">{text}</div>;
	}
	return (
		<>
			{message.parts.map((part, i) => {
				if (part.type === "tool-call") {
					// A skill read shows which guide the AI followed.
					const skill = part.name === "read_skill" ? (part.args as { name?: string; file?: string }) : null;
					return (
						<div key={part.callId} className={skill ? "tool-line tool-skill" : "tool-line"}>
							<span className="tool-dot" aria-hidden />
							{skill ? `Followed the workshop's guide: ${skill.name}${skill.file ? ` (${skill.file})` : ""}` : (toolWords[part.name] ?? "Checked with the workshop")}
						</div>
					);
				}
				if (part.type === "text" && part.text.trim()) {
					return (
						<div key={i} className="bubble bubble-ai">
							{part.text}
						</div>
					);
				}
				return null;
			})}
		</>
	);
}

function errorText(error: Error): string {
	// The help desk books repairs and follows the workshop's skills: only the visitor's own AI does both.
	if (error instanceof NoProviderError) return "The help desk runs on your own AI. Connect it at the top of the page.";
	if (error.name === "AbortError") return "Stopped.";
	return "The help desk couldn't answer this time. Try again.";
}
