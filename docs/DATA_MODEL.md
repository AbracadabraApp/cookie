# Data Model

## Entity Overview

```
Users ──< Recipes ──< RecipeIngredients >── Ingredients
  │                                            │
  ├──< ShoppingLists ──< ShoppingListItems >───┘
  │
  └──< OnHandItems >── Ingredients
```

## Tables

### Users
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| email | VARCHAR | Unique |
| name | VARCHAR | |
| created_at | TIMESTAMP | |

### Recipes
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| user_id | UUID | FK → Users |
| title | VARCHAR | |
| source | VARCHAR | Where it came from (URL, book, "manual") |
| source_type | ENUM | `manual`, `pdf`, `scraped` |
| raw_text | TEXT | Original unprocessed recipe text |
| instructions | TEXT | Parsed cooking instructions |
| servings | INTEGER | |
| created_at | TIMESTAMP | |

### Ingredients
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| name | VARCHAR | Canonical name (e.g., "all-purpose flour") |
| category | VARCHAR | Aisle grouping (produce, dairy, pantry, etc.) |

### RecipeIngredients
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| recipe_id | UUID | FK → Recipes |
| ingredient_id | UUID | FK → Ingredients |
| quantity | DECIMAL | |
| unit | VARCHAR | e.g., "cups", "oz", "tbsp" |
| notes | VARCHAR | e.g., "diced", "room temperature" |

### ShoppingLists
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| user_id | UUID | FK → Users |
| name | VARCHAR | e.g., "Weekly Groceries" |
| created_at | TIMESTAMP | |

### ShoppingListItems
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| shopping_list_id | UUID | FK → ShoppingLists |
| ingredient_id | UUID | FK → Ingredients |
| quantity | DECIMAL | Aggregated across recipes |
| unit | VARCHAR | |
| checked | BOOLEAN | Picked up? |

### OnHandItems
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| user_id | UUID | FK → Users |
| ingredient_id | UUID | FK → Ingredients |
| quantity | DECIMAL | Nullable (sometimes you just know you "have some") |
| unit | VARCHAR | |

## AI Integration Points

- **Recipe ingestion (manual text / PDF):** Raw text → Claude extracts structured `{ title, servings, instructions, ingredients[] }` → saved to Recipes + RecipeIngredients
- **Shopping list generation:** Selected recipes → aggregate ingredients → subtract on-hand items → ShoppingListItems
- **Ingredient normalization:** Claude helps map messy input ("2 cloves of garlic, minced") to canonical ingredient ("garlic") + quantity/unit/notes
