# Custom domain (theagentfile.com)

The public brand is **Agent File**. The public hostname is **[theagentfile.com](https://theagentfile.com)**. The Origin git remote remains `neil-lawlor/agenthub`.

`astro.config.mjs` sets `site: 'https://theagentfile.com'`. Attach that hostname to the Worker (or Pages project) that serves `dist/`.

Nearby names that are **not** this site:

- [agentfile.com](http://www.agentfile.com/) — UK talent-agency CRM (Agentfile Ltd). Unrelated.
- Letta **Agent File** (`.af`) — a serialization format, not this catalog.
- [agentfiles.io](https://agentfiles.io/) — a multi-agent artifact/handoff product. Unrelated.

## What you need before DNS will answer

1. The zone for `theagentfile.com` must sit in **your** Cloudflare account.
2. A deployed **Workers** project named `agenthub` with static assets from `dist/` (see [`cloudflare-pages.md`](./cloudflare-pages.md)). The Worker name is an internal Cloudflare id; the public brand is Agent File.
3. A Custom Domain on that Worker for the exact hostnames you want (`theagentfile.com` and, separately, `www.theagentfile.com` if you use www).

Until step 3, browsers may fail to resolve the name. Empty NS-only zones behave that way. This environment may not have `CLOUDFLARE_API_TOKEN`; attach from the dashboard if Wrangler is unauthenticated.

## This Cloudflare account and zone

The owner opened the **DNS records** page (not nameservers). That is approval to add **records** for this site. It is **not** approval to change nameservers.

| Field | Value |
| --- | --- |
| Account ID | `2a396cb455e0171a34cdac47ee24776f` |
| Zone | `theagentfile.com` |
| DNS records page | [dash.cloudflare.com/…/theagentfile.com/dns/records](https://dash.cloudflare.com/2a396cb455e0171a34cdac47ee24776f/theagentfile.com/dns/records) |
| Workers & Pages | [dash.cloudflare.com/…/workers-and-pages](https://dash.cloudflare.com/2a396cb455e0171a34cdac47ee24776f/workers-and-pages) |

Internal project name: **`agenthub`**. Expected Pages hostname after Direct Upload: **`agenthub.pages.dev`**. If that project name is taken, use the hostname Cloudflare prints (`<project>.pages.dev`) in the records below.

## Cloudflare nameservers (do not change)

Public DNS (`dig NS theagentfile.com`, checked 2026-08-26) already lists Cloudflare nameservers. Registrar is **Cloudflare, Inc.** (IANA 1910). **Leave NS as-is.** Records are the missing piece.

| Nameserver |
| --- |
| `clara.ns.cloudflare.com` |
| `theo.ns.cloudflare.com` |

Do not open **DNS → Nameservers**. Do not edit NS at Cloudflare Registrar or anywhere else.

## Paste-ready DNS records (after `*.pages.dev` exists)

Create the Pages (or Workers) project first so a real target exists. Then on the [DNS records](https://dash.cloudflare.com/2a396cb455e0171a34cdac47ee24776f/theagentfile.com/dns/records) page, add these **proxied CNAME** records. Apex CNAME is valid here because Cloudflare [flattens](https://developers.cloudflare.com/dns/cname-flattening/) it.

Replace `agenthub.pages.dev` if the deployed hostname is different.

| Type | Name | Target | Proxy | TTL |
| --- | --- | --- | --- | --- |
| CNAME | `www` | `agenthub.pages.dev` | Proxied (orange cloud) | Auto |
| CNAME | `@` (apex) | `agenthub.pages.dev` | Proxied (orange cloud) | Auto |

Do not add these until `https://agenthub.pages.dev` (or your actual `*.pages.dev`) returns the site. An empty or wrong target will 404 / fail TLS.

If you attach **Custom domains** on the Pages project while the zone is on this same account, Cloudflare can write these records for you. Manual add is the path when you stay on the DNS records page.

### Exact clicks from the DNS records URL

You are already on [DNS → Records](https://dash.cloudflare.com/2a396cb455e0171a34cdac47ee24776f/theagentfile.com/dns/records) for `theagentfile.com`. Stay on **Records**. Do not click **Nameservers**.

**www**

1. **Add record**.
2. **Type:** CNAME.
3. **Name:** `www`.
4. **Target:** `agenthub.pages.dev` (or the hostname from the Pages deploy).
5. **Proxy status:** Proxied (orange cloud).
6. **TTL:** Auto.
7. **Save**.

**Apex (`theagentfile.com`)**

1. **Add record**.
2. **Type:** CNAME.
3. **Name:** `@` (Cloudflare treats this as the zone apex; CNAME flattening applies).
4. **Target:** the same `*.pages.dev` hostname.
5. **Proxy status:** Proxied (orange cloud).
6. **TTL:** Auto.
7. **Save**.

If an existing A/AAAA/CNAME already covers `@` or `www`, edit or delete that record first so only the Pages CNAME remains. Do not delete MX/TXT/email records.

### Create the Pages project (needed before the CNAMEs have a target)

Wrangler in this environment is unauthenticated (`CLOUDFLARE_API_TOKEN` unset). Direct Upload from the dashboard:

1. Open [Workers & Pages](https://dash.cloudflare.com/2a396cb455e0171a34cdac47ee24776f/workers-and-pages) for account `2a396cb455e0171a34cdac47ee24776f`.
2. **Create** → **Pages** tab → **Direct Upload** (or **Upload assets**). Do not buy a domain.
3. Project name: `agenthub`. Production branch: `main`.
4. Locally: `npm run build`. Upload the **`dist`** folder.
5. Deploy. Copy `https://agenthub.pages.dev` (or the printed hostname).
6. Optional but preferred: project → **Custom domains** → **Set up a domain** → `theagentfile.com`, then repeat for `www.theagentfile.com`. If the zone is on this account, Pages can add the records. If you already added them on the DNS page, skip duplicates.
7. Return to the [DNS records](https://dash.cloudflare.com/2a396cb455e0171a34cdac47ee24776f/theagentfile.com/dns/records) page and confirm the two CNAMEs above exist. Still do not touch nameservers.

Token scopes if you add `CLOUDFLARE_API_TOKEN` for CLI later: Account **Cloudflare Pages** Edit, Account **Workers Scripts** Edit, Zone **DNS** Edit, Zone **Zone** Read. Do not grant Registrar write.

## Attach via dashboard (preferred)

Custom Domains make the Worker the origin. Cloudflare creates DNS records and certificates. Official guide: [Workers custom domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/).

1. Claim or log into the Cloudflare account that holds the zone (not a 60-minute `--temporary` preview unless you have already claimed it).
2. Open [Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers-and-pages).
3. Select the **agenthub** Worker (create it with `npm run build && npx wrangler deploy` if it does not exist yet).
4. **Settings** → **Domains & Routes** → **Add** → **Custom Domain**.
5. Enter `theagentfile.com`. Confirm. Cloudflare writes the DNS record and issues TLS.
6. Repeat for `www.theagentfile.com` **or** add a www→apex redirect (below). Custom Domains match the hostname exactly; apex traffic does not automatically include www.

You cannot attach a Custom Domain to a hostname that already has a CNAME, or to a zone this account does not own.

## Attach via Wrangler (after the zone is yours)

Add routes only when the zone is in the same account Wrangler deploys to. Do **not** commit these patterns until that is true — a deploy would fail.

```jsonc
{
  "name": "agenthub",
  "compatibility_date": "2026-08-25",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "404-page"
  },
  "routes": [
    { "pattern": "theagentfile.com", "custom_domain": true },
    { "pattern": "www.theagentfile.com", "custom_domain": true }
  ]
}
```

Then, with a real token:

```sh
npm run build
npx wrangler deploy
```

`wrangler deploy --temporary` cannot bind a Custom Domain on a zone you do not control. Leave `routes` out of `wrangler.jsonc` until the dashboard attach succeeds once.

## www ↔ apex

Pick one canonical host. Example: serve the Worker on the apex and redirect www.

- Apex: Custom Domain `theagentfile.com` on the `agenthub` Worker.
- www: proxied placeholder DNS (`A` `192.0.2.0` or `AAAA` `100::`) plus a [Redirect Rule](https://developers.cloudflare.com/rules/url-forwarding/examples/redirect-www-to-root/) from `www.theagentfile.com` to `https://theagentfile.com`.

Reverse the pair if you prefer www as canonical.

## Optional: Cloudflare Pages instead of Workers

If you host `dist/` as a **Pages** project instead of Workers static assets:

1. Pages project → **Custom domains** → add `theagentfile.com`.
2. The zone must be on the same account. Pages will add the DNS record when the zone is on Cloudflare.

This tree’s CLI path is Workers (`wrangler.jsonc` + `assets.directory`). Pages is dashboard-only here.

## Check after attach

From any machine:

```sh
dig +short theagentfile.com A
dig +short theagentfile.com AAAA
curl -sI https://theagentfile.com
```

Expect Cloudflare-proxied addresses and `HTTP/2 200` (or a redirect) once DNS and the certificate have propagated. Propagation is usually minutes on a Cloudflare-native zone.
