import { useState } from 'react';
import { STORAGE_KEYS } from '../constants';

function loadItems() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.MANUAL_ITEMS);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveItems(items) {
  try {
    localStorage.setItem(STORAGE_KEYS.MANUAL_ITEMS, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

/**
 * Manages manually added shopping list items (the "+ Add item" feature).
 * These are independent of recipes.
 */
export function useManualItems() {
  const [manualItems, setManualItems] = useState(loadItems);

  const addItem = (name) => {
    const item = {
      id: `manual-${Date.now()}`,
      name: name.trim(),
      have: false,
    };
    const next = [...manualItems, item];
    setManualItems(next);
    saveItems(next);
  };

  const removeItem = (itemId) => {
    const next = manualItems.filter(i => i.id !== itemId);
    setManualItems(next);
    saveItems(next);
  };

  const toggleItem = (itemId) => {
    const next = manualItems.map(i =>
      i.id === itemId ? { ...i, have: !i.have } : i
    );
    setManualItems(next);
    saveItems(next);
  };

  return { manualItems, addItem, removeItem, toggleItem };
}
