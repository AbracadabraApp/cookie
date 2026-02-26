import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getRecipe, updateRecipe, deleteRecipe } from '../services/api';
import { toSnakeCase, fetchAPI, uploadFile } from '../utils/recipeImport';
import { formatIngredientForRecipe } from '../utils/shoppingListUtils';
import './RecipeDetailPage.css';

function RecipeDetailPage({ haveIngredients, onToggleHave }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  // Import state (for empty recipes)
  const [inputMethod, setInputMethod] = useState('url');
  const [urlInput, setUrlInput] = useState('');
  const [recipeText, setRecipeText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const photoInputRef = useRef(null);

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

  const isEmpty = recipe && !recipe.ingredients?.length && !recipe.directions?.length;

  const saveImport = async (parsed, source, sourceType) => {
    const data = toSnakeCase({ ...parsed, source, source_type: sourceType });
    await updateRecipe(id, data);
    const updated = await getRecipe(id);
    setRecipe(updated);
    setUrlInput('');
    setRecipeText('');
  };

  const handleUrlSubmit = async e => {
    e.preventDefault();
    if (!urlInput.trim()) { setError('Please enter a recipe URL'); return; }
    setIsProcessing(true);
    setError(null);
    setStatus('Fetching recipe from URL...');
    try {
      const data = await fetchAPI('/api/recipes/url', { url: urlInput });
      setStatus(`Found "${data.title}" — saving...`);
      await saveImport(data, 'NY Times Top 50', 'url');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
      setStatus(null);
    }
  };

  const handleTextSubmit = async e => {
    e.preventDefault();
    if (!recipeText.trim()) { setError('Please paste some recipe text'); return; }
    setIsProcessing(true);
    setError(null);
    setStatus('Extracting recipe from text...');
    try {
      const data = await fetchAPI('/api/recipes/parse', { text: recipeText });
      setStatus(`Found "${data.title}" — saving...`);
      await saveImport(data, 'Manual', 'paste');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
      setStatus(null);
    }
  };

  const handlePhotoUpload = async e => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please select an image file'); return; }
    setIsProcessing(true);
    setError(null);
    setStatus('Extracting recipe from photo...');
    try {
      const parsed = await uploadFile('/api/recipes/photo', file);
      setStatus(`Found "${parsed.title}" — saving...`);
      await saveImport(parsed, 'Photo', 'photo');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
      setStatus(null);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  const handlePdfUpload = async e => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { setError('Please upload a PDF file'); return; }
    setIsProcessing(true);
    setError(null);
    setStatus('Extracting recipe from PDF...');
    try {
      const parsed = await uploadFile('/api/recipes/pdf', file);
      setStatus(`Found "${parsed.title}" — saving...`);
      await saveImport(parsed, 'PDF', 'pdf');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
      setStatus(null);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteRecipe(id);
      navigate('/?view=recipes');
    } catch (err) {
      setError(err.message);
      setConfirmDelete(false);
    }
  };

  if (loading) {
    return (
      <div className="recipe-detail-page">
        <div className="recipe-detail-container">
          <button className="back-button" onClick={() => navigate('/?view=recipes')}>
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
          <button className="back-button" onClick={() => navigate('/?view=recipes')}>
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
        <button className="back-button" onClick={() => navigate('/?view=recipes')}>
          ← Back
        </button>

        <header className="recipe-header">
          <div className="recipe-title-row">
            <h1>{recipe.title}</h1>
            {isEmpty ? (
              confirmDelete ? (
                <div className="delete-confirm">
                  <button className="delete-confirm-yes" onClick={handleDelete}>Yes, delete</button>
                  <button className="delete-confirm-no" onClick={() => setConfirmDelete(false)}>Cancel</button>
                </div>
              ) : (
                <button className="edit-link" onClick={() => setConfirmDelete(true)}>Delete</button>
              )
            ) : (
              <Link to={`/recipe/${id}/edit`} className="edit-link">Edit</Link>
            )}
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

        {isEmpty ? (
          <section className="recipe-section">
            {status && (
              <div className="status-message">{status}</div>
            )}

            <div className="input-method-tabs">
              <button type="button" className={`tab ${inputMethod === 'url' ? 'active' : ''}`} onClick={() => setInputMethod('url')}>URL</button>
              <button type="button" className={`tab ${inputMethod === 'photo' ? 'active' : ''}`} onClick={() => setInputMethod('photo')}>Photo</button>
              <button type="button" className={`tab ${inputMethod === 'pdf' ? 'active' : ''}`} onClick={() => setInputMethod('pdf')}>PDF</button>
              <button type="button" className={`tab ${inputMethod === 'text' ? 'active' : ''}`} onClick={() => setInputMethod('text')}>Paste</button>
            </div>

            {inputMethod === 'url' && (
              <form onSubmit={handleUrlSubmit}>
                <div className="input-section">
                  <label htmlFor="recipe-url">Recipe URL</label>
                  <input
                    id="recipe-url"
                    type="url"
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                    placeholder="https://example.com/recipe"
                    disabled={isProcessing}
                    className="url-input"
                  />
                  <p className="input-hint">Paste a link from your favorite recipe website</p>
                </div>
                {error && <div className="error-message">{error}</div>}
                <div className="button-group">
                  <button type="submit" className="submit-button" disabled={isProcessing || !urlInput.trim()}>
                    {isProcessing ? 'Fetching...' : 'Fetch Recipe'}
                  </button>
                </div>
              </form>
            )}

            {inputMethod === 'photo' && (
              <form>
                <div className="input-section">
                  <label htmlFor="recipe-photo">Take or Choose Photo</label>
                  <input
                    ref={photoInputRef}
                    id="recipe-photo"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoUpload}
                    disabled={isProcessing}
                  />
                  <p className="input-hint">
                    {isProcessing ? 'Extracting recipe from photo...' : 'Take a photo of a recipe or choose from your gallery'}
                  </p>
                </div>
                {error && <div className="error-message">{error}</div>}
              </form>
            )}

            {inputMethod === 'pdf' && (
              <form>
                <div className="input-section">
                  <label htmlFor="recipe-pdf">Upload PDF</label>
                  <input
                    id="recipe-pdf"
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfUpload}
                    disabled={isProcessing}
                  />
                  <p className="input-hint">
                    {isProcessing ? 'Extracting recipe from PDF...' : 'Choose a PDF file from your cookbook or saved recipes'}
                  </p>
                </div>
                {error && <div className="error-message">{error}</div>}
              </form>
            )}

            {inputMethod === 'text' && (
              <form onSubmit={handleTextSubmit}>
                <div className="input-section">
                  <label htmlFor="recipe-text">Recipe Text</label>
                  <textarea
                    id="recipe-text"
                    value={recipeText}
                    onChange={e => setRecipeText(e.target.value)}
                    placeholder={'Paste or type your recipe here...\n\nInclude ingredients and directions'}
                    rows={15}
                    disabled={isProcessing}
                  />
                  <p className="input-hint">Copy from anywhere or write your own recipe</p>
                </div>
                {error && <div className="error-message">{error}</div>}
                <div className="button-group">
                  <button type="submit" className="submit-button" disabled={isProcessing || !recipeText.trim()}>
                    {isProcessing ? 'Processing...' : 'Extract Recipe'}
                  </button>
                </div>
              </form>
            )}
          </section>
        ) : (
          <>
            <section className="recipe-section">
              <h2>Ingredients</h2>
              {recipe.ingredients && recipe.ingredients.length > 0 ? (
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
              ) : (
                <p className="empty-state">No ingredients yet.</p>
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
          </>
        )}
      </div>
    </div>
  );
}

export default RecipeDetailPage;
