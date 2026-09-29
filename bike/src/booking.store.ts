import { createStore } from "@sinuxjs/core";

export interface Booking {
	service: string;
	slot: string;
	name: string;
	bike: string;
	problem?: string;
}

export interface BookingState {
	/** Proposed by the help desk, waiting for the rider's click. */
	proposal: Booking | null;
	/** Confirmed by the rider, with the workshop's reference. */
	confirmed: (Booking & { ref: string }) | null;
}

export const bookingStore = createStore({ proposal: null, confirmed: null } as BookingState, {
	propose: (_state, booking: Booking) => ({ proposal: booking, confirmed: null }),
	confirm: (state) =>
		state.proposal ? { proposal: null, confirmed: { ...state.proposal, ref: `B-${Math.floor(1000 + Math.random() * 9000)}` } } : {},
	dismiss: () => ({ proposal: null }),
	reset: () => ({ proposal: null, confirmed: null }),
});
