🍪 Cookie

A recipe-driven AI shopping list builder that transforms recipes into smart, consolidated grocery lists.

## Overview

Cookie uses AI to extract ingredients from recipes, cross-reference your pantry inventory, and generate optimized shopping lists. Whether you're meal planning for the week or cooking a single dish, Cookie eliminates the hassle of manual list-making and duplicate ingredient tracking.

## Features

- **Recipe Input**: Add recipes through text entry or PDF upload
- **AI Ingredient Extraction**: Automatically parses ingredients from recipe text using Claude
- **Pantry Management**: Track what you already have to avoid buying duplicates
- **Smart List Consolidation**: Combines ingredients across multiple recipes
- **Quantity Normalization**: Converts and aggregates amounts across different units

## Tech Stack

**Frontend**
- React with TypeScript
- Vite for build tooling
- Modern CSS for styling

**Backend**
- Node.js with Express
- PostgreSQL for data persistence
- Anthropic Claude API for AI processing

## Getting Started

### Prerequisites

- Node.js v20 or higher
- PostgreSQL v15 or higher
- Anthropic API key

### Installation

Clone the repository:

```bash
git clone https://github.com/AbracadabraApp/cookie.git
cd cookie
```

### Configuration

Set up your Anthropic API key and database connection details in environment variables.

## Project Structure

```
cookie/
├── client/          # React frontend application
├── server/          # Express backend API
└── docs/            # Additional documentation
```

## Development Status

Cookie is currently in early development. Core features are being actively implemented.

## Team

- Sophia Petersen
- Josh Petersen

## License

MIT
