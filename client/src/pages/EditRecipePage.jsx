import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRecipe } from '../services/api';
import { toCookbookQuantity } from '../utils/shoppingListUtils';
import './EditRecipePage.css';

const API_BASE = '/api';

function AutoTextarea({ value, onChange, placeholder, className }) {
  const ref = useRef(null);

  const resize = useCallback(() => {
    const el = ref.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    }
  }, []);

  useEffect(() => { resize(); }, [value, resize]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      rows={1}
      onInput={resize}
    />
  );
}

function EditRecipePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [source, setSource] = useState('');
  const [notes, setNotes] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [directions, setDirections] = useState([]);
  const [categories, setCategories] = useState('');

  useEffect(() => {
    getRecipe(id)
      .then(data => {
        setTitle(data.title || '');
        setDescription(data.description || '');
        setSource(data.source || '');
        setNotes(data.notes || '');
        setPrepTime(data.prep_time || '');
        setCookTime(data.cook_time || '');
        setServings(data.servings || '');
        setIngredients(
          data.ingredients?.length > 0
            ? data.ingredients.map(i => ({
                name: i.name,
                quantity: i.quantity != null ? toCookbookQuantity(Number(i.quantity)) : '',
                unit: i.unit || '',
                notes: i.notes || '',
              }))
            : [{ name: '', quantity: '', unit: '', notes: '' }]
        );
        setDirections(
          data.directions?.length > 0
            ? data.directions
            : ['']
        );
        setCategories(data.categories?.join(', ') || '');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const updateIngredient = (idx, field, value) => {
    setIngredients(prev => prev.map((ing, i) =>
      i === idx ? { ...ing, [field]: value } : ing
    ));
  };

  const addIngredient = () => {
    setIngredients(prev => [...prev, { name: '', quantity: '', unit: '', notes: '' }]);
  };

  const removeIngredient = (idx) => {
    setIngredients(prev => prev.filter((_, i) => i !== idx));
  };

  const updateDirection = (idx, value) => {
    setDirections(prev => prev.map((d, i) => i === idx ? value : d));
  };

  const addDirection = () => {
    setDirections(prev => [...prev, '']);
  };

  const removeDirection = (idx) => {
    setDirections(prev => prev.filter((_, i) => i !== idx));
  };

  // Parse cookbook-style quantity back to a number for the API
  const parseQuantity = (str) => {
    if (!str || !str.trim()) return null;
    const s = str.trim();

    // Try plain number first
    const num = Number(s);
    if (!isNaN(num)) return num;

    // Handle fractions like "1/2", "3/4"
    const fracMatch = s.match(/^(\d+)\/(\d+)$/);
    if (fracMatch) return Number(fracMatch[1]) / Number(fracMatch[2]);

    // Handle mixed like "1 1/2", "2 3/4"
    const mixedMatch = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
    if (mixedMatch) return Number(mixedMatch[1]) + Number(mixedMatch[2]) / Number(mixedMatch[3]);

    return null;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const body = {
      title: title.trim(),
      description: description.trim() || null,
      source: source.trim() || null,
      notes: notes.trim() || null,
      prep_time: prepTime ? Number(prepTime) : null,
      cook_time: cookTime ? Number(cookTime) : null,
      total_time: (prepTime || cookTime) ? (Number(prepTime || 0) + Number(cookTime || 0)) : null,
      servings: servings ? Number(servings) : null,
      ingredients: ingredients
        .filter(i => i.name.trim())
        .map(i => ({
          name: i.name.trim(),
          quantity: parseQuantity(i.quantity),
          unit: i.unit.trim() || null,
          notes: i.notes.trim() || null,
        })),
      directions: directions.filter(d => d.trim()),
      categories: categories
        .split(',')
        .map(c => c.trim())
        .filter(Boolean),
    };

    try {
      const res = await fetch(`${API_BASE}/recipes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error?.message || `Save failed (${res.status})`);
      }
      navigate(`/recipe/${id}`);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-recipe-page">
        <div className="edit-recipe-container">
          <button className="back-button" onClick={() => navigate(`/recipe/${id}`)}>← Back</button>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-recipe-page">
      <div className="edit-recipe-container">
        <button className="back-button" onClick={() => navigate(`/recipe/${id}`)}>← Back</button>

        <h1>Edit Recipe</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSave}>
          <div className="form-field">
            <label htmlFor="edit-title">Title</label>
            <input
              id="edit-title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="edit-desc">Description</label>
            <AutoTextarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief description"
            />
          </div>

          <div className="form-field">
            <label htmlFor="edit-source">Source</label>
            <input
              id="edit-source"
              type="text"
              value={source}
              onChange={e => setSource(e.target.value)}
              placeholder="URL, book, or Manual"
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="edit-prep">Prep (min)</label>
              <input id="edit-prep" type="number" value={prepTime} onChange={e => setPrepTime(e.target.value)} />
            </div>
            <div className="form-field">
              <label htmlFor="edit-cook">Cook (min)</label>
              <input id="edit-cook" type="number" value={cookTime} onChange={e => setCookTime(e.target.value)} />
            </div>
            <div className="form-field">
              <label htmlFor="edit-servings">Servings</label>
              <input id="edit-servings" type="number" value={servings} onChange={e => setServings(e.target.value)} />
            </div>
          </div>

          <div className="form-section">
            <label>Ingredients</label>
            {ingredients.map((ing, idx) => (
              <div key={idx} className="ingredient-row">
                <input
                  type="text"
                  placeholder="Qty"
                  value={ing.quantity}
                  onChange={e => updateIngredient(idx, 'quantity', e.target.value)}
                  className="ing-qty"
                />
                <input
                  type="text"
                  placeholder="Unit"
                  value={ing.unit}
                  onChange={e => updateIngredient(idx, 'unit', e.target.value)}
                  className="ing-unit"
                />
                <input
                  type="text"
                  placeholder="Ingredient"
                  value={ing.name}
                  onChange={e => updateIngredient(idx, 'name', e.target.value)}
                  className="ing-name"
                />
                <button type="button" className="remove-btn" onClick={() => removeIngredient(idx)}>×</button>
              </div>
            ))}
            <button type="button" className="add-btn" onClick={addIngredient}>+ Ingredient</button>
          </div>

          <div className="form-section">
            <label>Directions</label>
            {directions.map((step, idx) => (
              <div key={idx} className="direction-row">
                <span className="step-num">{idx + 1}.</span>
                <AutoTextarea
                  value={step}
                  onChange={e => updateDirection(idx, e.target.value)}
                  placeholder="Step instruction"
                />
                <button type="button" className="remove-btn" onClick={() => removeDirection(idx)}>×</button>
              </div>
            ))}
            <button type="button" className="add-btn" onClick={addDirection}>+ Step</button>
          </div>

          <div className="form-field">
            <label htmlFor="edit-cats">Categories (comma-separated)</label>
            <input
              id="edit-cats"
              type="text"
              value={categories}
              onChange={e => setCategories(e.target.value)}
              placeholder="Italian, Pasta, Dinner"
            />
          </div>

          <div className="form-field">
            <label htmlFor="edit-notes">Notes</label>
            <AutoTextarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Cooking tips..."
            />
          </div>

          <div className="button-group">
            <button type="button" className="cancel-button" onClick={() => navigate(`/recipe/${id}`)}>
              Cancel
            </button>
            <button type="submit" className="submit-button" disabled={saving || !title.trim()}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditRecipePage;
