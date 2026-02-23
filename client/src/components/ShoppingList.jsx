import { useState } from 'react';
import { formatIngredient, splitShoppingList } from '../utils/shoppingListUtils';
import './ShoppingList.css';

function ShoppingList({ items, onUpdateItems }) {
  const [newItem, setNewItem] = useState('');

  const handleToggle = (itemIndex, currentUserHas) => {
    // Toggle userHas status (moves between lists)
    const updated = items.map((item, idx) =>
      idx === itemIndex ? { ...item, userHas: !currentUserHas } : item
    );
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
        userHas: false
      };
      onUpdateItems([...items, item]);
      setNewItem('');
    }
  };

  // Split items into need to shop vs have on hand
  const { needToShop, haveOnHand } = splitShoppingList(items);

  return (
    <div className="shopping-list">
      <div className="shopping-list-header">
        <h2>Shopping List</h2>
        <p className="recipe-count">
          {needToShop.length} {needToShop.length === 1 ? 'item' : 'items'} to shop
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
        <h3>May Need to Shop ☐</h3>
        {needToShop.length === 0 ? (
          <p className="empty-list">
            No items yet. Click a recipe and select "I'm Making This" to add ingredients.
          </p>
        ) : (
          <ul className="ingredient-list">
            {needToShop.map((item) => (
              <li key={`${item.ingredientId}-${item.originalIndex}`} className="ingredient-item">
                <label>
                  <input
                    type="checkbox"
                    checked={false}
                    onChange={() => handleToggle(item.originalIndex, false)}
                  />
                  <span className="ingredient-text">
                    {formatIngredient(item)}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </section>

      {haveOnHand.length > 0 && (
        <section className="list-section">
          <h3>May Have On Hand ☑</h3>
          <ul className="ingredient-list">
            {haveOnHand.map((item) => (
              <li key={`${item.ingredientId}-${item.originalIndex}`} className="ingredient-item already-have">
                <label>
                  <input
                    type="checkbox"
                    checked={true}
                    onChange={() => handleToggle(item.originalIndex, true)}
                  />
                  <span className="ingredient-text">
                    {formatIngredient(item)}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export default ShoppingList;
