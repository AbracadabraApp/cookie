import { useState } from 'react';
import { recipes } from '../data/recipes';
import { isLikelyInPantry } from '../utils/shoppingListUtils';
import ShoppingList from '../components/ShoppingList';
import RecipeDetail from '../components/RecipeDetail';
import AddRecipe from '../components/AddRecipe';
import './Demo.css';

function Demo() {
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [shoppingListItems, setShoppingListItems] = useState(() => {
    const saved = localStorage.getItem('cookie-shopping-list-items');
    return saved ? JSON.parse(saved) : [];
  });

  const handleAddToShoppingList = newItems => {
    setShoppingListItems(prev => {
      const updated = [...prev];

      // Add new items, avoiding duplicates by ingredient id
      newItems.forEach(newItem => {
        if (!updated.find(item => item.ingredientId === newItem.ingredientId)) {
          updated.push(newItem);
        }
      });

      // Save to localStorage
      localStorage.setItem('cookie-shopping-list-items', JSON.stringify(updated));
      return updated;
    });
  };

  const handleUpdateShoppingList = updatedItems => {
    setShoppingListItems(updatedItems);
    localStorage.setItem('cookie-shopping-list-items', JSON.stringify(updatedItems));
  };

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
            <button className="add-recipe-button" onClick={() => setShowAddRecipe(true)}>
              + Add Recipe
            </button>
          </div>
          <div className="recipe-cards">
            {recipes.map(recipe => {
              const shopCount = recipe.ingredients.filter(
                ing => !isLikelyInPantry(ing)
              ).length;
              const haveCount = recipe.ingredients.filter(ing =>
                isLikelyInPantry(ing)
              ).length;

              return (
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
                </div>
              );
            })}
          </div>
        </section>

        <ShoppingList items={shoppingListItems} onUpdateItems={handleUpdateShoppingList} />
      </main>

      {selectedRecipe && (
        <RecipeDetail
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          onAddToShoppingList={handleAddToShoppingList}
        />
      )}

      {showAddRecipe && (
        <AddRecipe
          onClose={() => setShowAddRecipe(false)}
          onRecipeAdded={() => {
            // TODO: Reload recipes from localStorage
            setShowAddRecipe(false);
          }}
        />
      )}
    </div>
  );
}

export default Demo;
