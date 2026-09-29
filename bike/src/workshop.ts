/** Rayon Cycles' services, calendar and past sales: the workshop's own data. */

export interface Service {
	id: string;
	name: string;
	price: number;
	minutes: number;
	what: string;
}

export const services: Service[] = [
	{ id: "tune-up", name: "Tune-up", price: 49, minutes: 60, what: "Gears, brakes, wheels and bolts adjusted; chain cleaned and oiled. When in doubt, this one." },
	{ id: "brake-service", name: "Brake service", price: 35, minutes: 45, what: "Pads and rotors checked or replaced (parts extra), hydraulic brakes bled." },
	{ id: "wheel-true", name: "Wheel truing", price: 25, minutes: 30, what: "A wheel that wobbles or rubs, made straight again; spokes tensioned." },
	{ id: "drivetrain-check", name: "Drivetrain check", price: 20, minutes: 30, what: "Clicks and creaks when pedalling: pedals, cranks and bottom bracket." },
	{ id: "puncture", name: "Puncture repair", price: 12, minutes: 15, what: "A new tube fitted, tyre checked for what caused it." },
	{ id: "warranty-inspection", name: "Warranty inspection", price: 0, minutes: 30, what: "Free, for bikes bought here: the mechanic checks whether a fault is covered." },
];

export const serviceById = new Map(services.map((s) => [s.id, s]));

export interface Slot {
	id: string;
	/** Local date and time, e.g. 2026-10-06T10:30. */
	at: string;
	/** In the e-bike bay (Tuesdays and Thursdays). */
	ebike: boolean;
}

const TIMES = ["09:00", "10:30", "14:00", "16:00"];

/** Free slots over the next two working weeks. Some are taken, the same ones on every visit. */
export function freeSlots(from = new Date()): Slot[] {
	const slots: Slot[] = [];
	const day = new Date(from.getFullYear(), from.getMonth(), from.getDate() + 1);
	while (slots.length < 40) {
		const weekday = day.getDay();
		if (weekday !== 0 && weekday !== 6) {
			const date = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
			for (const time of TIMES) {
				const at = `${date}T${time}`;
				// A made-up calendar: roughly half the slots are taken.
				if (hash(at) % 2 === 0) slots.push({ id: at, at, ebike: weekday === 2 || weekday === 4 });
			}
		}
		day.setDate(day.getDate() + 1);
	}
	return slots;
}

function hash(text: string): number {
	let h = 7;
	for (const c of text) h = (h * 31 + c.charCodeAt(0)) >>> 0;
	return h;
}

/** "Tuesday 6 October at 10:30". */
export function slotWords(at: string): string {
	const date = new Date(at);
	const day = date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
	return `${day} at ${at.slice(11, 16)}`;
}

export interface Purchase {
	order: string;
	bike: string;
	kind: "city" | "road" | "gravel" | "mountain" | "e-bike";
	/** Purchase date, YYYY-MM-DD. */
	date: string;
}

/** Bikes sold here: what `find_purchase` knows. */
export const purchases: Purchase[] = [
	{ order: "RC-2291", bike: "Rayon Traverse (gravel, steel frame)", kind: "gravel", date: "2025-03-14" },
	{ order: "RC-1874", bike: "Rayon Quai (city bike, 7 speeds)", kind: "city", date: "2023-06-02" },
	{ order: "RC-3050", bike: "Rayon Volt (e-bike, 500 Wh battery)", kind: "e-bike", date: "2026-05-20" },
	{ order: "RC-0912", bike: "Rayon Col (road, aluminium frame)", kind: "road", date: "2020-09-11" },
];
