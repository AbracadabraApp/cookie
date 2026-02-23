import { useState } from 'react';
import { formatIngredient } from '../utils/shoppingListUtils';
import './ShoppingList.css';

function ShoppingList({ initialNeedToShop, initialMayHaveOnHand, recipeCount }) {
  const [needToShop, setNeedToShop] = useState(initialNeedToShop);
  const [mayHaveOnHand, setMayHaveOnHand] = useState(initialMayHaveOnHand);
  const [newItem, setNewItem] = useState('');

  const handleToggle = (item, fromList) => {
    if (fromList === 'shop') {
      // Move from shop to have on hand
      setNeedToShop(needToShop.filter(i => i.id !== item.id));
      setMayHaveOnHand([...mayHaveOnHand, { ...item, checked: true }]);
    } else {
      // Move from have on hand to shop
      setMayHaveOnHand(mayHaveOnHand.filter(i => i.id !== item.id));
      setNeedToShop([...needToShop, { ...item, checked: false }]);
    }
  };

  const handleAddItem = e => {
    e.preventDefault();
    if (newItem.trim()) {
      const item = {
        id: `manual-${Date.now()}`,
        name: newItem.trim(),
        quantity: null,
        unit: null,
        notes: null,
        recipes: [],
        isCommonPantry: false,
        isSpecialty: false,
        checked: false,
      };
      setNeedToShop([...needToShop, item]);
      setNewItem('');
    }
  };

  return (
    <div className="shopping-list">
      <div className="shopping-list-header">
        <h2>Combined Shopping List</h2>
        <p className="recipe-count">
          {recipeCount} {recipeCount === 1 ? 'recipe' : 'recipes'} selected
        </p>
      </div>

      <section className="list-section">
        <h3>May Need to Shop ☐</h3>
        <ul className="ingredient-list">
          {needToShop.map(item => (
            <li key={item.id} className="ingredient-item">
              <label>
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => handleToggle(item, 'shop')}
                />
                <span className="ingredient-text">{formatIngredient(item)}</span>
              </label>
            </li>
          ))}
        </ul>

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
      </section>

      <section className="list-section">
        <h3>May Have On Hand ☑</h3>
        <ul className="ingredient-list">
          {mayHaveOnHand.map(item => (
            <li
              key={item.id}
              className={`ingredient-item ${item.isSpecialty ? 'specialty' : ''}`}
            >
              <label>
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => handleToggle(item, 'have')}
                />
                <span className="ingredient-text">
                  {formatIngredient(item)}
                  {item.isSpecialty && <span className="specialty-badge">⚠️</span>}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default ShoppingList;
