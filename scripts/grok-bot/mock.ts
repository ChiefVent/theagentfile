import type { ScoutOutline } from '../../src/content/agent-schema.ts';
import { slugify } from './cli.ts';
import { catalogSlugSet } from './existing.ts';
import { isDailyScoutBrief } from './routine.ts';

type KnownAgent = Omit<ScoutOutline, 'slug'> & { slugs: string[] };

const today = '2026-08-25';

const known: KnownAgent[] = [
	{
		slugs: ['grok-bot', 'grok', 'grokbot'],
		title: 'Grok Bot',
		description:
			'xAI teammates on a shared cloud computer. On Agent File, Scout researches a catalog entry and Quill writes the Markdown.',
		category: 'Coding',
		score: 9.2,
		pricing: 'xAI API (usage-based)',
		website: 'https://x.ai',
		date: new Date(today),
		featured: true,
		whyAutonomous:
			'Named bots keep a cloud computer and can hand work to each other instead of bouncing every step through a chat box.',
		scoreRationale:
			'High because the Agent File pipeline actually runs on it (Scout → Quill → Forge), with a documented mock fallback.',
		howItRuns:
			'Create a bot on xAI, or run Agent File’s local CLI (`npm run content:generate`) with GROK_API_KEY / XAI_API_KEY.',
		limits: [
			'Without an API key the local CLI uses a mock outline, not live research.',
			'Forge’s GitHub PR path is optional and does nothing unless a token and repo are set.',
		],
		researchNotes: [
			'Grok Bot is xAI’s product for persistent named bots with a cloud computer.',
			'Agent File splits content work into Scout (outline), Quill (Markdown draft), and Forge (catalog file).',
			'The xAI HTTP API is https://api.x.ai/v1; keys are GROK_API_KEY or XAI_API_KEY.',
		],
		sections: [
			{
				heading: 'What it is',
				points: [
					'Persistent bots that can use a browser, filesystem, and terminal.',
					'Bots can hand work to each other on one user-scoped computer.',
				],
			},
			{
				heading: 'Scout',
				points: [
					'Turns a brief into JSON matching the agents collection schema.',
					'Does not write the public page.',
				],
			},
			{
				heading: 'Quill and Forge',
				points: [
					'Quill writes a draft with YAML frontmatter plus article body.',
					'Forge validates that draft and writes src/content/agents/<slug>.md.',
				],
			},
		],
	},
	{
		slugs: ['cursor-cloud-agents', 'cursor-cloud', 'cursor-agent', 'cloud-agents'],
		title: 'Cursor Cloud Agents',
		description:
			'Remote agents that boot a VM, check out a repo, and ship git changes. On Agent File they validate, commit, and deploy what Grok Bot drafts.',
		category: 'Coding',
		score: 9.0,
		pricing: 'Usage-based',
		website: 'https://cursor.com/agents',
		date: new Date('2026-08-24'),
		featured: true,
		whyAutonomous:
			'They check out a real repo, edit files, run the build, and commit — a job, not a chat sidebar.',
		scoreRationale:
			'High for repo-native delivery. Agent File uses them to publish catalog files on main.',
		howItRuns: 'Start a run from cursor.com/agents or the Cloud Agents panel in the editor.',
		limits: [
			'They cannot see unsaved local buffers.',
			'Network egress follows the environment policy.',
		],
		researchNotes: [
			'Cloud Agents run in remote environments against a git checkout.',
			'Agent File uses them for Phase B: validate, commit main, push, build, deploy.',
			'They should not invent hosting credentials or open a PR unless asked.',
		],
		sections: [
			{
				heading: 'What they do here',
				points: [
					'Validate new files in src/content/agents/.',
					'Stage only content files, commit, push main, run the static build.',
				],
			},
			{
				heading: 'Handoff from Grok Bot',
				points: [
					'Scout, Quill, and Forge produce Markdown in this tree.',
					'The Cloud Agent is the git and release step on Origin.',
				],
			},
			{
				heading: 'Limits',
				points: [
					'No deploy tokens in the repo.',
					'Stay on main when the task is meant to ship.',
				],
			},
		],
	},
	{
		slugs: ['claude-code', 'claude'],
		title: 'Claude Code',
		description:
			'Anthropic’s agentic coding CLI. It works in a real repo: reads files, runs commands, and edits until the task is done.',
		category: 'Coding',
		score: 8.8,
		pricing: 'Anthropic API / Claude Pro',
		website: 'https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview',
		date: new Date(today),
		featured: true,
		whyAutonomous:
			'It inspects the tree, edits files, and runs project commands in a loop until the task is done.',
		scoreRationale:
			'Strong terminal-native coding agent with a clear run loop. Score reflects public docs, not a private eval.',
		howItRuns: 'Install the Claude Code CLI and start it in a project directory with a concrete task.',
		limits: [
			'Best inside a repo a human is already in, not a hosted catalog CMS.',
			'Needs Anthropic credentials and an allowed environment.',
		],
		researchNotes: [
			'Claude Code is a terminal-native coding agent from Anthropic.',
			'It uses Claude models with tool access to the workspace.',
			'Typical loop: plan, edit, test, repeat.',
		],
		sections: [
			{
				heading: 'What it is',
				points: [
					'A command-line coding agent from Anthropic.',
					'It inspects the tree, edits files, and runs project commands.',
				],
			},
			{
				heading: 'Where it fits',
				points: [
					'Best for repo-local implementation work a human is already in.',
					'Complements cloud agents that boot an isolated VM for a GitHub issue.',
				],
			},
			{
				heading: 'How people run it',
				points: [
					'Install the Claude Code CLI and start it in a project directory.',
					'Give a concrete task with acceptance checks (tests, lint, a URL).',
				],
			},
		],
	},
	{
		slugs: ['aider'],
		title: 'Aider',
		description:
			'An open-source pair-programming agent that maps your git repo, proposes diffs, and commits with your chosen model.',
		category: 'Coding',
		score: 8.2,
		pricing: 'Open source (bring your own model key)',
		website: 'https://aider.chat',
		date: new Date(today),
		featured: false,
		whyAutonomous: 'It maps the repo, edits files as diffs, and can commit — git-native agent work.',
		scoreRationale: 'Solid local CLI with model choice. Score is for the public product, not Agent File usage.',
		howItRuns: 'Install the Aider CLI, point it at a git repo, and pick a model API key.',
		limits: [
			'You bring your own model key.',
			'It is local, not a hosted cloud VM.',
		],
		researchNotes: [
			'Aider is a local CLI that talks to many model APIs.',
			'It is git-native: it can commit the edits it makes.',
			'Useful when you want model choice and a repo-local workflow.',
		],
		sections: [
			{
				heading: 'What it is',
				points: [
					'A terminal pair programmer that works against the files in a git repo.',
					'You pick the model; Aider handles context, diffs, and optional commits.',
				],
			},
			{
				heading: 'How it works',
				points: [
					'It builds a map of the repo so it can pull in the right files.',
					'Edits land as diffs you can review in git.',
				],
			},
			{
				heading: 'When to use it',
				points: [
					'Local, model-flexible coding help without a hosted cloud VM.',
					'Teams that already live in git and want an agent in that loop.',
				],
			},
		],
	},
	{
		slugs: ['github-copilot', 'copilot', 'copilot-coding-agent'],
		title: 'GitHub Copilot',
		description:
			'GitHub’s coding assistant and coding agent: inline help in the editor, plus agents that open pull requests from issues.',
		category: 'Coding',
		score: 8.0,
		pricing: 'Paid (GitHub Copilot plans)',
		website: 'https://github.com/features/copilot',
		date: new Date(today),
		featured: false,
		whyAutonomous:
			'The coding agent can take an issue and come back with a pull request, not only inline completions.',
		scoreRationale: 'Broad distribution on GitHub. Agent File’s own forge is Origin, so Copilot is a neighbor, not the host.',
		howItRuns: 'Enable Copilot on a GitHub org, or assign the coding agent to an issue.',
		limits: [
			'It assumes GitHub as the source of truth.',
			'Policy, billing, and model choice are set on the GitHub org.',
		],
		researchNotes: [
			'Copilot started as autocomplete and chat in the editor.',
			'GitHub also ships a coding agent that works from issues toward a PR.',
			'It is tightly tied to GitHub repositories and review flow.',
		],
		sections: [
			{
				heading: 'What it is',
				points: [
					'A GitHub-native assistant for writing and reviewing code.',
					'Includes editor completions and issue-to-PR coding agents.',
				],
			},
			{
				heading: 'How it shows up',
				points: [
					'In VS Code, JetBrains, and github.com on repositories you can access.',
					'As a coding agent assigned to an issue that comes back with a pull request.',
				],
			},
			{
				heading: 'Limits',
				points: [
					'It assumes GitHub as the source of truth.',
					'Policy, billing, and model choice are set on the GitHub org.',
				],
			},
		],
	},
];

