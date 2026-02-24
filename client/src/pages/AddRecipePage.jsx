import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddRecipePage.css';

function AddRecipePage() {
  const navigate = useNavigate();
  const [recipeText, setRecipeText] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [inputMethod, setInputMethod] = useState('url'); // 'url', 'pdf', 'text'
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleUrlSubmit = async e => {
    e.preventDefault();
    if (!urlInput.trim()) {
      setError('Please enter a recipe URL');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3000/api/recipes/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recipe from URL');
      }

      const data = await response.json();
      console.log('Recipe extracted:', data);

      alert(`Recipe "${data.data.title}" extracted successfully! (Backend integration complete - just needs to be saved to database)`);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to fetch recipe. Please check the URL and try again.');
    } finally {
      setIsProcessing(false);
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

    try {
      const response = await fetch('http://localhost:3000/api/recipes/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: recipeText })
      });

      if (!response.ok) {
        throw new Error('Failed to parse recipe text');
      }

      const data = await response.json();
      console.log('Recipe parsed:', data);

      alert(`Recipe "${data.data.title}" parsed successfully! (Backend integration complete - just needs to be saved to database)`);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to process recipe. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async e => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // TODO: Call backend API to extract recipe from PDF
      console.log('PDF file:', file.name);

      alert('PDF extraction coming soon! For now, this is just the UI.');
      navigate('/');
    } catch (err) {
      setError('Failed to process PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="add-recipe-page">
      <div className="add-recipe-container">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back to Recipes
        </button>

        <header className="add-recipe-header">
          <h1>Add Recipe</h1>
          <p>Choose how you'd like to add your recipe</p>
        </header>

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
            className={`tab ${inputMethod === 'pdf' ? 'active' : ''}`}
            onClick={() => setInputMethod('pdf')}
          >
            Upload PDF
          </button>
          <button
            type="button"
            className={`tab ${inputMethod === 'text' ? 'active' : ''}`}
            onClick={() => setInputMethod('text')}
          >
            Paste or Write
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

        {inputMethod === 'pdf' && (
          <form>
            <div className="input-section">
              <label htmlFor="recipe-pdf">Upload PDF</label>
              <input
                id="recipe-pdf"
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                disabled={isProcessing}
              />
              <p className="input-hint">Choose a PDF file from your cookbook or saved recipes</p>
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
