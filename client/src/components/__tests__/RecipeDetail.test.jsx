import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RecipeDetail from '../RecipeDetail';

const mockRecipe = {
  id: 1,
  title: 'Test Recipe',
  description: 'A test recipe description',
  source: 'Test Kitchen',
  notes: 'Some cooking notes',
  prepTime: 15,
  cookTime: 30,
  totalTime: 45,
  servings: 4,
  ingredients: [
    { id: 'ing-1', name: 'salt', quantity: 1, unit: 'teaspoon', notes: null },
    { id: 'ing-2', name: 'chicken breast', quantity: 2, unit: 'large', notes: 'boneless' },
    { id: 'ing-3', name: 'olive oil', quantity: 2, unit: 'tablespoons', notes: 'extra-virgin' }
  ],
  directions: [
    'Step 1: Prepare ingredients',
    'Step 2: Cook the chicken',
    'Step 3: Serve hot'
  ],
  categories: ['Dinner', 'Chicken', 'Quick']
};

describe('RecipeDetail', () => {
  describe('Rendering', () => {
    it('renders recipe title', () => {
      render(
        <RecipeDetail
          recipe={mockRecipe}
          onClose={vi.fn()}
          onAddToShoppingList={vi.fn()}
        />
      );

      expect(screen.getByText('Test Recipe')).toBeInTheDocument();
    });

    it('renders recipe description', () => {
      render(
        <RecipeDetail
          recipe={mockRecipe}
          onClose={vi.fn()}
          onAddToShoppingList={vi.fn()}
        />
      );

      expect(screen.getByText('A test recipe description')).toBeInTheDocument();
    });

    it('renders source', () => {
      render(
        <RecipeDetail
          recipe={mockRecipe}
          onClose={vi.fn()}
          onAddToShoppingList={vi.fn()}
        />
      );

      expect(screen.getByText(/Source: Test Kitchen/i)).toBeInTheDocument();
    });

    it('renders recipe meta information', () => {
      render(
        <RecipeDetail
          recipe={mockRecipe}
          onClose={vi.fn()}
          onAddToShoppingList={vi.fn()}
        />
      );

      expect(screen.getByText(/Prep: 15 min/i)).toBeInTheDocument();
      expect(screen.getByText(/Cook: 30 min/i)).toBeInTheDocument();
      expect(screen.getByText(/Total: 45 min/i)).toBeInTheDocument();
      expect(screen.getByText(/Servings: 4/i)).toBeInTheDocument();
    });

    it('renders notes section', () => {
      render(
        <RecipeDetail
          recipe={mockRecipe}
          onClose={vi.fn()}
          onAddToShoppingList={vi.fn()}
        />
      );

      expect(screen.getByText(/Notes:/i)).toBeInTheDocument();
      expect(screen.getByText(/Some cooking notes/i)).toBeInTheDocument();
    });

    it('renders ingredients section', () => {
      render(
        <RecipeDetail
          recipe={mockRecipe}
          onClose={vi.fn()}
          onAddToShoppingList={vi.fn()}
        />
      );

      expect(screen.getByText('Ingredients')).toBeInTheDocument();
      expect(screen.getByText(/1 teaspoon salt/i)).toBeInTheDocument();
      expect(screen.getByText(/2 large chicken breast \(boneless\)/i)).toBeInTheDocument();
      expect(screen.getByText(/2 tablespoons olive oil \(extra-virgin\)/i)).toBeInTheDocument();
    });

    it('renders directions section', () => {
      render(
        <RecipeDetail
          recipe={mockRecipe}
          onClose={vi.fn()}
          onAddToShoppingList={vi.fn()}
        />
      );

      expect(screen.getByText('Directions')).toBeInTheDocument();
      expect(screen.getByText('Step 1: Prepare ingredients')).toBeInTheDocument();
      expect(screen.getByText('Step 2: Cook the chicken')).toBeInTheDocument();
      expect(screen.getByText('Step 3: Serve hot')).toBeInTheDocument();
    });

    it('renders categories section', () => {
      render(
        <RecipeDetail
          recipe={mockRecipe}
          onClose={vi.fn()}
          onAddToShoppingList={vi.fn()}
        />
      );

      expect(screen.getByText('Categories')).toBeInTheDocument();
      expect(screen.getByText('Dinner')).toBeInTheDocument();
      expect(screen.getByText('Chicken')).toBeInTheDocument();
      expect(screen.getByText('Quick')).toBeInTheDocument();
    });

    it('renders close button', () => {
      render(
        <RecipeDetail
          recipe={mockRecipe}
          onClose={vi.fn()}
          onAddToShoppingList={vi.fn()}
        />
      );

      expect(screen.getByText('×')).toBeInTheDocument();
    });

    it('renders "I\'m Making This" button', () => {
      render(
        <RecipeDetail
          recipe={mockRecipe}
          onClose={vi.fn()}
          onAddToShoppingList={vi.fn()}
        />
      );

      expect(screen.getByText("I'm Making This")).toBeInTheDocument();
    });

    it('renders ingredients instruction text', () => {
      render(
        <RecipeDetail
          recipe={mockRecipe}
          onClose={vi.fn()}
          onAddToShoppingList={vi.fn()}
        />
      );

      expect(screen.getByText(/Check items you already have/i)).toBeInTheDocument();
    });

    it('returns null when recipe is null', () => {
      const { container } = render(
        <RecipeDetail
          recipe={null}
          onClose={vi.fn()}
          onAddToShoppingList={vi.fn()}
        />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Pantry Item Pre-checking', () => {
    it('pre-checks pantry items by default', () => {
      render(
        <RecipeDetail
          recipe={mockRecipe}
          onClose={vi.fn()}
          onAddToShoppingList={vi.fn()}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      const saltCheckbox = checkboxes[0]; // salt
      const chickenCheckbox = checkboxes[1]; // chicken
      const oilCheckbox = checkboxes[2]; // olive oil

      expect(saltCheckbox).toBeChecked(); // pantry item
      expect(chickenCheckbox).not.toBeChecked(); // not pantry
      expect(oilCheckbox).toBeChecked(); // pantry item
    });

    it('initializes with correct pantry detection', () => {
      const recipeWithMixedItems = {
        ...mockRecipe,
        ingredients: [
          { id: 'ing-1', name: 'black pepper', quantity: 1, unit: 'teaspoon' },
          { id: 'ing-2', name: 'fresh basil', quantity: 1, unit: 'cup' },
          { id: 'ing-3', name: 'sugar', quantity: 1, unit: 'tablespoon' }
        ]
      };

      render(
        <RecipeDetail
          recipe={recipeWithMixedItems}
          onClose={vi.fn()}
          onAddToShoppingList={vi.fn()}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');

      expect(checkboxes[0]).toBeChecked(); // black pepper - pantry
      expect(checkboxes[1]).not.toBeChecked(); // fresh basil - not pantry
      expect(checkboxes[2]).toBeChecked(); // sugar - pantry
    });
  });

  describe('Ingredient Checkbox Toggling', () => {
    it('toggles ingredient checkbox when clicked', () => {
      render(
        <RecipeDetail
          recipe={mockRecipe}
          onClose={vi.fn()}
          onAddToShoppingList={vi.fn()}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      const chickenCheckbox = checkboxes[1]; // Initially unchecked

      expect(chickenCheckbox).not.toBeChecked();

      fireEvent.click(chickenCheckbox);
      expect(chickenCheckbox).toBeChecked();

      fireEvent.click(chickenCheckbox);
      expect(chickenCheckbox).not.toBeChecked();
    });

    it('can uncheck pre-checked pantry items', () => {
      render(
        <RecipeDetail
          recipe={mockRecipe}
          onClose={vi.fn()}
          onAddToShoppingList={vi.fn()}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      const saltCheckbox = checkboxes[0]; // Pre-checked pantry item

      expect(saltCheckbox).toBeChecked();

      fireEvent.click(saltCheckbox);
      expect(saltCheckbox).not.toBeChecked();
    });

    it('maintains independent state for each checkbox', () => {
      render(
        <RecipeDetail
          recipe={mockRecipe}
          onClose={vi.fn()}
          onAddToShoppingList={vi.fn()}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');

      // Toggle first checkbox
      fireEvent.click(checkboxes[0]);

      // Check that others remain unchanged
      expect(checkboxes[0]).not.toBeChecked(); // Toggled
      expect(checkboxes[1]).not.toBeChecked(); // Still unchecked
      expect(checkboxes[2]).toBeChecked(); // Still checked
    });
  });

  describe('"I\'m Making This" Button', () => {
    it('calls onAddToShoppingList with all ingredients', () => {
      const mockAddToShoppingList = vi.fn();

      render(
        <RecipeDetail
          recipe={mockRecipe}
          onClose={vi.fn()}
          onAddToShoppingList={mockAddToShoppingList}
        />
      );

      const button = screen.getByText("I'm Making This");
      fireEvent.click(button);

      expect(mockAddToShoppingList).toHaveBeenCalledTimes(1);

      const addedItems = mockAddToShoppingList.mock.calls[0][0];
      expect(addedItems).toHaveLength(3);
    });

    it('tracks userHas status correctly for checked items', () => {
      const mockAddToShoppingList = vi.fn();

      render(
        <RecipeDetail
          recipe={mockRecipe}
          onClose={vi.fn()}
          onAddToShoppingList={mockAddToShoppingList}
        />
      );

      const button = screen.getByText("I'm Making This");
      fireEvent.click(button);

      const addedItems = mockAddToShoppingList.mock.calls[0][0];

      // salt and olive oil should be checked (pantry items)
      const saltItem = addedItems.find(item => item.name === 'salt');
      const oilItem = addedItems.find(item => item.name === 'olive oil');
      const chickenItem = addedItems.find(item => item.name === 'chicken breast');

      expect(saltItem.userHas).toBe(true);
      expect(oilItem.userHas).toBe(true);
      expect(chickenItem.userHas).toBe(false);
    });

    it('tracks userHas after user unchecks pantry item', () => {
      const mockAddToShoppingList = vi.fn();

      render(
        <RecipeDetail
          recipe={mockRecipe}
          onClose={vi.fn()}
          onAddToShoppingList={mockAddToShoppingList}
        />
      );

      // Uncheck salt (first checkbox, pre-checked pantry item)
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      const button = screen.getByText("I'm Making This");
      fireEvent.click(button);

      const addedItems = mockAddToShoppingList.mock.calls[0][0];
      const saltItem = addedItems.find(item => item.name === 'salt');

      expect(saltItem.userHas).toBe(false); // User said they don't have it
    });

    it('includes all ingredient properties', () => {
      const mockAddToShoppingList = vi.fn();

      render(
        <RecipeDetail
          recipe={mockRecipe}
          onClose={vi.fn()}
          onAddToShoppingList={mockAddToShoppingList}
        />
      );

      const button = screen.getByText("I'm Making This");
      fireEvent.click(button);

      const addedItems = mockAddToShoppingList.mock.calls[0][0];
      const chickenItem = addedItems.find(item => item.name === 'chicken breast');

      expect(chickenItem.ingredientId).toBe('ing-2');
      expect(chickenItem.name).toBe('chicken breast');
      expect(chickenItem.quantity).toBe(2);
      expect(chickenItem.unit).toBe('large');
      expect(chickenItem.notes).toBe('boneless');
      expect(chickenItem.recipeTitle).toBe('Test Recipe');
      expect(chickenItem.recipeId).toBe(1);
      expect(chickenItem.checked).toBe(false);
    });

    it('calls onClose after adding items', () => {
      const mockClose = vi.fn();

      render(
        <RecipeDetail
          recipe={mockRecipe}
          onClose={mockClose}
          onAddToShoppingList={vi.fn()}
        />
      );

      const button = screen.getByText("I'm Making This");
      fireEvent.click(button);

      expect(mockClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Modal Close Behavior', () => {
    it('calls onClose when close button clicked', () => {
      const mockClose = vi.fn();

      render(
        <RecipeDetail
          recipe={mockRecipe}
          onClose={mockClose}
          onAddToShoppingList={vi.fn()}
        />
      );

      const closeButton = screen.getByText('×');
      fireEvent.click(closeButton);

      expect(mockClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when overlay clicked', () => {
      const mockClose = vi.fn();

      const { container } = render(
        <RecipeDetail
          recipe={mockRecipe}
          onClose={mockClose}
          onAddToShoppingList={vi.fn()}
        />
      );

      const overlay = container.querySelector('.modal-overlay');
      fireEvent.click(overlay);

      expect(mockClose).toHaveBeenCalledTimes(1);
    });

    it('does not close when modal content clicked', () => {
      const mockClose = vi.fn();

      const { container } = render(
        <RecipeDetail
          recipe={mockRecipe}
          onClose={mockClose}
          onAddToShoppingList={vi.fn()}
        />
      );

      const modalContent = container.querySelector('.modal-content');
      fireEvent.click(modalContent);

      expect(mockClose).not.toHaveBeenCalled();
    });
  });

  describe('Optional Fields', () => {
    it('hides notes section when no notes', () => {
      const recipeWithoutNotes = { ...mockRecipe, notes: null };

      render(
        <RecipeDetail
          recipe={recipeWithoutNotes}
          onClose={vi.fn()}
          onAddToShoppingList={vi.fn()}
        />
      );

      expect(screen.queryByText(/Notes:/i)).not.toBeInTheDocument();
    });

    it('hides categories section when no categories', () => {
      const recipeWithoutCategories = { ...mockRecipe, categories: [] };

      render(
        <RecipeDetail
          recipe={recipeWithoutCategories}
          onClose={vi.fn()}
          onAddToShoppingList={vi.fn()}
        />
      );

      expect(screen.queryByText('Categories')).not.toBeInTheDocument();
    });

    it('handles recipe without source', () => {
      const recipeWithoutSource = { ...mockRecipe, source: null };

      render(
        <RecipeDetail
          recipe={recipeWithoutSource}
          onClose={vi.fn()}
          onAddToShoppingList={vi.fn()}
        />
      );

      expect(screen.queryByText(/Source:/i)).not.toBeInTheDocument();
    });

    it('handles recipe without description', () => {
      const recipeWithoutDescription = { ...mockRecipe, description: null };

      render(
        <RecipeDetail
          recipe={recipeWithoutDescription}
          onClose={vi.fn()}
          onAddToShoppingList={vi.fn()}
        />
      );

      expect(screen.queryByText('A test recipe description')).not.toBeInTheDocument();
    });
  });
});
