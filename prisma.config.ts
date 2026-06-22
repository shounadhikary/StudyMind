import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load env from .env.local (the Next.js convention) so Prisma and the app
// share a single, gitignored source of truth for DATABASE_URL.
config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // The Prisma CLI (migrate/diff) connects over the session pooler
    // (DIRECT_URL); the transaction pooler can't run DDL. Falls back to DATABASE_URL.
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
