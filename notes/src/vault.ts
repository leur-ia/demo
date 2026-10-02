import { chunkMarkdown, createIndex, type IndexDocument } from "@leuria/store";

import { keywordFilter } from "../../shared/search";

import { ai } from "./ai";

export interface Note {
	slug: string;
	title: string;
	/** Markdown without the title line and the tags line. */
	body: string;
	tags: string[];
	/** Slugs this note links to. */
	links: string[];
}

export interface ChunkMeta {
	slug: string;
}

const files = import.meta.glob<string>("../vault/*.md", { query: "?raw", import: "default", eager: true });

const WIKILINK = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

function parse(slug: string, raw: string): Omit<Note, "links"> & { rawLinks: string[] } {
	const lines = raw.trim().split("\n");
	const title = (lines[0] ?? "").replace(/^#\s+/, "").trim() || slug;
	const tagLine = lines.findLast((l) => /^Tags:/i.test(l));
	const tags = tagLine ? [...tagLine.matchAll(/#([a-z0-9-]+)/gi)].map((m) => m[1]!.toLowerCase()) : [];
	const body = lines
		.slice(1)
		.filter((l) => l !== tagLine)
		.join("\n")
		.trim();
	return { slug, title, body, tags, rawLinks: [...body.matchAll(WIKILINK)].map((m) => m[1]!.trim()) };
}

const parsed = Object.entries(files)
	.map(([path, raw]) => parse(path.split("/").pop()!.replace(/\.md$/, ""), raw))
	.filter((n) => !n.slug.startsWith("_"));
const bySlugTitle = new Map(parsed.map((n) => [n.title.toLowerCase(), n.slug]));

export const notes: Note[] = parsed
	.map(({ rawLinks, ...n }) => ({ ...n, links: [...new Set(rawLinks.map((t) => bySlugTitle.get(t.toLowerCase())).filter((s): s is string => Boolean(s)))] }))
	.sort((a, b) => a.title.localeCompare(b.title));

export const noteBySlug = new Map(notes.map((n) => [n.slug, n]));

export function slugForTitle(title: string): string | undefined {
	return bySlugTitle.get(title.trim().toLowerCase());
}

/** Notes that link to `slug`. */
export function backlinks(slug: string): Note[] {
	return notes.filter((n) => n.links.includes(slug));
}

/** Wikilinks as plain words: what the model and the embedder read. */
export function plain(markdown: string): string {
	return markdown.replace(WIKILINK, (_, target: string, label?: string) => label ?? target);
}

export { WIKILINK };

const queryFiles = import.meta.glob<Array<{ query: string; expect: string[] }>>("../vault/_queries.json", { import: "default", eager: true });
/** Searches that words alone would miss: shown as suggestions. */
export const queries = Object.values(queryFiles)[0] ?? [];

// Each note in chunks, so a long note is found by any of its parts.
const documents: IndexDocument<ChunkMeta>[] = notes.flatMap((note) =>
	chunkMarkdown(plain(note.body), { maxChars: 2000 }).map((chunk, i) => ({
		id: `${note.slug}#${i}`,
		text: `${note.title}\n\n${chunk.text}`,
		meta: { slug: note.slug },
	})),
);

export const index = createIndex<ChunkMeta>(ai, { name: "marens-notebook", documents });

export interface NoteHit {
	note: Note;
	score: number;
	/** The part of the note that matched. */
	snippet: string;
}

/** Chunks → notes: each note once, at its best chunk. */
function byNote(hits: Array<{ score: number; text: string; meta?: ChunkMeta }>, limit: number): NoteHit[] {
	const best = new Map<string, NoteHit>();
	for (const hit of hits) {
		const note = hit.meta && noteBySlug.get(hit.meta.slug);
		if (!note) continue;
		const known = best.get(note.slug);
		if (!known || hit.score > known.score) {
			best.set(note.slug, { note, score: hit.score, snippet: hit.text.slice(note.title.length).trim() });
		}
	}
	return [...best.values()].sort((a, b) => b.score - a.score).slice(0, limit);
}

export async function searchNotes(query: string, limit = 6): Promise<NoteHit[]> {
	return byNote(await index.search(query, { k: limit * 4 }), limit);
}

/** Notes closest in meaning to `slug`, from its own vectors: nothing to embed. */
export async function relatedNotes(slug: string, limit = 5): Promise<NoteHit[]> {
	const own = documents.filter((d) => d.meta?.slug === slug);
	const hits = (await Promise.all(own.map((d) => index.similar(d.id, { k: 12, filter: (doc) => doc.meta?.slug !== slug })))).flat();
	return byNote(hits, limit);
}

/** Plain word matching, to compare with search by meaning. */
export function keywordNotes(query: string): Note[] {
	return keywordFilter(notes, (n) => `${n.title} ${n.body}`, query);
}
