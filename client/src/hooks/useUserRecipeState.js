import { useState } from 'react';
import { STORAGE_KEYS } from '../constants';

function loadJSON(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

/**
 * Per-user recipe state: checked recipes and custom ordering.
 * The recipe catalog comes from the shared DB; this tracks user-specific state.
 *
 * Behavior:
 * - Checking a recipe moves it to the top (checked group)
 * - Unchecking moves it to the top of the unchecked group
 * - Both groups preserve their relative order otherwise
 */
export function useUserRecipeState(allRecipes) {
  const [checkedRecipes, setCheckedRecipes] = useState(
    () => new Set(loadJSON(STORAGE_KEYS.CHECKED_RECIPES, []))
  );

  const [recipeOrder, setRecipeOrder] = useState(() => {
    const saved = loadJSON(STORAGE_KEYS.RECIPE_ORDER, null);
    if (saved) return saved;
    return allRecipes.map(r => r.id);
  });

  const toggleChecked = (recipeId) => {
    setCheckedRecipes(prev => {
      const next = new Set(prev);
      const wasChecked = next.has(recipeId);

      if (wasChecked) {
        // Unchecking: move to top of unchecked group
        next.delete(recipeId);
        setRecipeOrder(order => {
          const without = order.filter(id => id !== recipeId);
          // Find first unchecked recipe in the order
          const firstUncheckedIdx = without.findIndex(id => !next.has(id));
          const insertAt = firstUncheckedIdx === -1 ? without.length : firstUncheckedIdx;
          const newOrder = [...without.slice(0, insertAt), recipeId, ...without.slice(insertAt)];
          saveJSON(STORAGE_KEYS.RECIPE_ORDER, newOrder);
          return newOrder;
        });
      } else {
        // Checking: move to end of checked group (bottom of checked, top of list)
        next.add(recipeId);
        setRecipeOrder(order => {
          const without = order.filter(id => id !== recipeId);
          // Find first unchecked recipe in the order
          const firstUncheckedIdx = without.findIndex(id => !next.has(id));
          const insertAt = firstUncheckedIdx === -1 ? without.length : firstUncheckedIdx;
          const newOrder = [...without.slice(0, insertAt), recipeId, ...without.slice(insertAt)];
          saveJSON(STORAGE_KEYS.RECIPE_ORDER, newOrder);
          return newOrder;
        });
      }

      saveJSON(STORAGE_KEYS.CHECKED_RECIPES, [...next]);
      return next;
    });
  };

  const reorder = (newOrder) => {
    setRecipeOrder(newOrder);
    saveJSON(STORAGE_KEYS.RECIPE_ORDER, newOrder);
  };

  // Build ordered recipe list from user's order, appending new catalog recipes
  const orderedRecipes = [];
  const recipeMap = new Map(allRecipes.map(r => [r.id, r]));

  for (const id of recipeOrder) {
    if (recipeMap.has(id)) {
      orderedRecipes.push(recipeMap.get(id));
      recipeMap.delete(id);
    }
  }
  for (const recipe of recipeMap.values()) {
    orderedRecipes.push(recipe);
  }

  return { orderedRecipes, checkedRecipes, toggleChecked, reorder };
}
