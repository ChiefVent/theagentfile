import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseFrontmatter } from './frontmatter.ts';
import { agentsDir } from './paths.ts';

export type CatalogEntry = {
	slug: string;
	title: string;
	category: string;
};

export function listCatalog(): CatalogEntry[] {
	if (!existsSync(agentsDir)) return [];

	return readdirSync(agentsDir)
		.filter((name) => name.endsWith('.md'))
		.sort()
		.map((name) => {
			const slug = name.replace(/\.md$/, '');
			try {
				const raw = readFileSync(join(agentsDir, name), 'utf8');
				const { data } = parseFrontmatter(raw);
				return {
					slug,
					title: typeof data.title === 'string' ? data.title : slug,
					category: typeof data.category === 'string' ? data.category : '',
				};
			} catch {
				return { slug, title: slug, category: '' };
			}
		});
}

export function catalogSlugSet(): Set<string> {
	return new Set(listCatalog().map((entry) => entry.slug));
}

export function formatCatalogForPrompt(entries: CatalogEntry[]): string {
	if (entries.length === 0) return '(catalog is empty)';
	return entries.map((entry) => `- ${entry.slug} — ${entry.title} (${entry.category})`).join('\n');
}
