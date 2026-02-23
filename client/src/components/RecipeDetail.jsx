import { useState } from 'react';
import { formatIngredientForRecipe, isLikelyInPantry } from '../utils/shoppingListUtils';
import './RecipeDetail.css';

function RecipeDetail({ recipe, onClose, onAddToShoppingList }) {
  if (!recipe) return null;

  const [checkedIngredients, setCheckedIngredients] = useState(() => {
    // AI guess: check items that are likely already in pantry
    const likelyHave = new Set();
    recipe.ingredients.forEach(ing => {
      if (isLikelyInPantry(ing)) {
        likelyHave.add(ing.id);
      }
    });
    return likelyHave;
  });

  const handleIngredientToggle = ingredientId => {
    setCheckedIngredients(prev => {
      const next = new Set(prev);
      if (next.has(ingredientId)) {
        next.delete(ingredientId);
      } else {
        next.add(ingredientId);
      }
      return next;
    });
  };

  const handleMakingThis = () => {
    // Add ALL ingredients with their have/need status for learning
    const itemsToAdd = recipe.ingredients.map(ing => ({
      ingredientId: ing.id,
      name: ing.name,
      quantity: ing.quantity,
      unit: ing.unit,
      notes: ing.notes,
      recipeTitle: recipe.title,
      recipeId: recipe.id,
      userHas: checkedIngredients.has(ing.id), // Track if user said they have it
      checked: false, // Not yet purchased (for shopping list checkbox)
    }));

    onAddToShoppingList(itemsToAdd);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        <header className="recipe-detail-header">
          <h2>{recipe.title}</h2>
          {recipe.source && <p className="recipe-source">Source: {recipe.source}</p>}
        </header>

        {recipe.description && (
          <p className="recipe-detail-description">{recipe.description}</p>
        )}

        <div className="recipe-detail-meta">
          {recipe.prepTime && <span>⏱ Prep: {recipe.prepTime} min</span>}
          {recipe.cookTime && <span>🔥 Cook: {recipe.cookTime} min</span>}
          {recipe.totalTime && <span>⏲ Total: {recipe.totalTime} min</span>}
          {recipe.servings && <span>🍽 Servings: {recipe.servings}</span>}
        </div>

        {recipe.notes && (
          <div className="recipe-notes">
            <strong>Notes:</strong> {recipe.notes}
          </div>
        )}

        <section className="recipe-detail-section">
          <h3>Ingredients</h3>
          <p className="ingredients-instruction">
            ✓ Check items you already have • Unchecked items will be added to your shopping list
          </p>
          <ul className="ingredients-list">
            {recipe.ingredients.map(ing => (
              <li key={ing.id} className="ingredient-item-detail">
                <label>
                  <input
                    type="checkbox"
                    checked={checkedIngredients.has(ing.id)}
                    onChange={() => handleIngredientToggle(ing.id)}
                  />
                  <span className="ingredient-text">{formatIngredientForRecipe(ing)}</span>
                </label>
              </li>
            ))}
          </ul>
          <button className="making-this-button" onClick={handleMakingThis}>
            I'm Making This
          </button>
        </section>

        <section className="recipe-detail-section">
          <h3>Directions</h3>
          <ol className="directions-list">
            {recipe.directions.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ol>
        </section>

        {recipe.categories && recipe.categories.length > 0 && (
          <section className="recipe-detail-section">
            <h3>Categories</h3>
            <div className="recipe-categories">
              {recipe.categories.map((cat, idx) => (
                <span key={idx} className="category-tag">
                  {cat}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default RecipeDetail;
