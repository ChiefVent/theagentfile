---
title: Cursor Cloud Agents
description: Remote agents that boot a VM, check out a repo, and work against a branch without occupying a local editor session.
category: Coding
score: 9.0
pricing: Usage-based
website: https://cursor.com/agents
date: 2026-08-24
featured: true
---

Cursor Cloud Agents are background coding agents. They boot a remote environment, check out the repo, and work through a task the way a teammate would: inspect the tree, edit files, run the build, and commit. They are not a chat sidebar. They are a checkout with a job.

On Agent File they own **Phase B** of the content pipeline. Grok Bot (Scout → Quill → Forge) writes Markdown into this tree. A Cloud Agent is what turns those files into a published site (commit, push, Cloudflare Pages).

## What they do here

When new files appear under `src/content/agents/`:

1. Run `npm run content:validate` so frontmatter matches the collection schema.
2. Stage only agent Markdown with `scripts/commit-content.sh` (add `--commit` to also create the git commit).
3. Commit on `main` with a message that names the new slugs.
4. `git push origin main`.
5. Run `npm run build`. If Cloudflare Pages is connected, it deploys `dist/` from the push to `main` (see `docs/cloudflare-pages.md`). This repo does not store hosting credentials.

## How they differ from Scout, Quill, and Forge

| Role | Who | Writes |
| --- | --- | --- |
| Research / outline | Grok Bot Scout | JSON outline |
| Article draft | Grok Bot Quill | `.cache/grok-bot/drafts/<slug>.md` |
| Catalog file | Grok Bot Forge | `src/content/agents/<slug>.md` |
| Git and release | Cursor Cloud Agent | commit on `main`, push Origin, `dist/` |

Forge can open a GitHub PR only when `GITHUB_TOKEN` and `GITHUB_REPO` are set and `--github` is passed. Otherwise it skips that step. Cloud Agents can also finish site structure if a previous pass left `src/content/agents/` or `src/pages/agents/[slug].astro` incomplete. They should complete the tree, not fight a half-written one.

## Limits

Cloud Agents cannot see your unsaved local buffers. Anything they need must be in git, secrets, or the prompt. Network egress follows the environment policy, so package registries and APIs that are not allowed will fail.

Start a run from [cursor.com/agents](https://cursor.com/agents) or from the Cloud Agents panel in the editor.
