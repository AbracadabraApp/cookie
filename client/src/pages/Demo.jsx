import { useState } from 'react';
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

  return (
    <div className="demo-page">
      <header className="demo-header">
        <h1>Cookie</h1>
        <select
          className="view-select"
          value={view}
          onChange={e => setView(e.target.value)}
        >
          <option value="list">List</option>
          <option value="recipes">Recipes</option>
        </select>
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
            <Link to="/add-recipe" className="add-recipe-row">
              <span className="add-recipe-icon">+</span>
              <span className="add-recipe-text">Add recipe</span>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

export default Demo;
