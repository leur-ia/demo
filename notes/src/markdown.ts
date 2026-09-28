import { marked } from "marked";

import { slugForTitle, WIKILINK } from "./vault";

/** The vault's Markdown as HTML, `[[wikilinks]]` as links to `#/slug`. The vault is the site's own content. */
export function renderNote(markdown: string): string {
	const linked = markdown.replace(WIKILINK, (_, target: string, label?: string) => {
		const slug = slugForTitle(target);
		const text = (label ?? target).trim();
		return slug ? `[${text}](#/${slug})` : text;
	});
	return marked.parse(linked, { async: false }) as string;
}
