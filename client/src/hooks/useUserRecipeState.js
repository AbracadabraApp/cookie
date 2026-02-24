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
 */
export function useUserRecipeState(allRecipes) {
  const [checkedRecipes, setCheckedRecipes] = useState(
    () => new Set(loadJSON(STORAGE_KEYS.CHECKED_RECIPES, []))
  );

  const [recipeOrder, setRecipeOrder] = useState(() => {
    const saved = loadJSON(STORAGE_KEYS.RECIPE_ORDER, null);
    if (saved) return saved;
    // Default: catalog order
    return allRecipes.map(r => r.id);
  });

  const toggleChecked = (recipeId) => {
    setCheckedRecipes(prev => {
      const next = new Set(prev);
      if (next.has(recipeId)) {
        next.delete(recipeId);
      } else {
        next.add(recipeId);
      }
      saveJSON(STORAGE_KEYS.CHECKED_RECIPES, [...next]);
      return next;
    });
  };

  const reorder = (newOrder) => {
    setRecipeOrder(newOrder);
    saveJSON(STORAGE_KEYS.RECIPE_ORDER, newOrder);
  };

  // Build ordered recipe list, appending any new catalog recipes at the end
  const orderedRecipes = [];
  const recipeMap = new Map(allRecipes.map(r => [r.id, r]));

  for (const id of recipeOrder) {
    if (recipeMap.has(id)) {
      orderedRecipes.push(recipeMap.get(id));
      recipeMap.delete(id);
    }
  }
  // Append any recipes not in the saved order (newly added to catalog)
  for (const recipe of recipeMap.values()) {
    orderedRecipes.push(recipe);
  }

  return { orderedRecipes, checkedRecipes, toggleChecked, reorder };
}
