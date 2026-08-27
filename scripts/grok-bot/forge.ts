import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { die, flagBool, flagString, parseArgs } from './cli.ts';
import { forgeGithubPrRequested, loadEnv } from './env.ts';
import { parseAgentFile } from './frontmatter.ts';
import { openGithubPullRequest } from './github.ts';
import { agentsDir, draftsDir, repoRoot } from './paths.ts';

function usage(): string {
	return `Forge — write a Quill draft into src/content/agents/<slug>.md.

Usage:
  npm run content:forge -- --draft <file.md> [--slug <kebab>] [--force] [--dry-run] [--github]
  npm run content:forge -- --slug <kebab> [--force] [--dry-run] [--github]

Default path (no GitHub required): validate the Markdown and write it into this
Astro repo's content collection. Astro watches src/content/agents/.

Optional upgrade: pass --github (or FORGE_GITHUB_PR=1) AND set GITHUB_TOKEN plus
GITHUB_REPO=owner/name. If those are missing, Forge no-ops the PR step and still
writes locally. This Origin repo (neil-lawlor/agenthub) does not need GitHub.`;
}

function resolveDraft(flags: ReturnType<typeof parseArgs>): { slug: string; draftPath: string } {
	const draftArg = flagString(flags, 'draft');
	const slugArg = flagString(flags, 'slug');

	if (draftArg) {
		const draftPath = resolve(repoRoot, draftArg);
		const slug = slugArg || basename(draftPath).replace(/\.md$/, '');
		return { slug, draftPath };
	}

	if (slugArg) {
		return { slug: slugArg, draftPath: resolve(draftsDir, `${slugArg}.md`) };
	}

	die(usage());
}

async function main(): Promise<void> {
	loadEnv(repoRoot);
	const flags = parseArgs();
	if (flagBool(flags, 'help') || flagBool(flags, 'h')) {
		console.log(usage());
		return;
	}

	const { slug, draftPath } = resolveDraft(flags);
	if (!existsSync(draftPath)) {
		die(`Forge: draft not found at ${draftPath}`);
	}

	const raw = readFileSync(draftPath, 'utf8');
	const parsed = parseAgentFile(raw);
	const outPath = resolve(agentsDir, `${slug}.md`);
	const relative = `src/content/agents/${slug}.md`;

	if (flagBool(flags, 'dry-run')) {
		process.stdout.write(raw.endsWith('\n') ? raw : `${raw}\n`);
		console.error(`Forge dry-run: would write ${relative}`);
		return;
	}

	if (existsSync(outPath) && !flagBool(flags, 'force')) {
		die(`Refusing to overwrite ${outPath} (pass --force).`);
	}

	mkdirSync(agentsDir, { recursive: true });
	writeFileSync(outPath, raw.endsWith('\n') ? raw : `${raw}\n`);
	console.log(outPath);

	const wantGithub = forgeGithubPrRequested(flagBool(flags, 'github'));
	if (!wantGithub) {
		console.error(
			'Forge: local write complete. Pass --github with GITHUB_TOKEN and GITHUB_REPO to open a GitHub PR (skipped by default).',
		);
		return;
	}

	const result = await openGithubPullRequest({
		slug,
		title: parsed.data.title,
		markdown: raw,
		path: relative,
	});

	if (result.ok) {
		console.error(`Forge: opened GitHub PR ${result.url} (branch ${result.branch})`);
		return;
	}

	if (result.skipped) {
		console.error(`Forge: ${result.message}`);
		return;
	}

	console.error(`Forge: GitHub PR failed after local write: ${result.message}`);
}

main().catch((error) => {
	die(error instanceof Error ? error.message : String(error));
});
