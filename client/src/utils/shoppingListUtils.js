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
  'diamond crystal kosher salt',
  'flaky sea salt',
];

/**
 * Check if an ingredient is likely in a typical pantry
 * @param {Object} ingredient - Ingredient object with name
 * @returns {Boolean}
 */
export function isLikelyInPantry(ingredient) {
  const nameLower = ingredient.name.toLowerCase();
  return COMMON_PANTRY_ITEMS.some(pantryItem => nameLower.includes(pantryItem));
}

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
 * Format ingredient for recipe display (with full measurements for cooking)
 * @param {Object} item - Ingredient item
 * @returns {String} - Formatted string with measurements
 */
export function formatIngredientForRecipe(item) {
  const { quantity, unit, name, notes } = item;
  let parts = [];

  if (quantity) {
    parts.push(quantity);
  }

  if (unit) {
    parts.push(unit);
  }

  parts.push(name);

  let result = parts.join(' ');

  if (notes) {
    result += ` (${notes})`;
  }

  return result;
}

/**
 * Split shopping list items into need to shop and have on hand categories
 * @param {Array} items - Shopping list items
 * @returns {Object} - { needToShop, haveOnHand }
 */
export function splitShoppingList(items) {
  const itemsWithIndex = items.map((item, originalIndex) => ({
    ...item,
    originalIndex
  }));

  return {
    needToShop: itemsWithIndex.filter(
      item => item.userHas === false || item.userHas === undefined
    ),
    haveOnHand: itemsWithIndex.filter(item => item.userHas === true)
  };
}

/**
 * Format ingredient display string for shopping list
 * Shows count for countable items, weight for packaged items, just name for measurable items
 * @param {Object} item - Ingredient item
 * @returns {String} - Formatted string
 */
export function formatIngredient(item) {
  const { quantity, unit, name } = item;

  // Items that show count (medium, large, small are size descriptors)
  const countUnits = ['medium', 'large', 'small'];
  const isCountable = unit && countUnits.some(cu => unit.toLowerCase().includes(cu));

  if (quantity && isCountable) {
    return `${Math.ceil(quantity)} ${name}`;
  }

  // Items that show weight (sold by weight in packages)
  const weightUnits = ['pound', 'lb', 'ounce', 'oz'];
  const isWeight = unit && weightUnits.some(wu => unit.toLowerCase().includes(wu));

  if (quantity && isWeight) {
    // Convert to ounces for standard display
    let ounces = quantity;
    if (unit.toLowerCase().includes('pound') || unit.toLowerCase() === 'lb') {
      ounces = quantity * 16;
    }
    return `${name} (${Math.ceil(ounces)} oz)`;
  }

  // For everything else (measurements, cloves, etc.) just show the name
  return name;
}
