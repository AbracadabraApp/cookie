import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ShoppingList from '../ShoppingList';

function renderShoppingList(props = {}) {
  const defaultProps = {
    needItems: [],
    haveItems: [],
    manualItems: [],
    onAddManualItem: vi.fn(),
    onToggleManualItem: vi.fn(),
    onToggleHave: vi.fn(),
    ...props,
  };
  return { ...render(<ShoppingList {...defaultProps} />), props: defaultProps };
}

describe('ShoppingList', () => {
  describe('Rendering', () => {
    it('renders empty state when no items', () => {
      renderShoppingList();
      expect(screen.getByText(/No items yet/i)).toBeInTheDocument();
    });

    it('renders add item form', () => {
      renderShoppingList();
      expect(screen.getByPlaceholderText(/Add item/i)).toBeInTheDocument();
      expect(screen.getByText('+')).toBeInTheDocument();
    });
  });

  describe('List Splitting', () => {
    it('shows Need and Have sections when both have items', () => {
      renderShoppingList({
        needItems: [{ name: 'pasta', quantity: null, unit: null, notes: null, recipes: ['R'], ingredientIds: ['1'] }],
        haveItems: [{ name: 'salt', quantity: null, unit: null, notes: null, recipes: ['R'], ingredientIds: ['2'] }],
      });

      expect(screen.getByText('Need')).toBeInTheDocument();
      expect(screen.getByText('Have')).toBeInTheDocument();
    });

    it('hides Have section when no have items', () => {
      renderShoppingList({
        needItems: [{ name: 'pasta', quantity: null, unit: null, notes: null, recipes: ['R'], ingredientIds: ['1'] }],
      });

      expect(screen.getByText('Need')).toBeInTheDocument();
      expect(screen.queryByText('Have')).not.toBeInTheDocument();
    });

    it('shows Have section when have items exist', () => {
      renderShoppingList({
        haveItems: [{ name: 'salt', quantity: null, unit: null, notes: null, recipes: ['R'], ingredientIds: ['1'] }],
      });

      expect(screen.getByText('Have')).toBeInTheDocument();
    });
  });

  describe('Checkbox Behavior', () => {
    it('calls onToggleHave for each ingredientId when toggling a need item', () => {
      const onToggleHave = vi.fn();
      renderShoppingList({
        needItems: [{ name: 'pasta', quantity: null, unit: null, notes: null, recipes: ['R'], ingredientIds: ['id-1', 'id-2'] }],
        onToggleHave,
      });

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(onToggleHave).toHaveBeenCalledTimes(2);
      expect(onToggleHave).toHaveBeenCalledWith('id-1');
      expect(onToggleHave).toHaveBeenCalledWith('id-2');
    });

    it('calls onToggleHave when toggling a have item', () => {
      const onToggleHave = vi.fn();
      renderShoppingList({
        haveItems: [{ name: 'salt', quantity: null, unit: null, notes: null, recipes: ['R'], ingredientIds: ['id-3'] }],
        onToggleHave,
      });

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(onToggleHave).toHaveBeenCalledWith('id-3');
    });
  });

  describe('Manual Item Addition', () => {
    it('calls onAddManualItem when form submitted', () => {
      const onAddManualItem = vi.fn();
      renderShoppingList({ onAddManualItem });

      const input = screen.getByPlaceholderText(/Add item/i);
      const button = screen.getByText('+');

      fireEvent.change(input, { target: { value: 'paper towels' } });
      fireEvent.click(button);

      expect(onAddManualItem).toHaveBeenCalledWith('paper towels');
    });

    it('clears input after adding item', () => {
      renderShoppingList({ onAddManualItem: vi.fn() });

      const input = screen.getByPlaceholderText(/Add item/i);
      const button = screen.getByText('+');

      fireEvent.change(input, { target: { value: 'paper towels' } });
      fireEvent.click(button);

      expect(input.value).toBe('');
    });

    it('does not add empty items', () => {
      const onAddManualItem = vi.fn();
      renderShoppingList({ onAddManualItem });

      const button = screen.getByText('+');
      fireEvent.click(button);

      expect(onAddManualItem).not.toHaveBeenCalled();
    });

    it('does not add whitespace-only items', () => {
      const onAddManualItem = vi.fn();
      renderShoppingList({ onAddManualItem });

      const input = screen.getByPlaceholderText(/Add item/i);
      const button = screen.getByText('+');

      fireEvent.change(input, { target: { value: '   ' } });
      fireEvent.click(button);

      expect(onAddManualItem).not.toHaveBeenCalled();
    });

    it('shows manual need items in Need section', () => {
      renderShoppingList({
        manualItems: [{ id: 'manual-1', name: 'paper towels', have: false }],
      });

      expect(screen.getByText('Need')).toBeInTheDocument();
      expect(screen.getByText('paper towels')).toBeInTheDocument();
    });

    it('shows manual have items in Have section', () => {
      renderShoppingList({
        manualItems: [{ id: 'manual-1', name: 'paper towels', have: true }],
      });

      expect(screen.getByText('Have')).toBeInTheDocument();
      expect(screen.getByText('paper towels')).toBeInTheDocument();
    });

    it('calls onToggleManualItem when toggling a manual item', () => {
      const onToggleManualItem = vi.fn();
      renderShoppingList({
        manualItems: [{ id: 'manual-1', name: 'paper towels', have: false }],
        onToggleManualItem,
      });

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(onToggleManualItem).toHaveBeenCalledWith('manual-1');
    });
  });

  describe('Item Display', () => {
    it('displays formatted ingredient names', () => {
      renderShoppingList({
        needItems: [{ name: 'pasta', quantity: 1, unit: 'pound', notes: null, recipes: ['R'], ingredientIds: ['1'] }],
      });

      // formatIngredient should display weight items with oz
      expect(screen.getByText(/pasta \(16 oz\)/i)).toBeInTheDocument();
    });

    it('renders multiple items in Need list', () => {
      renderShoppingList({
        needItems: [
          { name: 'pasta', quantity: null, unit: null, notes: null, recipes: ['R'], ingredientIds: ['1'] },
          { name: 'chicken', quantity: null, unit: null, notes: null, recipes: ['R'], ingredientIds: ['2'] },
          { name: 'tomatoes', quantity: null, unit: null, notes: null, recipes: ['R'], ingredientIds: ['3'] },
        ],
      });

      expect(screen.getByText('pasta')).toBeInTheDocument();
      expect(screen.getByText('chicken')).toBeInTheDocument();
      expect(screen.getByText('tomatoes')).toBeInTheDocument();
    });

    it('renders multiple items in Have list', () => {
      renderShoppingList({
        haveItems: [
          { name: 'salt', quantity: null, unit: null, notes: null, recipes: ['R'], ingredientIds: ['1'] },
          { name: 'pepper', quantity: null, unit: null, notes: null, recipes: ['R'], ingredientIds: ['2'] },
          { name: 'olive oil', quantity: null, unit: null, notes: null, recipes: ['R'], ingredientIds: ['3'] },
        ],
      });

      expect(screen.getByText('salt')).toBeInTheDocument();
      expect(screen.getByText('pepper')).toBeInTheDocument();
      expect(screen.getByText('olive oil')).toBeInTheDocument();
    });
  });
});
