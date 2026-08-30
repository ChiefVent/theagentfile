# Cloudflare (Agent File)

Agent File is a **static Astro** site. There is no `@astrojs/cloudflare` adapter and no Pages Functions. Cloudflare only needs the production build output in `dist/`. The public hostname is [theagentfile.com](https://theagentfile.com). Git source is [ChiefVent/theagentfile](https://github.com/ChiefVent/theagentfile).

## Build settings

| Setting | Value |
| --- | --- |
| Framework | Astro (static) |
| Build command | `npm run build` |
| Build output / assets directory | `dist` |
| Root directory | `/` (repository root) |
| Production branch | `main` |
| Node.js | 22.12 or newer (`NODE_VERSION=22` if you override the default) |
| Worker name | `theagentfile` |

`wrangler.jsonc` sets `assets.directory` to `./dist` (Workers static assets) and `not_found_handling` to `404-page` so Astro’s `dist/404.html` is served for unknown routes.

## Wrangler (Workers static assets)

After `npm run build`:

```sh
npx wrangler deploy
```

Requires `CLOUDFLARE_API_TOKEN` on the machine that deploys. Do not commit the token.

## Dashboard — connect this GitHub repo

1. Open [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → the `theagentfile` Worker (or **Create** if it is missing).
2. Connect Git: [ChiefVent/theagentfile](https://github.com/ChiefVent/theagentfile), branch `main`.
3. Build: `npm run build`. Assets: `dist`.
4. Save. Pushes to `main` should rebuild.
5. Attach [theagentfile.com](https://theagentfile.com) as a Custom Domain (see [`custom-domain.md`](./custom-domain.md)). Do not change nameservers.

Do not put Cloudflare API tokens in this repository.

## This Cloudflare account

| Field | Value |
| --- | --- |
| Account ID | `2a396cb455e0171a34cdac47ee24776f` |
| Zone | `theagentfile.com` |
| DNS records | [theagentfile.com/dns/records](https://dash.cloudflare.com/2a396cb455e0171a34cdac47ee24776f/theagentfile.com/dns/records) |
| Workers & Pages | [workers-and-pages](https://dash.cloudflare.com/2a396cb455e0171a34cdac47ee24776f/workers-and-pages) |
| Worker name | `theagentfile` |
| Nameservers (do **not** change) | `clara.ns.cloudflare.com`, `theo.ns.cloudflare.com` |

Paste-ready attach steps: [`docs/custom-domain.md`](./custom-domain.md).
