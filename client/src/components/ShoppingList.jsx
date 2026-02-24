import { useState } from 'react';
import { formatIngredient, splitShoppingList } from '../utils/shoppingListUtils';
import './ShoppingList.css';

function ShoppingList({ items = [], onUpdateItems }) {
  const [newItem, setNewItem] = useState('');

  const handleToggle = (itemIndex, currentUserHas) => {
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

  const { needToShop, haveOnHand } = splitShoppingList(items);

  return (
    <div className="shopping-list">
      {needToShop.length === 0 && haveOnHand.length === 0 ? (
        <p className="empty-list">
          No items yet. Open a recipe and tap "I'm Making This" to add ingredients.
        </p>
      ) : (
        <>
          {needToShop.length > 0 && (
            <section className="list-section">
              <h3>Need</h3>
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
            </section>
          )}

          {haveOnHand.length > 0 && (
            <section className="list-section">
              <h3>Have</h3>
              <ul className="ingredient-list">
                {haveOnHand.map((item) => (
                  <li key={`${item.ingredientId}-${item.originalIndex}`} className="ingredient-item have">
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
        </>
      )}

      <form onSubmit={handleAddItem} className="add-item-form">
        <input
          type="text"
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          placeholder="Add item..."
          className="add-item-input"
        />
        <button type="submit" className="add-item-button">
          +
        </button>
      </form>
    </div>
  );
}

export default ShoppingList;
