import { describe, it, expect } from 'vitest';
import {
  isLikelyInPantry,
  formatIngredient,
  formatIngredientForRecipe,
  consolidateShoppingList
} from '../shoppingListUtils';

describe('isLikelyInPantry', () => {
  it('returns true for common pantry items', () => {
    expect(isLikelyInPantry({ name: 'salt' })).toBe(true);
    expect(isLikelyInPantry({ name: 'olive oil' })).toBe(true);
    expect(isLikelyInPantry({ name: 'all-purpose flour' })).toBe(true);
    expect(isLikelyInPantry({ name: 'black pepper' })).toBe(true);
    expect(isLikelyInPantry({ name: 'sugar' })).toBe(true);
  });

  it('returns false for specialty items', () => {
    expect(isLikelyInPantry({ name: 'nduja' })).toBe(false);
    expect(isLikelyInPantry({ name: 'saffron' })).toBe(false);
    expect(isLikelyInPantry({ name: 'tomato passata' })).toBe(false);
    expect(isLikelyInPantry({ name: 'pecorino romano' })).toBe(false);
  });

  it('is case-insensitive', () => {
    expect(isLikelyInPantry({ name: 'SALT' })).toBe(true);
    expect(isLikelyInPantry({ name: 'Olive Oil' })).toBe(true);
    expect(isLikelyInPantry({ name: 'Black Pepper' })).toBe(true);
  });

  it('matches partial strings', () => {
    expect(isLikelyInPantry({ name: 'extra-virgin olive oil' })).toBe(true);
    expect(isLikelyInPantry({ name: 'diamond crystal kosher salt' })).toBe(true);
    expect(isLikelyInPantry({ name: 'coarse black pepper' })).toBe(true);
  });

  it('returns false for non-pantry ingredients', () => {
    expect(isLikelyInPantry({ name: 'chicken breast' })).toBe(false);
    expect(isLikelyInPantry({ name: 'shallots' })).toBe(false);
    expect(isLikelyInPantry({ name: 'fresh parsley' })).toBe(false);
  });
});

describe('formatIngredient', () => {
  describe('countable items', () => {
    it('shows count for medium-sized items', () => {
      expect(formatIngredient({
        quantity: 2,
        unit: 'medium',
        name: 'shallots'
      })).toBe('2 shallots');
    });

    it('shows count for large items', () => {
      expect(formatIngredient({
        quantity: 3,
        unit: 'large',
        name: 'onions'
      })).toBe('3 onions');
    });

    it('shows count for small items', () => {
      expect(formatIngredient({
        quantity: 4,
        unit: 'small',
        name: 'tomatoes'
      })).toBe('4 tomatoes');
    });

    it('rounds up fractional counts', () => {
      expect(formatIngredient({
        quantity: 2.3,
        unit: 'medium',
        name: 'carrots'
      })).toBe('3 carrots');
    });
  });

  describe('weight items', () => {
    it('shows weight in ounces for pound items', () => {
      expect(formatIngredient({
        quantity: 1,
        unit: 'pound',
        name: 'dried pasta'
      })).toBe('dried pasta (16 oz)');
    });

    it('converts pounds to ounces', () => {
      expect(formatIngredient({
        quantity: 2,
        unit: 'pound',
        name: 'ground beef'
      })).toBe('ground beef (32 oz)');
    });

    it('handles lb abbreviation', () => {
      expect(formatIngredient({
        quantity: 1.5,
        unit: 'lb',
        name: 'chicken'
      })).toBe('chicken (24 oz)');
    });

    it('shows ounces directly for oz unit', () => {
      expect(formatIngredient({
        quantity: 8,
        unit: 'ounce',
        name: 'cheese'
      })).toBe('cheese (8 oz)');
    });

    it('rounds up fractional ounces', () => {
      expect(formatIngredient({
        quantity: 0.5,
        unit: 'pound',
        name: 'butter'
      })).toBe('butter (8 oz)');
    });
  });

  describe('measurement items', () => {
    it('shows just name for tablespoons', () => {
      expect(formatIngredient({
        quantity: 2,
        unit: 'tablespoons',
        name: 'olive oil'
      })).toBe('olive oil');
    });

    it('shows just name for teaspoons', () => {
      expect(formatIngredient({
        quantity: 1,
        unit: 'teaspoon',
        name: 'vanilla extract'
      })).toBe('vanilla extract');
    });

    it('shows just name for cups', () => {
      expect(formatIngredient({
        quantity: 2,
        unit: 'cups',
        name: 'flour'
      })).toBe('flour');
    });

    it('shows just name for cloves', () => {
      expect(formatIngredient({
        quantity: 3,
        unit: 'cloves',
        name: 'garlic'
      })).toBe('garlic');
    });
  });

  describe('items without quantity', () => {
    it('shows just name when no quantity', () => {
      expect(formatIngredient({
        quantity: null,
        unit: null,
        name: 'salt'
      })).toBe('salt');
    });

    it('shows just name when no unit', () => {
      expect(formatIngredient({
        quantity: 2,
        unit: null,
        name: 'eggs'
      })).toBe('eggs');
    });
  });
});

