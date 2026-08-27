import { grokApiKey, grokModel } from './env.ts';

const XAI_BASE = 'https://api.x.ai/v1';

export type ChatResult = {
	text: string;
	source: 'api';
	model: string;
};

function extractMessage(payload: unknown): string | undefined {
	if (!payload || typeof payload !== 'object') return undefined;
	const record = payload as Record<string, unknown>;

	const choices = record.choices;
	if (Array.isArray(choices) && choices[0] && typeof choices[0] === 'object') {
		const message = (choices[0] as Record<string, unknown>).message;
		if (message && typeof message === 'object') {
			const content = (message as Record<string, unknown>).content;
			if (typeof content === 'string' && content.trim()) return content;
		}
	}

	if (typeof record.output_text === 'string' && record.output_text.trim()) {
		return record.output_text;
	}

	const output = record.output;
	if (Array.isArray(output)) {
		const chunks: string[] = [];
		for (const item of output) {
			if (!item || typeof item !== 'object') continue;
			const content = (item as Record<string, unknown>).content;
			if (!Array.isArray(content)) continue;
			for (const part of content) {
				if (!part || typeof part !== 'object') continue;
				const text = (part as Record<string, unknown>).text;
				if (typeof text === 'string') chunks.push(text);
			}
		}
		if (chunks.length) return chunks.join('\n');
	}

	return undefined;
}

export async function grokChat(options: {
	system: string;
	user: string;
	json?: boolean;
}): Promise<ChatResult> {
	const key = grokApiKey();
	if (!key) {
		throw new Error('grokChat called without GROK_API_KEY or XAI_API_KEY');
	}

	const model = grokModel();
	const response = await fetch(`${XAI_BASE}/chat/completions`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${key}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			model,
			stream: false,
			messages: [
				{ role: 'system', content: options.system },
				{ role: 'user', content: options.user },
			],
			...(options.json ? { response_format: { type: 'json_object' } } : {}),
		}),
		signal: AbortSignal.timeout(120_000),
	});

	const raw = await response.text();
	if (!response.ok) {
		throw new Error(`xAI API ${response.status} from ${XAI_BASE}: ${raw.slice(0, 800)}`);
	}

	let payload: unknown;
	try {
		payload = JSON.parse(raw);
	} catch {
		throw new Error(`xAI API returned non-JSON: ${raw.slice(0, 400)}`);
	}

	const text = extractMessage(payload);
	if (!text) {
		throw new Error('xAI API response had no message content');
	}

	return { text, source: 'api', model };
}

export function extractJsonObject(text: string): unknown {
	const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
	const candidate = fenced ? fenced[1] : text;
	const start = candidate.indexOf('{');
	const end = candidate.lastIndexOf('}');
	if (start === -1 || end === -1 || end <= start) {
		throw new Error('Model output did not contain a JSON object');
	}
	return JSON.parse(candidate.slice(start, end + 1));
}
