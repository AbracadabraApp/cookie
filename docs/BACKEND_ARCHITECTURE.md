# Backend Architecture

## Overview

Cookie backend is a Node.js/Express API that:
1. Serves a shared public recipe catalog
2. Processes recipe input from 4 sources (manual, paste, PDF, Jarvis)
3. Uses Claude API to parse unstructured recipe text/PDFs into structured data
4. Stores recipes in PostgreSQL
5. Provides REST endpoints for frontend and Jarvis integration

## Deployment Environment

**Mac Mini (jarviss-mac-mini.local)**
- Node.js v25.6.0 ✅
- PostgreSQL: NOT installed (need to install)
- PM2: NOT installed (should install for process management)
- Jarvis (OpenClaw agent): Running as Launch Agent, auto-restarts on reboot
- OpenClaw workspace: `~/.openclaw/workspace-jarvis`

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Cookie Frontend                         │
│                   (React + Vite on port 5173)               │
│                                                              │
│  - Recipe browsing                                          │
│  - Manual recipe entry                                      │
│  - Paste text input                                         │
│  - PDF upload                                               │
│  - Shopping list management (localStorage)                  │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP API calls
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Cookie Backend API                        │
│                  (Express on port 3000)                      │
│                                                              │
│  Endpoints:                                                  │
│  • GET    /api/recipes          - List all recipes          │
│  • GET    /api/recipes/:id      - Get single recipe         │
│  • POST   /api/recipes          - Create recipe (manual)    │
│  • POST   /api/recipes/parse    - Parse text with Claude    │
│  • POST   /api/recipes/pdf      - Parse PDF with Claude     │
│  • POST   /api/jarvis/recipe    - Recipe from Jarvis        │
│  • DELETE /api/recipes/:id      - Delete recipe             │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        ▼                              ▼
┌──────────────────┐          ┌──────────────────┐
│  PostgreSQL DB   │          │   Claude API     │
│                  │          │                  │
│  - Recipes       │          │  - Text parsing  │
│  - Ingredients   │          │  - PDF parsing   │
│  - Categories    │          │  - Structured    │
│                  │          │    output        │
└──────────────────┘          └──────────────────┘
        ▲
        │
        │ HTTP POST /api/jarvis/recipe
┌───────┴────────────────────────────────────────────────────┐
│                     Jarvis (OpenClaw)                       │
│              (Running on Mac Mini via Launch Agent)        │
│                                                             │
│  User sends iMessage:                                      │
│  "Add recipe: [paste recipe text or URL]"                 │
│                                                             │
│  Jarvis:                                                   │
│  1. Receives iMessage via BlueBubbles                      │
│  2. Extracts recipe text/URL                               │
│  3. POSTs to Cookie API /api/jarvis/recipe                │
│  4. Responds to user: "Added [Recipe Name] to Cookie!"     │
└────────────────────────────────────────────────────────────┘
```

## Recipe Input Flow

### 1. Manual Entry
**User Flow:**
- User fills out form in AddRecipe component
- Frontend validates and sends POST to `/api/recipes`
- Backend saves directly to database (no AI needed)

**API:**
```
POST /api/recipes
Content-Type: application/json

{
  "title": "Pasta Carbonara",
  "description": "...",
  "source": "Manual",
  "ingredients": [
    {
      "name": "spaghetti",
      "quantity": 1,
      "unit": "pound",
      "notes": "dried"
    }
  ],
  "directions": ["Step 1...", "Step 2..."],
  "prepTime": 15,
  "cookTime": 20,
  "servings": 4
}
```

### 2. Cut & Paste Text
**User Flow:**
- User pastes recipe text into textarea
- Frontend sends text to `/api/recipes/parse`
- Backend calls Claude API to extract structured data
- Backend returns parsed recipe for preview/editing
- User confirms, frontend sends POST to `/api/recipes`

**API:**
```
POST /api/recipes/parse
Content-Type: application/json

{
  "text": "Pasta Carbonara\n\nIngredients:\n1 lb spaghetti\n..."
}

Response:
{
  "title": "Pasta Carbonara",
  "ingredients": [...],
  "directions": [...],
  "prepTime": 15,
  "cookTime": 20,
  "servings": 4,
  "confidence": "high"
}
```

### 2b. Paste URL (New!)
**User Flow:**
- User pastes recipe URL into input field
- Frontend sends URL to `/api/recipes/url`
- Backend fetches and parses URL (3 methods: recipe-scraper, schema.org, plain text + Claude)
- Backend returns structured recipe for preview/editing
- User confirms, frontend sends POST to `/api/recipes`

**API:**
```
POST /api/recipes/url
Content-Type: application/json

{
  "url": "https://www.seriouseats.com/pasta-carbonara"
}

Response:
{
  "method": "recipe_scraper",  // or "schema_org" or "plain_text"
  "needsClaude": false,        // true if plain text needed Claude parsing
  "title": "Pasta Carbonara",
  "ingredients": [...],
  "directions": [...],
  "prepTime": 15,
  "cookTime": 20,
  "servings": 4,
  "url": "https://www.seriouseats.com/pasta-carbonara"
}
```

**Supported Sites:**
- Any site with schema.org Recipe markup (40% of recipe sites)
- Popular recipe sites via recipe-scraper: AllRecipes, Food Network, Serious Eats, NYT Cooking, Bon Appetit, Epicurious, and 100+ more
- Fallback: Any site with plain text recipes (parsed by Claude)

### 3. PDF Upload
**User Flow:**
- User uploads PDF file
- Frontend sends file to `/api/recipes/pdf`
- Backend sends PDF to Claude API (vision mode)
- Backend returns parsed recipe for preview/editing
- User confirms, frontend sends POST to `/api/recipes`

**API:**
```
POST /api/recipes/pdf
Content-Type: multipart/form-data

