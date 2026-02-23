# Project Structure
```
cookie/
├── client/                  # React frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route-level page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API call functions
│   │   ├── utils/           # Helper functions
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                  # Node.js + Express backend
│   ├── src/
│   │   ├── routes/          # Express route definitions
│   │   ├── services/        # Business logic
│   │   ├── models/          # Database models / queries
│   │   ├── middleware/       # Auth, error handling, etc.
│   │   ├── utils/           # Helpers (AI prompts, parsers)
│   │   └── index.js         # App entry point
│   ├── migrations/          # Database migrations
│   ├── seeds/               # Sample data
│   ├── package.json
│   └── .env.example
│
├── docs/                    # Project documentation
│   ├── SETUP.md
│   ├── CONTRIBUTING.md
│   ├── TECH_DECISIONS.md
│   ├── ARCHITECTURE.md      # (this file)
│   └── DATA_MODEL.md
│
├── .prettierrc
├── .eslintrc.cjs
├── .gitignore
├── README.md
└── package.json             # Root scripts (e.g., `npm run dev`)
```

## How It Fits Together

1. **User** opens the React app in their browser
2. **Client** makes API calls to the Express server
3. **Server** handles requests:
   - CRUD for recipes, ingredients, shopping lists
   - Calls **Anthropic API** for AI features (recipe parsing, PDF extraction)
   - Reads/writes to **PostgreSQL**
4. **AI pipeline:** Recipe text/PDF → Claude extracts structured ingredients → saved to DB → merged into shopping list minus on-hand items
