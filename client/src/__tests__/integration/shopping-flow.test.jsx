import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Demo from '../../pages/Demo';
import ShoppingList from '../../components/ShoppingList';

// Helper to render Demo with router context and required props
function renderDemo(props = {}) {
  const defaultProps = {
    shoppingListItems: [],
    onAddToShoppingList: () => {},
    onUpdateShoppingList: () => {},
    ...props
  };

  return render(
    <MemoryRouter>
      <Demo {...defaultProps} />
    </MemoryRouter>
  );
}

describe('Recipe to Shopping List Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('View Switching', () => {
    it('defaults to list view', () => {
      renderDemo();
      const select = screen.getByRole('combobox');
      expect(select.value).toBe('list');
    });

    it('switches to recipes view via dropdown', () => {
      renderDemo();
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'recipes' } });

      // Should show recipe titles from the meals list
      expect(screen.getByText('Pasta fagioli')).toBeInTheDocument();
      expect(screen.getByText('Thai curry')).toBeInTheDocument();
    });

    it('shows Add recipe link in recipes view', () => {
      renderDemo();
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'recipes' } });

      expect(screen.getByText('Add recipe')).toBeInTheDocument();
    });

    it('shows all recipe names in recipes view', () => {
      renderDemo();
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'recipes' } });

      expect(screen.getByText('Huevos Rancheros')).toBeInTheDocument();
      expect(screen.getByText('Mongolian beef')).toBeInTheDocument();
      expect(screen.getByText('Udon soup')).toBeInTheDocument();
    });
  });

  describe('Shopping List in List View', () => {
    it('renders shopping list component in default view', () => {
      renderDemo();
      expect(screen.getByPlaceholderText(/Add item/i)).toBeInTheDocument();
    });

    it('shows empty state when no items', () => {
      renderDemo();
      expect(screen.getByText(/No items yet/i)).toBeInTheDocument();
    });

    it('displays shopping list items when provided', () => {
      const items = [
        { ingredientId: 'test-1', name: 'test ingredient', quantity: 1, unit: 'cup', userHas: false, recipeTitle: 'Test Recipe' }
      ];

      renderDemo({ shoppingListItems: items });
      expect(screen.getByText('test ingredient')).toBeInTheDocument();
    });
  });

  describe('ShoppingList Component', () => {
    it('splits items into Need and Have sections', () => {
      const items = [
        { ingredientId: '1', name: 'pasta', userHas: false },
        { ingredientId: '2', name: 'salt', userHas: true }
      ];

      render(<ShoppingList items={items} onUpdateItems={() => {}} />);

      expect(screen.getByText('Need')).toBeInTheDocument();
      expect(screen.getByText('Have')).toBeInTheDocument();
    });

    it('allows moving items between lists by toggling checkboxes', () => {
      const mockUpdate = vi.fn();
      const items = [
        { ingredientId: '1', name: 'pasta', userHas: false },
        { ingredientId: '2', name: 'salt', userHas: true }
      ];

      render(<ShoppingList items={items} onUpdateItems={mockUpdate} />);

      const needSection = screen.getByText('Need').closest('section');
      const checkboxesInNeed = within(needSection).getAllByRole('checkbox');
      fireEvent.click(checkboxesInNeed[0]);

      const updatedItems = mockUpdate.mock.calls[0][0];
      expect(updatedItems[0].userHas).toBe(true);
    });
  });

  describe('localStorage Persistence', () => {
    it('renders pre-loaded items passed as props', () => {
      const testItems = [
        {
          ingredientId: 'test-1',
          name: 'test ingredient',
          quantity: 1,
          unit: 'cup',
          userHas: false,
          recipeTitle: 'Test Recipe'
        }
      ];

      renderDemo({ shoppingListItems: testItems });
      expect(screen.getByText('test ingredient')).toBeInTheDocument();
    });
  });

  describe('Manual Item Addition', () => {
    it('allows adding manual items to the shopping list', () => {
      const mockUpdate = vi.fn();
      renderDemo({ onUpdateShoppingList: mockUpdate });

      const input = screen.getByPlaceholderText(/Add item/i);
      const button = screen.getByText('+');

      fireEvent.change(input, { target: { value: 'paper towels' } });
      fireEvent.click(button);

      expect(mockUpdate).toHaveBeenCalledTimes(1);
      const addedItem = mockUpdate.mock.calls[0][0][0];
      expect(addedItem.name).toBe('paper towels');
    });

    it('adds manual items to Need section by default', () => {
      const items = [
        { ingredientId: 'manual-1', name: 'manual item', userHas: false, recipeTitle: 'Manual' }
      ];

      renderDemo({ shoppingListItems: items });

      const needSection = screen.getByText('Need').closest('section');
      const needText = within(needSection);
      expect(needText.getByText('manual item')).toBeInTheDocument();
    });
  });
});
