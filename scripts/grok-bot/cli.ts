export type FlagMap = Record<string, string | boolean>;

export function parseArgs(argv = process.argv.slice(2)): FlagMap {
	const out: FlagMap = {};
	for (let i = 0; i < argv.length; i++) {
		const token = argv[i];
		if (!token.startsWith('--')) continue;
		const body = token.slice(2);
		const eq = body.indexOf('=');
		if (eq !== -1) {
			out[body.slice(0, eq)] = body.slice(eq + 1);
			continue;
		}
		const next = argv[i + 1];
		if (!next || next.startsWith('--')) {
			out[body] = true;
		} else {
			out[body] = next;
			i += 1;
		}
	}
	return out;
}

export function flagString(flags: FlagMap, name: string): string | undefined {
	const value = flags[name];
	if (typeof value === 'string' && value.length > 0) return value;
	return undefined;
}

export function flagBool(flags: FlagMap, name: string): boolean {
	return flags[name] === true || flags[name] === 'true' || flags[name] === '1';
}

export function die(message: string, code = 1): never {
	console.error(message);
	process.exit(code);
}

export function slugify(input: string): string {
	const slug = input
		.toLowerCase()
		.replace(/&/g, ' and ')
		.replace(/['’]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 64);
	return slug || 'agent';
}
