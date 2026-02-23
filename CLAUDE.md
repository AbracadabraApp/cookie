# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Frontend (client/):**
```bash
cd client && npm run dev    # Start Vite dev server on http://localhost:5173
npm run build               # Production build
npm run preview             # Preview production build
```

**Backend (server/):**
Backend is not yet implemented. Database schema is defined in docs/DATA_MODEL.md but no server code exists yet.

**Current Development Mode:**
The app currently runs as a frontend-only demo using localStorage for persistence. No backend server is running.

## Architecture Overview

**Current State:** Frontend-only React app with hardcoded recipe data and localStorage persistence.

**Planned Architecture:**
- **Frontend:** React + Vite client making API calls to Express backend
- **Backend:** Node.js + Express handling recipe CRUD and calling Anthropic Claude API
- **Database:** PostgreSQL for recipes, ingredients, shopping lists, pantry items
- **AI Integration:** Claude extracts structured ingredients from recipe text/PDFs

### Key Data Flow (Current)

1. User views recipe cards on Demo page (`client/src/pages/Demo.jsx`)
2. Clicks recipe → RecipeDetail modal opens with ingredient checkboxes
3. AI pre-checks likely pantry items using `isLikelyInPantry()` from `shoppingListUtils.js`
4. User checks/unchecks ingredients (I have this / I don't have this)
5. Clicks "I'm Making This" → adds ALL ingredients to shopping list with `userHas` boolean
6. Shopping list splits into two sections: "May Need to Shop" (userHas=false) and "May Have On Hand" (userHas=true)
7. User can toggle checkboxes to move items between lists
8. All state persisted to localStorage

### Key Data Flow (Planned)

1. User pastes recipe text or uploads PDF
2. Frontend sends to backend `/api/recipes/extract`
3. Backend calls Claude API to parse structured ingredients
4. Backend saves to PostgreSQL (Recipes + RecipeIngredients tables)
5. User selects recipes for meal plan
6. Backend aggregates ingredients across recipes, subtracts on-hand pantry items
7. Returns consolidated shopping list with smart formatting

## Critical Business Logic

### Shopping List Formatting (`client/src/utils/shoppingListUtils.js`)

Two separate formatting functions:

- **`formatIngredientForRecipe(item)`**: Full measurements for cooking (e.g., "2 tablespoons fresh parsley (finely chopped)")
- **`formatIngredient(item)`**: Simplified for shopping (e.g., "fresh parsley" or "dried pasta (16 oz)")

Shopping list formatting rules:
- **Countable items**: Show count (e.g., "2 shallots", "2 chicken breasts")
- **Weight items**: Show weight in oz (e.g., "dried pasta (16 oz)")
- **Everything else**: Just the name (e.g., "garlic", "olive oil")

### AI Pantry Detection

`isLikelyInPantry()` checks ingredient names against `COMMON_PANTRY_ITEMS` array (salt, pepper, oils, flour, sugar). Used to pre-check boxes in recipe detail view.

### User Learning System

When user clicks "I'm Making This", ALL ingredients are added to shopping list with `userHas` boolean:
- `userHas: true` → item goes to "May Have On Hand" list
- `userHas: false` → item goes to "May Need to Shop" list

This captures user feedback for future ML training (which items they actually have vs. what AI guessed).

## Important Patterns

### Recipe Data Structure

Currently hardcoded in `client/src/data/recipes.js`:

```javascript
{
  id: 1,
  title: "Recipe Name",
  description: "...",
  source: "Serious Eats",
  notes: "...",
  prepTime: 30,
  cookTime: 45,
  totalTime: 75,
  servings: 4,
  ingredients: [
    {
      id: 'ing-1',
      quantity: 2,
      unit: 'tablespoons',
      name: 'olive oil',
      notes: 'extra-virgin'
    }
  ],
  directions: ["Step 1...", "Step 2..."],
  categories: ["Italian", "Pasta", "Dinner"]
}
```

### Shopping List Item Structure

```javascript
{
  ingredientId: 'ing-1',
  name: 'olive oil',
  quantity: 2,
  unit: 'tablespoons',
  notes: 'extra-virgin',
  recipeTitle: 'Pasta with Tomato Sauce',
  recipeId: 1,
  userHas: false,  // User said they don't have this
  checked: false   // Not yet purchased (for in-store checking)
}
```

## Known Limitations & Future Work

- No backend server yet (planned: Node.js + Express)
- No database (planned: PostgreSQL)
- No Claude API integration yet (planned: recipe parsing from text/PDF)
- Recipes are hardcoded in `client/src/data/recipes.js`
- No user authentication
- No recipe import functionality (AddRecipe component is UI-only placeholder)
- localStorage used for shopping list persistence (will move to database)

## Testing

**Run tests:**
```bash
cd client && npm test              # Watch mode
npm run test:coverage              # With coverage report
```

**Test structure:**
- `src/utils/__tests__/` - Unit tests for pure functions (100% coverage)
- `src/components/__tests__/` - Component tests with React Testing Library
- `src/__tests__/integration/` - End-to-end integration tests

**Coverage requirements:**
- Utils: 100% coverage (statements, branches, functions, lines)
- Components: 70%+ coverage
- All tests must pass before merging

**Current test stats:** 110 tests passing
- Utils: 44 tests (shoppingListUtils, recipeUtils)
- Components: 52 tests (ShoppingList, RecipeDetail)
- Integration: 14 tests (shopping-flow)

**Testing patterns:**
- Use `vi.fn()` for mocks
- Clear localStorage in `beforeEach` for integration tests
- Test user interactions with fireEvent
- Use `within()` for scoped queries
- Test both happy path and edge cases

## Key Files

- `client/src/pages/Demo.jsx` - Main page with recipe library and shopping list
- `client/src/components/RecipeDetail.jsx` - Recipe modal with ingredient checkboxes
- `client/src/components/ShoppingList.jsx` - Two-list shopping UI (Need to Shop / Have On Hand)
- `client/src/utils/shoppingListUtils.js` - Business logic for formatting and pantry detection
- `client/src/utils/recipeUtils.js` - Recipe helper functions (ingredient counts)
- `client/src/hooks/useShoppingListPersistence.js` - localStorage management hook
- `client/src/constants.js` - Application constants (storage keys, etc.)
- `client/src/data/recipes.js` - Hardcoded recipe data (3 recipes)
- `docs/DATA_MODEL.md` - Planned database schema
- `docs/TECH_DECISIONS.md` - Technology choices and rationale
