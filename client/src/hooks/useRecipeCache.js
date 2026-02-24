import { useState, useCallback } from 'react';
import { getRecipe } from '../services/api';

/**
 * Caches full recipe details (with ingredients) fetched from the API.
 * Used to compute the shopping list without re-fetching.
 */
export function useRecipeCache() {
  const [cache, setCache] = useState(new Map());

  const prefetchRecipe = useCallback((recipeId) => {
    setCache(prev => {
      if (prev.has(recipeId)) return prev;
      // Mark as loading to avoid duplicate fetches
      const next = new Map(prev);
      next.set(recipeId, null);
      return next;
    });

    getRecipe(recipeId)
      .then(data => {
        setCache(prev => {
          const next = new Map(prev);
          next.set(recipeId, data);
          return next;
        });
      })
      .catch(err => {
        console.error(`Failed to fetch recipe ${recipeId}:`, err);
        setCache(prev => {
          const next = new Map(prev);
          next.delete(recipeId);
          return next;
        });
      });
  }, []);

  const getRecipeFromCache = useCallback((recipeId) => {
    return cache.get(recipeId) || null;
  }, [cache]);

  return { cache, getRecipe: getRecipeFromCache, prefetchRecipe };
}
