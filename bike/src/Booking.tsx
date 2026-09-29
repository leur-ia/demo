import { useStore } from "@sinuxjs/react";

import { bookingStore } from "./booking.store";
import { serviceById, slotWords } from "./workshop";

/** The booking the help desk prepared: the rider confirms it here, not the AI. */
export function Booking() {
	const { proposal, confirmed } = useStore(bookingStore);
	const shown = proposal ?? confirmed;
	const service = shown ? serviceById.get(shown.service) : undefined;

	return (
		<section id="booking" className="panel booking">
			<h2>Your booking</h2>
			{!shown && <p className="muted">Ask the help desk to book a repair: it prepares the booking here, and you confirm it.</p>}
			{shown && service && (
				<>
					<dl className="booking-lines">
						<dt>Service</dt>
						<dd>
							{service.name} · {service.price === 0 ? "free" : `€${service.price}`} · {service.minutes} min
						</dd>
						<dt>When</dt>
						<dd>{slotWords(shown.slot)}</dd>
						<dt>Bike</dt>
						<dd>{shown.bike}</dd>
						<dt>Name</dt>
						<dd>{shown.name}</dd>
						{shown.problem && (
							<>
								<dt>Problem</dt>
								<dd>{shown.problem}</dd>
							</>
						)}
					</dl>
					{proposal ? (
						<div className="booking-actions">
							<button type="button" className="btn" onClick={() => void bookingStore.confirm()}>
								Confirm the booking
							</button>
							<button type="button" className="btn btn-quiet" onClick={() => void bookingStore.dismiss()}>
								Not this one
							</button>
						</div>
					) : (
						<p className="booked" role="status">
							Booked · reference {confirmed?.ref}. Bring the bike 15 minutes early. (A demo: no one will be waiting.)
						</p>
					)}
				</>
			)}
		</section>
	);
}
