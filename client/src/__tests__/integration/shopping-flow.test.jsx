import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Demo from '../../pages/Demo';
import ShoppingList from '../../components/ShoppingList';

const sampleRecipes = [
  { id: '1', title: 'Pasta fagioli' },
  { id: '2', title: 'Thai curry' },
  { id: '3', title: 'Huevos Rancheros' },
  { id: '4', title: 'Mongolian beef' },
  { id: '5', title: 'Udon soup' },
];

function renderDemo(props = {}) {
  const defaultProps = {
    orderedRecipes: sampleRecipes,
    checkedRecipes: new Set(),
    onToggleChecked: vi.fn(),
    needItems: [],
    haveItems: [],
    manualItems: [],
    onAddManualItem: vi.fn(),
    onToggleManualItem: vi.fn(),
    onToggleHave: vi.fn(),
    loading: false,
    error: null,
    ...props,
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
      const listBtn = screen.getByRole('button', { name: /Lists/i });
      expect(listBtn.className).toContain('active');
    });

    it('switches to recipes view via nav button', () => {
      renderDemo();
      const recipesBtn = screen.getByRole('button', { name: /Recipes/i });
      fireEvent.click(recipesBtn);

      expect(screen.getByText('Pasta fagioli')).toBeInTheDocument();
      expect(screen.getByText('Thai curry')).toBeInTheDocument();
    });

    it('shows Add recipe link in recipes view', () => {
      renderDemo();
      const recipesBtn = screen.getByRole('button', { name: /Recipes/i });
      fireEvent.click(recipesBtn);

      expect(screen.getByText('+ Add')).toBeInTheDocument();
    });

    it('shows all recipe names in recipes view', () => {
      renderDemo();
      const recipesBtn = screen.getByRole('button', { name: /Recipes/i });
      fireEvent.click(recipesBtn);

      expect(screen.getByText('Huevos Rancheros')).toBeInTheDocument();
      expect(screen.getByText('Mongolian beef')).toBeInTheDocument();
      expect(screen.getByText('Udon soup')).toBeInTheDocument();
    });
  });

  describe('Shopping List in List View', () => {
    it('renders shopping list component in default view', () => {
      renderDemo();
      expect(screen.getByText(/No items yet/i)).toBeInTheDocument();
    });

    it('shows empty state when no items', () => {
      renderDemo();
      expect(screen.getByText(/No items yet/i)).toBeInTheDocument();
    });

    it('displays computed need items', () => {
      renderDemo({
        needItems: [
          { name: 'test ingredient', quantity: null, unit: null, notes: null, recipes: ['R'], ingredientIds: ['1'] },
        ],
      });
      expect(screen.getByText('test ingredient')).toBeInTheDocument();
    });
  });

  describe('ShoppingList Component', () => {
    it('splits items into Need and Have sections', () => {
      render(
        <ShoppingList
          needItems={[{ name: 'pasta', quantity: null, unit: null, notes: null, recipes: ['R'], ingredientIds: ['1'] }]}
          haveItems={[{ name: 'salt', quantity: null, unit: null, notes: null, recipes: ['R'], ingredientIds: ['2'] }]}
          manualItems={[]}

          onToggleManualItem={vi.fn()}
          onToggleHave={vi.fn()}
        />
      );

      expect(screen.getByText('Need to Get')).toBeInTheDocument();
      expect(screen.getByText('Have')).toBeInTheDocument();
    });

    it('allows moving items between lists by toggling checkboxes', () => {
      const mockToggleHave = vi.fn();

      render(
        <ShoppingList
          needItems={[{ name: 'pasta', quantity: null, unit: null, notes: null, recipes: ['R'], ingredientIds: ['id-1'] }]}
          haveItems={[{ name: 'salt', quantity: null, unit: null, notes: null, recipes: ['R'], ingredientIds: ['id-2'] }]}
          manualItems={[]}

          onToggleManualItem={vi.fn()}
          onToggleHave={mockToggleHave}
        />
      );

      const needSection = screen.getByText('Need to Get').closest('section');
      const checkboxesInNeed = within(needSection).getAllByRole('checkbox');
      fireEvent.click(checkboxesInNeed[0]);

      expect(mockToggleHave).toHaveBeenCalledWith('id-1');
    });
  });

  describe('Manual Item Addition', () => {
    it('allows adding manual items to the shopping list', () => {
      const mockAddManualItem = vi.fn();
      renderDemo({
        onAddManualItem: mockAddManualItem,
        needItems: [{ name: 'pasta', quantity: null, unit: null, notes: null, recipes: ['R'], ingredientIds: ['1'] }],
      });

      const input = screen.getByPlaceholderText(/Add item/i);
      const button = screen.getByText('+');

      fireEvent.change(input, { target: { value: 'paper towels' } });
      fireEvent.click(button);

      expect(mockAddManualItem).toHaveBeenCalledWith('paper towels');
    });

    it('shows manual need items in Need section', () => {
      renderDemo({
        manualItems: [{ id: 'manual-1', name: 'manual item', have: false }],
      });

      const needSection = screen.getByText('Need to Get').closest('section');
      expect(within(needSection).getByText('manual item')).toBeInTheDocument();
    });
  });
});
