// Unit aliases → canonical abbreviation
const UNIT_MAP = {
  tablespoon: 'tbsp', tablespoons: 'tbsp', tbs: 'tbsp', tbsp: 'tbsp',
  teaspoon: 'tsp', teaspoons: 'tsp', tsp: 'tsp',
  cup: 'cup', cups: 'cup',
  ounce: 'oz', ounces: 'oz', oz: 'oz',
  pound: 'lb', pounds: 'lb', lb: 'lb', lbs: 'lb',
  gram: 'g', grams: 'g', g: 'g',
  kilogram: 'kg', kilograms: 'kg', kg: 'kg',
  milliliter: 'ml', milliliters: 'ml', ml: 'ml',
  liter: 'l', liters: 'l', l: 'l',
  pinch: 'pinch', dash: 'dash',
  clove: 'clove', cloves: 'clove',
  can: 'can', cans: 'can',
  bunch: 'bunch', bunches: 'bunch',
  slice: 'slice', slices: 'slice',
  piece: 'piece', pieces: 'piece',
  whole: 'whole',
  large: 'large', medium: 'medium', small: 'small',
};

export function normalizeUnit(unit) {
  if (!unit) return unit;
  const lower = unit.toLowerCase().trim();
  return UNIT_MAP[lower] || lower;
}

export function normalizeName(name) {
  if (!name) return name;
  return name.toLowerCase().replace(/\s+/g, ' ').trim();
}

export function normalizeIngredient(ing) {
  return {
    ...ing,
    name: normalizeName(ing.name),
    unit: normalizeUnit(ing.unit),
  };
}
