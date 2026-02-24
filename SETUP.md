# Cookie Setup Guide

Complete setup instructions for running Cookie locally on any machine.

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Anthropic API key (for recipe parsing)

## Quick Start

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd cookie
```

### 2. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Install and start PostgreSQL (if not already running)
brew install postgresql@16
brew services start postgresql@16

# Create database and run migrations
createdb cookie
npm run db:migrate

# Optional: Add sample recipes
npm run db:seed

# Start development server
npm run dev
```

Backend will run on `http://localhost:3000`

### 3. Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

### 4. Open in Browser

Navigate to `http://localhost:5173`

## Environment Variables

### Backend (.env)

```bash
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://localhost:5432/cookie

# Anthropic AI
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Jarvis Integration (optional)
JARVIS_SECRET_TOKEN=your-secret-token

# CORS (optional)
ALLOWED_ORIGINS=http://localhost:5173
```

## Database Commands

```bash
# Create database
createdb cookie

# Run migrations
npm run db:migrate

# Seed sample data
npm run db:seed

# Reset database (drops and recreates)
dropdb cookie && createdb cookie && npm run db:migrate && npm run db:seed
```

## Development Workflow

### Starting Fresh Each Day

```bash
# Terminal 1 - Backend
cd cookie/server
npm run dev

# Terminal 2 - Frontend
cd cookie/client
npm run dev
```

### Making Changes

1. Make your changes
2. Test locally
3. Commit and push:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```

### Working on Another Machine

```bash
git pull
npm install  # in both client/ and server/ if package.json changed
```

## Common Issues

### PostgreSQL Not Running

```bash
# Check status
brew services list | grep postgresql

# Start if stopped
brew services start postgresql@16

# Restart if having issues
brew services restart postgresql@16
```

### Database Connection Failed

```bash
# Check PostgreSQL is running
psql -d cookie -c "SELECT NOW();"

# Check DATABASE_URL in .env matches your setup
```

### Port Already in Use

```bash
# Find what's using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Missing API Key

Make sure `ANTHROPIC_API_KEY` is set in `server/.env`:
```bash
cd server
echo $ANTHROPIC_API_KEY  # Should not be empty
```

## API Endpoints

Once backend is running:

- Health check: `GET http://localhost:3000/api/health`
- List recipes: `GET http://localhost:3000/api/recipes`
- Fetch from URL: `POST http://localhost:3000/api/recipes/url`
- Parse text: `POST http://localhost:3000/api/recipes/parse`

## Testing

```bash
# Backend tests (when implemented)
cd server
npm test

# Frontend tests
cd client
npm test
```

## Production Deployment

See `server/DEPLOYMENT.md` for deploying to a production server (like Mac Mini).

## Architecture

- **Frontend**: React + Vite (client/)
- **Backend**: Node.js + Express (server/)
- **Database**: PostgreSQL
- **AI**: Anthropic Claude API for recipe parsing

## Documentation

- `SETUP.md` - This file (getting started)
- `TODO.md` - Current tasks and future plans
- `server/DEPLOYMENT.md` - Production deployment guide
- `docs/BACKEND_ARCHITECTURE.md` - System design
- `docs/JARVIS_INTEGRATION.md` - Jarvis integration guide
- `CLAUDE.md` - Instructions for Claude Code assistant

## Getting Help

1. Check the Common Issues section above
2. Review documentation in `docs/`
3. Check the TODO.md for known issues
4. Inspect browser console (F12) for frontend errors
5. Check server logs for backend errors
