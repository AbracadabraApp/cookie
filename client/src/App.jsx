import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useShoppingListPersistence } from './hooks/useShoppingListPersistence';
import Demo from './pages/Demo';
import RecipeDetailPage from './pages/RecipeDetailPage';
import AddRecipePage from './pages/AddRecipePage';
import './App.css';

function App() {
  const [shoppingListItems, setShoppingListItems] = useShoppingListPersistence();
  const [recipeIngredientPrefs, setRecipeIngredientPrefs] = useState({});

  const handleAddToShoppingList = newItems => {
    const updated = [...shoppingListItems];

    // Add new items or update existing ones
    newItems.forEach(newItem => {
      const existingIndex = updated.findIndex(item => item.ingredientId === newItem.ingredientId);
      if (existingIndex >= 0) {
        // Update existing item (preserve checked state from newItem)
        updated[existingIndex] = { ...updated[existingIndex], ...newItem };
      } else {
        // Add new item
        updated.push(newItem);
      }
    });

    setShoppingListItems(updated);
  };

  const handleUpdateShoppingList = updatedItems => {
    setShoppingListItems(updatedItems);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Demo
              shoppingListItems={shoppingListItems}
              onAddToShoppingList={handleAddToShoppingList}
              onUpdateShoppingList={handleUpdateShoppingList}
            />
          }
        />
        <Route
          path="/recipe/:id"
          element={
            <RecipeDetailPage
              shoppingListItems={shoppingListItems}
              onAddToShoppingList={handleAddToShoppingList}
              savedPreferences={null}
              onPreferencesChange={(prefs) => {
                // TODO: Get recipe ID from URL params
                setRecipeIngredientPrefs(prev => ({
                  ...prev,
                  // [recipeId]: prefs
                }));
              }}
            />
          }
        />
        <Route path="/add-recipe" element={<AddRecipePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
