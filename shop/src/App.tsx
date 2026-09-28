import { useExposedTools } from "@leuria/react";
import { ConnectButton, LeuriaBadge } from "@leuria/react-connect";
import { useState } from "react";

import { Assistant } from "./Assistant";
import { Mug } from "./Mug";
import { products } from "./products";
import { QuickOrder } from "./QuickOrder";
import { pageTools } from "./tools";

export function App() {
	// A new assistant (fresh history) after the visitor disconnects their AI.
	const [session, setSession] = useState(0);
	// The same tools, for the browser's own agents too.
	useExposedTools(pageTools);

	return (
		<>
			<header className="topbar">
				<div className="topbar-inner">
					<a className="brand" href="#top">
						Kiln <span>&amp;</span> Co.
					</a>
					<nav className="nav" aria-label="Sections">
						<a href="#mugs">Mugs</a>
						<a href="#assistant">Ask us</a>
						<a href="#order">Quick order</a>
						<a href="plain.html">Plain HTML version</a>
					</nav>
					<ConnectButton className="topbar-connect" onDisconnect={() => setSession((n) => n + 1)} />
				</div>
			</header>

			<main id="top">
				<section className="hero">
					<p className="kicker">Stoneware, thrown and fired in Lyon</p>
					<h1>Mugs for slow mornings.</h1>
					<p className="lede">
						A demo shop. Its assistant and its order form run on <em>your</em> AI: connect it once and it answers here, without the
						shop paying for it or seeing your files.
					</p>
				</section>

				<section id="mugs" className="section">
					<h2>The mugs</h2>
					<ul className="products">
						{products.map((p) => (
							<li key={p.id} className="product">
								<div className="product-art">
									<Mug glaze={p.glaze} soldOut={p.stock === 0} />
								</div>
								<div className="product-row">
									<h3>{p.name}</h3>
									<span className="price">€{p.price}</span>
								</div>
								<p className="product-desc">{p.description}</p>
								<p className={p.stock === 0 ? "stock stock-out" : "stock"}>{p.stock === 0 ? "Out of stock" : `${p.stock} in stock`}</p>
							</li>
						))}
					</ul>
				</section>

				<div className="split">
					<Assistant key={session} />
					<QuickOrder />
				</div>
			</main>

			<footer className="footer">
				<span>Kiln &amp; Co. is a demo. No mug will be shipped.</span>
				<LeuriaBadge />
			</footer>
		</>
	);
}
