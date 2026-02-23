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
 * Convert recipe measurements to shopping-friendly quantities
 * @param {Object} item - Ingredient item
 * @returns {Object} - { quantity, unit, nameOnly }
 */
function convertToShoppingQuantity(item) {
  const { quantity, unit, name } = item;
  const nameLower = name.toLowerCase();

  // Items that should show as name-only with amount in parentheses
  const nameOnlyItems = [
    { keywords: ['parsley', 'cilantro', 'basil', 'chives', 'tarragon', 'thyme', 'rosemary', 'mint', 'dill'], label: 'fresh herbs' },
    { keywords: ['wine'], label: 'wine' },
    { keywords: ['stock', 'broth'], label: 'stock/broth' },
    { keywords: ['cheese'], label: 'cheese' },
  ];

  for (const category of nameOnlyItems) {
    if (category.keywords.some(keyword => nameLower.includes(keyword))) {
      return { quantity, unit, nameOnly: true };
    }
  }

  // Remove size descriptors from count items (medium, large, small)
  const countItems = [
    'shallot',
    'onion',
    'garlic',
    'lemon',
    'lime',
    'orange',
    'chicken breast',
    'egg',
    'avocado',
    'potato',
    'tomato',
  ];

  const isByCount = countItems.some(countItem => nameLower.includes(countItem));

  if (isByCount) {
    // Remove "medium", "large", "small" descriptors for count items
    if (unit === 'clove' || unit === 'medium clove') {
      return { quantity: Math.ceil(quantity || 1), unit: 'clove', nameOnly: false };
    }
    if (unit === 'medium' || unit === 'large' || unit === 'small') {
      return { quantity: Math.ceil(quantity || 1), unit: null, nameOnly: false };
    }
  }

  // Butter - convert tablespoons to sticks (very common conversion)
  if (nameLower.includes('butter') && unit === 'tablespoons') {
    const sticks = Math.ceil(quantity / 8); // 8 tbsp per stick
    return { quantity: sticks, unit: sticks === 1 ? 'stick' : 'sticks', nameOnly: false };
  }

  // Default: return as-is (keep original recipe measurements)
  return { quantity, unit, nameOnly: false };
}

/**
 * Format ingredient display string for shopping list
 * @param {Object} item - Ingredient item
 * @returns {String} - Formatted string
 */
export function formatIngredient(item) {
  const shopping = convertToShoppingQuantity(item);

  // Name-only format: "fresh parsley (2 tablespoons)"
  if (shopping.nameOnly) {
    let result = item.name;
    if (shopping.quantity && shopping.unit) {
      result += ` (${shopping.quantity} ${shopping.unit})`;
    }
    if (item.notes) {
      result += ` - ${item.notes}`;
    }
    return result;
  }

  // Standard format: "2 shallots"
  let parts = [];

  if (shopping.quantity) {
    parts.push(shopping.quantity);
  }

  if (shopping.unit) {
    parts.push(shopping.unit);
  }

  parts.push(item.name);

  let result = parts.join(' ');

  if (item.notes) {
    result += ` (${item.notes})`;
  }

  return result;
}
