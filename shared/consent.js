/**
 * Visit counting for demo.leuria.dev, only after the visitor's yes.
 * Nothing from Google loads before it: no script, no cookie. The answer
 * is kept in this browser (localStorage, shared by every demo: they live
 * under one origin). An element with `data-consent-open` asks again.
 *
 * Served at /consent.js by the showroom build; a classic script, so every
 * demo page includes it the same way. Off on local dev servers.
 */
(() => {
	if (location.hostname !== "demo.leuria.dev") return;
	const ID = "G-X31RJ2D2BD";
	const KEY = "leuria-analytics";

	const read = () => {
		try {
			return localStorage.getItem(KEY);
		} catch {
			return null;
		}
	};
	const write = (value) => {
		try {
			localStorage.setItem(KEY, value);
		} catch {
			// private window: asked again next visit
		}
	};

	let loaded = false;
	const start = () => {
		window[`ga-disable-${ID}`] = false;
		if (loaded) return;
		loaded = true;
		window.dataLayer = window.dataLayer || [];
		window.gtag = function () {
			window.dataLayer.push(arguments);
		};
		gtag("consent", "default", { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
		gtag("js", new Date());
		gtag("config", ID);
		const script = document.createElement("script");
		script.async = true;
		script.src = `https://www.googletagmanager.com/gtag/js?id=${ID}`;
		document.head.appendChild(script);
	};
	const stop = () => {
		window[`ga-disable-${ID}`] = true;
		if (window.gtag) gtag("consent", "update", { analytics_storage: "denied" });
		for (const cookie of document.cookie.split(";")) {
			const name = cookie.split("=")[0].trim();
			if (!name.startsWith("_ga")) continue;
			for (const domain of ["", `; domain=${location.hostname}`, "; domain=.leuria.dev"]) {
				document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain}`;
			}
		}
	};

	let banner = null;
	const close = () => {
		banner?.remove();
		banner = null;
	};
	const ask = () => {
		if (banner) return;
		banner = document.createElement("div");
		banner.setAttribute("role", "region");
		banner.setAttribute("aria-label", "Visit counting");
		banner.className = "leuria-consent";
		banner.innerHTML = `
			<style>
				.leuria-consent { position: fixed; inset: auto 16px 16px; z-index: 2147483000; display: flex; flex-wrap: wrap; align-items: center; gap: 12px 20px; max-width: 720px; margin: 0 auto; padding: 16px 20px; border-radius: 16px; background: var(--surface, #fff); color: var(--text, #14172b); box-shadow: 0 16px 36px -10px rgba(20, 23, 43, 0.24), 0 0 0 1px rgba(20, 23, 43, 0.06); font: 14px/20px "Plus Jakarta Sans Variable", ui-sans-serif, system-ui, sans-serif; }
				.leuria-consent p { flex: 1 1 280px; margin: 0; }
				.leuria-consent a { color: inherit; opacity: 0.7; }
				.leuria-consent div { display: flex; gap: 8px; margin-left: auto; }
				.leuria-consent button { min-height: 40px; padding: 0 18px; border: 0; border-radius: 999px; background: transparent; color: inherit; box-shadow: inset 0 0 0 1px rgba(127, 127, 140, 0.45); font: inherit; font-weight: 600; cursor: pointer; }
				.leuria-consent button:hover { background: rgba(127, 127, 140, 0.12); }
				@media (prefers-color-scheme: dark) { .leuria-consent { background: var(--surface, #1b1c26); color: var(--text, #eceef6); } }
			</style>
			<p><strong>Can we count your visit?</strong> We'd use Google Analytics to see which demos help, and only if you say yes.
			<a href="https://leuria.eu/privacy-policy#this-website">Details</a></p>
			<div><button type="button" data-answer="no">No thanks</button><button type="button" data-answer="yes">Yes, count it</button></div>`;
		banner.addEventListener("click", (event) => {
			const answer = event.target.closest("[data-answer]")?.dataset.answer;
			if (!answer) return;
			write(answer);
			close();
			if (answer === "yes") start();
			else stop();
		});
		document.body.appendChild(banner);
	};

	document.addEventListener("click", (event) => {
		if (event.target.closest?.("[data-consent-open]")) ask();
	});
	const answer = read();
	if (answer === "yes") start();
	else if (answer !== "no") {
		if (document.body) ask();
		else document.addEventListener("DOMContentLoaded", ask, { once: true });
	}
})();
