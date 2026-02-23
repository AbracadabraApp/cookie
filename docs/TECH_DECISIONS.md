# Tech Decisions

A running log of technology choices and why we made them. This saves us from re-debating the same things.

---

## Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | **React** (Vite) | Fast dev server, widely known, huge ecosystem |
| Backend | **Node.js + Express** | Same language as frontend, simple REST API |
| Database | **PostgreSQL** | Relational data fits our model well (recipes → ingredients), strong JSON support for flexible recipe data |
| AI | **Anthropic (Claude)** | Powers recipe parsing, ingredient extraction from PDFs, and smart list building |
| Deployment | **Railway** (future) | Simple deploy from GitHub, manages Postgres hosting too |

## Key Decisions

### 2025-XX-XX — Monorepo structure
**Decision:** Single repo with `client/` and `server/` directories.
**Why:** Easier to manage for 2 people. No overhead of syncing multiple repos. Shared tooling config.

### 2025-XX-XX — PostgreSQL over SQLite
**Decision:** Use Postgres from the start.
**Why:** Railway offers managed Postgres. Gives us proper relational features (joins, constraints) and won't need to migrate later. Slightly more setup, but worth it.

### 2025-XX-XX — Anthropic for AI features
**Decision:** Use Claude API for recipe parsing and ingredient extraction.
**Why:** Strong structured output support, good at understanding recipe text and PDFs. Can handle messy recipe formats gracefully.

### 2025-XX-XX — PDF ingestion first, scraping later
**Decision:** Start with manual entry + PDF upload. Defer web scraping.
**Why:** PDF parsing is more contained and reliable. Scraping brings legal gray areas and site-specific fragility. Revisit once core flow works.

---

*Add new decisions at the bottom as they come up. Date them so we have a timeline.*
