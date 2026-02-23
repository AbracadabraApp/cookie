# Cookie Server Deployment Guide

Complete guide for deploying Cookie backend to Mac Mini (jarviss-mac-mini.local).

## Current Mac Mini Status

**Installed:**
- ✅ Node.js v25.6.0
- ✅ Jarvis (OpenClaw agent) running as Launch Agent
- ✅ OpenClaw workspace at `~/.openclaw/workspace-jarvis`

**Need to Install:**
- ❌ PostgreSQL
- ❌ PM2

## Pre-Deployment Checklist

- [ ] SSH access to Mac Mini configured
- [ ] PostgreSQL installed and running
- [ ] PM2 installed globally
- [ ] Cookie repository cloned/synced to Mac Mini
- [ ] Environment variables configured
- [ ] Anthropic API key obtained
- [ ] Jarvis secret token generated

## Step-by-Step Deployment

### 1. Install PostgreSQL

```bash
# Connect to Mac Mini
ssh jarviss-mac-mini.local

# Install PostgreSQL via Homebrew
brew install postgresql@16

# Start PostgreSQL service
brew services start postgresql@16

# Verify installation
psql --version
# Should show: psql (PostgreSQL) 16.x

# Test connection
psql postgres -c "SELECT version();"
```

### 2. Install PM2

```bash
# Install PM2 globally
npm install -g pm2

# Verify installation
pm2 --version

# Set up PM2 startup script (auto-start on reboot)
pm2 startup
# Follow the command it outputs (will be something like):
# sudo env PATH=$PATH:/usr/local/bin pm2 startup launchd -u yourusername --hp /Users/yourusername
```

### 3. Clone/Sync Cookie Repository

```bash
# Option A: Clone from GitHub (if repo is pushed)
cd ~
git clone https://github.com/yourusername/cookie.git

# Option B: Sync from local machine via rsync
# Run this from your LOCAL machine (not Mac Mini):
rsync -avz --exclude 'node_modules' --exclude '.git' \
  ~/cookie/ jarviss-mac-mini.local:~/cookie/
```

### 4. Install Dependencies

```bash
cd ~/cookie/server
npm install

# Verify key packages installed
npm list express pg @anthropic-ai/sdk
```

### 5. Configure Environment

```bash
cd ~/cookie/server

# Copy example env file
cp .env.example .env

# Edit .env with your values
nano .env
```

**Required environment variables:**
```bash
# Server Configuration
PORT=3000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://localhost:5432/cookie

# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-your-actual-api-key-here

# Jarvis Integration
JARVIS_SECRET_TOKEN=your-random-secret-token-here

# CORS
ALLOWED_ORIGINS=http://localhost:5173
```

**Generate Jarvis secret token:**
```bash
# Generate random token
openssl rand -hex 32
# Copy output to JARVIS_SECRET_TOKEN in .env
```

### 6. Set Up Database

```bash
cd ~/cookie/server

# Create database
createdb cookie

# Verify database exists
psql -l | grep cookie

# Run migrations (create schema)
npm run db:migrate

# Seed with sample recipes (optional)
npm run db:seed

# Verify tables created
psql -d cookie -c "\dt"
```

### 7. Test Server Locally

```bash
# Start server in development mode
npm run dev

# In another terminal, test health endpoint
curl http://localhost:3000/api/health

# Should return:
# {"success":true,"status":"healthy","timestamp":"...","services":{"database":"connected","api":"running"}}

# Test recipe listing
curl http://localhost:3000/api/recipes

# Stop dev server (Ctrl+C)
```

### 8. Start with PM2

```bash
cd ~/cookie/server

# Create logs directory
mkdir -p logs

# Start with PM2
pm2 start ecosystem.config.js

# Verify running
pm2 status

# Should show:
# ┌─────┬──────────────┬─────────┬─────────┐
# │ id  │ name         │ status  │ restart │
# ├─────┼──────────────┼─────────┼─────────┤
# │ 0   │ cookie-api   │ online  │ 0       │
# └─────┴──────────────┴─────────┴─────────┘

# View logs
pm2 logs cookie-api

# Save PM2 process list (for auto-restart on reboot)
pm2 save
```

