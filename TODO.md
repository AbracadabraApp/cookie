# Cookie - Next Steps

Last updated: 2025-02-24

## Session Summary

✅ **Completed Today:**
- **Frontend UX Redesign:** Converted to NYT Cooking-inspired sophisticated design
- **Navigation Overhaul:** Changed from modals to page-based routing with React Router
- **Recipe Pages:** RecipeDetail now a full page with back button, shareable URLs
- **Add Recipe Page:** Tabbed interface (URL / Upload PDF / Paste or Write)
- **Checkbox Sync:** Fixed ingredient checkbox state persistence across page navigation
- **Backend Integration:** Connected frontend to URL fetching and text parsing APIs
- **Development Docs:** Created SETUP.md and DEVELOPMENT.md for machine-independent workflow
- **Bug Fixes:** Fixed recipe-scraper import, nduja quote syntax, improved error logging

✅ **Previously Completed:**
- Built complete Cookie backend (Express + PostgreSQL)
- Created all database schemas and migrations
- Implemented Recipe CRUD endpoints
- Added Claude API integration for recipe text parsing
- Created Jarvis integration endpoint with auth
- Added URL fetching capability (recipe-scraper + schema.org + Claude fallback)
- Comprehensive documentation (BACKEND_ARCHITECTURE.md, JARVIS_INTEGRATION.md, DEPLOYMENT.md)

## Immediate Next Steps

### 1. Deploy Backend to Mac Mini
**Status:** Ready to deploy
**Blockers:** Need to install PostgreSQL and PM2 on Mac Mini

**Steps:**
```bash
# On Mac Mini (jarviss-mac-mini.local)
brew install postgresql@16
brew services start postgresql@16

npm install -g pm2

cd ~/cookie/server
npm install
cp .env.example .env
# Edit .env with API keys

createdb cookie
npm run db:migrate
npm run db:seed

pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

**See:** `server/DEPLOYMENT.md` for complete guide

---

### 2. ~~Update Frontend for URL Input~~ ✅ DONE
**Status:** Complete - tabbed interface implemented

**Completed:**
- ✅ Add URL input tab to AddRecipe page
- ✅ Create URL input form with validation
- ✅ Connected to backend API endpoint
- ✅ Add loading states and error handling
- ⏳ Test with real recipe URLs (needs backend running with PostgreSQL)

**Files modified:**
- `client/src/pages/AddRecipePage.jsx` - New page with tabs
- `client/src/App.jsx` - Added route

---

### 3. Configure Jarvis Integration
**Status:** Backend ready, Jarvis needs action config
**Time estimate:** 30 minutes

**Tasks:**
- [ ] Create Jarvis action file: `~/.openclaw/workspace-jarvis/actions/add-recipe.yaml`
- [ ] Add JARVIS_SECRET_TOKEN to both Cookie and Jarvis .env files
- [ ] Test iMessage → Jarvis → Cookie flow
- [ ] Test URL sharing via Jarvis

**Action config needed:**
```yaml
name: add_recipe
description: Add recipe to Cookie from iMessage
triggers:
  - pattern: "add recipe:? (.*)"
  - pattern: "save recipe:? (.*)"

action:
  type: http_request
  url: http://localhost:3000/api/jarvis/recipe
  method: POST
  headers:
    Authorization: Bearer ${JARVIS_SECRET_TOKEN}
  body:
    text: "${match.group1}"
    source: "iMessage"
```

**See:** `docs/JARVIS_INTEGRATION.md` for complete guide

---

### 4. Connect Frontend to Backend API
**Status:** Backend live, frontend uses hardcoded data
**Time estimate:** 2-3 hours

**Tasks:**
- [ ] Replace hardcoded recipes in Demo.jsx with API calls
- [ ] Implement GET /api/recipes in frontend
- [ ] Implement GET /api/recipes/:id for recipe details
- [ ] Add error handling and loading states
- [ ] Keep localStorage for shopping lists (as designed)

**Changes needed:**
```javascript
// Before (current):
const recipes = hardcodedRecipes;

