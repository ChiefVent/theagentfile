import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

export const repoRoot = resolve(here, '../..');
export const agentsDir = resolve(repoRoot, 'src/content/agents');
export const outlineDir = resolve(repoRoot, '.cache/grok-bot/outlines');
export const draftsDir = resolve(repoRoot, '.cache/grok-bot/drafts');
export const schemaModule = resolve(repoRoot, 'src/content/agent-schema.ts');
