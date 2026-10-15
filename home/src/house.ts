/**
 * The house and its assistant. One decision call reads every request
 * (intent, scope, room, device, and what should happen to each kind of
 * device: asked speculatively, all at once); plain code acts on the
 * answers. A chat model only writes words: to split a compound request,
 * or to answer something that isn't about the house.
 */

import { choice, type DecideAnswer, noul } from "@leuria/client";

import { ai } from "./ai";

export type Room = "living_room" | "kitchen" | "bedroom" | "office";
export type Kind = "light" | "fan" | "speaker" | "appliance" | "thermostat" | "lock";
export const ROOMS: Room[] = ["living_room", "kitchen", "bedroom", "office"];
export const ROOM_NAME: Record<Room, string> = { living_room: "Living room", kitchen: "Kitchen", bedroom: "Bedroom", office: "Office" };

export interface Device {
	id: string;
	name: string;
	room: Room;
	kind: Kind;
	on: boolean;
	/** Lights: 0 to 100. */
	brightness?: number;
	/** Thermostats. */
	mode?: "heat" | "ac" | "off";
	target?: number;
	/** Locks. */
	locked?: boolean;
}

export const initialDevices: Device[] = [
	{ id: "living_room_overhead", name: "Overhead lights", room: "living_room", kind: "light", on: true, brightness: 80 },
	{ id: "living_room_lamp", name: "Floor lamp", room: "living_room", kind: "light", on: true, brightness: 50 },
	{ id: "living_room_fan", name: "Ceiling fan", room: "living_room", kind: "fan", on: false },
	{ id: "living_room_speaker", name: "Smart speaker", room: "living_room", kind: "speaker", on: false },
	{ id: "kitchen_light", name: "Kitchen lights", room: "kitchen", kind: "light", on: false, brightness: 100 },
	{ id: "kitchen_coffee_maker", name: "Coffee maker", room: "kitchen", kind: "appliance", on: false },
	{ id: "bedroom_light", name: "Bedroom light", room: "bedroom", kind: "light", on: false, brightness: 60 },
	{ id: "bedroom_thermostat", name: "Thermostat", room: "bedroom", kind: "thermostat", on: true, mode: "ac", target: 22 },
	{ id: "office_light", name: "Desk lamp", room: "office", kind: "light", on: false, brightness: 70 },
	{ id: "office_lock", name: "Door lock", room: "office", kind: "lock", on: true, locked: true },
];

/** The device's state in words: "On · 80%", "A/C · 22 °C", "Locked". */
export function stateWords(d: Device): string {
	if (d.kind === "lock") return d.locked ? "Locked" : "Unlocked";
	if (d.kind === "thermostat") return d.mode === "off" ? "Off" : `${d.mode === "heat" ? "Heat" : "A/C"} · ${d.target} °C`;
	if (d.kind === "light") return d.on ? `On · ${d.brightness}%` : "Off";
	return d.on ? "On" : "Off";
}

/** Lit: something is happening (on, locked, heating…). */
export function isActive(d: Device): boolean {
	if (d.kind === "lock") return Boolean(d.locked);
	if (d.kind === "thermostat") return d.mode !== "off";
	return d.on;
}

// ── Every question, asked at once ────────────────────────────────────────
// Most won't apply to a given request: that's the point. One round trip
// answers them all, and the code reads only what applies.
export function questions(devices: Device[]) {
	const byId = Object.fromEntries(devices.map((d) => [d.id, `${d.name} in the ${ROOM_NAME[d.room].toLowerCase()}`]));
	return {
		intent: choice("What is the user's intent in `request`?", {
			smarthome_command: "An instruction to change a device: turn on or off, start, dim, lock, warm up, get something going",
			smarthome_query: "A question about a device's current state: is it on, what is it set to",
			information_request: "A question or remark about anything other than the house's devices",
		}),
		multiple: noul("`request` contains more than one command, for different devices or rooms"),
		scope: choice("What is the scope of `request`?", {
			specific_device: "One device",
			area: "Every device of a kind in one room",
			whole_house: "Every device of a kind in the whole house",
		}),
		device_kind: choice("What kind of device is `request` about?", {
			light: "Lights, lamps",
			fan: "Fans",
			speaker: "Speakers, music",
			appliance: "Appliances: the coffee maker",
			thermostat: "Heating, cooling, temperature",
			lock: "Door locks",
		}),
		room: choice("Which room is `request` about?", {
			living_room: "The living room",
			kitchen: "The kitchen",
			bedroom: "The bedroom",
			office: "The office",
			none_of_these: "No room named, or the whole house",
		}),
		device: choice("Which specific device should receive the command in `request`?", { ...byId, none_of_these: "None of these, or more than one" }),
		lights: choice("What should happen to the lights, if `request` is about lights?", { turn_on: "On, full", turn_off: "Off", dim: "Dim, lower, softer" }),
		fans: choice("What should happen to the fans, if `request` is about fans?", { turn_on: "On", turn_off: "Off" }),
		speakers: choice("What should happen to the speakers, if `request` is about music?", { turn_on: "Play, on", turn_off: "Stop, off, quiet" }),
		appliances: choice("What should happen to the appliance, if `request` is about one?", { turn_on: "Start, on", turn_off: "Stop, off" }),
		thermostats: choice("What should happen to the thermostat, if `request` is about temperature?", { heat_on: "Warmer, heat", ac_on: "Cooler, A/C", turn_off: "Off" }),
		locks: choice("What should happen to the locks, if `request` is about doors?", { lock: "Lock", unlock: "Unlock, open" }),
	};
}

