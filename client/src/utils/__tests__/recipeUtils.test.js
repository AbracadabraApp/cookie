import { describe, it, expect } from 'vitest';
import { getIngredientCounts } from '../recipeUtils';

describe('getIngredientCounts', () => {
  it('returns zero counts for null recipe', () => {
    const result = getIngredientCounts(null);
    expect(result).toEqual({ shopCount: 0, haveCount: 0 });
  });

  it('returns zero counts for recipe without ingredients', () => {
    const recipe = { title: 'Empty Recipe' };
    const result = getIngredientCounts(recipe);
    expect(result).toEqual({ shopCount: 0, haveCount: 0 });
  });

  it('counts pantry items correctly', () => {
    const recipe = {
      ingredients: [
        { id: '1', name: 'salt' },
        { id: '2', name: 'pepper' },
        { id: '3', name: 'olive oil' }
      ]
    };

    const result = getIngredientCounts(recipe);
    expect(result.shopCount).toBe(0);
    expect(result.haveCount).toBe(3);
  });

  it('counts non-pantry items correctly', () => {
    const recipe = {
      ingredients: [
        { id: '1', name: 'chicken' },
        { id: '2', name: 'pasta' },
        { id: '3', name: 'tomatoes' }
      ]
    };

    const result = getIngredientCounts(recipe);
    expect(result.shopCount).toBe(3);
    expect(result.haveCount).toBe(0);
  });

  it('splits mixed pantry and shop items', () => {
    const recipe = {
      ingredients: [
        { id: '1', name: 'salt' },           // pantry
        { id: '2', name: 'chicken breast' }, // shop
        { id: '3', name: 'olive oil' },      // pantry
        { id: '4', name: 'garlic' },         // shop
        { id: '5', name: 'black pepper' }    // pantry
      ]
    };

    const result = getIngredientCounts(recipe);
    expect(result.shopCount).toBe(2);
    expect(result.haveCount).toBe(3);
  });

  it('handles recipes with empty ingredients array', () => {
    const recipe = {
      title: 'Empty Recipe',
      ingredients: []
    };

    const result = getIngredientCounts(recipe);
    expect(result).toEqual({ shopCount: 0, haveCount: 0 });
  });

  it('counts specialty pantry items as pantry', () => {
    const recipe = {
      ingredients: [
        { id: '1', name: 'diamond crystal kosher salt' },
        { id: '2', name: 'extra-virgin olive oil' },
        { id: '3', name: 'all-purpose flour' }
      ]
    };

    const result = getIngredientCounts(recipe);
    expect(result.shopCount).toBe(0);
    expect(result.haveCount).toBe(3);
  });
});
