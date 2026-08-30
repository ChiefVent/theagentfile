# Vercel (Agent File)

Agent File is a **static Astro** site. Vercel can host it without an adapter. The public brand is Agent File at [theagentfile.com](https://theagentfile.com). Git source is [ChiefVent/theagentfile](https://github.com/ChiefVent/theagentfile).

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
| Import | https://github.com/ChiefVent/theagentfile |

You can also deploy from the Vercel CLI after `npm run build` if you add Vercel credentials locally. This project does not deploy from CI unless you configure that yourself.
