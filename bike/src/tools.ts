import { defineTool } from "@leuria/client";

import { bookingStore } from "./booking.store";
import { freeSlots, purchases, serviceById, services, slotWords } from "./workshop";

const listServices = defineTool({
	name: "list_services",
	description: "The workshop's services: id, name, price in euros, duration in minutes, and what's included.",
	inputSchema: { type: "object", properties: {} },
	annotations: { readOnlyHint: true },
	execute: () => services,
});

const findSlots = defineTool<{ service: string; ebike?: boolean }>({
	name: "find_slots",
	description: "Free workshop slots for a service, earliest first. Pass ebike: true for an e-bike (e-bike bay only).",
	inputSchema: {
		type: "object",
		properties: { service: { type: "string", enum: services.map((s) => s.id) }, ebike: { type: "boolean" } },
		required: ["service"],
	},
	annotations: { readOnlyHint: true },
	execute: ({ service, ebike }) => {
		if (!serviceById.has(service)) throw new Error(`No service ${service}`);
		return freeSlots()
			.filter((s) => !ebike || s.ebike)
			.slice(0, 8)
			.map((s) => ({ slot: s.id, when: slotWords(s.at) }));
	},
});

const proposeBooking = defineTool<{ service: string; slot: string; name: string; bike: string; problem?: string }>({
	name: "propose_booking",
	description:
		"Show a booking on the page for the rider to confirm with a button. It is not booked until they do. slot is a slot id from find_slots.",
	inputSchema: {
		type: "object",
		properties: {
			service: { type: "string", enum: services.map((s) => s.id) },
			slot: { type: "string" },
			name: { type: "string" },
			bike: { type: "string", description: "The kind of bike, and the model if known." },
			problem: { type: "string", description: "What's wrong, in a few words." },
		},
		required: ["service", "slot", "name", "bike"],
	},
	execute: (booking) => {
		if (!serviceById.has(booking.service)) throw new Error(`No service ${booking.service}`);
		if (!freeSlots().some((s) => s.id === booking.slot)) throw new Error(`${booking.slot} is not a free slot: call find_slots.`);
		void bookingStore.propose(booking);
		document.getElementById("booking")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
		return { shown: true, note: "The rider confirms it with the button on the page. It is not booked yet." };
	},
});

const findPurchase = defineTool<{ order: string }>({
	name: "find_purchase",
	description: "A bike bought at Rayon Cycles, by its order number (RC- and four digits): the bike and the purchase date.",
	inputSchema: { type: "object", properties: { order: { type: "string" } }, required: ["order"] },
	annotations: { readOnlyHint: true },
	execute: ({ order }) => {
		const found = purchases.find((p) => p.order.toLowerCase() === order.trim().toLowerCase());
		return found ?? { error: `No order ${order}. Ask the rider to check the number on their receipt.` };
	},
});

/** The help desk's tools, and what the page offers the browser's own agents (WebMCP). */
export const workshopTools = [listServices, findSlots, proposeBooking, findPurchase];

/** What each call looks like to a rider. */
export const toolWords: Record<string, string> = {
	list_services: "Looked at the workshop's services",
	find_slots: "Checked the workshop's calendar",
	propose_booking: "Prepared a booking for you to confirm",
	find_purchase: "Looked up your order",
	read_skill: "Read the workshop's guide",
};
