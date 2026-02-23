import { useState } from 'react';
import { formatIngredient } from '../utils/shoppingListUtils';
import './ShoppingList.css';

function ShoppingList({ items, onUpdateItems }) {
  const [newItem, setNewItem] = useState('');

  const handleToggle = itemIndex => {
    const updated = items.map((item, idx) =>
      idx === itemIndex ? { ...item, checked: !item.checked } : item
    );
    onUpdateItems(updated);
  };

  const handleRemove = itemIndex => {
    const updated = items.filter((_, idx) => idx !== itemIndex);
    onUpdateItems(updated);
  };

  const handleAddItem = e => {
    e.preventDefault();
    if (newItem.trim()) {
      const item = {
        ingredientId: `manual-${Date.now()}`,
        name: newItem.trim(),
        quantity: null,
        unit: null,
        notes: null,
        recipeTitle: 'Manual',
        recipeId: null,
        checked: false,
      };
      onUpdateItems([...items, item]);
      setNewItem('');
    }
  };

  // Only show items user needs to buy (userHas === false or undefined for manual items)
  const itemsToDisplay = items.map((item, originalIndex) => ({ ...item, originalIndex }))
    .filter(item => item.userHas === false || item.userHas === undefined);

  const uncheckedCount = itemsToDisplay.filter(item => !item.checked).length;

  return (
    <div className="shopping-list">
      <div className="shopping-list-header">
        <h2>Shopping List</h2>
        <p className="recipe-count">
          {uncheckedCount} {uncheckedCount === 1 ? 'item' : 'items'} to buy
        </p>
      </div>

      <form onSubmit={handleAddItem} className="add-item-form">
        <input
          type="text"
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          placeholder="Add item (e.g., paper towels)"
          className="add-item-input"
        />
        <button type="submit" className="add-item-button">
          + Add Item
        </button>
      </form>

      <section className="list-section">
        {itemsToDisplay.length === 0 ? (
          <p className="empty-list">
            No items yet. Click a recipe and select "I'm Making This" to add ingredients.
          </p>
        ) : (
          <ul className="ingredient-list">
            {itemsToDisplay.map((item) => (
              <li key={`${item.ingredientId}-${item.originalIndex}`} className="ingredient-item">
                <label>
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => handleToggle(item.originalIndex)}
                  />
                  <span className={`ingredient-text ${item.checked ? 'checked' : ''}`}>
                    {formatIngredient(item)}
                    {item.recipeTitle && item.recipeTitle !== 'Manual' && (
                      <span className="recipe-badge">{item.recipeTitle}</span>
                    )}
                  </span>
                </label>
                <button
                  className="remove-button"
                  onClick={() => handleRemove(item.originalIndex)}
                  title="Remove item"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default ShoppingList;
