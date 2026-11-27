# AGENTS.md — open-tickets

## What this is

Open Tickets: a ticketing app with a Node server, static public assets, and an optional Capacitor shell. There is no root README; this file follows `package.json`, `server/`, `public/`, `api/`, `migrations/`, and `vercel.json`.

`server/src/booksV33VerticalEngine.js` is the `@openscaffold/books` general-ledger bridge. Treat money and ticket-delivery changes as sensitive.

## Stack

- Node (Express-style server at `server/src/index.js`)
- Static output in `public/`
- Vercel: `buildCommand` is `npm run build`, `outputDirectory` is `public`, with a serverless function at `api/index.js`
- Capacitor (`capacitor.config.json`)
- SQL under `migrations/`
- Tests: `server/src/__tests__/`

## Install / run / test / build

```bash
npm test     # node --test server/src/__tests__/*.test.js
npm start    # node server/src/index.js
npm run build  # currently a verify/log script for the static bundle in public/
```

There is no `npm ci` cache path documented. Use a normal `npm install` if `node_modules` is not present. Do not commit secrets from local env files.

## CI

No GitHub Actions workflow is in the repo today. Run `npm test` locally and note the missing CI on the PR.

## Shared @openscaffold modules

No package dependency is declared, but the server includes a Books v3.3 vertical engine. Follow that module's money rules (integer cents, tenant scoping) when you touch it.

## OSL engineering rules

These apply to every Open Scaffold Labs repo:

- **PRs only.** Do not push to the default branch (`main` or `master`). Open a pull request.
- **CI must be green** before merge. Never merge over red.
- **zod `.strict()`** on every write route (POST / PUT / PATCH / DELETE bodies).
- **Attack harness** on every route: auth bypass, tenant crossover, oversized and unknown fields, injection. Required once the app has real users; recommended for prototypes.
- **`docs/security-decisions.md` entry** (reviewed) for any change to headers, auth, or deploys.
- **No competitor names** in code, seed data, comments, or UI copy.
- **Never commit secrets.** No API keys, tokens, credentials, cookies, or magic links. Keep `.env` and real values out of git, PR text, and chat. Commit only `.env.example` with placeholders.

A production deploy, paid account, env/credential change, or merge that auto-deploys to production needs Dale's own yes.