### 9. Configure Jarvis Integration

Now configure Jarvis to call Cookie API.

**Create Jarvis action file:**
```bash
# Create action directory if doesn't exist
mkdir -p ~/.openclaw/workspace-jarvis/actions

# Create add-recipe action
nano ~/.openclaw/workspace-jarvis/actions/add-recipe.yaml
```

**Action configuration (example - adjust to OpenClaw syntax):**
```yaml
name: add_recipe
description: Add a recipe to Cookie app from iMessage
triggers:
  - pattern: "add recipe:? (.*)"
    caseSensitive: false
  - pattern: "save this recipe:? (.*)"
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

**Add Jarvis secret token to OpenClaw config:**
```bash
# Add to Jarvis environment
nano ~/.openclaw/workspace-jarvis/.env

# Add:
JARVIS_SECRET_TOKEN=same-secret-token-from-cookie-env
```

**Restart Jarvis (if needed):**
```bash
# Check if OpenClaw supports restart command
# OR use launchctl to restart the Launch Agent
launchctl stop ai.openclaw.gateway
launchctl start ai.openclaw.gateway
```

### 10. Test End-to-End Integration

**Test 1: Direct API call**
```bash
curl -X POST http://localhost:3000/api/jarvis/recipe \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-secret-token" \
  -d '{
    "text": "Scrambled Eggs\n\nIngredients:\n2 eggs\n1 tablespoon butter\nSalt and pepper\n\nDirections:\n1. Beat eggs in bowl\n2. Melt butter in pan over medium heat\n3. Add eggs, stir until cooked",
    "userId": "test",
    "source": "curl"
  }'

# Should return recipe details
```

**Test 2: Via Jarvis iMessage**
```
Send iMessage to Jarvis:
"Add recipe: Scrambled Eggs

Ingredients:
2 eggs
1 tablespoon butter
Salt and pepper

Directions:
1. Beat eggs in bowl
2. Melt butter in pan over medium heat
3. Add eggs, stir until cooked"

Jarvis should respond:
"Added Scrambled Eggs to Cookie! 3 ingredients, 2 min prep, 5 min cook."
```

**Test 3: Verify in database**
```bash
psql -d cookie -c "SELECT title, source_type FROM recipes ORDER BY created_at DESC LIMIT 5;"
```

## Monitoring & Maintenance

### PM2 Commands
```bash
# View status
pm2 status

# View logs
pm2 logs cookie-api
pm2 logs cookie-api --lines 100

# View only errors
pm2 logs cookie-api --err

# Restart
pm2 restart cookie-api

# Stop
pm2 stop cookie-api

# Start
pm2 start cookie-api

# Monitor resource usage
pm2 monit

# Flush logs
pm2 flush
```

### Database Maintenance
```bash
# Backup database
pg_dump cookie > ~/backups/cookie-$(date +%Y%m%d).sql

# Restore from backup
psql -d cookie < ~/backups/cookie-20250223.sql

# Check database size
psql -d cookie -c "SELECT pg_size_pretty(pg_database_size('cookie'));"

# Vacuum database (optimize)
psql -d cookie -c "VACUUM ANALYZE;"
```

### Log Rotation
```bash
# PM2 handles log rotation automatically
# Configure in ecosystem.config.js if needed

# Manual log cleanup
pm2 flush cookie-api
```

### Check API Health
```bash
# Health endpoint
curl http://localhost:3000/api/health

# Jarvis health (requires auth)
curl http://localhost:3000/api/jarvis/health \
  -H "Authorization: Bearer your-secret-token"
```

## Updating Deployment

### Deploy New Code
```bash
# Pull latest code (if using git)
cd ~/cookie/server
git pull

# Or sync from local machine
# (from local machine):
rsync -avz --exclude 'node_modules' --exclude '.git' \
  ~/cookie/server/ jarviss-mac-mini.local:~/cookie/server/

