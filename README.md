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
| Database | SQLite via `better-sqlite3` |
| ORM | Drizzle ORM + Drizzle Kit (migrations) |
| Server | SvelteKit `+page.server.ts` loaders, `+server.ts` endpoints |
| Tests | Playwright (e2e) |
| Adapter | `@sveltejs/adapter-node` (deploy anywhere Node runs) |

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

## Deployment

It's a small Node server app (SSR + API + a SQLite file), so it runs anywhere Node does:

1. `npm run build` → `node build` (via `adapter-node`).
2. Set `DATABASE_URL` to a writable path on a **persistent disk**, then run `npm run db:setup` once.
3. Put it behind Nginx with a domain (or any Node host / container).

On serverless platforms (where the disk isn't persistent), swap the Drizzle driver to Postgres (Neon/Supabase) or libSQL (Turso) — the schema and queries barely change.

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
