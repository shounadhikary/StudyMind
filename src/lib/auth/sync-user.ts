import "server-only";

import { currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/lib/db/prisma";

type ClerkUser = NonNullable<Awaited<ReturnType<typeof currentUser>>>;

/**
 * Upserts the signed-in Clerk user into the Supabase `users` table on first
 * request (the spec's "sync on first login" without a webhook).
 */
export async function syncUser(user: ClerkUser) {
  const email =
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses[0]?.emailAddress;
  if (!email) return;

  const fullName =
    user.fullName ?? [user.firstName, user.lastName].filter(Boolean).join(" ");
  const name = fullName.length > 0 ? fullName : null;

  await prisma.user.upsert({
    where: { id: user.id },
    create: { id: user.id, email, name, avatarUrl: user.imageUrl || null },
    update: { email, name, avatarUrl: user.imageUrl || null },
  });
}
