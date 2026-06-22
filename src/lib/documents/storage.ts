import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";

const BUCKET = "documents";

let bucketEnsured = false;

/** Create the private documents bucket once if it doesn't exist. */
async function ensureBucket() {
  if (bucketEnsured) return;
  const admin = getSupabaseAdmin();
  const { data } = await admin.storage.getBucket(BUCKET);
  if (!data) {
    await admin.storage.createBucket(BUCKET, {
      public: false,
      fileSizeLimit: "25MB",
      allowedMimeTypes: ["application/pdf"],
    });
  }
  bucketEnsured = true;
}

/** Upload a PDF to {userId}/{documentId}.pdf and return its storage path. */
export async function uploadPdf(
  userId: string,
  documentId: string,
  bytes: Uint8Array,
): Promise<string> {
  await ensureBucket();
  const path = `${userId}/${documentId}.pdf`;
  const { error } = await getSupabaseAdmin()
    .storage.from(BUCKET)
    .upload(path, bytes, { contentType: "application/pdf", upsert: true });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);
  return path;
}

/** Short-lived signed URL for downloading/viewing a stored file. */
export async function createSignedUrl(
  path: string,
  expiresInSeconds = 3600,
): Promise<string | null> {
  const { data, error } = await getSupabaseAdmin()
    .storage.from(BUCKET)
    .createSignedUrl(path, expiresInSeconds);
  if (error) return null;
  return data.signedUrl;
}

/** Best-effort delete of a stored file (ignores missing files). */
export async function deleteFile(path: string): Promise<void> {
  await getSupabaseAdmin().storage.from(BUCKET).remove([path]);
}
