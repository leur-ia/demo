import { defineTool } from "@leuria/client";

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

/** What the notebook's own assistant uses. */
export const assistantTools = [searchTool, listTool, readTool];
/** What the page offers the browser's own agents (WebMCP). */
export const pageTools = [searchTool, listTool, readTool, openTool];
