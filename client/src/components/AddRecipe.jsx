import { useState } from 'react';
import './AddRecipe.css';

function AddRecipe({ onClose, onRecipeAdded }) {
  const [recipeText, setRecipeText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!recipeText.trim()) {
      setError('Please paste some recipe text');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // TODO: Call backend API to extract recipe with Claude
      // For now, just show that we received the text
      console.log('Recipe text:', recipeText);

      // Placeholder: would call API here
      // const response = await fetch('/api/recipes/extract', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ text: recipeText })
      // });

      alert('Recipe extraction coming soon! For now, this is just the UI.');
      onClose();
    } catch (err) {
      setError('Failed to process recipe. Please try again.');
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
      onClose();
    } catch (err) {
      setError('Failed to process PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content add-recipe-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        <h2>Add Recipe</h2>

        <form onSubmit={handleSubmit}>
          <div className="input-section">
            <label htmlFor="recipe-text">Paste Recipe Text</label>
            <textarea
              id="recipe-text"
              value={recipeText}
              onChange={e => setRecipeText(e.target.value)}
              placeholder="Paste your recipe here... (title, ingredients, directions)"
              rows={10}
              disabled={isProcessing}
            />
          </div>

          <div className="divider">
            <span>OR</span>
          </div>

          <div className="input-section">
            <label htmlFor="recipe-pdf">Upload PDF</label>
            <input
              id="recipe-pdf"
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              disabled={isProcessing}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="button-group">
            <button type="button" onClick={onClose} className="cancel-button" disabled={isProcessing}>
              Cancel
            </button>
            <button type="submit" className="submit-button" disabled={isProcessing || !recipeText.trim()}>
              {isProcessing ? 'Processing...' : 'Extract Recipe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddRecipe;
