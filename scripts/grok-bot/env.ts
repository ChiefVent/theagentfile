import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

/** Load `.env` into `process.env` without overwriting variables already set. */
export function loadEnv(root: string): void {
	const path = resolve(root, '.env');
	if (!existsSync(path)) return;

	const text = readFileSync(path, 'utf8');
	for (const line of text.split('\n')) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('#')) continue;
		const eq = trimmed.indexOf('=');
		if (eq <= 0) continue;
		const key = trimmed.slice(0, eq).trim();
		let value = trimmed.slice(eq + 1).trim();
		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1);
		}
		if (process.env[key] === undefined) process.env[key] = value;
	}
}

export function grokApiKey(): string | undefined {
	const key = process.env.GROK_API_KEY || process.env.XAI_API_KEY;
	return key && key.trim() ? key.trim() : undefined;
}

export function grokModel(): string {
	return process.env.GROK_MODEL?.trim() || 'grok-4';
}

export function githubToken(): string | undefined {
	const key = process.env.GITHUB_TOKEN?.trim();
	return key || undefined;
}

export function githubRepoSpec(): string | undefined {
	const spec = process.env.GITHUB_REPO?.trim() || process.env.GITHUB_REPOSITORY?.trim();
	return spec && spec.includes('/') ? spec : undefined;
}

export function githubBaseBranch(): string {
	return process.env.GITHUB_BASE_BRANCH?.trim() || 'main';
}

export function forgeGithubPrRequested(flag: boolean): boolean {
	if (process.env.FORGE_SKIP_GITHUB === '1') return false;
	return flag || process.env.FORGE_GITHUB_PR === '1';
}