describe('formatIngredientForRecipe', () => {
  it('includes full measurements with quantity and unit', () => {
    expect(formatIngredientForRecipe({
      quantity: 2,
      unit: 'tablespoons',
      name: 'olive oil',
      notes: null
    })).toBe('2 tablespoons olive oil');
  });

  it('includes notes in parentheses', () => {
    expect(formatIngredientForRecipe({
      quantity: 2,
      unit: 'tablespoons',
      name: 'olive oil',
      notes: 'extra-virgin'
    })).toBe('2 tablespoons olive oil (extra-virgin)');
  });

  it('works without quantity', () => {
    expect(formatIngredientForRecipe({
      quantity: null,
      unit: null,
      name: 'salt',
      notes: 'to taste'
    })).toBe('salt (to taste)');
  });

  it('works with quantity but no unit', () => {
    expect(formatIngredientForRecipe({
      quantity: 2,
      unit: null,
      name: 'eggs',
      notes: null
    })).toBe('2 eggs');
  });

  it('includes detailed preparation notes', () => {
    expect(formatIngredientForRecipe({
      quantity: 2,
      unit: 'large',
      name: 'shallots',
      notes: 'about 3 ounces; 90 g, thinly sliced'
    })).toBe('2 large shallots (about 3 ounces; 90 g, thinly sliced)');
  });
});

describe('consolidateShoppingList', () => {
  it('returns empty lists for empty recipes', () => {
    const result = consolidateShoppingList([]);
    expect(result.needToShop).toEqual([]);
    expect(result.mayHaveOnHand).toEqual([]);
  });

  it('splits pantry items from shopping items', () => {
    const recipes = [{
      title: 'Test Recipe',
      ingredients: [
        { id: '1', name: 'salt', quantity: 1, unit: 'teaspoon' },
        { id: '2', name: 'chicken', quantity: 2, unit: 'pounds' }
      ]
    }];

    const result = consolidateShoppingList(recipes);

    expect(result.mayHaveOnHand).toHaveLength(1);
    expect(result.mayHaveOnHand[0].name).toBe('salt');

    expect(result.needToShop).toHaveLength(1);
    expect(result.needToShop[0].name).toBe('chicken');
  });

  it('aggregates quantities for same ingredient with same unit', () => {
    const recipes = [
      {
        title: 'Recipe 1',
        ingredients: [{ id: '1', name: 'salt', quantity: 1, unit: 'teaspoon' }]
      },
      {
        title: 'Recipe 2',
        ingredients: [{ id: '2', name: 'salt', quantity: 2, unit: 'teaspoon' }]
      }
    ];

    const result = consolidateShoppingList(recipes);
    const salt = result.mayHaveOnHand.find(item => item.name === 'salt');

    expect(salt.quantity).toBe(3);
    expect(salt.unit).toBe('teaspoon');
  });

  it('tracks which recipes use each ingredient', () => {
    const recipes = [
      {
        title: 'Pasta',
        ingredients: [{ id: '1', name: 'salt', quantity: 1, unit: 'teaspoon' }]
      },
      {
        title: 'Chicken',
        ingredients: [{ id: '2', name: 'salt', quantity: 1, unit: 'teaspoon' }]
      }
    ];

    const result = consolidateShoppingList(recipes);
    const salt = result.mayHaveOnHand.find(item => item.name === 'salt');

    expect(salt.recipes).toContain('Pasta');
    expect(salt.recipes).toContain('Chicken');
  });

  it('does not aggregate quantities with different units', () => {
    const recipes = [
      {
        title: 'Recipe 1',
        ingredients: [{ id: '1', name: 'butter', quantity: 1, unit: 'cup' }]
      },
      {
        title: 'Recipe 2',
        ingredients: [{ id: '2', name: 'butter', quantity: 4, unit: 'tablespoons' }]
      }
    ];

    const result = consolidateShoppingList(recipes);
    const butter = result.needToShop.find(item => item.name === 'butter');

    // Should keep first quantity since units differ
    expect(butter.quantity).toBe(1);
    expect(butter.unit).toBe('cup');
  });

  it('handles case-insensitive ingredient matching', () => {
    const recipes = [
      {
        title: 'Recipe 1',
        ingredients: [{ id: '1', name: 'Salt', quantity: 1, unit: 'teaspoon' }]
      },
      {
        title: 'Recipe 2',
        ingredients: [{ id: '2', name: 'SALT', quantity: 1, unit: 'teaspoon' }]
      }
    ];

    const result = consolidateShoppingList(recipes);

    // Should consolidate into one item
    expect(result.mayHaveOnHand).toHaveLength(1);
    expect(result.mayHaveOnHand[0].quantity).toBe(2);
  });

  it('marks specialty items correctly', () => {
    const recipes = [{
      title: 'Italian',
      ingredients: [
        { id: '1', name: 'nduja', quantity: 4, unit: 'ounces' }
      ]
    }];

    const result = consolidateShoppingList(recipes);
    const nduja = result.needToShop.find(item => item.name === 'nduja');

    expect(nduja.isSpecialty).toBe(true);
  });
});
