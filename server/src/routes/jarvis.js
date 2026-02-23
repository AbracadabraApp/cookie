import express from 'express';
import rateLimit from 'express-rate-limit';
import { Recipe } from '../models/Recipe.js';
import { parseRecipeText } from '../services/claude.js';
import { ValidationError, RateLimitError } from '../middleware/errorHandler.js';
import { requireJarvisAuth } from '../middleware/auth.js';

const router = express.Router();

// Rate limiting: 10 recipes per hour from Jarvis
const jarvisRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT',
      message: 'Too many recipe requests. Maximum 10 per hour.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    throw new RateLimitError('Too many recipe requests. Maximum 10 per hour.');
  }
});

// POST /api/jarvis/recipe - Add recipe from Jarvis
router.post('/recipe', requireJarvisAuth, jarvisRateLimiter, async (req, res, next) => {
  try {
    const { text, url, userId = 'jarvis', source = 'iMessage', senderName } = req.body;

    // Log the request
    console.log('[Jarvis] Recipe request:', {
      userId,
      source,
      senderName,
      hasText: !!text,
      hasUrl: !!url,
      timestamp: new Date().toISOString()
    });

    // Validation
    if (!text || !text.trim()) {
      throw new ValidationError('Recipe text is required');
    }

    if (text.length < 50) {
      throw new ValidationError('Recipe text is too short. Please provide a complete recipe with ingredients and directions.');
    }

    if (text.length > 50000) {
      throw new ValidationError('Recipe text is too long. Maximum 50,000 characters.');
    }

    // Parse recipe with Claude
    console.log('[Jarvis] Parsing recipe with Claude...');
    const parsedRecipe = await parseRecipeText(text);

    console.log('[Jarvis] Recipe parsed successfully:', parsedRecipe.title);

    // Save to database
    const recipe = await Recipe.create({
      ...parsedRecipe,
      source: url || source,
      source_type: 'jarvis'
    });

    console.log('[Jarvis] Recipe saved to database:', recipe.id);

    // Return concise response for Jarvis to relay to user
    res.status(201).json({
      success: true,
      recipe: {
        id: recipe.id,
        title: recipe.title,
        ingredientCount: recipe.ingredients?.length || 0,
        prepTime: recipe.prep_time,
        cookTime: recipe.cook_time,
        servings: recipe.servings
      }
    });
  } catch (error) {
    console.error('[Jarvis] Error processing recipe:', error.message);
    next(error);
  }
});

// GET /api/jarvis/health - Health check for Jarvis
router.get('/health', requireJarvisAuth, (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    service: 'jarvis-integration',
    timestamp: new Date().toISOString()
  });
});

export default router;
