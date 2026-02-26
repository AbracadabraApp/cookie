// Shared helpers for recipe import (AddRecipePage + ImportRecipePage)

// The parse/URL endpoints return camelCase; POST /api/recipes expects snake_case
export function toSnakeCase(parsed) {
  return {
    title: parsed.title,
    description: parsed.description,
    source: parsed.source || parsed.url,
    source_type: parsed.source_type || 'manual',
    notes: parsed.notes,
    prep_time: parsed.prepTime,
    cook_time: parsed.cookTime,
    total_time: parsed.totalTime,
    servings: parsed.servings,
    ingredients: parsed.ingredients,
    directions: parsed.directions,
    categories: parsed.categories,
  };
}

export async function fetchAPI(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message || `Request failed (${res.status})`);
  }
  return json.data;
}

export async function uploadFile(url, file) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(url, { method: 'POST', body: form });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message || `Upload failed (${res.status})`);
  }
  return json.data;
}
