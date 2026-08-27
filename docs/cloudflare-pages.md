# Cloudflare (Agent File)

Agent File is a **static Astro** site. There is no `@astrojs/cloudflare` adapter and no Pages Functions. Cloudflare only needs the production build output in `dist/`. The public hostname is [theagentfile.com](https://theagentfile.com). The Origin git remote remains `neil-lawlor/agenthub`.

## Build settings

| Setting | Value |
| --- | --- |
| Framework | Astro (static) |
| Build command | `npm run build` |
| Build output / assets directory | `dist` |
| Root directory | `/` (repository root) |
| Production branch | `main` |
| Node.js | 22.12 or newer (`NODE_VERSION=22` if you override the default) |

`wrangler.jsonc` sets `assets.directory` to `./dist` (Workers static assets) and `not_found_handling` to `404-page` so Astro’s `dist/404.html` is served for unknown routes.

## Wrangler (Workers static assets)

After `npm run build`:

```sh
npx wrangler deploy
```

If this environment has no Cloudflare login or `CLOUDFLARE_API_TOKEN`, Wrangler can still publish to a **temporary preview account**:

```sh
npx wrangler deploy --temporary
```

That prints a `*.workers.dev` URL and a **claim URL**. Claim within 60 minutes or Cloudflare deletes the preview account. After you claim (or after you set `CLOUDFLARE_API_TOKEN`), run `npx wrangler deploy` without `--temporary`.

`wrangler pages deploy` needs an API token and is not used for this tree anymore. Pages remains a valid **dashboard** option (below) if you prefer Git-connected Pages instead of Workers.

## Option — dashboard Pages (Git or direct upload)

Follow the [Astro on Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/) guide if you want a Pages project instead of Workers.

The code is on Origin: [https://cursor.com/codebase/neil-lawlor/agenthub](https://cursor.com/codebase/neil-lawlor/agenthub). Origin is the current git remote. Connecting Cloudflare to GitHub requires a GitHub mirror. This environment could not create one (`gh` not authenticated; no `GH_TOKEN` / `GITHUB_TOKEN`).

1. Push this tree to Origin (`git push origin main`). Optionally add a `github` remote and push `main` when GitHub auth exists.
2. Open [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create**.
3. **Workers + Git** (matches `wrangler.jsonc`): connect the GitHub mirror, build `npm run build`, deploy `npx wrangler deploy`.
4. **Or Pages**: connect the GitHub mirror, or upload `dist` after `npm run build`. Framework **Astro**, command **`npm run build`**, output **`dist`**.
5. Deploy. Git-connected projects rebuild on every push to `main`.

Do not put Cloudflare API tokens in this repository.

## This Cloudflare account

| Field | Value |
| --- | --- |
| Account ID | `2a396cb455e0171a34cdac47ee24776f` |
| Zone | `theagentfile.com` |
| DNS records (add CNAMEs here) | [theagentfile.com/dns/records](https://dash.cloudflare.com/2a396cb455e0171a34cdac47ee24776f/theagentfile.com/dns/records) |
| Workers & Pages | [workers-and-pages](https://dash.cloudflare.com/2a396cb455e0171a34cdac47ee24776f/workers-and-pages) |
| Pages project name | `agenthub` |
| Pages hostname | `agenthub.pages.dev` (confirm after deploy) |
| Nameservers (do **not** change) | `clara.ns.cloudflare.com`, `theo.ns.cloudflare.com` |

Paste-ready CNAME records and click-by-click steps for that DNS page: [`docs/custom-domain.md`](./custom-domain.md).

## Custom 404

Astro emits `dist/404.html`. Workers static assets serve it when `not_found_handling` is `404-page`. Pages serves it for unknown routes on a static Pages project.

## Custom domain

The public brand is **Agent File** at [theagentfile.com](https://theagentfile.com). Attach that hostname to the `agenthub` Worker (internal Cloudflare project name) using [`docs/custom-domain.md`](./custom-domain.md).
