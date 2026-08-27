/** Visit-button href + rel for an agent profile. Listing cards do not use this. */
export function agentVisitLink(website: string, affiliateUrl?: string) {
	if (affiliateUrl) {
		return {
			href: affiliateUrl,
			rel: 'sponsored noopener noreferrer' as const,
			officialHref: website,
		};
	}
	return {
		href: website,
		rel: 'noopener noreferrer' as const,
		officialHref: undefined,
	};
}
