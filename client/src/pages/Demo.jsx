import { useMemo, useState } from 'react';
import { recipes } from '../data/recipes';
import { consolidateShoppingList } from '../utils/shoppingListUtils';
import ShoppingList from '../components/ShoppingList';
import RecipeDetail from '../components/RecipeDetail';
import './Demo.css';

function Demo() {
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const { needToShop, mayHaveOnHand } = useMemo(
    () => consolidateShoppingList(recipes),
    []
  );

  return (
    <div className="demo-page">
      <header className="demo-header">
        <h1>🍪 Cookie</h1>
        <p>Recipe-driven AI shopping list builder</p>
      </header>

      <main className="demo-main">
        <section className="recipes-section">
          <h2>Selected Recipes</h2>
          <div className="recipe-cards">
            {recipes.map(recipe => (
              <div
                key={recipe.id}
                className="recipe-card"
                onClick={() => setSelectedRecipe(recipe)}
              >
                <h3>{recipe.title}</h3>
                <p className="recipe-description">{recipe.description}</p>
                <div className="recipe-meta">
                  <span>⏱ {recipe.totalTime} min</span>
                  <span>🍽 {recipe.servings} servings</span>
                </div>
                <div className="recipe-categories">
                  {recipe.categories.slice(0, 3).map((cat, idx) => (
                    <span key={idx} className="category-tag">
                      {cat}
                    </span>
                  ))}
                </div>
                <p className="recipe-card-hint">Click to view full recipe</p>
              </div>
            ))}
          </div>
        </section>

        <ShoppingList
          initialNeedToShop={needToShop}
          initialMayHaveOnHand={mayHaveOnHand}
          recipeCount={recipes.length}
        />
      </main>

      {selectedRecipe && (
        <RecipeDetail recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
      )}
    </div>
  );
}

export default Demo;