// After:
const [recipes, setRecipes] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetch('http://localhost:3000/api/recipes')
    .then(res => res.json())
    .then(data => setRecipes(data.data))
    .catch(err => console.error(err))
    .finally(() => setLoading(false));
}, []);
```

---

## Future Enhancements

### PDF Upload Support
**Status:** Placeholder exists, needs Claude Vision integration
**Time estimate:** 3-4 hours

- [ ] Implement Claude Vision API calls for PDF parsing
- [ ] Add PDF-to-image conversion
- [ ] Test with scanned cookbook pages
- [ ] Add to frontend upload UI

**File:** `server/src/services/claude.js` - `parseRecipePDF()` function

---

### Recipe Editing
**Status:** Backend supports it, frontend doesn't
**Time estimate:** 2 hours

- [ ] Add "Edit Recipe" button to RecipeDetail modal
- [ ] Create edit form (reuse AddRecipe component?)
- [ ] Implement PUT /api/recipes/:id in frontend
- [ ] Add validation and error handling

---

### Recipe Search & Filtering
**Status:** Backend supports it, frontend needs UI
**Time estimate:** 1-2 hours

- [ ] Add search bar to Demo page
- [ ] Add category filter dropdown
- [ ] Implement client-side search while typing
- [ ] Add "Clear filters" button

**Backend already supports:**
- `GET /api/recipes?search=pasta`
- `GET /api/recipes?category=Italian`

---

### Shopping List Export
**Status:** Not implemented
**Time estimate:** 1 hour

- [ ] Add "Export" button to shopping list
- [ ] Generate formatted text/PDF
- [ ] Add copy-to-clipboard option
- [ ] Add email/share options

---

### User Authentication (Long-term)
**Status:** Not started, not required yet
**Time estimate:** 1 week

When you want:
- Cross-device shopping list sync
- Private recipe collections
- Multi-user support

**Changes needed:**
- Add Users table to database
- Implement JWT authentication
- Update all endpoints for user context
- Migrate localStorage to database
- Add login/signup UI

---

## Technical Debt & Polish

### Testing
- [ ] Add server-side tests (vitest)
- [ ] Test URL fetching with various recipe sites
- [ ] Integration tests for Jarvis → Cookie flow
- [ ] E2E tests for frontend → backend

### Security
- [ ] Add rate limiting to public endpoints
- [ ] Implement CORS properly for production
- [ ] Rotate JARVIS_SECRET_TOKEN regularly
- [ ] Add input sanitization for all text fields

### Performance
- [ ] Add database indexes for common queries
- [ ] Implement caching for recipe list
- [ ] Optimize Claude API calls (batch if possible)
- [ ] Add pagination for recipe list

### Error Handling
- [ ] Better error messages from backend
- [ ] Frontend error boundary component
- [ ] Retry logic for failed API calls
- [ ] User-friendly error notifications

---

## Known Issues

1. **Frontend quote syntax** - Fixed in recipes.js line 60
2. **No backend server running yet** - Need to deploy to Mac Mini
3. **PDF parsing not implemented** - Marked as TODO in code
4. **No loading states** - Frontend needs spinners/skeletons

---

## Quick Reference

### Important Files

**Backend:**
- `server/src/index.js` - Main Express server
- `server/src/routes/recipes.js` - Recipe endpoints
- `server/src/routes/jarvis.js` - Jarvis integration
- `server/src/services/claude.js` - Claude API client
- `server/src/services/urlFetcher.js` - URL fetching (NEW!)
- `server/src/db/schema.sql` - Database schema

**Frontend:**
- `client/src/pages/Demo.jsx` - Main app page (recipe library + shopping list)
- `client/src/pages/RecipeDetailPage.jsx` - Full recipe page
- `client/src/pages/AddRecipePage.jsx` - Add recipe page with tabs
- `client/src/components/ShoppingList.jsx` - Shopping list UI
- `client/src/App.jsx` - React Router setup

**Documentation:**
- `SETUP.md` - First-time setup guide (NEW!)
- `DEVELOPMENT.md` - Multi-machine development workflow (NEW!)
- `TODO.md` - This file (task tracking)
- `docs/BACKEND_ARCHITECTURE.md` - System design
- `docs/JARVIS_INTEGRATION.md` - Jarvis setup
- `server/DEPLOYMENT.md` - Mac Mini deployment
- `CLAUDE.md` - AI assistant context

### API Endpoints

```
GET    /api/health                  - Health check
GET    /api/recipes                 - List recipes
GET    /api/recipes/:id             - Get recipe
POST   /api/recipes                 - Create recipe
POST   /api/recipes/url             - Fetch from URL (NEW!)
POST   /api/recipes/parse           - Parse text
PUT    /api/recipes/:id             - Update recipe
DELETE /api/recipes/:id             - Delete recipe
POST   /api/jarvis/recipe           - Jarvis integration
GET    /api/jarvis/health           - Jarvis health check
```

### Environment Variables

```bash
# Backend (.env)
PORT=3000
NODE_ENV=production
DATABASE_URL=postgresql://localhost:5432/cookie
ANTHROPIC_API_KEY=sk-ant-...
JARVIS_SECRET_TOKEN=random-secret-here
ALLOWED_ORIGINS=http://localhost:5173
```

---

## Questions to Decide

1. **Should shopping lists sync to database?**
   - Current: localStorage (private, no sync)
   - Future: Database (requires auth, cross-device)

2. **Should recipes be public or private by default?**
   - Current: All recipes shared
   - Future: Option for private collections?

3. **Should we add recipe ratings/favorites?**
   - Not implemented yet
   - Would require user accounts

4. **Should we add meal planning features?**
   - Weekly meal plan view
   - Calendar integration
   - Aggregate shopping lists by week

---

## Resources

- [Express Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Anthropic Claude API](https://docs.anthropic.com/)
- [recipe-scraper on npm](https://www.npmjs.com/package/recipe-scraper)
- [OpenClaw Documentation](https://github.com/OpenClaw/openclaw)