function titleFromBrief(brief: string): string {
	const cleaned = brief.replace(/\s+/g, ' ').trim();
	const firstClause = cleaned.split(/[.,;:(]/)[0]?.trim() || cleaned;
	return firstClause
		.split(' ')
		.slice(0, 6)
		.map((word) => {
			if (word.toLowerCase() === word && word.length > 2) {
				return word.charAt(0).toUpperCase() + word.slice(1);
			}
			return word;
		})
		.join(' ');
}

function matchKnown(brief: string, slug?: string): KnownAgent | undefined {
	const hay = `${slug ?? ''} ${brief}`.toLowerCase();
	return known.find((entry) =>
		entry.slugs.some(
			(candidate) => hay.includes(candidate.replace(/-/g, ' ')) || hay.includes(candidate),
		),
	);
}

function firstUnlistedKnown(): KnownAgent | undefined {
	const listed = catalogSlugSet();
	return known.find((entry) => !listed.has(entry.slugs[0]));
}

/** Deterministic outline used when no xAI key is set (or `--mock` is passed). */
export function mockScout(brief: string, slugArg?: string): ScoutOutline {
	if (!slugArg && isDailyScoutBrief(brief)) {
		const unlisted = firstUnlistedKnown();
		if (unlisted) {
			const { slugs, ...rest } = unlisted;
			return { ...rest, slug: slugs[0] };
		}
	}

	const knownHit = matchKnown(brief, slugArg);
	if (knownHit) {
		const slug = slugArg || knownHit.slugs[0];
		const { slugs: _slugs, ...rest } = knownHit;
		return { ...rest, slug };
	}

	const slug = slugArg || slugify(brief);
	const title = titleFromBrief(brief);
	const compact = brief.replace(/\s+/g, ' ').trim();
	return {
		slug,
		title,
		description: `${title} is catalogued on Agent File from this brief: ${compact}`,
		category: 'Other',
		score: 6.5,
		pricing: 'See vendor',
		website: 'https://github.com/topics/ai-agents',
		date: new Date(today),
		featured: false,
		whyAutonomous:
			'This mock treats the brief as an agent that does work outside a chat box. Replace it with a researched outline when an xAI key is set.',
		scoreRationale: 'Placeholder 6.5 — the mock does not invent a private eval.',
		howItRuns: 'Re-run Scout with GROK_API_KEY or XAI_API_KEY, or edit the Markdown by hand.',
		limits: [
			'No live research ran for this outline.',
			'Do not treat mock pricing or scores as vendor claims.',
		],
		researchNotes: [
			`No xAI key was set, so Scout used the mock fallback for “${compact}”.`,
			'Replace this entry by re-running with GROK_API_KEY or XAI_API_KEY for a researched draft.',
			'Frontmatter still matches the agents collection schema so the site can build.',
		],
		sections: [
			{
				heading: 'What it is',
				points: [
					`${title} is an AI agent described from the supplied brief.`,
					'This mock does not invent a vendor case study or private pricing.',
				],
			},
			{
				heading: 'Why it is in Agent File',
				points: [
					'The catalog is Markdown files, not a database.',
					'Scout’s job is a complete outline; Quill turns it into a page; Forge writes the file.',
				],
			},
			{
				heading: 'How to replace this draft',
				points: [
					'Set GROK_API_KEY or XAI_API_KEY and re-run content:generate with --force.',
					`Or edit src/content/agents/${slug}.md by hand; the schema is the contract.`,
				],
			},
		],
	};
}

export function mockQuill(outline: ScoutOutline): string {
	const featurePoints = outline.sections
		.flatMap((section) => section.points)
		.slice(0, 6)
		.map((point) => `- ${point}`)
		.join('\n');
	const strengths = outline.researchNotes
		.slice(0, 4)
		.map((note) => `- ${note}`)
		.join('\n');
	const limits = outline.limits.map((limit) => `- ${limit}`).join('\n');
	const scoreLabel = Number.isInteger(outline.score)
		? String(outline.score)
		: outline.score.toFixed(1);

	return [
		`**${outline.description}**`,
		`## What it actually does\n\n${outline.whyAutonomous}\n\n${outline.howItRuns}`,
		`## Key Features\n\n${featurePoints}`,
		`## Pricing\n\n${outline.pricing}.`,
		`## Strengths\n\n${strengths}`,
		`## Limitations\n\n${limits}`,
		`## Best for\n\n${outline.scoreRationale}`,
		`## Final Verdict\n\n${outline.title} is catalogued from Scout research. ${outline.scoreRationale} **Score: ${scoreLabel}/10**`,
	].join('\n\n');
}
