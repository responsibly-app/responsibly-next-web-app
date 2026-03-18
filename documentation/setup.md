
# Packages

- Prettier
    - `pnpm install -D prettier prettier-plugin-tailwindcss`
    - `pnpm add -D prettier-plugin-organize-imports`
- ENV
    - `pnpm add dotenv`


---
# package.json
```json
"scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "generate": "orval",
    "better-auth-generate-auth-schema": "pnpm dlx @better-auth/cli@latest generate --config ./src/lib/auth/auth.ts --output ./src/lib/auth/auth-schema.ts",
    "db-generate-migrations": "npx drizzle-kit generate",
    "db-apply-migrations": "npx drizzle-kit migrate",
    "db-push": "npx drizzle-kit push",
    "db-pull": "npx drizzle-kit pull",
    "db-check": "npx drizzle-kit check"
  }
  ```

  ---