import { isLikelyInPantry } from './shoppingListUtils';

/**
 * Calculate ingredient counts for a recipe (shop vs have on hand)
 * @param {Object} recipe - Recipe object with ingredients array
 * @returns {Object} - { shopCount, haveCount }
 */
export function getIngredientCounts(recipe) {
  if (!recipe || !recipe.ingredients) {
    return { shopCount: 0, haveCount: 0 };
  }

  const shopCount = recipe.ingredients.filter(
    ing => !isLikelyInPantry(ing)
  ).length;

  const haveCount = recipe.ingredients.filter(
    ing => isLikelyInPantry(ing)
  ).length;

  return { shopCount, haveCount };
}
