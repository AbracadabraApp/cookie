import { transaction } from './index.js';

async function seed() {
  console.log('🌱 Seeding database with sample recipes...');

  try {
    await transaction(async (client) => {
      // Insert sample recipes
      const recipes = [
        {
          title: 'Spaghetti Carbonara',
          description: 'Classic Roman pasta dish with eggs, cheese, and guanciale',
          source: 'Serious Eats',
          source_type: 'manual',
          prep_time: 10,
          cook_time: 20,
          total_time: 30,
          servings: 4,
          notes: 'The key is to add eggs off heat to prevent scrambling'
        },
        {
          title: 'Roasted Chicken with Vegetables',
          description: 'Simple one-pan roasted chicken dinner',
          source: 'Manual',
          source_type: 'manual',
          prep_time: 15,
          cook_time: 60,
          total_time: 75,
          servings: 4
        },
        {
          title: 'Chocolate Chip Cookies',
          description: 'Classic chewy chocolate chip cookies',
          source: 'Manual',
          source_type: 'manual',
          prep_time: 15,
          cook_time: 12,
          total_time: 27,
          servings: 24,
          notes: 'Chill dough for 30 minutes for best results'
        }
      ];

      for (const recipe of recipes) {
        const recipeResult = await client.query(
          `INSERT INTO recipes (title, description, source, source_type, prep_time, cook_time, total_time, servings, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING id`,
          [recipe.title, recipe.description, recipe.source, recipe.source_type,
           recipe.prep_time, recipe.cook_time, recipe.total_time, recipe.servings, recipe.notes]
        );
        const recipeId = recipeResult.rows[0].id;
        console.log(`✓ Created recipe: ${recipe.title}`);

        // Add ingredients based on recipe
        if (recipe.title === 'Spaghetti Carbonara') {
          const ingredients = [
            { name: 'spaghetti', quantity: 1, unit: 'pound', notes: 'dried', order_index: 0 },
            { name: 'guanciale', quantity: 4, unit: 'oz', notes: 'diced', order_index: 1 },
            { name: 'eggs', quantity: 4, unit: 'large', notes: 'room temperature', order_index: 2 },
            { name: 'pecorino romano', quantity: 1, unit: 'cup', notes: 'grated', order_index: 3 },
            { name: 'black pepper', quantity: 1, unit: 'teaspoon', notes: 'freshly ground', order_index: 4 },
            { name: 'salt', quantity: null, unit: null, notes: 'to taste', order_index: 5 }
          ];

          for (const ing of ingredients) {
            await client.query(
              `INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, notes, order_index)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [recipeId, ing.name, ing.quantity, ing.unit, ing.notes, ing.order_index]
            );
          }

          const directions = [
            { step: 1, text: 'Bring a large pot of salted water to boil. Cook spaghetti according to package directions until al dente.' },
            { step: 2, text: 'While pasta cooks, crisp guanciale in a large skillet over medium heat until golden, about 8 minutes.' },
            { step: 3, text: 'In a bowl, whisk together eggs, pecorino, and black pepper.' },
            { step: 4, text: 'Reserve 1 cup pasta water, then drain pasta. Add hot pasta to skillet with guanciale.' },
            { step: 5, text: 'Remove from heat. Add egg mixture and toss vigorously, adding pasta water as needed to create a creamy sauce.' },
            { step: 6, text: 'Serve immediately with extra pecorino and black pepper.' }
          ];

          for (const dir of directions) {
            await client.query(
              `INSERT INTO recipe_directions (recipe_id, step_number, instruction)
               VALUES ($1, $2, $3)`,
              [recipeId, dir.step, dir.text]
            );
          }

          const categories = ['Italian', 'Pasta', 'Dinner', 'Quick'];
          for (const cat of categories) {
            await client.query(
              `INSERT INTO recipe_categories (recipe_id, category)
               VALUES ($1, $2)`,
              [recipeId, cat]
            );
          }
        }

        if (recipe.title === 'Roasted Chicken with Vegetables') {
          const ingredients = [
            { name: 'whole chicken', quantity: 1, unit: 'whole', notes: '4-5 pounds', order_index: 0 },
            { name: 'carrots', quantity: 4, unit: 'medium', notes: 'cut into 2-inch pieces', order_index: 1 },
            { name: 'potatoes', quantity: 1, unit: 'pound', notes: 'cut into chunks', order_index: 2 },
            { name: 'onion', quantity: 1, unit: 'large', notes: 'quartered', order_index: 3 },
            { name: 'olive oil', quantity: 3, unit: 'tablespoons', notes: null, order_index: 4 },
            { name: 'garlic', quantity: 4, unit: 'cloves', notes: 'smashed', order_index: 5 },
            { name: 'rosemary', quantity: 2, unit: 'sprigs', notes: 'fresh', order_index: 6 },
            { name: 'salt', quantity: null, unit: null, notes: 'to taste', order_index: 7 },
            { name: 'black pepper', quantity: null, unit: null, notes: 'to taste', order_index: 8 }
          ];

          for (const ing of ingredients) {
            await client.query(
              `INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, notes, order_index)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [recipeId, ing.name, ing.quantity, ing.unit, ing.notes, ing.order_index]
            );
          }

          const directions = [
            { step: 1, text: 'Preheat oven to 425°F.' },
            { step: 2, text: 'Pat chicken dry and season generously with salt and pepper, inside and out.' },
            { step: 3, text: 'Toss vegetables with olive oil, garlic, rosemary, salt and pepper in a roasting pan.' },
            { step: 4, text: 'Place chicken on top of vegetables, breast side up.' },
            { step: 5, text: 'Roast for 60-75 minutes until chicken reaches 165°F internally and skin is golden brown.' },
            { step: 6, text: 'Let rest 10 minutes before carving. Serve with roasted vegetables.' }
          ];

          for (const dir of directions) {
            await client.query(
              `INSERT INTO recipe_directions (recipe_id, step_number, instruction)
               VALUES ($1, $2, $3)`,
              [recipeId, dir.step, dir.text]
            );
          }

          const categories = ['Dinner', 'Chicken', 'Roasted', 'One-Pan'];
          for (const cat of categories) {
            await client.query(
              `INSERT INTO recipe_categories (recipe_id, category)
               VALUES ($1, $2)`,
              [recipeId, cat]
            );
          }
        }

        if (recipe.title === 'Chocolate Chip Cookies') {
          const ingredients = [
            { name: 'all-purpose flour', quantity: 2.25, unit: 'cups', notes: null, order_index: 0 },
            { name: 'baking soda', quantity: 1, unit: 'teaspoon', notes: null, order_index: 1 },
            { name: 'salt', quantity: 1, unit: 'teaspoon', notes: null, order_index: 2 },
            { name: 'butter', quantity: 1, unit: 'cup', notes: 'softened', order_index: 3 },
            { name: 'granulated sugar', quantity: 0.75, unit: 'cup', notes: null, order_index: 4 },
            { name: 'brown sugar', quantity: 0.75, unit: 'cup', notes: 'packed', order_index: 5 },
            { name: 'vanilla extract', quantity: 1, unit: 'teaspoon', notes: null, order_index: 6 },
            { name: 'eggs', quantity: 2, unit: 'large', notes: null, order_index: 7 },
            { name: 'chocolate chips', quantity: 2, unit: 'cups', notes: 'semi-sweet', order_index: 8 }
          ];

          for (const ing of ingredients) {
            await client.query(
              `INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, notes, order_index)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [recipeId, ing.name, ing.quantity, ing.unit, ing.notes, ing.order_index]
            );
          }

          const directions = [
            { step: 1, text: 'Preheat oven to 375°F. Line baking sheets with parchment paper.' },
            { step: 2, text: 'Whisk together flour, baking soda, and salt in a bowl.' },
            { step: 3, text: 'Beat butter and both sugars until fluffy, about 3 minutes.' },
            { step: 4, text: 'Beat in vanilla and eggs, one at a time.' },
            { step: 5, text: 'Gradually mix in flour mixture until just combined.' },
            { step: 6, text: 'Fold in chocolate chips.' },
            { step: 7, text: 'Chill dough for 30 minutes for best results.' },
            { step: 8, text: 'Drop rounded tablespoons of dough onto prepared sheets, spacing 2 inches apart.' },
            { step: 9, text: 'Bake 10-12 minutes until edges are golden. Cool on sheet 2 minutes, then transfer to rack.' }
          ];

          for (const dir of directions) {
            await client.query(
              `INSERT INTO recipe_directions (recipe_id, step_number, instruction)
               VALUES ($1, $2, $3)`,
              [recipeId, dir.step, dir.text]
            );
          }

          const categories = ['Dessert', 'Cookies', 'Baking', 'Classic'];
          for (const cat of categories) {
            await client.query(
              `INSERT INTO recipe_categories (recipe_id, category)
               VALUES ($1, $2)`,
              [recipeId, cat]
            );
          }
        }
      }
    });

    console.log('✅ Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

seed();
