import { useMemo } from 'react';

/**
 * Computes the shopping list from checked recipes, cached recipe details,
 * and ingredient "have" state.
 *
 * Rules (from TECH_DECISIONS.md):
 * 1. Check recipe → its missing ingredients go on the list
 * 2. Uncheck recipe → those ingredients come off
 * 3. Quantities aggregate across recipes
 * 4. Recipe page is source of truth for have/need
 * 5. Shopping list = unchecked ingredients across checked recipes, minus on-hand
 */
export function useComputedShoppingList(checkedRecipes, recipeCache, haveIngredients) {
  return useMemo(() => {
    const needMap = new Map(); // key: normalized name → aggregated item
    const haveMap = new Map();

    for (const recipeId of checkedRecipes) {
      const recipe = recipeCache.get(recipeId);
      if (!recipe || !recipe.ingredients) continue;

      for (const ing of recipe.ingredients) {
        const key = ing.name.toLowerCase().trim();
        const isHave = haveIngredients.has(ing.id);
        const targetMap = isHave ? haveMap : needMap;

        if (targetMap.has(key)) {
          const existing = targetMap.get(key);
          // Aggregate quantity if same unit
          if (ing.quantity && existing.quantity && ing.unit === existing.unit) {
            existing.quantity = Number(existing.quantity) + Number(ing.quantity);
          }
          if (!existing.recipes.includes(recipe.title)) {
            existing.recipes.push(recipe.title);
          }
          // Collect all ingredient IDs for this normalized name
          existing.ingredientIds.push(ing.id);
        } else {
          targetMap.set(key, {
            name: ing.name,
            quantity: ing.quantity ? Number(ing.quantity) : null,
            unit: ing.unit,
            notes: ing.notes,
            recipes: [recipe.title],
            ingredientIds: [ing.id],
          });
        }
      }
    }

    return {
      needItems: [...needMap.values()],
      haveItems: [...haveMap.values()],
    };
  }, [checkedRecipes, recipeCache, haveIngredients]);
}
