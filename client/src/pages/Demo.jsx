import { useState } from 'react';
import { recipes } from '../data/recipes';
import { useShoppingListPersistence } from '../hooks/useShoppingListPersistence';
import { getIngredientCounts } from '../utils/recipeUtils';
import ShoppingList from '../components/ShoppingList';
import RecipeDetail from '../components/RecipeDetail';
import AddRecipe from '../components/AddRecipe';
import './Demo.css';

function Demo() {
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [shoppingListItems, setShoppingListItems] = useShoppingListPersistence();

  // Store user's ingredient preferences per recipe (persists across modal opens)
  const [recipeIngredientPrefs, setRecipeIngredientPrefs] = useState({});

  const handleAddToShoppingList = newItems => {
    const updated = [...shoppingListItems];

    // Add new items or update existing ones
    newItems.forEach(newItem => {
      const existingIndex = updated.findIndex(item => item.ingredientId === newItem.ingredientId);
      if (existingIndex >= 0) {
        // Update existing item (preserve checked state from newItem)
        updated[existingIndex] = { ...updated[existingIndex], ...newItem };
      } else {
        // Add new item
        updated.push(newItem);
      }
    });

    setShoppingListItems(updated);
  };

  const handleUpdateShoppingList = updatedItems => {
    setShoppingListItems(updatedItems);
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
              const { shopCount, haveCount } = getIngredientCounts(recipe);

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
          shoppingListItems={shoppingListItems}
          savedPreferences={recipeIngredientPrefs[selectedRecipe.id]}
          onPreferencesChange={(prefs) => {
            setRecipeIngredientPrefs(prev => ({
              ...prev,
              [selectedRecipe.id]: prefs
            }));
          }}
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
