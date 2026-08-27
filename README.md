# Agent File

The public brand is **Agent File** at [https://theagentfile.com](https://theagentfile.com) — *The file of agents that actually work.*

The Origin git remote remains [`neil-lawlor/agenthub`](https://cursor.com/codebase/neil-lawlor/agenthub). Origin is the current git remote (`origin`). There is no GitHub remote yet; this environment did not have `gh` / `GH_TOKEN` / `GITHUB_TOKEN` auth, so no GitHub repo was created.

Agent File is an Astro 7 catalog of real AI agents. Markdown profiles live in a Content Collection, styled with Tailwind, and rendered as static pages. Optional frontmatter `affiliateUrl` (https partner URL) makes the profile “Visit website” button use that link with `rel="sponsored"`; omit it unless a real public affiliate URL is documented — never invent one.

## Public launch

**Public site:** [https://theagentfile.com](https://theagentfile.com)

Set `site: 'https://theagentfile.com'` in `astro.config.mjs`. Attach that hostname to the Worker with [`docs/custom-domain.md`](docs/custom-domain.md).

A Cloudflare **Workers static assets** upload of `dist/` (`wrangler.jsonc` → `assets.directory`) may still be reachable at a `*.workers.dev` preview. Temporary preview accounts stay live for **60 minutes** unless you claim them. After you claim (or after you set `CLOUDFLARE_API_TOKEN`), later deploys use `npx wrangler deploy` against your account.

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
| `npm run astro ...` | Run CLI commands like `astro add`, `astro check` |
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
3. **Forge** writes `src/content/agents/<slug>.md` matching the collection schema. This Astro project watches that folder. **No GitHub connection is required.**

Copy [`.env.example`](.env.example) to `.env`. Set `GROK_API_KEY` or `XAI_API_KEY` to call Grok. Leave both unset (or pass `--mock`) for the local fallback.

Forge can open a GitHub pull request later if you pass `--github` and set `GITHUB_TOKEN` plus `GITHUB_REPO`. If those are missing, Forge skips the PR (no-op) and still writes the file locally. This Origin repo (`neil-lawlor/agenthub`) ships by committing on `main` and pushing to Origin.

## Deploy

`npm run build` writes a static site to **`dist`**. Do not put Cloudflare, Vercel, or GitHub credentials in this repository.

### Cloudflare (Workers static assets — current CLI path)

| Setting | Value |
| :------ | :---- |
| Product | **Workers** static assets (Astro static `dist`) |
| Build command | **`npm run build`** |
| Output / assets directory | **`dist`** |
| Production branch | `main` |
| Public hostname | `theagentfile.com` |
| Node.js | 22.12+ |

`wrangler.jsonc` sets `assets.directory` to `./dist` and `not_found_handling` to `404-page`. Deploy: `npm run build && npx wrangler deploy` (add `--temporary` only when there are no Cloudflare credentials). More detail: [`docs/cloudflare-pages.md`](docs/cloudflare-pages.md). Custom domain: [`docs/custom-domain.md`](docs/custom-domain.md).

### GitHub mirror (not created from this environment)

Exact blocker: `gh` is installed (`/exec-daemon/gh`) but `gh auth status` reports **not logged into any GitHub hosts**. `GH_TOKEN` and `GITHUB_TOKEN` are unset. `https://github.com/neil-lawlor/agenthub` returned **404** without auth (missing or private). Origin was left intact.

When you have GitHub auth, keep `origin` and add a second remote:

```sh
gh auth login   # or export GH_TOKEN with repo scope
gh repo create neil-lawlor/agenthub --public --source=. --remote=github --push
# If the repo already exists:
# git remote add github https://github.com/neil-lawlor/agenthub.git
# git push -u github main
```

### Connect Git to Cloudflare (dashboard CI)

Cloudflare cannot clone Origin. After a GitHub mirror exists:

1. Open [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create**.
2. Prefer **Workers** with Git (matches `wrangler.jsonc`). Build: `npm run build`. Deploy: `npx wrangler deploy`. Asset directory: `dist`.
3. Or **Pages**: framework **Astro**, build **`npm run build`**, output **`dist`**, production branch `main`. Connect the GitHub repo (not Origin).
4. Save. Git-connected builds run on every push to `main`.
5. Attach [theagentfile.com](https://theagentfile.com) as a Custom Domain (see [`docs/custom-domain.md`](docs/custom-domain.md)).

### Vercel

| Setting | Value |
| :------ | :---- |
| Import | Import [`ChiefVent/theagentfile`](https://github.com/ChiefVent/theagentfile) (GitHub); Origin remains `origin` |
| Framework | Auto-detect **Astro** |
| Build command | `npm run build` (Vercel sets this when it detects Astro) |
| Output directory | `dist` |

More detail: [`docs/vercel.md`](docs/vercel.md).

## Project structure

```text
/
├── public/
├── scripts/grok-bot/     # Scout, Quill, Forge CLI + CHARTERS.md + TEMPLATE.md
├── src/
│   ├── content.config.ts
│   ├── content/
│   │   ├── config.ts
│   │   ├── agent-schema.ts
│   │   └── agents/
│   ├── layouts/
│   │   └── Layout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── scoring.astro
│   │   ├── contact.astro
│   │   ├── submit.astro
│   │   ├── 404.astro
│   │   └── agents/
│   │       ├── index.astro
│   │       └── [slug].astro
│   └── styles/
│       └── global.css
├── wrangler.jsonc
└── package.json
```
