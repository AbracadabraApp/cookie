import express from 'express';
import { Recipe } from '../models/Recipe.js';
import { ValidationError, NotFoundError } from '../middleware/errorHandler.js';
import { parseRecipeText } from '../services/claude.js';
import { fetchRecipeFromUrl } from '../services/urlFetcher.js';
import multer from 'multer';

const router = express.Router();

// Configure multer for PDF uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new ValidationError('Only PDF files are allowed'));
    }
  }
});

// GET /api/recipes - List all recipes
router.get('/', async (req, res, next) => {
  try {
    const { category, search } = req.query;

    let recipes;

    if (search) {
      recipes = await Recipe.search(search);
    } else if (category) {
      recipes = await Recipe.findByCategory(category);
    } else {
      recipes = await Recipe.findAll();
    }

    res.json({
      success: true,
      data: recipes
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/recipes/:id - Get single recipe with full details
router.get('/:id', async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      throw new NotFoundError('Recipe not found');
    }

    res.json({
      success: true,
      data: recipe
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/recipes - Create new recipe (manual entry)
router.post('/', async (req, res, next) => {
  try {
    const {
      title,
      description,
      source,
      source_type = 'manual',
      notes,
      prep_time,
      cook_time,
      total_time,
      servings,
      ingredients,
      directions,
      categories
    } = req.body;

    // Validation
    if (!title || !title.trim()) {
      throw new ValidationError('Recipe title is required');
    }

    if (!ingredients || ingredients.length === 0) {
      throw new ValidationError('At least one ingredient is required');
    }

    if (!directions || directions.length === 0) {
      throw new ValidationError('At least one direction is required');
    }

    // Validate ingredient structure
    for (const ing of ingredients) {
      if (!ing.name || !ing.name.trim()) {
        throw new ValidationError('All ingredients must have a name');
      }
    }

    const recipe = await Recipe.create({
      title: title.trim(),
      description: description?.trim(),
      source: source?.trim() || 'Manual',
      source_type,
      notes: notes?.trim(),
      prep_time,
      cook_time,
      total_time,
      servings,
      ingredients,
      directions,
      categories: categories || []
    });

    res.status(201).json({
      success: true,
      data: recipe
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/recipes/url - Fetch and parse recipe from URL
router.post('/url', async (req, res, next) => {
  try {
    const { url } = req.body;

    if (!url || !url.trim()) {
      throw new ValidationError('Recipe URL is required');
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch (e) {
      throw new ValidationError('Invalid URL format');
    }

    // Fetch recipe from URL
    const fetchedRecipe = await fetchRecipeFromUrl(url);

    // If it needs Claude parsing, do that now
    if (fetchedRecipe.needsClaude) {
      console.log('[Recipe URL] Needs Claude parsing, calling Claude API...');
      const parsedRecipe = await parseRecipeText(fetchedRecipe.text);
      return res.json({
        success: true,
        data: {
          ...parsedRecipe,
          source: url,
          source_type: 'url'
        }
      });
    }

    // Otherwise return the structured recipe
    res.json({
      success: true,
      data: fetchedRecipe
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/recipes/parse - Parse recipe text with Claude API
router.post('/parse', async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      throw new ValidationError('Recipe text is required');
    }

    if (text.length < 50) {
      throw new ValidationError('Recipe text is too short. Please provide a complete recipe with ingredients and directions.');
    }

    if (text.length > 50000) {
      throw new ValidationError('Recipe text is too long. Maximum 50,000 characters.');
    }

    const parsedRecipe = await parseRecipeText(text);

    res.json({
      success: true,
      data: parsedRecipe
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/recipes/pdf - Parse PDF with Claude API (vision mode)
router.post('/pdf', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ValidationError('PDF file is required');
    }

    // TODO: Implement PDF parsing with Claude vision API
    // For now, return error
    throw new Error('PDF parsing not yet implemented');

  } catch (error) {
    next(error);
  }
});

// PUT /api/recipes/:id - Update recipe
router.put('/:id', async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      throw new NotFoundError('Recipe not found');
    }

    const updatedRecipe = await Recipe.update(req.params.id, req.body);

    res.json({
      success: true,
      data: updatedRecipe
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/recipes/:id - Delete recipe
router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await Recipe.delete(req.params.id);

    if (!deleted) {
      throw new NotFoundError('Recipe not found');
    }

    res.json({
      success: true,
      message: 'Recipe deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
