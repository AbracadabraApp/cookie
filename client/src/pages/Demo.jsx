import { useMemo } from 'react';
import { recipes } from '../data/recipes';
import { consolidateShoppingList } from '../utils/shoppingListUtils';
import ShoppingList from '../components/ShoppingList';
import './Demo.css';

function Demo() {
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
              <div key={recipe.id} className="recipe-card">
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
    </div>
  );
}

export default Demo;
