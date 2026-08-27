import { githubBaseBranch, githubRepoSpec, githubToken } from './env.ts';

export type GithubConfig = {
	token: string;
	owner: string;
	repo: string;
	baseBranch: string;
};

export function githubConfig(): GithubConfig | undefined {
	const token = githubToken();
	const spec = githubRepoSpec();
	if (!token || !spec) return undefined;
	const [owner, repo] = spec.split('/');
	if (!owner || !repo) return undefined;
	return { token, owner, repo, baseBranch: githubBaseBranch() };
}

type GithubResult =
	| { ok: true; url: string; branch: string }
	| { ok: false; skipped?: boolean; message: string };

async function githubJson(
	config: GithubConfig,
	method: string,
	path: string,
	body?: unknown,
): Promise<{ status: number; data: unknown }> {
	const response = await fetch(`https://api.github.com${path}`, {
		method,
		headers: {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${config.token}`,
			'X-GitHub-Api-Version': '2022-11-28',
			'User-Agent': 'agenthub-forge',
			...(body ? { 'Content-Type': 'application/json' } : {}),
		},
		body: body ? JSON.stringify(body) : undefined,
		signal: AbortSignal.timeout(60_000),
	});
	const text = await response.text();
	let data: unknown = text;
	try {
		data = text ? JSON.parse(text) : {};
	} catch {
		data = { raw: text.slice(0, 400) };
	}
	return { status: response.status, data };
}

function shaFromRef(data: unknown): string | undefined {
	if (!data || typeof data !== 'object') return undefined;
	const object = (data as Record<string, unknown>).object;
	if (!object || typeof object !== 'object') return undefined;
	const sha = (object as Record<string, unknown>).sha;
	return typeof sha === 'string' ? sha : undefined;
}

function htmlUrl(data: unknown): string | undefined {
	if (!data || typeof data !== 'object') return undefined;
	const url = (data as Record<string, unknown>).html_url;
	return typeof url === 'string' ? url : undefined;
}

function apiMessage(data: unknown): string {
	if (!data || typeof data !== 'object') return String(data);
	const message = (data as Record<string, unknown>).message;
	return typeof message === 'string' ? message : JSON.stringify(data).slice(0, 400);
}

/**
 * Optional upgrade: open a GitHub pull request for a catalog Markdown file.
 * This repo's default path is Origin (`neil-lawlor/agenthub`) + a local write.
 * Skip unless GITHUB_TOKEN and GITHUB_REPO are both set.
 */
export async function openGithubPullRequest(options: {
	slug: string;
	title: string;
	markdown: string;
	path: string;
}): Promise<GithubResult> {
	const config = githubConfig();
	if (!config) {
		return {
			ok: false,
			skipped: true,
			message:
				'GitHub PR skipped (GITHUB_TOKEN and GITHUB_REPO are not set). Local write is the default path for this Origin repo.',
		};
	}

	const branch = `content/${options.slug}-${Date.now().toString(36)}`;
	const filePath = options.path.replace(/^\.\/?/, '');

	const ref = await githubJson(
		config,
		'GET',
		`/repos/${config.owner}/${config.repo}/git/ref/heads/${config.baseBranch}`,
	);
	if (ref.status >= 400) {
		return {
			ok: false,
			message: `GitHub ref lookup failed (${ref.status}): ${apiMessage(ref.data)}`,
		};
	}

	const sha = shaFromRef(ref.data);
	if (!sha) {
		return { ok: false, message: 'GitHub ref lookup returned no SHA.' };
	}

	const created = await githubJson(config, 'POST', `/repos/${config.owner}/${config.repo}/git/refs`, {
		ref: `refs/heads/${branch}`,
		sha,
	});
	if (created.status >= 400) {
		return {
			ok: false,
			message: `GitHub branch create failed (${created.status}): ${apiMessage(created.data)}`,
		};
	}

	const encoded = Buffer.from(options.markdown, 'utf8').toString('base64');
	const put = await githubJson(
		config,
		'PUT',
		`/repos/${config.owner}/${config.repo}/contents/${filePath}`,
		{
			message: `Add ${options.title} to the Agent File catalog`,
			content: encoded,
			branch,
		},
	);
	if (put.status >= 400) {
		return {
			ok: false,
			message: `GitHub file commit failed (${put.status}): ${apiMessage(put.data)}`,
		};
	}

	const pull = await githubJson(config, 'POST', `/repos/${config.owner}/${config.repo}/pulls`, {
		title: `Add ${options.title} to Agent File`,
		head: branch,
		base: config.baseBranch,
		body: [
			`Forge prepared \`src/content/agents/${options.slug}.md\` from a Quill draft.`,
			'',
			'This is the optional GitHub PR upgrade. A Cursor Cloud Agent can review and merge.',
			'The file is also written locally so Origin (`neil-lawlor/agenthub`) can ship on `main` without GitHub.',
		].join('\n'),
	});
	if (pull.status >= 400) {
		return {
			ok: false,
			message: `GitHub pull request failed (${pull.status}): ${apiMessage(pull.data)}`,
		};
	}

	const url = htmlUrl(pull.data) || `https://github.com/${config.owner}/${config.repo}/pulls`;
	return { ok: true, url, branch };
}
