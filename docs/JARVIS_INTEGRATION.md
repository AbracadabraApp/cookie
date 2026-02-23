# Jarvis Integration Guide

## Overview

Jarvis is an OpenClaw agent running on Mac Mini that handles iMessage interactions. This document describes how to integrate Jarvis with Cookie to enable recipe input via iMessage.

## Jarvis Environment

**Location:** Mac Mini (jarviss-mac-mini.local)
- OpenClaw workspace: `~/.openclaw/workspace-jarvis`
- Running as Launch Agent: `ai.openclaw.gateway`
- Auto-restarts on reboot via launchctl
- Configuration: `~/.openclaw/openclaw.json`

## Integration Flow

```
User
  │
  │ iMessage: "Add recipe: [text]"
  ▼
Jarvis (OpenClaw)
  │
  │ 1. Receives message via BlueBubbles
  │ 2. Parses command ("Add recipe")
  │ 3. Extracts recipe text/URL
  │ 4. HTTP POST to Cookie API
  ▼
Cookie Backend
  │
  │ 1. Receives recipe data
  │ 2. Calls Claude API to parse
  │ 3. Saves to PostgreSQL
  │ 4. Returns recipe details
  ▼
Jarvis (OpenClaw)
  │
  │ iMessage response: "Added Pasta Carbonara to Cookie! 8 ingredients."
  ▼
User
```

## Cookie API Endpoint

### POST /api/jarvis/recipe

**Purpose:** Accept recipe input from Jarvis

**Authentication:** Bearer token (shared secret)

**Request:**
```json
POST http://localhost:3000/api/jarvis/recipe
Content-Type: application/json
Authorization: Bearer <JARVIS_SECRET_TOKEN>

{
  "text": "Pasta Carbonara\n\nIngredients:\n1 lb spaghetti...",
  "url": "https://example.com/recipe",  // optional, if user shared URL
  "userId": "jarvis",
  "source": "iMessage",
  "senderName": "Josh"  // optional, from iMessage contact
}
```

**Response (Success):**
```json
{
  "success": true,
  "recipe": {
    "id": 123,
    "title": "Pasta Carbonara",
    "ingredientCount": 8,
    "prepTime": 15,
    "cookTime": 20,
    "servings": 4
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": {
    "code": "PARSE_FAILED",
    "message": "Could not parse recipe from provided text",
    "details": "Text too short or not in recipe format"
  }
}
```

## Jarvis OpenClaw Configuration

### Message Handler Pattern

Jarvis needs to listen for messages matching specific patterns and call the Cookie API.

**Trigger Patterns:**
- "Add recipe: [text]"
- "Add recipe [URL]"
- "Save this recipe: [text]"
- "Cookie add: [text]"

**Example OpenClaw Action Configuration:**
```yaml
# ~/.openclaw/workspace-jarvis/actions/add-recipe.yaml
name: add_recipe
description: Add a recipe to Cookie app from iMessage
triggers:
  - pattern: "add recipe:? (.*)"
    caseSensitive: false
  - pattern: "save this recipe:? (.*)"
    caseSensitive: false
  - pattern: "cookie add:? (.*)"
    caseSensitive: false

action:
  type: http_request
  config:
    method: POST
    url: http://localhost:3000/api/jarvis/recipe
    headers:
      Content-Type: application/json
      Authorization: Bearer ${JARVIS_SECRET_TOKEN}
    body:
      text: "${match.group1}"
      userId: "jarvis"
      source: "iMessage"
      senderName: "${message.sender.name}"

response:
  success: |
    Added ${response.recipe.title} to Cookie!
    ${response.recipe.ingredientCount} ingredients,
    ${response.recipe.prepTime} min prep,
    ${response.recipe.cookTime} min cook.

  error: |
    Sorry, I couldn't add that recipe to Cookie.
    ${response.error.message}
```

## Environment Variables

### Cookie Backend (.env)
```bash
# Jarvis Integration
JARVIS_SECRET_TOKEN=generate-random-secret-here
```

### Jarvis OpenClaw Config
```bash
# ~/.openclaw/workspace-jarvis/.env
COOKIE_API_URL=http://localhost:3000
JARVIS_SECRET_TOKEN=same-secret-as-cookie-backend
```

## Testing the Integration

### 1. Test Cookie API Directly
```bash
# From Mac Mini or local machine
curl -X POST http://localhost:3000/api/jarvis/recipe \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-secret-token" \
  -d '{
    "text": "Pasta Carbonara\n\nIngredients:\n1 lb spaghetti\n4 eggs\n...",
    "userId": "test",
    "source": "curl"
  }'
```

Expected response: JSON with recipe details

### 2. Test via Jarvis
```
iMessage to Jarvis:
"Add recipe: Scrambled Eggs

Ingredients:
2 eggs
1 tablespoon butter
Salt and pepper

Directions:
1. Beat eggs in bowl
2. Melt butter in pan over medium heat
3. Add eggs, stir until cooked"
```

Expected response from Jarvis:
```
Added Scrambled Eggs to Cookie!
3 ingredients, 2 min prep, 5 min cook.
```

