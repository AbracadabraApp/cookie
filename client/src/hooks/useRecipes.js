import { useState, useEffect } from 'react';
import { getRecipes } from '../services/api';

export function useRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    getRecipes()
      .then(data => {
        if (!cancelled) {
          setRecipes(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, []);

  return { recipes, loading, error };
}
