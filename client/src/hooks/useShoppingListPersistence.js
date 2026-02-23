import { useState } from 'react';
import { STORAGE_KEYS } from '../constants';

const STORAGE_KEY = STORAGE_KEYS.SHOPPING_LIST;

/**
 * Custom hook for managing shopping list state with localStorage persistence
 * @returns {Array} [items, updateItems] - Current items and update function
 */
export function useShoppingListPersistence() {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load shopping list from localStorage:', error);
      return [];
    }
  });

  const updateItems = (newItems) => {
    setItems(newItems);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
    } catch (error) {
      console.error('Failed to save shopping list to localStorage:', error);
    }
  };

  return [items, updateItems];
}
