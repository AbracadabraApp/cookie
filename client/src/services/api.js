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
