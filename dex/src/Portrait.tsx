import type { Creature } from "./data";
import { elementById } from "./data";

/** Eyes that look alive: a white, a pupil, a glint. */
function Eyes({ x, y, gap = 14, r = 5 }: { x: number; y: number; gap?: number; r?: number }) {
	return (
		<g>
			{[x - gap / 2, x + gap / 2].map((cx) => (
				<g key={cx}>
					<circle cx={cx} cy={y} r={r} fill="#fff" />
					<circle cx={cx + 0.8} cy={y + 0.6} r={r * 0.55} fill="#1d1a24" />
					<circle cx={cx + 1.8} cy={y - 1.2} r={r * 0.2} fill="#fff" />
				</g>
			))}
		</g>
	);
}

/** One simple body per shape, in the creature's two colours. */
function Body({ shape, a, b }: { shape: Creature["shape"]; a: string; b: string }) {
	switch (shape) {
		case "quadruped":
			return (
				<g>
					<path d="M86 66c10-4 16-14 12-22-2 8-8 12-14 12z" fill={b} />
					{[34, 46, 66, 78].map((x) => (
						<rect key={x} x={x} y={72} width={8} height={18} rx={4} fill={b} />
					))}
					<ellipse cx="58" cy="66" rx="30" ry="16" fill={a} />
					<circle cx="36" cy="50" r="16" fill={a} />
					<path d="M24 38l4-14 8 10zM40 34l8-12 2 14z" fill={b} />
					<Eyes x={36} y={49} gap={12} r={4} />
					<circle cx="36" cy="57" r="2" fill={b} />
				</g>
			);
		case "biped":
			return (
				<g>
					<rect x="44" y="74" width="10" height="18" rx="5" fill={b} />
					<rect x="66" y="74" width="10" height="18" rx="5" fill={b} />
					<ellipse cx="60" cy="62" rx="22" ry="20" fill={a} />
					<ellipse cx="60" cy="68" rx="12" ry="10" fill={b} opacity="0.35" />
					<path d="M38 58c-8 2-12 8-10 14 6-2 10-6 12-10zM82 58c8 2 12 8 10 14-6-2-10-6-12-10z" fill={a} />
					<circle cx="60" cy="36" r="16" fill={a} />
					<path d="M50 22l-4-10 10 6zM70 22l4-10-10 6z" fill={b} />
					<Eyes x={60} y={35} gap={12} r={4.5} />
				</g>
			);
		case "bird":
			return (
				<g>
					<path d="M60 56c-26-18-40-8-46 4 16-2 30 2 42 8z" fill={b} />
					<path d="M60 56c26-18 40-8 46 4-16-2-30 2-42 8z" fill={b} />
					<ellipse cx="60" cy="64" rx="18" ry="22" fill={a} />
					<path d="M52 84l-4 8M68 84l4 8" stroke={b} strokeWidth="3" strokeLinecap="round" />
					<path d="M56 50l4 8 4-8z" fill="#e8b23a" />
					<path d="M54 30c2-8 10-10 14-4-4-2-8 0-10 4z" fill={b} />
					<Eyes x={60} y={42} gap={11} r={4} />
				</g>
			);
		case "serpent":
			return (
				<g>
					<path d="M20 84c10-20 34-6 40-22s-8-28 10-36" fill="none" stroke={a} strokeWidth="16" strokeLinecap="round" />
					<path d="M20 84c10-20 34-6 40-22s-8-28 10-36" fill="none" stroke={b} strokeWidth="4" strokeDasharray="2 8" strokeLinecap="round" />
					<ellipse cx="78" cy="28" rx="15" ry="12" fill={a} />
					<path d="M90 32l8 4-8 1" stroke="#c9463a" strokeWidth="2" fill="none" />
					<Eyes x={78} y={25} gap={10} r={3.5} />
				</g>
			);
		case "fish":
			return (
				<g>
					<path d="M84 60l20-16v32z" fill={b} />
					<ellipse cx="56" cy="60" rx="32" ry="20" fill={a} />
					<path d="M50 42c6-10 18-10 22 0z" fill={b} />
					<path d="M40 52c4 6 4 10 0 16" stroke={b} strokeWidth="2.5" fill="none" strokeLinecap="round" />
					<Eyes x={32} y={55} gap={0} r={5} />
				</g>
			);
		case "blob":
			return (
				<g>
					<path d="M26 84c-6-30 8-52 34-52s40 22 34 52z" fill={a} />
					<path d="M26 84c10-6 58-6 68 0z" fill={b} opacity="0.5" />
					<circle cx="44" cy="44" r="5" fill="#fff" opacity="0.35" />
					<Eyes x={60} y={58} gap={16} r={5} />
					<path d="M54 70q6 5 12 0" stroke={b} strokeWidth="2.5" fill="none" strokeLinecap="round" />
				</g>
			);
		case "insect":
			return (
				<g>
					<ellipse cx="44" cy="46" rx="18" ry="11" fill={b} opacity="0.45" transform="rotate(-25 44 46)" />
					<ellipse cx="76" cy="46" rx="18" ry="11" fill={b} opacity="0.45" transform="rotate(25 76 46)" />
					<ellipse cx="60" cy="72" rx="12" ry="18" fill={a} />
					<path d="M50 70h20M50 78h20" stroke={b} strokeWidth="3" />
					<circle cx="60" cy="46" r="12" fill={a} />
					<path d="M54 36c-4-8-8-10-12-10M66 36c4-8 8-10 12-10" stroke={b} strokeWidth="2.5" fill="none" strokeLinecap="round" />
					<Eyes x={60} y={46} gap={10} r={3.5} />
				</g>
			);
		case "plant":
			return (
				<g>
					<path d="M60 92V58" stroke={b} strokeWidth="5" />
					<path d="M60 76c-14-2-22-10-22-18 12 0 20 8 22 18zM60 70c14-2 22-10 22-18-12 0-20 8-22 18z" fill={b} />
					<circle cx="60" cy="44" r="20" fill={a} />
					{[0, 60, 120, 180, 240, 300].map((deg) => (
						<ellipse key={deg} cx="60" cy="20" rx="6" ry="9" fill={b} opacity="0.6" transform={`rotate(${deg} 60 44)`} />
					))}
					<circle cx="60" cy="44" r="16" fill={a} />
					<Eyes x={60} y={43} gap={12} r={4} />
				</g>
			);
	}
}

/** A creature's portrait, on a disc of its first element's colour. */
export function Portrait({ creature, size = 120 }: { creature: Creature; size?: number }) {
	const tint = elementById.get(creature.elements[0] ?? "")?.color ?? "#888";
	return (
		<svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label={`${creature.name}, ${creature.species}`}>
			<circle cx="60" cy="62" r="52" fill={tint} opacity="0.16" />
			<ellipse cx="60" cy="96" rx="30" ry="4" fill="#000" opacity="0.12" />
			<Body shape={creature.shape} a={creature.colors[0]} b={creature.colors[1]} />
		</svg>
	);
}
