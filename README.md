# Shohojogi Backend

REST API for the Shohojogi app, built with **Express 5** and **MongoDB** (official `mongodb` driver, no ODM).

> **Status:** early scaffold. The folder structure is in place, but the entry point (`index.js`) and routes have not been written yet. See [Roadmap](#roadmap).

## Requirements

| Tool    | Version used in development |
| ------- | --------------------------- |
| Node.js | 24.x (18+ should work)      |
| npm     | 11.x                        |
| MongoDB | Atlas cluster or local 7.x  |

Express 5 requires Node 18 or newer — it will not run on Node 16.

## Getting started

```bash
git clone https://github.com/RaiyanKhan1/Shohojogi_Backend.git
cd Shohojogi_Backend
npm install
```

Create a `.env` file in the project root:

```ini
MONGODB_USERNAME=your_db_user
MONGODB_PASSWORD=your_db_password
MONGODB_URI=mongodb+srv://<cluster-host>/?retryWrites=true&w=majority
```

`.env` is gitignored — **never commit it**. Ask a maintainer for development credentials rather than reusing production ones.

Then start the server:

```bash
node index.js
```

## Project structure

```
Shohojogi_Backend/
├── Controller/     # Request handlers — business logic, one file per resource
├── Middlewares/    # Auth, validation, error handling
├── Model/          # Collection schemas and database access helpers
├── Routes/         # Express routers, mapping URLs to controllers
├── index.js        # App entry point (not yet created)
└── .env            # Local secrets (gitignored)
```

Each folder currently holds a `.gitkeep` placeholder so the empty directory survives in Git. Delete the placeholder once you add a real file to that folder.

## Conventions

- **Layering:** routes define URLs only; controllers hold logic; models own all direct database access. Controllers should not build raw queries inline.
- **Naming:** files are named after their resource, e.g. `Routes/user.routes.js` → `Controller/user.controller.js` → `Model/user.model.js`.
- **Modules:** the project is CommonJS (`"type": "commonjs"` in `package.json`). Use `require` / `module.exports`, not `import`.
- **Config:** read secrets from `process.env` only. No credentials in source, ever.
- **Lockfile:** commit `package-lock.json` with any dependency change so installs stay reproducible.

## Contributing

1. Branch off `main`: `git checkout -b feature/your-feature`
2. Commit in small, focused steps with clear messages.
3. Open a pull request against `main` and describe what changed and how you tested it.

Before pushing, run `git status` and confirm no `.env` file or `node_modules/` directory is staged.

## Roadmap

- [ ] `index.js` — Express app setup and server bootstrap
- [ ] MongoDB connection helper with pooling and startup health check
- [ ] Centralised error-handling middleware
- [ ] Authentication (registration, login, session or JWT)
- [ ] Core resource routes
- [ ] `npm start` / `npm run dev` scripts (nodemon for local development)
- [ ] Test setup — `npm test` is currently a placeholder that exits with an error
