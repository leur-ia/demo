import { ChatPanel } from "../../shared/ChatPanel";

import { toolWords, workshopTools } from "./tools";

/** The workshop's help desk: short instructions here, the know-how in the workshop's skills. */
export function HelpDesk() {
	return (
		<ChatPanel
			id="help"
			className="desk"
			title="Help desk"
			sub="Noises, warranty, booking a repair."
			conversation={{
				system:
					"You are the help desk of Rayon Cycles, a bike workshop in Lyon. Follow the workshop's skills whenever a request matches one. Keep answers short: two to four sentences, or a short list.",
				tools: workshopTools,
			}}
			suggestions={["My bike clicks when I pedal hard", "Is my frame crack covered? Order RC-2291", "Is my bike safe to ride today?", "Book a tune-up for my e-bike"]}
			placeholder="Describe the problem…"
			toolLine={(call) => {
				// A skill read shows which guide the AI followed.
				const skill = call.name === "read_skill" ? (call.args as { name?: string; file?: string }) : null;
				return (
					<div className={skill ? "tool-line tool-skill" : "tool-line"}>
						<span className="tool-dot" aria-hidden />
						{skill ? `Followed the workshop's guide: ${skill.name}${skill.file ? ` (${skill.file})` : ""}` : (toolWords[call.name] ?? "Checked with the workshop")}
					</div>
				);
			}}
			// The help desk books repairs and follows the workshop's skills: only the visitor's own AI does both.
			errorWords={{ noProvider: "The help desk runs on your own AI. Connect it at the top of the page.", failed: "The help desk couldn't answer this time. Try again." }}
		/>
	);
}
