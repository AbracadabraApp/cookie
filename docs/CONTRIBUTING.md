# Contributing

## Git Workflow

We keep it simple: **PRs into `main`**.

1. Create a branch off `main`:
```bash
   git checkout -b sophia/add-recipe-form
```
   Use the format: `yourname/short-description`

2. Make your changes, commit with clear messages:
```bash
   git commit -m "Add recipe creation form with ingredient fields"
```

3. Push and open a PR on GitHub:
```bash
   git push origin sophia/add-recipe-form
```

4. The other person reviews (can be quick — a thumbs up is fine for small changes).

5. Merge into `main` and delete the branch.

### Commit Messages

Keep them short and descriptive. Start with a verb:
- `Add recipe PDF upload endpoint`
- `Fix ingredient quantity parsing`
- `Update shopping list UI layout`

## Code Style

### General

- **Formatter:** Prettier (runs on save)
- **Linter:** ESLint
- **Indentation:** 2 spaces
- **Semicolons:** yes
- **Quotes:** single quotes
- **Trailing commas:** ES5

### Config files are included in the repo:
- `.prettierrc`
- `.eslintrc.cjs`

### Frontend (React)

- Functional components only (no class components)
- Use named exports
- Co-locate styles and tests with components

### Backend (Node/Express)

- Use `async/await` (no raw `.then()` chains)
- Keep route handlers thin — business logic goes in `services/`
- Always handle errors with try/catch

## Task Management

We use **GitHub Issues** to track work.

- Label issues as `feature`, `bug`, or `chore`
- Assign yourself when you pick something up
- Close issues via PR (e.g., `Closes #12`)
