import { z } from 'astro/zod';

/** Catalog category for a published agent entry. */
export const agentCategorySchema = z.enum([
	'General',
	'Coding',
	'Sales',
	'Research',
	'Productivity',
	'Marketing',
	'Other',
]);

/**
 * Compact form of a frontmatter key: case-insensitive, ignore `_` and `-`.
 * Maps `affiliate_url`, `affiliateURL`, `affilateUrl`, etc. onto `affiliateUrl`.
 */
function compactFrontmatterKey(key: string): string {
	return key.replace(/[-_]/g, '').toLowerCase();
}

/** True for `affiliateUrl` and common misspellings / case / snake_case aliases. */
export function isAffiliateUrlKey(key: string): boolean {
	const compact = compactFrontmatterKey(key);
	return (
		compact === 'affiliateurl' ||
		compact === 'affilateurl' ||
		compact === 'affliateurl' ||
		compact === 'affiliateuri' ||
		compact === 'affiliatelink'
	);
}

/**
 * Copy a misspelled affiliate key onto `affiliateUrl` and drop the alias.
 * Does not invent URLs — only preserves a value that is already present.
 */
export function normalizeAffiliateKeys(value: unknown): unknown {
	if (!value || typeof value !== 'object' || Array.isArray(value)) return value;
	const input = { ...(value as Record<string, unknown>) };
	let canonical = input.affiliateUrl;
	const aliases: string[] = [];

	for (const key of Object.keys(input)) {
		if (!isAffiliateUrlKey(key)) continue;
		if (key !== 'affiliateUrl') aliases.push(key);
		const val = input[key];
		if (
			(canonical === undefined || canonical === null || canonical === '') &&
			typeof val === 'string' &&
			val.trim()
		) {
			canonical = val;
		}
	}

	for (const key of aliases) delete input[key];

	if (typeof canonical === 'string' && canonical.trim()) {
		input.affiliateUrl = canonical;
	} else {
		delete input.affiliateUrl;
	}

	return input;
}

const affiliateUrlField = z
	.string()
	.url()
	.optional()
	.describe('Optional https partner/affiliate URL. Omit unless a real public link exists — never invent one.');

/**
 * Frontmatter for files in `src/content/agents/*.md`.
 * Scout outlines and Quill markdown must match this shape.
 * Optional `affiliateUrl`: https partner URL; omit when unknown — never invent one.
 */
const agentFieldsSchema = z.object({
	title: z.string(),
	description: z.string(),
	category: agentCategorySchema,
	score: z.number().min(0).max(10),
	pricing: z.string(),
	website: z.string().url(),
	affiliateUrl: affiliateUrlField,
	date: z.coerce.date(),
	featured: z.boolean().default(false),
});

export const agentSchema = z.preprocess(normalizeAffiliateKeys, agentFieldsSchema);

export type AgentCategory = z.infer<typeof agentCategorySchema>;
export type AgentFrontmatter = z.infer<typeof agentFieldsSchema>;

/** JSON outline Scout writes and Quill reads. */
const scoutOutlineFieldsSchema = z.object({
	slug: z
		.string()
		.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug must be lowercase kebab-case'),
	title: z.string().min(1),
	description: z.string().min(1),
	category: agentCategorySchema,
	score: z.number().min(0).max(10),
	pricing: z.string().min(1),
	website: z.string().url(),
	affiliateUrl: affiliateUrlField,
	date: z.coerce.date(),
	featured: z.boolean().default(false),
	whyAutonomous: z.string().min(1),
	scoreRationale: z.string().min(1),
	howItRuns: z.string().min(1),
	limits: z.array(z.string().min(1)).min(1),
	researchNotes: z.array(z.string().min(1)).min(1),
	sections: z
		.array(
			z.object({
				heading: z.string().min(1),
				points: z.array(z.string().min(1)).min(1),
			}),
		)
		.min(3),
});

export const scoutOutlineSchema = z.preprocess(normalizeAffiliateKeys, scoutOutlineFieldsSchema);

export type ScoutOutline = z.infer<typeof scoutOutlineFieldsSchema>;
