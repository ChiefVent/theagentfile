import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { agentSchema, scoutOutlineSchema } from '../../src/content/agent-schema.ts';
import type { AgentFrontmatter, ScoutOutline } from '../../src/content/agent-schema.ts';
import { grokChat } from './client.ts';
import { die, flagBool, flagString, parseArgs } from './cli.ts';
import { grokApiKey, loadEnv } from './env.ts';
import { mockQuill } from './mock.ts';
import { serializeAgentMarkdown } from './frontmatter.ts';
import { draftsDir, repoRoot } from './paths.ts';

const QUILL_SYSTEM = `You are Quill, the writing half of Agent File's Grok Bot pipeline.
Turn Scout research into complete Markdown using this exact template (no YAML frontmatter, no top-level H1):

**One-line positioning.**

## What it actually does
Plain-language description of the product and the work it can complete.

## Key Features
- Concrete capability bullets

## Pricing
Public pricing in one or two sentences. Do not invent unpublished numbers.

## Strengths
- Honest strength bullets

## Limitations
- Honest limit bullets

## Best for
Who should use this, in one or two sentences.

## Final Verdict
A short close. End with **Score: X/10** using the same score as the outline.

Real copy only — no lorem. Do not invent API keys, prices, or private URLs. Do not wrap the whole article in a code fence.
Forge will add frontmatter and write src/content/agents/<slug>.md; you only write the body.`;

function usage(): string {
	return `Quill — write a catalog Markdown draft from a Scout outline.

Usage:
  npm run content:quill -- --outline <file.json> [--out <file.md>] [--force] [--mock] [--dry-run]

Writes .cache/grok-bot/drafts/<slug>.md by default using the exact TEMPLATE.md
body plus schema-valid frontmatter. Forge publishes that draft into
src/content/agents/<slug>.md.`;
}

function frontmatterFromOutline(outline: ScoutOutline, now: Date): AgentFrontmatter {
	return agentSchema.parse({
		title: outline.title,
		description: outline.description,
		category: outline.category,
		score: outline.score,
		pricing: outline.pricing,
		website: outline.website,
		date: outline.date ?? now,
		featured: outline.featured ?? false,
		...(outline.affiliateUrl ? { affiliateUrl: outline.affiliateUrl } : {}),
	});
}

function loadOutline(path: string): ScoutOutline {
	const raw = readFileSync(path, 'utf8');
	return scoutOutlineSchema.parse(JSON.parse(raw));
}

async function bodyFromApi(outline: ScoutOutline): Promise<string> {
	const { text, model } = await grokChat({
		system: QUILL_SYSTEM,
		user: `Write the article body for this outline:\n${JSON.stringify(outline, null, 2)}`,
	});
	console.error(`Quill: xAI ${model}`);
	let body = text.replace(/^```(?:markdown)?\s*/i, '').replace(/\s*```$/, '').trim();
	if (body.startsWith('---')) {
		const close = body.indexOf('\n---', 3);
		if (close !== -1) body = body.slice(close + 4).replace(/^\r?\n/, '').trim();
	}
	return body;
}

async function main(): Promise<void> {
	loadEnv(repoRoot);
	const flags = parseArgs();
	if (flagBool(flags, 'help') || flagBool(flags, 'h')) {
		console.log(usage());
		return;
	}

	const outlinePath = flagString(flags, 'outline');
	if (!outlinePath) die(usage());

	const outline = loadOutline(resolve(repoRoot, outlinePath));
	const forceMock = flagBool(flags, 'mock') || process.env.GROK_MOCK === '1';
	const useMock = forceMock || !grokApiKey();

	let body: string;
	if (useMock) {
		console.error(
			forceMock
				? 'Quill: mock mode (--mock / GROK_MOCK)'
				: 'Quill: no GROK_API_KEY or XAI_API_KEY; using mock fallback',
		);
		body = mockQuill(outline);
	} else {
		body = await bodyFromApi(outline);
	}

	if (body.length < 200) {
		die('Quill produced a body under 200 characters; refusing to write.');
	}

	const data = frontmatterFromOutline(outline, new Date());
	const markdown = serializeAgentMarkdown(data, body);
	const outPath =
		flagString(flags, 'out') || resolve(draftsDir, `${outline.slug}.md`);

	if (flagBool(flags, 'dry-run')) {
		process.stdout.write(markdown);
		return;
	}

	if (existsSync(outPath) && !flagBool(flags, 'force')) {
		die(`Refusing to overwrite ${outPath} (pass --force).`);
	}

	mkdirSync(resolve(outPath, '..'), { recursive: true });
	writeFileSync(outPath, markdown);
	console.log(outPath);
}

main().catch((error) => {
	die(error instanceof Error ? error.message : String(error));
});
