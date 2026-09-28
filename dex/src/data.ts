import { createIndex } from "@leuria/store";

import creaturesJson from "../data/creatures.json";
import elementsJson from "../data/elements.json";
import queriesJson from "../data/_queries.json";
import { ai } from "./ai";

export interface Element {
	id: string;
	name: string;
	color: string;
	strongAgainst: string[];
	weakAgainst: string[];
}

export interface Creature {
	id: number;
	name: string;
	elements: string[];
	species: string;
	habitat: string;
	height: number;
	weight: number;
	description: string;
	abilities: string[];
	stats: { hp: number; attack: number; defense: number; speed: number; focus: number };
	evolvesFrom: number | null;
	evolvesTo: number | null;
	shape: "quadruped" | "biped" | "bird" | "serpent" | "fish" | "blob" | "insect" | "plant";
	colors: [string, string];
}

export const creatures = creaturesJson as Creature[];
export const elements = elementsJson as Element[];
export const elementById = new Map(elements.map((e) => [e.id, e]));
export const creatureById = new Map(creatures.map((c) => [c.id, c]));
export const searchExamples = (queriesJson as { search: Array<{ query: string }> }).search.map((q) => q.query);
export const teamExamples = (queriesJson as { teamBuilder: Array<{ prompt: string }> }).teamBuilder.map((q) => q.prompt);

export const number = (id: number) => `#${String(id).padStart(3, "0")}`;

/** The whole line a creature belongs to, first stage first. */
export function chain(creature: Creature): Creature[] {
	let first = creature;
	while (first.evolvesFrom !== null) first = creatureById.get(first.evolvesFrom) ?? first;
	const line = [first];
	while (line.at(-1)!.evolvesTo !== null) line.push(creatureById.get(line.at(-1)!.evolvesTo!)!);
	return line;
}

/** Elements this creature is weak to: any of its elements' weaknesses. */
export function weaknesses(creature: Creature): Element[] {
	const ids = new Set(creature.elements.flatMap((e) => elementById.get(e)?.weakAgainst ?? []));
	return [...ids].map((id) => elementById.get(id)!).filter(Boolean);
}

export function strengths(creature: Creature): Element[] {
	const ids = new Set(creature.elements.flatMap((e) => elementById.get(e)?.strongAgainst ?? []));
	return [...ids].map((id) => elementById.get(id)!).filter(Boolean);
}

/** What the embedder reads for each creature. */
function describe(c: Creature): string {
	const els = c.elements.map((e) => elementById.get(e)?.name ?? e).join(" and ");
	return `${c.name}, ${c.species} (${els}). Lives in ${c.habitat}. ${c.description} Abilities: ${c.abilities.join(", ")}.`;
}

export const index = createIndex<{ id: number }>(ai, {
	name: "hollowmark-creatures",
	documents: creatures.map((c) => ({ id: String(c.id), text: describe(c), meta: { id: c.id } })),
});

export async function searchCreatures(query: string, k = 8): Promise<Array<{ creature: Creature; score: number }>> {
	const hits = await index.search(query, { k });
	return hits.map((h) => ({ creature: creatureById.get(h.meta!.id)!, score: h.score }));
}

export async function similarCreatures(id: number, k = 4): Promise<Creature[]> {
	const hits = await index.similar(String(id), { k });
	return hits.map((h) => creatureById.get(h.meta!.id)!);
}

/** Plain word matching, to compare. */
export function keywordCreatures(query: string): Creature[] {
	const words = query
		.toLowerCase()
		.split(/\W+/)
		.filter((w) => w.length > 3);
	if (!words.length) return [];
	return creatures.filter((c) => words.every((w) => describe(c).toLowerCase().includes(w)));
}
