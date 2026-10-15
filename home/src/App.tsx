import { NoProviderError } from "@leuria/client";
import { useLeuriaState } from "@leuria/react";
import { AIStatus, ConnectButton, LeuriaBadge } from "@leuria/react-connect";
import { type FormEvent, useEffect, useRef, useState } from "react";

import { SHOWROOM_URL } from "../../shared/showroom";

import { type Device, handle, initialDevices, isActive, type Kind, ROOM_NAME, ROOMS, type Room, stateWords, type Trace } from "./house";
import { DecisionTrace } from "./Trace";

const SUGGESTIONS = [
	"Turn on the living room lights",
	"Turn off all the lights",
	"Is the kitchen light on?",
	"Shut off all the music in the house",
	"Get the coffee boiling",
	"It's going to be a hot day, turn on all the fans",
	"Turn off the kitchen lights and lock the office door",
	"Lock up the whole house",
	"Set the bedroom to heat",
	"Dim the lights in the living room",
	"What's a good temperature for sleeping?",
];

interface Line {
	id: number;
	who: "you" | "home";
	text: string;
}

export function App() {
	const [devices, setDevices] = useState<Device[]>(initialDevices);
	const [lines, setLines] = useState<Line[]>([]);
	const [traces, setTraces] = useState<Trace[]>([]);
	const [draft, setDraft] = useState("");
	const [busy, setBusy] = useState(false);
	/** Devices the last request changed: ringed for a moment, so the eye finds them. */
	const [changed, setChanged] = useState<Set<string>>(new Set());
	const { decider, decidePending } = useLeuriaState();
	const log = useRef<HTMLDivElement>(null);

	useEffect(() => {
		log.current?.scrollTo({ top: log.current.scrollHeight, behavior: "smooth" });
	}, [lines]);

	const say = (who: Line["who"], text: string) => setLines((l) => [...l, { id: Date.now() + Math.random(), who, text }]);

	const ask = async (request: string) => {
		const text = request.trim();
		if (!text || busy) return;
		setDraft("");
		say("you", text);
		setBusy(true);
		try {
			const outcome = await handle(devices, text);
			setDevices(outcome.devices);
			const touched = new Set(outcome.devices.filter((d, i) => d !== devices[i]).map((d) => d.id));
			setChanged(touched);
			if (touched.size) setTimeout(() => setChanged(new Set()), 1500);
			setTraces((t) => [...outcome.traces.slice().reverse(), ...t]);
			say("home", outcome.text);
		} catch (error) {
			say("home", words(error));
		} finally {
			setBusy(false);
		}
	};
	const onSubmit = (event: FormEvent) => {
		event.preventDefault();
		void ask(draft);
	};
	const reset = () => {
		setDevices(initialDevices);
		setLines([]);
		setTraces([]);
	};

	return (
		<>
			<header className="topbar">
				<div className="topbar-inner">
					<a className="demo-back" href={SHOWROOM_URL}>
						← All demos
					</a>
					<a className="brand" href="#top">
						<Flame /> Hearth
					</a>
					<ConnectButton className="topbar-connect" />
				</div>
			</header>

			<main id="top">
				<section className="hero">
					<h1>Say it. The house decides; your AI only speaks when there's something to say.</h1>
					<p className="lede">
						A decision model on your computer reads every request in one call: intent, room, device, and what should happen to each kind of device, asked all at
						once. Your AI is only asked for words: to split a request, or to answer a question that isn't about the house.
					</p>
					<AIStatus className="hero-status" />
					{!decider && (
						<p className="need">
							{decidePending
								? "Connect Leuria to use a decision model on your computer."
								: "No decision model yet: in Leuria, load one (nimble, tev1, clef…) in LM Studio, Ollama or oMLX, or set a decision service, then try again."}
						</p>
					)}
				</section>

				<form className="ask" onSubmit={onSubmit}>
					<input
						name="request"
						value={draft}
						onChange={(e) => setDraft(e.target.value)}
						placeholder="Tell the house what you want…"
						aria-label="Your request"
						autoComplete="off"
						disabled={busy}
					/>
					<button type="submit" className="send" disabled={busy}>
						{busy ? "Deciding…" : "Send"}
					</button>
				</form>
				<div className="suggestions">
					{SUGGESTIONS.map((s) => (
						<button key={s} type="button" className="chip" disabled={busy} onClick={() => void ask(s)}>
							{s}
						</button>
					))}
				</div>

				<div className="split">
					<section className="house" aria-label="The house">
						<div className="house-head">
							<h2>The house</h2>
							<span className="muted">{devices.length} devices</span>
							<button type="button" className="reset" onClick={reset}>
								Reset
							</button>
						</div>
						{ROOMS.map((room) => (
							<div key={room} className="room">
								<h3>{ROOM_NAME[room]}</h3>
								<div className="devices">
									{devices
										.filter((d) => d.room === room)
										.map((d) => (
											<div key={d.id} className={`device${isActive(d) ? " active" : ""}${changed.has(d.id) ? " changed" : ""}`}>
												<span className="device-icon" aria-hidden>
													{ICON[d.kind]}
												</span>
												<span className="device-name">{d.name}</span>
												<span className="device-state">{stateWords(d)}</span>
											</div>
										))}
								</div>
							</div>
						))}
						<div className="thread" ref={log} aria-live="polite">
							{lines.map((line) => (
								<div key={line.id} className={`bubble bubble-${line.who === "you" ? "me" : "ai"}`}>
									{line.text}
								</div>
							))}
						</div>
					</section>

					<DecisionTrace traces={traces} />
				</div>

				<section className="how">
					<div>
						<h3>One call, twelve questions</h3>
						<p>Intent, scope, room, device, and an action for every kind of device: asked together, speculatively. Code keeps the answers that apply.</p>
					</div>
					<div>
						<h3>Numbers, not prose</h3>
						<p>A choice with its probabilities and a confidence, a probability for “several requests”. Thresholds are the page's own.</p>
					</div>
					<div>
						<h3>Words only when needed</h3>
						<p>Splitting a compound request, or answering a question about anything else, goes to your AI, or the browser's model.</p>
					</div>
				</section>
			</main>

			<footer className="footer">
				<span>Hearth is a demo. No coffee will be made.</span>
				<LeuriaBadge />
			</footer>
		</>
	);
}

const ICON: Record<Kind, string> = { light: "💡", fan: "🌀", speaker: "🔈", appliance: "☕", thermostat: "🌡", lock: "🔒" };

function words(error: unknown): string {
	if (error instanceof NoProviderError) {
		return error.needs.includes("decide")
			? "No decision model can read this yet. Connect Leuria and load one (nimble in LM Studio or Ollama)."
			: "No AI can answer in words right now. Connect Leuria, or use a browser with a built-in model.";
	}
	return error instanceof Error ? error.message : String(error);
}

function Flame() {
	return (
		<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
			<path d="M12 2c1 4 5 5.5 5 11a5 5 0 0 1-10 0c0-2 .8-3.3 2-4.5.2 1.5 1 2.5 2 3 .3-3 .3-6.5 1-9.5Z" fill="currentColor" />
		</svg>
	);
}
