import { useState } from 'react';
import { Link } from 'react-router-dom';
import { recipes } from '../data/recipes';
import { useUserRecipeState } from '../hooks/useUserRecipeState';
import ShoppingList from '../components/ShoppingList';
import './Demo.css';

function Demo({ shoppingListItems, onAddToShoppingList, onUpdateShoppingList }) {
  const [view, setView] = useState('list');
  const { orderedRecipes, checkedRecipes, toggleChecked } = useUserRecipeState(recipes);

  return (
    <div className="demo-page">
      <header className="demo-header">
        <h1>🍪 Cookie</h1>
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
          <ShoppingList items={shoppingListItems} onUpdateItems={onUpdateShoppingList} />
        ) : (
          <div className="recipes-section">
            {orderedRecipes.map(recipe => (
              <div key={recipe.id} className="recipe-row">
                <button
                  className={`recipe-checkbox${checkedRecipes.has(recipe.id) ? ' checked' : ''}`}
                  onClick={() => toggleChecked(recipe.id)}
                  aria-label={`Mark ${recipe.title} as ${checkedRecipes.has(recipe.id) ? 'unchecked' : 'checked'}`}
                />
                <Link
                  to={`/recipe/${recipe.id}`}
                  className={`recipe-title${checkedRecipes.has(recipe.id) ? ' checked' : ''}`}
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
