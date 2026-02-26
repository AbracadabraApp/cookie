import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useRecipes } from './hooks/useRecipes';
import { useUserRecipeState } from './hooks/useUserRecipeState';
import { useIngredientState } from './hooks/useIngredientState';
import { useRecipeCache } from './hooks/useRecipeCache';
import { useComputedShoppingList } from './hooks/useComputedShoppingList';
import { useManualItems } from './hooks/useManualItems';
import Demo from './pages/Demo';
import RecipeDetailPage from './pages/RecipeDetailPage';
import AddRecipePage from './pages/AddRecipePage';
import EditRecipePage from './pages/EditRecipePage';
import ImportRecipePage from './pages/ImportRecipePage';
import './App.css';

function App() {
  const { recipes, loading, error } = useRecipes();
  const { orderedRecipes, checkedRecipes, toggleChecked, reorder } = useUserRecipeState(recipes);
  const { haveIngredients, toggleHave, clearForRecipe } = useIngredientState();
  const { cache: recipeCache, prefetchRecipe } = useRecipeCache();
  const { needItems, haveItems } = useComputedShoppingList(checkedRecipes, recipeCache, haveIngredients);
  const { manualItems, addItem: addManualItem, toggleItem: toggleManualItem } = useManualItems();

  // Eagerly fetch full details for checked recipes
  useEffect(() => {
    for (const recipeId of checkedRecipes) {
      prefetchRecipe(recipeId);
    }
  }, [checkedRecipes, prefetchRecipe]);

  const handleToggleChecked = (recipeId) => {
    // If unchecking, clear have-state for that recipe's ingredients
    if (checkedRecipes.has(recipeId)) {
      const cached = recipeCache.get(recipeId);
      if (cached && cached.ingredients) {
        clearForRecipe(cached.ingredients.map(i => i.id));
      }
    }
    toggleChecked(recipeId);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Demo
              orderedRecipes={orderedRecipes}
              checkedRecipes={checkedRecipes}
              onToggleChecked={handleToggleChecked}
              needItems={needItems}
              haveItems={haveItems}
              manualItems={manualItems}
              onAddManualItem={addManualItem}
              onToggleManualItem={toggleManualItem}
              onToggleHave={toggleHave}
              onReorder={reorder}
              loading={loading}
              error={error}
            />
          }
        />
        <Route
          path="/recipe/:id"
          element={
            <RecipeDetailPage
              haveIngredients={haveIngredients}
              onToggleHave={toggleHave}
            />
          }
        />
        <Route path="/add-recipe" element={<AddRecipePage />} />
        <Route path="/recipe/:id/edit" element={<EditRecipePage />} />
        <Route path="/recipe/:id/import" element={<ImportRecipePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
