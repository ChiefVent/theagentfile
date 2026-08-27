# Vercel (Agent File)

Agent File is a **static Astro** site. Vercel can host it without an adapter. The public brand is Agent File at [theagentfile.com](https://theagentfile.com). The Origin git remote remains `neil-lawlor/agenthub`.

## Settings

Import the repository. Vercel **auto-detects Astro**.

| Setting | Value |
| --- | --- |
| Framework preset | Astro (auto-detect) |
| Build command | `npm run build` |
| Output directory | `dist` |
| Install command | `npm install` |
| Node.js | 22.x |
| Production branch | `main` |

## Origin vs GitHub

The code is on Origin: [https://cursor.com/codebase/neil-lawlor/agenthub](https://cursor.com/codebase/neil-lawlor/agenthub). Origin is the current git remote.

Connecting Vercel to **GitHub** requires a GitHub mirror that you push yourself. Do not invent GitHub credentials in this repo. A GitHub push is optional and manual.

You can also deploy from the Vercel CLI after `npm run build` if you add Vercel credentials locally. This project does not deploy from CI unless you configure that yourself.
