# Baitline — Phishing Defense Trainer

An interactive phishing-awareness trainer built with **SvelteKit + TypeScript** on a **SQLite** backend. Work through a simulated inbox, inspect each message like a security analyst, decide *phishing* vs *safe*, and get scored on the exact red flags you caught or missed — plus a global leaderboard and a standalone tool that analyzes any email you paste.

> Phishing is the entry point for the majority of real breaches. The person reading the email is the last line of defense — this trains that instinct.

## Features

- **Inbox trainer** (`/train`) — a deck of realistic emails (classic credential phish, business-email-compromise, lookalike domains, and *legitimate* mail that looks alarming). Click any sender, link or phrase to flag it; links reveal their true destination. Score, streak and a per-email feedback panel that teaches every cue.
- **Email analyzer** (`/analyze`) — paste any email; the server runs real phishing heuristics (lookalike/spoofed sender domains, link↔domain mismatches, URL shorteners, urgency & payment-fraud language) and returns an explained risk score.
- **Leaderboard** (`/leaderboard`) — completed runs are persisted and ranked.

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | SvelteKit (Svelte 5 **runes**) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + scoped component styles |
| Database | SQLite via libSQL — a local file in dev, [Turso](https://turso.tech) in production |
| ORM | Drizzle ORM + Drizzle Kit (migrations) |
| Server | SvelteKit `+page.server.ts` loaders, `+server.ts` endpoints |
| Tests | Playwright (e2e) |
| Adapter | `@sveltejs/adapter-vercel` |

## How the data flows

The training emails live in `src/lib/data/emails.ts` as the single source of truth, and are **seeded into the database** — the app then serves them from SQLite via a server load, not from the client bundle.

```
emails.ts ──(seed)──► SQLite (scenarios) ──(+page.server.ts load)──► /train
                      SQLite (runs)       ◄──(POST /api/runs)─────── results
```

## Getting started

```bash
npm install
npm run db:setup     # applies migrations + seeds the email scenarios
npm run dev          # http://localhost:5173
```

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `npm run preview` | Production build / preview |
| `npm run check` | Type-check (svelte-check) |
| `npm run db:migrate` | Apply SQL migrations in `./drizzle` |
| `npm run db:seed` | Load the email scenarios into the DB |
| `npm run db:setup` | `db:migrate` + `db:seed` |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run test:e2e` | Run the Playwright suite |

## Deployment (Vercel + Turso)

Deploys automatically from this GitHub repo on every push.

1. **Create a Turso database** and grab its URL + token:
   ```bash
   turso db create phish-dojo
   turso db show phish-dojo --url            # libsql://…turso.io
   turso db tokens create phish-dojo         # the auth token
   ```
2. **Apply the schema + seed it** (once), pointed at Turso:
   ```bash
   DATABASE_URL='libsql://…turso.io' DATABASE_AUTH_TOKEN='…' npm run db:setup
   ```
3. **Import the repo on Vercel** and set two environment variables:
   `DATABASE_URL` and `DATABASE_AUTH_TOKEN`. Vercel detects SvelteKit and builds it.

Locally there's nothing to configure — `DATABASE_URL` defaults to `file:local.db`.

## Project layout

```
src/
  lib/
    data/emails.ts          # canonical training scenarios (seed source)
    components/             # ScoreBar, EmailView, Inspectable, Feedback, Results …
    state/game.svelte.ts    # game state (Svelte 5 runes)
    server/
      analyze.ts            # phishing-analysis engine
      db/{schema,index,seed,migrate}.ts
  routes/
    +page.svelte            # landing
    train/                  # the drill (+page.server.ts loads the deck)
    analyze/                # paste-and-analyze tool
    leaderboard/            # ranked runs
    api/{runs,analyze}/     # JSON endpoints
e2e/                        # Playwright tests
```
