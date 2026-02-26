import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getRecipe } from '../services/api';
import { formatIngredientForRecipe } from '../utils/shoppingListUtils';
import './RecipeDetailPage.css';

function RecipeDetailPage({ haveIngredients, onToggleHave }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getRecipe(id)
      .then(data => {
        if (!cancelled) {
          setRecipe(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="recipe-detail-page">
        <div className="recipe-detail-container">
          <button className="back-button" onClick={() => navigate('/')}>
            ← Back
          </button>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="recipe-detail-page">
        <div className="recipe-detail-container">
          <button className="back-button" onClick={() => navigate('/')}>
            ← Back
          </button>
          <p>Recipe not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recipe-detail-page">
      <div className="recipe-detail-container">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back
        </button>

        <header className="recipe-header">
          <div className="recipe-title-row">
            <h1>{recipe.title}</h1>
            <Link to={`/recipe/${id}/edit`} className="edit-link">Edit</Link>
          </div>
          {recipe.source && <span className="recipe-source-tag">{recipe.source}</span>}
        </header>

        {recipe.description && (
          <p className="recipe-description">{recipe.description}</p>
        )}

        <div className="recipe-meta">
          {recipe.prep_time && <span>Prep: {recipe.prep_time} min</span>}
          {recipe.cook_time && <span>Cook: {recipe.cook_time} min</span>}
          {recipe.total_time && <span>Total: {recipe.total_time} min</span>}
          {recipe.servings && <span>Servings: {recipe.servings}</span>}
        </div>

        {recipe.notes && (
          <div className="recipe-notes">
            <strong>Notes:</strong> {recipe.notes}
          </div>
        )}

        <section className="recipe-section">
          <h2>Ingredients</h2>
          {recipe.ingredients && recipe.ingredients.length > 0 ? (
            <>
              <ul className="ingredients-list">
                {recipe.ingredients.map(ing => (
                  <li key={ing.id} className="ingredient-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={haveIngredients.has(ing.id)}
                        onChange={() => onToggleHave(ing.id)}
                      />
                      <span className="ingredient-text">{formatIngredientForRecipe(ing)}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="empty-state">No ingredients yet</p>
          )}
        </section>

        {recipe.directions && recipe.directions.length > 0 && (
          <section className="recipe-section">
            <h2>Directions</h2>
            <ol className="directions-list">
              {recipe.directions.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </section>
        )}

        {recipe.categories && recipe.categories.length > 0 && (
          <section className="recipe-section">
            <h2>Categories</h2>
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

export default RecipeDetailPage;
