---
title: Grok Bot
description: Reasoning and coding agent powered by Grok. On Agent File, Scout researches, Quill writes the Markdown, and Forge files the page in the repo.
category: Coding
score: 9.2
pricing: xAI API (usage-based)
website: https://x.ai
date: 2026-08-25
featured: true
---

Grok Bot is xAI’s product for persistent, named AI teammates. Each bot can use a cloud computer with a browser, filesystem, and terminal, and bots can hand work to each other instead of bouncing every step through a human.

Agent File uses three of those jobs as a **content pipeline**: **Scout**, **Quill**, and **Forge**. They are how new pages land in `src/content/agents/` without a CMS, database, or extra auth. Charters live in `scripts/grok-bot/CHARTERS.md`.

## Daily Scout routine

> Research one new high-quality autonomous AI agent that is not yet on Agent File. Use the full research format and hand the notes to Quill when finished.

Scout skips agents already listed in this catalog. When the outline is done, Quill writes the article. When Quill is done, Forge writes `src/content/agents/<slug>.md`. Astro watches that folder.

## Scout

Scout takes a short brief (or the daily routine above) and turns it into a structured outline. The outline is JSON: slug, title, description, category, score, pricing, website, date, featured, why it is autonomous, how it runs, limits, research notes, and section headings with bullet points.

Scout is the research pass. It does not write the public page. It decides what the entry is *about* and what must be true before anyone publishes.

Run it locally:

```sh
npm run content:scout -- --brief "Claude Code, Anthropic's terminal coding agent"
```

Omitting `--brief` uses the daily routine. With `GROK_API_KEY` or `XAI_API_KEY` set, Scout calls the xAI API at `https://api.x.ai/v1`. Without a key it uses a built-in mock so the same command still produces a valid outline.

## Quill

Quill reads Scout’s outline and turns it into complete Markdown using the exact template in `scripts/grok-bot/TEMPLATE.md` plus schema-valid YAML frontmatter (`title`, `description`, `category`, `score`, `pricing`, `website`, optional `affiliateUrl`, `date`, `featured`). The draft goes to `.cache/grok-bot/drafts/<slug>.md`.

Quill is the writing pass. It will not invent a second schema. If the frontmatter fails validation, it stops instead of leaving a broken page in the tree.

```sh
npm run content:quill -- --outline .cache/grok-bot/outlines/claude-code.json
```

## Forge

Forge takes Quill’s draft, validates it against the collection schema, and writes `src/content/agents/<slug>.md` in **this** repository. That is the default path. You do not need GitHub, a token, or a pull request for the site to pick up the file.

```sh
npm run content:forge -- --draft .cache/grok-bot/drafts/claude-code.md
```

Or run all three passes together:

```sh
npm run content:generate -- --brief "Claude Code, Anthropic's terminal coding agent"
```

**Optional GitHub upgrade:** pass `--github` and set `GITHUB_TOKEN` plus `GITHUB_REPO=owner/name`. Forge then opens a pull request on GitHub so a Cursor Cloud Agent can review and merge. If the token or repo is missing, Forge **skips** the PR (no-op) and still writes the local file. This Origin repo (`neil-lawlor/agenthub`) ships by committing on `main` and pushing to Origin. Do not invent GitHub credentials.

## How the handoff works

1. You (or a scheduled job) give Scout a brief and an optional slug.
2. Scout writes `.cache/grok-bot/outlines/<slug>.json` (gitignored).
3. Quill turns that JSON into a Markdown draft (gitignored cache).
4. Forge writes the collection file under `src/content/agents/`.
5. A Cursor agent validates the file, commits it on `main`, and pushes. Cloudflare Pages rebuilds `dist/` if the project is connected.

Scout, Quill, and Forge share one schema module (`src/content/agent-schema.ts`) with the Astro collection, so an outline that cannot render never reaches the live site.

## API and mock fallback

The runnable CLI lives in `scripts/grok-bot/`. Copy `.env.example` to `.env` and set `GROK_API_KEY` or `XAI_API_KEY` to use Grok. Leave both unset, or pass `--mock`, to generate from the local fallback. Keys are never committed.
