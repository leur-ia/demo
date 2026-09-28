import { elementById } from "./data";

export function ElementChip({ id }: { id: string }) {
	const element = elementById.get(id);
	if (!element) return null;
	return (
		<span className="chip-el" style={{ "--el": element.color } as React.CSSProperties}>
			{element.name}
		</span>
	);
}
