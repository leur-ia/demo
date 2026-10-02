import { type ConversationOptions, type Message, messageText, NoProviderError } from "@leuria/client";
import { AIStatus } from "@leuria/react-connect";
import { useConversation } from "@leuria/react";
import { type FormEvent, Fragment, type ReactNode, useEffect, useRef, useState } from "react";

export type ToolCall = Extract<Message["parts"][number], { type: "tool-call" }>;

export interface ChatPanelProps {
	id: string;
	className: string;
	title: string;
	sub: string;
	/** Read on the first render, like `useConversation`. */
	conversation: ConversationOptions;
	suggestions: string[];
	placeholder: string;
	/** The line shown for each tool the AI used. */
	toolLine: (call: ToolCall) => ReactNode;
	/** What to say when no AI can answer, and when the answer failed. */
	errorWords: { noProvider: string; failed: string };
}

/** A site's assistant panel: one conversation, kept across questions. Styles in chat.css. */
export function ChatPanel({ id, className, title, sub, conversation, suggestions, placeholder, toolLine, errorWords }: ChatPanelProps) {
	const { messages, status, error, session, send, stop } = useConversation(conversation);
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
	const waiting = running && (!last || last.role === "user" || !messageText(last).trim());

	return (
		<section id={id} className={`panel ${className}`}>
			<div className="panel-head">
				<div>
					<h2>{title}</h2>
					<p className="panel-sub">{sub}</p>
				</div>
				<AIStatus />
			</div>

			<div className="thread" ref={thread} aria-live="polite">
				{messages.length === 0 && (
					<div className="suggestions">
						{suggestions.map((s) => (
							<button key={s} type="button" className="chip" onClick={() => ask(s)}>
								{s}
							</button>
						))}
					</div>
				)}
				{messages.map((message) => (
					<Bubble key={message.id} message={message} toolLine={toolLine} />
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
				{status === "error" && error && <p className="thread-error">{errorText(error, errorWords)}</p>}
			</div>

			<form className="composer" onSubmit={onSubmit}>
				<input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={placeholder} aria-label="Your question" />
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

function Bubble({ message, toolLine }: { message: Message; toolLine: ChatPanelProps["toolLine"] }) {
	if (message.role === "user") return <div className="bubble bubble-me">{messageText(message)}</div>;
	return (
		<>
			{message.parts.map((part, i) => {
				if (part.type === "tool-call") return <Fragment key={part.callId}>{toolLine(part)}</Fragment>;
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

function errorText(error: Error, words: ChatPanelProps["errorWords"]): string {
	if (error instanceof NoProviderError) return words.noProvider;
	if (error.name === "AbortError") return "Stopped.";
	return words.failed;
}
