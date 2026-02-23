import { db, transaction } from '../db/index.js';

export class Recipe {
  // Get all recipes with counts
  static async findAll() {
    const result = await db.query(`
      SELECT * FROM recipes_with_counts
      ORDER BY created_at DESC
    `);
    return result.rows;
  }

  // Get single recipe with full details
  static async findById(id) {
    // Get recipe base info
    const recipeResult = await db.query(
      'SELECT * FROM recipes WHERE id = $1',
      [id]
    );

    if (recipeResult.rows.length === 0) {
      return null;
    }

    const recipe = recipeResult.rows[0];

    // Get ingredients
    const ingredientsResult = await db.query(
      `SELECT id, name, quantity, unit, notes
       FROM recipe_ingredients
       WHERE recipe_id = $1
       ORDER BY order_index`,
      [id]
    );

    // Get directions
    const directionsResult = await db.query(
      `SELECT instruction
       FROM recipe_directions
       WHERE recipe_id = $1
       ORDER BY step_number`,
      [id]
    );

    // Get categories
    const categoriesResult = await db.query(
      `SELECT category
       FROM recipe_categories
       WHERE recipe_id = $1
       ORDER BY category`,
      [id]
    );

    return {
      ...recipe,
      ingredients: ingredientsResult.rows,
      directions: directionsResult.rows.map(r => r.instruction),
      categories: categoriesResult.rows.map(r => r.category)
    };
  }

  // Create new recipe with ingredients, directions, and categories
  static async create(recipeData) {
    return await transaction(async (client) => {
      const {
        title,
        description,
        source = 'Manual',
        source_type = 'manual',
        notes,
        prep_time,
        cook_time,
        total_time,
        servings,
        ingredients = [],
        directions = [],
        categories = []
      } = recipeData;

      // Insert recipe
      const recipeResult = await client.query(
        `INSERT INTO recipes
         (title, description, source, source_type, notes, prep_time, cook_time, total_time, servings)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [title, description, source, source_type, notes, prep_time, cook_time, total_time, servings]
      );

      const recipe = recipeResult.rows[0];

      // Insert ingredients
      for (let i = 0; i < ingredients.length; i++) {
        const ing = ingredients[i];
        await client.query(
          `INSERT INTO recipe_ingredients
           (recipe_id, name, quantity, unit, notes, order_index)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [recipe.id, ing.name, ing.quantity, ing.unit, ing.notes, i]
        );
      }

      // Insert directions
      for (let i = 0; i < directions.length; i++) {
        await client.query(
          `INSERT INTO recipe_directions
           (recipe_id, step_number, instruction)
           VALUES ($1, $2, $3)`,
          [recipe.id, i + 1, directions[i]]
        );
      }

      // Insert categories
      for (const category of categories) {
        await client.query(
          `INSERT INTO recipe_categories
           (recipe_id, category)
           VALUES ($1, $2)
           ON CONFLICT (recipe_id, category) DO NOTHING`,
          [recipe.id, category]
        );
      }

      // Return full recipe
      return await Recipe.findById(recipe.id);
    });
  }

  // Update recipe
  static async update(id, updates) {
    return await transaction(async (client) => {
      const {
        title,
        description,
        source,
        notes,
        prep_time,
        cook_time,
        total_time,
        servings,
        ingredients,
        directions,
        categories
      } = updates;

      // Update recipe base info
      const updateFields = [];
      const updateValues = [];
      let paramCount = 1;

      if (title !== undefined) {
        updateFields.push(`title = $${paramCount++}`);
        updateValues.push(title);
      }
      if (description !== undefined) {
        updateFields.push(`description = $${paramCount++}`);
        updateValues.push(description);
      }
      if (source !== undefined) {
        updateFields.push(`source = $${paramCount++}`);
        updateValues.push(source);
      }
      if (notes !== undefined) {
        updateFields.push(`notes = $${paramCount++}`);
        updateValues.push(notes);
      }
      if (prep_time !== undefined) {
        updateFields.push(`prep_time = $${paramCount++}`);
        updateValues.push(prep_time);
      }
      if (cook_time !== undefined) {
        updateFields.push(`cook_time = $${paramCount++}`);
        updateValues.push(cook_time);
      }
      if (total_time !== undefined) {
        updateFields.push(`total_time = $${paramCount++}`);
        updateValues.push(total_time);
      }
      if (servings !== undefined) {
        updateFields.push(`servings = $${paramCount++}`);
        updateValues.push(servings);
      }

      if (updateFields.length > 0) {
        updateValues.push(id);
        await client.query(
          `UPDATE recipes SET ${updateFields.join(', ')} WHERE id = $${paramCount}`,
          updateValues
        );
      }

      // Update ingredients if provided
      if (ingredients !== undefined) {
        await client.query('DELETE FROM recipe_ingredients WHERE recipe_id = $1', [id]);
        for (let i = 0; i < ingredients.length; i++) {
          const ing = ingredients[i];
          await client.query(
            `INSERT INTO recipe_ingredients
             (recipe_id, name, quantity, unit, notes, order_index)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [id, ing.name, ing.quantity, ing.unit, ing.notes, i]
          );
        }
      }

      // Update directions if provided
      if (directions !== undefined) {
        await client.query('DELETE FROM recipe_directions WHERE recipe_id = $1', [id]);
        for (let i = 0; i < directions.length; i++) {
          await client.query(
            `INSERT INTO recipe_directions
             (recipe_id, step_number, instruction)
             VALUES ($1, $2, $3)`,
            [id, i + 1, directions[i]]
          );
        }
      }

      // Update categories if provided
      if (categories !== undefined) {
        await client.query('DELETE FROM recipe_categories WHERE recipe_id = $1', [id]);
        for (const category of categories) {
          await client.query(
            `INSERT INTO recipe_categories
             (recipe_id, category)
             VALUES ($1, $2)`,
            [id, category]
          );
        }
      }

      return await Recipe.findById(id);
    });
  }

  // Delete recipe
  static async delete(id) {
    const result = await db.query(
      'DELETE FROM recipes WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows.length > 0;
  }

  // Search recipes
  static async search(query) {
    const result = await db.query(
      `SELECT * FROM recipes_with_counts
       WHERE
         to_tsvector('english', title) @@ plainto_tsquery('english', $1)
         OR to_tsvector('english', description) @@ plainto_tsquery('english', $1)
       ORDER BY created_at DESC`,
      [query]
    );
    return result.rows;
  }

  // Get recipes by category
  static async findByCategory(category) {
    const result = await db.query(
      `SELECT DISTINCT r.* FROM recipes_with_counts r
       JOIN recipe_categories rc ON r.id = rc.recipe_id
       WHERE rc.category = $1
       ORDER BY r.created_at DESC`,
      [category]
    );
    return result.rows;
  }
}