file: [PDF binary data]

Response: Same as /parse endpoint
```

### 4. Message to Jarvis
**User Flow:**
- User sends iMessage: "Add recipe: [text or URL]"
- Jarvis receives message via BlueBubbles integration
- Jarvis POSTs to Cookie API `/api/jarvis/recipe`
- Cookie backend parses with Claude, saves to DB
- Cookie responds with recipe details
- Jarvis replies to user with confirmation

**API:**
```
POST /api/jarvis/recipe
Content-Type: application/json
Authorization: Bearer [jarvis-secret-token]

{
  "text": "Recipe text...",
  "url": "https://example.com/recipe",  // optional
  "userId": "jarvis",                    // for tracking
  "source": "iMessage"
}

Response:
{
  "success": true,
  "recipe": {
    "id": 123,
    "title": "Pasta Carbonara",
    "ingredientCount": 8
  }
}
```

## Database Schema

See `docs/DATA_MODEL.md` for full schema. Key tables:

- **recipes**: Core recipe data (title, description, times, servings)
- **recipe_ingredients**: Ingredients with quantities, units, notes
- **categories**: Tag-based categorization (Dinner, Italian, Quick, etc.)

## Technology Decisions

### Why Node.js + Express?
- Same language as frontend (JavaScript/TypeScript)
- Simple REST API needs
- Already installed on Mac Mini (v25.6.0)
- Easy to run alongside Jarvis

### Why PostgreSQL?
- Relational data model fits recipes → ingredients
- Strong JSON support for flexible recipe fields
- Production-ready (vs. SQLite for toy projects)
- **Action needed**: Install on Mac Mini

### Why PM2?
- Process management for production
- Auto-restart on crashes
- Log management
- Same pattern as Jarvis (Launch Agent)
- **Action needed**: Install on Mac Mini

### Why Claude API?
- Excellent structured output for recipe parsing
- Handles messy/varied recipe formats
- PDF vision mode for scanned recipes
- Same AI provider already familiar to user

## Development Roadmap

### Phase 1: Basic Backend (Current)
- [ ] Install PostgreSQL on Mac Mini
- [ ] Install PM2 on Mac Mini
- [x] Create Express server scaffold
- [x] Set up database schema
- [x] Implement GET /api/recipes (list & detail)
- [x] Implement POST /api/recipes (manual entry)

### Phase 2: AI Integration
- [x] Set up Claude API client
- [x] Implement POST /api/recipes/parse (text parsing)
- [x] Implement POST /api/recipes/url (URL fetching with recipe-scraper + schema.org + Claude fallback)
- [ ] Implement POST /api/recipes/pdf (PDF parsing with Claude Vision)
- [ ] Add preview/edit flow in frontend

### Phase 3: Jarvis Integration
- [x] Create POST /api/jarvis/recipe endpoint
- [x] Add authentication (shared secret token)
- [ ] Update Jarvis OpenClaw workspace to call Cookie API
- [ ] Test iMessage → Jarvis → Cookie flow

### Phase 4: Frontend Integration
- [ ] Convert Demo.jsx from hardcoded data to API calls
- [ ] Enhance AddRecipe component with all 4 input methods
- [ ] Add recipe management (edit, delete)
- [ ] Add loading states and error handling

## Security Considerations

### Jarvis Endpoint
- Shared secret token in environment variable
- Rate limiting (max 10 recipes/hour from Jarvis)
- Input validation and sanitization
- Log all Jarvis requests for debugging

### Public Endpoints
- No authentication initially (shared catalog)
- Rate limiting on parse endpoints (Claude API costs)
- File size limits on PDF uploads (10MB max)
- Input validation on all endpoints

### Future: User Authentication
- When adding cross-device sync
- JWT tokens for session management
- User-specific recipe collections
- Private vs. public recipes

## API Response Format

All endpoints follow consistent format:

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Recipe title is required",
    "details": { ... }
  }
}
```

## Environment Variables

```bash
# Server
PORT=3000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/cookie

# AI
ANTHROPIC_API_KEY=sk-ant-...

# Jarvis Integration
JARVIS_SECRET_TOKEN=random-secret-here

# CORS
ALLOWED_ORIGINS=http://localhost:5173,https://cookie.yourdomain.com
```

## Deployment

### Mac Mini Setup
```bash
# Install PostgreSQL
brew install postgresql@16
brew services start postgresql@16

# Install PM2 globally
npm install -g pm2

# Set up Cookie backend
cd ~/cookie/server
npm install

# Create database
createdb cookie
npm run db:migrate

# Start with PM2
pm2 start npm --name "cookie-api" -- start
pm2 save
pm2 startup  # Enable auto-start on reboot
```

### PM2 Configuration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'cookie-api',
    script: './src/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

## Monitoring

- PM2 logs: `pm2 logs cookie-api`
- Health check endpoint: GET `/api/health`
- Database connection checks
- Claude API usage tracking
- Jarvis request logging

## Testing Strategy

- **Unit tests**: All utility functions and models
- **Integration tests**: API endpoints with test database
- **E2E tests**: Frontend → Backend → Database flows
- **Manual testing**: Jarvis iMessage integration

See `client/CLAUDE.md` for frontend testing details (110 tests, 100% coverage on utils).
