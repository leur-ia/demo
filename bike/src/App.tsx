import { useExposedTools } from "@leuria/react";
import { ConnectButton, LeuriaBadge } from "@leuria/react-connect";
import { useState } from "react";

import { SHOWROOM_URL } from "../../shared/showroom";

import { Booking } from "./Booking";
import { bookingStore } from "./booking.store";
import { HelpDesk } from "./HelpDesk";
import { SkillsCatalog } from "./SkillsCatalog";
import { workshopTools } from "./tools";
import { services } from "./workshop";

export function App() {
	// A new help desk (fresh history) after the visitor disconnects their AI.
	const [session, setSession] = useState(0);
	// The same tools, for the browser's own agents too.
	useExposedTools(workshopTools);

	return (
		<>
			<header className="topbar">
				<div className="topbar-inner">
					<a className="demo-back" href={SHOWROOM_URL}>
						← All demos
					</a>
					<a className="brand" href="#top">
						<Wheel /> Rayon Cycles
					</a>
					<nav className="nav" aria-label="Sections">
						<a href="#services">Services</a>
						<a href="#help">Help desk</a>
						<a href="#skills">What we teach your AI</a>
					</nav>
					<ConnectButton
						className="topbar-connect"
						onDisconnect={() => {
							setSession((n) => n + 1);
							void bookingStore.reset();
						}}
					/>
				</div>
			</header>

			<main id="top">
				<section className="hero">
					<p className="kicker">Bike workshop · Lyon, Croix-Rousse</p>
					<h1>Tell us what the bike does. We'll tell you what it needs.</h1>
					<p className="lede">
						A demo workshop. Its help desk runs on <em>your</em> AI, and follows our mechanics' own guides: how we track down a noise, what our
						warranty covers, how booking works. Connect your AI, then ask.
					</p>
				</section>

				<section id="services" className="section">
					<h2>Services</h2>
					<ul className="services">
						{services.map((s) => (
							<li key={s.id} className="service">
								<div className="service-row">
									<h3>{s.name}</h3>
									<span className="price">{s.price === 0 ? "Free" : `€${s.price}`}</span>
								</div>
								<p>{s.what}</p>
								<p className="muted">{s.minutes} min</p>
							</li>
						))}
					</ul>
				</section>

				<div className="split">
					<HelpDesk key={session} />
					<Booking />
				</div>

				<SkillsCatalog />
			</main>

			<footer className="footer">
				<span>Rayon Cycles is a demo. No bike will be repaired.</span>
				<LeuriaBadge />
			</footer>
		</>
	);
}

function Wheel() {
	return (
		<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
			<circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" strokeWidth="1.75" />
			<circle cx="12" cy="12" r="1.6" fill="currentColor" />
			<path d="M12 2.5v19M2.5 12h19M5.3 5.3l13.4 13.4M18.7 5.3 5.3 18.7" stroke="currentColor" strokeWidth="1" />
		</svg>
	);
}
