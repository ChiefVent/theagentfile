# Grok Bot charters — Scout, Quill, Forge

Agent File publishes agents as Markdown in `src/content/agents/`. Grok Bot is three named jobs, not a CMS:

1. **Scout** researches.
2. **Quill** writes.
3. **Forge** files the page in this repo.

They share `src/content/agent-schema.ts` with the Astro content collection. No GitHub connection is required for the default path. This repository is Origin (`neil-lawlor/agenthub`).

Run locally:

```sh
npm run content:scout
npm run content:quill -- --outline .cache/grok-bot/outlines/<slug>.json
npm run content:forge -- --draft .cache/grok-bot/drafts/<slug>.md
# or
npm run content:generate
```

With `GROK_API_KEY` or `XAI_API_KEY`, Scout and Quill call `https://api.x.ai/v1`. Without a key they use the mock in `scripts/grok-bot/mock.ts`.

---

## Daily Scout routine

Give Scout this brief (it is also the default when `npm run content:scout` has no `--brief`):

> Research one new high-quality autonomous AI agent that is not yet on Agent File. Use the full research format and hand the notes to Quill when finished.

Scout must skip slugs already in `src/content/agents/`. After Scout finishes, hand the outline JSON to Quill. After Quill finishes, Forge writes `src/content/agents/<slug>.md` (Astro watches that folder).

---

## Scout

**Job:** Research one agent that is not already on Agent File. Output structured research notes. Do not write the public page.

**Inputs:** A brief (or the daily routine) and an optional slug. The current catalog list is injected so Scout cannot “discover” something already listed.

**Output:** JSON at `.cache/grok-bot/outlines/<slug>.json` matching `scoutOutlineSchema`:

| Field | Purpose |
| --- | --- |
| `slug` | kebab-case filename |
| `title`, `description` | catalog card copy |
| `category` | General, Coding, Sales, Research, Productivity, Marketing, Other |
| `score` | 0–10 |
| `scoreRationale` | why that score |
| `pricing` | public string |
| `website` | https URL |
| `affiliateUrl` | optional https partner URL; omit unless a real public link is documented |
| `date` | YYYY-MM-DD |
| `featured` | boolean |
| `whyAutonomous` | why this is an agent that does work, not a chatbot |
| `howItRuns` | how a person actually runs it |
| `limits` | honest caveats |
| `researchNotes` | 3–6 factual bullets |
| `sections` | at least three `{ heading, points[] }` for Quill |

**Rules:** Real facts only. No lorem ipsum. No invented credentials, private URLs, or unpublished prices. If the slug is already in the catalog, stop unless `--force`.

**Handoff:** Tell Quill the outline path. Scout’s work is done.

---

## Quill

**Job:** Turn Scout research into complete Markdown using the exact template in [`TEMPLATE.md`](TEMPLATE.md) plus schema-valid frontmatter.

**Inputs:** `--outline <file.json>`.

**Output:** `.cache/grok-bot/drafts/<slug>.md` — YAML frontmatter (`title`, `description`, `category`, `score`, `pricing`, `website`, optional `affiliateUrl`, `date`, `featured`) plus a body that follows `TEMPLATE.md`. No top-level H1 (the site template owns the title).

**Rules:** Do not invent a second schema. If frontmatter would fail `agentSchema`, stop. Body must be at least 200 characters. Use the template sections: What it actually does, Key Features, Pricing, Strengths, Limitations, Best for, Final Verdict.

**Handoff:** Tell Forge the draft path. Quill does not publish into `src/content/agents/`.

---

## Forge

**Job:** Write `src/content/agents/<slug>.md` matching the agents collection schema. That is the default, complete path. Astro’s content collection watches the folder; no extra CMS, database, or GitHub app is required.

**Inputs:** `--draft <file.md>` or `--slug <kebab>` (reads `.cache/grok-bot/drafts/<slug>.md`).

**Default output:** validate with `parseAgentFile` / `agentSchema`, then write `src/content/agents/<slug>.md`. Refuse to overwrite unless `--force`.

**After a successful local write:** a Cursor agent on `main` can validate, commit, and `git push origin main`. Cloudflare Pages (if connected) rebuilds from that git remote.

### Improved charter — optional GitHub pull request

Forge *can* open a GitHub pull request when all of the following are true:

1. The operator passed `--github` or set `FORGE_GITHUB_PR=1`.
2. `GITHUB_TOKEN` is set (a classic or fine-grained token with repo contents + pull request access).
3. `GITHUB_REPO` is set as `owner/name` (or `GITHUB_REPOSITORY` in GitHub Actions).

Then Forge:

1. Resolves `GITHUB_BASE_BRANCH` (default `main`).
2. Creates a branch `content/<slug>-<id>` from that base.
3. Commits `src/content/agents/<slug>.md` via the GitHub Contents API.
4. Opens a PR titled `Add <title> to Agent File`.
5. Leaves a Cursor Cloud Agent (or a human) to review and merge.

**No-op / skip:** If `--github` is passed but the token or repo is missing, Forge **still writes the local file** and prints that the PR step was skipped. It does not invent credentials, and it does not fail the local publish. If the GitHub API errors (this Origin remote is not GitHub, token lacks scope, repo missing), the local file remains and Forge reports the error without deleting the catalog entry.

Do **not** require GitHub for daily use. Agent File’s source of truth is this tree.

### Origin vs GitHub

| Path | When | What Forge does |
| --- | --- | --- |
| Local + Origin | Default | Write `src/content/agents/<slug>.md`. Cursor agent commits on `main` and `git push origin main`. |
| GitHub PR | Optional upgrade | Same local write, then a PR if token + repo are configured. |

GitHub Pages is a separate hosting choice. Agent File’s recommended host is **Cloudflare Pages** (`npm run build` → `dist/`). Connecting a GitHub mirror is documented in the README; nobody should paste a made-up `GITHUB_TOKEN` into the repo.

---

## Cursor agent (after Forge)

On `main`:

1. `npm run content:validate`
2. Stage `src/content/agents/*.md` (see `scripts/commit-content.sh`)
3. Commit on `main` with a message that names the slug
4. `git push origin main`
5. `npm run build` — Cloudflare Pages rebuilds if the project is connected

Do not open a pull request unless someone asked for the GitHub upgrade.
