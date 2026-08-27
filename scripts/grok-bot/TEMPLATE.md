# Agent Markdown template (Quill)

Quill turns Scout research into a complete catalog page. Forge writes that file to `src/content/agents/<slug>.md`. Frontmatter must match `src/content/agent-schema.ts`.

## Frontmatter

```yaml
---
title: "Product Name"
description: "One sentence on what the product actually does."
category: General
score: 8.0
pricing: "Public pricing string"
website: https://example.com
date: 2026-08-26
featured: false
---
```

`category` must be one of: `General`, `Coding`, `Sales`, `Research`, `Productivity`, `Marketing`, `Other`.

`website` must be an `https://` URL. `score` is a number from 0 to 10. `date` is `YYYY-MM-DD`. `featured` is `true` or `false`.

Optional:

```yaml
affiliateUrl: https://example.com/aff
```

Omit `affiliateUrl` unless a real public partner URL is documented. Never invent one.

## Body

Do not add a top-level `#` heading. The agent page template already renders `title`. Existing catalog files may include an H1; leave those as-is.

```markdown
**One-line positioning.**

## What it actually does
Plain-language description of the product and the work it can complete.

## Key Features
- Concrete capability
- Concrete capability
- Concrete capability

## Pricing
Public pricing in one or two sentences. Do not invent unpublished numbers.

## Strengths
- Honest strength
- Honest strength

## Limitations
- Honest limit
- Honest limit

## Best for
Who should use this, in one or two sentences.

## Final Verdict
A short close. End with **Score: X/10** using the same score as frontmatter.
```

Hand the finished Markdown to Forge. Forge validates it against the schema and writes `src/content/agents/<slug>.md`.
