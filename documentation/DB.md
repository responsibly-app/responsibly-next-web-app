# Drizzle DB commands

### Generate betterauth schema
- (without output location): `pnpm dlx @better-auth/cli@latest generate --config ./src/lib/auth/auth.ts`
- (with output location): `pnpm dlx @better-auth/cli@latest generate --config ./src/lib/auth/auth.ts --output ./src/lib/auth/auth-schema.ts`

---
## Drizzle
https://orm.drizzle.team/docs/kit-overview
### Drizzle Generate migrations:
- `npx drizzle-kit generate`
### Apply migrations:
- `npx drizzle-kit migrate`
### Run file
- `pnpm tsx src\lib\db\index.ts`
---
### ENV Variable
- Supabase: pooler DB
- `DATABASE_URL`=`postgresql://postgres.[PROJECT_SLUG]:[DB_PASSWORD]@aws-1-us-east-1.pooler.supabase.com:6543/postgres`
---