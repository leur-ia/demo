import { type Message, NoProviderError } from "@leuria/client";
import { AIStatus } from "@leuria/react-connect";
import { useConversation } from "@leuria/react";
import { type FormEvent, useEffect, useRef, useState } from "react";

import { searchProducts, toolWords } from "./products";

const SUGGESTIONS = ["Which mug is cheapest?", "Is the green mug in stock?", "What would you pick for tea?"];

/** The shop's assistant: one conversation, kept across questions. */
export function Assistant() {
	const { messages, status, error, session, send, stop } = useConversation({
		system:
			"You are the assistant of Kiln & Co., a small shop selling stoneware mugs. Use the shop's tools to answer; never guess prices or stock. Answer in one or two short sentences.",
		tools: [searchProducts],
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
		<section id="assistant" className="panel assistant">
			<div className="panel-head">
				<div>
					<h2>Ask us</h2>
					<p className="panel-sub">About mugs, prices and stock.</p>
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
				<input
					value={draft}
					onChange={(e) => setDraft(e.target.value)}
					placeholder="Ask about the mugs…"
					aria-label="Your question"
				/>
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
					return (
						<div key={part.callId} className="tool-line">
							<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden>
								<path d="m21 21-5.2-5.2m0 0A7.5 7.5 0 1 0 5.2 5.2a7.5 7.5 0 0 0 10.6 10.6Z" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
							</svg>
							{toolWords[part.name] ?? "Checked the shop"}
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
	if (error instanceof NoProviderError) return "No AI can answer yet. Connect yours at the top of the page.";
	if (error.name === "AbortError") return "Stopped.";
	return "The assistant couldn't answer this time. Try again.";
}
