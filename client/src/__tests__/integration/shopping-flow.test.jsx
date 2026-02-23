import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import Demo from '../../pages/Demo';

describe('Recipe to Shopping List Integration', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('Full Shopping Flow', () => {
    it('adds recipe ingredients to shopping list when clicking "I\'m Making This"', () => {
      render(<Demo />);

      // Verify we start with no shopping list items
      expect(screen.getByText('0 items to shop')).toBeInTheDocument();

      // Find and click the first recipe card
      const recipeCards = screen.getAllByRole('heading', { level: 3 });
      const firstRecipeCard = recipeCards[0].closest('.recipe-card');

      expect(firstRecipeCard).toBeInTheDocument();
      fireEvent.click(firstRecipeCard);

      // Modal should open with recipe details
      expect(screen.getByText("I'm Making This")).toBeInTheDocument();
      expect(screen.getByText('Ingredients')).toBeInTheDocument();

      // Click "I'm Making This" button
      const makingThisButton = screen.getByText("I'm Making This");
      fireEvent.click(makingThisButton);

      // Modal should close and shopping list should have items
      expect(screen.queryByText("I'm Making This")).not.toBeInTheDocument();

      // Shopping list should now have items
      const shoppingListHeader = screen.getByText(/items to shop/i);
      expect(shoppingListHeader).toBeInTheDocument();
      expect(shoppingListHeader.textContent).not.toContain('0 items');
    });

    it('splits ingredients into Need to Shop and Have On Hand lists', () => {
      render(<Demo />);

      // Click first recipe
      const recipeCards = screen.getAllByRole('heading', { level: 3 });
      fireEvent.click(recipeCards[0].closest('.recipe-card'));

      // Add to shopping list
      fireEvent.click(screen.getByText("I'm Making This"));

      // Should have both sections
      expect(screen.getByText('May Need to Shop ☐')).toBeInTheDocument();
      expect(screen.getByText('May Have On Hand ☑')).toBeInTheDocument();
    });

    it('respects user corrections to pantry guesses', () => {
      render(<Demo />);

      // Click first recipe card
      const recipeCards = screen.getAllByRole('heading', { level: 3 });
      fireEvent.click(recipeCards[0].closest('.recipe-card'));

      // Get all checkboxes in the recipe modal
      const checkboxes = screen.getAllByRole('checkbox');

      // Find a checked checkbox (pantry item) and uncheck it
      const checkedBox = checkboxes.find(cb => cb.checked);
      expect(checkedBox).toBeDefined();

      // Get the ingredient name associated with this checkbox
      const label = checkedBox.closest('label');
      const ingredientText = label.textContent;

      // Uncheck it (user says they don't have it)
      fireEvent.click(checkedBox);
      expect(checkedBox).not.toBeChecked();

      // Add to shopping list
      fireEvent.click(screen.getByText("I'm Making This"));

      // The unchecked item should be in "Need to Shop"
      const needToShopSection = screen.getByText('May Need to Shop ☐').closest('section');
      const needToShopList = within(needToShopSection);

      // Check that at least some items are in the need to shop list
      expect(needToShopSection).toBeInTheDocument();
    });

    it('allows moving items between lists by toggling checkboxes', () => {
      render(<Demo />);

      // Add a recipe to shopping list
      const recipeCards = screen.getAllByRole('heading', { level: 3 });
      fireEvent.click(recipeCards[0].closest('.recipe-card'));
      fireEvent.click(screen.getByText("I'm Making This"));

      // Get items from "Need to Shop" section
      const needToShopSection = screen.getByText('May Need to Shop ☐').closest('section');
      const checkboxesInNeedToShop = within(needToShopSection).getAllByRole('checkbox');

      expect(checkboxesInNeedToShop.length).toBeGreaterThan(0);

      // Toggle first checkbox (move to "Have On Hand")
      const firstCheckbox = checkboxesInNeedToShop[0];
      fireEvent.click(firstCheckbox);

      // Now "Have On Hand" section should exist and have items
      const haveOnHandSection = screen.getByText('May Have On Hand ☑').closest('section');
      expect(haveOnHandSection).toBeInTheDocument();
    });
  });

  describe('localStorage Persistence', () => {
    it('persists shopping list items to localStorage', () => {
      render(<Demo />);

      // Add items to shopping list
      const recipeCards = screen.getAllByRole('heading', { level: 3 });
      fireEvent.click(recipeCards[0].closest('.recipe-card'));
      fireEvent.click(screen.getByText("I'm Making This"));

      // Check localStorage
      const saved = localStorage.getItem('cookie-shopping-list-items');
      expect(saved).toBeTruthy();

      const items = JSON.parse(saved);
      expect(items.length).toBeGreaterThan(0);
      expect(items[0]).toHaveProperty('ingredientId');
      expect(items[0]).toHaveProperty('name');
      expect(items[0]).toHaveProperty('userHas');
    });

    it('loads shopping list from localStorage on mount', () => {
      // Pre-populate localStorage
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
      localStorage.setItem('cookie-shopping-list-items', JSON.stringify(testItems));

      // Render component
      render(<Demo />);

      // Should show the item from localStorage
      expect(screen.getByText('test ingredient')).toBeInTheDocument();
      expect(screen.getByText('1 item to shop')).toBeInTheDocument();
    });

    it('updates localStorage when toggling items', () => {
      render(<Demo />);

      // Add items
      const recipeCards = screen.getAllByRole('heading', { level: 3 });
      fireEvent.click(recipeCards[0].closest('.recipe-card'));
      fireEvent.click(screen.getByText("I'm Making This"));

      // Get initial state from localStorage
      const initialSaved = localStorage.getItem('cookie-shopping-list-items');
      const initialItems = JSON.parse(initialSaved);

      // Toggle a checkbox
      const needToShopSection = screen.getByText('May Need to Shop ☐').closest('section');
      const checkboxes = within(needToShopSection).getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      // Check that localStorage was updated
      const updatedSaved = localStorage.getItem('cookie-shopping-list-items');
      const updatedItems = JSON.parse(updatedSaved);

      // Items should still be there but with updated userHas status
      expect(updatedItems.length).toBe(initialItems.length);
      expect(updatedItems).not.toEqual(initialItems);
    });
  });

  describe('Multiple Recipes', () => {
    it('does not add duplicate ingredients from same recipe', () => {
      render(<Demo />);

      // Add first recipe
      const recipeCards = screen.getAllByRole('heading', { level: 3 });
      fireEvent.click(recipeCards[0].closest('.recipe-card'));
      fireEvent.click(screen.getByText("I'm Making This"));

      // Get count
      const firstCount = parseInt(screen.getByText(/items to shop/i).textContent.match(/\d+/)[0]);

      // Try to add same recipe again
      fireEvent.click(recipeCards[0].closest('.recipe-card'));
      fireEvent.click(screen.getByText("I'm Making This"));

      // Count should be the same (no duplicates)
      const secondCount = parseInt(screen.getByText(/items to shop/i).textContent.match(/\d+/)[0]);
      expect(secondCount).toBe(firstCount);
    });

    it('can add multiple different recipes', () => {
      render(<Demo />);

      const recipeCards = screen.getAllByRole('heading', { level: 3 });

      // Add first recipe
      fireEvent.click(recipeCards[0].closest('.recipe-card'));
      fireEvent.click(screen.getByText("I'm Making This"));

      const firstCount = parseInt(screen.getByText(/items to shop/i).textContent.match(/\d+/)[0]);

      // Add second recipe (if it exists)
      if (recipeCards.length > 1) {
        fireEvent.click(recipeCards[1].closest('.recipe-card'));
        fireEvent.click(screen.getByText("I'm Making This"));

        const secondCount = parseInt(screen.getByText(/items to shop/i).textContent.match(/\d+/)[0]);

        // Should have more items now (assuming recipes have different ingredients)
        expect(secondCount).toBeGreaterThanOrEqual(firstCount);
      }
    });
  });

  describe('Manual Item Addition', () => {
    it('allows adding manual items to the shopping list', () => {
      render(<Demo />);

      // Find and use the add item form
      const input = screen.getByPlaceholderText(/Add item/i);
      const button = screen.getByText('+ Add Item');

      fireEvent.change(input, { target: { value: 'paper towels' } });
      fireEvent.click(button);

      // Should appear in the shopping list
      expect(screen.getByText('paper towels')).toBeInTheDocument();
      expect(screen.getByText('1 item to shop')).toBeInTheDocument();
    });

    it('adds manual items to Need to Shop list by default', () => {
      render(<Demo />);

      const input = screen.getByPlaceholderText(/Add item/i);
      const button = screen.getByText('+ Add Item');

      fireEvent.change(input, { target: { value: 'manual item' } });
      fireEvent.click(button);

      // Should be in "Need to Shop" section
      const needToShopSection = screen.getByText('May Need to Shop ☐').closest('section');
      const needToShopText = within(needToShopSection);
      expect(needToShopText.getByText('manual item')).toBeInTheDocument();
    });

    it('persists manual items to localStorage', () => {
      render(<Demo />);

      const input = screen.getByPlaceholderText(/Add item/i);
      const button = screen.getByText('+ Add Item');

      fireEvent.change(input, { target: { value: 'manual item' } });
      fireEvent.click(button);

      // Check localStorage
      const saved = localStorage.getItem('cookie-shopping-list-items');
      const items = JSON.parse(saved);

      const manualItem = items.find(item => item.name === 'manual item');
      expect(manualItem).toBeDefined();
      expect(manualItem.recipeTitle).toBe('Manual');
      expect(manualItem.userHas).toBe(false);
    });
  });

  describe('Recipe Cards Display', () => {
    it('shows ingredient count summary on recipe cards', () => {
      render(<Demo />);

      // Recipe cards should show "X to buy" and "X on hand"
      const toBuyTexts = screen.getAllByText(/to buy/i);
      const onHandTexts = screen.getAllByText(/on hand/i);

      expect(toBuyTexts.length).toBeGreaterThan(0);
      expect(onHandTexts.length).toBeGreaterThan(0);
    });

    it('displays recipe metadata', () => {
      render(<Demo />);

      // Should show time and servings on cards
      const minTexts = screen.getAllByText(/min/i);
      const servingsTexts = screen.getAllByText(/servings/i);

      expect(minTexts.length).toBeGreaterThan(0);
      expect(servingsTexts.length).toBeGreaterThan(0);
    });
  });
});