### 3. Verify in Cookie Frontend
- Open http://localhost:5173
- Check Demo page for "Scrambled Eggs" recipe
- Verify all ingredients and directions parsed correctly

## URL Handling

If user sends a URL, Jarvis should fetch the page content first:

**User sends:**
```
Add recipe: https://www.seriouseats.com/pasta-carbonara
```

**Jarvis should:**
1. Detect URL in message
2. Fetch page HTML
3. Extract recipe text (or pass raw HTML to Cookie)
4. POST to Cookie API with both `text` and `url` fields

**Cookie API will:**
1. Prefer structured data from URL if available (schema.org JSON-LD)
2. Fall back to Claude parsing of HTML/text
3. Store original URL in `source` field for attribution

## Error Handling

### Common Errors

**1. Authentication Failed**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing authorization token"
  }
}
```

**Jarvis should respond:**
"Sorry, I couldn't connect to Cookie (authentication error). Please check configuration."

**2. Recipe Parse Failed**
```json
{
  "success": false,
  "error": {
    "code": "PARSE_FAILED",
    "message": "Could not parse recipe from provided text"
  }
}
```

**Jarvis should respond:**
"Sorry, I couldn't understand that as a recipe. Please make sure it includes ingredients and directions."

**3. Rate Limit Exceeded**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT",
    "message": "Too many requests. Try again in 60 seconds."
  }
}
```

**Jarvis should respond:**
"You're adding recipes too quickly! Please wait a minute and try again."

### Logging

Both Jarvis and Cookie should log all recipe addition attempts:

**Cookie logs:**
```
[2025-02-23 14:30:15] INFO: Jarvis recipe request from user=jarvis source=iMessage
[2025-02-23 14:30:16] INFO: Claude API parse successful: "Pasta Carbonara" (8 ingredients)
[2025-02-23 14:30:17] INFO: Recipe saved to database: id=123
```

**Jarvis logs:**
```
[2025-02-23 14:30:15] DEBUG: Received message: "Add recipe: Pasta Carbonara..."
[2025-02-23 14:30:15] INFO: Matched pattern: add_recipe
[2025-02-23 14:30:15] INFO: Calling Cookie API: POST /api/jarvis/recipe
[2025-02-23 14:30:17] INFO: Cookie API success: Recipe id=123 "Pasta Carbonara"
[2025-02-23 14:30:17] INFO: Sent response to user
```

## Security Considerations

1. **Shared Secret Token:**
   - Generate random token: `openssl rand -hex 32`
   - Store in environment variables (NOT in config files)
   - Rotate token if leaked

2. **Rate Limiting:**
   - Limit to 10 recipe additions per hour from Jarvis
   - Prevents abuse if token leaked
   - Prevents accidental infinite loops

3. **Input Validation:**
   - Cookie API validates all fields
   - Maximum text length: 50,000 characters
   - Sanitize all user input before storing

4. **Network Security:**
   - Both services on same Mac Mini = localhost only
   - No external access needed
   - Future: Add HTTPS if exposing publicly

## Future Enhancements

### Voice Input via Jarvis
User speaks to Siri/HomePod → Jarvis transcribes → Cookie API

### Multi-User Support
Track which user added each recipe:
```json
{
  "userId": "josh",
  "userName": "Josh Petersen",
  "source": "iMessage via Jarvis"
}
```

### Recipe Collections
"Add this to my Christmas recipes"
```json
{
  "text": "...",
  "collections": ["christmas", "baking"]
}
```

### Automatic URL Recognition
Jarvis detects URLs in any message (not just "add recipe") and offers to add:
```
User: "Check out this recipe: https://..."
Jarvis: "That looks like a recipe! Would you like me to add it to Cookie? Reply YES or NO"
```

## Troubleshooting

### Jarvis doesn't respond to "Add recipe"
1. Check OpenClaw is running: `ps aux | grep openclaw`
2. Check action configuration: `cat ~/.openclaw/workspace-jarvis/actions/add-recipe.yaml`
3. Check Jarvis logs: `tail -f ~/.openclaw/logs/jarvis.log`

### Jarvis responds but recipe not added
1. Test Cookie API directly with curl (see Testing section)
2. Check Cookie backend is running: `pm2 status cookie-api`
3. Check Cookie logs: `pm2 logs cookie-api`
4. Verify secret token matches in both .env files

### Recipe parsed incorrectly
1. Check Claude API response in Cookie logs
2. Try with simpler/clearer recipe format
3. Consider adding example recipes to Claude prompt for better parsing

### Connection refused
1. Verify Cookie backend running on port 3000: `lsof -i :3000`
2. Check firewall settings on Mac Mini
3. Verify URL in Jarvis config: `http://localhost:3000` (not `https`)

## Contact

If issues persist, check:
- Cookie backend logs: `pm2 logs cookie-api`
- Jarvis logs: OpenClaw workspace logs
- PostgreSQL status: `brew services list | grep postgresql`
- Network connectivity: `ping localhost` and `curl http://localhost:3000/api/health`
