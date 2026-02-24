# Development Guide

Quick reference for developing Cookie across different machines.

## Philosophy

**Git is the source of truth.** All setup instructions live in the repo, so you can develop from any machine.

## First Time on a New Machine

```bash
# 1. Clone
git clone <your-repo-url>
cd cookie

# 2. Read setup guide
cat SETUP.md

# 3. Follow the setup steps
# (Install PostgreSQL, create database, set up .env, etc.)

# 4. Start developing
```

## Daily Development

### On Any Machine

```bash
# Pull latest changes
git pull

# Start backend (Terminal 1)
cd server
npm run dev

# Start frontend (Terminal 2)
cd client
npm run dev
```

### After Making Changes

```bash
git add .
git commit -m "Your changes"
git push
```

### On Next Machine

```bash
git pull
# Continue where you left off
```

## Machine-Specific Notes

### Your Laptop
- Frontend development
- Can connect to backend on Mac Mini or localhost

### Mac Mini (jarviss-mac-mini.local)
- Backend development
- PostgreSQL database
- Always-on server for testing from other devices

## Connecting Frontend to Remote Backend

If running backend on Mac Mini, update frontend API URLs:

**Option 1: Environment variable (recommended)**

Create `client/.env.local`:
```bash
VITE_API_URL=http://jarviss-mac-mini.local:3000
```

Then in code:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
fetch(`${API_URL}/api/recipes`);
```

**Option 2: Direct change (temporary)**

In `client/src/pages/AddRecipePage.jsx`:
```javascript
// Change from:
fetch('http://localhost:3000/api/recipes/url', ...)

// To:
fetch('http://jarviss-mac-mini.local:3000/api/recipes/url', ...)
```

## What's Machine-Specific

**Never commit these:**
- `.env` files (use `.env.example` as template)
- `node_modules/` (install with `npm install`)
- Database data (use migrations and seeds)
- API keys

**Always commit these:**
- Source code
- Database migrations (`server/src/db/migrations/`)
- Database seeds (`server/src/db/seeds/`)
- Setup documentation
- Package files (`package.json`, `package-lock.json`)

## Typical Workflows

### Backend Feature Development

```bash
# On Mac Mini or any machine with PostgreSQL
cd cookie/server

# Make changes to backend code
# Test with curl or Postman

curl http://localhost:3000/api/recipes

# Commit and push
git add .
git commit -m "Add new API endpoint"
git push
```

### Frontend Feature Development

```bash
# On laptop (can use remote backend)
cd cookie/client

# Make changes to React components
# Test in browser

# Commit and push
git add .
git commit -m "Update recipe card design"
git push
```

### Database Schema Changes

```bash
# Create migration file
cd server/src/db/migrations
# Create new .sql file with timestamp

# Run migration
npm run db:migrate

# Commit migration file
git add src/db/migrations/
git commit -m "Add user authentication table"
git push

# On other machines
git pull
npm run db:migrate  # Apply new migration
```

## Debugging Across Machines

### Backend Issues

```bash
# Check server logs
cd server
npm run dev  # Watch for errors

# Check database
psql -d cookie
\dt  # List tables
SELECT * FROM recipes LIMIT 5;
```

### Frontend Issues

```bash
# Check browser console (F12)
# Check network tab for API calls

# Verify API URL
cd client
grep -r "localhost:3000" src/
```

### Connection Issues

```bash
# Test backend is accessible
curl http://jarviss-mac-mini.local:3000/api/health

# Check firewall isn't blocking
ping jarviss-mac-mini.local
```

## Pro Tips

1. **Always `git pull` when switching machines**
2. **Use `.env.example` to document required environment variables**
3. **Database migrations > direct SQL changes** (so they're in git)
4. **Test on localhost first**, then test with remote backend
5. **Use feature branches** for experimental work
6. **Commit often** with clear messages

## Remote Development Setup (Optional)

### VS Code Remote SSH

```bash
# In VS Code
Cmd+Shift+P > "Remote-SSH: Connect to Host"
# Enter: jarviss-mac-mini.local

# Now you can edit files on Mac Mini directly
# Terminal runs on Mac Mini
# All tools are on Mac Mini
```

### Terminal SSH

```bash
ssh jarviss-mac-mini.local
cd ~/cookie
# Work directly on Mac Mini
```

## Current State

- ✅ Frontend: Full feature set, page-based navigation
- ✅ Backend: API routes implemented, needs PostgreSQL running
- ⏳ Database: Schema defined, not yet deployed
- ⏳ Integration: Frontend ready to call backend APIs

Next steps: Run through SETUP.md on Mac Mini to get backend operational.
