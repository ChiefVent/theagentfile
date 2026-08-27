import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { scoutOutlineSchema } from '../../src/content/agent-schema.ts';
import type { ScoutOutline } from '../../src/content/agent-schema.ts';
import { grokChat, extractJsonObject } from './client.ts';
import { die, flagBool, flagString, parseArgs, slugify } from './cli.ts';
import { grokApiKey, loadEnv } from './env.ts';
import { catalogSlugSet, formatCatalogForPrompt, listCatalog } from './existing.ts';
import { mockScout } from './mock.ts';
import { outlineDir, repoRoot } from './paths.ts';
import { DAILY_SCOUT_BRIEF } from './routine.ts';

const SCOUT_SYSTEM = `You are Scout, the research half of Agent File's Grok Bot pipeline.
Research one autonomous AI agent that is NOT already in the catalog list you are given.
Produce a JSON object only (no markdown) with:
- slug: lowercase kebab-case id
- title, description
- category: one of General, Coding, Sales, Research, Productivity, Marketing, Other
- score: number from 0 to 10
- scoreRationale: one or two sentences on why that score
- pricing: short public pricing string (e.g. Free, Usage-based, Paid)
- website: https URL for the product
- affiliateUrl: optional https partner/affiliate URL. Omit unless a real public URL is documented. Never invent one.
- date: ISO date (YYYY-MM-DD)
- featured: boolean
- whyAutonomous: why this is an agent that does work, not a chatbot UI
- howItRuns: how a person or team actually runs it
- limits: 2-5 honest caveats
- researchNotes: 3-6 factual bullets
- sections: at least 3 objects { heading, points[] } for the public article

Write real facts. No lorem ipsum. No invented credentials or private URLs.
Do not pick an agent whose slug or product name is already in the catalog.
Agent File is a static Astro catalog; this JSON is an outline, not the published page.
When you finish, Quill will write the article; you do not write Markdown.`;

function usage(): string {
	return `Scout — research/outline a new Agent File catalog entry.

Usage:
  npm run content:scout -- [--brief "<text>"] [--slug <kebab>] [--out <file.json>] [--mock] [--dry-run] [--force]

Daily routine (used when --brief is omitted):
  "${DAILY_SCOUT_BRIEF}"

Writes JSON for Quill. Uses the xAI Grok API when GROK_API_KEY or XAI_API_KEY
is set; otherwise (or with --mock) uses a local fallback.`;
}

async function scoutFromApi(brief: string, slug: string | undefined, catalog: string): Promise<ScoutOutline> {
	const user = [
		`Brief:\n${brief}`,
		slug ? `Preferred slug: ${slug}` : 'Choose a kebab-case slug from the name.',
		`Existing Agent File entries (do not research these):\n${catalog}`,
	].join('\n\n');

	const { text, model } = await grokChat({
		system: SCOUT_SYSTEM,
		user,
		json: true,
	});
	console.error(`Scout: xAI ${model}`);

	const parsed = scoutOutlineSchema.parse(extractJsonObject(text));
	if (slug && parsed.slug !== slug) {
		return { ...parsed, slug };
	}
	return parsed;
}

async function main(): Promise<void> {
	loadEnv(repoRoot);
	const flags = parseArgs();
	if (flagBool(flags, 'help') || flagBool(flags, 'h')) {
		console.log(usage());
		return;
	}

	const brief = flagString(flags, 'brief') || DAILY_SCOUT_BRIEF;
	const slug = flagString(flags, 'slug');
	const forceMock = flagBool(flags, 'mock') || process.env.GROK_MOCK === '1';
	const useMock = forceMock || !grokApiKey();
	const existing = listCatalog();
	const catalogText = formatCatalogForPrompt(existing);

	let outline: ScoutOutline;
	if (useMock) {
		console.error(
			forceMock
				? 'Scout: mock mode (--mock / GROK_MOCK)'
				: 'Scout: no GROK_API_KEY or XAI_API_KEY; using mock fallback',
		);
		outline = mockScout(brief, slug);
	} else {
		outline = await scoutFromApi(brief, slug, catalogText);
	}

	outline = scoutOutlineSchema.parse({
		...outline,
		slug: slug || outline.slug || slugify(brief),
	});

	const listed = catalogSlugSet();
	if (listed.has(outline.slug) && !flagBool(flags, 'force')) {
		die(
			`Scout: "${outline.slug}" is already on Agent File. Research a different agent, or pass --force to outline it anyway.`,
		);
	}

	const outPath =
		flagString(flags, 'out') || resolve(outlineDir, `${outline.slug}.json`);

	const serialized = `${JSON.stringify(outline, null, 2)}\n`;
	if (flagBool(flags, 'dry-run')) {
		process.stdout.write(serialized);
		return;
	}

	mkdirSync(resolve(outPath, '..'), { recursive: true });
	writeFileSync(outPath, serialized);
	console.log(outPath);
}

main().catch((error) => {
	die(error instanceof Error ? error.message : String(error));
});
