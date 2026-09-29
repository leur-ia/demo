import { useEffect, useState } from "react";

import { SHARED_SKILL, siteRoot } from "./ai";

interface Skill {
	name: string;
	description: string;
	files: Array<{ name: string; text: string }>;
}

/** The workshop's own skills, read from the same files the visitor's AI gets. */
async function loadSkills(): Promise<Skill[]> {
	const base = `${siteRoot}.well-known/agent-skills`;
	const index = (await fetch(`${base}/index.json`).then((r) => r.json())) as { skills: Array<{ name: string; description: string; files: string[] }> };
	return Promise.all(
		index.skills.map(async (s) => ({
			name: s.name,
			description: s.description,
			files: await Promise.all(s.files.map(async (f) => ({ name: f, text: await fetch(`${base}/${s.name}/${f}`).then((r) => r.text()) }))),
		})),
	);
}

/** "What we teach your AI": nothing hidden between the workshop and the visitor's AI. */
export function SkillsCatalog() {
	const [skills, setSkills] = useState<Skill[] | null>(null);
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		loadSkills().then(setSkills, () => setFailed(true));
	}, []);

	const [, repo, name, pin] = SHARED_SKILL.match(/^([^@]+)@([^#]+)#(.+)$/) ?? [];
	return (
		<section id="skills" className="section">
			<h2>What we teach your AI</h2>
			<p className="lede-small">
				When you connect your AI, the workshop gives it these skills: our mechanics' know-how, in plain text. Your AI reads one when your question
				calls for it. Leuria shows you the list before you connect, and they apply on this site only.
			</p>
			{failed && <p className="muted">The skills couldn't be loaded.</p>}
			<ul className="skills">
				{skills?.map((skill) => (
					<li key={skill.name} className="skill">
						<div className="skill-head">
							<h3>{skill.name}</h3>
							<span className="tag">From this workshop</span>
						</div>
						<p>{skill.description}</p>
						{skill.files.map((file) => (
							<details key={file.name}>
								<summary>{file.name}</summary>
								<pre>{file.name === "SKILL.md" ? file.text.replace(/^---[\s\S]*?---\s*/, "") : file.text}</pre>
							</details>
						))}
					</li>
				))}
				<li className="skill">
					<div className="skill-head">
						<h3>{name}</h3>
						<span className="tag tag-shared">Shared</span>
					</div>
					<p>The ABC pre-ride check, a skill any bike site can use. It lives in a public repository and is pinned to one version.</p>
					<a className="skill-link" href={`https://github.com/${repo}/tree/${pin}/skills/${name}`} target="_blank" rel="noreferrer">
						{repo} on GitHub
					</a>
				</li>
			</ul>
		</section>
	);
}
