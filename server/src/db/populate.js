import { db } from './index.js';
import { parseRecipeText } from '../services/claude.js';
import { Recipe } from '../models/Recipe.js';

const DELAY_MS = 1000;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function populate() {
  try {
    // Find recipes with zero ingredients
    const { rows } = await db.query(`
      SELECT r.id, r.title
      FROM recipes r
      LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id
      GROUP BY r.id, r.title
      HAVING COUNT(ri.id) = 0
      ORDER BY r.title
    `);

    if (rows.length === 0) {
      console.log('All recipes already have ingredients. Nothing to do.');
      process.exit(0);
    }

    console.log(`Found ${rows.length} recipes without ingredients.\n`);

    for (let i = 0; i < rows.length; i++) {
      const { id, title } = rows[i];
      console.log(`[${i + 1}/${rows.length}] Generating: ${title}...`);

      try {
        const prompt = `Write a standard home-cooking recipe for: ${title}

Include realistic ingredients with exact quantities and clear step-by-step directions.
Keep it simple — a weeknight dinner for 4 people. Use common pantry ingredients where possible.`;

        const parsed = await parseRecipeText(prompt);

        await Recipe.update(id, {
          description: parsed.description,
          prep_time: parsed.prepTime,
          cook_time: parsed.cookTime,
          total_time: parsed.totalTime,
          servings: parsed.servings,
          notes: parsed.notes,
          ingredients: parsed.ingredients,
          directions: parsed.directions,
          categories: parsed.categories,
        });

        console.log(`  ✓ ${parsed.ingredients.length} ingredients, ${parsed.directions.length} steps`);
      } catch (err) {
        console.error(`  ✗ Failed: ${err.message}`);
      }

      if (i < rows.length - 1) {
        await sleep(DELAY_MS);
      }
    }

    console.log('\nDone.');
    process.exit(0);
  } catch (error) {
    console.error('Populate failed:', error.message);
    process.exit(1);
  }
}

populate();
