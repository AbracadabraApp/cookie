// Business logic for shopping list consolidation and pantry detection

// Common pantry items that most people have on hand
const COMMON_PANTRY_ITEMS = [
  'all-purpose flour',
  'kosher salt',
  'black pepper',
  'extra-virgin olive oil',
  'olive oil',
  'salt',
  'pepper',
  'sugar',
  'vegetable oil',
  'canola oil',
];

// Specialty items that should be highlighted for review
const SPECIALTY_ITEMS = [
  'tomato passata',
  'passata',
  "'nduja",
  'nduja',
  'saffron',
  'truffle oil',
  'flaky sea salt',
  'maldon salt',
  'pecorino romano',
  'parmigiano reggiano',
];

/**
 * Consolidates ingredients from multiple recipes into a single shopping list
 * @param {Array} recipes - Array of recipe objects
 * @returns {Object} - { needToShop: [], mayHaveOnHand: [] }
 */
export function consolidateShoppingList(recipes) {
  const ingredientMap = new Map();

  // Collect all ingredients
  recipes.forEach(recipe => {
    recipe.ingredients.forEach(ing => {
      const key = ing.name.toLowerCase();

      if (ingredientMap.has(key)) {
        // Ingredient exists, aggregate quantities
        const existing = ingredientMap.get(key);
        existing.recipes.push(recipe.title);

        // Simple quantity aggregation (in real app, would need unit conversion)
        if (ing.quantity && existing.quantity && ing.unit === existing.unit) {
          existing.quantity += ing.quantity;
        }
      } else {
        // New ingredient
        ingredientMap.set(key, {
          id: ing.id,
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
          notes: ing.notes,
          recipes: [recipe.title],
          isCommonPantry: COMMON_PANTRY_ITEMS.includes(key),
          isSpecialty: SPECIALTY_ITEMS.includes(key),
        });
      }
    });
  });

  // Split into shop vs. have on hand
  const needToShop = [];
  const mayHaveOnHand = [];

  ingredientMap.forEach(item => {
    if (item.isCommonPantry) {
      mayHaveOnHand.push({ ...item, checked: true });
    } else {
      needToShop.push({ ...item, checked: false });
    }
  });

  return { needToShop, mayHaveOnHand };
}

/**
 * Format ingredient display string
 * @param {Object} item - Ingredient item
 * @returns {String} - Formatted string
 */
export function formatIngredient(item) {
  let result = '';

  if (item.quantity) {
    result += item.quantity;
  }

  if (item.unit) {
    result += ` ${item.unit}`;
  }

  result += ` ${item.name}`;

  if (item.notes) {
    result += ` (${item.notes})`;
  }

  return result.trim();
}
