import * as dotenv from "dotenv";
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

dotenv.config({ path: ".env.production" });

export default defineConfig({
  schema: "./src/lib/db/schema",
  out: "./src/lib/db/migrations-prod",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  casing: "snake_case",
  strict: true,
  verbose: true,
});
