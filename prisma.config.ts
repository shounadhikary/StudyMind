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
});
