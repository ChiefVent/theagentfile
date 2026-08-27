/** Collection ids are usually the stem; glob loaders may still include `.md`. */
export function agentSlug(agent: { id: string }): string {
	return agent.id.replace(/\.md$/, '');
}
