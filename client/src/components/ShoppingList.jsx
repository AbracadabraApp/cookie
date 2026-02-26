import { useState, useRef } from 'react';
import { formatIngredient } from '../utils/shoppingListUtils';
import './ShoppingList.css';

function ShoppingList({
  needItems = [],
  haveItems = [],
  manualItems = [],
  onAddManualItem,
  onToggleManualItem,
  onToggleHave,
}) {
  const [newItem, setNewItem] = useState('');
  const inputRef = useRef(null);

  const handleAddItem = e => {
    e.preventDefault();
    if (newItem.trim()) {
      onAddManualItem(newItem);
      setNewItem('');
    }
  };
  // Toggle all ingredient IDs for a computed item (may span multiple recipes)
  const handleToggleComputed = (item) => {
    for (const id of item.ingredientIds) {
      onToggleHave(id);
    }
  };

  const manualNeed = manualItems.filter(i => !i.have);
  const manualHave = manualItems.filter(i => i.have);

  const hasNeed = needItems.length > 0 || manualNeed.length > 0;
  const hasHave = haveItems.length > 0 || manualHave.length > 0;
  const isEmpty = !hasNeed && !hasHave;

  return (
    <div className="shopping-list">
      {isEmpty ? (
        <p className="empty-list">
          No items yet. Check a recipe to add its ingredients.
        </p>
      ) : (
        <>
          {hasNeed && (
            <section className="list-section">
              <div className="section-header">
                <h2>Need</h2>
              </div>
              <form onSubmit={handleAddItem} className="inline-add-form">
                <input
                  ref={inputRef}
                  type="text"
                  value={newItem}
                  onChange={e => setNewItem(e.target.value)}
                  placeholder="Add item..."
                  className="inline-add-input"
                />
                <button type="submit" className="inline-add-btn">+</button>
              </form>
              <ul className="ingredient-list">
                {needItems.map((item) => (
                  <li key={item.name} className="ingredient-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={false}
                        onChange={() => handleToggleComputed(item)}
                      />
                      <span className="ingredient-text">
                        {formatIngredient(item)}
                      </span>
                    </label>
                  </li>
                ))}
                {manualNeed.map((item) => (
                  <li key={item.id} className="ingredient-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={false}
                        onChange={() => onToggleManualItem(item.id)}
                      />
                      <span className="ingredient-text">{item.name}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {hasHave && (
            <section className="list-section">
              <h2>Have</h2>
              <ul className="ingredient-list">
                {haveItems.map((item) => (
                  <li key={item.name} className="ingredient-item have">
                    <label>
                      <input
                        type="checkbox"
                        checked={true}
                        onChange={() => handleToggleComputed(item)}
                      />
                      <span className="ingredient-text">
                        {formatIngredient(item)}
                      </span>
                    </label>
                  </li>
                ))}
                {manualHave.map((item) => (
                  <li key={item.id} className="ingredient-item have">
                    <label>
                      <input
                        type="checkbox"
                        checked={true}
                        onChange={() => onToggleManualItem(item.id)}
                      />
                      <span className="ingredient-text">{item.name}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

    </div>
  );
}

export default ShoppingList;
