import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

/**
 * A single PrismaClient instance, reused across hot reloads in development so
 * we don't exhaust database connections. Import this everywhere server-side.
 *
 * Prisma 7 connects through a driver adapter — here `@prisma/adapter-pg`, which
 * talks to Supabase/Postgres using the DATABASE_URL connection string.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  // Supabase poolers require an encrypted connection; the pooler cert isn't in
  // the default CA bundle, so we encrypt without strict CA verification.
  const useSsl = /supabase\.com|pooler/.test(connectionString ?? "");
  const adapter = new PrismaPg({
    connectionString,
    ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {}),
  });
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
