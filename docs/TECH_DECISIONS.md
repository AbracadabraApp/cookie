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

### 2025-02-23 — Deploy backend on Mac Mini (not Railway)
**Decision:** Host Cookie backend on Mac Mini alongside Jarvis.
**Why:** Mac Mini is already running 24/7 with Node.js v25.6.0. Jarvis needs local API access for iMessage integration. Simpler deployment (no external hosting costs). Can add Railway later if needed for public access.

### 2025-02-23 — Four recipe input methods
**Decision:** Support manual, cut/paste, PDF upload, and Jarvis (iMessage) input.
**Why:** Different use cases require different input methods. Manual for precise control. Paste for quick web recipes. PDF for cookbooks/printouts. Jarvis for hands-free mobile input via iMessage.

### 2025-02-23 — Shared catalog + private user state
**Decision:** Backend serves shared public recipe catalog. User-specific data (ingredient checkboxes, shopping lists) stored in localStorage.
**Why:** User requirement: "recipe catalog to be shared - but interaction (making it, ingredients) to be unique". No authentication needed initially. Private data stays local. Can add sync/auth later.

### 2025-02-23 — Use PM2 for process management
**Decision:** Run Cookie backend with PM2 (same pattern as Jarvis Launch Agent).
**Why:** Auto-restart on crashes. Log management. Production-ready. Familiar pattern already working on Mac Mini.

### 2025-02-23 — Jarvis integration via REST API
**Decision:** Jarvis POSTs to `/api/jarvis/recipe` endpoint with recipe text/URL.
**Why:** Clean separation of concerns. Jarvis stays focused on message handling. Cookie handles recipe parsing. Shared secret token for auth. Extensible for other agents.

### 2025-02-24 — Shopping list is computed, not manually managed

**Decision:** The shopping list is a computed view, not a standalone editable list. The recipe detail page is the editing interface for ingredient state.

**Rules:**
1. **Check a recipe** (planning to make) → its *missing* ingredients get added to the shopping list
2. **Uncheck a recipe** → its ingredients come off the shopping list
3. **Quantities aggregate** — if 2 checked recipes each need 1 onion, the list shows 2 onions. Uncheck one recipe → list shows 1 onion
4. **Recipe page is the source of truth** — each recipe shows all ingredients with checkboxes in recipe order. Checked = have it (on hand), unchecked = need it. Edits on the recipe page flow directly to the shopping list
5. **Shopping list = sum of unchecked ingredients across all checked recipes, minus on-hand quantities**

**Why:** Previous approach had bugs from trying to sync checked state between recipe pages and an independent shopping list. Simpler to make the list a pure computation. Recipe page edits are the single source of truth. Backend handles ingredient normalization so "onion" across recipes resolves to one canonical ingredient with aggregated quantities.

---

*Add new decisions at the bottom as they come up. Date them so we have a timeline.*
