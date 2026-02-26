import { useState, useRef, useCallback } from 'react';
// useRef still needed for drag
import { Link } from 'react-router-dom';
import ShoppingList from '../components/ShoppingList';
import './Demo.css';

function Demo({
  orderedRecipes,
  checkedRecipes,
  onToggleChecked,
  needItems,
  haveItems,
  manualItems,
  onAddManualItem,
  onToggleManualItem,
  onToggleHave,
  onReorder,
  loading,
  error,
}) {
  const [view, setView] = useState('list');
  const [activeCategory, setActiveCategory] = useState(null);

  // Collect all unique categories from recipes
  const allCategories = [...new Set(
    orderedRecipes.flatMap(r => r.categories || [])
  )].sort();

  // Drag state
  const [dragIdx, setDragIdx] = useState(null);
  const [overIdx, setOverIdx] = useState(null);
  const dragStartY = useRef(0);
  const dragNodeRef = useRef(null);

  // Drag handlers via pointer events (works for both touch and mouse)
  const handleDragStart = useCallback((e, idx) => {
    e.preventDefault();
    dragStartY.current = e.clientY;
    dragNodeRef.current = e.currentTarget.closest('.recipe-row');
    setDragIdx(idx);
    setOverIdx(idx);

    const handleMove = (moveEvent) => {
      const rows = document.querySelectorAll('.recipe-row');
      const y = moveEvent.clientY || (moveEvent.touches && moveEvent.touches[0]?.clientY);
      if (y == null) return;

      for (let i = 0; i < rows.length; i++) {
        const rect = rows[i].getBoundingClientRect();
        if (y >= rect.top && y <= rect.bottom) {
          setOverIdx(i);
          break;
        }
      }
    };

    const handleEnd = () => {
      setDragIdx(prev => {
        setOverIdx(overTarget => {
          if (prev !== null && overTarget !== null && prev !== overTarget) {
            const newOrder = orderedRecipes.map(r => r.id);
            const [moved] = newOrder.splice(prev, 1);
            newOrder.splice(overTarget, 0, moved);
            onReorder(newOrder);
          }
          return null;
        });
        return null;
      });
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerup', handleEnd);
      document.removeEventListener('pointercancel', handleEnd);
    };

    document.addEventListener('pointermove', handleMove);
    document.addEventListener('pointerup', handleEnd);
    document.addEventListener('pointercancel', handleEnd);
  }, [orderedRecipes, onReorder]);

  // Compute display order during drag
  const displayRecipes = (() => {
    let recipes = orderedRecipes;
    if (activeCategory) {
      recipes = recipes.filter(r => r.categories?.includes(activeCategory));
    }
    if (dragIdx === null || overIdx === null || dragIdx === overIdx) {
      return recipes;
    }
    const arr = [...recipes];
    const [moved] = arr.splice(dragIdx, 1);
    arr.splice(overIdx, 0, moved);
    return arr;
  })();

  return (
    <div className="demo-page">
      <header className="demo-header">
        <nav className="view-nav">
          <button
            className={`view-nav-item${view === 'list' ? ' active' : ''}`}
            onClick={() => setView('list')}
          >
            {view === 'list' && <span className="view-nav-tri">▾</span>}List
          </button>
          <span className="view-nav-divider">|</span>
          <button
            className={`view-nav-item${view === 'recipes' ? ' active' : ''}`}
            onClick={() => setView('recipes')}
          >
            {view === 'recipes' && <span className="view-nav-tri">▾</span>}Recipes
          </button>
        </nav>
        {view === 'recipes' && (
          <Link to="/add-recipe" className="header-add-link">+ Add</Link>
        )}
      </header>

      <main className="demo-main">
        {view === 'list' ? (
          <ShoppingList
            needItems={needItems}
            haveItems={haveItems}
            manualItems={manualItems}
            onAddManualItem={onAddManualItem}
            onToggleManualItem={onToggleManualItem}
            onToggleHave={onToggleHave}
          />
        ) : loading ? (
          <p className="loading-text">Loading recipes...</p>
        ) : error ? (
          <p className="error-text">Failed to load recipes</p>
        ) : (
          <div className="recipes-section">
            {allCategories.length > 0 && (
              <div className="category-filters">
                {allCategories.map(cat => (
                  <button
                    key={cat}
                    className={`category-chip${activeCategory === cat ? ' active' : ''}`}
                    onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
            {displayRecipes.map((recipe, idx) => (
              <div
                key={recipe.id}
                className={`recipe-row${dragIdx !== null && overIdx === idx ? ' drag-over' : ''}${dragIdx !== null && dragIdx === idx && overIdx === idx ? ' dragging' : ''}`}
              >
                <button
                  className={`recipe-checkbox${checkedRecipes.has(recipe.id) ? ' checked' : ''}`}
                  onClick={() => onToggleChecked(recipe.id)}
                  aria-label={`Mark ${recipe.title} as ${checkedRecipes.has(recipe.id) ? 'unchecked' : 'checked'}`}
                />
                <Link
                  to={`/recipe/${recipe.id}`}
                  className="recipe-title"
                >
                  {recipe.title}
                </Link>
                <span
                  className="recipe-grip"
                  onPointerDown={e => handleDragStart(e, idx)}
                  style={{ touchAction: 'none', cursor: 'grab' }}
                >⠿</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Demo;
