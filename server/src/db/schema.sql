-- Cookie Database Schema
-- Phase 1: Shared recipe catalog (no auth)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  source VARCHAR(500), -- URL, book name, or "Manual"
  source_type VARCHAR(50) DEFAULT 'manual', -- manual, pdf, paste, jarvis
  notes TEXT, -- Cooking notes, tips
  prep_time INTEGER, -- minutes
  cook_time INTEGER, -- minutes
  total_time INTEGER, -- minutes
  servings INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recipe ingredients (embedded, not normalized yet)
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL, -- e.g., "olive oil", "chicken breast"
  quantity DECIMAL(10, 2), -- nullable for "to taste"
  unit VARCHAR(50), -- cups, oz, tbsp, etc.
  notes TEXT, -- "diced", "room temperature", "extra-virgin"
  order_index INTEGER DEFAULT 0, -- preserve order in recipe
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recipe directions (steps)
CREATE TABLE IF NOT EXISTS recipe_directions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  instruction TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(recipe_id, step_number)
);

-- Recipe categories/tags
CREATE TABLE IF NOT EXISTS recipe_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL, -- Italian, Dinner, Quick, Vegetarian
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(recipe_id, category)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_recipes_source_type ON recipes(source_type);
CREATE INDEX IF NOT EXISTS idx_recipes_created_at ON recipes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_directions_recipe_id ON recipe_directions(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_categories_recipe_id ON recipe_categories(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_categories_category ON recipe_categories(category);

-- Full text search on recipes
CREATE INDEX IF NOT EXISTS idx_recipes_title_search ON recipes USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_recipes_description_search ON recipes USING gin(to_tsvector('english', description));

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_recipes_updated_at ON recipes;
CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views for common queries
CREATE OR REPLACE VIEW recipes_with_counts AS
SELECT
  r.id,
  r.title,
  r.description,
  r.source,
  r.source_type,
  r.prep_time,
  r.cook_time,
  r.total_time,
  r.servings,
  r.created_at,
  COUNT(DISTINCT ri.id) as ingredient_count,
  COUNT(DISTINCT rd.id) as direction_count,
  ARRAY_AGG(DISTINCT rc.category) FILTER (WHERE rc.category IS NOT NULL) as categories
FROM recipes r
LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id
LEFT JOIN recipe_directions rd ON r.id = rd.recipe_id
LEFT JOIN recipe_categories rc ON r.id = rc.recipe_id
GROUP BY r.id, r.title, r.description, r.source, r.source_type,
         r.prep_time, r.cook_time, r.total_time, r.servings, r.created_at;
