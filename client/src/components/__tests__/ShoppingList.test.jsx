import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ShoppingList from '../ShoppingList';

describe('ShoppingList', () => {
  describe('Rendering', () => {
    it('renders empty state when no items', () => {
      render(<ShoppingList items={[]} onUpdateItems={vi.fn()} />);
      expect(screen.getByText(/No items yet/i)).toBeInTheDocument();
    });

    it('renders add item form', () => {
      render(<ShoppingList items={[]} onUpdateItems={vi.fn()} />);
      expect(screen.getByPlaceholderText(/Add item/i)).toBeInTheDocument();
      expect(screen.getByText('+')).toBeInTheDocument();
    });
  });

  describe('List Splitting', () => {
    it('splits items into Need and Have sections', () => {
      const items = [
        { ingredientId: '1', name: 'pasta', userHas: false },
        { ingredientId: '2', name: 'salt', userHas: true }
      ];

      render(<ShoppingList items={items} onUpdateItems={vi.fn()} />);

      expect(screen.getByText('Need')).toBeInTheDocument();
      expect(screen.getByText('Have')).toBeInTheDocument();
    });

    it('treats undefined userHas as need to shop', () => {
      const items = [
        { ingredientId: '1', name: 'pasta', userHas: undefined },
        { ingredientId: '2', name: 'salt' } // no userHas property
      ];

      render(<ShoppingList items={items} onUpdateItems={vi.fn()} />);

      const needSection = screen.getByText('Need').closest('section');
      expect(needSection).toBeInTheDocument();

      // Should not show "Have" section when empty
      expect(screen.queryByText('Have')).not.toBeInTheDocument();
    });

    it('hides Have section when no items have userHas=true', () => {
      const items = [
        { ingredientId: '1', name: 'pasta', userHas: false }
      ];

      render(<ShoppingList items={items} onUpdateItems={vi.fn()} />);

      expect(screen.getByText('Need')).toBeInTheDocument();
      expect(screen.queryByText('Have')).not.toBeInTheDocument();
    });

    it('shows Have section when items exist', () => {
      const items = [
        { ingredientId: '1', name: 'salt', userHas: true }
      ];

      render(<ShoppingList items={items} onUpdateItems={vi.fn()} />);

      expect(screen.getByText('Have')).toBeInTheDocument();
    });
  });

  describe('Checkbox Behavior', () => {
    it('calls onUpdateItems when toggling Need checkbox', () => {
      const mockUpdate = vi.fn();
      const items = [
        { ingredientId: '1', name: 'pasta', userHas: false }
      ];

      render(<ShoppingList items={items} onUpdateItems={mockUpdate} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockUpdate).toHaveBeenCalledWith([
        { ingredientId: '1', name: 'pasta', userHas: true }
      ]);
    });

    it('calls onUpdateItems when toggling Have checkbox', () => {
      const mockUpdate = vi.fn();
      const items = [
        { ingredientId: '1', name: 'salt', userHas: true }
      ];

      render(<ShoppingList items={items} onUpdateItems={mockUpdate} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockUpdate).toHaveBeenCalledWith([
        { ingredientId: '1', name: 'salt', userHas: false }
      ]);
    });

    it('preserves other item properties when toggling', () => {
      const mockUpdate = vi.fn();
      const items = [
        {
          ingredientId: '1',
          name: 'pasta',
          quantity: 1,
          unit: 'pound',
          notes: 'dried',
          recipeTitle: 'Pasta Recipe',
          userHas: false
        }
      ];

      render(<ShoppingList items={items} onUpdateItems={mockUpdate} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      const updatedItem = mockUpdate.mock.calls[0][0][0];
      expect(updatedItem.name).toBe('pasta');
      expect(updatedItem.quantity).toBe(1);
      expect(updatedItem.unit).toBe('pound');
      expect(updatedItem.notes).toBe('dried');
      expect(updatedItem.recipeTitle).toBe('Pasta Recipe');
      expect(updatedItem.userHas).toBe(true);
    });

    it('only updates the toggled item in multi-item list', () => {
      const mockUpdate = vi.fn();
      const items = [
        { ingredientId: '1', name: 'pasta', userHas: false },
        { ingredientId: '2', name: 'chicken', userHas: false },
        { ingredientId: '3', name: 'salt', userHas: true }
      ];

      render(<ShoppingList items={items} onUpdateItems={mockUpdate} />);

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]); // Toggle first item

      const updatedItems = mockUpdate.mock.calls[0][0];
      expect(updatedItems[0].userHas).toBe(true);  // Changed
      expect(updatedItems[1].userHas).toBe(false); // Unchanged
      expect(updatedItems[2].userHas).toBe(true);  // Unchanged
    });
  });

  describe('Manual Item Addition', () => {
    it('adds manual item when form submitted', () => {
      const mockUpdate = vi.fn();
      render(<ShoppingList items={[]} onUpdateItems={mockUpdate} />);

      const input = screen.getByPlaceholderText(/Add item/i);
      const button = screen.getByText('+');

      fireEvent.change(input, { target: { value: 'paper towels' } });
      fireEvent.click(button);

      expect(mockUpdate).toHaveBeenCalledTimes(1);
      const addedItem = mockUpdate.mock.calls[0][0][0];
      expect(addedItem.name).toBe('paper towels');
      expect(addedItem.recipeTitle).toBe('Manual');
      expect(addedItem.userHas).toBe(false);
      expect(addedItem.checked).toBe(false);
    });

    it('clears input after adding item', () => {
      const mockUpdate = vi.fn();
      render(<ShoppingList items={[]} onUpdateItems={mockUpdate} />);

      const input = screen.getByPlaceholderText(/Add item/i);
      const button = screen.getByText('+');

      fireEvent.change(input, { target: { value: 'paper towels' } });
      fireEvent.click(button);

      expect(input.value).toBe('');
    });

    it('trims whitespace from manual items', () => {
      const mockUpdate = vi.fn();
      render(<ShoppingList items={[]} onUpdateItems={mockUpdate} />);

      const input = screen.getByPlaceholderText(/Add item/i);
      const button = screen.getByText('+');

      fireEvent.change(input, { target: { value: '  paper towels  ' } });
      fireEvent.click(button);

      const addedItem = mockUpdate.mock.calls[0][0][0];
      expect(addedItem.name).toBe('paper towels');
    });

    it('does not add empty items', () => {
      const mockUpdate = vi.fn();
      render(<ShoppingList items={[]} onUpdateItems={mockUpdate} />);

      const button = screen.getByText('+');
      fireEvent.click(button);

      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('does not add whitespace-only items', () => {
      const mockUpdate = vi.fn();
      render(<ShoppingList items={[]} onUpdateItems={mockUpdate} />);

      const input = screen.getByPlaceholderText(/Add item/i);
      const button = screen.getByText('+');

      fireEvent.change(input, { target: { value: '   ' } });
      fireEvent.click(button);

      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('generates ingredient IDs with manual prefix', () => {
      const mockUpdate = vi.fn();
      render(<ShoppingList items={[]} onUpdateItems={mockUpdate} />);

      const input = screen.getByPlaceholderText(/Add item/i);
      const button = screen.getByText('+');

      fireEvent.change(input, { target: { value: 'item 1' } });
      fireEvent.click(button);

      const firstId = mockUpdate.mock.calls[0][0][0].ingredientId;
      expect(firstId).toMatch(/^manual-\d+$/);
      expect(firstId).toContain('manual-');
    });

    it('appends manual item to existing items', () => {
      const mockUpdate = vi.fn();
      const items = [
        { ingredientId: '1', name: 'pasta', userHas: false }
      ];

      render(<ShoppingList items={items} onUpdateItems={mockUpdate} />);

      const input = screen.getByPlaceholderText(/Add item/i);
      const button = screen.getByText('+');

      fireEvent.change(input, { target: { value: 'paper towels' } });
      fireEvent.click(button);

      const updatedItems = mockUpdate.mock.calls[0][0];
      expect(updatedItems).toHaveLength(2);
      expect(updatedItems[0].name).toBe('pasta');
      expect(updatedItems[1].name).toBe('paper towels');
    });
  });

  describe('Item Display', () => {
    it('displays formatted ingredient names', () => {
      const items = [
        { ingredientId: '1', name: 'pasta', quantity: 1, unit: 'pound', userHas: false }
      ];

      render(<ShoppingList items={items} onUpdateItems={vi.fn()} />);

      // formatIngredient should display weight items with oz
      expect(screen.getByText(/pasta \(16 oz\)/i)).toBeInTheDocument();
    });

    it('renders multiple items in Need list', () => {
      const items = [
        { ingredientId: '1', name: 'pasta', userHas: false },
        { ingredientId: '2', name: 'chicken', userHas: false },
        { ingredientId: '3', name: 'tomatoes', userHas: false }
      ];

      render(<ShoppingList items={items} onUpdateItems={vi.fn()} />);

      expect(screen.getByText('pasta')).toBeInTheDocument();
      expect(screen.getByText('chicken')).toBeInTheDocument();
      expect(screen.getByText('tomatoes')).toBeInTheDocument();
    });

    it('renders multiple items in Have list', () => {
      const items = [
        { ingredientId: '1', name: 'salt', userHas: true },
        { ingredientId: '2', name: 'pepper', userHas: true },
        { ingredientId: '3', name: 'olive oil', userHas: true }
      ];

      render(<ShoppingList items={items} onUpdateItems={vi.fn()} />);

      expect(screen.getByText('salt')).toBeInTheDocument();
      expect(screen.getByText('pepper')).toBeInTheDocument();
      expect(screen.getByText('olive oil')).toBeInTheDocument();
    });
  });
});
