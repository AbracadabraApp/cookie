import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRecipe, updateRecipe } from '../services/api';
import { toSnakeCase, fetchAPI, uploadFile } from '../utils/recipeImport';
import './AddRecipePage.css';

function ImportRecipePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recipeText, setRecipeText] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [inputMethod, setInputMethod] = useState('url');
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const photoInputRef = useRef(null);

  useEffect(() => {
    getRecipe(id)
      .then(data => { setRecipe(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const saveImport = async (parsed, source, sourceType) => {
    const data = toSnakeCase({ ...parsed, source, source_type: sourceType });
    await updateRecipe(id, data);
    navigate(`/recipe/${id}`);
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
      await saveImport(data, urlInput, 'url');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
      setStatus(null);
    }
  };

  const handleSubmit = async e => {
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

  if (loading) {
    return (
      <div className="add-recipe-page">
        <div className="add-recipe-container">
          <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="add-recipe-page">
        <div className="add-recipe-container">
          <button className="back-button" onClick={() => navigate('/')}>← Back</button>
          <p>Recipe not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="add-recipe-page">
      <div className="add-recipe-container">
        <button className="back-button" onClick={() => navigate(`/recipe/${id}`)}>
          ← Back
        </button>

        <header className="add-recipe-header">
          <h1>Import: {recipe.title}</h1>
          <p>Choose how you'd like to import this recipe</p>
        </header>

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
              <button type="button" onClick={() => navigate(`/recipe/${id}`)} className="cancel-button" disabled={isProcessing}>Cancel</button>
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
            <div className="button-group">
              <button type="button" onClick={() => navigate(`/recipe/${id}`)} className="cancel-button" disabled={isProcessing}>Cancel</button>
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
              <button type="button" onClick={() => navigate(`/recipe/${id}`)} className="cancel-button" disabled={isProcessing}>Cancel</button>
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
                placeholder={'Paste or type your recipe here...\n\nInclude ingredients and directions'}
                rows={15}
                disabled={isProcessing}
              />
              <p className="input-hint">Copy from anywhere or write your own recipe</p>
            </div>
            {error && <div className="error-message">{error}</div>}
            <div className="button-group">
              <button type="button" onClick={() => navigate(`/recipe/${id}`)} className="cancel-button" disabled={isProcessing}>Cancel</button>
              <button type="submit" className="submit-button" disabled={isProcessing || !recipeText.trim()}>
                {isProcessing ? 'Processing...' : 'Extract Recipe'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ImportRecipePage;
