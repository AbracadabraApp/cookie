const API_BASE = '/api';

async function fetchJSON(url) {
  const res = await fetch(`${API_BASE}${url}`);
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  const json = await res.json();
  return json.data;
}

export function getRecipes() {
  return fetchJSON('/recipes');
}

export function getRecipe(id) {
  return fetchJSON(`/recipes/${id}`);
}

export async function checkDuplicate(title) {
  const res = await fetch(`${API_BASE}/recipes/check-duplicate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) return { duplicates: [] };
  const json = await res.json();
  return json.data;
}

export async function updateRecipe(id, recipeData) {
  const res = await fetch(`${API_BASE}/recipes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recipeData),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error?.message || `API error: ${res.status}`);
  }
  const json = await res.json();
  return json.data;
}

export async function deleteRecipe(id) {
  const res = await fetch(`${API_BASE}/recipes/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error?.message || `API error: ${res.status}`);
  }
  return true;
}

export async function createRecipe(recipeData) {
  const res = await fetch(`${API_BASE}/recipes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recipeData),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error?.message || `API error: ${res.status}`);
  }
  const json = await res.json();
  return json.data;
}
