import "server-only";

import { currentUser } from "@clerk/nextjs/server";

import { syncUser } from "./sync-user";

/**
 * Authenticate the current request and guarantee the user row exists (the FK
 * target for all owned records). Throws if not signed in.
 */
export async function requireUserId(): Promise<string> {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");
  await syncUser(user);
  return user.id;
}