# Install any new dependencies
npm install

# Run any new migrations
npm run db:migrate

# Restart with PM2
pm2 restart cookie-api

# Check logs for issues
pm2 logs cookie-api
```

### Update Environment Variables
```bash
cd ~/cookie/server
nano .env
# Make changes

# Restart to pick up new env vars
pm2 restart cookie-api
```

## Troubleshooting

### Server Won't Start

**Check logs:**
```bash
pm2 logs cookie-api --err
```

**Common issues:**
- Database not running: `brew services start postgresql@16`
- Port 3000 in use: `lsof -i :3000` and kill process
- Missing env vars: Check `.env` file exists and has all required vars
- Database connection: Test with `psql -d cookie`

### Jarvis Can't Connect to Cookie

**Check Cookie is running:**
```bash
pm2 status
curl http://localhost:3000/api/health
```

**Check authentication:**
```bash
# Test auth endpoint directly
curl http://localhost:3000/api/jarvis/health \
  -H "Authorization: Bearer your-token"

# Should return 200 OK
```

**Check Jarvis logs:**
```bash
# Check OpenClaw logs (location depends on OpenClaw config)
tail -f ~/.openclaw/logs/jarvis.log
```

**Verify secret tokens match:**
```bash
# Cookie server
grep JARVIS_SECRET_TOKEN ~/cookie/server/.env

# Jarvis config
grep JARVIS_SECRET_TOKEN ~/.openclaw/workspace-jarvis/.env

# Must be identical
```

### Database Issues

**Can't connect to database:**
```bash
# Check PostgreSQL is running
brew services list | grep postgresql

# Start if stopped
brew services start postgresql@16

# Test connection
psql -d cookie -c "SELECT NOW();"
```

**Database doesn't exist:**
```bash
createdb cookie
cd ~/cookie/server
npm run db:migrate
```

**Need to reset database:**
```bash
# DANGER: This deletes all data
dropdb cookie
createdb cookie
cd ~/cookie/server
npm run db:migrate
npm run db:seed
```

### Performance Issues

**Check resource usage:**
```bash
pm2 monit
```

**Check database performance:**
```bash
psql -d cookie -c "SELECT * FROM pg_stat_activity;"
```

**Increase PM2 max memory (if needed):**
```bash
# Edit ecosystem.config.js
nano ~/cookie/server/ecosystem.config.js

# Change max_memory_restart to higher value (e.g., '1G')

# Restart
pm2 restart cookie-api
```

## Security Notes

### Network Access
- Cookie API runs on localhost:3000 (not exposed to internet)
- Only Jarvis (on same Mac Mini) can access it
- Future: Add reverse proxy (nginx) if exposing externally

### Secret Management
- Never commit `.env` file to git
- Rotate `JARVIS_SECRET_TOKEN` if leaked
- Keep `ANTHROPIC_API_KEY` secure

### Database Security
- PostgreSQL accessible only from localhost
- No external connections allowed
- Regular backups recommended

## Backup Strategy

### Automated Backups (Recommended)
```bash
# Create backup script
nano ~/scripts/backup-cookie.sh
```

```bash
#!/bin/bash
BACKUP_DIR=~/backups/cookie
mkdir -p $BACKUP_DIR
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump cookie | gzip > $BACKUP_DIR/cookie_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "cookie_*.sql.gz" -mtime +7 -delete
```

```bash
# Make executable
chmod +x ~/scripts/backup-cookie.sh

# Add to crontab (daily at 3am)
crontab -e
# Add line:
0 3 * * * ~/scripts/backup-cookie.sh
```

## Resources

- [Express Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Anthropic API Documentation](https://docs.anthropic.com/)

## Support

For issues specific to Cookie:
- Check `docs/BACKEND_ARCHITECTURE.md` for system overview
- Check `docs/JARVIS_INTEGRATION.md` for Jarvis setup
- Review server logs: `pm2 logs cookie-api`
- Check database logs: `tail -f /usr/local/var/log/postgresql@16.log`
