import type { AgentFrontmatter } from '../../src/content/agent-schema.ts';
import { agentSchema, isAffiliateUrlKey } from '../../src/content/agent-schema.ts';

export function isoDate(value: Date | string): string {
	if (value instanceof Date) return value.toISOString().slice(0, 10);
	return new Date(value).toISOString().slice(0, 10);
}

function yamlQuote(value: string): string {
	return JSON.stringify(value);
}

export function serializeAgentMarkdown(data: AgentFrontmatter, body: string): string {
	const lines = [
		'---',
		`title: ${yamlQuote(data.title)}`,
		`description: ${yamlQuote(data.description)}`,
		`category: ${data.category}`,
		`score: ${data.score}`,
		`pricing: ${yamlQuote(data.pricing)}`,
		`website: ${data.website}`,
		...(data.affiliateUrl ? [`affiliateUrl: ${data.affiliateUrl}`] : []),
		`date: ${isoDate(data.date)}`,
		`featured: ${data.featured ? 'true' : 'false'}`,
		'---',
		'',
		body.trim(),
		'',
	];
	return lines.join('\n');
}

function unquote(value: string): string {
	const trimmed = value.trim();
	if (
		(trimmed.startsWith('"') && trimmed.endsWith('"')) ||
		(trimmed.startsWith("'") && trimmed.endsWith("'"))
	) {
		try {
			if (trimmed.startsWith('"')) return JSON.parse(trimmed) as string;
		} catch {
			// fall through
		}
		return trimmed.slice(1, -1);
	}
	return trimmed;
}

function coerceScalar(raw: string): unknown {
	const trimmed = raw.trim();
	if (trimmed === 'true') return true;
	if (trimmed === 'false') return false;
	if (trimmed === 'null') return null;
	if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
	return unquote(trimmed);
}

/**
 * Small YAML subset parser for agent frontmatter.
 * Quill always writes this shape; handwritten files should match it.
 */

/** Rewrite misspelled affiliate keys in YAML frontmatter to `affiliateUrl`. */
export function rewriteAffiliateFrontmatterKeys(raw: string): string {
	const normalized = raw.replace(/^\uFEFF/, '');
	if (!normalized.startsWith('---')) return raw;
	const close = normalized.indexOf('\n---', 3);
	if (close === -1) return raw;
	const yaml = normalized.slice(0, close);
	const rest = normalized.slice(close);
	const rewritten = yaml.replace(/^([A-Za-z][A-Za-z0-9_-]*)(\s*:)/gm, (full, key: string, colon: string) =>
		isAffiliateUrlKey(key) && key !== 'affiliateUrl' ? `affiliateUrl${colon}` : full,
	);
	return rewritten + rest;
}

export function parseFrontmatter(raw: string): { data: Record<string, unknown>; body: string } {
	const normalized = raw.replace(/^\uFEFF/, '');
	if (!normalized.startsWith('---')) {
		throw new Error('Expected file to start with YAML frontmatter (---)');
	}
	const close = normalized.indexOf('\n---', 3);
	if (close === -1) {
		throw new Error('Unclosed YAML frontmatter');
	}
	const yaml = normalized.slice(4, close).replace(/^\r?\n/, '');
	const body = normalized.slice(close + 4).replace(/^\r?\n/, '');
	return { data: parseSimpleYaml(yaml), body };
}

function parseSimpleYaml(yaml: string): Record<string, unknown> {
	const data: Record<string, unknown> = {};
	const lines = yaml.split(/\r?\n/);
	let i = 0;
	while (i < lines.length) {
		const line = lines[i];
		if (!line.trim()) {
			i += 1;
			continue;
		}
		const match = line.match(/^([A-Za-z][A-Za-z0-9_-]*)\s*:\s*(.*)$/);
		if (!match) {
			throw new Error(`Cannot parse frontmatter line: ${line}`);
		}
		const rawKey = match[1];
		const key = isAffiliateUrlKey(rawKey) ? 'affiliateUrl' : rawKey;
		const rest = match[2];
		const skipAlias =
			key === 'affiliateUrl' && rawKey !== 'affiliateUrl' && data.affiliateUrl != null && data.affiliateUrl !== '';
		if (rest === '' || rest === '|' || rest === '>') {
			const items: string[] = [];
			i += 1;
			while (i < lines.length) {
				const nested = lines[i];
				const item = nested.match(/^\s+-\s+(.*)$/);
				if (!item) break;
				items.push(unquote(item[1]));
				i += 1;
			}
			if (!skipAlias) data[key] = items;
			continue;
		}
		if (rest.startsWith('[') && rest.endsWith(']')) {
			const inner = rest.slice(1, -1).trim();
			if (!skipAlias) data[key] = inner ? inner.split(',').map((part) => coerceScalar(part)) : [];
			i += 1;
			continue;
		}
		if (!skipAlias) data[key] = coerceScalar(rest);
		i += 1;
	}
	return data;
}

export function parseAgentFile(raw: string): { data: AgentFrontmatter; body: string } {
	const parsed = parseFrontmatter(raw);
	const data = agentSchema.parse(parsed.data);
	return { data, body: parsed.body };
}
