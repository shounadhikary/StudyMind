import "server-only";

import { currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/lib/db/prisma";

type ClerkUser = NonNullable<Awaited<ReturnType<typeof currentUser>>>;

// User IDs already synced during this server process's lifetime. Lets us skip
// the Clerk `currentUser()` fetch + DB upsert on every navigation - we only
// need it once per session, not once per page load.
const syncedUserIds = new Set<string>();

/**
 * Syncs the user at most once per server process. Skips the expensive Clerk
 * `currentUser()` network call and the DB upsert if we've already synced this
 * user, which is the common case for every navigation after the first.
 */
export async function syncUserOnce(userId: string) {
  if (syncedUserIds.has(userId)) return;
  const user = await currentUser();
  if (!user) return;
  await syncUser(user);
  syncedUserIds.add(userId);
}

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
