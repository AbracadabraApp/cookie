import { db } from './index.js';

const MEAL_TITLES = [
  'Pasta fagioli',
  'Stir Fried Yaki Soba',
  'Viet noodle bowl',
  'Huevos Rancheros',
  'Thai curry',
  'Yakiudon',
  'Amatraciana',
  'Lamb burgers',
  'SW Taco dish',
  'Tomato chickpeas',
  'Chicken chow Mein',
  'Rueben',
  'Patty Melts, broccoli',
  'Mayo shrimp',
  'Stir fried beef and broccoli',
  'Mongolian beef',
  'Mongolian lamb and scallion',
  'Hot sour soup',
  'Shrimp, eggs, scallions',
  'Japanese beef and rice',
  'Pad se ewe',
  'Green beans with pork',
  'Yau Choi with oyster sauce',
  'Arrabiata',
  'Mulligatawny Soup',
  'Schezuan pasta',
  'Pork vindaloo, rice, naan',
  'Chinese Broccoli',
  'Cheeseburger',
  'Orange cream olive pasta',
  'Sausage and cream pasta',
  'Vietnamese stew',
  'Orange beef',
  'Udon soup',
];

async function seed() {
  try {
    // Only seed if database is empty
    const { rows } = await db.query('SELECT COUNT(*) FROM recipes');
    if (parseInt(rows[0].count) > 0) {
      console.log(`🌱 Database already has ${rows[0].count} recipes, skipping seed`);
      process.exit(0);
    }

    console.log('🌱 Seeding database with 34 meal titles...');

    for (const title of MEAL_TITLES) {
      await db.query(
        `INSERT INTO recipes (title, source_type) VALUES ($1, $2)`,
        [title, 'manual']
      );
      console.log(`  ✓ ${title}`);
    }

    console.log(`\n✅ Seeded ${MEAL_TITLES.length} recipes`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

seed();
