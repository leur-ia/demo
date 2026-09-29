import { defineTool, type Message, messageText } from "@leuria/client";

import { noteBySlug, notes, plain, searchNotes } from "./vault";

const searchTool = defineTool<{ query: string }>({
	name: "search_notes",
	description: "Search Maren's notes by meaning. Returns the closest notes with their slug, title and the passage that matched.",
	inputSchema: { type: "object", properties: { query: { type: "string" } }, required: ["query"] },
	annotations: { readOnlyHint: true },
	execute: async ({ query }) => {
		try {
			return (await searchNotes(query, 5)).map((h) => ({ slug: h.note.slug, title: h.note.title, passage: h.snippet.slice(0, 600) }));
		} catch {
			return { error: "Search by meaning is off. Use list_notes and read_note instead." };
		}
	},
});

const listTool = defineTool({
	name: "list_notes",
	description: "List every note: slug, title and tags.",
	inputSchema: { type: "object", properties: {} },
	annotations: { readOnlyHint: true },
	execute: () => notes.map((n) => ({ slug: n.slug, title: n.title, tags: n.tags })),
});

const readTool = defineTool<{ slug: string }>({
	name: "read_note",
	description: "Read a whole note by its slug.",
	inputSchema: { type: "object", properties: { slug: { type: "string" } }, required: ["slug"] },
	annotations: { readOnlyHint: true },
	execute: ({ slug }) => {
		const note = noteBySlug.get(slug);
		if (!note) throw new Error(`No note ${slug}`);
		return { title: note.title, text: plain(note.body) };
	},
});

/** For the browser's agents: show a note to the visitor. */
const openTool = defineTool<{ slug: string }>({
	name: "open_note",
	description: "Open a note on screen for the visitor, by its slug.",
	inputSchema: { type: "object", properties: { slug: { type: "string" } }, required: ["slug"] },
	execute: ({ slug }) => {
		if (!noteBySlug.has(slug)) throw new Error(`No note ${slug}`);
		location.hash = `#/${slug}`;
		return { opened: noteBySlug.get(slug)!.title };
	},
});

/**
 * For an AI that can't use the tools (this browser's): the page searches
 * the notes itself and hands over the closest ones with the question.
 */
export async function notesForQuestion(message: Message): Promise<Record<string, string>> {
	const question = messageText(message);
	const label = "Notes that may answer (answer only from these)";
	try {
		// Search by meaning, if it is ready soon; else the notes that share the question's words.
		const hits = await Promise.race([searchNotes(question, 3), new Promise<never>((_, reject) => setTimeout(() => reject(new Error("not ready")), 3000))]);
		return { [label]: hits.map((h) => `[[${h.note.title}]]\n${h.snippet.slice(0, 600)}`).join("\n\n") };
	} catch {
		return { [label]: notesSharingWords(question, 3).map((n) => `[[${n.title}]]\n${plain(n.body).slice(0, 600)}`).join("\n\n") };
	}
}

/** The notes that share the most words with the question, titles counting double. */
function notesSharingWords(question: string, limit: number) {
	const words = new Set(question.toLowerCase().match(/[a-zà-ÿ]{4,}/g) ?? []);
	const score = (text: string) => (text.toLowerCase().match(/[a-zà-ÿ]{4,}/g) ?? []).filter((w) => words.has(w)).length;
	return notes
		.map((note) => ({ note, score: score(note.title) * 2 + score(plain(note.body)) }))
		.sort((a, b) => b.score - a.score)
		.slice(0, limit)
		.map((h) => h.note);
}

/** What the notebook's own assistant uses. */
export const assistantTools = [searchTool, listTool, readTool];
/** What the page offers the browser's own agents (WebMCP). */
export const pageTools = [searchTool, listTool, readTool, openTool];
