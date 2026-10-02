import { ChatPanel } from "../../shared/ChatPanel";

import { searchProducts, shelf, toolWords } from "./products";

/** The shop's assistant: one conversation, kept across questions. */
export function Assistant() {
	return (
		<ChatPanel
			id="assistant"
			className="assistant"
			title="Ask us"
			sub="About mugs, prices and stock."
			conversation={{
				system:
					"You are the assistant of Kiln & Co., a small shop selling stoneware mugs. Use the shop's tools to answer; never guess prices or stock. Answer in one or two short sentences.",
				tools: [searchProducts],
				// This browser's AI can't look through the shop itself: it gets the whole shelf (three mugs).
				withoutTools: shelf,
			}}
			suggestions={["Which mug is cheapest?", "Is the green mug in stock?", "What would you pick for tea?"]}
			placeholder="Ask about the mugs…"
			toolLine={(call) => (
				<div className="tool-line">
					<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden>
						<path d="m21 21-5.2-5.2m0 0A7.5 7.5 0 1 0 5.2 5.2a7.5 7.5 0 0 0 10.6 10.6Z" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
					</svg>
					{toolWords[call.name] ?? "Checked the shop"}
				</div>
			)}
			errorWords={{ noProvider: "No AI can answer yet. Connect yours at the top of the page.", failed: "The assistant couldn't answer this time. Try again." }}
		/>
	);
}
