🍪 Cookie
A recipe-driven AI shopping list builder.
Cookie helps you turn recipes into smart, consolidated shopping lists — powered by AI. Add recipes manually, upload PDFs, and Cookie will extract ingredients, check what you already have on hand, and build your grocery list automatically.
Getting Started
Prerequisites

Node.js (v20+)
PostgreSQL (v15+)
Git
An Anthropic API key

Setup

Clone the repo

bash   git clone https://github.com/your-org/cookie.git
   cd cookie

Install dependencies

bash   # Backend
   cd server
   npm install

   # Frontend
   cd ../client
   npm install

Set up environment variables

bash   cp .env.example .env
Fill in your values (see docs/SETUP.md for details).

Set up the database

bash   cd server
   npm run db:migrate
   npm run db:seed   # optional sample data

Run locally

bash   # From the root
   npm run dev

Frontend: http://localhost:5173
Backend: http://localhost:3001

Team

Sophia Petersen
Josh Petersen

License
MIT
