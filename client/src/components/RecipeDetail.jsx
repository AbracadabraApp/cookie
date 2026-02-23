import { formatIngredient } from '../utils/shoppingListUtils';
import './RecipeDetail.css';

function RecipeDetail({ recipe, onClose }) {
  if (!recipe) return null;

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
          <ul className="ingredients-list">
            {recipe.ingredients.map(ing => (
              <li key={ing.id}>{formatIngredient(ing)}</li>
            ))}
          </ul>
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
