# Agent File

The public brand is **Agent File** at [https://theagentfile.com](https://theagentfile.com) — *The file of agents that actually work.*

GitHub: [github.com/ChiefVent/theagentfile](https://github.com/ChiefVent/theagentfile). That is the source of truth. The old working name was AgentHub; do not use that name or that domain cluster.

Agent File is an Astro 7 catalog of real AI agents. Markdown profiles live in a Content Collection, styled with Tailwind, and rendered as static pages. Optional frontmatter `affiliateUrl` (https partner URL) makes the profile “Visit website” button use that link with `rel="sponsored"`; omit it unless a real public affiliate URL is documented — never invent one.

## Public launch

**Public site:** [https://theagentfile.com](https://theagentfile.com)

Set `site: 'https://theagentfile.com'` in `astro.config.mjs`. Attach that hostname to the Worker named `theagentfile` with [`docs/custom-domain.md`](docs/custom-domain.md). Do not change nameservers without approval.

If the apex returns 503, the Worker exists but is not serving a current `dist/` build, or the custom domain is not attached. Fix that in the Cloudflare dashboard for account zone `theagentfile.com` before adding listings for traffic.

## Run locally

Node 22.12+ is required.

```sh
npm install
npm run dev
```

The dev server binds to **http://127.0.0.1:4327** (`astro.config.mjs` sets `server.host` and `server.port`).

| Command | Action |
| :------ | :----- |
| `npm install` | Installs dependencies |
| `npm run dev` | Dev server at `127.0.0.1:4327` |
| `npm run build` | Production build to `./dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run deploy` | Build `dist/` then `npx wrangler deploy` |
| `npm run content:scout` | Scout: research notes for a new agent |
| `npm run content:quill` | Quill: Markdown draft from a Scout outline |
| `npm run content:forge` | Forge: write `src/content/agents/<slug>.md` |
| `npm run content:generate` | Scout → Quill → Forge |
| `npm run content:validate` | Check every agent Markdown file against the schema |

## Content pipeline (Scout, Quill, Forge)

Charters live in [`scripts/grok-bot/CHARTERS.md`](scripts/grok-bot/CHARTERS.md). The exact Quill Markdown template is [`scripts/grok-bot/TEMPLATE.md`](scripts/grok-bot/TEMPLATE.md).

**Daily Scout routine:** *Research one new high-quality autonomous AI agent that is not yet on Agent File. Use the full research format and hand the notes to Quill when finished.*

1. **Scout** writes `.cache/grok-bot/outlines/<slug>.json`.
2. **Quill** turns that research into complete Markdown using the exact template plus frontmatter. Draft: `.cache/grok-bot/drafts/<slug>.md`.
3. **Forge** writes `src/content/agents/<slug>.md` matching the collection schema.

Copy [`.env.example`](.env.example) to `.env`. Set `GROK_API_KEY` or `XAI_API_KEY` to call Grok. Leave both unset (or pass `--mock`) for the local fallback.

Forge can open a GitHub pull request if you pass `--github` and set `GITHUB_TOKEN` plus `GITHUB_REPO=ChiefVent/theagentfile`. If those are missing, Forge skips the PR and still writes the file locally.

## Deploy

`npm run build` writes a static site to **`dist`**. Do not put Cloudflare, Vercel, or GitHub credentials in this repository.

| Setting | Value |
| :------ | :---- |
| Product | **Workers** static assets (Astro static `dist`) |
| Worker name | `theagentfile` |
| Build command | **`npm run build`** |
| Output / assets directory | **`dist`** |
| Production branch | `main` |
| Public hostname | `theagentfile.com` |
| Node.js | 22.12+ |
| Git source | [ChiefVent/theagentfile](https://github.com/ChiefVent/theagentfile) |

`wrangler.jsonc` sets `assets.directory` to `./dist` and `not_found_handling` to `404-page`. Deploy from a machine with `CLOUDFLARE_API_TOKEN`: `npm run build && npx wrangler deploy`. More detail: [`docs/cloudflare-pages.md`](docs/cloudflare-pages.md). Custom domain: [`docs/custom-domain.md`](docs/custom-domain.md).

Connect this GitHub repo to Cloudflare Workers/Pages so every push to `main` rebuilds. Cloudflare cannot clone a Cursor Origin remote.

### Vercel

Import [`ChiefVent/theagentfile`](https://github.com/ChiefVent/theagentfile). Framework **Astro**, build `npm run build`, output `dist`. See [`docs/vercel.md`](docs/vercel.md).

## Scoring rules (short)

- Real products only. Opinionated scores. Honest limitations.
- Prefer computer use, tools, scheduling, memory, or multi-step execution.
- A Grok Bot template is not a listing. The platform is.
- 9+ is almost empty. An 8 needs production hours, not a launch week.
