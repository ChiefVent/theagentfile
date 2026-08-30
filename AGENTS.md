The public brand is **Agent File** at https://theagentfile.com. GitHub source is `ChiefVent/theagentfile`.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

This project’s `npm run dev` binds to **127.0.0.1:4327**.

## Documentation

Full documentation: https://docs.astro.build

## Catalog content

New agent pages are Markdown in `src/content/agents/`. Grok Bot produces them:

1. **Scout** researches an agent that is not already listed (`npm run content:scout`).
2. **Quill** turns research into complete Markdown using `scripts/grok-bot/TEMPLATE.md` plus schema-valid frontmatter (`npm run content:quill`).
3. **Forge** writes `src/content/agents/<slug>.md` matching the collection schema (`npm run content:forge`).

Charters: `scripts/grok-bot/CHARTERS.md`. Template: `scripts/grok-bot/TEMPLATE.md`.

When a Cursor agent is asked to publish catalog files:

- Stay on **`main`** unless the task asks for a PR.
- Run `npm run content:validate`.
- Stage agent Markdown with `scripts/commit-content.sh` (add `--commit` to create the commit) or equivalent.
- Commit on `main` with a message that names the new slug(s).
- `git push origin main` to `ChiefVent/theagentfile`.
- Run `npm run build`. If Cloudflare is connected to this GitHub repo, it deploys `dist/` from that push. Do not invent hosting credentials. Do not change nameservers.

Forge’s GitHub PR path (`--github` + `GITHUB_TOKEN` + `GITHUB_REPO`) is optional. If those variables are unset, skip the PR and keep the local file.