export type Questions = ReturnType<typeof questions>;
export type Answers = { [K in keyof Questions]: DecideAnswer<Questions[K]> };

/** One decision, kept for the trace. */
export interface Trace {
	request: string;
	model: string;
	ms: number;
	questions: Questions;
	answers: Answers;
	/** What the house did, in words. */
	outcome: string;
	/** Which chat model wrote words, when one did. */
	spoke?: string;
}

const ACTION_BY_KIND = { light: "lights", fan: "fans", speaker: "speakers", appliance: "appliances", thermostat: "thermostats", lock: "locks" } as const satisfies Record<Kind, keyof Answers>;

/** The devices a decided command concerns. */
function targets(devices: Device[], a: Answers): Device[] {
	const kind = a.device_kind.choice;
	const one = devices.find((d) => d.id === a.device.choice);
	if (a.scope.choice === "specific_device" && one) return [one];
	const room = a.room.choice;
	if (a.scope.choice === "area" && room !== "none_of_these") return devices.filter((d) => d.room === room && d.kind === kind);
	if (a.scope.choice === "whole_house" || room === "none_of_these") return devices.filter((d) => d.kind === kind);
	// A room and a kind, but no scope the model is sure of: that room's devices of that kind, else the one device named.
	const inRoom = devices.filter((d) => d.room === room && d.kind === kind);
	return inRoom.length ? inRoom : one ? [one] : [];
}

/** The device after the decided action. */
function apply(d: Device, action: string): Device {
	switch (d.kind) {
		case "light":
			return action === "dim" ? { ...d, on: true, brightness: 30 } : { ...d, on: action === "turn_on", ...(action === "turn_on" ? { brightness: 100 } : {}) };
		case "thermostat":
			return action === "turn_off" ? { ...d, on: false, mode: "off" } : { ...d, on: true, mode: action === "heat_on" ? "heat" : "ac", target: action === "heat_on" ? 21 : 20 };
		case "lock":
			return { ...d, locked: action === "lock", on: action === "lock" };
		default:
			return { ...d, on: action === "turn_on" };
	}
}

const ACTION_WORDS: Record<string, string> = { turn_on: "on", turn_off: "off", dim: "dimmed", heat_on: "heating", ac_on: "cooling", lock: "locked", unlock: "unlocked" };

export interface Outcome {
	devices: Device[];
	text: string;
	traces: Trace[];
}

/** Handle one request: the devices after it, what to say, and the decisions made. */
export async function handle(devices: Device[], request: string, options: { signal?: AbortSignal; split?: boolean } = {}): Promise<Outcome> {
	const { signal, split = true } = options;
	const qs = questions(devices);
	const started = performance.now();
	const { answers, model } = await ai.decide({ request }, qs, { signal });
	const ms = Math.round(performance.now() - started);
	const speaker = () => ai.getState().active?.label ?? "your AI";
	const trace = (outcome: string, spoke?: string): Trace => ({ request, model, ms, questions: qs, answers, outcome, ...(spoke ? { spoke } : {}) });

	if (answers.intent.choice === "information_request") {
		// Words need a chat model; the decision above cost almost nothing.
		const text = await ai.chat({ prompt: request, system: "You are Hearth, a brief home assistant. Answer in one or two sentences.", signal }).text();
		return { devices, text, traces: [trace("Answered in words.", speaker())] };
	}
	if (split && answers.multiple.noul > 0.5) {
		// Several commands: a chat model lists them, and each one is decided on its own.
		const { commands } = await ai
			.chat<{ commands: string[] }>({
				prompt: request,
				system: "Split the request into single-device commands, one per item, in the user's words.",
				schema: { type: "object", properties: { commands: { type: "array", items: { type: "string" } } }, required: ["commands"] },
				signal,
			})
			.object();
		let next = devices;
		const texts: string[] = [];
		const traces: Trace[] = [trace(`Split into ${commands.length} commands.`, speaker())];
		for (const command of commands) {
			const result = await handle(next, command, { signal, split: false });
			next = result.devices;
			texts.push(result.text);
			traces.push(...result.traces);
		}
		return { devices: next, text: texts.join(" "), traces };
	}

	const found = targets(devices, answers);
	if (found.length === 0) return { devices, text: "I couldn't tell which device you mean.", traces: [trace("No device matched.")] };
	if (answers.intent.choice === "smarthome_query") {
		const text = found.map((d) => `${d.name} (${ROOM_NAME[d.room].toLowerCase()}): ${stateWords(d).toLowerCase()}.`).join(" ");
		return { devices, text, traces: [trace("Answered from the house's state.")] };
	}
	const action = answers[ACTION_BY_KIND[answers.device_kind.choice]].choice;
	const changed = new Map(found.map((d) => [d.id, apply(d, action)]));
	const next = devices.map((d) => changed.get(d.id) ?? d);
	const where = found.length === 1 ? `${found[0]!.name} in the ${ROOM_NAME[found[0]!.room].toLowerCase()}` : `${found.length} ${answers.device_kind.choice}s`;
	const text = `${where} ${ACTION_WORDS[action] ?? action}.`;
	return { devices: next, text: text[0]!.toUpperCase() + text.slice(1), traces: [trace(text)] };
}
