import axios from 'axios';
import * as cheerio from 'cheerio';
import recipeScraper from 'recipe-scraper';
const { scrape } = recipeScraper;

/**
 * Fetch and extract recipe from URL
 * Tries multiple methods in order of reliability
 */
export async function fetchRecipeFromUrl(url) {
  console.log('[URL Fetcher] Fetching:', url);

  try {
    // Method 1: Try recipe-scraper (supports schema.org and common recipe sites)
    try {
      console.log('[URL Fetcher] Trying recipe-scraper...');
      const recipe = await scrape(url);

      if (recipe && recipe.name) {
        console.log('[URL Fetcher] ✅ Recipe extracted via recipe-scraper:', recipe.name);
        return normalizeScrapedRecipe(recipe, url);
      }
    } catch (scraperError) {
      console.log('[URL Fetcher] recipe-scraper failed:', scraperError.message);
    }

    // Method 2: Manual HTML parsing with Cheerio
    console.log('[URL Fetcher] Trying manual HTML extraction...');
    const htmlContent = await fetchHtml(url);

    // Try to extract schema.org JSON-LD
    const schemaRecipe = extractSchemaOrgRecipe(htmlContent);
    if (schemaRecipe) {
      console.log('[URL Fetcher] ✅ Recipe extracted via schema.org JSON-LD');
      return normalizeSchemaRecipe(schemaRecipe, url);
    }

    // Try to extract plain text content for Claude parsing
    const plainText = extractRecipeText(htmlContent);
    if (plainText && plainText.length > 100) {
      console.log('[URL Fetcher] ✅ Extracted plain text for Claude parsing');
      return {
        method: 'plain_text',
        text: plainText,
        url,
        needsClaude: true
      };
    }

    // Nothing worked
    throw new Error('Could not extract recipe from URL. The page might not contain a recipe, or uses an unsupported format.');

  } catch (error) {
    console.error('[URL Fetcher] All methods failed:', error.message);
    throw new Error(`Failed to fetch recipe from URL: ${error.message}`);
  }
}

/**
 * Fetch HTML content from URL with friendly error messages
 */
async function fetchHtml(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 15000,
      maxRedirects: 5
    });

    return response.data;
  } catch (err) {
    if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
      throw new Error('The website took too long to respond. Try again or paste the recipe text instead.');
    }
    if (err.code === 'ENOTFOUND') {
      throw new Error('Could not reach that website. Please check the URL and try again.');
    }
    if (err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET') {
      throw new Error('Connection to the website was refused. The site may be down.');
    }
    if (err.response) {
      const status = err.response.status;
      if (status === 403 || status === 401) {
        throw new Error('That website blocked the request. Try pasting the recipe text instead.');
      }
      if (status === 404) {
        throw new Error('Page not found. Please check the URL and try again.');
      }
      if (status >= 500) {
        throw new Error('That website is having issues right now. Try again later or paste the recipe text instead.');
      }
      throw new Error(`The website returned an error (${status}). Try pasting the recipe text instead.`);
    }
    throw new Error('Could not connect to that website. Please check the URL and try again.');
  }
}

/**
 * Extract schema.org Recipe from JSON-LD in HTML
 */
function extractSchemaOrgRecipe(html) {
  const $ = cheerio.load(html);

  // Look for JSON-LD script tags
  const jsonLdScripts = $('script[type="application/ld+json"]');

  for (let i = 0; i < jsonLdScripts.length; i++) {
    try {
      const jsonData = JSON.parse($(jsonLdScripts[i]).html());

      // Handle both single object and array of objects
      const items = Array.isArray(jsonData) ? jsonData : [jsonData];

      for (const item of items) {
        // Check if it's a Recipe or includes a Recipe
        if (item['@type'] === 'Recipe') {
          return item;
        }
        if (item['@graph']) {
          const recipe = item['@graph'].find(g => g['@type'] === 'Recipe');
          if (recipe) return recipe;
        }
      }
    } catch (e) {
      // Invalid JSON, skip
      continue;
    }
  }

  return null;
}

