# Cookie Server

Backend API for Cookie - recipe-driven shopping list builder.

## Quick Start

### Prerequisites
- Node.js >= 18
- PostgreSQL 14+
- PM2 (for production deployment)

### Development Setup

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and API keys
   ```

3. **Create database:**
   ```bash
   createdb cookie
   ```

4. **Run migrations:**
   ```bash
   npm run db:migrate
   ```

5. **Seed database (optional):**
   ```bash
   npm run db:seed
   ```

6. **Start development server:**
   ```bash
   npm run dev
   ```

Server will run on http://localhost:3000

### Production Deployment (Mac Mini)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed Mac Mini setup instructions.

Quick version:
```bash
# Install PostgreSQL
brew install postgresql@16
brew services start postgresql@16

# Install PM2
npm install -g pm2

# Set up database
createdb cookie
npm run db:migrate
npm run db:seed

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## API Endpoints

### Recipes

- `GET /api/recipes` - List all recipes
- `GET /api/recipes?category=Italian` - Filter by category
- `GET /api/recipes?search=pasta` - Search recipes
- `GET /api/recipes/:id` - Get single recipe
- `POST /api/recipes` - Create recipe (manual entry)
- `POST /api/recipes/url` - Fetch and parse recipe from URL ✨ NEW
- `POST /api/recipes/parse` - Parse recipe text with Claude
- `POST /api/recipes/pdf` - Parse PDF with Claude (not yet implemented)
- `PUT /api/recipes/:id` - Update recipe
- `DELETE /api/recipes/:id` - Delete recipe

### Jarvis Integration

- `POST /api/jarvis/recipe` - Add recipe from Jarvis (requires auth)
- `GET /api/jarvis/health` - Health check (requires auth)

### Health Check

- `GET /api/health` - API health status

## Environment Variables

See `.env.example` for all configuration options.

Required:
- `DATABASE_URL` - PostgreSQL connection string
- `ANTHROPIC_API_KEY` - Claude API key for recipe parsing
- `JARVIS_SECRET_TOKEN` - Shared secret for Jarvis authentication

Optional:
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `ALLOWED_ORIGINS` - CORS allowed origins

## Architecture

See documentation in `docs/`:
- [BACKEND_ARCHITECTURE.md](../docs/BACKEND_ARCHITECTURE.md) - System architecture
- [JARVIS_INTEGRATION.md](../docs/JARVIS_INTEGRATION.md) - Jarvis integration guide
- [DATA_MODEL.md](../docs/DATA_MODEL.md) - Database schema

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server (with auto-reload)
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample recipes
- `npm test` - Run tests
- `npm run test:coverage` - Run tests with coverage

## PM2 Commands

```bash
# Start
pm2 start ecosystem.config.js

# Stop
pm2 stop cookie-api

# Restart
pm2 restart cookie-api

# View logs
pm2 logs cookie-api

# Monitor
pm2 monit

# Status
pm2 status
```

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Test with curl
curl http://localhost:3000/api/health
```

## Troubleshooting

### Database connection issues
```bash
# Check PostgreSQL is running
brew services list | grep postgresql

# Test connection
psql -d cookie -c "SELECT NOW();"
```

### API key issues
```bash
# Verify environment variables are loaded
node -e "require('dotenv').config(); console.log(process.env.ANTHROPIC_API_KEY ? 'Key loaded' : 'Key missing');"
```

### PM2 issues
```bash
# View error logs
pm2 logs cookie-api --err

# Restart process
pm2 restart cookie-api

# Clear logs and restart
pm2 flush && pm2 restart cookie-api
```

## Development

### Adding new routes
1. Create route file in `src/routes/`
2. Import in `src/index.js`
3. Add to router: `app.use('/api/your-route', yourRoute)`

### Adding new models
1. Create model in `src/models/`
2. Add database schema to `src/db/schema.sql`
3. Import in routes as needed

### Database migrations
For schema changes:
1. Update `src/db/schema.sql`
2. Run `npm run db:migrate` to apply changes
3. Update seed data if needed

## Contributing

See main project README for contribution guidelines.
