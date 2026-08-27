import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { agentSchema } from '../../src/content/agent-schema.ts';
import { die } from './cli.ts';
import { parseFrontmatter, rewriteAffiliateFrontmatterKeys } from './frontmatter.ts';
import { agentsDir } from './paths.ts';

function main(): void {
	const files = readdirSync(agentsDir)
		.filter((name) => name.endsWith('.md'))
		.sort();

	if (files.length === 0) {
		die(`No Markdown files in ${agentsDir}`);
	}

	let failed = 0;
	for (const name of files) {
		const path = join(agentsDir, name);
		const slug = name.replace(/\.md$/, '');
		if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
			console.error(`${name}: filename is not kebab-case`);
			failed += 1;
			continue;
		}
		try {
			const raw = readFileSync(path, 'utf8');
			const rewritten = rewriteAffiliateFrontmatterKeys(raw);
			if (rewritten !== raw) {
				writeFileSync(path, rewritten);
				console.log(`fix ${name}: normalized affiliate frontmatter key to affiliateUrl`);
			}
			const { data, body } = parseFrontmatter(rewritten);
			agentSchema.parse(data);
			if (body.trim().length < 200) {
				throw new Error('body is shorter than 200 characters');
			}
			if (/\blorem ipsum\b/i.test(raw)) {
				throw new Error('contains lorem ipsum');
			}
			console.log(`ok  ${name}`);
		} catch (error) {
			failed += 1;
			const message = error instanceof Error ? error.message : String(error);
			console.error(`err ${name}: ${message}`);
		}
	}

	if (failed) die(`content:validate failed on ${failed} file(s)`);
	console.log(`validated ${files.length} agent file(s)`);
}

try {
	main();
} catch (error) {
	die(error instanceof Error ? error.message : String(error));
}
