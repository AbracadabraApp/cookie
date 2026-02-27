import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { db } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function migrate() {
  console.log('🔧 Running database migrations...');

  try {
    // Read schema file
    const schemaPath = join(__dirname, 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');

    // Execute schema
    await db.query(schema);
    console.log('✅ Database schema created successfully');

    // Fix comma-separated categories: split into individual rows
    const { rows: badCats } = await db.query(
      `SELECT id, recipe_id, category FROM recipe_categories WHERE category LIKE '%,%'`
    );
    if (badCats.length > 0) {
      console.log(`🔧 Fixing ${badCats.length} comma-separated category rows...`);
      for (const row of badCats) {
        const splits = row.category.split(',').map(s => s.trim()).filter(Boolean);
        await db.query('DELETE FROM recipe_categories WHERE id = $1', [row.id]);
        for (const cat of splits) {
          await db.query(
            `INSERT INTO recipe_categories (recipe_id, category) VALUES ($1, $2)
             ON CONFLICT (recipe_id, category) DO NOTHING`,
            [row.recipe_id, cat]
          );
        }
      }
      console.log('✅ Categories fixed');
    }

    // Normalize category names
    const renames = { 'main course': 'Dinner', 'dinner': 'Dinner', 'lunch': 'Lunch', 'easy': 'Easy', 'quick': 'Quick' };
    for (const [from, to] of Object.entries(renames)) {
      await db.query(
        `UPDATE recipe_categories SET category = $1 WHERE lower(category) = $2 AND category != $1`,
        [to, from]
      );
      // Remove duplicates created by rename
      await db.query(`
        DELETE FROM recipe_categories a USING recipe_categories b
        WHERE a.recipe_id = b.recipe_id AND a.category = b.category AND a.id > b.id
      `);
    }
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

migrate();
