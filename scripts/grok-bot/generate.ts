import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scoutOutlineSchema } from '../../src/content/agent-schema.ts';
import { die, flagBool, flagString, parseArgs } from './cli.ts';
import { loadEnv } from './env.ts';
import { draftsDir, outlineDir, repoRoot } from './paths.ts';
import { DAILY_SCOUT_BRIEF } from './routine.ts';

function usage(): string {
	return `Generate — Scout, then Quill, then Forge.

Usage:
  npm run content:generate -- [--brief "<text>"] [--slug <kebab>] [--force] [--mock] [--dry-run] [--github]

Daily Scout brief (when --brief is omitted):
  "${DAILY_SCOUT_BRIEF}"

Writes outline JSON and a Quill draft under .cache/grok-bot/, then Forge
publishes src/content/agents/<slug>.md. GitHub is optional (--github).`;
}

function run(script: string, extra: string[]): void {
	const result = spawnSync(
		process.execPath,
		['--experimental-strip-types', '--no-warnings', script, ...extra],
		{ cwd: repoRoot, stdio: 'inherit' },
	);
	if (result.status !== 0) {
		process.exit(result.status ?? 1);
	}
}

function main(): void {
	loadEnv(repoRoot);
	const flags = parseArgs();
	if (flagBool(flags, 'help') || flagBool(flags, 'h')) {
		console.log(usage());
		return;
	}

	const brief = flagString(flags, 'brief') || DAILY_SCOUT_BRIEF;
	const slugFlag = flagString(flags, 'slug');
	const here = dirname(fileURLToPath(import.meta.url));
	const dryRun = flagBool(flags, 'dry-run');
	const mock = flagBool(flags, 'mock');
	const force = flagBool(flags, 'force');
	const github = flagBool(flags, 'github');

	mkdirSync(outlineDir, { recursive: true });
	const stagingPath = resolve(outlineDir, slugFlag ? `${slugFlag}.json` : '_staging.json');

	const scoutArgs = ['--brief', brief, '--out', stagingPath];
	if (slugFlag) scoutArgs.push('--slug', slugFlag);
	if (mock) scoutArgs.push('--mock');
	if (force) scoutArgs.push('--force');
	if (dryRun) scoutArgs.push('--dry-run');

	run(resolve(here, 'scout.ts'), scoutArgs);
	if (dryRun) return;

	if (!existsSync(stagingPath)) die(`Scout did not write ${stagingPath}`);
	const outline = scoutOutlineSchema.parse(JSON.parse(readFileSync(stagingPath, 'utf8')));
	const slug = outline.slug;
	const outlinePath = resolve(outlineDir, `${slug}.json`);
	if (outlinePath !== stagingPath) {
		writeFileSync(outlinePath, `${JSON.stringify(outline, null, 2)}\n`);
	}

	const quillArgs = ['--outline', outlinePath];
	if (mock) quillArgs.push('--mock');
	if (force) quillArgs.push('--force');
	run(resolve(here, 'quill.ts'), quillArgs);

	const draftPath = resolve(draftsDir, `${slug}.md`);
	if (!existsSync(draftPath)) die(`Quill did not write ${draftPath}`);

	const forgeArgs = ['--draft', draftPath, '--slug', slug];
	if (force) forgeArgs.push('--force');
	if (github) forgeArgs.push('--github');
	run(resolve(here, 'forge.ts'), forgeArgs);
}

try {
	main();
} catch (error) {
	die(error instanceof Error ? error.message : String(error));
}