/**
 * Extract plain text recipe content from HTML
 */
function extractRecipeText(html) {
  const $ = cheerio.load(html);

  // Remove script, style, and nav elements
  $('script, style, nav, header, footer, aside, .advertisement, .ad, .comments').remove();

  // Try common recipe container selectors
  const selectors = [
    '.recipe',
    '.recipe-card',
    '.recipe-content',
    '[itemtype*="Recipe"]',
    'article',
    'main',
    '.entry-content',
    '.post-content'
  ];

  for (const selector of selectors) {
    const container = $(selector).first();
    if (container.length > 0) {
      const text = container.text().trim();
      if (text.length > 100) {
        return text;
      }
    }
  }

  // Fallback: get body text
  return $('body').text().trim();
}

/**
 * Decode HTML entities (e.g. &amp; → &) using Cheerio
 */
function decodeEntities(text) {
  if (!text || typeof text !== 'string') return text;
  return cheerio.load(`<span>${text}</span>`)('span').text();
}

/**
 * Normalize recipe from recipe-scraper format to our format
 */
function normalizeScrapedRecipe(scraped, url) {
  return {
    method: 'recipe_scraper',
    url,
    needsClaude: false,
    title: decodeEntities(scraped.name) || 'Untitled Recipe',
    description: decodeEntities(scraped.description) || null,
    prepTime: parseTime(scraped.prepTime),
    cookTime: parseTime(scraped.cookTime),
    totalTime: parseTime(scraped.totalTime),
    servings: parseServings(scraped.servings || scraped.yield),
    ingredients: (scraped.ingredients || []).map((ing, idx) => ({
      name: decodeEntities(typeof ing === 'string' ? ing : ing.name || ing.text),
      quantity: null, // Will need Claude to parse
      unit: null,
      notes: null,
      order_index: idx
    })),
    directions: Array.isArray(scraped.instructions)
      ? scraped.instructions.map(step => decodeEntities(typeof step === 'string' ? step : step.text))
      : [decodeEntities(scraped.instructions)],
    categories: [scraped.category].flat().filter(Boolean)
  };
}

/**
 * Normalize recipe from schema.org format to our format
 */
function normalizeSchemaRecipe(schema, url) {
  return {
    method: 'schema_org',
    url,
    needsClaude: false,
    title: decodeEntities(schema.name) || 'Untitled Recipe',
    description: decodeEntities(schema.description) || null,
    prepTime: parseTime(schema.prepTime),
    cookTime: parseTime(schema.cookTime),
    totalTime: parseTime(schema.totalTime),
    servings: parseServings(schema.recipeYield),
    ingredients: (schema.recipeIngredient || []).map((ing, idx) => ({
      name: decodeEntities(ing),
      quantity: null, // Will need Claude to parse
      unit: null,
      notes: null,
      order_index: idx
    })),
    directions: Array.isArray(schema.recipeInstructions)
      ? schema.recipeInstructions.map(step =>
          decodeEntities(typeof step === 'string' ? step : step.text || step.name)
        )
      : [decodeEntities(schema.recipeInstructions)],
    categories: [schema.recipeCategory, schema.recipeCuisine].flat().filter(Boolean)
  };
}

/**
 * Parse ISO 8601 duration to minutes
 * PT15M -> 15
 * PT1H30M -> 90
 */
function parseTime(duration) {
  if (!duration) return null;

  if (typeof duration === 'number') return duration;

  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return null;

  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);

  return hours * 60 + minutes;
}

/**
 * Parse servings from various formats
 * "4" -> 4
 * "Serves 4" -> 4
 * "4 servings" -> 4
 */
function parseServings(servings) {
  if (!servings) return null;

  if (typeof servings === 'number') return servings;

  const match = servings.toString().match(/(\d+)/);
  return match ? parseInt(match[1]) : null;
}
