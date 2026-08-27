import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { agentSchema } from './agent-schema';

/** Optional `affiliateUrl` (https) on agent Markdown; omit unless a real public partner URL exists — never invent one. */

const agents = defineCollection({
	loader: glob({ base: './src/content/agents', pattern: '**/*.md' }),
	schema: agentSchema,
});

export const collections = { agents };
