/** A mug in the product's glaze. */
export function Mug({ glaze, soldOut = false }: { glaze: string; soldOut?: boolean }) {
	return (
		<svg className="mug" viewBox="0 0 120 100" role="presentation" aria-hidden style={{ opacity: soldOut ? 0.55 : 1 }}>
			<ellipse cx="54" cy="90" rx="40" ry="5" fill="currentColor" opacity="0.08" />
			<path d="M84 34c14 0 22 7 22 18s-9 19-24 19" fill="none" stroke={glaze} strokeWidth="9" strokeLinecap="round" />
			<path d="M84 34c14 0 22 7 22 18s-9 19-24 19" fill="none" stroke="#000" strokeOpacity="0.12" strokeWidth="9" strokeLinecap="round" />
			<path d="M18 22h72v48c0 11-9 20-20 20H38c-11 0-20-9-20-20z" fill={glaze} />
			<path d="M18 22h72v48c0 11-9 20-20 20H38c-11 0-20-9-20-20z" fill="url(#mug-shade)" />
			<ellipse cx="54" cy="22" rx="36" ry="6" fill={glaze} />
			<ellipse cx="54" cy="22" rx="31" ry="4" fill="#000" opacity="0.18" />
			<path d="M18 22h72" stroke="#000" strokeOpacity="0.08" />
			<defs>
				<linearGradient id="mug-shade" x1="0" x2="1">
					<stop offset="0" stopColor="#fff" stopOpacity="0.28" />
					<stop offset="0.45" stopColor="#fff" stopOpacity="0" />
					<stop offset="1" stopColor="#000" stopOpacity="0.16" />
				</linearGradient>
			</defs>
		</svg>
	);
}
