import { Link } from 'react-router-dom';
import { recipes } from '../data/recipes';
import { getIngredientCounts } from '../utils/recipeUtils';
import ShoppingList from '../components/ShoppingList';
import './Demo.css';

function Demo({ shoppingListItems, onAddToShoppingList, onUpdateShoppingList }) {

  return (
    <div className="demo-page">
      <header className="demo-header">
        <h1>🍪 Cookie</h1>
        <p>Recipe-driven AI shopping list builder</p>
      </header>

      <main className="demo-main">
        <section className="recipes-section">
          <div className="recipes-header">
            <h2>Recipe Library</h2>
            <Link to="/add-recipe" className="add-recipe-button">
              + Add Recipe
            </Link>
          </div>
          <div className="recipe-cards">
            {recipes.map(recipe => {
              const { shopCount, haveCount } = getIngredientCounts(recipe);

              return (
                <Link
                  key={recipe.id}
                  to={`/recipe/${recipe.id}`}
                  className="recipe-card"
                >
                  <h3>{recipe.title}</h3>
                  <p className="recipe-description">{recipe.description}</p>
                  <div className="recipe-meta">
                    <span>⏱ {recipe.totalTime} min</span>
                    <span>🍽 {recipe.servings} servings</span>
                  </div>
                  <div className="ingredients-summary">
                    <span className="shop-count">🛒 {shopCount} to buy</span>
                    <span className="have-count">✓ {haveCount} on hand</span>
                  </div>
                  <div className="recipe-categories">
                    {recipe.categories.slice(0, 3).map((cat, idx) => (
                      <span key={idx} className="category-tag">
                        {cat}
                      </span>
                    ))}
                  </div>
                  <p className="recipe-card-hint">Click to view recipe</p>
                </Link>
              );
            })}
          </div>
        </section>

        <ShoppingList items={shoppingListItems} onUpdateItems={onUpdateShoppingList} />
      </main>
    </div>
  );
}

export default Demo;
