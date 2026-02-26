import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createRecipe, updateRecipe, checkDuplicate } from '../services/api';
import { toSnakeCase, fetchAPI, uploadFile } from '../utils/recipeImport';
import './AddRecipePage.css';

function AddRecipePage() {
  const navigate = useNavigate();
  const [recipeText, setRecipeText] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [inputMethod, setInputMethod] = useState('url');
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState(null); // status banner text
  const [error, setError] = useState(null);
  const [added, setAdded] = useState(null); // { id, title }
  const [duplicateMatches, setDuplicateMatches] = useState(null);
  const [pendingRecipe, setPendingRecipe] = useState(null);
  const photoInputRef = useRef(null);

  const doSave = async (data, title) => {
    const saved = await createRecipe(data);
    setAdded({ id: saved.id, title });
    setUrlInput('');
    setRecipeText('');
    setDuplicateMatches(null);
    setPendingRecipe(null);
  };

  const saveRecipe = async (parsed, source, sourceType) => {
    const data = toSnakeCase({ ...parsed, source, source_type: sourceType });

    // Check for duplicates before saving
    const { duplicates } = await checkDuplicate(parsed.title);
    if (duplicates.length > 0) {
      setDuplicateMatches(duplicates);
      setPendingRecipe({ data, title: parsed.title });
      return;
    }

    await doSave(data, parsed.title);
  };

  const handleAddAnyway = async () => {
    if (!pendingRecipe) return;
    setIsProcessing(true);
    setError(null);
    try {
      await doSave(pendingRecipe.data, pendingRecipe.title);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelDuplicate = () => {
    setDuplicateMatches(null);
    setPendingRecipe(null);
  };

  const handleReplace = async (existingId) => {
    if (!pendingRecipe) return;
    setIsProcessing(true);
    setError(null);
    try {
      await updateRecipe(existingId, pendingRecipe.data);
      setAdded({ id: existingId, title: pendingRecipe.title });
      setUrlInput('');
      setRecipeText('');
      setDuplicateMatches(null);
      setPendingRecipe(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUrlSubmit = async e => {
    e.preventDefault();
    if (!urlInput.trim()) {
      setError('Please enter a recipe URL');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setAdded(null);
    setStatus('Fetching recipe from URL...');

    try {
      const data = await fetchAPI('/api/recipes/url', { url: urlInput });
      setStatus(`Found "${data.title}" — saving...`);
      await saveRecipe(data, urlInput, 'url');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
      setStatus(null);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!recipeText.trim()) {
      setError('Please paste some recipe text');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setAdded(null);
    setStatus('Extracting recipe from text...');

    try {
      const data = await fetchAPI('/api/recipes/parse', { text: recipeText });
      setStatus(`Found "${data.title}" — saving...`);
      await saveRecipe(data, 'Manual', 'paste');
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

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setAdded(null);
    setStatus('Extracting recipe from photo...');

    try {
      const parsed = await uploadFile('/api/recipes/photo', file);
      setStatus(`Found "${parsed.title}" — saving...`);
      await saveRecipe(parsed, 'Photo', 'photo');
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

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setAdded(null);
    setStatus('Extracting recipe from PDF...');

    try {
      const parsed = await uploadFile('/api/recipes/pdf', file);
      setStatus(`Found "${parsed.title}" — saving...`);
      await saveRecipe(parsed, 'PDF', 'pdf');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
      setStatus(null);
    }
  };

  return (
    <div className="add-recipe-page">
      <div className="add-recipe-container">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back
        </button>

        <header className="add-recipe-header">
          <h1>Add Recipe</h1>
          <p>Choose how you'd like to add your recipe</p>
        </header>

        {status && (
          <div className="status-message">{status}</div>
        )}

        {added && (
          <div className="success-message">
            Added <Link to={`/recipe/${added.id}`}>{added.title}</Link>
          </div>
        )}

        {duplicateMatches && (
          <div className="duplicate-warning">
            <div className="duplicate-warning-header">
              <p className="duplicate-warning-title">Similar recipe found</p>
              <button
                type="button"
                className="duplicate-close"
                onClick={handleCancelDuplicate}
                aria-label="Dismiss"
              >&times;</button>
            </div>
            {duplicateMatches.map(d => (
              <div key={d.id} className="duplicate-match">
                <Link to={`/recipe/${d.id}`} className="duplicate-match-title">{d.title}</Link>
                <div className="duplicate-match-actions">
                  <button
                    type="button"
                    className="duplicate-action replace-button"
                    onClick={() => handleReplace(d.id)}
                    disabled={isProcessing}
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    className="duplicate-action add-anyway-button"
                    onClick={handleAddAnyway}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Saving...' : 'Add as New'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="input-method-tabs">
          <button
            type="button"
            className={`tab ${inputMethod === 'url' ? 'active' : ''}`}
            onClick={() => setInputMethod('url')}
          >
            URL
          </button>
          <button
            type="button"
            className={`tab ${inputMethod === 'photo' ? 'active' : ''}`}
            onClick={() => setInputMethod('photo')}
          >
            Photo
          </button>
          <button
            type="button"
            className={`tab ${inputMethod === 'pdf' ? 'active' : ''}`}
            onClick={() => setInputMethod('pdf')}
          >
            PDF
          </button>
          <button
            type="button"
            className={`tab ${inputMethod === 'text' ? 'active' : ''}`}
            onClick={() => setInputMethod('text')}
          >
            Paste
          </button>
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
              <button
                type="button"
                onClick={() => navigate('/')}
                className="cancel-button"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="submit-button"
                disabled={isProcessing || !urlInput.trim()}
              >
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

            <div className="button-group">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="cancel-button"
                disabled={isProcessing}
              >
                Cancel
              </button>
            </div>
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

            <div className="button-group">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="cancel-button"
                disabled={isProcessing}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {inputMethod === 'text' && (
          <form onSubmit={handleSubmit}>
            <div className="input-section">
              <label htmlFor="recipe-text">Recipe Text</label>
              <textarea
                id="recipe-text"
                value={recipeText}
                onChange={e => setRecipeText(e.target.value)}
                placeholder="Paste or type your recipe here...&#10;&#10;Include title, ingredients, and directions"
                rows={15}
                disabled={isProcessing}
              />
              <p className="input-hint">Copy from anywhere or write your own recipe</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="button-group">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="cancel-button"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="submit-button"
                disabled={isProcessing || !recipeText.trim()}
              >
                {isProcessing ? 'Processing...' : 'Extract Recipe'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default AddRecipePage;
