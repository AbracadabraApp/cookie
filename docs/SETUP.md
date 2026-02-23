# Setup Guide

## Environment Variables

Copy `.env.example` to `.env` in the `server/` directory and fill in the values:
```env
# Database
DATABASE_URL=postgresql://localhost:5432/cookie_dev

# Anthropic (AI features — recipe parsing, ingredient extraction)
ANTHROPIC_API_KEY=sk-ant-...

# Railway (deployment — not needed for local dev)
RAILWAY_TOKEN=your-railway-token

# App
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

## Database Setup

### Create the database
```bash
createdb cookie_dev
```

### Run migrations
```bash
cd server
npm run db:migrate
```

### Seed sample data (optional)
```bash
npm run db:seed
```

This adds a few sample recipes and ingredients so you can start testing right away.

## Running Locally

From the project root:
```bash
npm run dev
```

This starts both the client (Vite on `:5173`) and server (Express on `:3001`) concurrently.

## Troubleshooting

| Problem | Fix |
|---|---|
| `ECONNREFUSED` on database | Make sure PostgreSQL is running: `pg_isready` |
| Anthropic API errors | Check your API key is set and has credits |
| Port already in use | Kill the process on that port or change `PORT` in `.env` |
