# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Frontend (client/):**
```bash
cd client && npm run dev    # Start Vite dev server on http://localhost:5173
npm run build               # Production build
npm test -- --run           # Run tests once
```

**Backend (server/):**
```bash
cd server && npm run dev    # Start Express API on http://localhost:3001
npm run db:migrate          # Apply schema.sql to PostgreSQL
npm run db:seed             # Seed 34 recipe titles
```

**Full stack:** Run both `cd server && npm run dev` and `cd client && npm run dev`. Vite proxies `/api` to `localhost:3001`.

## Architecture Overview

- **Frontend:** React + Vite (port 5173), fetches recipes from API
- **Backend:** Express (port 3001) + PostgreSQL (port 5432, database `cookie`)
- **Database:** PostgreSQL with UUID primary keys. Schema in `server/src/db/schema.sql`
- **AI Integration:** Claude API for recipe text/PDF parsing (`server/src/services/claude.js`)

### Key Data Flow

1. Backend serves shared recipe catalog from PostgreSQL (`GET /api/recipes`, `GET /api/recipes/:id`)
2. Frontend fetches recipes via `useRecipes()` hook → `client/src/services/api.js`
3. User checks recipes (planning to make) → `useUserRecipeState` persists to localStorage
4. Checking a recipe triggers `useRecipeCache` to eagerly fetch full recipe detail (with ingredients)
5. Shopping list is **computed** by `useComputedShoppingList` from checked recipes, cached details, and ingredient have/need state
6. Recipe detail page shows ingredient checkboxes — checked = "I have this", unchecked = "I need this"
7. Toggling ingredients on recipe page updates `useIngredientState` → shopping list recomputes automatically
8. Manual items via `useManualItems` are independent of recipes

### Shopping List Rules (from TECH_DECISIONS.md)
1. Check a recipe → its missing ingredients go on the list
2. Uncheck a recipe → its ingredients come off
3. Quantities aggregate across recipes (2 recipes x 1 onion = 2 onions)
4. Recipe page is source of truth for ingredient have/need state
5. Shopping list = unchecked ingredients across checked recipes, minus on-hand

## Critical Business Logic

### Shopping List Formatting (`client/src/utils/shoppingListUtils.js`)

- **`formatIngredientForRecipe(item)`**: Full measurements for cooking
- **`formatIngredient(item)`**: Simplified for shopping (countable → count, weight → oz, else just name)

### State Hooks (`client/src/hooks/`)
- `useRecipes.js` — fetches recipe list from API
- `useUserRecipeState.js` — checked recipes + custom ordering (localStorage)
- `useIngredientState.js` — which ingredients user has on hand (localStorage)
- `useRecipeCache.js` — caches full recipe details for checked recipes
- `useComputedShoppingList.js` — pure computation: needItems + haveItems
- `useManualItems.js` — manually added shopping list items (localStorage)

### App.jsx Wiring
All hooks are composed in `App.jsx` and passed down as props. `App.jsx` also handles:
- Eagerly prefetching recipe details when recipes are checked
- Clearing ingredient have-state when a recipe is unchecked

## Testing

```bash
cd client && npm test -- --run    # 101 tests
```

- `src/utils/__tests__/` — Unit tests for pure functions
- `src/components/__tests__/` — Component tests (ShoppingList, RecipeDetail)
- `src/__tests__/integration/` — Integration tests (shopping flow)

## Key Files

| File | Purpose |
|------|---------|
| `client/src/App.jsx` | Root — composes all hooks, passes props to routes |
| `client/src/pages/Demo.jsx` | Main view with List/Recipes toggle |
| `client/src/pages/RecipeDetailPage.jsx` | Recipe detail with ingredient checkboxes |
| `client/src/components/ShoppingList.jsx` | Computed Need/Have lists + manual items |
| `client/src/services/api.js` | Fetch wrapper for `/api/recipes` |
| `client/src/hooks/useComputedShoppingList.js` | Core shopping list computation |
| `client/src/constants.js` | localStorage keys |
| `server/src/index.js` | Express app entry point |
| `server/src/models/Recipe.js` | Recipe CRUD with full detail queries |
| `server/src/routes/recipes.js` | REST endpoints for recipes |
| `server/src/db/schema.sql` | PostgreSQL schema |
| `server/src/db/seed.js` | Seeds 34 meal titles |
| `docs/TECH_DECISIONS.md` | Technology choices and rationale |
