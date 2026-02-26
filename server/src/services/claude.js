import Anthropic from '@anthropic-ai/sdk';

// Initialize Claude client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const MODEL = 'claude-sonnet-4-20250514';

/**
 * Parse recipe text using Claude API
 * @param {string} recipeText - Raw recipe text
 * @returns {Promise<Object>} Parsed recipe data
 */
export async function parseRecipeText(recipeText) {
  const prompt = `You are a recipe parsing assistant. Extract structured data from the following recipe text.

Recipe text:
${recipeText}

Please parse this recipe and return a JSON object with the following structure:
{
  "title": "Recipe Title",
  "description": "Brief description of the dish",
  "prepTime": 15,  // prep time in minutes (null if not specified)
  "cookTime": 30,  // cook time in minutes (null if not specified)
  "totalTime": 45, // total time in minutes (null if not specified)
  "servings": 4,   // number of servings (null if not specified)
  "notes": "Any cooking tips or notes",
  "ingredients": [
    {
      "name": "olive oil",
      "quantity": 2,      // null for "to taste" or unspecified
      "unit": "tablespoons", // null if no unit
      "notes": "extra-virgin" // any modifiers or preparation notes
    }
  ],
  "directions": [
    "Step 1 instruction",
    "Step 2 instruction"
  ],
  "categories": ["Italian", "Pasta", "Dinner"]  // suggested categories
}

Rules:
1. ingredient.name should be the base ingredient (e.g., "chicken breast", "olive oil")
2. ingredient.quantity should be a number (use null for "to taste" or unspecified amounts)
3. ingredient.unit should be standardized (cup, tablespoon, teaspoon, ounce, pound, gram, etc.)
4. ingredient.notes should capture preparation (diced, chopped), quality (extra-virgin, fresh), or other modifiers
5. directions should be clear, actionable steps in order
6. categories should be 2-5 relevant tags (cuisine type, meal type, cooking method, dietary restrictions)
7. If information is missing, use null (not empty string)
8. Extract prep/cook/total times from the text if available (convert to minutes)
9. For servings, use the number (e.g., "serves 4" → 4)

Return ONLY the JSON object, no additional text.`;

  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    // Extract JSON from response
    const responseText = message.content[0].text;

    // Try to parse JSON (Claude might wrap it in markdown code blocks)
    let jsonText = responseText.trim();

    // Remove markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    const parsed = JSON.parse(jsonText);

    // Validate required fields
    if (!parsed.title || !parsed.title.trim()) {
      throw new Error('Claude did not extract a recipe title');
    }

    if (!parsed.ingredients || parsed.ingredients.length === 0) {
      throw new Error('Claude did not extract any ingredients');
    }

    if (!parsed.directions || parsed.directions.length === 0) {
      throw new Error('Claude did not extract any directions');
    }

    // Normalize data
    const normalized = {
      title: parsed.title.trim(),
      description: parsed.description?.trim() || null,
      prepTime: parsed.prepTime || null,
      cookTime: parsed.cookTime || null,
      totalTime: parsed.totalTime || null,
      servings: parsed.servings || null,
      notes: parsed.notes?.trim() || null,
      ingredients: parsed.ingredients.map((ing, index) => ({
        name: ing.name.trim(),
        quantity: ing.quantity || null,
        unit: ing.unit?.trim() || null,
        notes: ing.notes?.trim() || null,
        order_index: index
      })),
      directions: parsed.directions.map(dir => dir.trim()),
      categories: parsed.categories || []
    };

    console.log('[Claude] Successfully parsed recipe:', normalized.title);
    console.log('[Claude] Extracted:', {
      ingredients: normalized.ingredients.length,
      directions: normalized.directions.length,
      categories: normalized.categories.length
    });

    return normalized;

  } catch (error) {
    console.error('[Claude] Error parsing recipe:', error.message);

    if (error instanceof SyntaxError) {
      throw new Error('Failed to parse recipe: Claude returned invalid JSON');
    }

    if (error.message.includes('API key')) {
      throw new Error('Claude API key not configured');
    }

    throw new Error(`Failed to parse recipe with Claude: ${error.message}`);
  }
}

const RECIPE_JSON_SCHEMA = `{
  "title": "Recipe Title",
  "description": "Brief description of the dish",
  "prepTime": 15,
  "cookTime": 30,
  "totalTime": 45,
  "servings": 4,
  "notes": "Any cooking tips or notes",
  "ingredients": [
    { "name": "olive oil", "quantity": 2, "unit": "tablespoons", "notes": "extra-virgin" }
  ],
  "directions": ["Step 1 instruction", "Step 2 instruction"],
  "categories": ["Italian", "Pasta", "Dinner"]
}`;

const RECIPE_RULES = `Rules:
1. ingredient.name = base ingredient (e.g., "chicken breast")
2. ingredient.quantity = a number (null for "to taste")
3. ingredient.unit = standardized (cup, tablespoon, teaspoon, ounce, pound, etc.)
4. ingredient.notes = preparation/modifiers (diced, fresh, etc.)
5. directions = clear, actionable steps in order
6. categories = 2-5 relevant tags
7. Missing info = null (not empty string)
8. Extract times in minutes, servings as number
Return ONLY the JSON object.`;

/**
 * Parse recipe from a photo using Claude vision API
 * @param {Buffer} imageBuffer - Image file buffer
 * @param {string} mimeType - Image MIME type (image/jpeg, image/png, etc.)
 * @returns {Promise<Object>} Parsed recipe data
 */
export async function parseRecipeImage(imageBuffer, mimeType) {
  const base64 = imageBuffer.toString('base64');

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mimeType, data: base64 },
          },
          {
            type: 'text',
            text: `Extract the recipe from this image and return a JSON object:\n${RECIPE_JSON_SCHEMA}\n\n${RECIPE_RULES}`,
          },
        ],
      },
    ],
  });

  return normalizeClaudeResponse(message);
}

/**
 * Parse recipe from PDF using Claude's native PDF support
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @returns {Promise<Object>} Parsed recipe data
 */
export async function parseRecipePDF(pdfBuffer) {
  const base64 = pdfBuffer.toString('base64');

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'document',
            source: { type: 'base64', media_type: 'application/pdf', data: base64 },
          },
          {
            type: 'text',
            text: `Extract the recipe from this PDF and return a JSON object:\n${RECIPE_JSON_SCHEMA}\n\n${RECIPE_RULES}`,
          },
        ],
      },
    ],
  });

  return normalizeClaudeResponse(message);
}

function normalizeClaudeResponse(message) {
  const responseText = message.content[0].text;
  let jsonText = responseText.trim();

  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '');
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```\n/, '').replace(/\n```$/, '');
  }

  const parsed = JSON.parse(jsonText);

  if (!parsed.title?.trim()) throw new Error('No recipe title extracted');
  if (!parsed.ingredients?.length) throw new Error('No ingredients extracted');
  if (!parsed.directions?.length) throw new Error('No directions extracted');

  return {
    title: parsed.title.trim(),
    description: parsed.description?.trim() || null,
    prepTime: parsed.prepTime || null,
    cookTime: parsed.cookTime || null,
    totalTime: parsed.totalTime || null,
    servings: parsed.servings || null,
    notes: parsed.notes?.trim() || null,
    ingredients: parsed.ingredients.map((ing, index) => ({
      name: ing.name.trim(),
      quantity: ing.quantity || null,
      unit: ing.unit?.trim() || null,
      notes: ing.notes?.trim() || null,
      order_index: index,
    })),
    directions: parsed.directions.map(dir => dir.trim()),
    categories: parsed.categories || [],
  };
}
