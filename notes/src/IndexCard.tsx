import { useLeuria, useProvider } from "@leuria/react";

import { smallModelSize, useIndexState } from "../../shared/search";

import { modelName } from "./hooks";
import { index } from "./vault";

/** How search by meaning stands: which model reads the notes, and where it runs. */
export function IndexCard() {
	const ai = useLeuria();
	const state = useIndexState(index);
	const page = useProvider("page-embed");
	const bridge = useProvider("bridge");

	if (state.status === "ready" || state.status === "indexing") {
		const where = state.model?.id === "bridge" ? "your AI, on this computer" : "a small model in this page";
		const reading = state.status === "indexing";
		return (
			<div className="card index-card">
				<div className="card-row">
					<span className={`dot ${reading ? "dot-busy" : "dot-ok"}`} aria-hidden />
					<strong>{reading ? "Reading the notes…" : "Search by meaning is on"}</strong>
				</div>
				{reading && (
					<div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={state.total} aria-valuenow={state.done}>
						<i style={{ width: `${(state.done / Math.max(1, state.total)) * 100}%` }} />
					</div>
				)}
				<p className="muted">
					{state.done} of {state.total} passages · {modelName(state.model?.model ?? "")}, {where}. Nothing leaves your device.
				</p>
			</div>
		);
	}

	if (page?.status === "downloading") {
		return (
			<div className="card index-card">
				<div className="card-row">
					<span className="dot dot-busy" aria-hidden />
					<strong>Getting the search model</strong>
				</div>
				<div className="bar">
					<i style={{ width: `${Math.round((page.progress ?? 0) * 100)}%` }} />
				</div>
				<p className="muted">Downloaded once, then kept in your browser.</p>
			</div>
		);
	}

	const connected = bridge?.status === "ready";
	return (
		<div className="card index-card">
			<div className="card-row">
				<span className="dot" aria-hidden />
				<strong>{state.status === "error" ? "Couldn't read the notes" : "Search by meaning is off"}</strong>
			</div>
			<p className="muted">
				{connected
					? "Your AI has no search model. Load one in LM Studio or Ollama, or use a small one in this page."
					: "Connect your AI to read the notes on your computer, or use a small model in this page."}
			</p>
			{state.status === "error" && (
				<button type="button" className="btn btn-quiet" onClick={() => void index.retry()}>
					Try again
				</button>
			)}
			{page?.status === "needs-action" && (
				<button type="button" className="btn btn-quiet" onClick={() => void ai.connect("page-embed").catch(() => undefined)}>
					Use a small model ({smallModelSize(page)})
				</button>
			)}
		</div>
	);
}
