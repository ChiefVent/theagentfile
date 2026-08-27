export const DAILY_SCOUT_BRIEF =
	'Research one new high-quality autonomous AI agent that is not yet on Agent File. Use the full research format and hand the notes to Quill when finished.';

export function isDailyScoutBrief(brief: string): boolean {
	return /not yet on Agent File/i.test(brief);
}
