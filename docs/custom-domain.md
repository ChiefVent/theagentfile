# Custom domain (theagentfile.com)

The public brand is **Agent File**. The public hostname is **[theagentfile.com](https://theagentfile.com)**. Git source is [ChiefVent/theagentfile](https://github.com/ChiefVent/theagentfile).

`astro.config.mjs` sets `site: 'https://theagentfile.com'`. Attach that hostname to the Worker named **`theagentfile`** that serves `dist/`.

Nearby names that are **not** this site:

- [agentfile.com](http://www.agentfile.com/) — UK talent-agency CRM (Agentfile Ltd). Unrelated.
- Letta **Agent File** (`.af`) — a serialization format, not this catalog.
- The old working name **AgentHub** — taken. Do not use it.

## What you need before DNS will answer

1. The zone for `theagentfile.com` must sit in **your** Cloudflare account.
2. A deployed **Workers** project named `theagentfile` with static assets from `dist/`.
3. A Custom Domain on that Worker for `theagentfile.com` and, separately, `www.theagentfile.com` if you use www.

Until step 3, the apex can 503 or fail to resolve. This environment does not have `CLOUDFLARE_API_TOKEN`; attach from the dashboard.

## This Cloudflare account and zone

Approval covers **DNS records** and attaching a custom domain. It is **not** approval to change nameservers.

| Field | Value |
| --- | --- |
| Account ID | `2a396cb455e0171a34cdac47ee24776f` |
| Zone | `theagentfile.com` |
| DNS records | [dash … /theagentfile.com/dns/records](https://dash.cloudflare.com/2a396cb455e0171a34cdac47ee24776f/theagentfile.com/dns/records) |
| Workers & Pages | [dash … /workers-and-pages](https://dash.cloudflare.com/2a396cb455e0171a34cdac47ee24776f/workers-and-pages) |
| Worker name | `theagentfile` |

## Cloudflare nameservers (do not change)

| Nameserver |
| --- |
| `clara.ns.cloudflare.com` |
| `theo.ns.cloudflare.com` |

Do not open **DNS → Nameservers**. Do not edit NS at Cloudflare Registrar.

## Attach via dashboard (preferred)

1. Log into the Cloudflare account that holds the zone.
2. Open Workers & Pages → **theagentfile**.
3. If Git is not connected: **Settings → Build** → connect [ChiefVent/theagentfile](https://github.com/ChiefVent/theagentfile), branch `main`, build `npm run build`, assets `dist`.
4. Deploy a current build (`npm run build && npx wrangler deploy` from a machine with a token, or trigger the Git build).
5. **Settings → Domains & Routes → Add → Custom Domain** → `theagentfile.com`.
6. Repeat for `www.theagentfile.com`, or add a www→apex redirect.

A 503 on the apex usually means the Worker is bound but has no healthy `dist/` assets. Redeploy `dist/` before touching DNS again.

## www ↔ apex

Pick one canonical host. Serve the Worker on the apex and redirect www, or the reverse. Custom Domains match the hostname exactly.

## Check after attach

```sh
dig +short theagentfile.com A
curl -sI https://theagentfile.com
```

Expect Cloudflare-proxied addresses and `HTTP/2 200` once DNS and the certificate have propagated.
