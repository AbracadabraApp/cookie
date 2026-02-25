import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import ShoppingList from '../components/ShoppingList';
import './Demo.css';

function Demo({
  orderedRecipes,
  checkedRecipes,
  onToggleChecked,
  needItems,
  haveItems,
  manualItems,
  onAddManualItem,
  onToggleManualItem,
  onToggleHave,
  loading,
  error,
}) {
  const [view, setView] = useState('list');
  const [addingItem, setAddingItem] = useState(false);
  const [newItem, setNewItem] = useState('');
  const inputRef = useRef(null);

  const handleAddItem = e => {
    e.preventDefault();
    if (newItem.trim()) {
      onAddManualItem(newItem);
      setNewItem('');
      setAddingItem(false);
    }
  };

  const openAddItem = () => {
    setAddingItem(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div className="demo-page">
      <header className="demo-header">
        <nav className="view-nav">
          <button
            className={`view-nav-item${view === 'list' ? ' active' : ''}`}
            onClick={() => setView('list')}
          >
            {view === 'list' && <span className="view-nav-tri">▾</span>}List
          </button>
          <span className="view-nav-divider">|</span>
          <button
            className={`view-nav-item${view === 'recipes' ? ' active' : ''}`}
            onClick={() => setView('recipes')}
          >
            {view === 'recipes' && <span className="view-nav-tri">▾</span>}Recipes
          </button>
        </nav>
        {view === 'list' ? (
          addingItem ? (
            <form onSubmit={handleAddItem} className="header-add-form">
              <input
                ref={inputRef}
                type="text"
                value={newItem}
                onChange={e => setNewItem(e.target.value)}
                onBlur={() => { if (!newItem.trim()) setAddingItem(false); }}
                placeholder="Add item..."
                className="header-add-input"
              />
            </form>
          ) : (
            <button className="header-add-text" onClick={openAddItem}>+ Item</button>
          )
        ) : (
          <Link to="/add-recipe" className="header-add-link">+ Add</Link>
        )}
      </header>

      <main className="demo-main">
        {view === 'list' ? (
          <ShoppingList
            needItems={needItems}
            haveItems={haveItems}
            manualItems={manualItems}
            onAddManualItem={onAddManualItem}
            onToggleManualItem={onToggleManualItem}
            onToggleHave={onToggleHave}
          />
        ) : loading ? (
          <p className="loading-text">Loading recipes...</p>
        ) : error ? (
          <p className="error-text">Failed to load recipes</p>
        ) : (
          <div className="recipes-section">
            {orderedRecipes.map(recipe => (
              <div key={recipe.id} className="recipe-row">
                <button
                  className={`recipe-checkbox${checkedRecipes.has(recipe.id) ? ' checked' : ''}`}
                  onClick={() => onToggleChecked(recipe.id)}
                  aria-label={`Mark ${recipe.title} as ${checkedRecipes.has(recipe.id) ? 'unchecked' : 'checked'}`}
                />
                <Link
                  to={`/recipe/${recipe.id}`}
                  className="recipe-title"
                >
                  {recipe.title}
                </Link>
                <span className="recipe-grip">⠿</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Demo;
