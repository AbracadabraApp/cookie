import { useState } from 'react';
import { STORAGE_KEYS } from '../constants';

function loadSet(key) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

function saveSet(key, set) {
  try {
    localStorage.setItem(key, JSON.stringify([...set]));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

/**
 * Tracks which ingredients the user has on hand.
 * Checked = "I have this" → excluded from shopping list.
 */
export function useIngredientState() {
  const [haveIngredients, setHaveIngredients] = useState(
    () => loadSet(STORAGE_KEYS.HAVE_INGREDIENTS)
  );

  const toggleHave = (ingredientId) => {
    setHaveIngredients(prev => {
      const next = new Set(prev);
      if (next.has(ingredientId)) {
        next.delete(ingredientId);
      } else {
        next.add(ingredientId);
      }
      saveSet(STORAGE_KEYS.HAVE_INGREDIENTS, next);
      return next;
    });
  };

  const clearForRecipe = (ingredientIds) => {
    setHaveIngredients(prev => {
      const next = new Set(prev);
      for (const id of ingredientIds) {
        next.delete(id);
      }
      saveSet(STORAGE_KEYS.HAVE_INGREDIENTS, next);
      return next;
    });
  };

  return { haveIngredients, toggleHave, clearForRecipe };
}
